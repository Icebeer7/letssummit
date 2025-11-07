import AES from 'react-native-aes-crypto';
import * as Keychain from 'react-native-keychain';
import { Log } from './Log';
import KeyValueStorage from './KeyValueStorage';

export type CipherText = {
  value: string;
  iv: string;
};

export namespace CryptoUtils {
  export async function encrypt(text: string, category: string = 'GENERAL'): Promise<CipherText> {
    const key = await getCipherKey(category);
    const iv = await AES.randomKey(16);
    return { value: await AES.encrypt(text, key, iv, 'aes-256-ctr'), iv };
  }

  export async function decrypt(
    ciphertext: CipherText,
    category: string = 'GENERAL',
  ): Promise<string> {
    const key = await getCipherKey(category);
    return await AES.decrypt(ciphertext.value, key, ciphertext.iv, 'aes-256-ctr');
  }

  export async function getCipherKey(category: string): Promise<string> {
    try {
      let shouldUseFallbackStore = false;
      let securePassword: string | undefined;
      const userName = `com.gigsky.gigsky.${category}`;
      try {
        const credentials = await Keychain.getGenericPassword({
          service: userName,
          // rules: Keychain.SECURITY_RULES.AUTOMATIC_UPGRADE,
        });
        if (credentials) {
          securePassword = credentials.password;
        }
      } catch (error) {
        Log.e('Unable to access keychain. ', error);
        shouldUseFallbackStore = true;
        securePassword = retrieveFromFallbackStorage(category) ?? undefined;
      }

      if (!securePassword || securePassword.length === 0) {
        const newRandomValue = await AES.randomKey(32);
        const newCipherKey = await AES.pbkdf2(newRandomValue, 'GIGSKY', 5000, 256, 'sha256');
        Keychain.setGenericPassword(userName, newCipherKey, {
          service: userName,
          accessible: Keychain.ACCESSIBLE.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
        });

        if (shouldUseFallbackStore) {
          storeInFallbackStorage(category, newCipherKey);
        }
        securePassword = newCipherKey;
      }

      return securePassword;
    } catch (error) {
      Log.e('Error retrieving encryption key:', error);
      throw new Error('Failed to get encryption key');
    }
  }
}

function retrieveFromFallbackStorage(key: string) {
  try {
    return KeyValueStorage.getItem(key);
  } catch (error) {
    Log.e(`Crypto: Could not retrieve fallback cipher key: ${key}. Cause: `, error);
  }
}

function storeInFallbackStorage(key: string, value: string | undefined) {
  try {
    KeyValueStorage.setItem(key, value ?? '');
  } catch (error) {
    Log.e(`Crypto: Could not set cipher key in fallback store: ${key}. Cause: `, error);
  }
}
