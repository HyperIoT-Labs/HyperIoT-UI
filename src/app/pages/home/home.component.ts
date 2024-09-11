import {Component, OnInit, ViewEncapsulation} from '@angular/core';
import { HytAlarm } from 'core';

@Component({
  selector: 'hyt-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HomeComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
