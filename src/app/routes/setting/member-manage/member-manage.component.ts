import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NzModalService, NzMessageService
} from 'ng-zorro-antd';

import { Utils, Lang, Status } from '../../../common/helper/util-helper';
import { CustomFormsComponent } from '../../../components/custom-forms/custom-forms.component';
import { MemberManageService } from '../../../services/setting/member-manage.service';
import { DepartmentManageService } from '../../../services/system/department-manage.service';
import { PersonnelManageService } from '../../../services/system/personnel-manage.service';

import { CustomPageOperationComponent } from '../../../components/custom-page-operation/custom-page-operation.component';

@Component({
  selector: 'app-member-manage',
  templateUrl: './member-manage.component.html',
  styleUrls: ['./member-manage.component.scss']
})
export class MemberManageComponent extends CustomPageOperationComponent implements OnInit {
  @ViewChild('customForms') public customForms: CustomFormsComponent;

  public status = {
    // 数据集合
    dataList: [],
    // 分页初始化
    pageSize: 10,
    // 人员信息
    infoModel: [
      // 部门
      // {
      //   value: null, type: 'select', text: '部门', key: 'organizationId', require: true,
      //   options: []
      // },
      // 人员类型(项目成员可用类型)
      {
        value: null, type: 'select', text: '人员类型', key: 'type', require: true,
        options: []
      },
      // 人员
      {
        value: null, type: 'select', text: '人员', key: 'userId', require: true,
        options: []
      }
    ],
    // 当前人员对象
    userModel: null,
    carModelId: null,
    // 当前页面所需要的权限
    pagePermissions: [
      // 'Pages.Administration.OrganizationUnits.ManageOrganizationTree',
      'Ele.Project.Ele_Project_AddUser'
    ],
    // 当前页面权限
    pageAuthorty: {Ele_Project_AddUser: null }
  };

