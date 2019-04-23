/**
 * 系统管理页面模板-ts
 * @author AndyPan
 * @createdate 2018年11月21日14:02:11
 */
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd, Params } from '@angular/router';
import { NzMessageService, NzModalService } from '../../../../node_modules/ng-zorro-antd';

import { Utils, Status } from '../../common/helper/util-helper';


@Component({
  selector: 'app-setting-layout',
  templateUrl: './setting-layout.component.html',
  styleUrls: ['./setting-layout.component.scss']
})
export class SettingLayoutComponent implements OnInit {
  status = {
    menus: [
      {
        text: '基本信息', isActive: true, children: [
          { text: '结构树管理', route: 'setting/tree-manage' }
        ]
      },
      {
        text: '成员管理', isActive: false, children: [
          { text: '成员列表', route: 'setting/member-manage' },
        ]
      }
    ],
    carModelId: null
  };
  constructor(
    private router: Router,
    private routeInfo: ActivatedRoute,
    private message: NzMessageService,
    private modalService: NzModalService
  ) { }

  ngOnInit() {
    console.info(this.status.carModelId)
    this.status.carModelId = this.routeInfo.snapshot.queryParams[Status.carModelId];
    Utils.resetData(this.status.menus, (item) => {
      item.children['params'] = {carModelId: this.status.carModelId};
    });
    console.info(this.status.menus)
  }

  menuRoute(menu){
    if(menu.route){
      this.router.navigate([menu.route], {
        queryParams: menu.params
      });
    }
    else{
      this.message.warning('未指定路由');
    }
  }
}
