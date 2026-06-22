import * as reviewsService from '../services/reviews.service.js';
import { responseOk, responseCreated, responseBadRequest } from '../helpers/controllers.response.js';

// GET /api/products/:id/reviews
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await reviewsService.getReviewsByProductId(req.params.id);
    responseOk(res, reviews);
  } catch (err) {
    next(err);
  }
};

// POST /api/products/:id/reviews
export const createReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (!rating) return responseBadRequest(res, 'El campo rating es obligatorio');
    if (rating < 1 || rating > 5) return responseBadRequest(res, 'El rating debe estar entre 1 y 5');

    const review = await reviewsService.createReview(req.params.id, req.user.id, { rating, comment });
    responseCreated(res, review);
  } catch (err) {
    next(err);
  }
};
