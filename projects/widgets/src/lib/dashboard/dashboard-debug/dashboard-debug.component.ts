import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'hyperiot-dashboard-debug',
  templateUrl: './dashboard-debug.component.html',
  styleUrls: ['./dashboard-debug.component.css']
})
export class DashboardDebugComponent implements OnInit {

  @Input() data: any[] = [];
  itemSelected = -1;

  constructor() { }

  ngOnInit(): void {
  }

  getType(element: any): string {
    return typeof(element);
  }

  toggleItem(idx: number) {
    if (this.itemSelected === idx) {
      this.itemSelected = -1;
    } else {
      this.itemSelected = idx;
    }
  }
}
