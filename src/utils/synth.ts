// Web Audio API Synth Engine for Wishly
// Provides premium real-time audio synthesis for interactive elements and music boxes.

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// 1. Play a crystal-clear magical chime bell (Sine wave with high decay)
export function playMagicalBell(frequency = 880, duration = 1.5) {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, now);
    
    // Slight vibrato for magic effect
    osc.frequency.linearRampToValueAtTime(frequency + 5, now + 0.1);
    osc.frequency.linearRampToValueAtTime(frequency, now + 0.2);
    
    gainNode.gain.setValueAtTime(0.3, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.warn('Audio synthesis failed:', e);
  }
}

// 2. Play a magical sparkle cascade (Arpeggio sweep)
export function playSparkleCascade() {
  try {
    const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98, 2093.00]; // C Major scale arpeggio
    notes.forEach((freq, index) => {
      setTimeout(() => {
        playMagicalBell(freq, 0.8 - index * 0.05);
      }, index * 80);
    });
  } catch (e) {
    console.warn('Sparkle synthesis failed:', e);
  }
}

// 3. Play a realistic soft candle blow-out (Filtered white noise sweep)
export function playCandleBlowOut() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 0.5;
    
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    
    // Fill with white noise
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noiseNode = ctx.createBufferSource();
    noiseNode.buffer = buffer;
    
    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.exponentialRampToValueAtTime(50, now + duration);
    
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.4, now);
    gainNode.gain.linearRampToValueAtTime(0.001, now + duration);
    
    noiseNode.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    noiseNode.start(now);
    noiseNode.stop(now + duration);
  } catch (e) {
    console.warn('Blowout synthesis failed:', e);
  }
}

// 4. Play a cute balloon pop sound
export function playBalloonPop() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Low pop thud
    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(40, now + 0.1);
    
    gainNode.gain.setValueAtTime(0.5, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    
    osc.connect(gainNode);
    gainNode.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.15);
    
    // White noise pop click
    const bufferSize = ctx.sampleRate * 0.05;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    
    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.2, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
    
    noise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    noise.start(now);
    noise.stop(now + 0.05);
  } catch (e) {
    console.warn('Pop synthesis failed:', e);
  }
}

// 5. Soundboard: Playful synthesizers
export function playAww() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    osc1.type = 'sine';
    osc2.type = 'triangle';
    
    osc1.frequency.setValueAtTime(330, now); // E4
    osc1.frequency.exponentialRampToValueAtTime(392, now + 0.6); // G4
    
    osc2.frequency.setValueAtTime(333, now);
    osc2.frequency.exponentialRampToValueAtTime(395, now + 0.6);
    
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(0.25, now + 0.2);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
    
    osc1.connect(gainNode);
    osc2.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.3);
    osc2.stop(now + 1.3);
  } catch (e) {
    console.warn('Aww synthesis failed:', e);
  }
}

export function playPartyHorn() {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    const duration = 0.8;
    
    const osc = ctx.createOscillator();
    const biquadFilter = ctx.createBiquadFilter();
    const gainNode = ctx.createGain();
    
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(147, now); // D3
    osc.frequency.linearRampToValueAtTime(165, now + 0.15); // E3
    osc.frequency.linearRampToValueAtTime(147, now + duration);
    
    // Add aggressive buzz filter
    biquadFilter.type = 'bandpass';
    biquadFilter.frequency.setValueAtTime(400, now);
    biquadFilter.frequency.exponentialRampToValueAtTime(1200, now + 0.1);
    biquadFilter.frequency.exponentialRampToValueAtTime(300, now + duration);
    biquadFilter.Q.setValueAtTime(3, now);
    
    gainNode.gain.setValueAtTime(0.15, now);
    gainNode.gain.linearRampToValueAtTime(0.2, now + 0.1);
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.5);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);
    
    osc.connect(biquadFilter);
    biquadFilter.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    osc.start(now);
    osc.stop(now + duration);
  } catch (e) {
    console.warn('Party horn synthesis failed:', e);
  }
}

export function playCheers() {
  // Synthesize clinking wine/champagne glasses
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Glass 1
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(2500, now);
    gain1.gain.setValueAtTime(0.15, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 1.5);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    
    // Glass 2 (slightly higher, slightly offset)
    setTimeout(() => {
      try {
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(2800, now + 0.05);
        gain2.gain.setValueAtTime(0.12, now + 0.05);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.6);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.05);
        osc2.stop(now + 1.8);
      } catch (e) {}
    }, 50);
    
    osc1.start(now);
    osc1.stop(now + 1.7);
  } catch (e) {
    console.warn('Cheers synthesis failed:', e);
  }
}

