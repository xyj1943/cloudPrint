import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NzModalService, NzMessageService,
  NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions
} from 'ng-zorro-antd';

import { Utils, Lang, Status } from '../../../common/helper/util-helper';
import { CustomFormsComponent } from '../../../components/custom-forms/custom-forms.component';
import { DepartmentManageService } from '../../../services/system/department-manage.service';

import { CustomPageOperationComponent } from '../../../components/custom-page-operation/custom-page-operation.component';

@Component({
  selector: 'app-department-manage',
  templateUrl: './department-manage.component.html',
  styleUrls: ['./department-manage.component.scss']
})

export class DepartmentManageComponent extends CustomPageOperationComponent implements OnInit {
  @ViewChild('customForms') public customForms: CustomFormsComponent;
  public status = {
    // 数据集合
    dataList: [],
    // 每页显示数
    pageSize: 10,
    // 新增、修改部门信息(将数据的key设置为提交参数字段，可直接通过this.customForms.getModelJson()获取到组装好的json数据)
    infoModel: [
      // 部门名称
      {
        value: null, text: '部门名称', key: 'displayName', require: true, maxlength: 16
      },
      // 上级部门
      {
        value: null, text: '上级部门', type: 'select', key: 'parentId',
        options: []
      },
      // 部门描述
      {
        value: null, text: '部门描述', type: 'textarea', key: 'description', rowType: 'static', maxlength: 500
      }
    ]
  };

  public constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    // 公共对象使用public，在CustomPageOperationComponent中会使用
    public message: NzMessageService,
    public mzModal: NzModalService,
    // 当前的Service 必须是public且名称为loadService，在CustomPageOperationComponent中会使用
    public loadService: DepartmentManageService
  ) { super(); }

  public ngOnInit() {
    this.install();
  }

  public ngAfterViewInit() {
  }

  // 初始装载
  private install() {
    this.loadData();
    this.getAllOrganizationUnits();
  }

  /**
   * 获取所有部门
   */
  public getAllOrganizationUnits() {
    let status = this.status;
    this.loadService.getOrganizationUnits({
      maxResultCount: 1000,
      skipCount: 0
    }).then((res: any) => {
      if (res.success) {
        let dataList = res.result.items;
        // 新增部门中选中上级部门列表对象
        status.infoModel[1].options = [];
        // 遍历出上级部门
        Utils.resetData(dataList, (dataItem) => {
          // 作为新建部门时的上级部门选项
          status.infoModel[1].options.push({value: dataItem.id, text: dataItem.displayName});
        });
      }
    });
  }

  /**
   * 加载列表数据
   */
  public loadData() {
    this.loadDatas({
      // 当前加载参数
      params: {
        maxResultCount: this.status.pageSize
      },
      // 是否是分页列表，并添加默认分页参数
      isPageList: true,
      // 当前加载数据的Service函数
      loadServiceFn: 'getOrganizationUnits'
    }).then((res: any) => {
      if (res.success) {
        let dataList = res.result.items;
        // 新增部门中选中上级部门列表对象
        // status.infoModel[1].options = [];
        // 遍历出上级部门
        let resData = Utils.resetData(dataList, (dataItem) => {
          // 作为新建部门时的上级部门选项
          // status.infoModel[1].options.push({value: dataItem.id, text: dataItem.displayName});
          Utils.resetData(dataList, (item) => {
            if (dataItem.parentId == item.id) {
              dataItem.parentName = item.displayName;
              return 'break';
            }
          });
          return dataItem;
        });
        // 当前列表集合
        this.status.dataList = resData;
      }
    });
  }

   // 每页显示条数改变事件
   public pageSizeChange(size: any) {
    this.status.pageSize = size;
    this.pageIndexChange(1);
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
   * 新建部门
   */
  public addDepartment() {
    this.getAllOrganizationUnits();
    this.operationOpenModal({
      operationModalTitle: '新建部门',
      infoModel: this.status.infoModel,
      customForms: this.customForms,
    }).submit(() => {
      this.formSubmit({
        customForms: this.customForms,
        params: this.customForms.getModelJson(),
        loadServiceFn: 'createOrganizationUnit'
      }).then(res => {
        if(res.success){
          this.message.success(Lang.createSuccess);
          // 刷新列表
          this.loadData();
        }
        else{
          this.message.error(Utils.errorMessageProcessor(res));
        }
      });
    });
  }

  /**
   * 删除部门-确认
   * @param data <any> 删除的部门数据
   */
  public deleteDepartment(data: any){
    this.deleteOperation().submit(() => {
      let params = {
        Id: data.id
      };
      this.loadService.deleteOrganizationUnit(params).then(res => {
        if(res.success){
          this.message.success(Lang.deleteSuccess);
          // 刷新列表
          this.loadData();
        }
        else{
          this.message.error(Utils.errorMessageProcessor(res));
        }
      });
    });
  }

  /**
   * 修改部门
   * @param data <any> 修改数据
   */
  public editDeparment(data: any) {
    this.operationOpenModal({
      operationModalTitle: '编辑部门',
      infoModel: this.status.infoModel,
      customForms: this.customForms,
      formData: data,
    }).submit(() => {
      let modelJson = this.customForms.getModelJson();
      this.loadService.moveOrganizationUnit({id: data.id, newParentId: modelJson['parentId']}).then(res => {
        this.formSubmit({
          customForms: this.customForms,
          params: this.customForms.merge({id: data.id}, modelJson),
          loadServiceFn: 'updateOrganizationUnit'
        }).then(res => {
          if(res.success){
            this.message.success(Lang.modifySuccess);
            // 刷新列表
            this.loadData();
          }
          else{
            this.message.error(Utils.errorMessageProcessor(res));
          }
        });
      });
    });
  }

  /**
   * 批量操作
   */
  public operateData() {
    this.deleteOperation().submit((checkedData) => {
      // console.info(checkedData);
      let params = [];
      Utils.resetData(checkedData, (item) => {
        params.push(item.id);
      });
      this.loadService.batchDeleteOrganizationUnit(params).then((res: any) => {
        if (res.success) {
          this.message.success(Lang.deleteSuccess);
          // 回到第1页
          this.pageIndexChange(1);
        }
        else {
          this.message.error(Utils.errorMessageProcessor(res));
        }
      });
    });
  }
}
