import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/database.providers';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(userId: string) {
    const [
      totalPosts,
      lostPosts,
      foundPosts,
      returnedPosts,
      totalComments,
      totalLikes,
    ] = await Promise.all([
      this.prisma.post.count({ where: { authorId: userId } }),
      this.prisma.post.count({ where: { authorId: userId, status: 'LOST' } }),
      this.prisma.post.count({ where: { authorId: userId, status: 'FOUND' } }),
      this.prisma.post.count({ where: { authorId: userId, status: 'RETURNED' } }),
      this.prisma.comment.count({ where: { authorId: userId } }),
      this.prisma.like.count({ where: { userId } }),
    ]);

    return {
      totalPosts,
      lostPosts,
      foundPosts,
      returnedPosts,
      totalComments,
      totalLikes,
    };
  }

  async getMyPosts(userId: string, paginationDto: PaginationDto, status?: string) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where = {
      authorId: userId,
      ...(status && { status: status.toUpperCase() as any }),
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.post.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
