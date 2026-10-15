import { useSyncExternalStore } from 'react';

export type Route =
  | { name: 'home' }
  | { name: 'tasks' }
  | { name: 'task'; taskId: string }
  | { name: 'earnings' }
  | { name: 'history' }
  | { name: 'profile' }
  | { name: 'notFound' };

export type NavName = 'home' | 'tasks' | 'earnings' | 'history' | 'profile';

export function parseHash(hash: string): Route {
  const path = hash.replace(/^#/, '').replace(/\/+$/, '') || '/';
  if (path === '/') return { name: 'home' };
  if (path === '/tasks') return { name: 'tasks' };
  if (path === '/earnings') return { name: 'earnings' };
  if (path === '/history') return { name: 'history' };
  if (path === '/profile') return { name: 'profile' };
  const task = /^\/tasks\/([\w-]+)$/.exec(path);
  if (task?.[1]) return { name: 'task', taskId: task[1] };
  return { name: 'notFound' };
}

export const href = {
  home: '#/',
  tasks: '#/tasks',
  task: (taskId: string) => `#/tasks/${encodeURIComponent(taskId)}`,
  earnings: '#/earnings',
  history: '#/history',
  profile: '#/profile',
} as const;

function subscribe(onChange: () => void): () => void {
  window.addEventListener('hashchange', onChange);
  return () => window.removeEventListener('hashchange', onChange);
}

function getHash(): string {
  return window.location.hash;
}

export function useHash(): string {
  return useSyncExternalStore(subscribe, getHash, () => '');
}

/** Which bottom-nav item a route belongs to. */
export function navFor(route: Route): NavName | null {
  switch (route.name) {
    case 'home':
      return 'home';
    case 'tasks':
    case 'task':
      return 'tasks';
    case 'earnings':
    case 'history':
    case 'profile':
      return route.name;
    default:
      return null;
  }
}
