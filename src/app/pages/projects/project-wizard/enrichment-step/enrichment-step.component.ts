import { Component, OnInit, Input, OnChanges, ViewChild, Output, EventEmitter, ElementRef } from '@angular/core';
import { HProject, HDevice, HPacket, Rule, RulesService, AssetstagsService, AssetTag } from '@hyperiot/core';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { RuleDefinitionComponent } from '../rule-definition/rule-definition.component';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { PageStatusEnum } from '../model/pageStatusEnum';
import { Observable } from 'rxjs';
import { MatChipInputEvent } from '@angular/material';
import { startWith, map } from 'rxjs/operators';

@Component({
  selector: 'hyt-enrichment-step',
  templateUrl: './enrichment-step.component.html',
  styleUrls: ['./enrichment-step.component.scss']
})
export class EnrichmentStepComponent implements OnInit, OnChanges {

  @Input() hProject: HProject;

  @Input() hDevices: HDevice[] = [];

  @Input() hPackets: HPacket[] = [];

  devicesOptions: SelectOption[] = [];

  packetsOptions: SelectOption[] = [];

  @ViewChild('ruleDef', { static: false }) ruleDefinitionComponent: RuleDefinitionComponent;

  hPacketsforDevice: HPacket[] = [];

  currentPacket;

  enrichmentForm: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  errors: HYTError[] = [];

  enrichmentRules: SelectOption[] = [
    { value: JSON.stringify({ actionName: "AddCategoryRuleAction", ruleId: 0, categoryIds: null }), label: 'Categories' },
    { value: JSON.stringify({ actionName: "AddTagRuleAction", ruleId: 0, tagIds: null }), label: 'Tags' },
    { value: JSON.stringify({ actionName: "ValidateHPacketRuleAction", ruleId: 0 }), label: 'Validation' }
  ]

  ruleList: Rule[] = [];

  @Output() rulesOutput = new EventEmitter<Rule[]>();

