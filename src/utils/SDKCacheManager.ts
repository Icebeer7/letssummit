import SDKCacheManagerWatermelonDb from './watermelondb/SDKCacheManagerWatermelon';

const SDK_CACHE_PREFIX_KEY = 'gsSdkCache';

export type GsCacheManagerExtended = {
  removeItemsBasedOnPattern: (regEx: string, securelyStored?: boolean) => Promise<boolean>;
  clear: () => Promise<boolean>;
  removeItem: (key: string, securelyStored?: boolean) => Promise<boolean>;
  removeItems: (keys: string[], securelyStored?: boolean[]) => Promise<boolean>;
  setItem: (key: string, value: string, securelyStored?: boolean) => Promise<boolean>;
  getItem: (key: string, securelyStored?: boolean) => Promise<string>;
  containsItem: (key: string, securelyStored?: boolean) => Promise<boolean>;

  getAllItems: () => Promise<Record<string, unknown>>;
};

let gsCacheManager: GsCacheManagerExtended | undefined;

export default {
  get: function () {
    if (!gsCacheManager) {
      gsCacheManager = new SDKCacheManagerWatermelonDb();
    }
    return gsCacheManager;
  },
};
