import { useState, useEffect } from 'react'
import EditorForm from './components/EditorForm'
import Preview from './components/Preview'
import { generateCaseStudyText } from './services/ai'

function App() {
    const [viewMode, setViewMode] = useState('edit'); // 'edit' or 'preview'
    const [isGenerating, setIsGenerating] = useState(false);
    const [apiKey, setApiKey] = useState('');
    const [aiModel, setAiModel] = useState(() => {
        return localStorage.getItem('caseStudy_aiModel') || 'gemini-1.5-flash';
    });

    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('caseStudy_theme') || 'minimalist';
    });

    // Default states generators (forces fresh IDs on reset to unmount old ReactQuill instances)
    const getDefaultProjectData = () => ({ name: '', role: '', timeline: '' });
    const getDefaultBlocks = () => {
        const ts = Date.now();
        return [
            { id: `block-overview-${ts}`, type: 'text', heading: 'Overview', content: '', generatedContent: '' },
            { id: `block-problem-${ts}`, type: 'text', heading: 'The Challenge', content: '', generatedContent: '' },
            { id: `block-process-${ts}`, type: 'text', heading: 'Process & Discovery', content: '', generatedContent: '' },
            { id: `block-solution-${ts}`, type: 'text', heading: 'The Solution', content: '', generatedContent: '' },
            { id: `block-solution-img-${ts}`, type: 'image', images: [] },
            { id: `block-results-${ts}`, type: 'text', heading: 'Results & Impact', content: '', generatedContent: '' }
        ];
    };
    const getDefaultMetrics = () => [{ value: '', label: '' }];

    const [projectData, setProjectData] = useState(() => {
        const saved = localStorage.getItem('caseStudy_projectData');
        return saved ? JSON.parse(saved) : getDefaultProjectData();
    });

    const [blocks, setBlocks] = useState(() => {
        const saved = localStorage.getItem('caseStudy_blocks');
        return saved ? JSON.parse(saved) : getDefaultBlocks();
    });

    const [metricsData, setMetricsData] = useState(() => {
        const saved = localStorage.getItem('caseStudy_metricsData');
        return saved ? JSON.parse(saved) : getDefaultMetrics();
    });

    // Auto-Save Effect
    useEffect(() => {
        localStorage.setItem('caseStudy_projectData', JSON.stringify(projectData));
        localStorage.setItem('caseStudy_blocks', JSON.stringify(blocks));
        localStorage.setItem('caseStudy_metricsData', JSON.stringify(metricsData));
        localStorage.setItem('caseStudy_theme', theme);
        localStorage.setItem('caseStudy_aiModel', aiModel);
    }, [projectData, blocks, metricsData, theme, aiModel]);

    const handleClearData = () => {
        if (window.confirm('Are you sure you want to clear all data and start over? This cannot be undone.')) {
            setProjectData(getDefaultProjectData());
            setBlocks(getDefaultBlocks());
            setMetricsData(getDefaultMetrics());
            localStorage.removeItem('caseStudy_projectData');
            localStorage.removeItem('caseStudy_blocks');
            localStorage.removeItem('caseStudy_metricsData');
        }
    };

    const handleGenerate = async () => {
        if (!projectData.name) {
            alert("Please provide at least a Project Name.");
            return;
        }

        if (!apiKey) {
            // Fallback: Skip AI and map raw content to generatedContent
            const mappedBlocks = blocks.map(b => b.type === 'text' ? { ...b, generatedContent: b.content } : b);
            setBlocks(mappedBlocks);
            setViewMode('preview');
            return;
        }

        setIsGenerating(true);
        try {
            const updatedBlocks = await generateCaseStudyText(apiKey, aiModel, projectData, blocks);
            setBlocks(updatedBlocks);
            setViewMode('preview');
        } catch (error) {
            console.error("Error generating case study:", error);
            alert("Failed to generate case study. Please check your API key and try again.\n" + error.message);
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="app-container">
            <header className="header">
                <h1>Case Study Generator</h1>
                <button
                    className="btn-secondary"
                    onClick={() => setViewMode(viewMode === 'edit' ? 'preview' : 'edit')}
                >
                    {viewMode === 'edit' ? 'Preview Case Study' : 'Back to Editor'}
                </button>
            </header>

            <main className="main-content">
                {viewMode === 'edit' ? (
                    <EditorForm
                        apiKey={apiKey}
                        setApiKey={setApiKey}
                        aiModel={aiModel}
                        setAiModel={setAiModel}
                        projectData={projectData}
                        setProjectData={setProjectData}
                        blocks={blocks}
                        setBlocks={setBlocks}
                        metricsData={metricsData}
                        setMetricsData={setMetricsData}
                        theme={theme}
                        setTheme={setTheme}
                        onGenerate={handleGenerate}
                        onClear={handleClearData}
                    />
                ) : (
                    <Preview
                        projectData={projectData}
                        blocks={blocks}
                        metricsData={metricsData}
                        theme={theme}
                    />
                )}
            </main>

            {isGenerating && (
                <div className="loading-overlay">
                    <div className="spinner"></div>
                    <h2>Generating Polished Case Study...</h2>
                    <p>Analyzing your blocks and writing professional copy with {aiModel.includes('gemini') ? 'Google Gemini' : 'Anthropic Claude'}.</p>
                </div>
            )}
        </div>
    )
}

export default App
