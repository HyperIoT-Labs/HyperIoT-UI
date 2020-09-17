import { Component, OnInit, HostListener } from '@angular/core';
import { LoggerService, Logger } from '@hyperiot/core';
import { PlatformService } from '../../services/platform/platform.service'

@Component({
  selector: 'hyt-notificationbar',
  templateUrl: './notificationbar.component.html',
  styleUrls: ['./notificationbar.component.scss']
})
export class NotificationbarComponent implements OnInit {

  /**
   * logger service
   */
  private logger: Logger;

  plBrowser: string;

  notificationDisplay = false;
  deferredPrompt: any;

  @HostListener('window:beforeinstallprompt', ['$event'])
  onBeforeInstallPrompt(e) {
    this.logger.info('onBeforeInstallPrompt');
    // Prevent Chrome 67 and earlier from automatically showing the prompt
    e.preventDefault();
    // Stash the event so it can be triggered later.
    this.deferredPrompt = e;
    this.showNotificationBar();
  }

  constructor(
    private loggerService: LoggerService,
    private platformService: PlatformService
  ) {

    this.logger = new Logger(this.loggerService);
    this.logger.registerClass('NotificationbarComponent');

  }

  ngOnInit() {

    this.plBrowser = this.platformService.getPlBrowser();
    this.logger.info('Current Browser: '+ this.plBrowser);

    if (this.plBrowser === 'ios' || this.plBrowser === 'android') {
      this.showNotificationBar()
    }

    const self = this;

    window.addEventListener('beforeinstallprompt', (e) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later.
      self.deferredPrompt = e;
      self.showNotificationBar();
    });

  }

  showNotificationBar() {

    this.logger.info('SHOW NOTIFICATION BAR');

    const notificationBar: HTMLElement = document.getElementById('notification-bar') as HTMLElement;
    notificationBar.style.display = 'flex';

  }

  addToHomeScreen() {

    this.logger.info('ADD TO SCREEN');

    const notificationBar: HTMLElement = document.getElementById('notification-bar') as HTMLElement;

    if (this.plBrowser === 'safari' || this.plBrowser === 'ios') {

      document.body.classList.add('stop-scrolling');
      notificationBar.style.display = 'none';
      this.platformService.showSafariPrompt = true;

    } else if (this.plBrowser === 'firefox') {

      document.body.classList.add('stop-scrolling');
      notificationBar.style.display = 'none';
      this.platformService.showFirefoxPrompt = true;

    } else {
      
      notificationBar.style.display = 'none';
      
      this.deferredPrompt.prompt();
      this.deferredPrompt.userChoice
        .then((choiceResult) => {
          if (choiceResult.outcome === 'accepted') {
            console.log('User accepted the A2HS prompt');
          } else {
            console.log('User dismissed the A2HS prompt');
          }
          this.deferredPrompt = null;
        });

    }

  }

  closeNotificationBar() {

    this.logger.info('CLOSE NOTIFICATION BAR');

    const notificationBar: HTMLElement = document.getElementById('notification-bar') as HTMLElement;
    notificationBar.style.display = 'none';

  }

}
