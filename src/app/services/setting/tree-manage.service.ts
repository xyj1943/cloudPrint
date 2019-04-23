import { Injectable } from '@angular/core';
import { APIHost } from '../../config';
import { RequestService } from '../request.service';


@Injectable({
    providedIn: 'root'
})
export class TreeManageService {

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
     * 创建结构
     * @param params 参数
     * @returns Promise对象
     */
    public createModelDirectory(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/BodyPropertys/CreateModelDirectory",
            method: 'post'
        }, params);
    }

    /**
     * 修改结构
     * @param params 参数
     * @returns Promise对象
     */
    public modifyModelDirectory(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/BodyPropertys/ModifyModelDirectory",
            method: 'post'
        }, params);
    }

    /**
     * 删除结构
     * @param params 参数
     * @returns Promise对象
     */
    public removeModelDirectory(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/BodyPropertys/RemoveModelDirectory",
            method: 'delete'
        }, params);
    }

    /**
     * 返回所有标记为模版的项目列表
     * @param params 参数
     * @returns Promise对象
     */
    public queryTemplateList(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/QueryTemplateList",
            method: 'post'
        }, params);
    }

    /**
     * 初始化模板（默认模板、项目模板、空模板）
     * @param params 参数
     * @returns Promise对象
     */
    public initTemplate(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/InitTemplate",
            method: 'post'
        }, params);
    }

    /**
     * 上传Excel模板
     * @param params 参数
     * @returns Promise对象
     */
    public UploadTemplate(params) {
        let headers = {
            'Content-Type' : 'multipart/form-data'
        }
        return this.requestService.queryServer({
            url: APIHost + "/api/services/app/Projects/UploadTemplate",
            method: 'post-form-data'
        }, params, headers);
    }

    /**
     * 调整结构排序位置
     * @param params 参数
     * @returns Promise对象
     */
    public modifyModelDirectorySort(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/BodyPropertys/ModifyModelDirectorySort",
            method: 'post'
        }, params);
    }

}
