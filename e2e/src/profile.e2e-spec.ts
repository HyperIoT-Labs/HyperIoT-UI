import { ProfilePage } from "./profile.po"
import { browser, logging, element, by } from 'protractor';


describe('Profile Page', () => {
    let profile: ProfilePage;

    beforeAll(() => {
        browser.driver.manage().window().maximize();
        profile = new ProfilePage();
        profile.goToAccount();

    });

    it('...', () => {
        expect(browser.getCurrentUrl()).toContain('/account/profile');
    });

    // it('should render the changePwdBtn unclickable on initialization', () => {

    //     profile.goToAccount();
    //     expect(profile.changePwdBtn.getAttribute('disabled')).toBe('true');
    //     browser.sleep(1000);

    // });

    // it('should render the updateProfile clickable on initialization', () => {

    //     profile.goToAccount();
    //     expect(profile.updateInforBtn.getAttribute('disabled')).toBe('false');
    //     browser.sleep(1000);
    // });

    // it('...', () => {

    //     profile.goToAccount();

    //     profile.nameFormInput.clear();
    //     browser.sleep(1000);

   // });
})