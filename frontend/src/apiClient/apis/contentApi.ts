/* tslint:disable */
/* eslint-disable */
/**
 * Umbraco Delivery API
 * You can find out more about the Umbraco Delivery API in [the documentation](https://docs.umbraco.com/umbraco-cms/reference/content-delivery-api).
 *
 * The version of the OpenAPI document: Latest
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */


import * as runtime from '../runtime';
import type {
  GetContent200Response,
  GetContent400Response,
  GetContentItem200ResponseInner,
} from '../models/index';

export interface GetContentRequest {
    fetch?: string;
    filter?: Array<string>;
    sort?: Array<string>;
    skip?: number;
    take?: number;
    expand?: string;
    acceptLanguage?: string;
    apiKey?: string;
    preview?: boolean;
    startItem?: string;
}

export interface GetContent20Request {
    fetch?: string;
    filter?: Array<string>;
    sort?: Array<string>;
    skip?: number;
    take?: number;
    expand?: string;
    fields?: string;
    acceptLanguage?: string;
    apiKey?: string;
    preview?: boolean;
    startItem?: string;
}

export interface GetContentItemRequest {
    id?: Set<string>;
    expand?: string;
    acceptLanguage?: string;
    apiKey?: string;
    preview?: boolean;
    startItem?: string;
}

export interface GetContentItemByIdRequest {
    id: string;
    expand?: string;
    acceptLanguage?: string;
    apiKey?: string;
    preview?: boolean;
    startItem?: string;
}

export interface GetContentItemById20Request {
    id: string;
    expand?: string;
    fields?: string;
    acceptLanguage?: string;
    apiKey?: string;
    preview?: boolean;
    startItem?: string;
}

export interface GetContentItemByPathRequest {
    path: string;
    expand?: string;
    acceptLanguage?: string;
    apiKey?: string;
    preview?: boolean;
    startItem?: string;
}

export interface GetContentItemByPath20Request {
    path: string;
    expand?: string;
    fields?: string;
    acceptLanguage?: string;
    apiKey?: string;
    preview?: boolean;
    startItem?: string;
}

export interface GetContentItems20Request {
    id?: Set<string>;
    expand?: string;
    fields?: string;
    acceptLanguage?: string;
    apiKey?: string;
    preview?: boolean;
    startItem?: string;
}

/**
 * 
 */
export class ContentApi extends runtime.BaseAPI {

