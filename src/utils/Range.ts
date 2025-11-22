export default interface Range {
  start: number;
  end: number;
}
export function createRange(start: number, end: number): Range {
  return { start, end };
}

export function rangeIn(value: number, range: Range) {
  'worklet';
  return value >= range.start && value <= range.end;
}
export function rangeBetween(value: number, range: Range) {
  'worklet';
  return value > range.start && value < range.end;
}
