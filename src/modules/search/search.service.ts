import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/database.providers';
import { PaginationDto } from '../../common/dto/pagination.dto';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchPosts(query: string, paginationDto: PaginationDto) {
    const { page = 1, limit = 10 } = paginationDto;
    const skip = (page - 1) * limit;

    const where = {
      OR: [
        { title: { contains: query, mode: 'insensitive' as any } },
        { description: { contains: query, mode: 'insensitive' as any } },
        { tags: { hasSome: [query] } },
        { city: { contains: query, mode: 'insensitive' as any } },
        { state: { contains: query, mode: 'insensitive' as any } },
        { country: { contains: query, mode: 'insensitive' as any } },
      ],
    };

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              firstName: true,
              lastName: true,
              avatar: true,
            },
          },
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
      query,
    };
  }
}
