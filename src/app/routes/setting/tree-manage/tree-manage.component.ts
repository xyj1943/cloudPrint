import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzModalService, NzMessageService, NzTreeNode } from 'ng-zorro-antd';

import { Utils, Lang, Status } from '../../../common/helper/util-helper';
import { CustomFormsComponent } from '../../../components/custom-forms/custom-forms.component';
import { TreeEditComponent } from '../../../components/tree-edit/tree-edit.component';
import { CustomDragComponent } from '../../../components/custom-drag/custom-drag.component';

import { FileLibService } from '../../../services/file-lib/file-lib.service';
import { TreeManageService } from '../../../services/setting/tree-manage.service';
import { CarModelService } from '../../../services/car-model/car-model.service';
import { CustomPageOperationComponent } from '../../../components/custom-page-operation/custom-page-operation.component';


@Component({
  selector: 'app-tree-manage',
  templateUrl: './tree-manage.component.html',
  styleUrls: ['./tree-manage.component.scss']
})

export class TreeManageComponent extends CustomPageOperationComponent implements OnInit {
  @ViewChild('treeEdit') public treeEdit: TreeEditComponent;
  @ViewChild('customForms') public customForms: CustomFormsComponent;
  @ViewChild('customDrag') public customDrag;

  public status = {
    carModelId: null,
    // 原始树数据
    originTrees: null,
    // 树形目录数据
    treeNodes: null, treeNodeAll: null,
    // treeNode为空还是有数据，以便显示空提示或树形结构
    treeNodesStatus: 1,
    // 添加按钮可选状态
    btnDisabled: false,
     // sort 
     dirSort: 1,
     // dirLevel
     dirLevel:0,
     // 当前节点
     currentDirNode: null,
    // 模板选择模型
    templateInfoModel: [
      {
        value: Lang.rootDirectoryId, text: '模板', type: 'radiobox-group', key: 'templateId', isShowLabel: false,
        dataArray: 'row', radioboxGroup: [
          {value: Lang.rootDirectoryId, label: '默认模板-车身系统'}
          // {value: null, label: '空白模板-车身系统'}
        ]
      }
    ],
    treeModelInfo: [
      {
        value: 0, key: 'tree-model-type', radioboxGroup: [
          {value: 0, label: '车身系统', checked: true},
          {value: 1, label: '动力系统', disabled: true},
          {value: 2, label: '底盘系统', disabled: true},
          {value: 3, label: '其他系统', disabled: true}
        ]
      }
    ],
    // 重置提醒模型
    resetTipModel: [
      {type: 'text', textRemark: '重置后当前模板将被新模板覆盖，已绑定的构件全部解绑，请谨慎操作', isShowLabel: false}
    ],
    // 导入文件模型
    importModel: [
      {value: null, type: 'upload-file-progress', text: '模板选择', key: 'excelTemplate', require: true, valueText: '导入后原有模板将被覆盖，请谨慎导入！'}
    ],
    // 当前页面所需要的权限
    pagePermissions: [
      'Ele.ModelDirectorys.Create',
      'Ele.ModelDirectorys.Delete',
      'Ele.ModelDirectorys.Edit'
    ],
    // 当前页面权限
    pageAuthorty: {Create: null, Delete: null, Edit: null},

    // 当前上传的Excel 文件对象
    currentExcelData: null
  };

