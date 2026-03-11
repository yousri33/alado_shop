import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    // Use credentials provided by the user
    if (username === "khaled" && password === "alado") {
      const cookieStore = await cookies();
      
      // Setting a simple session cookie
      // In a real production app, we would use a signed JWT
      cookieStore.set("admin_session", "alado_khaled_session_secure_v1", {
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
