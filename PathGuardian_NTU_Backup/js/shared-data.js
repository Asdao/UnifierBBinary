/**
 * Shared Data Module
 * Handles persistence for people, user profile, and global settings
 */

const STORAGE_KEYS = {
    PEOPLE: 'pg_people',
    USER_PROFILE: 'pg_user_profile',
    SETTINGS: 'pg_settings',
    MOOD_LOGS: 'pg_mood_logs'
};

// Default Initial Data
const DEFAULT_PEOPLE = [
    {
        id: 'p1',
        name: 'Eleanor Vance',
        relationship: 'Mother',
        status: 'safe', // safe, warning, danger
        location: { lat: 1.2920, lng: 103.8540, name: 'At Home' },
        lastActive: new Date().toISOString(),
        battery: 85,
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCi7n6pfQYh7tP57CsqCJb42m3WDR9eVhLdVG_OOmK_uzFzoieFmVaFxR_eEtRjBB75aKfXZ1c1wXmjaEMDV5NT9-NLT500KTuIdGltU2UOTi-8aEvmLyv24cAt6J5mbImMz_RSVpQNBomMqQvxJYiHVsCjIjS1Brx0zLY1-LMhhbzP7Vt2JO8qYyZZaGaeoNUSEVsnifdD54-ZEriKuylDG9bIQLnTspVtjh5kVDFwFriYcVYRDDtpB7zx9L9tl35_XAePtgQqy_4f'
    },
    {
        id: 'p2',
        name: 'Marcus Vance',
        relationship: 'Step-dad',
        status: 'warning',
        location: { lat: 1.2980, lng: 103.8460, name: 'Pharmacy' },
        lastActive: new Date(Date.now() - 15 * 60000).toISOString(),
        battery: 42,
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAQkw0aG96YR3GC6LfPxM1YgdVDb_k2s388H7l6Nf0qI5UGCYWRDBNhfsGC-0wDvj-4rReW6o2eXfoBx1MjfwN4-IovnYOOrXKDFOx4F25ju4u8OwXMADvH9SoaY37yetRkKAbrtrV2vel_-w7-ILI2gSDA2gzBauw3XqEcR087ETjg8Q5zoKO-S7Oe3OjuOS26_z2Nm5FDftfdjdzDmL-DhZU5ITGMLJiH8vZwGACAb5SyMiE9uLY_t_gaAQk091zLgI53dtbhbn7l'
    },
    {
        id: 'p3',
        name: 'Grandma Rose',
        relationship: 'Grandmother',
        status: 'safe',
        location: { lat: 1.2925, lng: 103.8535, name: 'Community Center' },
        lastActive: new Date(Date.now() - 45 * 60000).toISOString(),
        battery: 91,
        photoUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsa4B7j3W93_xN2rHIoM3TfkauMGJom5kmxG0jEf7Aqcf_VZWVdlFem6SD15cgXevc_crWjarFTTzWU_fXKn2VhkKSeMcVI8cAjVx_gMQ55ws-xD5jwEfsS-lF43diVj0o80XZHwTs8g4aUyUsaaf9bgw6CdrpsQtxYatxhY1zyOdVV4CPE2QPrIxDwYzLrmOWgF-mv4FPZBoCUO8JUeKc36iTr5UpvA0Dd4Oe5pXRejkO4NBJ8cK8AWNUNu9lAxQWN6-sizAHzggj'
    }
];

// --- Core Data Functions ---

function getPeople() {
    const data = localStorage.getItem(STORAGE_KEYS.PEOPLE);
    if (!data) {
        localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(DEFAULT_PEOPLE));
        return DEFAULT_PEOPLE;
    }
    return JSON.parse(data);
}

function addPerson(person) {
    const people = getPeople();
    const newPerson = {
        id: 'p' + Date.now(),
        status: 'safe',
        lastActive: new Date().toISOString(),
        battery: 100,
        photoUrl: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(person.name) + '&background=random',
        ...person
    };
    people.push(newPerson);
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
    return newPerson;
}

function updatePersonStatus(id, status, location = null) {
    const people = getPeople();
    const index = people.findIndex(p => p.id === id);
    if (index !== -1) {
        people[index].status = status;
        people[index].lastActive = new Date().toISOString();
        if (location) people[index].location = location;
        localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
    }
}

function removePerson(id) {
    const people = getPeople().filter(p => p.id !== id);
    localStorage.setItem(STORAGE_KEYS.PEOPLE, JSON.stringify(people));
}

// --- Mood Logs (Simulated from BBinary concepts) ---

function logMood(personId, mood, confidence) {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOOD_LOGS) || '[]');
    logs.push({
        id: 'm' + Date.now(),
        personId,
        mood, // e.g., 'Happy', 'Anxious', 'Neutral'
        confidence,
        timestamp: new Date().toISOString()
    });
    // Keep last 50 logs only
    if (logs.length > 50) logs.shift();
    localStorage.setItem(STORAGE_KEYS.MOOD_LOGS, JSON.stringify(logs));
}

function getMoodHistory(personId) {
    const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.MOOD_LOGS) || '[]');
    if (!personId) return logs;
    return logs.filter(l => l.personId === personId);
}

// --- Utils ---

function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function timeAgo(isoString) {
    const diff = Date.now() - new Date(isoString).getTime();
    const min = Math.floor(diff / 60000);
    if (min < 1) return 'Just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24) return `${hr}h ago`;
    return `${Math.floor(hr / 24)}d ago`;
}

// Export to window for easy access in vanilla JS pages
window.SharedData = {
    getPeople,
    addPerson,
    updatePersonStatus,
    removePerson,
    logMood,
    getMoodHistory,
    formatTime,
    timeAgo
};
