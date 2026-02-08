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
            {{ i18n.language() === 'es' ? '⚙️ Configuración' : '⚙️ Settings' }}
          </h3>

          <!-- Theme Setting -->
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">
                {{ i18n.language() === 'es' ? '🎨 Tema' : '🎨 Theme' }}
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
                🌙 Dark
              </button>
              <button
                class="theme-btn"
                [class.active]="themeService.theme() === 'light'"
                (click)="setTheme('light')"
              >
                ☀️ Light
              </button>
            </div>
          </div>

          <!-- Language Setting -->
          <div class="setting-item">
            <div class="setting-info">
              <span class="setting-label">
                {{ i18n.language() === 'es' ? '🌐 Idioma' : '🌐 Language' }}
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
                🇪🇸 Español
              </button>
              <button
                class="lang-btn"
                [class.active]="i18n.language() === 'en'"
                (click)="setLanguage('en')"
              >
                🇺🇸 English
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
        color: var(--vscode-editor-foreground, #d4d4d4);
        margin: 0 0 20px 0;
        font-size: 16px;
        font-weight: 600;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--vscode-panel-border, #404040);
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
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-size: 14px;
        font-weight: 500;
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
        padding: 8px 16px;
        border: 1px solid var(--vscode-panel-border, #404040);
        background-color: var(--vscode-button-secondaryBackground, #3a3d41);
        color: var(--vscode-button-secondaryForeground, #d4d4d4);
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s ease;
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
