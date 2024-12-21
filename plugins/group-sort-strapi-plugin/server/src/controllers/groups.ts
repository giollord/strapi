import { Context } from 'koa';
import { ContentTypeNotFoundError, GroupNameFieldNotFound } from '../../../shared/errors';
import { PLUGIN_ID } from '../../../shared/pluginId';

const service = () => strapi.plugin(PLUGIN_ID).service('service');

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

const groups = {
  async getItemsWithGroups(ctx: Context) {
    execute(ctx, service().getItemsWithGroups(ctx));
  },
  async getGroup(ctx: Context) {
    execute(ctx, service().getGroup(ctx));
  },
  async getGroupsWithItems(ctx: Context) {
    execute(ctx, service().getGroupsWithItems(ctx));
  },
  async getGroupNames(ctx: Context) {
    execute(ctx, service().getGroupNames(ctx));
  }
};

export default groups;
