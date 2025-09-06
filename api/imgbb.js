const axios = require("axios");
const FormData = require("form-data");

const IMGBB_API_KEY = process.env.IMGBB_API_KEY;

module.exports = async (req, res) => {
  // যদি শুধু ব্রাউজারে ওপেন করে (GET), তখন মেসেজ দেখাও
  if (req.method === "GET") {
    return res.status(200).json({
      success: true,
      message: "✅ ImgBB Uploader API is running!",
      usage: "Send a POST request with { imageUrl } in body to upload."
    });
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed. Use POST." });
  }

  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: "No imageUrl provided." });
    }

    // 1. Download image
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    // 2. Prepare form data
    const formData = new FormData();
    formData.append("image", Buffer.from(response.data, "binary"), {
      filename: "upload.png",
    });

    // 3. Upload to ImgBB
    const uploadRes = await axios.post(
      "https://api.imgbb.com/1/upload",
      formData,
      {
        headers: formData.getHeaders(),
        params: { key: IMGBB_API_KEY },
      }
    );

    const data = uploadRes.data.data;

    // 4. Return links
    res.status(200).json({
      success: true,
      message: "✅ Upload successful!",
      viewUrl: data.url,
      directUrl: data.image.url,
    });
  } catch (error) {
    console.error("ImgBB Upload Error:", error.message);
    res.status(500).json({ error: "Failed to upload image to ImgBB." });
  }
};
