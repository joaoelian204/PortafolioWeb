import { findNode, getNodeRoute, resolvePath } from './terminal-filesystem';
import { TerminalCommand, TerminalOutput, TerminalState } from './terminal.types';

// ASCII Art del banner
const BANNER = `
<span class="ascii-art">
     ██╗ ██████╗  █████╗  ██████╗ 
     ██║██╔═══██╗██╔══██╗██╔═══██╗
     ██║██║   ██║███████║██║   ██║
██   ██║██║   ██║██╔══██║██║   ██║
╚█████╔╝╚██████╔╝██║  ██║╚██████╔╝
 ╚════╝  ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ 
</span>
<span class="welcome-text">Welcome to Joao's Portfolio Terminal v1.0.0</span>
<span class="hint-text">Type 'help' for a list of commands</span>
`;

// Definición de todos los comandos disponibles
export const TERMINAL_COMMANDS: Record<string, TerminalCommand> = {
  help: {
    name: 'help',
    description: 'Muestra la lista de comandos disponibles',
    usage: 'help [command]',
    execute: (args: string[]): TerminalOutput => {
      if (args.length > 0) {
        const cmd = TERMINAL_COMMANDS[args[0]];
        if (cmd) {
          return {
            type: 'info',
            content: `<span class="cmd-name">${cmd.name}</span> - ${cmd.description}${cmd.usage ? `\\nUsage: ${cmd.usage}` : ''}`,
            isHtml: true,
          };
        }
        return { type: 'error', content: `Command not found: ${args[0]}` };
      }

      const helpText = Object.values(TERMINAL_COMMANDS)
        .map((cmd) => `  <span class="cmd-name">${cmd.name.padEnd(12)}</span> ${cmd.description}`)
        .join('\\n');

      return {
        type: 'info',
        content: `Available commands:\\n\\n${helpText}\\n\\nTip: Use Tab for autocomplete, ↑↓ for history`,
        isHtml: true,
      };
    },
  },

  ls: {
    name: 'ls',
    description: 'Lista el contenido del directorio actual',
    usage: 'ls [path]',
    execute: (args: string[], terminal: TerminalState): TerminalOutput => {
      const targetPath =
        args.length > 0 ? resolvePath(terminal.currentPath, args[0]) : terminal.currentPath;

      const node = findNode(targetPath);

      if (!node) {
        return {
          type: 'error',
          content: `ls: cannot access '${args[0]}': No such file or directory`,
        };
      }

      if (node.type === 'file') {
        return { type: 'success', content: `<span class="file">${node.name}</span>`, isHtml: true };
      }

      if (!node.children || node.children.length === 0) {
        return { type: 'info', content: '(empty directory)' };
      }

      const items = node.children
        .map((child) => {
          if (child.type === 'directory') {
            return `<span class="directory">${child.name}/</span>`;
          }
          return `<span class="file">${child.name}</span>`;
        })
        .join('  ');

      return { type: 'success', content: items, isHtml: true };
    },
  },

  cd: {
    name: 'cd',
    description: 'Cambia el directorio actual',
    usage: 'cd <path>',
    execute: (args: string[], terminal: TerminalState): TerminalOutput => {
      if (args.length === 0 || args[0] === '~') {
        terminal.currentPath = '~';
        return { type: 'success', content: '' };
      }

      const targetPath = resolvePath(terminal.currentPath, args[0]);
      const node = findNode(targetPath);

      if (!node) {
        return { type: 'error', content: `cd: no such file or directory: ${args[0]}` };
      }

      if (node.type === 'file') {
        return { type: 'error', content: `cd: not a directory: ${args[0]}` };
      }

      terminal.currentPath = targetPath === '~/' ? '~' : targetPath.replace(/\/+$/, '');
      return { type: 'success', content: '' };
    },
  },

  pwd: {
    name: 'pwd',
    description: 'Muestra el directorio actual',
    execute: (_args: string[], terminal: TerminalState): TerminalOutput => {
      return { type: 'success', content: terminal.currentPath };
    },
  },

  cat: {
    name: 'cat',
    description: 'Muestra el contenido de un archivo',
    usage: 'cat <file>',
    execute: (args: string[], terminal: TerminalState): TerminalOutput => {
      if (args.length === 0) {
        return { type: 'error', content: 'cat: missing operand' };
      }

      const targetPath = resolvePath(terminal.currentPath, args[0]);
      const node = findNode(targetPath);

      if (!node) {
        return { type: 'error', content: `cat: ${args[0]}: No such file or directory` };
      }

      if (node.type === 'directory') {
        return { type: 'error', content: `cat: ${args[0]}: Is a directory` };
      }

      return { type: 'success', content: node.content || '(empty file)' };
    },
  },

  open: {
    name: 'open',
    description: 'Abre una sección del portafolio',
    usage: 'open <path>',
    execute: (args: string[], terminal: TerminalState): TerminalOutput => {
      if (args.length === 0) {
        return { type: 'error', content: 'open: missing operand. Usage: open <path>' };
      }

      const targetPath = resolvePath(terminal.currentPath, args[0]);
      const route = getNodeRoute(targetPath);

      if (!route) {
        return { type: 'error', content: `open: cannot open '${args[0]}': No route found` };
      }

      // Retornamos una señal especial para que el componente sepa que debe navegar
      return {
        type: 'system',
        content: `__NAVIGATE__${route}`,
      };
    },
  },

  clear: {
    name: 'clear',
    description: 'Limpia la pantalla del terminal',
    execute: (): TerminalOutput => {
      return { type: 'system', content: '__CLEAR__' };
    },
  },

  tree: {
    name: 'tree',
    description: 'Muestra la estructura de directorios',
    usage: 'tree [path]',
    execute: (args: string[], terminal: TerminalState): TerminalOutput => {
      const targetPath =
        args.length > 0 ? resolvePath(terminal.currentPath, args[0]) : terminal.currentPath;

      const node = findNode(targetPath);

      if (!node) {
        return { type: 'error', content: `tree: '${args[0]}': No such file or directory` };
      }

      const buildTree = (n: typeof node, prefix: string = '', isLast: boolean = true): string => {
        if (!n) return '';

        const connector = isLast ? '└── ' : '├── ';
        const name =
          n.type === 'directory'
            ? `<span class="directory">${n.name}/</span>`
            : `<span class="file">${n.name}</span>`;

        let result = prefix + connector + name + '\\n';

        if (n.type === 'directory' && n.children) {
          const childPrefix = prefix + (isLast ? '    ' : '│   ');
          n.children.forEach((child, index) => {
            result += buildTree(child, childPrefix, index === n.children!.length - 1);
          });
        }

        return result;
      };

      const rootName =
        node.type === 'directory'
          ? `<span class="directory">${node.name}/</span>`
          : `<span class="file">${node.name}</span>`;

      let tree = rootName + '\\n';
      if (node.children) {
        node.children.forEach((child, index) => {
          tree += buildTree(child, '', index === node.children!.length - 1);
        });
      }

      return { type: 'success', content: tree.trim(), isHtml: true };
    },
  },

  whoami: {
    name: 'whoami',
    description: 'Muestra información del usuario',
    execute: (_args: string[], terminal: TerminalState): TerminalOutput => {
      const profile = terminal.portfolioData?.profile;
      const name = profile?.name || 'Joao Moreira';
      const title = profile?.title || 'Developer';
      const location = profile?.location || 'Unknown';

      return {
        type: 'info',
        content: `<span class="highlight">visitor</span>@<span class="highlight">joao-portfolio</span>

<span class="label">Host:</span>       ${name}
<span class="label">Role:</span>       ${title}
<span class="label">Location:</span>   ${location}
<span class="label">Shell:</span>      portfolio-sh v1.0.0
<span class="label">Session:</span>    ${new Date().toISOString().split('T')[0]}
<span class="label">Permissions:</span> read-only (use <span class="cmd-name">sudo hire</span> to upgrade 😉)`,
        isHtml: true,
      };
    },
  },

  date: {
    name: 'date',
    description: 'Muestra la fecha y hora actual',
    execute: (): TerminalOutput => {
      return { type: 'success', content: new Date().toString() };
    },
  },

  echo: {
    name: 'echo',
    description: 'Imprime texto en el terminal',
    usage: 'echo <text>',
    execute: (args: string[]): TerminalOutput => {
      return { type: 'success', content: args.join(' ') };
    },
  },

  neofetch: {
    name: 'neofetch',
    description: 'Muestra información del sistema (portafolio)',
    execute: (_args: string[], terminal: TerminalState): TerminalOutput => {
      const data = terminal.portfolioData;
      const name = data?.profile?.name || 'Joao Moreira';
      const title = data?.profile?.title || 'Developer';
      const location = data?.profile?.location || 'Remote';
      const skillCount = data?.skills?.length || 0;
      const projectCount = data?.projects?.length || 0;
      const expCount = data?.experiences?.length || 0;

      const info = `
<span class="neofetch">
<span class="ascii-small">    ╭──────────╮
    │  ◉    ◉  │
    │    ▽▽    │
    │  ╰────╯  │
    ╰──────────╯</span>  <span class="highlight">${name}</span>
                 ─────────────────────
                 <span class="label">Title:</span> ${title}
                 <span class="label">Location:</span> ${location}
                 <span class="label">OS:</span> Portfolio VS Code Theme
                 <span class="label">Host:</span> Angular 21+
                 <span class="label">Kernel:</span> TypeScript 5.x
                 <span class="label">Shell:</span> portfolio-sh 1.0.0
                 <span class="label">Skills:</span> ${skillCount} technologies
                 <span class="label">Projects:</span> ${projectCount} published
                 <span class="label">Experience:</span> ${expCount} positions
                 <span class="label">Theme:</span> VS Code Dark+
                 <span class="label">CPU:</span> Passion & Coffee ☕
</span>`;
      return { type: 'info', content: info, isHtml: true };
    },
  },

  skills: {
    name: 'skills',
    description: 'Lista todas las habilidades técnicas',
    execute: (_args: string[], terminal: TerminalState): TerminalOutput => {
      const data = terminal.portfolioData;
      if (!data || data.skills.length === 0) {
        return {
          type: 'info',
          content: `<span class="section-title">Skills:</span>\n\n  Loading... Run <span class="cmd-name">goto skills</span> to see all skills.\n\n  <span class="hint-text">Tip: Try again in a moment if data is still loading.</span>`,
          isHtml: true,
        };
      }

      const categories: Record<string, typeof data.skills> = {};
      for (const skill of data.skills) {
        const cat = skill.category || 'other';
        if (!categories[cat]) categories[cat] = [];
        categories[cat].push(skill);
      }

      const categoryLabels: Record<string, string> = {
        languages: 'Languages',
        frameworks: 'Frameworks',
        databases: 'Databases',
        tools: 'Tools',
        other: 'Other',
      };

      let output = '';
      for (const [cat, skills] of Object.entries(categories)) {
        output += `\n<span class="section-title">${categoryLabels[cat] || cat}:</span>\n`;
        for (const skill of skills) {
          const filled = Math.round(skill.proficiency / 5);
          const empty = 20 - filled;
          const bar = '█'.repeat(filled) + '░'.repeat(empty);
          const name = skill.label.padEnd(14);
          output += `  ${name} ${bar} ${skill.proficiency}%\n`;
        }
      }

      return { type: 'info', content: output.trim(), isHtml: true };
    },
  },

  contact: {
    name: 'contact',
    description: 'Muestra información de contacto',
    execute: (_args: string[], terminal: TerminalState): TerminalOutput => {
      const profile = terminal.portfolioData?.profile;
      const social = profile?.socialLinks || {};

      let output = `\n<span class="section-title">Contact Information:</span>\n`;

      if (profile?.email) {
        output += `\n  <span class="label">Email:</span>    ${profile.email}`;
      }
      if (profile?.location) {
        output += `\n  <span class="label">Location:</span> ${profile.location}`;
      }

      const socialEntries: [string, string][] = [];
      const socialMap = [
        ['GitHub', 'github', 'github_enabled'],
        ['LinkedIn', 'linkedin', 'linkedin_enabled'],
        ['Twitter', 'twitter', 'twitter_enabled'],
        ['Instagram', 'instagram', 'instagram_enabled'],
        ['YouTube', 'youtube', 'youtube_enabled'],
        ['Website', 'website', 'website_enabled'],
      ];

      for (const [label, key, enabledKey] of socialMap) {
        if (social[key] && social[enabledKey] !== false) {
          socialEntries.push([label, social[key] as string]);
        }
      }

      if (socialEntries.length > 0) {
        output += `\n\n<span class="section-title">Social Links:</span>\n`;
        for (const [name, url] of socialEntries) {
          output += `\n  <span class="label">${name.padEnd(10)}</span> ${url}`;
        }
      }

      output += `\n\n  <span class="hint-text">Tip: Run 'goto contact' to send a message directly</span>`;

      return { type: 'info', content: output, isHtml: true };
    },
  },

  history: {
    name: 'history',
    description: 'Muestra el historial de comandos',
    execute: (_args: string[], terminal: TerminalState): TerminalOutput => {
      if (terminal.commandHistory.length === 0) {
        return { type: 'info', content: '(no commands in history)' };
      }

      const historyList = terminal.commandHistory
        .map((cmd, i) => `  ${(i + 1).toString().padStart(3)}  ${cmd}`)
        .join('\\n');

      return { type: 'success', content: historyList };
    },
  },

  exit: {
    name: 'exit',
    description: 'Cierra el terminal',
    execute: (): TerminalOutput => {
      return { type: 'system', content: '__EXIT__' };
    },
  },

  sudo: {
    name: 'sudo',
    description: 'Ejecuta un comando como superusuario',
    execute: (args: string[]): TerminalOutput => {
      if (args.length === 0) {
        return { type: 'error', content: 'sudo: missing command' };
      }

      if (args[0] === 'rm' && args.includes('-rf')) {
        return {
          type: 'error',
          content: `<span class="warning">Nice try! 😏 This portfolio is protected.</span>`,
          isHtml: true,
        };
      }

      if (args[0] === 'hire') {
        return {
          type: 'success',
          content: `<span class="success">✓ Request sent! Joao will contact you soon. 🚀</span>`,
          isHtml: true,
        };
      }

      return {
        type: 'warning',
        content: `visitor is not in the sudoers file. This incident will be reported.`,
      };
    },
  },

  matrix: {
    name: 'matrix',
    description: 'Activa el modo Matrix (spoiler: no realmente)',
    execute: (): TerminalOutput => {
      return {
        type: 'info',
        content: `<span class="matrix">Wake up, Neo... The Matrix has you...</span>\\n\\n<span class="hint-text">(Just kidding, this is a portfolio 😄)</span>`,
        isHtml: true,
      };
    },
  },

  banner: {
    name: 'banner',
    description: 'Muestra el banner de bienvenida',
    execute: (): TerminalOutput => {
      return { type: 'info', content: BANNER, isHtml: true };
    },
  },

  goto: {
    name: 'goto',
    description: 'Navega a una sección del portafolio',
    usage: 'goto <section>',
    execute: (args: string[]): TerminalOutput => {
      if (args.length === 0) {
        return {
          type: 'info',
          content: `Usage: goto <section>

Available sections:
  <span class="cmd-name">home</span>        Go to homepage
  <span class="cmd-name">about</span>       About me
  <span class="cmd-name">skills</span>      Technical skills
  <span class="cmd-name">projects</span>    Featured projects
  <span class="cmd-name">experience</span>  Work experience
  <span class="cmd-name">contact</span>     Contact form
  <span class="cmd-name">settings</span>    Theme & language`,
          isHtml: true,
        };
      }

      const routes: Record<string, string> = {
        home: '/',
        about: '/about',
        skills: '/skills',
        projects: '/projects',
        experience: '/experience',
        contact: '/contact',
        settings: '/settings',
      };

      const section = args[0].toLowerCase();
      const route = routes[section];

      if (!route) {
        return {
          type: 'error',
          content: `goto: unknown section '${section}'. Type 'goto' for available sections.`,
        };
      }

      return { type: 'system', content: `__NAVIGATE__${route}` };
    },
  },

  download: {
    name: 'download',
    description: 'Descarga el CV/Resume',
    usage: 'download cv',
    execute: (args: string[]): TerminalOutput => {
      if (args.length === 0 || args[0].toLowerCase() !== 'cv') {
        return { type: 'info', content: `Usage: download cv\n\nDownloads the latest CV/Resume.` };
      }

      return {
        type: 'system',
        content: '__NAVIGATE__/about',
      };
    },
  },

  projects: {
    name: 'projects',
    description: 'Lista los proyectos destacados',
    execute: (_args: string[], terminal: TerminalState): TerminalOutput => {
      const data = terminal.portfolioData;
      if (!data || data.projects.length === 0) {
        return {
          type: 'info',
          content: `<span class="section-title">Projects:</span>\n\n  No projects loaded. Run <span class="cmd-name">goto projects</span> to see them.\n\n  <span class="hint-text">Tip: Try again in a moment if data is still loading.</span>`,
          isHtml: true,
        };
      }

      let output = `<span class="section-title">Published Projects (${data.projects.length}):</span>\n`;

      for (let i = 0; i < data.projects.length; i++) {
        const p = data.projects[i];
        output += `\n  <span class="highlight">${i + 1}. ${p.title}</span>`;
        if (p.description) {
          const desc =
            p.description.length > 80 ? p.description.substring(0, 77) + '...' : p.description;
          output += `\n     ${desc}`;
        }
        if (p.techStack.length > 0) {
          output += `\n     <span class="label">Tech:</span> ${p.techStack.join(', ')}`;
        }
        const links = [];
        if (p.liveLink) links.push(`<span class="cmd-name">Live</span>: ${p.liveLink}`);
        if (p.repoLink) links.push(`<span class="cmd-name">Repo</span>: ${p.repoLink}`);
        if (links.length > 0) {
          output += `\n     ${links.join('  |  ')}`;
        }
      }

      output += `\n\n  <span class="hint-text">Run 'goto projects' for the full interactive view</span>`;

      return { type: 'info', content: output, isHtml: true };
    },
  },

  theme: {
    name: 'theme',
    description: 'Cambia el tema (dark/light)',
    usage: 'theme <dark|light>',
    execute: (args: string[]): TerminalOutput => {
      if (args.length === 0) {
        return {
          type: 'info',
          content: `Usage: theme <dark|light>\n\nCurrent theme can be changed in settings.\nRun <span class="cmd-name">goto settings</span> to open settings.`,
          isHtml: true,
        };
      }
      return { type: 'system', content: '__NAVIGATE__/settings' };
    },
  },

  weather: {
    name: 'weather',
    description: 'Muestra el "clima" del código',
    execute: (): TerminalOutput => {
      const forecasts = [
        '☀️  Clear skies — 0 bugs detected',
        '⛅  Partly cloudy — minor refactoring needed',
        '🌧️  Light rain — some warnings in console',
        '⚡  Thunderstorm — merge conflict ahead!',
        '🌈  After the storm — all tests passing!',
      ];
      const forecast = forecasts[Math.floor(Math.random() * forecasts.length)];
      return {
        type: 'info',
        content: `<span class="section-title">Code Weather Forecast:</span>\n\n  ${forecast}\n\n  <span class="hint-text">Powered by /dev/random</span>`,
        isHtml: true,
      };
    },
  },
};

