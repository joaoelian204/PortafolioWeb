import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ActivityBarComponent } from '../activity-bar/activity-bar.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TabsBarComponent } from '../tabs-bar/tabs-bar.component';
import { StatusBarComponent } from '../status-bar/status-bar.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    RouterOutlet,
    ActivityBarComponent,
    SidebarComponent,
    TabsBarComponent,
    StatusBarComponent,
  ],
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
            <div class="editor-content">
              <router-outlet />
            </div>
          </main>
        </div>
      </div>

      <!-- Status Bar -->
      <app-status-bar />
    </div>
  `,
  styles: [`
    .vscode-layout {
      height: 100vh;
      display: flex;
      flex-direction: column;
      background-color: var(--vscode-editor-background, #1e1e1e);
      color: var(--vscode-editor-foreground, #d4d4d4);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
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
    }

    .editor-content {
      flex: 1;
      overflow: auto;
      background-color: var(--vscode-editor-background, #1e1e1e);
    }
  `],
})
export class MainLayoutComponent {}
