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
  portfolioData?: PortfolioData;
}

export interface PortfolioData {
  profile: {
    name: string;
    title: string;
    email: string;
    location: string;
    socialLinks: Record<string, string | boolean | undefined>;
  } | null;
  skills: {
    label: string;
    category: string;
    proficiency: number;
  }[];
  projects: {
    title: string;
    description: string;
    techStack: string[];
    liveLink: string | null;
    repoLink: string | null;
  }[];
  experiences: {
    company: string;
    position: string;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
  }[];
}

export interface FileSystemNode {
  name: string;
  type: 'file' | 'directory';
  route?: string;
  children?: FileSystemNode[];
  content?: string;
}
