import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NzModalService, NzMessageService,
  NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions
} from 'ng-zorro-antd';

import { Utils, Lang, Status } from '../../../common/helper/util-helper';
import { CustomFormsComponent } from '../../../components/custom-forms/custom-forms.component';
import { PersonnelManageService } from '../../../services/system/personnel-manage.service';
import { DepartmentManageService } from '../../../services/system/department-manage.service';
import { RoleManageService } from '../../../services/system/role-manage.service';

import { CustomPageOperationComponent } from '../../../components/custom-page-operation/custom-page-operation.component';

@Component({
  selector: 'app-personnel-manage',
  templateUrl: './personnel-manage.component.html',
  styleUrls: ['./personnel-manage.component.scss']
})
export class PersonnelManageComponent extends CustomPageOperationComponent implements OnInit {
  @ViewChild('customForms') public customForms: CustomFormsComponent;
  public status = {
    // 数据集合
    dataList: [],
    // 分页数据
    pageSize: 10,
    // 用户信息
    infoModel: [
      // 账号
      {
        value: null, text: '账号', key: 'userName', require: true, verifyType: 'specialCharacter', maxlength: 32, minlength: 3
      },
      // 姓名
      {
        value: null, text: '姓名', key: 'name', require: true, verifyType: 'specialCharacter', maxlength: 8
      },
      // 邮箱
      {
        value: null, text: '邮箱', key: 'emailAddress', require: true, verifyType: 'email'
      },
      // 手机
      {
        value: null, text: '手机', key: 'phoneNumber', require: true, verifyType: 'phone', maxlength: 11
      },
      // 部门
      {
        value: null, type: 'select', text: '部门', key: 'department', require: true,
        nzNotFoundContent: '暂无部门信息', options: []
      },
      // 角色
      {
        value: null, type: 'select', text: '角色', key: 'roles', require: true,
        nzNotFoundContent: '暂无角色信息', options: []
      },
      // 初始密码
      {
        value: null, type: 'password', text: '初始密码', key: 'password', placeholder: '为空时密码与帐号一致'
      }
    ],
    roleObjs: {},
    // 新增用户默认密码
    // defaultPwd: '123456',
    // 当前页面所需要的权限
    pagePermissions: [
      'Pages.Administration.Users.ChangePermissions',
      'Pages.Administration.Users.Create',
      'Pages.Administration.Users.Delete',
      'Pages.Administration.Users.Edit'
    ],
    // 当前页面权限
    pageAuthorty: {ChangePermissions: null, Create: null, Delete: null, Edit: null},
    // 当前登录用户ID，用以屏蔽列表中当前用户不可删除自己
    currentUserId: Utils.getLocalStorage(Status.userId)
  };

