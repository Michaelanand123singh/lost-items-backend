import { Controller, Get, Post, Body, Put, Param, Delete, UseGuards, Query, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BaseResponseDto } from '../../common/dto/base-response.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';

@ApiTags('Comments')
@Controller('posts/:postId/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a comment on a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({ status: 201, description: 'Comment created successfully' })
  async create(
    @Param('postId') postId: string,
    @CurrentUser() user: any,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    const comment = await this.commentsService.create(postId, user.id, createCommentDto);
    return BaseResponseDto.success(comment, 'Comment created successfully');
  }

  @Get()
  @ApiOperation({ summary: 'Get comments for a post' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiResponse({ status: 200, description: 'Comments retrieved successfully' })
  async findByPostId(
    @Param('postId') postId: string,
    @Query(new ValidationPipe({ transform: true, whitelist: true, forbidNonWhitelisted: false })) paginationDto: PaginationDto,
    @CurrentUser() user?: any,
  ) {
    const comments = await this.commentsService.findByPostId(postId, paginationDto, user?.id);
    return BaseResponseDto.success(comments, 'Comments retrieved successfully');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific comment' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment retrieved successfully' })
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    const comment = await this.commentsService.findOne(id, user?.id);
    return BaseResponseDto.success(comment, 'Comment retrieved successfully');
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update a comment' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment updated successfully' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateCommentDto: UpdateCommentDto,
  ) {
    const comment = await this.commentsService.update(id, user.id, updateCommentDto);
    return BaseResponseDto.success(comment, 'Comment updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete a comment' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment deleted successfully' })
  async remove(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.commentsService.remove(id, user.id);
    return BaseResponseDto.success(result, 'Comment deleted successfully');
  }

  @Post(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Like a comment' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment liked successfully' })
  async likeComment(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.commentsService.likeComment(id, user.id);
    return BaseResponseDto.success(result, 'Comment liked successfully');
  }

  @Delete(':id/like')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unlike a comment' })
  @ApiParam({ name: 'postId', description: 'Post ID' })
  @ApiParam({ name: 'id', description: 'Comment ID' })
  @ApiResponse({ status: 200, description: 'Comment unliked successfully' })
  async unlikeComment(@Param('id') id: string, @CurrentUser() user: any) {
    const result = await this.commentsService.unlikeComment(id, user.id);
    return BaseResponseDto.success(result, 'Comment unliked successfully');
  }
}
