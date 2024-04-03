import { Component, EventEmitter, Input, OnChanges, OnInit, Output, HostListener, ElementRef } from '@angular/core';
import * as moment_ from 'moment';
import { CalendarContextData, HytDatePickerService } from '../services/hyt-date-picker.service';

export type TimeStep = 'year' | 'month' | 'day' | 'hour' | 'minute' | 'second' | 'millisecond';
const moment = moment_;

interface CalElement {
  action: () => void;
  label: string;
  selectable?: boolean;
  class?: string;
  colspan?: string;
}

interface CalendarRow {
  elements: CalElement[];
  class?: string;
}

interface CalendarContext {
  headRows: CalendarRow[];
  bodyRows: CalendarRow[];
  class?: string;
}

@Component({
  selector: 'hyt-picker-pop-up',
  templateUrl: './picker-pop-up.component.html',
  styleUrls: ['./picker-pop-up.component.css']
})
export class PickerPopUpComponent implements OnInit, OnChanges {

  model: CalendarContext;

  @Input()
  dateInput: moment_.Moment;

  @Input()
  lowView: TimeStep = 'second';

  @Input()
  show = false;

  @Input()
  languageCode: string;

  @Output()
  dateOutput: EventEmitter<moment_.Moment> = new EventEmitter<moment_.Moment>();

  @Output()
  popUpEvent: EventEmitter<boolean> = new EventEmitter<boolean>();

  colspanMap = {
    'year': '2',
    'month': '2',
    'day': '5',
    'hour': '2',
    'minute': '4',
    'second': '4',
    'millisecond': '4'
  }
  
  /**
   * On document click if the clicked element is neither the picker nor the button set picker component to show=false
   * @param event
   */
  @HostListener('document:click', ['$event'])
  clickout(event) {
    const btn = document.getElementById('hyt-date-picker-button')
    if (event.target.parentElement?.contains(this.eRef.nativeElement) || event.target.parentElement?.contains(btn)) {
      this.show = false;
      this.popUpEvent.emit(this.show);
    }
  }

  constructor(
    private calendarService: HytDatePickerService,
    private eRef: ElementRef
  ) { }

  ngOnInit() {
    moment.locale(this.languageCode)
  }

  ngOnChanges() {
    this.buildModel('year', moment(new Date()).startOf('year'));
  }

  public buildModel(step: any, mom: moment_.Moment): void {

    const calendarContextData: CalendarContextData = this.calendarService.getContextDataByStep(step);
    mom.startOf(calendarContextData.toPrevious);

    const hRows: CalendarRow[] = [];
    const defHeader: CalElement[] = [];
    defHeader.push({
      label: '<',
      action: () => this.buildModel(step, calendarContextData.subtract(mom))
    });
    defHeader.push({
      label: calendarContextData.headerFormat(mom),
      action: () =>
        (step === 'year') ?
          {} :
          this.buildModel(calendarContextData.toPrevious, moment(mom).startOf(calendarContextData.toPrevious)),
      colspan: this.colspanMap[step]
    });
    defHeader.push({
      label: '>',
      action: () => this.buildModel(step, calendarContextData.add(mom))
    });
    hRows.push({ elements: defHeader });
    if (step === 'day') {
      hRows.push({ elements: [] });
      for (let i = 0; i < 7; i++) {
        hRows[1].elements.push({
          label: mom.clone().day(i).format('ddd'),
          action: () => { },
          class: 'h-row-day'
        });
      }
    }

    const bRows: CalendarRow[] = [];
    let dayOneChecked = false;
    for (let i = 0; i < calendarContextData.brows; i++) {
      bRows.push({ elements: [] });
      for (let k = 0; k < calendarContextData.bcols; k++) {
        let isOtherMonth = false;
        if (step === "day") {
          const day = mom.clone().set(step, calendarContextData.bcols * i + k + ((step === 'year') ? this.getYearStart(mom) : 0)).format(calendarContextData.elementFormat);
          const numberDay = new Number(day).valueOf();
          if (numberDay == 1) {
            dayOneChecked = !dayOneChecked;
          }
          isOtherMonth = (!dayOneChecked) ? true : false;
        }
        bRows[i].elements.push({
          action: () => (step !== this.lowView) ? this.buildModel(
            calendarContextData.toNext,
            mom.clone().set(step, calendarContextData.bcols * i + k + ((step === 'year') ? this.getYearStart(mom) : 0))
          ) : this.emitValue(mom.clone().set(step, calendarContextData.bcols * i + k + ((step === 'year') ? this.getYearStart(mom) : 0))),
          label: mom.clone().set(
            step,
            calendarContextData.bcols * i + k + ((step === 'year') ? this.getYearStart(mom) : 0)
          ).format(calendarContextData.elementFormat),
          selectable: !isOtherMonth,
          class: `b-row-${step}${(isOtherMonth) ? ' disabled' : ''}`
        });
      }
    }

    this.model = {
      headRows: hRows,
      bodyRows: bRows
    };

  }

  getYearStart(m) {
    const mom = m.clone();
    while (mom.year() % 10 !== 0) {
      mom.year(mom.year() - 1);
    }
    return mom.clone().subtract(1, 'year').year();
  }

  emitValue(output) {
    this.dateOutput.emit(output);
    // TODO update visible in hyt-date-picker
    this.show = false;
  }

}
