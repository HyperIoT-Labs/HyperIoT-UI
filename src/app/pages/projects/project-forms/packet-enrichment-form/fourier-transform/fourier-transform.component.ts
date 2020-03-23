import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HPacket, HProject, HpacketsService, HPacketField } from '@hyperiot/core';

@Component({
  selector: 'hyt-fourier-transform',
  templateUrl: './fourier-transform.component.html',
  styleUrls: ['./fourier-transform.component.scss']
})
export class FourierTransformComponent implements OnInit {
  @Input()
  packet: HPacket;

  @Input()
  project: HProject;

  form: FormGroup;

  methodOptions = [
    { label: 'Fast', value: 'FAST' },
    { label: 'Discrete', value: 'DISCRETE' }
  ];

  normOptions = [
    { label: 'Standard', value: 'STANDARD' },
    { label: 'Unitary', value: 'UNITARY' }
  ];

  typeOptions = [
    { label: 'Forward', value: 'FORWARD' },
    { label: 'Inverse', value: 'INVERSE' }
  ];

  inputFieldOptions = [];

  _config = this.new();
  @Input()
  set config(cfg: any) {
    this._config = cfg;
    this.update();
  }
  get config() { return this._config };
  originalConfig: string;

  outputFieldName: string;

  constructor(
    private fb: FormBuilder,
    private hpacketService: HpacketsService,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({});
    this.packet.fields.forEach((pf) => {
      this.inputFieldOptions.push({
        label: pf.name,
        value: pf.id
      });
    });
  }

  onTransformMethodChange(method) {
    this.config.transformMethod = method;
    setTimeout(() => {
      this.form.patchValue({ transformMethod: this.config.transformMethod});
      this.form.get('transformMethod').setValue(this.config.transformMethod);
    });
  }

  onTransformNormChange(norm) {
    this.config.fftNormalization = norm;
    setTimeout(() => {
      this.form.get('transformNorm').setValue(this.config.fftNormalization);
    });
  }

  onTransformTypeChange(type) {
    this.config.fftTransformType = type;
    setTimeout(() => {
      this.form.get('transformType').setValue(this.config.fftTransformType);
    });
  }

  onInputFieldChange(field) {
    this.config.inputFieldId = field.value;
  }

  onOutputFieldChange(e) {
    console.log(e.target);
    this.addOutputField(e.target.value, (field) => {
      this.config.outputFieldId = field.id;
      this.outputFieldName = field.name;
    }, (error) => {
      // TODO: inject error on input text
    })
  }

  new() {
    return {
      transformMethod: 'FAST',
      fftNormalization: 'STANDARD',
      fftTransformType: 'FORWARD',
      inputFieldId: 0,
      outputFieldId: 0
    };
    this.outputFieldName = '';
  }
  update() {
    this.outputFieldName = '';
    this.onTransformMethodChange(this.config.transformMethod);
    this.onTransformNormChange(this.config.fftNormalization);
    this.onTransformTypeChange(this.config.fftTransformType);
    setTimeout(() => {
      this.form.get('inputField').setValue(this.config.inputFieldId);
      if (this.config.outputFieldId) {
        this.hpacketService.findHPacket(this.packet.id).subscribe((res) => {
          this.packet = res;
          const outputField = this.packet.fields.find((pf) => pf.id === this.config.outputFieldId);
          this.outputFieldName = outputField.name;
        });
      }
    });
    this.originalConfig = JSON.stringify(this._config);
  }
  addOutputField(outputFieldName, successCallback, errorCallback) {
    if (!this.config.outputFieldId) {
      this.hpacketService.addHPacketField(this.packet.id, {
        name: outputFieldName,
        description: 'Fourier Transform output field',
        multiplicity: 'SINGLE',
        type: 'OBJECT'
      } as HPacketField).subscribe((res) => {
        successCallback(res);
      }, (error) => {
        errorCallback();
      });
    }
  }
  deleteOutputField() {
    // TODO: ...
    // TODO: delete output field from packet
    // TODO: ...
  }

  isDirty() {
    return this.originalConfig !== JSON.stringify(this._config);
  }
}
