import { AppPage } from './app.po';
import { browser, logging, element, by } from 'protractor';

describe('Authentication Page', () => {
  let page: AppPage;

  beforeAll(() => {
    page = new AppPage();

    browser.driver.manage().window().maximize();
    browser.waitForAngularEnabled(false);
    browser.sleep(500);

    page.navigateTo();
  });

  beforeEach(() => {

    // page.editUserName.clear();
    // page.editPwd.clear();
  });

  it('should display the authentication page', () => {
    page.navigateTo();
    expect(browser.getCurrentUrl()).toContain('/auth/login');
    browser.sleep(1000);
  });

  it('should render the login button as disabled(greyed out) with empty fields', () => {
    page.navigateTo();
    expect(page.loginButton.getAttribute('disabled')).toBe('true');
    browser.sleep(1000);
  });

  // it('should redirect you to the authentication page if you are not logged in while trying to access to another url', () => {
  //   page.goToAnotherPage().then();
  //   expect(browser.getCurrentUrl());
  // });

  it('should perform an incorrect login procedure and show an error message', () => {
    page.enterUserName('ciao');
    browser.sleep(500);
    page.enterPwd('mondo');
    browser.sleep(500);
    page.getLoginBtn().click();
    browser.sleep(2000);
    expect(element(by.className('errorMessage')).getText()).toContain('Service temporarily unavaiable');
    browser.sleep(1000);
    page.editUserName.clear();
    browser.sleep(500);
    page.editPwd.clear();
    browser.sleep(500);
  });

  it('should perform a correct login', () => {
    page.enterUserName('hadmin');
    browser.sleep(500);
    page.enterPwd('admin');
    browser.sleep(500);
    page.rememberMe.click();
    browser.sleep(500);
    page.getLoginBtn().click();
    browser.sleep(5000);
    // expect(browser.getCurrentUrl()).toContain('dashboard');
    // browser.sleep(5000);
  });

  // it('should set credentials to storage if "Remember me" is selected', () => {
  //   page.enterUserName('mirko');
  //   browser.sleep(500);
  //   page.enterPwd('ciao!Hello1');
  //   browser.sleep(500);
  //   page.rememberMe.click();
  //   browser.sleep(1000);
  //   page.getLoginBtn().click();
  //   browser.sleep(500);
  //   var storedCredentials = browser.executeScript("JSON.parse(localStorage.getItem('user'));");
  //   browser.sleep(1000);
  //   expect(storedCredentials).toBeTruthy();
  // });

  // afterEach(async () => {
  //   // Assert that there are no errors emitted from the browser
  //   const logs = await browser.manage().logs().get(logging.Type.BROWSER);
  //   expect(logs).not.toContain(jasmine.objectContaining({
  //     level: logging.Level.SEVERE,
  //   } as logging.Entry));
  // });

});
