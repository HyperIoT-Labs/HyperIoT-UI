import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup } from '@angular/forms';
import { HPacket, HpacketsService, HProject, Logger, LoggerService } from 'core';
import { EnrichmentType } from '../enrichment-type.enum';
import { DataSimulatorSettings } from 'projects/widgets/src/lib/dashboard/widget-settings-dialog/data-simulator-settings/data-simulator.models';

@Component({
  selector: 'hyt-virtual-sensor',
  templateUrl: './virtual-sensor.component.html',
  styleUrls: ['./virtual-sensor.component.scss']
})
export class VirtualSensorComponent implements OnInit {

  @Input()
  packet: HPacket;

  @Input()
  project: HProject;

  form: FormGroup = this.fb.group({
    fieldRules: this.fb.group({
      type: 'expression',
      expression: ''
    })
  });

  testArrayForm = this.fb.array([]);

  fieldOptions = [];

  _config = {
    actionName: EnrichmentType.VIRTUAL_SENSOR_ENRICHMENT,
    inputFieldId: 0,
    outputFieldId: 0,
    outputFieldName: ''
  };

  @Input()
  set config(cfg: any) {
    this._config = cfg;
    cfg.actionName = EnrichmentType.VIRTUAL_SENSOR_ENRICHMENT;
    this.update();
  }

  get config() {
    return this._config
  };

  originalConfig: any;

  expressionIsValid: boolean = true;

  private logger: Logger;

  constructor(
    private fb: FormBuilder,
    private hpacketService: HpacketsService,
    private cd: ChangeDetectorRef,
    private loggerService: LoggerService,
  ) {
    this.logger = new Logger(this.loggerService);
    this.logger.registerClass(this.constructor.name);
  }

  ngOnInit(): void {
    this.fieldOptions = this.packet.fields.map(({ name, id }) => {
      return {
        label: name,
        value: id,
        disabled: false
      }
    });

    this.add();
  }

  last: any
  add() {
    const index = this.testArrayForm.controls.length === 0 ? 1 : this.testArrayForm.controls.length + 1;

    const row = this.fb.group({
      placeHolder: `$val${index}`,
      field: null
    })

    row.valueChanges.subscribe(({ field }) => {
      console.log(field);

      if (this.testArrayForm.controls.length > 1) {
        if (this.last && this.last.value !== field) {
          this.last.disabled = false;
        }

        this.last = this.fieldOptions.find((x) => x.value === field);
        this.last.disabled = true;

        // this.fieldOptions = this.fieldOptions.map(({
        //   label,
        //   value,
        //   disabled
        // }) => {
        //   return {
        //     label,
        //     value,
        //     disabled: field === value
        //   }
        // });
      } else {
        this.fieldOptions = this.fieldOptions.map(({
          label,
          value,
          disabled
        }) => {
          return {
            label,
            value,
            disabled: field === value
          }
        });
      }


    });

    row.valueChanges.subscribe((value) => {
      return
      console.log(value);
      console.log({ ...this.fieldOptions });

      if (this.testArrayForm.controls.length > 1) {
        let dis = [];
        let notDis = [];
        for (const element of this.fieldOptions) {
          if (element.disabled) {
            dis.push(element)
          } else {
            notDis.push(element)
          }
        }

        if (this.last) {
          const sss = dis.find((x) => x.value === this.last.value);
          if (sss) {
            sss.disabled = !sss.disabled
          }
          // this.last.disabled = false;
        }

        this.last = this.fieldOptions.find((x) => x.value === value.field);
        if (this.last) {
          this.last.disabled = true;
        }

        // const x = notDis.find((x) => x.value === value.field);
        // if (this.last) {          
        //   const sss = dis.find((x) => x.value === this.last.value);
        //   if (sss) {
        //     sss.disabled = !sss.disabled
        //   }
        //   // this.last.disabled = false;
        // }

        // if (x) {
        //   x.disabled = true;
        //   this.last = x 
        // }


      } else {
        this.fieldOptions = this.packet.fields.map(({ name, id }) => {
          return {
            label: name,
            value: id,
            disabled: id === value.field
          }
        });
      }


      // if (this.testArrayForm.controls.length > 1) {
      //   const x = this.fieldOptions.find((x) => x.value === value.field);
      //   if (x) {
      //     if (this.last) {
      //       const vvv = this.fieldOptions.find((x) => x.value === this.last.value);
      //       if (vvv){
      //         vvv.disabled = !vvv.disabled
      //       }
      //     }
      //     x.disabled = true;
      //     this.last = {...x}
      //   } 
      //   // const aaa = this.packet.fields.map(({ name, id }) => {
      //   //   return {
      //   //     label: name,
      //   //     value: id,
      //   //     disabled: id === value.field
      //   //   }
      //   // });


      // } else {
      //   this.fieldOptions = [...xx]
      // }

      console.log(this.fieldOptions);

      // const x = this.fieldOptions.find((x) => x.value === value.field);
      // if (x) {
      //   x.disabled = !x.disabled
      // }
    })

    this.testArrayForm.push(row);
  }

  deleteRow(index: number) {
    const oldValue = this.testArrayForm.at(index).value;

    const x = this.fieldOptions.find((x) => x.value === oldValue.field);
    if (x) {
      x.disabled = true
    }

    this.testArrayForm.removeAt(index);

    if (this.testArrayForm.controls.length > 0) {
      for (let index = 0; index < this.testArrayForm.controls.length; index++) {
        const element = this.testArrayForm.controls[index];
        element.get('placeHolder').setValue(`$val${index + 1}`);
      }
    }
  }

  onPlaceholderFieldChange(e) {
    console.log(5);
  }

  onInputFieldChange(field) {
    console.log(4);
  }

  onOutputFieldChange(e) {
    console.log(5);
  }

  onOutputFieldResetClick() {
    console.log(6);
  }

  update() {
    this.config.outputFieldName = '';
    // this.cd.detectChanges();
    // this.form.get('inputField')?.setValue(this.config.inputFieldId);
    // if (this.config.outputFieldId) {
    //   this.hpacketService.findHPacket(this.packet.id).subscribe((res) => {
    //     this.packet = res;
    //     const outputField = this.packet.fields.find((pf) => pf.id === this.config.outputFieldId);
    //     if (outputField) {
    //       this.config.outputFieldName = outputField.name;
    //     } else {
    //       this.config.outputFieldId = 0;
    //       this.config.outputFieldName = '';
    //     }
    //   });
    // }

    // this.originalConfig = {};
    // Object.assign(this.originalConfig, this._config);
  }

  isDirty() {
    return JSON.stringify(this.originalConfig) !== JSON.stringify(this._config);
  }

  isValid() {
    return this._config && this._config.inputFieldId > 0 && this._config.outputFieldId > 0;
  }

  updateExpression(ev) {
    let expression: string = ev.target.value;
    expression = expression.replace(',', '.');
    // this.fieldRules[0] = { type: 'expression', expression: '' };
    try {
      for (const operator of DataSimulatorSettings.Utils.expressionOperators) {
        expression = expression.replace(
          operator.regex,
          operator.function
        );
      }
      const result = eval(expression.replace(/\$val/g, '2'));
      this.logger.debug('expression is valid', expression.replace(/\$val/g, '2'), result);
      this.expressionIsValid = true;
      this.form.controls['expression'].setErrors(null);
    } catch (error) {
      this.logger.debug('expression is not valid', expression.replace(/\$val/g, '2'));
      this.expressionIsValid = false;
      this.form.controls['expression'].setErrors({ 'incorrect': true });
    }
    // this.logger.debug(this.fieldRules);
  }
}
