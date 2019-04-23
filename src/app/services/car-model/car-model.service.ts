import { Injectable } from '@angular/core';
import { APIHost } from '../../config';
import { RequestService } from '../request.service';
import { Subject, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CarModelService {

    private subject = new Subject<any>();

    send(message: any) {
        this.subject.next(message);
    }

    get(): Observable<any> {
        return this.subject.asObservable();
    }

    public constructor(private requestService: RequestService) { }

    // 获取模型
    public getCarModel(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/CarModels/Get",
            method: 'get'
        }, params);
    }
    // 获取模型结构-分页数据集合
    public queryModelDirectorysPagedList(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/BodyPropertys/QueryModelDirectorysPagedList",
            method: 'post'
        }, params);
    }

    // 获取属性结构-分页数据集合
    public queryModelPropertysPagedList(params, type?) {
        let urlByType = {
            // 整车
            '-1': '/api/services/app/ProjectOveralls/QueryPagedList',
            // 车身
            0: '/api/services/app/CarBodys/QueryListById',
            // 总成
            1: '/api/services/app/BodyPropertys/QueryModelAssemblysPagedList',
            // 零件
            2: '/api/services/app/BodyPropertys/QueryModelPropertysPagedList'
        };
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + urlByType[type],
            method: 'post'
        }, params);
    }
    // 绑定模型
    public bindComponent(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/BodyPropertys/BindComponent",
            method: 'post'
        }, params);
    }
    // 解绑模型
    public unBindComponent(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/BodyPropertys/UnbindComponent",
            method: 'post'
        }, params);
    }
    /**
     * 创建零件属性
     * @param params <any> 创建参数(params.type 类型：0.车身 1.总成 2.零件)
     */
    public createModelProperty(params: any) {
        let urlByType = {
            // 整车
            '-1': '/api/services/app/ProjectOveralls/Create',
            // 车身
            0: '/api/services/app/CarBodys/Create',
            // 总成
            1: '/api/services/app/BodyPropertys/CreateModelAssembly',
            // 零件
            2: '/api/services/app/BodyPropertys/CreateModelProperty'
        };
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + urlByType[params.modelType],
            method: 'post'
        }, params);
    }

    /**
     * 修改零件属性
     * @param params <any> 修改参数(params.type 类型：0.车身 1.总成 2.零件)
     */
    public modifyModelProperty(params: any) {
        let urlByType = {
            // 整车
            '-1': '/api/services/app/ProjectOveralls/Modify',
            // 车身
            0: '/api/services/app/CarBodys/Modify',
            // 总成
            1: '/api/services/app/BodyPropertys/ModifyModelAssembly',
            // 零件
            2: '/api/services/app/BodyPropertys/ModifyModelProperty'
        };
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + urlByType[params.modelType],
            method: 'post'
        }, params);
    }


    /**
     * 删除零件属性
     * @param params <any> 删除参数
     * @param type <any> 类型：0.车身 1.总成 2.零件
     */
    public removeModelProperty(params: any, type?: any) {
        let urlByType = {
            // 整车
            '-1': '/api/services/app/ProjectOveralls/Remove',
            // 车身
            0: '/api/services/app/CarBodys/Remove',
            // 总成
            1: '/api/services/app/BodyPropertys/RemoveModelAssembly',
            // 零件
            2: '/api/services/app/BodyPropertys/RemoveModelProperty'
        };
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + urlByType[type],
            method: 'delete'
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
     * 编辑车身属性排序位置
     * @param params <any> 修改参数
     */
    public modifySort(params: any, type?: any) {
        let urlByType = {
            // 整车
            '-1': '/api/services/app/ProjectOveralls/ModifySort',
            // 车身
            0: '/api/services/app/CarBodys/ModifySort',
            // 总成
            1: '/api/services/app/BodyPropertys/ModifyModelAssemblySort',
            // 零件
            2: '/api/services/app/BodyPropertys/ModifyModelPropertySort'
        };
        // let thisMethodName = methodName || 'CarBodys/ModifySort';
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + urlByType[type],
            method: 'post'
        }, params);
    }

    /**
     * 获取模型列表
     * @param params 
     */
    public getModelList(params: any) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Projects/QueryProjectModelFilesPagedList",
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
