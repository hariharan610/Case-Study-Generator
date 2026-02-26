import { generateMediumHtml } from './exportToMedium';

export function downloadHTML(projectData, blocks, metricsData, theme) {
    // 1. Get the raw HTML content (we re-use the Medium generator for the semantic body)
    const bodyHtml = generateMediumHtml(projectData, blocks, metricsData);

    // 2. Fetch the current CSS variables based on the theme
    // We'll inject a compiled version of our core styles to make it standalone
    const css = `
        :root {
            --spacing-xs: 0.5rem;
            --spacing-sm: 1rem;
            --spacing-md: 2rem;
            --spacing-lg: 4rem;
            --spacing-xl: 6rem;
        }

        /* Variables injected based on theme selection */
        body {
            ${theme === 'dark' ? `
                --color-bg: #111827; 
                --color-text: #F9FAFB;
                --color-accent: #3B82F6;
                --color-border: #374151;
                --font-sans: 'Inter', sans-serif;
                --font-serif: 'Inter', sans-serif;
            ` : theme === 'editorial' ? `
                --color-bg: #FAF9F7;
                --color-text: #1A1A2E;
                --color-accent: #E2B659;
                --color-border: #E0DFDD;
                --font-serif: 'Playfair Display', serif;
                --font-sans: 'DM Sans', sans-serif;
            ` : `
                --color-bg: #F9FAFB;
                --color-text: #111827;
                --color-accent: #000000;
                --color-border: #E5E7EB;
                --font-sans: 'Inter', sans-serif;
                --font-serif: 'Inter', sans-serif;
            `}

            background-color: var(--color-bg);
            color: var(--color-text);
            font-family: var(--font-sans);
            line-height: 1.6;
            margin: 0;
            padding: 0;
            -webkit-font-smoothing: antialiased;
        }

        .container {
            max-width: 800px;
            margin: 0 auto;
            padding: var(--spacing-lg) var(--spacing-md);
        }

        h1, h2, h3, h4, h5, h6 {
            font-family: var(--font-serif);
            color: var(--color-text);
            line-height: 1.25;
            margin-top: var(--spacing-md);
            margin-bottom: var(--spacing-sm);
        }

        h1 { font-size: 3rem; letter-spacing: -0.02em; }
        h2 { font-size: 1.5rem; opacity: 0.8; font-weight: normal; margin-top: 0; }
        h3 { font-size: 1.5rem; border-bottom: 1px solid var(--color-border); padding-bottom: 0.5rem; margin-top: var(--spacing-lg); }

        p {
            font-size: 1.125rem;
            margin-bottom: var(--spacing-md);
            color: var(--color-text);
            opacity: 0.9;
        }

        a {
            color: var(--color-text);
            text-decoration: underline;
            text-decoration-thickness: 2px;
            text-underline-offset: 4px;
        }

        ul, ol {
            font-size: 1.125rem;
            color: var(--color-text);
            opacity: 0.9;
            padding-left: var(--spacing-md);
            margin-bottom: var(--spacing-md);
        }

        li { margin-bottom: var(--spacing-xs); }

        img {
            max-width: 100%;
            height: auto;
            border-radius: 8px;
            margin: var(--spacing-sm) 0;
        }

        @media print {
            body { background: white; color: black; }
            .container { max-width: 100%; padding: 0; }
        }
    `;

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${projectData.name || 'Case Study'}</title>
    <style>${css}</style>
</head>
<body>
    <div class="container">
        ${bodyHtml}
    </div>
</body>
</html>`;

    // 3. Trigger download
    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(projectData.name || 'case-study').toLowerCase().replace(/\s+/g, '-')}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
