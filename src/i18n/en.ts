/** English strings. The source of truth for keys; kn.ts is typed from this. */
export const en = {
  'app.name': 'Lokah Tasks',
  'app.tagline': 'Useful work. Fair rewards. Clear progress.',
  'app.notOfficial':
    'Portfolio prototype inspired by Kenpath Labs. Not an official Kenpath product.',
  'app.skip': 'Skip to content',

  'nav.label': 'Main',
  'nav.home': 'Home',
  'nav.tasks': 'Tasks',
  'nav.earnings': 'Earnings',
  'nav.history': 'History',
  'nav.profile': 'Profile',

  'common.demoData': 'Demo data',
  'common.englishOnly': '(English only)',
  'common.dismiss': 'Dismiss',
  'common.cancel': 'Cancel',
  'common.backToTasks': 'Back to tasks',

  'notice.recovered': 'Saved data could not be read, so the demo started fresh.',
  'notice.saveFailed':
    'Progress could not be saved on this device. It will be lost when you close the page.',

  'status.available': 'Available',
  'status.in_progress': 'In progress',
  'status.submitted': 'Submitted',
  'status.pending_review': 'Pending review',
  'status.approved': 'Approved',
  'status.needs_revision': 'Needs revision',

  'kind.listen_verify': 'Listen & Verify',
  'kind.describe_image': 'Describe an Image',

  'task.reward': 'Reward',
  'task.perHour': '≈ {rate} per hour',
  'task.minutes': 'About {n} min',
  'task.ratesNote': "Fictional example rates — not Kenpath Labs' rates.",
  'task.instructions': 'Instructions',
  'task.start': 'Start task',
  'task.submit': 'Submit for review',
  'task.resubmit': 'Resubmit for review',
  'task.submitted': 'Submitted. Your work is now pending review.',
  'task.pendingInfo': 'Waiting for review. A reward is only added after approval.',
  'task.approvedInfo': 'Approved. The reward has been added to your earnings.',
  'task.revisionInfo': 'Needs revision. No reward for this attempt. Reason:',
  'task.revisionAgain': 'Fix your answer below and resubmit.',
  'task.notFound': 'This task does not exist.',

  'listen.transcript': 'Transcript',
  'listen.question': 'Does the transcript match the audio?',
  'listen.matches': 'Matches',
  'listen.doesntMatch': "Doesn't match",
  'listen.chooseFirst': 'Choose an answer first.',

  'audio.label': 'Audio clip, {lang}',
  'audio.checking': 'Checking audio…',
  'audio.unavailable': 'Audio unavailable — try again later',
  'audio.submitDisabled': 'Submitting is turned off until the audio works.',

  'lang.en': 'English',
  'lang.kn': 'Kannada',

  'image.loading': 'Loading image…',
  'image.unavailable': 'Image unavailable — try again later',
  'image.submitDisabled': 'Submitting is turned off until the image loads.',

  'describe.label': 'Your description',
  'describe.hint': '{min} to {max} characters, in your own words.',
  'describe.count': '{n} of {max} characters',
  'describe.error.empty': 'Write a description first.',
  'describe.error.too_short': 'Too short. Write at least {min} characters.',
  'describe.error.too_long': 'Too long. Keep it to {max} characters or fewer.',
  'describe.error.copied': 'This repeats the instructions. Describe what you see instead.',
  'describe.error.copied_alt':
    "This is too close to the image's built-in description. Describe what you see in your own words.",

  'answer.yours': 'Your answer',

  'reviewer.title': 'Demo reviewer',
  'reviewer.disclaimer': 'Demo reviewer — simulated, not a real quality assessment.',
  'reviewer.suggestion': 'Suggestion',
  'reviewer.suggest.approve': 'Approve',
  'reviewer.suggest.needs_revision': 'Request revision',
  'reviewer.suggest.manual': 'Decide manually',
  'reviewer.approve': 'Approve',
  'reviewer.reasonLabel': 'Reason for revision (shown to the worker)',
  'reviewer.requestRevision': 'Request revision',
  'reviewer.reasonRequired': 'Add a reason before requesting revision.',
  'reviewer.approvedMsg': 'Approved. Reward added to earnings.',
  'reviewer.revisionMsg': 'Revision requested. No reward for this attempt.',

  'tasks.title': 'Tasks',
  'tasks.open': 'Ready for you',
  'tasks.inReview': 'In review',
  'tasks.done': 'Done',
  'tasks.emptyOpen': 'No open tasks right now. Check back later.',

  'home.hello': 'Hello',
  'home.helloName': 'Hello, {name}',
  'home.weekly': 'This week',
  'home.weeklyProgress': '{done} of {goal} tasks submitted',
  'home.noPressure': 'No pressure — come back when tasks suit you.',
  'home.milestone': 'Milestone: {n} tasks approved',
  'home.milestoneReached': 'Milestone reached: {n} tasks approved',
  'home.continue': 'Pick up where you left off',
  'home.available': 'Open tasks: {n}',
  'home.browse': 'Explore tasks',
  'home.earnings': 'Your earnings',
  'home.viewEarnings': 'View earnings',

  'earnings.title': 'Earnings',
  'earnings.approved': 'Approved',
  'earnings.pending': 'Pending review',
  'earnings.count': 'Tasks: {n}',
  'earnings.pendingNote': 'Pending rewards are not earned yet. They count only after approval.',
  'earnings.ledger': 'Approved rewards',
  'earnings.empty': 'No approved rewards yet.',
  'earnings.payoutTitle': 'About payouts',
  'earnings.payoutBody':
    'This demo has no withdrawals. On a real platform, payouts depend on the task agreement, quality review and the payout policy.',

  'history.title': 'History',
  'history.empty': 'Nothing here yet. Start a task to see its progress.',
  'history.resubmitted': 'Resubmitted',

  'profile.title': 'Profile',
  'profile.name': 'Display name (optional)',
  'profile.nameHint': 'Saved only on this device.',
  'profile.language': 'Language',
  'profile.privacy':
    'This demo stores no personal or financial data. Progress is saved only in this browser.',
  'profile.about': 'About',
  'profile.reset': 'Reset demo',
  'profile.resetHint': 'Clears all progress on this device.',

  'reset.title': 'Reset demo?',
  'reset.body':
    'This clears all tasks, earnings and history on this device. It cannot be undone.',
  'reset.confirm': 'Yes, reset',
  'reset.done': 'Demo reset. Everything is fresh.',

  'notFound.title': 'Page not found',
  'notFound.link': 'Go to Home',

  'home.heroTitle': 'Your contribution matters.',
  'home.welcome': 'Welcome to',
  'home.welcomeBack': 'Welcome back, {name}',
  'home.total': 'Approved total',
  'home.pendingLine': 'Pending review: {amount}. Not earned until approved.',
  'home.rewards': 'Your rewards',
  'home.picked': 'Tasks picked for you',
  'home.viewAll': 'View all',

  'tasks.filterLabel': 'Show task type',
  'tasks.filterAll': 'All',
  'tasks.emptyFilter': 'No tasks of this type here.',

  'audio.play': 'Play clip',
  'audio.pause': 'Pause clip',
  'audio.seek': 'Position in clip',
  'audio.timeOf': '{current} of {total}',

  'task.submittedTitle': 'Submitted!',
  'task.nextTask': 'Next task',

  'earnings.week': 'Approved this week',
  'earnings.weekEmpty': 'No approved rewards in the last 7 days.',

  'history.filterLabel': 'Show status',
  'history.pending': 'Pending',
  'history.emptyFilter': 'No tasks with this status.',
  'history.timeline': 'Show all updates',
} as const;

export type MessageKey = keyof typeof en;
export type Dictionary = Record<MessageKey, string>;
