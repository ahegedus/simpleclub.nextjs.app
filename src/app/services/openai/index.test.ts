import { generateMindMap } from './index';
import { generateMindMapKey } from '@/app/utils/indexer';
import { saveAndPublishGeneratedMindMap, savePromptFileToBucket } from '@/app/services/bucket';
import { generateChatResponse } from './openai';
import promptTemplate from './prompt.template';

jest.mock('@/app/utils/indexer', () => ({ generateMindMapKey: jest.fn() }));
jest.mock('@/app/services/bucket', () => ({
    saveAndPublishGeneratedMindMap: jest.fn(),
    savePromptFileToBucket: jest.fn(),
}));
jest.mock('./openai', () => ({ generateChatResponse: jest.fn() }));
jest.mock('./prompt.template', () => 'Prompt: {{ subject }} - {{ topic }}');

const mockKey = 'mock-key';
const mockPromptPath = 'mock-path.txt';
const mockGptResponse = {
    choices: [
        {
            message: {
                role: 'assistant',
                content: JSON.stringify({ subject: 'Math', topic: 'Algebra', rootNode: { id: '1', title: 'Algebra', content: 'desc' } })
            }
        }
    ]
};

describe('generateMindMap (OpenAI service)', () => {
    const correlationId = 'corr-1';
    const subject = 'Math';
    const topic = 'Algebra';

    beforeEach(() => {
        jest.clearAllMocks();
        (generateMindMapKey as jest.Mock).mockResolvedValue(mockKey);
        (savePromptFileToBucket as jest.Mock).mockResolvedValue(mockPromptPath);
        (saveAndPublishGeneratedMindMap as jest.Mock).mockResolvedValue('result.json');
        (generateChatResponse as jest.Mock).mockResolvedValue(mockGptResponse);
    });

    it('generates a mind map successfully', async () => {
        const result = await generateMindMap(correlationId, subject, topic);
        expect(generateMindMapKey).toHaveBeenCalledWith(subject, topic);
        expect(savePromptFileToBucket).toHaveBeenCalledWith(correlationId, mockKey, expect.any(String), { subject, topic });
        expect(generateChatResponse).toHaveBeenCalledWith(expect.any(String));
        expect(saveAndPublishGeneratedMindMap).toHaveBeenCalledWith(correlationId, mockKey, expect.any(String), subject, topic);
        expect(result).toHaveProperty('key', mockKey);
        expect(result).toHaveProperty('mindMap');
        expect(result.mindMap.subject).toBe('Math');
        expect(result.mindMap.topic).toBe('Algebra');
        expect(result.mindMap.rootNode).toBeDefined();
    });

    it('throws if subject or topic is missing', async () => {
        await expect(generateMindMap(correlationId, '', topic)).rejects.toThrow('Invalid subject or topic');
        await expect(generateMindMap(correlationId, subject, '')).rejects.toThrow('Invalid subject or topic');
    });

    it('throws if OpenAI returns no choices', async () => {
        (generateChatResponse as jest.Mock).mockResolvedValue({ choices: [] });
        await expect(generateMindMap(correlationId, subject, topic)).rejects.toThrow('No response from OpenAI');
    });

    it('throws if OpenAI returns invalid message', async () => {
        (generateChatResponse as jest.Mock).mockResolvedValue({ choices: [{ message: null }] });
        await expect(generateMindMap(correlationId, subject, topic)).rejects.toThrow('Invalid response from OpenAI');
    });

    it('throws if OpenAI returns wrong role', async () => {
        (generateChatResponse as jest.Mock).mockResolvedValue({ choices: [{ message: { role: 'user', content: 'abc' } }] });
        await expect(generateMindMap(correlationId, subject, topic)).rejects.toThrow('Invalid response role from OpenAI');
    });

    it('throws if OpenAI returns empty content', async () => {
        (generateChatResponse as jest.Mock).mockResolvedValue({ choices: [{ message: { role: 'assistant', content: '' } }] });
        await expect(generateMindMap(correlationId, subject, topic)).rejects.toThrow('Invalid response from OpenAI');
    });

    it('throws if GPT response is not valid JSON', async () => {
        (generateChatResponse as jest.Mock).mockResolvedValue({ choices: [{ message: { role: 'assistant', content: 'not-json' } }] });
        await expect(generateMindMap(correlationId, subject, topic)).rejects.toThrow('Invalid response format from OpenAI');
    });

    it('throws if GPT response fails', async () => {
        (generateChatResponse as jest.Mock).mockRejectedValueOnce({ message: 'API error' });
        await expect(generateMindMap(correlationId, subject, topic)).rejects.toThrow('Failed to generate topic');
    });

    it('throws if parsed mind map is missing rootNode', async () => {
        (generateChatResponse as jest.Mock).mockResolvedValue({ choices: [{ message: { role: 'assistant', content: JSON.stringify({ subject: 'Math', topic: 'Algebra' }) } }] });
        await expect(generateMindMap(correlationId, subject, topic)).rejects.toThrow('Invalid response format from OpenAI');
    });


});