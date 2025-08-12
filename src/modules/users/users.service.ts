import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../database/database.providers';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserProfileDto } from './dto/user-profile.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToUserProfileDto(user);
  }

  async findByUsername(username: string): Promise<UserProfileDto> {
    const user = await this.prisma.user.findUnique({
      where: { username },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.mapToUserProfileDto(user);
  }

  async updateProfile(userId: string, updateUserDto: UpdateUserDto): Promise<UserProfileDto> {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: updateUserDto.firstName,
        lastName: updateUserDto.lastName,
        bio: updateUserDto.bio,
        phone: updateUserDto.phone,
        city: updateUserDto.city,
        state: updateUserDto.state,
        country: updateUserDto.country,
        emailNotifications: updateUserDto.emailNotifications,
        pushNotifications: updateUserDto.pushNotifications,
        publicProfile: updateUserDto.publicProfile,
        showContactInfo: updateUserDto.showContactInfo,
      },
      include: {
        _count: {
          select: {
            posts: true,
            comments: true,
          },
        },
      },
    });

    return this.mapToUserProfileDto(user);
  }

  async getUserPosts(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const take = Math.min(limit, 50);

    const [posts, total] = await Promise.all([
      this.prisma.post.findMany({
        where: { authorId: userId },
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
      this.prisma.post.count({
        where: { authorId: userId },
      }),
    ]);

    return {
      posts,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page < Math.ceil(total / limit),
      hasPrev: page > 1,
    };
  }

  async getUserStats(userId: string) {
    const [postsCount, commentsCount, successfulReturns] = await Promise.all([
      this.prisma.post.count({
        where: { authorId: userId },
      }),
      this.prisma.comment.count({
        where: { authorId: userId },
      }),
      this.prisma.post.count({
        where: {
          authorId: userId,
          status: 'RETURNED',
        },
      }),
    ]);

    return {
      totalPosts: postsCount,
      activePosts: postsCount, // You might want to filter by status
      resolvedPosts: successfulReturns,
      totalComments: commentsCount,
      successfulReturns,
      reputation: successfulReturns * 10 + commentsCount * 2, // Simple reputation calculation
    };
  }

  private mapToUserProfileDto(user: any): UserProfileDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      location: user.city || user.state || user.country ? {
        city: user.city,
        state: user.state,
        country: user.country,
      } : undefined,
      preferences: {
        emailNotifications: user.emailNotifications,
        pushNotifications: user.pushNotifications,
        publicProfile: user.publicProfile,
        showContactInfo: user.showContactInfo,
      },
      stats: {
        postsCount: user._count.posts,
        commentsCount: user._count.comments,
        successfulReturns: user.successfulReturns,
        memberSince: user.createdAt.toISOString(),
      },
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    };
  }
}
