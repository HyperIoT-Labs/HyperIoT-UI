import { Component, Input, Output, EventEmitter } from "@angular/core";
import { HytAlarm, Logger, LoggerService } from "core";
import * as moment_ from 'moment';
import { HytBadgeSize } from "projects/components/src/lib/hyt-badge/hyt-badge.component";
const moment = moment_;

export enum AlarmBtnClicked {
  UPDATE= "update",
  DOCS= "docs",
  GOTO= "goto",
}

@Component({
  selector: "hyt-alarm2",
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
    [0, 'Low'],
    [1, 'Medium'],
    [2, 'High'],
    [3, 'Critical'],
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


  constructor(loggerService: LoggerService) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("HytAlarmComponent");
    moment.locale("it");
  }

  /**
   * Emit the event that the primary button has been clicked.
   * @public
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
   * Get the emitter of the alarm
   */
  get emitter(){
    return this.alarm.event.deviceName;
  }
  
  get alarmStatus(){
    return this.alarm.event.alarmState == "UP" ? $localize`:@@HYT_alarm_status_inactive:Active` : $localize`:@@HYT_ai_user_label:Inactive`;
  }

  get alarmSeverityLabel(){
    return this.severityLabel.has(this.alarm.event.severity) ? this.severityLabel.get(this.alarm.event.severity) : "None";
  }
  /**
   * Enable documentation button, setted to false cuz not implemented atm
   */
  get isDocumentationAvaible(){
    return false;
  }

  get footerBadgeSize(){
    return HytBadgeSize
  }

  get timeFromNow(){
    return moment(this.alarm.event.fireTimestamp).fromNow();
  }
}