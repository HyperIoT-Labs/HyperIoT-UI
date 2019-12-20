import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hyt-timeline',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss']
})
export class TimelineComponent implements OnInit {

  startDate = new Date();
  stopDate = new Date();

  timeRange = [
    { label: 'Minutes', value: '60' },
    { label: 'Hours', value: '3600' },
    { label: 'Days', value: '86400' },
    { label: 'Months', value: '2592000‬' }
  ];

  constructor() { }

  ngOnInit() {
  }

}
