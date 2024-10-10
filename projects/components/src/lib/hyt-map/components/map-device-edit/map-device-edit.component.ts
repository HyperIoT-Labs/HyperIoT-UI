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

  itemInfo: any; //AreaDevice; //| Area;
  _dragEnabled = false;
  areaMapIconsOptions = AREA_ICONS_OPTIONS.get('MAP');
  itemRemoveCB: (itemInfo: AreaDevice | Area) => void;
  iconChangeCB: (icon: string) => void;
  itemUpdateCB: (itemInfo: AreaDevice | Area) => void;
  dragToggleCB: (dragEnable: boolean) => void;
  subAreaOpenCB: (itemInfo: any) => void;

  private _originalFormValue;
  editMode = false;
  itemInfoForm = new FormGroup({
    deviceIcon: new FormControl('', Validators.required),
    latitude: new FormControl('', Validators.required),
    longitude: new FormControl('', Validators.required),
  });

  constructor(
    private cdr: ChangeDetectorRef,
  ) { }

  ngOnInit(): void {
    this.areaMapIconsOptions = AREA_ICONS_OPTIONS.get('MAP');
    this.resetItem();
  }

  resetItem(itemInfo?) {
    this.editMode = false;
    this.itemInfoForm.disable();
    if (itemInfo) {
      this.itemInfo = itemInfo;
    }
    this.itemInfoForm.patchValue({
      deviceIcon: this.itemInfo.mapInfo.icon,
      latitude: this.itemInfo.mapInfo.x,
      longitude: this.itemInfo.mapInfo.y,
    });
    this.cdr.detectChanges();
  }

  remove() {
    this.itemRemoveCB(this.itemInfo);
  }

  toggleDrag(event) {
    event.stopPropagation();
    this._dragEnabled = !this._dragEnabled;
    this.dragToggleCB(this._dragEnabled);
  }

  enableEdit(event) {
    event.stopPropagation();
    this._originalFormValue = this.itemInfoForm.value;
    this.itemInfoForm.enable();
    this.editMode = true;
    if (this._dragEnabled) {
      this._dragEnabled = false;
      this.dragToggleCB(this._dragEnabled);
    }
    this.cdr.detectChanges();
  }
  cancelFormEdit(event) {
    event.stopPropagation();
    this.itemInfoForm.patchValue(this._originalFormValue);
    this.itemInfoForm.disable();
    this.editMode = false;
    this.cdr.detectChanges();
  }
  saveFormEdit(event) {
    event.stopPropagation();
    this.itemInfo.mapInfo.icon = this.itemInfoForm.value.deviceIcon;
    this.itemInfo.mapInfo.x = this.itemInfoForm.value.latitude;
    this.itemInfo.mapInfo.y = this.itemInfoForm.value.longitude;
    this.itemInfoForm.disable();
    this.editMode = false;
    this.cdr.detectChanges();
    this.itemUpdateCB(this.itemInfo);
  }

  openSubArea(event) {
    event.stopPropagation();
    this.subAreaOpenCB(this.itemInfo);
  }

}
