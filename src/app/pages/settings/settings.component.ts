import { Component, effect, inject, signal } from '@angular/core';
import { I18nService, Language } from '../../core/services/i18n.service';
import { Theme, THEMES, ThemeService } from '../../core/services/theme.service';

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
<span class="comment">// {{ i18n.s('Configuración del portafolio', 'Portfolio settings') }}</span>

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
            {{ i18n.s('Configuración', 'Settings') }}
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
                {{ i18n.s('Tema de Color', 'Color Theme') }}
              </span>
              <span class="setting-description">
                {{
                  i18n.s('Selecciona el tema visual del editor', 'Select the editor visual theme')
                }}
              </span>
            </div>
          </div>

          <!-- Theme Grid -->
          <div class="theme-grid">
            @for (theme of themes; track theme.id) {
              <button
                class="theme-card"
                [class.active]="themeService.theme() === theme.id"
                (click)="setTheme(theme.id)"
              >
                <div class="theme-preview">
                  <div
                    class="preview-titlebar"
                    [style.background]="getPreviewColor(theme.id, 'titlebar')"
                  ></div>
                  <div class="preview-body">
                    <div
                      class="preview-sidebar"
                      [style.background]="getPreviewColor(theme.id, 'sidebar')"
                    ></div>
                    <div
                      class="preview-editor"
                      [style.background]="getPreviewColor(theme.id, 'editor')"
                    >
                      <div
                        class="preview-line"
                        [style.background]="getPreviewColor(theme.id, 'l1')"
                        [style.width]="getLineWidth('l1')"
                      ></div>
                      <div
                        class="preview-line"
                        [style.background]="getPreviewColor(theme.id, 'l2')"
                        [style.width]="getLineWidth('l2')"
                      ></div>
                      <div
                        class="preview-line"
                        [style.background]="getPreviewColor(theme.id, 'l3')"
                        [style.width]="getLineWidth('l3')"
                      ></div>
                      <div
                        class="preview-line"
                        [style.background]="getPreviewColor(theme.id, 'l4')"
                        [style.width]="getLineWidth('l4')"
                      ></div>
                    </div>
                  </div>
                  <div
                    class="preview-statusbar"
                    [style.background]="getPreviewColor(theme.id, 'statusbar')"
                  ></div>
                </div>
                <span class="theme-name">{{ i18n.s(theme.nameEs, theme.name) }}</span>
                @if (themeService.theme() === theme.id) {
                  <span class="active-badge">
                    <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                    </svg>
                  </span>
                }
              </button>
            }
          </div>

          <!-- Language Setting -->
          <div class="setting-item" style="margin-top: 24px;">
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
                {{ i18n.s('Idioma', 'Language') }}
              </span>
              <span class="setting-description">
                {{ i18n.s('Selecciona el idioma de la interfaz', 'Select interface language') }}
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
        color: var(--syntax-comment, #6a9955);
      }
      .property {
        color: var(--syntax-variable, #9cdcfe);
      }
      .string {
        color: var(--syntax-string, #ce9178);
      }
      .punctuation {
        color: var(--syntax-punctuation, #d4d4d4);
      }

      .settings-panel {
        margin-top: 32px;
        padding: 20px;
        background-color: var(--vscode-editor-background);
        border: 1px solid var(--vscode-panel-border);
        border-radius: 6px;
        max-width: 600px;
      }

      .settings-title {
        display: flex;
        align-items: center;
        gap: 8px;
        color: var(--vscode-editor-foreground);
        margin: 0 0 20px 0;
        font-size: 16px;
        font-weight: 600;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--vscode-panel-border);
      }

      .title-icon {
        width: 20px;
        height: 20px;
        color: var(--vscode-textLink-foreground);
      }

      .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
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
        color: var(--vscode-editor-foreground);
        font-size: 14px;
        font-weight: 500;
      }

      .setting-icon {
        width: 16px;
        height: 16px;
        color: var(--vscode-textLink-foreground);
      }

      .setting-description {
        color: var(--vscode-descriptionForeground);
        font-size: 12px;
      }

      .setting-control {
        display: flex;
        gap: 8px;
      }

      /* ── Theme Grid ── */
      .theme-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        gap: 12px;
        margin-top: 12px;
      }

      .theme-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        padding: 8px;
        background: transparent;
        border: 2px solid var(--vscode-panel-border);
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s ease;
        position: relative;
      }

      .theme-card:hover {
        border-color: var(--vscode-textLink-foreground);
        background-color: var(--vscode-list-hoverBackground);
      }

      .theme-card.active {
        border-color: var(--vscode-textLink-foreground);
        box-shadow: 0 0 0 1px var(--vscode-textLink-foreground);
      }

      .theme-preview {
        width: 100%;
        aspect-ratio: 16 / 10;
        border-radius: 3px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .preview-titlebar {
        height: 10%;
      }
      .preview-body {
        flex: 1;
        display: flex;
      }
      .preview-sidebar {
        width: 25%;
      }
      .preview-editor {
        flex: 1;
        padding: 6% 8%;
        display: flex;
        flex-direction: column;
        gap: 8%;
      }
      .preview-line {
        height: 6%;
        border-radius: 2px;
      }
      .preview-statusbar {
        height: 8%;
      }

      .theme-name {
        font-size: 11px;
        color: var(--vscode-editor-foreground);
        text-align: center;
        line-height: 1.2;
      }

      .active-badge {
        position: absolute;
        top: 6px;
        right: 6px;
        width: 18px;
        height: 18px;
        border-radius: 50%;
        background: var(--vscode-textLink-foreground);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .active-badge svg {
        width: 12px;
        height: 12px;
      }

      .lang-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 8px 16px;
        border: 1px solid var(--vscode-panel-border);
        background-color: var(--vscode-button-secondaryBackground);
        color: var(--vscode-button-secondaryForeground);
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        transition: all 0.2s ease;
      }

      .lang-code {
        font-weight: 700;
        font-size: 11px;
        padding: 2px 4px;
        background-color: var(--code-inline-bg, rgba(255, 255, 255, 0.1));
        border-radius: 2px;
      }

      .lang-btn:hover {
        background-color: var(--vscode-button-secondaryHoverBackground);
      }

      .lang-btn.active {
        background-color: var(--vscode-button-background);
        color: var(--vscode-button-foreground);
        border-color: var(--vscode-button-background);
      }

      @media (max-width: 768px) {
        .code-editor {
          font-size: 13px;
        }

        .line-numbers {
          min-width: 35px;
          padding-right: 8px;
        }

        .line-number {
          padding: 0 4px;
        }

        .code-content {
          padding: 12px 16px;
        }
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

        .lang-btn {
          flex: 1;
        }

        .theme-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (max-width: 480px) {
        .code-editor {
          font-size: 12px;
        }

        .line-numbers {
          display: none;
        }

        .code-content {
          padding: 10px;
        }

        .settings-panel {
          padding: 12px;
        }

        .settings-title {
          font-size: 14px;
        }
      }
    `,
  ],
})
export class SettingsComponent {
  themeService = inject(ThemeService);
  i18n = inject(I18nService);

  themes = THEMES;
  lineNumbers = signal<number[]>([]);

  private previewColors: Record<
    string,
    {
      titlebar: string;
      sidebar: string;
      editor: string;
      statusbar: string;
      l1: string;
      l2: string;
      l3: string;
      l4: string;
    }
  > = {
    dark: {
      titlebar: '#3c3c3c',
      sidebar: '#252526',
      editor: '#1e1e1e',
      statusbar: '#007acc',
      l1: '#569cd6',
      l2: '#6a9955',
      l3: '#ce9178',
      l4: '#dcdcaa',
    },
    light: {
      titlebar: '#dddddd',
      sidebar: '#f3f3f3',
      editor: '#ffffff',
      statusbar: '#007acc',
      l1: '#0000ff',
      l2: '#008000',
      l3: '#a31515',
      l4: '#795e26',
    },
    monokai: {
      titlebar: '#1e1f1c',
      sidebar: '#21221e',
      editor: '#272822',
      statusbar: '#a6e22e',
      l1: '#f92672',
      l2: '#a6e22e',
      l3: '#e6db74',
      l4: '#66d9ef',
    },
    'github-dark': {
      titlebar: '#010409',
      sidebar: '#010409',
      editor: '#0d1117',
      statusbar: '#161b22',
      l1: '#ff7b72',
      l2: '#7ee787',
      l3: '#a5d6ff',
      l4: '#ffa657',
    },
    dracula: {
      titlebar: '#21222c',
      sidebar: '#21222c',
      editor: '#282a36',
      statusbar: '#6272a4',
      l1: '#ff79c6',
      l2: '#50fa7b',
      l3: '#f1fa8c',
      l4: '#bd93f9',
    },
    nord: {
      titlebar: '#2e3440',
      sidebar: '#2e3440',
      editor: '#3b4252',
      statusbar: '#5e81ac',
      l1: '#81a1c1',
      l2: '#a3be8c',
      l3: '#ebcb8b',
      l4: '#88c0d0',
    },
    'solarized-dark': {
      titlebar: '#00212b',
      sidebar: '#00212b',
      editor: '#002b36',
      statusbar: '#268bd2',
      l1: '#268bd2',
      l2: '#859900',
      l3: '#2aa198',
      l4: '#b58900',
    },
  };

  constructor() {
    this.lineNumbers.set(Array.from({ length: 10 }, (_, i) => i + 1));

    effect(() => {
      this.i18n.language();
      this.themeService.theme();
    });
  }

  getPreviewColor(themeId: string, part: string): string {
    return this.previewColors[themeId]?.[part as keyof (typeof this.previewColors)[string]] ?? '';
  }

  getLineWidth(lineClass: string): string {
    const widths: Record<string, string> = { l1: '60%', l2: '80%', l3: '45%', l4: '70%' };
    return widths[lineClass] ?? '50%';
  }

  setTheme(theme: Theme): void {
    this.themeService.setTheme(theme);
  }

  setLanguage(lang: Language): void {
    this.i18n.setLanguage(lang);
  }
}
