import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'hyt-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {

  constructor(private route: Router) { }

  showToolBar(): boolean {
    return (this.route.routerState.snapshot.root.children[0] != undefined) ? this.route.routerState.snapshot.root.children[0].data.showToolBar : true;
  }

}
