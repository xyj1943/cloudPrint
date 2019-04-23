import { Injectable } from '@angular/core';
import { APIHost } from '../../config';
import { RequestService } from '../request.service';


@Injectable({
    providedIn: 'root'
})
export class CarTypeService {

    public constructor(private requestService: RequestService) { }

    /**
     * 获取-分页数据集合
     * @param params 获取参数
     * @returns Promise对象
     */
    public queryProjectPagedList(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/QueryProjectPagedList",
            method: 'post'
        }, params);
    }

    /**
     * 创建车型
     * @param params 参数
     * @returns Promise对象
     */
    public createFileDirectorys(params) {
        return this.requestService.queryServerByDefaultHeader({
            // url: APIHost + "/api/services/app/CarModels/CreateFileDirectorys",
            url: APIHost + "/api/services/app/Projects/CreateOrModifyProject",
            method: 'post'
        }, params);
    }

    /**
     * 修改车型
     * @param params 参数
     * @returns Promise对象
     */
    public modifyFileDirectorys(params) {
        return this.requestService.queryServerByDefaultHeader({
            // url: APIHost + "/api/services/app/CarModels/ModifyFileDirectorys",
            url: APIHost + "/api/services/app/Projects/CreateOrModifyProject",
            method: 'post'
        }, params);
    }

    /**
     * 删除车型(项目)
     * @param params 参数
     * @returns Promise对象
     */
    public removeProject(params) {
        return this.requestService.queryServerByDefaultHeader({
            // url: APIHost + "/api/services/app/CarModels/CreateFileDirectorys",
            url: APIHost + "/api/services/app/Projects/RemoveProject",
            method: 'delete'
        }, params);
    }

    /**
     * 标记为模板
     * @param params 参数
     * @returns Promise对象
     */
    public markAsTemplate(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/MarkAsTemplate",
            method: 'post'
        }, params);
    }

}
