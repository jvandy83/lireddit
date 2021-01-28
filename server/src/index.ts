import 'reflect-metadata';
import { MikroORM } from '@mikro-orm/core';
import { __prod__ } from './constants';
// import { Post } from './entities/Post';
import { MyContext } from './types';

import { ApolloServer } from 'apollo-server-express';

import { buildSchema } from 'type-graphql';

import microConfig from './mikro-orm.config';

import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/post';
import { UserResolver } from './resolvers/user';

import redis from 'redis';
import connectRedis from 'connect-redis';
import session from 'express-session';

import express from 'express';

const main = async () => {
  const orm = await MikroORM.init(microConfig);
  await orm.getMigrator().up();

  const app = express();

  const redisClient = redis.createClient();
  const RedisStore = connectRedis(session);

  app.use(
    session({
      name: 'qid',
      store: new RedisStore({ client: redisClient, disableTouch: true }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
        sameSite: 'lax',
        httpOnly: true,
        secure: __prod__
      },
      secret: 'ljhgkhgfjhjdjgfxhfx',
      resave: false,
      saveUninitialized: false
    })
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      validate: false
    }),
    playground: {
      settings: {
        'request.credentials': 'include'
      }
    },
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res })
  });

  apolloServer.applyMiddleware({ app });

  await app.listen(4000, () => {
    console.log(`server listening on port 4000`);
  });
};

main();
