import {Component, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'hyt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  collapsed: boolean;

  constructor(
    private activatedRoute: ActivatedRoute
  ) { this.collapsed = true;}

  onCollapse(newValue: boolean) {
    this.collapsed = newValue;
  }

  showToolBars(): boolean {
    return (this.activatedRoute.snapshot.firstChild != undefined) ? this.activatedRoute.snapshot.firstChild.data.showToolBar : true;
  }

  openChatbot() {
    if (this.collapsed) return this.collapsed = false;
    else if (!this.collapsed) return this.collapsed = true;
  }

}
