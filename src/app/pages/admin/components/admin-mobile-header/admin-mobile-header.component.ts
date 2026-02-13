import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { AdminTab } from '../../admin.types';

@Component({
  selector: 'app-admin-mobile-header',
  standalone: true,
  template: `
    <!-- Mobile Header -->
    <header class="mobile-header">
      <h1 class="mobile-title">{{ i18n.s('Panel de Administración', 'Admin Panel') }}</h1>
      <button class="logout-btn-mobile" (click)="logoutClick.emit()">
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path
            d="M11.5 9.5l1.5-1.5-1.5-1.5-.71.71.65.64H8v1h3.44l-.65.64.71.71zM13 3H9v1h4v8H9v1h4.5l.5-.5v-9l-.5-.5z"
          />
          <path d="M1 3.5l.5-.5H7v1H2v8h5v1H1.5l-.5-.5v-9z" />
        </svg>
      </button>
    </header>

    <!-- Mobile Tabs -->
    <nav class="mobile-tabs">
      <button
        class="mobile-tab"
        [class.active]="activeTab === 'profile'"
        (click)="tabChange.emit('profile')"
      >
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-5a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
        </svg>
        <span>{{ i18n.s('Perfil', 'Profile') }}</span>
      </button>
      <button
        class="mobile-tab"
        [class.active]="activeTab === 'skills'"
        (click)="tabChange.emit('skills')"
      >
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M2.5 1l-.5.5v13l.5.5h11l.5-.5v-13l-.5-.5h-11zM3 14V2h10v12H3z" />
        </svg>
        <span>{{ i18n.s('Habilidades', 'Skills') }}</span>
      </button>
      <button
        class="mobile-tab"
        [class.active]="activeTab === 'projects'"
        (click)="tabChange.emit('projects')"
      >
        <svg viewBox="0 0 16 16" fill="currentColor">
          <path d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10l-.5-.5z" />
        </svg>
        <span>{{ i18n.s('Proyectos', 'Projects') }}</span>
      </button>
    </nav>
  `,
  styles: [
    `
      :host {
        display: none;
      }

      .mobile-header,
      .mobile-tabs {
        display: none;
      }

      @media (max-width: 900px) {
        :host {
          display: contents;
        }

        .mobile-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 16px 20px;
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.1) 0%,
            rgba(139, 92, 246, 0.05) 100%
          );
          border-bottom: 1px solid rgba(99, 102, 241, 0.2);
        }

        .mobile-title {
          font-size: 18px;
          font-weight: 700;
          margin: 0;
          background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .logout-btn-mobile {
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(239, 68, 68, 0.1);
          border: 1px solid rgba(239, 68, 68, 0.2);
          color: #f87171;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s ease;
        }

        .logout-btn-mobile svg {
          width: 16px;
          height: 16px;
        }

        .mobile-tabs {
          display: flex;
          gap: 4px;
          padding: 12px 16px;
          background: rgba(0, 0, 0, 0.3);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          overflow-x: auto;
        }

        .mobile-tab {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 16px;
          background: transparent;
          border: 1px solid transparent;
          color: #a1a1aa;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border-radius: 10px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .mobile-tab.active {
          color: #fff;
          background: linear-gradient(
            135deg,
            rgba(99, 102, 241, 0.2) 0%,
            rgba(139, 92, 246, 0.1) 100%
          );
          border-color: rgba(99, 102, 241, 0.3);
        }

        .mobile-tab svg {
          width: 16px;
          height: 16px;
        }
      }

      @media (min-width: 901px) {
        .mobile-header,
        .mobile-tabs {
          display: none !important;
        }
      }
    `,
  ],
})
export class AdminMobileHeaderComponent {
  i18n = inject(I18nService);

  @Input({ required: true }) activeTab!: AdminTab;
  @Output() tabChange = new EventEmitter<AdminTab>();
  @Output() logoutClick = new EventEmitter<void>();
}
