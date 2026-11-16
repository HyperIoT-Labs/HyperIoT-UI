import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'hyt-core',
    template: `
    <p>
      core works!
    </p>
  `,
    styles: [],
    standalone: false
})
export class CoreComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
