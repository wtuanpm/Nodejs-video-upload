import { Column, Entity, PrimaryGeneratedColumn, Index, DeleteDateColumn } from 'typeorm';
import env from '../../env';

@Index('idx_clientId', ['clientId'], {})
@Index('idx_secretKey', ['secretKey'], {})
@Entity('clients', { schema: env.databaseName })
export class ClientEntity {
  @PrimaryGeneratedColumn({ type: 'int', name: 'id', unsigned: true })
  id: number;

  @Column({
    type: 'varchar',
    name: 'client_id',
    nullable: true,
    length: 255,
  })
  clientId: string;

  @Column('varchar', { name: 'secret_key', nullable: true, length: 255 })
  secretKey: string;

  @Column('int', { name: 'created_at', nullable: true })
  createdAt: number | null;

  @Column('int', { name: 'updated_at', nullable: true })
  updatedAt: number | null;

  @DeleteDateColumn({ name: 'deleted_at' })
  public deletedAt: Date | null;
}
