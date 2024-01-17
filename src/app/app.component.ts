import {Component, HostListener, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Logger, LoggerService} from "core";
import { environment } from '../environments/environment';

@Component({
  selector: 'hyt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  public environment = environment;

  /*
   * logger service
   */
  private logger: Logger;
  constructor(
    private activatedRoute: ActivatedRoute,
    private loggerService: LoggerService
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('AppComponent');
  }

  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    // do something with the mouse wheel event
    const target = event.target as HTMLElement;
    const elementId = target.id
    if(elementId && elementId.toLowerCase() === 'bimcanvas'){
      this.logger.debug('WHEEL event, stop propagation when we are on BIM Canvas, current target ID', elementId);
      event.preventDefault();
    }
  }

  showToolBars(): boolean {
    return (this.activatedRoute.snapshot.firstChild != undefined) ? this.activatedRoute.snapshot.firstChild.data.showToolBar : true;
  }

}
