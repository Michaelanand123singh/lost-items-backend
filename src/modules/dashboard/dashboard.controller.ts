import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { DashboardService } from './dashboard.service';
import { BaseResponseDto } from '../../common/dto/base-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats retrieved successfully' })
  async getStats(@CurrentUser() user: any) {
    const stats = await this.dashboardService.getStats(user.id);
    return BaseResponseDto.success(stats, 'Dashboard stats retrieved successfully');
  }

  @Get('posts')
  @ApiOperation({ summary: 'Get user posts for dashboard' })
  @ApiResponse({ status: 200, description: 'User posts retrieved successfully' })
  async getMyPosts(
    @CurrentUser() user: any,
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: string,
  ) {
    const posts = await this.dashboardService.getMyPosts(user.id, paginationDto, status);
    return BaseResponseDto.success(posts, 'User posts retrieved successfully');
  }
}
