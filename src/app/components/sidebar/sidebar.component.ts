import { Component, OnInit, ViewEncapsulation, HostListener, AfterViewInit, OnDestroy } from '@angular/core';
import { ToggleSidebarService } from 'src/app/services/toggleSidebar/toggle-sidebar.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'hyt-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit, AfterViewInit, OnDestroy {

  lastSelectedElement;

  public winInnerWidth: number;

  navIsOpen : boolean = false;

  mobileBreakPoints = {
    md : 991,
    sm : 767
  };

  private subscriptionToggleMenu : Subscription;

  constructor(private toggleSidebarService: ToggleSidebarService) { }

  ngOnInit(): void {
    
    this.winInnerWidth = window.innerWidth;

    if(this.winInnerWidth > this.mobileBreakPoints.md && this.navIsOpen === true) {

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

    if(this.winInnerWidth > this.mobileBreakPoints.md && this.navIsOpen === true) {

      this.navIsOpen = this.toggleSidebarService.resetStatus();

    }

  }

  ngOnDestroy(): void {
    
    this.subscriptionToggleMenu.unsubscribe();

  }

}