  public constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    // 公共对象使用public，在CustomPageOperationComponent中会使用
    public message: NzMessageService,
    public mzModal: NzModalService,
    // 当前的Service 必须是public且名称为loadService，在CustomPageOperationComponent中会使用
    public loadService: TreeManageService,
    private fileLibService: FileLibService,
    private carModelService: CarModelService
  ) {
    super();
  }

  public ngOnInit() {
    this.install();
  }

  // 初始装载
  private install() {
    // 初始化权限匹配
    this.status.pageAuthorty = this.grantedPermissions(this.status.pagePermissions, this.status.pageAuthorty);
    // console.info(this.status.pageAuthorty);
    this.status.carModelId = this.routeInfo.snapshot.queryParams[Status.carModelId];
    this.loadDatas();
    this.queryTemplateList();
  }

  /**
   * 拖拽开始
   * @param result
   */
  public dragBeginEvent(result) {
    // console.info(result);
    let className = result.target.className;
    if (className && typeof(className) == 'string') {
      let eventResult;
      if (className.indexOf('custom-node') < 0 && className != 'folder-name') {
        // 阻止其他元素的拖拽效果，让指定元素可拖拽
        eventResult = {state: false};
      }
      else if (className == 'folder-name') {
        // 重新指定目标元素
        eventResult = {target: result.target.parentNode};
      }
      return eventResult;
    }
  }

  /**
   * 拖拽移动
   * @param result
   */
  public dragMoveEvent(result) {
    // console.info(result);
    let className = result.target.className;
    let eventResult;
    if (className.indexOf('custom-node') > -1) {
      // 返回目标元素
      eventResult = {target: result.target};
    }
    else if (className == 'folder-name') {
      // 重新指定目标元素
      eventResult = {target: result.target.parentNode};
    }
    return eventResult;
  }

  /**
   * 拖拽结束
   * @param result
   */
  public dragEndEvent(result) {
    // console.info(result);
    let moveTarget = result.moveTarget;
    let dragTarget = result.dragTarget;
    let target = result.target;
    if (moveTarget && dragTarget) {
      let treeNodeAll = this.status.treeNodeAll;
      let treeNodes = this.status.treeNodes;
      let originTrees = this.status.originTrees;
      let moveDataId = moveTarget.getAttribute('id');
      let updateDataId = dragTarget.getAttribute('id');
      if (moveDataId != updateDataId) {
        let moveIdx; let updateDataItem;

        Utils.forEach(treeNodes, (treeNode, idx) => {
          // console.info(idx);
          // console.info(treeNode);
          let idArr = [];
          let nodes = this.deepTraversal(treeNode,idArr)
          // console.log(idArr);

          // idArr.indexOf(moveDataId)!= -1
          if (idArr.indexOf(moveDataId) != -1) {
            // moveIdx = parseInt(treeNode.sort) + 1;
            moveIdx = parseInt(idx) + 1;
          }
          // treeNode.id === updateDataId
          if (idArr.indexOf(updateDataId) != -1) {
            updateDataItem = treeNode;
          }
        });

        // console.info(treeNodes);
        // this.modifyOriginDirectorySort({moveDataId, updateDataId, moveIdx});

        let params = {
          "sort": moveIdx,
          "id": updateDataId
        };
        this.operationStatus.isLoading = true;
        this.loadService.modifyModelDirectorySort(params).then((res: any) => {
          if (res.success) {
            // 修改原始数据目录的排序
            this.modifyOriginDirectorySort({moveDataId, updateDataId, moveIdx});
            // this.fromOriginToNodeTree();
            this.message.success(Lang.operateSuccess);
            this.loadDatas();
            // console.info(updateDataItem);
          }
          else {
            this.message.error(Utils.errorMessageProcessor(res));
          }
        });
      }
    }
  }

