import { browser, by, element } from 'protractor';

export class AppPage {

  loginButton = element(by.className('mat-raised-button'));
  editUserName = element(by.id('mat-input-0'));
  editPwd = element(by.id('mat-input-1'));
  rememberMe = element(by.id('remember-me'));
  

  navigateTo() {
    return browser.get('/auth/login');
  }

  getTitleText() {
    return element(by.css('hyt-root h1')).getText() as Promise<string>;
  }

  getLoginBtn() {
    return this.loginButton;
  }

  goToAnotherPage() {
    return browser.get('/projects') as Promise<any>;
  }

  enterUserName(keys: string) {
    this.editUserName.click();
    return this.editUserName.sendKeys(keys);
  }

  enterPwd(keys: string) {
    this.editPwd.click();
    return this.editPwd.sendKeys(keys);
  }

}


