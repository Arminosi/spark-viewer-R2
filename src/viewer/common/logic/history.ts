
export interface HistoryItem {
    id: string; // code or full URL
    type: 'bytebin' | 'remote' | 'file' | 'local';
    timestamp: number;
    title?: string; // Optional nice name
    description?: string; // e.g. "Server Health" or "Profile"
}

const HISTORY_KEY = 'spark_viewer_history';
const MAX_HISTORY = 50;

export function getHistory(): HistoryItem[] {
    if (typeof localStorage === 'undefined') return [];
    try {
        const raw = localStorage.getItem(HISTORY_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

export function addToHistory(item: Omit<HistoryItem, 'timestamp'>) {
    if (typeof localStorage === 'undefined') return;



    try {
        const history = getHistory();
        const timestamp = Date.now();
        const newItem = { ...item, timestamp };

        // Remove existing item with same ID (move to top)
        const filtered = history.filter(h => h.id !== item.id);

        const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);
        localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    } catch (e) {
        console.error('Failed to save history', e);
    }
}

export function clearHistory() {
    if (typeof localStorage === 'undefined') return;
    localStorage.removeItem(HISTORY_KEY);
}

export function removeFromHistory(id: string) {
    if (typeof localStorage === 'undefined') return;
    const history = getHistory();
    const updated = history.filter(h => h.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
}
