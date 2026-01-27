import React from 'react';

interface ProgressBarProps {
    percent?: number; // 0-100
}

export default function ProgressBar({ percent }: ProgressBarProps) {
    const pct = typeof percent === 'number' && percent >= 0 ? Math.min(100, Math.max(0, percent)) : undefined;
    return (
        <div style={{ width: '100%' }}>
            <div style={{ height: 12, background: '#eee', borderRadius: 6, overflow: 'hidden' }}>
                <div
                    style={{
                        width: pct ? `${pct}%` : '0%',
                        height: '100%',
                        background: 'linear-gradient(90deg,#4caf50,#8bc34a)',
                        transition: 'width 150ms linear',
                    }}
                />
            </div>
            <div style={{ marginTop: 8, fontSize: 12, color: '#666', textAlign: 'right' }}>
                {pct !== undefined ? `${pct}%` : '下载中...'}
            </div>
        </div>
    );
}