  constructor(
    private fb: FormBuilder,
    private rulesService: RulesService,
    private assetsTagService: AssetstagsService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  ngOnInit() {
    this.filteredTags = this.tagCtrl.valueChanges.pipe(
      startWith(null),
      map((ser: string | null) => ser ? this._filter(ser) : this.tagChoice.slice()));

    this.enrichmentForm = this.fb.group({})
    this.assetsTagService.findAllAssetTag().subscribe(
      res => {

      }
    )
    this.rulesService.findAllRuleActions('ENRICHMENT').subscribe(
      res => { }//TO DO //this.enrichmentRules = res
    )
  }

  ngOnChanges() {
    this.devicesOptions = [];
    for (let el of this.hDevices)
      this.devicesOptions.push({ value: el.id.toString(), label: el.deviceName });
    this.packetsOptions = [];
  }

  deviceChanged(event) {
    this.packetsOptions = [];
    for (let el of this.hPackets)
      if (event.value == el.device.id)
        this.packetsOptions.push({ value: el.id.toString(), label: el.name });
  }

  packetChanged(event) {
    this.currentPacket = this.hPackets.find(x => x.id == event.value);
  }

  createRule() {

    this.pageStatus = PageStatusEnum.Loading;

    this.errors = [];

    var jActions = [this.enrichmentForm.value['enrichmentRule']];
    var jActionStr: string = JSON.stringify(jActions);

    let rule: Rule = {
      name: this.enrichmentForm.value['rule-name'],
      ruleDefinition: this.ruleDefinitionComponent.buildRuleDefinition(),
      description: this.enrichmentForm.value['rule-description'],
      project: this.hProject,
      packet: this.currentPacket,
      jsonActions: jActionStr,
      type: 'ENRICHMENT',
      entityVersion: 1
    }

    this.rulesService.saveRule(rule).subscribe(
      res => {
        this.ruleList.push(res);
        this.rulesOutput.emit(this.ruleList);
        this.pageStatus = PageStatusEnum.Submitted;
      },
      err => {
        this.pageStatus = PageStatusEnum.Error;
        this.errors = this.errorHandler.handleCreateRuleEnrichment(err);
        this.errors.forEach(e => {
          if (e.container != 'general')
            this.enrichmentForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    )

  }

  invalid(): boolean {
    return (
      this.enrichmentForm.get('rule-name').invalid ||
      this.enrichmentForm.get('enrichmentRule').invalid ||
      this.enrichmentForm.get('rule-description').invalid ||
      this.enrichmentForm.get('enrichmentDevice').invalid ||
      this.enrichmentForm.get('enrichmentPacket').invalid ||
      ((this.ruleDefinitionComponent) ? this.ruleDefinitionComponent.isInvalid() : true)
    )
  }

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  isDeviceInserted() {
    return (this.enrichmentForm.get('enrichmentDevice')) ? this.enrichmentForm.get('enrichmentDevice').invalid : true;
  }

  //delete logic

  deleteId: number = -1;

  deleteError: string = null;

  showDeleteModal(id: number) {
    this.deleteError = null;
    this.deleteId = id;
  }

  hideDeleteModal() {
    this.deleteId = -1;
  }

  deleteRule() {
    this.deleteError = null;
    this.rulesService.deleteRule(this.deleteId).subscribe(
      res => {
        for (let i = 0; i < this.ruleList.length; i++) {
          if (this.ruleList[i].id == this.deleteId) {
            this.ruleList.splice(i, 1);
          }
        }
        this.rulesOutput.emit(this.ruleList);
        this.hideDeleteModal();
      },
      err => {
        this.deleteError = "Error executing your request";
      }
    );
  }

  tagCtrl = new FormControl();
  filteredTags: Observable<AssetTag[]>;
  tags: AssetTag[] = [];
  allTags: AssetTag[] = [{ name: 'Tag1', entityVersion: 1 }, { name: 'Luerhgugreugr', entityVersion: 1 }, { name: 'Tag2', entityVersion: 1 }, { name: 'Tag3', entityVersion: 1 }];
  tagChoice: AssetTag[] = [{ name: 'Tag1', entityVersion: 1 }, { name: 'Luerhgugreugr', entityVersion: 1 }, { name: 'Tag2', entityVersion: 1 }, { name: 'Tag3', entityVersion: 1 }];

  @ViewChild('tagInput', { static: false }) tagInput: ElementRef<HTMLInputElement>;

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    if ((value || '').trim()) {

      let assetTag: AssetTag;

      if (this.tags.find(x => x.name === event.value))
        return;
      else if (this.allTags.some(x => x.name === event.value)) {
        assetTag = this.allTags.find(x => x.name === event.value)
        this.selected({ option: { value: assetTag } })
      }
      else {
        assetTag = {
          name: event.value,
          entityVersion: 1
        }
        this.tags.push(assetTag);
      }

      this.assetsTagService.saveAssetTag(assetTag);//TO DO .subsscribe()
    }

    if (input) {
      input.value = '';
    }

    this.tagCtrl.setValue(null);
  }

  remove(tag: AssetTag): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      // this.assetsTagService.deleteAssetTag(tag.id).subscribe(
      //   res => {
      this.tags.splice(index, 1);
      if (this.allTags.find(x => x.name == tag.name)) {
        this.tagChoice.push(tag);
        this.tagCtrl.setValue(null);
      }
      //   },
      //   err => { console.log("Error removing tag") }
      // )
    }
  }

  selected(event): void {
    this.tags.push(event.option.value);
    for (let k = 0; k < this.tagChoice.length; k++) {
      if (this.tagChoice[k].name == event.option.value.name)
        this.tagChoice.splice(k, 1);
    }
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  private _filter(value: string | AssetTag): AssetTag[] {
    let filterValue: string = (typeof value == 'string') ? value.toLowerCase() : value.name.toLowerCase()
    return this.tagChoice.filter(tag => tag.name.toLowerCase().includes(filterValue));
  }

}
