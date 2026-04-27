import { describe, expect, it } from 'vitest';
import { parseCsvRows } from '../../src/shared/utils/csv-loader';

describe('csv-loader parseCsvRows', () => {
  it('parses semicolon-separated CSV with headers', () => {
    const rows = parseCsvRows<{ id: string; name: string }>('id;name\n1;Alice\n2;Bob');

    expect(rows).toEqual([
      { id: '1', name: 'Alice' },
      { id: '2', name: 'Bob' },
    ]);
  });

  it('handles BOM and trims values', () => {
    const input = '\uFEFFid;name\n 1 ; Alice \n';
    const rows = parseCsvRows<{ id: string; name: string }>(input);

    expect(rows).toEqual([{ id: '1', name: 'Alice' }]);
  });

  it('supports delimiter override', () => {
    const rows = parseCsvRows<{ id: string; name: string }>('id,name\n1,Alice', {
      delimiter: ',',
    });

    expect(rows).toEqual([{ id: '1', name: 'Alice' }]);
  });
});
