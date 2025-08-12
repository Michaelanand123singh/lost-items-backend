import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsString, IsArray, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { PostCategory, PostStatus } from './create-post.dto';

export class PostFilterDto {
  @ApiProperty({ enum: PostCategory, required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ enum: PostStatus, required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 'New York', required: false })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ example: '2024-01-01', required: false })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({ example: '2024-12-31', required: false })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasReward?: boolean;

  @ApiProperty({ example: ['iphone', 'black'], type: [String], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'iphone', required: false })
  @IsOptional()
  @IsString()
  search?: string;
}
