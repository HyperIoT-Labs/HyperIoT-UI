import { Component, OnInit } from '@angular/core';
import { BaseGenericComponent } from '../../base/base-generic/base-generic.component';
import { RealtimeDataService } from 'core';
import {filter, PartialObserver} from 'rxjs';
import { WidgetAction } from '../../base/base-widget/model/widget.model';

@Component({
  selector: 'hyperiot-events-log',
  templateUrl: './events-log.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './events-log.component.css']
})
export class EventsLogComponent extends BaseGenericComponent implements OnInit {

  maxLogLines = 100;

  logMessages: {timestamp: Date, message: string, extra: string}[] = [];

  isPaused = false;

  eventLogObserver: PartialObserver<any> = {
    next: event => {
      const packet = JSON.stringify(event.data);
      // limit max log lines
      if (this.widget.config && this.widget.config.maxLogLines) {
        this.maxLogLines = +this.widget.config.maxLogLines;
      }
      this.logMessages.unshift({
        timestamp: new Date(),
        message: packet,
        extra: '---'
      });
      if (this.logMessages.length > this.maxLogLines) {
        this.logMessages.pop();
      }
    }
  };

  ngOnInit(): void {
    if (this.initData) {
      this.logMessages = [...this.initData];
    }
    super.ngOnInit();
    (this.dataService as RealtimeDataService).eventStream
      .pipe(
        filter(() => this.isPaused === false),
        filter(ev => ev.data.name === 'systemTick'),
        filter(ev => ev.data.fields.hProjectId && ev.data.fields.hProjectId.value.long === this.widget.projectId),
      )
      .subscribe(this.eventLogObserver);
  }

  pause(): void {
    this.isPaused = true;
  }
  play(): void {
    this.isPaused = false;
  }

  onToolbarAction(action: string) {
    const widgetAction: WidgetAction = { widget: this.widget, action };
    switch (action) {
      case 'toolbar:play':
        this.play();
        break;
      case 'toolbar:pause':
        this.pause();
        break;
      case 'toolbar:fullscreen':
        widgetAction.value = this.logMessages;
        break;
    }
    this.widgetAction.emit(widgetAction);
  }

}
