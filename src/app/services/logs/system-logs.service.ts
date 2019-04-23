import { Injectable } from '@angular/core';
import { APIHost } from '../../config';
import { RequestService } from '../request.service';


@Injectable({
    providedIn: 'root'
})
export class SystemLogsService {

    constructor(private requestService: RequestService) { }
    
    /**
     * 获取文件目录-分页数据集合
     * @param params 获取参数
     * @returns Promise对象
     */
    public queryRecentUserLoginAttemptsPagedList(params) {
        return this.requestService.queryServerByDefaultHeader({ 
            url: APIHost + "/api/services/app/UserLogin/QueryRecentUserLoginAttemptsPagedList", 
            method: 'post'
        }, params);
    }

}
