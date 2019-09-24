import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';

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

}
