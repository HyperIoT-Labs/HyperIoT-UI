import { Injectable } from '@angular/core';

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
 * Project, Device, Packet, field, Enrichment, Statistic, Event.
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
    iconPlus: 'icon-hyt_packetsPlus',
    emptyModel: {
      name: '',
      type: 'INPUT',
      serialization: 'AVRO',
      format: 'JSON',
      timestampField: 'timestamp',
      timestampFormat: 'dd/MM/yyyy hh.mmZ',
      trafficPlan: 'HIGH',
      entityVersion: 1
    }
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
      jsonActions: '[]',
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
    formTitle: $localize`:@@HYT_statistic_form_title:Packet Statistics`,
    shortDefinition: $localize`:@@HYT_statistics_short_definition:Statistics short definition...`,
    definition: $localize`:@@HYT_statistics_definition:Statistics definition...`,
    longDefinition: $localize`:@@HYT_statistics_long_definition:Statistics long definition...`,
    icon: 'icon-hyt_statistics',
    iconPlus: 'icon-hyt_statisticsPlus'
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
      jsonActions: '[\"{\\\"actionName\\\":\\\"events.SendMailAction\\\",\\\"recipients\\\":\\\"\\\",\\\"ccRecipients\\\":\\\"\\\",\\\"subject\\\":\\\"\\\",\\\"body\\\":\\\"\\\"}\"]',
      entityVersion: 1
    }
  };

}
