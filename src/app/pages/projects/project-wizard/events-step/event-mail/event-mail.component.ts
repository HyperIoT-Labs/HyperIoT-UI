import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectableText } from './selectableText';
import { ProjectWizardService } from 'src/app/services/projectWizard/project-wizard.service';
import { I18n } from '@ngx-translate/i18n-polyfill';

@Component({
  selector: 'hyt-event-mail',
  templateUrl: './event-mail.component.html',
  styleUrls: ['./event-mail.component.scss']
})
export class EventMailComponent implements OnInit {

  mailForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private wizardService: ProjectWizardService,
    private i18n: I18n
  ) { }

  buildMail() {
    return {
      mailRecipient: this.mailForm.value['mailRecipient'],
      mailCC: this.mailForm.value['mailCC'],
      mailObject: this.mailForm.value['mailObject'],
      mailBody: this.mailForm.value['mailBody']
    }
  }

  ngOnInit() {
    this.mailForm = this.fb.group({});
  }

  isInvalid() {
    return this.mailForm.get('mailRecipient').invalid;
  }

  placeHolders: SelectableText[] = [
    { placeholder: '[$NAME_DEVICE$]', description: this.i18n('HYT_name_of_device') },
    { placeholder: '[$NAME_PACKET$]', description: this.i18n('HYT_name_of_packet') },
    { placeholder: '[$NAME_FIELD$]', description: this.i18n('HYT_name_of_field') },
    { placeholder: '[$DATA_EVENT$]', description: this.i18n('HYT_name_of_event_mail') }
  ];

  addPlaceHolder(event) {
    this.mailForm.patchValue({
      mailBody: this.mailForm.value['mailBody'] + event
    });
    (<HTMLElement>document.querySelector('#mailBody.hyt-input.mat-input-element')).focus();
  }

  updateHint(event: string) {
    this.wizardService.updateHint(event, 6);
  }

}
