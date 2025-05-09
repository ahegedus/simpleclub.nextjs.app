import { Job, JobResult } from "@/app/types";

import { generateMindMap as generateMindMapViaGPT } from "../openai";

async function generateMindMap(correlationId: string, generationJobs: Job[]): Promise<JobResult[]> {

    const mindMapGenerationThreads = generationJobs.map(({ subject, topic }: Job): Promise<JobResult> => (new Promise(async (report) => {
        try {
            const mindMapResult = await generateMindMapViaGPT(correlationId, subject, topic);
            report(({ subject, topic, mindMap: mindMapResult.mindMap, status: 'success' }));
        }
        catch (err) {
            console.error('Error generating topic:', err);
            report(({ subject, topic, status: 'failure' }));
        }
    })));

    let jobExecutionResults: JobResult[] = [];
    await Promise.all(mindMapGenerationThreads)
        .then((jobResult) => {
            jobExecutionResults = jobResult;
        }).catch((error) => {
            console.error('Error processing threads:', error);
            throw new Error(error);
        });

    return jobExecutionResults;
}

export {
    generateMindMap,
}