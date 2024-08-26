/* tslint:disable */
/* eslint-disable */
/**
 * 
 * @export
 * @interface ApiContentResponseModel
 */
export interface ApiContentResponseModel {
    /**
     * 
     * @type {string}
     * @memberof ApiContentResponseModel
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ApiContentResponseModel
     */
    contentType: string;
    /**
     * 
     * @type {{ [key: string]: any; }}
     * @memberof ApiContentResponseModel
     */
    properties: { [key: string]: any; };
    /**
     * 
     * @type {string}
     * @memberof ApiContentResponseModel
     */
    name: string;
    /**
     * 
     * @type {string}
     * @memberof ApiContentResponseModel
     */
    createDate: string;
    /**
     * 
     * @type {string}
     * @memberof ApiContentResponseModel
     */
    updateDate: string;
    /**
     * 
     * @type {ApiContentResponseModelRoute}
     * @memberof ApiContentResponseModel
     */
    route: ApiContentResponseModelRoute;
    /**
     * 
     * @type {{ [key: string]: ApiContentResponseModelRoute; }}
     * @memberof ApiContentResponseModel
     */
    cultures: { [key: string]: ApiContentResponseModelRoute; };
}
/**
 * @type ApiContentResponseModelRoute
 * 
 * @export
 */
export type ApiContentResponseModelRoute = ApiContentRouteModel;
/**
 * 
 * @export
 * @interface ApiContentRouteModel
 */
export interface ApiContentRouteModel {
    /**
     * 
     * @type {string}
     * @memberof ApiContentRouteModel
     */
    path: string;
    /**
     * 
     * @type {ApiContentRouteModelStartItem}
     * @memberof ApiContentRouteModel
     */
    startItem: ApiContentRouteModelStartItem;
}
/**
 * @type ApiContentRouteModelStartItem
 * 
 * @export
 */
export type ApiContentRouteModelStartItem = ApiContentStartItemModel;
/**
 * 
 * @export
 * @interface ApiContentStartItemModel
 */
export interface ApiContentStartItemModel {
    /**
     * 
     * @type {string}
     * @memberof ApiContentStartItemModel
     */
    id: string;
    /**
     * 
     * @type {string}
     * @memberof ApiContentStartItemModel
     */
    path: string;
}
/**
 * 
 * @export
 * @interface ApiMediaWithCropsResponseModel
 */
export interface ApiMediaWithCropsResponseModel {
    /**
     * 
     * @type {string}
     * @memberof ApiMediaWithCropsResponseModel
     */
    readonly id: string;
    /**
     * 
     * @type {string}
     * @memberof ApiMediaWithCropsResponseModel
     */
    readonly name: string;
    /**
     * 
     * @type {string}
     * @memberof ApiMediaWithCropsResponseModel
     */
    readonly mediaType: string;
    /**
     * 
     * @type {string}
     * @memberof ApiMediaWithCropsResponseModel
     */
    readonly url: string;
    /**
     * 
     * @type {string}
     * @memberof ApiMediaWithCropsResponseModel
     */
    readonly extension?: string | null;
    /**
     * 
     * @type {number}
     * @memberof ApiMediaWithCropsResponseModel
     */
    readonly width?: number | null;
    /**
     * 
     * @type {number}
     * @memberof ApiMediaWithCropsResponseModel
     */
    readonly height?: number | null;
    /**
     * 
     * @type {number}
     * @memberof ApiMediaWithCropsResponseModel
     */
    readonly bytes?: number | null;
    /**
     * 
     * @type {{ [key: string]: any; }}
     * @memberof ApiMediaWithCropsResponseModel
     */
    readonly properties: { [key: string]: any; };
    /**
     * 
     * @type {ApiMediaWithCropsResponseModelFocalPoint}
     * @memberof ApiMediaWithCropsResponseModel
     */
    focalPoint?: ApiMediaWithCropsResponseModelFocalPoint | null;
    /**
     * 
     * @type {Array<ApiMediaWithCropsResponseModelCropsInner>}
     * @memberof ApiMediaWithCropsResponseModel
     */
    crops?: Array<ApiMediaWithCropsResponseModelCropsInner> | null;
    /**
     * 
     * @type {string}
     * @memberof ApiMediaWithCropsResponseModel
     */
    path: string;
    /**
     * 
     * @type {string}
     * @memberof ApiMediaWithCropsResponseModel
     */
    createDate: string;
    /**
     * 
     * @type {string}
     * @memberof ApiMediaWithCropsResponseModel
     */
    updateDate: string;
}
/**
 * @type ApiMediaWithCropsResponseModelCropsInner
 * 
 * @export
 */
