import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';

export class SummaryList {
  title: string;
  list: { name: string, description: string, item: any }[];
}

@Component({
  selector: 'hyt-generic-summary-list',
  templateUrl: './generic-summary-list.component.html',
  styleUrls: ['./generic-summary-list.component.scss']
})
export class GenericSummaryListComponent {
  @Output() itemClick = new EventEmitter<any>();

  _summaryList: SummaryList;
  @Input()
  set summaryList(summary: SummaryList) {
    this._summaryList = summary;
  }

  constructor(
  ) { }

  onItemClick(item: any) {
    this.itemClick.emit(item);
  }
}
