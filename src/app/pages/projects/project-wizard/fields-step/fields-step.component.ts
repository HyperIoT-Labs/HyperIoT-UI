import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { Option } from '@hyperiot/components/lib/hyt-radio-button/hyt-radio-button.component';
import { FormBuilder, FormGroup } from '@angular/forms';
import { HPacketField, HpacketsService, HPacket, HDevice } from '@hyperiot/core';
import { SelectOption } from '@hyperiot/components';
import { HttpClient } from '@angular/common/http';
import { HYTError } from 'src/app/services/errorHandler/models/models';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';

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

  errors: HYTError[] = [];

  @Output() hPacketsOutput = new EventEmitter<HPacket[]>();

  formDeviceActive: boolean = false;

  constructor(
    private fb: FormBuilder,
    private hPacketService: HpacketsService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
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
  }

  createField() {

    this.errors = [];

    let hPacketField: HPacketField = {
      entityVersion: 1,
      name: this.fieldForm.value['fieldName'],
      multiplicity: this.fieldForm.value.fieldMultiplicity.value,
      type: this.fieldForm.value.fieldType,
      description: this.fieldForm.value.fieldDescription
    }

    let hPacket = this.hPackets.find(x => x.id == this.idPacket);

    this.hPacketService.addHPacketField(hPacket.id, hPacketField).subscribe(
      res => {
        let hPacket = this.hPackets.find(x => x.id == res.id);
        var index = this.hPackets.indexOf(hPacket);

        if (index !== -1) {
          this.hPackets[index] = res;
        }
        this.hPacketsOutput.emit(this.hPackets);
      },
      err => {
        this.errors = this.errorHandler.handleCreateField(err);
        this.errors.forEach(e => {
          if (e.container != 'general')
            this.fieldForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    );

  }

  getError(field: string): string {
    return (this.errors.find(x => x.container == field)) ? this.errors.find(x => x.container == field).message : null;
  }

  invalid() {
    return (
      this.fieldForm.get('fieldName').invalid ||
      this.fieldForm.get('fieldType').invalid
    )
  }

}
