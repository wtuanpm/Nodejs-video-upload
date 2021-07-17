import { PrimaryGeneratedColumn, Column, DeleteDateColumn, Index, Entity } from 'typeorm';
import env from '@/env';
import { ScreenShot, VideoProfile } from '@graphql/types/generated-graphql-types';

@Index('idx_fileType', ['fileType'], {})
@Index('idx_type', ['type'], {})
@Index('idx_createdBy', ['createdBy'], {})
@Entity('media', { schema: env.databaseName })
export class MediaEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column('varchar', { name: 'name', nullable: true })
  fileName: string;

  @Column('varchar', { name: 'title', nullable: true })
  title: string;

  @Column('varchar', { name: 'description', nullable: true, length: 512 })
  description: string;

  @Column('varchar', { name: 'path', nullable: true })
  path: string;

  @Column('int', { name: 'thunb_id', nullable: true })
  thumbId: number;

  @Column('varchar', { name: 'created_by', nullable: true })
  createdBy: string;

  @Column('json', { name: 'screenshots', nullable: true })
  screenshots: ScreenShot[];

  @Column('json', { name: 'videoProfiles', nullable: true })
  videoProfiles: VideoProfile[];

  @Column('int', { name: 'size', nullable: true })
  size: number;

  @Column('float', { name: 'duration', nullable: true })
  duration: number;

  @Column('varchar', { name: 'file_type', nullable: true })
  fileType: string;

  @Column('tinyint', { name: 'type' })
  type: number | null;

  @Column('tinyint', { name: 'status', nullable: true })
  status: number | null;

  @Column('int', { name: 'created_at' })
  createdAt: number | null;

  @Column('int', { name: 'updated_at', nullable: true })
  updatedAt: number | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date | null;
}
