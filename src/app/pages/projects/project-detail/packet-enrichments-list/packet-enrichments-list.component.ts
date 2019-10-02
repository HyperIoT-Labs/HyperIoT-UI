import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { HPacket, Rule } from '@hyperiot/core';
import { PacketEnrichmentsService } from 'src/app/services/packet-enrichments.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'hyt-packet-enrichments-list',
  templateUrl: './packet-enrichments-list.component.html',
  styleUrls: ['./packet-enrichments-list.component.scss']
})
export class PacketEnrichmentsListComponent implements OnInit, OnDestroy {
  @Input() packet: HPacket;

  rules: Rule[];

  private ruleServiceSubscription: Subscription;

  constructor(
    private enrichmentsService: PacketEnrichmentsService
  ) { }

  ngOnInit() {
    this.enrichmentsService.setPacket(this.packet.id);
    this.ruleServiceSubscription = this.enrichmentsService.ruleList$.subscribe((ruleList: Rule[]) => {
      this.rules = ruleList;
    });
    this.enrichmentsService.getRuleList();
  }

  ngOnDestroy() {
    this.ruleServiceSubscription.unsubscribe();
  }
}
