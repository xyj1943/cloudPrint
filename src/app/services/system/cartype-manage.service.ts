import { Injectable } from '@angular/core';
import { APIHost } from '../../config';
import { RequestService } from '../request.service';


@Injectable({
    providedIn: 'root'
})
export class CarTypeManageService {

    public constructor(private requestService: RequestService) { }

    /**
     * 获取-分页数据集合
     * @param params 获取参数
     * @returns Promise对象
     */
    public getCarType(params) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/CarModels/Get",
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
            url: APIHost + "/api/services/app/CarModels/Delete",
            method: 'delete'
        }, params);
    }

}
