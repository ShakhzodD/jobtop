import { NextRequest, NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/entities/user/api/get-current-user.server";
import { createSupabaseServerClient } from "@/shared/api/supabase/server";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUserFromRequest(request);
    const formData = await request.formData();
    const file = formData.get("avatar");

    if (!(file instanceof File) || !file.type.startsWith("image/")) {
      throw new Error("Rasm faylini tanlang");
    }
    if (file.size > MAX_AVATAR_SIZE) {
      throw new Error("Rasm hajmi 5 MB dan oshmasligi kerak");
    }

    const extension = file.type.split("/")[1]?.replace(/[^a-z0-9]/gi, "") || "jpg";
    const path = `${user.id}/${crypto.randomUUID()}.${extension}`;
    const storage = createSupabaseServerClient().storage.from("profile-avatars");
    const { error } = await storage.upload(path, file, {
      contentType: file.type,
      upsert: false,
    });
    if (error) throw error;

    const { data } = storage.getPublicUrl(path);
    return NextResponse.json({ avatarUrl: data.publicUrl });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Rasmni yuklab bo‘lmadi";
    return NextResponse.json(
      { error: message },
      { status: message.includes("Telegram") ? 401 : 400 },
    );
  }
}
