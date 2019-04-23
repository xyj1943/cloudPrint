import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  NzModalService, NzMessageService,
  NzFormatEmitEvent, NzTreeNode, NzTreeNodeOptions, NzTreeComponent
} from 'ng-zorro-antd';

import { Utils, Lang, Status } from '../../common/helper/util-helper';
import { CustomFormsComponent } from '../../components/custom-forms/custom-forms.component';

import { FileLibService } from '../../services/file-lib/file-lib.service';
import { CustomPageOperationComponent } from '../../components/custom-page-operation/custom-page-operation.component';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'component-tree-edit',
  templateUrl: './tree-edit.component.html',
  styleUrls: ['./tree-edit.component.scss']
})

export class TreeEditComponent extends CustomPageOperationComponent implements OnInit {
  @ViewChild('customForms') customForms: CustomFormsComponent;
  @ViewChild('treeCom') treeCom: NzTreeComponent;

  // 树形节点
  @Input('treeNodes') treeNodes = [];
  // 树节点超出显示省略号
  @Input('nodeItemOverflow') nodeItemOverflow: string = null;
  // 是否允许拖拽
  @Input('isDraggable') isDraggable: boolean = false;
  // 是否允许拖拽
  @Input('isShowType') isShowType: boolean = true;
  // 外部传入的权限
  @Input('InputAuthorty') InputAuthorty: any;
  // 是否默认选中第一项
  @Input('isSelectFirst') isSelectFirst: boolean;
  // add保存事件
  @Output() onAddSave = new EventEmitter<any>();
  // edit保存事件
  @Output() onEditSave = new EventEmitter<any>();
  // delete保存事件
  @Output() onDeleteSave = new EventEmitter<any>();
  // 选中事件
  @Output() onSelected = new EventEmitter<any>();
  // 取消选中事件
  @Output() onUnSelected = new EventEmitter<any>();
  // 数据加载完成事件
  @Output() onLoaded = new EventEmitter<any>();

  status = {
    // 列表加载中状态
    // isLoading: false,
    // 弹出框状态
    // addModalStatus: false,
    submitType: null,
    // nzModalAddTitle: '添加结构',
    // 数据集合
    dataList: [],
    // 结构信息
    infoModal: [
      // 目录类型
      {
        value: 1, text: '目录类型', key: 'type', type: 'radiobox-group', require: true , radioboxGroup: [
          {value: 1, label: '节点'},
          {value: 2, label: '零件'}
        ]
      },
      // 结构名称
      {
        value: null, text: '结构名称', key: 'name', require: true, maxlength: 20
      }
    ],
    // 树形目录数据
    treeNodes: [],
    // 树形目录源数据
    originTreeNodes: null,
    reloadTree: true,
    editNode: null,
    // 刷新树函数
    refreshTreeNodeFn: null,
    carModelId: null,
    // 当前页面所需要的权限
    pagePermissions: [
      'Ele.ModelDirectorys.Create',
      'Ele.ModelDirectorys.Delete',
      'Ele.ModelDirectorys.Edit'
    ],
    // 当前页面权限
    pageAuthorty: {Create: null, Delete: null, Edit: null},
    // 设置默认选中key
    // defaultSelectedKeys: []
  };
  // actived node
  activedNode: any;

  constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    public message: NzMessageService,
    public mzModal: NzModalService,
    public loadService: FileLibService
  ) {
    super()
  }

  activeNode(data: NzFormatEmitEvent): void {
    let result = this.clearActiveNode(data);

    if(!result){
      return;
    }
    data.node.isSelected = true;
    this.activedNode = data.node;
    // add selectedNodeList
    this.treeCom.nzTreeService.setSelectedNodeList(this.activedNode);

    let onSelected = this.onSelected;
    if(onSelected){
      onSelected.emit(this.activedNode);
    }
  }

  clearActiveNode(data) {
    let result = true;
    if(this.activedNode){
      let onUnSelected = this.onUnSelected;
      if(onUnSelected){
        onUnSelected.emit(this.activedNode);
      }

      result = !(this.activedNode.key == data.node.key);
      this.treeCom.nzTreeService.setSelectedNodeList(this.activedNode);
      this.activedNode.isSelected = false;
      this.activedNode = null;
    }

    return result;
  }

  // 编辑
  editCatalog(node){
    this.status.editNode = node;
    this.removeFirstModel();
    this.status.submitType = 'edit';
    this.operationOpenModal({
      operationModalTitle: '编辑目录',
      customForms: this.customForms,
      infoModel: this.status.infoModal,
      formData: node.origin
    }).rendered(() => {
      this.customForms.updateModel({'type': {disabled: true}});
    }).submit(() => {
      let result = this.customForms.verify();
      if (result.status) {
        this.editSave();
      }
    });
  }

  // 编辑保存
  editSave() {
    let infoModal = this.status.infoModal;
    let newNode = infoModal[1] || infoModal[0];
    // let newNode = this.customForms.getModelByKey('name', infoModal)[0];
    let newNodeValue = newNode.value;
    // 禁用表单元素
    this.operationStatus.modelDisabled = true;

    // 重置刷新树函数
    this.status.refreshTreeNodeFn = (flag) => {
      if (flag) {
        this.activedNode = this.activedNode || this.status.editNode;
        this.activedNode.title = newNodeValue;
        let resultNode = this.renderTreeNodes();
        if (resultNode) {
          resultNode['title'] = newNodeValue;
        }
      }
      // 不管成功或失败，重新启用表单元素
      this.operationStatus.modelDisabled = false;
    };

    let onEditSave = this.onEditSave;
    if (onEditSave) {
      let resultData = this.customForms.getModelJsonKey(this.status.infoModal);
      onEditSave.emit([resultData, this.activedNode || this.status.editNode]);
    }
  }

  // 删除
  deleteCatalog(node){
    let eventResultLoadData = null;
    // 重置刷新树函数
    this.status.refreshTreeNodeFn = (flag) => {
      if(flag){
        // 将数据添加到原始数据中，并重新渲染树
        // this.status.reloadTree = false;
        // this.renderTreeNodeToTree((nodeItem) => {
        //   if(nodeItem.key == node.key){
        //     return false;
        //   }
        //   else{
        //     return () => {
        //       this.status.reloadTree = true;
        //     }
        //   }
        // });
        if(!this.treeNodes){
          this.loadData();
        }
      }
      // 不管成功或失败，重新启用表单元素
      this.operationStatus.modelDisabled = false;
    };
    this.deleteOperation().submit(() => {
      let onDeleteSave = this.onDeleteSave;
      if(onDeleteSave){
        onDeleteSave.emit(node);
      }
    });
  }

  ngOnInit() {
    // 初始化权限匹配
    this.status.pageAuthorty = this.InputAuthorty || this.grantedPermissions(this.status.pagePermissions, this.status.pageAuthorty);
    // console.info(this.status.pageAuthorty);
    this.status.carModelId = this.routeInfo.snapshot.queryParams[Status.carModelId];
    // console.info(this.status.carModelId)
    this.install();
  }

  // 初始装载
  private install() {
    if (this.treeNodes) {
      this.status.treeNodes = this.treeNodes;
    }
    else {
      this.loadData();
    }
  }

  public resetTreeNode (treeNodes) {
    if (treeNodes) {
      this.status.treeNodes = treeNodes;
    }
  }

  // 加载数据
  public loadData() {
    this.loadDatas({
      // 当前加载参数
      params: {
        ProjectId: this.status.carModelId,
        // 每页记录数
        maxResultCount: 1000
      },
      // 当前加载数据的Service函数
      loadServiceFn: 'queryFileDirectorysPagedList'
    }).then(res => {
      if(this.onLoaded){
        this.onLoaded.emit(res);
      }
      if(res.success){
        let treeNodes = res.result.items;
        // 保存源数据
        // this.status.originTreeNodes = [];
        // Utils.resetData(res.result.items, (item) => {
        //   let temp = {};
        //   for(let key in item){
        //     temp[key] = item[key];
        //   }
        //   this.status.originTreeNodes.push(temp);
        // });
        // this.status.originTreeNodes = res.result.items;
        if(treeNodes.length){
          // 用于保存所有节点对象，以节点id作为key，以便直接查找子节点
          this.renderTreeNodeToTree(treeNodes);
        }

      }
    });
  }
   
  private renderTreeNodeToTree(treeNodes, callBack?) {
    if(typeof(treeNodes) == 'function'){
      callBack = treeNodes;
      treeNodes = undefined;
    }
    treeNodes = treeNodes || this.status.originTreeNodes;
    let treeNodeAll = {}, lastCallBack;
    Utils.asyncEach(treeNodes, (dataItem, idx) => {
      if(callBack){
        let cbResult = callBack(dataItem, idx);
        if(cbResult == false){
          return;
        }
        else if(typeof(cbResult) == 'function' && !lastCallBack){
          lastCallBack = cbResult;
        }
      }
      dataItem.isLeaf = true;
      dataItem.title = dataItem.name;
      dataItem.key = dataItem.id;
      treeNodeAll[dataItem.id] = dataItem;
    }, () => {
      this.status.treeNodes = Utils.renderTreeNode(treeNodeAll);
      // 是否需要设置默认选中
      if (this.isSelectFirst && this.status.treeNodes.length != 0) {
        setTimeout(() => {
          // 设置默认目录为默认选中项
          // console.info(this.status.treeNodes)
          this.activedNode = { key: this.status.treeNodes[0].key || {}};
          let onSelected = this.onSelected;
          if(onSelected){
            onSelected.emit(this.activedNode);
          }
        }, 0);
      }
      if(lastCallBack){
        lastCallBack();
      }
    });
  }

  // 关闭弹出框
  private closeModal(type, status?){
    status = status || this.status;
    status[type] = false;
    // 清空数据
    this.customForms.clear();
  }

  public removeFirstModel(options?) {
    if(this.isShowType == false){
      let infoModel = this.status.infoModal;
      let tempModel = [];
      Utils.resetData(infoModel, (item, idx) => {
        if(item.key != 'type'){
          tempModel.push(item);
        }
      });
      if (options) {
        if (options.nameText) {
          tempModel[0].text = options.nameText;
        }
      }
      this.status.infoModal = tempModel;
    }
  }

  // 添加
  public add(options?: any) {
    this.removeFirstModel(options);
    this.status.submitType = 'add';
    this.operationOpenModal({
      operationModalTitle: (options || {}).title || '添加结构',
      customForms: this.customForms,
      infoModel: this.status.infoModal
    }).rendered(() => {
      this.customForms.updateModel({'type': {disabled: false}});
    }).submit(() => {
      let result = this.customForms.verify();
      if (result.status) {
        this.addSave();
      }
    });
  }

  // 向原始树结构中添加子节点，保证刷新树时或者提交树结构数据时可以直接使用原始数据(可以不使用组件重新组装后的数据)
  public renderTreeNodes(addNode?) {
    // 原始树结构数据
    let treeNodes = this.status.treeNodes;
    // 当前需要添加子节点的节点
    let activedNode = this.activedNode;
    // 返回匹配到的原始数据节点
    let resultNode;
    let eachNodes = (eachNode) => {
      let i = 0, len = eachNode.length, node;
      for(;i<len;i++){
        node = eachNode[i];
        if(node.key == activedNode.key){
          if(addNode){
            // 展开(显示新增的子节点)
            node['expanded'] = true;
            node['isExpanded'] = true;
            // 因为添加了子节点，isLeaf设置为false(是否为最后一个节点：false)
            node['isLeaf'] = false;
            node.children = node.children || [];
            node.children.push(addNode);
          }
          resultNode = node;
          // 当查找到后就停止继续遍历
          break;
        }
        if(node.children){
          // 如果有子节点，递归继续查找
          eachNodes(node.children);
        }
      }
    }
    eachNodes(treeNodes);

    return resultNode;
  }

  // 添加保存
  public addSave() {
    let infoModal = this.status.infoModal;
    // let newNode = this.customForms.getModelByKey('name', infoModal)[0];
    let newNode = infoModal[1] || infoModal[0];
    let value = newNode.value;
    // 禁用表单元素
    this.operationStatus.modelDisabled = true;
    // 当前选中节点
    let activedNode = this.activedNode;
    if (activedNode) {
      // 在当前选中节点下添加

      // 展开(显示新增的子节点)
      activedNode['expanded'] = true;
      activedNode['isExpanded'] = true;
      // 因为添加了子节点，isLeaf设置为false(是否为最后一个节点：false)
      activedNode['isLeaf'] = false;

      // 重置刷新树函数
      this.status.refreshTreeNodeFn = (flag, result?) => {
        if(flag){
          let nodeData = {name: value, type: infoModal[0].value, title: value, key: result ? result.result : '', isLeaf: true};
          // 将新增项添加到原始数据中，用于添加根目录时重新渲染树时用
          this.renderTreeNodes(nodeData);
          // 添加子节点
          activedNode.addChildren([nodeData]);
        }
        // 不管成功或失败，重新启用表单元素
        this.operationStatus.modelDisabled = false;
      };
    }
    else {
      // 重置刷新树函数
      this.status.refreshTreeNodeFn = (flag, result?) => {
        if (flag) {
          // 添加跟节点，将数据添加到原始数据中，并重新渲染树
          this.status.reloadTree = false;
          let type = infoModal[0].value ;
          setTimeout(() => {
            this.status.treeNodes.push({name: value, type, title: value, key: result ? result.result : '', isLeaf: true, children: null});
            this.status.reloadTree = true;
            console.log(this.status.treeNodes)
          }, 0);
        }
        // 不管成功或失败，重新启用表单元素
        this.operationStatus.modelDisabled = false;
      };
    }
    let onAddSave = this.onAddSave;
    if (onAddSave) {
      let resultData = this.customForms.getModelJsonKey(this.status.infoModal);
      onAddSave.emit([resultData, activedNode]);
    }
  }

  /**
   * 刷新树形结构目录
   */
  public refreshTreeNode(flag, res?) {
    let refreshTreeNodeFn = this.status.refreshTreeNodeFn.bind(this);
    if (refreshTreeNodeFn) {
      refreshTreeNodeFn(flag, res);
    }
    // 关闭弹出框，并清空数据
    this.closeModal('operationModalStatus', this.operationStatus.modal);
  }

  // 提交信息
  public submitSure() {
    let result = this.customForms.verify();
    if(result.status){
      if(this.status.submitType == 'add'){
        // 添加
        this.addSave();
      }
      else if(this.status.submitType == 'edit'){
        // 编辑
        this.editSave();
      }
    }
  }

  // 保存树
  public saveTree() {
    let treeNodes = this.treeCom.getTreeNodes();
    console.info(treeNodes);
  }

  public getTreeNodes() {
    return this.treeCom.getTreeNodes();
  }
}
