import { jest } from '@jest/globals';

// Mock del modelo Review antes de importar el servicio.
// jest.fn() crea una función falsa que no hace nada por defecto, pero que Jest
// puede controlar: puedes decirle qué devolver, cuántas veces se llamó, con
// qué argumentos, etc.
const mockReview = {
  find: jest.fn(),
  create: jest.fn(),
};

// Le dice a Jest: "cuando alguien importe review.model.js, dale este objeto falso
// en lugar del modelo real de Mongoose". El default: es necesario porque el
// modelo se exporta como export default Review.
// A partir de aquí, cualquier código que importe Review recibirá mockReview.
jest.unstable_mockModule('../../src/models/review.model.js', () => ({
  default: mockReview,
}));

// Este import dinámico con await es obligatorio y debe ir después de jest.unstable_mockModule.
const { getReviewsByProductId, createReview } = await import('../../src/services/reviews.service.js');

describe('reviews.service — validación de rating', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('createReview llama a Review.create con los datos correctos', async () => {
    const fakeReview = { productId: 'prod-1', userId: 'user-1', rating: 4, comment: 'Bien' };
    mockReview.create.mockResolvedValue(fakeReview);

    const result = await createReview('prod-1', 'user-1', { rating: 4, comment: 'Bien' });

    expect(mockReview.create).toHaveBeenCalledWith({
      productId: 'prod-1',
      userId: 'user-1',
      rating: 4,
      comment: 'Bien',
    });
    expect(result.rating).toBe(4);
  });

  test('createReview lanza error si Mongoose rechaza rating fuera de rango', async () => {
    const validationError = new Error('Validation failed: rating must be between 1 and 5');
    mockReview.create.mockRejectedValue(validationError);

    await expect(createReview('prod-1', 'user-1', { rating: 10 }))
      .rejects.toThrow('Validation failed');
  });

  test('getReviewsByProductId devuelve reviews ordenadas por productId', async () => {
    const fakeReviews = [
      { productId: 'prod-1', rating: 5 },
      { productId: 'prod-1', rating: 3 },
    ];
    mockReview.find.mockReturnValue({ sort: jest.fn().mockResolvedValue(fakeReviews) });

    const result = await getReviewsByProductId('prod-1');

    expect(mockReview.find).toHaveBeenCalledWith({ productId: 'prod-1' });
    expect(result).toHaveLength(2);
  });
});
