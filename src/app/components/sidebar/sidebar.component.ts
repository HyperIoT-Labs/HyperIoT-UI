import { Component, OnInit, ViewEncapsulation, HostListener, AfterViewInit, OnDestroy, inject } from '@angular/core';
import { ToggleSidebarService } from 'src/app/services/toggleSidebar/toggle-sidebar.service';
import { DialogService } from 'components';
import { Subscription } from 'rxjs';
import { InfoComponent } from '../info/info.component';
import { AdminAccessService } from 'src/app/pages/admin/admin-access.service';

@Component({
    selector: 'hyt-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: false
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {

  lastSelectedElement;

  public winInnerWidth: number;

  navIsOpen: boolean = false;

  mobileBreakPoints = {
    md: 991,
    sm: 767
  };

  private subscriptionToggleMenu: Subscription;

  private readonly adminAccess = inject(AdminAccessService);

  constructor(
    private toggleSidebarService: ToggleSidebarService,
    private dialogService: DialogService,
  ) { }

  ngOnInit(): void {

    this.winInnerWidth = window.innerWidth;

    if (this.winInnerWidth > this.mobileBreakPoints.md && this.navIsOpen === true) {

      this.navIsOpen = this.toggleSidebarService.resetStatus();

    }

  }

  ngAfterViewInit(): void {

    this.subscriptionToggleMenu = this.toggleSidebarService.change.subscribe(
      showSidebar => {

        this.navIsOpen = showSidebar;

      },
      err => {

        console.log('Errore: ', err);

      }
    );

  }

  @HostListener('window:resize', ['$event'])

  onResize(event) {

    this.winInnerWidth = event.target.innerWidth;

    if (this.winInnerWidth > this.mobileBreakPoints.md && this.navIsOpen === true) {

      this.navIsOpen = this.toggleSidebarService.resetStatus();

    }

  }

  ngOnDestroy(): void {

    this.subscriptionToggleMenu.unsubscribe();

  }

  /**
   * True if the user can use at least one section of the admin area
   */
  canAccessAdminArea(): boolean {
    return this.adminAccess.canAccessAdminArea();
  }

  showVersionPopUp() {
    this.dialogService.open(InfoComponent, { backgroundClosable: true });
  }

}
