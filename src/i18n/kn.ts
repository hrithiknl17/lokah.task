import type { Dictionary } from './en';

/**
 * Kannada strings. Missing keys fall back to English with an "(English only)" tag.
 * TODO(user): proofread. Strings are kept short and simple on purpose.
 */
export const kn: Partial<Dictionary> = {
  'app.name': 'ಲೋಕಃ ಟಾಸ್ಕ್‌ಗಳು',
  'app.tagline': 'ಉಪಯುಕ್ತ ಕೆಲಸ. ನ್ಯಾಯಯುತ ಬಹುಮಾನ. ಸ್ಪಷ್ಟ ಪ್ರಗತಿ.',
  'app.skip': 'ಮುಖ್ಯ ವಿಷಯಕ್ಕೆ ಹೋಗಿ',

  'nav.label': 'ಮುಖ್ಯ',
  'nav.home': 'ಮುಖಪುಟ',
  'nav.tasks': 'ಕೆಲಸಗಳು',
  'nav.earnings': 'ಗಳಿಕೆ',
  'nav.history': 'ಇತಿಹಾಸ',
  'nav.profile': 'ಪ್ರೊಫೈಲ್',

  'common.demoData': 'ಡೆಮೊ ಡೇಟಾ',
  'common.dismiss': 'ಮುಚ್ಚಿ',
  'common.cancel': 'ರದ್ದು',
  'common.backToTasks': 'ಕೆಲಸಗಳಿಗೆ ಹಿಂತಿರುಗಿ',

  'notice.recovered': 'ಉಳಿಸಿದ ಡೇಟಾ ಓದಲು ಆಗಲಿಲ್ಲ. ಡೆಮೊ ಹೊಸದಾಗಿ ಆರಂಭವಾಗಿದೆ.',
  'notice.saveFailed': 'ಈ ಸಾಧನದಲ್ಲಿ ಪ್ರಗತಿ ಉಳಿಸಲು ಆಗಲಿಲ್ಲ. ಪುಟ ಮುಚ್ಚಿದರೆ ಅದು ಹೋಗುತ್ತದೆ.',

  'status.available': 'ಲಭ್ಯವಿದೆ',
  'status.in_progress': 'ನಡೆಯುತ್ತಿದೆ',
  'status.submitted': 'ಸಲ್ಲಿಸಲಾಗಿದೆ',
  'status.pending_review': 'ಪರಿಶೀಲನೆ ಬಾಕಿ',
  'status.approved': 'ಅನುಮೋದಿಸಲಾಗಿದೆ',
  'status.needs_revision': 'ತಿದ್ದುಪಡಿ ಬೇಕು',

  'kind.listen_verify': 'ಕೇಳಿ ಮತ್ತು ಪರಿಶೀಲಿಸಿ',
  'kind.describe_image': 'ಚಿತ್ರ ವಿವರಿಸಿ',

  'task.reward': 'ಬಹುಮಾನ',
  'task.perHour': 'ಗಂಟೆಗೆ ≈ {rate}',
  'task.minutes': 'ಸುಮಾರು {n} ನಿಮಿಷ',
  'task.ratesNote': 'ಕಾಲ್ಪನಿಕ ಉದಾಹರಣೆ ದರಗಳು — Kenpath Labs ದರಗಳಲ್ಲ.',
  'task.instructions': 'ಸೂಚನೆಗಳು',
  'task.start': 'ಕೆಲಸ ಆರಂಭಿಸಿ',
  'task.submit': 'ಪರಿಶೀಲನೆಗೆ ಸಲ್ಲಿಸಿ',
  'task.resubmit': 'ಮತ್ತೆ ಸಲ್ಲಿಸಿ',
  'task.submitted': 'ಸಲ್ಲಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಕೆಲಸ ಪರಿಶೀಲನೆಗೆ ಕಾಯುತ್ತಿದೆ.',
  'task.pendingInfo': 'ಪರಿಶೀಲನೆಗೆ ಕಾಯುತ್ತಿದೆ. ಅನುಮೋದನೆಯ ನಂತರವೇ ಬಹುಮಾನ ಸೇರುತ್ತದೆ.',
  'task.approvedInfo': 'ಅನುಮೋದಿಸಲಾಗಿದೆ. ಬಹುಮಾನ ನಿಮ್ಮ ಗಳಿಕೆಗೆ ಸೇರಿದೆ.',
  'task.revisionInfo': 'ತಿದ್ದುಪಡಿ ಬೇಕು. ಈ ಪ್ರಯತ್ನಕ್ಕೆ ಬಹುಮಾನ ಇಲ್ಲ. ಕಾರಣ:',
  'task.revisionAgain': 'ಕೆಳಗೆ ಉತ್ತರ ಸರಿಪಡಿಸಿ ಮತ್ತೆ ಸಲ್ಲಿಸಿ.',
  'task.notFound': 'ಈ ಕೆಲಸ ಇಲ್ಲ.',

  'listen.transcript': 'ಬರಹ',
  'listen.question': 'ಬರಹವು ಧ್ವನಿಗೆ ಹೊಂದುತ್ತದೆಯೇ?',
  'listen.matches': 'ಹೊಂದುತ್ತದೆ',
  'listen.doesntMatch': 'ಹೊಂದುವುದಿಲ್ಲ',
  'listen.chooseFirst': 'ಮೊದಲು ಒಂದು ಉತ್ತರ ಆಯ್ಕೆಮಾಡಿ.',

  'audio.label': 'ಧ್ವನಿ ಕ್ಲಿಪ್, {lang}',
  'audio.checking': 'ಧ್ವನಿ ಪರಿಶೀಲಿಸಲಾಗುತ್ತಿದೆ…',
  'audio.unavailable': 'ಧ್ವನಿ ಲಭ್ಯವಿಲ್ಲ — ನಂತರ ಪ್ರಯತ್ನಿಸಿ',
  'audio.submitDisabled': 'ಧ್ವನಿ ಸರಿಯಾಗುವವರೆಗೆ ಸಲ್ಲಿಸಲು ಆಗುವುದಿಲ್ಲ.',

  'lang.en': 'ಇಂಗ್ಲಿಷ್',
  'lang.kn': 'ಕನ್ನಡ',

  'image.loading': 'ಚಿತ್ರ ಲೋಡ್ ಆಗುತ್ತಿದೆ…',
  'image.unavailable': 'ಚಿತ್ರ ಲಭ್ಯವಿಲ್ಲ — ನಂತರ ಪ್ರಯತ್ನಿಸಿ',
  'image.submitDisabled': 'ಚಿತ್ರ ಲೋಡ್ ಆಗುವವರೆಗೆ ಸಲ್ಲಿಸಲು ಆಗುವುದಿಲ್ಲ.',

  'describe.label': 'ನಿಮ್ಮ ವಿವರಣೆ',
  'describe.hint': '{min} ರಿಂದ {max} ಅಕ್ಷರಗಳು, ನಿಮ್ಮದೇ ಮಾತಿನಲ್ಲಿ.',
  'describe.count': '{max} ರಲ್ಲಿ {n} ಅಕ್ಷರಗಳು',
  'describe.error.empty': 'ಮೊದಲು ವಿವರಣೆ ಬರೆಯಿರಿ.',
  'describe.error.too_short': 'ತುಂಬಾ ಚಿಕ್ಕದು. ಕನಿಷ್ಠ {min} ಅಕ್ಷರ ಬರೆಯಿರಿ.',
  'describe.error.too_long': 'ತುಂಬಾ ಉದ್ದ. {max} ಅಕ್ಷರದೊಳಗೆ ಇರಿಸಿ.',
  'describe.error.copied': 'ಇದು ಸೂಚನೆಯನ್ನೇ ಪುನರಾವರ್ತಿಸುತ್ತದೆ. ನೀವು ನೋಡಿದ್ದನ್ನು ಬರೆಯಿರಿ.',
  'describe.error.copied_alt':
    'ಇದು ಚಿತ್ರದ ಜೊತೆಗಿರುವ ವಿವರಣೆಗೆ ತುಂಬಾ ಹತ್ತಿರವಿದೆ. ನೀವು ನೋಡಿದ್ದನ್ನು ನಿಮ್ಮದೇ ಮಾತಿನಲ್ಲಿ ಬರೆಯಿರಿ.',

  'answer.yours': 'ನಿಮ್ಮ ಉತ್ತರ',

  'reviewer.title': 'ಡೆಮೊ ಪರಿಶೀಲಕ',
  'reviewer.disclaimer': 'ಡೆಮೊ ಪರಿಶೀಲಕ — ಅನುಕರಣೆ ಮಾತ್ರ, ನಿಜವಾದ ಗುಣಮಟ್ಟ ಮೌಲ್ಯಮಾಪನವಲ್ಲ.',
  'reviewer.suggestion': 'ಸಲಹೆ',
  'reviewer.suggest.approve': 'ಅನುಮೋದಿಸಿ',
  'reviewer.suggest.needs_revision': 'ತಿದ್ದುಪಡಿ ಕೇಳಿ',
  'reviewer.suggest.manual': 'ನೀವೇ ನಿರ್ಧರಿಸಿ',
  'reviewer.approve': 'ಅನುಮೋದಿಸಿ',
  'reviewer.reasonLabel': 'ತಿದ್ದುಪಡಿಗೆ ಕಾರಣ (ಕೆಲಸಗಾರರಿಗೆ ಕಾಣುತ್ತದೆ)',
  'reviewer.requestRevision': 'ತಿದ್ದುಪಡಿ ಕೇಳಿ',
  'reviewer.reasonRequired': 'ತಿದ್ದುಪಡಿ ಕೇಳುವ ಮೊದಲು ಕಾರಣ ಸೇರಿಸಿ.',
  'reviewer.approvedMsg': 'ಅನುಮೋದಿಸಲಾಗಿದೆ. ಬಹುಮಾನ ಗಳಿಕೆಗೆ ಸೇರಿದೆ.',
  'reviewer.revisionMsg': 'ತಿದ್ದುಪಡಿ ಕೇಳಲಾಗಿದೆ. ಈ ಪ್ರಯತ್ನಕ್ಕೆ ಬಹುಮಾನ ಇಲ್ಲ.',

  'tasks.title': 'ಕೆಲಸಗಳು',
  'tasks.open': 'ನಿಮಗಾಗಿ ಸಿದ್ಧ',
  'tasks.inReview': 'ಪರಿಶೀಲನೆಯಲ್ಲಿ',
  'tasks.done': 'ಮುಗಿದಿದೆ',
  'tasks.emptyOpen': 'ಈಗ ಯಾವುದೇ ಕೆಲಸ ಇಲ್ಲ. ನಂತರ ನೋಡಿ.',

  'home.hello': 'ನಮಸ್ಕಾರ',
  'home.helloName': 'ನಮಸ್ಕಾರ, {name}',
  'home.weekly': 'ಈ ವಾರ',
  'home.weeklyProgress': '{goal} ರಲ್ಲಿ {done} ಕೆಲಸ ಸಲ್ಲಿಸಲಾಗಿದೆ',
  'home.noPressure': 'ಒತ್ತಡ ಇಲ್ಲ — ಕೆಲಸ ಸೂಕ್ತವಾದಾಗ ಬನ್ನಿ.',
  'home.milestone': 'ಗುರಿ: {n} ಕೆಲಸ ಅನುಮೋದನೆ',
  'home.milestoneReached': 'ಗುರಿ ತಲುಪಿದೆ: {n} ಕೆಲಸ ಅನುಮೋದನೆ',
  'home.continue': 'ಬಿಟ್ಟಲ್ಲಿಂದ ಮುಂದುವರಿಸಿ',
  'home.available': 'ತೆರೆದ ಕೆಲಸಗಳು: {n}',
  'home.browse': 'ಕೆಲಸಗಳನ್ನು ನೋಡಿ',
  'home.earnings': 'ನಿಮ್ಮ ಗಳಿಕೆ',
  'home.viewEarnings': 'ಗಳಿಕೆ ನೋಡಿ',

  'earnings.title': 'ಗಳಿಕೆ',
  'earnings.approved': 'ಅನುಮೋದಿತ',
  'earnings.pending': 'ಪರಿಶೀಲನೆ ಬಾಕಿ',
  'earnings.count': 'ಕೆಲಸಗಳು: {n}',
  'earnings.pendingNote': 'ಬಾಕಿ ಬಹುಮಾನ ಇನ್ನೂ ಗಳಿಸಿಲ್ಲ. ಅನುಮೋದನೆಯ ನಂತರವೇ ಎಣಿಕೆ.',
  'earnings.ledger': 'ಅನುಮೋದಿತ ಬಹುಮಾನಗಳು',
  'earnings.empty': 'ಇನ್ನೂ ಯಾವುದೇ ಅನುಮೋದಿತ ಬಹುಮಾನ ಇಲ್ಲ.',
  'earnings.payoutTitle': 'ಪಾವತಿ ಬಗ್ಗೆ',
  'earnings.payoutBody':
    'ಈ ಡೆಮೊದಲ್ಲಿ ಹಣ ಹಿಂಪಡೆಯುವಿಕೆ ಇಲ್ಲ. ನಿಜವಾದ ವೇದಿಕೆಯಲ್ಲಿ ಪಾವತಿಯು ಕೆಲಸದ ಒಪ್ಪಂದ, ಗುಣಮಟ್ಟ ಪರಿಶೀಲನೆ ಮತ್ತು ಪಾವತಿ ನೀತಿಯನ್ನು ಅವಲಂಬಿಸಿರುತ್ತದೆ.',

  'history.title': 'ಇತಿಹಾಸ',
  'history.empty': 'ಇನ್ನೂ ಏನೂ ಇಲ್ಲ. ಪ್ರಗತಿ ನೋಡಲು ಒಂದು ಕೆಲಸ ಆರಂಭಿಸಿ.',
  'history.resubmitted': 'ಮತ್ತೆ ಸಲ್ಲಿಸಲಾಗಿದೆ',

  'profile.title': 'ಪ್ರೊಫೈಲ್',
  'profile.name': 'ಪ್ರದರ್ಶನ ಹೆಸರು (ಐಚ್ಛಿಕ)',
  'profile.nameHint': 'ಈ ಸಾಧನದಲ್ಲಿ ಮಾತ್ರ ಉಳಿಯುತ್ತದೆ.',
  'profile.language': 'ಭಾಷೆ',
  'profile.privacy':
    'ಈ ಡೆಮೊ ಯಾವುದೇ ವೈಯಕ್ತಿಕ ಅಥವಾ ಹಣಕಾಸು ಡೇಟಾ ಉಳಿಸುವುದಿಲ್ಲ. ಪ್ರಗತಿ ಈ ಬ್ರೌಸರ್‌ನಲ್ಲಿ ಮಾತ್ರ.',
  'profile.about': 'ಬಗ್ಗೆ',
  'profile.reset': 'ಡೆಮೊ ಮರುಹೊಂದಿಸಿ',
  'profile.resetHint': 'ಈ ಸಾಧನದ ಎಲ್ಲಾ ಪ್ರಗತಿ ಅಳಿಸುತ್ತದೆ.',

  'reset.title': 'ಡೆಮೊ ಮರುಹೊಂದಿಸಬೇಕೆ?',
  'reset.body': 'ಈ ಸಾಧನದ ಎಲ್ಲಾ ಕೆಲಸ, ಗಳಿಕೆ ಮತ್ತು ಇತಿಹಾಸ ಅಳಿಸುತ್ತದೆ. ಹಿಂತಿರುಗಿಸಲು ಆಗುವುದಿಲ್ಲ.',
  'reset.confirm': 'ಹೌದು, ಮರುಹೊಂದಿಸಿ',
  'reset.done': 'ಡೆಮೊ ಮರುಹೊಂದಿಸಲಾಗಿದೆ.',

  'notFound.title': 'ಪುಟ ಸಿಗಲಿಲ್ಲ',
  'notFound.link': 'ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ',

  // Intentionally untranslated, to show the "(English only)" fallback:
  // 'app.notOfficial', 'common.englishOnly'
};
