const multer = require("multer");
const cloudinary = require("../config/cloudinary");

const uploadOptions = {
  folder: "cuddle-village-products", // folder name in your Cloudinary account
  allowed_formats: ["jpg", "jpeg", "png", "webp"],
  transformation: [{ width: 1000, height: 1000, crop: "limit" }], // optional: cap upload size
};

// Multer storage engine that streams the upload straight to Cloudinary.
// Sets file.path to the secure URL and file.filename to the public_id,
// the same shape multer-storage-cloudinary produced.
const storage = {
  _handleFile(req, file, cb) {
    const uploadStream = cloudinary.uploader.upload_stream(uploadOptions, (err, result) => {
      if (err) return cb(err);
      cb(null, { path: result.secure_url, filename: result.public_id, size: result.bytes });
    });
    file.stream.on("error", cb);
    file.stream.pipe(uploadStream);
  },
  _removeFile(req, file, cb) {
    cloudinary.uploader.destroy(file.filename, (err) => cb(err || null));
  },
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit, adjust as needed
});

module.exports = upload;
