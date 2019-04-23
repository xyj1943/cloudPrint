/**
 * 自定义页面操作（对数据的增、删、改、查）
 * @author AndyPan
 * @createdate 2019年1月8日09:33:42
 * @version 1.0.0
 * @remark 主要对页面上的（增、删、改、查）操作，即页面列表公共操作部分
 */

import { Utils, Lang, Status } from '../../common/helper/util-helper';

export class CustomPageOperationComponent {

  public modelDisabled: any = false;
  // 操作状态对象
  public operationStatus = {
    // 关键字
    filter: null,
    // 排序
    sort: null,
    sortMapping: {
      descend: 'DESC',
      ascend: 'ASC'
    },
    // 加载中
    isLoading: false,
    // 加载中提示
    loadingTip: Lang.loading,
    // 分页相关数据集合对象
    pager: {
      // 当前页
      pageIndex: 1,
      // 总记录数
      totalCount: 1,
      // 每页显示记录数
      pageSize: 10,
      // 总页数
      totalPages: 1
    },
    // 选中所有
    allChecked: false,
    // 半选中
    indeterminate: false,
    // 批量删除按钮状态
    delBtnStatus: true,
    // 当前选中的数据集合
    checkedDatas: [],
    // 模型禁用
    modelDisabled: this.modelDisabled,
    // (当前操作，公共)弹出框相关数据集合
    modal: {
      // 自定义表单模型数据
      customFormInfoModel: null,
      // 是否需要底部按钮栏
      isShowModalFooter: true,
      // 操作弹出框状态
      operationModalStatus: false,
      // 操作弹出框标题
      operationModalTitle: '标题',
      // 按钮 - 确定
      sureButton: {text: '确定', type: 'primary', submitText: '提交中'},
      // 按钮 - 取消，数据格式同上
      resetButton: null,
      // 弹出框关闭函数
      closeModalFn: null,
      // 弹出框取消按钮函数
      resetModalFn: null,
      // 弹出框提交按钮函数
      submitModalFn: null
    },
    // 列表数据集合
    dataList: [],
    // 当前权限
    grantedPermissions: eval('(' + Utils.getLocalStorage(Status.grantedPermissions) + ')')
  };

  /**
   * 权限匹配
   * @param permissions <Array> 需要匹配的权限集合
   * @param resPermissions <Array> 返回的权限集合
   * @param flag <any> 返回值是否与权限的前面一级组合
   */
  public grantedPermissions(permissions: Array<string>, resPermissions?: any, flag?: any) {
    let grantedPermissions = this.operationStatus.grantedPermissions;
    let result = resPermissions || {};
    if (permissions) {
      Utils.forEach(permissions, (permission) => {
        let tempArys = permission.split('.');
        let key = tempArys[tempArys.length - 1];
        if (flag) {
          key = tempArys[tempArys.length - 2] + key;
        }
        if (grantedPermissions[permission]) {
          result[key] = true;
        }
      });
    }
    // console.info(grantedPermissions);

    return result;
  }

  /**
   * 排序
   * @param sort
   */
  public dataSort(sort) {
    this.operationStatus.sort = sort.value ? (sort.key + ' ' + this.operationStatus.sortMapping[sort.value]) : null;
    let childLoadData = this['loadData'];
    if (childLoadData) {
      childLoadData.bind(this)();
    }
  }

  /**
   * 全部选中
   * @param status <any> 全选框的选中状态
   */
  public checkAll(status: any, callBack?: Function) {
    this.operationStatus.dataList.forEach((data: any) => {
      let eachStatus;
      if (callBack) {
        eachStatus = callBack(data);
      }
      if (eachStatus != false) {
        data['checked'] = status;
      }
    });
    this.refreshCheckboxStatus();
  }

  /**
   * 刷新(所有复选框)状态
   */
  private refreshCheckboxStatus() {
    let dataList = this.operationStatus.dataList;
    const allChecked = dataList.filter((value: any) => !value['disabled']).every((value: any) => value['checked'] === true);
    const allUnChecked = dataList.filter((value: any) => !value['disabled']).every((value: any) => !value['checked']);

    this.operationStatus.allChecked = allChecked;
    this.operationStatus.indeterminate = (!allChecked) && (!allUnChecked);

    // 获取当前选中的数据
    let checkedDatas = [];
    dataList.forEach((data) => {
      if (data['checked']) {
        checkedDatas.push(data);
      }
    });
    this.operationStatus.checkedDatas = checkedDatas;
    // 改变批量操作按钮状态
    this.operationStatus.delBtnStatus = !dataList.some((value: any) => value['checked']);
  }

