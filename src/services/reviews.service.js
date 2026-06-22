import Review from '../models/review.model.js';

export const getReviewsByProductId = async (productId) =>
  Review.find({ productId }).sort({ createdAt: -1 });

export const createReview = async (productId, userId, data) =>
  Review.create({ productId, userId, ...data });
