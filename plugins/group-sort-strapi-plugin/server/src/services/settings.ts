import { Context } from 'koa';
import { Core } from "@strapi/strapi";
import { Settings } from "../../../shared/settings";
import { PLUGIN_ID } from "../../../shared/constants";

const service = ({ strapi }: { strapi: Core.Strapi }) => ({
  async getSettings(ctx: Context): Promise<Settings> {
    const res = await strapi.store!({ type: 'plugin', name: PLUGIN_ID, key: 'settings' }).get({});
    return res as Settings | null;
  },
  async updateSettings(ctx: Context): Promise<void> {
    const value = ctx.request.body;
    return strapi.store!({ type: 'plugin', name: 'upload', key: 'settings' }).set({ value });
  }
});
export default service;