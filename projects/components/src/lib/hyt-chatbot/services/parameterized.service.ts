import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable } from "rxjs";

/**
 * @Description
 * Created for testing request with param setted from host app
 */
@Injectable({
  providedIn: "root",
})
export class ParameterizedService {
  constructor(private http: HttpClient) {}

  /**
   * Request test, will be removed or reimplemented
   * @param elementContent UID
   * @returns
   */
  parameterizedRequest(elementContent: string): Observable<any> {
    let headers = new HttpHeaders().set(
      "accept",
      "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7"
    );
    return this.http.get(
        'test',
      //`https://svilweb.unisalute.it/contenthandler/!ut/p/digest!bRQAB0yEDq-OrXCCAYmpsQ/wcmrest/Content/${elementContent}/elements/text?mime-type=application/json`,
      {
        headers: headers,
      }
    );
  }
}
