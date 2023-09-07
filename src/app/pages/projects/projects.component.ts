import { Component, OnInit, ViewEncapsulation, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { PageStatus } from './models/pageStatus';
import { HProject, HprojectsService } from 'core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { HytFilterButtonFilter, SelectOption } from 'components';
import { ProjectsService } from 'src/app/services/projects.service';
import { NotificationService } from 'components';

@Component({
  selector: "hyt-projects",
  templateUrl: "./projects.component.html",
  styleUrls: ["./projects.component.scss"],
  encapsulation: ViewEncapsulation.None,
})
export class ProjectsComponent implements OnInit, OnDestroy {
  PageStatus = PageStatus;
  pageStatus: PageStatus = PageStatus.Loading;

  hProjects: HProject[] = [];

  hProjectsFiltered: HProject[] = [...this.hProjects];
  
  filteringForm: FormGroup;
  testForm: FormGroup;

  /**
   * this variariable is used to set scrollToTop div on show or hide
   */

  scrolled: boolean = false;

  /**
   * this variariable is used to measure the value of vertical scroll
   */
  scrollTop: number;

  sortOptions: SelectOption[] = [
    { value: "none", label: $localize`:@@HYT_none:None` },
    { value: "alfabetic-increasing", label: $localize`:@@HYT_a_z:A-Z` },
    { value: "alfabetic-decreasing", label: $localize`:@@HYT_z_a:Z-A` },
    { value: "date-increasing", label: $localize`:@@HYT_oldest:Oldest` },
    { value: "date-decreasing", label: $localize`:@@HYT_newest:Newest` },
  ];

  deletingInLoading = false;
  displayMessageArea = false;
  typeMessageArea: string;
  messageAreaText: string;

  constructor(
    private router: Router,
    private hProjectService: HprojectsService,
    private fb: FormBuilder,
    private projectsService: ProjectsService,
    private notificationservice: NotificationService
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
    this.testForm = this.fb.group({
      textFilter: [""],
      projectType: [""],
      sortBy: [""],
    })
    this.testForm.valueChanges.subscribe((res)=>{
      console.log(res);
    })
    
    this.filteringForm = this.fb.group({});

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

  ngOnDestroy() {}

  filter() {}

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

  onChangeInputSearch2(event) {
    console.log(this.testForm.value.textFilter);
  }

  onChangeSelectSort(event) {
    this.sortBy(event.value);
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

  refreshViewOnDelete(event) {
    this.projectsService.deleteProject(event.id);
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
    this.filteringForm = this.fb.group({});

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

  get filterProjectType(): HytFilterButtonFilter[] {
    return [
      {
        value: "all",
        keyLabel: "",
        label: "ALL",
        tooltip: "ALL",
      },
      {
        icon: "user",
        value: "personal",
        tooltip: "Personal",
      },
      {
        icon: "userCircle",
        value: "owners",
        tooltip: "Owners",
      },
      {
        icon: "userEx",
        value: "shared",
        tooltip: "Shared",
      },
    ];
  }


  get filterSortType(): HytFilterButtonFilter[] {
    return [
      {
        value: "alphabetic-asc",
        keyLabel: "A-Z",
        label: "A-Z",
        tooltip: "A-Z",
      },
      {
        value: "alphabetic-desc",
        keyLabel: "Z-A",
        label: "Z-A",
        tooltip: "Z-A",
      },
      {
        value: "newest",
        keyLabel: "NEW",
        label: "NEW",
        tooltip: "NEW",
      },
      {
        value: "oldest",
        keyLabel: "OLD",
        label: "OLD",
        tooltip: "OLD",
      },
    ];
  }
}
