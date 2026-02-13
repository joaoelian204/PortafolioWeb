import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from '../../core/services/supabase.service';
import { BANNER, executeCommand, getAutocompleteSuggestions } from './terminal-commands';
import { TerminalHistoryEntry, TerminalOutput, TerminalState } from './terminal.types';

@Injectable({
  providedIn: 'root',
})
export class TerminalService {
  // Estado del terminal
  private state: TerminalState = {
    currentPath: '~',
    history: [],
    commandHistory: [],
    historyIndex: -1,
  };

  // Señales reactivas
  isOpen = signal(false);
  history = signal<TerminalHistoryEntry[]>([]);
  currentPath = signal('~');

  private dataLoaded = false;

  constructor(
    private router: Router,
    private supabase: SupabaseService,
  ) {
    // Agregar banner inicial al historial
    this.addToHistory('', { type: 'info', content: BANNER, isHtml: true });
  }

  private async loadPortfolioData(): Promise<void> {
    if (this.dataLoaded) return;
    this.dataLoaded = true;

    try {
      const [profile, skills, projects, experiences] = await Promise.all([
        this.supabase.getProfile(),
        this.supabase.getSkills(),
        this.supabase.getProjects(),
        this.supabase.getExperiences(),
      ]);

      this.state.portfolioData = {
        profile: profile
          ? {
              name: profile.name,
              title: profile.title || '',
              email: profile.email || '',
              location: profile.location || '',
              socialLinks: profile.social_links || {},
            }
          : null,
        skills: (skills || []).map((s) => ({
          label: s.label,
          category: s.category,
          proficiency: s.proficiency,
        })),
        projects: (projects || []).map((p) => ({
          title: p.title,
          description: p.description || '',
          techStack: p.tech_stack || [],
          liveLink: p.live_link,
          repoLink: p.repo_link,
        })),
        experiences: (experiences || []).map((e) => ({
          company: e.company,
          position: e.position,
          startDate: e.start_date,
          endDate: e.end_date,
          isCurrent: e.is_current,
        })),
      };
    } catch (err) {
      console.error('Terminal: Error loading portfolio data', err);
    }
  }

  toggle(): void {
    this.isOpen.update((v) => !v);
    if (this.isOpen()) {
      this.loadPortfolioData();
    }
  }

  open(): void {
    this.isOpen.set(true);
    this.loadPortfolioData();
  }

  close(): void {
    this.isOpen.set(false);
  }

  execute(command: string): TerminalOutput {
    // Agregar al historial de comandos (si no está vacío)
    if (command.trim()) {
      this.state.commandHistory.push(command);
      this.state.historyIndex = this.state.commandHistory.length;
    }

    // Ejecutar el comando
    const output = executeCommand(command, this.state);

    // Manejar comandos especiales del sistema
    if (output.type === 'system') {
      if (output.content === '__CLEAR__') {
        this.clearHistory();
        return { type: 'success', content: '' };
      }

      if (output.content === '__EXIT__') {
        this.close();
        return { type: 'success', content: '' };
      }

      if (output.content.toString().startsWith('__NAVIGATE__')) {
        const route = output.content.toString().replace('__NAVIGATE__', '');
        this.router.navigate([route]);
        this.close();
        return {
          type: 'success',
          content: `Navigating to ${route}...`,
        };
      }
    }

    // Agregar al historial visual
    this.addToHistory(command, output);

    // Actualizar path actual
    this.currentPath.set(this.state.currentPath);

    return output;
  }

  private addToHistory(command: string, output: TerminalOutput): void {
    const entry: TerminalHistoryEntry = {
      command,
      output,
      timestamp: new Date(),
      path: this.state.currentPath,
    };

    this.state.history.push(entry);
    this.history.set([...this.state.history]);
  }

  private clearHistory(): void {
    this.state.history = [];
    this.history.set([]);
    // Mostrar banner después de limpiar
    this.addToHistory('', { type: 'info', content: BANNER, isHtml: true });
  }

  // Navegación por historial de comandos
  getPreviousCommand(): string | null {
    if (this.state.historyIndex > 0) {
      this.state.historyIndex--;
      return this.state.commandHistory[this.state.historyIndex];
    }
    return this.state.commandHistory[0] || null;
  }

  getNextCommand(): string | null {
    if (this.state.historyIndex < this.state.commandHistory.length - 1) {
      this.state.historyIndex++;
      return this.state.commandHistory[this.state.historyIndex];
    }
    this.state.historyIndex = this.state.commandHistory.length;
    return '';
  }

  // Autocompletado
  getAutocompletions(input: string): string[] {
    return getAutocompleteSuggestions(input, this.state.currentPath);
  }

  getCurrentPath(): string {
    return this.state.currentPath;
  }
}
