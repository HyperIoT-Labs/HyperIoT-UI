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
import { PendingChangesDialogComponent } from 'src/app/components/dialogs/pending-changes-dialog/pending-changes-dialog.component';

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

  // Nuovi param
  eventListMap : Map<number, any>;
  updateLabel: boolean;
  selectedId: number;
  indexMap: number;
  addAnother: boolean;

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
    this.eventListMap = new Map<number, any>();
    this.selectedId = 0;
    console.log(this.currentProject);
    this.getAssetTags();
    this.updateSummaryList();
    this.updateLabel = false;
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
    //Qui selezioni l'id per filtrare la lista
    this.selectedId = alarm.id;

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
    
    /*
    / Method to add a new alarm
    */ 
    addAlarm(){
      this.editMode = true;
      this.showCancel = true;
      this.eventsAlarm = [];
      this.form.reset();
      this.formEvent.reset();
      this.resetForm();
      this.loadEmpty();
    }

    /*
    / Method to add blank event
    */
    addEvent(){
      this.indexMap = undefined;
      this.updateLabel = false;
      console.log(this.entity);
      this.addEventMode = true;
      this.formEvent.reset();
      this.ruleDefinitionComponent.resetRuleDefinition();
      this.eventToEdit =  { ... this.entitiesService.event.emptyModel };
      this.eventToEdit.type = Rule.TypeEnum.ALARMEVENT;
      this.selectedTags = []; 
      this.ruleDefinitionComponent.setRuleDefinition(this.eventToEdit.ruleDefinition);
    }

    /*
    / Method to load event from the event's table 
    */
    loadEvent(e, index){
      // Set index of map
      this.indexMap = index;
      // Modify user interface for update
      this.updateLabel = true;
      this.addEventMode = true;
      // Set pre-existent fields
      this.formEvent.get('event-name').setValue(e.event.name);
      this.formEvent.get('event-description').setValue(e.event.description);
      this.formEvent.get('event-severity').setValue(e.severity.toString());      
      this.eventToEdit =  { ... this.entitiesService.event.emptyModel };
      this.ruleDefinitionComponent.resetRuleDefinition();
      this.ruleDefinitionComponent.setRuleDefinition(e.event.ruleDefinition.toString());
      this.eventToEdit.type = Rule.TypeEnum.ALARMEVENT;    
      // Empty and load tags
      this.selectedTags = []
      for (let tagId of e.event.tagIds) this.selectedTags.push(this.allTags.find(o=> o.id == tagId));     
    }

    /*
    Same methods both for save/update an event
    */ 
    saveEvent(){
      let addEditEvent = {
        "event": {
          "name": this.formEvent.get('event-name').value,
          "description": this.formEvent.get('event-description').value,
          "ruleDefinition": this.ruleDefinitionComponent.buildRuleDefinition(),
          "project": {
              "id": this.currentProject.id,
          },
          "packet": null,
          "jsonActions": "[\"{\\\"actionName\\\": \\\"it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction\\\", \\\"active\\\": true}\"]",
          "type": Rule.TypeEnum.ALARMEVENT,
          "tagIds": this.selectedTags.map(o => o.id),
        },
        "severity": this.formEvent.get('event-severity').value,
      }

      // Update eventListMap for all the 5 possibles scenario:
      if (this.indexMap != undefined && this.selectedId > 0) this.eventListMap.get(this.selectedId)[this.indexMap] = addEditEvent;
      else if (!this.indexMap && this.selectedId > 0) this.eventListMap.get(this.selectedId).push(addEditEvent);
      else if (this.indexMap != undefined && this.selectedId == -1) this.eventListMap.get(-1)[this.indexMap] = addEditEvent;
      else if (!this.indexMap && this.selectedId  == 0){ this.eventListMap.set(-1, [addEditEvent]); this.selectedId = -1;}
      else this.eventListMap.get(-1).push(addEditEvent);

      // update number of event in the table
      this.form.get('alarm-event-number').setValue(this.eventListMap.get(this.selectedId).length);

      // addAnother boolean
      if (this.addAnother == undefined || !this.addAnother) this.addEventMode = false;
      else {
        this.addAnother = false;
        this.addEvent();
      }
    }

    /*
    / Method to remove an object from event's table
    */
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

    /*
    / Method that fill the formEvent with a copy of the passed event
    */
    duplicateEvent(e){
      this.addEvent();
      this.formEvent.get('event-name').setValue(e.event.name+"_copy");
      this.formEvent.get('event-description').setValue(e.event.description);
      this.formEvent.get('event-severity').setValue(e.severity.toString());      
      this.eventToEdit =  { ... this.entitiesService.event.emptyModel };
      this.ruleDefinitionComponent.resetRuleDefinition();
      this.ruleDefinitionComponent.setRuleDefinition(e.event.ruleDefinition.toString());
      this.eventToEdit.type = Rule.TypeEnum.ALARMEVENT;    
      // Empty and load tags
      this.selectedTags = []
      for (let tagId of e.event.tagIds) this.selectedTags.push(this.allTags.find(o=> o.id == tagId));   
    }

    changeAlarmInhibited(event) {
      console.log(this.entity);
      this.changedAlarmData = true;
      this.entity.inhibited = event;

      console.log(this.entity);
    }

    updateSummaryList() {
      
      // ------- MOCK ---------
      this.alarmsService.findAllAlarm().subscribe((alarms: Alarm[]) => {
        this.summaryList = {
          title: this.formTitle,
          list: alarms
            .map(l => {
              return { name: l.name, data: l };
            }) as SummaryListItem[]
        };

        let eventList = [{
          "event": {
              "name": "Evento-di-primoAllarme",
              "description": "descrizione di prova, daiiii",
              "ruleDefinition": "\"5885.5886\" >= 100",
              "project": {
                  "id": 31
              },
              "packet": null,
              "jsonActions": "[\"{\\\"actionName\\\": \\\"it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction\\\", \\\"active\\\": true}\"]",
              "type": "ALARMEVENTS",
              "tagIds": [4523]
          },
          "severity": 1
      }]; 

        this.eventListMap.set(this.summaryList.list[0].data.id, eventList);      

        // ------- MOCK ---------
        //update map event list size for save check control (MOCKKKK)
        this.form.get('alarm-event-number').setValue(eventList.length);
      });
      
    }

    save(successCallback, errorCallback) {   
      this.loadingStatus = LoadingStatusEnum.Saving;
      this.resetErrors();
      //Confirmation dialog if there are unsaved changes
      let flag;
      if (!this.formEvent.pristine && this.formEvent.status == "INVALID") flag = this.openConfirmEventDialog();
      else this.saveAlarm();
  }

  saveAlarm(){
    let alarm = {
      "alarm": {
        "name": this.form.get('alarm-name').value,
        "inhibited": this.form.get('alarm-inhibited').value, 
      },
      "alarmEvents": this.selectedId == -1? this.eventListMap.get(-1) : this.eventListMap.get(this.selectedId)
    }

    // Do the call to POST to server
    // ------- MOCK ---------
    console.info("ALARM_TO_ADD", alarm);
    this.addEventMode = false;
    this.loadingStatus = LoadingStatusEnum.Ready;
  
  }

  deleteEvent(i){
    this.eventListMap.get(this.selectedId).splice(i, 1);

    // update number of event in the table
    this.form.get('alarm-event-number').setValue(this.eventListMap.get(this.selectedId).length);
  }



  isValid(): boolean {
    return  this.editMode && super.isValid() && this.formEvent.valid ;
  }

  isDirty() : boolean {
   //console.log(' isDirty ' +this.form.dirty );
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

    // cancel pending params
    this.eventListMap = new Map<number, any>();
    this.selectedId = 0;

    // reload saved data
    this.updateSummaryList();
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

  /*
  / Modal useful to not discard/discard pending changes on event form
  */
  openConfirmEventDialog() {
    const dialogRef = this.dialog.open(PendingChangesDialogComponent, {
        data: { title: $localize`:@@HYT_alarm_save_changes:Do you want to save the alarm and lost the pending changes?`, message: $localize`:@@HYT_event_will_be_lost:The current event will be lost`}
    });
    dialogRef.onClosed.subscribe((result) => {
      if (result == "save") this.saveAlarm(); //DISCARD
      else this.loadingStatus = LoadingStatusEnum.Ready; //NOT DISCARD
    });
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

