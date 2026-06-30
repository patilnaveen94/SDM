const path = require('path');

const sharedDir = path.resolve(__dirname, '../shared');

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Remove ModuleScopePlugin to allow imports from ../shared/
      const scopePluginIndex = webpackConfig.resolve.plugins.findIndex(
        ({ constructor }) => constructor && constructor.name === 'ModuleScopePlugin'
      );
      if (scopePluginIndex >= 0) {
        webpackConfig.resolve.plugins.splice(scopePluginIndex, 1);
      }

      // Include the shared directory in babel-loader compilation
      const oneOfRule = webpackConfig.module.rules.find((rule) => rule.oneOf);
      if (oneOfRule) {
        const tsRule = oneOfRule.oneOf.find(
          (rule) =>
            rule.test &&
            rule.test.toString().includes('tsx') &&
            rule.include
        );
        if (tsRule) {
          if (Array.isArray(tsRule.include)) {
            tsRule.include.push(sharedDir);
          } else {
            tsRule.include = [tsRule.include, sharedDir];
          }
        }
      }

      // Add alias for shared folder
      webpackConfig.resolve.alias = {
        ...webpackConfig.resolve.alias,
        '@shared': sharedDir,
      };

      return webpackConfig;
    },
  },
};
