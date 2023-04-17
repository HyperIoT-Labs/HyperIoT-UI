import { Injectable } from '@angular/core';
import * as moment_ from 'moment';

const moment = moment_;

@Injectable({
  providedIn: 'root'
})
export class DateFormatterService {

  public formatDate(date: Date | number): string {
    return this.formatTimestamp(new Date(date).getTime());
  }

  public formatTimestamp(timestamp: number): string {
    return moment(timestamp).format("L") + " " + moment(timestamp).format("LTS");
  }

}
