import { AppDataSource } from "../data-source";
import { Access } from "../entities/Access";

export const accessRepository = AppDataSource.getRepository(Access);
