export async function generateCaseStudyText(apiKey, projectData, blocks) {
    // Extract only the text blocks to send to Claude
    const textBlocks = blocks.filter(b => b.type === 'text');

    const formattedNotes = textBlocks.map(b => `Block ID: ${b.id}\nHeading: ${b.heading}\nNotes: ${b.content}`).join('\n\n');

    const prompt = `
I am providing notes for a UX design case study. Please expand these notes into polished, professional copy for a portfolio.

PROJECT CONTEXT:
Name: ${projectData.name}
Role: ${projectData.role}
Timeline: ${projectData.timeline}

NOTES TO EXPAND BY BLOCK ID:
${formattedNotes}

RULES:
1. Preserve facts: NEVER invent, round, or modify any numbers, names, or specific claims that I provided.
2. POV: Write in the first person ("I" / "we").
3. Tone: Professional but human, confident, no fluff. Do not use buzzwords.
4. Length: Proportional expansion. If I wrote 1 sentence, expand to 2-3 sentences. If I wrote a full paragraph, refine it rather than expanding.
5. Provide the output in strictly valid JSON format. The JSON should be an array of objects, where each object has "id" and "generatedContent".
Do not wrap the JSON in markdown blocks, just return the raw JSON array string.
`;

    const response = await fetch('/api/anthropic/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20241022',
            max_tokens: 2000,
            system: 'You are an expert UX design portfolio copywriter. Follow instructions exactly and return ONLY valid JSON.',
            messages: [
                { role: 'user', content: prompt }
            ]
        })
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const textOutput = data.content?.[0]?.text || '[]';

    try {
        const cleanedText = textOutput.replace(/```json\\n/g, '').replace(/```/g, '').trim();
        const generatedMapping = JSON.parse(cleanedText);

        // Map AI expansions back onto the master blocks list
        const updatedBlocks = blocks.map(block => {
            if (block.type === 'text') {
                const update = generatedMapping.find(g => g.id === block.id);
                if (update) {
                    return { ...block, generatedContent: update.generatedContent };
                }
            }
            return block;
        });

        return updatedBlocks;
    } catch (err) {
        console.error("Failed to parse AI response as JSON:", textOutput);
        throw new Error("The AI returned an invalid format. Please try again.");
    }
}
