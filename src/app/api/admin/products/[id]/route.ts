import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const body = await req.json();
    const { name_ar, name_fr, slug, price, description_ar, is_visible, images, variants } = body;

    const supabase = createAdminClient();

    // 1. Update Product
    const { error: productError } = await supabase
      .from("products")
      .update({
        name_ar,
        name_fr,
        slug,
        price,
        description_ar,
        is_visible
      })
      .eq("id", productId);

    if (productError) throw productError;

    // 2. Update Images
    await supabase.from("product_images").delete().eq("product_id", productId);

    if (images && images.length > 0) {
      const imagesToInsert = images.map((img: any, index: number) => ({
        product_id: productId,
        image_url: img.url,
        is_primary: index === 0,
        sort_order: index
      }));
      await supabase.from("product_images").insert(imagesToInsert);
    }

    // 3. Update Variants
    const deletedVariantIds = variants?.filter((v: any) => v.isDeleted && v.db_id).map((v: any) => v.db_id);
    const existingToUpdate = variants?.filter((v: any) => !v.isDeleted && v.db_id);
    const newToInsert = variants?.filter((v: any) => !v.isDeleted && !v.db_id);

    if (deletedVariantIds?.length > 0) {
      await supabase.from("product_variants").delete().in("id", deletedVariantIds);
    }

    if (existingToUpdate?.length > 0) {
      for (const v of existingToUpdate) {
        await supabase.from("product_variants").update({
          color_name_ar: v.color_name_ar,
          color_hex: v.color_hex,
          stock_quantity: v.stock_quantity
        }).eq("id", v.db_id);
      }
    }

    if (newToInsert?.length > 0) {
      const inserts = newToInsert.map((v: any) => ({
        product_id: productId,
        color_name_ar: v.color_name_ar,
        color_hex: v.color_hex,
        stock_quantity: v.stock_quantity
      }));
      await supabase.from("product_variants").insert(inserts);
    }

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/products");
    revalidatePath(`/product/${slug}`);
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Update Product Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: productId } = await params;
    const supabase = createAdminClient();

    // Cascaded delete should handle product_images and product_variants if configured, 
    // but we'll do it manually to be safe.
    await supabase.from("product_images").delete().eq("product_id", productId);
    await supabase.from("product_variants").delete().eq("product_id", productId);
    
    const { error } = await supabase.from("products").delete().eq("id", productId);
    if (error) throw error;

    const { revalidatePath } = await import("next/cache");
    revalidatePath("/admin/products");
    revalidatePath("/");

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
