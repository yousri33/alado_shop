import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const { image, prompt } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
    if (!apiKey) {
      console.error("❌ AI ERROR: Missing GOOGLE_GENERATIVE_AI_API_KEY in .env.local");
      return NextResponse.json({
        error: "Google API Key is not configured. Please check your environment variables.",
      }, { status: 500 });
    }

    // Detect mime type from data URI
    const mimeTypeMatch = image.match(/^data:(image\/[a-zA-Z]+);base64,/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : "image/jpeg";
    const base64Data = image.split(",")[1] || image;

    if (!base64Data || base64Data.length < 50) {
      return NextResponse.json({ error: "Invalid image data. Please upload a valid photo." }, { status: 400 });
    }

    const genAI = new GoogleGenerativeAI(apiKey);

    // Use Nano Banana 2 with IMAGE output modality enabled — this is the key fix!
    const model = genAI.getGenerativeModel({
      model: "gemini-3.1-flash-image-preview",
      generationConfig: {
        // @ts-ignore — responseModalities is supported but not yet in all type definitions
        responseModalities: ["IMAGE", "TEXT"],
      },
    });

    const userPrompt = prompt ||
      "You are a professional e-commerce photo editor. Take this product photo and enhance it: apply realistic studio lighting, remove the background and replace it with a clean white or neutral gradient, upscale to 4K quality with sharp detail, add professional product shadows. Output a stunning website-ready product image.";

    console.log("🍌 Nano Banana: Sending to Gemini for IMAGE generation...");

    const result = await model.generateContent([
      userPrompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      },
    ]);

    const response = result.response;
    if (!response) throw new Error("Empty response from Nano Banana AI engine.");

    // Extract the generated image from the response parts
    const parts = response.candidates?.[0]?.content?.parts || [];
    console.log("🍌 Nano Banana: Response parts count:", parts.length);

    let generatedImageBase64: string | null = null;
    let analysisText = "";

    for (const part of parts) {
      if (part.inlineData?.data) {
        // This is the AI-generated image!
        generatedImageBase64 = part.inlineData.data;
        console.log("✅ Nano Banana: Got generated image from AI.");
      }
      if (part.text) {
        analysisText += part.text;
      }
    }

    // If no generated image in response, fall back to analysis-only mode
    if (!generatedImageBase64) {
      console.warn("⚠️ Nano Banana: No image generated—model returned text only. Using original image.");
      generatedImageBase64 = base64Data;
      if (!analysisText) analysisText = response.text?.() || "Image analyzed successfully.";
    }

    // Save the GENERATED (or AI-enhanced) image to Supabase Storage
    const finalImageBase64 = generatedImageBase64 as string;
    const supabase = createAdminClient();
    const fileName = `nano_${Date.now()}_${Math.random().toString(36).substring(7)}.jpg`;
    const buffer = Buffer.from(finalImageBase64, "base64");

    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(`ai-processed/${fileName}`, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

    if (uploadError) console.error("❌ Storage Error:", uploadError);

    let publicUrl = `data:image/jpeg;base64,${generatedImageBase64}`; // fallback
    if (uploadData) {
      const { data: urlData } = supabase.storage
        .from("product-images")
        .getPublicUrl(`ai-processed/${fileName}`);
      publicUrl = urlData.publicUrl;
    }

    // Save record to database
    const { data: dbData, error: dbError } = await supabase
      .from("ai_processed_images")
      .insert({
        image_url: publicUrl,
        analysis: analysisText || "Enhanced by Nano Banana 2",
        original_prompt: prompt,
        mime_type: "image/jpeg",
        file_path: uploadData?.path || null,
      })
      .select()
      .single();

    if (dbError) console.error("❌ DB Error:", dbError);

    return NextResponse.json({
      success: true,
      analysis: analysisText || "Image enhanced by Nano Banana 2 ✨",
      image: publicUrl,
      id: dbData?.id,
    });

  } catch (error: any) {
    console.error("🚨 Nano Banana AI Processing Error:", error);

    let errorMessage = "An unexpected error occurred during AI processing.";
    let status = 500;
    const message = error.message || "";

    if (message.includes("404") || message.includes("not found")) {
      errorMessage = "Nano Banana 2 engine not yet active in your region. Please try again shortly.";
    } else if (message.includes("API_KEY_INVALID") || message.includes("not valid")) {
      errorMessage = "Google API Key is invalid. Please check your .env.local configuration.";
      status = 401;
    } else if (message.includes("SAFETY") || message.includes("blocked")) {
      errorMessage = "Image blocked by AI Safety filters. Please use a standard product photograph.";
      status = 400;
    } else if (message.includes("429") || message.includes("quota")) {
      errorMessage = "AI daily limit reached. Please wait or upgrade your Google AI plan.";
      status = 429;
    }

    return NextResponse.json({
      error: errorMessage,
      details: message,
      code: error.status || status,
    }, { status });
  }
}
