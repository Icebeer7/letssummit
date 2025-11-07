import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import { tableSchema } from '@nozbe/watermelondb';

export const SECURE_KEY_VALUE_TABLE_NAME = 'secure_key_values';

export const secureKeyValueSchema = tableSchema({
  name: SECURE_KEY_VALUE_TABLE_NAME,
  columns: [
    { name: 'key', type: 'string', isIndexed: true },
    { name: 'value', type: 'string' },
  ],
});

export class SecureKeyValue extends Model {
  static table = SECURE_KEY_VALUE_TABLE_NAME;

  @field('key') key!: string;
  @field('value') value!: string;
}
