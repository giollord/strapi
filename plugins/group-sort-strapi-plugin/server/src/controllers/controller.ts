import type { Core } from '@strapi/strapi';
import { Context, ExtendableContext } from 'koa';
import { ContentTypeNotFoundError, GroupNameFieldNotFound } from '../../../shared/errors';
import { x } from 'tar';

const service = () => strapi.plugin('group-sort-strapi-plugin').service('service');

const execute = async (ctx, promise): Promise<any> => {
  try {
    const result = await promise;
    ctx.body = result;
  } catch (error) {
    if (error instanceof ContentTypeNotFoundError || error instanceof GroupNameFieldNotFound) {
      return ctx.badRequest(error.message);
    }
    return ctx.internalServerError(error.message);
  }
}

const controller = {
  index(ctx: Context) {
    execute(ctx, service().getWelcomeMessage(ctx));
  },
  async getAllGroups(ctx: Context) {
    execute(ctx, service().getAllGroups(ctx));
  },
  async getGroup(ctx: Context) {
    execute(ctx, service().getGroup(ctx));
  },
  async getGroupNames(ctx: Context) {
    execute(ctx, service().getGroupNames(ctx));
  }
};

export default controller;
