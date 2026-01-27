export function humanFriendlyPercentage(percentage: number) {
    return (percentage * 100).toFixed(2) + '%';
}

export function formatTime(time: number, n = 2) {
    return parseFloat(time.toFixed(n));
}

export function formatBytes(bytes: number) {
    if (bytes < 0) {
        return 'invalid';
    }
    if (bytes === 0) {
        return '0 bytes';
    }
    const sizes = ['bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const sizeIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    return (
        parseFloat((bytes / Math.pow(1024, sizeIndex)).toFixed(1)) +
        ' ' +
        sizes[sizeIndex]
    );
}

export function formatBytesShort(bytes: number) {
    if (bytes < 0) {
        return 'invalid';
    }
    if (bytes === 0) {
        return '0B';
    }
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const sizeIndex = Math.floor(Math.log(bytes) / Math.log(1024));
    return (
        parseFloat((bytes / Math.pow(1024, sizeIndex)).toFixed(1)) +
        sizes[sizeIndex]
    );
}

// Localized formatting helpers - accept a translation function `t` from useLanguage()
export function formatBytesLocalized(bytes: number, t: (k: string) => string) {
    const formatted = formatBytes(bytes);
    // formatted is like '1.2 MB' or '0 bytes' or '123 B'
    const parts = formatted.split(' ');
    if (parts.length === 2) {
        const [num, unit] = parts;
        const key = `viewer.units.${unit}`;
        const localizedUnit = t(key) || unit;
        return `${num} ${localizedUnit}`;
    }
    // fallback
    return formatted;
}

export function formatDurationLocalized(duration: number, t: (k: string) => string) {
    const s = formatDuration(duration); // e.g. '1h 2m 3s'
    if (!s) return s;
    const parts = s.split(' ');
    const localized = parts
        .map(part => {
            if (part.endsWith('h')) {
                const num = part.slice(0, -1);
                return `${num}${t('viewer.time.h')}`;
            }
            if (part.endsWith('m')) {
                const num = part.slice(0, -1);
                return `${num}${t('viewer.time.m')}`;
            }
            if (part.endsWith('s')) {
                const num = part.slice(0, -1);
                return `${num}${t('viewer.time.s')}`;
            }
            return part;
        })
        .join(' ');
    return localized;
}

export function formatDuration(duration: number) {
    const seconds = Math.abs(Math.ceil(duration / 1000));
    const h = (seconds - (seconds % 3600)) / 3600;
    const m = ((seconds - (seconds % 60)) / 60) % 60;
    const s = seconds % 60;

    let str = [];
    if (h) str.push(h + 'h');
    if (m) str.push(m + 'm');
    if (s) str.push(s + 's');

    return str.join(' ');
}

export function formatDate(startTime: number | string | Date) {
    const start = new Date(startTime);
    const time = start
        .toLocaleTimeString([], {
            hour12: true,
            hour: '2-digit',
            minute: '2-digit',
        })
        .replace(' ', '');
    const date = start.toLocaleDateString();
    return [time, date];
}

export function formatNumber(value: number) {
    return value.toLocaleString('en-US', {
        maximumSignificantDigits: value > 1 ? 3 : value > 0.1 ? 2 : 1,
        useGrouping: false,
    });
}
