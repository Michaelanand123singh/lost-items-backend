import { Module, Global } from '@nestjs/common';
import { PrismaService } from './database.providers';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class DatabaseModule {}
