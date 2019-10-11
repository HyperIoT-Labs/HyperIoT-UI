import { Component, OnInit, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'hyt-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class SidebarComponent implements OnInit {

  lastSelectedElement;

  constructor() { }

  ngOnInit() {
  }

  click(event) {

    if(this.lastSelectedElement)
      this.lastSelectedElement.classList.remove("selected")

    event.classList.add("selected")

    this.lastSelectedElement = event;
  }

}
