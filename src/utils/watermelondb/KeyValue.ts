import { Model } from '@nozbe/watermelondb';
import { field } from '@nozbe/watermelondb/decorators';
import { tableSchema } from '@nozbe/watermelondb';

export const KEY_VALUE_TABLE_NAME = 'key_values';

export const keyValueSchema = tableSchema({
  name: KEY_VALUE_TABLE_NAME,
  columns: [
    { name: 'key', type: 'string', isIndexed: true },
    { name: 'value', type: 'string', isOptional: true },
  ],
});

export class KeyValue extends Model {
  static table = KEY_VALUE_TABLE_NAME;

  @field('key') key!: string;
  @field('value') value?: string;
}
