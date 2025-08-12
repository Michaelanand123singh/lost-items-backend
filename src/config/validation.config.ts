import { registerAs } from '@nestjs/config';

export default registerAs('validation', () => ({
  transform: true,
  whitelist: true,
  forbidNonWhitelisted: true,
  forbidUnknownValues: true,
  disableErrorMessages: process.env.NODE_ENV === 'production',
}));
