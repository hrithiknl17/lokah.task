import type { LocalText, Task } from '../types';

/*
 * Fictional example rates — not Kenpath Labs' rates.
 * All rewards are in paise (100 paise = ₹1) and exist only for this demo.
 */

const LISTEN_INSTRUCTIONS: LocalText = {
  en: 'Listen to the clip. Does the transcript match exactly what is said?',
  kn: 'ಕ್ಲಿಪ್ ಕೇಳಿ. ಬರಹವು ಹೇಳಿದ್ದಕ್ಕೆ ಸರಿಯಾಗಿ ಹೊಂದುತ್ತದೆಯೇ?',
};

const DESCRIBE_INSTRUCTIONS: LocalText = {
  en: 'Describe what you see in the image in one to three plain sentences.',
  kn: 'ಚಿತ್ರದಲ್ಲಿ ಏನು ಕಾಣುತ್ತದೆ ಎಂದು ಒಂದರಿಂದ ಮೂರು ಸರಳ ವಾಕ್ಯಗಳಲ್ಲಿ ಬರೆಯಿರಿ.',
};

export const TASKS: readonly Task[] = [
  {
    id: 'lv-kn-01',
    kind: 'listen_verify',
    title: { en: 'Verify a Kannada greeting', kn: 'ಕನ್ನಡ ಶುಭಾಶಯ ಪರಿಶೀಲಿಸಿ' },
    instructions: LISTEN_INSTRUCTIONS,
    rewardPaise: 400,
    estMinutes: 1,
    audioSrc: '/audio/lv-kn-01.mp3',
    audioLanguage: 'kn',
    // TODO(user): fill exact transcript — audio should say this sentence.
    transcript: 'ನಮಸ್ಕಾರ, ನೀವು ಹೇಗಿದ್ದೀರಿ?',
    transcriptMatchesAudio: true,
  },
  {
    id: 'lv-kn-02',
    kind: 'listen_verify',
    title: { en: 'Verify a Kannada question', kn: 'ಕನ್ನಡ ಪ್ರಶ್ನೆ ಪರಿಶೀಲಿಸಿ' },
    instructions: LISTEN_INSTRUCTIONS,
    rewardPaise: 500,
    estMinutes: 1.5,
    audioSrc: '/audio/lv-kn-02.mp3',
    audioLanguage: 'kn',
    // TODO(user): fill exact transcript — audio should say this sentence.
    transcript: 'ಬಸ್ ನಿಲ್ದಾಣ ಎಲ್ಲಿದೆ?',
    transcriptMatchesAudio: true,
  },
  {
    id: 'lv-en-01',
    kind: 'listen_verify',
    title: { en: 'Verify an English sentence', kn: 'ಇಂಗ್ಲಿಷ್ ವಾಕ್ಯ ಪರಿಶೀಲಿಸಿ' },
    instructions: LISTEN_INSTRUCTIONS,
    rewardPaise: 400,
    estMinutes: 1,
    audioSrc: '/audio/lv-en-01.mp3',
    audioLanguage: 'en',
    // TODO(user): fill exact transcript — audio should say this sentence.
    transcript: 'The market opens at nine in the morning.',
    transcriptMatchesAudio: true,
  },
  {
    id: 'lv-en-02',
    kind: 'listen_verify',
    title: { en: 'Verify an English request', kn: 'ಇಂಗ್ಲಿಷ್ ವಿನಂತಿ ಪರಿಶೀಲಿಸಿ' },
    instructions: LISTEN_INSTRUCTIONS,
    rewardPaise: 400,
    estMinutes: 1,
    audioSrc: '/audio/lv-en-02.mp3',
    audioLanguage: 'en',
    // DELIBERATELY WRONG transcript: the correct answer is "Doesn't match".
    // TODO(user): fill exact transcript — audio should say
    // "Please close the window before it rains." (window, not door).
    transcript: 'Please close the door before it rains.',
    transcriptMatchesAudio: false,
  },
  {
    id: 'di-01',
    kind: 'describe_image',
    title: { en: 'Describe a market scene', kn: 'ಮಾರುಕಟ್ಟೆ ದೃಶ್ಯ ವಿವರಿಸಿ' },
    instructions: DESCRIBE_INSTRUCTIONS,
    rewardPaise: 900,
    estMinutes: 3,
    imageSrc: '/images/di-01.jpg',
    // TODO(user): update alt text to match the supplied image.
    imageAlt: { en: 'A vegetable stall at a local market', kn: 'ಸ್ಥಳೀಯ ಮಾರುಕಟ್ಟೆಯ ತರಕಾರಿ ಅಂಗಡಿ' },
    imageWidth: 640,
    imageHeight: 480,
  },
  {
    id: 'di-02',
    kind: 'describe_image',
    title: { en: 'Describe a street', kn: 'ಬೀದಿಯನ್ನು ವಿವರಿಸಿ' },
    instructions: DESCRIBE_INSTRUCTIONS,
    rewardPaise: 900,
    estMinutes: 3,
    imageSrc: '/images/di-02.jpg',
    // TODO(user): update alt text to match the supplied image.
    imageAlt: { en: 'A busy street with shops and vehicles', kn: 'ಅಂಗಡಿಗಳು ಮತ್ತು ವಾಹನಗಳಿರುವ ಬೀದಿ' },
    imageWidth: 640,
    imageHeight: 480,
  },
  {
    id: 'di-03',
    kind: 'describe_image',
    title: { en: 'Describe a kitchen', kn: 'ಅಡುಗೆಮನೆ ವಿವರಿಸಿ' },
    instructions: DESCRIBE_INSTRUCTIONS,
    rewardPaise: 1000,
    estMinutes: 4,
    imageSrc: '/images/di-03.jpg',
    // TODO(user): update alt text to match the supplied image.
    imageAlt: { en: 'A home kitchen with cooking pots', kn: 'ಪಾತ್ರೆಗಳಿರುವ ಮನೆಯ ಅಡುಗೆಮನೆ' },
    imageWidth: 640,
    imageHeight: 480,
  },
];

const TASKS_BY_ID: ReadonlyMap<string, Task> = new Map(TASKS.map((t) => [t.id, t]));

export function getTask(id: string): Task | undefined {
  return TASKS_BY_ID.get(id);
}

/** Estimated earnings per hour for a task, in paise. */
export function ratePerHourPaise(task: Task): number {
  return Math.round((task.rewardPaise * 60) / task.estMinutes);
}
