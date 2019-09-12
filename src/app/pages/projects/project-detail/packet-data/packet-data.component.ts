import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { HPacket, HpacketsService } from '@hyperiot/core';
import { Observable } from 'rxjs';
import { SaveChangesDialogComponent } from 'src/app/components/dialogs/save-changes-dialog/save-changes-dialog.component';
import { map } from 'rxjs/operators';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material';

@Component({
  selector: 'hyt-packet-data',
  templateUrl: './packet-data.component.html',
  styleUrls: ['./packet-data.component.scss']
})
export class PacketDataComponent implements OnInit {
  packetId: number;
  packet: HPacket = {} as HPacket;

  form: FormGroup;
  originalValue: string;

  constructor(
    private hPacketService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private dialog: MatDialog
  ) {
    this.form = this.formBuilder.group({});
    this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.packetId = this.activatedRoute.snapshot.params.packetId;
        this.loadPacket();
      }
    });
  }

  ngOnInit() {
  }

  isDirty(): boolean {
    return JSON.stringify(this.form.value) !== this.originalValue;
  }

  canDeactivate(): Observable<any> | boolean {
    if (this.isDirty()) {
      return this.openDialog();
    }
    return true;
  }

  private loadPacket() {
    this.hPacketService.findHPacket(this.packetId).subscribe((p) => {
      this.packet = p;
      // TODO: populate form fields
      this.originalValue = JSON.stringify(this.form.value);
    });
  }

  private openDialog(): Observable<any> {
    const dialogRef = this.dialog.open(SaveChangesDialogComponent, {
      data: {title: 'Discard changes?', message: 'There are pending changes to be saved.'}
    });
    return dialogRef.afterClosed().pipe(map((result) => {
      if (result === 'save') {
        // TODO: implement saving with promise
      }
      return result === 'discard' || result === 'save';
    }));
  }
}
