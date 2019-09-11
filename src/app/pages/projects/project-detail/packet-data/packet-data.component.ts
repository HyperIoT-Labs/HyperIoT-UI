import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { HPacket, HpacketsService } from '@hyperiot/core';

@Component({
  selector: 'hyt-packet-data',
  templateUrl: './packet-data.component.html',
  styleUrls: ['./packet-data.component.scss']
})
export class PacketDataComponent implements OnInit {
  packetId: number;
  packet: HPacket = {} as HPacket;

  constructor(
    private hPacketService: HpacketsService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.packetId = this.activatedRoute.snapshot.params.packetId;
        this.hPacketService.findHPacket(this.packetId).subscribe((p) => {
          this.packet = p;
        });
      }
    });
  }


  ngOnInit() {
  }

}
