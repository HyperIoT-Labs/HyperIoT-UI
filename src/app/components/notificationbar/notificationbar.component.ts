import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'hyt-notificationbar',
  templateUrl: './notificationbar.component.html',
  styleUrls: ['./notificationbar.component.scss']
})
export class NotificationbarComponent implements OnInit {

  notificationDisplay = false;
  deferredPrompt: any;

  constructor() { }

  ngOnInit() {
    const self = this;

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      self.deferredPrompt = e;
      self.showAddToHomeScreen();
    });

  }

  addToHomeScreen() {
    this.deferredPrompt.prompt();
    this.deferredPrompt.userChoice
      .then((choiceResult) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('User accepted the A2HS prompt');
          this.notificationDisplay = false;
        } else {
          console.log('User dismissed the A2HS prompt');
          this.notificationDisplay = false;
        }
        this.deferredPrompt = null;
      });
  }

  closeNotification() {
    this.notificationDisplay = false;
  }

  showAddToHomeScreen() {
    this.notificationDisplay = true;
    console.log('Notify: ', this.notificationDisplay);
    const adToHomeBtn: HTMLElement = document.getElementById('btn-dwd-ok') as HTMLElement;
    // adToHomeBtn.style.display = 'block';
    adToHomeBtn.addEventListener('click', this.addToHomeScreen);
  }

}
