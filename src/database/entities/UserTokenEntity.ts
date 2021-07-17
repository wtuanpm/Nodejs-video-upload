import env from '@/env';
import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Index('idx_token_id', ['tokenId'], {})
@Index('idx_parentId', ['parentId'], {})
@Entity('user_tokens', { schema: env.databaseName })
export class UserTokenEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('int', { name: 'user_id', unsigned: true })
  parentId: number | null;

  @Column('tinyint', {
    name: 'type',
    nullable: true,
    comment: '1 - refresh token / 2- forgot password token',
  })
  type: number | null;

  @Column('varchar', {
    name: 'token_id',
    nullable: true,
    comment: 'uuid v4',
    length: 128,
  })
  tokenId: string | null;

  @Column('int', { name: 'expires_at', nullable: true })
  expiresAt: number | null;

  @Column('int', { name: 'created_at', nullable: true })
  createdAt: number | null;

  @Column('int', { name: 'deleted_at', nullable: true })
  deletedAt: number | null;
}
