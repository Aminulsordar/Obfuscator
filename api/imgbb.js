/**
 * ImgBB Uploader API (Vercel Ready)
 * ---------------------------------
 * Author: AceGun (Modified & Decorated)
 * Version: 2.0
 */

const axios = require("axios");
const FormData = require("form-data");

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

module.exports = async (req, res) => {
  // ✅ GET: API status check
  if (req.method === "GET") {
    res.setHeader("Content-Type", "text/html");
    return res.status(200).send(`
      <html>
        <head>
          <title>ImgBB API</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; margin-top: 3em; }
            h1 { color: #4caf50; }
            code { background: #eee; padding: 4px 8px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h1>✅ ImgBB Uploader API is Running!</h1>
          <p>Use <code>POST /api/imgbb</code> with JSON body:</p>
          <pre>{ "imageUrl": "https://example.com/photo.png" }</pre>
        </body>
      </html>
    `);
  }

  // ❌ Reject non-POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use GET or POST." });
  }

  try {
    // ✅ Parse JSON body manually (Vercel safe)
    let body = "";
    await new Promise((resolve) => {
      req.on("data", (chunk) => (body += chunk.toString()));
      req.on("end", resolve);
    });

    let parsed;
    try {
      parsed = JSON.parse(body);
    } catch {
      return res.status(400).json({ error: "Invalid JSON format." });
    }

    const { imageUrl } = parsed;

    if (!imageUrl) {
      return res.status(400).json({ error: "Missing field: imageUrl" });
    }

    // ✅ Download image
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // ✅ Prepare form data
    const formData = new FormData();
    formData.append("image", Buffer.from(response.data, "binary"), {
      filename: "upload.png",
    });

    // ✅ Upload to ImgBB
    const uploadRes = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: formData.getHeaders(),
        params: { key: IMGBB_API_KEY },
      }
    );

    const data = uploadRes.data.data;

    // ✅ Response
    return res.status(200).json({
      success: true,
      message: "✅ Upload successful!",
      viewUrl: data.url,       // ImgBB view link
      directUrl: data.image.url, // Direct link (.png/.jpg)
      size: data.size,
      type: data.image.mime,
    });
  } catch (error) {
    console.error("ImgBB Upload Error:", error.message || error);
    return res.status(500).json({
      success: false,
      error: "❌ Failed to upload image to ImgBB.",
      details: error.message,
    });
  }
};
