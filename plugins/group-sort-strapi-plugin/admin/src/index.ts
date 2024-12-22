import { PLUGIN_ID, UNDEFINED_GROUP_NAME } from '../../shared/constants';
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
  'json',
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

const fieldValidator: () => Record<string, yup.AnySchema> =  () => ({
  group: yup.object().shape({
    groupNameField: yup
      .string()
      .not([UNDEFINED_GROUP_NAME, 'null']),
    columnsNumber: yup.number().required().integer().min(1).max(100),
    rowHeight: yup.number().required().min(0.1).max(100),
  }),
});

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
    
    app.addSettingsLink('global', {
      intlLabel: {
        id: getTranslation('plugin.name'),
        defaultMessage: 'Internationalization',
      },
      id: 'sorting',
      to: 'Sorting',
      Component: () =>
        import('./pages/SettingsPage').then((mod) => ({ default: mod.SettingsPage })),
      permissions: [],
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
        Input: () => import('./components/OrderInput')
      },
      options: {
        validator: fieldValidator
      }
    });
    
    app.customFields.register({
      name: 'order2d',
      type: 'json',
      pluginId: PLUGIN_ID,
      intlLabel: {
        id: getTranslation('order-2d.label'),
        defaultMessage: 'Order 2D',
      },
      intlDescription: {
        id: getTranslation('order-2d.description'),
        defaultMessage: 'Position on 2D grid within the group',
      },
      icon: OrderIcon,
      components: {
        Input: () => import('./components/Order2dInput')
      },
      options: {
        validator: fieldValidator
      }
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
        form: {
          advanced(params: any) {
            const { contentTypeSchema, forTarget, type, step } = params;
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
            availableOptions.push({
                key: '',
                value: '',
                metadatas: {
                  intlLabel: {
                    id: getTranslation('pluginOptions.group.noGroup'),
                    defaultMessage: '<Self>',
                  },
                  disabled: false,
                  hidden: false,
                },
              });

            return [
              {
                //name: getTranslation('pluginOptions.group.groupNameField'),
                name: 'options.group.groupNameField',
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
              {
                name: 'options.group.columnsNumber',
                type: 'number',
                intlLabel: {
                  id: getTranslation('content-field-editor.layout-columns.label'),
                  defaultMessage: 'Columns',
                },
                description: {
                  id: getTranslation('content-field-editor.layout-columns.description'),
                  defaultMessage: 'Number of columns in \"Sort\" view',
                },
              },
              {
                name: 'options.group.rowHeight',
                type: 'number',
                intlLabel: {
                  id: getTranslation('content-field-editor.row-height.label'),
                  defaultMessage: 'Row height, rem',
                },
                description: {
                  id: getTranslation('content-field-editor.row-height.description'),
                  defaultMessage: 'Row height in rem in \"Sort\" view',
                },
              },
            ];
          }
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
