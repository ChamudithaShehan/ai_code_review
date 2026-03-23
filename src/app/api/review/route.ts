import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code, language, model } = await req.json();

    if (!code) {
      return NextResponse.json({ error: "Code is required" }, { status: 400 });
    }

    if (!process.env.OPENROUTER_API_KEY) {
      console.error("OPENROUTER_API_KEY is missing! You must restart your Next.js server to load the new .env.local file.");
    }

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model || "qwen/qwen3-coder:free",
        messages: [
          {
            role: "system",
            content: `You are an expert ${language || 'programming'} code reviewer. Analyze the provided code and return your findings as a strict JSON array of objects.
Each object MUST have the following properties:
- "id" (string): a unique identifier like "1", "2", etc.
- "type" (string): exactly one of "error", "warning", or "suggestion".
- "line" (number): the line number the issue is related to.
- "title" (string): a short descriptive title.
- "description" (string): a detailed explanation of the issue and why it matters.
- "code" (string, optional): a suggested code fix snippet.

CRITICAL: Your response must be NOTHING BUT a valid JSON array (e.g. [{"id":"1",...}]). Do not include markdown \`\`\`json blocks. Do not include any text before or after.`
          },
          {
            role: "user",
            content: code
          }
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("OpenRouter API error:", errorText);
      return NextResponse.json({ error: "Failed to analyze code" }, { status: 500 });
    }

    const data = await response.json();
    let content = data.choices[0].message.content.trim();

    // Sometimes the model still outputs markdown code blocks despite instructions
    if (content.startsWith("\`\`\`json")) {
      content = content.replace(/^\`\`\`json\s*/, "").replace(/\s*\`\`\`$/, "");
    } else if (content.startsWith("\`\`\`")) {
      content = content.replace(/^\`\`\`\w*\s*/, "").replace(/\s*\`\`\`$/, "");
    }

    let parsedFeedback;
    try {
      parsedFeedback = JSON.parse(content);
      // If the model wrapped the array in an object like {"feedback": [...]}, extract it
      if (!Array.isArray(parsedFeedback)) {
        if (parsedFeedback.feedback && Array.isArray(parsedFeedback.feedback)) {
          parsedFeedback = parsedFeedback.feedback;
        } else if (parsedFeedback.errors || parsedFeedback.issues) {
          parsedFeedback = parsedFeedback.errors || parsedFeedback.issues;
        } else {
          // Wrap in array if it returned a single object
          parsedFeedback = [parsedFeedback];
        }
      }
    } catch (parseError) {
      console.error("Failed to parse OpenRouter response as JSON:", content);
      return NextResponse.json({ error: "Invalid JSON response from AI" }, { status: 500 });
    }

    return NextResponse.json({ feedback: parsedFeedback });
  } catch (error) {
    console.error("Review API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
