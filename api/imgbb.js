const axios = require("axios");
const FormData = require("form-data");

// API key Vercel Environment Variables এ রাখবে
// vercel dashboard → Project → Settings → Environment Variables
const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "No imageUrl provided." });
    }

    // Step 1: Download image
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // Step 2: Prepare form data
    const formData = new FormData();
    formData.append("image", Buffer.from(response.data, "binary"), {
      filename: "upload.png",
    });

    // Step 3: Upload to ImgBB
    const uploadRes = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: formData.getHeaders(),
        params: { key: IMGBB_API_KEY },
      }
    );

    const data = uploadRes.data.data;

    // Step 4: Return both normal and direct link
    res.status(200).json({
      success: true,
      viewUrl: data.url,
      directUrl: data.image.url,
    });
  } catch (error) {
    console.error("ImgBB Upload Error:", error.message);
    res.status(500).json({ error: "Failed to upload image to ImgBB." });
  }
};
