import { MindMap, MindMapResult } from '@/app/types';
import { generateMindMapKey } from '@/app/utils/indexer';
import { saveAndPublishGeneratedMindMap, savePromptFileToBucket } from '@/app/services/bucket';

import { generateChatResponse } from './openai';
import promptTemplate from './prompt.template';


/**
 * Generates a topic mind map based on the provided subject and topic using OpenAI's GPT model.
 * 
 * This function performs the following steps:
 * 1. Validates the input parameters to ensure they are non-empty strings.
 * 2. Generates a unique key for the mind map based on the subject and topic.
 * 3. Creates a user prompt by replacing placeholders in a template with the subject and topic.
 * 4. Saves the generated prompt to a Google Cloud Storage bucket.
 * 5. Sends the prompt to OpenAI's GPT model to generate a response.
 * 6. Parses the GPT response into a `MindMap` object and validates its structure.
 * 7. Saves the generated mind map result as a JSON file in the Google Cloud Storage bucket.
 * 8. Copies the result file to a published folder for further use.
 * 
 * @param correlationId - A unique identifier for the generation process.
 * @param subject - The subject for which the mind map is being generated. Must be a non-empty string.
 * @param topic - The topic for which the mind map is being generated. Must be a non-empty string.
 * 
 * @returns A promise that resolves to the generated mind map.
 * 
 * @throws Will throw an error if:
 * - The `subject` or `topic` is invalid (empty, non-string, or undefined).
 * - Required environment variables for OpenAI API are not set.
 * - The OpenAI API call fails or returns an invalid response.
 * - The GPT response cannot be parsed into a valid `MindMap` object.
 * - Saving or copying files to the Google Cloud Storage bucket fails.
 */
async function generateMindMap(
    correlationId: string,
    subject: string,
    topic: string,
): Promise<MindMapResult> {
    if (!subject || !topic) {
        throw new Error('Invalid subject or topic');
    }
    if (typeof subject !== 'string' || typeof topic !== 'string') {
        throw new Error('Invalid subject or topic type');
    }
    if (subject.length === 0 || topic.length === 0) {
        throw new Error('Empty subject or topic');
    }

    // Generate a unique key for the mind map based on the subject and topic
    const generatedMindMapKey = await generateMindMapKey(subject, topic);

    const gptUserPrompt = promptTemplate
        .replaceAll("{{ subject }}", subject)
        .replaceAll("{{ topic }}", topic);

    // Save the generated prompt to a file under `correlationId` folder
    const gptPromptFilePath = await savePromptFileToBucket(correlationId, generatedMindMapKey, gptUserPrompt, { subject, topic });
    console.log('Prompt file saved:', gptPromptFilePath);

    // Generate the mind map using OpenAI's GPT model
    console.log(`Generating topic for subject=${subject} topic=${topic}`);
    const gptCompletionResponse = await generateChatResponse(gptUserPrompt)
        .catch((error) => {
            console.error('Error generating topic:', error);
            throw new Error('Failed to generate topic');
        });
    if (!gptCompletionResponse || !gptCompletionResponse.choices || gptCompletionResponse.choices.length === 0) {
        throw new Error('No response from OpenAI');
    }
    if (!gptCompletionResponse.choices[0].message || !gptCompletionResponse.choices[0].message.content) {
        throw new Error('Invalid response from OpenAI');
    }
    if (gptCompletionResponse.choices[0].message.role !== 'assistant') {
        throw new Error('Invalid response role from OpenAI');
    }
    if (gptCompletionResponse.choices[0].message.content.length === 0) {
        throw new Error('Empty response from OpenAI');
    }

    const gptResponseContent = gptCompletionResponse.choices[0].message.content;

    let parsedMindMapResultFromGpt: MindMap | undefined = undefined;
    try {
        parsedMindMapResultFromGpt = JSON.parse(gptResponseContent) as MindMap;
    } catch (error) {
        console.error('Error parsing mind map result:', error);
    }
    if (!parsedMindMapResultFromGpt || !parsedMindMapResultFromGpt.rootNode) {
        throw new Error('Invalid response format from OpenAI');
    }

    // Save the generated mind map result to a file under `correlationId` folder and then to `PUBLISHED_FOLDER`
    await saveAndPublishGeneratedMindMap(correlationId, generatedMindMapKey, gptResponseContent, subject, topic);

    return {
        key: generatedMindMapKey,
        mindMap: parsedMindMapResultFromGpt,
    };
}

export {
    generateMindMap,
}



