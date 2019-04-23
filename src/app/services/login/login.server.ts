import { Injectable } from '@angular/core';

import { APIHost } from '../../config';
import { RequestService } from '../request.service';
import { Utils } from '../../common/helper/util-helper';

@Injectable({
    providedIn: 'root'
})
export class LoginService {
    
    constructor(
        private requestService: RequestService,
    ) {}
    
    //登录前验证身份(租户是否可用)
    public isTenantAvailable(params) {
        return this.requestService.queryServer({ 
            url: APIHost + "/api/services/app/Account/IsTenantAvailable",
            method: 'post' 
        }, params);
    }
    // 登录
    public apiLogin(params, header?) {
        return this.requestService.queryServer({ 
            url: APIHost + "/api/TokenAuth/Authenticate",
            method: 'post',
            // 是否添加Authorization
            isAuthorization: false
        }, params, header);
    }
    // 退出登录
    public logout(params) {
        return this.requestService.queryServerByDefaultHeader({ 
            url: APIHost + "/api/TokenAuth/LogOut", 
            method: 'get' 
        }, params);
    }
    /**
     * 修改密码
     * @param params 修改的参数
     * @param header 
     */
    public changePassword(params, header?) {
        return this.requestService.queryServerByDefaultHeader({ 
            url: APIHost + "/api/services/app/Profile/ChangePassword",
            method: 'post' 
        }, params, header);
    }
    /**
     * 获取当前修改信息
     * @param params 参数
     * @param header 
     */
    public getCurrentUserProfileForEdit(params, header?) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Profile/GetCurrentUserProfileForEdit",
            method: 'get'
        }, params, header);
    }
    /**
     * 修改当前用户信息
     * @param params 参数
     * @param header 
     */
    public updateCurrentUserProfile(params, header?) {
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/api/services/app/Profile/UpdateUserProfile",
            method: 'put'
        }, params, header);
    }

    public getAll(params){
        let langValue = Utils.getLocalStorage('Abp.Localization.CultureName');
        return this.requestService.queryServerByDefaultHeader({
            url: APIHost + "/AbpUserConfiguration/GetAll",
            method: 'get'
        }, params, {
            '.AspNetCore.Culture': ('c=' + langValue + '|uic=' + langValue)
        });
    }

    public getCurrentLoginInformations(params){
        return this.requestService.queryServerByDefaultHeader({ 
            url: APIHost + "/api/services/app/Session/GetCurrentLoginInformations",
            method: 'get'
        }, params, {
            "Accept": "application/json"
        });
    }

    public getExternalAuthenticationProviders(params) {
        return this.requestService.queryServerByDefaultHeader({ 
            url: APIHost + "/api/TokenAuth/GetExternalAuthenticationProviders", 
            method: 'get' 
        }, params);
    }

    public getNegotiate(params){
        return this.requestService.queryServerByDefaultHeader({ 
            url: APIHost + "/signalr-chat/negotiate", 
            method: 'post' 
        }, params);
    }
}
