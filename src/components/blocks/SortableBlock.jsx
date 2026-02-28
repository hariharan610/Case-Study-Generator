import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

export function SortableBlock({ id, block, onRemove }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 999 : 1,
        boxShadow: isDragging ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' : 'none',
        rotate: isDragging ? '2deg' : '0deg',
        scale: isDragging ? 1.02 : 1,
        borderColor: isDragging ? 'var(--color-accent)' : 'var(--color-border)',
        cursor: isDragging ? 'grabbing' : 'pointer'
    };

    const getTitle = () => {
        if (block.type === 'text') {
            return block.heading || 'Untitled Text Section';
        } else if (block.type === 'image') {
            return `Image Gallery`;
        } else if (block.type === 'link') {
            return block.label ? `🔗 ${block.label}` : 'External Link';
        } else if (block.type === 'embed') {
            return 'Live Embed';
        }
        return 'Unknown Block';
    };

    const getIcon = () => {
        if (block.type === 'image') {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                    <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
            );
        } else if (block.type === 'link') {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
            );
        } else if (block.type === 'embed') {
            return (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="16 18 22 12 16 6"></polyline>
                    <polyline points="8 6 2 12 8 18"></polyline>
                </svg>
            );
        }
        return (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="21" y1="10" x2="3" y2="10"></line>
                <line x1="21" y1="6" x2="3" y2="6"></line>
                <line x1="21" y1="14" x2="3" y2="14"></line>
                <line x1="21" y1="18" x2="3" y2="18"></line>
            </svg>
        );
    };

    return (
        <div ref={setNodeRef} style={style} className="outline-item">
            <div
                {...attributes}
                {...listeners}
                className="drag-handle"
                title="Drag to reorder"
            >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                    <path d="M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z"></path>
                </svg>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', color: 'var(--color-text-light)' }}>
                {getIcon()}
            </div>

            <div className="outline-item-content">
                {getTitle()}
            </div>

            <button
                type="button"
                onClick={onRemove}
                style={{
                    background: 'none',
                    border: 'none',
                    color: '#ff4d4f',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex'
                }}
                title="Remove Block"
            >
                ✕
            </button>
        </div>
    );
}
