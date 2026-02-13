import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormGroup, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { I18nService } from '../../../../core/services/i18n.service';
import { SOCIAL_ICONS, SOCIAL_NETWORKS } from '../../admin.constants';
import { SocialLinkItem } from '../../admin.types';

@Component({
  selector: 'app-admin-profile-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="section">
      <div class="section-card">
        <div class="card-header">
          <h3 class="card-title">
            {{ i18n.s('Información Personal', 'Personal Information') }}
          </h3>
        </div>
        <form [formGroup]="profileForm" (ngSubmit)="save.emit()" class="form">
          <div class="form-row">
            <div class="form-group">
              <label class="label">{{ i18n.s('Nombre', 'Name') }}</label>
              <input type="text" formControlName="name" class="input" />
            </div>
            <div class="form-group">
              <label class="label">{{ i18n.s('Título', 'Title') }}</label>
              <input type="text" formControlName="title" class="input" />
            </div>
          </div>

          <div class="form-group">
            <label class="label">{{ i18n.s('Biografía', 'Biography') }}</label>
            <textarea formControlName="bio" class="input textarea" rows="4"></textarea>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label class="label">{{ i18n.s('Email', 'Email') }}</label>
              <input type="email" formControlName="email" class="input" />
            </div>
            <div class="form-group">
              <label class="label">{{ i18n.s('Ubicación', 'Location') }}</label>
              <input type="text" formControlName="location" class="input" />
            </div>
          </div>

          <h3 class="subsection-title">
            {{ i18n.s('Enlaces Sociales', 'Social Links') }}
          </h3>

          <div class="social-links-container">
            @if (socialLinks.length === 0) {
              <div class="empty-social-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
                <p>
                  {{ i18n.s('No tienes enlaces sociales agregados', 'No social links added yet') }}
                </p>
              </div>
            }

            <div class="social-links-grid">
              @for (link of socialLinks; track link.type) {
                <div class="social-link-card">
                  <div class="social-link-icon" [innerHTML]="getSocialIcon(link.type)"></div>
                  <div class="social-link-info">
                    <span class="social-link-name">{{ getSocialName(link.type) }}</span>
                    <a [href]="link.url" target="_blank" class="social-link-url">{{ link.url }}</a>
                  </div>
                  <div class="social-link-actions">
                    <button
                      type="button"
                      class="social-action-btn"
                      (click)="editSocialLink.emit(link)"
                      [title]="i18n.s('Editar', 'Edit')"
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path
                          d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59 2.41 15l4.12-2.36.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3 1.45 1.45-2.96 1.55zm3.83-2.06L4.47 9.76l8-8 1.77 1.77-8 8z"
                        />
                      </svg>
                    </button>
                    <button
                      type="button"
                      class="social-action-btn social-action-btn-danger"
                      (click)="removeSocialLink.emit(link.type)"
                      [title]="i18n.s('Eliminar', 'Remove')"
                    >
                      <svg viewBox="0 0 16 16" fill="currentColor">
                        <path
                          d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              }
            </div>

            <button type="button" class="add-social-btn" (click)="openSocialModal.emit()">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"
                />
              </svg>
              {{ i18n.s('Agregar Red Social', 'Add Social Network') }}
            </button>
          </div>

          <!-- CV Upload Section -->
          <h3 class="subsection-title">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              style="width: 20px; height: 20px; margin-right: 8px;"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            {{ i18n.s('Currículum Vitae (CV)', 'Resume / CV') }}
          </h3>

          <div class="cv-upload-section">
            @if (currentCvUrl) {
              <div class="current-cv">
                <div class="cv-info">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="cv-icon"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                  </svg>
                  <span class="cv-filename">CV.pdf</span>
                </div>
                <div class="cv-actions">
                  <a [href]="currentCvUrl" target="_blank" class="btn btn-sm btn-secondary">
                    {{ i18n.s('Ver', 'View') }}
                  </a>
                  <button type="button" class="btn btn-sm btn-danger" (click)="deleteCv.emit()">
                    {{ i18n.s('Eliminar', 'Delete') }}
                  </button>
                </div>
              </div>
            }

            <div class="cv-upload-area" [class.has-file]="currentCvUrl">
              <input
                type="file"
                id="cv-upload"
                accept=".pdf"
                (change)="cvFileSelected.emit($event)"
                class="file-input"
              />
              <label for="cv-upload" class="upload-label">
                @if (isUploadingCv) {
                  <div class="upload-spinner"></div>
                  <span>{{ i18n.s('Subiendo...', 'Uploading...') }}</span>
                } @else {
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    class="upload-icon"
                  >
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="17 8 12 3 7 8"></polyline>
                    <line x1="12" y1="3" x2="12" y2="15"></line>
                  </svg>
                  <span>
                    {{
                      currentCvUrl
                        ? i18n.s('Cambiar CV (PDF)', 'Change CV (PDF)')
                        : i18n.s('Subir CV (PDF)', 'Upload CV (PDF)')
                    }}
                  </span>
                }
              </label>
            </div>
            <p class="cv-hint">
              {{
                i18n.s(
                  'Solo archivos PDF. El archivo se sobrescribirá si subes uno nuevo.',
                  'PDF files only. The file will be overwritten if you upload a new one.'
                )
              }}
            </p>
          </div>

          <div class="form-actions">
            <button type="submit" class="btn btn-primary" [disabled]="isSaving">
              @if (isSaving) {
                {{ i18n.s('Guardando...', 'Saving...') }}
              } @else {
                {{ i18n.s('Guardar', 'Save') }} {{ i18n.s('Perfil', 'Profile') }}
              }
            </button>
          </div>
        </form>
      </div>
    </section>
  `,
  styleUrls: ['../../shared/admin-shared.styles.css'],
  styles: [
    `
      .subsection-title {
        font-size: 13px;
        font-weight: 600;
        color: #818cf8;
        margin: 28px 0 16px;
        text-transform: uppercase;
        letter-spacing: 1px;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .subsection-title::after {
        content: '';
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, rgba(99, 102, 241, 0.3) 0%, transparent 100%);
      }

      .social-links-container {
        margin-bottom: 20px;
      }

      .empty-social-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 32px;
        background: rgba(0, 0, 0, 0.2);
        border: 1px dashed rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        margin-bottom: 16px;
      }

      .empty-social-state svg {
        width: 48px;
        height: 48px;
        color: #52525b;
        margin-bottom: 12px;
      }
      .empty-social-state p {
        color: #71717a;
        font-size: 14px;
        margin: 0;
      }

      .social-links-grid {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-bottom: 16px;
      }

      .social-link-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: linear-gradient(135deg, rgba(30, 30, 50, 0.8) 0%, rgba(20, 20, 40, 0.9) 100%);
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 12px;
        transition: all 0.2s ease;
      }

      .social-link-card:hover {
        border-color: rgba(99, 102, 241, 0.3);
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
      }

      .social-link-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.15) 0%,
          rgba(139, 92, 246, 0.1) 100%
        );
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 10px;
        flex-shrink: 0;
      }

      .social-link-icon svg {
        width: 20px;
        height: 20px;
        color: #818cf8;
      }

      .social-link-info {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .social-link-name {
        font-size: 14px;
        font-weight: 600;
        color: #e4e4e7;
      }

      .social-link-url {
        font-size: 12px;
        color: #818cf8;
        text-decoration: none;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .social-link-url:hover {
        text-decoration: underline;
      }

      .social-link-actions {
        display: flex;
        gap: 8px;
      }

      .social-action-btn {
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.1);
        color: #a1a1aa;
        cursor: pointer;
        border-radius: 8px;
        transition: all 0.2s ease;
      }

      .social-action-btn:hover {
        background: rgba(99, 102, 241, 0.15);
        border-color: rgba(99, 102, 241, 0.3);
        color: #818cf8;
      }

      .social-action-btn-danger:hover {
        background: rgba(239, 68, 68, 0.15);
        border-color: rgba(239, 68, 68, 0.3);
        color: #f87171;
      }

      .social-action-btn svg {
        width: 14px;
        height: 14px;
      }

      .add-social-btn {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        width: 100%;
        padding: 14px 20px;
        background: transparent;
        border: 2px dashed rgba(99, 102, 241, 0.3);
        color: #818cf8;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-radius: 12px;
        transition: all 0.2s ease;
      }

      .add-social-btn:hover {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.5);
      }

      .add-social-btn svg {
        width: 18px;
        height: 18px;
      }

      /* CV */
      .cv-upload-section {
        margin-top: 16px;
      }

      .current-cv {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.3);
        border-radius: 10px;
        padding: 14px 18px;
        margin-bottom: 16px;
      }

      .cv-info {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .cv-icon {
        width: 32px;
        height: 32px;
        color: #818cf8;
      }
      .cv-filename {
        font-size: 14px;
        font-weight: 500;
        color: #f4f4f5;
      }
      .cv-actions {
        display: flex;
        gap: 10px;
      }

      .cv-upload-area {
        position: relative;
      }

      .cv-upload-area .file-input {
        position: absolute;
        width: 100%;
        height: 100%;
        opacity: 0;
        cursor: pointer;
        z-index: 2;
      }

      .cv-upload-area .upload-label {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 12px;
        padding: 32px;
        background: rgba(0, 0, 0, 0.2);
        border: 2px dashed rgba(99, 102, 241, 0.4);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #a1a1aa;
      }

      .cv-upload-area .upload-label:hover {
        background: rgba(99, 102, 241, 0.1);
        border-color: rgba(99, 102, 241, 0.6);
        color: #c4b5fd;
      }

      .cv-upload-area.has-file .upload-label {
        padding: 20px;
        flex-direction: row;
      }
      .cv-upload-area .upload-icon {
        width: 40px;
        height: 40px;
      }
      .cv-upload-area.has-file .upload-icon {
        width: 24px;
        height: 24px;
      }

      .cv-upload-area .upload-spinner {
        width: 24px;
        height: 24px;
        border: 3px solid rgba(99, 102, 241, 0.3);
        border-top-color: #818cf8;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .cv-hint {
        font-size: 12px;
        color: #71717a;
        margin-top: 10px;
        text-align: center;
      }
    `,
  ],
})
export class AdminProfileFormComponent {
  i18n = inject(I18nService);
  private sanitizer = inject(DomSanitizer);

  @Input({ required: true }) profileForm!: FormGroup;
  @Input({ required: true }) socialLinks: SocialLinkItem[] = [];
  @Input() currentCvUrl: string | null = null;
  @Input() isUploadingCv = false;
  @Input() isSaving = false;

  @Output() save = new EventEmitter<void>();
  @Output() editSocialLink = new EventEmitter<SocialLinkItem>();
  @Output() removeSocialLink = new EventEmitter<string>();
  @Output() openSocialModal = new EventEmitter<void>();
  @Output() cvFileSelected = new EventEmitter<Event>();
  @Output() deleteCv = new EventEmitter<void>();

  getSocialName(type: string): string {
    return SOCIAL_NETWORKS.find((n) => n.type === type)?.name || type;
  }

  getSocialIcon(type: string): SafeHtml {
    const iconHtml = SOCIAL_ICONS[type] || SOCIAL_ICONS['website'];
    return this.sanitizer.bypassSecurityTrustHtml(iconHtml);
  }
}
