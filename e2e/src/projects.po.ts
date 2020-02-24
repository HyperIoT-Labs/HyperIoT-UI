import { browser, by, element } from 'protractor';

export class ProjectsPage {

    linkToProject = browser.element(by.xpath('//*[@id="go-to-projects"]/button'));
    /**
     * project list page
     */
    title = browser.element(by.css('#title-projects'));
    addProject = browser.element(by.id('add-project-btn-top'));
    projectName = browser.element(by.id('mat-input-1'));
    projectDescription = browser.element(by.id('mat-input-2'));
    hintColumn = browser.element(by.id('hint-column'));
    saveBtn = browser.element(by.xpath('//*[@id="row-save-update"]/div/hyt-button/button'));
    nextBtn = browser.element(by.xpath('//*[@id="row-next-back"]/div/hyt-button/button'));
    cancelProjectCard = browser.element(by.css('#row-cotainer-cards > div:nth-child(1) > hyt-project-card > div > span'));
    sortBy = browser.element(by.xpath('//*[@id="projects-topfilters-box"]/form/div/div[2]/hyt-select/mat-form-field/div/div[1]/div'));
    aZOption = browser.element(by.css('#mat-option-175'));
    cardTitle = browser.element(by.css('#row-cotainer-cards > div:nth-child(1) > hyt-project-card > mat-card > div.title-card-back'));
    provaCard = browser.element(by.css('#row-cotainer-cards > div:nth-child(1) > hyt-project-card'));
    e2eMirkoCard = browser.element(by.css('#row-cotainer-cards > div:nth-child(2) > hyt-project-card'));
    viewProjectE2E = browser.element(by.css('#row-cotainer-cards > div:nth-child(2) > hyt-project-card > mat-card > div.box-card-front > div.footer-card-front > hyt-button > button'));
    viewProjectProva = browser.element(by.css('#row-cotainer-cards > div:nth-child(1) > hyt-project-card > mat-card > div.box-card-front > div.footer-card-front > hyt-button > button'));

    /**
     * project detail page
     */
    backToProjectList = browser.element(by.css('#container-project-treeview > a > span'));
    projectListSaveBtn = browser.element(by.id('save-btn'));
    projectList = browser.element(by.id('mat-input-56'));
    containerHint = browser.element(by.id('container-hint'));

    /**
     * project wizard
     */
    nameInput = browser.element(by.xpath('/html/body/hyt-root/div/div[2]/div[2]/hyt-project-wizard/div/div[2]/div[1]/div[1]/div/hyt-stepper/mat-horizontal-stepper/div[2]/div[1]/hyt-project-form/div/form/div[1]/div/hyt-input-text/div/mat-form-field/div/div[1]/div/input'));
    descriptionInput = browser.element(by.xpath('/html/body/hyt-root/div/div[2]/div[2]/hyt-project-wizard/div/div[2]/div[1]/div[1]/div/hyt-stepper/mat-horizontal-stepper/div[2]/div[1]/hyt-project-form/div/form/div[2]/div/hyt-text-area/div/mat-form-field/div/div[1]/div/textarea'));
    stepperProject =  browser.element(by.xpath('/html/body/hyt-root/div/div[2]/div[2]/hyt-project-wizard/div/div[2]/div[1]/div[1]/div/hyt-stepper/mat-horizontal-stepper/div[1]/mat-step-header[1]'));
    stepperSources = browser.element(by.xpath('//*[@id="cdk-step-label-0-1"]'));
    stepperPackets = browser.element(by.xpath('//*[@id="cdk-step-label-0-2"]'));
    stepperFields = browser.element(by.xpath('//*[@id="cdk-step-label-0-3"]'));
    stepperEnrichment =  browser.element(by.xpath('//*[@id="cdk-step-label-0-4"]'));
    stepperStatistics = browser.element(by.xpath('//*[@id="cdk-step-label-0-5"]'));
    stepperEvents = browser.element(by.xpath('//*[@id="cdk-step-label-0-6"]'));

    /**
     * project
     */
    sourcesTreeView = browser.element(by.xpath('//*[@id="container-project-treeview"]/div/hyt-tree-view-project/mat-tree/mat-tree-node[2]/span[3]/span'));
    projectTags = browser.element(by.xpath('//*[@id="container-project-treeview"]/div/hyt-tree-view-project/mat-tree/mat-tree-node[4]/span[2]/span[2]'));
    projectCategories = browser.element(by.xpath('//*[@id="container-project-treeview"]/div/hyt-tree-view-project/mat-tree/mat-tree-node[5]/span[2]/span[2]'));
    projectAreas = browser.element(by.xpath('//*[@id="container-project-treeview"]/div/hyt-tree-view-project/mat-tree/mat-tree-node[6]/span[2]/span[2]'));
    editInWizard = browser.element(by.xpath('//*[@id="editInWizardContent"]/hyt-button/button/span'));

    /**
     * general methods
     */
    goToProject() {
        return browser.get('/projects');
    }

    /**
     * Wizard page methods
     */

    setNameWizard(keys: string) {
        
        return this.nameInput.sendKeys(keys);
    }

    setDescriptionWizard(keys: string) {
        
        return this.descriptionInput.sendKeys(keys);
    }

}
