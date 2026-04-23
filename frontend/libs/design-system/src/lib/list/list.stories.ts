import { moduleMetadata, type Meta, type StoryObj } from '@storybook/angular';
import { DsList } from './list';
import { DsListItem } from './list-item';

const meta: Meta<DsList> = {
  title: 'Primitives/DsList',
  component: DsList,
  decorators: [
    moduleMetadata({
      imports: [DsListItem],
    }),
  ],
  render: () => ({
    template: `
      <ds-list style="max-width: 320px;">
        <ds-list-item>Premier League</ds-list-item>
        <ds-list-item>La Liga</ds-list-item>
        <ds-list-item>UEFA Champions League</ds-list-item>
        <ds-list-item>International</ds-list-item>
      </ds-list>
    `,
  }),
};

export default meta;
type Story = StoryObj<DsList>;

export const Default: Story = {};

export const SingleItem: Story = {
  render: () => ({
    template: `
      <ds-list style="max-width: 320px;">
        <ds-list-item>Only one row</ds-list-item>
      </ds-list>
    `,
  }),
};
