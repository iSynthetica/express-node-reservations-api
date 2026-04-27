import { createReadStream } from 'node:fs';
import path from 'node:path';
import { parse } from 'csv-parse';
import { parse as parseSync } from 'csv-parse/sync';

export type CsvRow = Record<string, string>;

export interface CsvLoadResult<T extends object> {
  rows: T[];
  missingFile: boolean;
  warning?: string;
}

interface CsvParseOptions {
  delimiter?: string;
}

const DEFAULT_DELIMITER = ';';

export function parseCsvRows<T extends object>(
  input: string | Buffer,
  options: CsvParseOptions = {},
): T[] {
  const content = typeof input === 'string' ? input : input.toString('utf-8');

  return parseSync<T>(content, {
    delimiter: options.delimiter ?? DEFAULT_DELIMITER,
    columns: true,
    skip_empty_lines: true,
    trim: true,
    bom: true,
  });
}

export function loadCsv<T extends object>(filePath: string): Promise<CsvLoadResult<T>> {
  return new Promise((resolve, reject) => {
    const rows: T[] = [];
    const absolutePath = path.resolve(filePath);

    const stream = createReadStream(absolutePath);

    stream.on('error', (err: NodeJS.ErrnoException) => {
      if (err.code === 'ENOENT') {
        resolve({
          rows: [],
          missingFile: true,
          warning: `CSV file not found: ${absolutePath}`,
        });
        return;
      }

      reject(err);
    });

    stream
      .pipe(
        parse({
          delimiter: DEFAULT_DELIMITER,
          columns: true,
          skip_empty_lines: true,
          trim: true,
          bom: true,
        }),
      )
      .on('data', (row: CsvRow) => {
        rows.push(row as T);
      })
      .on('end', () => {
        resolve({
          rows,
          missingFile: false,
        });
      })
      .on('error', (err: Error) => {
        reject(err);
      });
  });
}
