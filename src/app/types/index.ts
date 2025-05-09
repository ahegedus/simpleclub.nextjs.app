interface Job {
    subject: string;
    topic: string;
}

interface JobStatus {
    topic: string;
    status: 'success' | 'failure';
}

interface JobResult extends Job, JobStatus {
    mindMap?: MindMap;
}


interface MindMapNode {
    id: string;
    title: string;
    content: string;
    children?: MindMapNode[];
}

interface MindMap extends Job {
    rootNode: MindMapNode;
}

interface MindMapResult {
    key: string;
    mindMap: MindMap;
}


export type { Job, JobResult, JobStatus, MindMap, MindMapResult }; 