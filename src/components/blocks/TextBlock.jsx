import React from 'react';

export function TextBlock({
    block,
    onUpdate
}) {
    return (
        <div style={{
            background: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius)',
            padding: '1.5rem',
            marginBottom: '1rem'
        }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Text Section</h3>

            <div className="form-group">
                <label>Heading</label>
                <input
                    type="text"
                    value={block.heading}
                    onChange={(e) => onUpdate(block.id, { heading: e.target.value })}
                    placeholder="e.g. Process & Discovery"
                />
            </div>

            <div className="form-group">
                <label>Notes <span className="optional">(AI will expand this)</span></label>
                <textarea
                    value={block.content}
                    onChange={(e) => onUpdate(block.id, { content: e.target.value })}
                    rows={4}
                    placeholder="Brief bullet points about this section."
                />
            </div>
        </div>
    );
}
