import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Area, AreaDevice } from 'core';
import { AREA_ICONS_OPTIONS } from '../../models/area-icons';

@Component({
  selector: 'hyt-map-device-edit',
  templateUrl: './map-device-edit.component.html',
  styleUrls: ['./map-device-edit.component.scss']
})
export class MapDeviceEditComponent implements OnInit {

  deviceInfo: any; //AreaDevice; //| Area;
  private _dragEnabled = false;
  areaMapIconsOptions = AREA_ICONS_OPTIONS.get('MAP');
  itemRemoveCB: (deviceInfo: AreaDevice | Area) => void;
  iconChangeCB: (icon: string) => void;
  itemUpdateCB: (deviceInfo: AreaDevice | Area) => void;
  dragToggleCB: (dragEnable: boolean) => void;
  subAreaOpenCB: (deviceInfo: any) => void;

  private _originalFormValue;
  editMode = false;
  deviceInfoForm = new FormGroup({
    deviceIcon: new FormControl('', Validators.required),
    latitude: new FormControl('', Validators.required),
    longitude: new FormControl('', Validators.required),
  });

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.areaMapIconsOptions = AREA_ICONS_OPTIONS.get('MAP');
    this.deviceInfoForm.disable();
    this.deviceInfoForm.patchValue({
      deviceIcon: this.deviceInfo.mapInfo.icon,
      latitude: this.deviceInfo.mapInfo.x,
      longitude: this.deviceInfo.mapInfo.y,
    });
    console.log(this.deviceInfo);
    console.log(this.deviceInfo);
    console.log(this.deviceInfo);
  }

  delete() {
    this.itemRemoveCB(this.deviceInfo);
  }

  toggleTrag() {
    this._dragEnabled = !this._dragEnabled;
    this.dragToggleCB(this._dragEnabled);
  }

  enableEdit() {
    this._originalFormValue = this.deviceInfoForm.value;
    this.deviceInfoForm.enable();
    this.editMode = true;
    this.cdr.detectChanges();
  }
  cancelFormEdit() {
    this.deviceInfoForm.patchValue(this._originalFormValue);
    this.deviceInfoForm.disable();
    this.editMode = false;
    this.cdr.detectChanges();
  }
  saveFormEdit() {
    this.deviceInfo.mapInfo.icon = this.deviceInfoForm.value.deviceIcon;
    this.deviceInfo.mapInfo.x = this.deviceInfoForm.value.latitude;
    this.deviceInfo.mapInfo.y = this.deviceInfoForm.value.longitude;
    this.deviceInfoForm.disable();
    this.editMode = false;
    this.itemUpdateCB(this.deviceInfo);
  }

  openSubArea() {
    this.subAreaOpenCB(this.deviceInfo);
  }
  asd(ev) {
    console.log(ev);
  }

  prevent($event) {
    $event.preventDefault();
    $event.stopPropagation();
  }
}
