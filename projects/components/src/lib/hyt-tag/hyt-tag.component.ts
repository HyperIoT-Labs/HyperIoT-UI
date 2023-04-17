import { Component, OnInit, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'hyt-tag',
  templateUrl: './hyt-tag.component.html',
  styleUrls: ['./hyt-tag.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HytTagComponent implements OnInit {

  @Input() color: string;
  @Input() textColor: string;

  isSelected: boolean;
  @Input()
  get selected(): boolean {
    return this.isSelected;
  }
  set selected(s: boolean) {
    this.isSelected = s;
  }

  @Input() selectable: boolean;

  isDisabled: boolean;
  @Input()
  get disabled(): boolean {
    return this.isDisabled;
  }
  set disabled(d: boolean) {
    this.isDisabled = d;
  }

  @Input() editable: boolean;

  @Input() removable: boolean;

  @Input()
  value: any;

  @Output() edited: EventEmitter<any> = new EventEmitter();

  @Output() removed: EventEmitter<any> = new EventEmitter();

  @Output() clickFn: EventEmitter<any> = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  click(event: any) {
    this.clickFn.emit(event);
  }

  editedFn(event: any) {
    this.edited.emit(event);
  }

  removedFn(event: any) {
    this.removed.emit(event);
  }

}
