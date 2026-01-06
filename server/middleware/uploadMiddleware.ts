import multer from "multer"
import { CloudinaryStorage } from "multer-storage-cloudinary"
import cloudinary from "../lib/cloudinary.ts"

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "movie-posters", // Folder name in Cloudinary
    allowed_formats: ["jpg", "png", "jpeg", "webp"],
  } as any,
})

const upload = multer({ storage })

export default upload
