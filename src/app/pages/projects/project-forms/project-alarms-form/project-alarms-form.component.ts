import { Component, OnChanges, OnDestroy, ViewChild, Input, Injector, ViewEncapsulation, ChangeDetectorRef, OnInit, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription, Observable } from 'rxjs';
import { LoggerService, Logger, HpacketsService, HPacket, HProject, RulesService, Rule, AssetstagsService, AssetTag, AlarmEvent, Alarm, AlarmeventsService, AlarmsService  } from '@hyperiot/core';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { RuleDefinitionComponent } from '../rule-definition/rule-definition.component';
import { Option } from '@hyperiot/components';
import { SummaryListItem } from '../../project-detail/generic-summary-list/generic-summary-list.component';
import { TagStatus } from '../packet-enrichment-form/asset-tag/asset-tag.component';
import {FormControl, Validators} from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatChipInputEvent, MatAutocompleteTrigger } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { PendingChangesDialogComponent } from 'src/app/components/dialogs/pending-changes-dialog/pending-changes-dialog.component';
import { ToastrService } from 'ngx-toastr';
import {coerceBooleanProperty} from '@angular/cdk/coercion';

@Component({
  selector: 'hyt-project-alarms-form',
  templateUrl: './project-alarms-form.component.html',
  styleUrls: ['./project-alarms-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectAlarmsFormComponent extends ProjectFormEntity  implements  OnInit, OnChanges ,  OnDestroy{

  @ViewChild('auto', { read: MatAutocompleteTrigger })
  triggerAutocompleteInput: MatAutocompleteTrigger;

  entity: Alarm = {} as Alarm;
  entityFormMap = {
    'alarm-name': {
      field: 'name'
    },
    'alarm-counter': {
      field: 'counter'
    },
    'alarm-inhibited': {
      field: 'inhibited'
    }
  };
  eventToEdit: Rule;
  editEventIndex: number;
  eventsAlarm: AlarmEvent[];
  // inhibited: boolean;
  alarmName : string;
  severityList: Option[] = [
    {
      label: 'Critical',
      value: '3'
    },
    {
      label: 'High',
      value: '2',
    },
    {
      label: 'Medium',
      value: '1',
    },
    {
      label: 'Low',
      value: '0',
      checked: true,
    },
  ];

  // Nuovi param
  newAlarm : boolean;
  eventListMap : Map<number, any>;
  updateLabel: boolean;
  selectedId: number;
  indexMap: number;
  addAnother: boolean;
  inhibited = false;
  alarmCounter = 0;
  selectedEventId : number;
  ruleEventId: number;

  /**
   * logger service
   */
  private logger: Logger;

  inhibitedOptions: Option[] = [
    { value: 'false', label: 'Enabled' , checked: true },
    { value: 'true', label: 'Inhibited'}
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
    private assetsTagService: AssetstagsService,
    private toastr: ToastrService,
    private loggerService: LoggerService
    ) {

    super(injector,cdr);
    this.formTemplateId = 'container-alarms';
    this.longDefinition = this.entitiesService.alarm.longDefinition;
    this.formTitle = this.entitiesService.alarm.formTitle;
    this.icon = this.entitiesService.alarm.icon;
    this.hideDelete = true; // hide 'Delete' button
    this.isActive = false;  // TODO bind this property to RuleAction object
    this.newAlarm = false;
    this.selectedEventId = undefined;
    this.logger = new Logger(this.loggerService);

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
    this.logger.debug('Current Project', this.currentProject)
    this.getAssetTags();
    this.updateSummaryList();
    this.updateLabel = false;
  }

  ngOnChanges() {
    if (this.currentProject) {
      this.updateSummaryList();
    }
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
  }

  openAutocompletePanel(){
    this.triggerAutocompleteInput.openPanel();
  }

  /**
   * TAGS
   */
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
    // Add our tag
    if ((value || '').trim()) {
      const tag = this.allTags.find(t => t.name === value.trim());
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
    // Qui selezioni l'id per filtrare la lista
    this.selectedId = alarm.id;

    this.logger.debug('Alarm', alarm);
    this.editMode = true;
    this.inhibited = alarm.inhibited;
    this.addEventMode = false;
    this.formEvent.reset();
    const proceedWithEdit = () => {

      this.showCancel = true;
      // this.addEventMode = true;

      // this.alarmeventsService.findAllAlarmEventByAlarmId(alarm.id).subscribe(
        // result =>  {
          // Map the eventList
          const eventList = []
          for (const el of alarm.alarmEventList) {
           eventList.push({event: el.event , severity:el.severity, id: el.id})
          }
          // Add to dictionary
          this.eventListMap.set(alarm.id, eventList);
          console.log('Event listmap: ', this.eventListMap);

        // }
      // );

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
        this.setEventCounter();
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
      this.newAlarm = true;
      this.editMode = true;
      this.showCancel = true;
      this.eventsAlarm = [];
      this.form.reset();
      this.formEvent.reset();
      this.resetForm();
      this.loadEmpty();
      this.form.get('alarm-counter').setValidators([Validators.pattern('(?!.*0).*')])
      this.form.get('alarm-counter').setValue(0);
      this.form.updateValueAndValidity();
    }

    /*
    / Method to add blank event
    */
    addEvent(){
      this.indexMap = undefined;
      this.updateLabel = false;
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
      // Upload rule id for current event
      this.ruleEventId = e.event.id
      // Set pre-existent fields
      this.formEvent.get('event-name').setValue(e.event.name);
      this.formEvent.get('event-description').setValue(e.event.description);
      this.formEvent.get('event-severity').setValue(e.severity.toString());
      this.eventToEdit =  { ... this.entitiesService.event.emptyModel };
      try {
        this.selectedEventId = e.id
      }
      catch {
        this.selectedEventId = undefined
      }
      this.ruleDefinitionComponent.resetRuleDefinition();
      this.ruleDefinitionComponent.setRuleDefinition(e.event.ruleDefinition.toString());
      this.eventToEdit.type = Rule.TypeEnum.ALARMEVENT;
      // Empty and load tags
      this.selectedTags = []
      if (e.event.tagIds) {
        for (const tagId of e.event.tagIds) this.selectedTags.push(this.allTags.find(o => o.id === +tagId));
      }
    }

    /*
    Same methods both for save/update an event
    */
    saveEvent(){
      const addEditEvent = {
        id: undefined,
        event: {
          name: this.formEvent.get('event-name').value,
          description: this.formEvent.get('event-description').value,
          ruleDefinition: this.ruleDefinitionComponent.buildRuleDefinition(),
          project: {
              id: this.currentProject.id,
          },
          packet: null,
          jsonActions: '["{\\"actionName\\": \\"it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction\\", \\"active\\": true}"]',
          type: Rule.TypeEnum.ALARMEVENT,
          tagIds: this.selectedTags.map(o => o.id),
        },
        severity: this.formEvent.get('event-severity').value,
      }

      // CASO 1: NUOVO ALLARME
      if (this.newAlarm === true) {
        this.toastr.info($localize`:@@HYT_remember_changes:Remember to save the alarm to maintain the changes`, $localize`:@@HYT_event_saved:Event saved!`, {toastClass: 'alarm-toastr alarm-info'});

        // Update eventListMap for all the 5 possibles scenario:
        if (this.indexMap != undefined && this.selectedId > 0) this.eventListMap.get(this.selectedId)[this.indexMap] = addEditEvent;
        else if (!this.indexMap && this.selectedId > 0) this.eventListMap.get(this.selectedId).push(addEditEvent);
        else if (this.indexMap != undefined && this.selectedId == -1) this.eventListMap.get(-1)[this.indexMap] = addEditEvent;
        else if (!this.indexMap && this.selectedId  == 0){ this.eventListMap.set(-1, [addEditEvent]); this.selectedId = -1;}
        else this.eventListMap.get(-1).push(addEditEvent);
        this.setEventCounter('add');
      }


      // CASO 2: ALLARME VECCHIO, NUOVO EVENTO
      else if (this.newAlarm == false && this.selectedEventId == undefined){
        const obj = { alarm: {
                      id : this.selectedId
                    },
                    event: {
                    name: addEditEvent.event.name,
                    description: addEditEvent.event.description,
                    ruleDefinition: addEditEvent.event.ruleDefinition,
                    project: {
                        id: this.currentProject.id
                    },
                    packet: null,
                    jsonActions: '["{\\"actionName\\": \\"it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction\\", \\"active\\": true}"]',
                    type: Rule.TypeEnum.ALARMEVENT,
                    },
                    severity: addEditEvent.severity
        } as AlarmEvent

        this.alarmeventsService.saveAlarmEvent(obj).subscribe((res) => {
          this.updateSummaryList();
          this.logger.debug('New event added', res);
          this.toastr.success($localize`:@@HYT_event_new_desc:New event saved correctly`, $localize`:@@HYT_event_new:New event!`, {toastClass: 'alarm-toastr alarm-success'});

          // Update eventListMap for all the 5 possibles scenario:
          addEditEvent.id = res.id;
          if (this.indexMap != undefined && this.selectedId > 0) this.eventListMap.get(this.selectedId)[this.indexMap] = addEditEvent;
          else if (!this.indexMap && this.selectedId > 0) this.eventListMap.get(this.selectedId).push(addEditEvent);
          else if (this.indexMap != undefined && this.selectedId == -1) this.eventListMap.get(-1)[this.indexMap] = addEditEvent;
          else if (!this.indexMap && this.selectedId  == 0){ this.eventListMap.set(-1, [addEditEvent]); this.selectedId = -1;}
          else this.eventListMap.get(-1).push(addEditEvent);

          if (this.form.touched === true) this.toastr.info($localize`:@@HYT_event_still_changes:You still have to save the alarm changes`,
            $localize`:@@HYT_event_remember:Remember!`, {toastClass: 'alarm-toastr alarm-info'});
        });
        this.setEventCounter('add');
      }

      // CASO 3: ALLARME VECCHIO, EVENTO VECCHIO (UPDATE)
      else{
                    const obj = { alarm: {
                      id : this.selectedId
                    },
                    id: this.selectedEventId,
                    event: {
                    id: this.ruleEventId,
                    name: addEditEvent.event.name,
                    description: addEditEvent.event.description,
                    ruleDefinition: addEditEvent.event.ruleDefinition,
                    project: {
                        id: this.currentProject.id
                    },
                    packet: null,
                    jsonActions: '["{\\"actionName\\": \\"it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction\\", \\"active\\": true}"]',
                    type: Rule.TypeEnum.ALARMEVENT,
                    },
                    severity: addEditEvent.severity
            } as AlarmEvent
        this.alarmeventsService.updateAlarmEvent(obj).subscribe((res) => {
          this.updateSummaryList();
          // this.entity = res;
          console.log('UPDATE EVENT: ', res, this.entity);
          this.logger.debug('Event updated', res)
          this.toastr.success($localize`:@@HYT_event_updated_desc:Event updated correctly`, $localize`:@@HYT_event_updated:Event updated!`,
            {toastClass: 'alarm-toastr alarm-success'});

          // Update eventListMap for all the 5 possibles scenario:
          addEditEvent.id = res.id;
          if (this.indexMap != undefined && this.selectedId > 0) this.eventListMap.get(this.selectedId)[this.indexMap] = addEditEvent;
          else if (!this.indexMap && this.selectedId > 0) this.eventListMap.get(this.selectedId).push(addEditEvent);
          else if (this.indexMap != undefined && this.selectedId == -1) this.eventListMap.get(-1)[this.indexMap] = addEditEvent;
          else if (!this.indexMap && this.selectedId  == 0){ this.eventListMap.set(-1, [addEditEvent]); this.selectedId = -1;}
          else this.eventListMap.get(-1).push(addEditEvent);
          if (this.form.touched === true)
            this.toastr.info($localize`:@@HYT_event_still_changes:You still have to save the alarm changes`, $localize`:@@HYT_event_remember:Remember!`, {toastClass: 'alarm-toastr alarm-info'});
        })
      }
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
        this.logger.debug('remove event', 'removeEvent' ,res, this.eventsAlarm , index);
        this.addEventMode = false;
        this.eventsAlarm.splice(index, 1);
        this.eventsAlarm = [... this.eventsAlarm];
      });
      }
    }

    /*
    / Method that fill the formEvent with a copy of the passed event
    */
    duplicateEvent(e){
      this.addEvent();
      this.formEvent.get('event-name').setValue(e.event.name+'_copy');
      this.formEvent.get('event-description').setValue(e.event.description);
      this.formEvent.get('event-severity').setValue(e.severity.toString());
      this.eventToEdit =  { ... this.entitiesService.event.emptyModel };
      this.ruleDefinitionComponent.resetRuleDefinition();
      this.ruleDefinitionComponent.setRuleDefinition(e.event.ruleDefinition.toString());
      this.eventToEdit.type = Rule.TypeEnum.ALARMEVENT;
      // Empty and load tags
      this.selectedTags = []
      for (const tagId of e.event.tagIds) this.selectedTags.push(this.allTags.find(o=> o.id == tagId));
      this.setEventCounter()
    }

    changeAlarmInhibited(event) {
      this.logger.debug('Entity', this.entity, event)
      this.changedAlarmData = true;
      this.entity.inhibited = event;

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
        console.log('SummaryList new: ', this.summaryList);
        this.entityEvent.emit({
          event: 'summaryList:reload',
          summaryList: this.summaryList, type: 'project-alarms'
        });
      });

    }

  save(successCallback, errorCallback) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();
    // Confirmation dialog if there are unsaved changes
    let flag;
    if (!this.formEvent.pristine && this.formEvent.status == 'INVALID') flag = this.openConfirmEventDialog();
    else this.saveAlarm();
  }

  saveAlarm(){

    const alarmName = this.form.get('alarm-name').value;
    const alarmInhibited = this.inhibited;
    const listOfAlarmEvents = this.selectedId === -1? this.eventListMap.get(-1) : this.eventListMap.get(this.selectedId);

    // Do the call to POST to server
     if (this.newAlarm === true){
       this.alarmsService.saveAlarmAndEvents(listOfAlarmEvents, alarmName, alarmInhibited).subscribe((res) => {
         this.logger.debug('New alarm added', res)
         this.toastr.success($localize`:@@HYT_alarm_and_events_desc:Alarm and events added correctly`, $localize`:@@HYT_alarm_and_events:Alarm and events added!`, {toastClass: 'alarm-toastr alarm-success'});
         this.addEventMode = false;
         this.loadingStatus = LoadingStatusEnum.Ready;

         // re-default values
         this.updateSummaryList();
         this.newAlarm = false;
         this.cancel();
       });
     }

    // salvo solo allarme
    else {
      const alarmToSave = {
        id: this.selectedId,
        name: this.form.get('alarm-name').value,
        inhibited: this.inhibited,
      } as Alarm

      this.alarmsService.updateAlarm(alarmToSave).subscribe((res) => {this.toastr.success($localize`:@@HYT_alarm_updated_desc:Event updated correctly`, $localize`:@@HYT_alarm_updated:Event updated!`, {toastClass: 'alarm-toastr alarm-success'});});
      this.addEventMode = false;
      this.loadingStatus = LoadingStatusEnum.Ready;

      // re-default values
      this.updateSummaryList();
      this.newAlarm = false;
      this.cancel();
    }
  }

  deleteEvent(i){
    // CASO 1: nuovo allarme, no eventi pre-esistenti
    if (this.newAlarm === true){
      this.eventListMap.get(this.selectedId).splice(i, 1);
      this.updateSummaryList();
    }
    // CASO 2:vecchio allarme, eventi pre-esistenti
    else {
    this.alarmeventsService.deleteAlarmEvent(this.eventListMap.get(this.selectedId)[i].id).subscribe((res) => {
      this.toastr.success($localize`:@@HYT_event_deleted_desc:Event deleted correctly`, $localize`:@@HYT_event_deleted:Event deleted!`, {toastClass: 'alarm-toastr alarm-success'});
      // update number of event in the table
      this.eventListMap.get(this.selectedId).splice(i, 1);
      this.updateSummaryList();
    });
    }
    this.setEventCounter('remove');
  }

  /*
/ Modal useful to not discard/discard pending changes on event form
*/
  openConfirmDeleteLastEventDialog(i) {
    if (this.alarmCounter === 1) {
      const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: {
          message: $localize`:@@HYT_alarm_delete_last_event:Do you want to cancel the last event as well? If you confirm the alarm will also be cancelled.`,
          title: $localize`:@@HYT_alarm_delete_last_event_title:Confirmation of cancellation last event`
        }
      });
      dialogRef.onClosed.subscribe((result) => {
        if (result === 'delete') {
          this.deleteEvent(i)
          this.updateSummaryList();
          this.newAlarm = false;
          this.cancel();
        } // DISCARD
        else this.loadingStatus = LoadingStatusEnum.Ready; // NOT DISCARD
      });
    } else {
      this.deleteEvent(i);
    }
  }


  isValid(): boolean {
    return  this.editMode && super.isValid() && this.formEvent.valid ;
  }

  isDirty() : boolean {
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

    // if there are pending changes, propose to save
    if (this.form.touched === true) this.openConfirmEventDialog();

    // cancel pending params
    // cancel pending params
    this.eventListMap = new Map<number, any>();
    this.selectedId = 0;
    this.newAlarm = false;
    this.alarmCounter = 0;

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
      if (result == 'save') this.saveAlarm(); // DISCARD
      else this.loadingStatus = LoadingStatusEnum.Ready; // NOT DISCARD
    });
  }

  getSeverityLabel(value : number){
    return this.severityList.find( x => x.value === value.toString())?.label;
  }

  setErrors(err) {
    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [{ message: $localize`:@@HYT_unavailable_alarm_name:Unavailable alarm name`, field: 'alarm-name', invalidValue: '' }];
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

  setEventCounter(action = 'init') {
    switch (action) {
      case 'init':
        this.alarmCounter = 0;
        this.eventListMap.forEach(el => this.alarmCounter = el.length);
        break;
      case 'add':
        this.alarmCounter++;
        break;
      case 'remove':
        this.alarmCounter--;
        if (this.alarmCounter <= 0) {
          this.selectedId = 0;
        }
        break;
    }
    this.form.get('alarm-counter').setValue(this.alarmCounter);
    this.form.updateValueAndValidity();
  }
}

