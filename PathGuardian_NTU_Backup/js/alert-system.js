/**
 * Shared Alert System
 * Handles alert creation, retrieval, and event simulation
 */

const ALERT_STORAGE_KEY = 'pg_alerts';

const ALERT_TYPES = {
    SOS: { label: 'SOS Button', icon: 'sos', color: 'red', priority: 'high' },
    FALL: { label: 'Fall Detected', icon: 'personal_injury', color: 'red', priority: 'critical' },
    DEVIATION: { label: 'Route Deviation', icon: 'wrong_location', color: 'orange', priority: 'medium' },
    MOOD: { label: 'High Distress', icon: 'psychology', color: 'orange', priority: 'medium' },
    UNRESPONSIVE: { label: 'Unresponsive', icon: 'timer_off', color: 'red', priority: 'high' }
};

function getAlerts() {
    return JSON.parse(localStorage.getItem(ALERT_STORAGE_KEY) || '[]');
}

function saveAlerts(alerts) {
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(alerts));
    // Trigger custom event so other components on the same page can react immediately
    window.dispatchEvent(new CustomEvent('alerts-updated'));
}

/**
 * Create a new alert
 * @param {string} personId - ID of the person (use 'self' for current user)
 * @param {string} typeKey - Key from ALERT_TYPES (SOS, FALL, etc.)
 * @param {string} locationName - Optional location description
 * @param {object} coords - {lat, lng} object
 */
function createAlert(personId, typeKey, locationName = 'Unknown Location', coords = null) {
    const alerts = getAlerts();
    const type = ALERT_TYPES[typeKey] || ALERT_TYPES.SOS;

    // Check if distinct active alert of same type exists to avoid spam
    const existing = alerts.find(a =>
        a.personId === personId &&
        a.typeKey === typeKey &&
        a.status === 'active'
    );

    if (existing) {
        // Update timestamp of existing alert
        existing.timestamp = new Date().toISOString();
        saveAlerts(alerts);
        return existing;
    }

    const newAlert = {
        id: 'al_' + Date.now(),
        personId,
        typeKey,
        title: type.label,
        icon: type.icon,
        color: type.color,
        priority: type.priority,
        locationName,
        coords,
        timestamp: new Date().toISOString(),
        status: 'active', // active, resolved
        acknowledgedBy: []
    };

    alerts.unshift(newAlert);
    saveAlerts(alerts);

    // If it's a critical alert, verify user presence via simulation
    if (type.priority === 'critical') {
        console.log(`CRITICAL ALERT: ${type.label} for ${personId}`);
    }

    return newAlert;
}

function resolveAlert(alertId, resolverName = 'Caretaker') {
    const alerts = getAlerts();
    const alert = alerts.find(a => a.id === alertId);
    if (alert) {
        alert.status = 'resolved';
        alert.resolvedBy = resolverName;
        alert.resolvedAt = new Date().toISOString();
        saveAlerts(alerts);
    }
}

function clearAllAlerts() {
    localStorage.setItem(ALERT_STORAGE_KEY, '[]');
    window.dispatchEvent(new CustomEvent('alerts-updated'));
}

function getActiveAlertCount() {
    return getAlerts().filter(a => a.status === 'active').length;
}

// Export to window
window.AlertSystem = {
    TYPES: ALERT_TYPES,
    getAlerts,
    createAlert,
    resolveAlert,
    clearAllAlerts,
    getActiveAlertCount
};