// 深度优先遍历节点
  public deepTraversal(node,nodes) {
    if (node != null) {
        nodes.push(node.id);
        if(node.children){
          let children = node.children;
          for (let i = 0; i < children.length; i++)
           this.deepTraversal(children[i],nodes);
        }

    }
    // return nodes;
  }



  private modifyOriginDirectorySort(options) {
    let status = this.status;

    let moveDataId = options.moveDataId;
    let updateDataId = options.updateDataId;
    let moveIdx = options.moveIdx;
    // let updateDataItem = options.updateDataItem;

    // 修改原始数据sort
    // updateDataItem['sort'] = moveIdx;

    let treeNodeAll = status.treeNodeAll;
    let treeNodes = status.treeNodes;
    let originTrees = status.originTrees;
    let tempMoveItem; let tempMoveIdx; let tempUpdateItem;

    let eachChild = (thisNodes) => {
      let itemId; let itemChild;
      Utils.forEach(thisNodes, (item, idx) => {
        itemId = item.id;
        if (itemId == moveDataId) {
          tempMoveItem = item;
          tempMoveIdx = idx;
        }
        if (itemId == updateDataId) {
          tempUpdateItem = item;
          // 删除页面上原来的需要被移动的节点
          thisNodes.splice(idx, 1);
        }
        if (tempMoveItem && tempUpdateItem) {
          // 将移动的节点添加到指定的位置，并return 'break';终止遍历
          tempUpdateItem['sort'] = parseInt(tempMoveIdx) + 1;
          thisNodes.splice(tempMoveIdx, 0, tempUpdateItem);
          return 'break';
        }
        itemChild = item.children;
        if (itemChild) {
          // 如果未完成页面拖拽元素位置更换，并且存在子节点，继续递归遍历子节点
          eachChild(itemChild);
        }
      });
    };

    let tempOrigin = []; let nodeItemId; let childNodes;
    Utils.forEach(treeNodes, (nodeItem, key) => {
      nodeItemId = nodeItem.id;
      if (nodeItemId == updateDataId) {
        // 修改原始数据sort
        nodeItem['sort'] = moveIdx;
      }
      if (nodeItemId == moveDataId) {
        tempOrigin.push(treeNodeAll[updateDataId]);
      }
      if (nodeItemId !== updateDataId) {
        tempOrigin.push(nodeItem);
      }
      childNodes = nodeItem.children;
      if (childNodes) {
        // 遍历子节点
        eachChild(childNodes);
      }

      // if (nodeItem.id == moveDataId) {
      //   tempOrigin.push(treeNodeAll[updateDataId]);
      // }
      // if (nodeItem.id !== updateDataId) {
      //   tempOrigin.push(nodeItem);
      // }
    });
    // console.info(tempOrigin);
    // 重置树节点
    this.treeEdit.resetTreeNode(tempOrigin);
    this.operationStatus.isLoading = false;
    // status.treeNodes = null;
    // setTimeout(() => {
    //   status.treeNodes = tempOrigin;
    // }, 10);

    status.originTrees = tempOrigin;

    // this.fromOriginToNodeTree(() => {
    //   this.operationStatus.isLoading = false;
    // });

  }

  private THFindMatchValue = (() => {
    let resultArr = new Array();
    let getTickMenuId = function (obj) {
        if (undefined == obj || null == obj || !(obj instanceof Object)) {
            return;
        }
            resultArr.push(obj.id);
        if (null != obj.children && obj.children instanceof Array) {
            for (let child of obj.children) {
                getTickMenuId(child);
            }
        }
    };
    return (arr, key?: string, val?) => {
        resultArr = new Array();
        if (arr.length > 0) {
            for (let rootMenu of arr) {
                getTickMenuId(rootMenu);
            }
        }
        return resultArr;
    };
})();

  /**
   * 加载数据
   */
  public loadDatas() {
    let status = this.status;
    let params = {
      // 每页记录数
      maxResultCount: 1000,
      // 当前页码
      skipCount: 0,
      // 项目ID，即模型ID
      projectId: this.status.carModelId
    };
    this.operationStatus.isLoading = true;
    this.carModelService.queryModelDirectorysPagedList(params).then((res: any) => {
      if (res.success) {
        console.log("queryModelDirectorysPagedList")
        let result = res.result;
        let treeItems = result.items;
        // 保存原始数据
        status.originTrees = treeItems;
        // this.status.treeNodesStatus = treeItems.length;
        this.fromOriginToNodeTree(() => {
          this.operationStatus.isLoading = false;
        });
      }
      else {
        this.message.warning('目录数据加载失败');
        this.operationStatus.isLoading = false;
      }
    });
  }

  /**
   * 从原始数据转换为节点树数据
   * @param originData <any> 原始数据
   * @param callBack <Function> 回调函数
   */
  public fromOriginToNodeTree(originData?: any, callBack?: Function) {
    if (typeof(originData) == 'function') {
      callBack = originData;
      originData = undefined;
    }

    let status = this.status;
    let originTrees = originData || status.originTrees;

    // 用于保存所有节点对象，以节点id作为key，以便直接查找子节点
    let treeNodeAll = {};
    Utils.asyncEach(originTrees, (dataItem) => {
      dataItem.isLeaf = true;
      dataItem.title = dataItem.name;
      dataItem.key = dataItem.id;
      treeNodeAll[dataItem.id] = dataItem;
    }, () => {
      let nodes = Utils.renderTreeNode(treeNodeAll);
      this.reckonStatistics(treeNodeAll);
      this.reckonStatisticsFirstDir(nodes);
      status.treeNodes = nodes;
      status.treeNodeAll = treeNodeAll;

      if (callBack) {
        callBack();
      }
    });
  }

  /**
   * 计算统计绑定/未绑定数量
   */
  private reckonStatistics(nodes: any) {
    Utils.forEach(nodes, (item) => {
      let children = item.children || [];
      item['childrenCounts'] = (children ? children.length : 0);
      item['bindCounts'] = 0;
      Utils.forEach(children, (child) => {
        let childModelId = child.modelId;
        if (childModelId) {
          // 如果已经绑定
          childModelId = eval('(' + (childModelId) + ')');
          // item['bindCounts'] += 1; // childModelId.length;
          // child['icon'] = 'link';
        }
      });
      if (item['childrenCounts'] && item['parentId'] != Lang.rootDirectoryId) {
        item.title = item.title + '(' + (item['bindCounts']) + '/' + (item['childrenCounts']) + ')';
      }
    });
  }

  private reckonStatisticsFirstDir(nodes: any) {
    let getChildBind = (childs, counts) => {
      let childNode = childs.children || [];
      counts['childrenCounts'] += childNode.length;
      Utils.forEach(childNode, (item) => {
        let childModelId = item.modelId;
        if (childModelId) {
          // 如果已经绑定
          childModelId = eval('(' + (childModelId) + ')');
          // counts['bindCounts'] += 1; // childModelId.length;
        }
        getChildBind(item, counts);
      });
      return counts;
    };
    Utils.forEach(nodes, (item) => {
      let counts = { childrenCounts: 0, bindCounts: 0 };
      getChildBind(item, counts);
      // console.info(counts);
      if (counts['childrenCounts']) {
        item.title = item.title + '(' + (counts['bindCounts']) + '/' + (counts['childrenCounts']) + ')';
      }
    });

    return nodes;
  }

  /**
   * 获取标记后的模板
   */
  public queryTemplateList() {
    this.loadService.queryTemplateList({
      id: this.status.carModelId
    }).then((res: any) => {
      if (res.success) {
        let result = res.result || [];
        let model = this.status.templateInfoModel[0];
        model['radioboxGroup'] = model['radioboxGroup'] || [];
        let radioItem;
        Utils.forEach(result, (item: any) => {
          radioItem = {value: item.id, label: item.name};
          if (!item.hasValue) {
            // 如果模板中没有数据
            radioItem['textRemark'] = '（空白模板）';
          }
          model['radioboxGroup'].push(radioItem);
        });
        model['radioboxGroup'].push({value: null, label: '空白模板-车身系统'});
      }
    });
  }

  // 添加目录
  private addCatalog() {
    this.treeEdit.add();
  }

  /**
   * 树加载完成事件
   * @param res
   */
  private onTreeLoaded(res) {
    if (res.success) {
      let treeNodes = res.result.items;
      this.status.treeNodesStatus = treeNodes.length;
    }
  }

  /**
   * 选择模板
   */
  private chooseTemplate() {
    this.operationOpenModal({
      operationModalTitle: '选择模板',
      infoModel: this.status.templateInfoModel,
      customForms: this.customForms
    }).submit(() => {
      this.formSubmit({
        customForms: this.customForms,
        params: this.customForms.merge({projectId: this.status.carModelId}, this.customForms.getModelJson()),
        // 添加接口方法名称
        loadServiceFn: 'initTemplate'
      }).then((res: any) => {
        if (res.success) {
          this.message.success(Lang.operateSuccess);
          // 刷新列表
          this.loadDatas();
        }
        else {
          this.message.error(Utils.errorMessageProcessor(res));
        }
      });
    });
  }

  /**
   * 导入Excel模板
   */
  private importExcel() {
    this.operationOpenModal({
      operationModalTitle: '导入模板',
      infoModel: this.status.importModel,
      customForms: this.customForms
    }).close(() => {
      // 重新启用表单模型
      this.enableModel();
      this.customForms.clear();
    }).submit(() => {
      // this.formSubmit({
      //   customForms: this.customForms,
      //   // params: this.customForms.getModelJson(this.status.currentExcelData),
      //   // 文件对象
      //   params: this.status.currentExcelData,

      //   // 添加接口方法名称
      //   loadServiceFn: "UploadTemplate"
      // }).then((res: any) => {
      //   if (res.success) {
      //     this.message.success(Lang.operateSuccess);
      //     // 刷新列表
      //     this.loadDatas();
      //   }
      //   else {
      //     this.message.error(Utils.errorMessageProcessor(res));
      //   }
      // });
    // 上传原生from-data对象
    let formData: FormData = new FormData();
    formData.append('files', this.status.currentExcelData,  this.status.currentExcelData.name);
    this.loadService.UploadTemplate(formData).then((res)=>{
        if (res.success) {
          this.message.success(Lang.operateSuccess);
          // 刷新列表
         this.operationStatus.modal.operationModalStatus = false;
          this.enableModel();
          this.customForms.clear();
          this.loadDatas();
        }
        else {
          this.operationStatus.modal.operationModalStatus = false;
          this.enableModel();
          this.customForms.clear();
          this.message.error(Utils.errorMessageProcessor(res));
        }
     });
    });
  }

  /**
   * 文件上传开始
   * @param uploadStatus 返回数据
   */
  private uploadFileChange(uploadStatus) {
    // 保存文件对象
    this.status.currentExcelData = uploadStatus[0];
    // console.info(this.status.currentExcelData);
    // 开始上传时，禁用表单模型，防止做其他操作
    this.disabledModel(1);
  }

  /**
   * 文件上传成功
   * @param uploadStatus  返回数据
   */
  private uploadFileSuccess(uploadStatus) {
    // 完成后，重新启用表单模型
    this.enableModel();
  }

  /**
   * 在上传中删除正在上传的文件
   * @param data 当前数据模型
   */
  private uploadFileRemove(data) {
    // 重新启用表单模型
    this.enableModel();
  }

  /**
   * 重置树结构
   */
  private resetTree() {
    let resetTipModel = this.status.resetTipModel;
    this.operationOpenModal({
      operationModalTitle: '重置模板',
      infoModel: this.status.templateInfoModel,
      customForms: this.customForms
      // 弹窗渲染完成
    }).rendered(() => {
      // 添加提示描述
      this.customForms.addModelInBefore(resetTipModel);
      // 弹窗关闭
    }).close(() => {
      // 清除提示描述
      this.customForms.restoreAddModel();
      // 弹窗确定按钮触发
    }).submit(() => {
      this.formSubmit({
        customForms: this.customForms,
        params: this.customForms.merge({projectId: this.status.carModelId}, this.customForms.getModelJson()),
        // 添加接口方法名称
        loadServiceFn: 'initTemplate'
      }).then((res: any) => {
        if (res.success) {
          this.message.success("重置模板成功");
          // 刷新列表前清空原节点
          this.status.treeNodes = null;
          // 刷新列表
          this.loadDatas();
          // 清除提示描述
          this.customForms.restoreAddModel();
        }
        else {
          this.message.error(Utils.errorMessageProcessor(res));
        }
      });
    });
  }

  // 添加保存
  private onAddSave(result) {
    let parentNode = result[1];
    if (this.status.currentDirNode) {
      // console.log(this.status.currentDirNode)
      this.status.dirSort = this.status.currentDirNode.children.length + 1
    } else {
      // console.log(this.treeEdit.status.treeNodes)
      this.status.dirSort = this.treeEdit.status.treeNodes.length + 1
    }

    // 添加level
    if (this.status.currentDirNode) {
      console.log(this.status.currentDirNode)
      this.status.dirLevel = this.status.currentDirNode.level + 1
    } else {
      this.status.dirLevel = 0;
    }
    let params = {
      "name": result[0].name,
      "level": this.status.dirLevel,
      "sort": this.status.dirSort,
      type: result[0].type,
      parentId: Lang.rootDirectoryId,
      projectId: this.status.carModelId
    };
    if (parentNode) {
      params['parentId'] = parentNode.key;
    }

    this.loadService.createModelDirectory(params).then((res: any) => {
      if (res.success) {
        // this.install();
        this.message.success(Lang.createSuccess);
      }
      else {
        this.message.error(Utils.errorMessageProcessor(res));
      }
      // 刷新树
      this.treeEdit.refreshTreeNode(res.success, res);
    });

    // this.fileLibService.createFileDirectorys(params).then(res => {
    //   if(res.success){
    //     this.message.success(Lang.createSuccess);
    //   }
    //   else{
    //     this.message.error(Lang.createFail);
    //   }
    //   // 刷新树
    //   this.treeEdit.refreshTreeNode(res.success);
    // });
  }

  // 编辑保存
  private onEditSave(result) {
    let params = {
      "name": result[0].name,
      "level": 0,
      "sort": 0,
      type: result[0].type,
      id: result[1].key,
      parentId: result[1].origin.parentId
    };

    this.loadService.modifyModelDirectory(params).then((res: any) => {
      if (res.success) {
        // this.install();
        this.message.success(Lang.modifySuccess);
      }
      else {
        this.message.error(Utils.errorMessageProcessor(res, Lang.modifyFail));
      }
      // 刷新树
      this.treeEdit.refreshTreeNode(res.success);
    });
  }

  // 删除保存
  private onDeleteSave(result) {
    let params = {id: result.key};
    this.loadService.removeModelDirectory(params).then((res: any) => {
      if (res.success) {
        this.message.success(Lang.deleteSuccess);
        this.status.treeNodes = null;
        this.install();
      }
      else {
        this.message.error(Utils.errorMessageProcessor(res, Lang.deleteFail));
      }
      // 刷新树
      this.treeEdit.refreshTreeNode(res.success);
    });
  }

  // 选中
  private onSelected(node) {
    if (node.origin.type == 2) {
      this.status.btnDisabled = true;
    } else {
      this.status.btnDisabled = false;
    }
    // this.status.uploadFile.uploadBtnStatus = true;
  }

  // 取消选中
  private onUnSelected(node) {
    // console.info(node);
    // this.status.uploadFile.uploadBtnStatus = false;
    this.status.currentDirNode = node;
  }

  // 保存树
  private saveTree() {
    // let treeNodes = this.treeEdit.getTreeNodes();
    // console.info(treeNodes);
  }

  // add 唐华波 ---2019.3.6

  /**
   * 刷新设置结构
   */
  public refresh(){
    this.loadDatas();
  }


}