// 6. Interactive Music Box (Orgel Happy Birthday Melodies & Loops)
export class MusicBoxEngine {
  private ctx: AudioContext | null = null;
  private timerId: number | null = null;
  private isPlaying = false;
  private tempo = 110;
  private activeNodes: { osc: OscillatorNode; gain: GainNode }[] = [];
  private theme: 'birthday' | 'lofi' | 'sparkle' | 'zen' = 'birthday';

  // Happy Birthday Melody
  // [Note Name, Duration in beats, Optional Harmony Note]
  private birthdayNotes: [string, number, string?][] = [
    // Phrase 1: "Happy Birthday to you"
    ['G4', 0.75, 'C4'], ['G4', 0.25], ['A4', 1.0, 'F4'], ['G4', 1.0, 'E4'], ['C5', 1.0, 'G4'], ['B4', 2.0, 'G4'],
    // Phrase 2: "Happy Birthday to you"
    ['G4', 0.75, 'G4'], ['G4', 0.25], ['A4', 1.0, 'F4'], ['G4', 1.0, 'F4'], ['D5', 1.0, 'G4'], ['C5', 2.0, 'E4'],
    // Phrase 3: "Happy Birthday to you"
    ['G4', 0.75, 'C4'], ['G4', 0.25], ['G5', 1.0, 'E4'], ['E5', 1.0, 'C4'], ['C5', 1.0, 'E4'], ['B4', 1.0, 'D4'], ['A4', 2.0, 'F4'],
    // Phrase 4: "Happy Birthday to you!"
    ['F5', 0.75, 'F4'], ['F5', 0.25], ['E5', 1.0, 'G4'], ['C5', 1.0, 'E4'], ['D5', 1.0, 'F4'], ['C5', 2.5, 'C4']
  ];

  // Sweet Ambient Dream Melody (for Sunset Chill / Lofi)
  private lofiNotes: [string, number, string?][] = [
    ['C4', 1], ['E4', 1], ['G4', 1], ['B4', 1], ['A4', 2], ['G4', 2],
    ['F4', 1], ['A4', 1], ['C5', 1], ['E5', 1], ['D5', 2], ['C5', 2],
    ['E4', 1], ['G4', 1], ['B4', 1], ['D5', 1], ['C5', 2], ['B4', 2],
    ['A4', 1], ['C5', 1], ['E5', 1], ['G5', 1], ['F5', 2], ['E5', 2]
  ];

  // Random wind chime trigger frequency list
  private chimeFrequencies = [523.25, 587.33, 659.25, 698.46, 783.99, 880.00, 987.77, 1046.50, 1174.66, 1318.51, 1567.98];

  private noteFreqs: { [key: string]: number } = {
    'C4': 261.63, 'D4': 293.66, 'E4': 329.63, 'F4': 349.23, 'G4': 392.00, 'A4': 440.00, 'B4': 493.88,
    'C5': 523.25, 'D5': 587.33, 'E5': 659.25, 'F5': 698.46, 'G5': 783.99, 'A5': 880.00, 'B5': 987.77,
    'C6': 1046.50, 'D6': 1174.66, 'E6': 1318.51, 'F6': 1396.91, 'G6': 1567.98
  };

  private onStateChangeListeners: ((isPlaying: boolean) => void)[] = [];

  subscribe(listener: (isPlaying: boolean) => void) {
    this.onStateChangeListeners.push(listener);
    return () => {
      this.onStateChangeListeners = this.onStateChangeListeners.filter(l => l !== listener);
    };
  }

  private notifyStateChange() {
    this.onStateChangeListeners.forEach(l => {
      try { l(this.isPlaying); } catch (e) {}
    });
  }

  setTheme(theme: 'birthday' | 'lofi' | 'sparkle' | 'zen') {
    this.theme = theme;
  }

  getIsPlaying() {
    return this.isPlaying;
  }

  start() {
    if (this.isPlaying) return;
    this.ctx = getAudioContext();
    this.isPlaying = true;
    this.notifyStateChange();
    
    if (this.theme === 'sparkle') {
      this.playChimeLoop();
    } else if (this.theme === 'zen') {
      this.playDroneLoop();
    } else {
      this.playMelodyLoop(0);
    }
  }

