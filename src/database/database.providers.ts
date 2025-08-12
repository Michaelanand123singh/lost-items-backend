import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  constructor() {
    const originalUrl = process.env.DATABASE_URL || '';
    const normalizedUrl = PrismaService.ensureSecurePostgresUrl(originalUrl);

    super({
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
      datasources: normalizedUrl
        ? {
            db: { url: normalizedUrl },
          }
        : undefined,
    });
  }

  private static ensureSecurePostgresUrl(databaseUrl: string): string {
    if (!databaseUrl) return databaseUrl;
    try {
      const url = new URL(databaseUrl);
      const isPostgres = url.protocol.startsWith('postgres');
      if (!isPostgres) return databaseUrl;

      const params = url.searchParams;

      // Ensure SSL for managed providers like Supabase/Render PG/RDS
      if (!params.has('sslmode')) {
        params.set('sslmode', 'require');
      }

      // Supabase-specific: encourage pgbouncer with low connection count for Prisma
      if (url.hostname.endsWith('.supabase.co')) {
        if (!params.has('pgbouncer')) params.set('pgbouncer', 'true');
        if (!params.has('connection_limit')) params.set('connection_limit', '1');
      }

      url.search = params.toString();
      return url.toString();
    } catch {
      return databaseUrl;
    }
  }

  async onModuleInit() {
    // Retry connection to handle transient network/DB availability issues (e.g., on cold start)
    const maxAttempts = Number(process.env.PRISMA_CONNECT_MAX_ATTEMPTS || 5);
    const baseDelayMs = Number(process.env.PRISMA_CONNECT_BASE_DELAY_MS || 500);

    let attempt = 0;
    let lastError: unknown;

    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        await this.$connect();
        return;
      } catch (error) {
        lastError = error;
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        // eslint-disable-next-line no-console
        console.error(
          `Prisma connect attempt ${attempt}/${maxAttempts} failed. Retrying in ${delay}ms...`,
          (error as Error)?.message || error,
        );
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    // If all attempts failed, rethrow the last error to stop the app startup
    throw lastError instanceof Error ? lastError : new Error('Failed to connect to database');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
