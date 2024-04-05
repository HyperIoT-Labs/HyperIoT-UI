import { Component, Injector } from '@angular/core';
import { Logger, LoggerService, HytAlarm, AlarmWrapperService } from 'core';
import { BaseWidgetComponent } from '../../base/base-widget/base-widget.component';
import * as moment_ from 'moment';
const moment = moment_;

@Component({
  selector: 'hyperiot-alarms-widget',
  templateUrl: './alarms-widget.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './alarms-widget.component.css']
})
export class AlarmsWidgetComponent extends BaseWidgetComponent {
  protected logger: Logger;
  alarmsList: Map<number, HytAlarm.LiveAlarm> = new Map();
  constructor(injector: Injector, protected loggerService: LoggerService, private alarmWrapper: AlarmWrapperService) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(AlarmsWidgetComponent.name);
  }
  
  ngAfterViewInit() {
    this.configure();
  }

  configure() {
    this.isConfigured = true;

    this.alarmWrapper.alarmSubject
      .subscribe((alarm) => {
        this.logger.info("EMITTED ALARM ON DASHBOARD", alarm)
        //NOT FILTER FOR PROJECT, NEED TO CHANGE REALTIME DATA SERVICE
        this.alarmsList.set(alarm.event.alarmId, alarm);
        if(alarm.event.alarmState == "DOWN"){
          // ANIMATE ALARM USING ALARMSTATE AND AFTER D
          setTimeout(()=>{
            this.alarmsList.delete(alarm.event.alarmId);
          }, 1000)
        }
      })
  }

  get alarmListArray() : HytAlarm.LiveAlarm[]{
    return Array.from(this.alarmsList.values());
  }

  containerStyle(alarm: HytAlarm.LiveAlarm){
    if(alarm.event.alarmState == "DOWN"){
      return `background: ${alarm.color.text}; color: ${alarm.color.background}; border: 1px solid ${alarm.color.background};`;
    }else{
      return `background: ${alarm.color.background}; color: ${alarm.color.text}; border: 1px solid ${alarm.color.text};`;
    }
  }

  formatDate(timestamp: number){
    return moment(timestamp).format('YYYY-MM-DD HH:mm:ss')
  }

}
