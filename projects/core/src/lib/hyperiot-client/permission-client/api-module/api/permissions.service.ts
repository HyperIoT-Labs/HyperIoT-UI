/**
 * HyperIoT Permission
 * HyperIoT Permission API
 *
 * OpenAPI spec version: 2.0.0
 * Contact: users@acsoftware.it
 *
 * NOTE: This class is auto generated by the swagger code generator program.
 * https://github.com/swagger-api/swagger-codegen.git
 * Do not edit the class manually.
 */
/* tslint:disable:no-unused-variable member-ordering */

import { Inject, Injectable, Optional }                      from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams,
         HttpResponse, HttpEvent }                           from '@angular/common/http';
import { HttpContext }                                       from '@angular/common/http';
import { CustomHttpUrlEncodingCodec }                        from '../encoder';

import { Observable }                                        from 'rxjs';

import { Permission } from '../../../models/permission';

import { BASE_PATH, COLLECTION_FORMATS }                     from '../variables';
import { Configuration }                                     from '../../../models/configuration';


@Injectable()
export class PermissionsService {

    protected basePath = '/hyperiot/permissions';
    public defaultHeaders = new HttpHeaders();
    public configuration = new Configuration();

    constructor(protected httpClient: HttpClient, @Optional()@Inject(BASE_PATH) basePath: string, @Optional() configuration: Configuration) {
        if (basePath) {
            this.basePath = basePath;
        }
        if (configuration) {
            this.configuration = configuration;
            this.basePath = basePath || configuration.basePath || this.basePath;
        }
    }

    /**
     * @param consumes string[] mime-types
     * @return true: consumes contains 'multipart/form-data', false: otherwise
     */
    private canConsumeForm(consumes: string[]): boolean {
        const form = 'multipart/form-data';
        for (const consume of consumes) {
            if (form === consume) {
                return true;
            }
        }
        return false;
    }


