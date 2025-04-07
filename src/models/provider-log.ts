import { Providers } from '@app/constants/providers';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class ProviderLog {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: 'text' })
  vrm: string;

  @Column({ type: 'datetime', nullable: true })
  timestamp: Date | undefined;

  @Column({ type: 'int', nullable: true })
  duration: number | undefined;

  @Column({ type: 'text', nullable: true })
  url: string | undefined;

  @Column({ type: 'text' })
  code: string;

  @Column({ type: 'text', nullable: true })
  error: string | undefined;

  @Column({ type: 'text' })
  provider: Providers;
}
