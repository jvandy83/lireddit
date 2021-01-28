import {
  Resolver,
  Mutation,
  Arg,
  Field,
  InputType,
  Ctx,
  ObjectType,
  Query
} from 'type-graphql';
import { User } from '../entities/User';

import { MyContext } from '../types';

import argon2 from 'argon2';

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  password: string;
}

@ObjectType()
class FieldError {
  @Field()
  message?: string;
  @Field()
  field?: string;
}

@ObjectType()
class UserResponse {
  @Field(() => User, { nullable: true })
  user? User;
  @Field(() => [FieldError], { nullable: true })
  errors? FieldError[];
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  async me(
    @Ctx() { em, req }: MyContext
  ) {
    if (!req.session.userId) {
      return null;
    }
    const user = await em.findOne(User, { id: req.session.userId });
    return user; 
  }
  @Mutation(() => UserResponse)
  async register(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [{
          field: 'username',
          message: 'length must be greater than 2'
        }]
      }
    }
    if (options.username.password <= 2) {
      return {
        errors: [{
          field: 'username',
          message: 'length must be greater than 2'
        }]
      }
    }
    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, {
      username: options.username,
      password: hashedPassword
    });
    try {
      await em.persistAndFlush(user);
    } catch({ detail, code }) {
      if (code === '23505' || detail.includes('already exists')) {
        return {
          errors: [{
            field: 'username',
            message: 'username has already been taken'
          }]
        }
      }
    }

    // store user id session
    // this will set a cookie on user
    // keep them logged in
    return { user };
  }
  @Mutation(() => UserResponse)
  async login(
    @Arg('options') options: UsernamePasswordInput,
    @Ctx() { em, req }: MyContext
  ): Promise<UserResponse> {
    const user = await em.findOne(User, { username: options.username });
    if (!user) {
      return {
        errors: [{
          field: 'username',
          message:'that username does not exist'
        }]
      }
    }
    const valid = argon2.verify(user.password, options.password);
    if (!valid) {
      return {
        errors: [{
          field: 'password',
          message: 'password could not be verified'
        }]
      }
    }
    req.session.userId = user.id;
    return {
      user
    }
  }
}
