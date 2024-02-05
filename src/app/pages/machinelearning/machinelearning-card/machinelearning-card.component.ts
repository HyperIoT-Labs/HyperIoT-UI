import { Component, OnInit, Input, ViewEncapsulation, Output, EventEmitter } from '@angular/core';
import { Algorithm, AlgorithmsService } from 'core';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { DialogService } from 'components';


@Component({
  selector: 'hyt-machinelearning-card',
  templateUrl: './machinelearning-card.component.html',
  styleUrls: ['./machinelearning-card.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MachineLearningCardComponent implements OnInit {

  @Input() algorithm: Algorithm;
  @Output() refreshView = new EventEmitter<object>();
  isActive = false;
  deviceCount = 0;
  rulesCount = 0;
  activeTimeout;

  constructor( private dialog: DialogService, private algorithmService: AlgorithmsService ) { }

  ngOnInit() { }

  setActive(active) {
    if (this.activeTimeout) {
      clearTimeout(this.activeTimeout);
    }
    this.activeTimeout = setTimeout(() => this.isActive = active, 50);
  }

  deleteAlgorithm() {
    this.openDeleteDialog();
  }

  openDeleteDialog() {

    const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: { title: 'Are you sure you want to delete the algorithm?', message: 'This operation cannot be undone.' }
      }
    );

    dialogRef.afterClosed().subscribe(
      (result) => {
        if ( result === 'delete') {
          this.toRefreshView(this.algorithm.id);
        }
      },
      (err) => {
        console.log('Errore nell\' AFTER CLOSED del DIALOG di MATERIAL \n', err);
      }
    );
  }

  toRefreshView(algorithmId: number) {
    this.refreshView.emit({id: algorithmId});
  }

}
