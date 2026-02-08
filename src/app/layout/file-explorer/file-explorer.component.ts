import { NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FileNode } from '../../core/models/database.types';
import { EditorStateService } from '../../core/services/editor-state.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-file-explorer',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <div class="file-explorer">
      <!-- Header -->
      <div class="explorer-header">
        <span class="explorer-title">{{ i18n.t('nav.explorer') }}</span>
        <div class="explorer-actions">
          <button class="action-btn" title="New File">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M9.5 1.1l3.4 3.4.1.5v9c0 .6-.4 1-1 1H4c-.6 0-1-.4-1-1V2c0-.6.4-1 1-1h5.1l.4.1zM9 2H4v12h8V5H9V2z"
              />
            </svg>
          </button>
          <button class="action-btn" title="New Folder">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path
                d="M14 4H9.618l-1-2H2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z"
              />
            </svg>
          </button>
          <button class="action-btn" title="Collapse All" (click)="collapseAll()">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M9 9H4v1h5V9z" />
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M5 3l1-1h7l1 1v7l-1 1h-2v2l-1 1H3l-1-1V6l1-1h2V3zm1 2h4l1 1v4h2V3H6v2zm4 1H3v7h7V6z"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- File Tree -->
      <div class="file-tree">
        @for (node of editorState.fileTree; track node.name) {
          <ng-container
            *ngTemplateOutlet="fileNodeTemplate; context: { node: node, depth: 0 }"
          ></ng-container>
        }
      </div>

      <!-- Recursive template for file nodes -->
      <ng-template #fileNodeTemplate let-node="node" let-depth="depth">
        @if (node.type === 'folder') {
          <div
            class="tree-item folder"
            [style.padding-left.px]="depth * 16 + 8"
            (click)="editorState.toggleFolder(node)"
          >
            <span class="chevron" [class.open]="node.isOpen">
              <svg viewBox="0 0 16 16" fill="currentColor">
                <path d="M6 4l4 4-4 4V4z" />
              </svg>
            </span>
            <span class="folder-icon" [class.open]="node.isOpen">
              @if (node.isOpen) {
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path
                    d="M1.5 14h13l.5-.5v-8l-.5-.5H7.71l-1-1H1.5l-.5.5v9l.5.5zm0-9h4.79l1 1H14v7H2V5z"
                  />
                </svg>
              } @else {
                <svg viewBox="0 0 16 16" fill="currentColor">
                  <path
                    d="M14.5 3H7.71l-1-1H1.5l-.5.5v11l.5.5h13l.5-.5v-10l-.5-.5zm-.5 10H2V5h4.79l1 1H14v7z"
                  />
                </svg>
              }
            </span>
            <span class="node-name">{{ node.name }}</span>
          </div>
          @if (node.isOpen && node.children) {
            @for (child of node.children; track child.name) {
              <ng-container
                *ngTemplateOutlet="fileNodeTemplate; context: { node: child, depth: depth + 1 }"
              ></ng-container>
            }
          }
        } @else {
          <div
            class="tree-item file"
            [style.padding-left.px]="depth * 16 + 24"
            [class.active]="isActiveFile(node)"
            (click)="editorState.openFile(node)"
          >
            <span class="file-icon" [attr.data-ext]="node.extension">
              @switch (node.extension) {
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
                @case ('json') {
                  <svg viewBox="0 0 24 24" fill="#f5de19">
                    <path
                      d="M12.043 23.968c.479-.004.953-.029 1.426-.094a11.805 11.805 0 0 0 3.146-.863 12.404 12.404 0 0 0 3.793-2.542 11.977 11.977 0 0 0 2.44-3.427 11.794 11.794 0 0 0 1.02-3.476c.149-1.16.135-2.346-.045-3.499a11.96 11.96 0 0 0-.793-2.788 11.197 11.197 0 0 0-.854-1.617c-1.168-1.837-2.861-3.314-4.81-4.3a12.835 12.835 0 0 0-2.172-.87h-.005c.119.063.24.132.345.201.553.365 1.033.8 1.473 1.272l.015.017h-.001c.313.334.604.69.867 1.067.268.394.503.808.707 1.239.39.823.676 1.7.832 2.6.165.95.208 1.918.105 2.87a11.06 11.06 0 0 1-.558 2.336 9.83 9.83 0 0 1-1.015 2.084 9.632 9.632 0 0 1-1.479 1.82 10.514 10.514 0 0 1-1.819 1.473 10.322 10.322 0 0 1-2.074 1.012 10.09 10.09 0 0 1-2.34.558c-.951.104-1.92.06-2.87-.105a9.792 9.792 0 0 1-2.596-.83 9.832 9.832 0 0 1-1.239-.706 9.404 9.404 0 0 1-1.074-.873 10.08 10.08 0 0 1-1.277-1.47c-.069-.098-.138-.197-.202-.346l.025.027a12.906 12.906 0 0 0 2.49 3.678 12.033 12.033 0 0 0 3.218 2.345c1.033.512 2.141.9 3.293 1.124.596.116 1.202.183 1.813.202M8.343 1.597c-.526.004-1.05.029-1.57.094a11.805 11.805 0 0 0-3.146.863 12.404 12.404 0 0 0-3.793 2.543 11.977 11.977 0 0 0-2.44 3.427 11.794 11.794 0 0 0-1.02 3.476c-.149 1.16-.135 2.346.045 3.499a11.96 11.96 0 0 0 .793 2.788 11.197 11.197 0 0 0 .854 1.617c1.168 1.837 2.861 3.314 4.81 4.3.678.344 1.388.635 2.126.87l.049.016c-.119-.063-.24-.132-.345-.201a10.315 10.315 0 0 1-1.473-1.272l-.015-.017h.001a10.09 10.09 0 0 1-.867-1.067 9.792 9.792 0 0 1-.707-1.239 9.832 9.832 0 0 1-.832-2.6 10.09 10.09 0 0 1-.105-2.87c.055-.788.19-1.57.399-2.327a9.83 9.83 0 0 1 1.015-2.084 9.632 9.632 0 0 1 1.479-1.82 10.514 10.514 0 0 1 1.819-1.473 10.322 10.322 0 0 1 2.074-1.012 10.09 10.09 0 0 1 2.34-.558c.951-.104 1.92-.06 2.87.105a9.792 9.792 0 0 1 2.596.83c.432.206.85.44 1.239.706.396.27.77.564 1.122.881.318.286.612.593.882.921.345.418.66.862.943 1.328.069.098.138.197.202.346l-.025-.027a12.906 12.906 0 0 0-2.49-3.678 12.033 12.033 0 0 0-3.218-2.345 12.404 12.404 0 0 0-3.293-1.124 12.303 12.303 0 0 0-1.813-.202h-.09z"
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
                @default {
                  <svg viewBox="0 0 16 16" fill="#858585">
                    <path
                      d="M13.85 4.44l-3.28-3.3-.35-.14H2.5l-.5.5v13l.5.5h11l.5-.5V4.8l-.15-.36zm-.85 1.07H10V2.52l2.99 2.99zM3 14V2h6v4h4v8H3z"
                    />
                  </svg>
                }
              }
            </span>
            <span class="node-name">{{ node.name }}</span>
          </div>
        }
      </ng-template>
    </div>
  `,
  styles: [
    `
      .file-explorer {
        height: 100%;
        display: flex;
        flex-direction: column;
        background-color: var(--vscode-sideBar-background, #252526);
        color: var(--vscode-sideBar-foreground, #cccccc);
        font-size: 13px;
        user-select: none;
      }

      .explorer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        height: 35px;
        text-transform: uppercase;
        font-size: 11px;
        font-weight: 500;
        letter-spacing: 0.5px;
        color: var(--vscode-sideBarSectionHeader-foreground, #bbbbbb);
      }

      .explorer-actions {
        display: flex;
        gap: 4px;
        opacity: 0;
        transition: opacity 0.15s ease;
      }

      .file-explorer:hover .explorer-actions {
        opacity: 1;
      }

      .action-btn {
        width: 22px;
        height: 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: none;
        cursor: pointer;
        color: var(--vscode-icon-foreground, #c5c5c5);
        border-radius: 3px;
      }

      .action-btn:hover {
        background-color: var(--vscode-toolbar-hoverBackground, rgba(90, 93, 94, 0.31));
      }

      .action-btn svg {
        width: 16px;
        height: 16px;
      }

      .file-tree {
        flex: 1;
        overflow-y: auto;
        overflow-x: hidden;
      }

      .tree-item {
        display: flex;
        align-items: center;
        height: 22px;
        cursor: pointer;
        padding-right: 8px;
        white-space: nowrap;
      }

      .tree-item:hover {
        background-color: var(--vscode-list-hoverBackground, #2a2d2e);
      }

      .tree-item.active {
        background-color: var(--vscode-list-activeSelectionBackground, #094771);
        color: var(--vscode-list-activeSelectionForeground, #ffffff);
      }

      .chevron {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        transition: transform 0.1s ease;
      }

      .chevron svg {
        width: 16px;
        height: 16px;
        fill: currentColor;
      }

      .chevron.open {
        transform: rotate(90deg);
      }

      .folder-icon,
      .file-icon {
        width: 16px;
        height: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        margin-right: 4px;
      }

      .folder-icon svg,
      .file-icon svg {
        width: 16px;
        height: 16px;
      }

      .folder-icon {
        color: #dcb67a;
      }

      .folder-icon.open {
        color: #dcb67a;
      }

      .node-name {
        overflow: hidden;
        text-overflow: ellipsis;
      }

      /* Scrollbar styling */
      .file-tree::-webkit-scrollbar {
        width: 10px;
      }

      .file-tree::-webkit-scrollbar-track {
        background: transparent;
      }

      .file-tree::-webkit-scrollbar-thumb {
        background-color: var(--vscode-scrollbarSlider-background, rgba(121, 121, 121, 0.4));
        border-radius: 0;
      }

      .file-tree::-webkit-scrollbar-thumb:hover {
        background-color: var(--vscode-scrollbarSlider-hoverBackground, rgba(100, 100, 100, 0.7));
      }
    `,
  ],
})
export class FileExplorerComponent {
  editorState = inject(EditorStateService);
  i18n = inject(I18nService);

  isActiveFile(node: FileNode): boolean {
    const activeTab = this.editorState.activeTab();
    return activeTab?.route === node.route;
  }

  collapseAll(): void {
    const collapseRecursive = (nodes: FileNode[]) => {
      for (const node of nodes) {
        if (node.type === 'folder') {
          node.isOpen = false;
          if (node.children) {
            collapseRecursive(node.children);
          }
        }
      }
    };
    collapseRecursive(this.editorState.fileTree);
  }
}
