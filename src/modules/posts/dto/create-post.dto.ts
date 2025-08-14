import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber, IsArray, IsEnum, MinLength, MaxLength, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export enum PostCategory {
  ELECTRONICS = 'electronics',
  JEWELRY = 'jewelry',
  CLOTHING = 'clothing',
  DOCUMENTS = 'documents',
  PETS = 'pets',
  VEHICLES = 'vehicles',
  BOOKS = 'books',
  SPORTS = 'sports',
  OTHER = 'other',
}

export enum PostStatus {
  LOST = 'LOST',
  FOUND = 'FOUND',
  RETURNED = 'RETURNED',
  CLOSED = 'CLOSED',
}

export enum PreferredContact {
  PHONE = 'phone',
  EMAIL = 'email',
  BOTH = 'both',
}

export class CreatePostDto {
  @ApiProperty({ example: 'Lost iPhone 13 Pro' })
  @IsString()
  @MinLength(5)
  @MaxLength(100)
  title: string;

  @ApiProperty({ example: 'Lost my iPhone 13 Pro at Central Park yesterday. It has a black case and a cracked screen.' })
  @IsString()
  @MinLength(10)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ enum: PostCategory, example: PostCategory.ELECTRONICS })
  @IsEnum(PostCategory)
  category: PostCategory;

  @ApiProperty({ enum: PostStatus, example: PostStatus.LOST })
  @IsEnum(PostStatus)
  status: PostStatus;

  @ApiProperty({ example: '123 Main St' })
  @IsString()
  address: string;

  @ApiProperty({ example: 'New York' })
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsString()
  state: string;

  @ApiProperty({ example: 'USA' })
  @IsString()
  country: string;

  @ApiProperty({ example: 40.7128, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  latitude?: number;

  @ApiProperty({ example: -74.0060, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: '+1234567890', required: false })
  @IsOptional()
  @IsString()
  contactPhone?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsOptional()
  @IsString()
  contactEmail?: string;

  @ApiProperty({ enum: PreferredContact, example: PreferredContact.EMAIL })
  @IsEnum(PreferredContact)
  preferredContact: PreferredContact;

  @ApiProperty({ example: 100, required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10000)
  reward?: number;

  @ApiProperty({ example: ['iphone', 'black case', 'cracked screen'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @ApiProperty({ example: ['/uploads/abc.jpg'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
