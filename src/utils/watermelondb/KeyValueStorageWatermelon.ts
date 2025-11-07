import { Collection, Q } from '@nozbe/watermelondb';
import { database } from './Setup';
import { KEY_VALUE_TABLE_NAME, KeyValue } from './KeyValue';
import { KeyValueStorageSpec } from '../KeyValueStorage';

class KeyValueAsyncStorage {
  private collection: Collection<KeyValue> = database.get<KeyValue>(KEY_VALUE_TABLE_NAME);

  async getItem(key: string): Promise<string | null> {
    const results = await this.collection.query(Q.where('key', key)).fetch();
    return results[0]?.value ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    const results = await this.collection.query(Q.where('key', key)).fetch();
    await database.write(async () => {
      if (results.length > 0) {
        await results[0]?.update(r => {
          r.value = value;
        });
      } else {
        await this.collection.create(r => {
          r.key = key;
          r.value = value;
        });
      }
    });
  }

  async removeItem(key: string): Promise<void> {
    const results = await this.collection.query(Q.where('key', key)).fetch();
    if (results.length > 0) {
      await database.write(async () => results[0]?.destroyPermanently());
    }
  }

  async clear(): Promise<void> {
    const all = await this.collection.query().fetch();
    await database.write(async () => {
      await Promise.all(all.map(item => item.destroyPermanently()));
    });
  }

  async getAll(): Promise<{ key: string; value: string | null }[]> {
    const all = await this.collection.query().fetch();
    return all.map(item => ({
      key: item.key,
      value: item.value ?? null,
    }));
  }
}
export const AsyncStorage = new KeyValueAsyncStorage();

class KeyValueStorageWatermelon implements KeyValueStorageSpec {
  asyncStorage: KeyValueAsyncStorage = AsyncStorage;
  private inMemoryCache: Record<string, string | null> = {};
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const all = await this.asyncStorage.getAll();
    for (const { key, value } of all) {
      this.inMemoryCache[key] = value;
    }

    this.initialized = true;
  }

  getItem(key: string): string | null {
    return this.inMemoryCache[key] ?? null;
  }

  async setItem(key: string, value: string): Promise<void> {
    await this.asyncStorage.setItem(key, value);
    this.inMemoryCache[key] = value;
  }

  async removeItem(key: string): Promise<void> {
    await this.asyncStorage.removeItem(key);
    delete this.inMemoryCache[key];
  }

  async clear(): Promise<void> {
    await this.asyncStorage.clear();
    Object.keys(this.inMemoryCache).forEach(key => delete this.inMemoryCache[key]);
  }

  getAllKeys(): string[] {
    return Object.keys(this.inMemoryCache);
  }

  multiGet(keys: string[]): [string, string | null][] {
    return keys.map(k => [k, this.inMemoryCache[k] ?? null]);
  }

  async multiSet(pairs: [string, string][]): Promise<void> {
    await Promise.all(pairs.map(async ([key, value]) => await this.setItem(key, value)));
  }

  async multiRemove(keys: string[]): Promise<void> {
    await Promise.all(keys.map(async key => await this.removeItem(key)));
  }

  getItemsBasedOnPattern(regex: RegExp): Record<string, string | null> {
    return Object.fromEntries(
      Object.entries(this.inMemoryCache).filter(([key]) => regex.test(key)),
    );
  }

  async removeItemsBasedOnPattern(regex: RegExp): Promise<void> {
    const keysToRemove = Object.keys(this.inMemoryCache).filter(key => regex.test(key));
    await this.multiRemove(keysToRemove);
  }
}

export default KeyValueStorageWatermelon;
