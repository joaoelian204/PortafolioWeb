import { Component, EventEmitter, inject, Input, Output, signal } from '@angular/core';
import { NgHcaptchaModule } from 'ng-hcaptcha';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-cv-download-modal',
  standalone: true,
  imports: [NgHcaptchaModule],
  template: `
    @if (isOpen()) {
      <div class="modal-overlay" (click)="onOverlayClick($event)">
        <div class="modal-container">
          <!-- Header -->
          <div class="modal-header">
            <div class="header-content">
              <svg
                class="header-icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="12" y1="18" x2="12" y2="12"></line>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
              <h2 class="modal-title">
                {{ i18n.language() === 'es' ? 'Descargar CV' : 'Download CV' }}
              </h2>
            </div>
            <button class="close-btn" (click)="close()" title="Close">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <!-- Body -->
          <div class="modal-body">
            <p class="modal-description">
              {{
                i18n.language() === 'es'
                  ? 'Por favor, completa la verificación para descargar mi CV. Esto ayuda a prevenir descargas automatizadas.'
                  : 'Please complete the verification to download my CV. This helps prevent automated downloads.'
              }}
            </p>

            <!-- hCaptcha Widget -->
            <div class="captcha-container">
              @if (!isVerified() && !isLoading()) {
                <ng-hcaptcha
                  (verify)="onCaptchaVerify($event)"
                  (expired)="onCaptchaExpired()"
                  (error)="onCaptchaError($event)"
                ></ng-hcaptcha>
              }

              @if (isLoading()) {
                <div class="loading-state">
                  <div class="spinner"></div>
                  <span>{{ i18n.language() === 'es' ? 'Verificando...' : 'Verifying...' }}</span>
                </div>
              }

              @if (isVerified()) {
                <div class="verified-state">
                  <svg
                    class="check-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>{{ i18n.language() === 'es' ? '¡Verificado!' : 'Verified!' }}</span>
                </div>
              }

              @if (errorMessage()) {
                <div class="error-state">
                  <svg
                    class="error-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <span>{{ errorMessage() }}</span>
                </div>
              }
            </div>
          </div>

          <!-- Footer -->
          <div class="modal-footer">
            <button class="btn-secondary" (click)="close()">
              {{ i18n.language() === 'es' ? 'Cancelar' : 'Cancel' }}
            </button>
            <button
              class="btn-primary"
              [disabled]="!isVerified() || isLoading()"
              (click)="downloadCV()"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {{ i18n.language() === 'es' ? 'Descargar' : 'Download' }}
            </button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
        animation: fadeIn 0.2s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .modal-container {
        background-color: var(--vscode-editor-background, #1e1e1e);
        border: 1px solid var(--vscode-widget-border, #454545);
        border-radius: 8px;
        width: 90%;
        max-width: 420px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
        animation: slideIn 0.2s ease-out;
      }

      @keyframes slideIn {
        from {
          opacity: 0;
          transform: translateY(-20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .modal-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        border-bottom: 1px solid var(--vscode-widget-border, #454545);
      }

      .header-content {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .header-icon {
        width: 24px;
        height: 24px;
        color: var(--vscode-textLink-foreground, #3794ff);
      }

      .modal-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
        color: var(--vscode-editor-foreground, #d4d4d4);
      }

      .close-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        padding: 4px;
        color: var(--vscode-icon-foreground, #c5c5c5);
        border-radius: 4px;
        transition: all 0.15s ease;
      }

      .close-btn:hover {
        background-color: var(--vscode-toolbar-hoverBackground, rgba(90, 93, 94, 0.31));
        color: var(--vscode-editor-foreground, #d4d4d4);
      }

      .close-btn svg {
        width: 20px;
        height: 20px;
      }

      .modal-body {
        padding: 20px;
      }

      .modal-description {
        color: var(--vscode-descriptionForeground, #858585);
        font-size: 14px;
        line-height: 1.5;
        margin: 0 0 20px 0;
      }

      .captcha-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        min-height: 78px;
      }

      .loading-state,
      .verified-state,
      .error-state {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 16px 24px;
        border-radius: 6px;
        font-size: 14px;
      }

      .loading-state {
        color: var(--vscode-textLink-foreground, #3794ff);
      }

      .verified-state {
        background-color: rgba(78, 201, 176, 0.1);
        color: #4ec9b0;
      }

      .error-state {
        background-color: rgba(244, 135, 113, 0.1);
        color: #f48771;
      }

      .spinner {
        width: 20px;
        height: 20px;
        border: 2px solid transparent;
        border-top-color: currentColor;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .check-icon,
      .error-icon {
        width: 20px;
        height: 20px;
      }

      .modal-footer {
        display: flex;
        justify-content: flex-end;
        gap: 12px;
        padding: 16px 20px;
        border-top: 1px solid var(--vscode-widget-border, #454545);
      }

      .btn-secondary,
      .btn-primary {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        border-radius: 4px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .btn-secondary {
        background-color: transparent;
        border: 1px solid var(--vscode-button-secondaryBackground, #3a3d41);
        color: var(--vscode-button-secondaryForeground, #cccccc);
      }

      .btn-secondary:hover {
        background-color: var(--vscode-button-secondaryHoverBackground, #45494e);
      }

      .btn-primary {
        background-color: var(--vscode-button-background, #0e639c);
        border: 1px solid var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #ffffff);
      }

      .btn-primary:hover:not(:disabled) {
        background-color: var(--vscode-button-hoverBackground, #1177bb);
      }

      .btn-primary:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .btn-primary svg,
      .btn-secondary svg {
        width: 16px;
        height: 16px;
      }

      /* Estilos para el widget de hCaptcha en tema oscuro */
      :host ::ng-deep .h-captcha {
        transform: scale(0.95);
        transform-origin: center;
      }
    `,
  ],
})
export class CvDownloadModalComponent {
  @Input() cvUrl: string = '';
  @Output() downloaded = new EventEmitter<void>();

