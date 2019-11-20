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

  onEditOptionClick(itemT: SummaryListItem) {
    this.menuAction.emit({
      action: 'edit',
      item: itemT
    });
  }

  onDuplicateOptionClick(itemT: SummaryListItem) {
    this.menuAction.emit({
      action: 'duplicate',
      item: itemT
    });
  }

  onDeleteOptionClick(itemT: SummaryListItem) {
    this.menuAction.emit({
      action: 'delete',
      item: itemT
    });
  }

}
