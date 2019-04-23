import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzModalService, NzMessageService, NzTreeNode } from 'ng-zorro-antd';
import { OAuthService } from 'angular-oauth2-oidc';

import { FileHelper } from '../../common/helper/file-helper';
import { Utils, Lang, Status } from '../../common/helper/util-helper';
import { TreeEditComponent } from '../../components/tree-edit/tree-edit.component';
import { CustomPagerComponent } from '../../components/custom-pager/custom-pager.component';
import { CustomFormsComponent } from '../../components/custom-forms/custom-forms.component';

import { FileLibService } from '../../services/file-lib/file-lib.service';
import { CustomPageOperationComponent } from '../../components/custom-page-operation/custom-page-operation.component';
import { computeStyle } from '../../../../node_modules/@angular/animations/browser/src/util';


declare var CryptoJS: any;
@Component({
  selector: 'app-file-lib',
  templateUrl: './file-lib.component.html',
  styleUrls: ['./file-lib.component.scss']
})

export class FileLibComponent extends CustomPageOperationComponent implements OnInit {
  @ViewChild('customForms') public customForms: CustomFormsComponent;
  @ViewChild('treeEdit') public treeEdit: TreeEditComponent;
  @ViewChild('customPager') public customPager: CustomPagerComponent;
  @ViewChild('previewFrame') public previewFrame;

  public status = {
    // 关键字
    keyword: null,
    // 数据集合
    dataList: [],
    // sort 
    dirSort: 1,
    // level
    dirLevel: 0,
    // 编辑模型
    editModal: [
      { value: null, text: '名称', key: 'name', require: true, maxlength: 50 }
    ],
    // 树形目录数据
    treeNodes: null,
    // treeNodes: [
    //   {
    //     title   : '质量标准文档',
    //     key     : '100',
    //     expanded: false,
    //     children: [
    //       { title: '质量标准文档-0', key: '1000', isLeaf: true },
    //       { title: '质量标准文档-1', key: '1001', isLeaf: true }
    //     ]
    //   },
    //   {
    //     title   : '技术资料',
    //     key     : '101',
    //     children: [
    //       {
    //         title: '零件结构报告', key: '1010',
    //         children: [
    //           { title: '零件结构报告-0', key: '10100', isLeaf: true }
    //         ]
    //       },
    //       { title: '材料渠道报告', key: '1011', isLeaf: true }
    //     ]
    //   }
    // ],
    // 当前选中的目录
    currentDirNode: null,
    // 当前登录用户信息
    userId:Utils.getLocalStorage(Status.userId),
    roleCode:Utils.getLocalStorage(Status.roleCode),
    // 上传文件信息
    uploadFile: {
      // 文件上传按钮状态
      uploadBtnStatus: true,
      // 文件对象
      files: null,
      // 文件名
      fileName: '',
      // 大小限制(单位：KB)
      limitFileSize: 500 * 1024,
      // 文件类型限制(图片、Doc(application/vnd.ms-works,application/msword)、docx(application/vnd.openxmlformats-officedocument.wordprocessingml.document)、Xls(application/vnd.ms-excel)、xlsx(application/vnd.openxmlformats-officedocument.spreadsheetml.sheet)、PDF(application/pdf))
     // limitFileType: 'image/png,image/jpeg,image/gif,image/bmp,application/vnd.ms-works,application/msword,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      limitFileType: 'text/plain,application/x-msdownload',
      limitFileSuffix: 'exe,txt,msi',
      // 参数Form
      formData: undefined,
      isSubmitFile: false,
      fileQueue: [], percent: 0,
      uploadFileTransfer: null,
      uploadModel: [
        {
          value: null, text: '上传文件', type: 'upload-file', key: 'car-file-lib', require: true,
          isShowLabel: false, isCreate: false,
          // 指定上传文件类型(无限制)，和上传文件大小限制（单位：兆(M)）
          limitFileType: 'image|doc|docx|xls|xlsx|pdf', limitFileSize: 500
        },
        { value: '（文件大小请勿超过500M）', type: 'desc', rowType: 'min', isShowLabel: false },
        { value: "", type: 'remark', rowType: 'min', isShowLabel: false }
      ]
    },
    carModelId: null,
    // 预览配置
    preview: {
      isVisible: false,
      title: null,
      data: null,
      width: 1000,
      height: 500,
      url: null
    },
    // 二维码
    qrCode: {
      isVisible: false,
      title: '查看二维码',
      width: 1000,
      data: null
    },
    // 移动文件树形选择
    // treeSelect: {
    //   isVisible: false,
    //   title: '查看二维码',
    //   width: 500,
    //   data: null
    // },
    // 当前页面所需要的权限
    pagePermissions: [
      // 文件目录
      'Ele.FileDirectorys.Create',
      'Ele.FileDirectorys.Delete',
      'Ele.FileDirectorys.Edit',
      // 文件
      'Ele.Files.Edit',
      'Ele.Files.Review',
      'Ele.Files.Delete',
      'Ele.Files.Up',
      'Ele.Files.Down'
    ],
    // 当前页面权限
    pageAuthorty: {
      FileDirectorysCreate: true, FileDirectorysDelete: true, FileDirectorysEdit: true,
      FilesEdit: true, FilesReview: true, FilesDelete: true, FilesUp: true, FilesDown: true
    }
  };
  // actived node
  public activedNode: NzTreeNode;

