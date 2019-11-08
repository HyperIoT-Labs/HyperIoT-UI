import { Injectable } from '@angular/core';
import { HProject, HDevice, HPacket, Rule, HdevicesService, HpacketsService, RulesService, HPacketField } from '@hyperiot/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProjectWizardService {

  hDevices: HDevice[] = [];
  hDevices$: Subject<HDevice[]> = new Subject<HDevice[]>();

  hPackets: HPacket[] = [];
  hPackets$: Subject<HPacket[]> = new Subject<HPacket[]>();

  treeFields$: Subject<HPacketField[]> = new Subject<HPacketField[]>();

  enrichmentRules: Rule[] = [];
  enrichmentRules$: Subject<Rule[]> = new Subject<Rule[]>();

  eventRules: Rule[] = [];
  eventRules$: Subject<Rule[]> = new Subject<Rule[]>();

  autoSelect$: Subject<void>[] = [new Subject<void>(), new Subject<void>(), new Subject<void>(), new Subject<void>()];

  // TODO find better solution for hint (maybe just one hint column)
  hint$: Subject<string>[] = [
    new Subject<string>(),
    new Subject<string>(),
    new Subject<string>(),
    new Subject<string>(),
    new Subject<string>(),
    new Subject<string>(),
    new Subject<string>()
  ];

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

  treefy(fieldList: HPacketField[]): HPacketField[] {
    const treefiedFields = [];
    fieldList.forEach(x => {
      const parent: HPacketField = this.findParent(fieldList, x);
      if (parent && !treefiedFields.some(y => y.id === parent.id)) {
        treefiedFields.push(parent);
      }
    });
    return treefiedFields;
  }

  treefyById(packetId: number): HPacketField[] {
    return this.treefy(this.hPackets.find(x => x.id === packetId).fields);
  }

  findParent(fieldList: HPacketField[], packetField: HPacketField): HPacketField {
    const parent: HPacketField = fieldList.find(x => x.innerFields.some(y => y.id === packetField.id));
    if (parent) {
      return this.findParent(fieldList, parent);
    } else {
      return packetField;
    }
  }

  getDevices(): void {
    this.hDevicesService.findAllHDeviceByProjectId(this._hProject.id).subscribe(
      (res: HDevice[]) => {
        this.hDevices = res;
        this.hDevices$.next(this.hDevices);
      },
      err => this.hDevices$.error(err)
    );
  }

  addDevice(device: HDevice): void {
    this.hDevices.push(device);
    this.hDevices$.next(this.hDevices);
  }

  updateDevice(device: HDevice): void {
    const dev = this.hDevices.find(x => x.id === device.id);
    this.hDevices[this.hDevices.indexOf(dev)] = device;
    this.hDevices$.next(this.hDevices);
  }

  deleteDevice(id: number): void {
    for (let k = 0; k < this.hDevices.length; k++) {
      if (this.hDevices[k].id === id) {
        this.hDevices.splice(k, 1);
      }
    }
    this.hDevices$.next(this.hDevices);
  }


  getPackets(): void {
    this.hPacketsService.findAllHPacketByProjectId(this._hProject.id).subscribe(
      (res: HPacket[]) => {
        this.hPackets = res;
        this.hPackets$.next(this.hPackets);
      },
      err => this.hPackets$.error(err)
    );
  }

  addPacket(packet: HPacket): void {
    this.hPackets.push(packet);
    this.hPackets$.next(this.hPackets);
  }

  updatePacket(packet: HPacket): void {
    const dev = this.hPackets.find(x => x.id === packet.id);
    this.hPackets[this.hPackets.indexOf(dev)] = packet;
    this.hPackets$.next(this.hPackets);
  }

  deletePacket(id: number): void {
    for (let k = 0; k < this.hPackets.length; k++) {
      if (this.hPackets[k].id === id) {
        this.hPackets.splice(k, 1);
      }
    }
    this.hPackets$.next(this.hPackets);
  }

  getEnrichmentRule(): void {
    this.rulesService.findAllRuleByPacketId(this._hProject.id).subscribe(
      (res: Rule[]) => {
        this.enrichmentRules = res.filter(x => x.type === 'ENRICHMENT');
        this.enrichmentRules$.next(this.enrichmentRules);
      },
      err => this.enrichmentRules$.error(err)
    );
  }

  addEnrichmentRule(rule: Rule): void {
    this.enrichmentRules.push(rule);
    this.enrichmentRules$.next(this.enrichmentRules);
  }

  updateEnrichmentRule(rule: Rule): void {
    const rul = this.enrichmentRules.find(x => x.id === rule.id);
    this.enrichmentRules[this.enrichmentRules.indexOf(rul)] = rule;
    this.enrichmentRules$.next(this.enrichmentRules);
  }

  deleteEnrichmentRule(id: number): void {
    for (let k = 0; k < this.enrichmentRules.length; k++) {
      if (this.enrichmentRules[k].id === id) {
        this.enrichmentRules.splice(k, 1);
      }
    }
    this.enrichmentRules$.next(this.enrichmentRules);
  }

  getEventRule(): void {
    this.rulesService.findAllRuleByPacketId(this._hProject.id).subscribe(
      (res: Rule[]) => {
        this.eventRules = res.filter(x => x.type === 'EVENT');
        this.eventRules$.next(this.eventRules);
      },
      err => this.eventRules$.error(err)
    );
  }

  addEventRule(rule: Rule): void {
    this.eventRules.push(rule);
    this.eventRules$.next(this.eventRules);
  }

  updateEventRule(rule: Rule): void {
    const rul = this.eventRules.find(x => x.id === rule.id);
    this.eventRules[this.eventRules.indexOf(rul)] = rule;
    this.eventRules$.next(this.eventRules);
  }

  deleteEventRule(id: number): void {
    for (let k = 0; k < this.eventRules.length; k++) {
      if (this.eventRules[k].id === id) {
        this.eventRules.splice(k, 1);
      }
    }
    this.eventRules$.next(this.eventRules);
  }

  updateHint(hint: string, stepId: number) {
    this.hint$[stepId].next(hint);
  }

  stepChanged(id: number): void {
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
        this.autoSelect$[0].next();
        break;
      }
      case 4: {
        this.autoSelect$[1].next();
        this.enrichmentRules$.next(this.enrichmentRules); // TODO service to get all rules by projectId (BE)
        // this.getEnrichmentRule();
        break;
      }
      case 5: {
        this.autoSelect$[2].next();
        break;
      }
      case 6: {
        this.autoSelect$[3].next();
        this.eventRules$.next(this.eventRules); // TODO service to get all rules by projectId (BE)
        // this.getEventRule();
        break;
      }
      default: {
        console.log('error');
      }
    }
  }

}
