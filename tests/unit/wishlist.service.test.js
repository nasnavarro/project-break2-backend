import { jest } from '@jest/globals';

// mockSave simula el método .save() que Mongoose llama sobre una instancia
// de documento para persistir cambios. Es independiente del modelo porque
// .save() se llama sobre el objeto devuelto por findOne, no sobre la clase.
const mockSave = jest.fn();

// mockWishlist sustituye al modelo Mongoose completo.
// Solo necesitamos los métodos que el servicio utiliza: findOne y create.
const mockWishlist = {
  findOne: jest.fn(),
  create: jest.fn(),
};

// Interceptamos el import del modelo antes de que el servicio lo cargue.
// La factory (() => ...) devuelve { default: mockWishlist } porque el modelo
// se exporta como export default — Jest necesita que el mock respete esa forma.
jest.unstable_mockModule('../../src/models/wishlist.model.js', () => ({
  default: mockWishlist,
}));

// Import dinámico DESPUÉS del mock: si usáramos import estático arriba,
// se ejecutaría antes de que jest.unstable_mockModule estuviera listo
// y el servicio recibiría el modelo real de Mongoose.
const { getWishlist, toggleWishlist } = await import('../../src/services/wishlist.service.js');

describe('wishlist.service — toggle add/remove', () => {
  // Limpiamos el estado de todos los mocks antes de cada test para evitar
  // que las llamadas de un test contaminen las aserciones del siguiente.
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('getWishlist devuelve [] cuando el usuario no tiene wishlist', async () => {
    // Simulamos que el usuario no tiene wishlist en MongoDB (findOne → null).
    // El servicio usa el operador ?. y ?? para devolver [] en ese caso.
    mockWishlist.findOne.mockResolvedValue(null);
    const result = await getWishlist('user-1');
    expect(result).toEqual([]);
  });

  test('toggleWishlist crea documento nuevo si el usuario no tiene wishlist', async () => {
    // findOne devuelve null → el servicio entra en la rama de creación.
    mockWishlist.findOne.mockResolvedValue(null);
    mockWishlist.create.mockResolvedValue({ userId: 'user-1', productIds: ['prod-1'] });

    await toggleWishlist('user-1', 'prod-1');

    // Verificamos que create se llamó con el documento inicial correcto.
    expect(mockWishlist.create).toHaveBeenCalledWith({
      userId: 'user-1',
      productIds: ['prod-1'],
    });
  });

  test('toggleWishlist añade producto si no estaba en la wishlist', async () => {
    // fakeWishlist simula el documento Mongoose que devuelve findOne.
    // Incluye .save() porque el servicio llama wishlist.save() tras modificar productIds.
    const fakeWishlist = { productIds: ['prod-1'], save: mockSave };
    mockWishlist.findOne.mockResolvedValue(fakeWishlist);
    mockSave.mockResolvedValue(fakeWishlist);

    await toggleWishlist('user-1', 'prod-2');

    // El servicio muta directamente el array productIds del documento,
    // por eso podemos leer el estado actualizado desde fakeWishlist.
    expect(fakeWishlist.productIds).toContain('prod-2');
    expect(mockSave).toHaveBeenCalled();
  });

  test('toggleWishlist elimina producto si ya estaba en la wishlist', async () => {
    // La wishlist ya contiene prod-1 y prod-2.
    const fakeWishlist = { productIds: ['prod-1', 'prod-2'], save: mockSave };
    mockWishlist.findOne.mockResolvedValue(fakeWishlist);
    mockSave.mockResolvedValue(fakeWishlist);

    await toggleWishlist('user-1', 'prod-1');

    // prod-1 debe haber desaparecido; prod-2 debe seguir intacto.
    expect(fakeWishlist.productIds).not.toContain('prod-1');
    expect(fakeWishlist.productIds).toContain('prod-2');
    expect(mockSave).toHaveBeenCalled();
  });
});
