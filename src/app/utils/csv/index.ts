import { Job, JobStatus } from '@/app/types';
import { parse } from 'csv-parse/sync';
import { stringify } from 'csv-stringify/sync';

function parseCsvFileFromMemoryBuffer(buffer: ArrayBuffer): Job[] {
    const records = parse(Buffer.from(buffer), {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_quotes: true,
        skipRecordsWithEmptyValues: true,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return records.map((record: { subject: string; topic: string; }) => {
        if (!record.subject || !record.topic) {
            throw new Error('Invalid CSV format: Missing subject or topic in attached CSV file');
        }

        return ({
            subject: record.subject,
            topic: record.topic,
        });
    });
}

function convertJobStatusListToCsvFormat(jobStatus: JobStatus[]): string {
    return stringify(jobStatus, {
        header: true,
        columns: ['topic', 'status'],
    });
}


export { parseCsvFileFromMemoryBuffer, convertJobStatusListToCsvFormat };