import { Injectable } from '@angular/core';
import { HpacketsService, RulesService, Rule } from '@hyperiot/core';
import { Subject } from 'rxjs';

@Injectable()
export class PacketEnrichmentsService {
  private packetId: number;

  ruleList$ = new Subject<Rule[]>();

  constructor(
    private packetsService: HpacketsService,
    private rulesService: RulesService
  ) {
    // TODO:
  }

  setPacket(packetId: number) {
    this.packetId = packetId;
  }

  getRuleList() {
    this.rulesService.findAllRuleByPacketId(this.packetId).subscribe((rules: Rule[]) => {
      console.log(rules);
      this.ruleList$.next(rules);
    });
  }

}
