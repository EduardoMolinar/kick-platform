import type { Meta, StoryObj } from '@storybook/angular';
import { AvatarComponent } from './avatar.component';

const meta: Meta<AvatarComponent> = {
  title: 'Primitives/Avatar',
  component: AvatarComponent,
  tags: ['autodocs'],
  argTypes: {
    initials: { control: 'text' },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
    src: { control: 'text' },
  },
  args: {
    initials: 'E',
    size: 'md',
  },
  parameters: {
    docs: {
      description: {
        component: `
User identity component. Shows initials by default; falls back to initials
if an image URL is provided but fails to load.

Always provide an accessible label via \`aria-label\` with the user's full name:

\`\`\`html
<ds-avatar initials="E" size="lg" aria-label="Eduardo"></ds-avatar>
\`\`\`

The gradient background is themeable via CSS custom properties:
\`\`\`css
ds-avatar {
  --ds-avatar-bg-from: #your-color;
  --ds-avatar-bg-to:   #your-other-color;
}
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<AvatarComponent>;

export const Default: Story = {
  args: { initials: 'E', size: 'md' },
  render: args => ({
    props: args,
    template: `<ds-avatar [initials]="initials" [size]="size" aria-label="Eduardo"></ds-avatar>`,
  }),
};

export const AllSizes: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:16px">
        <ds-avatar initials="E" size="sm" aria-label="Eduardo small"></ds-avatar>
        <ds-avatar initials="E" size="md" aria-label="Eduardo medium"></ds-avatar>
        <ds-avatar initials="E" size="lg" aria-label="Eduardo large"></ds-avatar>
      </div>
    `,
  }),
  parameters: { controls: { disable: true } },
};

export const MultipleInitials: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:12px">
        <ds-avatar initials="E"  size="md" aria-label="Eduardo"></ds-avatar>
        <ds-avatar initials="JD" size="md" aria-label="John Doe"></ds-avatar>
        <ds-avatar initials="AB" size="md" aria-label="Alice Brown"></ds-avatar>
        <ds-avatar initials="Z"  size="md" aria-label="Zara"></ds-avatar>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Initials are capped at 2 characters and uppercased automatically.',
      },
    },
  },
};

export const ProfileContext: Story = {
  render: () => ({
    template: `
      <div style="display:flex;align-items:center;gap:16px;
                  background:var(--ds-color-bg-surface);
                  border:1px solid var(--ds-color-border-subtle);
                  border-radius:var(--ds-radius-xl);padding:24px">
        <ds-avatar initials="E" size="lg" aria-label="Eduardo"></ds-avatar>
        <div>
          <div style="font-size:20px;font-weight:800;color:var(--ds-color-text-primary)">
            Eduardo
          </div>
          <div style="font-size:13px;color:var(--ds-color-text-muted);margin-top:4px">
            Member since January 2025
          </div>
        </div>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: { story: 'Avatar in the profile header context.' },
    },
  },
};
