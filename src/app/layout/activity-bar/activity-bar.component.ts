import { Component, inject } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { EditorStateService } from '../../core/services/editor-state.service';
import { I18nService } from '../../core/services/i18n.service';
import { SupabaseService } from '../../core/services/supabase.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-activity-bar',
  standalone: true,
  template: `
    <aside class="activity-bar">
      <!-- Iconos superiores -->
      <div class="activity-icons-top">
        <button
          class="activity-icon"
          [class.active]="editorState.activityBarSection() === 'explorer'"
          (click)="editorState.setActivitySection('explorer')"
          title="Explorer (Ctrl+Shift+E)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M17.5 0h-9L7 1.5V6H2.5L1 7.5v15.07L2.5 24h12.07L16 22.57V18h4.7l1.3-1.43V4.5L17.5 0zm0 2.12l2.38 2.38H17.5V2.12zm-3 20.38h-12v-15H7v9.07L8.5 18h6v4.5zm6-6h-12v-15H16V6h4.5v10.5z"
            />
          </svg>
        </button>

        <button
          class="activity-icon"
          [class.active]="editorState.activityBarSection() === 'search'"
          (click)="editorState.setActivitySection('search')"
          title="Search (Ctrl+Shift+F)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M15.25 0a8.25 8.25 0 0 0-6.18 13.72L1 22.88l1.12 1.12 8.05-9.12A8.251 8.251 0 1 0 15.25.01V0zm0 15a6.75 6.75 0 1 1 0-13.5 6.75 6.75 0 0 1 0 13.5z"
            />
          </svg>
        </button>

        <button
          class="activity-icon"
          [class.active]="editorState.activityBarSection() === 'git'"
          (click)="editorState.setActivitySection('git')"
          title="Source Control (Ctrl+Shift+G)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M21.007 8.222A3.738 3.738 0 0 0 17.5 5.5a3.73 3.73 0 0 0-3.507 2.722c-1.754.137-3.326.974-4.376 2.322a6.185 6.185 0 0 0-1.117 2.456 3.738 3.738 0 0 0-2.5 6.5 3.738 3.738 0 0 0 6.5-2.5 3.73 3.73 0 0 0-.722-2.222c.374-.588.883-1.07 1.472-1.406a4.65 4.65 0 0 0 1.75-.594v2.722a3.738 3.738 0 0 0 2.5 6.5 3.738 3.738 0 0 0 2.5-6.5 3.73 3.73 0 0 0-2.5-.722V10.5c.374-.137.722-.343 1.007-.594A3.738 3.738 0 0 0 21.007 8.222zM6.5 20.5a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5zm11 0a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5zm0-11.5a2.25 2.25 0 1 1 0-4.5 2.25 2.25 0 0 1 0 4.5z"
            />
          </svg>
        </button>
      </div>

      <!-- Indicador de ruta activa -->
      <div class="route-indicator">
        @if (currentRoute === '/') {
          <span class="route-dot home" title="README.md"></span>
        } @else if (currentRoute === '/about') {
          <span class="route-dot about" title="about.md"></span>
        } @else if (currentRoute === '/skills') {
          <span class="route-dot skills" title="skills.ts"></span>
        } @else if (currentRoute === '/projects') {
          <span class="route-dot projects" title="projects.tsx"></span>
        } @else if (currentRoute === '/experience') {
          <span class="route-dot experience" title="experience.yaml"></span>
        } @else if (currentRoute === '/contact') {
          <span class="route-dot contact" title="contact.tsx"></span>
        } @else if (currentRoute === '/settings') {
          <span class="route-dot settings" title="settings.json"></span>
        }
      </div>

      <!-- Iconos inferiores -->
      <div class="activity-icons-bottom">
        @if (supabase.isAuthenticated()) {
          <button class="activity-icon" (click)="goToAdmin()" title="Admin Panel">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
              />
            </svg>
          </button>
        }

        <button
          class="activity-icon"
          (click)="themeService.toggleTheme()"
          [title]="
            themeService.theme() === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'
          "
        >
          @if (themeService.theme() === 'dark') {
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37c-.39-.39-1.03-.39-1.41 0-.39.39-.39 1.03 0 1.41l1.06 1.06c.39.39 1.03.39 1.41 0 .39-.39.39-1.03 0-1.41l-1.06-1.06zm1.06-10.96c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36c.39-.39.39-1.03 0-1.41-.39-.39-1.03-.39-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z"
              />
            </svg>
          } @else {
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12.34 2.02C6.59 1.82 2 6.42 2 12c0 5.52 4.48 10 10 10 3.71 0 6.93-2.02 8.66-5.02-7.51-.25-13.12-6.66-8.32-14.96z"
              />
            </svg>
          }
        </button>

        <button
          class="activity-icon"
          (click)="i18n.setLanguage(i18n.language() === 'es' ? 'en' : 'es')"
          [title]="i18n.s('Switch to English', 'Cambiar a Español')"
        >
          <span style="font-size: 18px; font-weight: bold;">{{ i18n.s('EN', 'ES') }}</span>
        </button>

        <button
          class="activity-icon"
          (click)="editorState.setActivitySection('settings')"
          [class.active]="editorState.activityBarSection() === 'settings'"
          title="Settings (Ctrl+,)"
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path
              d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"
            />
          </svg>
        </button>
      </div>
    </aside>
  `,
  styles: [
    `
      .activity-bar {
        width: 48px;
        height: calc(100vh - 30px - 22px);
        background-color: var(--vscode-activityBar-background, #333333);
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        border-right: 1px solid var(--vscode-activityBar-border, #333333);
        position: absolute;
        left: 0;
        top: 0;
        z-index: 10;
      }

      .activity-icons-top,
      .activity-icons-bottom {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .activity-icon {
        width: 48px;
        height: 48px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--vscode-activityBar-inactiveForeground, #858585);
        position: relative;
        transition: color 0.15s ease;
      }

      .activity-icon:hover {
        color: var(--vscode-activityBar-foreground, #ffffff);
      }

      .activity-icon.active {
        color: var(--vscode-activityBar-foreground, #ffffff);
      }

      .activity-icon.active::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 2px;
        background-color: var(--vscode-activityBar-activeBorder, #ffffff);
      }

      .activity-icon svg {
        width: 24px;
        height: 24px;
      }

      /* Route indicator */
      .route-indicator {
        display: flex;
        justify-content: center;
        padding: 4px 0;
      }

      .route-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        transition: all 0.3s ease;
        box-shadow: 0 0 6px currentColor;
      }

      .route-dot.home {
        background: var(--syntax-comment, #6a9955);
        color: var(--syntax-comment, #6a9955);
      }
      .route-dot.about {
        background: var(--syntax-keyword, #569cd6);
        color: var(--syntax-keyword, #569cd6);
      }
      .route-dot.skills {
        background: var(--syntax-type, #4ec9b0);
        color: var(--syntax-type, #4ec9b0);
      }
      .route-dot.projects {
        background: var(--syntax-function, #dcdcaa);
        color: var(--syntax-function, #dcdcaa);
      }
      .route-dot.experience {
        background: var(--syntax-string, #ce9178);
        color: var(--syntax-string, #ce9178);
      }
      .route-dot.contact {
        background: var(--syntax-decorator, #dcdcaa);
        color: var(--syntax-decorator, #dcdcaa);
      }
      .route-dot.settings {
        background: var(--syntax-escape, #d7ba7d);
        color: var(--syntax-escape, #d7ba7d);
      }

      @media (max-width: 768px) {
        .activity-bar {
          width: 40px;
        }

        .activity-icon {
          width: 40px;
          height: 40px;
        }

        .activity-icon svg {
          width: 20px;
          height: 20px;
        }

        .activity-icon span {
          font-size: 14px !important;
        }
      }

      @media (max-width: 480px) {
        .activity-bar {
          width: 36px;
        }

        .activity-icon {
          width: 36px;
          height: 36px;
        }

        .activity-icon svg {
          width: 18px;
          height: 18px;
        }

        .activity-icon span {
          font-size: 12px !important;
        }

        .route-indicator {
          display: none;
        }
      }
    `,
  ],
})
export class ActivityBarComponent {
  editorState = inject(EditorStateService);
  supabase = inject(SupabaseService);
  themeService = inject(ThemeService);
  i18n = inject(I18nService);
  private router = inject(Router);

  currentRoute = '/';

  constructor() {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute = (event as NavigationEnd).urlAfterRedirects || '/';
      });
  }

  goToAdmin(): void {
    this.router.navigate(['/admin']);
  }
}
