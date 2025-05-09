import { NextResponse } from 'next/server';
import { v7 as newUuid } from "uuid"

import { saveInputFileToBucket, saveOutputFileToBucket } from '@/app/services/bucket';
import { generateMindMap } from '@/app/services/mindMapGenerator';
import { Job } from '@/app/types';
import { convertJobStatusListToCsvFormat, parseCsvFileFromMemoryBuffer } from '@/app/utils/csv';
import { LOGGER_ENABLED } from '@/app/constants';

export async function POST(req: Request) {
    const correlationId = newUuid();
    try {
        if (LOGGER_ENABLED) console.log('Correlation Key', correlationId);

        const jobs = await getGenerationJobsFromRequest(req, correlationId);
        if (!jobs || jobs.length === 0) {
            throw new Error('Invalid Request: No jobs found');
        }

        const mindMapGenerationResults = await generateMindMap(correlationId, jobs);

        if (!mindMapGenerationResults || mindMapGenerationResults.length === 0) {
            throw new Error('Invalid Request: No mind map generation results found');
        }

        const responseFileContent = convertJobStatusListToCsvFormat(mindMapGenerationResults);
        if (await saveOutputFileToBucket(correlationId, responseFileContent)) {
            if (LOGGER_ENABLED) console.log('Output file saved to bucket:', correlationId);
        }

        return new NextResponse(responseFileContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="${correlationId}.csv"`,
            },
        });

    } catch (error) {
        if (error instanceof Error && error.message.toLowerCase().includes('invalid')) {
            if (LOGGER_ENABLED) console.error('Bad Request:', error, correlationId);
            return NextResponse.json({ error: error.message, correlationId }, { status: 400 });
        } else {
            if (LOGGER_ENABLED) console.error(error, correlationId);
            return NextResponse.json({ error: 'Internal Server Error', correlationId }, { status: 500 });
        }
    }
}

async function getGenerationJobsFromRequest(req: Request, correlationId: string): Promise<Job[]> {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
        throw new Error('Invalid Request: Missing file');
    }

    if (file.type !== 'text/csv') {
        throw new Error('Invalid File Type: Only CSV files are accepted');
    }

    const buffer = await file.arrayBuffer();

    if (!buffer || buffer.byteLength === 0) {
        throw new Error('Invalid File: Unable to read file');
    } else if (await saveInputFileToBucket(correlationId, buffer)) {
        if (LOGGER_ENABLED) console.log('Input file saved to bucket:', correlationId);
    }

    return parseCsvFileFromMemoryBuffer(buffer);
}