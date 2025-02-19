import express from "express";
import "express-async-errors";
import { AcessController } from "./controllers/AcessController";
import { AppDataSource } from "./data-source";
import { errorMiddleware } from "./middlewares/error";
import routes from "./routes";

AppDataSource.initialize().then(() => {
  const app = express();
  const cron = require("node-cron");
  const cors = require("cors");
  app.use(cors());

  const acessController = new AcessController();

  cron.schedule("* * * * *", async () => {
    try {
      await acessController.checkExpiredAccesses();
      console.log("Verificação de acessos expirados concluída.");
    } catch (error) {
      console.error("Erro ao verificar acessos expirados:", error);
    }
  });

  app.use(express.json());
  app.use(routes);
  app.use(errorMiddleware);

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
  });
});
