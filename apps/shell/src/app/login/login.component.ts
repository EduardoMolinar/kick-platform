import {
  ChangeDetectionStrategy,
  Component,
  inject,
} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '@kick/auth';
import { SpinnerComponent } from '@kick/design-system';

/**
 * LoginComponent — Phase 1 stub.
 *
 * Displays a placeholder login screen. Real OAuth / credential flow will be
 * wired in a later phase once the backend auth endpoints are live.
 *
 * In dev, if you want to bypass auth and see the shell layout, temporarily
 * make auth.bootstrap() resolve to 'authenticated' in the service mock.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SpinnerComponent],
  styles: [`
    :host {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background-color: var(--ds-color-bg-base);
    }

    .login-card {
      width: 100%;
      max-width: 400px;
      padding: var(--ds-space-10);
      background-color: var(--ds-color-bg-surface);
      border: 1px solid var(--ds-color-border-subtle);
      border-radius: var(--ds-radius-lg);
      text-align: center;
    }

    .login-logo {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 48px;
      height: 48px;
      border-radius: var(--ds-radius-md);
      background-color: var(--ds-color-brand);
      color: #fff;
      font-weight: var(--ds-weight-bold);
      font-size: var(--ds-text-xl);
      margin-bottom: var(--ds-space-6);
    }

    h1 {
      font-size: var(--ds-text-2xl);
      font-weight: var(--ds-weight-bold);
      color: var(--ds-color-text-primary);
      margin-bottom: var(--ds-space-2);
    }

    p {
      font-size: var(--ds-text-sm);
      color: var(--ds-color-text-secondary);
      margin-bottom: var(--ds-space-8);
    }

    .login-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--ds-space-3);
      color: var(--ds-color-text-tertiary);
      font-size: var(--ds-text-sm);
    }
  `],
  template: `
    <div class="login-card">
      <div class="login-logo" aria-hidden="true">K</div>
      <h1>Welcome to Kick</h1>
      <p>Live soccer scores, fixtures &amp; stats.</p>
      <div class="login-placeholder">
        <ds-spinner size="md"></ds-spinner>
        <span>Authentication coming soon</span>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  /** Post-login redirect target — preserved from the original navigation attempt. */
  private get returnUrl(): string {
    return (this.route.snapshot.queryParamMap.get('returnUrl') ?? '/home');
  }
}
