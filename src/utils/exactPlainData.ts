export function hasDensePlainArrayShape(value: readonly unknown[]): boolean {
  try {
    if (Object.getPrototypeOf(value) !== Array.prototype) return false;
    const keys = Reflect.ownKeys(value);
    if (keys.length !== value.length + 1) return false;
    for (const key of keys) {
      if (
        key !== 'length' &&
        (typeof key !== 'string' ||
          !/^0$|^[1-9]\d*$/u.test(key) ||
          Number(key) >= value.length ||
          !Object.hasOwn(value, key))
      ) {
        return false;
      }
    }
    for (let index = 0; index < value.length; index += 1) {
      const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
      if (descriptor === undefined || !descriptor.enumerable || !('value' in descriptor)) {
        return false;
      }
    }
    return true;
  } catch {
    return false;
  }
}

export function isPlainDataRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  try {
    const prototype = Object.getPrototypeOf(value);
    return prototype === Object.prototype || prototype === null;
  } catch {
    return false;
  }
}

export function hasExactPlainDataKeys(value: object, expected: readonly string[]): boolean {
  try {
    const keys = Reflect.ownKeys(value);
    return (
      keys.length === expected.length &&
      keys.every((key) => {
        if (typeof key !== 'string' || !expected.includes(key)) return false;
        const descriptor = Object.getOwnPropertyDescriptor(value, key);
        return descriptor !== undefined && descriptor.enumerable && 'value' in descriptor;
      })
    );
  } catch {
    return false;
  }
}

export function hasOnlyPlainDataProperties(value: object): boolean {
  try {
    return Reflect.ownKeys(value).every((key) => {
      if (typeof key !== 'string') return false;
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      return descriptor !== undefined && descriptor.enumerable && 'value' in descriptor;
    });
  } catch {
    return false;
  }
}

function compareValues(
  left: unknown,
  right: unknown,
  leftStack: WeakSet<object>,
  rightStack: WeakSet<object>,
): boolean {
  if (
    typeof left === 'function' ||
    typeof right === 'function' ||
    typeof left === 'symbol' ||
    typeof right === 'symbol' ||
    typeof left === 'bigint' ||
    typeof right === 'bigint'
  ) {
    return false;
  }
  if (
    (typeof left === 'number' && !Number.isFinite(left)) ||
    (typeof right === 'number' && !Number.isFinite(right))
  ) {
    return false;
  }
  if (Object.is(left, right) && (left === null || typeof left !== 'object')) return true;
  if (left === null || right === null || typeof left !== 'object' || typeof right !== 'object') {
    return false;
  }
  if (leftStack.has(left) || rightStack.has(right)) return false;
  leftStack.add(left);
  rightStack.add(right);
  if (Array.isArray(left) || Array.isArray(right)) {
    let result =
      Array.isArray(left) &&
      Array.isArray(right) &&
      left.length === right.length &&
      hasDensePlainArrayShape(left) &&
      hasDensePlainArrayShape(right);
    if (result && Array.isArray(left) && Array.isArray(right)) {
      for (let index = 0; index < left.length; index += 1) {
        if (!compareValues(left[index], right[index], leftStack, rightStack)) {
          result = false;
          break;
        }
      }
    }
    leftStack.delete(left);
    rightStack.delete(right);
    return result;
  }
  if (!isPlainDataRecord(left) || !isPlainDataRecord(right)) return false;
  const leftKeys = Reflect.ownKeys(left);
  const rightKeys = Reflect.ownKeys(right);
  if (
    leftKeys.length !== rightKeys.length ||
    leftKeys.some((key) => !rightKeys.some((candidate) => Object.is(candidate, key)))
  ) {
    return false;
  }
  const result = leftKeys.every((key) => {
    const leftDescriptor = Object.getOwnPropertyDescriptor(left, key);
    const rightDescriptor = Object.getOwnPropertyDescriptor(right, key);
    return (
      typeof key === 'string' &&
      leftDescriptor !== undefined &&
      rightDescriptor !== undefined &&
      leftDescriptor.enumerable &&
      rightDescriptor.enumerable &&
      'value' in leftDescriptor &&
      'value' in rightDescriptor &&
      compareValues(leftDescriptor.value, rightDescriptor.value, leftStack, rightStack)
    );
  });
  leftStack.delete(left);
  rightStack.delete(right);
  return result;
}

export function isExactPlainDataEqual(left: unknown, right: unknown): boolean {
  try {
    return compareValues(left, right, new WeakSet<object>(), new WeakSet<object>());
  } catch {
    return false;
  }
}
