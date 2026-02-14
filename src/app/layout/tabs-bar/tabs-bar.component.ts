import { Component, inject } from '@angular/core';
import { EditorStateService } from '../../core/services/editor-state.service';

@Component({
  selector: 'app-tabs-bar',
  standalone: true,
  template: `
    <div class="tabs-bar">
      <div class="tabs-container">
        @for (tab of editorState.tabs(); track tab.id) {
          <div class="tab" [class.active]="tab.isActive" (click)="editorState.setActiveTab(tab.id)">
            <span class="tab-icon">
              @switch (tab.extension) {
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
                      d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278z"
                    />
                  </svg>
                }
                @case ('json') {
                  <svg viewBox="0 0 24 24" fill="#f5de19">
                    <path
                      d="M12.043 23.968c.479-.004.953-.029 1.426-.094a11.805 11.805 0 0 0 3.146-.863 12.404 12.404 0 0 0 3.793-2.542 11.977 11.977 0 0 0 2.44-3.427 11.794 11.794 0 0 0 1.02-3.476c.149-1.16.135-2.346-.045-3.499a11.96 11.96 0 0 0-.793-2.788 11.197 11.197 0 0 0-.854-1.617c-1.168-1.837-2.861-3.314-4.81-4.3a12.835 12.835 0 0 0-2.172-.87h-.005c.119.063.24.132.345.201.553.365 1.033.8 1.473 1.272l.015.017h-.001c.313.334.604.69.867 1.067.268.394.503.808.707 1.239.39.823.676 1.7.832 2.6.165.95.208 1.918.105 2.87a11.06 11.06 0 0 1-.558 2.336 9.83 9.83 0 0 1-1.015 2.084 9.632 9.632 0 0 1-1.479 1.82 10.514 10.514 0 0 1-1.819 1.473 10.322 10.322 0 0 1-2.074 1.012 10.09 10.09 0 0 1-2.34.558c-.951.104-1.92.06-2.87-.105a9.792 9.792 0 0 1-2.596-.83 9.832 9.832 0 0 1-1.239-.706 9.404 9.404 0 0 1-1.074-.873 10.08 10.08 0 0 1-1.277-1.47c-.069-.098-.138-.197-.202-.346l.025.027a12.906 12.906 0 0 0 2.49 3.678 12.033 12.033 0 0 0 3.218 2.345c1.033.512 2.141.9 3.293 1.124.596.116 1.202.183 1.813.202z"
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
                      d="M.15 7.57L4.07 12l-3.92 4.43h1.62l3.1-3.5 3.1 3.5h1.62L5.67 12l3.92-4.43H8.04l-3.1 3.5-3.1-3.5H.15z"
                    />
                  </svg>
                }
                @default {
                  <svg viewBox="0 0 16 16" fill="#858585">
                    <path
                      d="M13.85 4.44l-3.28-3.3-.35-.14H2.5l-.5.5v13l.5.5h11l.5-.5V4.8l-.15-.36zM10 2.52l2.99 2.99H10V2.52zM3 14V2h6v4h4v8H3z"
                    />
                  </svg>
                }
              }
            </span>
            <span class="tab-name">{{ tab.name }}</span>
            <button class="tab-close" (click)="closeTab($event, tab.id)" title="Close">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path
                  d="M8 8.707l3.646 3.647.708-.707L8.707 8l3.647-3.646-.707-.708L8 7.293 4.354 3.646l-.707.708L7.293 8l-3.646 3.646.707.708L8 8.707z"
                />
              </svg>
            </button>
          </div>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .tabs-bar {
        height: 35px;
        background-color: var(--vscode-editorGroupHeader-tabsBackground, #252526);
        border-bottom: 1px solid var(--vscode-editorGroupHeader-tabsBorder, #1e1e1e);
        display: flex;
        align-items: flex-end;
        overflow-x: auto;
        overflow-y: hidden;
      }

      .tabs-bar::-webkit-scrollbar {
        height: 3px;
      }

      .tabs-bar::-webkit-scrollbar-thumb {
        background-color: var(--vscode-scrollbarSlider-background, rgba(121, 121, 121, 0.4));
      }

      .tabs-container {
        display: flex;
        height: 100%;
      }

      .tab {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 0 10px;
        height: 35px;
        min-width: 120px;
        max-width: 200px;
        background-color: var(--vscode-tab-inactiveBackground, #2d2d2d);
        color: var(--vscode-tab-inactiveForeground, #969696);
        border-right: 1px solid var(--vscode-tab-border, #252526);
        cursor: pointer;
        font-size: 13px;
        position: relative;
      }

      .tab:hover {
        background-color: var(--vscode-tab-hoverBackground, #323232);
      }

      .tab.active {
        background-color: var(--vscode-tab-activeBackground, #1e1e1e);
        color: var(--vscode-tab-activeForeground, #ffffff);
      }

      .tab.active::after {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 1px;
        background-color: var(--vscode-tab-activeBorderTop, #007acc);
      }

      .tab-icon {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .tab-icon svg {
        width: 16px;
        height: 16px;
      }

      .tab-name {
        flex: 1;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .tab-close {
        width: 20px;
        height: 20px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--vscode-tab-inactiveForeground, #969696);
        border-radius: 3px;
        opacity: 0;
        transition: opacity 0.1s ease;
      }

      .tab:hover .tab-close,
      .tab.active .tab-close {
        opacity: 1;
      }

      .tab-close:hover {
        background-color: var(--vscode-toolbar-hoverBackground, rgba(90, 93, 94, 0.31));
      }

      .tab-close svg {
        width: 16px;
        height: 16px;
      }

      @media (max-width: 768px) {
        .tabs-bar {
          height: 32px;
        }

        .tab {
          min-width: 80px;
          max-width: 150px;
          height: 32px;
          padding: 0 8px;
          font-size: 12px;
          gap: 4px;
        }

        .tab-close {
          width: 16px;
          height: 16px;
        }
      }

      @media (max-width: 480px) {
        .tab {
          min-width: 60px;
          max-width: 120px;
          font-size: 11px;
          padding: 0 6px;
        }

        .tab-icon {
          display: none;
        }

        .tab-close {
          display: none;
        }
      }
    `,
  ],
})
export class TabsBarComponent {
  editorState = inject(EditorStateService);

  closeTab(event: Event, tabId: string): void {
    event.stopPropagation();
    this.editorState.closeTab(tabId);
  }
}
