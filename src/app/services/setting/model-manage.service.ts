import { Injectable } from '@angular/core';
import { APIHost, FileHost } from '../../config';
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
    public queryProjectModelFilesPagedList(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/QueryProjectModelFilesPagedList",
            method: 'post'
        }, params);
    }

    /**
     * 删除模型
     * @param params 获取参数
     * @returns Promise对象
     */
    public removeProjectModelFile(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/RemoveProjectModelFile",
            method: 'delete'
        }, params);
    }

    /**
     * 修改上传模型文件 
     * @param params 
     */
    public editFileInfo(params: any) {
        return this.requestService.queryServer({
            url: FileHost + "/api/v1/File",
            method: 'filePut'
        }, params);
    }

    /**
     * 解析模型
     * @param params 
     */
    public analysisModel(params: any) {
        return this.requestService.queryServer({
            url: FileHost + "/api/v1/File/convertModel",
            method: 'fileGet'
        }, params);
    }

    /**
     * 添加模型文件 
     * @param params 
     */
    public addModelFile(params: any) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/CreateProjectModelFiles",
            method: 'post'
        }, params);
    }

    /**
     * 查询模型文件
     * @param params 
     */
    public getModelFile(params: any) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/QueryProjectModelFilesPagedList",
            method: 'post'
        }, params);
    }

    /**
     * 修改模型文件
     * @param params 
     */
    public editModelFile(params: any) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/ModifyProjectModelFilesName",
            method: 'post'
        }, params);
    }

    /**
     * 删除模型文件
     * @param params 
     */
    public deleteModelFile(params: any) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/RemoveProjectModelFile",
            method: 'delete'
        }, params);
    }

    /**
     * 上传文件
     * @param params 
     */
    public upLoadFile(params: any) {
        return this.requestService.queryServer({
            url: FileHost + "/api/v1/File/file-management/model",
            method: 'post-form-data'
        }, params);
    }

    /**
     * 获取车型信息
     * @param params <any> 参数
     */
    public queryProjectById(params: any) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/QueryProjectById",
            method: 'post'
        }, params);
    }

    /**
     * 关联模型
     * @param params 
     */
    public relationModel(params: any) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/RelationModel",
            method: 'post'
        }, params);
    }

}
