import { Injectable } from '@angular/core';
import { APIHost } from '../../config';
import { RequestService } from '../request.service';


@Injectable({
    providedIn: 'root'
})
export class RoleManageService {

    public constructor(private requestService: RequestService) { }

    /**
     * 获取-分页数据集合
     * @param params 获取参数
     * @returns Promise对象
     */
    public getRoles(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Role/GetRoles",
            method: 'get'
        }, params);
    }

    /**
     * 获取
     * @param params 获取参数
     * @returns Promise对象
     */
    public getRoleForEdit(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Role/GetRoleForEdit",
            method: 'get'
        }, params);
    }

    /**
     * 删除
     * @param params 删除参数
     * @returns Promise对象
     */
    public deleteRole(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Role/DeleteRole",
            method: 'delete'
        }, params);
    }

    /**
     * 批量删除
     * @param params 删除参数
     * @returns Promise对象
     */
    public batchDeleteRole(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Role/BatchDeleteRole",
            method: 'post'
        }, params);
    }

    /**
     * 修改
     * @param params 修改参数
     * @returns Promise对象
     */
    public updateRole(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Role/CreateOrUpdateRole",
            method: 'post'
        }, params);
    }

    /**
     * 创建
     * @param params 参数
     * @returns Promise对象
     */
    public createRole(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Role/CreateOrUpdateRole",
            method: 'post'
        }, params);
    }

}
