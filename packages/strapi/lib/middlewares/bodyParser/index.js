'use strict';

/**
 * Body parser hook
 */

module.exports = strapi => {
  return {
    /**
     * Default options
     */

    defaults: {
      parser: {
        multipart: true
      }
    },

    /**
     * Initialize the hook
     */

    initialize: function(cb) {
      strapi.app.use(
        strapi.koaMiddlewares.convert(
          strapi.koaMiddlewares.body(strapi.config.middlewares.settings.parser)
        )
      );

      cb();
    }
  };
};
