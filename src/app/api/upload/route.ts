import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { saveImage, MAX_UPLOAD_BYTES } from "@/lib/images";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json({ error: "Tidak berwenang." }, { status: 403 });
  }
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Berkas tidak ditemukan." }, { status: 400 });
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: "Ukuran berkas maksimal 8 MB." }, { status: 413 });
    }
    const url = await saveImage(Buffer.from(await file.arrayBuffer()));
    return NextResponse.json({ url });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Gagal mengunggah." },
      { status: 400 },
    );
  }
}
