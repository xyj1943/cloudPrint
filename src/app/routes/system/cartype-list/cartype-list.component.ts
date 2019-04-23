import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NzModalService, NzMessageService
} from 'ng-zorro-antd';

import { Utils, Lang, Status } from '../../../common/helper/util-helper';
import { CustomFormsComponent } from '../../../components/custom-forms/custom-forms.component';
import { CarTypeManageService } from '../../../services/system/cartype-manage.service';
import { CarTypeService } from '../../../services/car-type/car-type.service';
import { CustomPageOperationComponent } from '../../../components/custom-page-operation/custom-page-operation.component';


@Component({
  selector: 'app-cartype-list',
  templateUrl: './cartype-list.component.html',
  styleUrls: ['./cartype-list.component.scss', './../../../components/custom-forms/custom-forms.component.scss']
})

export class CarTypeListComponent extends CustomPageOperationComponent implements OnInit {
  @ViewChild('customForms') public customForms: CustomFormsComponent;

  public status = {
    // 数据集合
    dataList: []
  };

  public constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    // 公共对象使用public，在CustomPageOperationComponent中会使用
    public message: NzMessageService,
    public mzModal: NzModalService,
    // 当前的Service 必须是public且名称为loadService，在CustomPageOperationComponent中会使用
    public loadService: CarTypeService
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
    this.loadData();
  }

  /**
   * 加载列表数据
   */
  public loadData() {
    this.loadDatas({
      // 当前加载参数
      params: {},
      // 是否是分页列表，并添加默认分页参数
      isPageList: true,
      // 当前加载数据的Service函数
      loadServiceFn: 'queryProjectPagedList'
    }).then((res: any) => {
      // this.status.dataList = [{},{}];
      // this.operationStatus.dataList = this.status.dataList;

      if (res.success) {
        // 当前列表集合
        this.status.dataList = res.result.items || [];
      }
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

  /**
   * 批量操作
   */
  public operateData() {
    this.deleteOperation().submit((checkedData) => {
      console.info(checkedData);
      // let params = {};
      // this.loadService.deleteOrganizationUnit(params).then(res => {
      //   if(res.success){
      //     this.message.success(Lang.deleteSuccess);
      //     // 回到第1页
      //     this.pageIndexChange(1);
      //   }
      //   else{
      //     this.message.error(Lang.deleteFail);
      //   }
      // });
    });
  }

  /**
   * 去设置页
   * @param data
   */
  public goToSet(data: any) {
    Utils.setLocalStorage(Status.carModelName, data.name);
    Utils.openPath('/setting/tree-manage?' + Status.carModelId + '=' + data.id);
  }

}
