/**
 * 公共页面模板-ts
 * @author AndyPan
 * @createdate 2018年11月21日14:08:52
 */
import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, Params } from '@angular/router';
import { NzMessageService, NzModalService } from '../../../../node_modules/ng-zorro-antd';

import { Utils, Status, Lang } from '../../common/helper/util-helper';
import { CustomFormsComponent } from '../../components/custom-forms/custom-forms.component';
import { LoginService } from '../../services/login/login.server';
import { CarModelService } from '@app/services/car-model/car-model.service';

@Component({
  selector: 'app-common-layout',
  templateUrl: './common-layout.component.html',
  styleUrls: ['./common-layout.component.scss']
})
export class CommonLayoutComponent implements OnInit {
  @ViewChild('customForms') public customForms: CustomFormsComponent;

  public status = {
    // 弹出框状态
    updateModalStatus: false,
    // 需要改变页面样式的路由配置
    changeRoute: {
      // 车型列表
      '/car-type': { className: 'default-wrap' },
      // 用户信息
      '/user-info': { className: 'default-wrap' },
      '/update-pwd': { className: 'default-wrap' }
    },
    quickNavs: [
      { text: '首页', route: 'car-type' },
      // {text: '模型', route: 'car-model'},
      { text: '文件库', route: 'file-lib', isShow: false },
      { text: '设置', route: 'setting/tree-manage', isShow: false },
      { text: '系统管理', route: 'system/personnel-manage' }
    ],
    currentNav: null,
    // 修改密码
    updatePwdModel: [
      { value: null, text: '新密码', type: 'password', require: true, newPwd: true },
      { value: null, text: '确认密码', type: 'password', require: true, relation: 'newPwd', relationErrorMsg: '两次输入密码不一致' }
    ],
    // 当前对象
    currentObjs: null,
    carModelId: null,
    // 当前角色名称
    roleName: Utils.getLocalStorage(Status.roleName),
    userName: Utils.getLocalStorage(Status.userName),
    carModelName: Utils.getLocalStorage(Status.carModelName)
  };
  public appShow: boolean = true;
  public modelStyle: any = {};

  public constructor(
    private router: Router,
    private routeInfo: ActivatedRoute,
    private message: NzMessageService,
    private modalService: NzModalService,
    private actRoute: ActivatedRoute,
    private loginService: LoginService,
    private carModelService: CarModelService
  ) { }

  public ngOnInit() {
    this.install();
    this.observable();
  }

  public observable() {
    this.carModelService.get().subscribe((result) => {
      this.appShow = result;
      this.modelStyle = {
        'top': '-10px'
      };
    });
  }

  // 初始装载
  private install(routeStr?) {
    let routeKey = routeStr || this.router.url.split('?')[0];
    this.status.currentObjs = this.status.changeRoute[routeKey];

    this.status.quickNavs.forEach((nav: any) => {
      nav['active'] = undefined;
      if (routeKey.indexOf(nav.route) > -1) {
        nav['active'] = 'active';
        this.status.currentNav = nav;
      }
      if (nav.text == '设置') {
        if (routeKey.indexOf('/setting') > -1) {
          nav['active'] = 'active';
          this.status.currentNav = nav;
        }
      }
      else if (nav.text == '系统管理') {
        if (routeKey.indexOf('/system') > -1) {
          nav['active'] = 'active';
          this.status.currentNav = nav;
        }
      }
    });
    let timer = 200;
    setTimeout(() => {
      this.status.carModelId = this.routeInfo.snapshot.queryParams[Status.carModelId];
      this.status.quickNavs.forEach((nav: any) => {
        if (this.status.carModelId) {
          if (nav.isShow == false) {
            nav.isShow = true;
            nav['params'] = { carModelId: this.status.carModelId };
          }
        }
        else {
          if (nav.isShow) {
            nav.isShow = false;
          }
        }
      });
      // if (this.status.carModelId) {
      //   this.status.quickNavs.forEach((nav: any) => {
      //     if (nav.isShow == false) {
      //       nav.isShow = true;
      //       nav['params'] = {carModelId: this.status.carModelId};
      //     }
      //   });
      // }
      // else {
      //   // this.status.quickNavs[2].isShow = false;
      //   this.status.quickNavs.forEach((nav: any) => {
      //     if (nav.isShow) {
      //       nav.isShow = false;
      //     }
      //   });
      // }
    }, timer);
  }

  public goToModel() {
    let carModelName = Utils.getLocalStorage(Status.carModelName);
    if (carModelName) {
      Utils.openPath('/car-model?' + Status.carModelId + '=' + this.status.carModelId);
    }
  }

  // 导航跳转
  private routeTo(navItem) {
    if (this.status.currentNav) {
      this.status.currentNav.active = undefined;
    }
    if (navItem.route == 'car-type' || navItem.route == 'system/personnel-manage') {
      Utils.setLocalStorage(Status.carModelName, '');
      this.status.carModelName = '';
    }
    this.status.currentNav = navItem;
    navItem.active = 'active';
    this.install('/' + navItem.route);
    this.router.navigate([navItem.route], {
      queryParams: navItem.params
    });
  }

  /**
   * 返回首页
   */
  public goToHome() {
    this.routeTo(this.status.quickNavs[0]);
  }

  // 关闭弹出框
  public closeModal(type) {
    this.status[type] = false;
  }

  // 个人信息
  public personalInformation(route, type?: any) {
    this.install('/' + route);
    Utils.setLocalStorage(Status.carModelName, '');
    this.status.carModelName = '';
    // this.message.warning('个人信息');
    this.router.navigate([route], {
      queryParams: { type }
    });
  }

  // 修改密码
  public updatePwd() {
    this.status.updateModalStatus = true;
    this.customForms.setFirstFocus();
  }

  // 修改密码确定
  public updateSure() {
    let res = this.customForms.verify();
    if (res.status) {
      console.info(this.status.updatePwdModel);
    }
  }

  // 注销
  public logout() {
    // 直接退出，避免报错无反应
    this.router.navigate(['login']);
    this.loginService.logout({}).then((res: any) => {
      if (res.success) {
        Utils.delCookie(Status.abpAuthToken);
        Utils.delCookie(Status.encAuthToken);
        // this.router.navigate(['login']);
      }
      else {
        // this.message.warning('操作失败');
      }
    });
  }
}
