import { Injectable } from '@angular/core';
import { Platform } from '@angular/cdk/platform';

@Injectable({
  providedIn: 'root'
})
export class PlatformService {
  
  /**
   * variable to manage the browser user agent 
   */
  private userAgent: string;
  
  /**
   * variable to manage the navigation platform
   */
  private platform: string;
  
  /**
   * variable used to understand if the browser supports touch
   */
  private maxTouchPoints: number;
  
  /**
   * variable used to define whether to show a specific message for the Safari browser
   */
  showSafariPrompt = false;

  /**
   * variable used to define whether to show a specific message for the Firefox browser
   */
  showFirefoxPrompt = false;

  constructor(

    private cdkPlatform: Platform

  ) { }
  
  /**
   * Function used to define if we are browsing from an IOS device
   */
  isIOSDevice(): boolean {

    this.userAgent = window.navigator.userAgent;

    this.platform = window.navigator.platform;

    if ( /iPad|iPhone|iPod/.test(this.userAgent) || (this.platform === 'MacIntel' && this.maxTouchPoints > 1) ) {

      console.log('Abbiamo un DEVICE IOS');
      return true;

    } else {

      console.log('NON abbiamo un DEVICE IOS');
      return false;

    }

  }
  
  /**
   * Function to detect the current platform
   */
  getPlBrowser() {
    
    if (this.cdkPlatform.isBrowser) {

      if (this.cdkPlatform.IOS) {
        return 'ios';
      } else if (this.cdkPlatform.SAFARI) {
        return 'safari';
      } else if (this.cdkPlatform.FIREFOX) {
        return 'firefox';
      } else if (this.cdkPlatform.ANDROID) {
        return 'android';
      } else {
        return 'other => '+ window.navigator.userAgent;
      }
      
    } else {

      return 'No Browser';
    }
  }

}
