import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';

import { HProject, HprojectsService } from '@hyperiot/core';
import { MatDialog } from '@angular/material';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';




@Component({
  selector: 'hyt-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})

export class ProjectCardComponent implements OnInit {
  @Input() project: HProject;
  @Output() refreshView = new EventEmitter<object>();
  isActive = false;
  deviceCount = 0;
  rulesCount = 0;
  activeTimeout;

  constructor( private dialog: MatDialog, private projectService: HprojectsService ) { }

  ngOnInit() {
    /* Find All Device */
    this.deviceCount = this.project.deviceCount;

    /* Find All Device */
    this.rulesCount = this.project.rulesCount;
  }



  setActive(active) {
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
    }
    this.activeTimeout = setTimeout(() => this.isActive = active, 50);
  }

  deleteProject() {
    this.openDeleteDialog();
  }

  openDeleteDialog(){

    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
      data: {title: 'Are you sure you want to delete the project?', message: 'This operation cannot be undone.'}
    });

    dialogRef.afterClosed().subscribe(
      (result) => {

        if(result === 'delete'){
          
          this.projectService.deleteHProject(this.project.id).subscribe(
            (res) => {
              this.toRefreshView('success', 'The project was successfully deleted');
              
            },
            (err) => {
              this.toRefreshView('error', 'An error occurred while deleting the project');
              console.log(this.project);
              console.log('ERRORE CANCELLAZIONE\n', err)
            }

          );

        } 

      },
      (err) => {
        console.log('Errore nell\' AFTER CLOSED del DIALOG di MATERIAL \n', err);
      }

    );

  }

  toRefreshView(typeMsg: string, valueMsg: string) {
    this.refreshView.emit({type: typeMsg, value: valueMsg});
  }

}
