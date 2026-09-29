import * as migration_20260921_121139_add_media from './20260921_121139_add_media';

export const migrations = [
  {
    up: migration_20260921_121139_add_media.up,
    down: migration_20260921_121139_add_media.down,
    name: '20260921_121139_add_media'
  },
];
