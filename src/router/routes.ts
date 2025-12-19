import { Router } from "express";
import { loginController, registerController } from "../controllers/user";

const router = Router();

// Test route
router.get("/", (req, res) => {
    res.json({ message: "API çalışıyor!" });
});
router.post("/register", registerController)

// Auth routes
router.post("/login", loginController);

export default router;
