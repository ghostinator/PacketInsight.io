
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysisId = params.id;

    // For client-side processing, we return a placeholder response
    // The actual analysis data is stored in the browser's localStorage
    return NextResponse.json({ 
      message: 'Analysis data is stored client-side',
      analysisId,
      note: 'This application stores analysis data in browser localStorage for privacy'
    });

  } catch (error) {
    console.error('Get analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to get analysis' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysisId = params.id;
    const analysisData = await request.json();

    console.log('Client-side analysis data received for ID:', analysisId);
    console.log('Analysis data keys:', Object.keys(analysisData));

    // For client-side processing, we don't store sensitive data on the server
    // This endpoint confirms receipt but doesn't persist data for privacy
    return NextResponse.json({ 
      message: 'Analysis data received - stored client-side for privacy',
      analysisId,
      note: 'No sensitive PCAP data is stored on the server'
    });

  } catch (error) {
    console.error('Analysis API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to process analysis data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
