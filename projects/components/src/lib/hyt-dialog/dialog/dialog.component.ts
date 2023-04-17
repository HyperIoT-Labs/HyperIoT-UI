import { ComponentType } from '@angular/cdk/portal';
import { Component, Inject, OnInit } from '@angular/core';
import { LoggerService } from 'core';
import { BaseDialogComponent } from '../base-dialog/base-dialog.component';
import { DialogRef } from '../base-dialog/dialog-ref';
import { DIALOG_DATA_TOKEN, DIALOG_OVERLAY_COMPONENT_REF_TOKEN } from '../base-dialog/dialog-tokens';
import { DialogConfig } from '../base-dialog/model/dialog-model';
import { DialogResult } from './dialog.service';

@Component({
  selector: 'hwk-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss']
})
export class DialogComponent extends BaseDialogComponent implements OnInit {

  content?: ComponentType<any>;

  constructor(
    protected loggerService: LoggerService,
    @Inject(DIALOG_OVERLAY_COMPONENT_REF_TOKEN) readonly dialogRef: DialogRef<DialogResult>,
    @Inject(DIALOG_DATA_TOKEN) readonly data: DialogConfig
  ) {
    super(loggerService, data, dialogRef);

    this.logger.registerClass(this.componentName);
  }

  ngOnInit(): void {

    // this.content = this.data.component?.content
  }

  close() {
    this.dialogRef.close();
  }

}
