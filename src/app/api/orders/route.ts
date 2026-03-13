import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    phone, fullName, address, communeName, wilayaCode, wilayaName,
    deliveryType, shippingCost, productId, variantId,
    variantColorAr, productName, productPrice, quantity
  } = body;

  if (!phone || !productId || !wilayaCode) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Generate order number
  const orderNumber = `ALD-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
  const totalPrice = (Number(productPrice) * (Number(quantity) || 1)) + Number(shippingCost);

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      order_number: orderNumber,
      phone: phone,
      phone_raw: phone,
      full_name: fullName || null,
      wilaya_code: parseInt(wilayaCode),
      wilaya_name: wilayaName,
      commune_name: communeName || null,
      full_address: address || null,
      delivery_type: deliveryType,
      delivery_price: Number(shippingCost),
      product_id: productId,
      variant_id: variantId || null,
      product_name: productName,
      variant_details: variantColorAr || null,
      quantity: Number(quantity) || 1,
      unit_price: Number(productPrice),
      total_price: totalPrice,
      status: "new",
      is_complete: false,
    })
    .select("id")
    .single();

  if (error) {
    console.error("Order insert error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // --- Webhook Integration ---
  try {
    // We don't await this to avoid delaying the response to the user,
    // or we can await it if we want to ensure n8n receives it.
    // Usually for webhooks like "sheet-upload", a quick async fire is fine.
    fetch("https://n8n.srv1231456.hstgr.cloud/webhook/sheet-upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...body,
        orderId: order.id,
        orderNumber,
        totalPrice,
        createdAt: new Date().toISOString()
      }),
    }).catch(err => console.error("Webhook trigger failed:", err));
  } catch (err) {
    console.error("Webhook processing error:", err);
  }

  return NextResponse.json({ id: order.id, orderNumber }, { status: 201 });
}
