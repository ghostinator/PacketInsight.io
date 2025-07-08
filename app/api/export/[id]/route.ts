
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const analysisId = params.id;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';

    // For client-side processing, export functionality is handled in the browser
    // This endpoint provides information about client-side export capabilities
    return NextResponse.json({
      message: 'Export functionality handled client-side',
      analysisId,
      format,
      note: 'Analysis data is exported directly from browser storage for privacy',
      supportedFormats: ['json', 'csv', 'html'],
      clientSideExport: true
    });

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Failed to process export request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
