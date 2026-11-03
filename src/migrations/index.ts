import * as migration_20260921_121139_add_media from './20260921_121139_add_media';
import * as migration_20261103_202808_add_private_items from './20261103_202808_add_private_items';

export const migrations = [
  {
    up: migration_20260921_121139_add_media.up,
    down: migration_20260921_121139_add_media.down,
    name: '20260921_121139_add_media',
  },
  {
    up: migration_20261103_202808_add_private_items.up,
    down: migration_20261103_202808_add_private_items.down,
    name: '20261103_202808_add_private_items'
  },
];
