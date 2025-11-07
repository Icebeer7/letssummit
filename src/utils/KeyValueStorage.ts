import KeyValueStorageWatermelon from './watermelondb/KeyValueStorageWatermelon';

export interface KeyValueStorageSpec {
  initialize(): Promise<void>;
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  clear(): void;
  getAllKeys(): string[];
  multiGet(keys: string[]): [string, string | null][];
  multiSet(keyValuePairs: [string, string][]): void;
  multiRemove(keys: string[]): void;
  getItemsBasedOnPattern(regex: RegExp): Record<string, string | null>;
  removeItemsBasedOnPattern(regex: RegExp): void;
}

const KeyValueStorage: KeyValueStorageSpec = new KeyValueStorageWatermelon();

export default KeyValueStorage;
