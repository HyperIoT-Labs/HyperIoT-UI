import { Injectable } from '@angular/core';
import { EventComponentType } from 'src/app/pages/projects/project-forms/project-events-form/event-component-type.enum';

interface Entity {
  readonly id: number;
  readonly entityName: string;
  // readonly displayName: string;
  readonly displayListName: string;
  // readonly pluralName: string;
  readonly formTitle: string;
  readonly shortDefinition: string;
  readonly definition: string;
  readonly longDefinition: string;
  readonly icon: string;
  readonly iconPlus: string;
  readonly emptyModel?: any;
}

/**
 * EntitiesService is a service used to provide and configure usefull information about the following entities:
 * Project, Device, Packet, field, Enrichment, Statistic, Event, Algorithm.
 */
@Injectable({
  providedIn: 'root'
})
export class EntitiesService {

  /**
   * class constructor
   */
  constructor() { }

  /**
   * information about Source
   */
  public readonly application: Entity = {
    id: 0,
    entityName: 'application',
    displayListName: $localize`:@@HYT_source:Source`,
    formTitle: $localize`:@@HYT_source:Source`,
    shortDefinition:  $localize`:@@HYT_application_short_definition:Application short definition...`,
    definition: $localize`:@@HYT_application_definition:Application definition...`,
    longDefinition: $localize`:@@HYT_application_long_definition:Application long definition...`,
    icon: 'icon-hyt_device',
    iconPlus: 'icon-hyt_devicePlus',
    emptyModel: {
      deviceName: '',
      description: '',
      password: '',
      passwordConfirm: '',
      entityVersion: 1
    }
  };

  /**
   * information about Project
   */
  public readonly project: Entity = {
    id: 0,
    entityName: 'project',
    // displayName: 'Project',
    displayListName: $localize`:@@HYT_project_displaylistname:Project`,
    // pluralName: 'Projects',
    formTitle: $localize`:@@HYT_project_form_title:Project`,
    shortDefinition: $localize`:@@HYT_project_short_definition:Project short definition...`,
    definition: $localize`:@@HYT_project_definition:Project definition...`,
    longDefinition: $localize`:@@HYT_project_long_definition:Project long definition...`,
    icon: 'icon-hyt_projects',
    iconPlus: 'icon-hyt_projectsPlus',
    emptyModel: {
      name: '',
      description: '',
      entityVersion: 1
    }
  };

  /**
   * information about Device
   */
  public readonly device: Entity = {
    id: 0,
    entityName: 'device',
    // displayName: 'Device',
    displayListName: $localize`:@@HYT_source:Source`,
    // pluralName: 'Devices',
    formTitle: $localize`:@@HYT_source:Source`,
    shortDefinition: $localize`:@@HYT_device_short_definition:Device short definition...`,
    definition: $localize`:@@HYT_device_definition:Device definition...`,
    longDefinition: $localize`:@@HYT_device_long_definition:Device long definition...`,
    icon: 'icon-hyt_device',
    iconPlus: 'icon-hyt_devicePlus',
    emptyModel: {
      deviceName: '',
      model: '',
      brand: '',
      firmwareVersion: '',
      softwareVersion: '',
      description: '',
      password: '',
      passwordConfirm: '',
      entityVersion: 1
    }
  };

  /**
   * information about packet
   */
  public readonly packet: Entity = {
    id: 0,
    entityName: 'packet',
    // displayName: 'Packet',
    displayListName: $localize`:@@HYT_packet_displaylistname:Packets`,
    // pluralName: 'Packets',
    formTitle: $localize`:@@HYT_packet_form_title:Packets`,
    shortDefinition: $localize`:@@HYT_packet_short_definition:Packet short definition...`,
    definition: $localize`:@@HYT_packet_definition:Packet definition...`,
    longDefinition: $localize`:@@HYT_packet_long_definition:Packet long definition...`,
    icon: 'icon-hyt_packets',
    iconPlus: 'icon-hyt_packetsPlus'
  };

  /**
   * information about field
   */
  public readonly field: Entity = {
    id: 0,
    entityName: 'field',
    // displayName: 'Field',
    displayListName: $localize`:@@HYT_field_displaylistname:Fields`,
    // pluralName: 'Fields',
    formTitle: $localize`:@@HYT_field_form_title:Packet fields`,
    shortDefinition: $localize`:@@HYT_fields_short_definition:Fields short definition...`,
    definition: $localize`:@@HYT_fields_definition:Fields definition...`,
    longDefinition: $localize`:@@HYT_fields_long_definition:Fields long definition...`,
    icon: 'icon-hyt_fields',
    iconPlus: 'icon-hyt_fieldsPlus'
  };

