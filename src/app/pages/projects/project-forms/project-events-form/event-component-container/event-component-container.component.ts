import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { json } from 'd3-fetch';
import { EventComponent } from '../event-component';
import { EventComponentType } from '../event-component-type.enum';
import { EventMailComponent } from '../event-mail/event-mail.component';
import { EventMqttCommandComponent } from '../event-mqtt-command/event-mqtt-command.component';

@Component({
  selector: 'hyt-event-component-container',
  templateUrl: './event-component-container.component.html',
  styleUrls: ['./event-component-container.component.scss']
})
export class EventComponentContainerComponent implements OnInit {

  constructor() { }

  @Input()
  currentProjectId;

  eventComponentType = EventComponentType;

  @ViewChild('eventMail')
  eventMailComponent: EventMailComponent;

  @ViewChild('eventMqttCommand')
  eventMqttComponent : EventMqttCommandComponent;

  currentShownComponentId: string;

  ngOnInit(): void {
  }

  getCurrentComponentShown(){
    if(this.currentShownComponentId === EventComponentType.SEND_MAIL_ACTION)
      return this.eventMailComponent;
    else if(this.currentShownComponentId === EventComponentType.SEND_MQTT_COMMAND_ACTION){
      return this.eventMqttComponent;
    }
  }

  reset(){
    if(this.getCurrentComponentShown())
      this.getCurrentComponentShown().reset();
  }

  setData(jsonAction){
    this.getCurrentComponentShown().setData(jsonAction);
  }

  isDirty(){
    
      return this.getCurrentComponentShown().isDirty();
    return false;
  }

  isInvalid(){
      return this.getCurrentComponentShown().isInvalid();
  }

  buildJsonAction(){
      return this.getCurrentComponentShown().buildJsonAction();
  }

  show(eventComponentId,data?){
    this.currentShownComponentId = eventComponentId;
    console.log(data);
    if(data)
      this.setData(data)
  }

}


