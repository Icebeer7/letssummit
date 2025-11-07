export function safeStringify(value: unknown, prettify: boolean = false) {
  if (value === null || value === undefined) {
    return 'null';
  } else if (typeof value === 'object') {
    try {
      if (prettify) {
        return JSON.stringify(value, null, 2);
      } else {
        return JSON.stringify(value);
      }
    } catch {
      return '{ "error": "Unstringifiable value" }';
    }
  } else if (typeof value === 'string') {
    return value;
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-base-to-string
    return value?.toString?.();
  } catch {
    return '{ "error": "Unstringifiable value" }';
  }
}
