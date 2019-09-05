import { Component, OnInit } from '@angular/core';
import { HYTError } from 'src/app/services/errorHandler/models/models';

@Component({
  selector: 'hyt-statistics-step',
  templateUrl: './statistics-step.component.html',
  styleUrls: ['./statistics-step.component.scss']
})
export class StatisticsStepComponent implements OnInit {

  errors: HYTError[] = [];

  constructor() { }

  ngOnInit() {
  }

  createStatistic() {

    this.errors = [];

  }

}
