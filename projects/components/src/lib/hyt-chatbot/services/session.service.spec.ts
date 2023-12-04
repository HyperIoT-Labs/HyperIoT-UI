import { TestBed } from "@angular/core/testing";
import { SessionService } from "./session.service";
import { HttpClientTestingModule } from "@angular/common/http/testing";
import { AppConfig } from "../models/app-config";

describe("SessionService", () => {
  let service: SessionService;
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(SessionService);
  });

  it("should be created", () => {
    expect(service).toBeTruthy();
  });

  it("Init of cookies in case there is no mock and no starting value exists", () => {
    service.initCookieValues();
  });

  it("Init cookies withouth the value setted", () => {
    let delete_cookie = (name: string, path: string, domain: string) => {
      if (get_cookie(name)) {
        document.cookie =
          name +
          "=" +
          (path ? ";path=" + path : "") +
          (domain ? ";domain=" + domain : "") +
          ";expires=Thu, 01 Jan 1970 00:00:01 GMT";
      }
    };

    let get_cookie = (name: string) => {
      return document.cookie.split(";").some((c) => {
        return c.trim().startsWith(name + "=");
      });
    };
    delete_cookie("CJWTTOKEN", "", "");
    delete_cookie("CSTENANT", "", "");
    delete_cookie("WebPageContext", "", "");
    const appConfigInit: AppConfig = {
      cookieMock: false,
      widgetId: "widgetId_TEST",
    };
    service.appConfig = appConfigInit;
    service.initCookieValues();
  });

  it("Init of cookies in case there is no mock and there are starting values", () => {
    document.cookie = "CJWTTOKEN=CJWTTOKEN_TEST;";
    document.cookie = " CSTENANT=CSTENANT_TEST;";
    document.cookie = "WebPageContext=WebPageContext_TEST";
    const appConfigInit: AppConfig = {
      cookieMock: false,
      widgetId: "widgetId_TEST",
    };
    service.appConfig = appConfigInit;
    service.initCookieValues();
  });

  it("should create session witouth error", () => {
    service.createSession({
      next: () => {},
      error: () => {},
    });
  });
});
