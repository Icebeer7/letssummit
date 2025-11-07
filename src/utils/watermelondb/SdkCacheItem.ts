import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import { tableSchema } from '@nozbe/watermelondb';

export const SDK_CACHE_ITEM_TABLE_NAME = 'sdk_cache_items';

export const sdkCacheSchema = tableSchema({
  name: SDK_CACHE_ITEM_TABLE_NAME,
  columns: [
    { name: 'key', type: 'string', isIndexed: true },
    { name: 'value', type: 'string' },
    { name: 'securely_stored', type: 'boolean' },
  ],
});

export default class SdkCacheItem extends Model {
  static table = SDK_CACHE_ITEM_TABLE_NAME;

  @field('key') key!: string;
  @field('value') value!: string;
  @field('securely_stored') securelyStored!: boolean;
}
