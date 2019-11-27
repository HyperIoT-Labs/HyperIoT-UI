import { Component, Input, Output, EventEmitter, ViewEncapsulation } from '@angular/core';
import { SelectableText } from '../selectableText';

@Component({
  selector: 'hyt-selectable-text',
  templateUrl: './selectable-text.component.html',
  styleUrls: ['./selectable-text.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SelectableTextComponent {

  @Input() placeHolders: SelectableText[] = [];

  @Output() clicked: EventEmitter<string> = new EventEmitter<string>();

  constructor() { }

  emitText(value) {
    this.clicked.emit(value);
  }

}