export type ApiMediaWithCropsResponseModelCropsInner = ImageCropModel;
/**
 * @type ApiMediaWithCropsResponseModelFocalPoint
 * 
 * @export
 */
export type ApiMediaWithCropsResponseModelFocalPoint = ImageFocalPointModel;
/**
 * @type GetContent200Response
 * 
 * @export
 */
export type GetContent200Response = PagedIApiContentResponseModel;
/**
 * @type GetContent400Response
 * 
 * @export
 */
export type GetContent400Response = ProblemDetails;
/**
 * @type GetContentItem200ResponseInner
 * 
 * @export
 */
export type GetContentItem200ResponseInner = ApiContentResponseModel;
/**
 * @type GetMedia200Response
 * 
 * @export
 */
export type GetMedia200Response = PagedIApiMediaWithCropsResponseModel;
/**
 * @type GetMediaItem200ResponseInner
 * 
 * @export
 */
export type GetMediaItem200ResponseInner = ApiMediaWithCropsResponseModel;
/**
 * 
 * @export
 * @interface ImageCropCoordinatesModel
 */
export interface ImageCropCoordinatesModel {
    /**
     * 
     * @type {number}
     * @memberof ImageCropCoordinatesModel
     */
    x1: number;
    /**
     * 
     * @type {number}
     * @memberof ImageCropCoordinatesModel
     */
    y1: number;
    /**
     * 
     * @type {number}
     * @memberof ImageCropCoordinatesModel
     */
    x2: number;
    /**
     * 
     * @type {number}
     * @memberof ImageCropCoordinatesModel
     */
    y2: number;
}
/**
 * 
 * @export
 * @interface ImageCropModel
 */
export interface ImageCropModel {
    /**
     * 
     * @type {string}
     * @memberof ImageCropModel
     */
    alias?: string | null;
    /**
     * 
     * @type {number}
     * @memberof ImageCropModel
     */
    width: number;
    /**
     * 
     * @type {number}
     * @memberof ImageCropModel
     */
    height: number;
    /**
     * 
     * @type {ImageCropModelCoordinates}
     * @memberof ImageCropModel
     */
    coordinates?: ImageCropModelCoordinates | null;
}
/**
 * @type ImageCropModelCoordinates
 * 
 * @export
 */
export type ImageCropModelCoordinates = ImageCropCoordinatesModel;
/**
 * 
 * @export
 * @interface ImageFocalPointModel
 */
export interface ImageFocalPointModel {
    /**
     * 
     * @type {number}
     * @memberof ImageFocalPointModel
     */
    left: number;
    /**
     * 
     * @type {number}
     * @memberof ImageFocalPointModel
     */
    top: number;
}
/**
 * 
 * @export
 * @interface PagedIApiContentResponseModel
 */
export interface PagedIApiContentResponseModel {
    /**
     * 
     * @type {number}
     * @memberof PagedIApiContentResponseModel
     */
    total: number;
    /**
     * 
     * @type {Array<GetContentItem200ResponseInner>}
     * @memberof PagedIApiContentResponseModel
     */
    items: Array<GetContentItem200ResponseInner>;
}
/**
 * 
 * @export
 * @interface PagedIApiMediaWithCropsResponseModel
 */
export interface PagedIApiMediaWithCropsResponseModel {
    /**
     * 
     * @type {number}
     * @memberof PagedIApiMediaWithCropsResponseModel
     */
    total: number;
    /**
     * 
     * @type {Array<GetMediaItem200ResponseInner>}
     * @memberof PagedIApiMediaWithCropsResponseModel
     */
    items: Array<GetMediaItem200ResponseInner>;
}
/**
 * 
 * @export
 * @interface ProblemDetails
 */
export interface ProblemDetails {
    [key: string]: any | any;
    /**
     * 
     * @type {string}
     * @memberof ProblemDetails
     */
    type?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProblemDetails
     */
    title?: string | null;
    /**
     * 
     * @type {number}
     * @memberof ProblemDetails
     */
    status?: number | null;
    /**
     * 
     * @type {string}
     * @memberof ProblemDetails
     */
    detail?: string | null;
    /**
     * 
     * @type {string}
     * @memberof ProblemDetails
     */
    instance?: string | null;
}
