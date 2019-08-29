import { Component, OnInit, Input } from '@angular/core';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HPacketField, HpacketsService, HPacket, HDevice } from '@hyperiot/core';
import { SelectOption } from '@hyperiot/components';

@Component({
  selector: 'hyt-fields-step',
  templateUrl: './fields-step.component.html',
  styleUrls: ['./fields-step.component.scss']
})
export class FieldsStepComponent implements OnInit {

  @Input() hDevices: HDevice[] = [];

  @Input() hPackets: HPacket[] = [];

  fieldForm: FormGroup;

  multiplicityOptions: Option[] = [];

  typeOptions: SelectOption[] = [];



  // @Output() packetAdded = new EventEmitter<HDevice>();

  formDeviceActive: boolean = false;

  constructor(
    private fb: FormBuilder,
    private hPacketService: HpacketsService
  ) { }

  ngOnInit() {

    Object.keys(HPacketField.MultiplicityEnum).forEach((key) => {
      this.multiplicityOptions.push({ value: HPacketField.MultiplicityEnum[key], label: HPacketField.MultiplicityEnum[key] })
    });

    Object.keys(HPacketField.TypeEnum).forEach((key) => {
      this.typeOptions.push({ value: HPacketField.TypeEnum[key], label: HPacketField.TypeEnum[key] })
    });

    // for (let el of this.hDeviceList)
    //   this.devicesOptions.push({ value: el.id.toString(), label: el.deviceName })

    this.fieldForm = this.fb.group({});
  }

  createField() {

    let hPacketField: HPacketField = {
      entityVersion: 1,
      name: this.fieldForm.value.fieldName,
      //multiplicity: this.fieldForm.value.,
      type: this.fieldForm.value.fieldType,
      description: this.fieldForm.value.fieldDescription
    }

    // this.packetAdded.emit(hPacket);

    // this.hPacketService.updateHPacket(hPacket).subscribe(
    //   res => console.log(res),
    //   err => console.log(err)
    // )
  }

  invalid() {
    return (
      this.fieldForm.get('fieldName').invalid ||
      //this.packetForm.get('multiplicity').invalid ||
      this.fieldForm.get('fieldType').invalid
    )
  }

}
