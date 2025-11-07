export const convertToExpectedRange = (
  value: number,
  x: number,
  y: number,
  expectedX: number,
  expectedY: number,
) => {
  return ((expectedY - expectedX) * (value - x)) / (y - x) + expectedX;
};

export const clamp = (value: number, lowerBound: number, upperBound: number) => {
  return Math.min(Math.max(lowerBound, value), upperBound);
};

type Enumerate<N extends number, Acc extends number[] = []> = Acc['length'] extends N
  ? Acc[number]
  : Enumerate<N, [...Acc, Acc['length']]>;

export type IntRange<F extends number, T extends number> = Exclude<Enumerate<T>, Enumerate<F>>;
