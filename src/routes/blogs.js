import express from "express";
import { createBlog, deleteBlog, getAllBlog, getBlogById, updateBlog } from "../controllers/blogs.js";

const router = express.Router();

router.get("/blogs", getAllBlog);
router.get("/blogs/:id", getBlogById);
router.post("/blogs", createBlog);
router.patch("/blogs/:id", updateBlog);
router.delete("/blogs/:id", deleteBlog);

export default router;
