import { Injectable } from '@angular/core';
import * as moment_ from 'moment';
const moment = moment_;

export interface CalendarContextData {
  headerFormat: (m: moment_.Moment) => string;
  subtract: (m: moment_.Moment) => moment_.Moment;
  add: (m: moment_.Moment) => moment_.Moment;
  toPrevious: any;
  toNext: any;
  elementFormat: string;
  brows: number;
  bcols: number;
}

@Injectable({
  providedIn: 'root'
})
export class HytDatePickerService {

  year: CalendarContextData = {
    headerFormat: m => {
      const mom = m.clone();
      while (mom.year() % 10 !== 0) {
        mom.year(mom.year() - 1);
      }
      return mom.format('YYYY') + '-' + mom.add(9, 'year').format('YYYY');
    },
    subtract: m => moment(m).subtract(10, 'year'),
    add: m => moment(m).add(10, 'year'),
    toPrevious: 'null',
    toNext: 'month',
    elementFormat: 'YYYY',
    brows: 3,
    bcols: 4
  };

  month: CalendarContextData = {
    headerFormat: mom => mom.format('YYYY'),
    subtract: m => moment(m).subtract(1, 'year'),
    add: m => moment(m).add(1, 'year'),
    toPrevious: 'year',
    toNext: 'day',
    elementFormat: 'MMMM',
    brows: 3,
    bcols: 4
  };

  day: CalendarContextData = {
    headerFormat: mom => mom.format('MM/YYYY'),
    subtract: m => moment(m).subtract(1, 'month'),
    add: m => moment(m).add(1, 'month'),
    toPrevious: 'month',
    toNext: 'hour',
    elementFormat: 'DD',
    brows: 6,
    bcols: 7
  };

  hour: CalendarContextData = {
    headerFormat: mom => mom.format('DD/MM/YYYY'),
    subtract: m => moment(m).subtract(1, 'day'),
    add: m => moment(m).add(1, 'day'),
    toPrevious: 'day',
    toNext: 'minute',
    elementFormat: 'HH:mm',
    brows: 6,
    bcols: 4
  };

  minute: CalendarContextData = {
    headerFormat: mom => mom.format('DD/MM/YYYY HH:mm:ss'),
    subtract: m => moment(m).subtract(1, 'hour'),
    add: m => moment(m).add(1, 'hour'),
    toPrevious: 'hour',
    toNext: 'second',
    elementFormat: 'HH:mm',
    brows: 10,
    bcols: 6
  };

  second: CalendarContextData = {
    headerFormat: mom => mom.format('DD/MM/YYYY HH:mm:ss'),
    subtract: m => moment(m).subtract(1, 'minute'),
    add: m => moment(m).add(1, 'minute'),
    toPrevious: 'minute',
    toNext: 'emit',
    elementFormat: 'HH:mm:ss',
    brows: 10,
    bcols: 6
  };

  constructor() { }

  getContextDataByStep(step: string): CalendarContextData {
    return (this[step]) ? this[step] : {};
  }
}
