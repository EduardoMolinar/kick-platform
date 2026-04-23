import type { Meta, StoryObj } from '@storybook/angular';
import { DsButton } from './button';

const meta: Meta<DsButton> = {
  title: 'Primitives/DsButton',
  component: DsButton,
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['primary', 'secondary', 'ghost'],
    },
    disabled: { control: 'boolean' },
  },
  render: (args) => ({
    props: args,
    template: `<ds-button [variant]="variant" [disabled]="disabled">Button label</ds-button>`,
  }),
};

export default meta;
type Story = StoryObj<DsButton>;

export const Primary: Story = {
  args: { variant: 'primary', disabled: false },
};

export const Secondary: Story = {
  args: { variant: 'secondary', disabled: false },
};

export const Ghost: Story = {
  args: { variant: 'ghost', disabled: false },
};

export const Disabled: Story = {
  args: { variant: 'primary', disabled: true },
};
