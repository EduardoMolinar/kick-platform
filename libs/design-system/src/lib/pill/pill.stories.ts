import type { Meta, StoryObj } from '@storybook/angular';
import { PillComponent } from './pill.component';

const meta: Meta<PillComponent> = {
  title: 'Primitives/Pill',
  component: PillComponent,
  tags: ['autodocs'],
  argTypes: {
    active: { control: 'boolean' },
    activated: { action: 'activated' },
  },
  args: { active: false },
  parameters: {
    docs: {
      description: {
        component: `
Filter tab pill used in horizontal filter rows (competition selector, date picker, etc.).

Wrap a group of pills in \`role="tablist"\` for full ARIA compliance:

\`\`\`html
<div role="tablist" aria-label="Filter by competition">
  <ds-pill [active]="filter === 'all'" (activated)="filter = 'all'">All</ds-pill>
  <ds-pill [active]="filter === 'ucl'" (activated)="filter = 'ucl'">⭐ UCL</ds-pill>
  <ds-pill [active]="filter === 'pl'"  (activated)="filter = 'pl'">🏴󠁧󠁢󠁥󠁮󠁧󠁿 PL</ds-pill>
</div>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<PillComponent>;

export const Inactive: Story = {
  args: { active: false },
  render: args => ({
    props: args,
    template: `<ds-pill [active]="active" (activated)="activated($event)">⭐ UCL</ds-pill>`,
  }),
};

export const Active: Story = {
  args: { active: true },
  render: args => ({
    props: args,
    template: `<ds-pill [active]="active" (activated)="activated($event)">⭐ UCL</ds-pill>`,
  }),
};

export const FilterRow: Story = {
  render: () => ({
    props: { selected: 'all' },
    template: `
      <div role="tablist" aria-label="Competition filter"
           style="display:flex;gap:6px;flex-wrap:wrap">
        <ds-pill [active]="selected === 'all'"  (activated)="selected = 'all'">All</ds-pill>
        <ds-pill [active]="selected === 'ucl'"  (activated)="selected = 'ucl'">⭐ UCL</ds-pill>
        <ds-pill [active]="selected === 'la'"   (activated)="selected = 'la'">🇪🇸 La Liga</ds-pill>
        <ds-pill [active]="selected === 'pl'"   (activated)="selected = 'pl'">🏴󠁧󠁢󠁥󠁮󠁧󠁿 PL</ds-pill>
        <ds-pill [active]="selected === 'intl'" (activated)="selected = 'intl'">🌍 Intl</ds-pill>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Interactive filter row. Click a pill to activate it.',
      },
    },
  },
};
