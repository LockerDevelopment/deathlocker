import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const form = await req.formData();
        const file = form.get('file') as Blob | null;
        const filename = form.get('filename') as string;
        const fileType = form.get('fileType') as string;

        if (!file || !filename) {
            return NextResponse.json({ error: 'Missing file or filename' }, { status: 400 });
        }

        
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const blob = new Blob([buffer], { type: fileType });

        const pinataFormData = new FormData();
        pinataFormData.append('file', blob, filename);
        pinataFormData.append('pinataMetadata', JSON.stringify({
            name: filename,
            keyvalues: {
                originalType: fileType,
                encrypted: true
            }
        }));

        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PINATA_JWT}`,
            },
            body: pinataFormData as any,
        });

        const result = await response.json();

        if (!response.ok) {
            return NextResponse.json({ error: result.error || 'Upload failed' }, { status: 500 });
        }

        return NextResponse.json({ cid: result.IpfsHash });
    } catch (err: any) {
        console.error('UPLOAD ERROR:', err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}