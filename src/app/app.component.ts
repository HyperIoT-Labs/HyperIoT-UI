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
import {Subject, Subscription, filter, takeUntil, distinctUntilChanged, tap} from "rxjs";
import { DashboardConfigService } from "widgets";
import { environment } from "../environments/environment";
import { BrandingService } from "./services/branding/branding.service";

@Component({
  selector: "hyt-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
  public environment = environment;
  eventNotificationIsOn: boolean;

  private toastMessage = $localize`:@@HYT_dashboard_event_fired:The event has been fired`;
  private toastMessageUp = $localize`:@@HYT_dashboard_event_fired:The event has been fired`;
  private toastMessageDown = $localize`:@@HYT_dashboard_event_clean:Event cleared`;
  private toastMessageAlarmUp = $localize`:@@HYT_dashboard_alarm_fired:The alarm has been fired`;
  private toastMessageAlarmDown = $localize`:@@HYT_dashboard_alarm_clean:Alarm cleared`;
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

  logoPaths = this.brandingService.logoPath$;

  constructor(
    private activatedRoute: ActivatedRoute,
    private hprojectsService: HprojectsService,
    private realtimeDataService: RealtimeDataService,
    private toastr: ToastrService,
    private loggerService: LoggerService,
    private router: Router,
    private alarmWrapper: AlarmWrapperService,
    private brandingService: BrandingService
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass("AppComponent");
    this.eventNotificationIsOn = alarmWrapper.eventNotificationState.getValue();
  }

  ngOnInit() {
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

    this.alarmWrapper.eventNotificationState
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((res) => {
        this.eventNotificationIsOn = res;
        this.manageNotificationSubscription();
      });

    this.manageNotificationSubscription();
  }

  manageNotificationSubscription(){
    if (this.eventNotificationIsOn) {
      this.logger.info("Subscribe to notifications ON");
      this.subscribeToNotification();
    } else {
      this.logger.info("Subscribe to notifications OFF");
      if(this.alarmSubscription) this.alarmSubscription.unsubscribe();
    }
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
    if(this.alarmSubscription) this.alarmSubscription.unsubscribe();
    this.alarmSubscription = this.alarmWrapper.alarmSubject
      .pipe(
        tap((alarm) => { this.logger.debug("Alarm received", alarm); }),
        takeUntil(this.ngUnsubscribe),
        distinctUntilChanged()
      )
      .subscribe((alarm) => {
        let toastImage = "info";
        console.log("Alarm received", alarm);
        if (alarm.isEvent) {
          toastImage = "toastEvent";
          this.toastMessage =
            alarm.event.alarmState === "UP" ? this.toastMessageUp : this.toastMessageDown;
        } else if (alarm.isAlarm) {
          toastImage =
            alarm.event.alarmState === "UP" ? "toastAlarmUp" : "toastAlarmDown";
          this.toastMessage =
            alarm.event.alarmState === "UP" ? this.toastMessageAlarmUp : this.toastMessageAlarmDown;
          if (alarm.event.alarmState === 'DOWN')
            alarm.color.background = '#51a351'; // Green of resolved alarm BG (OFF state)
        }
        const toastId = this.toastr["index"];
        this.toastr
          .show(
            this.toastMessage,
            alarm.event.alarmEventName,
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
                  `background-color: ${alarm.color.background}; color: ${alarm.color.text}; transform: translateY(64px);`
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
