import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from('ai_processed_images')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("🚨 Fetch AI Images Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "No ID provided" }, { status: 400 });

    const supabase = createAdminClient();

    // 1. Get the file path first
    const { data: record, error: fetchError } = await supabase
      .from('ai_processed_images')
      .select('file_path')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // 2. Delete from storage if path exists
    if (record?.file_path) {
      const { error: storageError } = await supabase.storage
        .from('product-images')
        .remove([record.file_path]);
      
      if (storageError) console.error("⚠️ Storage Deletion Warning:", storageError);
    }

    // 3. Delete from database
    const { error: dbError } = await supabase
      .from('ai_processed_images')
      .delete()
      .eq('id', id);

    if (dbError) throw dbError;

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("🚨 Delete AI Image Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
