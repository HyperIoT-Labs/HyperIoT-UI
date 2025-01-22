import { Component, EventEmitter, Input, OnInit, Output, ViewEncapsulation } from '@angular/core';
import { FileHandlerService, HPacketField, HProjectService } from 'core';
import { Observable, Subject } from 'rxjs';
import { SelectOption } from '../hyt-select/hyt-select.component';
import * as moment_ from 'moment';
const moment = moment_;

export type TableRowIndexes = [number, number];

export interface LazyTableHeader {
  value: string;
  type?: HPacketField.TypeEnum;
  label?: string;
}

enum TableStatus {
  NoData = -1,
  LoadingData = 0,
  ShowData = 1
}

@Component({
  selector: 'hyt-lazy-pagination-table',
  templateUrl: './hyt-lazy-pagination-table.component.html',
  styleUrls: ['./hyt-lazy-pagination-table.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class HytLazyPaginationTableComponent implements OnInit {

  tableStatus: TableStatus = TableStatus.NoData;

  @Input()
  dataSource: Observable<any[]>;

  @Input()
  headers: LazyTableHeader[] = [];

  math = Math;

  pageData: any[] = [];
  allData: any[] = [];

  rowPerPageSelection: SelectOption[] = [
    { label: '5', value: 5 },
    { label: '10', value: 10 },
    { label: '20', value: 20 },
    { label: '50', value: 50 }
  ];

  rowPerPage = 10;

  selectedPage = 0;

  actualRowsIndexes: TableRowIndexes = [0, 0];

  constructor(
    private hProjectsService: HProjectService,
    private fileHandlerService: FileHandlerService,
  ) { }

  ngOnInit(): void {
    this.resetTable();
    this.dataSource.subscribe(
      r => {
        this.allData = r.concat(this.allData);
        this.pageData = this.allData.slice(this.actualRowsIndexes[0], this.actualRowsIndexes[1]);
        this.tableStatus = TableStatus.ShowData;
      }
    );
  }

  resetTable() {
    this.allData = [];
    this.updatePageData(0);
  }

  onRowPerPageChanged(event) {
    this.rowPerPage = event.value;
    this.updatePageData(0);
  }

  retrieveFile(queryData) {
    return this.hProjectsService.scanHProject(
      queryData.projectId,
      queryData.packetId,
      queryData.fieldId,
      queryData.timestamp,
      queryData.timestamp +1
    );
  }

  openFile(queryData) {
    if (!queryData.projectId || !queryData.packetId || !queryData.fieldId || !queryData.timestamp) {
      return;
    }
    // open popup before file download to prevent blocked popup
    const fileWindow = window.open('', '_blank');
    this.retrieveFile(queryData).subscribe(
      res => this.fileHandlerService.openFile(res, queryData.mimeType, fileWindow)
    );
  }

  downloadFile(queryData) {
    if (!queryData.projectId || !queryData.packetId || !queryData.fieldId || !queryData.timestamp) {
      return;
    }
    this.retrieveFile(queryData).subscribe(
      res => this.fileHandlerService.downloadFile(res, moment(queryData.timestamp).format('YYYY-MM-DD HH:mm:ss'), queryData.mimeType)
    );
  }

  updatePageData(asd: number) {
    this.selectedPage = asd;

    const dataIndexes: [number, number] = [
      this.selectedPage * this.rowPerPage,
      (this.selectedPage + 1) * this.rowPerPage // < this.totalRows ? (this.selectedPage + 1) * this.rowPerPage : this.totalRows
    ];
    this.actualRowsIndexes = dataIndexes;
    if (this.allData.length !== 0) {
      this.pageData = this.allData.slice(this.actualRowsIndexes[0], this.actualRowsIndexes[1]);
    } else {
      this.tableStatus = TableStatus.NoData;
    }
  }

 //  this.tableSourceStream.next(this.allData.slice(rowsIndexes[0], rowsIndexes[1]));

  // resetTable(numRow: number, resetPage: boolean) {
  //   this.totalRows = +numRow;
  //   this.updatePageData(resetPage ? 0 : null);
  // }

}
