import { BadRequestException } from "@/exceptions";
import { env } from "../config";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import type { Request } from "express";
import ErrorCode from "@/constants/error-code";
type MulterFile = Request["file"];

if (!env.CLOUDINARY_CLOUD_NAME || !env.CLOUDINARY_API_KEY || !env.CLOUDINARY_API_SECRET) {
    throw new Error("Missing Cloudinary environment variables");
}

cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
});
export const uploadFile = async (file: MulterFile, folder: string, publicId: string): Promise<UploadApiResponse> => {
    return await new Promise((resolve, reject) => {
        if (!file || !file.buffer) return reject(new Error("File buffer not available"));
        try {
            const stream = cloudinary.uploader.upload_stream(
                {
                    folder,
                    public_id: `${publicId.split(".")[0]}`,
                    resource_type: "image",
                },
                (error, result) => {
                    if (error) return reject(new Error(error.message));
                    if (!result) return reject(new Error("No result from Cloudinary"));
                    resolve(result);
                }
            );

            stream.end(file.buffer);
        } catch (_error) {
            throw new BadRequestException("Failed to upload image", ErrorCode.CLOUDINARY_ERROR);
        }
    });
};

export default cloudinary;
