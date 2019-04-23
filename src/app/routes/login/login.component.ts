import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService } from 'ng-zorro-antd';

import { APIHost } from '../../config';
import { Utils, Status } from '../../common/helper/util-helper';
import { LoginService } from '../../services/login/login.server';

declare var CryptoJS: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  @ViewChild('UserNameInput') userNameInput;
  @ViewChild('UserPwdInput') userPwdInput;
  
  constructor(
    private router: Router,
    private nzmessage: NzMessageService,
    private loginService: LoginService
  ) {}

  status = {
    loginModal: {
      // 用户名
      userName: 'admin',
      // 密码
      userPwd: '123qwe',
      // // 用户名
      // userName: null,
      // // 密码
      // userPwd: null
    },
    tenancyName: 'Default',
    // 记住
    rememberMe: false,
    // 登录状态
    loginStatus: false,
    // 获取Token
    tokenStatus: false
  };

  ngOnInit() {
    let localStorageUserName = Utils.getLocalStorage('LoginUserName');
    if(localStorageUserName){
      this.status.loginModal.userName = localStorageUserName;
    }
    this.install();
    console.log(this.status)
  }

  //初始装载
  install() {
    let tenantIdKey = Status.abpTenantId;
    let abpTenantId = Utils.getLocalStorage(tenantIdKey);
    if(!abpTenantId){
      let loading = this.nzmessage.loading('令牌自动授权中...', { nzDuration: 0 }).messageId;
      this.status.tokenStatus = true;

      this.loginService.isTenantAvailable({
        tenancyName: this.status.tenancyName
      }).then(res=>{
        this.nzmessage.remove(loading);
        this.status.tokenStatus = false;

        if(res.success){
          Utils.setLocalStorage(tenantIdKey, res.result.tenantId);
        } else {
          this.nzmessage.warning('令牌授权失败，你将不可登录');
        }
      });
    }
    // this.getAll();
    // this.getCurrentLoginInformations();
    // this.getExternalAuthenticationProviders();
  }

  getAll(callBack) {
    let params = {};
    this.loginService.getAll(params).then(res => {
      if(callBack){
        callBack(res);
      }
    });
  }

  getCurrentLoginInformations() {
    let params = {};
    this.loginService.getCurrentLoginInformations(params).then(res => {
      console.info(res);
    });
  }

  getExternalAuthenticationProviders() {
    let params = {};
    this.loginService.getExternalAuthenticationProviders(params).then(res => {
      console.info(res);
    });
  }

  ngAfterViewInit() {
    this.userNameInput.nativeElement.focus();
  }

  keyupEvent(e){
    Utils.enter(e, ()=>{
      this.doLogin();
    });
  }

  doLogin(flag?:any) {
    let status = this.status;
    if(!status.loginStatus) {
      let loginModal = status.loginModal;
      if(!loginModal.userName){
        if(!flag){
          this.nzmessage.warning('请输入用户名');
        }
        this.userNameInput.nativeElement.focus();
        return;
      }
      else if(!loginModal.userPwd){
        if (!flag) {
          this.nzmessage.warning('请输入密码');
        }
        this.userPwdInput.nativeElement.focus();
        return;
      }
      let tenantId = Utils.getLocalStorage(Status.abpTenantId);
      if (!tenantId) {
        this.nzmessage.warning('TenantId无效');
        return;
      }
      status.loginStatus = true;
      let str = CryptoJS.enc.Utf8.parse(loginModal.userPwd);
      let base64 = CryptoJS.enc.Base64.stringify(str);

      let params = {
        userNameOrEmailAddress: loginModal.userName,
        password: base64,
        singleSignIn: false,
        rememberClient: this.status.rememberMe,
        returnUrl: null, //APIHost + '/view/car-type',
        twoFactorRememberClientToken: null
      };
      let header = {
        'X-Requested-With': 'XMLHttpRequest'
      };
      header[Status.abpTenantId] = tenantId;
      this.loginService.apiLogin(params, header).then((res: any) => {
        if (res.success) {
          let result = res.result;
          // Utils.setCookie(Status.abpAuthToken, result.accessToken);
          // Utils.setCookie(Status.encAuthToken, result.encryptedAccessToken);
          // Utils.setCookie(Status.userId, result.userId);
          // console.info(result)
          Utils.setLocalStorage(Status.abpAuthToken, result.accessToken);
          Utils.setLocalStorage(Status.encAuthToken, result.encryptedAccessToken);
          Utils.setLocalStorage(Status.userId, result.userId);
          Utils.setLocalStorage(Status.roleName, result.roleName);
          Utils.setLocalStorage(Status.userName, result.userName);
          Utils.setLocalStorage(Status.roleCode, result.roleCode);
          this.getAll((res) => {
            let result = res.result;
            let auth = result.auth;
            let allPermissions = auth.allPermissions;
            let grantedPermissions = auth.grantedPermissions;
            let platform = result.localization.values.Platform;
            // 当前用户权限
            Utils.setLocalStorage(Status.grantedPermissions, JSON.stringify(grantedPermissions));
            // 所有权限
            Utils.setLocalStorage(Status.allPermissions, JSON.stringify(allPermissions));
            // 权限对应中文
            Utils.setLocalStorage(Status.platform, JSON.stringify(platform));
            // 跳转至首页
            this.router.navigate(["car-type"]);
          });
        }
        else {
          this.nzmessage.warning(res.error.message + '：' + res.error.details);
        }
        status.loginStatus = false;
      }).catch((res) => {
        this.nzmessage.warning('登录失败');
      });
    }

  }
}
