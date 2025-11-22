import { PercentageString } from '@components/skia/types';
import { cloneDeep } from 'lodash';
import { safeStringify } from './StringUtils';

export function parsePercentageWorklet(percentageString: PercentageString): number {
  'worklet';
  if (!percentageString) return 0;

  const percentage = percentageString.split('%')[0] ?? '100';
  const percentageNumber = parseInt(percentage);
  return percentageNumber;
}

export function deepClone<T extends object>(target: T): T {
  // return JSON.parse(JSON.stringify(target));
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const clone: T | undefined = cloneDeep(target);
  if (clone === undefined) {
    throw Error(`Unable to clone object ${safeStringify(target)}`);
  }
  return clone;
}

export function replacingAllValuesForKey<T extends object>(
  target: T,
  targetKey: string | RegExp,
  valueProvider: (currentValue: unknown) => unknown,
): T {
  const clonedTarget = deepClone(target);
  replaceAllValuesForKey(clonedTarget, targetKey, valueProvider);
  return clonedTarget;
}

function replaceAllValuesForKey<T extends object>(
  target: T,
  targetKey: string | RegExp,
  valueProvider: (currentValue: unknown) => unknown,
) {
  if (typeof target === 'object') {
    for (const key in target) {
      if (typeof target[key] === 'object') {
        replaceAllValuesForKey(target[key] as object, targetKey, valueProvider);
      } else {
        if ((typeof targetKey === 'string' && key === targetKey) || key.match(targetKey) !== null) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-assignment
          target[key] = valueProvider(target[key]) as any;
        }
      }
    }
  }
}