  //  flag = true;
  // 是否首次加载数据
  //  isfirstload = true;
  //  firstLoadData = [];


  public constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    private oauthService: OAuthService,
    private flService: FileLibService,
    // 公共对象使用public，在CustomPageOperationComponent中会使用
    public message: NzMessageService,
    public mzModal: NzModalService,
    // 当前的Service 必须是public且名称为loadService，在CustomPageOperationComponent中会使用
    public loadService: FileLibService
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
    this.status.pageAuthorty = this.grantedPermissions(this.status.pagePermissions, this.status.pageAuthorty, true);
    // console.info(this.status.pageAuthorty);
    this.status.carModelId = this.routeInfo.snapshot.queryParams[Status.carModelId];
    this.loadData();
  }

  public refreshTree() {
    this.treeEdit.loadData();
  }

  /**
   * 加载绑定资料库文件
   */
  public loadBindDataBase() { }

  /**
   * 列表数据加载
   */
  public loadData() {
    setTimeout(() => {
      let currentDirNode = this.status.currentDirNode;
      this.loadDatas({
        // 当前加载参数
        params: {
          // 当前目录ID
          fileDirectoryId: currentDirNode ? currentDirNode.key : null,
          ProjectId: this.status.carModelId
        },
        // 是否是分页列表，并添加默认分页参数
        isPageList: true,
        // 当前加载数据的Service函数
        loadServiceFn: 'queryFilesPagedList'
      }).then(res => {
        // 当前列表集合
        this.status.dataList = res.result.items || [];
        // 保存刷新页面后第一次初始列表数据
        // if(this.isfirstload){
        //   console.info(this.status.dataList);
        //   this.firstLoadData = this.status.dataList;
        //   this.isfirstload = false;

        // }
      });
    }, 0);
  }

  /**
   * 关键字搜索
   */
  public searchEvent() {
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
   * 列表行mouseover事件
   * @param e <event> Event对象
   * @param idx <number> 数据索引
   */
  public mouseoverRowsEvent(e, idx: number) {
    let dataList = this.status.dataList;
    dataList[idx]['hover'] = 'hover';
  }

  /**
   * 列表行mouseout事件
   * @param e <event> Event对象
   * @param idx <number> 数据索引
   */
  public mouseoutRowsEvent(e, idx: number) {
    let dataList = this.status.dataList;
    dataList[idx]['hover'] = undefined;
  }

  /**
   * 预览文件
   * @param data
   */
  public preview(data: any) {
    // console.info(data);
    // Utils.previewPDF({
    //   url: data.url
    // });

    let preview = this.status.preview;
    preview.data = data;
    preview.title = data.name;
    preview.url = data.url;
    window.open(preview.url + FileHelper.createPwd(), 'top');

    // preview.isVisible = true;
    // console.info(data.url);
    // setTimeout(() => {
    //   this.previewFrame.nativeElement.setAttribute('src', data.url + FileHelper.createPwd());
    // }, 0);
  }

  /**
   * 分享
   */
  public operationShare() {

  }

  public operationDownload() {
    this.download(this.status.preview.data);
  }

  /**
   * 单项删除文件
   * @param data <any> 当前删除数据
   */
  public async deleteFile(data: any) {
    console.log(data)
    if (window.localStorage.getItem('roleName') === 'Admin' || window.localStorage.getItem('roleName') === '项目管理员') {
      this.delete(data)
    }else if(window.localStorage.getItem('roleName') === '技术人员'){
      if(window.localStorage.getItem('userId') === data.creatorUserId){
        this.delete(data)
      }else{
        this.message.warning('技术人员自己只能删除自己上传的文件');
      }
    }
  }

  public delete(data) {
    this.deleteOperation().submit(() => {
      let params = {
        id: [data.id]
      };
      this.flService.removeFiles([data.id]).then((res: any) => {
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
   * 单项编辑文件
   * @param data <any> 当前编辑数据
   */
  public editFile(data: any) {
    this.operationOpenModal({
      operationModalTitle: '编辑文件',
      customForms: this.customForms,
      infoModel: this.status.editModal,
      formData: data
    }).submit(() => {
      this.formSubmit({
        customForms: this.customForms,
        params: this.customForms.merge({ id: data.id }, this.customForms.getModelJson()),
        // 修改接口方法名称
        loadServiceFn: 'modifyFiles'
      }).then(res => {
        if (res.success) {
          this.message.success(Lang.modifySuccess);
          // 刷新列表
          this.loadData();
          // this.treeEdit.loadData()
        }
        else {
          this.message.error(Utils.errorMessageProcessor(res));
        }
      });
    });
  }

  /**
   * 文件上传
   */
  public uploadFile() {
    this.operationOpenModal({
      operationModalTitle: '上传文件',
      customForms: this.customForms,
      infoModel: this.status.uploadFile.uploadModel,
      isShowModalFooter: false
    }).rendered(() => {
      this.customForms.updateModel({ 'car-file-lib': { isCreate: true } });
    }).close(() => {
      this.customForms.updateModel({ 'car-file-lib': { isCreate: false } });
      this.customForms.restoreUpdateModel();
      this.enableModel();
    })
    // .submit(() => {
    // });
  }
  // 文件提交请求
  public fileSub() {
    let currentDirNode = this.status.currentDirNode;
    // 当前上传的文件对象
    let uploadFileTransfer = this.status.uploadFile.uploadFileTransfer;
    let params = null;
    if (uploadFileTransfer) {
      let fileInfo = uploadFileTransfer.fileInfo;
      params = {
        ProjectId: this.status.carModelId,
        "fileDirectoryId": currentDirNode ? currentDirNode.key : Lang.rootDirectoryId,
        "fileId": fileInfo.id,
        "name": uploadFileTransfer.name,
        "url": uploadFileTransfer.url,
        "extension": uploadFileTransfer.type,
        "size": uploadFileTransfer.size
      };
      this.formSubmit({
        params,
        customForms: this.customForms,
        loadServiceFn: 'createFiles'
      }).then((res: any) => {
        if (res.success) {
          this.message.success(Lang.createSuccess);
          // 刷新列表
          this.loadData();
        }
        else {
          this.message.error(Utils.errorMessageProcessor(res));
        }
        this.customForms.restoreUpdateModel();
        this.enableModel();
        this.customForms.updateModel({ 'car-file-lib': { isCreate: false } });
      });
    }
  }

  public uploadFileSuccess(uploadResult) {
    this.status.uploadFile.uploadFileTransfer = uploadResult[0];
    // 选择文件后保存并上传
    this.fileSub();
    // this.customForms
    // 删除文本框和文件上传
    // .deleteModelByKey('car-file-lib');
  }

  /**
   * 批量删除
   */
  public batchDelete() {
    let res = this.toolDoBefore('请先选择删除的文件');
    if (!res) { return; }

    this.deleteOperation().submit((checkedData) => {
      let idGroup = [];
      Utils.resetData(checkedData, (item) => {
        idGroup.push(item.id);
      });
      // let params = {
      //   id: idGroup
      // };
      this.flService.removeFiles(idGroup).then(res => {
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
   * 单项下载
   * @param data
   */
  public download(data) {
    console.info(data);
    FileHelper.download(data.name + data.extension, data.url);
  }

  private toolDoBefore(msg) {
    if (this.status.uploadFile.uploadBtnStatus) {
      let checkDatas = this.getCheckedData();
      if (!checkDatas.length) {
        this.message.warning(msg);
      }
      else {
        return checkDatas;
      }
    }
  }

  /**
   * 批量下载
   */
  public batchDownload() {
    let checkedDatas = this.toolDoBefore('请先选择下载的文件');
    if (!checkedDatas) { return; }
    console.info(checkedDatas);
  }

  /**
   * 移动目录
   */
  public moveGatalog() {
    let checkedDatas = this.toolDoBefore('请先选择文件');
    if (!checkedDatas) { return; }
    console.info(checkedDatas);
  }

  /**
   * 移动文件
   */
  public moveFile() {
    let checkedDatas = this.toolDoBefore('请先选择文件');
    if (!checkedDatas) { return; }
    console.info(checkedDatas);
  }

  /**
   * 生成二维码
   */
  public makeQRCode() {
    let checkedDatas = this.toolDoBefore('请先选择文件');
    if (!checkedDatas) { return; }
    Utils.forEach(checkedDatas, (item) => {
      item.url = item.url + FileHelper.createPwd();
    });
    console.log(checkedDatas)
    this.status.qrCode.data = checkedDatas;
    this.status.qrCode.isVisible = true;
  }

  /**
   * 添加目录
   */
  
  public addCatalog() {
    console.log(this.status.currentDirNode )
    if (this.status.currentDirNode && this.status.currentDirNode.level >= 5) {
      this.message.warning("层级限制，无法继续添加子目录");
      return;
    }
    this.treeEdit.add({ title: '添加目录', nameText: '目录结构' });
  }

  /**
   * 添加保存
   * @param result 当前添加节点
   */
  public onAddSave(result) {
    let parentNode = result[1];

    // 添加sort 
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
      ProjectId: this.status.carModelId,
      "name": result[0].name,
      "level": this.status.dirLevel,
      "sort": this.status.dirSort
    };
    if (parentNode) {
      params['parentId'] = parentNode.key;
    }

    this.loadService.createFileDirectorys(params).then((res: any) => {
      if (res.success) {
        this.message.success(Lang.createSuccess);
      }
      else {
        this.message.error(Utils.errorMessageProcessor(res));
      }


      // 刷新树
      this.treeEdit.refreshTreeNode(res.success, res);
    });
  }

  /**
   * 编辑保存
   * @param result 当前编辑节点
   */
  public onEditSave(result) {
    let params = {
      "name": result[0].name,
      "level": 0,
      "sort": 0,
      id: result[1].key
    };

    this.loadService.modifyFileDirectorys(params).then((res: any) => {
      if (res.success) {
        this.message.success(Lang.modifySuccess);
      }
      else {
        this.message.error(Utils.errorMessageProcessor(res));
      }
      // 刷新树
      this.treeEdit.refreshTreeNode(res.success, res);
    });
  }

  /**
   * 删除保存
   * @param result 当前删除节点
   */
  public onDeleteSave(result) {
    let params = { id: result.key };

    this.loadService.removeFileDirectorys(params).then((res: any) => {
      if (res.success) {
        this.message.success(Lang.deleteSuccess);
      }
      else {
        this.message.error(Utils.errorMessageProcessor(res));
      }
      // 刷新树
      this.treeEdit.refreshTreeNode(res.success);
    });
  }

  /**
   * 选中
   * @param node 当前选中节点
   */
  public onSelected(node) {
    // console.info(node);
    // this.status.uploadFile.uploadBtnStatus = true;
    this.status.currentDirNode = node;
    // 重新加载数据
    this.loadData();
    // this.pageIndexChange(1);
  }

  /**
   * 取消选中
   * @param node 当前取消选中节点
   */
  public onUnSelected(node) {
    // console.info(node);
    // this.status.uploadFile.uploadBtnStatus = false;
    // this.status.currentDirNode = null;
    this.status.currentDirNode = node;
    this.loadData();
  }
  // 选择全部文件
  public showAllFiles() {
    this.status.currentDirNode = null;
    this.loadData();
    let activedNode = document.getElementsByClassName("custom-node")
    for (let i = 0; i < activedNode.length; i++) {
      activedNode[i].className = "custom-node ng-star-inserted";
    }

  }

}
