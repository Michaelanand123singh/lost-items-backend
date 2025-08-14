import { Injectable, BadRequestException } from '@nestjs/common';
import type { Express } from 'express';
import { ConfigService } from '@nestjs/config';
import * as path from 'path';
import * as fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
  constructor(private configService: ConfigService) {}

  async uploadFile(file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file type. Only JPEG, PNG, and WebP are allowed.');
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException('File too large. Maximum size is 5MB.');
    }

    const uploadDir = this.configService.get('upload.uploadDest') || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    let filename: string;
    let filePath: string;

    // If Multer saved to disk (dest configured), use its saved path
    if ((file as any).path && (file as any).filename) {
      filename = (file as any).filename as string;
      filePath = (file as any).path as string;
    } else {
      // Memory storage fallback: write buffer ourselves
      const fileExtension = path.extname(file.originalname);
      filename = `${uuidv4()}${fileExtension}`;
      filePath = path.join(uploadDir, filename);
      fs.writeFileSync(filePath, file.buffer);
    }

    // Return file info
    return {
      url: `/uploads/${filename}`,
      filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
  }
}
