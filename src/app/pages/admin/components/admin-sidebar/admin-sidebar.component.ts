import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { I18nService } from '../../../../core/services/i18n.service';
import { SupabaseService } from '../../../../core/services/supabase.service';
import { AdminTab } from '../../admin.types';

@Component({
  selector: 'app-admin-sidebar',
  standalone: true,
  template: `
    <aside class="admin-sidebar">
      <div class="sidebar-header">
        <div class="logo">
          <svg viewBox="0 0 16 16" fill="currentColor" class="logo-icon">
            <path
              d="M14.5 2H9l-1 1v4l1 1h5.5l.5-.5v-5l-.5-.5zM14 7H9V3h5v4zM6 9H1l-1 1v4l1 1h5l1-1v-4l-1-1zm0 5H1v-4h5v4zm8-1h-5l-1-1V8l1-1h5l1 1v4l-1 1zm0-5H9v4h5V8zM6 2H1L0 3v4l1 1h5l1-1V3L6 2zm0 5H1V3h5v4z"
            />
          </svg>
          <span class="logo-text">Admin</span>
        </div>
      </div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <span class="nav-label">{{ i18n.s('MENÚ', 'MENU') }}</span>
          <button
            class="nav-item"
            [class.active]="activeTab === 'profile'"
            (click)="tabChange.emit('profile')"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm0-5a2 2 0 1 1 0 4 2 2 0 0 1 0-4zm6 10c0 1-1 1-1 1H3s-1 0-1-1 1-4 6-4 6 3 6 4zm-1-.004c-.001-.246-.154-.986-.832-1.664C11.516 10.68 10.289 10 8 10c-2.29 0-3.516.68-4.168 1.332-.678.678-.83 1.418-.832 1.664h10z"
              />
            </svg>
            <span>{{ i18n.s('Perfil', 'Profile') }}</span>
          </button>
          <button
            class="nav-item"
            [class.active]="activeTab === 'skills'"
            (click)="tabChange.emit('skills')"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M2.5 1l-.5.5v13l.5.5h11l.5-.5v-13l-.5-.5h-11zM3 14V2h10v12H3zm2-9h6v1H5V5zm0 2h6v1H5V7zm0 2h4v1H5V9z"
              />
            </svg>
            <span>{{ i18n.s('Habilidades', 'Skills') }}</span>
          </button>
          <button
            class="nav-item"
            [class.active]="activeTab === 'projects'"
            (click)="tabChange.emit('projects')"
          >
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M14.5 3H7.71l-.85-.85L6.51 2h-5l-.5.5v11l.5.5h13l.5-.5v-10l-.5-.5zm-.5 10H2V6h12v7zm0-8H2V3h4.29l.85.85.36.15H14v1z"
              />
            </svg>
            <span>{{ i18n.s('Proyectos', 'Projects') }}</span>
          </button>
        </div>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">
            <span class="avatar-initials">{{ getInitials() }}</span>
          </div>
          <div class="user-details">
            <span class="user-email">{{ supabase.currentUser()?.email }}</span>
            <span class="user-role">{{ i18n.s('Administrador', 'Administrator') }}</span>
          </div>
        </div>
        <button
          class="logout-btn"
          (click)="logoutClick.emit()"
          [title]="i18n.s('Cerrar Sesión', 'Logout')"
        >
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path
              d="M11.5 9.5l1.5-1.5-1.5-1.5-.71.71.65.64H8v1h3.44l-.65.64.71.71zM13 3H9v1h4v8H9v1h4.5l.5-.5v-9l-.5-.5z"
            />
            <path d="M1 3.5l.5-.5H7v1H2v8h5v1H1.5l-.5-.5v-9z" />
          </svg>
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      .admin-sidebar {
        width: 260px;
        height: 100vh;
        background: linear-gradient(180deg, rgba(20, 20, 35, 0.95) 0%, rgba(15, 15, 25, 0.98) 100%);
        border-right: 1px solid rgba(99, 102, 241, 0.15);
        display: flex;
        flex-direction: column;
        flex-shrink: 0;
        position: relative;
      }

      .sidebar-header {
        padding: 24px 20px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.06);
      }

      .logo {
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .logo-icon {
        width: 32px;
        height: 32px;
        color: #818cf8;
        filter: drop-shadow(0 0 10px rgba(129, 140, 248, 0.5));
      }

      .logo-text {
        font-size: 20px;
        font-weight: 700;
        background: linear-gradient(135deg, #818cf8 0%, #c084fc 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }

      .sidebar-nav {
        flex: 1;
        padding: 20px 12px;
        overflow-y: auto;
      }

      .nav-section {
        margin-bottom: 24px;
      }

      .nav-label {
        display: block;
        font-size: 10px;
        font-weight: 600;
        color: #52525b;
        text-transform: uppercase;
        letter-spacing: 1.5px;
        padding: 0 12px;
        margin-bottom: 12px;
      }

      .nav-item {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 16px;
        background: transparent;
        border: none;
        color: #a1a1aa;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        border-radius: 10px;
        transition: all 0.2s ease;
        margin-bottom: 4px;
        text-align: left;
      }

      .nav-item:hover {
        color: #e4e4e7;
        background: rgba(255, 255, 255, 0.05);
      }

      .nav-item.active {
        color: #fff;
        background: linear-gradient(
          135deg,
          rgba(99, 102, 241, 0.2) 0%,
          rgba(139, 92, 246, 0.1) 100%
        );
        box-shadow: 0 0 20px rgba(99, 102, 241, 0.1);
      }

      .nav-item.active::before {
        content: '';
        position: absolute;
        left: 0;
        width: 3px;
        height: 24px;
        background: linear-gradient(180deg, #818cf8 0%, #c084fc 100%);
        border-radius: 0 3px 3px 0;
      }

      .nav-item svg {
        width: 18px;
        height: 18px;
        flex-shrink: 0;
      }

      .nav-item.active svg {
        color: #818cf8;
      }

      .sidebar-footer {
        padding: 16px;
        border-top: 1px solid rgba(255, 255, 255, 0.06);
        display: flex;
        align-items: center;
        gap: 12px;
      }

      .user-info {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }

      .user-avatar {
        width: 36px;
        height: 36px;
        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        box-shadow: 0 2px 10px rgba(99, 102, 241, 0.35);
        position: relative;
        overflow: hidden;
      }

      .user-avatar::after {
        content: '';
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(255, 255, 255, 0.15) 0%, transparent 60%);
        border-radius: inherit;
      }

      .avatar-initials {
        font-size: 14px;
        font-weight: 700;
        color: #fff;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        line-height: 1;
        z-index: 1;
      }

      .user-details {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .user-email {
        font-size: 12px;
        color: #d4d4d8;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .user-role {
        font-size: 10px;
        color: #71717a;
      }

      .logout-btn {
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
        flex-shrink: 0;
      }

      .logout-btn:hover {
        background: rgba(239, 68, 68, 0.2);
        border-color: rgba(239, 68, 68, 0.4);
        transform: scale(1.05);
      }

      .logout-btn svg {
        width: 16px;
        height: 16px;
      }

      @media (max-width: 900px) {
        .admin-sidebar {
          display: none;
        }
      }
    `,
  ],
})
export class AdminSidebarComponent {
  supabase = inject(SupabaseService);
  i18n = inject(I18nService);

  @Input({ required: true }) activeTab!: AdminTab;
  @Output() tabChange = new EventEmitter<AdminTab>();
  @Output() logoutClick = new EventEmitter<void>();

  getInitials(): string {
    const email = this.supabase.currentUser()?.email;
    if (!email) return '?';
    const name = email.split('@')[0];
    const parts = name.split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}
