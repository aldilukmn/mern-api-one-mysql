import express from "express";
import { createUser, deleteUser, getAllUser, getUserById, logout, me, updateUser, userLogin, userRegister } from "../controllers/users.js";
import { validationLogin, validationRegister, validator } from "../validations/users.js";
import { verifyToken } from "../middleware/verify_token.js";
import { refreshToken } from "../controllers/refresh_token.js";

const router = express.Router();

router.get("/users", verifyToken, getAllUser);
router.get("/users/:id", getUserById);
router.post("/users", validationRegister, validator, createUser);
router.patch("/users/:id", validationRegister, validator, updateUser);
router.delete("/users/:id", deleteUser);
router.post("/register", validationRegister, validator, userRegister);
router.post("/login", validationLogin, validator, userLogin);
router.get("/token", refreshToken);
router.delete("/logout", logout);
router.get("/me", me)

export default router;
