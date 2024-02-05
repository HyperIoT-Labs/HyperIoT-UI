import { Component, Input, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'hyt-empty-project-list-view',
  templateUrl: './hyt-empty-project-list-view.component.html',
  styleUrls: ['./hyt-empty-project-list-view.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class HytEmptyProjectListViewComponent {

  @Input() title = '';
  @Input() message = '';

  constructor(
    private router: Router,
  ) { }

  addProject() {
    this.router.navigate(["/project-wizard"]);
  }

}
