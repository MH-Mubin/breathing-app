import express from "express";
import { protect } from "../middleware/auth.js";
import Feedback from "../models/Feedback.js";

const router = express.Router();

// Submit feedback (authenticated users only)
router.post("/submit", protect, async (req, res) => {
  try {
    const { rating, feedback } = req.body;

    // Validation
    if (!rating || !feedback) {
      return res.status(400).json({
        success: false,
        message: "Rating and feedback are required",
      });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: "Rating must be between 1 and 5",
      });
    }

    if (feedback.length > 500) {
      return res.status(400).json({
        success: false,
        message: "Feedback must be 500 characters or less",
      });
    }

    // Check if user already submitted feedback
    const existingFeedback = await Feedback.findOne({ userId: req.user.id });
    if (existingFeedback) {
      return res.status(400).json({
        success: false,
        message: "You have already submitted feedback. Thank you!",
      });
    }

    // Create feedback
    const newFeedback = new Feedback({
      userId: req.user.id,
      name: req.user.name,
      email: req.user.email,
      rating,
      feedback,
    });

    await newFeedback.save();

    res.status(201).json({
      success: true,
      message: "Thank you for your feedback! It will be reviewed shortly.",
      data: newFeedback,
    });
  } catch (error) {
    console.error("Submit feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to submit feedback",
    });
  }
});

// Get approved public feedbacks (no authentication required)
router.get("/public", async (req, res) => {
  try {
    const feedbacks = await Feedback.find({
      isApproved: true,
      isPublic: true,
      rating: { $gte: 4 }, // Only show 4 and 5 star ratings
    })
      .select("name rating feedback createdAt")
      .sort({ createdAt: -1 })
      .limit(6); // Show latest 6 feedbacks

    res.json({
      success: true,
      data: feedbacks,
    });
  } catch (error) {
    console.error("Get public feedbacks error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedbacks",
    });
  }
});

// Get user's own feedback (authenticated)
router.get("/my-feedback", protect, async (req, res) => {
  try {
    const feedback = await Feedback.findOne({ userId: req.user.id });

    res.json({
      success: true,
      data: feedback,
    });
  } catch (error) {
    console.error("Get my feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch your feedback",
    });
  }
});

export default router;
