// Tipos para el Terminal
export interface TerminalCommand {
  name: string;
  description: string;
  usage?: string;
  execute: (args: string[], terminal: TerminalState) => TerminalOutput;
}

export interface TerminalOutput {
  type: 'success' | 'error' | 'info' | 'warning' | 'system';
  content: string | string[];
  isHtml?: boolean;
}

export interface TerminalHistoryEntry {
  command: string;
  output: TerminalOutput;
  timestamp: Date;
  path: string;
}

export interface TerminalState {
  currentPath: string;
  history: TerminalHistoryEntry[];
  commandHistory: string[];
  historyIndex: number;
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  route?: string;
  children?: FileSystemNode[];
  content?: string;
}
