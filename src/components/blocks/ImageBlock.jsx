import React from 'react';

export function ImageBlock({
    block,
    onUpdate
}) {

    const handleFiles = (e) => {
        const files = Array.from(e.target.files);

        // We append the new incoming base64s to the existing array
        const newImagesPromises = files.map(file => {
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => resolve(reader.result);
                reader.readAsDataURL(file);
            });
        });

        Promise.all(newImagesPromises).then((base64Strings) => {
            onUpdate(block.id, {
                images: [...(block.images || []), ...base64Strings]
            });
        });
    };

    const removeImage = (indexToRemove) => {
        const newImages = block.images.filter((_, idx) => idx !== indexToRemove);
        onUpdate(block.id, { images: newImages });
    };

    return (
        <div style={{
            background: '#fff',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--border-radius)',
            padding: '1.5rem',
            marginBottom: '1rem'
        }}>
            <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.25rem' }}>Image Gallery</h3>

            <div className="form-group">
                <label className="image-upload">
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        style={{ display: 'none' }}
                        onChange={handleFiles}
                    />
                    <div style={{ padding: '2rem 1rem' }}>
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginBottom: '1rem', color: 'var(--color-accent)' }}>
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <circle cx="8.5" cy="8.5" r="1.5"></circle>
                            <polyline points="21 15 16 10 5 21"></polyline>
                        </svg>
                        <p>Click to upload or Drag & Drop multiple images</p>
                    </div>
                </label>
            </div>

            <div className="form-group" style={{ marginTop: '1rem' }}>
                <label>Gallery Caption (Optional)</label>
                <input
                    type="text"
                    value={block.caption || ''}
                    onChange={(e) => onUpdate(block.id, { caption: e.target.value })}
                    placeholder="e.g. Dashboard redesign before and after..."
                    style={{ fontSize: '0.9rem' }}
                />
            </div>

            {block.images && block.images.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '1rem', marginTop: '1rem' }}>
                    {block.images.map((imgSrc, idx) => (
                        <div key={idx} style={{ position: 'relative', aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
                            <img src={imgSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                                type="button"
                                onClick={() => removeImage(idx)}
                                style={{
                                    position: 'absolute',
                                    top: '4px',
                                    right: '4px',
                                    background: 'rgba(0,0,0,0.6)',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50%',
                                    width: '24px',
                                    height: '24px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                    fontSize: '12px'
                                }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
