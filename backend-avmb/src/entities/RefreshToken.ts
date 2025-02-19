import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity("refresh_tokens")
export class RefreshToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "text", unique: true })
  token: string;

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt: Date;

  @Column({ type: "boolean", default: false })
  revoked: boolean;

  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn({ name: "user_id" })  
  user: User;
}
