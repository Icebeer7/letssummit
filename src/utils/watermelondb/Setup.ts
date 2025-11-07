import watermelonDbSchema from './Schema';
import migrations from './DBMigrations';
import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';
import { KeyValue } from './KeyValue';
import { Log } from '@utils/Log';
import { SecureKeyValue } from './SecureKeyValue';
import SdkCacheItem from './SdkCacheItem';
import { Platform } from 'react-native';

const adapter = new SQLiteAdapter({
  schema: watermelonDbSchema,
  migrations,
  // (optional database name or file system path)
  dbName: 'gigsky_db',
  // (recommended option, should work flawlessly out of the box on iOS. On Android,
  // additional installation steps have to be taken - disable if you run into issues...)
  jsi: isNewArchitecture() || Platform.OS === 'ios',
  onSetUpError: error => {
    Log.e('Failed to load gigskyDb (watermelonDB). Cause: ', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [KeyValue, SecureKeyValue, SdkCacheItem],
});

function isNewArchitecture(): boolean {
  const uiManager = (global as unknown as { nativeFabricUIManager: unknown })?.nativeFabricUIManager
    ? 'Fabric'
    : 'Paper';
  return uiManager === 'Fabric';
}
