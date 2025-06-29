import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // console.log("AI Chat API called");

    const body = await request.json();
    // console.log("Request body:", body);

    const { messages } = body;

    if (!messages) {
      // console.log("Missing messages in request");
      return NextResponse.json({ error: "Missing messages" }, { status: 400 });
    }

    // console.log("Messages received:", messages);
    // console.log("API Key available:", !!process.env.OPENROUTER_API_KEY);
    // console.log(
    //   "Model:",
    //   process.env.AI_MODEL || "deepseek/deepseek-chat-v3-0324:free"
    // );

    const response = await fetch(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer":
            process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
          "X-Title": "Data Alchemist",
        },
        body: JSON.stringify({
          model: process.env.AI_MODEL || "deepseek/deepseek-chat-v3-0324:free",
          messages,
        }),
      }
    );

    // console.log("OpenRouter response status:", response.status);

    if (!response.ok) {
      const error = await response.text();
      // console.log("OpenRouter error:", error);
      return NextResponse.json({ error }, { status: response.status });
    }

    const data = await response.json();
    // console.log("OpenRouter success response");

    return NextResponse.json({
      success: true,
      data: data.choices[0]?.message?.content || "",
    });
  } catch (error: any) {
    console.error("API route error:", error);
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
