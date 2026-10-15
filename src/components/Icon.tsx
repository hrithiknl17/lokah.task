const PATHS = {
  home: 'M3 11.5 12 4l9 7.5M5.5 9.5V20h13V9.5',
  tasks: 'M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01',
  wallet: 'M3 7h16a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Zm0 0 2-3h11l1 3m-1 7h.01',
  history: 'M12 7v5l3 2M3.5 12a8.5 8.5 0 1 0 2.5-6M3 4v4h4',
  user: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm-7 8a7 7 0 0 1 14 0',
  // Status icons
  available: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  in_progress: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-16v16',
  submitted: 'M12 19V5m0 0-6 6m6-6 6 6',
  pending_review: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-12v4l3 2',
  approved: 'M5 12.5 10 17l9-10',
  needs_revision: 'M20 12a8 8 0 1 1-2.3-5.6M20 4v4h-4',
  alert: 'M12 9v4m0 4h.01M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z',
  info: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-9v5m0-8h.01',
  close: 'M6 6l12 12M18 6 6 18',
  chevronLeft: 'M15 5l-7 7 7 7',
  chevronRight: 'M9 5l7 7-7 7',
} as const;

export type IconName = keyof typeof PATHS;

/** Decorative icon. Always paired with visible text, so hidden from assistive tech. */
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      className="icon"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
