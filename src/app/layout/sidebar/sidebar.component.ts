import { Component, computed, inject, signal } from '@angular/core';
import { EditorStateService } from '../../core/services/editor-state.service';
import { I18nService } from '../../core/services/i18n.service';
import { THEMES, ThemeService } from '../../core/services/theme.service';
import { FileExplorerComponent } from '../file-explorer/file-explorer.component';

interface SearchItem {
  name: string;
  description: string;
  descriptionEn: string;
  route: string;
  extension: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [FileExplorerComponent],
  template: `
    <aside
      class="sidebar"
      [class.hidden]="!editorState.sidebarVisible()"
      [class.mobile-open]="editorState.mobileSidebarOpen()"
    >
      @switch (editorState.activityBarSection()) {
        @case ('explorer') {
          <app-file-explorer />
        }
        @case ('search') {
          <div class="sidebar-section">
            <div class="section-header">{{ i18n.s('BUSCAR', 'SEARCH') }}</div>
            <div class="section-content">
              <div class="search-box">
                <svg class="search-icon" viewBox="0 0 16 16" fill="currentColor">
                  <path
                    d="M15.25 14.19L10.76 9.7a5.46 5.46 0 1 0-1.06 1.06l4.49 4.49a.75.75 0 1 0 1.06-1.06zM2.75 6.5a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0z"
                  />
                </svg>
                <input
                  type="text"
                  [placeholder]="i18n.s('Buscar archivos...', 'Search files...')"
                  class="search-input"
                  [value]="searchTerm()"
                  (input)="onSearchInput($event)"
                />
                @if (searchTerm()) {
                  <button class="clear-btn" (click)="clearSearch()">
                    <svg viewBox="0 0 16 16" fill="currentColor">
                      <path
                        d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"
                      />
                    </svg>
                  </button>
                }
              </div>

              @if (searchTerm()) {
                <div class="search-results">
                  @if (filteredItems().length > 0) {
                    <div class="results-count">
                      {{ filteredItems().length }}
                      {{ i18n.s('resultado(s)', 'result(s)') }}
                    </div>
                    @for (item of filteredItems(); track item.route) {
                      <div class="search-result-item" (click)="openSearchResult(item)">
                        <span class="result-icon" [attr.data-ext]="item.extension">
                          @switch (item.extension) {
                            @case ('ts') {
                              <svg viewBox="0 0 24 24" fill="#3178c6">
                                <path
                                  d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"
                                />
                              </svg>
                            }
                            @case ('tsx') {
                              <svg viewBox="0 0 24 24" fill="#61dafb">
                                <path
                                  d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"
                                />
                              </svg>
                            }
                            @case ('md') {
                              <svg viewBox="0 0 24 24" fill="#083fa1">
                                <path
                                  d="M22.27 19.385H1.73A1.73 1.73 0 0 1 0 17.655V6.345a1.73 1.73 0 0 1 1.73-1.73h20.54A1.73 1.73 0 0 1 24 6.345v11.308a1.73 1.73 0 0 1-1.73 1.731zM5.769 15.923v-4.5l2.308 2.885 2.307-2.885v4.5h2.308V8.078h-2.308l-2.307 2.885-2.308-2.885H3.46v7.847zM21.232 12h-2.309V8.077h-2.307V12h-2.308l3.461 4.039z"
                                />
                              </svg>
                            }
                            @case ('yaml') {
                              <svg viewBox="0 0 24 24" fill="#cb171e">
                                <path
                                  d="M.15 7.57L4.07 12l-3.92 4.43h1.62l3.1-3.5 3.1 3.5h1.62L5.67 12l3.92-4.43H8.04l-3.1 3.5-3.1-3.5H.15zm10.23 0v8.86h1.47V7.57h-1.47zm3.69 0v8.86h1.47V7.57h-1.47zm3.69 0v8.86h1.47v-3.54l3.1 3.54h1.85l-3.54-4.05 3.54-4.81h-1.85l-3.1 4.23V7.57h-1.47z"
                                />
                              </svg>
                            }
                            @case ('json') {
                              <svg viewBox="0 0 24 24" fill="#f5de19">
                                <path
                                  d="M12.043 23.968c.479-.004.953-.029 1.426-.094a11.805 11.805 0 0 0 3.146-.863 12.404 12.404 0 0 0 3.793-2.542 11.977 11.977 0 0 0 2.44-3.427 11.794 11.794 0 0 0 1.02-3.476c.149-1.16.135-2.346-.045-3.499a11.96 11.96 0 0 0-.793-2.788 11.197 11.197 0 0 0-.854-1.617c-1.168-1.837-2.861-3.314-4.81-4.3a12.835 12.835 0 0 0-2.172-.87h-.005c.119.063.24.132.345.201.553.365 1.033.8 1.473 1.272l.015.017h-.001c.313.334.604.69.867 1.067.268.394.503.808.707 1.239.39.823.676 1.7.832 2.6.165.95.208 1.918.105 2.87a11.06 11.06 0 0 1-.558 2.336 9.83 9.83 0 0 1-1.015 2.084 9.632 9.632 0 0 1-1.479 1.82 10.514 10.514 0 0 1-1.819 1.473 10.322 10.322 0 0 1-2.074 1.012 10.09 10.09 0 0 1-2.34.558c-.951.104-1.92.06-2.87-.105a9.792 9.792 0 0 1-2.596-.83 9.832 9.832 0 0 1-1.239-.706 9.404 9.404 0 0 1-1.074-.873 10.08 10.08 0 0 1-1.277-1.47c-.069-.098-.138-.197-.202-.346l.025.027a12.906 12.906 0 0 0 2.49 3.678 12.033 12.033 0 0 0 3.218 2.345c1.033.512 2.141.9 3.293 1.124.596.116 1.202.183 1.813.202M8.343 1.597c-.526.004-1.05.029-1.57.094a11.805 11.805 0 0 0-3.146.863 12.404 12.404 0 0 0-3.793 2.543 11.977 11.977 0 0 0-2.44 3.427 11.794 11.794 0 0 0-1.02 3.476c-.149 1.16-.135 2.346.045 3.499a11.96 11.96 0 0 0 .793 2.788 11.197 11.197 0 0 0 .854 1.617c1.168 1.837 2.861 3.314 4.81 4.3.678.344 1.388.635 2.126.87l.049.016c-.119-.063-.24-.132-.345-.201a10.315 10.315 0 0 1-1.473-1.272l-.015-.017h.001a10.09 10.09 0 0 1-.867-1.067 9.792 9.792 0 0 1-.707-1.239 9.832 9.832 0 0 1-.832-2.6 10.09 10.09 0 0 1-.105-2.87c.055-.788.19-1.57.399-2.327a9.83 9.83 0 0 1 1.015-2.084 9.632 9.632 0 0 1 1.479-1.82 10.514 10.514 0 0 1 1.819-1.473 10.322 10.322 0 0 1 2.074-1.012 10.09 10.09 0 0 1 2.34-.558c.951-.104 1.92-.06 2.87.105a9.792 9.792 0 0 1 2.596.83c.432.206.85.44 1.239.706.396.27.77.564 1.122.881.318.286.612.593.882.921.345.418.66.862.943 1.328.069.098.138.197.202.346l-.025-.027a12.906 12.906 0 0 0-2.49-3.678 12.033 12.033 0 0 0-3.218-2.345 12.404 12.404 0 0 0-3.293-1.124 12.303 12.303 0 0 0-1.813-.202h-.09z"
                                />
                              </svg>
                            }
                          }
                        </span>
                        <div class="result-info">
                          <span class="result-name">{{ item.name }}</span>
                          <span class="result-desc">{{
                            i18n.s(item.description, item.descriptionEn)
                          }}</span>
                        </div>
                      </div>
                    }
                  } @else {
                    <div class="no-results">
                      <svg viewBox="0 0 16 16" fill="currentColor" class="no-results-icon">
                        <path
                          d="M15.25 14.19L10.76 9.7a5.46 5.46 0 1 0-1.06 1.06l4.49 4.49a.75.75 0 1 0 1.06-1.06zM2.75 6.5a3.75 3.75 0 1 1 7.5 0 3.75 3.75 0 0 1-7.5 0z"
                        />
                      </svg>
                      <p>
                        {{ i18n.s('No se encontraron resultados', 'No results found') }}
                      </p>
                    </div>
                  }
                </div>
              } @else {
                <div class="search-hint">
                  <p class="placeholder-text">
                    {{
                      i18n.s(
                        'Escribe para buscar en el portafolio',
                        'Type to search across portfolio'
                      )
                    }}
                  </p>
                </div>
              }
            </div>
          </div>
        }
        @case ('git') {
          <div class="sidebar-section">
            <div class="section-header">
              {{ i18n.s('CONTROL DE CÓDIGO FUENTE', 'SOURCE CONTROL') }}
            </div>
            <div class="section-content">
              <div class="git-info">
                <span class="git-branch">
                  <svg viewBox="0 0 16 16" fill="currentColor" class="branch-icon">
                    <path
                      d="M14 6.5v-5l-1-1H8l-1 1v5l1 1h1.5v2.793l-2.854 2.854a.5.5 0 0 0 .708.707l2.146-2.147V13.5l1 1h5l1-1v-5l-1-1h-5l-1 1v1.793L6.854 12.5a.5.5 0 0 0-.708-.707L8.793 9.5H10.5v-2H12V6.5l1 1h1.5l1-1zM9 2h4v4H9V2zm5 10v2h-4v-2h4z"
                    />
                  </svg>
                  {{ i18n.s('main', 'main') }}
                </span>
              </div>
              <p class="placeholder-text">Portfolio repository is up to date</p>
            </div>
          </div>
        }
        @case ('settings') {
          <div class="sidebar-section">
            <div class="section-header">{{ i18n.s('CONFIGURACIÓN', 'SETTINGS') }}</div>
            <div class="section-content">
              <div class="setting-item">
                <label class="setting-label">{{ i18n.s('Tema de Color', 'Color Theme') }}</label>
                <div class="theme-list">
                  @for (theme of themes; track theme.id) {
                    <button
                      class="theme-option"
                      [class.active]="themeService.theme() === theme.id"
                      (click)="themeService.setTheme(theme.id)"
                    >
                      <span class="theme-dot" [attr.data-theme-dot]="theme.id"></span>
                      {{ i18n.s(theme.nameEs, theme.name) }}
                      @if (themeService.theme() === theme.id) {
                        <svg
                          class="check-icon"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                          width="12"
                          height="12"
                        >
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                        </svg>
                      }
                    </button>
                  }
                </div>
              </div>
              <div class="setting-item">
                <label class="setting-label">{{ i18n.s('Idioma', 'Language') }}</label>
                <div class="theme-toggle">
                  <button
                    class="theme-btn"
                    [class.active]="i18n.language() === 'es'"
                    (click)="i18n.setLanguage('es')"
                  >
                    {{ i18n.s('Español', 'Spanish') }}
                  </button>
                  <button
                    class="theme-btn"
                    [class.active]="i18n.language() === 'en'"
                    (click)="i18n.setLanguage('en')"
                  >
                    {{ i18n.s('Inglés', 'English') }}
                  </button>
                </div>
              </div>
              <p class="placeholder-text">
                {{ i18n.s('Fuente: Consolas, 14px', 'Font: Consolas, 14px') }}
              </p>
              <p class="placeholder-text">{{ i18n.s('Tamaño de Tabulación: 2', 'Tab Size: 2') }}</p>
            </div>
          </div>
        }
      }
    </aside>
  `,
  styles: [
    `
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
        position: relative;
        margin-bottom: 12px;
      }

      .search-icon {
        position: absolute;
        left: 8px;
        top: 50%;
        transform: translateY(-50%);
        width: 14px;
        height: 14px;
        color: var(--vscode-input-placeholderForeground, #858585);
        pointer-events: none;
      }

      .search-input {
        width: 100%;
        padding: 6px 28px 6px 28px;
        background-color: var(--vscode-input-background, #3c3c3c);
        border: 1px solid var(--vscode-input-border, #3c3c3c);
        color: var(--vscode-input-foreground, #cccccc);
        font-size: 13px;
        border-radius: 4px;
        outline: none;
      }

      .search-input:focus {
        border-color: var(--vscode-focusBorder, #007fd4);
      }

      .clear-btn {
        position: absolute;
        right: 4px;
        top: 50%;
        transform: translateY(-50%);
        background: none;
        border: none;
        padding: 4px;
        cursor: pointer;
        color: var(--vscode-input-placeholderForeground, #858585);
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 2px;
      }

      .clear-btn:hover {
        color: var(--vscode-input-foreground, #cccccc);
        background-color: var(--vscode-toolbar-hoverBackground, rgba(90, 93, 94, 0.31));
      }

      .clear-btn svg {
        width: 14px;
        height: 14px;
      }

      .search-results {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .results-count {
        font-size: 11px;
        color: var(--vscode-descriptionForeground, #858585);
        margin-bottom: 8px;
        padding: 0 4px;
      }

      .search-result-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 6px 8px;
        border-radius: 4px;
        cursor: pointer;
        transition: background-color 0.1s ease;
      }

      .search-result-item:hover {
        background-color: var(--vscode-list-hoverBackground, #2a2d2e);
      }

      .result-icon {
        width: 16px;
        height: 16px;
        flex-shrink: 0;
      }

      .result-icon svg {
        width: 100%;
        height: 100%;
      }

      .result-info {
        display: flex;
        flex-direction: column;
        gap: 1px;
        min-width: 0;
      }

      .result-name {
        font-size: 13px;
        color: var(--vscode-sideBar-foreground, #cccccc);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .result-desc {
        font-size: 11px;
        color: var(--vscode-descriptionForeground, #858585);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .no-results {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 24px 12px;
        text-align: center;
      }

      .no-results-icon {
        width: 32px;
        height: 32px;
        color: var(--vscode-descriptionForeground, #858585);
        opacity: 0.5;
        margin-bottom: 8px;
      }

      .no-results p {
        font-size: 12px;
        color: var(--vscode-descriptionForeground, #858585);
        margin: 0;
      }

      .search-hint {
        padding: 8px 4px;
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

      .theme-list {
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .theme-option {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 8px;
        background: transparent;
        border: none;
        color: var(--vscode-sideBar-foreground, #cccccc);
        font-size: 12px;
        cursor: pointer;
        border-radius: 3px;
        transition: background-color 0.1s ease;
        text-align: left;
        width: 100%;
      }

      .theme-option:hover {
        background-color: var(--vscode-list-hoverBackground, #2a2d2e);
      }

      .theme-option.active {
        background-color: var(--vscode-list-activeSelectionBackground, #094771);
        color: var(--vscode-list-activeSelectionForeground, #ffffff);
      }

      .theme-dot {
        width: 10px;
        height: 10px;
        border-radius: 50%;
        flex-shrink: 0;
      }

      [data-theme-dot='dark'] {
        background: #1e1e1e;
        border: 1px solid #555;
      }
      [data-theme-dot='light'] {
        background: #ffffff;
        border: 1px solid #ccc;
      }
      [data-theme-dot='monokai'] {
        background: #272822;
        border: 1px solid #555;
      }
      [data-theme-dot='github-dark'] {
        background: #0d1117;
        border: 1px solid #555;
      }
      [data-theme-dot='dracula'] {
        background: #282a36;
        border: 1px solid #555;
      }
      [data-theme-dot='nord'] {
        background: #2e3440;
        border: 1px solid #555;
      }
      [data-theme-dot='solarized-dark'] {
        background: #002b36;
        border: 1px solid #555;
      }

      .check-icon {
        width: 12px;
        height: 12px;
        margin-left: auto;
      }

      @media (max-width: 768px) {
        .sidebar {
          width: 180px;
          min-width: 180px;
        }

        .section-header {
          padding: 0 12px;
          font-size: 10px;
        }

        .section-content {
          padding: 6px 8px;
        }
      }

      @media (max-width: 480px) {
        .sidebar {
          display: none;
          position: fixed;
          top: 28px;
          left: 36px;
          bottom: 22px;
          width: 260px;
          min-width: 260px;
          z-index: 100;
          box-shadow: 4px 0 16px rgba(0, 0, 0, 0.4);
          border-right: 1px solid var(--vscode-sideBar-border, #1e1e1e);
        }

        .sidebar.mobile-open {
          display: flex;
        }

        .sidebar.hidden.mobile-open {
          display: flex;
          width: 260px;
          min-width: 260px;
          border-right: 1px solid var(--vscode-sideBar-border, #1e1e1e);
        }

        .section-header {
          padding: 0 12px;
          font-size: 10px;
        }

        .section-content {
          padding: 6px 8px;
        }
      }
    `,
  ],
})
export class SidebarComponent {
  editorState = inject(EditorStateService);
  themeService = inject(ThemeService);
  i18n = inject(I18nService);

