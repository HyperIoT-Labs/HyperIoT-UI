import { Component, OnInit } from '@angular/core';
import { BaseGenericComponent } from '../../base/base-generic/base-generic.component';
import {HPacketService, RealtimeDataService} from 'core';
import {filter, of, PartialObserver, Subject, switchMap, takeLast, takeUntil, tap} from 'rxjs';
import { WidgetAction } from '../../base/base-widget/model/widget.model';
import {catchError} from "rxjs/operators";

@Component({
  selector: 'hyperiot-events-log',
  templateUrl: './events-log.component.html',
  styleUrls: ['../../../../../../src/assets/widgets/styles/widget-commons.css', './events-log.component.css']
})
export class EventsLogComponent extends BaseGenericComponent implements OnInit {


  maxLogLines = 100;

  logMessages: {timestamp: Date, message: string, extra: string}[] = [];

  isPaused = false;

  private destroyEventStream$ = new Subject<void>(); // Segnale per l'unsubscribe

  eventLogObserver: PartialObserver<any> = {
    next: event => {
      if (event.data !== undefined) {
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
    },
    error: err => {
      this.logger.error('Event stream error: ', err);
    }
  };

  ngOnInit(): void {
    if (this.initData) {
      this.logMessages = [...this.initData];
    }
    super.ngOnInit();
    const hpService = this.injector.get(HPacketService);
    hpService.findAllHPacketByProjectId(this.widget.projectId)
      .pipe(
        // Passiamo al secondo stream, cioè l'eventStream
        switchMap(hpackets =>
          (this.dataService as RealtimeDataService).eventStream.pipe(
            filter(() => this.isPaused === false),
            filter(ev => hpackets.find(hp => hp.id === ev.data.id)),
            catchError(err => {
              this.logger.error('Error in event stream: ', err);
              return of({});
            })
          )
        ),
        takeUntil(this.destroyEventStream$)
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

  ngOnDestroy(): void {
    this.destroyEventStream$.next();
    this.destroyEventStream$.complete();
  }

}
