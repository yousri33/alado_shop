import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const { productId, imageUrl } = await req.json();

    if (!productId || !imageUrl) {
      return NextResponse.json({ error: "Missing productId or imageUrl" }, { status: 400 });
    }

    // 1. Get current images to set sort_order
    const { data: currentImages, error: fetchError } = await supabase
      .from("product_images")
      .select("sort_order")
      .eq("product_id", productId)
      .order("sort_order", { ascending: false });

    if (fetchError) throw fetchError;

    const nextSortOrder = currentImages && currentImages.length > 0 
      ? (currentImages[0].sort_order || 0) + 1 
      : 0;

    // 2. Insert the new AI image
    const { error: insertError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        image_url: imageUrl,
        is_primary: nextSortOrder === 0, // make primary if it is the first image
        sort_order: nextSortOrder
      });

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, message: "Image linked to product successfully" });
  } catch (err: any) {
    console.error("Link Error:", err);
    return NextResponse.json({ error: err.message || "Failed to link image" }, { status: 500 });
  }
}
