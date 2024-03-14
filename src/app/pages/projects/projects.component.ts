import {
  Component,
  OnInit,
  ViewEncapsulation,
  OnDestroy,
  HostListener,
  ChangeDetectorRef,
} from "@angular/core";
import { Router } from "@angular/router";
import { PageStatus } from "./models/pageStatus";
import {
  HProject,
  HprojectsService,
  HProjectSharingInfo,
  LoggerService,
Logger,
} from "core";
import { FormGroup, FormBuilder } from "@angular/forms";
import {
  CardDetailOnHover,
  CardEmittedValue,
  DialogRef,
  DialogService,
  HytFilterButtonFilter,
  OverlayService,
} from "components";
import { ProjectsService } from "src/app/services/projects.service";
import { NotificationService } from "components";
import { DeleteConfirmDialogComponent } from "src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component";
import { ShareType } from "./models/shared.model";

import { ShareProjectsComponent } from "./share-projects/share-projects.component";

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

  /**
   * this variariable is used to set scrollToTop div on show or hide
   */
  scrolled: boolean = false;

  /**
   * this variariable is used to measure the value of vertical scroll
   */
  scrollTop: number;

  /** HYOT logger */
  private logger: Logger;

  forceHoverId: number = -1;
  sharedPanel!: DialogRef<any>;
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
    private dialog: DialogService,
    private overlay: OverlayService,
    loggerService: LoggerService
  ) {
    this.logger = new Logger(loggerService);
    this.logger.registerClass("HytChatbotComponent");
  }

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
    this.initForm();
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

  /**
   * Close overlay when exit from the projects page
   */
  ngOnDestroy(): void {
    this.sharedPanel?.close();
  }

  initForm() {
    this.filteringForm = this.fb.group({
      projectType: [""],
      sort: ["date-decreasing"],
    });
    this.filteringForm.controls["sort"].valueChanges.subscribe((val) =>
      this.sortBy(val)
    );
    this.filteringForm.controls["projectType"].valueChanges.subscribe((val) =>
      this.search(this.filteringForm.value.textFilter, val)
    );
  }

  search(byName: string, bySharedType: ShareType) {
    this.hProjectsFiltered = [...this.hProjects];
    if (byName.length) {
      const reg = new RegExp(
        byName
          .replace(/[.+^${}()|[\]\\]/g, "\\$&")
          .replace(/\*/g, ".+")
          .replace(/\?/g, "."),
        "i"
      );
      this.hProjectsFiltered = this.hProjectsFiltered.filter((el) =>
        el.name.match(reg)
      );
    }

    if (Object.values(ShareType).includes(bySharedType))
      this.hProjectsFiltered = this.hProjectsFiltered.filter(
        (p) => this.sharedType(p.hProjectSharingInfo) === bySharedType
      );
    this.sortBy(this.filteringForm.value.sort);
  }

  /**
   * triggered when onChange on the sort filter is fired
   * @param type value emitted by the FilterButton
   */
  sortBy(type: string) {
    if (this.sharedPanel) this.sharedPanel.close();
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
    this.initForm();

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
        window.scroll(0, pos - 80); // how far to scroll on each step
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
  openDeleteDialog(emit: CardEmittedValue) {
    let p = emit.data as HProject;
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: {
        title: "Are you sure you want to delete the project?",
        message: "This operation cannot be undone.",
      },
    });

    dialogRef.dialogRef.afterClosed().subscribe(
      (result) => {
        if (result === "delete") {
          this.projectsService.deleteProject(p.id);
        }
      },
      (err) => {
        console.log("Errore nell' AFTER CLOSED del DIALOG di MATERIAL \n", err);
      }
    );
  }

  /**
   * List of filter for project type(shared)
   * @public
   */
  filterProjectType: HytFilterButtonFilter[] = [
    {
      value: "",
      keyLabel: "",
      label: "ALL",
      tooltip: $localize`:@@HYT_all:All`,
    },
    {
      icon: "projectSolo",
      value: ShareType.PERSONAL,
      tooltip: $localize`:@@HYT_filterPersonal:Show personal projects`,
    },
    {
      icon: "p_owner",
      value: ShareType.OWNER,
      tooltip: $localize`:@@HYT_filterOwner:Show owned projects`,
    },
    {
      icon: "p_partecipant",
      value: ShareType.PARTECIPANT,
      tooltip: $localize`:@@HYT_filterPartecipant:Show projects shared from other user`,
    },
  ];

  /**
   * List of filter for the sort type(new, old, alphabetical)
   * @public
   */
  filterSortType: HytFilterButtonFilter[] = [
    {
      value: "date-decreasing",
      keyLabel: "NEW",
      label: "NEW",
      tooltip: $localize`:@@HYT_sortNew:Sort by newest`,
    },
    {
      value: "date-increasing",
      keyLabel: "OLD",
      label: "OLD",
      tooltip: $localize`:@@HYT_sortOld:Sort by oldest`,
    },
    {
      value: "alfabetic-increasing",
      keyLabel: "A-Z",
      label: "A-Z",
      tooltip: $localize`:@@HYT_sortAlphaAsc:Sort alphabetically A-Z`,
    },
    {
      value: "alfabetic-decreasing",
      keyLabel: "Z-A",
      label: "Z-A",
      tooltip: $localize`:@@HYT_sortAlphaDesc:Sort alphabetically Z-A`,
    },
  ];

  /**
   * get the userId of the logged user from the localStorage
   */
  get userId() {
    return JSON.parse(localStorage.getItem("user")).id;
  }

  /**
   * return the icon for the detailedIcon of the project card, if PERSONAL return empty value
   * @param shared share detail of the project
   * @param icon add default value for icon
   * @returns
   */
  sharedType(shared: HProjectSharingInfo): ShareType {
    if (shared?.ownerId === this.userId) {
      // Owner of the project
      if (shared.collaboratorCounters > 0) {
        return ShareType.OWNER;
      } else {
        return ShareType.PERSONAL;
      }
    } else {
      return ShareType.PARTECIPANT;
    }
  }

  sharedIconMap: Map<ShareType, string> = new Map([
    [ShareType.PERSONAL, ""],
    [ShareType.OWNER, "p_owner"],
    [ShareType.PARTECIPANT, "p_partecipant"],
  ]);

  /**
   * Generate the list of details that will be printed on project hover
   * @public
   */
  generateDetails(p: HProject): CardDetailOnHover[] {
    const translation =
      p.deviceCount > 1
        ? $localize`:@@HYT_sources:Sources`
        : $localize`:@@HYT_source:Source`;

    let details = [
      {
        icon: "source02",
        label: `<strong>${p.deviceCount}</strong> ${translation}`,
      },
    ];
    let isOwner = this.isOwner(p.hProjectSharingInfo.ownerId);
    if (p.hProjectSharingInfo.collaboratorCounters > 0 || !isOwner) {
      details.push({
        icon: isOwner ? "p_owner" : "p_partecipant",
        label: this.generateSharedLabel(p.hProjectSharingInfo),
      });
    }
    return details;
  }

  /**
   * Generate the list of details that will be printed on project hover
   * @public
   */
  generateSharedLabel(s: HProjectSharingInfo): string {
    return s?.ownerId === this.userId
      ? `${$localize`:@@HYT_sharedWith:Shared with`} <strong>${
          s.collaboratorCounters
        }</strong>`
      : `${$localize`:@@HYT_sharedBy:Shared by`} <strong>${s.ownerLastName} ${
          s.ownerName
        }</strong>`;
  }

  isOwner(idUser: number): boolean {
    return idUser == this.userId;
  }

  showPanel(emit: CardEmittedValue) {
    this.logger.info("Shared overlay opening", emit);
    if (this.sharedPanel) this.sharedPanel.close();
    this.forceHoverId = (emit.data as HProject).id;
    this.sharedPanel = this.overlay.open(ShareProjectsComponent, {
      attachTarget: emit.event.target,
      data: emit.data,
      hideBackdrop: true,
    }).dialogRef;
    this.sharedPanel.afterClosed().subscribe(() => {
      this.logger.info("Shared overlay closing", emit);
      this.forceHoverId = null;
    });
  }
}