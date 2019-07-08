import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HusersService, HUserPasswordReset } from '@hyperiot/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss']
})
export class PasswordResetComponent implements OnInit {

  email: string;
  code: string;

  recoverForm = new FormGroup({
    password: new FormControl('', [Validators.required]),
    confPassword: new FormControl('', [Validators.required])
  });

  status: string = '';

  constructor(private route: ActivatedRoute, private hUserService: HusersService) { }

  ngOnInit() {
    this.route.paramMap.subscribe(
      (p) => {
        this.email = p.get('email');
        this.code = p.get('code');
      }
    )
  }

  resetPwd() {
    console.log(this.email)

    var pwdReset: HUserPasswordReset = {
      password: this.recoverForm.value.password,
      passwordConfirm: this.recoverForm.value.confPassword,
      email: this.email,
      resetCode: this.code
    }

    console.log(pwdReset)

    this.hUserService.resetPassword(pwdReset).subscribe(
      res => this.status = 'SUCCESSO',
      err => this.status = 'ERRORE'
    )
  }

}
