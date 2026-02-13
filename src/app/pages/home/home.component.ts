import { Component, effect, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ProfileInfo } from '../../core/models/database.types';
import { I18nService } from '../../core/services/i18n.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-home',
  standalone: true,
  template: `
    <div class="code-editor">
      <div class="line-numbers">
        @for (line of lineNumbers(); track line) {
          <span class="line-number">{{ line }}</span>
        }
      </div>
      <div class="code-content">
        <pre class="code"><span class="comment"># README.md</span>

<span class="comment"># {{ profile()?.name || 'Portfolio' }}</span>

<span class="punctuation">---</span>

<span class="heading">## {{ i18n.s('¡Bienvenido!', 'Welcome!') }}</span>

<span class="text typewriter">{{ displayedText() }}<span class="cursor" [class.blink]="!isTyping()">|</span></span>

<span class="heading">## {{ i18n.s('Navegación', 'Navigation') }}</span>

<span class="text">{{ i18n.s('Haz clic en los archivos del explorador para navegar.', 'Click on files in the explorer to navigate.') }}</span>

<span class="list">- <span class="file">about.md</span> - {{ i18n.s('Conoce más sobre mí', 'Learn more about me') }}</span>
<span class="list">- <span class="file">skills.ts</span> - {{ i18n.s('Mis habilidades técnicas', 'My technical skills') }}</span>
<span class="list">- <span class="file">projects.tsx</span> - {{ i18n.s('Proyectos destacados', 'Featured projects') }}</span>
<span class="list">- <span class="file">experience.yaml</span> - {{ i18n.s('Experiencia laboral', 'Work experience') }}</span>
<span class="list">- <span class="file">contact.tsx</span> - {{ i18n.s('Formulario de contacto y mis redes sociales', 'Contact form and my social links') }}</span>

<span class="heading">## {{ i18n.s('Configuración', 'Settings') }}</span>

<span class="list">- <span class="file">settings.json</span> - {{ i18n.s('Cambiar tema e idioma', 'Change theme and language') }}</span>

<span class="punctuation">---</span>

<span class="comment">// Built with Angular & Supabase</span>
<span class="comment">// Theme: VS Code Dark+</span>
</pre>
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

      .heading {
        color: #569cd6;
        font-weight: bold;
      }

      .text {
        color: #d4d4d4;
      }

      .list {
        color: #d4d4d4;
      }

      .link {
        color: #4ec9b0;
        text-decoration: underline;
        cursor: pointer;
      }

      .file {
        color: #ce9178;
      }

      .code-inline {
        color: #dcdcaa;
        background-color: rgba(255, 255, 255, 0.1);
        padding: 2px 6px;
        border-radius: 3px;
      }

      .punctuation {
        color: #808080;
      }

      /* Typewriter effect */
      .typewriter {
        display: inline;
      }

      .cursor {
        color: var(--vscode-editorCursor-foreground, #aeafad);
        font-weight: 100;
      }

      .cursor.blink {
        animation: blink 1s step-end infinite;
      }

      @keyframes blink {
        0%,
        100% {
          opacity: 1;
        }
        50% {
          opacity: 0;
        }
      }
    `,
  ],
})
export class HomeComponent implements OnInit, OnDestroy {
  private supabase = inject(SupabaseService);
  i18n = inject(I18nService);

  profile = signal<ProfileInfo | null>(null);
  lineNumbers = signal<number[]>([]);
  displayedText = signal('');
  isTyping = signal(false);

  private typingTimer: ReturnType<typeof setTimeout> | null = null;
  private fullText = '';

  constructor() {
    effect(() => {
      this.i18n.language();
      this.updateLineNumbers();
      this.startTypewriter();
    });
  }

  async ngOnInit(): Promise<void> {
    const profileData = await this.supabase.getProfile();
    this.profile.set(profileData);
    this.updateLineNumbers();
    this.startTypewriter();
  }

  ngOnDestroy(): void {
    this.clearTyping();
  }

  private startTypewriter(): void {
    this.clearTyping();
    this.fullText = this.i18n.s(
      'Gracias por visitar mi portafolio. Aquí encontrarás información sobre mí, mis habilidades, proyectos y experiencia.',
      'Thanks for visiting my portfolio. Here you will find information about me, my skills, projects, and experience.',
    );
    this.displayedText.set('');
    this.isTyping.set(true);
    this.typeChar(0);
  }

  private typeChar(index: number): void {
    if (index >= this.fullText.length) {
      this.isTyping.set(false);
      return;
    }

    this.displayedText.set(this.fullText.substring(0, index + 1));

    const char = this.fullText[index];
    const delay = char === '.' || char === ',' ? 120 : 25 + Math.random() * 30;

    this.typingTimer = setTimeout(() => this.typeChar(index + 1), delay);
  }

  private clearTyping(): void {
    if (this.typingTimer) {
      clearTimeout(this.typingTimer);
      this.typingTimer = null;
    }
  }

  private updateLineNumbers(): void {
    this.lineNumbers.set(Array.from({ length: 25 }, (_, i) => i + 1));
  }
}
