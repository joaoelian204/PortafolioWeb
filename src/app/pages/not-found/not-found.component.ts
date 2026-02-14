import { Component, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { Router } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-not-found',
  standalone: true,
  template: `
    <div class="error-page">
      <div class="error-editor">
        <div class="editor-header">
          <div class="tab error-tab">
            <svg viewBox="0 0 24 24" fill="currentColor" class="tab-icon">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" stroke="white" stroke-width="2" />
              <line x1="9" y1="9" x2="15" y2="15" stroke="white" stroke-width="2" />
            </svg>
            <span>error_404.ts</span>
            <span class="unsaved-dot">●</span>
          </div>
        </div>

        <div class="editor-body">
          <div class="line-numbers">
            @for (line of [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]; track line) {
              <span class="line-number" [class.error-line]="line === 7">{{ line }}</span>
            }
          </div>
          <div class="code-content">
            <pre
              class="code"
            ><span class="keyword">import</span> <span class="punctuation">&#123;</span> <span class="type">HttpError</span> <span class="punctuation">&#125;</span> <span class="keyword">from</span> <span class="string">'&#64;portfolio/core'</span><span class="punctuation">;</span>

<span class="keyword">class</span> <span class="type">PageNotFoundError</span> <span class="keyword">extends</span> <span class="type">HttpError</span> <span class="punctuation">&#123;</span>
  <span class="variable">statusCode</span> <span class="operator">=</span> <span class="number">404</span><span class="punctuation">;</span>
  <span class="variable">message</span> <span class="operator">=</span> <span class="string">"{{ i18n.s('La página que buscas no existe', 'The page you are looking for does not exist') }}"</span><span class="punctuation">;</span>

  <span class="error-highlight"><span class="function">resolve</span><span class="punctuation">()</span><span class="punctuation">:</span> <span class="type">never</span> <span class="punctuation">&#123;</span></span>
    <span class="keyword">throw new</span> <span class="type">Error</span><span class="punctuation">(</span><span class="string">'Route "' + location.pathname + '" not found'</span><span class="punctuation">)</span><span class="punctuation">;</span>
  <span class="punctuation">&#125;</span>
<span class="punctuation">&#125;</span>

<span class="comment">// {{ i18n.s('¿Quizás quisiste ir a una de estas rutas?', 'Perhaps you meant one of these routes?') }}</span>
<span class="comment">// → /about, /skills, /projects, /experience, /contact</span>

<span class="keyword">export default new</span> <span class="type">PageNotFoundError</span><span class="punctuation">();</span>
</pre>
          </div>
        </div>

        <!-- Problems Panel -->
        <div class="problems-panel">
          <div class="problems-header">
            <svg viewBox="0 0 16 16" fill="currentColor" class="problems-icon">
              <path
                d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm-.5-9h1v5h-1V5zm0 6h1v1h-1v-1z"
              />
            </svg>
            <span>{{ i18n.s('PROBLEMAS', 'PROBLEMS') }}</span>
            <span class="badge">1</span>
          </div>
          <div class="problems-list">
            <div class="problem-item">
              <svg viewBox="0 0 16 16" fill="currentColor" class="error-icon">
                <path
                  d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm-.5-9h1v5h-1V5zm0 6h1v1h-1v-1z"
                />
              </svg>
              <span class="problem-text">
                {{ i18n.s('Error 404: Ruta no encontrada', 'Error 404: Route not found') }} —
                <span class="problem-source">error_404.ts</span>
                [Ln 7, Col 3]
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Action buttons -->
      <div class="actions">
        <button class="action-btn primary" (click)="goHome()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
          {{ i18n.s('Ir al Inicio', 'Go Home') }}
        </button>
        <button class="action-btn secondary" (click)="goBack()">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          {{ i18n.s('Volver', 'Go Back') }}
        </button>
      </div>

      <p class="redirect-text">
        {{ i18n.s('Redirigiendo en', 'Redirecting in') }} {{ countdown() }}s...
      </p>
    </div>
  `,
  styles: [
    `
      .error-page {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 100%;
        padding: 32px 16px;
        animation: fadeInUp 0.5s ease-out;
      }

      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .error-editor {
        width: 100%;
        max-width: 680px;
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 6px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      }

      .editor-header {
        background: var(--vscode-editorGroupHeader-tabsBackground, #252526);
        display: flex;
        height: 35px;
        border-bottom: 1px solid var(--vscode-tab-border, #252526);
      }

      .tab {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 12px;
        font-size: 13px;
        background: var(--vscode-tab-activeBackground, #1e1e1e);
        color: var(--vscode-tab-activeForeground, #fff);
        border-top: 2px solid var(--syntax-error, #f48771);
      }

      .tab-icon {
        width: 16px;
        height: 16px;
        color: var(--syntax-error, #f48771);
      }

      .unsaved-dot {
        color: #e8e8e8;
        font-size: 18px;
        line-height: 1;
      }

      .editor-body {
        display: flex;
        background: var(--vscode-editor-background, #1e1e1e);
        padding: 12px 0;
        font-family: 'Fira Code', 'Consolas', 'Monaco', monospace;
        font-size: 14px;
        line-height: 1.6;
      }

      .line-numbers {
        display: flex;
        flex-direction: column;
        padding: 0 16px 0 8px;
        color: var(--vscode-editorLineNumber-foreground, #858585);
        text-align: right;
        user-select: none;
        min-width: 50px;
      }

      .line-number {
        position: relative;
      }

      .line-number.error-line {
        color: var(--syntax-error, #f48771);
      }

      .line-number.error-line::after {
        content: '';
        position: absolute;
        right: -8px;
        top: 50%;
        transform: translateY(-50%);
        width: 0;
        height: 0;
        border-left: 5px solid var(--syntax-error, #f48771);
        border-top: 4px solid transparent;
        border-bottom: 4px solid transparent;
      }

      .code-content {
        flex: 1;
        overflow-x: auto;
        padding-left: 8px;
      }

      .code {
        margin: 0;
        white-space: pre-wrap;
        word-wrap: break-word;
      }

      .keyword {
        color: var(--syntax-keyword, #569cd6);
      }
      .type {
        color: var(--syntax-type, #4ec9b0);
      }
      .string {
        color: var(--syntax-string, #ce9178);
      }
      .number {
        color: var(--syntax-number, #b5cea8);
      }
      .function {
        color: var(--syntax-function, #dcdcaa);
      }
      .variable {
        color: var(--syntax-variable, #9cdcfe);
      }
      .operator {
        color: var(--syntax-punctuation, #d4d4d4);
      }
      .punctuation {
        color: var(--syntax-punctuation, #d4d4d4);
      }
      .comment {
        color: var(--syntax-comment, #6a9955);
      }

      .error-highlight {
        background: rgba(255, 0, 0, 0.15);
        display: inline;
        border-left: 3px solid var(--syntax-error, #f48771);
        padding-left: 4px;
        margin-left: -7px;
      }

      /* Problems Panel */
      .problems-panel {
        border-top: 1px solid var(--vscode-panel-border, #3c3c3c);
        background: var(--vscode-panel-background, #1e1e1e);
      }

      .problems-header {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        font-size: 11px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        color: var(--vscode-descriptionForeground, #858585);
        border-bottom: 1px solid var(--vscode-panel-border, #3c3c3c);
      }

      .problems-icon {
        width: 14px;
        height: 14px;
      }

      .badge {
        background: var(--syntax-error, #f48771);
        color: #fff;
        font-size: 10px;
        padding: 1px 6px;
        border-radius: 10px;
        font-weight: 600;
      }

      .problems-list {
        padding: 6px 12px;
      }

      .problem-item {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        color: var(--vscode-editor-foreground, #d4d4d4);
        padding: 3px 0;
      }

      .error-icon {
        width: 14px;
        height: 14px;
        color: var(--syntax-error, #f48771);
        flex-shrink: 0;
      }

      .problem-source {
        color: var(--vscode-descriptionForeground, #858585);
      }

      /* Actions */
      .actions {
        display: flex;
        gap: 12px;
        margin-top: 24px;
      }

      .action-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 20px;
        border: 1px solid transparent;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.15s ease;
      }

      .action-btn svg {
        width: 16px;
        height: 16px;
      }

      .action-btn.primary {
        background: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #fff);
      }

      .action-btn.primary:hover {
        background: var(--vscode-button-hoverBackground, #1177bb);
      }

      .action-btn.secondary {
        background: var(--vscode-button-secondaryBackground, #3a3d41);
        color: var(--vscode-button-secondaryForeground, #fff);
      }

      .action-btn.secondary:hover {
        background: var(--vscode-button-secondaryHoverBackground, #45494e);
      }

      .redirect-text {
        margin-top: 16px;
        font-size: 12px;
        color: var(--vscode-descriptionForeground, #858585);
        animation: pulse 2s ease-in-out infinite;
      }

      @keyframes pulse {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0.5;
        }
      }

      @media (max-width: 600px) {
        .error-editor {
          border-radius: 0;
        }
        .editor-body {
          font-size: 12px;
        }
        .problem-text {
          font-size: 11px;
        }
      }
    `,
  ],
})
export class NotFoundComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  i18n = inject(I18nService);

  countdown = signal(10);
  private timer: ReturnType<typeof setInterval> | null = null;

  ngOnInit(): void {
    this.timer = setInterval(() => {
      this.countdown.update((v) => v - 1);
      if (this.countdown() <= 0) {
        this.goHome();
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timer) clearInterval(this.timer);
  }

  goHome(): void {
    if (this.timer) clearInterval(this.timer);
    this.router.navigate(['/']);
  }

  goBack(): void {
    if (this.timer) clearInterval(this.timer);
    window.history.back();
  }
}
