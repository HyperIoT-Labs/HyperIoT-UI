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
    cfg.actionName = 'FourierTransformRuleAction';
    this.update();
  }
  get config() { return this._config };
  originalConfig: any;

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
    const outputFieldName = e.target.value;
    const outputField = this.packet.fields.find((pf) => pf.name === outputFieldName);
    if (outputField) {
      this.config.outputFieldId = outputField.id;
      this.outputFieldName = outputFieldName;
    } else {
      this.addOutputField(outputFieldName, (field) => {
        this.config.outputFieldId = this.originalConfig.outputFieldId = field.id;
        this.outputFieldName = field.name;
      }, (error) => {
        // TODO: inject error on input text
      });
    }
  }
  onOutputFieldResetClick() {
    this.hpacketService.deleteHPacketField(this.config.outputFieldId).subscribe((res) => {
      this.config.outputFieldId = 0;
      this.outputFieldName = '';
    }, (err) => {
      // TODO: report error
    });
  }

  new() {
    return {
      actionName: 'FourierTransformRuleAction',
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
          if (outputField) {
            this.outputFieldName = outputField.name;
          } else {
            this.config.outputFieldId = 0;
            this.outputFieldName = '';
          }
        });
      }
    });
    this.originalConfig = {};
    Object.assign(this.originalConfig, this._config);
  }
  addOutputField(outputFieldName, successCallback, errorCallback) {
    if (!this.config.outputFieldId) {
      this.hpacketService.addHPacketField(this.packet.id, {
        name: outputFieldName,
        description: 'Fourier Transform output field',
        multiplicity: 'ARRAY',
        type: 'DOUBLE'
      } as HPacketField).subscribe((res) => {
        successCallback(res);
      }, (error) => {
        errorCallback();
      });
    }
  }

  isDirty() {
    return JSON.stringify(this.originalConfig) !== JSON.stringify(this._config);
  }
  isValid() {
    return this._config && this._config.inputFieldId > 0 && this._config.outputFieldId > 0;
  }
}
