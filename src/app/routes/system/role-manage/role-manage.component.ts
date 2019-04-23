import { Component, OnInit, ViewChild } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import {
  NzModalService,
  NzMessageService,
  NzFormatEmitEvent,
  NzTreeNode,
  NzTreeNodeOptions
} from "ng-zorro-antd";

import { Utils, Lang, Status } from "../../../common/helper/util-helper";
import { CustomFormsComponent } from "../../../components/custom-forms/custom-forms.component";
import { RoleManageService } from "../../../services/system/role-manage.service";
import { CustomPageOperationComponent } from "../../../components/custom-page-operation/custom-page-operation.component";

@Component({
  selector: "app-role-manage",
  templateUrl: "./role-manage.component.html",
  styleUrls: [
    "./role-manage.component.scss",
    "./../../../components/custom-forms/custom-forms.component.scss"
  ]
})
export class RoleManageComponent extends CustomPageOperationComponent
  implements OnInit {
  @ViewChild("customForms") public customForms: CustomFormsComponent;

  public status = {
    // 数据集合
    dataList: [],
    pageSize: 10,
    // 角色信息
    roleInfoModal: [
      // 角色名称
      {
        value: null,
        text: "角色名称",
        key: "displayName",
        require: true,
        requireIconType: "static",
        maxWidth: true,
        maxlength: 20
      },
      // 职能描述
      {
        value: null,
        text: "职能描述",
        type: "textarea",
        key: "description",
        rowType: "static",
        maxlength: 100
      }
    ],
    // 权限分配
    authority: [
      // // 权限数据模板
      // {
      //   value: null, text: '角色管理', key: 'role-manage', group: [
      //     {value: '1', label: '新增角色', key: 'add', checked: false},
      //     {value: '3', label: '删除角色', key: 'delete', checked: false},
      //     {value: '2', label: '编辑角色信息', key: 'edit', checked: false},
      //   ]
      // }
    ],
    authorityObjs: {
      // 角色管理
      "Pages.Administration.Roles": true,
      // 人员管理
      "Pages.Administration.Users": true,
      // 汽车模型管理
      "Ele.Project": true,
      // 部门管理
      "Pages.Administration.OrganizationUnits": true,
      // 车型结构树
      "Ele.ModelDirectorys": true,
       // 构件属性管理
       "Ele.ModelPropertys": true,
        // 文件库目录管理
      "Ele.FileDirectorys": true,
      // 文件库管理
      "Ele.Files": true,
      // 日志
      "Ele.Logs": true
    },
    // 当前页面所需要的权限
    pagePermissions: [
      "Pages.Administration.Roles.Create",
      "Pages.Administration.Roles.Delete",
      "Pages.Administration.Roles.Edit"
    ],
    // 当前页面权限
    pageAuthorty: { Create: null, Delete: null, Edit: null },
    // 不可删除Name
    unDeleteName: {
      // 系统管理员
      Admin: true,
      // 项目管理员
      Project: true,
      // 技术人员
      Technology: true,
      // 查阅人员
      View: true
    }
  };

  public constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    // 公共对象使用public，在CustomPageOperationComponent中会使用
    public message: NzMessageService,
    public mzModal: NzModalService,
    // 当前的Service 必须是public且名称为loadService，在CustomPageOperationComponent中会使用
    public loadService: RoleManageService
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
    // 初始化权限匹配
    this.status.pageAuthorty = this.grantedPermissions(
      this.status.pagePermissions,
      this.status.pageAuthorty
    );
    this.loadData();
    let pagePermissions = this.status.pagePermissions;
    if (
      this.status.pageAuthorty["Create"] ||
      this.status.pageAuthorty["Edit"]
    ) {
      this.getRoleForEdit();
    }
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
   * 获取角色权限信息
   */
  private getRoleForEdit(id?: any) {
    this.loadDatas({
      // 当前加载参数
      params: { id },
      // 同一页面使用多个loadDatas时，并且列表需要批量选择时，除列表的loadDatas外，其他loadDatas需要添加此参数
      isRenderDataList: false,
      isFailTip: false,
      // 当前加载数据的Service函数
      loadServiceFn: "getRoleForEdit"
    }).then((res: any) => {
      if (res.success) {
        let permissions = res.result.permissions;
        // Utils.forEach(permissions, (item) => {
        //   console.info(item.name + ',' + item.displayName);
        // });
        let grantedPermissionNames = res.result.grantedPermissionNames;
        this.disposePermissionsData(permissions, grantedPermissionNames);
      }
    });
  }

  /**
   * 处理权限数据
   * @param permissions 权限数据
   */
  private disposePermissionsData(permissions, grantedPermissionNames) {
    // console.log(permissions)
    // 获取首级
    let FirstPermissions = [];
    let tempPermission = {};
    let authorityObjs = this.status.authorityObjs;
    // 总权限数据
    Utils.resetData(permissions, (permission) => {
      let permissionKey = permission.name;
    // console.log(permissionKey)
      // 匹配权限关键字
      // 如果能在authorityObjs 找到该权限
      if (authorityObjs[permissionKey]) {
        tempPermission[permissionKey] = tempPermission[permissionKey] || {
          text: null,
          key: null,
          group: []
        };
        tempPermission[permissionKey].text = permission.displayName;
        tempPermission[permissionKey].key = permissionKey;
        // console.log(tempPermission)
      } else {
        for (let key in authorityObjs) {
          if (permissionKey.indexOf(key) > -1) {
            // 权限组集合
            let groupItem = tempPermission[key];
            if (!groupItem) {
              groupItem = { text: null, key: null, group: [] };
              tempPermission[key] = groupItem;
            }
            groupItem.group = groupItem.group || [];
            let checkStatus = false;
            Utils.resetData(grantedPermissionNames, (nameItem) => {
              if (permissionKey == nameItem) {
                checkStatus = true;
                return "break";
              }
            });
            groupItem.group.push({
              value: permissionKey,
              label: permission.displayName,
              key: permissionKey,
              checked: checkStatus
            });
          }
        }
      }

    });
    // 重新排序Permissions
      // 排序后的新数组
    let reOrderPermissions = [];
    for (let key in tempPermission) {
      // console.log(tempPermission[key])
      if(key === 'Pages.Administration.Roles'){
        reOrderPermissions[0] = tempPermission[key]
      }else if(key === 'Pages.Administration.Users'){
        reOrderPermissions[1] = tempPermission[key]
      }else if(key === 'Ele.Project'){
        reOrderPermissions[2] = tempPermission[key]
      }else if(key === 'Pages.Administration.OrganizationUnits'){
        reOrderPermissions[3] = tempPermission[key]
      }else if(key === 'Ele.ModelDirectorys'){
        reOrderPermissions[4] = tempPermission[key]
      }else if(key === 'Ele.ModelPropertys'){
        reOrderPermissions[5] = tempPermission[key]
      }else if(key === 'Ele.FileDirectorys'){
        reOrderPermissions[6] = tempPermission[key]
      }else if(key === 'Ele.Files'){
        reOrderPermissions[7] = tempPermission[key]
      }else if(key === 'Ele.Logs'){
        reOrderPermissions[8] = tempPermission[key]
      }
      // FirstPermissions.push(tempPermission[key]);
    }
    // this.status.authority = reOrderPermissions;

    // 固定顺序排序
    // let order = [7, 2, 1, 0, 4, 5, 6, 3, 8];
    // let reOrderPermissions = [];
    // for (let i = 0; i < order.length; i++) {
    //   reOrderPermissions.push(FirstPermissions[order[i]]);
    // }
    // console.log(reOrderPermissions)
    // this.status.authority = reOrderPermissions;

    // 重新排序Permissions下的权限
    const ProjectOrder = [2, 3, 5, 1, 7, 6, 4, 0];
    const ModelDirectorys = [0, 1, 2];
    const ModelPropertys = [1, 2, 3, 0];
    const Files = [0, 2, 1, 3, 4];
    const FileDirectorys = [0, 1, 2];
    const Logs = [0, 1];
    const Roles = [0, 1, 2];
    const Users = [1, 3, 2, 0, 4];
    const OrganizationUnits = [0, 1];
    // 保存 权限固定顺序的数组
    let newGroupOrder = [
      Roles,
      Users,
      ProjectOrder,
      OrganizationUnits,
      ModelDirectorys,
      ModelPropertys,
      FileDirectorys,
      Files,
      Logs
    ];
    for (let key = 0; key < reOrderPermissions.length; key++) {
      // 提取出9个原权限数组
      // 取出9个顺序数组
      let oldArr = reOrderPermissions[key].group;
      let newArr = newGroupOrder[key];
      //  修改顺序并保存
      reOrderPermissions[key].group = this.reOrder(newArr, oldArr);
    }
  //   // 保存回全局
    this.status.authority = reOrderPermissions;
    console.info(reOrderPermissions);
  }
  /**
   * 提取排序方法reOrder
   */
  public reOrder(orderArr, oldArr) {
    // 重新排序后的新数组
    let reOrderGroup = [];
    for (let i = 0; i < orderArr.length; i++) {
      reOrderGroup.push(oldArr[orderArr[i]]);
    }
    return reOrderGroup;
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
      loadServiceFn: "getRoles"
    }).then((res: any) => {
      if (res.success) {
        // 当前列表集合
        this.status.dataList = res.result.items || [];
      }
    });
  }

  // 每页显示条数改变事件处理
  public pageSizeChange(size: any) {
    console.log(size);
    this.status.pageSize = size;
    this.pageIndexChange(1);
  }

  /**
   * 获取当前选中的角色权限
   */
  private getChoosedRoleAuthority() {
    let resultAuthority = [];
    // 获取全部权限
    let grantedPermissions = eval(
      "(" + Utils.getLocalStorage(Status.grantedPermissions) + ")"
    );
    // 除设置的权限外，其他权限全部加入
    for (let key in grantedPermissions) {
      let keyStatus = true;
      for (let authorityKey in this.status.authorityObjs) {
        if (key.indexOf(authorityKey) != -1) {
          keyStatus = false;
        }
      }
      if (keyStatus) {
        resultAuthority.push(key);
      }
    }
    for (let authorityKey in this.status.authorityObjs) {
      resultAuthority.push(authorityKey);
    }

    // 获取当前设置的属性
    let authority = this.status.authority;
    let i = 0,
      len = authority.length,
      authorityItem;
    for (; i < len; i++) {
      authorityItem = authority[i];
      let group = authorityItem.group;
      let j = 0,
        lenJ = group.length,
        groupItem;
      for (; j < lenJ; j++) {
        groupItem = group[j];
        if (groupItem.checked) {
          resultAuthority.push(groupItem.key);
          // 还原状态
          // groupItem.checked = false;
        }
      }
    }

    return resultAuthority;
  }

  /**
   * 清空权限
   */
  private clearRoleAuthority() {
    let authority = this.status.authority;
    Utils.resetData(authority, (authorityItem) => {
      let group = authorityItem.group;
      Utils.resetData(group, (groupItem) => {
        groupItem.checked = false;
      });
    });
  }

  /**
   * 添加
   */
  private add() {
    this.operationOpenModal({
      operationModalTitle: "添加角色",
      infoModel: this.status.roleInfoModal,
      customForms: this.customForms
    })
      .close(() => {
        // 清空数据
        this.customForms.clear();
        // 清空权限
        this.clearRoleAuthority();
      })
      .submit(() => {
        this.formSubmit({
          customForms: this.customForms,
          params: {
            role: this.customForms.merge(
              { isDefault: true, id: null },
              this.customForms.getModelJson()
            ),
            grantedPermissionNames: this.getChoosedRoleAuthority()
          },
          // 添加接口方法名称
          loadServiceFn: "createRole"
        }).then((res: any) => {
          if (res.success) {
            this.message.success(Lang.createSuccess);
            // 清空权限
            this.clearRoleAuthority();
            // 刷新列表
            this.loadData();
          } else {
            this.message.error(Utils.errorMessageProcessor(res));
          }
        });
      });
  }

  /**
   * 删除
   * @param data <any> 删除的数据
   */
  private delete(data: any) {
    this.deleteOperation().submit(() => {
      let params = {
        Id: data.id
      };
      this.loadService.deleteRole(params).then((res: any) => {
        if (res.success) {
          this.message.success(Lang.deleteSuccess);
          // 刷新列表
          this.loadData();
        } else {
          this.message.error(Utils.errorMessageProcessor(res));
        }
      });
    });
  }

  /**
   * 修改
   * @param data <any> 需要修改的数据
   */
  private edit(data: any) {
    this.getRoleForEdit(data.id);
    this.operationOpenModal({
      operationModalTitle: "修改角色",
      infoModel: this.status.roleInfoModal,
      customForms: this.customForms,
      formData: data
    })
      .close(() => {
        // 清空数据
        this.customForms.clear();
        // 清空权限
        this.clearRoleAuthority();
      })
      .submit(() => {
        this.formSubmit({
          customForms: this.customForms,
          params: {
            role: this.customForms.merge(
              { isDefault: data.isDefault, id: data.id },
              this.customForms.getModelJson()
            ),
            grantedPermissionNames: this.getChoosedRoleAuthority()
          },
          // 修改接口方法名称
          loadServiceFn: "updateRole"
        }).then((res: any) => {
          if (res.success) {
            this.message.success(Lang.modifySuccess);
            // 刷新列表
            this.loadData();
            // 清空权限
            this.clearRoleAuthority();
            // 提示重新登录
            this.mzModal.info({
              nzTitle: "温馨提示",
              nzContent: "<p>由于权限变更，对应账号需要重新登录方可生效！</p>",
              nzOnOk: () => {}
            });
          } else {
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
      if (this.status.unDeleteName[dataItem.name]) {
        return false;
      }
    });
  }

  /**
   * 批量操作
   */
  private operateData() {
    this.deleteOperation().submit((checkedData) => {
      // console.info(checkedData);
      let params = [];
      Utils.resetData(checkedData, (item) => {
        params.push(item.id);
      });
      this.loadService.batchDeleteRole(params).then((res: any) => {
        if (res.success) {
          this.message.success(Lang.deleteSuccess);
          // 回到第1页
          this.pageIndexChange(1);
        } else {
          this.message.error(Utils.errorMessageProcessor(res));
        }
      });
    });
  }
}
