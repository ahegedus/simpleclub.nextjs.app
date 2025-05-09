import { generateMindMapKey } from './index';

describe('generateMindMapKey', () => {
    it('generates a deterministic, sortable, hashed identifier', async () => {
        const key1 = await generateMindMapKey('Math', 'Algebra');
        const key2 = await generateMindMapKey('Math', 'Algebra');
        expect(key1).toBe(key2);
        expect(key1).toMatch(/^math__algebra__[a-f0-9]{10}$/);
    });

    it('normalizes input (case, spaces, special chars)', async () => {
        const key1 = await generateMindMapKey('  Math ', 'Algebra!');
        const key2 = await generateMindMapKey('math', 'algebra');
        expect(key1).toBe(key2);
    });

    it('produces different hashes for different input', async () => {
        const key1 = await generateMindMapKey('Math', 'Algebra');
        const key2 = await generateMindMapKey('Math', 'Geometry');
        expect(key1).not.toBe(key2);
    });

    it('is safe for filenames and network communication', async () => {
        const key = await generateMindMapKey('Sci/ence', 'Phy@sics');
        expect(key).not.toMatch(/[^a-z0-9\-_]/);
    });
});
