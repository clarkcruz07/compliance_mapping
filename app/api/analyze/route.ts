import Groq from "groq-sdk";
import { NextResponse } from "next/server";

import { analyzeRequestSchema } from "@/lib/analysis-schema";
import { normalizeAnalysisResult, parseModelResult } from "@/lib/analysis-result";
import { extractPerformanceCriteria } from "@/lib/criteria";
import { buildAnalysisPrompt } from "@/lib/prompts";

const groqApiKey = process.env.GROQ_API_KEY;

const groq = groqApiKey
  ? new Groq({
      apiKey: groqApiKey,
    })
  : null;

async function createAnalysis(unitText: string, assessmentText: string) {
  const extractedCriteria = extractPerformanceCriteria(unitText);

  if (extractedCriteria.length === 0) {
    throw new Error(
      "We could not detect any Performance Criteria in the Unit of Competency. Please upload a clearer source document.",
    );
  }

  const completion = await groq!.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    temperature: 0.1,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You produce strict JSON for compliance mapping tasks. Do not include markdown fences or prose outside the JSON object.",
      },
      {
        role: "user",
        content: buildAnalysisPrompt(unitText, assessmentText, extractedCriteria),
      },
    ],
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("The analysis service returned an empty response. Please try again.");
  }

  try {
    const parsed = parseModelResult(content);
    return normalizeAnalysisResult(parsed, extractedCriteria);
  } catch {
    const repairCompletion = await groq!.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Repair the provided model output into valid JSON matching the requested schema exactly. Do not add new evidence.",
        },
        {
          role: "user",
          content: `${buildAnalysisPrompt(unitText, assessmentText, extractedCriteria)}\n\nPrevious invalid response:\n${content}`,
        },
      ],
    });

    const repairedContent = repairCompletion.choices[0]?.message?.content;

    if (!repairedContent) {
      throw new Error("The analysis output could not be repaired into valid JSON.");
    }

    const repaired = parseModelResult(repairedContent);
    return normalizeAnalysisResult(repaired, extractedCriteria);
  }
}

export async function POST(request: Request) {
  if (!groq) {
    return NextResponse.json(
      {
        error: "Missing GROQ_API_KEY. Add it to your environment before running analysis.",
      },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const payload = analyzeRequestSchema.parse(body);
    const result = await createAnalysis(payload.unitText, payload.assessmentText);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error:
            error.message ||
            "We couldn't validate the model output this time. Please review your documents and try again.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Something unexpected happened while analyzing the documents.",
      },
      { status: 500 },
    );
  }
}