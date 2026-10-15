import { useEffect, useRef } from 'react';
import { BottomNav } from './components/BottomNav';
import { Notice } from './components/Notice';
import { useI18n } from './i18n';
import { navFor, parseHash, useHash } from './router';
import { Earnings } from './screens/Earnings';
import { History } from './screens/History';
import { Home } from './screens/Home';
import { NotFound } from './screens/NotFound';
import { Profile } from './screens/Profile';
import { TaskDetail } from './screens/TaskDetail';
import { Tasks } from './screens/Tasks';
import { AppProvider, useAppState } from './state/context';
import type { Route } from './router';

function Screen({ route }: { route: Route }) {
  switch (route.name) {
    case 'home':
      return <Home />;
    case 'tasks':
      return <Tasks />;
    case 'task':
      return <TaskDetail key={route.taskId} taskId={route.taskId} />;
    case 'earnings':
      return <Earnings />;
    case 'history':
      return <History />;
    case 'profile':
      return <Profile />;
    default:
      return <NotFound />;
  }
}

function Shell() {
  const { t, lang } = useI18n();
  const { notice, dismissNotice } = useAppState();
  const hash = useHash();
  const route = parseHash(hash);
  const mainRef = useRef<HTMLElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  // On navigation, move focus to the new page heading so screen readers announce it.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    const heading = mainRef.current?.querySelector<HTMLElement>('h1');
    (heading ?? mainRef.current)?.focus();
  }, [hash]);

  return (
    <>
      <a className="skip-link" href="#main" onClick={(e) => {
        e.preventDefault();
        mainRef.current?.focus();
      }}>
        {t('app.skip')}
      </a>
      <header className="app-header">
        <span className="app-header__name">{t('app.name')}</span>
      </header>
      {notice && (
        <div className="app-notice">
          <Notice tone="warning" onDismiss={dismissNotice}>
            {t(notice === 'recovered' ? 'notice.recovered' : 'notice.saveFailed')}
          </Notice>
        </div>
      )}
      <main id="main" ref={mainRef} tabIndex={-1} className="app-main">
        <Screen route={route} />
      </main>
      <BottomNav active={navFor(route)} />
    </>
  );
}

export function App() {
  return (
    <AppProvider>
      <Shell />
    </AppProvider>
  );
}
