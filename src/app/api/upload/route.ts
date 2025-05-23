import { NextRequest, NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary"; // Import your Cloudinary configuration

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    // Convert the file to a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // Upload the image to Cloudinary
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream(
          { resource_type: "image" },
          (error: Error | undefined, result: any) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              resolve(result);
            }
          }
        )
        .end(buffer);
    });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


export async function DELETE(request: NextRequest) {
  try {
    const data = await request.formData();
    const file = data.get("file") as string;
    console.log(file);

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }
    cloudinary.uploader
      .destroy(file.split("/").pop()?.split(".")[0] || "")
      .then(result => console.log(result))
      .catch(error => console.error(error));
    // cloudinary.uploader.destroy(file, (error, result) => {
    //   if (error) {
    //     console.error("Cloudinary upload error:", error);
    //     return NextResponse.json(
    //       { error: "Internal server error" + error },
    //       { status: 500 }
    //     );
    //   }
    //   return NextResponse.json(result, { status: 200 });
    // });

  } catch (error) {
    console.error("Server error:", error);
    return NextResponse.json(
      { error: error },
      { status: 500 }
    );
  }
}