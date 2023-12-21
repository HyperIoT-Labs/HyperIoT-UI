import { Component, ViewEncapsulation } from '@angular/core';
import { DialogRef } from 'components';

@Component({
  selector: 'hyt-statistic-input-error',
  templateUrl: './statistic-input-error.component.html',
  styleUrls: ['./statistic-input-error.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class StatisticInputErrorComponent {

  constructor(
    private dialogRef: DialogRef<void>,
  ) { }

  close() {
    this.dialogRef.close();
  }

}
