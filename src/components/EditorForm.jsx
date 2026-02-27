import React from 'react';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableBlock } from './blocks/SortableBlock';
import { TextBlock } from './blocks/TextBlock';
import { ImageBlock } from './blocks/ImageBlock';
import { LinkBlock } from './blocks/LinkBlock';
import { EmbedBlock } from './blocks/EmbedBlock';

export default function EditorForm({
    apiKey, setApiKey,
    projectData, setProjectData,
    blocks, setBlocks,
    metricsData, setMetricsData,
    theme, setTheme,
    onGenerate,
    onClear
}) {
    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleProjectChange = (e) => {
        const { name, value } = e.target;
        setProjectData(prev => ({ ...prev, [name]: value }));
    };

    const addMetric = () => {
        if (metricsData.length < 6) {
            setMetricsData([...metricsData, { value: '', label: '' }]);
        }
    };

    const removeMetric = (index) => {
        const newMetrics = metricsData.filter((_, i) => i !== index);
        setMetricsData(newMetrics);
    };

    const handleMetricChange = (index, field, value) => {
        const newMetrics = [...metricsData];
        newMetrics[index][field] = value;
        setMetricsData(newMetrics);
    };

    const addBlock = (type) => {
        const newId = `block-${Date.now()}`;
        let newBlock;
        if (type === 'text') {
            newBlock = { id: newId, type: 'text', heading: '', content: '', generatedContent: '' };
        } else if (type === 'image') {
            newBlock = { id: newId, type: 'image', images: [] };
        } else if (type === 'link') {
            newBlock = { id: newId, type: 'link', label: '', url: '' };
        } else if (type === 'embed') {
            newBlock = { id: newId, type: 'embed', url: '' };
        }

        setBlocks([...blocks, newBlock]);
    };

    const updateBlock = (id, updates) => {
        setBlocks(blocks.map(b => b.id === id ? { ...b, ...updates } : b));
    };

    const removeBlock = (id) => {
        setBlocks(blocks.filter(b => b.id !== id));
    };

    const handleDragEnd = (event) => {
        const { active, over } = event;

        if (active.id !== over.id) {
            setBlocks((items) => {
                const oldIndex = items.findIndex(i => i.id === active.id);
                const newIndex = items.findIndex(i => i.id === over.id);
                return arrayMove(items, oldIndex, newIndex);
            });
        }
    };

    return (
        <div className="editor-layout">

            {/* Outline Sidebar */}
            <aside className="editor-sidebar">

                <div className="editor-sidebar-panel">
                    <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem', borderBottom: '2px solid var(--color-accent)', paddingBottom: '0.5rem', display: 'inline-block' }}>Story Outline</h2>
                    <p style={{ marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--color-text-light)' }}>
                        Drag to reorder your case study flow.
                    </p>

                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={blocks.map(b => b.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            {blocks.map(block => (
                                <SortableBlock key={block.id} id={block.id} block={block} onRemove={() => removeBlock(block.id)} />
                            ))}
                        </SortableContext>
                    </DndContext>

                    <div style={{ marginTop: '2rem' }}>
                        <p style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>
                            Add New Block
                        </p>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                            <button type="button" className="btn-secondary" onClick={() => addBlock('text')} style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 0.5rem', gap: '0.25rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>
                                Text
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => addBlock('image')} style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 0.5rem', gap: '0.25rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                                Image
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => addBlock('link')} style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 0.5rem', gap: '0.25rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                                Link
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => addBlock('embed')} style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 0.5rem', gap: '0.25rem' }}>
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                                Embed
                            </button>
                        </div>
                    </div>
                </div>

                <div className="editor-sidebar-panel">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label>Case Study Theme:</label>
                            <select
                                value={theme}
                                onChange={(e) => setTheme(e.target.value)}
                                style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                            >
                                <option value="minimalist">Modern Minimalist</option>
                                <option value="dark">Dark Mode</option>
                                <option value="editorial">Editorial (Serif)</option>
                            </select>
                        </div>
                        <button className="btn-primary" onClick={onGenerate} style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}>
                            {apiKey ? '✨ Generate with AI' : '👁️ View Formatting'}
                        </button>
                        <button className="btn-secondary" onClick={onClear} style={{ width: '100%', padding: '0.75rem', borderColor: '#ff4d4f', color: '#ff4d4f', backgroundColor: 'transparent' }}>
                            Reset All Data
                        </button>
                    </div>
                </div>

            </aside>

            {/* Content Canvas */}
            <main className="editor-canvas">

                <div className="api-key-container" style={{ marginBottom: '2rem' }}>
                    <h3>Anthropic API Key</h3>
                    <p>Your key is only used directly in your browser and is never stored anywhere else.</p>
                    <input
                        type="password"
                        placeholder="sk-ant-..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                    />
                </div>

                <div className="ai-warning" style={{ marginBottom: '2rem' }}>
                    <strong>How it works:</strong> Add content blocks in the sidebar outline. Fill them out below! The AI will expand text blocks into polished paragraphs while preserving your facts.
                </div>

                <section className="form-section">
                    <h2>Project Basics</h2>
                    <div className="form-group">
                        <label>Project Name</label>
                        <input
                            type="text"
                            name="name"
                            value={projectData.name}
                            onChange={handleProjectChange}
                            placeholder="e.g. Acme Dashboard Redesign"
                        />
                    </div>
                    <div className="form-group">
                        <label>Your Role</label>
                        <input
                            type="text"
                            name="role"
                            value={projectData.role}
                            onChange={handleProjectChange}
                            placeholder="e.g. Lead Product Designer"
                        />
                    </div>
                    <div className="form-group">
                        <label>Timeline</label>
                        <input
                            type="text"
                            name="timeline"
                            value={projectData.timeline}
                            onChange={handleProjectChange}
                            placeholder="e.g. 6 weeks, Q3 2024"
                        />
                    </div>
                </section>

                <section className="form-section">
                    <h2>Content Blocks</h2>
                    <p style={{ marginBottom: '2rem', fontSize: '0.95rem', color: 'var(--color-text-light)' }}>
                        Enter the content for your blocks here. Re-order them using the Sidebar Outline.
                    </p>

                    {blocks.map(block => (
                        block.type === 'text' ? (
                            <TextBlock
                                key={block.id}
                                block={block}
                                onUpdate={updateBlock}
                            />
                        ) : block.type === 'image' ? (
                            <ImageBlock
                                key={block.id}
                                block={block}
                                onUpdate={updateBlock}
                            />
                        ) : block.type === 'link' ? (
                            <LinkBlock
                                key={block.id}
                                block={block}
                                onUpdate={updateBlock}
                            />
                        ) : (
                            <EmbedBlock
                                key={block.id}
                                block={block}
                                onUpdate={updateBlock}
                            />
                        )
                    ))}
                </section>

                <section className="form-section">
                    <h2>Key Metrics <span className="optional">(Max 6)</span></h2>
                    <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--color-text-light)' }}>
                        e.g. Value: "60%", Label: "Reduction in search time"
                    </p>

                    {metricsData.map((metric, index) => (
                        <div key={index} className="metrics-row">
                            <input
                                type="text"
                                placeholder="Value (e.g. 60%)"
                                value={metric.value}
                                onChange={(e) => handleMetricChange(index, 'value', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Label (e.g. faster onboarding)"
                                value={metric.label}
                                onChange={(e) => handleMetricChange(index, 'label', e.target.value)}
                            />
                            {metricsData.length > 1 && (
                                <button type="button" className="btn-secondary" onClick={() => removeMetric(index)}>
                                    ✕
                                </button>
                            )}
                        </div>
                    ))}
                    {metricsData.length < 6 && (
                        <button type="button" className="btn-secondary" onClick={addMetric}>
                            + Add Metric
                        </button>
                    )}
                </section>

            </main>
        </div>
    );
}
