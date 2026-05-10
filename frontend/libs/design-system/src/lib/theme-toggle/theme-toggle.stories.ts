import type { Meta, StoryObj } from '@storybook/angular';
import { DsThemeToggle } from './theme-toggle';

const meta: Meta<DsThemeToggle> = {
  title: 'Primitives/DsThemeToggle',
  component: DsThemeToggle,
  argTypes: {
    mode: {
      control: 'inline-radio',
      options: ['light', 'system', 'dark'],
    },
  },
  render: (args) => ({
    props: args,
    template: `<ds-theme-toggle [mode]="mode" (modeChange)="modeChange($event)"></ds-theme-toggle>`,
  }),
};

export default meta;
type Story = StoryObj<DsThemeToggle>;

export const Dark: Story = {
  args: { mode: 'dark' },
};

export const Light: Story = {
  args: { mode: 'light' },
};

export const System: Story = {
  args: { mode: 'system' },
};
