import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
    // Verify Cron Secret if present (Vercel adds this header)
    const authHeader = request.headers.get('authorization');
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // We can't use apiClient here because it's designed for client-side use (fetches relative URLs)
        // Instead, we need to call the generation logic directly or fetch the absolute URL

        // However, since we are already on the server, we can just call the generation API route handler logic?
        // But route handlers are not easily callable as functions.
        // The easiest way is to fetch the API route with the full URL.

        const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
        const host = request.headers.get('host') || 'localhost:3000';
        const apiUrl = `${protocol}://${host}/api/generate-article`;

        // We need a way to bypass the session check in /api/generate-article for cron jobs
        // OR we can refactor the generation logic into a shared library function.
        // For now, let's assume we can call the API with a special secret header that the API route accepts.

        // Actually, let's just refactor the generation logic into a lib function in a future step if needed.
        // For now, I will modify /api/generate-article to accept a CRON_SECRET header as an alternative to session auth.

        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.CRON_SECRET || ''}` // Pass the secret
            },
            body: JSON.stringify({ source: 'cron' })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate article');
        }

        const data = await response.json();
        return NextResponse.json({ success: true, data });

    } catch (error: any) {
        console.error('Cron generation error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
