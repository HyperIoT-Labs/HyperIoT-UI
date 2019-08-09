import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { HusersService } from '@hyperiot/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-user-activation',
  templateUrl: './user-activation.component.html',
  styleUrls: ['./user-activation.component.scss']
})
export class UserActivationComponent implements OnInit {

  email: string;
  code: string;

  activationForm = new FormGroup({
    code: new FormControl('')
  });

  status: string = '';

  constructor(private route: ActivatedRoute, private hUserService: HusersService) {
  }

  ngOnInit() {
    this.route.paramMap.subscribe(
      (p) => {
        this.email = p.get('email');
        this.code = p.get('code');
        this.activate();
      }
    )
  }

  activate() {
    this.hUserService.activate(this.email, this.code).subscribe(
      res => this.status = "SUCCESS",
      err => this.status = "ERROR"
    )
  }

}
