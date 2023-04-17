import { Component, Input } from '@angular/core';

@Component({
  selector: 'hyt-modal-e',
  templateUrl: './hyt-modal-e.component.html',
  styleUrls: ['./hyt-modal-e.component.css']
})
export class HytModalEComponent {

  @Input() mOpen = false;

  constructor() { }

}
