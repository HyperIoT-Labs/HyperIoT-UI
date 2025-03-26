import { Injectable } from '@angular/core';
import {filter, pairwise, Subject} from 'rxjs';
import { DashboardEvent } from './dashboard-event.model';
import { Logger, LoggerService } from 'core';
import {NavigationEnd, Router} from "@angular/router";
import extractDataFromUrl = DashboardEvent.ExtractDataFromUrl;

@Injectable({
  providedIn: 'root'
})
export class DashboardEventService {
  /** Emit value when the user interact with the timeline */
  timelineEvent = new Subject<DashboardEvent.Timeline>();
  selectedDateIntervalForExport = new Subject<Date[]>();

  /** Emit value when user click on dashboard command (play,pause...)*/
  commandEvent = new Subject<DashboardEvent.Command>();

  private previousUrl: string | undefined;
  private currentUrl: string | undefined;

  constructor(loggerService: LoggerService, private router: Router){
    const logger = new Logger(loggerService);
    logger.registerClass("DashboardEventService");
    this.timelineEvent.subscribe((res)=> logger.info("emit timelineEvent", res));
    this.selectedDateIntervalForExport.subscribe((res)=> logger.info("emit selectedDateIntervalForExport", res));
    this.commandEvent.subscribe((res)=> logger.info("emit commandEvent", res));

    // Get the previous and current url
    this.currentUrl = this.router.url;
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        pairwise()
      )
      .subscribe((events: any) => {
        this.previousUrl = events[0].url;
        this.currentUrl = events[1].url;
      });
  }

  // Return previous url
  public getPreviousUrl(): string | undefined {
    return this.previousUrl;
  }

  /**
   * Extract data from url (area or device id)
   * @param url
   */
  public extractDataFromUrl(url: string|undefined = undefined): extractDataFromUrl {
    let splitUrl: string[] = [];
    // check if the url is provided or not, if not provided use the previous url
    // url example: /areas/1/2
    if (url) {
      splitUrl = url.split('/') || [];
    } else {
      splitUrl = this.previousUrl ? this.previousUrl.split('/') || [] : [];
    }

    // Check if the url contains area or device and return the id and type
    if (splitUrl.length > 0) {
      if (splitUrl.includes('areas')) {
        return {type: 'area', id: splitUrl[splitUrl.length - 1]};
      } else if (splitUrl.includes('hdevice')) {
        return {type: 'device', id: splitUrl[splitUrl.length - 1]};
      }
    } else {
      return {type: '', id: ''};
    }
  }
}
