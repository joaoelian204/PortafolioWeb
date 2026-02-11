import { Component, effect, inject, signal } from '@angular/core';
import { I18nService, Language } from '../../core/services/i18n.service';
import { Theme, ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  template: `
    <div class="code-editor">
      <div class="line-numbers">
        @for (line of lineNumbers(); track line) {
          <span class="line-number">{{ line }}</span>
        }
      </div>
      <div class="code-content">
        <pre class="code"><span class="comment">// settings.json</span>
<span class="comment">// {{ i18n.language() === 'es' ? 'Configuración del portafolio' : 'Portfolio settings' }}</span>

<span class="punctuation">&#123;</span>
  <span class="property">"editor.theme"</span><span class="punctuation">:</span> <span class="string">"{{ themeService.theme() }}"</span><span class="punctuation">,</span>
  <span class="property">"editor.language"</span><span class="punctuation">:</span> <span class="string">"{{ i18n.language() }}"</span>
<span class="punctuation">&#125;</span>
</pre>

        <div class="settings-panel">
          <h3 class="settings-title">
            <svg
              class="title-icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="3"></circle>
              <path
                d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 8 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"
              ></path>
            </svg>
            {{ i18n.language() === 'es' ? 'Configuración' : 'Settings' }}
          </h3>

          <!-- Theme Setting -->
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">
                <svg
                  class="setting-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                {{ i18n.language() === 'es' ? 'Tema' : 'Theme' }}
              </span>
              <span class="setting-description">
                {{
                  i18n.language() === 'es'
                    ? 'Cambia entre tema claro y oscuro'
                    : 'Switch between light and dark theme'
                }}
              </span>
            </div>
            <div class="setting-control">
              <button
                class="theme-btn"
                [class.active]="themeService.theme() === 'dark'"
                (click)="setTheme('dark')"
              >
                <svg class="btn-icon" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                </svg>
                Dark
              </button>
              <button
                class="theme-btn"
                [class.active]="themeService.theme() === 'light'"
                (click)="setTheme('light')"
              >
                <svg
                  class="btn-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="5"></circle>
                  <line x1="12" y1="1" x2="12" y2="3"></line>
                  <line x1="12" y1="21" x2="12" y2="23"></line>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                  <line x1="1" y1="12" x2="3" y2="12"></line>
                  <line x1="21" y1="12" x2="23" y2="12"></line>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                </svg>
                Light
              </button>
            </div>
          </div>

          <!-- Language Setting -->
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">
                <svg
                  class="setting-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="2" y1="12" x2="22" y2="12"></line>
                  <path
                    d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"
                  ></path>
                </svg>
                {{ i18n.language() === 'es' ? 'Idioma' : 'Language' }}
              </span>
              <span class="setting-description">
                {{
                  i18n.language() === 'es'
                    ? 'Selecciona el idioma de la interfaz'
                    : 'Select interface language'
                }}
              </span>
            </div>
            <div class="setting-control">
              <button
                class="lang-btn"
                [class.active]="i18n.language() === 'es'"
                (click)="setLanguage('es')"
              >
                <span class="lang-code">ES</span>
                Español
              </button>
              <button
                class="lang-btn"
                [class.active]="i18n.language() === 'en'"
                (click)="setLanguage('en')"
              >
                <span class="lang-code">EN</span>
                English
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      .code-editor {
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

      .code-content {
        flex: 1;
        padding: 16px 24px;
        overflow-x: auto;
      }

      .code {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .comment {
        color: #6a9955;
      }
      .property {
        color: #9cdcfe;
      }
      .string {
        color: #ce9178;
      }
      .punctuation {
        color: #d4d4d4;
      }

      .settings-panel {
        margin-top: 32px;
        padding: 20px;
        background-color: var(--vscode-editor-background, #1e1e1e);
        border: 1px solid var(--vscode-panel-border, #404040);
        border-radius: 6px;
        max-width: 500px;
      }

      .settings-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--vscode-editor-foreground, #d4d4d4);
        margin: 0 0 20px 0;
        font-size: 16px;
        font-weight: 600;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--vscode-panel-border, #404040);
      }

      .title-icon {
        width: 20px;
        height: 20px;
        color: var(--vscode-textLink-foreground, #3794ff);
      }

      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 16px 0;
        border-bottom: 1px solid var(--vscode-panel-border, #404040);
      }

      .setting-item:last-child {
        border-bottom: none;
      }

      .setting-info {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }

      .setting-label {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-size: 14px;
        font-weight: 500;
      }

      .setting-icon {
        width: 16px;
        height: 16px;
        color: var(--vscode-textLink-foreground, #3794ff);
      }

      .setting-description {
        color: var(--vscode-descriptionForeground, #858585);
        font-size: 12px;
      }

      .setting-control {
        display: flex;
        gap: 8px;
      }

      .theme-btn,
      .lang-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border: 1px solid var(--vscode-panel-border, #404040);
        background-color: var(--vscode-button-secondaryBackground, #3a3d41);
        color: var(--vscode-button-secondaryForeground, #d4d4d4);
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s ease;
      }

      .btn-icon {
        width: 14px;
        height: 14px;
      }

      .lang-code {
        font-weight: 700;
        font-size: 11px;
        padding: 2px 4px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 2px;
      }

      .theme-btn:hover,
      .lang-btn:hover {
        background-color: var(--vscode-button-secondaryHoverBackground, #45494e);
      }

      .theme-btn.active,
      .lang-btn.active {
        background-color: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #ffffff);
        border-color: var(--vscode-button-background, #0e639c);
      }

      @media (max-width: 600px) {
        .setting-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 12px;
        }

        .setting-control {
          width: 100%;
        }

        .theme-btn,
        .lang-btn {
          flex: 1;
        }
      }
    `,
  ],
})
export class SettingsComponent {
  themeService = inject(ThemeService);
  i18n = inject(I18nService);

  lineNumbers = signal<number[]>([]);

  constructor() {
    this.lineNumbers.set(Array.from({ length: 10 }, (_, i) => i + 1));

    effect(() => {
      this.i18n.language();
      this.themeService.theme();
    });
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  setLanguage(lang: Language): void {
    this.i18n.setLanguage(lang);
  }
}
