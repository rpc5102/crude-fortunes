// Gameplay randomness goes through here so it can be seeded in one place later.
export const random = (): number => Math.random();
export const rand = (a: number, b: number): number => a + random() * (b - a);
export const pick = <T>(a: readonly T[]): T => a[Math.floor(random() * a.length)]!;
