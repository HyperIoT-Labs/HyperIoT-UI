import { ChangeDetectorRef, Component, ElementRef, Injector, Input, OnChanges, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatAutocomplete, MatAutocompleteSelectedEvent, MatAutocompleteTrigger } from '@angular/material/autocomplete';
import { MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute } from '@angular/router';
import { DialogService, Option, RuleDefinitionComponent } from 'components';
import { Alarm, AlarmEvent, AlarmeventsService, AlarmsService, AssetTag, AssetstagsService, HPacket, HProject, HpacketsService, Logger, LoggerService, Rule } from 'core';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, Subscription, forkJoin, of, switchMap, takeUntil, zip } from 'rxjs';
import { DeleteConfirmDialogComponent } from 'src/app/components/dialogs/delete-confirm-dialog/delete-confirm-dialog.component';
import { PendingChangesDialogComponent } from 'src/app/components/dialogs/pending-changes-dialog/pending-changes-dialog.component';
import { GenericErrorModalComponent } from 'src/app/components/modals/generic-error/generic-error-modal.component';
import { SummaryListItem } from '../../project-detail/generic-summary-list/generic-summary-list.component';
import { TagStatus } from '../packet-enrichment-form/asset-tag/asset-tag.component';
import { LoadingStatusEnum, ProjectFormEntity } from '../project-form-entity';

