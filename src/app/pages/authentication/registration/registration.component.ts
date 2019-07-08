import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { HusersService, HUser } from '@hyperiot/core';

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {

  registerForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    lastName: new FormControl('', [Validators.required]),
    userName: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required, Validators.email]),
    password: new FormControl('', [Validators.required]),
    confPassword: new FormControl('', [Validators.required])
  });

  constructor(private hUserService: HusersService) { }

  ngOnInit() {
  }

  register() {
    let user: HUser = {
      name: this.registerForm.value.name,
      lastname: this.registerForm.value.lastName,
      username: this.registerForm.value.userName,
      email: this.registerForm.value.email,
      password: this.registerForm.value.password,
      passwordConfirm: this.registerForm.value.confPassword
    }

    this.hUserService.register(user).subscribe(
      res => {
        console.log(res)
      },
      err => {
        console.log(err.status);
      }
    )
  }

}
