export namespace ArrayUtils {
  export function removeItem<T>(arr: Array<T>, value: T): Array<T> {
    const index = arr.indexOf(value);
    if (index > -1) {
      arr.splice(index, 1);
    }
    return arr;
  }

  export function distinctBy<T>(arr: T[], key: keyof T | ((t: T) => unknown)) {
    const seen = new Set();
    return arr.filter(item => {
      const keyValue = typeof key === 'function' ? key(item) : item[key];
      if (seen.has(keyValue)) {
        return false;
      }
      seen.add(keyValue);
      return true;
    });
  }
}
