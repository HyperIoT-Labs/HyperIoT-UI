import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { HDevice, HPacket, HpacketsService } from '@hyperiot/core';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';

@Component({
  selector: 'hyt-packet-select',
  templateUrl: './packet-select.component.html',
  styleUrls: ['./packet-select.component.scss']
})
export class PacketSelectComponent implements OnInit {

  hPackets: HPacket[] = [];

  @Output() currentPacket = new EventEmitter<HPacket>();

  selectForm: FormGroup;

  devicesOptions: SelectOption[] = [];
  packetsOptions: SelectOption[] = [];

  constructor(
    private fb: FormBuilder,
    private wizardService: ProjectWizardService,
    private hPacketService: HpacketsService
  ) { }

  ngOnInit() {
    this.selectForm = this.fb.group({});
    this.wizardService.hDevices$.subscribe(
      (res: HDevice[]) => {
        this.selectForm.reset();
        this.devicesOptions = [];
        this.packetsOptions = [];
        this.currentPacket.emit(null);
        for (let el of res)
          this.devicesOptions.push({ value: el, label: el.deviceName });
      }
    );
    this.wizardService.hPackets$.subscribe(
      (res: HPacket[]) => {
        this.hPackets = res;
        this.selectForm.reset();
        this.packetsOptions = [];
        this.currentPacket.emit(null);
      }
    );
  }

  deviceChanged(event) {
    this.packetsOptions = [];
    this.selectForm.patchValue({
      selectPacket: null
    });
    this.currentPacket.emit(null);
    this.hPackets.filter(p => p.device.id == event.value.id).forEach(p => this.packetsOptions.push({ value: p, label: p.name }));
  }

  packetChanged(event) {
    this.hPacketService.findHPacket(event.value.id).subscribe(
      res => this.currentPacket.emit(res)//TODO THIS REQUEST IS TO UPDATE PACKET FIELD FOR ENRICHMENT AND EVENT. BEST SOLUTION IS TO ADD, UPDATE OR DELETE FIELDS MANUALLY ON WIZARDSERVICE.
    )
  }

}
