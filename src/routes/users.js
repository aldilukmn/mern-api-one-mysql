import express from "express";
import { getAllUser, userLogin, userRegister } from "../controllers/users.js";
import { validationRegister, validator } from "../validations/users.js";

const router = express.Router();

router.get("/users", getAllUser);
router.post("/register", validationRegister, validator, userRegister);
router.post("/login", userLogin);

export default router;
