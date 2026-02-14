import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { slideInCode } from '../../core/animations/content-animations';
import { Experience } from '../../core/models/database.types';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { I18nService } from '../../core/services/i18n.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-experience',
  standalone: true,
  imports: [TranslatePipe],
  animations: [slideInCode],
  template: `
    <div class="code-editor" @slideInCode>
      @if (experiences().length > 0) {
        <div class="line-numbers">
          @for (line of lineNumbers(); track line) {
            <span class="line-number">{{ line }}</span>
          }
        </div>
      }
      <div class="code-content">
        @if (experiences().length === 0) {
          <div class="empty-state">
            <div class="empty-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
                <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
                <path d="M12 12v4" />
                <path d="M2 12h20" />
              </svg>
            </div>
            <h3 class="empty-title">
              {{ i18n.s('Próximamente...', 'Coming soon...') }}
            </h3>
            <p class="empty-message">
              <span class="comment"
                >// {{ i18n.s('Contenido en construcción', 'Content under construction') }}</span
              >
            </p>
          </div>
        } @else {
          <pre
            class="code"
          ><span class="comment"># {{ i18n.s('experience.yaml', 'experience.yaml') }}</span>
<span class="comment"># Professional Experience Timeline</span>

<span class="key">version</span><span class="punctuation">:</span> <span class="string">"1.0"</span>
<span class="key">lastUpdated</span><span class="punctuation">:</span> <span class="string">"{{ today }}"</span>

<span class="key">experiences</span><span class="punctuation">:</span>
@for (exp of experiences(); track exp.id; let i = $index) {
  <span class="punctuation">-</span> <span class="key">id</span><span class="punctuation">:</span> <span class="number">{{ i + 1 }}</span>
    <span class="key">company</span><span class="punctuation">:</span> <span class="string">"{{ exp.company }}"</span>
    <span class="key">position</span><span class="punctuation">:</span> <span class="string">"{{ exp.position | translate }}"</span>
    <span class="key">location</span><span class="punctuation">:</span> <span class="string">"@if (exp.location) {{{ exp.location | translate }}} @else {Remote}"</span>
    <span class="key">period</span><span class="punctuation">:</span>
      <span class="key">start</span><span class="punctuation">:</span> <span class="string">"{{ formatDate(exp.start_date) }}"</span>
      <span class="key">end</span><span class="punctuation">:</span> @if (exp.is_current) {<span class="keyword">Present</span>} @else {<span class="string">"{{ formatDate(exp.end_date) }}"</span>}
      <span class="key">isCurrent</span><span class="punctuation">:</span> <span class="keyword">{{ exp.is_current }}</span>
    <span class="key">description</span><span class="punctuation">:</span> <span class="punctuation">|</span>
      <span class="string">@if (exp.description) {{{ exp.description | translate }}} @else {No description available.}</span>
@if (exp.responsibilities && exp.responsibilities.length > 0) {
    <span class="key">responsibilities</span><span class="punctuation">:</span>
@for (resp of exp.responsibilities; track resp) {
      <span class="punctuation">-</span> <span class="string">"{{ resp | translate }}"</span>
}
}
@if (exp.tech_used && exp.tech_used.length > 0) {
    <span class="key">technologies</span><span class="punctuation">:</span>
@for (tech of exp.tech_used; track tech) {
      <span class="punctuation">-</span> <span class="string">"{{ tech }}"</span>
}
}
@if (exp.company_url) {
    <span class="key">companyUrl</span><span class="punctuation">:</span> <span class="string">"{{ exp.company_url }}"</span>
}

}
<span class="key">summary</span><span class="punctuation">:</span>
  <span class="key">totalPositions</span><span class="punctuation">:</span> <span class="number">{{ experiences().length }}</span>
  <span class="key">currentlyEmployed</span><span class="punctuation">:</span> <span class="keyword">{{ isCurrentlyEmployed() }}</span>
  <span class="key">yearsOfExperience</span><span class="punctuation">:</span> <span class="string">"{{ calculateTotalYears() }}+"</span>
</pre>
        }
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
      .key {
        color: var(--syntax-variable, #9cdcfe);
      }
      .string {
        color: var(--syntax-string, #ce9178);
      }
      .number {
        color: var(--syntax-number, #b5cea8);
      }
      .keyword {
        color: var(--syntax-keyword, #569cd6);
      }
      .punctuation {
        color: var(--syntax-punctuation, #d4d4d4);
      }
      .code-inline {
        color: var(--syntax-function, #dcdcaa);
        background-color: var(--code-inline-bg, rgba(255, 255, 255, 0.1));
        padding: 2px 6px;
        border-radius: 3px;
      }
      .link {
        color: var(--syntax-type, #4ec9b0);
        text-decoration: underline;
        cursor: pointer;
      }

      /* Empty State */
      .empty-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        padding: 40px 20px;
      }

      .empty-icon {
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
        color: var(--vscode-textLink-foreground, #3794ff);
      }

      .empty-icon svg {
        width: 100%;
        height: 100%;
      }

      .empty-title {
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-size: 18px;
        font-weight: 600;
        margin: 0 0 12px;
      }

      .empty-message {
        color: var(--vscode-descriptionForeground, #858585);
        font-size: 14px;
        line-height: 1.6;
        max-width: 500px;
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

      @media (max-width: 480px) {
        .code-editor {
          font-size: 12px;
          line-height: 1.5;
        }

        .line-numbers {
          display: none;
        }

        .code-content {
          padding: 10px;
        }

        .empty-state {
          min-height: 250px;
          padding: 24px 16px;
        }

        .empty-icon {
          width: 48px;
          height: 48px;
        }

        .empty-title {
          font-size: 16px;
        }

        .empty-message {
          font-size: 13px;
          max-width: 100%;
        }
      }
    `,
  ],
})
export class ExperienceComponent implements OnInit {
  supabase = inject(SupabaseService);
  i18n = inject(I18nService);

  experiences = signal<Experience[]>([]);
  lineNumbers = signal<number[]>([]);

  today = new Date().toISOString().split('T')[0];

  constructor() {
    // Regenerar números de línea cuando cambie el idioma
    effect(() => {
      this.i18n.language();
      this.updateLineNumbers();
    });
  }

  async ngOnInit(): Promise<void> {
    const experiences = await this.supabase.getExperiences();
    this.experiences.set(experiences);
    this.updateLineNumbers();
  }

  private updateLineNumbers(): void {
    // Generate line numbers
    const baseLines = 30;
    const expLines = this.experiences().length * 25;
    this.lineNumbers.set(Array.from({ length: baseLines + expLines }, (_, i) => i + 1));
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'N/A';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  isCurrentlyEmployed(): boolean {
    return this.experiences().some((e) => e.is_current);
  }

  calculateTotalYears(): number {
    const exps = this.experiences();
    if (exps.length === 0) return 0;

    let totalMonths = 0;
    for (const exp of exps) {
      const start = new Date(exp.start_date);
      const end = exp.is_current ? new Date() : exp.end_date ? new Date(exp.end_date) : new Date();
      const months =
        (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
      totalMonths += months;
    }
    return Math.floor(totalMonths / 12);
  }
}
