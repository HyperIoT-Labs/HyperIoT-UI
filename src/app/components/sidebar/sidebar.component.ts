import { Component, OnInit, ViewEncapsulation, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { ToggleSidebarService } from 'src/app/services/toggleSidebar/toggle-sidebar.service';
import { DialogService } from 'components';
import { Subscription } from 'rxjs';
import { InfoComponent } from '../info/info.component';

@Component({
  selector: 'hyt-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
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

  private algorithmResourceName: string;
  private controlPanelAction: string;

  constructor(
    private toggleSidebarService: ToggleSidebarService,
    private dialogService: DialogService,
  ) {
    this.algorithmResourceName = 'it.acsoftware.hyperiot.algorithm.model.Algorithm';
    this.controlPanelAction = 'control_panel';
  }

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
   * This method return true if user is admin or has permission to access to control panel
   */
  hasControlPanelAuthorization(): boolean {
    if (localStorage.getItem('userInfo')) {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'))
      if (userInfo.authenticable.admin || this.hasControlPanelAccess(userInfo.profile)) {
        return true;
      }
    }
    return false;
  }

  private hasControlPanelAccess(profile: any): boolean {
    if(profile.hasOwnProperty(this.algorithmResourceName)) {
      const permissions: string[] = profile[this.algorithmResourceName].permissions;
      if (permissions.includes(this.controlPanelAction)) {
        return true;
      }
    }
    return false;
  }

  showVersionPopUp() {
    this.dialogService.open(InfoComponent, { backgroundClosable: true });
  }

}
