import type { MessageKey } from '../i18n/en';
import { useI18n } from '../i18n';
import { type NavName, href } from '../router';
import { Icon, type IconName } from './Icon';

const ITEMS: { name: NavName; href: string; icon: IconName; label: MessageKey }[] = [
  { name: 'home', href: href.home, icon: 'home', label: 'nav.home' },
  { name: 'tasks', href: href.tasks, icon: 'tasks', label: 'nav.tasks' },
  { name: 'earnings', href: href.earnings, icon: 'wallet', label: 'nav.earnings' },
  { name: 'history', href: href.history, icon: 'history', label: 'nav.history' },
  { name: 'profile', href: href.profile, icon: 'user', label: 'nav.profile' },
];

export function BottomNav({ active }: { active: NavName | null }) {
  const { t, ts } = useI18n();
  return (
    <nav className="bottom-nav" aria-label={ts('nav.label')}>
      <ul>
        {ITEMS.map((item) => (
          <li key={item.name}>
            <a href={item.href} aria-current={active === item.name ? 'page' : undefined}>
              <Icon name={item.icon} size={22} />
              <span className="bottom-nav__label">{t(item.label)}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
