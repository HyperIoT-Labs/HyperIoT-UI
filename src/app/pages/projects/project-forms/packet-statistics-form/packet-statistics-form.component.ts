import { Component, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService } from '@hyperiot/core';
import { ProjectFormEntity } from '../project-form-entity';
import { FormBuilder } from '@angular/forms';
import { I18n } from '@ngx-translate/i18n-polyfill';

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
    private router: Router,
    private i18n: I18n
  ) {
    super(formBuilder, formView);
    this.longDefinition = this.i18n('HYT_statistics_long_definition');
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
