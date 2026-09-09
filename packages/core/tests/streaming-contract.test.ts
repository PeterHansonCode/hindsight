import assert from 'node:assert/strict';
import test from 'node:test';
import type { ParserInput, PlatformParser, ParserEmission } from '../src/domain.ts';
import { createInputReader } from '../src/input.ts';

test('optional iterator contract permits lazy consumption and early resource cleanup', async () => {
  let advanced = 0;
  let closed = false;
  const input: ParserInput = {
    async readJson() { throw new Error('Whole-file fallback must not run.'); },
    async *iterateJsonRecords(_file, options) {
      assert.deepEqual(options.recordPath, []);
      try {
        for (let row = 1; row <= 3; row++) {
          advanced++;
          yield { status: 'record', row, value: { synthetic: row } };
        }
        yield { status: 'end', recordCount: 3 };
      } finally { closed = true; }
    },
  };
  const records = input.iterateJsonRecords!('synthetic.json', { recordPath: [], maxRecordBytes: 1024, maxTotalBytes: 300 * 1024 * 1024 });
  assert.equal(advanced, 0);
  for await (const record of records) {
    assert.equal(record.status, 'record');
    break;
  }
  assert.equal(advanced, 1);
  assert.equal(closed, true);
});

test('incremental-only adapters satisfy the contract without an array-returning parse', async () => {
  const adapter: PlatformParser = {
    platform: 'youtube', version: 'synthetic-contract-only', sourceFiles: ['synthetic.json'],
    async *parseIncrementally(): AsyncIterable<ParserEmission> {
      yield { type: 'complete', status: 'empty' };
    },
  };
  assert.equal(adapter.parse, undefined);
  const emissions: ParserEmission[] = [];
  for await (const emission of adapter.parseIncrementally!({ async readJson() { return { status: 'missing', code: 'missing_file' }; } })) emissions.push(emission);
  assert.deepEqual(emissions, [{ type: 'complete', status: 'empty' }]);
});

test('current filesystem reader does not advertise unimplemented streaming', () => {
  assert.equal(createInputReader('.', []).iterateJsonRecords, undefined);
});
