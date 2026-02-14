import { Component, ElementRef, inject, signal, ViewChild } from '@angular/core';
import { ChildrenOutletContexts, RouterOutlet } from '@angular/router';
import { routeTransitionAnimations } from '../../core/animations/route-animations';
import { TerminalComponent } from '../../shared/terminal/terminal.component';
import { ActivityBarComponent } from '../activity-bar/activity-bar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { StatusBarComponent } from '../status-bar/status-bar.component';
import { TabsBarComponent } from '../tabs-bar/tabs-bar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    ActivityBarComponent,
    SidebarComponent,
    TabsBarComponent,
    StatusBarComponent,
    TerminalComponent,
  ],
  animations: [routeTransitionAnimations],
  template: `
    <div class="vscode-layout">
      <!-- Title Bar -->
      <header class="title-bar">
        <div class="title-bar-left">
          <div class="window-controls macos">
            <span class="control close"></span>
            <span class="control minimize"></span>
            <span class="control maximize"></span>
          </div>
        </div>
        <div class="title-bar-center">
          <span class="title">Portfolio - Visual Studio Code</span>
        </div>
        <div class="title-bar-right"></div>
      </header>

      <!-- Main Content -->
      <div class="main-content">
        <app-activity-bar />
        <div class="content-wrapper">
          <app-sidebar />
          <main class="editor-area">
            <app-tabs-bar />
            <div
              class="editor-content"
              #editorContent
              (scroll)="onScroll()"
              [@routeAnimations]="getRouteAnimationData()"
            >
              <router-outlet />
            </div>

            <!-- Minimap decorativo -->
            <div class="minimap" [class.visible]="showMinimap()">
              <div
                class="minimap-viewport"
                [style.top.%]="minimapViewportTop()"
                [style.height.%]="minimapViewportHeight()"
              ></div>
              <div class="minimap-lines">
                @for (block of minimapBlocks; track $index) {
                  <div
                    class="minimap-line"
                    [class]="'minimap-line minimap-color-' + block.colorIndex"
                    [style.width.%]="block.width"
                    [style.opacity]="block.opacity"
                  ></div>
                }
              </div>
            </div>
          </main>
        </div>
      </div>

      <!-- Scroll to top -->
      @if (showScrollTop()) {
        <button class="scroll-to-top" (click)="scrollToTop()" [attr.aria-label]="'Scroll to top'">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 3.293l-4.354 4.354.708.707L8 4.707l3.646 3.647.708-.707L8 3.293z" />
          </svg>
        </button>
      }

      <!-- Status Bar -->
      <app-status-bar />

      <!-- Terminal Easter Egg (Ctrl + \`) -->
      <app-terminal />
    </div>
  `,
  styles: [
    `
      .vscode-layout {
        height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: var(--vscode-editor-background, #1e1e1e);
        color: var(--vscode-editor-foreground, #d4d4d4);
        font-family:
          -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell,
          'Open Sans', 'Helvetica Neue', sans-serif;
        overflow: hidden;
      }

      .title-bar {
        height: 30px;
        background-color: var(--vscode-titleBar-activeBackground, #3c3c3c);
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 12px;
        -webkit-app-region: drag;
      }

      .title-bar-left,
      .title-bar-right {
        width: 70px;
      }

      .title-bar-center {
        flex: 1;
        text-align: center;
      }

      .title {
        font-size: 12px;
        color: var(--vscode-titleBar-activeForeground, #cccccc);
      }

      .window-controls {
        display: flex;
        gap: 8px;
        -webkit-app-region: no-drag;
      }

      .window-controls.macos .control {
        width: 12px;
        height: 12px;
        border-radius: 50%;
        cursor: pointer;
      }

      .window-controls.macos .close {
        background-color: #ff5f57;
      }

      .window-controls.macos .minimize {
        background-color: #febc2e;
      }

      .window-controls.macos .maximize {
        background-color: #28c840;
      }

      .main-content {
        flex: 1;
        display: flex;
        overflow: hidden;
        position: relative;
      }

      .content-wrapper {
        flex: 1;
        display: flex;
        margin-left: 48px;
        overflow: hidden;
      }

      .editor-area {
        flex: 1;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        position: relative;
      }

      .editor-content {
        flex: 1;
        overflow: auto;
        background-color: var(--vscode-editor-background, #1e1e1e);
        position: relative;
      }

      /* Ocultar desborde durante la animación de transición */
      .editor-content.ng-animating {
        overflow: hidden;
      }

      /* ── Minimap ── */
      .minimap {
        position: absolute;
        top: 35px;
        right: 0;
        width: 50px;
        bottom: 0;
        background: var(--vscode-editor-background, #1e1e1e);
        border-left: 1px solid var(--vscode-editorGroup-border, #2d2d2d);
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
        overflow: hidden;
        z-index: 5;
      }

      .minimap.visible {
        opacity: 1;
      }

      .minimap-viewport {
        position: absolute;
        left: 0;
        right: 0;
        background: rgba(121, 121, 121, 0.12);
        border: 1px solid rgba(121, 121, 121, 0.2);
        min-height: 20px;
        z-index: 2;
        transition:
          top 0.1s ease-out,
          height 0.1s ease-out;
      }

      .minimap-lines {
        padding: 4px 6px;
        display: flex;
        flex-direction: column;
        gap: 2px;
      }

      .minimap-line {
        height: 2px;
        border-radius: 1px;
        min-width: 8px;
      }

      .minimap-color-0 {
        background: var(--syntax-keyword, #569cd6);
      }
      .minimap-color-1 {
        background: var(--syntax-type, #4ec9b0);
      }
      .minimap-color-2 {
        background: var(--syntax-string, #ce9178);
      }
      .minimap-color-3 {
        background: var(--syntax-comment, #6a9955);
      }
      .minimap-color-4 {
        background: var(--syntax-function, #dcdcaa);
      }
      .minimap-color-5 {
        background: var(--syntax-variable, #9cdcfe);
      }
      .minimap-color-6 {
        background: var(--syntax-decorator, #dcdcaa);
      }
      .minimap-color-7 {
        background: var(--syntax-escape, #d7ba7d);
      }

      /* ── Scroll to top ── */
      .scroll-to-top {
        position: fixed;
        bottom: 36px;
        right: 24px;
        width: 36px;
        height: 36px;
        border-radius: 4px;
        border: 1px solid var(--vscode-editorGroup-border, #444);
        background: var(--vscode-editor-background, #1e1e1e);
        color: var(--vscode-editor-foreground, #d4d4d4);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 50;
        opacity: 0.7;
        transition:
          opacity 0.2s,
          background 0.2s;
        animation: fadeInUp 0.3s ease-out;
      }

      .scroll-to-top:hover {
        opacity: 1;
        background: var(--vscode-list-hoverBackground, #2a2d2e);
      }

      .scroll-to-top svg {
        width: 16px;
        height: 16px;
      }

      @media (max-width: 768px) {
        .minimap {
          display: none;
        }

        .scroll-to-top {
          right: 12px;
          bottom: 30px;
        }

        .title-bar {
          height: 28px;
          padding: 0 8px;
        }

        .title {
          font-size: 11px;
        }

        .window-controls.macos .control {
          width: 10px;
          height: 10px;
        }

        .content-wrapper {
          margin-left: 40px;
        }
      }

      @media (max-width: 480px) {
        .title-bar-left,
        .title-bar-right {
          width: 50px;
        }

        .content-wrapper {
          margin-left: 36px;
        }
      }
    `,
  ],
})
export class MainLayoutComponent {
  @ViewChild('editorContent') editorContentRef!: ElementRef<HTMLElement>;
  private contexts = inject(ChildrenOutletContexts);

