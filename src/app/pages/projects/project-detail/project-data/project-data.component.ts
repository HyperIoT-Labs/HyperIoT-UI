import { Component, OnInit, Inject } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import {MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

import { map } from 'rxjs/operators';
import { Observable, Observer } from 'rxjs';

import { HprojectsService, HProject } from '@hyperiot/core';

import { SaveChangesDialogComponent } from 'src/app/components/dialogs/save-changes-dialog/save-changes-dialog.component';

@Component({
  selector: 'hyt-project-data',
  templateUrl: './project-data.component.html',
  styleUrls: ['./project-data.component.scss']
})
export class ProjectDataComponent implements OnInit {
  projectId: number;
  project: HProject = {} as HProject;

  form: FormGroup;
  originalValue: string;

  constructor(
    private hProjectService: HprojectsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
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

  canDeactivate(): Observable<any> | boolean {
    if (this.isDirty()) {
      return this.openDialog();
    }
    return true;
  }

  onSaveClick() {
    this.saveProject();
    this.hProjectService.updateHProject(this.project).subscribe((res) => {
      console.log('@@@', res);
      return true;
    }, (err) => {
      // TODO: show error message on screen
      console.log('###', err);
      return false;
    });
  }

  onDeleteClick() {
    // TODO: ...
  }

  isDirty(): boolean {
    return JSON.stringify(this.form.value) !== this.originalValue;
  }

  private loadProject() {
    this.hProjectService.findHProject(this.projectId).subscribe((p: HProject) => {
      this.project = p;
      // update form data
      this.form.get('name')
        .setValue(p.name);
      this.form.get('description')
        .setValue(p.description);
      this.originalValue = JSON.stringify(this.form.value);
    });
  }

  private saveProject() {
    const p = this.project;
    p.name = this.form.get('name').value;
    p.description = this.form.get('description').value;
  }

  private openDialog(): Observable<any> {
    return Observable.create((observer: Observer<boolean>) => {
      const dialogRef = this.dialog.open(SaveChangesDialogComponent, {
        data: {title: 'Discard changes?', message: 'There are pending changes to be saved.'}
      });
      dialogRef.afterClosed().subscribe((result) => {
        console.log(result);
        if (result === 'save') {
          this.saveProject();
          this.hProjectService.updateHProject(this.project).subscribe((res) => {
            console.log('@@@', res);
            this.originalValue = JSON.stringify(this.form.value);
            observer.next(true);
            observer.complete();
          }, (err) => {
            // TODO: show error message on screen
            console.log('ERROR', err);
            observer.next(false);
            observer.complete();
          });
        } else {
          observer.next(result === 'discard' || result === 'save')
          observer.complete();
        }
      });
    });
  }

}
