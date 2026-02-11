import { useState, useCallback, useRef, useEffect } from 'react';

interface useSpeechSynthesisReturn {
    speak: (text: string) => void;
    cancel: () => void;
    isSpeaking: boolean;
    browserSupportsSpeechSynthesis: boolean;
}

export const useSpeechSynthesis = (): useSpeechSynthesisReturn => {
    const [isSpeaking, setIsSpeaking] = useState(false);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    const browserSupportsSpeechSynthesis = !!window.speechSynthesis;

    useEffect(() => {
        return () => {
            window.speechSynthesis.cancel();
        };
    }, []);

    const speak = useCallback((text: string) => {
        if (!browserSupportsSpeechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);

        // Try to find a female English voice
        const voices = window.speechSynthesis.getVoices();
        const femaleVoice = voices.find(v =>
            v.lang.startsWith('en') &&
            (v.name.toLowerCase().includes('female') ||
                v.name.toLowerCase().includes('samantha') ||
                v.name.toLowerCase().includes('victoria') ||
                v.name.toLowerCase().includes('google us english')) // Often defaults to a female voice
        ) || voices.find(v => v.lang.startsWith('en'));

        if (femaleVoice) {
            utterance.voice = femaleVoice;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
            console.error('Speech synthesis error', event);
            setIsSpeaking(false);
        };

        utteranceRef.current = utterance;
        window.speechSynthesis.speak(utterance);
    }, [browserSupportsSpeechSynthesis]);

    const cancel = useCallback(() => {
        if (!browserSupportsSpeechSynthesis) return;
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
    }, [browserSupportsSpeechSynthesis]);

    return {
        speak,
        cancel,
        isSpeaking,
        browserSupportsSpeechSynthesis,
    };
};
