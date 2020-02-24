import { browser, by, element } from 'protractor';

export class ProfilePage {
    updateInforBtn = element.all(by.css('hyt-button')).first();
    updateInfoBtn = element(by.xpath('//*[@id=form-details]/div[6]'));
    changePwdBtn = element.all(by.css('hyt-button')).last();
    nameFormInput = element(by.id('mat-input-2'));
    topbarBtn = browser.element(by.xpath('//*[@id="hyt-account-button"]/button/span'));

    getUpdateInfoBtn() {
        return this.updateInfoBtn;
    }

    getChangePwdBtn() {
        return this.changePwdBtn;
    }

    nameEdit() {
        return this.nameFormInput;
    }

    goToAccount() {
        return browser.get('/account/profile');
    }
}
