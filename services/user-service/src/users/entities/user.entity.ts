import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  user_id: string;

  @Column({ unique: true, length: 50 })
  @Index()
  username: string;

  @Column({ unique: true, length: 255 })
  @Index()
  email: string;

  @Column({ select: false })
  password_hash: string;

  @Column({ nullable: true, length: 50 })
  oauth_provider: string;

  @Column({ nullable: true })
  oauth_id: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_verified: boolean;

  @Column({ nullable: true })
  verification_token: string;

  @Column({ nullable: true })
  reset_password_token: string;

  @Column({ nullable: true })
  reset_password_expires: Date;

  @Column({ type: 'jsonb', nullable: true })
  profile: {
    display_name?: string;
    avatar_url?: string;
    bio?: string;
    country?: string;
    language?: string;
    timezone?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  preferences: {
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

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ nullable: true })
  last_login_at: Date;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password_hash && !this.password_hash.startsWith('$2b$')) {
      this.password_hash = await bcrypt.hash(this.password_hash, 10);
    }
  }

  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }
}