export function generateMediumHtml(projectData, blocks, metricsData) {
    const validMetrics = metricsData.filter(m => m.value || m.label);

    let html = `<h1>${projectData.name || 'Untitled Project'}</h1>`;

    if (projectData.role || projectData.timeline) {
        const meta = [projectData.role, projectData.timeline].filter(Boolean).join(' • ');
        html += `<h2>${meta}</h2>`;
    }

    if (validMetrics.length > 0) {
        html += `<h3>Key Outcomes</h3><ul>`;
        validMetrics.forEach(m => {
            html += `<li><strong>${m.value || ''}</strong> ${m.label || ''}</li>`;
        });
        html += `</ul><br/>`;
    }

    blocks.forEach(block => {
        if (block.type === 'text') {
            const displayCopy = block.generatedContent || block.content;
            if (!block.heading && !displayCopy) return;

            if (block.heading) {
                html += `<h3>${block.heading}</h3>`;
            }

            if (displayCopy) {
                // Split by newlines to create proper paragraphs for Medium
                const paragraphs = displayCopy.split('\n').filter(p => p.trim());
                let inList = false;

                paragraphs.forEach(p => {
                    let parsedParagraph = p
                        // Links
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
                        // Bold
                        .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
                        // Italics
                        .replace(/\*([^*]+)\*/g, '<em>$1</em>');

                    if (parsedParagraph.startsWith('- ')) {
                        if (!inList) {
                            html += `<ul>`;
                            inList = true;
                        }
                        html += `<li>${parsedParagraph.substring(2)}</li>`;
                    } else {
                        if (inList) {
                            html += `</ul>`;
                            inList = false;
                        }
                        html += `<p>${parsedParagraph}</p>`;
                    }
                });
                if (inList) {
                    html += `</ul>`;
                }
            }
        }

        if (block.type === 'image' && block.images && block.images.length > 0) {
            // Medium only supports sequential images natively via pasting, so we stack them
            block.images.forEach(imgSrc => {
                html += `<img src="${imgSrc}" />`;
            });
            html += `<br/>`;
        }

        if (block.type === 'link' && block.url) {
            html += `<p style="text-align: center;"><a href="${block.url}"><strong>${block.label || 'View Link'}</strong></a></p>`;
        }

        if (block.type === 'embed' && block.url) {
            html += `<div style="margin-top: 1rem; border: 1px solid var(--color-border); border-radius: 8px; overflow: hidden; height: 600px; max-height: 80vh;">
                <iframe src="${block.url}" style="width: 100%; height: 100%; border: none;" allowfullscreen></iframe>
            </div><br/>`;
        }
    });

    return html;
}
