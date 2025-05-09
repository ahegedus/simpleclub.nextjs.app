import path from "path";
import { getBucket } from "@/app/firebase";
import { SERVER_CONFIGS } from "@/app/config";
import { PUBLISHED_FOLDER } from "@/app/constants";

async function saveInputFileToBucket(folder: string, buffer: ArrayBuffer, metadata: object = {}): Promise<string> {
    const bucket = getBucket();
    const inputFileName = `input.csv`;
    const inputFilePath = path.join(folder, inputFileName);
    const inputFile = bucket.file(inputFilePath);
    await inputFile.save(Buffer.from(buffer), {
        contentType: 'text/csv',
        metadata: metadata ? {
            ...metadata,
        } : undefined,
    });
    return inputFilePath;
}


async function saveOutputFileToBucket(folder: string, outputContent: string, metadata: object = {}): Promise<string> {
    const bucket = getBucket();
    const outputFileName = `output.csv`;
    const outputFilePath = path.join(folder, outputFileName);
    const outputFile = bucket.file(outputFilePath);
    await outputFile.save(outputContent, {
        contentType: 'text/csv',
        metadata: metadata ? {
            ...metadata,
        } : undefined,
    });
    return outputFilePath;
}

async function savePromptFileToBucket(folder: string, generatedMindMapKey: string, gptUserPrompt: string, metadata: object = {}): Promise<string> {
    const gcpBucket = getBucket();
    const gptPromptFilePath = path.join(folder, `${generatedMindMapKey}.prompt.txt`);
    const gptPromptFile = gcpBucket.file(gptPromptFilePath);
    await gptPromptFile.save(gptUserPrompt, {
        contentType: 'text/plain',
        metadata: {
            ...metadata,
            mindMapKey: generatedMindMapKey,
        },
    });
    return gptPromptFilePath;
}

async function getAllPublishedFilesFromBucket(folder: string): Promise<string[]> {
    const bucket = getBucket();
    const [files] = await bucket.getFiles({ prefix: folder });
    const fileContents: string[] = [];
    await Promise.all(files.map(async (file) => {
        const [fileContent] = await file.download();
        fileContents.push(fileContent.toString());
    }));
    return fileContents;
}

async function saveAndPublishGeneratedMindMap(folder: string, generatedMindMapKey: string, gptResponseContent: string, subject: string, topic: string) {
    const bucket = getBucket();
    const generatedResultFileName = `${generatedMindMapKey}.json`;
    const generatednResultFilePath = path.join(folder, generatedResultFileName);
    const generatedResultFile = bucket.file(generatednResultFilePath);
    await generatedResultFile.save(gptResponseContent, {
        contentType: 'application/json',
        metadata: {
            correlationId: folder,
            mindMapKey: generatedMindMapKey,
            subject,
            topic,
            generationModel: SERVER_CONFIGS.OPENAI_MODEL,
            generationTemperature: Number.parseFloat(SERVER_CONFIGS.OPENAI_TEMPERATURE!),
            generationMaxTokens: Number.parseInt(SERVER_CONFIGS.OPENAI_MAX_TOKENS!),
        },
    });

    // Copy the result file to the published folder
    const publishedMindMapFilePath = path.join(PUBLISHED_FOLDER, generatedResultFileName);
    await generatedResultFile.copy(bucket.file(publishedMindMapFilePath));

    return generatednResultFilePath;
}

export {
    saveInputFileToBucket,
    saveOutputFileToBucket,
    savePromptFileToBucket,
    saveAndPublishGeneratedMindMap,
    getAllPublishedFilesFromBucket,
}