  stop() {
    this.isPlaying = false;
    if (this.timerId) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
    this.activeNodes.forEach(node => {
      try {
        node.osc.stop();
      } catch (e) {}
    });
    this.activeNodes = [];
    this.notifyStateChange();
  }

  private playNote(freq: number, dur: number, isSubtle = false) {
    if (!this.isPlaying || !this.ctx) return;
    const now = this.ctx.currentTime;

    const osc = this.ctx.createOscillator();
    const gainNode = this.ctx.createGain();

    // Orgel sounds best with soft sine or triangle
    osc.type = this.theme === 'lofi' ? 'triangle' : 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Warm music box filter
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(this.theme === 'lofi' ? 800 : 2800, now);

    const maxVolume = isSubtle ? 0.07 : (this.theme === 'lofi' ? 0.14 : 0.22);
    gainNode.gain.setValueAtTime(0.001, now);
    gainNode.gain.linearRampToValueAtTime(maxVolume, now + 0.04);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + dur);

    osc.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + dur);

    const activeNode = { osc, gain: gainNode };
    this.activeNodes.push(activeNode);

    // Clean up active node listing
    setTimeout(() => {
      this.activeNodes = this.activeNodes.filter(n => n !== activeNode);
    }, dur * 1000 + 100);
  }

  private playMelodyLoop(noteIndex: number) {
    if (!this.isPlaying || !this.ctx) return;
    
    const notesList = this.theme === 'birthday' ? this.birthdayNotes : this.lofiNotes;
    const currentNote = notesList[noteIndex];
    const noteName = currentNote[0] as string;
    const noteDuration = currentNote[1] as number;
    const harmonyName = currentNote[2] as string | undefined;
    
    const freq = this.noteFreqs[noteName];
    // Convert duration to seconds based on tempo
    const secondsPerBeat = 60 / this.tempo;
    const actualDurationSeconds = noteDuration * secondsPerBeat;

    if (freq) {
      // Primary melody bell note
      this.playNote(freq, actualDurationSeconds * 1.6);

      // Harmony note if provided
      if (harmonyName && this.noteFreqs[harmonyName]) {
        this.playNote(this.noteFreqs[harmonyName], actualDurationSeconds * 1.4, true);
      }
    }

    const isLastNote = noteIndex === notesList.length - 1;
    const nextIndex = (noteIndex + 1) % notesList.length;
    // Add extra pause at loop end before repeating
    const delayMs = (actualDurationSeconds * 1000) + (isLastNote ? 1200 : 0);

    this.timerId = setTimeout(() => {
      this.playMelodyLoop(nextIndex);
    }, delayMs) as any;
  }

  private playChimeLoop() {
    if (!this.isPlaying || !this.ctx) return;

    // Pick a random frequency from the sparkly set
    const randomIndex = Math.floor(Math.random() * this.chimeFrequencies.length);
    const freq = this.chimeFrequencies[randomIndex];
    
    // Play with highly resonant delay
    this.playNote(freq, 2.5);

    // Dynamic wind-like timing
    const nextDelayMs = 600 + Math.random() * 1200;
    this.timerId = setTimeout(() => {
      this.playChimeLoop();
    }, nextDelayMs) as any;
  }

  private playDroneLoop() {
    if (!this.isPlaying || !this.ctx) return;

    // Play a relaxing, deep, and slow chord progression in Zen Space
    const rootFreqs = [130.81, 164.81, 196.00, 220.00]; // C3, E3, G3, A3
    rootFreqs.forEach((freq, idx) => {
      this.playNote(freq, 4.0, true);
    });

    this.timerId = setTimeout(() => {
      this.playDroneLoop();
    }, 3800) as any;
  }
}

// Global singleton instance for playing the birthday theme song
export const birthdayMusicBox = new MusicBoxEngine();
birthdayMusicBox.setTheme('birthday');

export function startBirthdaySong() {
  birthdayMusicBox.setTheme('birthday');
  birthdayMusicBox.start();
}

export function stopBirthdaySong() {
  birthdayMusicBox.stop();
}

export function toggleBirthdaySong(): boolean {
  if (birthdayMusicBox.getIsPlaying()) {
    birthdayMusicBox.stop();
    return false;
  } else {
    birthdayMusicBox.setTheme('birthday');
    birthdayMusicBox.start();
    return true;
  }
}

export function isBirthdaySongPlaying(): boolean {
  return birthdayMusicBox.getIsPlaying();
}

