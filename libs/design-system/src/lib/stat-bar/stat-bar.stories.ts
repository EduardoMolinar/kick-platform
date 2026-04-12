import type { Meta, StoryObj } from '@storybook/angular';
import { StatBarComponent } from './stat-bar.component';

const meta: Meta<StatBarComponent> = {
  title: 'Composite/StatBar',
  component: StatBarComponent,
  tags: ['autodocs'],
  argTypes: {
    homeValue: { control: 'number' },
    awayValue: { control: 'number' },
    unit:      { control: 'text' },
  },
  args: {
    label: 'Possession',
    homeValue: 42,
    awayValue: 58,
    unit: '%',
  },
  parameters: {
    docs: {
      description: {
        component: `
Horizontal two-sided stat bar. Home is brand color (left), away is accent-blue (right).
Bar widths are proportional to the total — works for both percentage and count stats.

\`\`\`html
<ds-stat-bar label="Possession" [homeValue]="42" [awayValue]="58" unit="%">
<ds-stat-bar label="Shots on Target" [homeValue]="8" [awayValue]="12">
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<StatBarComponent>;

export const Default: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="width:360px">
        <ds-stat-bar [label]="label" [homeValue]="homeValue" [awayValue]="awayValue" [unit]="unit">
        </ds-stat-bar>
      </div>
    `,
  }),
};

export const MatchStats: Story = {
  render: () => ({
    template: `
      <div style="
        width:380px;
        background:var(--ds-color-bg-surface);
        border:1px solid var(--ds-color-border);
        border-radius:var(--ds-radius-lg);
        padding:var(--ds-space-4)">

        <div style="
          display:flex;
          justify-content:space-between;
          margin-bottom:var(--ds-space-3)">
          <span style="font-size:var(--ds-text-sm);font-weight:var(--ds-weight-semibold);color:var(--ds-color-brand)">Real Madrid</span>
          <span style="font-size:var(--ds-text-xs);color:var(--ds-color-text-muted);text-transform:uppercase;letter-spacing:var(--ds-tracking-wide)">Match Stats</span>
          <span style="font-size:var(--ds-text-sm);font-weight:var(--ds-weight-semibold);color:var(--ds-color-accent-blue)">Bayern</span>
        </div>

        <ds-stat-bar label="Possession"     [homeValue]="58" [awayValue]="42" unit="%"></ds-stat-bar>
        <ds-stat-bar label="Shots"          [homeValue]="14" [awayValue]="9"></ds-stat-bar>
        <ds-stat-bar label="Shots on Target" [homeValue]="6" [awayValue]="4"></ds-stat-bar>
        <ds-stat-bar label="Corners"        [homeValue]="7"  [awayValue]="3"></ds-stat-bar>
        <ds-stat-bar label="Fouls"          [homeValue]="11" [awayValue]="14"></ds-stat-bar>
        <ds-stat-bar label="Yellow Cards"   [homeValue]="1"  [awayValue]="2"></ds-stat-bar>
        <ds-stat-bar label="Passes"         [homeValue]="482" [awayValue]="361"></ds-stat-bar>
        <ds-stat-bar label="Pass Accuracy"  [homeValue]="87" [awayValue]="81" unit="%"></ds-stat-bar>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Full match stats panel as it appears in the Live match detail screen.' },
    },
  },
};
