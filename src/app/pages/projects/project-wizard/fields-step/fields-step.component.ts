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

  multiplicityOptions: Option[] = [
    { value: 'SINGLE', label: 'Single', checked: true },
    { value: 'ARRAY', label: 'Array' },
    { value: 'MATRIX', label: 'Matrix' }
  ];

  typeOptions: SelectOption[] = [
    { value: 'OBJECT', label: 'OBJECT' },
    { value: 'INTEGER', label: 'INTEGER' },
    { value: 'DOUBLE', label: 'DOUBLE' },
    { value: 'FLOAT', label: 'FLOAT' },
    { value: 'BOOLEAN', label: 'BOOLEAN' },
    { value: 'DATE', label: 'DATE' },
    { value: 'TEXT', label: 'TEXT' },
    { value: 'TIMESTAMP', label: 'TIMESTAMP' },
    { value: 'CATEGORY', label: 'CATEGORY' },
    { value: 'TAG', label: 'TAG' }
  ];

  // @Output() packetAdded = new EventEmitter<HDevice>();

  formDeviceActive: boolean = false;

  constructor(
    private fb: FormBuilder,
    private hPacketService: HpacketsService
  ) { }

  ngOnInit() {

    // for (let el of this.hDeviceList)
    //   this.devicesOptions.push({ value: el.id.toString(), label: el.deviceName })

    this.fieldForm = this.fb.group({});
  }

  idPacket: number = 417;

  sethPackets(id: number) {
    this.idPacket = id;
    console.log(this.idPacket)
    console.log("cliccato");
  }

  createField() {

    let hPacketField: HPacketField = {
      entityVersion: 1,
      name: this.fieldForm.value.fieldName,
      multiplicity: this.fieldForm.value.fieldTypology.value,
      type: this.fieldForm.value.fieldType,
      description: this.fieldForm.value.fieldDescription
    }

    let hPacket = this.hPackets.find(x => x.id == this.idPacket);

    hPacket.fields.push(hPacketField)

    console.log(hPacket);

    // this.packetAdded.emit(hPacket);

    this.hPacketService.updateHPacket(hPacket).subscribe(
      res => {

      },
      err => console.log(err)
    )
  }

  invalid() {
    return (
      this.fieldForm.get('fieldName').invalid ||
      //this.packetForm.get('multiplicity').invalid ||
      this.fieldForm.get('fieldType').invalid
    )
  }

}