// Función para ejecutar comandos
export function executeCommand(input: string, state: TerminalState): TerminalOutput {
  const trimmed = input.trim();

  if (!trimmed) {
    return { type: 'success', content: '' };
  }

  const parts = trimmed.split(/\\s+/);
  const commandName = parts[0].toLowerCase();
  const args = parts.slice(1);

  const command = TERMINAL_COMMANDS[commandName];

  if (!command) {
    return {
      type: 'error',
      content: `command not found: ${commandName}. Type 'help' for available commands.`,
    };
  }

  return command.execute(args, state);
}

// Función para autocompletar
export function getAutocompleteSuggestions(input: string, currentPath: string): string[] {
  const parts = input.trim().split(/\\s+/);

  // Si no hay espacios, autocompletar comandos
  if (parts.length === 1) {
    const partial = parts[0].toLowerCase();
    return Object.keys(TERMINAL_COMMANDS)
      .filter((cmd) => cmd.startsWith(partial))
      .sort();
  }

  // Si hay espacios, autocompletar paths
  const partial = parts[parts.length - 1];
  const basePath = partial.includes('/')
    ? resolvePath(currentPath, partial.substring(0, partial.lastIndexOf('/') + 1))
    : currentPath;

  const node = findNode(basePath);
  if (!node || !node.children) return [];

  const prefix = partial.includes('/') ? partial.substring(0, partial.lastIndexOf('/') + 1) : '';
  const search = partial.includes('/') ? partial.substring(partial.lastIndexOf('/') + 1) : partial;

  return node.children
    .filter((child) => child.name.toLowerCase().startsWith(search.toLowerCase()))
    .map((child) => prefix + child.name + (child.type === 'directory' ? '/' : ''))
    .sort();
}

// Exportar el banner para uso inicial
export { BANNER };

