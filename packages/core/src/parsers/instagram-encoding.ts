const strictUtf8 = new TextDecoder('utf-8', { fatal: true, ignoreBOM: true });

export function repairInstagramString(value: string): { value: string; unexpected: boolean } {
  // Buffer's Latin-1 conversion truncates code units above 255; its ordinary
  // UTF-8 decoder silently replaces invalid sequences. Check both boundaries.
  if ([...value].some(character => character.codePointAt(0)! > 255)) {
    return { value, unexpected: true };
  }
  try {
    return { value: strictUtf8.decode(Buffer.from(value, 'latin1')), unexpected: false };
  } catch {
    return { value, unexpected: true };
  }
}

export function repairInstagramValues(value: unknown): { value: unknown; unexpected: boolean } {
  let unexpected = false;
  function visit(current: unknown, depth: number): unknown {
    if (depth > 64) throw new Error('Structure exceeds depth limit.');
    if (typeof current === 'string') {
      const repaired = repairInstagramString(current);
      unexpected ||= repaired.unexpected;
      return repaired.value;
    }
    if (Array.isArray(current)) return current.map(child => visit(child, depth + 1));
    if (current !== null && typeof current === 'object') {
      // fromEntries creates own data properties: a __proto__ JSON key does not
      // change the resulting object's prototype. Schema keys are not values.
      return Object.fromEntries(Object.entries(current).map(([key, child]) => [key, visit(child, depth + 1)]));
    }
    return current;
  }
  return { value: visit(value, 0), unexpected };
}
