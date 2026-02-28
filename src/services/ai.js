import { GoogleGenerativeAI } from '@google/generative-ai';

export async function generateCaseStudyText(apiKey, aiModel, projectData, blocks) {
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

    let textOutput = '';

    if (aiModel.includes('gemini')) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: aiModel });

        const systemInstruction = 'You are an expert UX design portfolio copywriter. Follow instructions exactly and return ONLY valid JSON.';
        const result = await model.generateContent(`${systemInstruction}\n\n${prompt}`);
        const response = await result.response;
        textOutput = response.text() || '[]';
    } else if (aiModel.includes('gpt') || aiModel.includes('qwen')) {
        // Both OpenAI and DashScope (Qwen) use the identical OpenAI-compatible chat completions API format
        const endpoint = aiModel.includes('qwen')
            ? '/api/qwen/compatible-mode/v1/chat/completions'
            : '/api/openai/v1/chat/completions';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: aiModel,
                max_tokens: 2000,
                messages: [
                    { role: 'system', content: 'You are an expert UX design portfolio copywriter. Follow instructions exactly and return ONLY valid JSON.' },
                    { role: 'user', content: prompt }
                ]
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData?.error?.message || `API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        textOutput = data.choices?.[0]?.message?.content || '[]';
    } else {
        // Fallback to Anthropic Claude
        const response = await fetch('/api/anthropic/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: aiModel,
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
        textOutput = data.content?.[0]?.text || '[]';
    }

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

export async function generateCaseStudyTitle(apiKey, aiModel, outlineContext) {
    const prompt = `Based on this case study outline: "${outlineContext}", generate a punchy, creative, 2-5 word title for the project. Respond with ONLY the title string, no quotes.`;

    if (aiModel.includes('gemini')) {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: aiModel });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        return response.text()?.trim().replace(/['"]+/g, '');
    } else if (aiModel.includes('gpt') || aiModel.includes('qwen')) {
        const endpoint = aiModel.includes('qwen')
            ? '/api/qwen/compatible-mode/v1/chat/completions'
            : '/api/openai/v1/chat/completions';

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: aiModel,
                max_tokens: 30,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        const data = await response.json();
        if (data.choices && data.choices[0]) {
            return data.choices[0].message.content.trim().replace(/['"]+/g, '');
        }
    } else {
        const response = await fetch('/api/anthropic/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'anthropic-dangerous-direct-browser-access': 'true'
            },
            body: JSON.stringify({
                model: 'claude-3-haiku-20240307', // Using haiku for fast, cheap titling when on Anthropic
                max_tokens: 30,
                messages: [{ role: 'user', content: prompt }]
            })
        });
        const data = await response.json();
        if (data.content && data.content[0]) {
            return data.content[0].text.trim().replace(/['"]+/g, '');
        }
    }
    return '';
}
