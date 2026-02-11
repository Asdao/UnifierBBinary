/**
 * Aurora Vision Simulation
 * Simulates the output of the CV/ML pipeline for the browser demo.
 */
(function () {

    const MOODS = ['Happy', 'Neutral', 'Calm', 'Focused', 'Tired', 'Anxious'];
    const SAFETY_STATES = ['Secure', 'Secure', 'Secure', 'Secure', 'Secure', 'Caution'];

    function analyze() {
        // 90% chance of being normal, 10% random interesting state
        const isEvent = Math.random() > 0.8;

        const result = {
            mood: isEvent ? MOODS[Math.floor(Math.random() * MOODS.length)] : 'Neutral',
            hydration: Math.random() > 0.9 ? 'Needs Water' : 'Secure',
            safety: Math.random() > 0.98 ? 'Critical' : 'Secure', // Rare fall detection
            timestamp: new Date().toISOString()
        };

        // If Critical (Fall), override others
        if (result.safety === 'Critical') {
            result.mood = 'Distressed';
            window.AlertSystem.createAlert('self', 'Fall Detected', 'Living Room', { lat: 1.29325, lng: 103.85215 });
        }

        // Log to shared data
        if (window.SharedData) {
            window.SharedData.logVisionAnalysis(result);
        }

        return result;
    }

    // Expose
    window.VisionSimulation = {
        analyze
    };

})();
