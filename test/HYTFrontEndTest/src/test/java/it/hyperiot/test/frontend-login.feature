Feature: Backoffice login

  Background:
    * configure driver = { type: 'chrome'}
    * def portalUrl = 'https://dashboard-test.hyperiot.cloud'
  # * configure driverTarget = { docker: 'justinribeiro/chrome-headless', showDriverLog: true }
  # * configure driverTarget = { docker: 'ptrthomas/karate-chrome', showDriverLog: true }
  # * configure driver = { type: 'chromedriver', showDriverLog: true }
  # * configure driver = { type: 'geckodriver', showDriverLog: true }
  # * configure driver = { type: 'safaridriver', showDriverLog: true }
  # * configure driver = { type: 'iedriver', showDriverLog: true, httpConfig: { readTimeout: 120000 } }

  Scenario: Login come utente backoffice e popolamento cookie

    Given driver portalUrl+'/auth/login'
    And waitUntil("document.readyState == 'complete'")
    And value('input#mat-input-0', '')
    And input('input#mat-input-0', 'hadmin', 200)
    And input('input#mat-input-1', 'admin', 200)
    When input('input#mat-input-1', [Key.ENTER],1000)
    Then waitForUrl('https://dashboard-test.hyperiot.cloud/')
    And  match text('h3#welcome-title') == 'Welcome to HyperIoT'
