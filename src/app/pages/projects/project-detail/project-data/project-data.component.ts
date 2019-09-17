import { Component, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';

import { Observable, Observer, Subscription } from 'rxjs';

import { MatDialog } from '@angular/material/dialog';

import { HprojectsService, HProject } from '@hyperiot/core';

import { SaveChangesDialogComponent } from 'src/app/components/dialogs/save-changes-dialog/save-changes-dialog.component';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { ProjectDetailComponent } from '../project-detail.component';

enum LoadingStatusEnum {
  Ready,
  Loading,
  Saving,
  Error
}

@Component({
  selector: 'hyt-project-data',
  templateUrl: './project-data.component.html',
  styleUrls: ['./project-data.component.scss']
})
export class ProjectDataComponent implements OnDestroy {
  projectId: number;
  project: HProject = {} as HProject;

  form: FormGroup;
  originalValue: string;

  LoadingStatus = LoadingStatusEnum;
  loadingStatus = LoadingStatusEnum.Ready;

  treeHost: ProjectDetailComponent = null;

  private routerSubscription: Subscription;

  constructor(
    private hProjectService: HprojectsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.form = this.formBuilder.group({});
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.projectId = this.activatedRoute.snapshot.params.projectId;
        this.loadProject();
      }
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

  canDeactivate(): Observable<any> | boolean {
    if (this.isDirty()) {
      return this.openSaveDialog();
    }
    return true;
  }

  onSaveClick() {
    this.saveProject();
  }

  onDeleteClick() {
    this.openDeleteDialog();
  }

  isDirty(): boolean {
    return JSON.stringify(this.form.value) !== this.originalValue;
  }

  private loadProject() {
    this.loadingStatus = LoadingStatusEnum.Loading;
    this.hProjectService.findHProject(this.projectId).subscribe((p: HProject) => {
      this.project = p;
      // update form data
      this.form.get('name')
        .setValue(p.name);
      this.form.get('description')
        .setValue(p.description);
      this.originalValue = JSON.stringify(this.form.value);
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  private saveProject(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    let p = this.project;
    p.name = this.form.get('name').value;
    p.description = this.form.get('description').value;
    this.hProjectService.updateHProject(p).subscribe((res) => {
      // TODO: show 'ok' message on screen
      console.log('SUCCESS', res);
      this.project = p = res;
      this.originalValue = JSON.stringify(this.form.value);
      this.treeHost && this.treeHost.updateNode({id: p.id, name: p.name});
      successCallback && successCallback(res);
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      // TODO: show 'error' message on screen
      console.log('ERROR', err);
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }
  private deleteProject(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.hProjectService.deleteHProject(this.project.id).subscribe((res) => {
      // TODO: show 'ok' message on screen
      console.log('SUCCESS', res);
      successCallback && successCallback(res);
      this.router.navigate(['/projects']);
      this.loadingStatus = LoadingStatusEnum.Ready;
    }, (err) => {
      // TODO: show 'error' message on screen
      console.log('ERROR', err);
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  private openSaveDialog(): Observable<any> {
    return new Observable((observer: Observer<boolean>) => {
      const dialogRef = this.dialog.open(SaveChangesDialogComponent, {
        data: {title: 'Discard changes?', message: 'There are pending changes to be saved.'}
      });
      dialogRef.afterClosed().subscribe((result) => {
        if (result === 'save') {
          this.saveProject((res) => {
            observer.next(true);
            observer.complete();
          }, (err) => {
            observer.next(false);
            observer.complete();
          });
        } else {
          observer.next(result === 'discard' || result === 'save');
          observer.complete();
        }
      });
    });
  }
  private openDeleteDialog() {
    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: {title: 'Delete project?', message: 'This operation cannot be undone.'}
    });
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'delete') {
        this.deleteProject((res) => {
          // TODO: ...
        }, (err) => {
          // TODO: report error
        });
      }
    });
  }
}