  /**
   * information about enrichment
   */
  public readonly enrichment: Entity = {
    id: 0,
    entityName: 'enrichment',
    // displayName: 'Enrichment',
    displayListName: $localize`:@@HYT_enrichment_displaylistname:Enrichment`,
    // pluralName: 'Enrichment',
    formTitle: $localize`:@@HYT_enrichment_form_title:Packet Enrichments`,
    shortDefinition: $localize`:@@HYT_enrichment_short_definition:Enrichment short definition...`,
    definition: $localize`:@@HYT_enrichment_definition:Enrichment definition...`,
    longDefinition: $localize`:@@HYT_enrichment_long_definition:Enrichment long definition...`,
    icon: 'icon-hyt_enrichments',
    iconPlus: 'icon-hyt_enrichmentsPlus',
    emptyModel: {
      name: '',
      description: '',
      jsonActions: '[\"{\\\"active\\\":\\\"true\\\"}\"]',
      type: 'ENRICHMENT',
      entityVersion: 1
    }
  };

  /**
   * information about statistic
   */
  public readonly statistic: Entity = {
    id: 0,
    entityName: 'statistic',
    // displayName: 'Statistic',
    displayListName: $localize`:@@HYT_statistic_displaylistname:Statistics`,
    // pluralName: 'Statistics',
    formTitle: $localize`:@@HYT_statistic_form_title:Project Statistics`,
    shortDefinition: $localize`:@@HYT_statistics_short_definition:Statistics short definition...`,
    definition: $localize`:@@HYT_statistics_definition:Statistics definition...`,
    longDefinition: $localize`:@@HYT_statistics_long_definition:Statistics long definition...`,
    icon: 'icon-hyt_statistics',
    iconPlus: 'icon-hyt_statisticsPlus',
    emptyModel: {
      config: '{\"input\":[], \"output\":[]}',
      algorithm: null,
      cronExpression: '0/50 * * * * ? *',
      entityVersion: 1,
      active:true
    }
  };

  /**
   * information about event
   */
  public readonly event: Entity = {
    id: 0,
    entityName: 'event',
    // displayName: 'Event',
    displayListName: $localize`:@@HYT_event_displaylistname:Events`,
    // pluralName: 'Events',
    formTitle: $localize`:@@HYT_event_form_title:Packet Events`,
    shortDefinition: $localize`:@@HYT_events_short_definition:Events short definition`,
    definition: $localize`:@@HYT_events_definition:Events definition`,
    longDefinition: $localize`:@@HYT_events_long_definition:Events long definition`,
    icon: 'icon-hyt_event',
    iconPlus: 'icon-hyt_eventPlus',
    emptyModel: {
      name: '',
      description: '',
      type: 'ENRICHMENT',
      jsonActions: '[\"{\\\"active\\\":\\\"true\\\",\\\"actionName\\\":\\\"'+EventComponentType.SEND_MAIL_ACTION+'\\\",\\\"recipients\\\":\\\"\\\",\\\"ccRecipients\\\":\\\"\\\",\\\"subject\\\":\\\"\\\",\\\"body\\\":\\\"\\\"}\"]',
      entityVersion: 1,
      tagIds: []
    }
  };

   /**
   * information about alarm
   */
    public readonly alarm: Entity = {
      id: 0,
      entityName: 'alarm',
      // displayName: 'Event',
      displayListName: $localize`:@@HYT_alarm_displaylistname:Alarms`,
      // pluralName: 'Events',
      formTitle: $localize`:@@HYT_alarm_form_title:Alarms`,
      shortDefinition: $localize`:@@HYT_alarms_short_definition:Alarms short definition`,
      definition: $localize`:@@HYT_alarms_definition:Alarms definition`,
      longDefinition: $localize`:@@HYT_alarms_long_definition:Alarms long definition`,
      icon: 'icon-hyt_notification',
      iconPlus: 'icon-hyt_eventPlus',
      emptyModel: {
        name: '',
        inhibited: false,
        categoryIds:[],
        tagIds:[],
        entityVersion: 1
      }
    };

  /**
   * information about algorithm
   */
  public readonly algorithm: Entity = {
    id: 0,
    entityName: 'algorithm',
    displayListName: $localize`:@@HYT_algorithm_displaylistname:Algorithms`,
    formTitle: $localize`:@@HYT_algorithm_form_title:Algorithms`,
    shortDefinition: $localize`:@@HYT_algorithms_short_definition:Algorithms short definition`,
    definition: $localize`:@@HYT_algorithms_definition:Algorithms definition`,
    longDefinition: $localize`:@@HYT_algorithms_long_definition:Algorithms long definition`,
    icon: 'icon-hyt_statistics',
    iconPlus: 'icon-hyt_statisticsPlus',
    emptyModel: {
      name: '',
      description: '',
      baseConfig: '{\"input\":[], \"output\":[]}',
      entityVersion: 1,
      algorithmFileName: null,
      mainClassname: '',
      type: 'STATISTICS'
    }
  };

}
