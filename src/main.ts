import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // Enable CORS
  const isDev: boolean = Boolean(configService.get('app.isDevelopment'));
  const corsOriginsRaw: string | undefined = configService.get<string>('CORS_ORIGIN');

  const parseCorsOrigins = (
    raw?: string,
  ): (string | RegExp) | Array<string | RegExp> | boolean => {
    if (!raw) return false;
    const parts = raw
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean);
    const toMatcher = (entry: string): string | RegExp => {
      // Support wildcard patterns like https://*.vercel.app
      if (entry.includes('*')) {
        const pattern =
          '^' + entry.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
        return new RegExp(pattern);
      }
      return entry;
    };
    const matchers = parts.map(toMatcher);
    return matchers.length === 1 ? matchers[0] : matchers;
  };

  // Configure CORS
  const defaultProdOrigins: Array<string | RegExp> = [
    // Primary production frontend
    'https://lost-items-frontend.vercel.app',
    // Allow Vercel preview deployments
    /^https:\/\/[\w-]+\.lost-items-frontend\.vercel\.app$/,
    /^https:\/\/[\w-]+\.vercel\.app$/,
  ];

  const allowedOriginMatchers: Array<string | RegExp> = isDev
    ? [/^https?:\/\/localhost:\d+$/]
    : (Array.isArray(parseCorsOrigins(corsOriginsRaw))
        ? (parseCorsOrigins(corsOriginsRaw) as Array<string | RegExp>)
        : parseCorsOrigins(corsOriginsRaw)
          ? [parseCorsOrigins(corsOriginsRaw) as string | RegExp]
          : defaultProdOrigins);

  const isOriginAllowed = (origin: string | undefined): boolean => {
    if (!origin) return true; // allow non-browser or same-origin requests
    return allowedOriginMatchers.some((matcher) =>
      typeof matcher === 'string' ? matcher === origin : matcher.test(origin),
    );
  };

  app.enableCors({
    origin: (origin, callback) => {
      if (isOriginAllowed(origin || undefined)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: Origin not allowed -> ${origin}`), false);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    // Allow common headers that browsers/send by default
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'Accept',
      'Origin',
      'X-Requested-With',
    ],
    exposedHeaders: ['Content-Length', 'ETag'],
  });

  // Global prefix
  app.setGlobalPrefix(configService.get('app.apiPrefix') || 'api');

  // Serve static files
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      forbidUnknownValues: false,
      disableErrorMessages: configService.get('app.isProduction'),
    }),
  );

  // CRITICAL FIX: Use Render's dynamic PORT and bind to 0.0.0.0
  const port = process.env.PORT || configService.get('app.port') || 3001;
  await app.listen(port, '0.0.0.0');

  console.log(`🚀 Application is running on port: ${port}`);
  console.log(`📊 Environment: ${configService.get('app.nodeEnv')}`);
  console.log(`🌐 API Prefix: ${configService.get('app.apiPrefix')}`);
}

void bootstrap();