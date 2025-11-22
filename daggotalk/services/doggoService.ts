import type { Emotion, DogSoundMapping, TranslationMode } from '../types';

const DOG_SOUND_MAPPINGS: Record<Emotion, DogSoundMapping> = {
  excited: {
    emotion: 'excited',
    dogText: 'Wuff! wuff-wuff!! (happy tail wagging)',
    emoji: '🐕',
    audioUrl: 'https://cdn.doggotalk.com/sounds/excited.mp3',
    behaviorDescription: 'happy tail wagging, bouncing around'
  },
  playful: {
    emotion: 'playful',
    dogText: 'Arf! arf-rrruff! (play bow, bouncing)',
    emoji: '🦮',
    audioUrl: 'https://cdn.doggotalk.com/sounds/playful.mp3',
    behaviorDescription: 'play bow, bouncing front paws'
  },
  sad: {
    emotion: 'sad',
    dogText: 'Whiiine… oooh… (ears down, slow tail)',
    emoji: '😢',
    audioUrl: 'https://cdn.doggotalk.com/sounds/sad.mp3',
    behaviorDescription: 'ears down, slow tail, gentle whimpers'
  },
  scared: {
    emotion: 'scared',
    dogText: 'Eeep… eeep… (cowering, looking around)',
    emoji: '😨',
    audioUrl: 'https://cdn.doggotalk.com/sounds/scared.mp3',
    behaviorDescription: 'cowering, looking around with wide eyes'
  },
  curious: {
    emotion: 'curious',
    dogText: 'Ruff? hmmph? (head tilt)',
    emoji: '🤔',
    audioUrl: 'https://cdn.doggotalk.com/sounds/curious.mp3',
    behaviorDescription: 'head tilt, ears forward, sniffing'
  },
  alert: {
    emotion: 'alert',
    dogText: 'RROOF! RROOF! (ears up, intense stare)',
    emoji: '🚨',
    audioUrl: 'https://cdn.doggotalk.com/sounds/alert.mp3',
    behaviorDescription: 'ears up, intense stare, on guard'
  },
  protective: {
    emotion: 'protective',
    dogText: 'Grrrr… RUFF! (stands in front of you)',
    emoji: '🛡️',
    audioUrl: 'https://cdn.doggotalk.com/sounds/protective.mp3',
    behaviorDescription: 'stands in front of you, deep warning growl'
  },
  relaxed: {
    emotion: 'relaxed',
    dogText: 'Huff… wff… (slow blink, gentle tail sway)',
    emoji: '😊',
    audioUrl: 'https://cdn.doggotalk.com/sounds/relaxed.mp3',
    behaviorDescription: 'slow blink, gentle tail sway, soft breathing'
  }
};

const BREED_AUDIO_VARIATIONS = {
  small: {
    excited: 'https://cdn.doggotalk.com/sounds/small/excited.mp3',
    playful: 'https://cdn.doggotalk.com/sounds/small/playful.mp3',
    sad: 'https://cdn.doggotalk.com/sounds/small/sad.mp3',
    scared: 'https://cdn.doggotalk.com/sounds/small/scared.mp3',
    curious: 'https://cdn.doggotalk.com/sounds/small/curious.mp3',
    alert: 'https://cdn.doggotalk.com/sounds/small/alert.mp3',
    protective: 'https://cdn.doggotalk.com/sounds/small/protective.mp3',
    relaxed: 'https://cdn.doggotalk.com/sounds/small/relaxed.mp3'
  },
  large: {
    excited: 'https://cdn.doggotalk.com/sounds/large/excited.mp3',
    playful: 'https://cdn.daggotalk.com/sounds/large/playful.mp3',
    sad: 'https://cdn.doggotalk.com/sounds/large/sad.mp3',
    scared: 'https://cdn.doggotalk.com/sounds/large/scared.mp3',
    curious: 'https://cdn.daggotalk.com/sounds/large/curious.mp3',
    alert: 'https://cdn.daggotalk.com/sounds/large/alert.mp3',
    protective: 'https://cdn.daggotalk.com/sounds/large/protective.mp3',
    relaxed: 'https://cdn.daggotalk.com/sounds/large/relaxed.mp3'
  },
  puppy: {
    excited: 'https://cdn.daggotalk.com/sounds/puppy/excited.mp3',
    playful: 'https://cdn.daggotalk.com/sounds/puppy/playful.mp3',
    sad: 'https://cdn.daggotalk.com/sounds/puppy/sad.mp3',
    scared: 'https://cdn.daggotalk.com/sounds/puppy/scared.mp3',
    curious: 'https://cdn.daggotalk.com/sounds/puppy/curious.mp3',
    alert: 'https://cdn.daggotalk.com/sounds/puppy/alert.mp3',
    protective: 'https://cdn.daggotalk.com/sounds/puppy/protective.mp3',
    relaxed: 'https://cdn.daggotalk.com/sounds/puppy/relaxed.mp3'
  }
};

export const getDogSoundMapping = (emotion: Emotion): DogSoundMapping => {
  return DOG_SOUND_MAPPINGS[emotion];
};

export const getBreedSpecificAudioUrl = (
  emotion: Emotion,
  breed?: 'small' | 'large' | 'puppy',
  quality: 'standard' | 'premium' = 'standard'
): string => {
  if (breed && quality === 'premium') {
    return BREED_AUDIO_VARIATIONS[breed][emotion];
  }

  const baseUrl = quality === 'premium'
    ? 'https://cdn.daggotalk.com/sounds/premium/'
    : 'https://cdn.daggotalk.com/sounds/';

  return `${baseUrl}${emotion}.mp3`;
};

export const generateDogExplanation = (emotion: Emotion, mode: TranslationMode): string => {
  if (mode === 'dog-to-human') {
    const explanations: Record<Emotion, string> = {
      excited: "Your dog sounds super excited! They probably want to play or are really happy to see you right now.",
      playful: "Your pup is feeling playful! They definitely want to play fetch or engage in some fun activity with you.",
      sad: "Sounds like your dog is feeling a bit down. They might need some extra cuddles and attention right now.",
      scared: "Your pup seems frightened. There might be a loud noise or something new that's making them anxious.",
      curious: "Your dog's curiosity is sparked! They've noticed something interesting and want to investigate it further.",
      alert: "Your dog is on high alert! They probably heard something outside and are letting you know they're on guard duty.",
      protective: "Your loyal dog is protecting you! They sense something and are making sure you're safe.",
      relaxed: "Your pup is calm and content. They're comfortable and enjoying the peaceful moment with you."
    };
    return explanations[emotion];
  }

  return DOG_SOUND_MAPPINGS[emotion].dogText;
};

export const getEmotionEmoji = (emotion: Emotion): string => {
  return DOG_SOUND_MAPPINGS[emotion].emoji;
};

export const playDogSound = async (audioUrl: string): Promise<void> => {
  try {
    const audio = new Audio(audioUrl);
    audio.preload = 'auto';

    // Load the audio before playing
    await audio.load();

    // Play the sound
    await audio.play();
  } catch (error) {
    console.error('Error playing dog sound:', error);
    // Fallback: just return silently if audio fails to play
    // The app should still function without audio
  }
};

export const getAllEmotions = (): Emotion[] => {
  return Object.keys(DOG_SOUND_MAPPINGS) as Emotion[];
};

export const validateEmotion = (emotion: string): emotion is Emotion => {
  return Object.keys(DOG_SOUND_MAPPINGS).includes(emotion);
};