import { Component, OnChanges, OnDestroy, ViewChild, Input, Injector, ViewEncapsulation, ChangeDetectorRef, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { HpacketsService, HPacket, HProject, RulesService, Rule, AssetstagsService, AssetTag, AlarmEvent, Alarm, AlarmeventsService, AlarmsService  } from '@hyperiot/core';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { RuleDefinitionComponent } from '../rule-definition/rule-definition.component';
import { Option } from '@hyperiot/components';
import { SummaryListItem } from '../../project-detail/generic-summary-list/generic-summary-list.component';
import { TagStatus } from '../packet-enrichment-form/asset-tag/asset-tag.component';
import { FormControl } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';

@Component({
  selector: 'hyt-project-alarms-form',
  templateUrl: './project-alarms-form.component.html',
  styleUrls: ['./project-alarms-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectAlarmsFormComponent extends ProjectFormEntity  implements  OnInit, OnChanges ,  OnDestroy{

  entity: Alarm = {} as Alarm;
  entityFormMap = {
    'alarm-name': {
      field: 'name'
    },
    'alarm-inhibited': {
      field: 'inhibited'
    }
  };
  eventToEdit: Rule;
  editEventIndex: number;
  eventsAlarm: AlarmEvent[];
  //inhibited: boolean;
  alarmName : string;
  severityList: Option[] = [
    {
      label: "Critical",
      value: "3"
    },
    {
      label: "High",
      value: "2",
    },
    {
      label: "Medium",
      value: "1",
    },
    {
      label: "Low",
      value: "0",
      checked: true,
    },
  ];

  inhibitedOptions: Option[] = [
    { value: "false", label: 'Enabled' , checked: true },
    { value: "true", label: 'Inhibited'}
  ];

  private activatedRouteSubscription: Subscription;
  formEvent : FormGroup;
  @Input()
  currentProject: HProject;

  @ViewChild('alarmDef')
  ruleDefinitionComponent: RuleDefinitionComponent;
  
  // the following properties allow tag management
  // at the moment, on tag can be assigned to event at most
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  tagStatus: TagStatus = TagStatus.Default;
  allTags: AssetTag[];
  selectedTags: AssetTag[];  // remember, at the moment one entry at most, btw here it is an array to support more than one
  tagCtrl = new FormControl();

  isActive: boolean; // TODO bind this property to RuleAction object
  addEventMode = false;
  changedAlarmData = false;
  
  constructor(injector: Injector,
    private  alarmsService: AlarmsService  ,
    private  alarmeventsService: AlarmeventsService  ,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private assetsTagService: AssetstagsService) {
    
    super(injector,cdr);
    this.formTemplateId = 'container-alarms';
    this.longDefinition = this.entitiesService.alarm.longDefinition;
    this.formTitle = this.entitiesService.alarm.formTitle;
    this.icon = this.entitiesService.alarm.icon;
    this.hideDelete = true; // hide 'Delete' button
    this.isActive = false;  // TODO bind this property to RuleAction object
   
    this.activatedRouteSubscription = this.activatedRoute.parent.params.subscribe(routeParams => {
      if (routeParams.projectId) {
        this.currentProject = {id: routeParams.projectId, entityVersion: null}; // read id of project
        this.loadData();
      }
    });
    this.selectedTags = [];

    this.formEvent = this.formBuilder.group({});
  }

  ngOnInit(): void {
    console.log(this.currentProject);
    this.getAssetTags();
    this.updateSummaryList();
    console.log(this.form);
    console.log(this.formEvent);
  }

  ngOnChanges() {
    if (this.currentProject) {
      this.updateSummaryList();
    }
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
  }

  /**
   * TAGS
   */
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

  selected(event: MatAutocompleteSelectedEvent): void {
    this.selectedTags[0] = this.allTags.find(tag => tag.name === event.option.viewValue);
    this.tagInput.nativeElement.value = '';
    this.tagCtrl.setValue(null);
  }
/**
   * END TAGS
   */


  loadEmpty() { 
    this.form.reset();
    this.formEvent.reset();
    this.ruleDefinitionComponent.resetRuleDefinition(); 
    this.entity = { ... this.entitiesService.alarm.emptyModel };
  }

  edit(alarm?: Alarm, readyCallback?) {
    console.log('edit');
    console.log(alarm);
    this.editMode = true;
    this.addEventMode = false;
    this.formEvent.reset();
    const proceedWithEdit = () => {
      console.log('proceedWithEdit');
      
      this.showCancel = true;
      //this.addEventMode = true;

      this.alarmeventsService.findAllAlarmEvents(alarm.id).subscribe(
        result =>  {
          this.eventsAlarm = result;
          
          if(!this.eventsAlarm || this.eventsAlarm.length <= 0 ) this.addEvent();// this.addEventMode = true;
        }
      );
      super.edit(alarm, () => {

        if(this.eventToEdit){
        // retrieve first tag id of event
        const oldTagId = this.eventToEdit.tagIds.length > 0 ?
          this.eventToEdit.tagIds[0] : 0;
        // if tag id exists (i.e. is not equal to 0), find tag object among all tags retrieved from database
        const oldTag = (oldTagId === 0) ? null : this.allTags.find(tag => tag.id === this.eventToEdit.tagIds[0]);
        // if a tag has been found, set it to selectedTag property (at the moment, only one tag inside array)
        this.selectedTags = oldTag ? [oldTag] : [];
      }
      
        if (readyCallback) {
          readyCallback();
        }
      });
    }
      console.log('edit2');
      //
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
    };

    loadData() {
      this.updateSummaryList();
      this.entityEvent.emit({
        event: 'treeview:focus',
        id: this.currentProject.id, type: 'project-alarms'
      });
    }
    
    addAlarm(){
      this.editMode = true;
      this.showCancel = true;
      this.eventsAlarm = [];
      this.form.reset();
      this.formEvent.reset();
      this.resetForm();
      this.loadEmpty();
      this.addEvent();
    }
    addEvent(){
      console.log(this.entity);
      this.addEventMode = true;
      this.editEventIndex = -1;
      this.formEvent.reset();
      this.ruleDefinitionComponent.resetRuleDefinition();
      this.eventToEdit =  { ... this.entitiesService.event.emptyModel };
      this.eventToEdit.type = Rule.TypeEnum.ALARMEVENT;
      this.selectedTags = []; 
      this.ruleDefinitionComponent.setRuleDefinition(this.eventToEdit.ruleDefinition);
    }

    saveEvent(){
     console.log(this.editEventIndex);
     console.log(this.eventsAlarm);

     console.log('severity '+this.formEvent.get('rule-severity').value);
      const e = this.eventToEdit;

      e.name = this.formEvent.get('rule-name').value;
      e.description = this.formEvent.get('rule-description').value;
      e.ruleDefinition = this.ruleDefinitionComponent.buildRuleDefinition();
      e.project = this.currentProject;
      e.jsonActions = '[\"{ \\\"actionName\\\":\\\"AddCategoryRuleAction\\\", \\\"categoryIds\\\":[  123 ] }\"]';
      e.type = Rule.TypeEnum.ALARMEVENT
      if (this.selectedTags && this.selectedTags[0]) {
        // if a tag has been selected, get its id
        e.tagIds = [this.selectedTags[0].id];
      } else {
        e.tagIds = [];
      }
      
      let alarmEvent : AlarmEvent = {
        entityVersion : 1,
        categoryIds : [],
        alarm : this.entity,
        event :  e,
        severity : this.formEvent.get('rule-severity').value
      }
      
      if(this.editEventIndex >= 0){

        let eAf = this.eventsAlarm[this.editEventIndex]
        eAf.event.name = alarmEvent.event.name;
        eAf.event.description = alarmEvent.event.description;
        eAf.event.ruleDefinition = alarmEvent.event.ruleDefinition;
        eAf.event.tagIds = alarmEvent.event.tagIds;
        eAf.severity = alarmEvent.severity;

        console.log(eAf);
        delete eAf.event.actions;
         delete eAf.event.parent;
        this.alarmeventsService.updateAlarmEvent(eAf).subscribe(res => {
          this.eventsAlarm[this.editEventIndex]=res;
          console.log("exists");
          this.alarmeventsService.findAllAlarmEvents(this.entity.id).subscribe(
            result => this.eventsAlarm = result
          );
        } )
       
      } else {
        this.alarmeventsService.saveAlarmEvent(alarmEvent).subscribe(res => {
          console.log("its new");
         this.eventsAlarm.push(res) ;
         this.alarmeventsService.findAllAlarmEvents(this.entity.id).subscribe(
          result => this.eventsAlarm = result
        );
        });
      }
      this.editEventIndex = -1;
      console.log(this.eventsAlarm);
      this.addEventMode = false;
    }

    removeEvent(index : number) {
      if(this.eventsAlarm[index]){
        this.alarmeventsService.deleteAlarmEvent(this.eventsAlarm[index].id).subscribe( res => {
        console.log('removeEvent' ,res, this.eventsAlarm , index);
        this.addEventMode = false;
        this.eventsAlarm.splice(index, 1);
        this.eventsAlarm = [... this.eventsAlarm];
        console.log('removeEvent' , this.eventsAlarm);
      });
      }
    }

    editEvent(index : number) {  
      console.log('edit event ' +index);    
       console.log(this.eventsAlarm[index]);
      if(this.eventsAlarm[index]){
        this.addEventMode = true;
        this.editEventIndex = index;
        this.eventToEdit = this.eventsAlarm[index].event;
        this.formEvent.get('rule-name').setValue(this.eventToEdit.name);
        this.formEvent.get('rule-description').setValue(this.eventToEdit.description);

        this.assetsTagService.getAssetTagResourceList('it.acsoftware.hyperiot.rule.model.Rule', this.eventToEdit.id)
            .subscribe(tagResourceList => {

              console.log('tagResourceList '+tagResourceList);
              let tagIds = tagResourceList.map(tagResource => tagResource.tag.id);
              this.eventToEdit.tagIds = tagIds;

              const oldTagId =this.eventToEdit.tagIds?.length > 0 ? this.eventToEdit.tagIds[0] : 0;
              // if tag id exists (i.e. is not equal to 0), find tag object among all tags retrieved from database
              const oldTag = (oldTagId === 0) ? null : this.allTags.find(tag => tag.id === this.eventToEdit.tagIds[0]);
              // if a tag has been found, set it to selectedTag property (at the moment, only one tag inside array)
              this.selectedTags = oldTag ? [oldTag] : [];
            })
     /*  
        */
        this.ruleDefinitionComponent.setRuleDefinition(this.eventToEdit.ruleDefinition);
        console.log('severity '+this.eventsAlarm[index].severity);
        this.formEvent.get('rule-severity').setValue(this.eventsAlarm[index].severity.toString());      
      }
    }

    changeAlarmInhibited(event) {
      console.log(this.entity);
      this.changedAlarmData = true;
      this.entity.inhibited = event;

      console.log(this.entity);
    }

    updateSummaryList() {
      this.alarmsService.findAllAlarmByProjectId(this.currentProject.id).subscribe((alarms: Alarm[]) => {
        this.summaryList = {
          title: this.formTitle,
          list: alarms
            .map(l => {
              return { name: l.name, data: l };
            }) as SummaryListItem[]
        };
       /* this.summaryList.list.forEach(rule => {
          this.assetsTagService.getAssetTagResourceList('it.acsoftware.hyperiot.rule.model.Rule', rule.data.id)
            .subscribe(tagResourceList => {
              let tagIds = tagResourceList.map(tagResource => tagResource.tag.id);
              rule.data.tagIds = tagIds;
            })
        })*/
      });
      
    }

    save(successCallback, errorCallback) {
      console.log('save...');
      this.loadingStatus = LoadingStatusEnum.Saving;
      this.resetErrors();
      
      const e = this.entity;
      e.name = this.form.get('alarm-name').value;
      e.inhibited = this.form.get('alarm-inhibited').value;
      e.hprojectid = this.currentProject.id;
     /*if (this.selectedTags[0]) {
        // if a tag has been selected, get its id
        e.tagIds = [this.selectedTags[0].id];
      } else {
        e.tagIds = [];
      }
      */
      
     const wasNew = this.isNew();
      const responseHandler = (res) => {
        console.log(res);
        this.entity = res;
        this.form.markAsPristine();
        this.updateSummaryList();
        
        this.loadingStatus = LoadingStatusEnum.Ready;
        successCallback && successCallback(res, wasNew);
        this.editMode = true;
        this.showCancel = true;
        this.saveEvent();
      };
  
      if (e.id) {
        this.alarmsService.updateAlarm(e).subscribe(responseHandler, (err) => {
          this.setErrors(err);
          errorCallback && errorCallback(err);
          this.loadingStatus = LoadingStatusEnum.Error;
        });
      } else {
        e.entityVersion = 1;
        
        this.alarmsService.saveAlarm(e).subscribe(responseHandler, (err) => {
          this.setErrors(err);
          errorCallback && errorCallback(err);
          this.loadingStatus = LoadingStatusEnum.Error;
        });
      }
    }

    isValid(): boolean {
      return  this.editMode && super.isValid() && this.formEvent.valid ;
    }

  isDirty() : boolean {
   console.log(' isDirty ' +this.form.dirty );
   return  this.editMode && this.form.dirty ;
  }

  cancel() {
    this.resetErrors();
    this.resetForm();
    this.loadEmpty();
    this.editMode = false;
    this.showCancel = false;
    this.eventsAlarm = [];
    this.addEventMode = false;
  }

  delete(successCallback, errorCallback) {
    this.alarmsService.deleteAlarm(this.entity.id).subscribe((res) => {
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
    
    openDeleteEventDialog(indexToremove : number) {
      if(indexToremove >= 0){
      const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
          data: { title: $localize`:@@HYT_delete_item_question:Do you really want to delete this item?`, message: $localize`:@@HYT_operation_can_not_be_undone:This operation can not be undone`}
      });
      dialogRef.onClosed.subscribe((result) => {
          if (result === 'delete') {
              this.removeEvent(indexToremove);
          }
      });
    }
  }

  getSeverityLabel(value : number){
    return this.severityList.find( x => x.value === value.toString())?.label;
  }

  setErrors(err) {
    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [{ "message": $localize`:@@HYT_unavailable_alarm_name:Unavailable alarm name`, "field": 'alarm-name', "invalidValue": '' }];
          this.form.get('alarm-name').setErrors({
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
}

