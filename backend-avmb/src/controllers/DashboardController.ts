import { Request, Response } from "express";
import { LessThanOrEqual, MoreThan } from "typeorm";
import { AppDataSource } from "../data-source";
import { Access } from "../entities/Access";

export class DashboardController {
  async getDashboard(req: Request, res: Response) {
    try {
      const currentDate = new Date();
      const expirationThreshold = new Date();
      expirationThreshold.setDate(currentDate.getDate() + 7);

      const accessRepository = AppDataSource.getRepository(Access);

      const [activeAccesses, expiringAccesses] = await Promise.all([
        accessRepository.find({
          where: {
            revoked: false,
            expiresAt: MoreThan(currentDate),
          },
          relations: ["user", "resource"],
        }),
        accessRepository.find({
          where: {
            revoked: false,
            expiresAt: LessThanOrEqual(expirationThreshold),
          },
          relations: ["user", "resource"],
        }),
      ]);

      return res.status(200).json({
        activeAccesses,
        expiringAccesses,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
