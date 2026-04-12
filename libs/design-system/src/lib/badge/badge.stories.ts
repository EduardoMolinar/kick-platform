import type { Meta, StoryObj } from '@storybook/angular';
import { BadgeComponent } from './badge.component';

const meta: Meta<BadgeComponent> = {
  title: 'Primitives/Badge',
  component: BadgeComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['live', 'comp', 'result', 'zone-cl', 'zone-uel', 'zone-rel'],
    },
  },
  args: { variant: 'live' },
  parameters: {
    docs: {
      description: {
        component: `
Inline status badge. The \`live\` variant renders an animated pulse dot.
Zone variants (zone-cl, zone-uel, zone-rel) are used in standings tables.

\`\`\`html
<ds-badge variant="live">LIVE</ds-badge>
<ds-badge variant="comp">⭐ UCL · QF</ds-badge>
<ds-badge variant="result">FT</ds-badge>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<BadgeComponent>;

export const Live: Story = {
  args: { variant: 'live' },
  render: args => ({
    props: args,
    template: `<ds-badge [variant]="variant">LIVE</ds-badge>`,
  }),
};

export const Competition: Story = {
  args: { variant: 'comp' },
  render: args => ({
    props: args,
    template: `<ds-badge [variant]="variant">⭐ UCL · Quarter-final</ds-badge>`,
  }),
};

export const Result: Story = {
  args: { variant: 'result' },
  render: args => ({
    props: args,
    template: `<ds-badge [variant]="variant">FT</ds-badge>`,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
        <ds-badge variant="live">LIVE</ds-badge>
        <ds-badge variant="comp">⭐ UCL · QF</ds-badge>
        <ds-badge variant="result">FT</ds-badge>
        <ds-badge variant="zone-cl">CL</ds-badge>
        <ds-badge variant="zone-uel">UEL</ds-badge>
        <ds-badge variant="zone-rel">REL</ds-badge>
      </div>
    `,
  }),
  parameters: { controls: { disable: true } },
};

export const LiveWithMinute: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:8px;align-items:center">
        <ds-badge variant="live">LIVE</ds-badge>
        <span style="font-size:13px;font-weight:700;color:#f25555">73′</span>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Typical usage in a match card header alongside the current match minute.',
      },
    },
  },
};