  themes = THEMES;

  // Search functionality
  searchTerm = signal('');

  // Items que se pueden buscar
  readonly searchableItems: SearchItem[] = [
    {
      name: 'README.md',
      description: 'Página de inicio',
      descriptionEn: 'Home page',
      route: '/',
      extension: 'md',
      icon: 'readme',
    },
    {
      name: 'about.md',
      description: 'Información sobre mí',
      descriptionEn: 'About me',
      route: '/about',
      extension: 'md',
      icon: 'markdown',
    },
    {
      name: 'skills.ts',
      description: 'Habilidades técnicas',
      descriptionEn: 'Technical skills',
      route: '/skills',
      extension: 'ts',
      icon: 'typescript',
    },
    {
      name: 'projects.tsx',
      description: 'Proyectos realizados',
      descriptionEn: 'Completed projects',
      route: '/projects',
      extension: 'tsx',
      icon: 'react',
    },
    {
      name: 'experience.yaml',
      description: 'Experiencia laboral',
      descriptionEn: 'Work experience',
      route: '/experience',
      extension: 'yaml',
      icon: 'yaml',
    },
    {
      name: 'contact.tsx',
      description: 'Información de contacto',
      descriptionEn: 'Contact information',
      route: '/contact',
      extension: 'tsx',
      icon: 'react',
    },
    {
      name: 'settings.json',
      description: 'Configuración del editor',
      descriptionEn: 'Editor settings',
      route: '/settings',
      extension: 'json',
      icon: 'settings',
    },
  ];

  // Filtrar items según el término de búsqueda
  filteredItems = computed(() => {
    const term = this.searchTerm().toLowerCase().trim();
    if (!term) return [];

    return this.searchableItems.filter((item) => {
      const nameMatch = item.name.toLowerCase().includes(term);
      const descMatch =
        item.description.toLowerCase().includes(term) ||
        item.descriptionEn.toLowerCase().includes(term);
      return nameMatch || descMatch;
    });
  });

  onSearchInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  clearSearch(): void {
    this.searchTerm.set('');
  }

  openSearchResult(item: SearchItem): void {
    const fileNode = {
      name: item.name,
      type: 'file' as const,
      extension: item.extension,
      route: item.route,
      icon: item.icon,
    };
    this.editorState.openFile(fileNode);
    // openFile ya cierra el mobile sidebar
  }
}
