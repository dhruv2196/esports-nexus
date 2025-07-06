import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsObject, IsBoolean } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsObject()
  profile?: {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    country?: string;
    language?: string;
    timezone?: string;
  };

  @IsOptional()
  @IsObject()
  preferences?: {
    notifications?: {
      email?: boolean;
      push?: boolean;
      tournament_updates?: boolean;
      team_invites?: boolean;
    };
    privacy?: {
      profile_visibility?: 'public' | 'friends' | 'private';
      show_stats?: boolean;
    };
  };
}