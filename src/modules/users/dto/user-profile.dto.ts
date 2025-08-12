import { ApiProperty } from '@nestjs/swagger';

export class UserProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  email: string;

  @ApiProperty()
  username: string;

  @ApiProperty({ required: false })
  firstName?: string;

  @ApiProperty({ required: false })
  lastName?: string;

  @ApiProperty({ required: false })
  avatar?: string;

  @ApiProperty({ required: false })
  bio?: string;

  @ApiProperty({ required: false })
  phone?: string;

  @ApiProperty({ required: false })
  location?: {
    city: string;
    state: string;
    country: string;
  };

  @ApiProperty()
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    publicProfile: boolean;
    showContactInfo: boolean;
  };

  @ApiProperty()
  stats: {
    postsCount: number;
    commentsCount: number;
    successfulReturns: number;
    memberSince: string;
  };

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}
