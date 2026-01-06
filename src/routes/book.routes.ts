import express, { Request, Response } from "express";
import { authGuard } from "../middlewares/authGuard.js";

const router = express.Router();

router.get("/api/sample-book", authGuard, (req: Request, res: Response) => {
  res.json({
    msg: "successfully take book",
    data: [
      {
        id: "bk_001",
        title: "Clean Code",
        author: "Robert C. Martin",
        publisher: "Prentice Hall",
        isbn: "978-0132350884",
        category: "Programming",
        language: "English",
        pages: 464,
        price: 450000,
        stock: 12,
        rating: 4.8,
        publishedAt: "2008-08-11",
        createdAt: "2026-01-01T08:00:00Z",
        updatedAt: "2026-01-01T08:00:00Z",
      },
      {
        id: "bk_002",
        title: "You Don’t Know JS Yet",
        author: "Kyle Simpson",
        publisher: "Independently published",
        isbn: "978-1098124045",
        category: "Programming",
        language: "English",
        pages: 143,
        price: 250000,
        stock: 20,
        rating: 4.7,
        publishedAt: "2020-01-28",
        createdAt: "2026-01-01T08:00:00Z",
        updatedAt: "2026-01-01T08:00:00Z",
      },
      {
        id: "bk_003",
        title: "Atomic Habits",
        author: "James Clear",
        publisher: "Penguin Random House",
        isbn: "978-0735211292",
        category: "Self Improvement",
        language: "English",
        pages: 320,
        price: 320000,
        stock: 8,
        rating: 4.9,
        publishedAt: "2018-10-16",
        createdAt: "2026-01-01T08:00:00Z",
        updatedAt: "2026-01-01T08:00:00Z",
      },
    ],
  });
});

export default router;
