import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Access } from "./Access";
import { RefreshToken } from "./RefreshToken";

@Entity("users")
export class User {
  @PrimaryGeneratedColumn()
  id: string;

  @Column({ type: "text" })
  name: string;

  @Column({ type: "text", unique: true })
  email: string;

  @Column({ type: "text" })
  password: string;

  @Column({ type: "enum", enum: ["admin", "guest"], default: "guest" })
  role: "admin" | "guest";

  @Column({
    type: "enum",
    enum: ["active", "inactive", "pre-register"],
    default: "pre-register",
  })
  status: "active" | "inactive" | "pre-register";

  @OneToMany(() => Access, (access) => access.user)
  accesses: Access[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];
}