  getRouteAnimationData() {
    return this.contexts.getContext('primary')?.route?.snapshot?.url?.toString() || '';
  }

  showScrollTop = signal(false);
  showMinimap = signal(false);
  minimapViewportTop = signal(0);
  minimapViewportHeight = signal(20);

  minimapBlocks = this.generateMinimapBlocks();

  onScroll() {
    const el = this.editorContentRef?.nativeElement;
    if (!el) return;

    const scrollTop = el.scrollTop;
    const scrollHeight = el.scrollHeight;
    const clientHeight = el.clientHeight;
    const maxScroll = scrollHeight - clientHeight;

    // Show scroll-to-top after 200px
    this.showScrollTop.set(scrollTop > 200);

    // Show minimap when content is scrollable
    this.showMinimap.set(maxScroll > 100);

    // Update minimap viewport position
    if (maxScroll > 0) {
      const viewportRatio = clientHeight / scrollHeight;
      this.minimapViewportHeight.set(Math.max(10, viewportRatio * 100));
      this.minimapViewportTop.set((scrollTop / scrollHeight) * 100);
    }
  }

  scrollToTop() {
    this.editorContentRef?.nativeElement?.scrollTo({ top: 0, behavior: 'smooth' });
  }

  private generateMinimapBlocks() {
    const blocks = [];
    for (let i = 0; i < 60; i++) {
      blocks.push({
        width: Math.random() * 60 + 20,
        colorIndex: Math.floor(Math.random() * 8),
        opacity: Math.random() * 0.4 + 0.15,
      });
    }
    return blocks;
  }
}
