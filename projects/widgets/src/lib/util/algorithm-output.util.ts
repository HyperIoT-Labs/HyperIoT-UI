/**
 * Utilities to parse the outputs of statistics (HProjectAlgorithm) returned by the BE.
 *
 * Response format:
 * {
 *   rows: {
 *     "<rowKey>": { value: { output: "<json string>", timestamp: "<epoch seconds>" } },
 *     ...
 *   }
 * }
 *
 * where each row is a single execution and its output json contains the list of results:
 * { results: [{ grouping: {...}, output: number, outputArray?: {...} }], headers?: string[], customSchema?: boolean }
 */

export interface AlgorithmOutputColumn {
  value: string;
  label: string;
}

export interface AlgorithmResultRow {
  /** formatted values, same order of groupingColumns */
  grouping: string[];
  /** formatted values, same order of outputColumns */
  outputs: string[];
}

export interface AlgorithmResultTable {
  groupingColumns: AlgorithmOutputColumn[];
  outputColumns: AlgorithmOutputColumn[];
  rows: AlgorithmResultRow[];
}

export interface AlgorithmExecutionOutput {
  results: any[];
  headers?: string[];
  customSchema?: boolean;
}

export interface AlgorithmExecution {
  rowKey: string;
  /** epoch millis */
  timestamp: number;
  output: AlgorithmExecutionOutput;
}

const EMPTY_VALUE = '-';

/**
 * Returns the executions contained in the response, sorted by timestamp (oldest first).
 * The order of the keys in res.rows is not reliable.
 */
export function parseAlgorithmExecutions(res: any): AlgorithmExecution[] {
  const rows = res?.rows || {};
  return Object.keys(rows)
    .map(rowKey => {
      const value = rows[rowKey]?.value || {};
      return {
        rowKey,
        timestamp: +value.timestamp * 1000,
        output: parseOutput(value.output),
      };
    })
    .sort((a, b) => a.timestamp - b.timestamp);
}

function parseOutput(output: string): AlgorithmExecutionOutput {
  try {
    const parsed = JSON.parse(output);
    return { ...parsed, results: Array.isArray(parsed?.results) ? parsed.results : [] };
  } catch {
    return { results: [] };
  }
}

/**
 * Returns the ids of the packet fields used as grouping keys (only for executions without custom schema).
 * These ids must be resolved to field names with HPacketService.getHPacketField.
 */
export function getGroupingFieldIds(executions: AlgorithmExecution[]): number[] {
  const ids = new Set<number>();
  executions
    .filter(execution => !execution.output.customSchema)
    .forEach(execution => execution.output.results.forEach(result =>
      Object.keys(result?.grouping || {}).forEach(key => ids.add(Number(key)))
    ));
  return [...ids].filter(id => !isNaN(id));
}

/**
 * Builds the table of the results of a single execution
 * @param output parsed output of the execution
 * @param configOutputColumns output fields selected in widget configuration
 * @param groupingFieldNames packet field names by id, used to label grouping columns without custom schema
 */
export function buildAlgorithmResultTable(
  output: AlgorithmExecutionOutput,
  configOutputColumns: AlgorithmOutputColumn[],
  groupingFieldNames: Map<number, string>
): AlgorithmResultTable {
  const results = output.results;

  // grouping columns: custom headers or packet fields ids
  const groupingKeys: string[] = output.customSchema
    ? (output.headers || [])
    : Object.keys(results[0]?.grouping || {});
  const groupingColumns = groupingKeys.map(key => ({
    value: key,
    label: output.customSchema ? key : (groupingFieldNames.get(Number(key)) || key),
  }));

  // output columns: outputArray keys replace configured output fields
  const outputArrayKeys = new Set<string>();
  results.forEach(result => Object.keys(result?.outputArray || {}).forEach(key => outputArrayKeys.add(key)));
  const outputColumns = outputArrayKeys.size > 0
    ? [...outputArrayKeys].map(key => ({ value: key, label: key }))
    : (configOutputColumns.length > 0 ? configOutputColumns : [{ value: 'output', label: 'output' }]);

  const rows = results.map(result => {
    // with custom schema grouping values have the same order of headers
    const groupingValues = output.customSchema
      ? Object.values(result?.grouping || {})
      : groupingKeys.map(key => result?.grouping?.[key]);
    const outputValues = outputColumns.map(column => {
      if (outputArrayKeys.size > 0) {
        return result?.outputArray?.[column.value];
      }
      // single output field: value is always in result.output
      return result?.[column.value] ?? (outputColumns.length === 1 ? result?.output : undefined);
    });
    return {
      grouping: groupingKeys.map((_, index) => formatValue(groupingValues[index])),
      outputs: outputValues.map(formatValue),
    };
  });

  return { groupingColumns, outputColumns, rows };
}

function formatValue(value: any): string {
  if (value === null || value === undefined || value === '') {
    return EMPTY_VALUE;
  }
  return typeof value === 'object' ? JSON.stringify(value) : String(value);
}
