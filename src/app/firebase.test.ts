import { getBucket } from './firebase';

const mockBucket = { name: 'test-bucket' };
jest.mock('firebase-admin/storage', () => ({
    getStorage: jest.fn(() => ({
        bucket: jest.fn(() => mockBucket),
    })),
}));
jest.mock('./config', () => ({
    SERVER_CONFIGS: { GCLOUD_STORAGE_BUCKET: 'test-bucket' },
}));

jest.mock('firebase-admin/app', () => ({
    getApp: jest.fn(() => ({
        name: 'SC.NextJs',
    })),
    initializeApp: jest.fn(() => ({
        name: 'SC.NextJs',
    })),
    getApps: jest.fn(() => [{ name: 'SC.NextJs' }]),
}));

describe('getBucket', () => {
    it('returns the bucket if found', () => {
        expect(getBucket()).toBe(mockBucket);
    });
});