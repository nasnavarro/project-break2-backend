import Review from '../models/review.model.js';

export const getReviewsByProductId = async (productId) =>
  Review.find({ productId }).sort({ createdAt: -1 });

export const createReview = async (productId, userId, data) =>
  Review.create({ productId, userId, ...data });

export const getReviewById = async (reviewId) =>
  Review.findById(reviewId);

export const updateReview = async (reviewId, data) =>
  Review.findByIdAndUpdate(reviewId, data, { new: true });

export const deleteReview = async (reviewId) =>
  Review.findByIdAndDelete(reviewId);
