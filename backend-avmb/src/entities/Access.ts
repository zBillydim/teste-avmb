import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from "typeorm";
import { User } from "./User";

@Entity("accesses")
export class Access {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ name: "expires_at", type: "timestamp" })
  expiresAt: Date;

  @Column({ type: "boolean", default: false })
  revoked: boolean;

  @Column({ type: "enum", enum: ["active", "expired"], default: "active" })
  status: "active" | "expired";

  @ManyToOne(() => User, (user) => user.accesses)
  @JoinColumn({ name: "user_id" })
  user: User;

  @Column({ name: "resource", type: "text" })
  resource: string;
}
