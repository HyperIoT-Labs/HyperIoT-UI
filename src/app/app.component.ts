import { Component, HostListener, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { HProject, HprojectsService, Logger, LoggerService, RealtimeDataService } from "core";
import { ToastrService } from 'ngx-toastr';
import { Subject, filter, takeUntil } from 'rxjs';
import { DashboardConfigService } from 'widgets';
import { environment } from '../environments/environment';
import { PacketSuffixsEnum } from './models/packetSuffixsEnum';

@Component({
  selector: 'hyt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent implements OnInit, OnDestroy {

  public environment = environment;
  eventNotificationIsOn: boolean = true;

  private DEFAULT_TOAST_BACKGROUND_COLOUR = '#1f58a5';
  private severityColors = new Map<number, string>([
    [0, '#f8b606'],
    [1, '#f87a06'],
    [2, '#bd362f'],
    [3, '#9400d3'],
  ]);
  private toastMessage = $localize`:@@HYT_dashboard_event_fired:The event has been fired`;
  packetSuffixsEnum = PacketSuffixsEnum;
  projectIds: number[];

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();
  /** Used to unsubscribe from router events sub when condition is met */
  isAlive: boolean = true;

  /*
   * logger service
   */
  private logger: Logger;

  constructor(
    private activatedRoute: ActivatedRoute,
    private hprojectsService: HprojectsService,
    private configService: DashboardConfigService,
    private realtimeDataService: RealtimeDataService,
    private toastr: ToastrService,
    private loggerService: LoggerService,
    private router: Router
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('AppComponent');
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((urlObj: NavigationEnd) => {
      if (urlObj.url !== "/auth/login") {
        if (this.isAlive) {
          this.subscribeToWebSockets();
          this.isAlive = false;
        }
      } else {
        if (!this.isAlive) {
          this.realtimeDataService.disconnect();
          this.isAlive = true;
        }
      }
    });
  }

  /**
   * Retrive dashboard's data and connect to their data streams
   */
  subscribeToWebSockets() {
    this.hprojectsService.findAllHProject()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((projectsList: HProject[]) => {
        this.projectIds = projectsList.map(project => project.id);
        this.realtimeDataService.connect(this.projectIds);
      });
    this.realtimeDataService.eventStream.subscribe((p) => {
      this.configService.eventNotificationState
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe(res => {
          this.eventNotificationIsOn = res;
        });

      if (!this.eventNotificationIsOn) {
        return;
      }
      const packet = p.data;
      if (this.eventNotificationIsOn && packet.id === 0 && (packet.name.endsWith(PacketSuffixsEnum[PacketSuffixsEnum._event])
        || packet.name.endsWith(PacketSuffixsEnum[PacketSuffixsEnum._event_alarm]))) {
        // show toast if packet is a event or a alarm
        const event = JSON.parse(packet.fields.event.value.string).data; JSON.parse(packet.fields.event.value.string).data;
        const tag = event.tags[0]; // retrieve only first tag
        let toastBackgroundColor = this.DEFAULT_TOAST_BACKGROUND_COLOUR;
        let toastImage = 'info';
        if (packet.name.endsWith(PacketSuffixsEnum[PacketSuffixsEnum._event])) {
          toastBackgroundColor = tag ? tag.color : this.DEFAULT_TOAST_BACKGROUND_COLOUR;
          toastImage = 'toastEvent';
        } else if (packet.name.endsWith(PacketSuffixsEnum[PacketSuffixsEnum._event_alarm])) {
          if (event.alarmState === 'UP') {
            toastBackgroundColor = this.severityColors.get(event.severity) || this.DEFAULT_TOAST_BACKGROUND_COLOUR;
            toastImage = 'toastAlarmUp';
          } else {
            toastBackgroundColor = '#51a351';
            toastImage = 'toastAlarmDown';
          }
        }
        const textColor = '#ffffff';  // TODO retrieve from tag when this property will have been added
        const toastId = this.toastr['index'];
        this.toastr.show(this.toastMessage, event.ruleName, { toastClass: 'ngx-toastr toast-' + toastId }, toastImage).onShown.subscribe({
          complete: () => {
            document.querySelector('.overlay-container #toast-container .ngx-toastr.toast-' + toastId)
              .setAttribute('style', 'background-color: ' + toastBackgroundColor + '; color:' + textColor + ';');
          },
        });
      }
    })
  }

  @HostListener('wheel', ['$event'])
  onMouseWheel(event: WheelEvent) {
    // do something with the mouse wheel event
    const target = event.target as HTMLElement;
    const elementId = target.id
    if (elementId && elementId.toLowerCase() === 'bimcanvas') {
      this.logger.debug('WHEEL event, stop propagation when we are on BIM Canvas, current target ID', elementId);
      event.preventDefault();
    }
  }

  showToolBars(): boolean {
    return (this.activatedRoute.snapshot.firstChild != undefined) ? this.activatedRoute.snapshot.firstChild.data.showToolBar : true;
  }

  ngOnDestroy(): void {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }

}
