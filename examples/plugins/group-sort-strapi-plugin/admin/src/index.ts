import { PLUGIN_ID } from './pluginId';
import { Initializer } from './components/Initializer';
import { PluginIcon, OrderIcon } from './components/PluginIcon';
import { Schema } from '@strapi/strapi';
import { StrapiApp } from '@strapi/strapi/admin';
import * as yup from 'yup';
import { getTranslation } from './utils/useTranslation';

const ORDERABLE_FIELDS = [
  'number',
  'integer',
  'biginteger',
  'float',
  'decimal',
];

const GROUPABLE_FIELDS = [
  'string',
  'text',
  'richtext',
  'email',
  'password',
  'date',
  'time',
  'datetime',
  'timestamp',
  'integer',
  'biginteger',
  'float',
  'decimal',
  'uid',
  'enumeration',
  'boolean',
  'json',
  'media',
  'relation',
  //'component',
  //'dynamiczone',
  //'blocks',
];

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: getTranslation('plugin.name'),
        defaultMessage: PLUGIN_ID,
      },
      // @ts-ignore
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
        id: getTranslation('order.label'),
        defaultMessage: 'Order',
      },
      intlDescription: {
        id: getTranslation('order.description'),
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

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: PLUGIN_ID,
    });
  },

  bootstrap(app: any) {
    
    const ctbPlugin = app.getPlugin('content-type-builder');

    if (ctbPlugin) {
      const ctbFormsAPI = ctbPlugin.apis.forms;
      ctbFormsAPI.addContentTypeSchemaMutation((
        nextSchema: Schema.ContentType,
        prevSchema?: {
          apiID?: string;
          schema?: Schema.ContentType;
          uid?: string;
        }
      ) => {
        return nextSchema;
      });
      
      ctbFormsAPI.extendFields(ORDERABLE_FIELDS, {
        validator: (args: any) => ({
          group: yup.object().shape({
            groupNameField: yup.string(),
          }),
        }),
        form: {
          advanced(asdf: any) {
            const { contentTypeSchema, forTarget, type, step } = asdf;
            if (forTarget !== 'contentType') {
              return [];
            }

            if (type === 'component' && step === '1') {
              return [];
            }

            const availableOptions = contentTypeSchema.schema.attributes
              .filter((attr: any) => GROUPABLE_FIELDS.includes(attr.type))
              .map((attr: any) => ({
                key: attr.name,
                value: attr.name,
                metadatas: {
                  intlLabel: {
                    id: `${PLUGIN_ID}.dummy`,
                    defaultMessage: attr.name,
                  },
                  disabled: false,
                  hidden: false,
                },
              }));

            return [
              {
                name: getTranslation('pluginOptions.group.groupNameField'),
                type: 'select',
                options: availableOptions,
                intlLabel: {
                  id: getTranslation('content-field-editor.group.label'),
                  defaultMessage: 'Grouping field',
                },
                description: {
                  id: getTranslation('content-field-editor.group.description'),
                  defaultMessage: 'Field which will be used to group entries in "Sort" view',
                },
              },
            ];
          },
        },
      });
    }
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
