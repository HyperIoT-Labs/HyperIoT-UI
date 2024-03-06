import { Component, Inject, Optional } from '@angular/core';
import { DIALOG_DATA } from '../../hyt-dialog/dialog-tokens';
import { DialogRef } from '../../hyt-dialog/dialog-ref';
import { PlotlyService } from 'angular-plotly.js';

@Component({
  selector: 'hyt-chart-modal',
  templateUrl: './hyt-chart-modal.component.html',
  styleUrls: ['./hyt-chart-modal.component.scss']
})
export class HytChartModalComponent {

  public chartData: any;
  public chartLayout: any = { title: 'Chart'};

  constructor(
    private dialogRef: DialogRef<'cancel'>,
    @Optional() public plotly: PlotlyService,
    @Inject(DIALOG_DATA) public data: any
  ) { 
    this.chartData = data;
  }

  close(result: 'cancel') {
    this.dialogRef.close(result);
  }

}
