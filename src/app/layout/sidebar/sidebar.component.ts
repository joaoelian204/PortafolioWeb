import { Component, inject } from '@angular/core';
import { EditorStateService } from '../../core/services/editor-state.service';
import { FileExplorerComponent } from '../file-explorer/file-explorer.component';
import { ThemeService } from '../../core/services/theme.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FileExplorerComponent],
  template: `
    <aside class="sidebar" [class.hidden]="!editorState.sidebarVisible()">
      @switch (editorState.activityBarSection()) {
        @case ('explorer') {
          <app-file-explorer />
        }
        @case ('search') {
          <div class="sidebar-section">
            <div class="section-header">{{ i18n.t('nav.search') }}</div>
            <div class="section-content">
              <div class="search-box">
                <input type="text" [placeholder]="i18n.t('nav.search')" class="search-input" />
              </div>
              <p class="placeholder-text">Type to search across portfolio files</p>
            </div>
          </div>
        }
        @case ('git') {
          <div class="sidebar-section">
            <div class="section-header">{{ i18n.t('nav.sourceControl') }}</div>
            <div class="section-content">
              <div class="git-info">
                <span class="git-branch">
                  <svg viewBox="0 0 16 16" fill="currentColor" class="branch-icon">
                    <path d="M14 6.5v-5l-1-1H8l-1 1v5l1 1h1.5v2.793l-2.854 2.854a.5.5 0 0 0 .708.707l2.146-2.147V13.5l1 1h5l1-1v-5l-1-1h-5l-1 1v1.793L6.854 12.5a.5.5 0 0 0-.708-.707L8.793 9.5H10.5v-2H12V6.5l1 1h1.5l1-1zM9 2h4v4H9V2zm5 10v2h-4v-2h4z"/>
                  </svg>
                  {{ i18n.t('status.branch') }}
                </span>
              </div>
              <p class="placeholder-text">Portfolio repository is up to date</p>
            </div>
          </div>
        }
        @case ('extensions') {
          <div class="sidebar-section">
            <div class="section-header">{{ i18n.t('nav.extensions') }}</div>
            <div class="section-content">
              <div class="extension-item">
                <div class="ext-icon angular">Ng</div>
                <div class="ext-info">
                  <span class="ext-name">Angular Language Service</span>
                  <span class="ext-publisher">Angular</span>
                </div>
              </div>
              <div class="extension-item">
                <div class="ext-icon tailwind">TW</div>
                <div class="ext-info">
                  <span class="ext-name">Tailwind CSS IntelliSense</span>
                  <span class="ext-publisher">Tailwind Labs</span>
                </div>
              </div>
              <div class="extension-item">
                <div class="ext-icon prettier">P</div>
                <div class="ext-info">
                  <span class="ext-name">Prettier</span>
                  <span class="ext-publisher">Prettier</span>
                </div>
              </div>
              <div class="extension-item">
                <div class="ext-icon eslint">ES</div>
                <div class="ext-info">
                  <span class="ext-name">ESLint</span>
                  <span class="ext-publisher">Microsoft</span>
                </div>
              </div>
            </div>
          </div>
        }
        @case ('settings') {
          <div class="sidebar-section">
            <div class="section-header">{{ i18n.t('settings.title') }}</div>
            <div class="section-content">
              <div class="setting-item">
                <label class="setting-label">{{ i18n.t('settings.colorTheme') }}</label>
                <div class="theme-toggle">
                  <button
                    class="theme-btn"
                    [class.active]="themeService.theme() === 'dark'"
                    (click)="themeService.setTheme('dark')"
                  >
                    {{ i18n.t('settings.dark') }}
                  </button>
                  <button
                    class="theme-btn"
                    [class.active]="themeService.theme() === 'light'"
                    (click)="themeService.setTheme('light')"
                  >
                    {{ i18n.t('settings.light') }}
                  </button>
                </div>
              </div>
              <div class="setting-item">
                <label class="setting-label">{{ i18n.t('settings.language') }}</label>
                <div class="theme-toggle">
                  <button
                    class="theme-btn"
                    [class.active]="i18n.language() === 'es'"
                    (click)="i18n.setLanguage('es')"
                  >
                    {{ i18n.t('settings.spanish') }}
                  </button>
                  <button
                    class="theme-btn"
                    [class.active]="i18n.language() === 'en'"
                    (click)="i18n.setLanguage('en')"
                  >
                    {{ i18n.t('settings.english') }}
                  </button>
                </div>
              </div>
              <p class="placeholder-text">{{ i18n.t('settings.font') }}</p>
              <p class="placeholder-text">{{ i18n.t('settings.tabSize') }}</p>
            </div>
          </div>
        }
      }
    </aside>
  `,
  styles: [`
    .sidebar {
      width: 260px;
      min-width: 200px;
      max-width: 400px;
      background-color: var(--vscode-sideBar-background, #252526);
      border-right: 1px solid var(--vscode-sideBar-border, #1e1e1e);
      display: flex;
      flex-direction: column;
      transition: width 0.15s ease;
      overflow: hidden;
    }

    .sidebar.hidden {
      width: 0;
      min-width: 0;
      border-right: none;
    }

    .sidebar-section {
      height: 100%;
      display: flex;
      flex-direction: column;
    }

    .section-header {
      padding: 0 20px;
      height: 35px;
      display: flex;
      align-items: center;
      text-transform: uppercase;
      font-size: 11px;
      font-weight: 500;
      letter-spacing: 0.5px;
      color: var(--vscode-sideBarSectionHeader-foreground, #bbbbbb);
    }

    .section-content {
      flex: 1;
      padding: 8px 12px;
      overflow-y: auto;
    }

    .placeholder-text {
      color: var(--vscode-descriptionForeground, #858585);
      font-size: 12px;
      margin: 4px 0;
    }

    .search-box {
      margin-bottom: 12px;
    }

    .search-input {
      width: 100%;
      padding: 4px 8px;
      background-color: var(--vscode-input-background, #3c3c3c);
      border: 1px solid var(--vscode-input-border, #3c3c3c);
      color: var(--vscode-input-foreground, #cccccc);
      font-size: 13px;
      border-radius: 2px;
      outline: none;
    }

    .search-input:focus {
      border-color: var(--vscode-focusBorder, #007fd4);
    }

    .git-info {
      display: flex;
      align-items: center;
      margin-bottom: 12px;
    }

    .git-branch {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 12px;
      color: var(--vscode-sideBar-foreground, #cccccc);
    }

    .branch-icon {
      width: 14px;
      height: 14px;
    }

    .extension-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 8px 4px;
      border-radius: 4px;
      cursor: pointer;
    }

    .extension-item:hover {
      background-color: var(--vscode-list-hoverBackground, #2a2d2e);
    }

    .ext-icon {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-size: 11px;
      font-weight: 600;
      color: white;
    }

    .ext-icon.angular {
      background: linear-gradient(135deg, #dd0031, #c3002f);
    }

    .ext-icon.tailwind {
      background: linear-gradient(135deg, #38bdf8, #0ea5e9);
    }

    .ext-icon.prettier {
      background: linear-gradient(135deg, #56b3b4, #ea5e5e);
    }

    .ext-icon.eslint {
      background: linear-gradient(135deg, #4b32c3, #8080f2);
    }

    .ext-info {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }

    .ext-name {
      font-size: 13px;
      color: var(--vscode-sideBar-foreground, #cccccc);
    }

    .ext-publisher {
      font-size: 11px;
      color: var(--vscode-descriptionForeground, #858585);
    }

    .setting-item {
      margin-bottom: 16px;
    }

    .setting-label {
      display: block;
      font-size: 12px;
      color: var(--vscode-sideBar-foreground, #cccccc);
      margin-bottom: 8px;
    }

    .theme-toggle {
      display: flex;
      gap: 4px;
    }

    .theme-btn {
      flex: 1;
      padding: 6px 12px;
      background-color: var(--vscode-button-secondaryBackground, #3a3d41);
      color: var(--vscode-button-secondaryForeground, #ffffff);
      border: 1px solid var(--vscode-button-border, #454545);
      border-radius: 2px;
      cursor: pointer;
      font-size: 12px;
      transition: background-color 0.15s ease;
    }

    .theme-btn:hover {
      background-color: var(--vscode-button-secondaryHoverBackground, #45494e);
    }

    .theme-btn.active {
      background-color: var(--vscode-button-background, #0e639c);
      border-color: var(--vscode-button-background, #0e639c);
    }

    .theme-btn.active:hover {
      background-color: var(--vscode-button-hoverBackground, #1177bb);
    }
  `],
})
export class SidebarComponent {
  editorState = inject(EditorStateService);
  themeService = inject(ThemeService);
  i18n = inject(I18nService);
}
