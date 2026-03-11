import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const adminUser = process.env.ADMIN_USERNAME;
    const adminPass = process.env.ADMIN_PASSWORD;
    const sessionId = process.env.ADMIN_SESSION_ID || "alado_khaled_session_secure_v1";

    if (username === adminUser && password === adminPass) {
      const cookieStore = await cookies();
      
      cookieStore.set("admin_session", sessionId, {
        httpOnly: true,
        secure: process.env.NODE_SETTING === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: "/",
      });

      return NextResponse.json({ success: true, message: "Logged in successfully" });
    }

    return NextResponse.json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" }, { status: 401 });
  } catch (err) {
    return NextResponse.json({ error: "حدث خطأ في طلبك" }, { status: 500 });
  }
}
