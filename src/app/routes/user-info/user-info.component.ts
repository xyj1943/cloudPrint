import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzModalService, NzMessageService, } from 'ng-zorro-antd';

import { Utils, Lang, Status } from '../../common/helper/util-helper';
import { CustomFormsComponent } from '../../components/custom-forms/custom-forms.component';

import { UserInfoService } from '../../services/user-info/user-info.service';
import { LoginService } from '../../services/login/login.server'

declare var CryptoJS: any;
@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss']
})

export class UserInfoComponent implements OnInit {
  @ViewChild('customForms') customForms: CustomFormsComponent;

  status = {
    // 数据模型
    infoModel: {
      // 用户信息模型
      'user-info': [
        {value: 'My UserName', text: '用户名', key: 'userName', type: 'text'},
        {value: null, text: '姓名', key: 'name', require: true, maxWidth: true, requireIconType: 'static', maxlength: 8},
        {value: null, text: '联系方式', key: 'phoneNumber', require: true, verifyType: 'phone', maxWidth: true, requireIconType: 'static'},
      ],
      // 修改密码模型
      'update-pwd': [
        {value: null, text: '原密码', type: 'password', key: 'currentPassword', require: true, maxWidth: true, requireIconType: 'static'},
        {
          value: null, text: '新密码', type: 'password', key: 'newPassword', require: true, maxWidth: true, requireIconType: 'static',
          relations: true, minlength: 6 , maxlength: 32
        },
        {
          value: null, text: '确认密码', type: 'password', key: 'newPasswordConfirm', require: true, maxWidth: true, requireIconType: 'static',
          relation: 'relations', relationErrorMsg: '两次输入密码不一致'
        }
      ]
    },
    currentUserInfo: null,
    customInfoModel: null, modelDisabled: false, customFormStatus: false,
    // 菜单集合
    menus: [
      // type:与上面infoModel的key对应
      {text: '个人信息编辑', type: 'user-info', active: false},
      {text: '修改密码', type: 'update-pwd', active: false}
    ],
    // 当前选中菜单项
    activeMenu: null
  };

  constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    public message: NzMessageService,
    public mzModal: NzModalService,
    public loadService: UserInfoService,
    private loginService: LoginService
  ) { }

  ngOnInit() {
    this.install();
  }

  /**
   * 初始装载
   */
  private install() {
    let type = this.routeInfo.snapshot.queryParams['type'] || 0;
    this.getCurrentUserProfileForEdit();
    this.renderType(type);
  }

  /**
   * 获取当前修改信息
   */
  private getCurrentUserProfileForEdit() {
    this.loginService.getCurrentUserProfileForEdit({}).then(res => {
      if(res.success){
        let result = res.result;
        this.status.currentUserInfo = result;
        let userInfo = this.status.infoModel['user-info'];
        Utils.resetData(userInfo, (item) => {
          let value = result[item.key];
          if(value){
            item.value = value;
          }
        });
      }
    });
  }

  /**
   * 渲染当前选中项
   * @param type 菜单索引
   */
  private renderType(type: any){
    let menus = this.status.menus;
    Utils.resetData(menus, (item, idx) => {
      if(idx == type){
        item.active = true;
        this.status.activeMenu = item;
      }
      else{
        item.active = false;
      }
    });
    let currentMenuType = this.status.activeMenu.type;
    this.status.customInfoModel = this.status.infoModel[currentMenuType];
    this.resetModel();
  }

  /**
   * 重置数据
   */
  private resetModel() {
    let currentMenuType = this.status.activeMenu.type;
    setTimeout(() => {
      // 重置数据
      if(currentMenuType == 'user-info'){
        // 填充当前用户信息
      }
      else if(currentMenuType == 'update-pwd'){
        // 清空前面数据
        this.customForms.clear();
      }
    }, 0);
  }

  /**
   * 保存
   */
  public operationSave() {
    let result = this.customForms.verify();
    if(result.status){
      let status = this.status;
      // 提交前禁用表单，防止多次点击
      status.modelDisabled = true;
      // 当前提交参数
      let params = this.customForms.getModelJson();
      let currentMenuType = this.status.activeMenu.type;
      if(currentMenuType == 'user-info'){
        // 修改用户信息
        this.changeUserInfo(params);
      }
      else if(currentMenuType == 'update-pwd'){
        // 修改密码
        this.changePassword(params)
      }
    }
  }

  /**
   * 修改密码
   * @param params 
   */
  private changePassword(params) {
    let status = this.status;
    this.loginService.changePassword(params).then(res => {
      if(res.success){
        this.message.success(Lang.modifySuccess);
        // 清空数据
        this.customForms.clear();
        // 退出重新登录
        this.mzModal.info({
          nzTitle: '提示',
          nzContent: '你的密码已修改，点击确定退出重新登录',
          nzOnOk: this.logout.bind(this)
        });
      }
      else{
        this.message.error(Utils.errorMessageProcessor(res));
      }
      // 不管数据提交成功或失败，还原禁用状态
      status.modelDisabled = false;
    });
  }

  private changeUserInfo(params){
    let status = this.status;
    let userInfo = status.infoModel['user-info'];
    let currentUserInfo = status.currentUserInfo;
    let thisParams = {
      name: userInfo[1].value,
      surname: currentUserInfo.surname,
      userName: currentUserInfo.userName,
      emailAddress: currentUserInfo.emailAddress,
      phoneNumber: userInfo[2].value,
      isPhoneNumberConfirmed: currentUserInfo.isPhoneNumberConfirmed,
      timezone: currentUserInfo.timezone,
      qrCodeSetupImageUrl: currentUserInfo.qrCodeSetupImageUrl,
      isGoogleAuthenticatorEnabled: currentUserInfo.isGoogleAuthenticatorEnabled
    };
    this.loginService.updateCurrentUserProfile(thisParams).then(res => {
      if(res.success){
        this.message.success(Lang.modifySuccess);
      }
      else{
        this.message.error(Utils.errorMessageProcessor(res));
      }
      // 不管数据提交成功或失败，还原禁用状态
      status.modelDisabled = false;
    });
  }

  private logout() {
    this.loginService.logout({}).then(res => {
      if(res.success){
        Utils.delCookie(Status.abpAuthToken);
        Utils.delCookie(Status.encAuthToken);
        this.router.navigate(['login']);
      }
      else{
        this.message.warning((res.error? res.error.message : null) || Lang.operateFail);
      }
    });
  }

}
