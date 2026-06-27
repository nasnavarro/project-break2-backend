import * as reviewsService from '../services/reviews.service.js';
import { responseOk, responseCreated, responseBadRequest, responseNotFound, responseFail } from '../helpers/controllers.response.js';

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

// PUT /api/products/:id/reviews/:reviewId
export const updateReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    if (rating !== undefined && (rating < 1 || rating > 5))
      return responseBadRequest(res, 'El rating debe estar entre 1 y 5');

    const review = await reviewsService.getReviewById(req.params.reviewId);
    if (!review) return responseNotFound(res, 'Review no encontrada');

    if (String(review.userId) !== String(req.user.id))
      return responseFail(res, 'No puedes editar la review de otro usuario', 403);

    const updated = await reviewsService.updateReview(req.params.reviewId, { rating, comment });
    responseOk(res, updated);
  } catch (err) {
    next(err);
  }
};

// DELETE /api/products/:id/reviews/:reviewId
export const deleteReview = async (req, res, next) => {
  try {
    const review = await reviewsService.getReviewById(req.params.reviewId);
    if (!review) return responseNotFound(res, 'Review no encontrada');

    const isOwner = String(review.userId) === String(req.user.id);
    const isAdmin = req.user.role === 'ADMIN';

    if (!isOwner && !isAdmin)
      return responseFail(res, 'No puedes eliminar la review de otro usuario', 403);

    await reviewsService.deleteReview(req.params.reviewId);
    responseOk(res, { message: 'Review eliminada' });
  } catch (err) {
    next(err);
  }
};