@Component({
  selector: 'hyt-project-alarms-form',
  templateUrl: './project-alarms-form.component.html',
  styleUrls: ['./project-alarms-form.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProjectAlarmsFormComponent extends ProjectFormEntity implements OnInit, OnChanges, OnDestroy {

  @ViewChild('auto', { read: MatAutocompleteTrigger })
  triggerAutocompleteInput: MatAutocompleteTrigger;

  /** Subject to manage open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

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
  alarmName: string;
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
    }
  ];

  newAlarm: boolean;
  eventListMap: Map<number, any>;
  updateLabel: boolean;
  selectedId: number;
  indexMap: number;
  addAnother: boolean;
  inhibited = false;
  alarmCounter = 0;
  selectedEventId: number;
  ruleEventId: number;
  allPackets: HPacket;

  tagRetrievalError: string = "";

  /**
   * logger service
   */
  private logger: Logger;

  inhibitedOptions: Option[] = [
    { value: 'false', label: 'Enabled', checked: true },
    { value: 'true', label: 'Inhibited' }
  ];

  private activatedRouteSubscription: Subscription;
  formEvent: FormGroup;
  @Input()
  currentProject: HProject;

  @ViewChild('alarmDef')
  ruleDefinitionComponent: RuleDefinitionComponent;

  // the following properties allow tag management
  // at the moment, only one tag can be assigned to each event
  @ViewChild('tagInput') tagInput: ElementRef<HTMLInputElement>;
  @ViewChild('auto') matAutocomplete: MatAutocomplete;
  tagStatus: TagStatus = TagStatus.Default;
  allTags: AssetTag[];
  selectedTags: AssetTag[];  // it is an array to support more tags (in the future)
  tagCtrl = new FormControl();

  isActive: boolean; // TODO bind this property to RuleAction object
  addEventMode = false;
  changedAlarmData = false;

  constructor(injector: Injector,
    private alarmsService: AlarmsService,
    private alarmEventsService: AlarmeventsService,
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private assetsTagService: AssetstagsService,
    private dialogService: DialogService,
    private toastr: ToastrService,
    private hPacketsService: HpacketsService,
    private loggerService: LoggerService
  ) {

    super(injector, cdr);
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
        this.currentProject = { id: routeParams.projectId, entityVersion: null }; // read id of project
        this.loadData();
      }
    });
    this.selectedTags = [];

    this.formEvent = this.formBuilder.group({});
  }

  ngOnInit(): void {
    this.formEvent.addControl('ruleDefinition', new FormControl(''));
    this.eventListMap = new Map<number, any>();
    this.selectedId = 0;
    this.logger.debug('Current Project', this.currentProject)
    this.getAssetTags();
    this.updateLabel = false;
    this.hPacketsService.findAllHPacketByProjectIdAndType(this.currentProject.id, 'INPUT,IO').subscribe(
      res => this.allPackets = res,
    );
  }

  ngOnChanges() {
    if (this.currentProject) {
      this.updateSummaryList();
    }
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
      this.ngUnsubscribe.complete();
    }
  }

  openAutocompletePanel() {
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
    this.assetsTagService.findAllAssetTag()
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(
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
    this.logger.debug('selected event viewValue', event.option.viewValue)
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
    this.entity = { ... this.entitiesService.alarm.emptyModel };
  }

  edit(alarm?: Alarm, readyCallback?) {
    this.logger.debug('Edit, alarm:', alarm);
    this.updateSummaryList();
    // Save the alarm id to filter the list
    this.selectedId = alarm.id;

    this.editMode = true;
    this.inhibited = alarm.inhibited;
    this.addEventMode = false;
    this.formEvent.reset();
    const proceedWithEdit = () => {

      this.showCancel = true;
      // Map the eventList
      let eventList = []
      for (let el of alarm.alarmEventList) {
        eventList.push({ "event": el.event, "severity": el.severity, "id": el.id })
      }

      this.eventListMap.set(alarm.id, eventList);

      super.edit(alarm, () => {

        if (this.eventToEdit) {
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

    let canDeactivate = this.canDeactivate();
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
  addAlarm() {
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
  addEvent(fromOldEvent: boolean = false) {
    if (!fromOldEvent) {
      this.selectedEventId = undefined;
    }
    this.indexMap = undefined;
    this.updateLabel = false;
    this.addEventMode = true;
    this.formEvent.reset();
    this.eventToEdit = { ... this.entitiesService.event.emptyModel };
    this.eventToEdit.type = Rule.TypeEnum.ALARMEVENT;
    this.selectedTags = [];
    this.formEvent.get('ruleDefinition').setValue({
      ruleDefinition: this.eventToEdit.ruleDefinition,
      rulePrettyDefinition: this.eventToEdit.rulePrettyDefinition,
    });
  }

  /*
  / Method to load event from the event's table
  */
  loadEvent(e, index) {
    this.logger.debug('loadEvent', e);
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
    this.eventToEdit = { ... this.entitiesService.event.emptyModel };
    try {
      this.selectedEventId = e.id
    }
    catch {
      this.selectedEventId = undefined
    }
    this.formEvent.get('ruleDefinition').setValue({
      ruleDefinition: e.event.ruleDefinition.toString(),
      rulePrettyDefinition: e.event.rulePrettyDefinition,
    });
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
  saveEvent() {
    const addEditEvent = {
      id: undefined,
      event: {
        name: this.formEvent.get('event-name').value,
        description: this.formEvent.get('event-description').value,
        ruleDefinition: this.formEvent.get('ruleDefinition').value.ruleDefinition,
        rulePrettyDefinition: this.formEvent.get('ruleDefinition').value.rulePrettyDefinition,
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

    // Case 1: new alarm
    if (this.newAlarm === true) {
      this.toastr.info($localize`:@@HYT_remember_changes:Remember to save the alarm to maintain the changes`, $localize`:@@HYT_severity_saved:Severity saved!`);
      // Update eventListMap for all the 5 possibles scenario:
      if (this.indexMap != undefined && this.selectedId > 0) this.eventListMap.get(this.selectedId)[this.indexMap] = addEditEvent;
      else if (!this.indexMap && this.selectedId > 0) this.eventListMap.get(this.selectedId).push(addEditEvent);
      else if (this.indexMap != undefined && this.selectedId == -1) this.eventListMap.get(-1)[this.indexMap] = addEditEvent;
      else if (!this.indexMap && this.selectedId == 0) { this.eventListMap.set(-1, [addEditEvent]); this.selectedId = -1; }
      else this.eventListMap.get(-1).push(addEditEvent);
      this.setEventCounter();
      this.formEvent.reset();
      if (this.addAnother) {
        this.addEvent(true);
      } else this.addEventMode = false;
    }

    // Case 2: old alarm, new event
    else if (this.newAlarm == false && this.selectedEventId == undefined) {
      const obj = {
        alarm: {
          id: this.selectedId
        },
        event: {
          name: addEditEvent.event.name,
          description: addEditEvent.event.description,
          ruleDefinition: addEditEvent.event.ruleDefinition,
          rulePrettyDefinition: addEditEvent.event.rulePrettyDefinition,
          project: {
            id: this.currentProject.id
          },
          packet: null,
          jsonActions: '["{\\"actionName\\": \\"it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction\\", \\"active\\": true}"]',
          type: Rule.TypeEnum.ALARMEVENT,
          tagIds: this.selectedTags.map(o => o.id),
        },
        severity: addEditEvent.severity
      } as AlarmEvent

      this.alarmEventsService.saveAlarmEvent(obj)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res) => {
            this.logger.debug('SaveEvent, new event added', res);
            this.updateSummaryList();
            this.toastr.success($localize`:@@HYT_severity_new_desc:New severity saved correctly`, $localize`:@@HYT_severity_new:New severity!`);
            addEditEvent.id = res.id;

            if (this.form.touched === true) this.toastr.info($localize`:@@HYT_alarm_still_changes:You still have to save the alarm changes`,
              $localize`:@@HYT_severity_remember:Remember!`);
            this.formEvent.reset();
            if (this.addAnother) {
              this.addEvent(true);
            } else this.addEventMode = false;
          },
          error: (err) => {
            this.logger.error('Error while saving event', err);
            if (err.error) {
              this.setErrors(err);
            } else {
              this.dialogService.open(GenericErrorModalComponent, {
                backgroundClosable: true,
                data: {
                  message: $localize`:@@HYT_error_occurred_while_saving_the_event:There was an error saving the event, please try again and avoid closing this page since the data inserted has not been saved`,
                },
              });
            }
          }
        });
    }

    // Case 3: old alarm, old event (UPDATE)
    else {
      const obj = {
        alarm: {
          id: this.selectedId
        },
        id: this.selectedEventId,
        event: {
          id: this.ruleEventId,
          name: addEditEvent.event.name,
          description: addEditEvent.event.description,
          ruleDefinition: addEditEvent.event.ruleDefinition,
          rulePrettyDefinition: addEditEvent.event.rulePrettyDefinition,
          project: {
            id: this.currentProject.id
          },
          packet: null,
          jsonActions: '["{\\"actionName\\": \\"it.acsoftware.hyperiot.alarm.service.actions.NoAlarmAction\\", \\"active\\": true}"]',
          type: Rule.TypeEnum.ALARMEVENT,
          tagIds: this.selectedTags.map(o => o.id),
        },
        severity: addEditEvent.severity
      } as AlarmEvent
      this.alarmEventsService.updateAlarmEvent(obj)
        .pipe(
          takeUntil(this.ngUnsubscribe),
          switchMap((res) => {
            const alarmEvents = this.alarmEventsService.findAllAlarmEventByAlarmId(obj.alarm.id)
            return zip(of(res), alarmEvents)
          })
        )
        .subscribe({
          next: (res) => {
            this.logger.debug('SaveEvent, event updated', res[0])
            this.updateSummaryList();
            this.toastr.success($localize`:@@HYT_severity_updated_desc:Severity updated correctly`, $localize`:@@HYT_severity_updated:Severity updated!`);
            if (this.form.touched === true)
              this.toastr.info($localize`:@@HYT_alarm_still_changes:You still have to save the alarm changes`, $localize`:@@HYT_severity_remember:Remember!`);

            // addAnother boolean
            if (this.addAnother == undefined || !this.addAnother) this.addEventMode = false;
            else {
              this.addAnother = false;
              this.addEvent(true);
            }
          },
          error: (err) => {
            this.logger.error('Error while updating event', err[0]);
            if (err && err.error) {
              this.setErrors(err);
            } else {
              this.dialogService.open(GenericErrorModalComponent, {
                backgroundClosable: true,
                data: {
                  message: $localize`:@@HYT_error_occurred_while_saving_the_event:There was an error saving the event, please try again and avoid closing this page since the data inserted has not been saved`,
                },
              });
            }
          }
        })
    }
  }

  /*
  / Method to remove an object from event's table
  */
  removeEvent(index: number) {
    if (this.eventsAlarm[index]) {
      this.alarmEventsService.deleteAlarmEvent(this.eventsAlarm[index].id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res) => {
            this.logger.debug('removeEvent', res);
            this.updateSummaryList();
            this.setEventCounter();
            this.addEventMode = false;
            this.eventsAlarm.splice(index, 1);
            this.eventsAlarm = [... this.eventsAlarm];
          },
          error: (err) => {
            this.logger.error(`deleteEvent`, err);
            if (err.error) {
              this.setErrors(err);
            } else {
              this.dialogService.open(GenericErrorModalComponent, {
                backgroundClosable: true,
                data: {
                  message: $localize`:@@HYT_error_deleting_severity:An error occurred while deleting the severity.`,
                },
              });
            }
          }
        });
    }
  }

  /*
  / Method that fill the formEvent with a copy of the passed event
  */
  duplicateEvent(e) {
    this.logger.debug('duplicateEvent', e);
    this.addEvent();
    this.formEvent.get('event-name').setValue(e.event.name + '_copy');
    this.formEvent.get('event-description').setValue(e.event.description);
    this.formEvent.get('event-severity').setValue(e.severity.toString());
    this.eventToEdit = { ... this.entitiesService.event.emptyModel };
    this.formEvent.get('ruleDefinition').setValue({
      ruleDefinition: e.event.ruleDefinition.toString(),
      rulePrettyDefinition: e.event.rulePrettyDefinition,
    });
    this.eventToEdit.type = Rule.TypeEnum.ALARMEVENT;
    // Empty and load tags
    this.selectedTags = []
    if (e.event.tagIds) {
      for (const tagId of e.event.tagIds) this.selectedTags.push(this.allTags.find(o => o.id == tagId));
    }
    this.setEventCounter()
  }

  changeAlarmInhibited(event) {
    this.logger.debug("Entity", this.entity)
    this.changedAlarmData = true;
    this.entity.inhibited = event;

  }

  updateSummaryList() {
    this.alarmsService.findAllAlarmByProjectId(this.currentProject.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: (alarms: Alarm[]) => {
          this.summaryList = {
            title: this.formTitle,
            list: alarms
              .map(l => {
                return { name: l.name, data: l };
              }) as SummaryListItem[]
          };

          const observables = this.summaryList.list.map(alarm =>
            forkJoin(
              alarm.data.alarmEventList.map(event =>
                this.assetsTagService.getAssetTagResourceList('it.acsoftware.hyperiot.rule.model.Rule', event.event.id)
              )
            )
          );

          forkJoin(observables)
            .pipe(takeUntil(this.ngUnsubscribe))
            .subscribe(
              {
                next: (tagResourceLists) => {
                  tagResourceLists.forEach((tagResourceList: any, alarmIndex) => {
                    tagResourceList.forEach((tagResource, eventIndex) => {
                      if (tagResource && tagResource.length > 0 && tagResource[0].tag) {
                        this.summaryList.list[alarmIndex].data.alarmEventList[eventIndex].event.tagIds = [tagResource[0].tag.id];
                      }
                    });
                  });

                  this.summaryList.list.forEach(alarm => {
                    this.eventListMap.set(alarm.data.id, alarm.data.alarmEventList);
                    this.setEventCounter();
                  });
                },
                error: (error) => {
                  this.logger.error(`getAssetTagResourceList, error fetching tag ids`, error);
                  if (error.error) {
                    this.setErrors(error.type ? error : 'undefined');
                  } else {
                    this.dialogService.open(GenericErrorModalComponent, {
                      backgroundClosable: true,
                      data: {
                        message: $localize`:@@HYT_error_loading_tags_data:Error loading tags data`,
                      },
                    });
                    this.tagRetrievalError = 'The event may already be associated with a tag, but due to an error, it is not being displayed';
                  }
                }
              }
            );

          this.entityEvent.emit({
            event: 'summaryList:reload',
            summaryList: this.summaryList, type: 'project-alarms'
          });
        },
        error: (error) => {
          this.logger.error(`findAllAlarmByProjectId`, error);
          if (error.error) {
            this.setErrors(error.type ? error : 'undefined');
          } else {
            this.dialogService.open(GenericErrorModalComponent, {
              backgroundClosable: true,
              data: {
                message: $localize`:@@HYT_error_loading_alarms:An unexpected error has occurred while loading the alarms`,
              },
            });
          }
        }
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

  saveAlarm() {
    const alarmName = this.form.get('alarm-name').value;
    const alarmInhibited = this.inhibited;
    const listOfAlarmEvents = this.selectedId === -1 ? this.eventListMap.get(-1) : this.eventListMap.get(this.selectedId);

    // Do the call to POST to server
    if (this.newAlarm === true) {
      this.alarmsService.saveAlarmAndEvents(listOfAlarmEvents, alarmName, alarmInhibited)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: (res) => {
            this.logger.debug('New alarm added', res)
            this.toastr.success($localize`:@@HYT_alarm_and_severities_desc:Alarm and severities added correctly`, $localize`:@@HYT_alarm_and_severities:Alarm and severities added!`);
            this.addEventMode = false;
            this.loadingStatus = LoadingStatusEnum.Ready;

            // re-default values
            this.updateSummaryList();
            this.newAlarm = false;
            this.cancel();
          },
          error: (error) => {
            this.logger.error(`saveAlarm newAlarm === true`, error);
            if (error.error) {
              this.setErrors(error);
            } else {
              this.dialogService.open(GenericErrorModalComponent, {
                backgroundClosable: true,
                data: {
                  message: $localize`:@@HYT_error_occurred_while_saving_the_alarm:There was an error saving the alarm, please try again and avoid closing this page since the data inserted has not been saved`,
                },
              });
            }
          }
        });
    }

    // save alarm only
    else {
      const alarmToSave = {
        id: this.selectedId,
        name: this.form.get('alarm-name').value,
        inhibited: this.inhibited,
      } as Alarm

      this.alarmsService.updateAlarm(alarmToSave)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.toastr.success($localize`:@@HYT_alarm_updated_desc:Event updated correctly`, $localize`:@@HYT_alarm_updated:Event updated!`);
          },
          error: (error) => {
            this.logger.error(`saveAlarm save alarm only`, error);
            if (error.error) {
              this.setErrors(error);
            } else {
              this.dialogService.open(GenericErrorModalComponent, {
                backgroundClosable: true,
                data: {
                  message: $localize`:@@HYT_error_occurred_while_saving_the_alarm:There was an error saving the alarm, please try again and avoid closing this page since the data inserted has not been saved`,
                },
              });
            }
          }
        });
      this.addEventMode = false;
      this.loadingStatus = LoadingStatusEnum.Ready;

      // re-default values
      this.updateSummaryList();
      this.newAlarm = false;
      this.cancel();
    }
  }

  deleteEvent(i) {
    // case 1: new alarm, without pre-existing event
    if (this.newAlarm === true) {
      this.eventListMap.get(this.selectedId).splice(i, 1);
      this.updateSummaryList();
    }
    // Case 2: old alarm, pre-existing event
    else {
      this.alarmEventsService.deleteAlarmEvent(this.eventListMap.get(this.selectedId)[i].id)
        .pipe(takeUntil(this.ngUnsubscribe))
        .subscribe({
          next: () => {
            this.toastr.success($localize`:@@HYT_severity_deleted_desc:Severity deleted correctly`, $localize`:@@HYT_severity_deleted:Severity deleted!`);
            this.eventListMap.get(this.selectedId).splice(i, 1);
            this.updateSummaryList();
          },
          error: (error) => {
            this.logger.error(`deleteEvent`, error);
            if (error.error) {
              this.setErrors(error);
            } else {
              this.dialogService.open(GenericErrorModalComponent, {
                backgroundClosable: true,
                data: {
                  message: $localize`:@@HYT_error_deleting_severity:An error occurred while deleting the severity.`,
                },
              });
            }
          }
        });
    }
    this.setEventCounter();
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
      dialogRef.dialogRef.afterClosed().subscribe((result) => {
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
    return this.editMode && super.isValid() && this.formEvent.valid;
  }

  isDirty(): boolean {
    return this.editMode && this.form.dirty;
  }

  isSeverityInvalid(): boolean {
    return !this.formEvent.valid || this.ruleDefinitionComponent.isInvalid();
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
    this.eventListMap = new Map<number, any>();
    this.selectedId = 0;
    this.newAlarm = false;
    this.alarmCounter = 0;

    // reload saved data
    this.updateSummaryList();
  }



  delete(successCallback, errorCallback) {
    this.alarmsService.deleteAlarm(this.entity.id)
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe({
        next: () => {
          this.resetErrors();
          this.resetForm();
          this.showCancel = false;
          this.updateSummaryList();
          this.cancel();
          if (successCallback) { successCallback(); }
        },
        error: (error) => {
          this.logger.error(`delete`, error);
          if (error.error) {
            this.setErrors(error);
          } else {
            this.dialogService.open(GenericErrorModalComponent, {
              backgroundClosable: true,
              data: {
                message: $localize`:@@HYT_error_deleting_alarm:An error occurred while deleting the alarm.`,
              },
            });
          }
          if (errorCallback) { errorCallback(); }
        }
      });
  }

  openDeleteEventDialog(indexToRemove: number) {
    if (indexToRemove >= 0) {
      const dialogRef = this.dialog.open(DeleteConfirmDialogComponent, {
        data: { title: $localize`:@@HYT_delete_item_question:Do you really want to delete this item?`, message: $localize`:@@HYT_operation_cannot_be_undone:This operation cannot be undone` }
      });
      dialogRef.dialogRef.afterClosed().subscribe((result) => {
        if (result === 'delete') {
          this.removeEvent(indexToRemove);
        }
      });
    }
  }

  /*
  / Modal useful to not discard/discard pending changes on event form
  */
  openConfirmEventDialog() {
    const dialogRef = this.dialog.open(PendingChangesDialogComponent, {
      data: { title: $localize`:@@HYT_alarm_save_changes:Do you want to save the alarm and lost the pending changes?`, message: $localize`:@@HYT_severity_will_be_lost:The current severity will be lost` }
    });
    dialogRef.dialogRef.afterClosed().subscribe((result) => {
      if (result == 'save') this.saveAlarm(); // DISCARD
      else this.loadingStatus = LoadingStatusEnum.Ready; // NOT DISCARD
    });
  }

  getSeverityLabel(value: number) {
    return this.severityList.find(x => x.value === value.toString())?.label;
  }

  setErrors(err) {
    if (err.error && err.error.type) {
      switch (err.error.type) {
        case 'it.acsoftware.hyperiot.base.exception.HyperIoTDuplicateEntityException': {
          this.validationError = [{ message: $localize`:@@HYT_unavailable_event_name:Unavailable event name`, field: 'event-name', invalidValue: '' }];
          this.formEvent.get('event-name').setErrors({
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
    } else if (err === 'undefined') {
      this.toastr.error($localize`:@@HYT_error_loading_tags_data:Error loading tags data`, $localize`:@@HYT_error:Error`);
    } else {
      this.loadingStatus = LoadingStatusEnum.Error;
    }

  }

  setEventCounter() {
    if (this.eventListMap.get(this.selectedId)) {
      this.alarmCounter = this.eventListMap.get(this.selectedId).length;
      this.form.get('alarm-counter').setValue(this.alarmCounter);
      this.form.updateValueAndValidity();
    } else {
      this.logger.debug('setEventCounter, no events found', this.eventListMap);
    }
  }
}

