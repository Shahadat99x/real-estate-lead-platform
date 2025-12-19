import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireRole } from '../../../../lib/authz';

export async function POST() {
  try {
    await requireRole(['ADMIN'], { redirectTo: undefined });

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    const folderBase = process.env.CLOUDINARY_FOLDER || 'real-estate-demo';
    const folder = `${folderBase}/blog`;

    if (!cloudName || !apiKey || !apiSecret) {
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 });
    }

    const timestamp = Math.round(new Date().getTime() / 1000);
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto.createHash('sha1').update(paramsToSign + apiSecret).digest('hex');

    return NextResponse.json({
      cloudName,
      apiKey,
      timestamp,
      signature,
      folder,
    });
  } catch (error: any) {
    if (error?.message === 'Not authenticated') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error?.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    console.error('Cloudinary sign-blog error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
