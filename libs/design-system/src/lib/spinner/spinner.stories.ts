import type { Meta, StoryObj } from '@storybook/angular';
import { SpinnerComponent } from './spinner.component';

const meta: Meta<SpinnerComponent> = {
  title: 'Primitives/Spinner',
  component: SpinnerComponent,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
      description: 'Visual size: sm=16px, md=24px, lg=36px',
    },
    label: {
      control: 'text',
      description: 'aria-label announced to screen readers',
    },
  },
  args: {
    size: 'md',
    label: 'Loading',
  },
  parameters: {
    docs: {
      description: {
        component: `
CSS-only loading indicator. Uses an animated rotating arc in the brand color.

\`\`\`html
<ds-spinner></ds-spinner>
<ds-spinner size="lg" label="Loading live scores"></ds-spinner>
\`\`\`

**Accessibility:** \`role="status"\` with \`aria-live="polite"\` announces
the loading state without interrupting active screen-reader output.
Provide a specific \`label\` when context is needed ("Loading fixtures").

**Motion:** \`prefers-reduced-motion\` replaces the spin with a gentle
opacity pulse so users sensitive to animation are not affected.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<SpinnerComponent>;

export const Default: Story = {
  render: args => ({
    props: args,
    template: `<ds-spinner [size]="size" [label]="label"></ds-spinner>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:24px;align-items:center">
        <ds-spinner size="sm"></ds-spinner>
        <ds-spinner size="md"></ds-spinner>
        <ds-spinner size="lg"></ds-spinner>
      </div>
    `,
  }),
  parameters: { controls: { disable: true } },
};

export const InContext: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div style="display:flex;align-items:center;gap:10px;color:var(--ds-color-text-secondary)">
          <ds-spinner size="sm" label="Loading live scores"></ds-spinner>
          <span style="font-size:var(--ds-text-sm)">Loading live scores…</span>
        </div>
        <div style="
          background:var(--ds-color-bg-surface);
          border:1px solid var(--ds-color-border);
          border-radius:var(--ds-radius-lg);
          padding:var(--ds-space-8);
          display:flex;
          align-items:center;
          justify-content:center;
          min-height:120px">
          <ds-spinner size="lg" label="Loading match stats"></ds-spinner>
        </div>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Spinner used inline with text and centered inside a card placeholder.' },
    },
  },
};
