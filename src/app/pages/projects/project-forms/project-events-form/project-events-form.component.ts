import { Component, OnChanges, OnDestroy, ViewChild, Input, Injector, ViewEncapsulation, ChangeDetectorRef, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { Subscription, Observable } from 'rxjs';

import { HpacketsService, HPacket, HProject, RulesService, Rule, AssetstagsService, AssetTag } from '@hyperiot/core';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { RuleDefinitionComponent } from '../rule-definition/rule-definition.component';
import { EventMailComponent } from './event-mail/event-mail.component';
import { Option } from '@hyperiot/components';
import { SummaryListItem } from '../../project-detail/generic-summary-list/generic-summary-list.component';
import { TagStatus } from '../packet-enrichment-form/asset-tag/asset-tag.component';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { EventComponentContainerComponent } from './event-component-container/event-component-container.component';
import { EventComponentType } from './event-component-type.enum';

@Component({
  selector: 'hyt-project-events-form',
  templateUrl: './project-events-form.component.html',
  styleUrls: ['./project-events-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectEventsFormComponent extends ProjectFormEntity implements OnInit, OnChanges, OnDestroy {

  entity: Rule = {} as Rule;
  entityFormMap = {
    'rule-name': {
      field: 'name'
    },
    'rule-description': {
      field: 'description'
    }
  };

  private activatedRouteSubscription: Subscription;

  @Input()
  currentProject: HProject;

  @ViewChild('eventDef')
  ruleDefinitionComponent: RuleDefinitionComponent;

  @ViewChild('eventComponentContainer')
  eventComponentContainer: EventComponentContainerComponent;

  outputOptions: Option[] = [
    { value: EventComponentType.SEND_MAIL_ACTION, label: $localize`:@@HYT_send_email:SEND E-MAIL`, checked: true },
    { value: EventComponentType.SEND_MQTT_COMMAND_ACTION, label: $localize`:@@HYT_send_mqtt_command:SEND MQTT COMMAND`}
    // { value: '', label: $localize`:@@HYT_start_statistic:START STATISTIC` }
  ];

  // the following properties allow tag management
  // at the moment, on tag can be assigned to event at most
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  tagStatus: TagStatus = TagStatus.Default;
  allTags: AssetTag[];
  selectedTags: AssetTag[];  // remember, at the moment one entry at most, btw here it is an array to support more than one
  tagCtrl = new FormControl();

  isActive: boolean; // TODO bind this property to RuleAction object

  constructor(
    injector: Injector,
    private hPacketService: HpacketsService,
    private rulesService: RulesService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private assetsTagService: AssetstagsService
  ) {
    super(injector,cdr);
    this.formTemplateId = 'container-events';
    this.longDefinition = this.entitiesService.event.longDefinition;
    this.formTitle = this.entitiesService.event.formTitle;
    this.icon = this.entitiesService.event.icon;
    this.hideDelete = true; // hide 'Delete' button
    this.isActive = false;  // TODO bind this property to RuleAction object
    this.activatedRouteSubscription = this.activatedRoute.parent.params.subscribe(routeParams => {
      if (routeParams.projectId) {
        this.currentProject = {id: routeParams.projectId, entityVersion: null}; // read id of project
        this.loadData();
      }
    });
    this.selectedTags = [];
  }

  ngOnInit() {
    this.getAssetTags();
  }

  ngOnChanges() {
    if (this.currentProject) {
      this.updateSummaryList();
    }
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
  }

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add our tag
    if ((value || '').trim()) {
      const tag = this.allTags.find(tag => tag.name === value.trim());
      if (tag)
        this.selectedTags[0] = tag;
      else
        this.selectedTags = [];
    }
    // Reset the input value
    if (input) {
      input.value = '';
    }
    this.tagCtrl.setValue(null);
  }

  getAssetTags() {
    this.tagStatus = TagStatus.Default;
    this.assetsTagService.findAllAssetTag().subscribe(
      res => {
        this.allTags = res;
        this.tagStatus = TagStatus.Loaded;
      },
      err => {
        this.tagStatus = TagStatus.Error;
      }
    );
  }

  remove(): void {
    this.selectedTags = [];
  }

  save(successCallback, errorCallback) {
    this.saveEvent(successCallback, errorCallback);
  }

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedTags[0] = this.allTags.find(tag => tag.name === event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }

  loadEmpty() {
    this.form.reset();
    this.ruleDefinitionComponent.resetRuleDefinition();
    this.eventComponentContainer.reset();
    this.entity = { ... this.entitiesService.event.emptyModel };
    this.changeEventView(EventComponentType.SEND_MAIL_ACTION)
    this.edit();
  }

  edit(rule?: Rule, readyCallback?) {
    const proceedWithEdit = () => {
      this.showCancel = true;
      this.editMode = true;
      super.edit(rule, () => {
        // retrieve first tag id of event
        const oldTagId = this.entity.tagIds.length > 0 ?
          this.entity.tagIds[0] : 0;
        // if tag id exists (i.e. is not equal to 0), find tag object among all tags retrieved from database
        const oldTag = (oldTagId === 0) ? null : this.allTags.find(tag => tag.id === this.entity.tagIds[0]);
        // if a tag has been found, set it to selectedTag property (at the moment, only one tag inside array)
        this.selectedTags = oldTag ? [oldTag] : [];
        this.ruleDefinitionComponent.setRuleDefinition(this.entity.ruleDefinition);
        let actionName = JSON.parse(JSON.parse(this.entity.jsonActions)[0]).actionName;
        this.changeEventView(actionName,JSON.parse(this.entity.jsonActions));
        this.form.get('eventOutput').setValue(actionName);
        if (readyCallback) {
          readyCallback();
        }
      });
    };
    const canDeactivate = this.canDeactivate();
    if (typeof canDeactivate === 'boolean' && canDeactivate === true) {
      proceedWithEdit();
    } else {
      (canDeactivate as Observable<any>).subscribe((res) => {
        if (res) {
          proceedWithEdit();
        }
      });
    }
  }

  loadData() {
    this.updateSummaryList();
    this.entityEvent.emit({
      event: 'treeview:focus',
      id: this.currentProject.id, type: 'project-events'
    });
  }

  loadHPackets() {
    this.ruleDefinitionComponent.loadHPackets();
  }

  updateSummaryList() {
    this.rulesService.findAllRuleByProjectId(this.currentProject.id).subscribe((rules: Rule[]) => {
      this.summaryList = {
        title: this.formTitle,
        list: rules
          .filter(r => r.type === Rule.TypeEnum.EVENT)
          .map(l => {
            return { name: l.name, description: l.description, data: l };
          }) as SummaryListItem[]
      };
      this.summaryList.list.forEach(rule => {
        this.assetsTagService.getAssetTagResourceList('it.acsoftware.hyperiot.rule.model.Rule', rule.data.id)
          .subscribe(tagResourceList => {
            let tagIds = tagResourceList.map(tagResource => tagResource.tag.id);
            rule.data.tagIds = tagIds;
          })
      })
    });
  }

  private saveEvent(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();
    let jActionStr = this.eventComponentContainer.buildJsonAction();
    const e = this.entity;
    e.name = this.form.get('rule-name').value;
    e.description = this.form.get('rule-description').value;
    e.ruleDefinition = this.ruleDefinitionComponent.buildRuleDefinition();
    e.jsonActions = jActionStr;
    if (this.selectedTags[0]) {
      // if a tag has been selected, get its id
      e.tagIds = [this.selectedTags[0].id];
    } else {
      e.tagIds = [];
    }
    delete e.actions;
    delete e.parent;
    const wasNew = this.isNew();
    const responseHandler = (res) => {
      this.entity = res;
      this.resetForm();
      this.updateSummaryList();
      this.showCancel = false;
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res, wasNew);
    };

    if (e.id) {
      this.rulesService.updateRule(e).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
        this.loadingStatus = LoadingStatusEnum.Error;
      });
    } else {
      e.entityVersion = 1;
      e.project = { id: this.currentProject.id, entityVersion: this.currentProject.entityVersion };
      e.packet = null;  // event rules are not bound to packets anymore
      e.type = 'EVENT';
      this.rulesService.saveRule(e).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
        this.loadingStatus = LoadingStatusEnum.Error;
      });
    }

  }
  
  cancel() {
    this.resetErrors();
    this.resetForm();
    this.eventComponentContainer.cancel();
    this.editMode = false;
    this.showCancel = false;
  }

  delete(successCallback, errorCallback) {
    this.rulesService.deleteRule(this.entity.id).subscribe((res) => {
      this.resetErrors();
      this.resetForm();
      this.showCancel = false;
      this.updateSummaryList();
      this.cancel();
      if (successCallback) { successCallback(); }
    }, (err) => {
      if (errorCallback) { errorCallback(); }
    });
  }

  isDirty() {
    return this.editMode && (super.isDirty() || this.ruleDefinitionComponent.isDirty() || 
      this.eventComponentContainer.isDirty() || this.tagSelectionIsDirty());
  }

  private tagSelectionIsDirty() {
    return JSON.stringify(this.entity.tagIds) !== JSON.stringify(this.selectedTags.map(tag => tag.id));
  }

  isValid(): boolean {
    return (this.editMode && this.ruleDefinitionComponent && this.eventComponentContainer) ?
      (super.isValid() &&
        !this.ruleDefinitionComponent.isInvalid() &&
        !this.eventComponentContainer.isInvalid()
      ) : false;
  }

  setErrors(err) {
    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [{ "message": $localize`:@@HYT_unavailable_event_name:Unavailable event name`, "field": 'rule-name', "invalidValue": '' }];
          this.form.get('rule-name').setErrors({
            validateInjectedError: {
              valid: false
            }
          });
          this.loadingStatus = LoadingStatusEnum.Ready;
          break;
        }
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTValidationException': {
          super.setErrors(err);
          break;
        }
        default: {
          this.loadingStatus = LoadingStatusEnum.Error;
        }
      }
    } else {
      this.loadingStatus = LoadingStatusEnum.Error;
    }

  }

  changeEventView(eventComponentId,data?){
    this.eventComponentContainer.show(eventComponentId,data);
  }

}