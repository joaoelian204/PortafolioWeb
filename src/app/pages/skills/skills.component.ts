import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { Skill } from '../../core/models/database.types';
import { I18nService } from '../../core/services/i18n.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { TechIconsService } from '../../core/services/tech-icons.service';

@Component({
  selector: 'app-skills',
  standalone: true,
  template: `
    <div class="skills-page">
      <div class="skills-header">
        <h1 class="page-title">{{ i18n.s('skills.ts', 'skills.ts') }}</h1>
        <p class="page-subtitle">
          {{
            i18n.s(
              'Tecnologías y herramientas con las que trabajo',
              'Technologies and tools I work with'
            )
          }}
        </p>
      </div>

      @if (allSkills().length === 0) {
        <div class="empty-state">
          <div class="empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M16 18l6-6-6-6" />
              <path d="M8 6l-6 6 6 6" />
            </svg>
          </div>
          <h3 class="empty-title">
            {{ i18n.s('Próximamente...', 'Coming soon...') }}
          </h3>
          <p class="empty-message">
            {{ i18n.s('Contenido en construcción', 'Content under construction') }}
          </p>
        </div>
      } @else {
        <div class="skills-container">
          <!-- Lenguajes de Programación -->
          @if (languageSkills().length > 0) {
            <section class="skill-section">
              <div class="section-header">
                <svg
                  class="section-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <polyline points="16 18 22 12 16 6" />
                  <polyline points="8 6 2 12 8 18" />
                </svg>
                <h2 class="section-title">
                  {{ i18n.s('Lenguajes de Programación', 'Programming Languages') }}
                </h2>
              </div>
              <div class="skills-grid">
                @for (skill of languageSkills(); track skill.id) {
                  <div class="skill-card" [class.featured]="skill.is_featured">
                    @if (getSkillIcon(skill.label)) {
                      <img
                        class="skill-icon-img"
                        [src]="getSkillIcon(skill.label)"
                        [alt]="skill.label"
                      />
                    } @else {
                      <span class="skill-icon-fallback">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="16 18 22 12 16 6"></polyline>
                          <polyline points="8 6 2 12 8 18"></polyline>
                        </svg>
                      </span>
                    }
                    <span class="skill-name">{{ skill.label }}</span>
                    @if (skill.is_featured) {
                      <span class="featured-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                          <polygon
                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                          />
                        </svg>
                      </span>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <!-- Frameworks y Librerías -->
          @if (frameworkSkills().length > 0) {
            <section class="skill-section">
              <div class="section-header">
                <svg
                  class="section-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="9" y1="21" x2="9" y2="9" />
                </svg>
                <h2 class="section-title">
                  {{ i18n.s('Frameworks y Librerías', 'Frameworks & Libraries') }}
                </h2>
              </div>
              <div class="skills-grid">
                @for (skill of frameworkSkills(); track skill.id) {
                  <div class="skill-card" [class.featured]="skill.is_featured">
                    @if (getSkillIcon(skill.label)) {
                      <img
                        class="skill-icon-img"
                        [src]="getSkillIcon(skill.label)"
                        [alt]="skill.label"
                      />
                    } @else {
                      <span class="skill-icon-fallback">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                          <line x1="3" y1="9" x2="21" y2="9"></line>
                          <line x1="9" y1="21" x2="9" y2="9"></line>
                        </svg>
                      </span>
                    }
                    <span class="skill-name">{{ skill.label }}</span>
                    @if (skill.is_featured) {
                      <span class="featured-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                          <polygon
                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                          />
                        </svg>
                      </span>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <!-- Bases de Datos -->
          @if (databaseSkills().length > 0) {
            <section class="skill-section">
              <div class="section-header">
                <svg
                  class="section-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
                <h2 class="section-title">
                  {{ i18n.s('Bases de Datos', 'Databases') }}
                </h2>
              </div>
              <div class="skills-grid">
                @for (skill of databaseSkills(); track skill.id) {
                  <div class="skill-card" [class.featured]="skill.is_featured">
                    @if (getSkillIcon(skill.label)) {
                      <img
                        class="skill-icon-img"
                        [src]="getSkillIcon(skill.label)"
                        [alt]="skill.label"
                      />
                    } @else {
                      <span class="skill-icon-fallback">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                        </svg>
                      </span>
                    }
                    <span class="skill-name">{{ skill.label }}</span>
                    @if (skill.is_featured) {
                      <span class="featured-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                          <polygon
                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                          />
                        </svg>
                      </span>
                    }
                  </div>
                }
              </div>
            </section>
          }

          <!-- Herramientas y DevOps -->
          @if (toolSkills().length > 0) {
            <section class="skill-section">
              <div class="section-header">
                <svg
                  class="section-icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path
                    d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                  />
                </svg>
                <h2 class="section-title">
                  {{ i18n.s('Herramientas y DevOps', 'Tools & DevOps') }}
                </h2>
              </div>
              <div class="skills-grid">
                @for (skill of toolSkills(); track skill.id) {
                  <div class="skill-card" [class.featured]="skill.is_featured">
                    @if (getSkillIcon(skill.label)) {
                      <img
                        class="skill-icon-img"
                        [src]="getSkillIcon(skill.label)"
                        [alt]="skill.label"
                      />
                    } @else {
                      <span class="skill-icon-fallback">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <path
                            d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                          />
                        </svg>
                      </span>
                    }
                    <span class="skill-name">{{ skill.label }}</span>
                    @if (skill.is_featured) {
                      <span class="featured-badge">
                        <svg viewBox="0 0 24 24" fill="currentColor" width="12" height="12">
                          <polygon
                            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
                          />
                        </svg>
                      </span>
                    }
                  </div>
                }
              </div>
            </section>
          }
        </div>
      }
    </div>
  `,
  styles: [
    `
      .skills-page {
        padding: 24px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .skills-header {
        text-align: center;
        margin-bottom: 40px;
      }

      .page-title {
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-size: 2rem;
        font-weight: 600;
        margin: 0 0 8px;
      }

      .page-subtitle {
        color: var(--vscode-descriptionForeground, #858585);
        font-size: 1rem;
        margin: 0;
      }

      .skills-container {
        display: flex;
        flex-direction: column;
        gap: 32px;
      }

      .skill-section {
        background: var(--vscode-editor-background, #1e1e1e);
        border: 1px solid var(--vscode-panel-border, #3c3c3c);
        border-radius: 8px;
        padding: 20px;
      }

      .section-header {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 20px;
        padding-bottom: 12px;
        border-bottom: 1px solid var(--vscode-panel-border, #3c3c3c);
      }

      .section-icon {
        width: 24px;
        height: 24px;
        color: var(--vscode-textLink-foreground, #3794ff);
      }

      .section-title {
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-size: 1.1rem;
        font-weight: 600;
        margin: 0;
      }

      .skills-grid {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
      }

      .skill-card {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        background: var(--vscode-input-background, #3c3c3c);
        border: 1px solid var(--vscode-input-border, #3c3c3c);
        border-radius: 6px;
        transition: all 0.2s ease;
        position: relative;
      }

      .skill-card:hover {
        border-color: var(--vscode-textLink-foreground, #3794ff);
        transform: translateY(-2px);
      }

      .skill-card.featured {
        border-color: var(--vscode-textLink-foreground, #3794ff);
        background: rgba(55, 148, 255, 0.1);
      }

      .skill-icon-img {
        width: 24px;
        height: 24px;
        object-fit: contain;
      }

      .skill-icon-fallback {
        font-size: 1.2rem;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .skill-icon {
        font-size: 1.2rem;
      }

      .skill-name {
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-size: 0.9rem;
        font-weight: 500;
      }

      .featured-badge {
        position: absolute;
        top: -6px;
        right: -6px;
        width: 18px;
        height: 18px;
        background: var(--vscode-textLink-foreground, #3794ff);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
      }

      .featured-badge svg {
        width: 10px;
        height: 10px;
      }

      /* Summary */
      .skills-summary {
        display: flex;
        justify-content: center;
        gap: 24px;
        margin-top: 40px;
        padding-top: 24px;
        border-top: 1px solid var(--vscode-panel-border, #3c3c3c);
      }

      .summary-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        padding: 16px 32px;
        background: var(--vscode-input-background, #3c3c3c);
        border-radius: 8px;
      }

      .summary-number {
        color: var(--vscode-textLink-foreground, #3794ff);
        font-size: 2rem;
        font-weight: 700;
      }

      .summary-label {
        color: var(--vscode-descriptionForeground, #858585);
        font-size: 0.85rem;
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
      }

      /* Responsive */
      @media (max-width: 768px) {
        .skills-page {
          padding: 16px;
        }

        .skills-summary {
          flex-direction: column;
          align-items: center;
        }

        .summary-card {
          width: 100%;
          max-width: 200px;
        }
      }
    `,
  ],
})
export class SkillsComponent implements OnInit {
  supabase = inject(SupabaseService);
  i18n = inject(I18nService);
  techIcons = inject(TechIconsService);

  allSkills = signal<Skill[]>([]);

  languageSkills = computed(() => this.allSkills().filter((s) => s.category === 'languages'));
  frameworkSkills = computed(() => this.allSkills().filter((s) => s.category === 'frameworks'));
  databaseSkills = computed(() => this.allSkills().filter((s) => s.category === 'databases'));
  toolSkills = computed(() => this.allSkills().filter((s) => s.category === 'tools'));

  featuredCount = computed(() => this.allSkills().filter((s) => s.is_featured).length);

  categoriesCount = computed(() => {
    const categories = new Set(this.allSkills().map((s) => s.category));
    return categories.size;
  });

  async ngOnInit(): Promise<void> {
    const skills = await this.supabase.getSkills();
    this.allSkills.set(skills);
  }

  getSkillIcon(label: string): string | null {
    return this.techIcons.getIcon(label);
  }
}
