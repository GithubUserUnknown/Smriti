document.addEventListener('DOMContentLoaded', function() {
  // Voice Recognition Setup
  if ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    const voiceButton = document.getElementById('voiceButton');
    if (voiceButton) {
      voiceButton.addEventListener('click', () => {
        recognition.start();
      });
    }

    recognition.addEventListener('result', (event) => {
      const transcript = event.results[0][0].transcript;
      document.getElementById('userInput').value = transcript;
    });

    recognition.addEventListener('error', (event) => {
      console.error('Voice recognition error:', event.error);
    });
  }

  // Emoji Picker Setup
  const emojiButton = document.getElementById('emojiButton');
  const userInput = document.getElementById('userInput');
  const pickerContainer = document.getElementById('emoji-picker-container');

  if (emojiButton && userInput && pickerContainer) {
    const picker = new EmojiButton({
      position: 'bottom-start',
      rootElement: pickerContainer
    });

    emojiButton.addEventListener('click', () => {
      picker.togglePicker(emojiButton);
    });

    picker.on('emoji', emoji => {
      userInput.value += emoji;
      userInput.focus();
    });
  }
});