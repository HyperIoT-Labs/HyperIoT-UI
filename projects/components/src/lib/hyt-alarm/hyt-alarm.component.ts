import { Component, Input, Output, EventEmitter, Inject, LOCALE_ID, ChangeDetectorRef, OnInit, AfterViewChecked } from "@angular/core";
import { HytAlarm, Logger, LoggerService } from "core";
import * as moment_ from 'moment';
const moment = moment_;

export enum AlarmBtnClicked {
  UPDATE= "update",
  DOCS= "docs",
  GOTO= "goto",
}

@Component({
  selector: "hyt-alarm",
  templateUrl: "./hyt-alarm.component.html",
  styleUrls: ["./hyt-alarm.component.scss"],
})
export class HytAlarmComponent {
  btnClicked = AlarmBtnClicked;
  private logger: Logger;
  /**
   * map for retrieve label using value of severity
   */
  private severityLabel = new Map<number, string>([
    [0, $localize`:@@HYT_alarm_low_sev:Low`],
    [1, $localize`:@@HYT_alarm_medium_sev:Medium`],
    [2, $localize`:@@HYT_alarm_high_sev:High`],
    [3, $localize`:@@HYT_alarm_critical_sev:Critical`],
  ]);
  /**
   * @property {HytAlarm.LiveAlarm} alarm - alarm to display
   */
  @Input() alarm: HytAlarm.LiveAlarm;
  /**
   * @property {string} dateFormat - format of the date to display
   */
  @Input() dateFormat: string = "DD/MM/YYYY HH:mm:ss.SSS";
  /**
   * @property {EventEmitter<HytAlarmComponent>} btnClick - Emit when the primary button is clicked if valRouterLink is not passed
   */
  @Output() btnClick = new EventEmitter<HytAlarm.LiveAlarm>();


  constructor(loggerService: LoggerService, @Inject(LOCALE_ID) private locale: string, private cdr: ChangeDetectorRef) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("HytAlarmComponent");
    /** Using setTimeout for avoid the ExpressionChangedAfterItHasBeenCheckedError */
    setTimeout(()=>{
      moment.locale(this.locale || 'en');
      this.cdr.detectChanges();
    }, 0)
  }

  /**
   * Emit the event that a button has been clicked
   */
  onClick(btnType: AlarmBtnClicked) {
    this.logger.debug(
      "Primary button clicked, value emitted",
      this.alarm
    );
    this.btnClick.emit(this.alarm);
  }
  /**
   * Get the date when the alarm is fired
   */
  get date(){
    return moment(this.alarm.event.fireTimestamp).format(this.dateFormat)
  }

  /**
   * Print text description of the status of the alarm
   */
  get alarmStatus(){
    return this.alarm.event.alarmState == "UP" ? $localize`:@@HYT_alarm_status_active:Active` : $localize`:@@HYT_ai_user_label:Inactive`;
  }
  /**
   * Return text description of the severity of the alarm
   */
  get alarmSeverityLabel(){
    return this.severityLabel.has(this.alarm.event.severity) ? this.severityLabel.get(this.alarm.event.severity) : "None";
  }
  /**
   * Enable documentation button, setted to false cuz not implemented atm
   */
  get isDocumentationAvaible(){
    return false;
  }
  /**
   * Display description when the alarm was fired(es: two minutes ago)
   */
  get timeFromNow(){
    return moment(this.alarm.event.fireTimestamp).fromNow();
  }
}