import { generateMindMap } from './index';
import * as openaiModule from '../openai';
import SAMPLE_MIND_MAP_1 from './__mocks__/mindmap1.json';
import SAMPLE_MIND_MAP_2 from './__mocks__/mindmap2.json';

describe('generateMindMap', () => {
    const correlationId = 'corr-123';
    const jobs = [
        { subject: 'Mathematik', topic: 'Integrale Grundlagen, Integral Bedeutung' },
        { subject: 'Biologie', topic: 'Populationsökologie, Lotka-Volterra-Regeln' }
    ];

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('returns success for all jobs if openai returns mind maps', async () => {
        jest.spyOn(openaiModule, 'generateMindMap').mockImplementation(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async (_correlationId, subject, topic) => {
                if (subject === 'Mathematik') {
                    return { key: 'Mathematik', mindMap: SAMPLE_MIND_MAP_1 };
                }
                else {
                    return { key: 'Biologie', mindMap: SAMPLE_MIND_MAP_2 };
                }
            }
        );
        const result = await generateMindMap(correlationId, jobs);
        expect(result).toEqual([
            { subject: 'Mathematik', topic: 'Integrale Grundlagen, Integral Bedeutung', mindMap: SAMPLE_MIND_MAP_1, status: 'success' },
            { subject: 'Biologie', topic: 'Populationsökologie, Lotka-Volterra-Regeln', mindMap: SAMPLE_MIND_MAP_2, status: 'success' },
        ]);
    });

    it('returns failure for jobs if openai throws', async () => {
        jest.spyOn(openaiModule, 'generateMindMap').mockImplementationOnce(
            async () => { throw new Error('fail'); }
        ).mockImplementationOnce(
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            async (_correlationId, subject, topic) => ({ key: 'Biologie', mindMap: SAMPLE_MIND_MAP_2 })
        );
        const result = await generateMindMap(correlationId, jobs);
        expect(result[0]).toMatchObject({ subject: 'Mathematik', topic: 'Integrale Grundlagen, Integral Bedeutung', status: 'failure' });
        expect(result[1]).toMatchObject({ subject: 'Biologie', topic: 'Populationsökologie, Lotka-Volterra-Regeln', mindMap: SAMPLE_MIND_MAP_2, status: 'success' });
    });

    it('returns failure for all jobs if Promise.all fails', async () => {
        const jobsWithThrow = [
            { subject: 'Mathematik', topic: 'Integrale Grundlagen, Integral Bedeutung' },
            { subject: 'Biologie', topic: 'Populationsökologie, Lotka-Volterra-Regeln' },
        ];
        jest.spyOn(openaiModule, 'generateMindMap').mockImplementation(() => { throw new Error('sync fail'); });
        const result = await generateMindMap(correlationId, jobsWithThrow);
        expect(result).toEqual([
            { subject: 'Mathematik', topic: 'Integrale Grundlagen, Integral Bedeutung', status: 'failure' },
            { subject: 'Biologie', topic: 'Populationsökologie, Lotka-Volterra-Regeln', status: 'failure' },
        ]);
    });
});