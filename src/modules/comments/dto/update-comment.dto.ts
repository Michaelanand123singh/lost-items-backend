import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength } from 'class-validator';

export class UpdateCommentDto {
  @ApiProperty({ example: 'I think I saw this item at the mall yesterday!' })
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  content: string;
}
