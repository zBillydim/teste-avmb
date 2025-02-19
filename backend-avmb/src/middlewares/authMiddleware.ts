import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source";
import { User } from "../entities/User";

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    res.status(401).json({ message: "Token de autenticação não fornecido." });
    return;
  }

  try {
    const secret = process.env.JWT_SECRET ?? "";
    if (!secret) {
      throw new Error("Erro interno, contate o suporte.");
    }
    const decoded = jwt.verify(token, secret) as { id?: string };
    if (!decoded.id) {
      res.status(401).json({ message: "Token inválido: id não encontrado." });
      return;
    }
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.id },
    });

    if (!user) {
      res.status(401).json({ message: "Usuário não encontrado." });
      return;
    }
    req.user = user as Partial<User>;

    next();
  } catch (error: any) {
    next(error);
    res.status(401).json({ message: error.message });
    return;
  }
}
