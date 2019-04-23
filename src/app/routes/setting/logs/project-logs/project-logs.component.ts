import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzModalService, NzMessageService,
  NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions
} from 'ng-zorro-antd';

import { Utils, Lang, Status } from '../../../../common/helper/util-helper';
import { CustomFormsComponent } from '../../../../components/custom-forms/custom-forms.component';

import { CustomPageOperationComponent } from '../../../../components/custom-page-operation/custom-page-operation.component';
import { ProjectLogsService } from '@app/services/logs/project-logs.service';

@Component({
  selector: 'app-project-logs',
  templateUrl: './project-logs.component.html',
  styleUrls: ['./project-logs.component.scss']
})
export class ProjectLogsComponent extends CustomPageOperationComponent implements OnInit {
  @ViewChild('customForms') public customForms: CustomFormsComponent;
  status = {
    // 数据集合
    dataList: [],
    // 分页初始化
    pageSize: 10,
    // 关键字
    // keywords: '',
    filter: '',
    // 当前页面所需要的权限
    pagePermissions: [
      'Pages.Administration.Users.ChangePermissions',
      'Pages.Administration.Users.Create',
      'Pages.Administration.Users.Delete',
      'Pages.Administration.Users.Edit'
    ],
    // projectId
    carModelId: null,

    // 当前页面权限
    pageAuthorty: {ChangePermissions: null, Create: null, Delete: null, Edit: null}
  };

  public constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    // 公共对象使用public，在CustomPageOperationComponent中会使用
    public message: NzMessageService,
    public mzModal: NzModalService,
    // 当前的Service 必须是public且名称为loadService，在CustomPageOperationComponent中会使用
    public loadService: ProjectLogsService
  ) {
    super();
  }

  public ngOnInit() {
    this.install();
  }

  /**
   * 初始装载
   */
  private install() {
    this.status.carModelId = this.routeInfo.snapshot.queryParams[Status.carModelId];
    // 初始化权限匹配
    this.status.pageAuthorty = this.grantedPermissions(this.status.pagePermissions, this.status.pageAuthorty);
    this.loadData();
  }

  /**
   * 加载列表数据
   */
  public loadData() {
    this.loadDatas({
      // 当前加载参数
      params: {
        filter: this.status.filter,
        maxResultCount: this.status.pageSize,
        // "keywords": this.status.keywords
        ProjectId: this.status.carModelId
      },
      // 是否是分页列表，并添加默认分页参数
      isPageList: true,
      // 当前加载数据的Service函数
      loadServiceFn: 'queryRecentUserLoginAttemptsPagedList'
    }).then((res: any) => {
      if (res.success) {
        // 当前列表集合
        this.status.dataList = res.result.items || [];
      }
      console.info(res.result.items);
    });
  }

   /**
   * 关键字搜索
   */
  public searchEvent() {
    // 搜索时重置分页
    this.operationStatus.pager.pageIndex = 1;
    this.loadData();
  }

  /**
   * 搜索框回车事件
   * @param e <Event>
   */
  public keyupEvent(e: Event) {
    Utils.enter(e, this.searchEvent.bind(this));
  }

 // 每页显示最大数改变事件
  public pageSizeChange(size: any) {
    this.status.pageSize = size;
    this.pageIndexChange(1);
  }
}

