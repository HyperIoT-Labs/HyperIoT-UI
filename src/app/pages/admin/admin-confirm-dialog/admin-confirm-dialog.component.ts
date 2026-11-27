import { A11yModule } from '@angular/cdk/a11y';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ComponentsModule, DIALOG_DATA, DialogRef, DialogService } from 'components';
import { Observable, map } from 'rxjs';

export interface AdminConfirmDialogData {
  title: string;
  message: string;
  confirmLabel: string;
}

let nextId = 0;

/** Closes with `true` only when confirmed. */
@Component({
  selector: 'hyt-admin-confirm-dialog',
  imports: [A11yModule, MatButtonModule, ComponentsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(keydown.escape)': 'close(false)',
  },
  template: `
    <div
      hyt-dialog
      role="alertdialog"
      aria-modal="true"
      [attr.aria-labelledby]="titleId"
      [attr.aria-describedby]="messageId"
      cdkTrapFocus
      [cdkTrapFocusAutoCapture]="true"
    >
      <h2 hyt-dialog-header align="start" class="title" [id]="titleId">{{ data.title }}</h2>
      <p hyt-dialog-content class="message" [id]="messageId">{{ data.message }}</p>
      <div hyt-dialog-footer class="footer">
        <button mat-button type="button" cdkFocusInitial (click)="close(false)" i18n="@@HYT_cancel">Cancel</button>
        <button mat-flat-button color="warn" type="button" (click)="close(true)">{{ data.confirmLabel }}</button>
      </div>
    </div>
  `,
  styles: `
    .title {
      font-size: 1.25em;
      margin: 0;
    }

    .message {
      margin: 0;
    }

    .footer {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 8px;
    }

    button {
      min-height: 44px;
    }
  `,
})
export class AdminConfirmDialogComponent {
  protected readonly data = inject<AdminConfirmDialogData>(DIALOG_DATA);
  private readonly dialogRef = inject<DialogRef<boolean>>(DialogRef);

  protected readonly titleId = `hyt-admin-confirm-title-${nextId}`;
  protected readonly messageId = `hyt-admin-confirm-message-${nextId++}`;

  protected close(confirmed: boolean): void {
    this.dialogRef.close(confirmed);
  }
}

export function openAdminConfirmDialog(dialogService: DialogService, data: AdminConfirmDialogData): Observable<boolean> {
  return dialogService
    .open<AdminConfirmDialogComponent, AdminConfirmDialogData, boolean>(AdminConfirmDialogComponent, {
      data,
      width: '480px',
      maxWidth: 'calc(100vw - 32px)',
    })
    .dialogRef.afterClosed()
    .pipe(map(confirmed => confirmed === true));
}
