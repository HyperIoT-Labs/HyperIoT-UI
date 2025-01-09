import {
  Component,
  HostListener,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { ActivatedRoute, NavigationEnd, Router } from "@angular/router";
import {
  HProject,
  HprojectsService, IGNORE_ERROR_NOTIFY,
  Logger,
  LoggerService,
  RealtimeDataService,
  UserSiteSettingSelectors,
  BrandingService,
  NotificationSelectors,
} from "core";
import { ToastrService } from "ngx-toastr";
import {Subject, Subscription, filter, takeUntil, map} from "rxjs";
import { environment } from "../environments/environment";
import {HttpContext} from "@angular/common/http";
import {CookieService} from "ngx-cookie-service";
import { Store } from "@ngrx/store";
import { concatLatestFrom } from "@ngrx/effects";

@Component({
  selector: "hyt-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class AppComponent implements OnInit, OnDestroy {
  public environment = environment;

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
    private brandingService: BrandingService,
    private cookieService: CookieService,
    private store: Store,
  ) {
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass("AppComponent");
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
    
    this.subscribeToNotification();
  }

  isLogged(): boolean {
    if (this.cookieService.check('HIT-AUTH') && localStorage.getItem('user') && localStorage.getItem('userInfo')) {
      return true;
    }
  }

  /**
   * Retrive dashboard's data and connect to their data streams
   */
  subscribeToWebSockets() {
    this.hprojectsService
      .findAllHProject('body', undefined, new HttpContext().set(IGNORE_ERROR_NOTIFY, true))
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe((projectsList: HProject[]) => {
        this.projectIds = projectsList.map((project) => project.id);
        this.realtimeDataService.connect(this.projectIds);
      });
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

    this.alarmSubscription = this.store.select(NotificationSelectors.selectLastNotification)
    .pipe(
      concatLatestFrom(
        () => this.store.select(UserSiteSettingSelectors.selectNotificationActive)
      ),
      filter(
        ([value, isNotificationEnabled]) => {
          return !!(isNotificationEnabled && value);
        }
      ),
      map(
        ([value, isNotificationEnabled]) => value
      )
    )
    .subscribe({
      next: (notification) => {
        this.toastr
        .show(
          notification.message,
          notification.title,
          { toastClass: "ngx-toastr toast-" + notification.id },
          notification.image
        )
        .onShown.subscribe({
          complete: () => {
            document
              .querySelector(
                ".overlay-container #toast-container .ngx-toastr.toast-" +
                  notification.id
              )
              .setAttribute(
                "style",
                `background-color: ${notification.bgColor}; color: ${notification.color}; transform: translateY(64px);`
              );
          },
        });
      }
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
