import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'hyperiot-select-field',
  templateUrl: './select-field.component.html',
  styleUrls: ['./select-field.component.scss']
})
export class SelectFieldComponent implements OnInit {
  @Input() fields: string[];
  @Output() clickFn: EventEmitter<string> = new EventEmitter<string>();
  @Output() closeFn: EventEmitter<boolean> = new EventEmitter<boolean>();
  currentElement = '';

  constructor() { }

  ngOnInit(): void {
  }

  selectElement(ev: any) {
    this.currentElement = ev;
  }

  clickCallback() {
    this.clickFn.emit(this.currentElement);
  }

  closeCallback() {
    this.closeFn.emit(true);
  }
}
