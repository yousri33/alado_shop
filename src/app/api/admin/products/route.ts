import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = createAdminClient();
    const data = await req.json();

    // 1. Insert product
    const { data: product, error: productError } = await supabase
      .from("products")
      .insert({
        name_ar: data.name_ar,
        name_fr: data.name_fr || null,
        slug: data.slug,
        price: data.price,
        description_ar: data.description_ar || null,
        description_fr: data.description_fr || null,
        is_visible: true,
      })
      .select()
      .single();

    if (productError) {
      if (productError.code === '23505') {
        return NextResponse.json({ error: "الرابط (slug) موجود مسبقاً، يرجى تغييره" }, { status: 400 });
      }
      throw productError;
    }

    // 2. Insert Images (from URLs)
    if (data.images && data.images.length > 0) {
      const imageInserts = data.images.map((url: string, idx: number) => ({
        product_id: product.id,
        image_url: url,
        is_primary: idx === 0,
        sort_order: idx,
      }));

      const { error: imagesError } = await supabase
        .from("product_images")
        .insert(imageInserts);

      if (imagesError) throw imagesError;
    }

    // 3. Insert Variants
    if (data.variants && data.variants.length > 0) {
      const variantInserts = data.variants.map((v: any, idx: number) => ({
        product_id: product.id,
        color_name_ar: v.color_name_ar,
        color_name_fr: v.color_name_fr || null,
        color_hex: v.color_hex || null,
        size: v.size || null,
        stock_quantity: v.stock_quantity || 100,
        sort_order: idx,
      }));

      const { error: variantsError } = await supabase
        .from("product_variants")
        .insert(variantInserts);

      if (variantsError) throw variantsError;
    }

    return NextResponse.json({ message: "Product created successfully", id: product.id });
  } catch (err: any) {
    console.error("API Error adding product:", err);
    return NextResponse.json({ error: err.message || "فشل في حفظ المنتج" }, { status: 500 });
  }
}
