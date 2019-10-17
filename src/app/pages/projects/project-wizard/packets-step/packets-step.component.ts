import { Component, ViewChild } from '@angular/core';
import { HpacketsService, HPacket } from '@hyperiot/core';
import { ProjectWizardHttpErrorHandlerService } from 'src/app/services/errorHandler/project-wizard-http-error-handler.service';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';
import { PacketsFormComponent } from './packets-form/packets-form.component';
import { PageStatusEnum } from '../model/pageStatusEnum';

@Component({
  selector: 'hyt-packets-step',
  templateUrl: './packets-step.component.html',
  styleUrls: ['./packets-step.component.scss']
})
export class PacketsStepComponent {

  selectedPacket: HPacket;

  @ViewChild('packetsForm', { static: false }) form: PacketsFormComponent;

  constructor(
    private wizardService: ProjectWizardService,
    private hPacketService: HpacketsService,
    private errorHandler: ProjectWizardHttpErrorHandlerService
  ) { }

  savePacket() {

    this.form.pageStatus = PageStatusEnum.Loading;

    let hPacket: HPacket = {
      entityVersion: 1,
      name: this.form.packetForm.value['hpacket-name'],
      type: this.form.packetForm.value['hpacket-type'],
      format: this.form.packetForm.value['hpacket-format'],
      serialization: this.form.packetForm.value['hpacket-serialization'],
      fields: [],
      trafficPlan: this.form.packetForm.value['packetTrafficPlan'],
      timestampField: this.form.packetForm.value['hpacketTimeStamp'], //'timestampField',
      timestampFormat: this.form.packetForm.value['hpacketTimeStampFormat'], //'dd/MM/yyyy HH.mmZ',
      version: '1',
      device: { id: this.form.packetForm.value['hpacket-device'].id, entityVersion: this.form.packetForm.value['hpacket-device'].entityVersion }
    }

    this.hPacketService.saveHPacket(hPacket).subscribe(
      res => {
        this.form.resetForm('ADD');
        this.form.pageStatus = PageStatusEnum.Submitted;
        this.wizardService.addPacket(res);
      },
      err => {
        this.form.pageStatus = PageStatusEnum.Error;
        this.form.errors = this.errorHandler.handleCreatePacket(err);
        this.form.errors.forEach(e => {
          if (e.container != 'general')
            this.form.packetForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    )
  }

  updatePacket() {

    this.form.pageStatus = PageStatusEnum.Loading;

    this.selectedPacket.name = this.form.packetForm.value['hpacket-name'];
    this.selectedPacket.type = this.form.packetForm.value['hpacket-type'];
    this.selectedPacket.format = this.form.packetForm.value['hpacket-format'];
    this.selectedPacket.serialization = this.form.packetForm.value['hpacket-serialization'];
    this.selectedPacket.trafficPlan = this.form.packetForm.value['packetTrafficPlan'];
    this.selectedPacket.timestampField = this.form.packetForm.value['hpacketTimeStamp'];
    this.selectedPacket.timestampFormat = this.form.packetForm.value['hpacketTimeStampFormat'];
    this.selectedPacket.device = { id: this.form.packetForm.value['hpacket-device'].id, entityVersion: this.form.packetForm.value['hpacket-device'].entityVersion };

    this.hPacketService.updateHPacket(this.selectedPacket).subscribe(
      res => {
        this.form.resetForm('ADD');
        this.form.pageStatus = PageStatusEnum.Submitted;
        this.wizardService.updatePacket(res);
      },
      err => {
        this.form.pageStatus = PageStatusEnum.Error;
        this.form.errors = this.errorHandler.handleCreatePacket(err);
        this.form.errors.forEach(e => {
          if (e.container != 'general')
            this.form.packetForm.get(e.container).setErrors({
              validateInjectedError: {
                valid: false
              }
            });
        })
      }
    )
  }

  tableUpdatePacket(packet: HPacket) {
    this.selectedPacket = packet;
    this.form.setForm(packet, 'UPDATE');
  }

  tableCopyPacket(packet: HPacket) {
    this.form.setForm(packet, 'ADD');
  }

  //delete logic

  deleteModal: boolean = false;

  deleteError: string = null;

  showDeleteModal(packet: HPacket) {
    this.deleteError = null;
    this.selectedPacket = packet;
    this.deleteModal = true;
  }

  hideDeleteModal() {
    this.deleteModal = false;
    this.selectedPacket = null;
  }

  deletePacket() {
    this.deleteError = null;
    this.hPacketService.deleteHPacket(this.selectedPacket.id).subscribe(
      res => {
        this.form.resetForm('ADD');
        this.wizardService.deletePacket(this.selectedPacket.id);
        this.hideDeleteModal();
      },
      err => {
        this.deleteError = "Error executing your request";
      }
    );
  }

}
