import {  Component, Input, OnInit, ViewChild } from '@angular/core';
import { json } from 'd3-fetch';
import { EventComponent } from '../event-component';
import { EventComponentType } from '../event-component-type.enum';
import { EventMailComponent } from '../event-mail/event-mail.component';
import { EventMqttCommandComponent } from '../event-mqtt-command/event-mqtt-command.component';

class FakeEventComponent implements EventComponent{
  constructor(){

  }

  getId(): string {
    return "fake";
  }
  reset(): void {
    
  }
  setData(data: String[]): void {
    
  }
  buildJsonAction(): string {
    return "";
  }
  isInvalid(): boolean {
    return true;
  }
  isDirty(): boolean {
    return false;
  }
  
}

@Component({
  selector: 'hyt-event-component-container',
  templateUrl: './event-component-container.component.html',
  styleUrls: ['./event-component-container.component.scss']
})
export class EventComponentContainerComponent implements OnInit {

  constructor() { }

  @Input()
  currentProjectId;

  currentComponentShown: EventComponent;

  eventComponentType = EventComponentType;

  currentShownComponentId: string;

  data: any;

  ngOnInit(): void {
  }

  @ViewChild('currentEventComponent',{static:false}) set content(content: EventComponent) {
    if(content) { // initially setter gets called with undefined
         this.currentComponentShown = content;
    } else {
        this.currentComponentShown = new FakeEventComponent();
        this.currentShownComponentId = undefined;
        this.data = null;
    }
    //avoiding error on change detection
    setTimeout(() => { 
      if(this.data)
        this.currentComponentShown.setData(this.data); 
      })
    
 }

  getCurrentComponentShown():EventComponent{
    return this.currentComponentShown;
  }

  cancel(){
    this.currentComponentShown = new FakeEventComponent();
    this.currentShownComponentId = undefined;
    this.data = null;
  }

  reset(){
    this.getCurrentComponentShown().reset();
  }

  setData(jsonAction){
    this.data = jsonAction;
  }

  isDirty(){
    return this.getCurrentComponentShown().isDirty();
  }

  isInvalid(){
      return this.getCurrentComponentShown().isInvalid();
  }

  buildJsonAction(){
      return this.getCurrentComponentShown().buildJsonAction();
  }

  show(eventComponentId,data?){
    let mustForceDataRefresh = this.currentShownComponentId === eventComponentId;
    this.currentShownComponentId = eventComponentId;
    if(data && !mustForceDataRefresh)
      this.setData(data)
    else if (data){
      this.getCurrentComponentShown().setData(data);
    }
  }

}


