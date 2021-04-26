import { Component, OnInit, ViewChild } from '@angular/core';
import { EventMailComponent } from '../event-mail/event-mail.component';

@Component({
  selector: 'hyt-event-component-container',
  templateUrl: './event-component-container.component.html',
  styleUrls: ['./event-component-container.component.scss']
})
export class EventComponentContainerComponent implements OnInit {

  constructor() { }


  @ViewChild('eventMail')
  eventMailComponent: EventMailComponent;

  ngOnInit(): void {
  }

  reset(){
    this.eventMailComponent.reset();
  }

  setData(jsonAction){
    this.eventMailComponent.setData(jsonAction)
  }

  isDirty(){
    return this.eventMailComponent.isDirty();
  }

  isInvalid(){
    return this.eventMailComponent.isInvalid();
  }

  buildJsonAction(){
    return this.eventMailComponent.buildJsonAction();
  }

}
