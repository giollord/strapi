'use strict';

/**
 * Module dependencies
 */

// Node.js core.
const path = require('path');

// Public node modules.
const _ = require('lodash');

/**
 * Favicon hook
 */

module.exports = strapi => {
  return {
    /**
     * Default options
     */

    defaults: {
      favicon: {
        path: 'favicon.ico',
        maxAge: 86400000
      }
    },

    /**
     * Initialize the hook
     */

    initialize: function(cb) {
      if (
        _.isPlainObject(strapi.config.middlewares.settings.favicon) &&
        !_.isEmpty(strapi.config.middlewares.settings.favicon)
      ) {
        strapi.app.use(
          strapi.koaMiddlewares.favicon(
            path.resolve(strapi.config.appPath, strapi.config.middlewares.settings.favicon.path),
            {
              maxAge: strapi.config.middlewares.settings.favicon.maxAge
            }
          )
        );
      }

      cb();
    }
  };
};
