const parseMock = jest.fn();

jest.mock('csv-parse/sync', () => ({
    parse: parseMock,
}));

import { JobStatus } from '@/app/types';
import { parseCsvFileFromMemoryBuffer, convertJobStatusListToCsvFormat } from './index';

describe('parseCsvFileFromMemoryBuffer', () => {
    it('parses valid CSV buffer into Job[]', () => {
        parseMock.mockReturnValue([
            { subject: 'Math', topic: 'Algebra' },
            { subject: 'Science', topic: 'Physics' },
        ]);

        const csv = 'subject,topic\nMath,Algebra\nScience,Physics';
        const buffer = Buffer.from(csv).buffer;
        const result = parseCsvFileFromMemoryBuffer(buffer);
        expect(result).toEqual([
            { subject: 'Math', topic: 'Algebra' },
            { subject: 'Science', topic: 'Physics' },
        ]);
    });

    it('throws error if subject or topic is missing', () => {
        parseMock.mockReturnValue([
            { subject: 'Math', topic: 'Algebra' },
            { subject: 'Science', INVALID_PROP: 'Physics' },
        ]);


        const csv = 'subject,topic\nMath,';
        const buffer = Buffer.from(csv).buffer;
        expect(() => parseCsvFileFromMemoryBuffer(buffer)).toThrow(
            'Invalid CSV format: Missing subject or topic in attached CSV file'
        );
    });
});

describe('convertJobStatusListToCsvFormat', () => {
    it('converts JobStatus[] to CSV string', () => {
        const jobStatus: JobStatus[] = [
            { topic: 'Algebra', status: 'success' },
            { topic: 'Physics', status: 'failure' },
        ];
        const csv = convertJobStatusListToCsvFormat(jobStatus);
        expect(csv).toContain('topic,status');
        expect(csv).toContain('Algebra,success');
        expect(csv).toContain('Physics,failure');
    });

    it('handles empty array', () => {
        const csv = convertJobStatusListToCsvFormat([]);
        expect(csv).toContain('topic,status');
    });
});