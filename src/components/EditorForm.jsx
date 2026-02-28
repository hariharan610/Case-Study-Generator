import React, { useState } from 'react';
import { Type, Image as ImageIcon, Link2, MonitorPlay, Sparkles } from 'lucide-react';
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
import { generateCaseStudyTitle } from '../services/ai';

export default function EditorForm({
    apiKey, setApiKey,
    aiModel, setAiModel,
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

    const [isGeneratingTitle, setIsGeneratingTitle] = useState(false);

    const handleAutoGenerateTitle = async () => {
        if (!apiKey) {
            let providerName = 'Anthropic';
            if (aiModel.includes('gemini')) providerName = 'Google';
            if (aiModel.includes('gpt')) providerName = 'OpenAI';
            if (aiModel.includes('qwen')) providerName = 'Alibaba DashScope';

            alert(`Please paste your ${providerName} API Key to use AI features.`);
            return;
        }

        const outlineContext = blocks
            .map(b => b.heading || b.type)
            .filter(Boolean)
            .join(', ');

        if (!outlineContext) {
            alert("Please add some blocks to your outline first so the AI knows what your project is about.");
            return;
        }

        setIsGeneratingTitle(true);
        try {
            const title = await generateCaseStudyTitle(apiKey, aiModel, outlineContext);
            if (title) {
                setProjectData({ ...projectData, name: title });
            }
        } catch (e) {
            console.error(e);
            alert("Failed to auto-generate title. Check your API key.");
        } finally {
            setIsGeneratingTitle(false);
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
                                <Type size={20} />
                                Text
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => addBlock('image')} style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 0.5rem', gap: '0.25rem' }}>
                                <ImageIcon size={20} />
                                Image
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => addBlock('link')} style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 0.5rem', gap: '0.25rem' }}>
                                <Link2 size={20} />
                                Link
                            </button>
                            <button type="button" className="btn-secondary" onClick={() => addBlock('embed')} style={{ fontSize: '0.85rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '0.75rem 0.5rem', gap: '0.25rem' }}>
                                <MonitorPlay size={20} />
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
                    <div style={{ marginBottom: '1.5rem' }}>
                        <h3 style={{ margin: '0 0 0.5rem 0' }}>AI Provider</h3>
                        <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Choose your AI engine.</p>
                        <select
                            value={aiModel}
                            onChange={(e) => setAiModel(e.target.value)}
                            style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-input-bg)', color: 'var(--color-text)' }}
                        >
                            <option value="gemini-1.5-flash">Google Gemini 1.5 Flash (Free Tier)</option>
                            <option value="claude-3-5-sonnet">Anthropic Claude 3.5 Sonnet</option>
                            <option value="gpt-4o">OpenAI GPT-4o</option>
                            <option value="qwen-plus">Alibaba Qwen-Plus</option>
                        </select>
                    </div>

                    <h3 style={{ margin: '0 0 0.5rem 0' }}>API Key</h3>
                    <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>Stored entirely locally in your browser cache.</p>
                    <input
                        type="password"
                        placeholder={aiModel.includes('gemini') ? "AIzaSy..." : aiModel.includes('gpt') ? "sk-proj-..." : "sk-..."}
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
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label>Project Name</label>
                            <button
                                onClick={handleAutoGenerateTitle}
                                disabled={isGeneratingTitle}
                                style={{
                                    display: 'flex', alignItems: 'center', gap: '4px',
                                    background: 'none', border: 'none',
                                    color: 'var(--color-accent)', fontSize: '0.8rem',
                                    cursor: 'pointer', fontWeight: 600, padding: 0
                                }}
                            >
                                <Sparkles size={14} />
                                {isGeneratingTitle ? 'Thinking...' : 'Auto-Generate'}
                            </button>
                        </div>
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
