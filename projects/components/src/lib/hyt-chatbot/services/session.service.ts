import { Injectable, OnDestroy } from "@angular/core";
import { PageTags } from "../models/page-tags";
import { Observable, Observer, Subject, takeUntil } from "rxjs";
import { CookieService } from "ngx-cookie-service";
import { AppConfig } from "../models/app-config";
import { ApiConnect } from "../models/api-connect";
import { ChatSession } from "../models/chat-session";
import { HttpClient, HttpHeaders } from "@angular/common/http";

/**
 * @Description
 * Created for manage cookie and session of the ChatBot
 */
@Injectable({
  providedIn: "root",
})
export class SessionService implements OnDestroy {
  sessionID?: string;
  CJWTTOKEN = "";
  CSTENANT = "";
  WebPageContext = "";
  apiConnect: ApiConnect;
  appConfig: AppConfig;
  widgetID: string;
  /** Subject for manage the open subscriptions */
  protected ngUnsubscribe: Subject<void> = new Subject<void>();

  constructor(private cookieService: CookieService, private http: HttpClient) {
    // Otteniamo i parametri della configurazione dell'env
    //this.apiConnect = FreyaAppConfig.getConfigByKey("apiConnect");
    //this.appConfig = FreyaAppConfig.getConfigByKey("appConfig");
    this.widgetID = this.appConfig.widgetId;
  }

  ngOnDestroy(): void {
    if (this.ngUnsubscribe) {
      this.ngUnsubscribe.next();
    }
  }

  /**
   * Ottiene i valori dai cookie necessari
   */
  initCookieValues(): void {
    if (this.appConfig.cookieMock) {
      this.CJWTTOKEN = this.appConfig.CJWTTOKEN!;
      this.CSTENANT = this.appConfig.CSTENANT!;
      this.WebPageContext = this.appConfig.WebPageContext!;
      return;
    }
    this.CJWTTOKEN = this.cookieService.check("CJWTTOKEN")
      ? this.cookieService.get("CJWTTOKEN")
      : "";
    this.CSTENANT = this.cookieService.check("CSTENANT")
      ? this.cookieService.get("CSTENANT")
      : "";
    this.WebPageContext = this.cookieService.check("WebPageContext")
      ? this.cookieService.get("WebPageContext")
      : "";
  }

  /**
   * Get pageTags for create chat session
   */
  get pageTags(): PageTags {
    return {
      CSTENANT: this.CSTENANT,
      CJWTTOKEN: this.CJWTTOKEN,
      WebPageContext: this.WebPageContext,
    };
  }

  /**
   * Subscribe to chatSession
   * @param obs Partial with next & error that will be subscribed
   */
  createSession(obs: Partial<Observer<ChatSession>>) {
    this._createChatSession(
      this.apiConnect.baseApiUrl,
      this.widgetID,
      this.pageTags
    )
      .pipe(takeUntil(this.ngUnsubscribe))
      .subscribe(obs);
  }

  /**
   * Get the sessionId from pega Service
   * @param baseUrl not used
   * @param widgetId widgetId of the chatBot
   * @param pageTags CSTENANT, CJWTTOKEN & WebPageContext value
   */
  private _createChatSession(
    baseUrl: string,
    widgetId: string,
    pageTags?: PageTags
  ): Observable<ChatSession> {
    const headers = new HttpHeaders()
      .set("content-type", "text/plain;charset=UTF-8")
      .set("Accept", "*/*");
    return this.http.post<ChatSession>(
      "https://widget.euw1.chat.pega.digital/" + widgetId + "/create",
      { pageTags },
      { headers: headers }
    );
  }
}
