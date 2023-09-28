import { Component, OnInit, ViewEncapsulation, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { PageStatus } from './models/pageStatus';
import { HProject, HprojectsService } from 'core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { CardDetailOnHover, HytFilterButtonFilter, HytModalService, SelectOption } from 'components';
import { ProjectsService } from 'src/app/services/projects.service';
import { NotificationService } from 'components';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: "hyt-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectsComponent implements OnInit {
  PageStatus = PageStatus;
  pageStatus: PageStatus = PageStatus.Loading;

  hProjects: HProject[] = [];

  hProjectsFiltered: HProject[] = [...this.hProjects];
  
  filteringForm: FormGroup;

  /**
   * this variariable is used to set scrollToTop div on show or hide
   */

  scrolled: boolean = false;

  /**
   * this variariable is used to measure the value of vertical scroll
   */
  scrollTop: number;

  deletingInLoading = false;
  displayMessageArea = false;
  typeMessageArea: string;
  messageAreaText: string;

  constructor(
    private router: Router,
    private hProjectService: HprojectsService,
    private fb: FormBuilder,
    private projectsService: ProjectsService,
    private notificationservice: NotificationService,
    private dialog: HytModalService,
  ) {}

  /**
   * This is a scroll window event listener
   */
  @HostListener("document:scroll", ["$event"])
  onScroll() {
    this.scrollTop = document.documentElement.scrollTop;

    if (this.scrollTop > 250) {
      this.scrolled = true;
    } else {
      this.scrolled = false;
    }
  }
  
  ngOnInit() {
    this.initForm()
    if (this.projectsService.nextProjects.state === "delete-loading") {
      this.projectsInLoading(this.projectsService.nextProjects.projectToDelete);
    }

    this.projectsService.subProjects.subscribe({
      next: (v) => {
        switch (v.state) {
          case "update-success":
            this.updateProjects(v.projectList);
            this.sortBy("date-decreasing");
            break;
          case "update-error":
            this.pageStatus = PageStatus.Error;
            break;
          case "delete-loading":
            this.projectsInLoading(v.projectToDelete);
            break;
          case "delete-success":
            this.updateProjects(v.projectList);
            this.sortBy("date-decreasing");
            this.typeMessageArea = $localize`:@@HYT_success:Success`;
            this.messageAreaText = $localize`:@@HYT_project_successfully_deleted:The project was successfully deleted.`;
            this.deletingInLoading = false;
            this.launchNotification(
              "success",
              this.typeMessageArea,
              this.messageAreaText
            );
            this.hideMessageArea();
            break;
          case "delete-error":
            this.typeMessageArea = $localize`:@@HYT_error:Error`;
            this.messageAreaText = $localize`:@@HYT_error_deleting_project:An error occurred while deleting the project.`;
            this.deletingInLoading = false;
            this.launchNotification(
              "error",
              this.typeMessageArea,
              this.messageAreaText
            );
            this.hideMessageArea();
            break;
          default:
            break;
        }
      },
    });

    this.projectsService.updateProjectList();
  }

  initForm(){
    this.filteringForm = this.fb.group({
      projectType: [''],
      sort: ['date-decreasing']
    });
    this.filteringForm.controls['sort'].valueChanges.subscribe((val)=> this.sortBy(val))
  }

  search(value: string) {
    if (value) {
      if (value.split("*").length > 18) {
        this.hProjectsFiltered = [];
      } else {
        const reg = new RegExp(
          value
            .replace(/[.+^${}()|[\]\\]/g, "\\$&")
            .replace(/\*/g, ".+")
            .replace(/\?/g, "."),
          "i"
        );
        this.hProjectsFiltered = this.hProjects.filter((el) =>
          el.name.match(reg)
        );
        this.sortBy(this.filteringForm.value.sort);
      }
    } else {
      this.hProjectsFiltered = [...this.hProjects];
      this.sortBy(this.filteringForm.value.sort);
    }
  }

  onChangeInputSearch(event) {
    this.search(this.filteringForm.value.textFilter);
  }

  sortBy(type: string) {
    switch (type) {
      case "none":
        this.hProjectsFiltered.sort((a, b) => {
          if (a.id > b.id) {
            return -1;
          }
          if (a.id < b.id) {
            return 1;
          }
          return 0;
        });
        break;

      case "alfabetic-increasing":
        this.hProjectsFiltered.sort((a, b) => {
          if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) {
            return -1;
          }
          if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) {
            return 1;
          }
          return 0;
        });
        break;

      case "alfabetic-decreasing":
        this.hProjectsFiltered.sort((a, b) => {
          if (a.name.toLocaleLowerCase() > b.name.toLocaleLowerCase()) {
            return -1;
          }
          if (a.name.toLocaleLowerCase() < b.name.toLocaleLowerCase()) {
            return 1;
          }
          return 0;
        });
        break;

      case "date-increasing":
        this.hProjectsFiltered.sort((a, b) => {
          if (a.id < b.id) {
            return -1;
          }
          if (a.id > b.id) {
            return 1;
          }
          return 0;
        });
        break;

      case "date-decreasing":
        this.hProjectsFiltered.sort((a, b) => {
          if (a.id > b.id) {
            return -1;
          }
          if (a.id < b.id) {
            return 1;
          }
          return 0;
        });
        break;

      default:
        break;
    }
  }

  addProject() {
    this.router.navigate(["/project-wizard"]);
  }

  projectsInLoading(projectId: number) {
    this.deletingInLoading = true;
    this.typeMessageArea = $localize`:@@HYT_loading:Loading`;
    const projectToDelete = this.projectsService.nextProjects.projectList.find(
      (x) => x.id == projectId
    );
    this.messageAreaText = $localize`:@@HYT_deleting_project:Deleting of project "${projectToDelete.name}" in loading. It may take a while.`;
    this.launchNotification("info", this.typeMessageArea, this.messageAreaText);
  }

  updateProjects(projectList: HProject[]) {
    this.hProjects = projectList;
    this.pageStatus =
      this.hProjects.length !== 0 ? PageStatus.Standard : PageStatus.New;
    this.hProjectsFiltered = [...this.hProjects];
    /* Default Sort */
  }

  refreshComponent() {
    this.initForm()

    this.hProjectService.cardsView().subscribe(
      (res) => {
        this.hProjects = res;
        this.pageStatus =
          this.hProjects.length !== 0 ? PageStatus.Standard : PageStatus.New;

        this.hProjectsFiltered = [...this.hProjects];
        /* Default Sort */
        this.sortBy("date-decreasing");
      },
      (err) => {
        this.pageStatus = PageStatus.Error;
      }
    );
  }

  hideMessageArea() {
    this.typeMessageArea = undefined;
    this.messageAreaText = undefined;
  }

  scrollToTopPage() {
    let scrollToTop = window.setInterval(() => {
      let pos = window.pageYOffset;
      if (pos > 0) {
        window.scroll(0, pos - 20); // how far to scroll on each step
      } else {
        window.clearInterval(scrollToTop);
      }
    }, 5);
  }

  /**
   * Method used to launch a notification message when a project is deleted
   * @param type
   * @param title
   * @param message
   */
  launchNotification(type: string, title: string, message: string) {
    switch (type) {
      case "success":
        this.notificationservice.success(title, message);
        break;

      case "info":
        this.notificationservice.info(title, message);
        break;

      case "error":
        this.notificationservice.error(title, message);
        break;

      default:
        break;
    }
  }

  /**
   * Dialog open for confirm the user wants to delete a project
   * @public
   */
  openDeleteDialog(p : HProject) {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: { title: 'Are you sure you want to delete the project?', message: 'This operation cannot be undone.' }
      }
    );

    dialogRef.onClosed.subscribe(
      (result) => {
        if ( result === 'delete') {
          this.projectsService.deleteProject(p.id)
        }
      },
      (err) => {
        console.log('Errore nell\' AFTER CLOSED del DIALOG di MATERIAL \n', err);
      }
    );
  }

  /**
   * Get the list of filter for project type(shared)
   * @public
   */
  get filterProjectType(): HytFilterButtonFilter[] {
    return [
      {
        value: "all",
        keyLabel: "",
        label: "ALL",
        tooltip: "ALL",
      },
      {
        icon: "warnT_Negative",
        value: "personal",
        tooltip: "Personal",
      },
      {
        icon: "warnT_Negative",
        value: "owners",
        tooltip: "Owners",
      },
      {
        icon: "warnT_Negative",
        value: "shared",
        tooltip: "Shared",
      },
    ];
  }

  /**
   * Get the list of filter for the sort type(new, old, alphabetical)
   * @public
   */
  get filterSortType(): HytFilterButtonFilter[] {
    return [
      {
        value: "date-decreasing",
        keyLabel: "NEW",
        label: "NEW",
        tooltip: "NEW",
      },
      {
        value: "date-increasing",
        keyLabel: "OLD",
        label: "OLD",
        tooltip: "OLD",
      },
      {
        value: "alfabetic-increasing",
        keyLabel: "A-Z",
        label: "A-Z",
        tooltip: "A-Z",
      },
      {
        value: "alfabetic-decreasing",
        keyLabel: "Z-A",
        label: "Z-A",
        tooltip: "Z-A",
      },
    ];
  }

  /**
   * Generate the list of details that will be printed on project hover
   * @public
   */
  generateDetails(p: HProject) : CardDetailOnHover[]{
    return [
      {
        icon: "warnT_Negative",
        label: `<strong>${p.deviceCount}</strong> Sources`
      },
      {
        icon: "warnT_Negative",
        label: `Shared with <strong>Not impl.</strong>`
      },
    ];
  }
}
