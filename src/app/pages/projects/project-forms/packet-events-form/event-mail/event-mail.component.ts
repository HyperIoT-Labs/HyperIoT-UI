import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SelectableText } from './selectableText';

@Component({
  selector: 'hyt-event-mail',
  templateUrl: './event-mail.component.html',
  styleUrls: ['./event-mail.component.scss']
})
export class EventMailComponent implements OnInit {

  mailForm: FormGroup;

  private originalFormsValues = '';

  placeHolders: SelectableText[] = [
    { placeholder: '[$NAME_DEVICE$]', description: $localize`:@@HYT_name_of_device:The name of the device` },
    { placeholder: '[$NAME_PACKET$]', description: $localize`:@@HYT_name_of_packet:The name of the packet` },
    { placeholder: '[$NAME_FIELD$]', description: $localize`:@@HYT_name_of_field:The name of the field` },
    { placeholder: '[$DATA_EVENT$]', description: $localize`:@@HYT_name_of_event_mail:The name of the event mail` }
  ];

  constructor(
    private fb: FormBuilder
  ) { }

  buildMail(): any {
    return {
      mailRecipient: this.mailForm.value.mailRecipient,
      mailCC: this.mailForm.value.mailCC,
      mailObject: this.mailForm.value.mailObject,
      mailBody: this.mailForm.value.mailBody
    };
  }

  ngOnInit() {
    this.mailForm = this.fb.group({});
  }

  isInvalid(): boolean {
    return this.mailForm.get('mailRecipient').invalid;
  }

  setMail(dataArr): void {
    const data = JSON.parse(dataArr[0]);
    this.mailForm.get('mailRecipient').setValue(data.recipients);
    this.mailForm.get('mailCC').setValue(data.ccRecipients);
    this.mailForm.get('mailObject').setValue(data.subject);
    this.mailForm.get('mailBody').setValue(data.body);
    this.originalValueUpdate();
  }

  reset(): void {
    this.mailForm.reset();
    this.originalValueUpdate();
  }

  addPlaceHolder(event): void {
    this.mailForm.patchValue({
      mailBody: this.mailForm.value.mailBody + event
    });
    (document.querySelector('#mailBody.hyt-input.mat-input-element') as HTMLElement).focus();
  }

  originalValueUpdate() {
    this.originalFormsValues = this.getJsonForms();
  }

  isDirty() {
    return this.getJsonForms() !== this.originalFormsValues;
  }

  private getJsonForms(): string {
    return JSON.stringify(this.mailForm.value);
  }

}
