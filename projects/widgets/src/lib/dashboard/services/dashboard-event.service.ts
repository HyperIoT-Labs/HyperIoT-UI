import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { DashboardEvent } from './dashboard-event.model';
import { Logger, LoggerService } from 'core';

@Injectable({
  providedIn: 'root'
})
export class DashboardEventService {
  /** Emit value when the user interact with the timeline */
  timelineEvent = new Subject<DashboardEvent.Timeline>();

  /** Emit value when user click on dashboard command (play,pause...)*/
  commandEvent = new Subject<DashboardEvent.Command>();

  constructor(loggerService: LoggerService){
    const logger = new Logger(loggerService);
    logger.registerClass("DashboardEventService");
    this.timelineEvent.subscribe((res)=> logger.info("emit timelineEvent", res))
    this.commandEvent.subscribe((res)=> logger.info("emit commandEvent", res))
  }
}
