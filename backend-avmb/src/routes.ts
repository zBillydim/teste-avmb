import { Router } from "express";
import { DashboardController } from "./controllers/DashboardController";
import { UserController } from "./controllers/UserController";
import { authenticate } from "./middlewares/authMiddleware";
import { AcessController } from "./controllers/AcessController";

const routes = Router();

routes.post("/register", async (req, res) => {
  await new UserController().create(req, res);
});

routes.post("/login", async (req, res) => {
  await new UserController().login(req, res);
});

routes.get("/user", authenticate, async (req, res) => {
  await new UserController().getProfile(req, res);
});
routes.get("/users", authenticate, async (req, res) => {
  await new UserController().getProfiles(req, res);
});

routes.get("/dashboard", authenticate, async (req, res) => {
  await new DashboardController().getDashboard(req, res);
});

routes.get("/user/pending", authenticate, async (req, res) => {
  await new UserController().getPendingUsers(req, res);
});

routes.patch("/user/:userId/status", authenticate, async (req, res) => {
  await new UserController().updateUserStatus(req, res);
});

routes.post("/accesses/:userId/grantAccess", authenticate, async (req, res) => {
  await new AcessController().grantAccess(req, res);
});
routes.post(
  "/accesses/:accessId/revokeAccess",
  authenticate,
  async (req, res) => {
    await new AcessController().revokeAccess(req, res);
  }
);

routes.get("/accesses", authenticate, async (req, res) => {
  await new AcessController().listAccesses(req, res);
});

routes.get("/user/accesses", authenticate, async (req, res) => {
  await new AcessController().listUserAccesses(req, res);
});


export default routes;