    /**
     * @deprecated
     */
    async getContentRaw(requestParameters: GetContentRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetContent200Response>> {
        const queryParameters: any = {};

        if (requestParameters['fetch'] != null) {
            queryParameters['fetch'] = requestParameters['fetch'];
        }

        if (requestParameters['filter'] != null) {
            queryParameters['filter'] = requestParameters['filter'];
        }

        if (requestParameters['sort'] != null) {
            queryParameters['sort'] = requestParameters['sort'];
        }

        if (requestParameters['skip'] != null) {
            queryParameters['skip'] = requestParameters['skip'];
        }

        if (requestParameters['take'] != null) {
            queryParameters['take'] = requestParameters['take'];
        }

        if (requestParameters['expand'] != null) {
            queryParameters['expand'] = requestParameters['expand'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['acceptLanguage'] != null) {
            headerParameters['Accept-Language'] = String(requestParameters['acceptLanguage']);
        }

        if (requestParameters['apiKey'] != null) {
            headerParameters['Api-Key'] = String(requestParameters['apiKey']);
        }

        if (requestParameters['preview'] != null) {
            headerParameters['Preview'] = String(requestParameters['preview']);
        }

        if (requestParameters['startItem'] != null) {
            headerParameters['Start-Item'] = String(requestParameters['startItem']);
        }

        const response = await this.request({
            path: `/umbraco/delivery/api/v1/content`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * @deprecated
     */
    async getContent(requestParameters: GetContentRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetContent200Response> {
        const response = await this.getContentRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async getContent20Raw(requestParameters: GetContent20Request, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetContent200Response>> {
        const queryParameters: any = {};

        if (requestParameters['fetch'] != null) {
            queryParameters['fetch'] = requestParameters['fetch'];
        }

        if (requestParameters['filter'] != null) {
            queryParameters['filter'] = requestParameters['filter'];
        }

        if (requestParameters['sort'] != null) {
            queryParameters['sort'] = requestParameters['sort'];
        }

        if (requestParameters['skip'] != null) {
            queryParameters['skip'] = requestParameters['skip'];
        }

        if (requestParameters['take'] != null) {
            queryParameters['take'] = requestParameters['take'];
        }

        if (requestParameters['expand'] != null) {
            queryParameters['expand'] = requestParameters['expand'];
        }

        if (requestParameters['fields'] != null) {
            queryParameters['fields'] = requestParameters['fields'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['acceptLanguage'] != null) {
            headerParameters['Accept-Language'] = String(requestParameters['acceptLanguage']);
        }

        if (requestParameters['apiKey'] != null) {
            headerParameters['Api-Key'] = String(requestParameters['apiKey']);
        }

        if (requestParameters['preview'] != null) {
            headerParameters['Preview'] = String(requestParameters['preview']);
        }

        if (requestParameters['startItem'] != null) {
            headerParameters['Start-Item'] = String(requestParameters['startItem']);
        }

        const response = await this.request({
            path: `/umbraco/delivery/api/v2/content`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     */
    async getContent20(requestParameters: GetContent20Request = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetContent200Response> {
        const response = await this.getContent20Raw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * @deprecated
     */
    async getContentItemRaw(requestParameters: GetContentItemRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<GetContentItem200ResponseInner>>> {
        const queryParameters: any = {};

        if (requestParameters['id'] != null) {
            queryParameters['id'] = requestParameters['id'];
        }

        if (requestParameters['expand'] != null) {
            queryParameters['expand'] = requestParameters['expand'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['acceptLanguage'] != null) {
            headerParameters['Accept-Language'] = String(requestParameters['acceptLanguage']);
        }

        if (requestParameters['apiKey'] != null) {
            headerParameters['Api-Key'] = String(requestParameters['apiKey']);
        }

        if (requestParameters['preview'] != null) {
            headerParameters['Preview'] = String(requestParameters['preview']);
        }

        if (requestParameters['startItem'] != null) {
            headerParameters['Start-Item'] = String(requestParameters['startItem']);
        }

        const response = await this.request({
            path: `/umbraco/delivery/api/v1/content/item`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * @deprecated
     */
    async getContentItem(requestParameters: GetContentItemRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<GetContentItem200ResponseInner>> {
        const response = await this.getContentItemRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * @deprecated
     */
    async getContentItemByIdRaw(requestParameters: GetContentItemByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetContentItem200ResponseInner>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling getContentItemById().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['expand'] != null) {
            queryParameters['expand'] = requestParameters['expand'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['acceptLanguage'] != null) {
            headerParameters['Accept-Language'] = String(requestParameters['acceptLanguage']);
        }

        if (requestParameters['apiKey'] != null) {
            headerParameters['Api-Key'] = String(requestParameters['apiKey']);
        }

        if (requestParameters['preview'] != null) {
            headerParameters['Preview'] = String(requestParameters['preview']);
        }

        if (requestParameters['startItem'] != null) {
            headerParameters['Start-Item'] = String(requestParameters['startItem']);
        }

        const response = await this.request({
            path: `/umbraco/delivery/api/v1/content/item/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * @deprecated
     */
    async getContentItemById(requestParameters: GetContentItemByIdRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetContentItem200ResponseInner> {
        const response = await this.getContentItemByIdRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async getContentItemById20Raw(requestParameters: GetContentItemById20Request, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetContentItem200ResponseInner>> {
        if (requestParameters['id'] == null) {
            throw new runtime.RequiredError(
                'id',
                'Required parameter "id" was null or undefined when calling getContentItemById20().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['expand'] != null) {
            queryParameters['expand'] = requestParameters['expand'];
        }

        if (requestParameters['fields'] != null) {
            queryParameters['fields'] = requestParameters['fields'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['acceptLanguage'] != null) {
            headerParameters['Accept-Language'] = String(requestParameters['acceptLanguage']);
        }

        if (requestParameters['apiKey'] != null) {
            headerParameters['Api-Key'] = String(requestParameters['apiKey']);
        }

        if (requestParameters['preview'] != null) {
            headerParameters['Preview'] = String(requestParameters['preview']);
        }

        if (requestParameters['startItem'] != null) {
            headerParameters['Start-Item'] = String(requestParameters['startItem']);
        }

        const response = await this.request({
            path: `/umbraco/delivery/api/v2/content/item/{id}`.replace(`{${"id"}}`, encodeURIComponent(String(requestParameters['id']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     */
    async getContentItemById20(requestParameters: GetContentItemById20Request, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetContentItem200ResponseInner> {
        const response = await this.getContentItemById20Raw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * @deprecated
     */
    async getContentItemByPathRaw(requestParameters: GetContentItemByPathRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetContentItem200ResponseInner>> {
        if (requestParameters['path'] == null) {
            throw new runtime.RequiredError(
                'path',
                'Required parameter "path" was null or undefined when calling getContentItemByPath().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['expand'] != null) {
            queryParameters['expand'] = requestParameters['expand'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['acceptLanguage'] != null) {
            headerParameters['Accept-Language'] = String(requestParameters['acceptLanguage']);
        }

        if (requestParameters['apiKey'] != null) {
            headerParameters['Api-Key'] = String(requestParameters['apiKey']);
        }

        if (requestParameters['preview'] != null) {
            headerParameters['Preview'] = String(requestParameters['preview']);
        }

        if (requestParameters['startItem'] != null) {
            headerParameters['Start-Item'] = String(requestParameters['startItem']);
        }

        const response = await this.request({
            path: `/umbraco/delivery/api/v1/content/item/{path}`.replace(`{${"path"}}`, encodeURIComponent(String(requestParameters['path']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     * @deprecated
     */
    async getContentItemByPath(requestParameters: GetContentItemByPathRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetContentItem200ResponseInner> {
        const response = await this.getContentItemByPathRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async getContentItemByPath20Raw(requestParameters: GetContentItemByPath20Request, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<GetContentItem200ResponseInner>> {
        if (requestParameters['path'] == null) {
            throw new runtime.RequiredError(
                'path',
                'Required parameter "path" was null or undefined when calling getContentItemByPath20().'
            );
        }

        const queryParameters: any = {};

        if (requestParameters['expand'] != null) {
            queryParameters['expand'] = requestParameters['expand'];
        }

        if (requestParameters['fields'] != null) {
            queryParameters['fields'] = requestParameters['fields'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['acceptLanguage'] != null) {
            headerParameters['Accept-Language'] = String(requestParameters['acceptLanguage']);
        }

        if (requestParameters['apiKey'] != null) {
            headerParameters['Api-Key'] = String(requestParameters['apiKey']);
        }

        if (requestParameters['preview'] != null) {
            headerParameters['Preview'] = String(requestParameters['preview']);
        }

        if (requestParameters['startItem'] != null) {
            headerParameters['Start-Item'] = String(requestParameters['startItem']);
        }

        const response = await this.request({
            path: `/umbraco/delivery/api/v2/content/item/{path}`.replace(`{${"path"}}`, encodeURIComponent(String(requestParameters['path']))),
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     */
    async getContentItemByPath20(requestParameters: GetContentItemByPath20Request, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<GetContentItem200ResponseInner> {
        const response = await this.getContentItemByPath20Raw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     */
    async getContentItems20Raw(requestParameters: GetContentItems20Request, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<GetContentItem200ResponseInner>>> {
        const queryParameters: any = {};

        if (requestParameters['id'] != null) {
            queryParameters['id'] = requestParameters['id'];
        }

        if (requestParameters['expand'] != null) {
            queryParameters['expand'] = requestParameters['expand'];
        }

        if (requestParameters['fields'] != null) {
            queryParameters['fields'] = requestParameters['fields'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (requestParameters['acceptLanguage'] != null) {
            headerParameters['Accept-Language'] = String(requestParameters['acceptLanguage']);
        }

        if (requestParameters['apiKey'] != null) {
            headerParameters['Api-Key'] = String(requestParameters['apiKey']);
        }

        if (requestParameters['preview'] != null) {
            headerParameters['Preview'] = String(requestParameters['preview']);
        }

        if (requestParameters['startItem'] != null) {
            headerParameters['Start-Item'] = String(requestParameters['startItem']);
        }

        const response = await this.request({
            path: `/umbraco/delivery/api/v2/content/items`,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response);
    }

    /**
     */
    async getContentItems20(requestParameters: GetContentItems20Request = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<GetContentItem200ResponseInner>> {
        const response = await this.getContentItems20Raw(requestParameters, initOverrides);
        return await response.value();
    }

}
