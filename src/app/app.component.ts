import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {
  AlarmWrapperService,
  HProject,
  HprojectsService,
  Logger,
  LoggerService,
  RealtimeDataService,
} from "core";
import { ToastrService } from "ngx-toastr";
import { Subject, Subscription, filter, takeUntil } from "rxjs";
import { DashboardConfigService } from "widgets";
import { environment } from "../environments/environment";

@Component({
  selector: "hyt-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
  public environment = environment;
  eventNotificationIsOn: boolean = true;

  private toastMessage = $localize`:@@HYT_dashboard_event_fired:The alarm is over`;
  projectIds: number[];

  /** Subject for manage the open subscriptions */
  protected alarmSubscription: Subscription;

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
    private router: Router,
    private alarmWrapper: AlarmWrapperService
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass("AppComponent");
  }

  ngOnInit() {
    console.log(this.alarmWrapper);

    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((urlObj: NavigationEnd) => {
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
    this.hprojectsService
      .findAllHProject()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((projectsList: HProject[]) => {
        this.projectIds = projectsList.map((project) => project.id);
        this.realtimeDataService.connect(this.projectIds);
      });

    this.configService.eventNotificationState
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        this.eventNotificationIsOn = res;
        if (this.eventNotificationIsOn) {
          this.subscribeToNotification();
        } else {
          this.logger.info("Subscribe to notifications OFF");
          this.alarmSubscription.unsubscribe();
        }
      });

    this.subscribeToNotification();
  }

  @HostListener("wheel", ["$event"])
  onMouseWheel(event: WheelEvent) {
    // do something with the mouse wheel event
    const target = event.target as HTMLElement;
    const elementId = target.id;
    if (elementId && elementId.toLowerCase() === "bimcanvas") {
      this.logger.debug(
        "WHEEL event, stop propagation when we are on BIM Canvas, current target ID",
        elementId
      );
      event.preventDefault();
    }
  }

  subscribeToNotification() {
    this.logger.info("Subscribe to notifications ON");
    this.alarmSubscription = this.alarmWrapper.alarmSubject
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((alarm) => {
        let toastImage = "info";
        if (alarm.isEvent) {
          toastImage = "toastEvent";
        } else if (alarm.isAlarm) {
          toastImage =
            alarm.event.alarmState === "UP" ? "toastAlarmUp" : "toastAlarmDown";
          if (alarm.event.alarmState === 'DOWN')
            alarm.color.background = '#51a351'; // Green of resolved alarm BG (OFF state)
        }
        const toastId = this.toastr["index"];
        this.toastr
          .show(
            this.toastMessage,
            alarm.event.ruleName,
            { toastClass: "ngx-toastr toast-" + toastId },
            toastImage
          )
          .onShown.subscribe({
            complete: () => {
              document
                .querySelector(
                  ".overlay-container #toast-container .ngx-toastr.toast-" +
                    toastId
                )
                .setAttribute(
                  "style",
                  `background-color: ${alarm.color.background}; color: ${alarm.color.text};`
                );
            },
          });
      });
  }

  showToolBars(): boolean {
    return this.activatedRoute.snapshot.firstChild != undefined
      ? this.activatedRoute.snapshot.firstChild.data.showToolBar
      : true;
  }

  ngOnDestroy(): void {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }
}
