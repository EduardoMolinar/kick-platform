import type { StorybookConfig } from '@storybook/angular';

const normalizeDriveLetter = (p: string): string =>
  p.replace(/^([a-z]):/, (_, l: string) => l.toUpperCase() + ':');

const config: StorybookConfig = {
  stories: ['../**/*.@(mdx|stories.@(js|jsx|ts|tsx))'],
  addons: ['@storybook/addon-docs'],
  framework: {
    name: '@storybook/angular',
    options: {},
  },
  webpackFinal: async (cfg) => {
    cfg.plugins = cfg.plugins ?? [];
    cfg.plugins.push({
      apply(compiler) {
        compiler.hooks.normalModuleFactory.tap('NormalizeDriveCase', (factory) => {
          factory.hooks.afterResolve.tap('NormalizeDriveCase', (result) => {
            const data = (result as { createData?: Record<string, unknown> }).createData ?? (result as unknown as Record<string, unknown>);
            for (const key of ['resource', 'userRequest', 'rawRequest', 'context']) {
              const value = data[key];
              if (typeof value === 'string') {
                data[key] = normalizeDriveLetter(value);
              }
            }
          });
        });
      },
    });
    return cfg;
  },
};

export default config;
