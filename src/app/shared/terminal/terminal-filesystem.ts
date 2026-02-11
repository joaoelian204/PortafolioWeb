import { FileSystemNode } from './terminal.types';

// Sistema de archivos virtual que representa la estructura del portafolio
export const VIRTUAL_FILE_SYSTEM: FileSystemNode = {
  name: '~',
  type: 'directory',
  children: [
    {
      name: 'home',
      type: 'file',
      route: '/',
      content: 'README.md - Página principal del portafolio con introducción y bienvenida.',
    },
    {
      name: 'about',
      type: 'file',
      route: '/about',
      content: 'about.tsx - Información personal, biografía y datos de contacto.',
    },
    {
      name: 'skills',
      type: 'directory',
      route: '/skills',
      children: [
        { name: 'languages', type: 'file', content: 'TypeScript, JavaScript, Python, HTML5, CSS3' },
        { name: 'frameworks', type: 'file', content: 'Angular, React, Node.js, NestJS' },
        { name: 'databases', type: 'file', content: 'PostgreSQL, MongoDB, Supabase' },
        { name: 'tools', type: 'file', content: 'Git, Docker, VS Code, AWS' },
      ],
    },
    {
      name: 'projects',
      type: 'directory',
      route: '/projects',
      children: [
        { name: 'featured', type: 'file', content: 'Proyectos destacados del portafolio' },
        { name: 'all', type: 'file', content: 'Todos los proyectos realizados' },
      ],
    },
    {
      name: 'experience',
      type: 'directory',
      route: '/experience',
      children: [
        { name: 'work', type: 'file', content: 'Experiencia laboral profesional' },
        { name: 'education', type: 'file', content: 'Formación académica y certificaciones' },
      ],
    },
    {
      name: 'contact',
      type: 'file',
      route: '/contact',
      content: 'contact.tsx - Formulario de contacto y datos de comunicación.',
    },
    {
      name: 'settings',
      type: 'file',
      route: '/settings',
      content: 'settings.json - Configuración de tema e idioma del portafolio.',
    },
  ],
};

// Función helper para encontrar un nodo en el sistema de archivos
export function findNode(
  path: string,
  root: FileSystemNode = VIRTUAL_FILE_SYSTEM,
): FileSystemNode | null {
  const parts = path.split('/').filter((p) => p && p !== '~');

  if (parts.length === 0 || path === '~' || path === '/') {
    return root;
  }

  let current: FileSystemNode | null = root;

  for (const part of parts) {
    if (part === '..') {
      // Ir al padre - simplificado, volver a root
      current = root;
      continue;
    }

    if (part === '.') {
      continue;
    }

    if (!current || current.type !== 'directory' || !current.children) {
      return null;
    }

    const found: FileSystemNode | undefined = current.children.find((child) => child.name === part);
    if (!found) {
      return null;
    }
    current = found;
  }

  return current;
}

// Función para resolver rutas relativas
export function resolvePath(currentPath: string, targetPath: string): string {
  if (targetPath.startsWith('~') || targetPath.startsWith('/')) {
    return targetPath.startsWith('~') ? targetPath : '~' + targetPath;
  }

  const currentParts = currentPath.split('/').filter((p) => p && p !== '~');
  const targetParts = targetPath.split('/').filter((p) => p);

  for (const part of targetParts) {
    if (part === '..') {
      currentParts.pop();
    } else if (part !== '.') {
      currentParts.push(part);
    }
  }

  return '~/' + currentParts.join('/');
}

// Función para obtener la ruta de navegación de un nodo
export function getNodeRoute(path: string): string | null {
  const node = findNode(path);
  if (!node) return null;

  if (node.route) return node.route;

  // Si es un subdirectorio, buscar el padre con ruta
  const parts = path.split('/').filter((p) => p && p !== '~');
  while (parts.length > 0) {
    const parentPath = '~/' + parts.slice(0, -1).join('/');
    const parentNode = findNode(parentPath);
    if (parentNode?.route) return parentNode.route;
    parts.pop();
  }

  return '/';
}
