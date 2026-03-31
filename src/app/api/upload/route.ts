import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "uploads";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitize filename
    const ext = path.extname(file.name).toLowerCase();
    const baseName = path.basename(file.name, ext).replace(/[^a-zA-Z0-9_-]/g, "_");
    const timestamp = Date.now();
    const fileName = `${baseName}_${timestamp}${ext}`;

    // Ensure directory exists
    const uploadDir = path.join(process.cwd(), "public", "images", folder);
    await mkdir(uploadDir, { recursive: true });

    // Write file
    const filePath = path.join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    // Return the public URL path
    const publicPath = `/images/${folder}/${fileName}`;
    return NextResponse.json({ path: publicPath, name: fileName });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
