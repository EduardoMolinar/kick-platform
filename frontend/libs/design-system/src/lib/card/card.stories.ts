import type { Meta, StoryObj } from '@storybook/angular';
import { DsCard } from './card';

const meta: Meta<DsCard> = {
  title: 'Primitives/DsCard',
  component: DsCard,
  argTypes: {
    variant: {
      control: 'inline-radio',
      options: ['raised', 'flat'],
    },
  },
  render: (args) => ({
    props: args,
    template: `
      <ds-card [variant]="variant" style="max-width: 320px;">
        <div ds-card-header style="font-weight: 700;">Card header</div>
        <p style="margin: 0;">Card body content — use this slot for the primary content.</p>
        <div ds-card-footer style="font-size: 0.875rem; color: var(--ds-color-text-muted);">
          Footer metadata
        </div>
      </ds-card>
    `,
  }),
};

export default meta;
type Story = StoryObj<DsCard>;

export const Raised: Story = {
  args: { variant: 'raised' },
};

export const Flat: Story = {
  args: { variant: 'flat' },
};

export const BodyOnly: Story = {
  args: { variant: 'raised' },
  render: (args) => ({
    props: args,
    template: `
      <ds-card [variant]="variant" style="max-width: 320px;">
        <p style="margin: 0;">A minimal card with only body content.</p>
      </ds-card>
    `,
  }),
};
