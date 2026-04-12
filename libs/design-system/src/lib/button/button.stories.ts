import type { Meta, StoryObj } from '@storybook/angular';
import { ButtonComponent } from './button.component';

const meta: Meta<ButtonComponent> = {
  title: 'Primitives/Button',
  component: ButtonComponent,
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'ghost', 'icon'],
      description: 'Visual variant',
    },
    size: {
      control: 'select',
      options: ['sm', 'md'],
      description: 'Size of the button',
    },
    disabled: {
      control: 'boolean',
      description: 'Disabled state',
    },
  },
  args: {
    variant: 'primary',
    size: 'md',
    disabled: false,
  },
  parameters: {
    docs: {
      description: {
        component: `
Attribute-based button applied to native \`<button>\` or \`<a>\` elements.
This ensures the host is always a real interactive control — no \`role="button"\` workarounds.

\`\`\`html
<button dsButton>Primary</button>
<button dsButton="ghost" size="sm">Cancel</button>
<button dsButton="icon"><span>⭐</span></button>
<a dsButton="ghost" href="/home">Back</a>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ButtonComponent>;

export const Primary: Story = {
  render: args => ({
    props: args,
    template: `<button dsButton [size]="size" [disabled]="disabled">Save match</button>`,
  }),
};

export const Ghost: Story = {
  args: { variant: 'ghost' },
  render: args => ({
    props: args,
    template: `<button dsButton="ghost" [size]="size" [disabled]="disabled">Cancel</button>`,
  }),
};

export const Icon: Story = {
  args: { variant: 'icon' },
  render: args => ({
    props: args,
    template: `<button dsButton="icon" [disabled]="disabled">⭐</button>`,
  }),
};

export const Small: Story = {
  args: { size: 'sm' },
  render: args => ({
    props: args,
    template: `
      <div style="display:flex;gap:8px;align-items:center">
        <button dsButton size="sm">Follow</button>
        <button dsButton="ghost" size="sm">Cancel</button>
      </div>
    `,
  }),
};

export const AllVariants: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap">
        <button dsButton>Primary</button>
        <button dsButton="ghost">Ghost</button>
        <button dsButton="icon">🔔</button>
        <button dsButton size="sm">Primary sm</button>
        <button dsButton="ghost" size="sm">Ghost sm</button>
        <button dsButton disabled>Disabled</button>
      </div>
    `,
  }),
  parameters: { controls: { disable: true } },
};

export const LinkButton: Story = {
  render: () => ({
    template: `
      <div style="display:flex;gap:12px">
        <a dsButton href="#" style="cursor:pointer">Navigate</a>
        <a dsButton="ghost" href="#" style="cursor:pointer">Back</a>
      </div>
    `,
  }),
  parameters: { controls: { disable: true } },
};
