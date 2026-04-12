import type { Meta, StoryObj } from '@storybook/angular';
import { StandingsRowComponent } from './standings-row.component';

const meta: Meta<StandingsRowComponent> = {
  title: 'Composite/StandingsRow',
  component: StandingsRowComponent,
  tags: ['autodocs'],
  argTypes: {
    zone:        { control: 'select', options: [undefined, 'cl', 'uel', 'rel'] },
    highlighted: { control: 'boolean' },
  },
  args: {
    position: 1,
    teamName: 'Real Madrid',
    played: 28, won: 21, drawn: 4, lost: 3,
    goalsFor: 64, goalsAgainst: 22, points: 67,
    form: ['W', 'W', 'D', 'W', 'W'],
    zone: 'cl',
    highlighted: false,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
Single row for a competition standings table.
Wraps with \`role="table"\` and \`role="rowgroup"\` in the competition remote.

\`\`\`html
<div role="table" aria-label="La Liga standings">
  <div role="rowgroup">
    <ds-standings-row [position]="1" teamName="Real Madrid" ... zone="cl">
  </div>
</div>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<StandingsRowComponent>;

export const Default: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="background:var(--ds-color-bg-surface);border:1px solid var(--ds-color-border);border-radius:var(--ds-radius-lg);overflow:hidden">
        <ds-standings-row
          [position]="position" [teamName]="teamName"
          [played]="played" [won]="won" [drawn]="drawn" [lost]="lost"
          [goalsFor]="goalsFor" [goalsAgainst]="goalsAgainst"
          [points]="points" [form]="form"
          [zone]="zone" [highlighted]="highlighted">
        </ds-standings-row>
      </div>
    `,
  }),
};

const LA_LIGA = [
  { position: 1,  teamName: 'Real Madrid',          played: 28, won: 21, drawn: 4, lost: 3,  goalsFor: 64, goalsAgainst: 22, points: 67, form: ['W','W','D','W','W'], zone: 'cl'  as const },
  { position: 2,  teamName: 'Barcelona',             played: 28, won: 19, drawn: 5, lost: 4,  goalsFor: 59, goalsAgainst: 28, points: 62, form: ['W','D','W','L','W'], zone: 'cl'  as const },
  { position: 3,  teamName: 'Atlético de Madrid',    played: 28, won: 18, drawn: 5, lost: 5,  goalsFor: 51, goalsAgainst: 27, points: 59, form: ['W','W','W','D','W'], zone: 'cl'  as const },
  { position: 4,  teamName: 'Athletic Club',         played: 28, won: 15, drawn: 7, lost: 6,  goalsFor: 44, goalsAgainst: 31, points: 52, form: ['D','W','W','L','W'], zone: 'cl'  as const },
  { position: 5,  teamName: 'Villarreal',            played: 28, won: 14, drawn: 5, lost: 9,  goalsFor: 46, goalsAgainst: 38, points: 47, form: ['W','L','W','D','L'], zone: 'uel' as const },
  { position: 6,  teamName: 'Real Sociedad',         played: 28, won: 13, drawn: 7, lost: 8,  goalsFor: 38, goalsAgainst: 30, points: 46, form: ['D','W','L','W','D'], zone: 'uel' as const },
  { position: 7,  teamName: 'Sevilla',               played: 28, won: 11, drawn: 5, lost: 12, goalsFor: 35, goalsAgainst: 40, points: 38, form: ['L','D','W','L','W'], zone: undefined },
  { position: 18, teamName: 'Granada',               played: 28, won: 5,  drawn: 5, lost: 18, goalsFor: 24, goalsAgainst: 59, points: 20, form: ['L','L','D','L','L'], zone: 'rel' as const },
  { position: 19, teamName: 'Cádiz',                 played: 28, won: 4,  drawn: 7, lost: 17, goalsFor: 21, goalsAgainst: 56, points: 19, form: ['D','L','L','L','L'], zone: 'rel' as const },
  { position: 20, teamName: 'Almería',               played: 28, won: 3,  drawn: 3, lost: 22, goalsFor: 18, goalsAgainst: 68, points: 12, form: ['L','L','L','L','L'], zone: 'rel' as const },
];

export const FullTable: Story = {
  render: () => ({
    props: { rows: LA_LIGA },
    template: `
      <div style="background:var(--ds-color-bg-surface);border:1px solid var(--ds-color-border);border-radius:var(--ds-radius-lg);overflow:hidden;max-width:700px">

        <!-- Header -->
        <div style="
          display:grid;
          grid-template-columns:4px 1.5rem minmax(0,1fr) repeat(4,2rem) 2.5rem 2.5rem 5rem;
          gap:0 8px;
          padding:8px 12px;
          border-bottom:1px solid var(--ds-color-border)">
          <span></span>
          <span style="font-size:10px;color:var(--ds-color-text-muted);text-align:center">#</span>
          <span style="font-size:10px;color:var(--ds-color-text-muted)">Team</span>
          <span style="font-size:10px;color:var(--ds-color-text-muted);text-align:center">P</span>
          <span style="font-size:10px;color:var(--ds-color-text-muted);text-align:center">W</span>
          <span style="font-size:10px;color:var(--ds-color-text-muted);text-align:center">D</span>
          <span style="font-size:10px;color:var(--ds-color-text-muted);text-align:center">L</span>
          <span style="font-size:10px;color:var(--ds-color-text-muted);text-align:center">GD</span>
          <span style="font-size:10px;color:var(--ds-color-text-muted);text-align:center">Pts</span>
          <span style="font-size:10px;color:var(--ds-color-text-muted);text-align:right">Form</span>
        </div>

        <div role="table" aria-label="La Liga standings">
          <div role="rowgroup">
            <ds-standings-row
              *ngFor="let row of rows"
              [position]="row.position"
              [teamName]="row.teamName"
              [played]="row.played"
              [won]="row.won"
              [drawn]="row.drawn"
              [lost]="row.lost"
              [goalsFor]="row.goalsFor"
              [goalsAgainst]="row.goalsAgainst"
              [points]="row.points"
              [form]="row.form"
              [zone]="row.zone"
              [highlighted]="row.teamName === 'Real Madrid'">
            </ds-standings-row>
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'La Liga standings with zone indicators, form strips, and one highlighted row (Real Madrid — simulates a followed team).' },
    },
  },
};
