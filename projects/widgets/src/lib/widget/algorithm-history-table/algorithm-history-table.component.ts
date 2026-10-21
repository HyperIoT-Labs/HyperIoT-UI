import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { AlgorithmOfflineDataService, AlgorithmTimeRange, DateFormatterService, HPacketService, LoggerService } from 'core';
import { Subscription, lastValueFrom, skip } from 'rxjs';
import { BaseTableComponent } from '../../base/base-table/base-table.component';
import { WidgetAction } from '../../base/base-widget/model/widget.model';
import {
  AlgorithmExecution,
  AlgorithmOutputColumn,
  AlgorithmResultTable,
  buildAlgorithmResultTable,
  getGroupingFieldIds,
  parseAlgorithmExecutions,
} from '../../util/algorithm-output.util';

enum TableStatus {
  NoRange = 'noRange',
  Loading = 'loading',
  Ready = 'ready',
  Error = 'error',
}

interface ExecutionRow {
  rowKey: string;
  timestampLabel: string;
  table: AlgorithmResultTable;
  /** output shown in the collapsed row when the execution has a single result */
  summaryOutput: string;
  /** grouping shown in the collapsed row when the execution has a single result */
  summaryGrouping: string;
}

@Component({
  selector: 'hyperiot-algorithm-history-table',
  templateUrl: './algorithm-history-table.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './algorithm-history-table.component.css']
})
export class AlgorithmHistoryTableComponent extends BaseTableComponent implements OnInit, OnDestroy {

  readonly PAGE_SIZE = 10;

  readonly tableStatus = TableStatus;

  status: TableStatus = TableStatus.NoRange;

  hProjectAlgorithmId: number;

  executionRows: ExecutionRow[] = [];

  pageIndex = 0;

  expandedRows = new Set<string>();

  private groupingFieldNames = new Map<number, string>();

  private timeRangeSubscription: Subscription;

  private dataRequest: Subscription;

  constructor(
    private algorithmOfflineDataServices: AlgorithmOfflineDataService,
    injector: Injector,
    protected loggerService: LoggerService,
    private packetService: HPacketService,
    private dateFormatterService: DateFormatterService,
  ) {
    super(injector, loggerService);
  }

  get pageRows(): ExecutionRow[] {
    const start = this.pageIndex * this.PAGE_SIZE;
    return this.executionRows.slice(start, start + this.PAGE_SIZE);
  }

  get lastPageIndex(): number {
    return Math.max(Math.ceil(this.executionRows.length / this.PAGE_SIZE) - 1, 0);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.configure();
    // configure already loaded data with the current range
    this.timeRangeSubscription = this.algorithmOfflineDataServices.timeRange$
      .pipe(skip(1))
      .subscribe(range => this.loadData(range));
  }

  ngOnDestroy(): void {
    this.timeRangeSubscription?.unsubscribe();
    this.dataRequest?.unsubscribe();
    if (this.hProjectAlgorithmId) {
      this.algorithmOfflineDataServices.removeWidget(this.widget.id, this.hProjectAlgorithmId);
    }
    super.ngOnDestroy();
  }

  configure(): void {
    super.configure();

    if (
      !(
        this.widget.config != null &&
        this.widget.config.hProjectAlgorithmId != null &&
        this.widget.config.packetFields != null &&
        Object.keys(this.widget.config.packetFields).length > 0
      )
    ) {
      this.isConfigured = false;
      return;
    }

    this.isConfigured = true;

    if (this.hProjectAlgorithmId !== this.widget.config.hProjectAlgorithmId) {
      if (this.hProjectAlgorithmId) {
        this.algorithmOfflineDataServices.removeWidget(this.widget.id, this.hProjectAlgorithmId);
      }
      this.hProjectAlgorithmId = this.widget.config.hProjectAlgorithmId;
      this.algorithmOfflineDataServices.addWidget(this.widget.id, this.hProjectAlgorithmId);
    }

    this.loadData(this.algorithmOfflineDataServices.timeRange$.value);
  }

  onToolbarAction(action: string) {
    const widgetAction: WidgetAction = { widget: this.widget, action };
    this.widgetAction.emit(widgetAction);
  }

  toggleRow(row: ExecutionRow) {
    if (this.expandedRows.has(row.rowKey)) {
      this.expandedRows.delete(row.rowKey);
    } else {
      this.expandedRows.add(row.rowKey);
    }
  }

  changePage(pageIndex: number) {
    this.pageIndex = Math.min(Math.max(pageIndex, 0), this.lastPageIndex);
  }

  trackByRowKey(index: number, row: ExecutionRow) {
    return row.rowKey;
  }

  private loadData(range: AlgorithmTimeRange | null) {
    this.dataRequest?.unsubscribe();
    this.executionRows = [];
    this.expandedRows.clear();
    this.pageIndex = 0;

    if (!this.isConfigured) {
      return;
    }
    if (!range) {
      this.status = TableStatus.NoRange;
      return;
    }

    this.status = TableStatus.Loading;
    this.dataRequest = this.algorithmOfflineDataServices.getDataInRange(this.hProjectAlgorithmId, range).subscribe({
      next: async res => {
        try {
          const executions = parseAlgorithmExecutions(res);
          await this.loadGroupingFieldNames(executions);
          this.executionRows = executions.map(execution => this.toExecutionRow(execution));
          this.status = TableStatus.Ready;
        } catch (error) {
          this.logger.error('Error parsing statistics outputs', error);
          this.status = TableStatus.Error;
        }
      },
      error: error => {
        this.logger.error('Error loading statistics outputs', error);
        this.status = TableStatus.Error;
      }
    });
  }

  private async loadGroupingFieldNames(executions: AlgorithmExecution[]) {
    const missingIds = getGroupingFieldIds(executions).filter(id => !this.groupingFieldNames.has(id));
    if (missingIds.length === 0) {
      return;
    }
    try {
      const fields = await lastValueFrom(this.packetService.getHPacketField(missingIds));
      fields.forEach(field => this.groupingFieldNames.set(field.id, field.name));
    } catch (error) {
      // grouping columns fall back to field ids
      this.logger.error('Error loading grouping field names', error);
    }
  }

  private getConfigOutputColumns(): AlgorithmOutputColumn[] {
    const packetFields = this.widget.config.packetFields || {};
    const fieldAliases = this.widget.config.fieldAliases || {};
    return Object.keys(packetFields).map(fieldId => ({
      value: packetFields[fieldId],
      label: fieldAliases[fieldId] || packetFields[fieldId],
    }));
  }

  private toExecutionRow(execution: AlgorithmExecution): ExecutionRow {
    const table = buildAlgorithmResultTable(execution.output, this.getConfigOutputColumns(), this.groupingFieldNames);
    const singleResult = table.rows.length === 1 ? table.rows[0] : null;
    return {
      rowKey: execution.rowKey,
      timestampLabel: this.dateFormatterService.formatTimestamp(execution.timestamp),
      table,
      summaryOutput: singleResult
        ? (table.outputColumns.length === 1
          ? singleResult.outputs[0]
          : table.outputColumns.map((column, i) => `${column.label}: ${singleResult.outputs[i]}`).join(' · '))
        : '',
      summaryGrouping: singleResult
        ? table.groupingColumns.map((column, i) => `${column.label}: ${singleResult.grouping[i]}`).join(' · ')
        : '',
    };
  }

}
