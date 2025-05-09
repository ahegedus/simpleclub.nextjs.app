import { getClient, generateChatResponse } from './openai';
import OpenAI from 'openai';

jest.mock('../../config', () => ({
    SERVER_CONFIGS: {
        GCP_PROJECT_ID: 'test-gcp-project-id',
        GCLOUD_STORAGE_BUCKET: 'test-gcs-bucket',
        OPENAI_MODEL: 'test-openai-model',
        OPENAI_TEMPERATURE: '0.7',
        OPENAI_MAX_TOKENS: 150,
        OPENAI_API_KEY: 'test-api-key',
    }
}));

const mockCreate = jest.fn();
jest.mock('openai', () => {
    return jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: mockCreate,
            },
        },
    }));
});

describe('getClient', () => {
    it('should create an OpenAI client with the correct API key', () => {
        const client = getClient();
        expect(OpenAI).toHaveBeenCalledWith({
            apiKey: 'test-api-key',
        });
        expect(client).toBeDefined();
    });
});

describe('generateChatResponse', () => {
    const prompt = 'Hello, AI!';
    const mockResponse = { id: 'test', choices: [{ message: { content: '' } }] };

    beforeEach(() => {
        mockCreate.mockClear();
        mockCreate.mockResolvedValue(mockResponse);
    });

    it('should call OpenAI chat.completions.create with correct parameters', async () => {
        const response = await generateChatResponse(prompt);
        expect(mockCreate).toHaveBeenCalledWith({
            model: expect.any(String),
            messages: [
                { role: 'user', content: prompt },
            ],
            max_tokens: expect.any(Number),
            temperature: expect.any(Number),
        });
        expect(response).toBe(mockResponse);
    });

    it('should throw if OpenAI call fails', async () => {
        mockCreate.mockRejectedValueOnce(new Error('API error'));
        await expect(generateChatResponse(prompt)).rejects.toThrow('API error');
    });

    it('should handle empty response content gracefully', async () => {
        const response = await generateChatResponse(prompt);
        expect(response.choices[0].message.content).toHaveLength(0);
    });
});