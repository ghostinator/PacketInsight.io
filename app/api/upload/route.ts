
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';

export async function POST(request: NextRequest) {
  try {
    const data = await request.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.name.toLowerCase().match(/\.(pcap|pcapng)$/)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Validate file size (max 500MB as specified in the UI)
    if (file.size > 500 * 1024 * 1024) {
      return NextResponse.json({ error: 'File too large (max 500MB)' }, { status: 400 });
    }

    // Generate unique analysis ID for client-side storage
    const analysisId = randomUUID();

    // Return the analysis ID for client-side processing
    // No server-side storage - file processing happens entirely in browser
    return NextResponse.json({ 
      analysisId,
      message: 'File ready for client-side processing',
      filename: file.name,
      fileSize: file.size
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to process upload request' },
      { status: 500 }
    );
  }
}
