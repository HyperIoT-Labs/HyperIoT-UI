import {AfterViewInit, Component, EventEmitter, Host, Input, OnChanges, OnInit, Optional, Output, SimpleChanges, SkipSelf} from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import {MatButtonToggleChange} from "@angular/material/button-toggle";
import { CoordinatesType, GenericMap, LeafletMapComponent, MapComponent, MapDefaultConfiguration } from 'components';
import {AreasService, Logger, LoggerService} from "core";
import { from, map, Observable, switchMap } from 'rxjs';
// import { OpenStreetMapProvider } from 'leaflet-geosearch';
// import { SearchResult } from 'leaflet-geosearch/dist/providers/provider';
// import { RawResult } from 'leaflet-geosearch/dist/providers/openStreetMapProvider';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'hyt-dynamic-map-user-configurator',
  templateUrl: './dynamic-map-user-configurator.component.html',
  styleUrls: ['./dynamic-map-user-configurator.component.scss']
})
export class DynamicMapUserConfiguratorComponent implements OnInit, AfterViewInit {

  private _noneConfiguration = false;

  mapComponentReference?: MapComponent;
  /**
   * Value used to indicate the type of coordinates the user wants to enter and set via toggle buttons
   */
  selectedCoordType: CoordinatesType = CoordinatesType.LATLONG;

  mapConfiguration = MapDefaultConfiguration;

  // geoSearchProvider = new OpenStreetMapProvider();

  addressList: Observable<any>; // Observable<SearchResult<RawResult>[]>;
  geoSearchForm = new FormGroup({
    address: new FormControl(''),
  });

  latLongForm = new FormGroup({
    latitude:  new FormControl('', Validators.required),
    longitude:  new FormControl('', Validators.required),
    zoom:  new FormControl('', [
      Validators.required,
      Validators.min(this.mapConfiguration.minZoom),
      Validators.max(this.mapConfiguration.maxZoom),
    ]),
  });
  private _originalFormValue;

  areaConfiguration: string

  @Input() saveFunction: (areaConfig: GenericMap) => Observable<any>;

  editCenter  = false;

  //@Output() onUpdate: EventEmitter<string> = new EventEmitter();
  /*
   * logger service
   */
  private logger: Logger;

  constructor(private loggerService: LoggerService, private areasService: AreasService, private httpClinet: HttpClient,@Host() @Optional() private mapComponent: MapComponent) {
    this.mapComponentReference = mapComponent;
    // Init Logger
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('DynamicMapUserConfiguratorComponent');
  }

  ngAfterViewInit() {
    this.areaConfiguration = this.mapComponentReference.getAreaConfiguration();
    this.resetFormValue();
  }

  ngOnInit(): void {

    this._noneConfiguration = !this.mapComponentReference.areaConfiguration;

    //this.addressList = this.geoSearchForm.valueChanges.pipe(switchMap(res => from(this.geoSearchProvider.search({ query: res.address }))));
    
    this.latLongForm.disable();
    this.latLongForm.valueChanges.subscribe(res => {
      this.areaConfiguration = JSON.stringify(res);
      this.mapComponentReference.setMapCenter(this.areaConfiguration);
    });
  }

  resetFormValue(markDirty?) {
    if (this.areaConfiguration) {
      const areaConfigurationParsed: GenericMap = JSON.parse(this.areaConfiguration);
      this.latLongForm.patchValue({
        latitude: areaConfigurationParsed.latitude || this.mapConfiguration.latitude,
        longitude: areaConfigurationParsed.longitude || this.mapConfiguration.longitude,
        zoom: areaConfigurationParsed.zoom || this.mapConfiguration.zoom,
      }, { emitEvent: false });
      if (markDirty) {
        this.latLongForm.markAsDirty();
      }
    }
  }

  /**
   * Handles the change of value when the toggle button is clicked
   * @param change
   */
  changeCoordType(change: MatButtonToggleChange) {
    this.logger.debug('changeCoordType - Coordinates type has changed', change);
    this.selectedCoordType = change.value;
  }

  saveMapCenterAndZoom() {
    this.saveFunction(this.latLongForm.value).subscribe(
      res => {
        this.latLongForm.disable();
        this.editCenter = false;
        this.mapComponentReference.toggleEditCenter(this.editCenter, null);
        this.latLongForm.markAsPristine();
        this._noneConfiguration = false;
      },
      err => console.log(err)
    );
  }


  enableEditCenter() {
    this._originalFormValue = JSON.stringify(this.latLongForm.value);
    this.latLongForm.enable({ emitEvent: false });
    this.editCenter = true;
    this.mapComponentReference.toggleEditCenter(this.editCenter, (areaConfiguration: string) => {
      this.areaConfiguration = areaConfiguration;
      this.resetFormValue();
    }, this.areaConfiguration);
  }

  cancelEditCenter() {
    this.areaConfiguration = this._originalFormValue;
    this.resetFormValue();
    this.latLongForm.disable({ emitEvent: false });
    this.editCenter = false;
    this.mapComponentReference.toggleEditCenter(this.editCenter, null, this.areaConfiguration);
  }

  getConfigrationStatus() {
    if (this._noneConfiguration) {
      return 'none';
    } else if (this.mapComponentReference.getAreaItemCount() === 0){
      return 'nodevice';
    } else {
      return 'complete';
    }
  }

}
