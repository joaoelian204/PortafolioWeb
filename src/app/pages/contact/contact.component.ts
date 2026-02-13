import { AfterViewInit, Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { environment } from '../../../environments/environment';
import { ProfileInfo } from '../../core/models/database.types';
import { I18nService } from '../../core/services/i18n.service';
import { SupabaseService } from '../../core/services/supabase.service';

declare const hcaptcha: any;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="contact-page">
      <div class="line-numbers">
        @for (line of lineNumbers; track line) {
          <span class="line-number">{{ line }}</span>
        }
      </div>

      <div class="contact-content">
        <!-- Header -->
        <div class="page-header">
          <span class="comment">// contact.tsx</span>
          <h1 class="page-title">
            <svg
              class="title-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path
                d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
              ></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            {{ i18n.s('Contacto', 'Contact') }}
          </h1>
          <p class="page-subtitle">
            {{
              i18n.s(
                '¿Tienes un proyecto en mente? ¡Hablemos!',
                "Have a project in mind? Let's talk!"
              )
            }}
          </p>
        </div>

        <div class="contact-grid">
          <!-- Left: Contact Form -->
          <div class="form-section">
            <div class="section-header">
              <span class="keyword">const</span>
              <span class="function"> ContactForm</span>
              <span class="operator"> = </span>
              <span class="punctuation">() =&gt; &#123;</span>
            </div>

            <form [formGroup]="contactForm" (ngSubmit)="onSubmit()" class="form">
              <div class="form-group">
                <label class="label">
                  <span class="label-text">// name: string</span>
                </label>
                <input
                  type="text"
                  formControlName="name"
                  class="input"
                  [placeholder]="i18n.s('Tu Nombre', 'Your Name')"
                />
                @if (contactForm.get('name')?.invalid && contactForm.get('name')?.touched) {
                  <span class="error"
                    >// Error: {{ i18n.s('nombre requerido', 'name required') }}</span
                  >
                }
              </div>

              <div class="form-group">
                <label class="label">
                  <span class="label-text">// email: string</span>
                </label>
                <input
                  type="email"
                  formControlName="email"
                  class="input"
                  placeholder="your.email&#64;example.com"
                />
                @if (contactForm.get('email')?.invalid && contactForm.get('email')?.touched) {
                  <span class="error"
                    >// Error: {{ i18n.s('email válido requerido', 'valid email required') }}</span
                  >
                }
              </div>

              <div class="form-group">
                <label class="label">
                  <span class="label-text">// subject?: string</span>
                </label>
                <input
                  type="text"
                  formControlName="subject"
                  class="input"
                  [placeholder]="i18n.s('Asunto', 'Subject')"
                />
              </div>

              <div class="form-group">
                <label class="label">
                  <span class="label-text">// message: string</span>
                </label>
                <textarea
                  formControlName="message"
                  class="input textarea"
                  [placeholder]="i18n.s('Tu mensaje...', 'Your message...')"
                  rows="5"
                ></textarea>
                @if (contactForm.get('message')?.invalid && contactForm.get('message')?.touched) {
                  <span class="error"
                    >// Error: {{ i18n.s('mensaje requerido', 'message required') }}</span
                  >
                }
              </div>

              <!-- hCaptcha -->
              <div class="form-group captcha-container">
                <label class="label">
                  <span class="label-text">// captcha: required</span>
                </label>
                <div id="contact-hcaptcha" class="h-captcha"></div>
                @if (captchaError()) {
                  <span class="error"
                    >// Error:
                    {{
                      i18n.s('Por favor completa el captcha', 'Please complete the captcha')
                    }}</span
                  >
                }
              </div>

              <button
                type="submit"
                class="submit-btn"
                [disabled]="contactForm.invalid || isSubmitting() || !captchaToken()"
              >
                @if (isSubmitting()) {
                  <span class="btn-content">
                    <span class="spinner"></span>
                    {{ i18n.s('Enviando...', 'Sending...') }}
                  </span>
                } @else {
                  <span class="btn-content">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <line x1="22" y1="2" x2="11" y2="13"></line>
                      <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                    {{ i18n.s('Enviar Mensaje', 'Send Message') }}
                  </span>
                }
              </button>

              @if (submitSuccess()) {
                <div class="success-message">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <span>{{
                    i18n.s('¡Mensaje enviado exitosamente!', 'Message sent successfully!')
                  }}</span>
                </div>
              }

              @if (submitError()) {
                <div class="error-message">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                  <span>{{
                    i18n.s(
                      'Error al enviar. Por favor intenta de nuevo.',
                      'Error sending. Please try again.'
                    )
                  }}</span>
                </div>
              }
            </form>

            <div class="section-footer">
              <span class="punctuation">&#125;;</span>
            </div>
          </div>

          <!-- Right: Social Links & Info -->
          <div class="info-section">
            <div class="info-card">
              <h3 class="info-title">
                <span class="comment">// </span>
                {{ i18n.s('También puedes encontrarme en', 'You can also find me on') }}
              </h3>

              <div class="social-links">
                @if (profile()?.social_links?.github) {
                  <a
                    [href]="profile()?.social_links?.github"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="social-link github"
                    title="GitHub"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
                      />
                    </svg>
                  </a>
                }

                @if (profile()?.social_links?.linkedin) {
                  <a
                    [href]="profile()?.social_links?.linkedin"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="social-link linkedin"
                    title="LinkedIn"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
                      />
                    </svg>
                  </a>
                }

                @if (profile()?.social_links?.twitter) {
                  <a
                    [href]="profile()?.social_links?.twitter"
                    target="_blank"
                    rel="noopener noreferrer"
                    class="social-link twitter"
                    title="Twitter / X"
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                      />
                    </svg>
                  </a>
                }

                @if (profile()?.email) {
                  <a [href]="'mailto:' + profile()?.email" class="social-link email" title="Email">
                    <svg viewBox="0 0 24 24" fill="currentColor">
                      <path
                        d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"
                      />
                    </svg>
                  </a>
                }
              </div>
            </div>

            <!-- Response Time Card -->
            <div class="info-card response-card">
              <div class="response-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
              </div>
              <div class="response-text">
                <span class="response-title">
                  {{ i18n.s('Tiempo de respuesta', 'Response time') }}
                </span>
                <span class="response-value">
                  {{ i18n.s('Generalmente dentro de 24 horas', 'Usually within 24 hours') }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .contact-page {
        display: flex;
        height: 100%;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        font-size: 14px;
        line-height: 1.6;
      }

      .line-numbers {
        padding: 16px 0;
        background-color: var(--vscode-editorLineNumber-background, transparent);
        color: var(--vscode-editorLineNumber-foreground, #858585);
        text-align: right;
        user-select: none;
        min-width: 50px;
        padding-right: 16px;
        border-right: 1px solid var(--vscode-editorIndentGuide-background, #404040);
      }

      .line-number {
        display: block;
        padding: 0 8px;
      }

      .contact-content {
        flex: 1;
        padding: 24px;
        overflow-y: auto;
      }

      /* Header */
      .page-header {
        margin-bottom: 32px;
      }

      .page-header .comment {
        color: #6a9955;
        font-size: 12px;
      }

      .page-title {
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-size: 28px;
        font-weight: 600;
        margin: 8px 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .page-title .title-icon {
        width: 28px;
        height: 28px;
        stroke: #dcdcaa;
      }

      .page-subtitle {
        color: var(--vscode-descriptionForeground, #858585);
        font-size: 14px;
        margin: 0;
      }

      /* Grid Layout */
      .contact-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 32px;
        max-width: 1000px;
      }

      @media (max-width: 800px) {
        .contact-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Form Section */
      .form-section {
        background-color: var(--vscode-sideBar-background, #252526);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 8px;
        padding: 20px;
      }

      .section-header {
        margin-bottom: 16px;
        font-size: 13px;
      }

      .section-footer {
        margin-top: 16px;
        font-size: 13px;
      }

      .keyword {
        color: #569cd6;
      }
      .function {
        color: #dcdcaa;
      }
      .operator {
        color: #d4d4d4;
      }
      .punctuation {
        color: #d4d4d4;
      }
      .comment {
        color: #6a9955;
      }

      .form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .form-group {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .label-text {
        color: #6a9955;
        font-size: 12px;
      }

      .input {
        background-color: var(--vscode-input-background, #3c3c3c);
        border: 1px solid var(--vscode-input-border, #3c3c3c);
        color: var(--vscode-input-foreground, #cccccc);
        padding: 10px 12px;
        font-family: inherit;
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

      .textarea {
        resize: vertical;
        min-height: 100px;
      }

      .error {
        color: #f48771;
        font-size: 11px;
      }

      .submit-btn {
        background-color: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #ffffff);
        border: none;
        padding: 12px 20px;
        font-family: inherit;
        font-size: 14px;
        cursor: pointer;
        border-radius: 4px;
        transition: all 0.2s ease;
        margin-top: 8px;
      }

      .submit-btn:hover:not(:disabled) {
        background-color: var(--vscode-button-hoverBackground, #1177bb);
        transform: translateY(-1px);
      }

      .submit-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      .btn-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .btn-content svg {
        width: 16px;
        height: 16px;
      }

      .spinner {
        width: 16px;
        height: 16px;
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

      .success-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background-color: rgba(78, 201, 176, 0.1);
        border: 1px solid #4ec9b0;
        border-radius: 4px;
        color: #4ec9b0;
        font-size: 13px;
      }

      .success-message svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      .error-message {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 12px;
        background-color: rgba(244, 135, 113, 0.1);
        border: 1px solid #f48771;
        border-radius: 4px;
        color: #f48771;
        font-size: 13px;
      }

      .error-message svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      /* Captcha */
      .captcha-container {
        margin-top: 8px;
      }

      .h-captcha {
        margin-top: 8px;
      }

      .h-captcha iframe {
        border-radius: 4px;
      }

      /* Info Section */
      .info-section {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      .info-card {
        background-color: var(--vscode-sideBar-background, #252526);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 8px;
        padding: 20px;
      }

      .info-title {
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-size: 14px;
        font-weight: 500;
        margin: 0 0 16px 0;
      }

      /* Social Links */
      .social-links {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .social-link {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 52px;
        height: 52px;
        border-radius: 12px;
        text-decoration: none;
        transition: all 0.2s ease;
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        background-color: var(--vscode-editor-background, #1e1e1e);
      }

      .social-link svg {
        width: 26px;
        height: 26px;
      }

      .social-link:hover {
        transform: translateY(-3px);
        border-color: var(--vscode-focusBorder, #007fd4);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      }

      .social-link.github {
        color: #f0f0f0;
      }
      .social-link.github:hover {
        background-color: rgba(255, 255, 255, 0.1);
      }

      .social-link.linkedin {
        color: #0a66c2;
      }
      .social-link.linkedin:hover {
        background-color: rgba(10, 102, 194, 0.15);
      }

      .social-link.twitter {
        color: #1da1f2;
      }
      .social-link.twitter:hover {
        background-color: rgba(29, 161, 242, 0.15);
      }

      .social-link.email {
        color: #ea4335;
      }
      .social-link.email:hover {
        background-color: rgba(234, 67, 53, 0.15);
      }

      /* Response Card */
      .response-card {
        display: flex;
        align-items: center;
        gap: 16px;
      }

      .response-icon {
        font-size: 28px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .response-icon svg {
        width: 28px;
        height: 28px;
        stroke: #dcdcaa;
      }

      .response-text {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .response-title {
        font-size: 12px;
        color: var(--vscode-descriptionForeground, #858585);
      }

      .response-value {
        font-size: 14px;
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-weight: 500;
      }
    `,
  ],
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
  private fb = inject(FormBuilder);
  private supabase = inject(SupabaseService);
  i18n = inject(I18nService);

  profile = signal<ProfileInfo | null>(null);
  contactForm: FormGroup;
  isSubmitting = signal(false);
  submitSuccess = signal(false);
  captchaToken = signal<string | null>(null);
  captchaError = signal(false);
  private captchaWidgetId: string | null = null;

  lineNumbers = Array.from({ length: 60 }, (_, i) => i + 1);

  constructor() {
    this.contactForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      subject: [''],
      message: ['', Validators.required],
    });
  }

  async ngOnInit(): Promise<void> {
    const profileData = await this.supabase.getProfile();
    this.profile.set(profileData);
    this.loadHCaptchaScript();
  }

  ngAfterViewInit(): void {
    // El captcha se renderiza después de que el script se carga
  }

  ngOnDestroy(): void {
    // Limpiar el widget si existe
    if (this.captchaWidgetId !== null && typeof hcaptcha !== 'undefined') {
      try {
        hcaptcha.reset(this.captchaWidgetId);
      } catch (e) {
        // Ignorar errores de limpieza
      }
    }
  }

  private loadHCaptchaScript(): void {
    // Verificar si el script ya está cargado
    if (document.getElementById('hcaptcha-script')) {
      this.renderCaptcha();
      return;
    }

    const script = document.createElement('script');
    script.id = 'hcaptcha-script';
    script.src = 'https://js.hcaptcha.com/1/api.js?render=explicit';
    script.async = true;
    script.defer = true;
    script.onload = () => this.renderCaptcha();
    document.head.appendChild(script);
  }

  private renderCaptcha(): void {
    // Esperar a que el elemento exista
    setTimeout(() => {
      const container = document.getElementById('contact-hcaptcha');
      if (container && typeof hcaptcha !== 'undefined') {
        try {
          this.captchaWidgetId = hcaptcha.render('contact-hcaptcha', {
            sitekey: environment.hcaptcha.siteKey,
            theme: 'dark',
            callback: (token: string) => {
              this.captchaToken.set(token);
              this.captchaError.set(false);
            },
            'expired-callback': () => {
              this.captchaToken.set(null);
            },
            'error-callback': () => {
              this.captchaToken.set(null);
              this.captchaError.set(true);
            },
          });
        } catch (e) {
          console.error('Error rendering hCaptcha:', e);
        }
      }
    }, 100);
  }

  private resetCaptcha(): void {
    if (this.captchaWidgetId !== null && typeof hcaptcha !== 'undefined') {
      try {
        hcaptcha.reset(this.captchaWidgetId);
        this.captchaToken.set(null);
      } catch (e) {
        console.error('Error resetting captcha:', e);
      }
    }
  }

  getUsername(url: string | undefined): string {
    if (!url) return '';
    const parts = url.split('/');
    return parts[parts.length - 1] || parts[parts.length - 2] || url;
  }

  submitError = signal(false);

  async onSubmit(): Promise<void> {
    if (this.contactForm.invalid) return;

    // Verificar captcha
    const token = this.captchaToken();
    if (!token) {
      this.captchaError.set(true);
      return;
    }

    this.isSubmitting.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(false);

    try {
      // Verificar captcha en el servidor
      const captchaResponse = await fetch('/.netlify/functions/verify-captcha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const captchaResult = await captchaResponse.json();

      if (!captchaResult.success) {
        this.captchaError.set(true);
        this.resetCaptcha();
        this.isSubmitting.set(false);
        return;
      }

      const formData = this.contactForm.value;

      // Enviar email a través de la función de Netlify
      const response = await fetch('/.netlify/functions/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject || 'Nuevo mensaje desde el portafolio',
          message: formData.message,
        }),
      });

      const result = await response.json();

      if (result.success) {
        this.submitSuccess.set(true);
        this.contactForm.reset();
        this.resetCaptcha();
        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => this.submitSuccess.set(false), 5000);
      } else {
        console.error('Error sending email:', result.error);
        this.submitError.set(true);
        setTimeout(() => this.submitError.set(false), 5000);
      }
    } catch (error) {
      console.error('Error:', error);
      this.submitError.set(true);
      this.resetCaptcha();
      setTimeout(() => this.submitError.set(false), 5000);
    } finally {
      this.isSubmitting.set(false);
    }
  }
}
