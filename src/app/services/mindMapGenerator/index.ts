import { Job, JobResult } from "@/app/types";

import { generateMindMap as generateMindMapViaGPT } from "../openai";
import { LOGGER_ENABLED } from "@/app/constants";

async function generateMindMap(correlationId: string, generationJobs: Job[]): Promise<JobResult[]> {

    const mindMapGenerationThreads = generationJobs.map(({ subject, topic }: Job): Promise<JobResult> => (new Promise(async (report) => {
        try {
            const mindMapResult = await generateMindMapViaGPT(correlationId, subject, topic);
            report(({ subject, topic, mindMap: mindMapResult.mindMap, status: 'success' }));
        }
        catch (err) {
            report(({ subject, topic, status: 'failure' }));
        }
    })));

    const jobExecutionResults: JobResult[] = await Promise.all(mindMapGenerationThreads);
    return jobExecutionResults;
}

export {
    generateMindMap,
}