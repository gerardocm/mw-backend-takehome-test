import { Providers } from '@app/constants/providers';
import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class FallbackLog {
  @PrimaryGeneratedColumn()
  id: string;

  @CreateDateColumn()
  fallbackStartedAt: Date | undefined;

  @Column({ type: 'text' })
  provider: Providers;
}
