import { SERVER_CONFIGS } from '../../config';
import OpenAI from 'openai';

/**
 * Creates and returns an instance of the OpenAI client.
 *
 * @returns {OpenAI} An instance of the OpenAI client configured with the API key from the server configuration.
 */
const getClient = () => {
    return new OpenAI({
        apiKey: SERVER_CONFIGS.OPENAI_API_KEY
    });
}

/**
 * Generates a chat response using the OpenAI GPT model.
 *
 * @param {string} gptUserPrompt - The user's input prompt to be sent to the GPT model.
 * @returns {Promise<OpenAI.Chat.Completion>} A promise that resolves to the chat completion response from the OpenAI API.
 *
 * @throws Will throw an error if the OpenAI API call fails or if the server configurations are invalid.
 */
const generateChatResponse = async (gptUserPrompt: string) => {
    const gptClient = getClient();
    return await gptClient.chat.completions.create({
        model: SERVER_CONFIGS.OPENAI_MODEL!,
        messages: [
            { role: 'user', content: gptUserPrompt },
        ],
        max_tokens: Number.parseInt(SERVER_CONFIGS.OPENAI_MAX_TOKENS!),
        temperature: Number.parseFloat(SERVER_CONFIGS.OPENAI_TEMPERATURE!),
    })
};

export { getClient, generateChatResponse };