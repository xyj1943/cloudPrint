import { Injectable } from '@angular/core';
import { APIHost } from '../../config';
import { RequestService } from '../request.service';


@Injectable({
    providedIn: 'root'
})
export class DepartmentManageService {

    public constructor(private requestService: RequestService) { }

    /**
     * 获取
     * @param params <JSON> 获取接口参数对象
     * @returns Promise对象
     */
    public getOrganizationUnits(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/OrganizationUnit/GetOrganizationUnits",
            method: 'get'
        }, params);
    }

    /**
     * 创建
     * @param params <JSON> 创建接口参数对象
     * @returns Promise对象
     */
    public createOrganizationUnit(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/OrganizationUnit/CreateOrganizationUnit",
            method: 'post'
        }, params);
    }

    /**
     * 删除
     * @param params <JSON> 创建接口参数对象
     * @returns Promise对象
     */
    public deleteOrganizationUnit(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/OrganizationUnit/DeleteOrganizationUnit",
            method: 'delete'
        }, params);
    }

    /**
     * 批量删除
     * @param params <JSON> 创建接口参数对象
     * @returns Promise对象
     */
    public batchDeleteOrganizationUnit(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/OrganizationUnit/BatchDeleteOrganizationUnit",
            method: 'post'
        }, params);
    }

    /**
     * 修改
     * @param params <JSON> 修改接口参数对象
     * @returns Promise对象
     */
    public updateOrganizationUnit(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/OrganizationUnit/UpdateOrganizationUnitExtend",
            method: 'put'
        }, params);
    }

    /**
     * 移动
     * @param params <JSON> 接口参数对象
     * @returns Promise对象
     */
    public moveOrganizationUnit(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/OrganizationUnit/MoveOrganizationUnit",
            method: 'post'
        }, params);
    }
}
