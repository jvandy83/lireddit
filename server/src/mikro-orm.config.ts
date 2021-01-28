import { Post } from './entities/Post';
import { User } from './entities/User';
import { __prod__ } from './constants';
import path from 'path';
import { MikroORM } from '@mikro-orm/core';

export default {
  migrations: {
    path: path.join(__dirname, './migrations'),
    pattern: /^[\w-]+\d+\.[tj]s$/,
    disableForeignKeys: false
  },
  entities: [Post, User],
  dbName: 'lireddit',
  debug: !__prod__,
  type: 'postgresql'
} as Parameters<typeof MikroORM.init>[0];
