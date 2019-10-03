import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { HPacket, Rule } from '@hyperiot/core';
import { PacketEnrichmentsService } from 'src/app/services/packet-enrichments.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'hyt-packet-enrichments-list',
  templateUrl: './packet-enrichments-list.component.html',
  styleUrls: ['./packet-enrichments-list.component.scss']
})
export class PacketEnrichmentsListComponent implements OnInit, OnDestroy {
  @Output() ruleClick = new EventEmitter<Rule>();

  private _packet: HPacket;
  @Input()
  set packet(packet: HPacket) {
    this._packet = packet;
    this.loadData();
  }

  rules: Rule[];

  private ruleServiceSubscription: Subscription;

  constructor(
    private enrichmentsService: PacketEnrichmentsService
  ) { }

  ngOnInit() {
  }

  ngOnDestroy() {
    this.ruleServiceSubscription.unsubscribe();
  }

  onRuleClick(rule: Rule) {
    this.ruleClick.emit(rule);
  }

  loadData() {
    this.enrichmentsService.setPacket(this._packet.id);
    this.ruleServiceSubscription = this.enrichmentsService.ruleList$.subscribe((ruleList: Rule[]) => {
      this.rules = ruleList;
    });
    this.enrichmentsService.getRuleList();
  }
}
