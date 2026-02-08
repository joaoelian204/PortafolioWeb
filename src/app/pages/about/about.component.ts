import { Component, inject, OnInit, signal } from '@angular/core';
import { ProfileInfo } from '../../core/models/database.types';
import { I18nService } from '../../core/services/i18n.service';
import { SupabaseService } from '../../core/services/supabase.service';

@Component({
  selector: 'app-about',
  standalone: true,
  template: `
    <div class="code-editor">
      <div class="line-numbers">
        @for (line of lineNumbers(); track line) {
          <span class="line-number">{{ line }}</span>
        }
      </div>
      <div class="code-content">
        <div class="markdown-content">
          <span class="comment"># about.md</span>

          <h1 class="heading">
            {{ profile()?.name || (i18n.language() === 'es' ? 'Acerca de Mí' : 'About Me') }}
          </h1>

          <h2 class="subheading">
            {{
              profile()?.title ||
                (i18n.language() === 'es' ? 'Desarrollador de Software' : 'Software Developer')
            }}
          </h2>

          <div class="divider">---</div>

          <p class="text">
            {{
              profile()?.bio ||
                (i18n.language() === 'es'
                  ? 'Un desarrollador apasionado creando experiencias digitales increíbles.'
                  : 'A passionate developer building amazing digital experiences.')
            }}
          </p>

          <h2 class="subheading">
            <svg
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {{ i18n.language() === 'es' ? 'Ubicación' : 'Location' }}
          </h2>

          <p class="text">
            {{ profile()?.location || (i18n.language() === 'es' ? 'Remoto' : 'Remote') }}
          </p>

          <h2 class="subheading">
            <svg
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M9 21h6" />
              <path d="M9 18h6" />
              <path
                d="M10 18V14.5c0-.83-.67-1.5-1.5-1.5S7 13.17 7 12.5C7 9.46 9.46 7 12.5 7S18 9.46 18 12.5c0 .83-.67 1.5-1.5 1.5s-1.5.67-1.5 1.5V18"
              />
              <path d="M12 2v1" />
              <path d="M4.22 4.22l.71.71" />
              <path d="M19.07 4.93l-.71.71" />
              <path d="M2 12h1" />
              <path d="M21 12h1" />
            </svg>
            {{ i18n.language() === 'es' ? 'Filosofía' : 'Philosophy' }}
          </h2>

          <blockquote class="blockquote">
            "{{
              i18n.language() === 'es'
                ? 'El código limpio siempre parece escrito por alguien que se preocupa.'
                : 'Clean code always looks like it was written by someone who cares.'
            }}"
            <footer>— Robert C. Martin</footer>
          </blockquote>

          <p class="text">
            {{
              i18n.language() === 'es'
                ? 'Creo en escribir código que sea:'
                : 'I believe in writing code that is:'
            }}
          </p>

          <ul class="list">
            <li>
              <svg
                class="icon-sm"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polygon
                  points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                />
              </svg>
              <strong>{{ i18n.language() === 'es' ? 'Limpio' : 'Clean' }}</strong> -
              {{
                i18n.language() === 'es'
                  ? 'Fácil de leer y entender'
                  : 'Easy to read and understand'
              }}
            </li>
            <li>
              <svg
                class="icon-sm"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
                />
              </svg>
              <strong>{{ i18n.language() === 'es' ? 'Mantenible' : 'Maintainable' }}</strong> -
              {{
                i18n.language() === 'es'
                  ? 'Simple de modificar y extender'
                  : 'Simple to modify and extend'
              }}
            </li>
            <li>
              <svg
                class="icon-sm"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
              </svg>
              <strong>{{ i18n.language() === 'es' ? 'Eficiente' : 'Performant' }}</strong> -
              {{
                i18n.language() === 'es'
                  ? 'Optimizado para velocidad y eficiencia'
                  : 'Optimized for speed and efficiency'
              }}
            </li>
            <li>
              <svg
                class="icon-sm"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="4" r="2" />
                <path d="M12 6v6" />
                <path d="M8 10h8" />
                <path d="M10 12l-2 8" />
                <path d="M14 12l2 8" />
              </svg>
              <strong>{{ i18n.language() === 'es' ? 'Accesible' : 'Accessible' }}</strong> -
              {{ i18n.language() === 'es' ? 'Usable por todos' : 'Usable by everyone' }}
            </li>
          </ul>

          <h2 class="subheading">
            <svg
              class="icon"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="6" />
              <circle cx="12" cy="12" r="2" />
            </svg>
            {{ i18n.language() === 'es' ? 'Enfoque Actual' : 'Current Focus' }}
          </h2>

          <ul class="list">
            <li>
              <svg
                class="icon-sm"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path
                  d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"
                />
              </svg>
              {{
                i18n.language() === 'es'
                  ? 'Construyendo aplicaciones web escalables'
                  : 'Building scalable web applications'
              }}
            </li>
            <li>
              <svg
                class="icon-sm"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
                <line x1="12" y1="18" x2="12.01" y2="18" />
              </svg>
              {{
                i18n.language() === 'es'
                  ? 'Creando interfaces responsivas'
                  : 'Creating responsive user interfaces'
              }}
            </li>
            <li>
              <svg
                class="icon-sm"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" />
              </svg>
              {{
                i18n.language() === 'es'
                  ? 'Implementando pipelines CI/CD'
                  : 'Implementing CI/CD pipelines'
              }}
            </li>
            <li>
              <svg
                class="icon-sm"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
              </svg>
              {{
                i18n.language() === 'es'
                  ? 'Aprendiendo nuevas tecnologías'
                  : 'Learning new technologies'
              }}
            </li>
          </ul>

          <div class="divider">---</div>

          <p class="comment">
            *{{ i18n.language() === 'es' ? 'Última actualización' : 'Last updated' }}: {{ today }}*
          </p>
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

      .markdown-content {
        max-width: 800px;
      }

      .comment {
        color: #6a9955;
        display: block;
        margin-bottom: 16px;
      }

      .heading {
        color: #569cd6;
        font-size: 1.8em;
        font-weight: bold;
        margin: 0 0 8px 0;
      }

      .subheading {
        color: #4ec9b0;
        font-size: 1.3em;
        font-weight: bold;
        margin: 24px 0 12px 0;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .icon {
        width: 22px;
        height: 22px;
        color: #4ec9b0;
        flex-shrink: 0;
      }

      .icon-sm {
        width: 16px;
        height: 16px;
        color: #569cd6;
        vertical-align: middle;
        margin-right: 6px;
        flex-shrink: 0;
      }

      .text {
        color: #d4d4d4;
        margin: 8px 0;
      }

      .list {
        color: #d4d4d4;
        padding-left: 20px;
        margin: 8px 0;
      }

      .list li {
        margin: 6px 0;
      }

      .list strong {
        color: #dcdcaa;
      }

      .blockquote {
        color: #ce9178;
        font-style: italic;
        border-left: 3px solid #ce9178;
        padding-left: 16px;
        margin: 16px 0;
      }

      .blockquote footer {
        margin-top: 8px;
        font-size: 0.9em;
        opacity: 0.8;
      }

      .divider {
        color: #808080;
        margin: 16px 0;
      }
    `,
  ],
})
export class AboutComponent implements OnInit {
  private supabase = inject(SupabaseService);
  i18n = inject(I18nService);

  profile = signal<ProfileInfo | null>(null);
  lineNumbers = signal<number[]>([]);

  today = new Date().toISOString().split('T')[0];

  async ngOnInit(): Promise<void> {
    const profileData = await this.supabase.getProfile();
    this.profile.set(profileData);
    this.lineNumbers.set(Array.from({ length: 40 }, (_, i) => i + 1));
  }
}
