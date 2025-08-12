import { Controller, Get, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SearchService } from './search.service';
import { BaseResponseDto } from '../../common/dto/base-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Search')
@UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }))
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Search posts' })
  @ApiResponse({ status: 200, description: 'Search results retrieved successfully' })
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false }))
  async searchPosts(
    @Query('q') query: string,
    @Query() paginationDto: PaginationDto,
  ) {
    const results = await this.searchService.searchPosts(query, paginationDto);
    return BaseResponseDto.success(results, 'Search results retrieved successfully');
  }
}
