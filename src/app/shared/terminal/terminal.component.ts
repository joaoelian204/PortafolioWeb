import { CommonModule, isPlatformBrowser } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TerminalService } from './terminal.service';

@Component({
  selector: 'app-terminal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    @if (terminal.isOpen()) {
      <div class="terminal-overlay" (click)="onOverlayClick($event)">
        <div class="terminal-container" (click)="$event.stopPropagation()">
          <!-- Terminal Header -->
          <div class="terminal-header">
            <div class="terminal-tabs">
              <div class="terminal-tab active">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  class="tab-icon"
                >
                  <polyline points="4 17 10 11 4 5"></polyline>
                  <line x1="12" y1="19" x2="20" y2="19"></line>
                </svg>
                <span>bash</span>
              </div>
            </div>
            <div class="terminal-actions">
              <button class="terminal-btn" title="Minimize">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
              <button class="terminal-btn" title="Maximize">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                </svg>
              </button>
              <button class="terminal-btn close" (click)="terminal.close()" title="Close (Esc)">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
          </div>

          <!-- Terminal Body -->
          <div class="terminal-body" #terminalBody (click)="focusInput()">
            <!-- History -->
            @for (entry of terminal.history(); track $index) {
              <div class="terminal-entry">
                @if (entry.command) {
                  <div class="command-line">
                    <span class="prompt">
                      <span class="user">visitor</span>
                      <span class="at">&#64;</span>
                      <span class="host">portfolio</span>
                      <span class="colon">:</span>
                      <span class="path">{{ entry.path }}</span>
                      <span class="dollar">$</span>
                    </span>
                    <span class="command">{{ entry.command }}</span>
                  </div>
                }
                @if (entry.output.content) {
                  <div
                    class="output"
                    [class.error]="entry.output.type === 'error'"
                    [class.warning]="entry.output.type === 'warning'"
                    [class.info]="entry.output.type === 'info'"
                    [innerHTML]="formatOutput(entry.output.content)"
                  ></div>
                }
              </div>
            }

            <!-- Current Input Line -->
            <div class="command-line input-line">
              <span class="prompt">
                <span class="user">visitor</span>
                <span class="at">&#64;</span>
                <span class="host">portfolio</span>
                <span class="colon">:</span>
                <span class="path">{{ terminal.currentPath() }}</span>
                <span class="dollar">$</span>
              </span>
              <input
                #commandInput
                type="text"
                class="command-input"
                [(ngModel)]="currentCommand"
                (keydown)="onKeyDown($event)"
                autocomplete="off"
                spellcheck="false"
              />
            </div>

            <!-- Autocomplete suggestions -->
            @if (suggestions().length > 0) {
              <div class="suggestions">
                @for (suggestion of suggestions(); track suggestion) {
                  <span
                    class="suggestion"
                    [class.directory]="suggestion.endsWith('/')"
                    (click)="applySuggestion(suggestion)"
                  >
                    {{ suggestion }}
                  </span>
                }
              </div>
            }
          </div>
        </div>
      </div>
    }
  `,
  styles: [
    `
      .terminal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: flex-end;
        justify-content: center;
        z-index: 1000;
        padding: 20px;
        animation: fadeIn 0.15s ease-out;
      }

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      .terminal-container {
        width: 100%;
        max-width: 900px;
        height: 60vh;
        max-height: 500px;
        background-color: var(--terminal-background, #1e1e1e);
        border-radius: 8px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        animation: slideUp 0.2s ease-out;
      }

      @keyframes slideUp {
        from {
          transform: translateY(20px);
          opacity: 0;
        }
        to {
          transform: translateY(0);
          opacity: 1;
        }
      }

      .terminal-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        background-color: var(--terminal-header, #2d2d2d);
        padding: 0 8px;
        height: 35px;
        border-bottom: 1px solid var(--terminal-border, #3c3c3c);
      }

      .terminal-tabs {
        display: flex;
        align-items: center;
      }

      .terminal-tab {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        font-size: 12px;
        color: var(--terminal-foreground, #cccccc);
        background-color: var(--terminal-background, #1e1e1e);
        border-radius: 4px 4px 0 0;
        margin-top: 4px;
      }

      .tab-icon {
        width: 14px;
        height: 14px;
      }

      .terminal-actions {
        display: flex;
        gap: 4px;
      }

      .terminal-btn {
        width: 28px;
        height: 28px;
        border: none;
        background: transparent;
        border-radius: 4px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--vscode-descriptionForeground, #858585);
        transition: all 0.15s ease;
      }

      .terminal-btn:hover {
        background-color: var(--terminal-border, #3c3c3c);
        color: var(--terminal-foreground, #cccccc);
      }

      .terminal-btn.close:hover {
        background-color: var(--syntax-error, #f14c4c);
        color: white;
      }

      .terminal-btn svg {
        width: 14px;
        height: 14px;
      }

      .terminal-body {
        flex: 1;
        overflow-y: auto;
        padding: 12px;
        font-family: 'Cascadia Code', 'Fira Code', 'Consolas', monospace;
        font-size: 13px;
        line-height: 1.5;
        cursor: text;
      }

      .terminal-body::-webkit-scrollbar {
        width: 10px;
      }

      .terminal-body::-webkit-scrollbar-track {
        background: var(--terminal-background, #1e1e1e);
      }

      .terminal-body::-webkit-scrollbar-thumb {
        background-color: var(--terminal-scrollbar, #424242);
        border-radius: 5px;
      }

      .terminal-entry {
        margin-bottom: 8px;
      }

      .command-line {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
      }

      .prompt {
        display: flex;
        align-items: center;
        margin-right: 8px;
        white-space: nowrap;
      }

      .user {
        color: var(--syntax-type, #4ec9b0);
      }
      .at {
        color: var(--syntax-punctuation, #d4d4d4);
      }
      .host {
        color: var(--syntax-type, #4ec9b0);
      }
      .colon {
        color: var(--syntax-punctuation, #d4d4d4);
      }
      .path {
        color: var(--syntax-keyword, #569cd6);
      }
      .dollar {
        color: var(--syntax-punctuation, #d4d4d4);
        margin-left: 4px;
      }

      .command {
        color: var(--syntax-function, #dcdcaa);
      }

      .output {
        color: var(--syntax-punctuation, #d4d4d4);
        white-space: pre-wrap;
        word-break: break-word;
        padding: 4px 0;
      }

      .output.error {
        color: var(--syntax-error, #f48771);
      }

      .output.warning {
        color: var(--syntax-warning, #cca700);
      }

      .output.info {
        color: var(--syntax-punctuation, #d4d4d4);
      }

      /* Estilos para HTML dentro del output */
      :host ::ng-deep .directory {
        color: var(--syntax-keyword, #569cd6);
        font-weight: 500;
      }

      :host ::ng-deep .file {
        color: var(--syntax-variable, #9cdcfe);
      }

      :host ::ng-deep .cmd-name {
        color: var(--syntax-function, #dcdcaa);
        font-weight: 500;
      }

      :host ::ng-deep .highlight {
        color: var(--syntax-type, #4ec9b0);
      }

      :host ::ng-deep .label {
        color: var(--syntax-keyword, #569cd6);
      }

      :host ::ng-deep .ascii-art {
        color: var(--syntax-constant, #4fc1ff);
        display: block;
      }

      :host ::ng-deep .ascii-small {
        color: var(--syntax-constant, #4fc1ff);
      }

      :host ::ng-deep .welcome-text {
        color: var(--syntax-type, #4ec9b0);
        font-weight: 500;
        display: block;
        margin-top: 8px;
      }

      :host ::ng-deep .hint-text {
        color: var(--syntax-comment, #6a9955);
        display: block;
        margin-top: 4px;
      }

      :host ::ng-deep .section-title {
        color: var(--syntax-decorator, #dcdcaa);
        font-weight: 600;
        display: block;
        margin-top: 8px;
      }

      :host ::ng-deep .success {
        color: var(--syntax-type, #4ec9b0);
      }

      :host ::ng-deep .warning {
        color: var(--syntax-string, #ce9178);
      }

      :host ::ng-deep .matrix {
        color: #00ff00;
        text-shadow: 0 0 5px #00ff00;
      }

      :host ::ng-deep .neofetch {
        display: block;
      }

      .input-line {
        position: relative;
      }

      .command-input {
        flex: 1;
        background: transparent;
        border: none;
        color: var(--syntax-function, #dcdcaa);
        font-family: inherit;
        font-size: inherit;
        outline: none;
        caret-color: var(--terminal-cursor, #aeafad);
        min-width: 100px;
      }

      .suggestions {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px 0;
        margin-left: 24px;
      }

      .suggestion {
        color: var(--syntax-variable, #9cdcfe);
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 3px;
        transition: background-color 0.1s ease;
      }

      .suggestion:hover {
        background-color: var(--terminal-border, #3c3c3c);
      }

      .suggestion.directory {
        color: var(--syntax-keyword, #569cd6);
      }

      @media (max-width: 600px) {
        .terminal-container {
          height: 70vh;
          max-height: none;
          border-radius: 8px 8px 0 0;
        }

        .terminal-overlay {
          padding: 0;
          align-items: flex-end;
        }

        .prompt {
          font-size: 11px;
        }

        .terminal-body {
          font-size: 12px;
        }
      }
    `,
  ],
})
export class TerminalComponent implements AfterViewInit, OnDestroy {
  @ViewChild('commandInput') commandInput!: ElementRef<HTMLInputElement>;
  @ViewChild('terminalBody') terminalBody!: ElementRef<HTMLDivElement>;

  terminal = inject(TerminalService);

  currentCommand = '';
  suggestions = signal<string[]>([]);

  private keydownHandler = (e: KeyboardEvent) => {
    // Ctrl + ` para abrir/cerrar terminal
    if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      this.terminal.toggle();
    }
    // Escape para cerrar
    if (e.key === 'Escape' && this.terminal.isOpen()) {
      this.terminal.close();
    }
  };

  constructor() {
    // Efecto para hacer scroll al final cuando cambia el historial
    effect(() => {
      if (this.terminal.history()) {
        setTimeout(() => this.scrollToBottom(), 10);
      }
    });

    // Efecto para enfocar input cuando se abre
    effect(() => {
      if (this.terminal.isOpen()) {
        setTimeout(() => this.focusInput(), 100);
      }
    });
  }

  private platformId = inject(PLATFORM_ID);

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.addEventListener('keydown', this.keydownHandler);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.removeEventListener('keydown', this.keydownHandler);
    }
  }

  focusInput(): void {
    this.commandInput?.nativeElement?.focus();
  }

  onKeyDown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Enter':
        this.executeCommand();
        break;
      case 'Tab':
        event.preventDefault();
        this.handleTab();
        break;
      case 'ArrowUp':
        event.preventDefault();
        this.navigateHistory('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        this.navigateHistory('down');
        break;
      case 'Escape':
        this.suggestions.set([]);
        break;
      case 'l':
        if (event.ctrlKey) {
          event.preventDefault();
          this.terminal.execute('clear');
        }
        break;
    }
  }

  executeCommand(): void {
    this.suggestions.set([]);
    this.terminal.execute(this.currentCommand);
    this.currentCommand = '';
    this.scrollToBottom();
  }

  handleTab(): void {
    const completions = this.terminal.getAutocompletions(this.currentCommand);

    if (completions.length === 1) {
      // Una sola opción: autocompletar
      const parts = this.currentCommand.split(/\s+/);
      if (parts.length === 1) {
        this.currentCommand = completions[0];
      } else {
        parts[parts.length - 1] = completions[0];
        this.currentCommand = parts.join(' ');
      }
      this.suggestions.set([]);
    } else if (completions.length > 1) {
      // Múltiples opciones: mostrar sugerencias
      this.suggestions.set(completions);
    }
  }

  applySuggestion(suggestion: string): void {
    const parts = this.currentCommand.split(/\s+/);
    if (parts.length === 1) {
      this.currentCommand = suggestion;
    } else {
      parts[parts.length - 1] = suggestion;
      this.currentCommand = parts.join(' ');
    }
    this.suggestions.set([]);
    this.focusInput();
  }

  navigateHistory(direction: 'up' | 'down'): void {
    const command =
      direction === 'up' ? this.terminal.getPreviousCommand() : this.terminal.getNextCommand();

    if (command !== null) {
      this.currentCommand = command;
    }
  }

  scrollToBottom(): void {
    if (this.terminalBody?.nativeElement) {
      const el = this.terminalBody.nativeElement;
      el.scrollTop = el.scrollHeight;
    }
  }

  formatOutput(content: string | string[]): string {
    if (Array.isArray(content)) {
      return content.join('\n');
    }
    return content.replace(/\\n/g, '\n');
  }

  onOverlayClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.terminal.close();
    }
  }
}
