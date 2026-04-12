import type { Meta, StoryObj } from '@storybook/angular';
import { MatchScoreComponent } from './match-score.component';

const meta: Meta<MatchScoreComponent> = {
  title: 'Composite/MatchScore',
  component: MatchScoreComponent,
  tags: ['autodocs'],
  argTypes: {
    status:    { control: 'select', options: ['scheduled', 'live', 'finished'] },
    size:      { control: 'select', options: ['compact', 'featured'] },
    homeScore: { control: 'number' },
    awayScore: { control: 'number' },
    minute:    { control: 'number' },
  },
  args: {
    homeTeam: 'Real Madrid',
    awayTeam: 'Bayern München',
    homeScore: 2,
    awayScore: 1,
    status: 'live',
    minute: 73,
    competition: '⭐ UCL · Quarter-final',
    size: 'compact',
  },
  parameters: {
    docs: {
      description: {
        component: `
Hero match display used in both card (compact) and detail (featured) contexts.
Accepts primitive inputs — consuming components map their domain models to these.

\`\`\`html
<ds-match-score
  homeTeam="Real Madrid"
  awayTeam="Bayern München"
  [homeScore]="2" [awayScore]="1"
  status="live" [minute]="73"
  competition="⭐ UCL · QF">
</ds-match-score>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<MatchScoreComponent>;

export const Live: Story = {
  render: args => ({
    props: args,
    template: `
      <div style="width:320px">
        <ds-match-score
          [homeTeam]="homeTeam" [awayTeam]="awayTeam"
          [homeScore]="homeScore" [awayScore]="awayScore"
          [status]="status" [minute]="minute"
          [competition]="competition" [size]="size">
        </ds-match-score>
      </div>
    `,
  }),
};

export const Finished: Story = {
  args: { status: 'finished', minute: undefined },
  render: args => ({
    props: args,
    template: `
      <div style="width:320px">
        <ds-match-score
          [homeTeam]="homeTeam" [awayTeam]="awayTeam"
          [homeScore]="homeScore" [awayScore]="awayScore"
          status="finished" [competition]="competition" [size]="size">
        </ds-match-score>
      </div>
    `,
  }),
};

export const Scheduled: Story = {
  args: { status: 'scheduled', homeScore: null as any, awayScore: null as any, minute: undefined },
  render: () => ({
    template: `
      <div style="width:320px">
        <ds-match-score
          homeTeam="Real Madrid"
          awayTeam="Bayern München"
          status="scheduled"
          competition="⭐ UCL · Quarter-final">
        </ds-match-score>
      </div>
    `,
  }),
  parameters: { controls: { disable: true } },
};

export const Featured: Story = {
  args: { size: 'featured' },
  render: args => ({
    props: args,
    template: `
      <div style="width:400px">
        <ds-match-score
          [homeTeam]="homeTeam" [awayTeam]="awayTeam"
          [homeScore]="homeScore" [awayScore]="awayScore"
          [status]="status" [minute]="minute"
          [competition]="competition" size="featured">
        </ds-match-score>
      </div>
    `,
  }),
};

export const InCard: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:12px;width:340px">
        <ds-card variant="interactive" padding="sm">
          <ds-match-score
            homeTeam="Real Madrid" awayTeam="Bayern München"
            [homeScore]="2" [awayScore]="1"
            status="live" [minute]="73"
            competition="⭐ UCL · QF">
          </ds-match-score>
        </ds-card>
        <ds-card variant="interactive" padding="sm">
          <ds-match-score
            homeTeam="Arsenal" awayTeam="Manchester City"
            [homeScore]="1" [awayScore]="1"
            status="live" [minute]="61"
            competition="Premier League">
          </ds-match-score>
        </ds-card>
        <ds-card variant="interactive" padding="sm">
          <ds-match-score
            homeTeam="Barcelona" awayTeam="Atlético de Madrid"
            [homeScore]="3" [awayScore]="0"
            status="finished"
            competition="La Liga">
          </ds-match-score>
        </ds-card>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Three match cards as they appear in the Home live feed.' },
    },
  },
};
