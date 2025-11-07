import KeyValueSecureAsyncWatermelonStorage from './watermelondb/KeyValueSecureStorageWatermelon';

export interface KeyValueSecureStorageSpec {
  setItem(key: string, value: string): Promise<boolean>;
  getItem(key: string): Promise<string>;
  removeItem(key: string): Promise<boolean>;
  removeItems(keys: string[]): Promise<boolean>;
  containsItem(key: string): Promise<boolean>;
  getAllKeys(): Promise<string[]>;
  clear(): Promise<boolean>;
}

const KeyValueSecureStorage: KeyValueSecureStorageSpec = new KeyValueSecureAsyncWatermelonStorage();
export default KeyValueSecureStorage;
