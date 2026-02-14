import { Component, inject, OnInit, signal, ViewChild } from '@angular/core';
import { fadeInUp, staggerList } from '../../core/animations/content-animations';
import { ProfileInfo } from '../../core/models/database.types';
import { TranslatePipe } from '../../core/pipes/translate.pipe';
import { I18nService } from '../../core/services/i18n.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { CvDownloadModalComponent } from '../../shared/cv-download-modal/cv-download-modal.component';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CvDownloadModalComponent, TranslatePipe],
  animations: [fadeInUp, staggerList],
  template: `
    <div class="code-editor" @fadeInUp>
      <div class="line-numbers">
        @for (line of lineNumbers(); track line) {
          <span class="line-number">{{ line }}</span>
        }
      </div>
      <div class="code-content">
        <div class="markdown-content" @staggerList>
          <!-- Nombre del archivo -->
          <div class="md-line">
            <span class="comment"> &lt;!-- about.md --&gt; </span>
          </div>

          <div class="md-line blank">&nbsp;</div>

          <!-- ═══ Título principal ═══ -->
          <div class="md-line">
            <span class="heading-marker">#</span>
            <span class="heading">
              {{ profile()?.name || i18n.s('Acerca de Mí', 'About Me') }}
            </span>
          </div>

          <div class="md-line blank">&nbsp;</div>

          <!-- Subtítulo / Rol -->
          <div class="md-line">
            <span class="heading-marker">##</span>
            <span class="subheading">
              <svg
                class="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4-4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <path d="M20 8v6M23 11h-6" />
              </svg>
              @if (profile()?.title) {
                {{ profile()!.title | translate }}
              } @else {
                {{ i18n.s('Desarrollador de Software', 'Software Developer') }}
              }
            </span>
          </div>

          <div class="md-line blank">&nbsp;</div>
          <div class="md-line"><span class="divider">---</span></div>
          <div class="md-line blank">&nbsp;</div>

          <!-- ═══ Bio ═══ -->
          <div class="md-line">
            <span class="heading-marker">##</span>
            <span class="subheading">
              <svg
                class="icon"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              {{ i18n.s('Sobre Mí', 'About Me') }}
            </span>
          </div>

          <div class="md-line blank">&nbsp;</div>

          <div class="md-line text-line">
            @if (profile()?.bio) {
              {{ profile()!.bio | translate }}
            } @else {
              {{
                i18n.s(
                  'Un desarrollador apasionado creando experiencias digitales increíbles.',
                  'A passionate developer building amazing digital experiences.'
                )
              }}
            }
          </div>

          <div class="md-line blank">&nbsp;</div>

          <!-- ═══ Ubicación ═══ -->
          <div class="md-line">
            <span class="heading-marker">##</span>
            <span class="subheading">
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
              {{ i18n.s('Ubicación', 'Location') }}
            </span>
          </div>

          <div class="md-line blank">&nbsp;</div>

          <div class="md-line text-line">
            <svg
              class="icon-sm"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
            @if (profile()?.location) {
              {{ profile()!.location | translate }}
            } @else {
              {{ i18n.s('Remoto', 'Remote') }}
            }
          </div>

          <div class="md-line blank">&nbsp;</div>
          <div class="md-line"><span class="divider">---</span></div>
          <div class="md-line blank">&nbsp;</div>

          <!-- ═══ Filosofía ═══ -->
          <div class="md-line">
            <span class="heading-marker">##</span>
            <span class="subheading">
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
              </svg>
              {{ i18n.s('Filosofía', 'Philosophy') }}
            </span>
          </div>

          <div class="md-line blank">&nbsp;</div>

          <div class="md-line blockquote">
            <span class="blockquote-marker">&gt;</span>
            <span class="blockquote-text">
              "{{
                i18n.s(
                  'El código limpio siempre parece escrito por alguien que se preocupa.',
                  'Clean code always looks like it was written by someone who cares.'
                )
              }}"
            </span>
          </div>
          <div class="md-line blockquote">
            <span class="blockquote-marker">&gt;</span>
            <span class="blockquote-footer">— Robert C. Martin</span>
          </div>

          <div class="md-line blank">&nbsp;</div>

          <div class="md-line text-line">
            {{ i18n.s('Creo en escribir código que sea:', 'I believe in writing code that is:') }}
          </div>

          <div class="md-line blank">&nbsp;</div>

          <div class="md-line list-item">
            <span class="list-marker">-</span>
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
            <strong>{{ i18n.s('Limpio', 'Clean') }}</strong>
            <span class="list-desc">{{
              i18n.s('Fácil de leer y entender', 'Easy to read and understand')
            }}</span>
          </div>
          <div class="md-line list-item">
            <span class="list-marker">-</span>
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
            <strong>{{ i18n.s('Mantenible', 'Maintainable') }}</strong>
            <span class="list-desc">{{
              i18n.s('Simple de modificar y extender', 'Simple to modify and extend')
            }}</span>
          </div>
          <div class="md-line list-item">
            <span class="list-marker">-</span>
            <svg
              class="icon-sm"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
            >
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
            <strong>{{ i18n.s('Eficiente', 'Performant') }}</strong>
            <span class="list-desc">{{
              i18n.s('Optimizado para velocidad y eficiencia', 'Optimized for speed and efficiency')
            }}</span>
          </div>
          <div class="md-line list-item">
            <span class="list-marker">-</span>
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
            <strong>{{ i18n.s('Accesible', 'Accessible') }}</strong>
            <span class="list-desc">{{ i18n.s('Usable por todos', 'Usable by everyone') }}</span>
          </div>

          <div class="md-line blank">&nbsp;</div>
          <div class="md-line"><span class="divider">---</span></div>
          <div class="md-line blank">&nbsp;</div>

          <!-- ═══ Enfoque Actual ═══ -->
          <div class="md-line">
            <span class="heading-marker">##</span>
            <span class="subheading">
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
              {{ i18n.s('Enfoque Actual', 'Current Focus') }}
            </span>
          </div>

          <div class="md-line blank">&nbsp;</div>

          <div class="md-line list-item">
            <span class="list-marker">-</span>
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
            <span class="list-text">{{
              i18n.s(
                'Construyendo aplicaciones web escalables',
                'Building scalable web applications'
              )
            }}</span>
          </div>
          <div class="md-line list-item">
            <span class="list-marker">-</span>
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
            <span class="list-text">{{
              i18n.s('Creando interfaces responsivas', 'Creating responsive user interfaces')
            }}</span>
          </div>
          <div class="md-line list-item">
            <span class="list-marker">-</span>
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
            <span class="list-text">{{
              i18n.s('Implementando pipelines CI/CD', 'Implementing CI/CD pipelines')
            }}</span>
          </div>
          <div class="md-line list-item">
            <span class="list-marker">-</span>
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
            <span class="list-text">{{
              i18n.s('Aprendiendo nuevas tecnologías', 'Learning new technologies')
            }}</span>
          </div>

          <div class="md-line blank">&nbsp;</div>
          <div class="md-line"><span class="divider">---</span></div>
          <div class="md-line blank">&nbsp;</div>

          <!-- ═══ CV Download ═══ -->
          <div class="md-line">
            <span class="heading-marker">##</span>
            <span class="subheading">
              <svg
                class="icon"
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
              {{ i18n.s('Currículum', 'Resume') }}
            </span>
          </div>

          <div class="md-line blank">&nbsp;</div>

          <div class="md-line">
            <button class="cv-download-btn" (click)="openCvModal()">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              {{ i18n.s('Descargar CV', 'Download CV') }}
            </button>
          </div>

          <div class="md-line blank">&nbsp;</div>
          <div class="md-line"><span class="divider">---</span></div>
          <div class="md-line blank">&nbsp;</div>

          <!-- Footer -->
          <div class="md-line">
            <span class="comment">
              *{{ i18n.s('Última actualización', 'Last updated') }}: {{ today }}*
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- CV Download Modal -->
    <app-cv-download-modal #cvModal [cvUrl]="profile()?.resume_url || ''" />
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

      /* ── Líneas del markdown ── */
      .md-line {
        min-height: 22px;
        display: flex;
        align-items: baseline;
        gap: 6px;
      }

      .md-line.blank {
        opacity: 0;
      }

      /* ── Comentario ── */
      .comment {
        color: var(--syntax-comment, #6a9955);
        font-style: italic;
      }

      /* ── Heading markers (# ##) ── */
      .heading-marker {
        color: var(--syntax-keyword, #569cd6);
        font-weight: bold;
        flex-shrink: 0;
      }

      /* ── Títulos ── */
      .heading {
        color: var(--syntax-keyword, #569cd6);
        font-size: 1.8em;
        font-weight: bold;
        line-height: 1.3;
      }

      .subheading {
        color: var(--syntax-type, #4ec9b0);
        font-size: 1.2em;
        font-weight: bold;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }

      /* ── Iconos ── */
      .icon {
        width: 20px;
        height: 20px;
        color: var(--syntax-type, #4ec9b0);
        flex-shrink: 0;
      }

      .icon-sm {
        width: 15px;
        height: 15px;
        color: var(--syntax-keyword, #569cd6);
        flex-shrink: 0;
      }

      /* ── Texto ── */
      .text-line {
        color: var(--vscode-editor-foreground, #d4d4d4);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      /* ── Divider ── */
      .divider {
        color: var(--syntax-punctuation, #d4d4d4);
        opacity: 0.5;
      }

      /* ── Blockquote ── */
      .md-line.blockquote {
        padding-left: 8px;
        border-left: 3px solid var(--syntax-string, #ce9178);
      }

      .blockquote-marker {
        color: var(--syntax-string, #ce9178);
        font-weight: bold;
        flex-shrink: 0;
      }

      .blockquote-text {
        color: var(--syntax-string, #ce9178);
        font-style: italic;
      }

      .blockquote-footer {
        color: var(--syntax-comment, #6a9955);
        font-size: 0.9em;
      }

      /* ── Listas ── */
      .md-line.list-item {
        padding-left: 16px;
        display: flex;
        align-items: center;
        gap: 8px;
        margin: 2px 0;
      }

      .list-marker {
        color: var(--syntax-keyword, #569cd6);
        font-weight: bold;
        flex-shrink: 0;
      }

      .md-line.list-item strong {
        color: var(--syntax-function, #dcdcaa);
      }

      .list-desc {
        color: var(--vscode-editor-foreground, #d4d4d4);
        opacity: 0.85;
      }

      .list-desc::before {
        content: '— ';
        color: var(--syntax-punctuation, #d4d4d4);
        opacity: 0.6;
      }

      .list-text {
        color: var(--vscode-editor-foreground, #d4d4d4);
      }

      /* ── CV Download ── */
      .cv-download-btn {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 22px;
        background-color: var(--vscode-button-background, #0e639c);
        color: var(--vscode-button-foreground, #ffffff);
        border: none;
        border-radius: 6px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .cv-download-btn:hover {
        background-color: var(--vscode-button-hoverBackground, #1177bb);
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(14, 99, 156, 0.4);
      }

      .cv-download-btn svg {
        width: 18px;
        height: 18px;
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

        .heading {
          font-size: 1.5em;
        }

        .subheading {
          font-size: 1.1em;
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

        .heading {
          font-size: 1.3em;
        }

        .md-line.list-item {
          padding-left: 8px;
        }

        .cv-download-btn {
          padding: 8px 16px;
          font-size: 12px;
        }
      }
    `,
  ],
})
export class AboutComponent implements OnInit {
  @ViewChild('cvModal') cvModal!: CvDownloadModalComponent;

  private supabase = inject(SupabaseService);
  i18n = inject(I18nService);

  profile = signal<ProfileInfo | null>(null);
  lineNumbers = signal<number[]>([]);

  today = new Date().toISOString().split('T')[0];

  async ngOnInit(): Promise<void> {
    const profileData = await this.supabase.getProfile();
    this.profile.set(profileData);
    this.lineNumbers.set(Array.from({ length: 45 }, (_, i) => i + 1));
  }

  openCvModal(): void {
    this.cvModal.open();
  }
}
