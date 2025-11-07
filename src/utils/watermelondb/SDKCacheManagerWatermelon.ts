import { Collection, Q } from '@nozbe/watermelondb';
import { CryptoUtils } from '@utils/CryptoUtils';
import { GsCacheManagerExtended } from '@utils/SDKCacheManager';
import { safeStringify } from '@utils/StringUtils';
import { Log } from '../Log';
import SdkCacheItem, { SDK_CACHE_ITEM_TABLE_NAME } from './SdkCacheItem';
import { database } from './Setup';

const SDK_CACHE = 'gsSDKCache';
const TAG = 'GSClientSDKCache';

class SDKCacheManagerWatermelonDb implements GsCacheManagerExtended {
  private collection: Collection<SdkCacheItem> =
    database.get<SdkCacheItem>(SDK_CACHE_ITEM_TABLE_NAME);

  constructor() {
    Log.d('WatermelonDB: Client SDK cache DB initialized');
  }

  async setItem(key: string, value: string, securelyStored = false): Promise<boolean> {
    try {
      const encrypted = securelyStored
        ? safeStringify(await CryptoUtils.encrypt(value, SDK_CACHE))
        : value;

      await database.write(async () => {
        const existing = await this.collection.query(Q.where('key', key)).fetch();

        if (existing.length > 0) {
          await existing[0]?.update(record => {
            record.value = encrypted;
            record.securelyStored = securelyStored;
          });
        } else {
          await this.collection.create(record => {
            record.key = key;
            record.value = encrypted;
            record.securelyStored = securelyStored;
          });
        }
      });
      return true;
    } catch (error) {
      Log.e(`${TAG}: Error setting item:`, error);
      return false;
    }
  }

  async getItem(key: string): Promise<string> {
    try {
      const records = await this.collection.query(Q.where('key', key)).fetch();
      const item = records[0];

      if (!item) return '';

      return item.securelyStored
        ? await CryptoUtils.decrypt(JSON.parse(item.value), SDK_CACHE)
        : item.value;
    } catch (error) {
      Log.e(`${TAG}: Error getting item:`, error);
      return '';
    }
  }

  async removeItem(key: string): Promise<boolean> {
    try {
      await database.write(async () => {
        const items = await this.collection.query(Q.where('key', key)).fetch();
        for (const item of items) {
          await item.destroyPermanently(); // Safe delete
        }
      });
      return true;
    } catch (error) {
      Log.e(`${TAG}: Error removing item:`, error);
      return false;
    }
  }

  async removeItems(keys: string[]): Promise<boolean> {
    try {
      await database.write(async () => {
        for (const key of keys) {
          const items = await this.collection.query(Q.where('key', key)).fetch();
          for (const item of items) {
            await item.destroyPermanently();
          }
        }
      });
      return true;
    } catch (error) {
      Log.e(`${TAG}: Error removing items:`, error);
      return false;
    }
  }

  async removeItemsBasedOnPattern(regEx: string): Promise<boolean> {
    try {
      const allItems = await this.collection.query().fetch();
      const filtered = allItems.filter(item => new RegExp(regEx).test(item.key));

      await database.write(async () => {
        for (const item of filtered) {
          await item.destroyPermanently();
        }
      });

      return true;
    } catch (error) {
      Log.e(`${TAG}: Error removing items by pattern:`, error);
      return false;
    }
  }

  async containsItem(key: string): Promise<boolean> {
    try {
      const item = await this.collection
        .query(Q.where('key', key))
        .fetch()
        .then(items => items[0]);

      if (!item) return false;

      if (item.securelyStored) {
        const value = await CryptoUtils.decrypt(JSON.parse(item.value), SDK_CACHE);
        return !!(value && value.length > 0);
      }
      return true;
    } catch (error) {
      Log.e(`${TAG}: Error checking item:`, error);
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      const allItems = await this.collection.query().fetch();
      await database.write(async () => {
        for (const item of allItems) {
          await item.destroyPermanently();
        }
      });
      return true;
    } catch (error) {
      Log.e(`${TAG}: Error clearing cache:`, error);
      return false;
    }
  }

  async getAllItems(): Promise<Record<string, unknown>> {
    try {
      const allItems = await this.collection.query().fetch();
      const result: Record<string, unknown> = {};

      for (const item of allItems) {
        result[item.key] = item.securelyStored
          ? await CryptoUtils.decrypt(JSON.parse(item.value), SDK_CACHE)
          : item.value;
      }

      return result;
    } catch (error) {
      Log.e(`${TAG}: Error getting all items:`, error);
      return {};
    }
  }
}

export default SDKCacheManagerWatermelonDb;
