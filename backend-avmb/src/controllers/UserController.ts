import bcrypt from "bcrypt";
import { plainToInstance } from "class-transformer";
import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { CreateUserDto, LoginUserDto } from "../dto/user.dto";
import { BadRequestError } from "../helpers/api-errors";
import { validateDTO } from "../helpers/validate";
import { userRepository } from "../repositories/userRepository";

export class UserController {
  async create(req: Request, res: Response) {
    const createUserDto = plainToInstance(CreateUserDto, req.body);
    const errors = await validateDTO(createUserDto);
    if (errors) {
      return res.status(400).json({ "Erro de validação": errors.error });
    }
    const { name, email, password } = createUserDto;

    try {
      const userExists = await userRepository.findOneBy({ email });

      if (userExists) {
        throw new BadRequestError("E-mail já existe");
      }

      const hashPassword = await bcrypt.hash(password, 10);

      const newUser = userRepository.create({
        name,
        email,
        password: hashPassword,
        role: "guest",
        status: "pre-register",
      });

      await userRepository.save(newUser);

      const { password: _, ...user } = newUser;

      res.status(201).json({ Message: "Usuário criado com sucesso", user });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  async login(req: Request, res: Response) {
    const loginUserDto = plainToInstance(LoginUserDto, req.body);
    const errors = await validateDTO(loginUserDto);
    if (errors) {
      return res.status(400).json({ "Erro de validação": errors.error });
    }
    const { email, password } = loginUserDto;
    try {
      const user = await userRepository.findOneBy({ email });

      if (!user) {
        throw new BadRequestError("E-mail ou senha inválidos");
      }

      if (user.status == "pre-register" || user.status == "inactive") {
        throw new BadRequestError(
          "Usuário não ativado, aguarde um administrador ativar sua conta."
        );
      }

      const verifyPass = await bcrypt.compare(password, user.password);

      if (!verifyPass) {
        throw new BadRequestError("E-mail ou senha inválidos");
      }

      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET ?? "", {
        expiresIn: "8h",
      });

      const { password: _, ...userLogin } = user;

      return res.json({
        user: userLogin,
        token: token,
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getProfile(req: Request, res: Response) {
    const user = req.user;

    try {
      if (!user) {
        throw new BadRequestError("Usuário não encontrado");
      }
      return res.status(200).json({
        message: "Perfil do usuário",
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async getPendingUsers(req: Request, res: Response) {
    try {
      const user = req.user;
      if (user.role !== "admin") {
        throw new BadRequestError("Acesso negado.");
      }
      type Status = "active" | "inactive" | "pre-register";

      const status = req.query.status as Status;

      const validStatuses = ["pre-register", "inactive"];
      if (!validStatuses.includes(status)) {
        throw new BadRequestError("Status inválido.");
      }

      const users = await userRepository.find({
        where: { status },
        select: ["id", "name", "email", "role", "status"],
      });

      return res.status(200).json(users);
    } catch (error: any) {
      return res.status(400).json({ error: error.message });
    }
  }

  async updateUserStatus(req: Request, res: Response) {
    try {
      const { userId } = req.params;
      const { action } = req.body;

      const user = await userRepository.findOneBy({ id: String(userId) });

      if (!user) {
        throw new BadRequestError("Usuário não encontrado.");
      }

      if (!["active", "inactive"].includes(action)) {
        throw new BadRequestError("Ação inválida.");
      }

      user.status = action as "active" | "inactive";

      await userRepository.save(user);

      return res.status(200).json({
        message: `Usuário ${
          action === "active" ? "ativado" : "inativado"
        } com sucesso.`,
      });
    } catch (error: any) {
      console.error(error);
      return res.status(500).json({
        error: error.message,
      });
    }
  }
  async getProfiles(req: Request, res: Response) {
    try {
      const users = await userRepository.find({
        select: ["id", "name", "email", "role", "status"],
        where: { status: "active" },
      });

      return res.status(200).json({
        message: "Lista de usuários",
        users,
      });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  }
}
