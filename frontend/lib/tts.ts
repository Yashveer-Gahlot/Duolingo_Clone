/* ═══════════════════════════════════════════════════════════════════════════
   TTS Helper – Browser speechSynthesis wrapper for Duolingo-style audio
   ═══════════════════════════════════════════════════════════════════════════ */

let currentUtterance: SpeechSynthesisUtterance | null = null;

/**
 * Speak text using the browser's native TTS.
 * @param text  The text to speak
 * @param lang  BCP 47 language tag (default: "es-ES" for Spanish)
 * @param rate  Speech rate (0.1–10, default 1)
 */
export function speak(text: string, lang = "es-ES", rate = 1): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  utterance.rate = rate;
  utterance.pitch = 1;
  utterance.volume = 1;

  // Try to find a matching voice
  const voices = window.speechSynthesis.getVoices();
  const match = voices.find(
    (v) => v.lang.startsWith(lang.split("-")[0]) && !v.localService === false
  ) ?? voices.find((v) => v.lang.startsWith(lang.split("-")[0]));

  if (match) {
    utterance.voice = match;
  }

  currentUtterance = utterance;
  window.speechSynthesis.speak(utterance);
}

/**
 * Speak at slow speed (0.5x) — Duolingo's "turtle" mode.
 */
export function speakSlow(text: string, lang = "es-ES"): void {
  speak(text, lang, 0.5);
}

/**
 * Stop any ongoing speech.
 */
export function stopSpeaking(): void {
  if (typeof window === "undefined" || !window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  currentUtterance = null;
}

/**
 * Check if TTS is currently speaking.
 */
export function isSpeaking(): boolean {
  if (typeof window === "undefined" || !window.speechSynthesis) return false;
  return window.speechSynthesis.speaking;
}

// Preload voices (some browsers lazy-load them)
if (typeof window !== "undefined" && window.speechSynthesis) {
  window.speechSynthesis.getVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    window.speechSynthesis.getVoices();
  };
}
