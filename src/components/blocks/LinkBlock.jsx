import React from 'react';

export function LinkBlock({
    block,
    onUpdate
}) {
    return (
        <div className="canvas-panel">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
                External Link
            </h3>

            <div className="form-group">
                <label>Button Label</label>
                <input
                    type="text"
                    value={block.label || ''}
                    onChange={(e) => onUpdate(block.id, { label: e.target.value })}
                    placeholder="e.g. View Live Prototype"
                />
            </div>

            <div className="form-group">
                <label>URL Destination</label>
                <input
                    type="url"
                    value={block.url || ''}
                    onChange={(e) => onUpdate(block.id, { url: e.target.value })}
                    placeholder="https://..."
                />
            </div>
        </div>
    );
}
