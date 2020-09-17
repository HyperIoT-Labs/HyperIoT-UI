import { Component, ViewEncapsulation } from '@angular/core';
import { PlatformService } from '../../../services/platform/platform.service';

@Component({
  selector: 'hyt-prompt',
  templateUrl: './prompt.component.html',
  styleUrls: ['./prompt.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class PromptComponent {

  constructor(
    private platformService: PlatformService
  ) { }

  get safariPrompt(): boolean {
    return this.platformService.showSafariPrompt;
  }

  set safariPrompt(value: boolean) {
    this.platformService.showSafariPrompt = value;
  }

  get firefoxPrompt(): boolean {
    return this.platformService.showFirefoxPrompt;
  }

  set firefoxPrompt(value: boolean) {
    this.platformService.showFirefoxPrompt = value;
  }

  close() {
    this.safariPrompt = false;
    this.firefoxPrompt = false;
    document.body.classList.remove('stop-scrolling');
  }

}
