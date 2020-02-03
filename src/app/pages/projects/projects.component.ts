import { Component, OnInit, ViewEncapsulation, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { PageStatus } from './models/pageStatus';
import { HProject, HprojectsService } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components/lib/hyt-select-template/hyt-select-template.component';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { ProjectsService } from 'src/app/services/projects.service';

@Component({
  selector: 'hyt-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectsComponent implements OnInit, OnDestroy {

  PageStatus = PageStatus;
  pageStatus: PageStatus = PageStatus.Loading;

  hProjects: HProject[] = [];

  hProjectsFiltered: HProject[] = [...this.hProjects];

  filteringForm: FormGroup;

  sortOptions: SelectOption[] = [
    { value: 'none', label: 'None' }, // @I18N@
    { value: 'alfabetic-increasing', label: 'A-Z' }, // @I18N@
    { value: 'alfabetic-decreasing', label: 'Z-A' }, // @I18N@
    { value: 'date-increasing', label: 'Oldest' }, // @I18N@
    { value: 'date-decreasing', label: 'Newest' } // @I18N@
  ];

  deletingInLoading = false;
  displayMessageArea = false;
  typeMessageArea: string;
  messageAreaText: string;

  constructor(
    private router: Router,
    private hProjectService: HprojectsService,
    private fb: FormBuilder,
    private projectsService: ProjectsService
  ) { }

  ngOnInit() {

    this.filteringForm = this.fb.group({});

    if (this.projectsService.nextProjects.state === 'delete-loading') {
      this.projectsInLoading(this.projectsService.nextProjects.projectToDelete);
    }

    this.projectsService.subProjects.subscribe({
      next: (v) => {
        switch (v.state) {
          case 'update-success':
            this.updateProjects(v.projectList);
            this.sortBy('date-decreasing');
            break;
          case 'update-error':
            this.pageStatus = PageStatus.Error;
            break;
          case 'delete-loading':
            this.projectsInLoading(v.projectToDelete);
            break;
          case 'delete-success':
            this.updateProjects(v.projectList);
            this.sortBy('date-decreasing');
            this.typeMessageArea = 'success';
            this.messageAreaText = 'The project was successfully deleted.';
            this.deletingInLoading = false;
            setTimeout(() => {
              this.hideMessageArea();
            }, 5000);
            break;
          case 'delete-error':
            this.typeMessageArea = 'error';
            this.messageAreaText = 'An error occurred while deleting the project.';
            this.deletingInLoading = false;
            setTimeout(() => {
              this.hideMessageArea();
            }, 5000);
            break;
          default:
            break;
        }
      }
    });

    this.projectsService.updateProjectList();

  }

  ngOnDestroy() {

  }

  filter() {
  }

  search(value: string) {

    if (value) {
      if (value.split('*').length > 18) {
        this.hProjectsFiltered = [];
      } else {
        const reg = new RegExp(value.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.+').replace(/\?/g, '.'), 'i');
        this.hProjectsFiltered = this.hProjects.filter(el => (el.name.match(reg)));
        this.sortBy(this.filteringForm.value.sort);
      }
    } else {
      this.hProjectsFiltered = [...this.hProjects];
      this.sortBy(this.filteringForm.value.sort);
    }

  }

  onChangeInputSearch(event) {
    this.displayMessageArea = false;
    this.search(this.filteringForm.value.textFilter);
  }

  onChangeSelectSort(event) {
    this.displayMessageArea = false;
    this.sortBy(event.value);
  }

  sortBy(type: string) {
    switch (type) {

      case 'none':
        this.hProjectsFiltered.sort((a, b) => {
          if (a.id > b.id) { return -1; }
          if (a.id < b.id) { return 1; }
          return 0;
        });
        break;

      case 'alfabetic-increasing':
        this.hProjectsFiltered.sort((a, b) => {
          if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) { return -1; }
          if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) { return 1; }
          return 0;
        });
        break;

      case 'alfabetic-decreasing':
        this.hProjectsFiltered.sort((a, b) => {
          if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) { return -1; }
          if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) { return 1; }
          return 0;
        });
        break;

      case 'date-increasing':
        this.hProjectsFiltered.sort((a, b) => {
          if (a.id < b.id) { return -1; }
          if (a.id > b.id) { return 1; }
          return 0;
        });
        break;

      case 'date-decreasing':
        this.hProjectsFiltered.sort((a, b) => {
          if (a.id > b.id) { return -1; }
          if (a.id < b.id) { return 1; }
          return 0;
        });
        break;

      default:
        break;

    }
  }

  addProject() {
    this.router.navigate(['/project-wizard']);
  }

  refreshViewOnDelete(event) {
    this.projectsService.deleteProject(event.id);
  }

  projectsInLoading(projectId: number) {
    this.displayMessageArea = true;
    this.deletingInLoading = true;
    this.typeMessageArea = 'loading';
    const projectToDelete = this.projectsService.nextProjects.projectList.find(x => x.id == projectId);
    this.messageAreaText = `Deleting of project "${projectToDelete.name}" in loading. It may take a while.`;
  }

  updateProjects(projectList: HProject[]) {
    this.hProjects = projectList;
    this.pageStatus = (this.hProjects.length !== 0)
      ? PageStatus.Standard
      : PageStatus.New;
    this.hProjectsFiltered = [...this.hProjects];
    /* Default Sort */
  }

  refreshComponent() {
    this.filteringForm = this.fb.group({});

    this.hProjectService.cardsView().subscribe(
      res => {
        this.hProjects = res;
        this.pageStatus = (this.hProjects.length !== 0)
          ? PageStatus.Standard
          : PageStatus.New;

        this.hProjectsFiltered = [...this.hProjects];
        /* Default Sort */
        this.sortBy('date-decreasing');
      },
      err => {
        this.pageStatus = PageStatus.Error;
      }
    );
  }

  hideMessageArea() {
    this.displayMessageArea = false;
    this.typeMessageArea = undefined;
    this.messageAreaText = undefined;
  }

}
