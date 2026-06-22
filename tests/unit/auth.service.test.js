import bcrypt from 'bcrypt';

// auth.service — hash y comparación de contraseñas
// No necesita mocks: bcrypt es una función pura sin dependencias externas

describe('auth.service — bcrypt', () => {
  test('hashea la contraseña (no devuelve texto plano)', async () => {
    const hash = await bcrypt.hash('password123', 10);
    expect(hash).not.toBe('password123');
    expect(hash.startsWith('$2b$')).toBe(true);
  });

  test('compare devuelve true para contraseña correcta', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const result = await bcrypt.compare('password123', hash);
    expect(result).toBe(true);
  });

  test('compare devuelve false para contraseña incorrecta', async () => {
    const hash = await bcrypt.hash('password123', 10);
    const result = await bcrypt.compare('wrongpassword', hash);
    expect(result).toBe(false);
  });

  test('dos hashes del mismo password son distintos (salt aleatorio)', async () => {
    const hash1 = await bcrypt.hash('password123', 10);
    const hash2 = await bcrypt.hash('password123', 10);
    expect(hash1).not.toBe(hash2);
  });
});