  public constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    // 公共对象使用public，在CustomPageOperationComponent中会使用
    public message: NzMessageService,
    public mzModal: NzModalService,
    // 当前的Service 必须是public且名称为loadService，在CustomPageOperationComponent中会使用
    public loadService: PersonnelManageService,
    public departmentLoadService: DepartmentManageService,
    public roleManageService: RoleManageService
  ) {
    super();
  }

  public ngOnInit() {
    this.install();
  }

  /**
   * 重置密码
   * @param data <any> 当前被重置密码用户信息
   */
  public resetPassword(data: any) {
    this.mzModal.confirm({
      nzTitle  : '<i>重置密码?</i>',
      nzContent: '<b>确认要重置该账号的密码吗？重置后密码为当前账号</b>',
      nzOnOk   : () => this.resetPasswordSure(data)
    });
  }

  /**
   * 确认重置密码
   * @param data <any> 当前被重置密码用户信息
   */
  private resetPasswordSure(data: any) {
    this.loadService.resetPasswordByAdmin({userId: data.id}).then((res: any) => {
      if (res.success) {
        this.mzModal.success({
          nzTitle: '重置成功',
          nzContent: '密码已重置成功，密码为当前账号'
        });
      }
      else {
        this.message.error(Utils.errorMessageProcessor(res));
      }
    });
  }

  /**
   * 初始装载
   */
  private install() {
    // 初始化权限匹配
    this.status.pageAuthorty = this.grantedPermissions(this.status.pagePermissions, this.status.pageAuthorty);
    if (this.status.pageAuthorty['Create'] || this.status.pageAuthorty['Edit']) {
      this.loadDepartment(() => {
        this.loadRole(() => {
          this.loadData();
        });
      });
    }
    else {
      this.loadData();
    }
    let rolesItem = this.getModelItemByKey('roles');
    rolesItem['disabled'] = !this.status.pageAuthorty['ChangePermissions'];
  }

  private getModelItemByKey(key) {
    let result;
    let infoModel = this.status.infoModel;
    Utils.resetData(infoModel, (item) => {
      if (item.key == key) {
        result = item;
        return 'break';
      }
    });

    return result;
  }

  /**
   * 加载列表数据
   */
  public loadData(callBack?: Function) {
    this.loadDatas({
      // 当前加载参数
      params: {
        // 每页记录数
        maxResultCount: this.status.pageSize
      },
      // 是否是分页列表，并添加默认分页参数
      isPageList: true,
      // 当前加载数据的Service函数
      loadServiceFn: 'getUser'
    }).then((res: any) => {
      if (res.success) {
        // 当前列表集合
        this.status.dataList = res.result.items || [];
        // console.log(this.status.dataList);
      }
      if (callBack) {
        setTimeout(callBack, 0);
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
      // 服务
      loadService: 'departmentLoadService',
      // 当前加载数据的Service函数
      loadServiceFn: 'getOrganizationUnits',
      isPageList: false
    }).then(res => {
      if(res.success){
        let dataList = res.result.items;
        let department = this.getModelItemByKey('department');
        // 新增部门中选中上级部门列表对象
        department.options = [];
        // 遍历出上级部门
        Utils.resetData(dataList, (dataItem) => {
          // 作为新建部门时的上级部门选项
          department.options.push({value: dataItem.id, text: dataItem.displayName});
        });
      }
      if (callBack) {
        setTimeout(callBack, 10);
      }
    });
  }

  /**
   * 加载角色数据
   */
  public loadRole(callBack?: Function) {
    let status = this.status;
    this.loadDatas({
      // 当前加载参数
      params: {
        // 每页记录数
        maxResultCount: 1000
      },
      // 服务
      loadService: 'roleManageService',
      // 当前加载数据的Service函数
      loadServiceFn: 'getRoles',
      isPageList: false
    }).then(res => {
      if(res.success){
        let dataList = res.result.items;
        let roles = this.getModelItemByKey('roles');
        // 新增部门中选中上级部门列表对象
        roles.options = [];
        // 遍历出上级部门
        Utils.resetData(dataList, (dataItem) => {
          // 作为新建部门时的上级部门选项
          roles.options.push({value: dataItem.id, text: dataItem.displayName});
          status.roleObjs[dataItem.id] = dataItem;
        });
      }
      if (callBack) {
        setTimeout(callBack, 10);
      }
    });
  }

  /**
   * 添加人员
   */
  private addPersonnel() {
    this.operationOpenModal({
      operationModalTitle: '添加人员',
      infoModel: this.status.infoModel,
      customForms: this.customForms
    }).submit(() => {
      let params = {
        "user": {},
        "assignedRoleNames": ["string"],
        "sendActivationEmail": false,
        "setRandomPassword": false,
        "organizationUnits": [0]
      };
      this.formSubmit({
        customForms: this.customForms,
        params: this.customForms.getModelJson(),
        verifySuccess: (res) => {
          console.info(res)
          params.user = {
            "name": res.name,
            "surname": res.userName,
            "userName": res.userName,
            "emailAddress": res.emailAddress,
            "phoneNumber": res.phoneNumber,
            "password": res.password,
            "isActive": true,
            "shouldChangePasswordOnNextLogin": false,
            "isTwoFactorEnabled": false,
            "isLockoutEnabled": false
          };
          params.assignedRoleNames = [this.status.roleObjs[res.roles].name];
          params.organizationUnits = [res.department];

          return params;
        },
        // 添加接口方法名称
        loadServiceFn: 'createOrUpdateUser'
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
   * 删除-确认
   * @param data <any> 删除的数据
   */
  private deletePersonnel(data: any){
    this.deleteOperation().submit(() => {
      let params = {
        Id: data.id
      };
      this.loadService.deleteUser(params).then(res => {
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
   * 修改
   * @param data <any> 修改数据
   */
  private editPersonnel(data: any) {
    // console.info(data);
    this.operationOpenModal({
      operationModalTitle: '修改人员',
      infoModel: this.status.infoModel,
      customForms: this.customForms,
      formData: data,
      formRenderCallBack: (modelItem, idx, resData) => {
        // 特殊处理类型
        if (modelItem.key == 'roles') {
          return resData[0].roleId
        }
      }
    }).submit(() => {
      this.formSubmit({
        customForms: this.customForms,
        verifySuccess: () => {
          let modelParams = this.customForms.getModelJson();
          // console.info(modelParams);
          return {
            "user": {
              "id": data.id,
              "name": modelParams['name'],
              "surname": modelParams['userName'],
              "userName": modelParams['userName'],
              "emailAddress": modelParams['emailAddress'],
              "phoneNumber": modelParams['phoneNumber'],
              "password": null,
              "isActive": true,
              "shouldChangePasswordOnNextLogin": false,
              "isTwoFactorEnabled": false,
              "isLockoutEnabled": false
            },
            "assignedRoleNames": [this.status.roleObjs[modelParams['roles']].name],
            "sendActivationEmail": false,
            "setRandomPassword": false,
            "organizationUnits": [modelParams['department']]
          };
        },
        // 修改接口方法名称
        loadServiceFn: 'createOrUpdateUser'
      }).then((res) => {
        if (res.success) {
          this.message.success(Lang.modifySuccess);
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
  private operateData() {
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

  /**
   * 页面自定义全选操作
   * @param event <any>
   */
  public pageCheckAll(event: any) {
    // 调用custom-page-operation的全选
    this.checkAll(event, (dataItem) => {
      // （不可操作项）
      if (this.status.currentUserId == dataItem.id || dataItem.id == 1) {
        return false;
      }
    });
  }
}
