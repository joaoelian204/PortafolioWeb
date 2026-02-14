import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <div class="login-header">
          <div class="vscode-logo">
            <svg viewBox="0 0 100 100" fill="none">
              <path
                d="M95.0167 24.3833L75.7667 7.05C74.6667 6.08333 73.2167 5.58333 71.7333 5.66667C70.25 5.75 68.8667 6.41667 67.8833 7.53333L27.6667 52.7333L11.3833 39.9333C10.1 38.9 8.43333 38.4833 6.81667 38.7833C5.2 39.0833 3.78333 40.0667 2.93333 41.4833L0.616667 45.2C-0.0166667 46.2833 -0.183333 47.5833 0.15 48.8C0.483333 50.0167 1.28333 51.05 2.38333 51.6833L16.0833 60L2.38333 68.3167C1.28333 68.95 0.483333 69.9833 0.15 71.2C-0.183333 72.4167 -0.0166667 73.7167 0.616667 74.8L2.93333 78.5167C3.78333 79.9333 5.2 80.9167 6.81667 81.2167C8.43333 81.5167 10.1 81.1 11.3833 80.0667L27.6667 67.2667L67.8833 112.467C68.8667 113.583 70.25 114.25 71.7333 114.333C73.2167 114.417 74.6667 113.917 75.7667 112.95L95.0167 95.6167C96.9333 93.9 98 91.4 98 88.7833V31.2167C98 28.6 96.9333 26.1 95.0167 24.3833ZM71.6667 84.0333L45.7167 60L71.6667 35.9667V84.0333Z"
                fill="#007ACC"
              />
            </svg>
          </div>
          <h1 class="title">Admin Login</h1>
          <p class="subtitle">Sign in to manage your portfolio</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="login-form">
          <div class="form-group">
            <label for="email" class="label">Email</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="input"
              placeholder="admin@example.com"
              autocomplete="email"
            />
            @if (loginForm.get('email')?.invalid && loginForm.get('email')?.touched) {
              <span class="error">Please enter a valid email</span>
            }
          </div>

          <div class="form-group">
            <label for="password" class="label">Password</label>
            <input
              id="password"
              type="password"
              formControlName="password"
              class="input"
              placeholder="••••••••"
              autocomplete="current-password"
            />
            @if (loginForm.get('password')?.invalid && loginForm.get('password')?.touched) {
              <span class="error">Password is required</span>
            }
          </div>

          @if (errorMessage()) {
            <div class="error-banner">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm-.5-9h1v5h-1V5zm0 6h1v1h-1v-1z"
                />
              </svg>
              <span>{{ errorMessage() }}</span>
            </div>
          }

          <button type="submit" class="submit-btn" [disabled]="loginForm.invalid || isLoading()">
            @if (isLoading()) {
              <span class="loading-spinner"></span>
              <span>Signing in...</span>
            } @else {
              <span>Sign In</span>
            }
          </button>
        </form>

        <div class="login-footer">
          <a href="/" class="back-link">← Back to Portfolio</a>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .login-container {
        min-height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        background-color: var(--vscode-editor-background, #1e1e1e);
        padding: 20px;
      }

      .login-card {
        width: 100%;
        max-width: 400px;
        background-color: var(--vscode-sideBar-background, #252526);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 8px;
        padding: 32px;
      }

      .login-header {
        text-align: center;
        margin-bottom: 32px;
      }

      .vscode-logo {
        width: 64px;
        height: 64px;
        margin: 0 auto 16px;
      }

      .vscode-logo svg {
        width: 100%;
        height: 100%;
      }

      .title {
        font-size: 24px;
        font-weight: 600;
        color: var(--vscode-editor-foreground, #d4d4d4);
        margin: 0 0 8px;
      }

      .subtitle {
        font-size: 14px;
        color: var(--vscode-descriptionForeground, #858585);
        margin: 0;
      }

      .login-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }

      .label {
        font-size: 13px;
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-weight: 500;
      }

      .input {
        background-color: var(--vscode-input-background, #3c3c3c);
        border: 1px solid var(--vscode-input-border, #3c3c3c);
        color: var(--vscode-input-foreground, #cccccc);
        padding: 10px 12px;
        font-size: 14px;
        border-radius: 4px;
        outline: none;
        transition: border-color 0.15s ease;
      }

      .input:focus {
        border-color: var(--vscode-focusBorder, #007fd4);
      }

      .input::placeholder {
        color: var(--vscode-input-placeholderForeground, #6b6b6b);
      }

      .error {
        color: var(--syntax-error, #f48771);
        font-size: 12px;
      }

      .error-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background-color: rgba(244, 135, 113, 0.1);
        border: 1px solid var(--syntax-error, #f48771);
        border-radius: 4px;
        color: var(--syntax-error, #f48771);
        font-size: 13px;
      }

      .error-banner svg {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      .submit-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        background-color: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #ffffff);
        border: none;
        padding: 12px 20px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-radius: 4px;
        transition: background-color 0.15s ease;
      }

      .submit-btn:hover:not(:disabled) {
        background-color: var(--vscode-button-hoverBackground, #1177bb);
      }

      .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .loading-spinner {
        width: 16px;
        height: 16px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-top-color: white;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .login-footer {
        margin-top: 24px;
        text-align: center;
      }

      .back-link {
        color: var(--vscode-textLink-foreground, #3794ff);
        text-decoration: none;
        font-size: 13px;
      }

      .back-link:hover {
        text-decoration: underline;
      }

      @media (max-width: 480px) {
        .login-container {
          padding: 12px;
        }

        .login-card {
          padding: 20px;
        }

        .vscode-logo {
          width: 48px;
          height: 48px;
        }

        .title {
          font-size: 20px;
        }
      }
    `,
  ],
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  loginForm: FormGroup;
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.loginForm.value;
    const { error } = await this.supabase.signIn(email, password);

    if (error) {
      this.errorMessage.set(error.message || 'Invalid credentials');
      this.isLoading.set(false);
      return;
    }

    this.router.navigate(['/admin']);
  }
}
