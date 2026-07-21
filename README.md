# Compliance Mapping Tool

A single-project Next.js prototype for mapping an Assessment Tool against a Unit of Competency. The app extracts text from PDF, DOCX, and TXT uploads, sends the source text to Groq through a secure server route, validates the model output with Zod, and presents an explainable coverage matrix with confidence, gaps, uncertainties, recommendations, and human review alerts.

It also includes a one-click Appendix A sample loader so the walkthrough can be demonstrated immediately during an interview.

## Installation

1. Install Node.js 20 or newer.
2. Install dependencies:

```bash
npm install
```

3. Copy the environment template and add your Groq API key:

```bash
cp .env.example .env.local
```

Required environment variables:

```bash
GROQ_API_KEY=your_groq_api_key_here
```

## Running locally

Start the development server:

```bash
npm run dev
```

Open `http://localhost:3000`.

Production validation commands:

```bash
npm run lint
npm run build
```

## Architecture

- `app/`: App Router pages, global styles, and the secure API route at `app/api/analyze/route.ts`
- `components/`: dashboard sections and lightweight shadcn-style UI primitives
- `hooks/`: client hooks such as theme mode handling
- `lib/`: shared prompt, schema, and utility helpers
- `types/`: typed request, result, and upload contracts
- `utils/`: client-side document parsing and export helpers

## AI design decisions

- The browser extracts text from PDF, DOCX, and TXT files so the server route only handles the Groq call and never needs multipart upload plumbing.
- The server extracts the expected Performance Criteria from the uploaded unit first, then requires the model to return that exact criterion set. This removes a common failure mode where the model omits or renames criteria.
- The prompt instructs Groq to compare each Performance Criterion independently, cite only assessment evidence, avoid invented support, add a reviewer note, and return JSON only.
- `response_format: { type: "json_object" }` is combined with Zod validation and a single repair pass to reject or repair malformed model outputs before they reach the UI.
- Low confidence findings and empty evidence are surfaced as explicit human review alerts rather than hidden behind a single score.
- Friendly failures are returned when parsing or validation fails so the UI does not crash and the user can retry safely.
