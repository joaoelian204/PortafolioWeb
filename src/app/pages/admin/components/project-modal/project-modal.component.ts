import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Project } from '../../../../core/models/database.types';
import { I18nService } from '../../../../core/services/i18n.service';
import { SelectedImage } from '../../admin.types';

@Component({
  selector: 'app-project-modal',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    @if (visible) {
      <div class="modal-overlay">
        <div class="modal modal-lg">
          <div class="modal-header">
            <h3>
              {{
                editingProject
                  ? i18n.s('Editar Proyecto', 'Edit Project')
                  : i18n.s('Agregar Proyecto', 'Add Project')
              }}
            </h3>
            <button class="modal-close" (click)="close.emit()">×</button>
          </div>
          <form [formGroup]="projectForm" (ngSubmit)="save.emit()" class="modal-body">
            <div class="form-row">
              <div class="form-group">
                <label class="label">{{ i18n.s('Título', 'Title') }} *</label>
                <input
                  type="text"
                  formControlName="title"
                  class="input"
                  (input)="titleChange.emit($event)"
                />
              </div>
              <div class="form-group">
                <label class="label">{{
                  i18n.s('Slug (auto-generado)', 'Slug (auto-generated)')
                }}</label>
                <input
                  type="text"
                  formControlName="slug"
                  class="input"
                  readonly
                  [placeholder]="i18n.s('slug-del-proyecto', 'project-slug')"
                />
              </div>
            </div>
            <div class="form-group">
              <label class="label">{{ i18n.s('Descripción', 'Description') }}</label>
              <textarea formControlName="description" class="input textarea" rows="3"></textarea>
            </div>
            <div class="form-group">
              <label class="label">
                {{ i18n.s('Stack Tecnológico', 'Tech Stack') }} ({{
                  i18n.s('separado por comas', 'comma separated')
                }})
              </label>
              <input
                type="text"
                formControlName="tech_stack_input"
                class="input"
                placeholder="Angular, TypeScript, Supabase"
              />
            </div>
            <div class="form-group">
              <label class="label">{{ i18n.s('Imágenes del Proyecto', 'Project Images') }}</label>
              <input
                type="file"
                multiple
                accept="image/*"
                (change)="imagesSelected.emit($event)"
                class="input"
              />
              <small class="form-hint">{{
                i18n.s(
                  'Selecciona una o más imágenes (máximo 10)',
                  'Select one or more images (max 10)'
                )
              }}</small>

              @if (selectedImages.length > 0) {
                <div class="image-preview-grid">
                  @for (image of selectedImages; track $index) {
                    <div class="image-preview-item">
                      <img [src]="image.preview" [alt]="image.name" />
                      <button
                        type="button"
                        class="remove-image-btn"
                        (click)="removeImage.emit($index)"
                      >
                        <svg viewBox="0 0 16 16" fill="currentColor">
                          <path
                            d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm3-8H5v1h6V6zm0 3H5v1h6V9z"
                          />
                        </svg>
                      </button>
                    </div>
                  }
                </div>
              }

              @if (projectImages.length > 0) {
                <div class="existing-images">
                  <label class="label-small">{{
                    i18n.s('Imágenes existentes:', 'Existing images:')
                  }}</label>
                  <div class="image-preview-grid">
                    @for (imageUrl of projectImages; track $index) {
                      <div class="image-preview-item">
                        <img [src]="imageUrl" [alt]="'Image ' + ($index + 1)" />
                        <button
                          type="button"
                          class="remove-image-btn"
                          (click)="removeExistingImage.emit($index)"
                        >
                          <svg viewBox="0 0 16 16" fill="currentColor">
                            <path
                              d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm3-8H5v1h6V6zm0 3H5v1h6V9z"
                            />
                          </svg>
                        </button>
                      </div>
                    }
                  </div>
                </div>
              }
            </div>
            <div class="form-row">
              <div class="form-group">
                <label class="label">{{ i18n.s('Enlace en Vivo', 'Live Link') }}</label>
                <input type="url" formControlName="live_link" class="input" />
              </div>
              <div class="form-group">
                <label class="label">{{ i18n.s('Enlace al Repositorio', 'Repo Link') }}</label>
                <input type="url" formControlName="repo_link" class="input" />
              </div>
            </div>
            <div class="form-row">
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="is_featured" />
                  <span>{{ i18n.s('Proyecto Destacado', 'Featured Project') }}</span>
                </label>
              </div>
              <div class="form-group checkbox-group">
                <label class="checkbox-label">
                  <input type="checkbox" formControlName="is_published" />
                  <span>{{ i18n.s('Publicado', 'Published') }}</span>
                </label>
              </div>
            </div>
            <div class="modal-actions">
              <button type="button" class="btn btn-secondary" (click)="close.emit()">
                {{ i18n.s('Cancelar', 'Cancel') }}
              </button>
              <button
                type="submit"
                class="btn btn-primary"
                [disabled]="projectForm.invalid || isSaving"
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
  styles: [
    `
      .label-small {
        font-size: 12px;
        color: #71717a;
        margin-bottom: 10px;
        display: block;
      }

      .image-preview-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 14px;
        margin-top: 14px;
      }

      .image-preview-item {
        position: relative;
        width: 100%;
        aspect-ratio: 1;
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 10px;
        overflow: hidden;
        background: rgba(0, 0, 0, 0.3);
        transition: all 0.2s ease;
      }

      .image-preview-item:hover {
        border-color: rgba(99, 102, 241, 0.4);
        transform: scale(1.02);
      }

      .image-preview-item img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .remove-image-btn {
        position: absolute;
        top: 6px;
        right: 6px;
        background: rgba(239, 68, 68, 0.9);
        border: none;
        border-radius: 50%;
        width: 26px;
        height: 26px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        color: white;
        transition: all 0.2s ease;
        opacity: 0;
      }

      .image-preview-item:hover .remove-image-btn {
        opacity: 1;
      }

      .remove-image-btn:hover {
        background: rgba(239, 68, 68, 1);
        transform: scale(1.1);
      }
      .remove-image-btn svg {
        width: 14px;
        height: 14px;
      }

      .existing-images {
        margin-top: 20px;
        padding-top: 20px;
        border-top: 1px solid rgba(255, 255, 255, 0.08);
      }
    `,
  ],
})
export class ProjectModalComponent {
  i18n = inject(I18nService);

  @Input() visible = false;
  @Input() editingProject: Project | null = null;
  @Input({ required: true }) projectForm!: FormGroup;
  @Input() isSaving = false;
  @Input() selectedImages: SelectedImage[] = [];
  @Input() projectImages: string[] = [];

  @Output() save = new EventEmitter<void>();
  @Output() close = new EventEmitter<void>();
  @Output() titleChange = new EventEmitter<Event>();
  @Output() imagesSelected = new EventEmitter<Event>();
  @Output() removeImage = new EventEmitter<number>();
  @Output() removeExistingImage = new EventEmitter<number>();
}