  public constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    // 公共对象使用public，在CustomPageOperationComponent中会使用
    public message: NzMessageService,
    public mzModal: NzModalService,
    // 当前的Service 必须是public且名称为loadService，在CustomPageOperationComponent中会使用
    public loadService: MemberManageService,
    public departmentLoadService: DepartmentManageService,
    public personnelManageService: PersonnelManageService
  ) {
    super();
  }

  public ngOnInit() {
    this.install();
  }

  /**
   * 初始装载
   */
  public install() {
    this.status.carModelId = this.routeInfo.snapshot.queryParams[Status.carModelId];
    // 初始化权限匹配
    this.status.pageAuthorty = this.grantedPermissions(this.status.pagePermissions);
    // this.loadDepartment(() => {});
    this.memberType(() => {
      this.loadUser(() => {
        this.loadData();
      });
    });
  }

  /**
   * 加载列表数据
   */
  public loadData() {
    this.loadDatas({
      // 当前加载参数
      params: {
        // 每页记录数
        maxResultCount: this.status.pageSize,
        ProjectId: this.status.carModelId
      },
      // 是否是分页列表，并添加默认分页参数
      isPageList: true,
      // 当前加载数据的Service函数
      loadServiceFn: 'queryProjectUsersPagedList'
    }).then((res: any) => {
      if (res.success) {
        // 当前列表集合
        this.status.dataList = res.result.items || [];
      }
    });
  }
  // 每页显示最大数改变事件
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
   * 加载部门数据
   */
  public loadDepartment(callBack?: Function) {
    let status = this.status;
    this.loadDatas({
      // 当前加载参数
      params: {
        // 每页记录数
        maxResultCount: 1000
      },
      // 是否渲染数据列表
      isRenderDataList: false,
      // 服务
      loadService: 'departmentLoadService',
      // 当前加载数据的Service函数
      loadServiceFn: 'getOrganizationUnits'
    }).then((res: any) => {
      if (res.success) {
        let dataList = res.result.items;
        // 新增部门中选中上级部门列表对象
        status.infoModel[0].options = [];
        // 遍历出上级部门
        Utils.resetData(dataList, (dataItem) => {
          // 作为新建部门时的上级部门选项
          status.infoModel[0].options.push({value: dataItem.id, text: dataItem.displayName});
        });
      }
      if (callBack) {
        callBack();
      }
    });
  }

  /**
   * 获取添加项目成员可用类型（项目管理员、查阅人员）
   * @param callBack
   */
  public memberType(callBack?: Function) {
    // this.loadService.queryRolesByIdList([2, 4]).then((res: any) => {
    this.loadService.queryRolesByCodeList(['Technology', 'View']).then((res: any) => {
      if (res.success) {
        let result = res.result;
        let options = [];
        Utils.forEach(result, (item) => {
          options.push({value: item.id, text: item.displayName});
        });
        this.status.infoModel[0].options = options;
      }
      if (callBack) {
        callBack();
      }
    });
  }

  public selectChangeEvent(res) {
    let status = this.status;
    let data = res.data;
    if (data.key == "organizationId") {
      this.loadService.getOrganizationUnitUsers({Id: data.value}).then((res: any) => {
        if (res.success) {
          let dataList = res.result.items;
          // 人员
          status.infoModel[1].options = [];
          Utils.resetData(dataList, (dataItem) => {
            // status.infoModel[1]['department'] = dataItem.department;
            status.infoModel[1].options.push({value: dataItem.id, text: dataItem.userName});
          });
        }
      });
    }
    else if (data.key == 'type') {
      status.infoModel[1].value = null;
      // status.userModel = null;
      this.loadUser();
    }
    // else if (data.key == 'userId') {
    //   status.userModel = data;
    //   console.info(status.userModel);
    // }
  }

  /**
   * 加载人员
   */
  public loadUser(callBack?: Function) {
    let status = this.status;
    let params = {
      // 每页记录数
      maxResultCount: 1000
    };
    if (status.infoModel[0].value) {
      params['role'] = status.infoModel[0].value;
    }
    this.loadDatas({
      // 当前加载参数
      params,
      // 是否渲染数据列表
      isRenderDataList: false,
      // 服务
      loadService: 'personnelManageService',
      // 当前加载数据的Service函数
      loadServiceFn: 'getUser'
    }).then((res: any) => {
      if (res.success) {
        let dataList = res.result.items;
        // 人员
        status.infoModel[1].options = [];
        Utils.resetData(dataList, (dataItem) => {
          status.infoModel[1].options.push({value: dataItem.id, text: dataItem.name + '(' + (dataItem.organizationUnitName) + ')'});
        });
      }
      if (callBack) {
        callBack();
      }
    });
  }

  /**
   * 添加成员
   */
  public addMember() {
    this.operationOpenModal({
      operationModalTitle: '添加成员',
      infoModel: this.status.infoModel,
      customForms: this.customForms
    }).submit(() => {
      let params = this.customForms.getModelJson();
      params['projectId'] = this.status.carModelId;
      // params['OrganizationId'] = this.status.userModel.department;
       console.info(params);
      this.formSubmit({
        customForms: this.customForms,
        params,
        // 添加接口方法名称
        loadServiceFn: 'addUserToProject'
      }).then((res: any) => {
        if (res.success) {
          this.message.success(Lang.createSuccess);
          // 刷新列表
          this.loadData();
        }
        else {
          this.message.error(Utils.errorMessageProcessor(res));
        }
      });
    });
  }

  /**
   * 删除-确认
   * @param data <any> 删除的数据
   */
  public deleteMember(data: any) {
    this.deleteOperation().submit(() => {
      let params = {
        Id: data.id
      };
      this.loadService.removeUserOnProject(params).then((res: any) => {
        if (res.success) {
          this.message.success(Lang.deleteSuccess);
          // 刷新列表
          this.loadData();
        }
        else {
          this.message.error(Utils.errorMessageProcessor(res));
        }
      });
    });
  }

  /**
   * 修改
   * @param data <any> 修改数据
   */
  public editMember(data: any) {
    this.operationOpenModal({
      operationModalTitle: '修改成员',
      infoModel: this.status.infoModel,
      customForms: this.customForms,
      formData: data
    }).submit(() => {
      this.formSubmit({
        customForms: this.customForms,
        params: this.customForms.getModelJson(),
        // 修改接口方法名称
        loadServiceFn: null
      }).then((res: any) => {
        if (res.success) {
          this.message.success(Lang.createSuccess);
          // 刷新列表
          this.loadData();
        }
        else {
          this.message.error(Utils.errorMessageProcessor(res));
        }
      });
    });
  }

  /**
   * 批量操作
   */
  public operateData() {
    this.deleteOperation().submit((checkedData) => {
      let params = [];
      Utils.resetData(checkedData, (item) => {
        params.push(item.id);
      });
      this.loadService.batchDeleteUser(params).then((res: any) => {
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
