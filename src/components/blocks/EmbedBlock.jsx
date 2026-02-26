import React from 'react';

export function EmbedBlock({
    block,
    onUpdate
}) {

    // Simple helper to attempt extracting just the SRC if they paste a full iframe code
    const handleUrlChange = (e) => {
        let val = e.target.value;

        // 1. If they paste a raw <iframe> tag, extract the src="" URL
        if (val.includes('<iframe') && val.includes('src="')) {
            const match = val.match(/src="([^"]+)"/);
            if (match && match[1]) {
                val = match[1];
            }
        }
        // 2. If they just paste a raw Figma link, automatically convert it to the embed format
        else if (val.match(/https:\/\/([\w\.-]+\.)?figma\.com\/(file|design|proto)\//)) {
            val = `https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(val)}`;
        }

        onUpdate(block.id, { url: val });
    };

    return (
        <div className="canvas-panel">
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
                Figma / Live Embed
            </h3>

            <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                Paste a Figma prototype link or any interactive embed <code>src</code> URL here.
            </p>

            <div className="form-group">
                <label>Embed URL / Iframe SRC</label>
                <input
                    type="url"
                    value={block.url || ''}
                    onChange={handleUrlChange}
                    placeholder="https://www.figma.com/embed..."
                />
            </div>

            {block.url && (
                <div style={{ marginTop: '1rem', border: '1px solid var(--color-border)', borderRadius: '8px', overflow: 'hidden', height: '200px' }}>
                    <iframe
                        src={block.url}
                        style={{ width: '100%', height: '100%', border: 'none' }}
                        title="Preview"
                        allowFullScreen
                    />
                </div>
            )}
        </div>
    );
}
