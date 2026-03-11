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

  return NextResponse.json({ id: order.id, orderNumber }, { status: 201 });
}
