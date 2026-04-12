import type { Meta, StoryObj } from '@storybook/angular';
import { IconComponent } from './icon.component';
import type { IconName } from './icon.registry';

const ALL_ICONS: IconName[] = [
  'home', 'live', 'trophy', 'users', 'user',
  'search', 'bell', 'settings',
  'chevron-right', 'chevron-left', 'chevron-down', 'chevron-up',
  'x', 'check', 'star', 'clock', 'external-link',
];

const meta: Meta<IconComponent> = {
  title: 'Primitives/Icon',
  component: IconComponent,
  tags: ['autodocs'],
  argTypes: {
    name: {
      control: 'select',
      options: ALL_ICONS,
      description: 'Icon name from the registry',
    },
    size: {
      control: 'select',
      options: ['xs', 'sm', 'md', 'lg'],
      description: 'Pixel size: xs=12, sm=16, md=20, lg=24',
    },
    label: {
      control: 'text',
      description: 'Accessible label. Omit for decorative icons (aria-hidden).',
    },
  },
  args: {
    name: 'home',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        component: `
Inline SVG icon primitive. Icons are stroke-based and inherit \`currentColor\`
from the surrounding context.

\`\`\`html
<!-- Decorative (inside a labelled button) -->
<button dsButton="icon"><ds-icon name="bell"></ds-icon></button>

<!-- Standalone with accessible label -->
<ds-icon name="star" size="lg" aria-label="Favourite"></ds-icon>
\`\`\`

**Accessibility:** When \`aria-label\` is omitted the host gets \`aria-hidden="true"\`.
Supply a label only when the icon carries standalone meaning.
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<IconComponent>;

export const Default: Story = {
  render: args => ({
    props: args,
    template: `<ds-icon [name]="name" [size]="size" [attr.aria-label]="label"></ds-icon>`,
  }),
};

export const Sizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;align-items:center;color:var(--ds-color-text-primary)">
        <ds-icon name="star" size="xs"></ds-icon>
        <ds-icon name="star" size="sm"></ds-icon>
        <ds-icon name="star" size="md"></ds-icon>
        <ds-icon name="star" size="lg"></ds-icon>
      </div>
    `,
  }),
  parameters: { controls: { disable: true } },
};

export const Colors: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:16px;align-items:center">
        <ds-icon name="check" size="lg" style="color:var(--ds-color-brand)"></ds-icon>
        <ds-icon name="bell"  size="lg" style="color:var(--ds-color-accent-blue)"></ds-icon>
        <ds-icon name="live"  size="lg" style="color:var(--ds-color-live)"></ds-icon>
        <ds-icon name="star"  size="lg" style="color:var(--ds-color-accent-amber)"></ds-icon>
        <ds-icon name="x"     size="lg" style="color:var(--ds-color-text-muted)"></ds-icon>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Icons inherit `currentColor` — set color via CSS on the host or a parent element.',
      },
    },
  },
};

export const InButton: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:12px;align-items:center">
        <button dsButton="icon"><ds-icon name="bell"></ds-icon></button>
        <button dsButton="icon"><ds-icon name="search"></ds-icon></button>
        <button dsButton="icon"><ds-icon name="settings"></ds-icon></button>
        <button dsButton>
          <ds-icon name="star" size="sm"></ds-icon>
          Follow
        </button>
      </div>
    `,
  }),
  parameters: { controls: { disable: true } },
};

export const AllIcons: Story = {
  render: () => ({
    props: { icons: ALL_ICONS },
    template: `
      <div style="display:flex;flex-wrap:wrap;gap:24px;color:var(--ds-color-text-primary)">
        <div
          *ngFor="let icon of icons"
          style="display:flex;flex-direction:column;align-items:center;gap:8px;width:72px">
          <ds-icon [name]="icon" size="md"></ds-icon>
          <span style="font-size:10px;color:var(--ds-color-text-muted);text-align:center;word-break:break-all">
            {{ icon }}
          </span>
        </div>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Full icon registry at md (20px) size.' },
    },
  },
};
