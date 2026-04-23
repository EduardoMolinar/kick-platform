import { applicationConfig, type Meta, type StoryObj } from '@storybook/angular';
import { provideRouter } from '@angular/router';
import { DsTopNav } from './top-nav';

const meta: Meta<DsTopNav> = {
  title: 'Primitives/DsTopNav',
  component: DsTopNav,
  decorators: [
    applicationConfig({
      providers: [provideRouter([])],
    }),
  ],
  render: (args) => ({
    props: args,
    template: `<ds-top-nav [items]="items"></ds-top-nav>`,
  }),
};

export default meta;
type Story = StoryObj<DsTopNav>;

export const Default: Story = {
  args: {
    items: [
      { label: 'Home', path: '/' },
      { label: 'Live', path: '/live' },
      { label: 'Competitions', path: '/competitions' },
      { label: 'Team', path: '/team' },
      { label: 'Profile', path: '/profile' },
    ],
  },
};

export const TwoItems: Story = {
  args: {
    items: [
      { label: 'Home', path: '/' },
      { label: 'Live', path: '/live' },
    ],
  },
};
