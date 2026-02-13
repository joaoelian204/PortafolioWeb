import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { I18nService } from '../../../../core/services/i18n.service';
import { SOCIAL_ICONS, SOCIAL_NETWORKS } from '../../admin.constants';
import { SocialLinkItem, SocialNetwork } from '../../admin.types';

@Component({
  selector: 'app-social-link-modal',
  standalone: true,
  imports: [FormsModule],
  template: `
    @if (visible) {
      <div class="modal-overlay">
        <div class="modal social-modal">
          <div class="modal-header">
            <h3>
              {{
                editingSocialLink
                  ? i18n.s('Editar Red Social', 'Edit Social Network')
                  : i18n.s('Agregar Red Social', 'Add Social Network')
              }}
            </h3>
            <button class="modal-close" (click)="close.emit()">×</button>
          </div>
          <div class="modal-body">
            @if (!editingSocialLink && !selectedSocialType) {
              <div class="social-select-grid">
                @for (social of availableSocialNetworks; track social.type) {
                  <button
                    type="button"
                    class="social-select-item"
                    (click)="selectType.emit(social.type)"
                  >
                    <div class="social-select-icon" [innerHTML]="getSocialIcon(social.type)"></div>
                    <span>{{ social.name }}</span>
                  </button>
                }
              </div>
            } @else {
              <div class="social-url-form">
                <div class="selected-social-header">
                  <div
                    class="selected-social-icon"
                    [innerHTML]="getSocialIcon(selectedSocialType || editingSocialLink?.type || '')"
                  ></div>
                  <span class="selected-social-name">{{
                    getSocialName(selectedSocialType || editingSocialLink?.type || '')
                  }}</span>
                </div>
                <div class="form-group">
                  <label class="label">{{ i18n.s('URL del perfil', 'Profile URL') }}</label>
                  <input
                    type="url"
                    class="input"
                    [(ngModel)]="socialLinkUrl"
                    [placeholder]="
                      getSocialPlaceholder(selectedSocialType || editingSocialLink?.type || '')
                    "
                  />
                </div>
                <div class="modal-actions">
                  <button
                    type="button"
                    class="btn btn-secondary"
                    (click)="editingSocialLink ? close.emit() : backToSelect.emit()"
                  >
                    {{
                      editingSocialLink ? i18n.s('Cancelar', 'Cancel') : i18n.s('Volver', 'Back')
                    }}
                  </button>
                  <button
                    type="button"
                    class="btn btn-primary"
                    (click)="onSave()"
                    [disabled]="!socialLinkUrl.trim()"
                  >
                    {{ i18n.s('Guardar', 'Save') }}
                  </button>
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styleUrls: ['../../shared/admin-shared.styles.css'],
  styles: [
    `
      .social-modal {
        max-width: 500px;
      }

      .social-select-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        padding: 8px 0;
      }

      .social-select-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 10px;
        padding: 20px 12px;
        background: rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 255, 255, 0.1);
        border-radius: 12px;
        cursor: pointer;
        transition: all 0.2s ease;
        color: #a1a1aa;
      }

      .social-select-item:hover {
        background: rgba(99, 102, 241, 0.15);
        border-color: rgba(99, 102, 241, 0.4);
        color: #e4e4e7;
        transform: translateY(-2px);
      }

      .social-select-icon {
        width: 40px;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .social-select-icon svg {
        width: 28px;
        height: 28px;
      }
      .social-select-item:hover .social-select-icon svg {
        color: #818cf8;
      }
      .social-select-item span {
        font-size: 12px;
        font-weight: 500;
      }

      .social-url-form {
        display: flex;
        flex-direction: column;
        gap: 20px;
      }

      .selected-social-header {
        display: flex;
        align-items: center;
        gap: 14px;
        padding: 16px;
        background: rgba(99, 102, 241, 0.1);
        border: 1px solid rgba(99, 102, 241, 0.2);
        border-radius: 12px;
      }

      .selected-social-icon {
        width: 44px;
        height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(99, 102, 241, 0.15);
        border-radius: 10px;
      }

      .selected-social-icon svg {
        width: 24px;
        height: 24px;
        color: #818cf8;
      }
      .selected-social-name {
        font-size: 16px;
        font-weight: 600;
        color: #e4e4e7;
      }
    `,
  ],
})
export class SocialLinkModalComponent {
  i18n = inject(I18nService);
  private sanitizer = inject(DomSanitizer);

  @Input() visible = false;
  @Input() editingSocialLink: SocialLinkItem | null = null;
  @Input() selectedSocialType: string | null = null;
  @Input() availableSocialNetworks: SocialNetwork[] = [];

  socialLinkUrl = '';

  @Output() save = new EventEmitter<string>();
  @Output() close = new EventEmitter<void>();
  @Output() selectType = new EventEmitter<string>();
  @Output() backToSelect = new EventEmitter<void>();

  ngOnChanges(): void {
    if (this.editingSocialLink) {
      this.socialLinkUrl = this.editingSocialLink.url;
    }
    if (!this.visible) {
      this.socialLinkUrl = '';
    }
  }

  onSave(): void {
    if (this.socialLinkUrl.trim()) {
      this.save.emit(this.socialLinkUrl.trim());
    }
  }

  getSocialName(type: string): string {
    return SOCIAL_NETWORKS.find((n) => n.type === type)?.name || type;
  }

  getSocialPlaceholder(type: string): string {
    return SOCIAL_NETWORKS.find((n) => n.type === type)?.placeholder || 'https://...';
  }

  getSocialIcon(type: string): SafeHtml {
    const iconHtml = SOCIAL_ICONS[type] || SOCIAL_ICONS['website'];
    return this.sanitizer.bypassSecurityTrustHtml(iconHtml);
  }
}
