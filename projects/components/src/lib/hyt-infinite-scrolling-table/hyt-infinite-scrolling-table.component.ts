import {
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
  OnInit,
  Component,
  ViewEncapsulation,
} from '@angular/core';
import { FileHandlerService, HPacketField, HprojectsService } from 'core';
import { Subject } from 'rxjs';
import * as moment_ from 'moment';
const moment = moment_;

export interface TableHeader {
  value: string;
  type?: HPacketField.TypeEnum;
  label?: string;
}

enum TableStatus {
  Error = -2,
  NoData = -1,
  LoadingChunkData = 0,
  ShowData = 1,
  DataEnd = 2,
  LimitReached = 3
}

@Component({
  selector: 'hyt-infinite-scrolling-table',
  templateUrl: './hyt-infinite-scrolling-table.component.html',
  styleUrls: ['./hyt-infinite-scrolling-table.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class HytInfiniteScrollingTableComponent implements OnInit {

  tableStatus: TableStatus = TableStatus.NoData;

  @Input()
  dataSource: Subject<any[]>;

  @Input()
  headers: TableHeader[] = [];

  @Input()
  dataLimit = 0;

  tableData = [];
  startToLoadData = 200;
  totalRows = 0;
  chunk = 0;

  @ViewChild('tableContainer') private tableContainer: ElementRef;

  @Output()
  dataRequest: EventEmitter<any> = new EventEmitter<any>();

  constructor(
    private hProjectsService: HprojectsService,
    private fileHandlerService: FileHandlerService,
  ) { }

  ngOnInit(): void {
    this.dataSource.subscribe((data) => {

      this.tableData = this.tableData.concat(data);
      this.tableStatus = TableStatus.ShowData;

      if(this.tableData.length >= this.dataLimit) {
        this.tableData = this.tableData.slice(0, this.dataLimit);
        this.tableStatus = TableStatus.LimitReached;
      }
      if(this.tableData.length >= this.totalRows) {
        this.tableData = this.tableData.slice(0, this.totalRows);
        this.tableStatus = TableStatus.DataEnd;
      }

    }, err => {
        this.tableStatus = TableStatus.Error;
    });
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

  updateData() {
    if (this.totalRows === 0) {
      this.tableStatus = TableStatus.NoData;
      return;
    }
    if(this.tableData.length > this.totalRows) {

    }
    this.tableStatus = TableStatus.LoadingChunkData;
    this.dataRequest.emit(this.chunk);
    this.chunk++;
  }

  resetTable(numRow: number) {
    this.tableData = [];
    this.totalRows = +numRow;
    this.chunk = 0;
    this.updateData();
  }

  onScroll() {
    if (this.tableStatus !== TableStatus.ShowData) {
      return;
    }
    const offsetHeight = this.tableContainer.nativeElement.offsetHeight;
    const scrollTop = this.tableContainer.nativeElement.scrollTop;
    const scrollHeight = this.tableContainer.nativeElement.scrollHeight;

    const scrollToBottom = scrollHeight - scrollTop - offsetHeight;

    if (scrollToBottom < this.startToLoadData) {
      this.updateData();
    }
  }

  getTdStyleClassByHeader(headers: TableHeader[]): string{
    const percent = 100 / headers.length;
    const cssPercent = `${percent.toFixed(3).slice(0,-1)}%`;
    return cssPercent;
  }

}
