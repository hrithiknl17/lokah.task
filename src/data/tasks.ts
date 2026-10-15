import type { AudioSource, LocalText, Task } from '../types';

/*
 * Fictional example rates — not Kenpath Labs' rates.
 * All rewards are in paise (100 paise = ₹1) and exist only for this demo.
 */

/**
 * Each clip ships as Ogg Opus (small, preferred) with an MP3 fallback for
 * browsers without Opus support, e.g. older Safari/iOS. Files live in public/audio/.
 */
function clip(name: string): readonly AudioSource[] {
  return [
    { src: `/audio/${name}.ogg`, type: 'audio/ogg; codecs=opus' },
    { src: `/audio/${name}.mp3`, type: 'audio/mpeg' },
  ];
}

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
    title: { en: 'Verify a Kannada plan', kn: 'ಕನ್ನಡ ಯೋಜನೆ ವಾಕ್ಯ ಪರಿಶೀಲಿಸಿ' },
    instructions: LISTEN_INSTRUCTIONS,
    rewardPaise: 400,
    estMinutes: 1,
    audioSources: clip('kn-1'),
    audioLanguage: 'kn',
    // Spoken: "ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗುತ್ತೇನೆ"
    transcript: 'ನಾಳೆ ಬೆಳಿಗ್ಗೆ ಮಾರುಕಟ್ಟೆಗೆ ಹೋಗುತ್ತೇನೆ',
    transcriptMatchesAudio: true,
  },
  {
    id: 'lv-kn-02',
    kind: 'listen_verify',
    title: { en: 'Verify a Kannada bus time', kn: 'ಕನ್ನಡ ಬಸ್ ಸಮಯ ಪರಿಶೀಲಿಸಿ' },
    instructions: LISTEN_INSTRUCTIONS,
    rewardPaise: 500,
    estMinutes: 1.5,
    audioSources: clip('kn-2'),
    audioLanguage: 'kn',
    // DELIBERATELY WRONG transcript: the correct answer is "Doesn't match".
    // Spoken: "ಬಸ್ ಹತ್ತು ಗಂಟೆಗೆ ಬರುತ್ತದೆ" (ten), transcript says ಒಂಬತ್ತು (nine).
    transcript: 'ಬಸ್ ಒಂಬತ್ತು ಗಂಟೆಗೆ ಬರುತ್ತದೆ',
    transcriptMatchesAudio: false,
    mismatchNote: {
      en: 'The speaker said ಹತ್ತು (ten), not ಒಂಬತ್ತು (nine).',
      kn: 'ಮಾತನಾಡಿದವರು ಹತ್ತು ಎಂದು ಹೇಳಿದರು, ಒಂಬತ್ತು ಅಲ್ಲ.',
    },
  },
  {
    id: 'lv-en-01',
    kind: 'listen_verify',
    title: { en: 'Verify a train time', kn: 'ರೈಲು ಸಮಯ ಪರಿಶೀಲಿಸಿ' },
    instructions: LISTEN_INSTRUCTIONS,
    rewardPaise: 400,
    estMinutes: 1,
    audioSources: clip('en-1'),
    audioLanguage: 'en',
    // Spoken: "The train leaves at six in the evening."
    transcript: 'The train leaves at six in the evening.',
    transcriptMatchesAudio: true,
  },
  {
    id: 'lv-en-02',
    kind: 'listen_verify',
    title: { en: 'Verify an English request', kn: 'ಇಂಗ್ಲಿಷ್ ವಿನಂತಿ ಪರಿಶೀಲಿಸಿ' },
    instructions: LISTEN_INSTRUCTIONS,
    rewardPaise: 400,
    estMinutes: 1,
    audioSources: clip('en-2'),
    audioLanguage: 'en',
    // Spoken: "Please bring two kilos of rice."
    transcript: 'Please bring two kilos of rice.',
    transcriptMatchesAudio: true,
  },
  {
    id: 'di-01',
    kind: 'describe_image',
    title: { en: 'Describe a market scene', kn: 'ಮಾರುಕಟ್ಟೆ ದೃಶ್ಯ ವಿವರಿಸಿ' },
    instructions: DESCRIBE_INSTRUCTIONS,
    rewardPaise: 900,
    estMinutes: 3,
    imageSrc: '/images/di-01.jpg',
    imageAlt: {
      en: 'At a covered vegetable market, a vendor in a white vest reaches over a large pan of tomatoes, with cucumbers beside it and an older man sorting produce behind.',
      kn: 'ಮುಚ್ಚಿದ ತರಕಾರಿ ಮಾರುಕಟ್ಟೆಯಲ್ಲಿ ಬಿಳಿ ಬನಿಯನ್ ತೊಟ್ಟ ವ್ಯಾಪಾರಿ ಟೊಮೇಟೊ ತುಂಬಿದ ದೊಡ್ಡ ಪಾತ್ರೆಯ ಮೇಲೆ ಕೈ ಚಾಚಿದ್ದಾರೆ. ಪಕ್ಕದಲ್ಲಿ ಸೌತೆಕಾಯಿಗಳಿವೆ, ಹಿಂದೆ ಒಬ್ಬ ಹಿರಿಯರು ತರಕಾರಿ ಆರಿಸುತ್ತಿದ್ದಾರೆ.',
    },
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
    imageAlt: {
      en: 'A green and yellow auto-rickshaw drives down a tree-lined street, past an old two-storey house behind a low wall.',
      kn: 'ಮರಗಳಿರುವ ರಸ್ತೆಯಲ್ಲಿ ಹಸಿರು-ಹಳದಿ ಆಟೋರಿಕ್ಷಾ ಸಾಗುತ್ತಿದೆ. ಹಿಂದೆ ತಗ್ಗು ಗೋಡೆಯ ಹಿಂದೆ ಹಳೆಯ ಎರಡು ಅಂತಸ್ತಿನ ಮನೆ ಇದೆ.',
    },
    imageWidth: 640,
    imageHeight: 480,
  },
  {
    id: 'di-03',
    kind: 'describe_image',
    title: { en: 'Describe a phone call', kn: 'ಫೋನ್ ಕರೆ ದೃಶ್ಯ ವಿವರಿಸಿ' },
    instructions: DESCRIBE_INSTRUCTIONS,
    rewardPaise: 1000,
    estMinutes: 4,
    imageSrc: '/images/di-03.jpg',
    imageAlt: {
      en: 'A smiling young woman in an orange top sits on a grey sofa at home, speaking into a phone held near her mouth.',
      kn: 'ಕಿತ್ತಳೆ ಬಣ್ಣದ ಟಾಪ್ ತೊಟ್ಟ ನಗುಮುಖದ ಯುವತಿ ಮನೆಯಲ್ಲಿ ಬೂದು ಸೋಫಾದ ಮೇಲೆ ಕುಳಿತು, ಬಾಯಿಯ ಬಳಿ ಹಿಡಿದ ಫೋನ್‌ಗೆ ಮಾತನಾಡುತ್ತಿದ್ದಾರೆ.',
    },
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
