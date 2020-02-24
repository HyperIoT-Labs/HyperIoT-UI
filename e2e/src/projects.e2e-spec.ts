import { ProjectsPage } from './projects.po';
import { browser, by, element } from 'protractor';

describe('Profile Page', () => {
    let page: ProjectsPage;

    beforeAll(() => {
        browser.driver.manage().window().maximize();
        page = new ProjectsPage();
    });

    it('should go to the projects page', () => {
        page.linkToProject.click();
        browser.sleep(2000);
        expect(browser.getCurrentUrl()).toContain('/projects');
        // expect(page.title.getText()).toBe('Project list');
        browser.sleep(2000);
    });

    it('should create a new project using the wizard - project section', () => {
        page.addProject.click();
        browser.sleep(2000);
        expect(page.stepperProject.getAttribute('aria-selected')).toBe('true');
        expect(page.stepperSources.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperPackets.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperFields.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEnrichment.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperStatistics.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEvents.getAttribute('aria-selected')).toBe('false');
        expect(page.saveBtn.getAttribute('disabled')).toBe('true');
        expect(page.nextBtn.getAttribute('disabled')).toBe('true');
        browser.sleep(2000);
        page.nameInput.click();
        browser.sleep(2000);
        page.setNameWizard('nome_progetto');
        page.saveBtn.isEnabled();
        browser.sleep(2000);
        expect(page.hintColumn).toBeTruthy();
        const toolTip = browser.element(by.className('info-message m-2 mt-4 d-flex flex-row'));
        expect(toolTip).toBeTruthy();
        browser.sleep(2000);
        page.descriptionInput.click();
        browser.sleep(2000);
        page.setDescriptionWizard('descrizione_progetto');
        browser.sleep(2000);
        page.saveBtn.click();
        browser.sleep(2000);
        page.nextBtn.click();
        browser.sleep(2000);
    });

    it('should create a new project using the wizard - Sources section', () => {
        expect(page.stepperProject.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperSources.getAttribute('aria-selected')).toBe('true');
        expect(page.stepperPackets.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperFields.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEnrichment.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperStatistics.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEvents.getAttribute('aria-selected')).toBe('false');
        expect(page.saveBtn.getAttribute('disabled')).toBe('true');
        expect(page.nextBtn.getAttribute('disabled')).toBe('true');
        browser.sleep(2000);



        page.saveBtn.click();
        browser.sleep(2000);
        page.nextBtn.click();
        browser.sleep(2000);
    });

    it('should create a new project using the wizard - Packets section', () => {
        expect(page.stepperProject.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperSources.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperPackets.getAttribute('aria-selected')).toBe('true');
        expect(page.stepperFields.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEnrichment.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperStatistics.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEvents.getAttribute('aria-selected')).toBe('false');
        expect(page.saveBtn.getAttribute('disabled')).toBe('true');
        expect(page.nextBtn.getAttribute('disabled')).toBe('true');
        browser.sleep(2000);



        page.saveBtn.click();
        browser.sleep(2000);
        page.nextBtn.click();
        browser.sleep(2000);

    });

    it('should create a new project using the wizard - Fields section', () => {
        expect(page.stepperProject.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperSources.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperPackets.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperFields.getAttribute('aria-selected')).toBe('true');
        expect(page.stepperEnrichment.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperStatistics.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEvents.getAttribute('aria-selected')).toBe('false');
        expect(page.saveBtn.getAttribute('disabled')).toBe('true');
        expect(page.nextBtn.getAttribute('disabled')).toBe('true');
        browser.sleep(2000);



        page.saveBtn.click();
        browser.sleep(2000);
        page.nextBtn.click();
        browser.sleep(2000);
    });

    it('should create a new project using the wizard - Enrichment section', () => {
        expect(page.stepperProject.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperSources.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperPackets.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperFields.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEnrichment.getAttribute('aria-selected')).toBe('true');
        expect(page.stepperStatistics.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEvents.getAttribute('aria-selected')).toBe('false');
        expect(page.saveBtn.getAttribute('disabled')).toBe('true');
        expect(page.nextBtn.getAttribute('disabled')).toBe('true');
        browser.sleep(2000);



        page.saveBtn.click();
        browser.sleep(2000);
        page.nextBtn.click();
        browser.sleep(2000);
    });

    it('should create a new project using the wizard - Statistics section', () => {
        expect(page.stepperProject.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperSources.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperPackets.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperFields.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEnrichment.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperStatistics.getAttribute('aria-selected')).toBe('true');
        expect(page.stepperEvents.getAttribute('aria-selected')).toBe('false');
        expect(page.saveBtn.getAttribute('disabled')).toBe('true');
        expect(page.nextBtn.getAttribute('disabled')).toBe('true');
        browser.sleep(2000);



        page.saveBtn.click();
        browser.sleep(2000);
        page.nextBtn.click();
        browser.sleep(2000);
    });

    it('should create a new project using the wizard - Events section', () => {
        expect(page.stepperProject.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperSources.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperPackets.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperFields.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEnrichment.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperStatistics.getAttribute('aria-selected')).toBe('false');
        expect(page.stepperEvents.getAttribute('aria-selected')).toBe('true');
        expect(page.saveBtn.getAttribute('disabled')).toBe('true');
        expect(page.nextBtn.getAttribute('disabled')).toBe('true');
        browser.sleep(2000);




        page.saveBtn.click();
        browser.sleep(2000);
    });


    // it('should sort by A-Z', () => {
    //     page.sortBy.click();
    //     browser.sleep(2000);
    //     browser.actions().sendKeys(protractor.Key.ARROW_DOWN).sendKeys(protractor.Key.RETURN).perform();
    //     browser.sleep(2000);
    //     page.sortBy.click();
    //     browser.sleep(2000);
    //     browser.actions().sendKeys(protractor.Key.ARROW_UP).sendKeys(protractor.Key.RETURN).perform();
    // });

    // it('should explore the E2E Mirko project', () => {
    //     browser.actions().mouseMove(page.e2eMirkoCard).perform();
    //     browser.sleep(2000);
    //     browser.actions().mouseMove(page.viewProjectE2E).click().perform();
    //     browser.sleep(2000);
    //     page.backToProjectList.click();
    //     browser.sleep(2000);

    // });

    // it('should explore the prova project', () => {
    //     browser.actions().mouseMove(page.provaCard).perform();
    //     browser.sleep(2000);
    //     browser.actions().mouseMove(page.viewProjectProva).click().perform();
    //     browser.sleep(2000);
    //     page.sourcesTreeView.click();
    //     browser.sleep(2000);
    //     page.projectTags.click();
    //     browser.sleep(2000);
    //     page.projectCategories.click();
    //     browser.sleep(2000);
    //     page.projectAreas.click();
    //     browser.sleep(2000);
    //     page.editInWizard.click();
    //     browser.sleep(2000);
    // });


});
