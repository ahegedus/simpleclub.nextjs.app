# SC Next.js Mind Map Generator

This project is a Next.js application for automated mind map generation using OpenAI's GPT-3.5-Turbo API and Google Cloud Storage (via Firebase). It provides a web-based API and documentation UI for uploading CSVs, triggering mind map generation, and retrieving results. The app is designed for scalability, security, and extensibility.

---

## Table of Contents
- [Background](#background)
- [Solution Overview](#solution-overview)
- [Project Structure](#project-structure)
- [Setup & Installation](#setup--installation)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Deployment](#deployment)
- [API Usage](#api-usage)
- [CSV Input/Output Format](#csv-inputoutput-format)
- [Environment Variables](#environment-variables)
- [Architectural Decisions](#architectural-decisions)
- [Best Practices](#best-practices)
- [Notes](#notes)

---

## Background

This project demonstrates automated content generation using LLMs. It evaluates OpenAI's GPT-3.5-Turbo for generating mind maps from CSV input, storing results in Google Cloud Storage, and exposing a simple API for integration.

## Solution Overview
- **Input:** CSV file upload via API endpoint.
- **Processing:** Each row is processed, calling OpenAI to generate a mind map.
- **Storage:** Mind maps are stored in Google Cloud Storage (Firebase Storage).
- **Output:** Status and results are available for download as CSV.
- **API:** REST endpoints for upload, download, and OpenAPI documentation.

## Project Structure
```
/ (root)
├── Dockerfile
├── examples/                # Sample input/output files
├── public/                  # Static assets (SVGs, etc.)
├── rfc/                     # Decision records, RFC, etc.
├── src/
│   └── app/
│       ├── api/
│       │   ├── mindMapGenerator/   # POST: Upload CSV to trigger Mind Map generation
│       │   ├── mindMap/            # GET: Retrieve all generated and published mind maps
│       │   └── openapi/            # GET: OpenAPI spec
│       ├── docs/                   # Swagger UI docs page
│       ├── firebase.ts             # Firebase admin and storage setup
│       ├── config.ts               # Environment variable setup
│       ├── constants.ts            # Application wide toggles and constants
│       ├── services/               # Service implementations (OpenAI, bucket, mindMapGenerator)
│       ├── types/                  # Interfaces and types
│       └── utils/                  # Utilities and tools (CSV, indexer)
├── package.json                   # Dependencies and scripts
├── next.config.ts                 # Next.js config
├── tsconfig.json                  # TypeScript config
└── README.md
```

## Setup & Installation

### Prerequisites
- Node.js 18+
- yarn
- Google Cloud project & service account (for Firebase Storage)
- OpenAI API Key

### 1. Clone the Repository
```sh
git clone <your-repo-url>
cd sc.nextjs
```

### 2. Install Dependencies
```sh
yarn install
```

### 3. Set Up Environment Variables
Create a `.env.local` file in the root directory with:
```
GCP_PROJECT_ID=<your-project>
GCLOUD_STORAGE_BUCKET=<your-bucket>
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_TEMPERATURE=0.7
OPENAI_MAX_TOKENS=3000
OPENAI_API_KEY=<your-openai-api-key>
LOGGER_ENABLED=true
```

### 4. Run Locally

Impersonate Service User to access GCP resources
```sh
gcloud auth application-default login --impersonate-service-account <your-service-account>
export GOOGLE_APPLICATION_CREDENTIALS="$HOME/.config/gcloud/application_default_credentials.json"
```

Run the application
```sh
yarn dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the app and API docs.

## Development Workflow
- **Lint:** `yarn lint` / `yarn lint:fix`
- **Build:** `yarn build`
- **Start:** `yarn start`
- **Docs:** Swagger UI at `/docs` (served from `/api/openapi`)

## Testing
- Unit/integration tests using Jest framework.
- To run tests:
```sh
yarn test
```

## Deployment

### Deploy to Google Cloud Run
- This command is needed for setting up the environment variables as needed:
```sh
gcloud run deploy sc-nextjs-homeassignment \
  --source . \
  --project=<your-gcp-project> \
  --set-env-vars=GCP_PROJECT_ID=<your-gcp-project>,GCLOUD_STORAGE_BUCKET=<your-bucket>,OPENAI_MODEL=gpt-3.5-turbo,OPENAI_TEMPERATURE=0.7,OPENAI_MAX_TOKENS=3000,OPENAI_API_KEY=<openai-key> \
  --region=<your-region> \
  --platform=managed \
  --allow-unauthenticated
```
- Then any follow up deployment:
```sh
yarn deploy
```

## API Usage

### 1. OpenAPI Documentation
- **Endpoint:** `GET /api/openapi`
- **Docs UI:** Visit `/docs` in your browser

### 2. Retrieve All Mind Maps
- **Endpoint:** `GET /api/mindMap`
- **Response:**
  - `200 OK`: Returns an array of MindMap objects.
    ```json
    [
      {
        "subject": "string",
        "topic": "string",
        "rootNode": {
          "id": "string",
          "title": "string",
          "content": "string",
          "children": [/* MindMapNode[] */]
        }
      }
    ]
    ```
  - `404 Not Found`: No files found.
    ```json
    { "message": "No files found" }
    ```

### 3. Generate Mind Maps from CSV
- **Endpoint:** `POST /api/mindMapGenerator`
- **Request:**
  - Content-Type: `multipart/form-data`
  - Body:
    - `file`: The CSV file to upload. Example content:
      ```csv
      subject,topic
      Populationsökologie,"Populationsökologie, Lotka-Volterra-Regeln"
      "Integrale Grundlagen","Integrale Grundlagen, Integral Bedeutung"
      ```
- **Response:**
  - `200 OK`: Returns a generated CSV file with `topic` and `status` fields.
    - Content-Type: `text/csv`
    - Example content:
      ```csv
      topic,status
      "Populationsökologie, Lotka-Volterra-Regeln",success
      "Integrale Grundlagen, Integral Bedeutung",failure
      ```
  - `400 Bad Request`: Input CSV file is invalid.
    ```json
    {
      "message": "Invalid input CSV file.",
      "correlationId": "123e4567-e89b-12d3-a456-426614174000"
    }
    ```
  - `500 Internal Server Error`: Error during generation process.
    ```json
    {
      "message": "Error during generation process.",
      "correlationId": "123e4567-e89b-12d3-a456-426614174000"
    }
    ```

## CSV Input/Output Format

### Input CSV
- Columns: `subject`, `topic` (minimum required)

### Output CSV
- Columns: `topic`, `status` (Success/Failure)

## Environment Variables
- `GCP_PROJECT_ID`: GCP project ID
- `GCLOUD_STORAGE_BUCKET`: GCP Storage bucket name
- `OPENAI_MODEL`: OpenAI model name
- `OPENAI_TEMPERATURE`: OpenAI temperature
- `OPENAI_MAX_TOKENS`: OpenAI max tokens
- `OPENAI_API_KEY`: OpenAI API key

## Architectural Decisions
- **Next.js** for serverless API and UI
- **Firebase Admin SDK** for secure GCP Storage access
- **OpenAPI/Swagger** for self-documenting API
- **TypeScript** for type safety
- **Environment variables** for secrets/config
- **Stateless endpoints** for scalability