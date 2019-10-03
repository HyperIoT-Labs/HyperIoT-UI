import { Component, Input, OnDestroy, OnInit, Output, EventEmitter } from '@angular/core';
import { HPacket, Rule, RulesService } from '@hyperiot/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'hyt-packet-enrichments-list',
  templateUrl: './packet-enrichments-list.component.html',
  styleUrls: ['./packet-enrichments-list.component.scss']
})
export class PacketEnrichmentsListComponent {
  @Output() ruleClick = new EventEmitter<Rule>();

  private _packet: HPacket;
  @Input()
  set packet(packet: HPacket) {
    this._packet = packet;
    this.loadData();
  }

  rules: Rule[];

  constructor(
    private rulesService: RulesService
  ) { }

  onRuleClick(rule: Rule) {
    this.ruleClick.emit(rule);
  }

  loadData() {
    this.rulesService.findAllRuleByPacketId(this._packet.id).subscribe((rules: Rule[]) => {
      this.rules = rules;
    });
  }
}
