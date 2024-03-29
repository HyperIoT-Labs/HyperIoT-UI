import { Component, Inject, OnInit } from '@angular/core';
import { Area, AreasService } from 'core';
import { DialogRef, DIALOG_DATA } from 'components';

@Component({
  selector: 'hyt-area-innerarea-select-dialog',
  templateUrl: './area-innerarea-select-dialog.component.html',
  styleUrls: ['./area-innerarea-select-dialog.component.scss']
})
export class AreaInnerareaSelectDialogComponent implements OnInit {

  selectedArea: Area;

  constructor(
    private dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) public data: any,
    private areaService: AreasService
  ) { }

  ngOnInit() {
  }

  close(area?) {
    this.dialogRef.close(area);
  }

}
