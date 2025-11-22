import { deepClone } from './GeneralUtils';

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};
export default DeepPartial;

export function convertDeepPartialToFullObject<T extends object>(
  obj: DeepPartial<T>,
  defaultFullObject: T,
  cloneObj: boolean = false,
  canDeepConvert: (obj: unknown) => boolean = obj => !!(obj && typeof obj === 'object'),
): T {
  const clone = cloneObj ? deepClone(obj) : obj;
  return convertDeepPartialToFullObjectInternal(clone, defaultFullObject, canDeepConvert);
}

function convertDeepPartialToFullObjectInternal<T extends object>(
  obj: DeepPartial<T>,
  defaultFullObject: T,
  canDeepConvert: (obj: unknown) => boolean,
): T {
  Object.entries(defaultFullObject).forEach(([key, value]) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
    const objValueForKey = (obj as any)[key];
    if (objValueForKey === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
      (obj as any)[key] = value;
    } else if (canDeepConvert(value)) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      convertDeepPartialToFullObjectInternal(objValueForKey, value, canDeepConvert);
    }
  });
  return obj as T;
}
