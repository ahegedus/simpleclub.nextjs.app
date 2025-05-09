import {
    saveInputFileToBucket,
    saveOutputFileToBucket,
    savePromptFileToBucket,
    saveAndPublishGeneratedMindMap,
    getAllPublishedFilesFromBucket,
} from './index';

jest.mock('@/app/firebase', () => ({
    getBucket: jest.fn(),
}));

const mockFile = () => ({
    save: jest.fn().mockResolvedValue(undefined),
    copy: jest.fn().mockResolvedValue(undefined),
    download: jest.fn().mockResolvedValue([Buffer.from('file content')]),
});

const mockBucket = {
    file: jest.fn(() => mockFile()),
    getFiles: jest.fn(() => Promise.resolve([[{ download: jest.fn().mockResolvedValue([Buffer.from('abc')]) }]])),
};

import { getBucket } from '@/app/firebase';
(getBucket as jest.Mock).mockReturnValue(mockBucket);

describe('Bucket Service', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('saveInputFileToBucket saves file and returns path', async () => {
        const path = await saveInputFileToBucket('folder', new ArrayBuffer(2));
        expect(mockBucket.file).toHaveBeenCalledWith(expect.stringContaining('input.csv'));
        expect(path).toContain('input.csv');
    });

    it('saveOutputFileToBucket saves file and returns path', async () => {
        const path = await saveOutputFileToBucket('folder', 'csv content');
        expect(mockBucket.file).toHaveBeenCalledWith(expect.stringContaining('output.csv'));
        expect(path).toContain('output.csv');
    });

    it('savePromptFileToBucket saves prompt file and returns path', async () => {
        const path = await savePromptFileToBucket('folder', 'key', 'prompt');
        expect(mockBucket.file).toHaveBeenCalledWith(expect.stringContaining('key.prompt.txt'));
        expect(path).toContain('key.prompt.txt');
    });

    it('savePromptFileToBucket uses default empty metadata', async () => {
        const path = await savePromptFileToBucket('folder', 'key', 'prompt');
        const callArgs = mockBucket.file.mock.results[0].value.save.mock.calls[0][1];
        expect(callArgs.metadata).toHaveProperty('mindMapKey', 'key');
        expect(path).toContain('key.prompt.txt');
    });

    it('getAllPublishedFilesFromBucket downloads all files', async () => {
        const files = await getAllPublishedFilesFromBucket('folder');
        expect(Array.isArray(files)).toBe(true);
        expect(files[0]).toBe('abc');
    });

    it('saveAndPublishGeneratedMindMap saves and copies file', async () => {
        const path = await saveAndPublishGeneratedMindMap('folder', 'key', '{"foo":"bar"}', 'Math', 'Algebra');
        expect(mockBucket.file).toHaveBeenCalledWith(expect.stringContaining('key.json'));
        expect(path).toContain('key.json');
    });
});