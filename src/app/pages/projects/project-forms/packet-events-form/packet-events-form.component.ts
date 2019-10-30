import { Component, OnDestroy, ViewChild, ElementRef, Input, OnChanges } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';

import { Subscription } from 'rxjs';

import { HpacketsService, HPacket, HProject, RulesService, Rule } from '@hyperiot/core';
import { ProjectFormEntity, LoadingStatusEnum } from '../project-form-entity';
import { FormBuilder } from '@angular/forms';
import { RuleDefinitionComponent } from '../rule-definition/rule-definition.component';
import { EventMailComponent } from './event-mail/event-mail.component';
import { Option } from '@hyperiot/components';
import { SummaryListItem } from '../../project-detail/generic-summary-list/generic-summary-list.component';

@Component({
  selector: 'hyt-packet-events-form',
  templateUrl: './packet-events-form.component.html',
  styleUrls: ['./packet-events-form.component.scss']
})
export class PacketEventsFormComponent extends ProjectFormEntity implements OnDestroy, OnChanges {

  entity: Rule = {} as Rule;
  entityFormMap = {
    'rule-name': 'name',
    'rule-description': 'description',
    'eventOutput': ''
  };
  formTitle = 'Packet Events';

  private routerSubscription: Subscription;
  private activatedRouteSubscription: Subscription;

  @Input()
  private packetId: number;

  packet: HPacket = {} as HPacket;
  project: HProject = {} as HProject;

  @ViewChild('eventDef', { static: false })
  ruleDefinitionComponent: RuleDefinitionComponent;

  @ViewChild('eventMail', { static: false })
  eventMailComponent: EventMailComponent;

  outputOptions: Option[] = [
    { value: 'SendMailAction', label: 'SEND EMAIL', checked: true }//@I18N@
    // { value: '', label: 'START STATISTIC' }
  ]

  editMode = false;

  constructor(
    formBuilder: FormBuilder,
    @ViewChild('form', { static: true }) formView: ElementRef,
    private hPacketService: HpacketsService,
    private rulesService: RulesService,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) {
    super(formBuilder, formView);
    this.longDefinition = 'events long definition';//@I18N@
    this.hideDelete = true; // hide 'Delete' button
    this.routerSubscription = this.router.events.subscribe((rl) => {
      if (rl instanceof NavigationEnd) {
        this.packetId = +(activatedRoute.snapshot.params.packetId);
        this.load();
      }
    });
    this.activatedRouteSubscription = this.activatedRoute.params.subscribe(routeParams => {
      this.editMode = false;
      this.packetId = +(activatedRoute.snapshot.params.packetId);
      if (this.packetId)
        this.load();
    });
  }

  ngOnChanges() {
    if (this.packetId) {
      console.log("LOADING PACKET EVENT...")
      this.load();
    }
  }

  ngOnDestroy() {
    this.activatedRouteSubscription.unsubscribe();
    this.routerSubscription.unsubscribe();
  }

  save(successCallback, errorCallback) {
    this.saveEvent(successCallback, errorCallback);
  }
  delete(successCallback, errorCallback) {
    this.deleteEvent(successCallback, errorCallback);
  }

  onAddClick() {
    this.editMode = true;
    this.resetForm();
  }

  edit(entity?: Rule) {
    if (entity) {
      this.entity = { ...entity };
    }
    delete this.entity.actions;
    delete this.entity.parent;
    this.editMode = true;
    this.cleanForm();
    this.form.get('rule-description').setValue(entity.description);
    this.form.get('rule-name').setValue(entity.name);
    this.form.get('eventOutput').setValue('SendMailAction');//TODO add logic (if new output)
    this.ruleDefinitionComponent.setRuleDefinition(entity.ruleDefinition);
    this.eventMailComponent.setMail(JSON.parse(entity.jsonActions));
  }

  clone(entity?: Rule): Rule {
    const event = { ...entity } || this.entity;
    event.id = 0;
    event.entityVersion = 1;
    event.name = `${event.name}Copy`;
    this.edit(event);
    return event;
  }

  cleanForm() {
    this.form.reset();
    this.ruleDefinitionComponent.resetRuleDefinition();
    this.eventMailComponent.reset();
  }

  load() {
    this.hPacketService.findHPacket(this.packetId).subscribe((p: HPacket) => {
      this.packet = p;
      this.project = p.device.project;
      // update rules summary list (on the right side)
      this.rulesService.findAllRuleByPacketId(this.packet.id).subscribe((rules: Rule[]) => {
        this.summaryList = {
          title: 'Events Data',
          list: rules
            .filter(r => r.type === Rule.TypeEnum.EVENT)
            .map(l => {
              return { name: l.name, description: l.description, data: l };
            }) as SummaryListItem[]
        };
      });
    });
  }

  private saveEvent(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.resetErrors();

    var jActionStr: string = '';

    if (this.form.value['eventOutput'] == 'SendMailAction') {
      let mail = this.eventMailComponent.buildMail();
      let act = {
        actionName: 'events.SendMailAction',
        recipients: mail.mailRecipient,
        ccRecipients: mail.mailCC,
        subject: mail.mailObject,
        body: mail.mailBody
      }
      var jActions = [JSON.stringify(act)];
      jActionStr = JSON.stringify(jActions);
    }

    const e = this.entity;
    e.name = this.form.get('rule-name').value;
    e.description = this.form.get('rule-description').value;
    e.ruleDefinition = this.ruleDefinitionComponent.buildRuleDefinition();
    e.jsonActions = jActionStr;

    const wasNew = this.isNew();
    const responseHandler = (res) => {
      this.entity = res;
      this.resetForm();
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res, wasNew);
      this.load();
    };

    if (e.id) {
      this.rulesService.updateRule(e).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }
    else {
      e.entityVersion = 1;
      e.project = { id: this.project.id, entityVersion: this.project.entityVersion };
      e.packet = { id: this.packet.id, entityVersion: this.packet.entityVersion };
      e.type = 'EVENT';
      this.rulesService.saveRule(e).subscribe(responseHandler, (err) => {
        this.setErrors(err);
        errorCallback && errorCallback(err);
      });
    }

  }
  private deleteEvent(successCallback?, errorCallback?) {
    this.loadingStatus = LoadingStatusEnum.Saving;
    this.rulesService.deleteRule(this.entity.id).subscribe((res) => {
      // this.entityEvent.emit({ event: 'treeview:refresh' });
      this.rulesService.findAllRuleByPacketId(this.packet.id).subscribe((rules: Rule[]) => {
        this.summaryList = {
          title: 'Events Data',
          list: rules
            .filter(r => r.type === Rule.TypeEnum.EVENT)
            .map(l => {
              return { name: l.name, description: l.description, data: l };
            }) as SummaryListItem[]
        };
      });
      this.editMode = false;
      this.loadingStatus = LoadingStatusEnum.Ready;
      successCallback && successCallback(res);
    }, (err) => {
      errorCallback && errorCallback(err);
      this.loadingStatus = LoadingStatusEnum.Error;
    });
  }

  isValid(): boolean {
    return (this.editMode && this.ruleDefinitionComponent && this.eventMailComponent) ?
      (super.isValid() &&
        !this.ruleDefinitionComponent.isInvalid() &&
        !this.eventMailComponent.isInvalid()
      ) : false;
  }

}
