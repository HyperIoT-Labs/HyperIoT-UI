import { browser, by, element, By } from 'protractor';

export class ProfilePage {
    updateInforBtn = element.all(by.css('hyt-button')).first();
    private updateInfoBtn = element(by.xpath('//*[@id=form-details]/div[6]'));
    changePwdBtn = element.all(by.css('hyt-button')).last();
    nameFormInput = element(by.id('mat-input-2'));

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
