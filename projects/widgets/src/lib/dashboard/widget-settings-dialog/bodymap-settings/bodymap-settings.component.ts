import { Component, Input, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ControlContainer, NgForm } from '@angular/forms';
import { ConfirmDialogService, DialogService } from 'components';
import { HPacket } from 'core';
import { Observable } from 'rxjs';
import { WidgetConfig } from '../../../base/base-widget/model/widget.model';
import { BodyMapAssociationComponent } from './body-map-association/body-map-association.component';
import { BodyMap, BodyMapAssociation } from './bodymap.model';

@Component({
    selector: 'hyperiot-bodymap-settings',
    templateUrl: './bodymap-settings.component.html',
    styleUrls: ['./bodymap-settings.component.scss'],
    viewProviders: [{ provide: ControlContainer, useExisting: NgForm }],
    encapsulation: ViewEncapsulation.None,
})
export class BodymapSettingsComponent implements OnInit, OnDestroy {
    subscription: any;
    @Input() modalApply: Observable<any>;
    @Input() widget: WidgetConfig;
    @Input() areaId;
    @Input() hDeviceId;
    selectedFields = [];
    private defaultConfig = {
        timeAxisRange: 10,
        //no limits in data points
        maxDataPoints: 0,
        timeWindow: 60,
        refreshIntervalMillis:1000,
        layout: {
            showlegend: true,
            legend: {
                orientation: 'h',
                x: 0.25,
                y: 1,
                traceorder: 'normal',
                font: {
                    family: 'sans-serif',
                    size: 10,
                    color: '#000'
                },
                bgcolor: '#FFFFFF85',
                borderwidth: 0
            }
        },
        musclesMap: []
    };
    bodyMaps: BodyMap[] = [
      {
        label: 'Male',
        value: 'male',
        svg: 'assets/widgets/bodymap/TBodymapMaleFrontDark.svg',
        dataUrl: 'assets/widgets/bodymap/TBodymapMaleFrontDarkMusclesMap.json'
      },
      {
        label: 'Female',
        value: 'female',
        svg: 'assets/widgets/bodymap/TBodymapFemaleFrontDark.svg',
        dataUrl: 'assets/widgets/bodymap/TBodymapFemaleFrontDarkMusclesMap.json'
      }
    ];
    selectedBodyMapValue: string;
    bodyMap: BodyMap;
    musclesMap: BodyMapAssociation[];

    constructor(
      public settingsForm: NgForm,
      private dialogService: DialogService,
      private confirmDialogService: ConfirmDialogService
    ) { }

    ngOnInit() {
        if (this.widget.config == null) {
            this.widget.config = {};
        }

        if (this.widget.config.bodyMap) {
          this.bodyMap = this.widget.config.bodyMap;
          this.selectedBodyMapValue = this.bodyMap.value;
        } else {
          this.bodyMap = this.bodyMaps[0];
          this.selectedBodyMapValue = this.bodyMap.value;
        }

        if (this.widget.config.musclesMap) {
          this.musclesMap = this.widget.config.musclesMap;
        } else {
          this.musclesMap = [];
        }

        this.subscription = this.modalApply.subscribe((event) => {
            if (event === 'apply') {
                this.apply();
            }
        });

    }
    ngOnDestroy() {
        if (this.subscription) {
            this.subscription.unsubscribe();
        }
    }

    onBodyMapChange(toggleChange) {
      const selectedBodyMap: string = toggleChange.value;
      if (this.musclesMap && this.musclesMap.length) {
        const dialogRef = this.confirmDialogService.open({
          header: 'Conferma modifica',
          text: 'Attenzione, cambiando la mappa saranno perse le assegnazioni precedemente inserite'
        });
        dialogRef.dialogRef.afterClosed().subscribe(
          res => {
            if (res && res.result === 'accept') {
              this.musclesMap = [];
              this.bodyMap = this.bodyMaps.find(x => x.value === selectedBodyMap);
            } else {
              this.selectedBodyMapValue = this.bodyMap.value;
            }
          }
        );
      }
    }

    onSelectedFieldsChange(fields) {
      this.selectedFields = fields;
    }

    apply() {
      if (!this.widget.config.internalConfig) {
        this.widget.config.internalConfig = {};
      }

      this.widget.config.musclesMap = this.musclesMap;
      this.widget.config.svgImage = this.bodyMap.svg;
      this.widget.config.bodyMap = this.bodyMap;
    }

  openDialog(association?: BodyMapAssociation) {
    const elementTarget = document.getElementById('widget-settings-dialog');

    const animationKkeyframes: Keyframe[] = [
      { height: 0 },
      { height: elementTarget.offsetHeight - 45 + 'px'},
    ];
    const animationOptions: KeyframeAnimationOptions = {
      duration: 400,
      iterations: 1,
      easing: 'ease-in-out'
    };
    const dialogRef = this.dialogService.open(BodyMapAssociationComponent,
      {
        data: {
          association, projectId: this.widget.projectId,
          bodyMap: this.bodyMap,
        },
        backgroundClosable: false,
        attachTarget: elementTarget,
        height: elementTarget.offsetHeight - 45 + 'px',
        width: elementTarget.offsetWidth + 'px',
        backdropClass: '',
        customOpenAnimation: {
          keyframes: animationKkeyframes,
          keyframeAnimationOptions: animationOptions
        },
        closeAnimation: true,
        customCloseAnimation: {
          keyframes: animationKkeyframes,
          keyframeAnimationOptions: Object.assign({ direction : 'reverse' }, animationOptions)
        }
      },
    );
    dialogRef.dialogRef.afterClosed().subscribe(
      result => this.onAssociationSave(result)
    );
    }

  currentBodyMapIndex: number = -1;
  addMuscleAssociation() {
    this.openDialog();
  }
  editAssociation(association: BodyMapAssociation) {
    this.currentBodyMapIndex = this.musclesMap.indexOf(association);
    this.openDialog(JSON.parse(JSON.stringify(association)));
  }

  removeAssociation(association: BodyMapAssociation) {
    this.musclesMap = this.musclesMap.filter(m => m !== association);
  }

  onAssociationSave(association: BodyMapAssociation) {
    if (association) {
      if (this.currentBodyMapIndex > -1) {
        this.musclesMap[this.currentBodyMapIndex] = association;
      } else {
        this.musclesMap.push(association);
      }
    }
    this.currentBodyMapIndex = -1;
  }

  getPacketDescription(hPacket: HPacket) {
    return hPacket.device.deviceName + ' | ' + hPacket.name;
  }
  getPacketsInfo(associatedPackets: HPacket[]) {
    let description = '';
    associatedPackets.forEach(p => description += this.getPacketDescription(p) + '; ');
    return description.slice(0, -2);
  }
  getMusclesInfo(associatedMuscles: string[]) {
    let description = '';
    associatedMuscles.forEach(m => description += m + '; ');
    return description.slice(0, -2);
  }

}
