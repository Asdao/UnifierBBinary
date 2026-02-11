/**
 * PathGuardian Demo Manager
 * Handles automated "In-App Demo" mode to showcase features without external tools.
 */
(function () {
    const DEMO_KEY = 'pg_demo_active';
    const DEMO_STEP_KEY = 'pg_demo_step';

    function isDemoActive() {
        return localStorage.getItem(DEMO_KEY) === 'true';
    }

    function setDemoActive(active) {
        if (active) localStorage.setItem(DEMO_KEY, 'true');
        else localStorage.removeItem(DEMO_KEY);
    }

    function showToast(msg, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'fixed top-20 left-1/2 transform -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl z-50 font-bold text-sm animate-bounce';
        toast.style.animation = 'bounce 1s infinite';
        toast.textContent = "🤖 DEMO: " + msg;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), duration);
    }

    // --- Page Specific Logic ---

    // Index Page
    if (window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/')) {
        // Inject Button
        const container = document.querySelector('.max-w-md'); // The container
        if (container) {
            const btn = document.createElement('button');
            btn.className = "w-full mt-4 bg-slate-800 text-white py-4 rounded-2xl font-bold shadow-lg hover:bg-slate-700 transition-colors flex items-center justify-center gap-2";
            btn.innerHTML = '<span class="material-icons">play_circle</span> Watch Automated Demo';
            btn.onclick = () => {
                if (confirm("Start automated demo? Ideally open the console to see logs.")) {
                    setDemoActive(true);
                    localStorage.setItem(DEMO_STEP_KEY, '1');
                    window.location.href = 'user_home.html';
                }
            };
            container.appendChild(btn);
        }
    }

    // User Home Page
    if (window.location.pathname.endsWith('user_home.html') && isDemoActive()) {
        showToast("Auto-filling destination...", 2000);
        setTimeout(() => {
            const input = document.getElementById('dest-input');
            if (input) {
                input.value = "Park";
                input.dispatchEvent(new Event('input'));

                showToast("Clicking Go...", 1000);
                setTimeout(() => {
                    // Find the button next to input (navigation icon)
                    const btn = input.nextElementSibling;
                    if (btn) btn.click();
                }, 1500);
            }
        }, 1000);
    }

    // User Navigate Page
    if (window.location.pathname.endsWith('user_navigate.html') && isDemoActive()) {
        showToast("Simulating Emergency...", 2000);

        setTimeout(() => {
            // Trigger Alert
            const alertBtn = document.querySelector('button[onclick="triggerAlert()"]');
            if (alertBtn) alertBtn.click();

            setTimeout(() => {
                showToast("Alert Sent! Cancelling...", 1500);
                // Cancel Alert
                const cancelBtn = document.querySelector('button[onclick="cancelAlert()"]');
                if (cancelBtn) cancelBtn.click();

                setTimeout(() => {
                    showToast("Checking Mood...", 1500);
                    // Open Chat
                    const chatBtn = document.querySelector('button[onclick="toggleChat()"]');
                    if (chatBtn) chatBtn.click();

                    setTimeout(() => {
                        // Click "Good"
                        const goodBtn = document.querySelector('button[onclick="sendMood(\'Good\')"]');
                        if (goodBtn) goodBtn.click();

                        setTimeout(() => {
                            showToast("Switching to Caretaker View...", 2000);
                            window.location.href = 'caretaker_dashboard.html';
                        }, 2500);

                    }, 1500);

                }, 2000);

            }, 2500);

        }, 1500);
    }

    // Caretaker Dashboard
    if (window.location.pathname.endsWith('caretaker_dashboard.html') && isDemoActive()) {
        showToast("Welcome Caretaker! Checking Alerts...", 3000);

        setTimeout(() => {
            // Highlight Alert Tab
            const alertLink = document.querySelector('a[href="caretaker_alerts.html"]');
            if (alertLink) {
                alertLink.classList.add('animate-pulse', 'bg-red-100', 'rounded-xl');
                window.location.href = 'caretaker_alerts.html';
            }
        }, 2000);
    }

    // Caretaker Alerts
    if (window.location.pathname.endsWith('caretaker_alerts.html') && isDemoActive()) {
        showToast("Demo Complete! Alerts Visible here.", 4000);
        setDemoActive(false); // End Demo
    }

})();
