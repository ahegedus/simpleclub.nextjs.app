import { getBucket } from './firebase';
import { getApps } from "firebase-admin/app";

const mockBucket = { name: 'test-bucket' };
jest.mock('firebase-admin/storage', () => ({
    getStorage: jest.fn(() => ({
        bucket: jest.fn((bucketName) => mockBucket),
    })),
}));
jest.mock('./config', () => ({
    SERVER_CONFIGS: { GCLOUD_STORAGE_BUCKET: 'test-bucket' },
}));

jest.mock('firebase-admin/app', () => ({
    getApp: jest.fn(() => ({
        name: 'SimpleClub.NextJs',
    })),
    initializeApp: jest.fn(() => ({
        name: 'SimpleClub.NextJs',
    })),
    getApps: jest.fn(() => [{ name: 'SimpleClub.NextJs' }]),
}));

describe('getBucket', () => {
    it('returns the bucket if found', () => {
        expect(getBucket()).toBe(mockBucket);
    });
});