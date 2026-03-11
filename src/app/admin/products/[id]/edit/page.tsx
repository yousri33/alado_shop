import { createAdminClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import EditProductForm from "./edit-form";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: product } = await supabase
    .from("products")
    .select(`
      *,
      product_images ( id, image_url, is_primary, sort_order ),
      product_variants ( id, color_name_ar, color_name_fr, color_hex, size, stock_quantity )
    `)
    .eq("id", id)
    .single();

  if (!product) notFound();

  return (
    <div style={{ padding: "2rem" }}>
      <EditProductForm initialProduct={product} />
    </div>
  );
}
