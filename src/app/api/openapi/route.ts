import { NextResponse } from 'next/server';

export async function GET() {
    const openApiDocumentation = {
        openapi: '3.0.0',
        info: {
            title: 'API Documentation',
            version: '1.0.0',
            description: 'This is the OpenAPI documentation for our API.',
        },
        paths: {
            '/api/mindMap': {
                get: {
                    summary: 'Get all published mind maps',
                    description: 'Retrieves all published mind maps from the storage bucket.',
                    responses: {
                        '200': {
                            description: 'Successful response with an array of MindMap objects.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'array',
                                        items: { $ref: '#/components/schemas/MindMap' },
                                    },
                                },
                            },
                        },
                        '404': {
                            description: 'No files found',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'No files found',
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            },
            '/api/mindMapGenerator': {
                post: {
                    summary: 'Upload CSV File to start generation process',
                    description: 'Accepts a CSV file with subject and topic columns, processes it, and returns another CSV file with topic and status fields describing the AI generation status for each topic.',
                    requestBody: {
                        required: true,
                        content: {
                            'multipart/form-data': {
                                schema: {
                                    type: 'object',
                                    properties: {
                                        file: {
                                            type: 'string',
                                            format: 'binary',
                                            description: 'subject,topic<br />Populationsökologie,"Populationsökologie, Lotka-Volterra-Regeln"<br />"Integrale Grundlagen","Integrale Grundlagen, Integral Bedeutung"',
                                        },
                                    },
                                    required: ['file'],
                                },
                            },
                        },
                    },
                    responses: {
                        '200': {
                            description: 'Successful response with the generated CSV file.',
                            content: {
                                'text/csv': {
                                    schema: {
                                        type: 'string',
                                        format: 'binary',
                                        description: 'The generated CSV file containing topic and status fields.',
                                        example: 'topic,status\n"Populationsökologie, Lotka-Volterra-Regeln",success\n"Integrale Grundlagen, Integral Bedeutung",failure\n',
                                    },
                                },
                            },
                        },
                        '400': {
                            description: 'Bad Request - Input CSV file is invalid.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Invalid input CSV file.',
                                            },
                                            correlationId: {
                                                type: 'string',
                                                example: '123e4567-e89b-12d3-a456-426614174000',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                        '500': {
                            description: 'Internal Server Error - Error during generation process.',
                            content: {
                                'application/json': {
                                    schema: {
                                        type: 'object',
                                        properties: {
                                            message: {
                                                type: 'string',
                                                example: 'Error during generation process.',
                                            },
                                            correlationId: {
                                                type: 'string',
                                                example: '123e4567-e89b-12d3-a456-426614174000',
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
        components: {
            schemas: {
                ErrorResponse: {
                    type: 'object',
                    properties: {
                        message: {
                            type: 'string',
                            example: 'An error occurred.',
                        },
                        correlationId: {
                            type: 'string',
                            example: '123e4567-e89b-12d3-a456-426614174000',
                        },
                    },
                },
                MindMapNode: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        title: { type: 'string' },
                        content: { type: 'string' },
                        children: {
                            type: 'array',
                            items: { $ref: '#/components/schemas/MindMapNode' },
                        },
                    },
                    required: ['id', 'title', 'content'],
                },
                MindMap: {
                    type: 'object',
                    properties: {
                        subject: { type: 'string' },
                        topic: { type: 'string' },
                        rootNode: { $ref: '#/components/schemas/MindMapNode' },
                    },
                    required: ['subject', 'topic', 'rootNode'],
                },
            },
        },
    };

    return NextResponse.json(openApiDocumentation);
}