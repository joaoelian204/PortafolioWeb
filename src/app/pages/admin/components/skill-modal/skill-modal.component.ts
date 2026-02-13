import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Skill } from '../../../../core/models/database.types';
import { I18nService } from '../../../../core/services/i18n.service';

@Component({
  selector: 'app-skill-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (visible) {
      <div class="modal-overlay">
        <div class="modal">
          <div class="modal-header">
            <h3>
              {{
                editingSkill
                  ? i18n.s('Editar Habilidad', 'Edit Skill')
                  : i18n.s('Agregar Habilidad', 'Add Skill')
              }}
            </h3>
            <button class="modal-close" (click)="close.emit()">×</button>
          </div>
          <form [formGroup]="skillForm" (ngSubmit)="save.emit()" class="modal-body">
            <div class="form-group">
              <label class="label">{{ i18n.s('Etiqueta', 'Label') }} *</label>
              <input type="text" formControlName="label" class="input" />
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">{{ i18n.s('Categoría', 'Category') }} *</label>
                <select formControlName="category" class="input">
                  <option value="languages">
                    {{ i18n.s('Lenguajes', 'Languages') }}
                  </option>
                  <option value="frameworks">
                    {{ i18n.s('Frameworks', 'Frameworks') }}
                  </option>
                  <option value="databases">
                    {{ i18n.s('Bases de Datos', 'Databases') }}
                  </option>
                  <option value="tools">
                    {{ i18n.s('Herramientas', 'Tools') }}
                  </option>
                  <option value="other">
                    {{ i18n.s('Otros', 'Other') }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label class="label">{{ i18n.s('Icono', 'Icon') }}</label>
                <input
                  type="text"
                  formControlName="icon"
                  class="input"
                  [placeholder]="i18n.s('ej., typescript', 'e.g., typescript')"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="label">{{ i18n.s('Orden', 'Sort Order') }}</label>
              <input type="number" formControlName="sort_order" class="input" />
            </div>
            <div class="form-group checkbox-group">
              <label class="checkbox-label">
                <input type="checkbox" formControlName="is_featured" />
                <span>{{ i18n.s('Habilidad Destacada', 'Featured Skill') }}</span>
              </label>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="close.emit()">
                {{ i18n.s('Cancelar', 'Cancel') }}
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="skillForm.invalid || isSaving"
              >
                @if (isSaving) {
                  {{ i18n.s('Guardando...', 'Saving...') }}
                } @else {
                  {{ i18n.s('Guardar', 'Save') }}
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styleUrls: ['../../shared/admin-shared.styles.css'],
})
export class SkillModalComponent {
  i18n = inject(I18nService);

  @Input() visible = false;
  @Input() editingSkill: Skill | null = null;
  @Input({ required: true }) skillForm!: FormGroup;
  @Input() isSaving = false;

  @Output() save = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
}
