import { Request, Response } from "express";
import { LessThan } from "typeorm";
import { AppDataSource } from "../data-source";
import { Access } from "../entities/Access";
import { accessRepository } from "../repositories/accesRepository";
import { userRepository } from "../repositories/userRepository";

export class AcessController {
  async grantAccess(req: Request, res: Response) {
    const { userId } = req.params;
    const { expiresIn, resource } = req.body;

    try {
      const user = await userRepository.findOneBy({ id: String(userId) });
      if (!user) {
        return res.status(404).json({ message: "Usuário não encontrado." });
      }

      if (!expiresIn) {
        return res
          .status(400)
          .json({ message: "A data de expiração é obrigatória." });
      }

      let formattedExpiresIn = expiresIn;
      if (!formattedExpiresIn.includes("T")) {
        formattedExpiresIn += "T00:00:00.000Z";
      } else if (!formattedExpiresIn.includes(":")) {
        formattedExpiresIn = formattedExpiresIn.replace("T", "T00:00:00.000Z");
      }

      const expiresAt = new Date(formattedExpiresIn);

      if (isNaN(expiresAt.getTime())) {
        return res.status(400).json({ message: "Formato de data inválido." });
      }

      const access = accessRepository.create({
        user,
        resource,
        expiresAt,
      });

      await accessRepository.save(access);

      return res
        .status(201)
        .json({ message: "Acesso concedido com sucesso.", access });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({ message: error.message });
    }
  }

  async revokeAccess(req: Request, res: Response) {
    const { accessId } = req.params;
    try {
      const access = await accessRepository.findOneBy({ id: String(accessId) });

      if (!access) {
        return res.status(404).json({ message: "Acesso não encontrado." });
      }

      access.revoked = true;
      access.status = "expired";
      await accessRepository.save(access);

      return res.status(200).json({ message: "Acesso revogado com sucesso." });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  }

  async listAccesses(req: Request, res: Response) {
    const { userId, resourceId } = req.query;
    try {
      const accessRepository = AppDataSource.getRepository(Access);

      let where = {};
      if (userId) where = { ...where, user: { id: userId } };
      if (resourceId) where = { ...where, resource: { id: resourceId } };

      const accesses = await accessRepository.find({
        where,
        relations: ["user"],
      });

      const highlightedAccesses = accesses.map((access) => ({
        id: access.id,
        user: access.user.name,
        resource: access.resource,
        expirationTime: access.expiresAt,
        status: access.status,
      }));

      return res.status(200).json({ accesses: highlightedAccesses });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }
  async checkExpiredAccesses() {
    const now = new Date();

    const accesses = await accessRepository.find({
      where: {
        revoked: false,
        expiresAt: LessThan(now),
      },
    });

    accesses.forEach(async (access) => {
      access.status = "expired";
      access.revoked = true;
      await accessRepository.save(access);
      console.log(
        `Acesso revogado para o recurso ${access.resource} devido a expiração.`
      );
    });
  }

  async listUserAccesses(req: Request, res: Response) {
    try {
      const userId = req.user.id;

      const userAccesses = await accessRepository.find({
        where: { user: { id: userId }, status: "active" },
        select: ["resource", "status"],
      });

      if (!userAccesses || userAccesses.length === 0) {
        return res.status(404).json({
          message: "Nenhum acesso encontrado para este usuário.",
        });
      }

      return res.status(200).json(userAccesses);
    } catch (error) {
      console.error("Erro ao buscar acessos do usuário:", error);
      return res.status(500).json({
        message: "Erro interno no servidor. Tente novamente mais tarde.",
      });
    }
  }
}
