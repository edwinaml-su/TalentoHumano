import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/health
 * Health check endpoint for Kubernetes probes and ALB health checks.
 * Returns 200 OK with system status, or 503 if DB is unreachable.
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Lightweight DB ping
    await prisma.$queryRaw`SELECT 1`;

    const latencyMs = Date.now() - startTime;

    return NextResponse.json(
      {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: process.env.npm_package_version ?? '0.1.0',
        build: process.env.BUILD_NUMBER ?? 'local',
        database: 'connected',
        latency_ms: latencyMs,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[Health Check] Database unreachable:', error);

    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed',
      },
      { status: 503 }
    );
  }
}
