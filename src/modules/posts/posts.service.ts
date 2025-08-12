import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/database.providers';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { PostFilterDto } from './dto/post-filter.dto';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { PaginationUtil } from '../../common/utils/pagination.util';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createPostDto: CreatePostDto, imageUrls: string[] = []) {
    // Get or create category
    const category = await this.prisma.category.upsert({
      where: { name: createPostDto.category },
      update: {},
      create: {
        name: createPostDto.category,
        description: `${createPostDto.category} items`,
      },
    });

    const post = await this.prisma.post.create({
      data: {
        title: createPostDto.title,
        description: createPostDto.description,
        status: createPostDto.status.toUpperCase() as any,
        reward: createPostDto.reward,
        address: createPostDto.address,
        city: createPostDto.city,
        state: createPostDto.state,
        country: createPostDto.country,
        latitude: createPostDto.latitude,
        longitude: createPostDto.longitude,
        contactPhone: createPostDto.contactPhone,
        contactEmail: createPostDto.contactEmail,
        preferredContact: createPostDto.preferredContact.toUpperCase() as any,
        tags: createPostDto.tags,
        authorId: userId,
        categoryId: category.id,
        images: {
          create: imageUrls.map(url => ({
            url,
            filename: url.split('/').pop() || 'image.jpg',
          })),
        },
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        category: true,
        images: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    // Update user's posts count
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        postsCount: {
          increment: 1,
        },
      },
    });

    return this.mapToPostResponse(post);
  }

  async findAll(paginationDto: PaginationDto, filterDto: PostFilterDto, userId?: string) {
    const skip = PaginationUtil.getSkip(paginationDto.page || 1, paginationDto.limit || 10);
    const take = PaginationUtil.getTake(paginationDto.limit || 10);

    const where: any = {};

    // Apply filters
    if (filterDto.category) {
      where.category = {
        name: { equals: filterDto.category, mode: 'insensitive' as any },
      };
    }

    if (filterDto.status) {
      where.status = filterDto.status.toUpperCase() as any;
    }

    if (filterDto.location) {
      where.OR = [
        { city: { contains: filterDto.location, mode: 'insensitive' as any } },
        { state: { contains: filterDto.location, mode: 'insensitive' as any } },
        { country: { contains: filterDto.location, mode: 'insensitive' as any } },
      ];
    }

    if (filterDto.startDate || filterDto.endDate) {
      where.createdAt = {};
      if (filterDto.startDate) {
        where.createdAt.gte = new Date(filterDto.startDate);
      }
      if (filterDto.endDate) {
        where.createdAt.lte = new Date(filterDto.endDate);
      }
    }

    if (filterDto.hasReward !== undefined) {
      if (filterDto.hasReward) {
        where.reward = { gt: 0 };
      } else {
        where.reward = { equals: null };
      }
    }

    if (filterDto.tags && filterDto.tags.length > 0) {
      where.tags = {
        hasSome: filterDto.tags,
      };
    }

    if (filterDto.search) {
      where.OR = [
        { title: { contains: filterDto.search, mode: 'insensitive' as any } },
        { description: { contains: filterDto.search, mode: 'insensitive' as any } },
        { tags: { hasSome: [filterDto.search] } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              username: true,
              avatar: true,
            },
          },
          category: true,
          images: true,
          _count: {
            select: {
              comments: true,
              likes: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.post.count({ where }),
    ]);

    const mappedPosts = posts.map(post => this.mapToPostResponse(post, userId));

    return PaginationUtil.createPaginatedResponse(
      mappedPosts,
      total,
      paginationDto.page || 1,
              paginationDto.limit || 10,
    );
  }

  async findAllCombined(query: any, userId?: string) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = PaginationUtil.getSkip(page, limit);
    const take = PaginationUtil.getTake(limit);

    const where: any = {};

    if (query.category) {
      where.category = { is: { name: { equals: query.category, mode: 'insensitive' as any } } };
    }
    if (query.status) {
      where.status = query.status.toUpperCase() as any;
    }
    if (query.location) {
      where.OR = [
        { city: { contains: query.location, mode: 'insensitive' as any } },
        { state: { contains: query.location, mode: 'insensitive' as any } },
        { country: { contains: query.location, mode: 'insensitive' as any } },
      ];
    }
    if (query.startDate || query.endDate) {
      where.createdAt = {};
      if (query.startDate) where.createdAt.gte = new Date(query.startDate);
      if (query.endDate) where.createdAt.lte = new Date(query.endDate);
    }
    if (query.hasReward !== undefined) {
      const hasReward = String(query.hasReward).toLowerCase() === 'true';
      where.reward = hasReward ? { gt: 0 } : { equals: null };
    }
    if (query.tags) {
      const tags = Array.isArray(query.tags)
        ? query.tags
        : typeof query.tags === 'string'
          ? query.tags.split(',').map((t: string) => t.trim()).filter(Boolean)
          : [];
      if (tags.length > 0) {
        where.tags = { hasSome: tags };
      }
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' as any } },
        { description: { contains: query.search, mode: 'insensitive' as any } },
        { tags: { hasSome: [query.search] } },
      ];
    }

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, avatar: true } },
          category: true,
          images: true,
          _count: { select: { comments: true, likes: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.post.count({ where }),
    ]);

    const mappedPosts = posts.map(post => this.mapToPostResponse(post, userId));
    return PaginationUtil.createPaginatedResponse(mappedPosts, total, page, limit);
  }

  async findOne(id: string, userId?: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        category: true,
        images: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    return this.mapToPostResponse(post, userId);
  }

  async update(id: string, userId: string, updatePostDto: UpdatePostDto) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only update your own posts');
    }

    const updateData: any = {};

    if (updatePostDto.title) updateData.title = updatePostDto.title;
    if (updatePostDto.description) updateData.description = updatePostDto.description;
    if (updatePostDto.status) updateData.status = updatePostDto.status.toUpperCase();
    if (updatePostDto.reward !== undefined) updateData.reward = updatePostDto.reward;
    if (updatePostDto.address) updateData.address = updatePostDto.address;
    if (updatePostDto.city) updateData.city = updatePostDto.city;
    if (updatePostDto.state) updateData.state = updatePostDto.state;
    if (updatePostDto.country) updateData.country = updatePostDto.country;
    if (updatePostDto.latitude !== undefined) updateData.latitude = updatePostDto.latitude;
    if (updatePostDto.longitude !== undefined) updateData.longitude = updatePostDto.longitude;
    if (updatePostDto.contactPhone !== undefined) updateData.contactPhone = updatePostDto.contactPhone;
    if (updatePostDto.contactEmail !== undefined) updateData.contactEmail = updatePostDto.contactEmail;
    if (updatePostDto.preferredContact) updateData.preferredContact = updatePostDto.preferredContact.toUpperCase();
    if (updatePostDto.tags) updateData.tags = updatePostDto.tags;

    if (updatePostDto.category) {
      const category = await this.prisma.category.upsert({
        where: { name: updatePostDto.category },
        update: {},
        create: {
          name: updatePostDto.category,
          description: `${updatePostDto.category} items`,
        },
      });
      updateData.categoryId = category.id;
    }

    const updatedPost = await this.prisma.post.update({
      where: { id },
      data: updateData,
      include: {
        author: {
          select: {
            id: true,
            username: true,
            avatar: true,
          },
        },
        category: true,
        images: true,
        _count: {
          select: {
            comments: true,
            likes: true,
          },
        },
      },
    });

    return this.mapToPostResponse(updatedPost);
  }

  async remove(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: { author: true },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    if (post.authorId !== userId) {
      throw new ForbiddenException('You can only delete your own posts');
    }

    await this.prisma.post.delete({
      where: { id },
    });

    // Update user's posts count
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        postsCount: {
          decrement: 1,
        },
      },
    });

    return { message: 'Post deleted successfully' };
  }

  async likePost(id: string, userId: string) {
    const post = await this.prisma.post.findUnique({
      where: { id },
    });

    if (!post) {
      throw new NotFoundException('Post not found');
    }

    const existingLike = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: id,
        },
      },
    });

    if (existingLike) {
      throw new ForbiddenException('You have already liked this post');
    }

    await this.prisma.like.create({
      data: {
        userId,
        postId: id,
      },
    });

    return { message: 'Post liked successfully' };
  }

  async unlikePost(id: string, userId: string) {
    const like = await this.prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId: id,
        },
      },
    });

    if (!like) {
      throw new NotFoundException('Like not found');
    }

    await this.prisma.like.delete({
      where: {
        userId_postId: {
          userId,
          postId: id,
        },
      },
    });

    return { message: 'Post unliked successfully' };
  }

  private mapToPostResponse(post: any, userId?: string) {
    return {
      id: post.id,
      title: post.title,
      description: post.description,
      category: post.category.name,
      status: post.status.toLowerCase(),
      location: {
        address: post.address,
        city: post.city,
        state: post.state,
        country: post.country,
        coordinates: post.latitude && post.longitude ? {
          lat: post.latitude,
          lng: post.longitude,
        } : undefined,
      },
      images: post.images.map((img: any) => img.url),
      reward: post.reward,
      contactInfo: {
        phone: post.contactPhone,
        email: post.contactEmail,
        preferredContact: post.preferredContact.toLowerCase(),
      },
      tags: post.tags,
      author: {
        id: post.author.id,
        username: post.author.username,
        avatar: post.author.avatar,
      },
      createdAt: post.createdAt.toISOString(),
      updatedAt: post.updatedAt.toISOString(),
      _count: {
        comments: post._count.comments,
        likes: post._count.likes,
      },
      isLiked: userId ? post.likes?.some((like: any) => like.userId === userId) : false,
    };
  }
}
