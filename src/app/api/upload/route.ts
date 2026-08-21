import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
];

export async function POST(req: NextRequest) {
  try {
    const data = await req.formData();

    const file = data.get('file');

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          error: 'No image file provided.',
        },
        {
          status: 400,
        }
      );
    }

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Only JPG, PNG, WEBP and GIF images are allowed.',
        },
        {
          status: 400,
        }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          error: 'Image must not exceed 5MB.',
        },
        {
          status: 400,
        }
      );
    }

    const arrayBuffer = await file.arrayBuffer();

    const buffer = Buffer.from(arrayBuffer);

    const result = await new Promise<UploadApiResponse>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            asset_folder: 'dev-jobs',

            resource_type: 'image',

            use_filename: true,

            unique_filename: true,

            overwrite: false,
          },
          (error, result) => {
            if (error) {
              reject(error);
              return;
            }

            if (!result) {
              reject(
                new Error('Cloudinary did not return an upload result.')
              );

              return;
            }

            resolve(result);
          }
        );

        uploadStream.end(buffer);
      }
    );

    return NextResponse.json({
      url: result.secure_url,
    });
  } catch (error) {
    console.error('Cloudinary upload error:', error);

    return NextResponse.json(
      {
        error: 'Image upload failed.',
      },
      {
        status: 500,
      }
    );
  }
}