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

  constructor(
    private fb: FormBuilder
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
    { placeholder: '[$NAME_DEVICE$]', description: 'The Name of Device' },
    { placeholder: '[$NAME_PACKET$]', description: 'The Name of Packet' },
    { placeholder: '[$NAME_FIELD$]', description: 'The Name of Field' },
    { placeholder: '[$DATA_EVENT$]', description: 'The Date of eventMail' }
  ];

  addPlaceHolder(event) {
    this.mailForm.patchValue({
      mailBody: this.mailForm.value['mailBody'] + event
    });
    (<HTMLElement>document.querySelector('#mailBody.hyt-input.mat-input-element')).focus();
  }

}
