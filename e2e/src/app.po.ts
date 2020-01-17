import { browser, by, element } from 'protractor';

export class AppPage {

  // login page elements
  loginButton = element(by.className('mat-raised-button'));
  editUserName = element(by.id('mat-input-0'));
  editPwd = element(by.id('mat-input-1'));
  rememberMe = element(by.id('remember-me'));
  registerNow = browser.element(by.css('#footer-welcome-box > a'));
  forgotPwd = browser.element(by.css('#forgot-container > a'));

  // registration page elements
  nameField = browser.element(by.css('#mat-input-2'));
  surnameField = browser.element(by.css('#mat-input-3'));
  usernameField = browser.element(by.css('#mat-input-4'));
  mailField = browser.element(by.css('#mat-input-5'));
  pwdField = browser.element(by.css('#mat-input-6'));
  confirmField = browser.element(by.css('#mat-input-7'));
  pwdVisibility = browser.element(by.xpath('//*[@id="registration-form"]/form/div[5]/hyt-input-text/div/mat-form-field/div/div[1]/div[2]/mat-icon'));
  checkbox = browser.element(by.css('#mat-checkbox-2-input'));
  signInBtn = browser.element(by.css('#submit-btn > button'));
  errorPwd = browser.element(by.xpath('//*[@id="registration-form"]/form/div[5]/hyt-input-text/div/mat-form-field/div/div[1]/div[1]/div'));
  errorNameNotEntered = browser.element(by.css('#registration-form > form > div:nth-child(1) > hyt-input-text > div > mat-form-field > div > div.mat-form-field-subscript-wrapper > div'));
  errorSurnameNotEntered = browser.element(by.css('#registration-form > form > div:nth-child(2) > hyt-input-text > div > mat-form-field > div > div.mat-form-field-subscript-wrapper > div'));
  errorMailInvalid = browser.element(by.css('#registration-form > form > div:nth-child(4) > hyt-input-text > div > mat-form-field > div > div.mat-form-field-subscript-wrapper > div'));
  // registration page methods

  enterName(keys: string) {
    this.nameField.click();
    return this.nameField.sendKeys(keys);
  }

  enterSurname(keys: string) {
    this.surnameField.click();
    return this.surnameField.sendKeys(keys);
  }

  enterUsername(keys: string) {
    this.usernameField.click();
    return this.usernameField.sendKeys(keys);
  }

  enterMail(keys: string) {
    this.mailField.click();
    return this.mailField.sendKeys(keys);
  }

  enterPassword(keys: string) {
    this.pwdField.click();
    return this.pwdField.sendKeys(keys);
  }

  enterConfirmPwd(keys: string) {
    this.confirmField.click();
    return this.confirmField.sendKeys(keys);
  }

  //login page methods

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

  registration() {
    return this.registerNow;
  }

  pwdRecovery() {
    return this.forgotPwd;
  }

}


