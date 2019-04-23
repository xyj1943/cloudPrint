import { Injectable } from '@angular/core';
import { APIHost } from '../../config';
import { RequestService } from '../request.service';


@Injectable({
    providedIn: 'root'
})
export class FileLibService {

    constructor(private requestService: RequestService) { }
    
    /**
     * 获取文件目录-分页数据集合
     * @param params 获取参数
     * @returns Promise对象
     */
    public queryFileDirectorysPagedList(params) {
        return this.requestService.queryServerByDefaultHeader({ 
            url: APIHost + "/api/services/app/Files/QueryFileDirectorysPagedList", 
            method: 'post'
        }, params);
    }

    /**
     * 创建目录
     * @param params 创建参数
     * @returns Promise对象
     */
    public createFileDirectorys(params) {
        return this.requestService.queryServerByDefaultHeader({ 
            url: APIHost + "/api/services/app/Files/CreateFileDirectorys", 
            method: 'post'
        }, params);
    }

    /**
     * 修改目录
     * @param params 修改参数
     * @returns Promise对象
     */
    public modifyFileDirectorys(params) {
        return this.requestService.queryServerByDefaultHeader({ 
            url: APIHost + "/api/services/app/Files/ModifyFileDirectorys", 
            method: 'post'
        }, params);
    }

    /**
     * 删除目录
     * @param params 删除参数
     * @returns Promise对象
     */
    public removeFileDirectorys(params) {
        return this.requestService.queryServerByDefaultHeader({ 
            url: APIHost + "/api/services/app/Files/RemoveFileDirectorys", 
            method: 'delete'
        }, params);
    }

    /**
     * 获取文件-分页数据集合
     * @param params 获取参数
     * @returns Promise对象
     */
    public queryFilesPagedList(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Files/QueryFilesPagedList",
            method: 'post'
        }, params);
    }

    /**
     * 删除文件
     * @param params 删除参数
     * @returns Promise对象
     */
    public removeFiles(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Files/BatchRemoveFiles",
            method: 'post'
        }, params);
    }

    /**
     * 修改文件
     * @param params 修改参数
     * @returns Promise对象
     */
    public modifyFiles(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Files/ModifyFiles",
            method: 'post'
        }, params);
    }

    /**
     * 创建文件
     * @param params 参数
     * @returns Promise对象
     */
    public createFiles(params) {
        return this.requestService.queryServerByDefaultHeader({ 
            url: APIHost + "/api/services/app/Files/CreateFiles", 
            method: 'post'
        }, params);
    }
}
