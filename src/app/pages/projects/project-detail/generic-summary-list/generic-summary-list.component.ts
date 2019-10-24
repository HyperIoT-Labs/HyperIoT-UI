import { Component, Input, Output, EventEmitter } from '@angular/core';

export class SummaryList {
  title: string;
  list: SummaryListItem[];
}
export class SummaryListItem {
  index = 0;
  name: string;
  description: string;
  data: any;
}

@Component({
  selector: 'hyt-generic-summary-list',
  templateUrl: './generic-summary-list.component.html',
  styleUrls: ['./generic-summary-list.component.scss']
})
export class GenericSummaryListComponent {
  @Output() itemClick = new EventEmitter<SummaryListItem>();
  @Output() menuAction = new EventEmitter<{
    action: 'edit' | 'duplicate' | 'delete',
    item: any
  }>();

  _summaryList: SummaryList;
  @Input()
  set summaryList(summary: SummaryList) {
    this._summaryList = summary;
  }

  selectedItem: SummaryListItem;

  constructor(
  ) { }

  onItemClick(i: number, item: SummaryListItem) {
    //item.index = i;
    this.selectedItem = item;
    this.itemClick.emit(item);
  }

  onEditOptionClick() {
    this.menuAction.emit({
      action: 'edit',
      item: this.selectedItem
    });
  }

  onDuplicateOptionClick() {
    this.menuAction.emit({
      action: 'duplicate',
      item: this.selectedItem
    });
  }

  onDeleteOptionClick() {
    this.menuAction.emit({
      action: 'delete',
      item: this.selectedItem
    });
  }
}
