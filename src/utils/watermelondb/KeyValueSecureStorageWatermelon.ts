import { Collection, Q } from '@nozbe/watermelondb';
import { CryptoUtils } from '@utils/CryptoUtils';
import { safeStringify } from '@utils/StringUtils';
import { KeyValueSecureStorageSpec } from '../KeyValueSecureStorage';
import { SECURE_KEY_VALUE_TABLE_NAME, SecureKeyValue } from './SecureKeyValue';
import { database } from './Setup';

class KeyValueSecureAsyncWatermelonStorage implements KeyValueSecureStorageSpec {
  private collection: Collection<SecureKeyValue> = database.get<SecureKeyValue>(
    SECURE_KEY_VALUE_TABLE_NAME,
  );

  async setItem(key: string, value: string): Promise<boolean> {
    const encryptedValue = await CryptoUtils.encrypt(value);
    const stringifiedValue = safeStringify(encryptedValue);

    const existing = await this.collection.query(Q.where('key', key)).fetch();

    await database.write(async () => {
      if (existing.length > 0) {
        await existing[0]?.update(record => {
          record.value = stringifiedValue;
        });
      } else {
        await this.collection.create(record => {
          record.key = key;
          record.value = stringifiedValue;
        });
      }
    });

    return true;
  }

  async getItem(key: string): Promise<string> {
    const results = await this.collection.query(Q.where('key', key)).fetch();
    if (results.length > 0) {
      const encryptedValue = JSON.parse(results[0]!.value);
      return await CryptoUtils.decrypt(encryptedValue);
    }
    return '';
  }

  async removeItem(key: string): Promise<boolean> {
    const results = await this.collection.query(Q.where('key', key)).fetch();
    if (results.length > 0) {
      await database.write(async () => results[0]?.destroyPermanently());
    }
    return true;
  }

  async removeItems(keys: string[]): Promise<boolean> {
    await database.write(async () => {
      await Promise.all(
        keys.map(async key => {
          const results = await this.collection.query(Q.where('key', key)).fetch();
          if (results.length > 0) {
            await results[0]?.destroyPermanently();
          }
        }),
      );
    });
    return true;
  }

  async containsItem(key: string): Promise<boolean> {
    const results = await this.collection.query(Q.where('key', key)).fetch();
    if (results.length > 0) {
      try {
        const decrypted = await CryptoUtils.decrypt(JSON.parse(results[0]!.value));
        return !!(decrypted && decrypted.length > 0);
      } catch {
        return false;
      }
    }
    return false;
  }

  async clear(): Promise<boolean> {
    const allItems = await this.collection.query().fetch();
    await database.write(async () => {
      await Promise.all(allItems.map(item => item.destroyPermanently()));
    });
    return true;
  }

  async getAllKeys(): Promise<string[]> {
    const allItems = await this.collection.query().fetch();
    return allItems.map(item => item.key);
  }
}

export default KeyValueSecureAsyncWatermelonStorage;
