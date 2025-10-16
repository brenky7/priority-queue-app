import express, { Request, Response } from "express";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Demo endpoint
app.get("/", (req: Request, res: Response) => {
  res.status(200).send("Priority Queue App");
});

// Spustenie
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
