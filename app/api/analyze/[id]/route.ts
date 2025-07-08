
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysisId = params.id;

    // This endpoint is no longer needed for client-side processing
    // The analysis now happens entirely in the browser
    // Return a success response to maintain API compatibility
    return NextResponse.json({ 
      message: 'Analysis will be processed client-side',
      analysisId,
      note: 'This application processes PCAP files entirely in the browser for privacy'
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    return NextResponse.json(
      { error: 'Failed to process analysis request' },
      { status: 500 }
    );
  }
}
