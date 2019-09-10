import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HprojectsService, HProject } from '@hyperiot/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

@Component({
  selector: 'hyt-project-data',
  templateUrl: './project-data.component.html',
  styleUrls: ['./project-data.component.scss']
})
export class ProjectDataComponent implements OnInit {
  projectId: number;
  project: HProject = {} as HProject;

  form: FormGroup;

  constructor(
    private hProjectService: HprojectsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder
  ) {
    this.form = this.formBuilder.group({});
    this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.projectId = this.activatedRoute.snapshot.params.projectId;
        this.loadProject();
      }
    });
  }

  ngOnInit() {
  }

  onInputChange(e) {
    console.log(e);
  }
  onSubmit() {
    console.log();
  }

  private loadProject() {
    this.hProjectService.findHProject(this.projectId).subscribe((p) => {
      this.project = p;
      // update form data
      this.form.get('name')
        .setValue(p.name);
      this.form.get('description')
        .setValue(p.description);
    });
  }
}
