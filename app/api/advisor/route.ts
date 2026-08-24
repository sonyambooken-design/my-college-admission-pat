import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: NextRequest) {
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ error: "AI advisor is not configured yet." }, { status: 503 });
  const { question, profile, colleges } = await req.json();
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const model = process.env.OPENAI_MODEL || "gpt-5.2";
  try {
    const response = await client.responses.create({
      model,
      input: [
        { role: "system", content: "You are a careful U.S. college-planning advisor. Use supplied college data as facts, distinguish heuristic fit scores from official statistics, never guarantee admission, and tell users to verify cycle-specific BS/MD, BS/DO, deadlines, testing policies and program rules with institutions." },
        { role: "user", content: `Student profile: ${JSON.stringify(profile)}\nTop colleges: ${JSON.stringify(colleges?.slice?.(0,10) ?? [])}\nQuestion: ${question}` }
      ]
    });
    return NextResponse.json({ answer: response.output_text });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Advisor request failed." }, { status: 500 });
  }
}
