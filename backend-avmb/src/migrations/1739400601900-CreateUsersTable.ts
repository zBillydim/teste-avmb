import { MigrationInterface, QueryRunner, Table } from "typeorm";

export class CreateUsersTable1739400601900 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto";');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp";');

    await queryRunner.createTable(
      new Table({
        name: "users",
        columns: [
          {
            name: "id",
            type: "uuid",
            isPrimary: true,
            generationStrategy: "uuid",
            default: "uuid_generate_v4()",
          },
          {
            name: "name",
            type: "text",
            isNullable: false,
          },
          {
            name: "email",
            type: "text",
            isUnique: true,
            isNullable: false,
          },
          {
            name: "password",
            type: "text",
            isNullable: false,
          },
          {
            name: "role",
            type: "enum",
            enum: ["admin", "guest"],
            default: "'guest'",
            isNullable: false,
          },
          {
            name: "status",
            type: "enum",
            enum: ["active", "inactive", "pre-register"],
            default: "'pre-register'",
            isNullable: false,
          },
          {
            name: "created_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
          {
            name: "updated_at",
            type: "timestamp",
            default: "CURRENT_TIMESTAMP",
            isNullable: false,
          },
        ],
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable("users");
    await queryRunner.query('DROP EXTENSION IF EXISTS "pgcrypto";');
    await queryRunner.query('DROP EXTENSION IF EXISTS "uuid-ossp";');
  }
}
