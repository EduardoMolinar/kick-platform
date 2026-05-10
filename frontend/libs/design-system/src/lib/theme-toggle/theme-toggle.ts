import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import type { ThemeMode } from '../theme/theme.service';

@Component({
  selector: 'ds-theme-toggle',
  standalone: true,
  imports: [],
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DsThemeToggle {
  @Input() mode: ThemeMode = 'dark';
  @Output() readonly modeChange = new EventEmitter<ThemeMode>();

  protected readonly modes: readonly ThemeMode[] = ['light', 'system', 'dark'];

  protected select(next: ThemeMode): void {
    if (next !== this.mode) this.modeChange.emit(next);
  }

  protected label(mode: ThemeMode): string {
    return mode === 'light' ? 'Light' : mode === 'dark' ? 'Dark' : 'System';
  }
}
