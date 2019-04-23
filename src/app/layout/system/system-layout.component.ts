/**
 * 系统管理页面模板-ts
 * @author AndyPan
 * @createdate 2018年11月21日14:02:11
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, Params } from '@angular/router';
import { NzMessageService, NzModalService } from '../../../../node_modules/ng-zorro-antd';

import { Utils, Status } from '../../common/helper/util-helper';
import { CustomPageOperationComponent } from '../../components/custom-page-operation/custom-page-operation.component';

@Component({
  selector: 'app-system-layout',
  templateUrl: './system-layout.component.html',
  styleUrls: ['./system-layout.component.scss']
})
export class SystemLayoutComponent extends CustomPageOperationComponent implements OnInit {
  public status = {
    menus: [],
    // 当前页面所需要的权限
    pagePermissions: [
      'Pages.Administration.OrganizationUnits.ManageMembers',
      'Ele.Logs.System'
    ],
    // 当前页面权限
    pageAuthorty: {},
    carModelId: null
  };
  public constructor(
    private router: Router,
    private routeInfo: ActivatedRoute,
    private message: NzMessageService,
    private modalService: NzModalService
  ) {
    super();
  }

  public ngOnInit() {
    this.status.carModelId = this.routeInfo.snapshot.queryParams[Status.carModelId];
    this.install();
  }

  private install() {
    // 初始化权限匹配
    this.status.pageAuthorty = this.grantedPermissions(this.status.pagePermissions);
    console.info(this.status.pageAuthorty)
    let routeKey = this.router.url;
    if (routeKey.indexOf('/system') > -1) {
      // 系统管理菜单
      this.status.menus = [
        // {
        //   text: '人员管理', isActive: true, children: [
        //     { text: '人员列表', route: 'system/personnel-manage' },
        //     { text: '角色管理', route: 'system/role-manage' }
        //   ]
        // },
        // {
        //   text: '部门管理', isActive: false, children: [
        //     { text: '部门设置', route: 'system/department-manage' }
        //   ]
        // },
        // {
        //   text: '车型管理', isActive: false, children: [
        //     { text: '车型列表', route: 'system/cartype-list' }
        //   ]
        // },
      ];
      this.status.menus.push({
        text: '人员管理', isActive: true, children: [
          { text: '人员列表', route: 'system/personnel-manage' },
          { text: '角色管理', route: 'system/role-manage' }
        ]
      });
      // 部门设置权限
      if (this.status.pageAuthorty['ManageMembers']) {
        this.status.menus.push({
          text: '部门管理', isActive: true, children: [
            { text: '部门设置', route: 'system/department-manage' }
          ]
        });
      }
      this.status.menus.push({
        text: '车型管理', isActive: true, children: [
          { text: '车型列表', route: 'system/cartype-list' }
        ]
      });
      // 系统日志权限
      if (this.status.pageAuthorty['System']){
        this.status.menus.push({
          text: '日志管理', isActive: true, children: [
            // { text: '项目日志', route: 'system/project-logs' },
            { text: '系统日志', route: 'system/system-logs' }
          ]
        });
      }
    }
    else if (routeKey.indexOf('/setting') > -1) {
      // 设置管理菜单
      this.status.menus = [
        {
          text: '基本信息', isActive: true, children: [
            { text: '结构树管理', route: 'setting/tree-manage', params: {carModelId: this.status.carModelId} },
            { text: '模型管理', route: 'setting/model-manage', params: {carModelId: this.status.carModelId} }
          ]
        },
        {
          text: '成员管理', isActive: true, children: [
            { text: '成员列表', route: 'setting/member-manage', params: {carModelId: this.status.carModelId} }
          ]
        },
        {
          text: '日志管理', isActive: true, children: [
            { text: '项目日志', route: 'setting/project-logs', params: {carModelId: this.status.carModelId} }
          ]
        }
      ];
    }
  }

  private menuRoute(menu) {
    if (menu.route) {
      this.router.navigate([menu.route], {
        queryParams: menu.params
      });
    }
    else {
      this.message.warning('未指定路由');
    }
  }
}
