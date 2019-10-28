import { Component, OnInit, Input, ViewChild, Output, EventEmitter, ElementRef, OnDestroy } from '@angular/core';
import { HPacket, Rule, RulesService, HpacketsService, HProject } from '@hyperiot/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { SelectOption } from '@hyperiot/components';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { RuleDefinitionComponent } from '../rule-definition/rule-definition.component';
import { AssetTagComponent } from './asset-tag/asset-tag.component';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';
import { I18n } from '@ngx-translate/i18n-polyfill';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
// TODO: find a bettere placement for PageStatusEnum
import { PageStatusEnum } from '../../project-wizard/model/pageStatusEnum';
import { ProjectFormEntity } from '../project-form-entity';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

@Component({
  selector: 'hyt-packet-enrichment-form',
  templateUrl: './packet-enrichment-form.component.html',
  styleUrls: ['./packet-enrichment-form.component.scss']
})
export class PacketEnrichmentFormComponent extends ProjectFormEntity implements OnInit, OnDestroy {

  @ViewChild('ruleDef', { static: false }) ruleDefinitionComponent: RuleDefinitionComponent;

  @ViewChild('assetTag', { static: false }) assetTagComponent: AssetTagComponent;

  @Output() saveRule = new EventEmitter();

  @Output() updateRule = new EventEmitter();

  @Input() packet: HPacket;

  packetList: HPacket[] = [];
  project: HProject = {} as HProject;
  form: FormGroup;

  PageStatus = PageStatusEnum;
  pageStatus: PageStatusEnum = PageStatusEnum.Default;

  enrichmentRules: SelectOption[] = [
    { value: JSON.stringify({ actionName: "AddCategoryRuleAction", ruleId: 0, categoryIds: null }), label: this.i18n('HYT_categories') },
    { value: JSON.stringify({ actionName: "AddTagRuleAction", ruleId: 0, tagIds: null }), label: this.i18n('HYT_tags') },
    { value: JSON.stringify({ actionName: "ValidateHPacketRuleAction", ruleId: 0 }), label: this.i18n('HYT_validation') }
  ];


  enrichmentType = '';

  assetTags: number[] = [];
  assetCategories: number[] = [];

  editMode = false;

  private routerSubscription: Subscription;
  private activatedRouteSubscription: Subscription;
  private packetId: number;

  constructor(
    public formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private rulesService: RulesService,
    private packetService: HpacketsService,
    private wizardService: ProjectWizardService,
    private errorHandler: ProjectWizardHttpErrorHandlerService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private i18n: I18n
  ) {
    super(formBuilder, formView);
    this.longDefinition = 'enrichment long definition';//@I18N@
    this.hideDelete = true; // hide 'Delete' button
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.packetId = +(activatedRoute.snapshot.params.packetId);
        this.loadData();
      }
    });
    this.activatedRouteSubscription = this.activatedRoute.params.subscribe(routeParams => {
      this.editMode = false;
      this.packetId = +(activatedRoute.snapshot.params.packetId);
      this.loadData();
    });
  }

  ngOnInit() {
    //this.rulesService.findAllRuleActions('ENRICHMENT').subscribe(
    //  res => { }//TODO //this.enrichmentRules = res
    //);
  }
  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  edit(rule: Rule) {
    this.editMode = true;
    this.setForm(rule);
  }

  loadData() {
    this.summaryList = null;
    this.packetService.findHPacket(this.packetId).subscribe((p: HPacket) => {
      this.project = p.device.project;
      this.packetService.findAllHPacketByProjectId(this.project.id)
        .subscribe((pl: HPacket[]) => {
          this.packetList = pl;
          this.packet = p;
          // update rules summary list (on the right side)
          this.rulesService.findAllRuleByPacketId(this.packet.id).subscribe((rules: Rule[]) => {
            this.summaryList = {
              title: 'Enrichments Data',
              list: rules.filter((i) => {
                if (i.type === Rule.TypeEnum.ENRICHMENT) {
                  return { name: i.name, description: i.description, data: i };
                }
              }) as any
            };
          });
      });
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: p.id, type: 'packet-enrichments'
      });
    });
  }

  enrichmentTypeChanged(event) {
    if (event.value) {
      this.enrichmentType = JSON.parse(event.value).actionName;
    }
  }

  postRule() {

    //this.errors = [];

    this.pageStatus = PageStatusEnum.Loading;

    var jActions = [this.form.value['enrichmentRule']];
    var jActionStr: string = JSON.stringify(jActions);

    const project = this.packet.device.project;
    let rule: Rule = {
      name: this.form.value['rule-name'],
      ruleDefinition: this.ruleDefinitionComponent.buildRuleDefinition(),
      description: this.form.value['rule-description'],
      project: {
        id: project.id,
        entityVersion: project.entityVersion
      },
      packet: this.packet,
      jsonActions: jActionStr,
      type: 'ENRICHMENT',
      entityVersion: 1
    };

    this.rulesService.saveRule(rule).subscribe(
      res => {
//this.resetForm('ADD');
        this.resetForm();
        this.wizardService.addEnrichmentRule(res);
        this.pageStatus = PageStatusEnum.Submitted;
      },
      err => {
        this.pageStatus = PageStatusEnum.Error;
/*        this.errors = this.errorHandler.handleCreateRule(err);
        this.errors.forEach(e => {
          if (e.container != 'general') {
            this.form.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
          }
        });*/
      }
    );

    if (this.enrichmentType == 'AddTagRuleAction') {
      this.packet.tagIds = this.assetTags;
      this.packetService.updateHPacket(this.packet).subscribe(
        (res: HPacket) => {
        }
      );
    } else if (this.enrichmentType == 'AddCategoryRuleAction') {
      this.packet.categoryIds = this.assetCategories;
      this.packetService.updateHPacket(this.packet).subscribe(
        (res: HPacket) => {
        }
      );
    }

  }

  putRule() {
//this.errors = [];
    this.updateRule.emit();
  }

  invalid(): boolean {
    return (
      this.form.get('rule-name').invalid ||
      this.form.get('enrichmentRule').invalid ||
      this.form.get('rule-description').invalid ||
      ((this.ruleDefinitionComponent) ? this.ruleDefinitionComponent.isInvalid() : true)
    );
  }

  setForm(data: Rule) {
    let type = JSON.parse(data.jsonActions)[0] || null;
    this.ruleDefinitionComponent.setRuleDefinition(data.ruleDefinition);
    this.form.get('rule-description').setValue(data.description);
    this.form.get('rule-name').setValue(data.name);
    this.form.get('enrichmentRule').setValue(type);
    type = JSON.parse(type);
    this.enrichmentType = type ? type.actionName : null;
    this.resetForm();
  }

  resetForm() {
    super.resetForm();
    //this.errors = [];
    this.ruleDefinitionComponent.resetRuleDefinition();
    //this.form.reset();
  }

  /*
  //error logic

  errors: HYTError[] = [];

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }
  isDeviceInserted() {
    return (this.form.get('enrichmentDevice')) ? this.form.get('enrichmentDevice').invalid : true;
  }
  */

  //Tags
  updateAssetTag(event) {
    this.assetTags = event;
  }

  //Category
  updateAssetCategory(event) {
    this.assetCategories = event;
  }

  updateHint(event: string) {
    this.wizardService.updateHint(event, 4);
  }

}
