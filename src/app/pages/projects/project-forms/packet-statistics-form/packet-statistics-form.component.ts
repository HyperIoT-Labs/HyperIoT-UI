import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService } from '@hyperiot/core';
import { ProjectFormEntity } from '../project-form-entity';
import { FormBuilder } from '@angular/forms';

@Component({
  selector: 'hyt-packet-statistics-form',
  templateUrl: './packet-statistics-form.component.html',
  styleUrls: ['./packet-statistics-form.component.scss']
})
export class PacketStatisticsFormComponent extends ProjectFormEntity implements OnDestroy {
  private routerSubscription: Subscription;
  private packetId: number;

  constructor(
    formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hPacketService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(formBuilder, formView);
    this.longDefinition = 'statistics long definition';//@I18N@
    this.hideDelete = true; // hide 'Delete' button
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.packetId = +(activatedRoute.snapshot.params.packetId);
        // TODO: load data
      }
    });
  }

  ngOnDestroy() {
    this.routerSubscription.unsubscribe();
  }

}
