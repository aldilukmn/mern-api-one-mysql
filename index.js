import express from "express";
import dotenv from "dotenv";
import db from "./src/config/database.js";
import { fileURLToPath } from "url";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRouter from "./src/routes/users.js";
import blogRouter from "./src/routes/blogs.js";
import session from "express-session";
import bodyParser from "body-parser";
import sequelizeStore from "connect-session-sequelize";

const app = express();
const sessionStore = sequelizeStore(session.Store);

const store = new sessionStore({
  db: db,
});

// Config dotenv
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, ".env") });

// Config middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(
  cors({
    credentials: true,
    origin: "http://localhost:3000",
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: store,
    cookie: {
      secure: "auto",
    },
  })
);
app.disable("x-powered-by");

// Config router endpoint
app.use("/v1/auth", userRouter);
app.use("/v1", blogRouter);

// Connection server and db
const port = process.env.PORT || 6001;
try {
  try {
    app.listen(port, () => {
      console.log(`Server started on port ${port}.`);
    });
  } catch (error) {
    console.log(error);
  }
  await db.authenticate();
  console.log("Database connected.");
  // await store.sync();
} catch (error) {
  console.log(error);
}
