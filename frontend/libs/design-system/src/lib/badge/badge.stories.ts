import type { Meta, StoryObj } from '@storybook/angular';
import { DsBadge } from './badge';

const meta: Meta<DsBadge> = {
  title: 'Primitives/DsBadge',
  component: DsBadge,
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['neutral', 'live', 'success', 'warning'],
    },
  },
  render: (args) => ({
    props: args,
    template: `<ds-badge [variant]="variant">{{ label }}</ds-badge>`,
  }),
};

export default meta;
type Story = StoryObj<DsBadge & { label: string }>;

export const Neutral: Story = {
  args: { variant: 'neutral', label: 'FT' },
};

export const Live: Story = {
  args: { variant: 'live', label: "Live 72'" },
};

export const Success: Story = {
  args: { variant: 'success', label: 'WIN' },
};

export const Warning: Story = {
  args: { variant: 'warning', label: 'Delayed' },
};
