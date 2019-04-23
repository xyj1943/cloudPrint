import { Injectable } from '@angular/core';
import { APIHost } from '../../config';
import { RequestService } from '../request.service';


@Injectable({
    providedIn: 'root'
})
export class MemberManageService {

    public constructor(private requestService: RequestService) { }

    /**
     * 获取-分页数据集合
     * @param params 获取参数
     * @returns Promise对象
     */
    public queryProjectUsersPagedList(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/QueryProjectUsersPagedList",
            method: 'post'
        }, params);
    }

    /**
     * 删除
     * @param params 删除参数
     * @returns Promise对象
     */
    public deleteUser(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/User/DeleteUser",
            method: 'delete'
        }, params);
    }

    /**
     * 批量删除
     * @param params 删除参数
     * @returns Promise对象
     */
    public batchDeleteUser(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/User/BatchDeleteUser",
            method: 'post'
        }, params);
    }

    /**
     * 将用户添加到指定项目
     * @param params 参数
     * @returns Promise对象
     */
    public addUserToProject(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/AddUserToProject",
            method: 'post'
        }, params);
    }

    /**
     * 删除项目成员
     * @param params 参数
     * @returns Promise对象
     */
    public removeUserOnProject(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/RemoveUserOnProject",
            method: 'delete'
        }, params);
    }

    /**
     * 获取部门下用户
     * @param params 参数
     * @returns Promise对象
     */
    public getOrganizationUnitUsers(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/OrganizationUnit/GetOrganizationUnitUsers",
            method: 'get'
        }, params);
    }

    /**
     * 获取部门下用户
     * @param params 参数
     * @returns Promise对象
     */
    public queryRolesByIdList(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Role/QueryRolesByIdList",
            method: 'post'
        }, params);
    }

    /**
     * 获取部门下用户
     * @param params 参数
     * @returns Promise对象
     */
    public queryRolesByCodeList(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Role/QueryRolesByCodeList",
            method: 'post'
        }, params);
    }

}
