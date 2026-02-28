import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';
import ColorThief from 'colorthief';
import rehypeRaw from 'rehype-raw';
import { generateMediumHtml } from '../utils/exportToMedium';
import { downloadHTML } from '../utils/exportToHTML';

export default function Preview({
    projectData,
    blocks,
    metricsData,
    theme
}) {
    const [copyStatus, setCopyStatus] = useState('Copy for Medium');
    const [dominantColor, setDominantColor] = useState(null);
    const validMetrics = metricsData.filter(m => m.value || m.label);

    // ColorThief dynamic background extraction
    React.useEffect(() => {
        const firstImageBlock = blocks.find(b => b.type === 'image' && b.images && b.images.length > 0);
        if (firstImageBlock && firstImageBlock.images[0]) {
            const img = new Image();
            img.crossOrigin = 'Anonymous';
            img.onload = () => {
                try {
                    const colorThief = new ColorThief();
                    const color = colorThief.getColor(img);
                    // Create a very subtle, premium 15% opacity wash
                    setDominantColor(`rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.12)`);
                } catch (e) {
                    console.error("ColorThief failed", e);
                }
            };
            img.src = firstImageBlock.images[0];
        } else {
            setDominantColor(null);
        }
    }, [blocks]);

    const renderTextWithLinks = (text) => {
        // Simple regex to match [Link Text](https://url.com)
        const parts = text.split(/(\[[^\]]+\]\([^)]+\))/g);

        return parts.map((part, i) => {
            const match = part.match(/\[([^\]]+)\]\(([^)]+)\)/);
            if (match) {
                return (
                    <a
                        key={i}
                        href={match[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: 'var(--color-text)', textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '4px' }}
                    >
                        {match[1]}
                    </a>
                );
            }
            return <React.Fragment key={i}>{part}</React.Fragment>;
        });
    };

    const handleCopyToMedium = async () => {
        try {
            const html = generateMediumHtml(projectData, blocks, metricsData);

            const blobHtml = new Blob([html], { type: 'text/html' });
            const blobText = new Blob([html.replace(/<[^>]*>?/gm, '')], { type: 'text/plain' });
            const data = [new window.ClipboardItem({
                'text/html': blobHtml,
                'text/plain': blobText
            })];

            await navigator.clipboard.write(data);
            setCopyStatus('Copied! Paste into Medium');
            setTimeout(() => setCopyStatus('Copy for Medium'), 3000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            setCopyStatus('Failed to copy');
            setTimeout(() => setCopyStatus('Copy for Medium'), 3000);
        }
    };

    return (
        <div className={`preview-container theme-${theme}`}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '1rem', backgroundColor: 'var(--color-bg)', borderBottom: '1px solid var(--color-border)', gap: '0.5rem' }}>
                <button
                    className="btn-secondary"
                    onClick={() => downloadHTML(projectData, blocks, metricsData, theme)}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Download HTML
                </button>
                <button
                    className="btn-secondary"
                    onClick={handleCopyToMedium}
                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                        <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                    </svg>
                    {copyStatus}
                </button>
            </div>

            {/* Hero Section (Basic Info) */}
            <section className="preview-hero" style={{ minHeight: '300px' }}>
                <div className="preview-hero-gradient" style={dominantColor ? {
                    background: `linear-gradient(to bottom, ${dominantColor} 0%, var(--color-input-bg) 100%)`
                } : {}}></div>
                <div className="preview-hero-content">
                    <h1>{projectData.name || 'Untitled Project'}</h1>
                    <div className="preview-hero-meta">
                        {projectData.role && <span>{projectData.role}</span>}
                        {(projectData.role && projectData.timeline) && <span>•</span>}
                        {projectData.timeline && <span>{projectData.timeline}</span>}
                    </div>
                </div>
            </section>

            {/* Metrics Bar */}
            {validMetrics.length > 0 && (
                <section className="preview-metrics-bar">
                    {validMetrics.map((metric, idx) => (
                        <div key={idx} className="preview-metric">
                            <div className="preview-metric-value">{metric.value || '-'}</div>
                            <div className="preview-metric-label">{metric.label || 'Metric'}</div>
                        </div>
                    ))}
                </section>
            )}

            {/* Content Sections mapped dynamically */}
            <section className="preview-content">
                <AnimatePresence>
                    {blocks.map(block => {
                        if (block.type === 'text') {
                            const displayCopy = block.generatedContent || block.content;
                            if (!block.heading && !displayCopy) return null;

                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                                    key={block.id}
                                    className="preview-section"
                                >
                                    {block.heading && <h3>{block.heading}</h3>}
                                    {displayCopy && (
                                        <ReactMarkdown
                                            rehypePlugins={[rehypeRaw]}
                                            components={{
                                                p: ({ node, ...props }) => <p style={{ maxWidth: '65ch', margin: '0 auto 1.5rem auto', fontSize: '1.125rem', lineHeight: 1.6, letterSpacing: '0.01em', color: 'var(--color-text)', opacity: 0.9 }} {...props} />,
                                                a: ({ node, ...props }) => <a style={{ color: 'var(--color-text)', textDecoration: 'underline', textDecorationThickness: '2px', textUnderlineOffset: '4px' }} target="_blank" rel="noopener noreferrer" {...props} />,
                                                ul: ({ node, ...props }) => <ul style={{ maxWidth: '65ch', margin: '0 auto 1.5rem auto', paddingLeft: '1.5rem', fontSize: '1.125rem', lineHeight: 1.6, letterSpacing: '0.01em', color: 'var(--color-text)', opacity: 0.9 }} {...props} />,
                                                ol: ({ node, ...props }) => <ol style={{ maxWidth: '65ch', margin: '0 auto 1.5rem auto', paddingLeft: '1.5rem', fontSize: '1.125rem', lineHeight: 1.6, letterSpacing: '0.01em', color: 'var(--color-text)', opacity: 0.9 }} {...props} />,
                                                li: ({ node, ...props }) => <li style={{ marginBottom: '0.5rem' }} {...props} />
                                            }}
                                        >
                                            {displayCopy}
                                        </ReactMarkdown>
                                    )}
                                </motion.div>
                            );
                        }

                        if (block.type === 'image' && block.images && block.images.length > 0) {
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                                    key={block.id}
                                    className="preview-section"
                                    style={{ margin: '2rem 0' }}
                                >
                                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${block.images.length === 1 ? '100%' : '300px'}, 1fr))`, gap: '1rem' }}>
                                        {block.images.map((imgSrc, imgIdx) => (
                                            <img key={imgIdx} src={imgSrc} alt="" style={{ width: '100%', borderRadius: 'var(--border-radius)', objectFit: 'cover' }} />
                                        ))}
                                    </div>
                                    {block.caption && (
                                        <p style={{ textAlign: 'center', fontSize: '0.9rem', color: 'var(--color-text-light)', marginTop: '1rem', fontStyle: 'italic', maxWidth: '65ch', margin: '1rem auto 0 auto' }}>
                                            {block.caption}
                                        </p>
                                    )}
                                </motion.div>
                            );
                        }

                        if (block.type === 'link' && block.url) {
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                                    key={block.id}
                                    className="preview-section"
                                    style={{ textAlign: 'center', margin: '4rem 0' }}
                                >
                                    <a
                                        href={block.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            display: 'inline-block',
                                            backgroundColor: 'var(--color-text)',
                                            color: 'white',
                                            padding: '1rem 2.5rem',
                                            borderRadius: '8px',
                                            textDecoration: 'none',
                                            fontWeight: '500',
                                            fontSize: '1.1rem',
                                            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                            transition: 'transform 0.2s',
                                        }}
                                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                                        onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                                    >
                                        {block.label || 'View Link'}
                                    </a>
                                </motion.div>
                            )
                        }

                        if (block.type === 'embed' && block.url) {
                            return (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.4, type: "spring", bounce: 0.2 }}
                                    key={block.id}
                                    className="preview-section"
                                    style={{ margin: '3rem 0', borderRadius: 'var(--border-radius)', overflow: 'hidden', border: '1px solid var(--color-border)', backgroundColor: '#F3F4F6' }}
                                >
                                    <iframe
                                        src={block.url}
                                        style={{ width: '100%', height: '500px', border: 'none', display: 'block' }}
                                        title="Figma Preview"
                                        allowFullScreen
                                    />
                                </motion.div>
                            )
                        }

                        return null;
                    })}
                </AnimatePresence>
            </section>
        </div>
    );
}
