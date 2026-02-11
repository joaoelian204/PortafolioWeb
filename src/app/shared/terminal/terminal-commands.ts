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
    execute: (): TerminalOutput => {
      return {
        type: 'info',
        content: `<span class="highlight">visitor</span>@<span class="highlight">joao-portfolio</span>`,
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
    execute: (): TerminalOutput => {
      const info = `
<span class="neofetch">
<span class="ascii-small">    ╭──────────╮
    │  ◉    ◉  │
    │    ▽▽    │
    │  ╰────╯  │
    ╰──────────╯</span>  <span class="highlight">visitor</span>@<span class="highlight">joao-portfolio</span>
                 ─────────────────────
                 <span class="label">OS:</span> Portfolio VS Code Theme
                 <span class="label">Host:</span> Angular 17+
                 <span class="label">Kernel:</span> TypeScript 5.x
                 <span class="label">Shell:</span> portfolio-sh 1.0.0
                 <span class="label">Theme:</span> VS Code Dark+
                 <span class="label">Terminal:</span> Easter Egg Terminal
                 <span class="label">CPU:</span> Passion & Coffee
                 <span class="label">Memory:</span> Infinite Ideas
</span>`;
      return { type: 'info', content: info, isHtml: true };
    },
  },

  skills: {
    name: 'skills',
    description: 'Lista todas las habilidades técnicas',
    execute: (): TerminalOutput => {
      const skills = `
<span class="section-title">Languages:</span>
  TypeScript ████████████████████░░ 90%
  JavaScript ██████████████████████ 95%
  Python     ███████████████░░░░░░░ 75%

<span class="section-title">Frameworks:</span>
  Angular    ████████████████████░░ 90%
  React      ████████████████░░░░░░ 80%
  Node.js    █████████████████░░░░░ 85%

<span class="section-title">Databases:</span>
  PostgreSQL █████████████████░░░░░ 85%
  MongoDB    ████████████████░░░░░░ 80%
  Supabase   █████████████████░░░░░ 85%`;

      return { type: 'info', content: skills, isHtml: true };
    },
  },

  contact: {
    name: 'contact',
    description: 'Muestra información de contacto',
    execute: (): TerminalOutput => {
      return {
        type: 'info',
        content: `
<span class="section-title">Contact Information:</span>

  <span class="label">Email:</span>    Type 'open contact' to send a message
  <span class="label">GitHub:</span>   github.com/joao
  <span class="label">LinkedIn:</span> linkedin.com/in/joao

  <span class="hint-text">Tip: Run 'open contact' to navigate to the contact form</span>`,
        isHtml: true,
      };
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
