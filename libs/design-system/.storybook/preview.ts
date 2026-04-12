import type { Preview } from '@storybook/angular';
// Global styles are injected by the Angular builder via the `styles` array
// in angular.json — do NOT import them here as webpack lacks the full
// css-loader → style-loader chain for TS-module SCSS imports.

const preview: Preview = {
  parameters: {
    backgrounds: {
      default: 'base',
      values: [
        { name: 'base',    value: '#0d0f14' },
        { name: 'surface', value: '#161920' },
        { name: 'elevated',value: '#1e2230' },
      ],
    },
    actions: { argTypesRegex: '^on[A-Z].*' },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: 'centered',
  },
};

export default preview;
