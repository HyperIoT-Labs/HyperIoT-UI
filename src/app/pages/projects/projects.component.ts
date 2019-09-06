import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { PageStatus } from './models/pageStatus';
import { HProject, HprojectsService } from '@hyperiot/core';


@Component({
  selector: 'hyt-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectsComponent implements OnInit {
  PageStatus = PageStatus;
  pageStatus: PageStatus = PageStatus.Loading;

  hProjects: HProject[] = [];

  constructor(
    private router: Router,
    private hProjectService: HprojectsService
  ) { }

  ngOnInit() {
    this.hProjectService.findAllHProject().subscribe(
      res => {
        this.hProjects = res;
        this.pageStatus = (this.hProjects.length !== 0)
          ? PageStatus.Standard
          : PageStatus.New;
      },
      err => {
        console.log(err);
        this.pageStatus = PageStatus.Error;
      }
    );
  }

  addProject() {
    this.router.navigate(['/project-wizard']);
  }
}
