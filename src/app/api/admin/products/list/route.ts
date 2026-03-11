import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name_ar")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
