import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';

export function TextBlock({
    block,
    onUpdate
}) {
    // Only essential formatting options for a clean UI
    const modules = {
        toolbar: [
            ['bold', 'italic'],
            [{ 'list': 'ordered' }, { 'list': 'bullet' }],
            ['link'],
            ['clean']
        ]
    };

    const formats = [
        'bold', 'italic',
        'list', 'bullet',
        'link'
    ];

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

            <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Notes <span className="optional">(AI will expand this)</span></label>
                <div className="quill-wrapper">
                    <ReactQuill
                        theme="snow"
                        value={block.content || ''}
                        onChange={(content) => onUpdate(block.id, { content })}
                        modules={modules}
                        formats={formats}
                        placeholder="Start typing or use the formatting bar..."
                    />
                </div>
            </div>
        </div >
    );
}
