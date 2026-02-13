import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Project } from '../../../../core/models/database.types';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-admin-projects-grid',
  standalone: true,
  template: `
    <section class="section">
      <div class="section-card">
        <div class="card-header">
          <h3 class="card-title">
            {{ i18n.s('Lista de Proyectos', 'Projects List') }}
          </h3>
          <span class="card-badge"> {{ projects.length }} {{ i18n.s('registros', 'items') }} </span>
        </div>
        <div class="projects-grid">
          @for (project of projects; track project.id) {
            <div class="project-card">
              <div class="project-header">
                <h3 class="project-title">{{ project.title }}</h3>
                <div class="project-badges">
                  @if (project.is_featured) {
                    <span class="badge badge-primary">{{ i18n.s('Destacado', 'Featured') }}</span>
                  }
                  @if (!project.is_published) {
                    <span class="badge badge-warning">{{ i18n.s('Borrador', 'Draft') }}</span>
                  }
                </div>
              </div>
              <p class="project-description">{{ project.description }}</p>
              <div class="project-tech">
                @for (tech of project.tech_stack; track tech) {
                  <span class="tech-tag">{{ tech }}</span>
                }
              </div>
              <div class="project-actions">
                <button class="btn btn-secondary btn-sm" (click)="edit.emit(project)">
                  {{ i18n.s('Editar', 'Edit') }}
                </button>
                <button class="btn btn-danger btn-sm" (click)="delete.emit(project.id)">
                  {{ i18n.s('Eliminar', 'Delete') }}
                </button>
              </div>
            </div>
          }
        </div>
      </div>
    </section>
  `,
  styleUrls: ['../../shared/admin-shared.styles.css'],
  styles: [
    `
      .projects-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 16px;
        padding: 20px 24px;
      }

      .project-card {
        background: linear-gradient(135deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0.15) 100%);
        border: 1px solid rgba(255, 255, 255, 0.06);
        border-radius: 12px;
        padding: 20px;
        transition: all 0.3s ease;
      }

      .project-card:hover {
        border-color: rgba(99, 102, 241, 0.3);
        transform: translateY(-2px);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
      }

      .project-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 12px;
      }

      .project-title {
        font-size: 18px;
        font-weight: 600;
        margin: 0;
        color: #f4f4f5;
      }
      .project-badges {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }

      .project-description {
        font-size: 14px;
        color: #a1a1aa;
        margin: 0 0 16px;
        line-height: 1.6;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      .project-tech {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin-bottom: 20px;
      }

      .tech-tag {
        padding: 4px 10px;
        font-size: 11px;
        font-weight: 500;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.15) 0%,
          rgba(139, 92, 246, 0.1) 100%
        );
        color: #c4b5fd;
        border-radius: 6px;
        border: 1px solid rgba(99, 102, 241, 0.2);
      }

      .project-actions {
        display: flex;
        gap: 10px;
      }

      @media (max-width: 900px) {
        .projects-grid {
          grid-template-columns: 1fr;
        }
      }
    `,
  ],
})
export class AdminProjectsGridComponent {
  i18n = inject(I18nService);

  @Input({ required: true }) projects: Project[] = [];
  @Output() edit = new EventEmitter<Project>();
  @Output() delete = new EventEmitter<string>();
}
