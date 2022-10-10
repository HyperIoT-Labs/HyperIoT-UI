import { Component, OnInit, Input , Output , EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { AlarmEvent } from '@hyperiot/core';
import { Option } from '@hyperiot/components';

@Component({
  selector: 'hyt-alarm-events-table',
  templateUrl: './alarm-events-table.component.html',
  styleUrls: ['./alarm-events-table.component.scss']
})
export class AlarmEventsTableComponent implements OnChanges {

  @Input() alarmEventsList   : AlarmEvent[];
  @Output() deleteAlarmEvent: EventEmitter<Number> = new EventEmitter();
  @Output() editAlarmEvent: EventEmitter<Number> = new EventEmitter();

  severityList: Option[] = [
    {
      label: "Critical",
      value: "3"
    },
    {
      label: "High",
      value: "2",
    },
    {
      label: "Medium",
      value: "1",
    },
    {
      label: "Low",
      value: "0",
      checked: true,
    },
  ];
  displayedColumns : string[] = ['name', 'description', 'severity', 'actions'];

  constructor() { }
  ngOnChanges(changes: SimpleChanges): void {
    console.log('changes', this.alarmEventsList);
  }

  editEvent(indexToremove : number) {
    if(indexToremove >= 0){
      this.editAlarmEvent.emit(indexToremove);
    }
  }

  deleteEvent(indexToremove : number) {
    if(indexToremove >= 0){
      this.deleteAlarmEvent.emit(indexToremove);
    }
  }

getSeverityLabel(value : number){
  return this.severityList.find( x => x.value === value.toString())?.label;
}


}
