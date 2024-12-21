import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {
  // register phase

  strapi.customFields.register({
    name: 'order',
    type: 'integer',
    plugin: 'group-sort-strapi-plugin'
  });

  strapi.customFields.register({
    name: 'order2d',
    type: 'json',
    plugin: 'group-sort-strapi-plugin'
  });
};

export default register;
