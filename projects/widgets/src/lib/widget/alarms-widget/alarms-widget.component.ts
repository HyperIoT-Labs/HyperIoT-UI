import { Component, Injector } from '@angular/core';
import { Logger, LoggerService, HytAlarm, AlarmWrapperService, HpacketsService } from 'core';
import { BaseWidgetComponent } from '../../base/base-widget/base-widget.component';
import { Option } from 'components';
import { animate, group, query, style, transition, trigger } from '@angular/animations';

@Component({
  selector: 'hyperiot-alarms-widget',
  templateUrl: './alarms-widget.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './alarms-widget.component.scss'],
  animations: [
    trigger('containerAnim', [
      transition('* => *', [
        group([
          query('hyt-alarm:enter', [
            style({ height: 0, opacity: 0, 'overflow-y': 'clip' }),
            animate('200ms ease-in', style({ height: '*', opacity: 1 })),
            style({ 'overflow-y': 'auto' }),
          ], { optional: true }),
          query('hyt-alarm:leave', [
            animate('200ms ease-out', style({ opacity: 0, transform: 'translateX(-300px)','overflow-y': 'clip' })),
            animate('200ms', style({ height: 0, padding: 0 })),
          ], { optional: true }),
        ]),
      ]),
    ]),
  ],
})
export class AlarmsWidgetComponent extends BaseWidgetComponent {
  protected logger: Logger;  
  hPacketIdList = [];
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
    private hPacketsService: HpacketsService,
  ) {
    super(injector, loggerService);
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(AlarmsWidgetComponent.name);
  }
  
  ngAfterViewInit() {
    this.configure();
    this.hPacketsService.findAllHPacketByProjectId(this.widget.projectId).subscribe(
      res => this.hPacketIdList = res.map(packet => packet.id)
    );
  }

  configure() {
    this.isConfigured = true;
  }

  get alarmListArray() : HytAlarm.LiveAlarm[] {
    return this.alarmWrapper.alarmListArray.filter(
      alarm => alarm.projectId === this.widget.projectId ||
      (alarm.packetIds?.some(packetId => this.hPacketIdList.includes(packetId)))
    );
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
