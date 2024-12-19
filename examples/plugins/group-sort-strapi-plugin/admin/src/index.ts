import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon, GroupIcon, OrderIcon } from './components/PluginIcon';

export default {
  register(app: any) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: PLUGIN_ID,
      },
      Component: async () => {
        const { App } = await import('./pages/App');

        return App;
      },
    });

    app.customFields.register({
      name: 'order',
      type: 'integer',
      pluginId: PLUGIN_ID,
      intlLabel: {
        id: `${PLUGIN_ID}.order.label`,
        defaultMessage: 'Order',
      },
      intlDescription: {
        id: `${PLUGIN_ID}.order.description`,
        defaultMessage: 'Order within the group',
      },
      icon: OrderIcon,
      components: {
        Input: async () =>
          import('./components/OrderInput').then((module) => ({
            default: module.OrderInput,
          }))
      },
      options: {}
    });

    app.customFields.register({
      name: 'group',
      type: 'string',
      pluginId: PLUGIN_ID,
      intlLabel: {
        id: `${PLUGIN_ID}.group.label`,
        defaultMessage: 'Group',
      },
      intlDescription: {
        id: `${PLUGIN_ID}.group.description`,
        defaultMessage: "Group name, use '/' to create subgroups",
      },
      icon: GroupIcon,
      components: {
        Input: async () =>
          import('./components/GroupInput').then((module) => ({
            default: module.GroupInput,
          }))
      },
      options: {}
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);

          return { data, locale };
        } catch {
          return { data: {}, locale };
        }
      })
    );
  },
};
