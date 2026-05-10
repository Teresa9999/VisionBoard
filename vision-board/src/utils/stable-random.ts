export function stableRandom(seed: number) {
  const value = Math.sin(seed * 9999) * 10000;
  return value - Math.floor(value);
}

export function randomIn(seed: number, min: number, max: number) {
  return Number((min + stableRandom(seed) * (max - min)).toFixed(4));
}
