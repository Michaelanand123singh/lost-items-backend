import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostFilterDto } from './dto/post-filter.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BaseResponseDto } from '../../common/dto/base-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PostsQueryDto } from './dto/posts-query.dto';

@ApiTags('Posts')
@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new post' })
  @ApiResponse({ status: 201, description: 'Post created successfully' })
  async create(@CurrentUser() user: any, @Body() createPostDto: CreatePostDto) {
    const post = await this.postsService.create(user.id, createPostDto);
    return BaseResponseDto.success(post, 'Post created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get all posts with filtering and pagination' })
  @ApiResponse({ status: 200, description: 'Posts retrieved successfully' })
  async findAll(@Query() query: any, @CurrentUser() user?: any) {
    const posts = await this.postsService.findAllCombined(query, user?.id);
    return BaseResponseDto.success(posts, 'Posts retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific post by ID' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post retrieved successfully' })
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    const post = await this.postsService.findOne(id, user?.id);
    return BaseResponseDto.success(post, 'Post retrieved successfully');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post updated successfully' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    const post = await this.postsService.update(id, user.id, updatePostDto);
    return BaseResponseDto.success(post, 'Post updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post deleted successfully' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.postsService.remove(id, user.id);
    return BaseResponseDto.success(result, 'Post deleted successfully');
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post liked successfully' })
  async likePost(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.postsService.likePost(id, user.id);
    return BaseResponseDto.success(result, 'Post liked successfully');
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a post' })
  @ApiParam({ name: 'id', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Post unliked successfully' })
  async unlikePost(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.postsService.unlikePost(id, user.id);
    return BaseResponseDto.success(result, 'Post unliked successfully');
  }
}
