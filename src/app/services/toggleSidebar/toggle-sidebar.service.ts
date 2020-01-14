import { Injectable, Output, EventEmitter } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToggleSidebarService {

  constructor() { }

  showSidebar: boolean = false;

  @Output() change: EventEmitter<boolean> = new EventEmitter();

  changeSidebarStatus() {
    
    this.showSidebar = !this.showSidebar;
    this.change.emit(this.showSidebar);

  }

  resetStatus(): boolean {
    return this.showSidebar = false;
  }

}
