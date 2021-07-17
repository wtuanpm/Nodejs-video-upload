import { Column, Entity, PrimaryGeneratedColumn, Index, DeleteDateColumn, OneToOne } from 'typeorm';
import env from '../../env';

@Index('idx_username', ['username'], {})
@Index('idx_role', ['role'], {})
@Entity('users', { schema: env.databaseName })
export class UserEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column({
    type: 'varchar',
    name: 'full_name',
    nullable: true,
    length: 100,
  })
  fullName: string;

  @Column('varchar', { name: 'username', nullable: true, length: 190 })
  username: string;

  @Column('int', {
    name: 'role',
    nullable: false,
    default: 1,
    comment: 'ADMIN = 1, LAWYER = 2 , CUSTOMER = 3',
  })
  role: number;

  @Column('varchar', { name: 'password', nullable: true, length: 100 })
  password: string | null;

  @Column('int', { name: 'created_at', nullable: true })
  createdAt: number | null;

  @Column('int', { name: 'updated_at', nullable: true })
  updatedAt: number | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date | null;
}
