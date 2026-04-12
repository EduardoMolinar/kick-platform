import type { Meta, StoryObj } from '@storybook/angular';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ToggleComponent } from './toggle.component';

const meta: Meta<ToggleComponent> = {
  title: 'Primitives/Toggle',
  component: ToggleComponent,
  tags: ['autodocs'],
  argTypes: {
    checked:  { control: 'boolean' },
    disabled: { control: 'boolean' },
  },
  args: { checked: false, disabled: false },
  parameters: {
    docs: {
      description: {
        component: `
Binary on/off switch. Implements \`ControlValueAccessor\` for transparent
form integration. Always pair with a visible label for accessibility.

\`\`\`html
<!-- Standalone -->
<label>
  Goal alerts
  <ds-toggle [checked]="goals" (checkedChange)="goals = $event"></ds-toggle>
</label>

<!-- Reactive form -->
<ds-toggle formControlName="goalAlerts"></ds-toggle>
\`\`\`
        `,
      },
    },
  },
};

export default meta;
type Story = StoryObj<ToggleComponent>;

export const Off: Story = {
  args: { checked: false },
  render: args => ({
    props: args,
    template: `<ds-toggle [checked]="checked" [disabled]="disabled"></ds-toggle>`,
  }),
};

export const On: Story = {
  args: { checked: true },
  render: args => ({
    props: args,
    template: `<ds-toggle [checked]="checked" [disabled]="disabled"></ds-toggle>`,
  }),
};

export const Disabled: Story = {
  args: { checked: false, disabled: true },
  render: args => ({
    props: args,
    template: `<ds-toggle [checked]="checked" [disabled]="disabled"></ds-toggle>`,
  }),
};

export const WithLabel: Story = {
  render: () => ({
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div style="display:flex;align-items:center;justify-content:space-between;
                    background:var(--ds-color-bg-surface);border:1px solid var(--ds-color-border-subtle);
                    border-radius:var(--ds-radius-md);padding:12px 16px;width:280px">
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--ds-color-text-primary)">
              Goal alerts
            </div>
            <div style="font-size:11px;color:var(--ds-color-text-muted)">Instant push</div>
          </div>
          <ds-toggle [checked]="true"></ds-toggle>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;
                    background:var(--ds-color-bg-surface);border:1px solid var(--ds-color-border-subtle);
                    border-radius:var(--ds-radius-md);padding:12px 16px;width:280px">
          <div>
            <div style="font-size:13px;font-weight:600;color:var(--ds-color-text-primary)">
              Match start / end
            </div>
            <div style="font-size:11px;color:var(--ds-color-text-muted)">Followed teams only</div>
          </div>
          <ds-toggle [checked]="false"></ds-toggle>
        </div>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'Typical usage in the Profile notification preferences list.',
      },
    },
  },
};

export const ReactiveForm: Story = {
  render: () => ({
    props: { ctrl: new FormControl(false) },
    moduleMetadata: { imports: [ReactiveFormsModule] },
    template: `
      <div style="display:flex;flex-direction:column;gap:12px">
        <ds-toggle [formControl]="ctrl"></ds-toggle>
        <code style="font-size:12px;color:var(--ds-color-text-muted)">
          Value: {{ ctrl.value }}
        </code>
      </div>
    `,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story: 'ControlValueAccessor integration with a reactive FormControl.',
      },
    },
  },
};
