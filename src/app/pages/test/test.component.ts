import { Component, OnInit } from '@angular/core';
import { HusersService } from '@hyperiot/core'

@Component({
  selector: 'hyt-test',
  templateUrl: './test.component.html',
  styleUrls: ['./test.component.scss']
})
export class TestComponent implements OnInit {

  constructor(private ser: HusersService) { }

  ngOnInit() {
  }

  click() {
    this.ser.findAllHUser_1().subscribe(
      res => console.log(res),
      err => console.log(err)
    )
  }

}
