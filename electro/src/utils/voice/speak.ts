export function speak(text: string) {
  if (!text.trim() || !('speechSynthesis' in window)) return

  window.speechSynthesis.cancel()

  const utterance = new SpeechSynthesisUtterance(text)
  utterance.pitch = 0.86
  utterance.rate = 0.92
  utterance.volume = 0.9

  const voices = window.speechSynthesis.getVoices()
  const calmVoice = voices.find((voice) =>
    /natural|neural|english|google|microsoft/i.test(voice.name),
  )

  if (calmVoice) utterance.voice = calmVoice

  window.speechSynthesis.speak(utterance)
}

export function stopSpeaking() {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel()
  }
}
