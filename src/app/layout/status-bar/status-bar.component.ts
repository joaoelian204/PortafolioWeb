import { Component, inject } from '@angular/core';
import { SupabaseService } from '../../core/services/supabase.service';
import { I18nService } from '../../core/services/i18n.service';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  template: `
    <footer class="status-bar">
      <div class="status-left">
        <div class="status-item branch">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M14 6.5v-5l-1-1H8l-1 1v5l1 1h1.5v2.793l-2.854 2.854a.5.5 0 0 0 .708.707l2.146-2.147V13.5l1 1h5l1-1v-5l-1-1h-5l-1 1v1.793L6.854 12.5a.5.5 0 0 0-.708-.707L8.793 9.5H10.5v-2H12V6.5l1 1h1.5l1-1z"/>
          </svg>
          <span>{{ i18n.t('status.branch') }}</span>
        </div>
        <div class="status-item sync">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M2.006 8.267L.78 9.5 0 8.73l2.09-2.07.76.01 2.09 2.12-.76.76-1.167-1.18a5 5 0 0 0 9.4 1.983l.813.597a6 6 0 0 1-11.22-2.683zm10.99-.5L11.76 6.55l-.76.76 2.09 2.11.76.01 2.09-2.07-.75-.76-1.167 1.18a5 5 0 0 0-9.4-1.983l-.813-.597a6 6 0 0 1 11.22 2.683l.007-.003z"/>
          </svg>
        </div>
        <div class="status-item errors">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm-.5-9h1v5h-1V5zm0 6h1v1h-1v-1z"/>
          </svg>
          <span>0</span>
        </div>
        <div class="status-item warnings">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M7.56 1h.88l6.54 12.26-.44.74H1.44l-.42-.74L7.56 1zm.44 1.7L2.33 13H13.67L8 2.7zM8 6l.5 4h-1L8 6zm-.5 5h1v1h-1v-1z"/>
          </svg>
          <span>0</span>
        </div>
      </div>
      <div class="status-right">
        <div class="status-item">{{ i18n.t('status.line') }} 1, {{ i18n.t('status.col') }} 1</div>
        <div class="status-item">{{ i18n.t('status.spaces') }}: 2</div>
        <div class="status-item">{{ i18n.t('status.encoding') }}</div>
        <div class="status-item">{{ i18n.t('status.language') }}</div>
        @if (supabase.isAuthenticated()) {
          <div class="status-item authenticated">
            <svg viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 13A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm3-8H5v1h6V6zm0 3H5v1h6V9z"/>
            </svg>
            <span>{{ i18n.t('status.authenticated') }}</span>
          </div>
        }
        <div class="status-item notification">
          <svg viewBox="0 0 16 16" fill="currentColor">
            <path d="M13.377 10.573a7.63 7.63 0 0 1-.383-2.38V6.195a5.115 5.115 0 0 0-1.268-3.446 5.138 5.138 0 0 0-3.242-1.722c-.694-.072-1.4 0-2.07.227-.67.215-1.28.574-1.794 1.053a4.923 4.923 0 0 0-1.208 1.675 5.067 5.067 0 0 0-.431 2.022v2.2a7.61 7.61 0 0 1-.383 2.37L2 12.343l.479.658h3.505c0 .526.215 1.04.586 1.412.37.37.885.586 1.412.586.526 0 1.04-.215 1.411-.586s.587-.886.587-1.412h3.505l.478-.658-.586-1.77zm-4.69 3.147a.997.997 0 0 1-.705.299.997.997 0 0 1-.706-.3.997.997 0 0 1-.3-.705h1.999a.939.939 0 0 1-.287.706zm5.515-1.71h-12.4l.4-1.204a8.616 8.616 0 0 0 .434-2.68V6.12a4.206 4.206 0 0 1 .364-1.726 4.066 4.066 0 0 1 1-1.397 4.038 4.038 0 0 1 1.488-.874 4.135 4.135 0 0 1 1.715-.19 4.388 4.388 0 0 1 2.695 1.435 4.26 4.26 0 0 1 1.054 2.868v1.878c0 .918.145 1.83.434 2.68l.4 1.216h-.584z"/>
          </svg>
        </div>
      </div>
    </footer>
  `,
  styles: [`
    .status-bar {
      height: 22px;
      background-color: var(--vscode-statusBar-background, #007acc);
      color: var(--vscode-statusBar-foreground, #ffffff);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 12px;
      padding: 0 8px;
    }

    .status-left,
    .status-right {
      display: flex;
      align-items: center;
      gap: 2px;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 4px;
      padding: 0 6px;
      height: 22px;
      cursor: pointer;
    }

    .status-item:hover {
      background-color: rgba(255, 255, 255, 0.12);
    }

    .status-item svg {
      width: 14px;
      height: 14px;
    }

    .status-item.errors svg {
      color: #f48771;
    }

    .status-item.warnings svg {
      color: #cca700;
    }

    .status-item.authenticated {
      background-color: rgba(255, 255, 255, 0.1);
      border-radius: 3px;
    }
  `],
})
export class StatusBarComponent {
  supabase = inject(SupabaseService);
  i18n = inject(I18nService);
}
