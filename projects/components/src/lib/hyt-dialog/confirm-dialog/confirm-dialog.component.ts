import { Component, Inject } from "@angular/core";
import { DialogRef } from "../dialog-ref";
import { DIALOG_DATA } from "../dialog-tokens";
import { ConfirmDialogConfig, ConfirmDialogResult } from "./confirm-dialog.model";

@Component({
  selector: "app-confirm-dialog",
  templateUrl: "./confirm-dialog.component.html",
  styleUrls: ["./confirm-dialog.component.scss"],
})
export class ConfirmDialogComponent {
  dismissed = false;

  constructor(
    private dialogRef: DialogRef<ConfirmDialogResult>,
    @Inject(DIALOG_DATA) public data: ConfirmDialogConfig,
  ) { }

  accept() {
    this.dialogRef.close({ result: 'accept', dismissed: this.dismissed });
  }
  reject() {
    this.dialogRef.close({ result: 'reject', dismissed: this.dismissed });
  }
}
