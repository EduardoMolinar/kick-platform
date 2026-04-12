import type { Meta, StoryObj } from '@storybook/angular';
import { CardComponent } from './card.component';

const meta: Meta<CardComponent> = {
  title: 'Composite/Card',
  component: CardComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'elevated', 'interactive'],
      description: 'Surface color and behaviour',
    },
    padding: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg'],
      description: 'Internal padding',
    },
  },
  args: {
    variant: 'default',
    padding: 'md',
  },
  parameters: {
    docs: {
      description: {
        component: `
Surface container used for match cards, standings rows, team panels, and profile sections.

\`\`\`html
<!-- Basic -->
<ds-card>Match content</ds-card>

<!-- Clickable match card -->
<ds-card variant="interactive" padding="sm" (click)="openMatch()">…</ds-card>

<!-- Nested panel -->
<ds-card variant="elevated" padding="none"><img …/></ds-card>
\`\`\`

**Accessibility:** No implicit ARIA role — apply semantic context via a wrapping
element (\`<article>\`, \`<section>\`) or \`role="article"\` on the host.
The interactive variant adds \`tabindex="0"\` and a \`:focus-visible\` ring.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<CardComponent>;

export const Default: Story = {
  render: args => ({
    props: args,
    template: `
      <ds-card [variant]="variant" [padding]="padding" style="width:280px">
        <p style="margin:0;color:var(--ds-color-text-primary);font-size:var(--ds-text-sm)">
          Card content goes here.
        </p>
      </ds-card>
    `,
  }),
};

export const Variants: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px;width:300px">
        <ds-card variant="default">
          <p style="margin:0;color:var(--ds-color-text-secondary);font-size:var(--ds-text-xs)">DEFAULT</p>
          <p style="margin:4px 0 0;color:var(--ds-color-text-primary);font-size:var(--ds-text-sm)">
            bg-surface — standard match and standings cards.
          </p>
        </ds-card>
        <ds-card variant="elevated">
          <p style="margin:0;color:var(--ds-color-text-secondary);font-size:var(--ds-text-xs)">ELEVATED</p>
          <p style="margin:4px 0 0;color:var(--ds-color-text-primary);font-size:var(--ds-text-sm)">
            bg-elevated — nested panels, sidebars, popovers.
          </p>
        </ds-card>
        <ds-card variant="interactive">
          <p style="margin:0;color:var(--ds-color-text-secondary);font-size:var(--ds-text-xs)">INTERACTIVE</p>
          <p style="margin:4px 0 0;color:var(--ds-color-text-primary);font-size:var(--ds-text-sm)">
            Hover to see border highlight. Keyboard-focusable.
          </p>
        </ds-card>
      </div>
    `,
  }),
  parameters: { controls: { disable: true } },
};

export const Paddings: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:300px">
        <ds-card padding="none">
          <div style="background:var(--ds-color-bg-elevated);padding:4px 8px;color:var(--ds-color-text-muted);font-size:var(--ds-text-xs)">padding: none</div>
        </ds-card>
        <ds-card padding="sm">
          <span style="color:var(--ds-color-text-secondary);font-size:var(--ds-text-xs)">padding: sm (12px)</span>
        </ds-card>
        <ds-card padding="md">
          <span style="color:var(--ds-color-text-secondary);font-size:var(--ds-text-xs)">padding: md (16px)</span>
        </ds-card>
        <ds-card padding="lg">
          <span style="color:var(--ds-color-text-secondary);font-size:var(--ds-text-xs)">padding: lg (24px)</span>
        </ds-card>
      </div>
    `,
  }),
  parameters: { controls: { disable: true } },
};

export const MatchCardPreview: Story = {
  render: () => ({
    template: `
      <ds-card variant="interactive" padding="sm" style="width:320px">
        <div style="
          display:flex;
          flex-direction:column;
          gap:var(--ds-space-3)">
          <!-- Header -->
          <div style="
            display:flex;
            align-items:center;
            justify-content:space-between">
            <span style="font-size:var(--ds-text-xs);color:var(--ds-color-text-muted)">⭐ UCL · Quarter-final</span>
            <span style="
              font-size:var(--ds-text-xs);
              font-weight:var(--ds-weight-bold);
              color:var(--ds-color-live);
              letter-spacing:var(--ds-tracking-wide);
              text-transform:uppercase">● LIVE 73′</span>
          </div>
          <!-- Teams + Score -->
          <div style="display:flex;align-items:center;gap:var(--ds-space-3)">
            <div style="flex:1;font-size:var(--ds-text-sm);font-weight:var(--ds-weight-semibold);color:var(--ds-color-text-primary)">Real Madrid</div>
            <div style="
              font-size:var(--ds-text-xl);
              font-weight:var(--ds-weight-black);
              color:var(--ds-color-text-primary);
              letter-spacing:-0.5px;
              min-width:56px;
              text-align:center">2 – 1</div>
            <div style="flex:1;font-size:var(--ds-text-sm);font-weight:var(--ds-weight-semibold);color:var(--ds-color-text-primary);text-align:right">Bayern München</div>
          </div>
        </div>
      </ds-card>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Preview of a live match card composed inside an interactive Card. The score and team content is authored by the consumer.',
      },
    },
  },
};
