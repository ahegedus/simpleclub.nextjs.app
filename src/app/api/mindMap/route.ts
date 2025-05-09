import { PUBLISHED_FOLDER } from '@/app/constants';
import { getAllPublishedFilesFromBucket } from '@/app/services/bucket';
import { MindMap } from '@/app/types';
import { NextResponse } from 'next/server';

export async function GET() {
    const publishedMindMapFileContents = await getAllPublishedFilesFromBucket(PUBLISHED_FOLDER);
    if (!publishedMindMapFileContents || publishedMindMapFileContents.length === 0) {
        return NextResponse.json({ message: 'No files found' }, { status: 404 });
    }
    const mindMaps = publishedMindMapFileContents.map((file) => {
        try {
            return JSON.parse(file) as MindMap;
        } catch (error) {
            console.error('Error parsing JSON:', error, file);
            return null;
        }
    }).filter((mindMap) => mindMap !== null) as MindMap[];
    if (!mindMaps || mindMaps.length === 0) {
        return NextResponse.json({ message: 'No mind maps found' }, { status: 404 });
    }

    return NextResponse.json(mindMaps, { status: 200 });
}