  i18n = inject(I18nService);

  isOpen = signal(false);
  isVerified = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  private captchaToken: string | null = null;

  open(): void {
    this.isOpen.set(true);
    this.resetState();
  }

  close(): void {
    this.isOpen.set(false);
    this.resetState();
  }

  private resetState(): void {
    this.isVerified.set(false);
    this.isLoading.set(false);
    this.errorMessage.set(null);
    this.captchaToken = null;
  }

  onOverlayClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-overlay')) {
      this.close();
    }
  }

  onCaptchaVerify(token: string): void {
    this.captchaToken = token;
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Validar con el backend (Netlify Function)
    this.verifyCaptcha(token);
  }

  private async verifyCaptcha(token: string): Promise<void> {
    try {
      const response = await fetch('/.netlify/functions/verify-captcha', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      const result = await response.json();

      if (result.success) {
        this.isVerified.set(true);
      } else {
        this.errorMessage.set(
          this.i18n.language() === 'es'
            ? 'La verificación falló. Por favor, inténtalo de nuevo.'
            : 'Verification failed. Please try again.',
        );
      }
    } catch (error) {
      // Si el backend no está disponible, permitir descarga de todos modos
      // (para desarrollo local o si la función falla)
      console.warn('Captcha verification endpoint not available, allowing download');
      this.isVerified.set(true);
    } finally {
      this.isLoading.set(false);
    }
  }

  onCaptchaExpired(): void {
    this.isVerified.set(false);
    this.captchaToken = null;
    this.errorMessage.set(
      this.i18n.language() === 'es'
        ? 'La verificación ha expirado. Por favor, inténtalo de nuevo.'
        : 'Verification expired. Please try again.',
    );
  }

  onCaptchaError(error: any): void {
    this.isLoading.set(false);
    this.errorMessage.set(
      this.i18n.language() === 'es'
        ? 'Error al cargar el captcha. Por favor, recarga la página.'
        : 'Error loading captcha. Please reload the page.',
    );
    console.error('hCaptcha error:', error);
  }

  downloadCV(): void {
    if (!this.isVerified() || !this.cvUrl) return;

    // Abrir el CV en una nueva pestaña o descargarlo
    const link = document.createElement('a');
    link.href = this.cvUrl;
    link.target = '_blank';
    link.download = 'CV.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.downloaded.emit();
    this.close();
  }
}
