import {Component, ViewEncapsulation} from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'hyt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {
  constructor(
    private activatedRoute: ActivatedRoute
  ) { }

  showToolBars(): boolean {
    return (this.activatedRoute.snapshot.firstChild != undefined) ? this.activatedRoute.snapshot.firstChild.data.showToolBar : true;
  }

}
