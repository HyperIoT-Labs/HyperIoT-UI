import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HusersService, HUserPasswordReset } from '@hyperiot/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-password-reset',
  templateUrl: './password-reset.component.html',
  styleUrls: ['./password-reset.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PasswordResetComponent implements OnInit {

  email: string;
  code: string;

  recoverPassForm = new FormGroup({});

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
      password: this.recoverPassForm.value.password,
      passwordConfirm: this.recoverPassForm.value.confPassword,
      email: this.email,
      resetCode: this.code
    }

    console.log(pwdReset)

    this.hUserService.resetPassword(pwdReset).subscribe(
      res => this.status = 'SUCCESS',
      err => this.status = 'ERROR'
    )
  }

}
