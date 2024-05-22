import { Component, Injector } from '@angular/core';
import { Logger, LoggerService, HytAlarm, AlarmWrapperService } from 'core';
import { BaseWidgetComponent } from '../../base/base-widget/base-widget.component';
import { Option } from 'components';

@Component({
  selector: 'hyperiot-alarms-widget',
  templateUrl: './alarms-widget.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './alarms-widget.component.scss']
})
export class AlarmsWidgetComponent extends BaseWidgetComponent {
  protected logger: Logger;
  /**
   * Map contain all the active alarm
   */
  alarmsList: Map<number, HytAlarm.LiveAlarm> = new Map();
  /**
   * Map contain all the alarm that need to be animated out and after removed
   */
  alarmListToRemove: Map<number, boolean> = new Map();
  /**
   * Show form for filter the alarm
   */
  showFilter = false;
  /**
   * map for retrieve label using value of severity
   */
  severityLabel = new Map<number, string>([
    [0, $localize`:@@HYT_alarm_low_sev:Low`],
    [1, $localize`:@@HYT_alarm_medium_sev:Medium`],
    [2, $localize`:@@HYT_alarm_high_sev:High`],
    [3, $localize`:@@HYT_alarm_critical_sev:Critical`],
  ]);
  /**
   * severityList for display the select for filter
   */
  severityList: Option[] = Array.from(this.severityLabel.entries()).map(([value, label]) => ({
    label,
    value: value.toString(),
  }));
  /**
   * Selected severity to filter, linked to template with ngModel
   */
  filteringSev : string[] = [];
  constructor(
    injector: Injector, 
    protected loggerService: LoggerService, 
    private alarmWrapper: AlarmWrapperService,
  ) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(AlarmsWidgetComponent.name);
  }
  
  ngAfterViewInit() {
    this.configure();
  }

  configure() {
    this.isConfigured = true;
    //LIVE ALARM
    this.alarmWrapper.alarmSubject
      .subscribe((alarm) => {
        if(alarm.isEvent) return;
        this.logger.info("EMITTED ALARM ON DASHBOARD", alarm)
        //NOT FILTER FOR PROJECT, NEED TO CHANGE REALTIME DATA SERVICE
        if(alarm.event.alarmState == "UP"){
          this.alarmsList.set(alarm.event.alarmId, alarm);
          
        }else{
          // ANIMATE ALARM USING ALARMSTATE AND AFTER D
          this.alarmListToRemove.set(alarm.event.alarmId, true);
          setTimeout(()=>{
            this.alarmsList.delete(alarm.event.alarmId);
            this.alarmListToRemove.delete(alarm.event.alarmId);
          }, 1000)
        }
      })
  }
  /**
   * Return alarmList map as array
   */
  get alarmListArray() : HytAlarm.LiveAlarm[]{
    return Array.from(this.alarmsList.values());
  }
  /**
   * If the user is filtering return the alarmList map as array filter, 
   * if not call the get alarmListArray
   */
  get filteredList() : HytAlarm.LiveAlarm[]{
    if(this.filteringSev.length){
      return this.alarmListArray.filter((alarm)=> this.filteringSev.includes(alarm.event.severity.toString()))
    }else{
      return this.alarmListArray;
    }
  }
  /**
   * Used for display all the severity that we are filtering as a list(ES: low, medium)
   */
  get listSelectedSev(){
    return this.filteringSev.map(sev => this.severityLabel.get(+sev)).join(', ');
  }

}