  /**
   * 获取当前选中项
   */
  public getCheckedData() {
    return this.operationStatus.checkedDatas;
  }

  /**
   * 数据加载
   * @param options <any> 数据加载参数选项
   */
  public loadDatas(options?: any) {
    let status = this.operationStatus;
    let pager = status.pager;

    // 数据加载失败，是否使用默认提示，默认为提示
    let isFailTip = options.isFailTip == undefined ? true : options.isFailTip;

    let params = {};
    // 是否是分页列表，并添加默认分页参数
    if (options.isPageList) {
      // 每页记录数
      params['maxResultCount'] = options.pageSize || pager.pageSize;
      // 当前页码
      params['skipCount'] = pager.pageIndex - 1;
    }
    // 是否关键字搜索
    // console.info(status.keywords);
    if (options.filter || status.filter) {
      params['filter'] = options.keyword || status.filter;
    }
    // 排序
    if (options.sort || status.sort) {
      params['sorting'] = options.sort || status.sort;
    }

    let optionsParams = options.params;
    if (optionsParams) {
      for(let key in optionsParams){
        params[key] = optionsParams[key];
      }
    }
    if (params['maxResultCount']) {
      this.operationStatus.pager.pageSize = params['maxResultCount'];
    }

    // 加载数据Service
    let loadService = this[options.loadService || 'loadService'];
    let loadServiceFn = options.loadServiceFn;
    if (loadService && loadServiceFn) {
      // 设置加载中
      status.isLoading = true;
      return loadService[loadServiceFn](params).then((res: any) => {
        if (res.success) {
          // 同一页面使用多个loadDatas时，并且列表需要批量选择时，除列表的loadDatas外，其他loadDatas需要添加此参数
          if (options.isRenderDataList != false) {
            let result = res.result;
            let dataList = result.items;
            // 设置总记录数
            pager.totalCount = result.totalCount;
            // 设置总记录数
            pager.totalPages = result.totalCount;
            // 列表数据集合
            status.dataList = dataList || [];
          }
          // 数据加载成功
          let loadSuccess = options.loadSuccess;
          if (loadSuccess) {
            loadSuccess(res);
          }
        }
        else {
          // 数据加载失败
          let loadFail = options.loadFail;
          if (loadFail) {
            loadFail(res);
          }
          // 数据加载失败，是否使用默认提示
          if (isFailTip) {
            this['message'].error(res.error ? (res.error.message || Lang.loadFail) : Lang.loadFail);
          }
        }
        // 不管成功失败，关闭加载中
        status.isLoading = false;

        // 返回res，供外部then时使用
        return res;
      });
    }
  }

  /**
   * 刷新列表
   */
  public refreshDataList() {
    let refresh = this['loadData'].bind(this);
    if (refresh) {
      refresh();
    }
  }

  /**
   * 列表分页
   * @param index <number> 非必填，列表跳转至第几页，默认为当前页(即刷新当前页数据)
   */
  public pageIndexChange(index?: any) {
    let pager = this.operationStatus.pager;
    pager.pageIndex = index || pager.pageIndex;
    this.refreshDataList();
  }

  /**
   * 改变每页记录条数
   * @param size <number> 非必填
   */
  public pageSizeChange(size?: number) {
    let pager = this.operationStatus.pager;
    pager.pageSize = size || pager.pageSize;
    this.pageIndexChange();
  }

