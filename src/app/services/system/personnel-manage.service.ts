import { Injectable } from '@angular/core';
import { APIHost } from '../../config';
import { RequestService } from '../request.service';


@Injectable({
    providedIn: 'root'
})
export class PersonnelManageService {

    public constructor(private requestService: RequestService) { }

    /**
     * 获取-分页数据集合
     * @param params 获取参数
     * @returns Promise对象
     */
    public getUser(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/User/GetUsers",
            method: 'get'
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
     * 创建或更新用户
     * @param params 参数
     * @returns Promise对象
     */
    public createOrUpdateUser(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/User/CreateOrUpdateUser",
            method: 'post'
        }, params);
    }

    /**
     * 系统管理员专用重置密码
     * @param params 参数
     * @returns Promise对象
     */
    public resetPasswordByAdmin(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Account/ResetPasswordByAdmin?userId=" + params.userId,
            method: 'post'
        });
    }

}
