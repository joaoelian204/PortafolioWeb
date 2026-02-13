import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { Skill } from '../../../../core/models/database.types';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-admin-skills-table',
  standalone: true,
  template: `
    <section class="section">
      <div class="section-card">
        <div class="card-header">
          <h3 class="card-title">
            {{ i18n.s('Lista de Habilidades', 'Skills List') }}
          </h3>
          <span class="card-badge"> {{ skills.length }} {{ i18n.s('registros', 'items') }} </span>
        </div>
        <div class="table-container">
          <table class="table">
            <thead>
              <tr>
                <th>{{ i18n.s('Etiqueta', 'Label') }}</th>
                <th>{{ i18n.s('Categoría', 'Category') }}</th>
                <th>{{ i18n.s('Destacado', 'Featured') }}</th>
                <th>{{ i18n.s('Acciones', 'Actions') }}</th>
              </tr>
            </thead>
            <tbody>
              @for (skill of skills; track skill.id) {
                <tr>
                  <td>
                    <span class="skill-label">{{ skill.label }}</span>
                  </td>
                  <td>
                    <span class="badge" [attr.data-category]="skill.category">
                      {{ skill.category }}
                    </span>
                  </td>
                  <td>
                    @if (skill.is_featured) {
                      <span class="badge badge-success">{{ i18n.s('Sí', 'Yes') }}</span>
                    } @else {
                      <span class="badge badge-muted">{{ i18n.s('No', 'No') }}</span>
                    }
                  </td>
                  <td>
                    <div class="actions">
                      <button
                        class="action-btn"
                        (click)="edit.emit(skill)"
                        [title]="i18n.s('Editar', 'Edit')"
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path
                            d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z"
                          />
                        </svg>
                      </button>
                      <button
                        class="action-btn action-btn-danger"
                        (click)="delete.emit(skill.id)"
                        [title]="i18n.s('Eliminar', 'Delete')"
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path
                            d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </section>
  `,
  styleUrls: ['../../shared/admin-shared.styles.css'],
  styles: [
    `
      .table-container {
        overflow-x: auto;
      }

      .table {
        width: 100%;
        border-collapse: collapse;
      }

      .table th,
      .table td {
        padding: 16px 24px;
        text-align: left;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .table th {
        font-size: 11px;
        font-weight: 600;
        color: #71717a;
        text-transform: uppercase;
        letter-spacing: 1px;
        background: rgba(0, 0, 0, 0.15);
      }

      .table tbody tr {
        transition: background 0.2s ease;
      }
      .table tbody tr:hover {
        background: rgba(99, 102, 241, 0.05);
      }
      .table tbody tr:last-child td {
        border-bottom: none;
      }

      .skill-label {
        font-weight: 600;
        color: #f4f4f5;
      }

      .actions {
        display: flex;
        gap: 10px;
      }

      .action-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #a1a1aa;
        border-radius: 8px;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      .action-btn:hover {
        background: rgba(99, 102, 241, 0.15);
        border-color: rgba(99, 102, 241, 0.3);
        color: #818cf8;
        transform: translateY(-2px);
      }

      .action-btn-danger:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.3);
        color: #f87171;
      }

      .action-btn svg {
        width: 16px;
        height: 16px;
      }
    `,
  ],
})
export class AdminSkillsTableComponent {
  i18n = inject(I18nService);

  @Input({ required: true }) skills: Skill[] = [];
  @Output() edit = new EventEmitter<Skill>();
  @Output() delete = new EventEmitter<string>();
}
