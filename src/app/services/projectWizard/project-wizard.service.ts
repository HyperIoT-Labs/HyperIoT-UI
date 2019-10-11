import { Injectable } from '@angular/core';
import { HProject, HDevice, HPacket, Rule, HdevicesService, HpacketsService, RulesService } from '@hyperiot/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectWizardService {

  constructor(
    private hDevicesService: HdevicesService,
    private hPacketsService: HpacketsService,
    private rulesService: RulesService
  ) { }

  private _hProject: HProject;
  setHProject(pr: HProject): void {
    this._hProject = pr;
  }
  getHProject(): HProject {
    return this._hProject;
  }

  hDevices: HDevice[] = [];
  hDevices$: Subject<HDevice[]> = new Subject<HDevice[]>();

  hPackets: HPacket[] = [];
  hPackets$: Subject<HPacket[]> = new Subject<HPacket[]>();

  enrichmentRules: Rule[] = [];
  enrichmentRules$: Subject<Rule[]> = new Subject<Rule[]>();

  eventRules: Rule[] = [];
  eventRules$: Subject<Rule[]> = new Subject<Rule[]>();

  getDevices() {
    this.hDevicesService.findAllHDeviceByProjectId(this._hProject.id).subscribe(
      (res: HDevice[]) => {
        this.hDevices = res;
        this.hDevices$.next(this.hDevices);
      },
      err => this.hDevices$.error(err)
    )
  }

  addDevice(device: HDevice) {
    this.hDevices.push(device);
    this.hDevices$.next(this.hDevices);
  }

  updateDevice(device: HDevice) {
    let dev = this.hDevices.find(x => x.id == device.id);
    this.hDevices[this.hDevices.indexOf(dev)] = device;
    this.hDevices$.next(this.hDevices);
  }

  deleteDevice(id: number) {
    for (let k = 0; k < this.hDevices.length; k++) {
      if (this.hDevices[k].id == id)
        this.hDevices.splice(k, 1);
    }
    this.hDevices$.next(this.hDevices);
  }


  getPackets() {
    this.hPacketsService.findAllHPacketByProjectId(this._hProject.id).subscribe(
      (res: HPacket[]) => {
        this.hPackets = res;
        this.hPackets$.next(this.hPackets);
      },
      err => this.hPackets$.error(err)
    )
  }

  addPacket(packet: HPacket) {
    this.hPackets.push(packet);
    this.hPackets$.next(this.hPackets);
  }

  updatePacket(packet: HPacket) {
    let dev = this.hPackets.find(x => x.id == packet.id);
    this.hPackets[this.hPackets.indexOf(dev)] = packet;
    this.hPackets$.next(this.hPackets);
  }

  deletePacket(id: number) {
    for (let k = 0; k < this.hPackets.length; k++) {
      if (this.hPackets[k].id == id)
        this.hPackets.splice(k, 1);
    }
    this.hPackets$.next(this.hPackets);
  }

  getEnrichmentRule() {
    this.rulesService.findAllRuleByPacketId(this._hProject.id).subscribe(
      (res: Rule[]) => {
        this.enrichmentRules = res.filter(x => x.type == 'ENRICHMENT');
        this.enrichmentRules$.next(this.enrichmentRules);
      },
      err => this.enrichmentRules$.error(err)
    )
  }

  addEnrichmentRule(rule: Rule) {
    this.enrichmentRules.push(rule);
    this.enrichmentRules$.next(this.enrichmentRules);
  }

  updateEnrichmentRule(rule: Rule) {
    let rul = this.enrichmentRules.find(x => x.id == rule.id);
    this.enrichmentRules[this.enrichmentRules.indexOf(rul)] = rule;
    this.enrichmentRules$.next(this.enrichmentRules);
  }

  deleteEnrichmentRule(id: number) {
    for (let k = 0; k < this.enrichmentRules.length; k++) {
      if (this.enrichmentRules[k].id == id)
        this.enrichmentRules.splice(k, 1);
    }
    this.enrichmentRules$.next(this.enrichmentRules);
  }

  getEventRule() {
    this.rulesService.findAllRuleByPacketId(this._hProject.id).subscribe(
      (res: Rule[]) => {
        this.eventRules = res.filter(x => x.type == 'EVENT');
        this.eventRules$.next(this.eventRules);
      },
      err => this.eventRules$.error(err)
    )
  }

  addEventRule(rule: Rule) {
    this.eventRules.push(rule);
    this.eventRules$.next(this.eventRules);
  }

  updateEventRule(rule: Rule) {
    let rul = this.eventRules.find(x => x.id == rule.id);
    this.eventRules[this.eventRules.indexOf(rul)] = rule;
    this.eventRules$.next(this.eventRules);
  }

  deleteEventRule(id: number) {
    for (let k = 0; k < this.eventRules.length; k++) {
      if (this.eventRules[k].id == id)
        this.eventRules.splice(k, 1);
    }
    this.eventRules$.next(this.eventRules);
  }

  stepChanged(id: number) {
    switch (id) {
      case 0: {
        break;
      }
      case 1: {
        this.getDevices();
        break;
      }
      case 2: {
        this.getPackets();
        break;
      }
      case 3: {
        break;
      }
      case 4: {
        this.enrichmentRules$.next(this.enrichmentRules);//TODO service to get all rules by projectId (BE)
        //this.getEnrichmentRule();
        break;
      }
      case 5: {
        break;
      }
      case 6: {
        this.eventRules$.next(this.eventRules);//TODO service to get all rules by projectId (BE)
        //this.getEventRule();
        break;
      }
      default: {
        console.log("error");
      }
    }
  }


}
