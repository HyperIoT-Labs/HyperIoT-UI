import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { DIALOG_DATA, DialogRef } from "components";
import { HProject, HUser, SharedEntity, SharedentityService } from "core";
import { SharedPages } from "../project-wizard/model/shared.models";
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from "@angular/animations";
import { Subject, takeUntil } from "rxjs";

@Component({
  selector: "hyt-share-projects",
  templateUrl: "./share-projects.component.html",
  styleUrls: ["./share-projects.component.scss"],
  providers: [SharedentityService],
  animations: [
    trigger("enterTrigger", [
      state(
        "fadeIn",
        style({
          opacity: "1",
        })
      ),
      transition("void => *", [
        style({
          opacity: "0",
        }),
        animate("500ms"),
      ]),
    ]),
  ],
})
export class ShareProjectsComponent implements OnInit, OnDestroy {
  /** Identify components to show by the state:
   * - 0: Collaborator list
   * - 1: Confirm delete collaborator
   * - 2: Add collaborator
   * - 3: Confirmed new collaborator
   * - 4: Confirmed remove collaborator
   * */
  sharedPagesEnum = SharedPages;

  /** Actual component showed */
  overlayState: SharedPages = SharedPages.LOADING;

  /** Title for the component showed */
  overlayTitle = new Map<SharedPages, string>([
    [SharedPages.COLLABORATOR, "Collaborator list"],
    [SharedPages.DELETE_COLLABORATOR, "Delete collaborator"],
    [SharedPages.ADD_COLLABORATOR, "Add collaborator"],
    [SharedPages.SUCCESS_OPERATION, "Operation confirmed"],
    [SharedPages.LOADING, "Loading"],
    [SharedPages.ERROR, "Error"],
    [SharedPages.USER_ALREADY_EXIST, "User already exist"],
  ]);

  /** Used on add collaborator for track the value that has been typed */
  newCollaboratorValue: string = "";

  /** List of collaborator of the projects */
  collaboratorList: string[] = [];

  /** If i focus a collaborator for delete it/create it, the value will be in this attribute */
  collaboratorFocused: string = null;

  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(
    private dialogRef: DialogRef<any>,
    private sharedService: SharedentityService,
    @Inject(DIALOG_DATA) public data: HProject
  ) {}

  ngOnInit(): void {
    this.sharedService
      .getUsers("it.acsoftware.hyperiot.hproject.model.HProject", this.data.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (list: string[]) => {
          this.collaboratorList = list;
          this.updateOverlayState(this.sharedPagesEnum.COLLABORATOR);
        },
        error: () => this.manageErrorOverlay(),
      });
  }

  ngOnDestroy(): void {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }

  manageErrorOverlay() {
    this.updateOverlayState(this.sharedPagesEnum.ERROR);
  }

  onCollaboratorChange(event: any) {
    this.newCollaboratorValue = event.target.value;
    console.log("newCollaboratorValue", this.newCollaboratorValue);
  }

  isEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  addCollaborator() {
    const newCollValue = this.newCollaboratorValue;
    const body: SharedEntity = {
      entityId: this.data.id,
      entityResourceName: "it.acsoftware.hyperiot.hproject.model.HProject",
      userId: 0,
    };
    if(this.isEmail(newCollValue)){
      body['userEmail'] = newCollValue
    }else{
      body['username'] = newCollValue
    }
    this.updateOverlayState(this.sharedPagesEnum.LOADING);
    this.sharedService.saveSharedEntity(body).subscribe({
      next: () => {
        this.collaboratorList.push(newCollValue);
        this.updateOverlayState(this.sharedPagesEnum.SUCCESS_OPERATION);
      },
      error: (err) => {
        console.log(err);
        if(err.status === 409){
          this.updateOverlayState(this.sharedPagesEnum.USER_ALREADY_EXIST);
        }else{
          this.updateOverlayState(this.sharedPagesEnum.ERROR);
        }
      },
    });
  }

  deleteCollaborator() {
    const body: SharedEntity = {
      entityId: this.data.id,
      entityResourceName: "it.acsoftware.hyperiot.hproject.model.HProject",
      username: this.collaboratorFocused,
    };
    this.updateOverlayState(
      this.sharedPagesEnum.LOADING,
      this.collaboratorFocused
    );
    this.sharedService
      .deleteSharedEntity(body)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          const index = this.collaboratorList.findIndex(
            (obj) => obj === this.collaboratorFocused
          );
          if (index !== -1) {
            this.collaboratorList.splice(index, 1);
          }
          this.updateOverlayState(this.sharedPagesEnum.SUCCESS_OPERATION);
        },
        error: () => this.manageErrorOverlay(),
      });
  }

  close() {
    this.dialogRef.close();
  }
  /**
   * Function for change state of the overlay and show new component
   * @param state new state of the overlay
   * @param user collaborator that is related to the state
   */
  updateOverlayState(state: SharedPages, user: string = null) {
    this.collaboratorFocused = user;
    this.newCollaboratorValue = "";
    this.overlayState = state;
  }

  get title() {
    return this.overlayTitle.get(this.overlayState);
  }
}
