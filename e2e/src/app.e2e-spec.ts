import { AppPage } from './app.po';
import { browser, logging, element, by } from 'protractor';
import { notDeepEqual } from 'assert';

describe('Authentication Page', () => {
  let page: AppPage;

  beforeAll(() => {
    page = new AppPage();

    browser.driver.manage().window().maximize();
    browser.waitForAngularEnabled(false);

    page.navigateTo();

  });

  beforeEach(() => {
    // page.editUserName.clear();
    // page.editPwd.clear();
  });

  // registration page

  it('should display the registration page', () => {
    browser.sleep(1000);
    page.registration().click();
    browser.sleep(2000);
    expect(browser.getCurrentUrl()).toContain('/auth/registration');
    browser.sleep(2000);
  });

  it('should display the sign in button disabled when the form is empty', () => {
    expect(page.signInBtn.getAttribute('disabled')).toBe('true');
    browser.sleep(1000);
  });

  it('should start filling the form forgetting the name field and receive a notice that a name is required', () => {
    page.nameField.click();
    browser.sleep(2000);
    page.surnameField.click();
    browser.sleep(1000);
    expect(page.errorNameNotEntered.getText()).toContain('This field is mandatory');
    browser.sleep(1000);
    page.enterName('Bill');
    browser.sleep(2000);
  });

  it('should proceed filling the form with a mail address that does not meet the requirement', () => {
    page.enterSurname('Gates');
    browser.sleep(2000);
    page.enterUsername('CiaoPovery');
    browser.sleep(2000);
    page.enterMail('yourboss');
    browser.sleep(2000);
    expect(page.errorMailInvalid.getText()).toContain('Please enter a valid email address');
    browser.sleep(1000);
    page.enterMail('@microsoft.com');
    browser.sleep(1000);
  });

  it('should attempt to choose a password', () => {
    page.enterPassword('I');
    browser.sleep(1000);
    page.enterPassword('h8');
    browser.sleep(1000);
    page.enterPassword('A');
    browser.sleep(1000);
    page.enterPassword('pple');
    browser.sleep(2000);
    expect(page.errorPwd.getText()).toContain('At least one special character');
    browser.sleep(2000);
    page.enterPassword('#');
    browser.sleep(2000);
    expect(page.pwdField.getAttribute('type')).toEqual('password');
    browser.sleep(2000);
    page.pwdVisibility.click();
    browser.sleep(1000);
    expect(page.pwdField.getAttribute('type')).toEqual('text');
    browser.sleep(2000);
  });

  it('should enter e different password in the confirmation field', () => {
    page.enterConfirmPwd('ih8Apple#');
    browser.sleep(2000);
  });

  // login page

  // it('should display the authentication page', () => {
  //   expect(browser.getCurrentUrl()).toContain('/auth/login');
  //   browser.sleep(2000);
  // });

  // it('should render the login button as disabled(greyed out) with empty fields', () => {
  //   expect(page.loginButton.getAttribute('disabled')).toBe('true');
  //   browser.sleep(2000);
  // });

  // it('should redirect you to the authentication page if you are not logged in while trying to access to the Projects page', () => {
  //   page.goToAnotherPage().then();
  //   expect(browser.getCurrentUrl()).toContain('/login');
  //   browser.sleep(2000);
  // });

  // it('should perform an incorrect login procedure and show an error message', () => {
  //   page.navigateTo();
  //   page.enterUserName('ciao');
  //   browser.sleep(1000);
  //   page.enterPwd('mondo');
  //   browser.sleep(1000);
  //   page.getLoginBtn().click();
  //   browser.sleep(2000);
  //   expect(element(by.className('errorMessage')).getText()).toContain('Wrong username or password');
  //   browser.sleep(1000);
  //   page.editUserName.clear();
  //   browser.sleep(500);
  //   page.editPwd.clear();
  //   browser.sleep(1000);
  // });

  // it('should perform a correct login', () => {
  //   page.enterUserName('hadmin');
  //   browser.sleep(1000);
  //   page.enterPwd('admin');
  //   browser.sleep(1000);
  //   // page.rememberMe.click();
  //   // browser.sleep(500);
  //   page.getLoginBtn().click();
  //   browser.sleep(2000);
  // });

  // afterEach(async () => {
  //   // Assert that there are no errors emitted from the browser
  //   const logs = await browser.manage().logs().get(logging.Type.BROWSER);
  //   expect(logs).not.toContain(jasmine.objectContaining({
  //     level: logging.Level.SEVERE,
  //   } as logging.Entry));
  // });






});
