import { appSchema } from '@nozbe/watermelondb';
import { keyValueSchema } from './KeyValue';
import { secureKeyValueSchema } from './SecureKeyValue';
import { sdkCacheSchema } from './SdkCacheItem';

export default appSchema({
  version: 1,
  tables: [keyValueSchema, secureKeyValueSchema, sdkCacheSchema],
});