    /**
     * /hyperiot/permissions/{id}
     * Delete Permission
     * @param id id from which permission object will deleted
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public deletePermission(id: number, observe?: 'body', reportProgress?: boolean, context?: HttpContext): Observable<any>;
    public deletePermission(id: number, observe?: 'response', reportProgress?: boolean, context?: HttpContext): Observable<HttpResponse<any>>;
    public deletePermission(id: number, observe?: 'events', reportProgress?: boolean, context?: HttpContext): Observable<HttpEvent<any>>;
    public deletePermission(id: number, observe: any = 'body', reportProgress: boolean = false, context = new HttpContext()): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling deletePermission.');
        }

        let headers = this.defaultHeaders;

        // authentication (jwt-auth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["AUTHORIZATION"]) {
            headers = headers.set('AUTHORIZATION', this.configuration.apiKeys["AUTHORIZATION"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];

        return this.httpClient.delete<any>(`${this.basePath}/${encodeURIComponent(String(id))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                context: context,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * /hyperiot/permissions/actions
     * Find All available actions
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public findAllActions(observe?: 'body', reportProgress?: boolean, context?: HttpContext): Observable<any>;
    public findAllActions(observe?: 'response', reportProgress?: boolean, context?: HttpContext): Observable<HttpResponse<any>>;
    public findAllActions(observe?: 'events', reportProgress?: boolean, context?: HttpContext): Observable<HttpEvent<any>>;
    public findAllActions(observe: any = 'body', reportProgress: boolean = false, context = new HttpContext()): Observable<any> {

        let headers = this.defaultHeaders;

        // authentication (jwt-auth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["AUTHORIZATION"]) {
            headers = headers.set('AUTHORIZATION', this.configuration.apiKeys["AUTHORIZATION"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/actions`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                context: context,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * /hyperiot/permissions/all
     * Find All Permission
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public findAllPermission(observe?: 'body', reportProgress?: boolean, context?: HttpContext): Observable<any>;
    public findAllPermission(observe?: 'response', reportProgress?: boolean, context?: HttpContext): Observable<HttpResponse<any>>;
    public findAllPermission(observe?: 'events', reportProgress?: boolean, context?: HttpContext): Observable<HttpEvent<any>>;
    public findAllPermission(observe: any = 'body', reportProgress: boolean = false, context = new HttpContext()): Observable<any> {

        let headers = this.defaultHeaders;

        // authentication (jwt-auth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["AUTHORIZATION"]) {
            headers = headers.set('AUTHORIZATION', this.configuration.apiKeys["AUTHORIZATION"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/all`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                context: context,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * /hyperiot/permissions
     * Find All Permission
     * @param delta 
     * @param page 
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public findAllPermissionPaginated(delta?: number, page?: number, observe?: 'body', reportProgress?: boolean, context?: HttpContext): Observable<any>;
    public findAllPermissionPaginated(delta?: number, page?: number, observe?: 'response', reportProgress?: boolean, context?: HttpContext): Observable<HttpResponse<any>>;
    public findAllPermissionPaginated(delta?: number, page?: number, observe?: 'events', reportProgress?: boolean, context?: HttpContext): Observable<HttpEvent<any>>;
    public findAllPermissionPaginated(delta?: number, page?: number, observe: any = 'body', reportProgress: boolean = false, context = new HttpContext()): Observable<any> {



        let queryParameters = new HttpParams({encoder: new CustomHttpUrlEncodingCodec()});
        if (delta !== undefined && delta !== null) {
            queryParameters = queryParameters.set('delta', <any>delta);
        }
        if (page !== undefined && page !== null) {
            queryParameters = queryParameters.set('page', <any>page);
        }

        let headers = this.defaultHeaders;

        // authentication (jwt-auth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["AUTHORIZATION"]) {
            headers = headers.set('AUTHORIZATION', this.configuration.apiKeys["AUTHORIZATION"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/`,
            {
                params: queryParameters,
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                context: context,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * /hyperiot/permissions/{id}
     * Find Permission
     * @param id id from which permission object will retrieve
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public findPermission(id: number, observe?: 'body', reportProgress?: boolean, context?: HttpContext): Observable<any>;
    public findPermission(id: number, observe?: 'response', reportProgress?: boolean, context?: HttpContext): Observable<HttpResponse<any>>;
    public findPermission(id: number, observe?: 'events', reportProgress?: boolean, context?: HttpContext): Observable<HttpEvent<any>>;
    public findPermission(id: number, observe: any = 'body', reportProgress: boolean = false, context = new HttpContext()): Observable<any> {

        if (id === null || id === undefined) {
            throw new Error('Required parameter id was null or undefined when calling findPermission.');
        }

        let headers = this.defaultHeaders;

        // authentication (jwt-auth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["AUTHORIZATION"]) {
            headers = headers.set('AUTHORIZATION', this.configuration.apiKeys["AUTHORIZATION"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/${encodeURIComponent(String(id))}`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                context: context,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * /hyperiot/permissions/map
     * Get User Permission Map for specific resources
     * @param body Entity names and primary keys
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public getPermissionMap(body: any, observe?: 'body', reportProgress?: boolean, context?: HttpContext): Observable<any>;
    public getPermissionMap(body: any, observe?: 'response', reportProgress?: boolean, context?: HttpContext): Observable<HttpResponse<any>>;
    public getPermissionMap(body: any, observe?: 'events', reportProgress?: boolean, context?: HttpContext): Observable<HttpEvent<any>>;
    public getPermissionMap(body: any, observe: any = 'body', reportProgress: boolean = false, context = new HttpContext()): Observable<any> {

        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling getPermissionMap.');
        }

        let headers = this.defaultHeaders;

        // authentication (jwt-auth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["AUTHORIZATION"]) {
            headers = headers.set('AUTHORIZATION', this.configuration.apiKeys["AUTHORIZATION"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected != undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        return this.httpClient.post<any>(`${this.basePath}/map`,
            body,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                context: context,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * /hyperiot/permissions
     * Save Permission
     * @param body Permission object to store in database
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public savePermission(body: Permission, observe?: 'body', reportProgress?: boolean, context?: HttpContext): Observable<any>;
    public savePermission(body: Permission, observe?: 'response', reportProgress?: boolean, context?: HttpContext): Observable<HttpResponse<any>>;
    public savePermission(body: Permission, observe?: 'events', reportProgress?: boolean, context?: HttpContext): Observable<HttpEvent<any>>;
    public savePermission(body: Permission, observe: any = 'body', reportProgress: boolean = false, context = new HttpContext()): Observable<any> {

        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling savePermission.');
        }

        let headers = this.defaultHeaders;

        // authentication (jwt-auth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["AUTHORIZATION"]) {
            headers = headers.set('AUTHORIZATION', this.configuration.apiKeys["AUTHORIZATION"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected != undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        return this.httpClient.post<any>(`${this.basePath}/`,
            body,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                context: context,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * /hyperiot/permissions/module/status
     * Simple service for checking module status
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public sayHi(observe?: 'body', reportProgress?: boolean, context?: HttpContext): Observable<any>;
    public sayHi(observe?: 'response', reportProgress?: boolean, context?: HttpContext): Observable<HttpResponse<any>>;
    public sayHi(observe?: 'events', reportProgress?: boolean, context?: HttpContext): Observable<HttpEvent<any>>;
    public sayHi(observe: any = 'body', reportProgress: boolean = false, context = new HttpContext()): Observable<any> {

        let headers = this.defaultHeaders;

        // authentication (jwt-auth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["AUTHORIZATION"]) {
            headers = headers.set('AUTHORIZATION', this.configuration.apiKeys["AUTHORIZATION"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
        ];

        return this.httpClient.get<any>(`${this.basePath}/module/status`,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                context: context,
                reportProgress: reportProgress
            }
        );
    }

    /**
     * /hyperiot/permissions
     * Update Permission
     * @param body Permission object to update in database
     * @param observe set whether or not to return the data Observable as the body, response or events. defaults to returning the body.
     * @param reportProgress flag to report request and response progress.
     */
    public updatePermission(body: Permission, observe?: 'body', reportProgress?: boolean, context?: HttpContext): Observable<any>;
    public updatePermission(body: Permission, observe?: 'response', reportProgress?: boolean, context?: HttpContext): Observable<HttpResponse<any>>;
    public updatePermission(body: Permission, observe?: 'events', reportProgress?: boolean, context?: HttpContext): Observable<HttpEvent<any>>;
    public updatePermission(body: Permission, observe: any = 'body', reportProgress: boolean = false, context = new HttpContext()): Observable<any> {

        if (body === null || body === undefined) {
            throw new Error('Required parameter body was null or undefined when calling updatePermission.');
        }

        let headers = this.defaultHeaders;

        // authentication (jwt-auth) required
        if (this.configuration.apiKeys && this.configuration.apiKeys["AUTHORIZATION"]) {
            headers = headers.set('AUTHORIZATION', this.configuration.apiKeys["AUTHORIZATION"]);
        }

        // to determine the Accept header
        let httpHeaderAccepts: string[] = [
            'application/json'
        ];
        const httpHeaderAcceptSelected: string | undefined = this.configuration.selectHeaderAccept(httpHeaderAccepts);
        if (httpHeaderAcceptSelected != undefined) {
            headers = headers.set('Accept', httpHeaderAcceptSelected);
        }

        // to determine the Content-Type header
        const consumes: string[] = [
            'application/json'
        ];
        const httpContentTypeSelected: string | undefined = this.configuration.selectHeaderContentType(consumes);
        if (httpContentTypeSelected != undefined) {
            headers = headers.set('Content-Type', httpContentTypeSelected);
        }

        return this.httpClient.put<any>(`${this.basePath}/`,
            body,
            {
                withCredentials: this.configuration.withCredentials,
                headers: headers,
                observe: observe,
                context: context,
                reportProgress: reportProgress
            }
        );
    }

}
