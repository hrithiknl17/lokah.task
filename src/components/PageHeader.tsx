import type { ReactNode } from 'react';
import { LogoMark } from './Icon';

/** Logo mark + the page's only <h1>. Focus moves to the heading on navigation. */
export function PageHeader({ title, aside }: { title: ReactNode; aside?: ReactNode }) {
  return (
    <header className="page-header">
      <LogoMark size={26} />
      <h1 tabIndex={-1}>{title}</h1>
      {aside && <div className="page-header__aside">{aside}</div>}
    </header>
  );
}
