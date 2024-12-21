import type { Core } from '@strapi/strapi';
import { Settings } from '../../shared/settings';
import { PLUGIN_ID } from '../../shared/pluginId';
import { get, set } from 'lodash';
import { c } from 'tar';

const bootstrap = async ({ strapi }: { strapi: Core.Strapi }) => {
  // bootstrap phase
  const defaultConfig: Settings = {
    horisontalDivisions: 12,
  };

  const configurator = strapi.store!({ type: 'plugin', name: PLUGIN_ID, key: 'settings' });
  const config: any = await configurator.get({}) ?? {};

  for (const [key, defaultValue] of Object.entries(defaultConfig)) {
    if(!get(config, key)) {
      set(config, key, get(defaultConfig, key));
    }
  }
  await configurator.set({ value: config });
};

export default bootstrap;
