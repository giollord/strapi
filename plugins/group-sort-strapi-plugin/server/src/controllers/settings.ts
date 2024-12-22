import { Context } from 'koa';
import { ContentTypeNotFoundError, GroupNameFieldNotFound } from '../../../shared/errors';
import { PLUGIN_ID } from '../../../shared/constants';

const service = () => strapi.plugin(PLUGIN_ID).service('settings');

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
  }
};

export default groups;
