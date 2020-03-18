import { Component, OnInit, Input } from '@angular/core';
import { FormBuilder, FormGroup, FormControl } from '@angular/forms';
import { HPacket, HProject, HpacketsService } from '@hyperiot/core';

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

  selectedMethod = 'FAST';
  selectedNormalization = 'STANDARD';
  selectedType = 'FORWARD';
  inputFields = [];

  constructor(
    private fb: FormBuilder,
    private hpacketService: HpacketsService,
  ) { }

  ngOnInit() {
    this.form = this.fb.group({});
    console.log('FORM', this.form);
    this.update();
  }

  update() {
    this.onTransformMethodChange(this.selectedMethod);
    this.onTransformNormChange(this.selectedNormalization);
    this.onTransformTypeChange(this.selectedType);
  }

  onTransformMethodChange(method) {
    this.selectedMethod = method;
    setTimeout(() => {
      this.form.patchValue({ transformMethod: this.selectedMethod});
      this.form.get('transformMethod').setValue(this.selectedMethod);
    });
  }

  onTransformNormChange(norm) {
    this.selectedNormalization = norm;
    setTimeout(() => {
      this.form.get('transformNorm').setValue(this.selectedNormalization);
    });
  }

  onTransformTypeChange(type) {
    this.selectedType = type;
    setTimeout(() => {
      this.form.get('transformType').setValue(this.selectedType);
    });
  }

  onInputFieldChange(field) {
    console.log('Input field', field, this.inputFields);
  }

}