  /**
   * 打开弹出框
   * @param options <any> 参数配置选项集合对象
   */
  public operationOpenModal(options: any) {
    let modal = this.operationStatus.modal;
    let customForms = options.customForms;

    let commonCloseModal = () => {
      if (options.closeModalFn) {
        options.closeModalFn();
      }
      if (options.resetModalFn) {
        options.resetModalFn();
      }
      // 清空(输入的)数据
      customForms.clear();
    };
    // 是否需要底部栏
    modal.isShowModalFooter = options.isShowModalFooter == undefined ? true :  options.isShowModalFooter;
    // 设置弹出框标题
    modal.operationModalTitle = options.operationModalTitle;
    // 设置模型数据
    modal.customFormInfoModel = options.infoModel || null;
    setTimeout(() => {
      // 绑定当前操作函数
      modal.closeModalFn = commonCloseModal;
      modal.resetModalFn = commonCloseModal;
      modal.submitModalFn = options.submitModalFn;
      // 显示弹出框
      modal.operationModalStatus = true;

      if (customForms) {
        if (options.onRendered) {
          options.onRendered();
        }
        // 自动让第一项可编辑项获取焦点
        customForms.setFirstFocus();
        if (options.formData) {
          // 填充form表单数据
          customForms.renderToModel(options.formData, options.formKeyValue, options.formRenderCallBack);
        }
      }
    }, 0);

    return {
      /**
       * 弹出框渲染完成
       * @param fn 回调函数
       */
      rendered(fn) {
        options.onRendered = fn;
        return this;
      },
      /**
       * 弹窗确定按钮提交
       * @param fn 回调函数
       */
      submit(fn) {
        options.submitModalFn = fn;
        return this;
      },
      /**
       * 弹窗取消按钮事件
       * @param fn 回调函数
       */
      cancel(fn) {
        options.resetModalFn = fn;
        return this;
      },
      /**
       * 弹窗关闭事件
       * @param fn 回调函数
       */
      close(fn) {
        options.closeModalFn = fn;
        return this;
      }
    };
  }

  /**
   * 关闭弹出框
   * @param type <string> 哪个弹出框
   */
  public operationCloseModal(type: string) {
    let status = this.operationStatus;
    let modalStatus = status.modal;
    if (modalStatus[type] != undefined) {
      modalStatus[type] = false;
    }
    else {
      this['status'][type] = false;
    }

    if (modalStatus.closeModalFn) {
      modalStatus.closeModalFn();
    }
  }

  /**
   * 弹出框取消按钮事件
   * @param type <string> 哪个弹出框
   */
  public operationResetModal() {
    let status = this.operationStatus;
    let modalStatus = status.modal;
    modalStatus.operationModalStatus = false;

    if (modalStatus.resetModalFn) {
      modalStatus.resetModalFn();
    }
  }

  /**
   * 弹出框提交按钮事件
   */
  public operationSubmitModal() {
    let modalStatus = this.operationStatus.modal;
    if (modalStatus.submitModalFn) {
      modalStatus.submitModalFn();
    }
  }

  /**
   * 表单提交
   * @param options <any> 表单提交函数操作参数
   */
  public formSubmit(options: any) {
    let status = this.operationStatus;
    let customForms = options.customForms;
    if (customForms) {
      // 验证
      let result = customForms.verify();
      if (result.status) {
        // 获取参数
        let params = options.params;
        if (options.verifySuccess) {
          let cbResult = options.verifySuccess(params);
          if (cbResult) {
            params = cbResult;
          }
          else if (cbResult == false) {
            return;
          }
        }

        let loadService = this['loadService'];
        let loadServiceFn = options.loadServiceFn;
        if (loadService && loadServiceFn) {
          // 禁用表单元素(为2时，按钮文本显示'提交中')
          status.modelDisabled = 2;
          return loadService[loadServiceFn](params).then((res: any) => {
            if (res.success) {
              // 关闭弹出框
              status.modal.operationModalStatus = false;
              // 清空数据
              customForms.clear();
            }
            // 不管成功或失败，重新启用表单元素
            status.modelDisabled = false;
            // 返回res，供外部then时使用
            return res;
          });
        }
      }
    }
    return {then: () => {}};
  }

  /**
   * 删除-确认
   * @param data <any> 删除的数据
   * @param confirmBefore <Function> 删除确认前操作函数
   */
  public deleteOperation(data?: any, confirmBefore?: Function) {
    let confirmOk;
    let resultHandle = {
      submit(fn) {
        confirmOk = fn;
      }
    };
    if (typeof(data) == 'function') {
      confirmBefore = data;
      data = undefined;
    }
    if (confirmBefore) {
      let result = confirmBefore();
      if (result == false) {
        return resultHandle;
      }
    }
    let deleteTip = Lang.deleteTip;
    this['mzModal'].confirm({
      nzTitle: deleteTip.title,
      nzContent: deleteTip.tip,
      nzOnOk: () => {
        if (confirmOk) {
          // 响应确认事件，并返回当前操作的数据
          confirmOk(data || this.operationStatus.checkedDatas);
        }
      }
    });

    return resultHandle;
  }

  /**
   * 禁用表单模型
   */
  public disabledModel(status?) {
    this.operationStatus.modelDisabled = status != undefined ? status : true;
  }

  /**
   * 启用表单模型
   */
  public enableModel() {
    this.operationStatus.modelDisabled = false;
  }

}
