/**
 * Aurora Speech Utils
 * Wraps Web Speech API for TTS and STT.
 */
(function () {

    // --- Text to Speech ---
    const synth = window.speechSynthesis;
    let voice = null;

    function initVoices() {
        const voices = synth.getVoices();
        // Try to find a female English voice for Aurora
        voice = voices.find(v => v.name.includes('Samantha')) ||
            voices.find(v => v.name.includes('Google US English')) ||
            voices.find(v => v.lang.includes('en-US'));
    }

    if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = initVoices;
    }

    function speak(text, callback) {
        if (synth.speaking) {
            console.error('speechSynthesis.speaking');
            return;
        }
        if (text !== '') {
            const utterThis = new SpeechSynthesisUtterance(text);
            utterThis.onend = function (event) {
                if (callback) callback();
            };
            utterThis.onerror = function (event) {
                console.error('SpeechSynthesisUtterance.onerror');
            };
            if (voice) utterThis.voice = voice;
            utterThis.pitch = 1;
            utterThis.rate = 1;
            synth.speak(utterThis);
        }
    }

    // --- Speech to Text ---
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
        recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
    }

    function listen(onResult, onStart, onEnd) {
        if (!recognition) {
            alert("Speech recognition not supported in this browser.");
            return;
        }

        recognition.onstart = () => {
            if (onStart) onStart();
        };

        recognition.onend = () => {
            if (onEnd) onEnd();
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            if (onResult) onResult(transcript);
        };

        recognition.start();
    }

    // Expose
    window.AuroraSpeech = {
        speak,
        listen
    };

})();
