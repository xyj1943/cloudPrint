import { Component, OnInit, ViewChild } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NzModalService, NzMessageService
} from 'ng-zorro-antd';
import { OAuthService } from 'angular-oauth2-oidc';

import { Utils, Lang, Status } from '../../../common/helper/util-helper';
import { FetchtokenAccount, FileHost } from '../../../config';
import { ZzjFileUploader } from '@zzj/nag-file-uploader';
import { CustomFormsComponent } from '../../../components/custom-forms/custom-forms.component';
import { MemberManageService } from '../../../services/setting/model-manage.service';
import { DepartmentManageService } from '../../../services/system/department-manage.service';
import { PersonnelManageService } from '../../../services/system/personnel-manage.service';

import { CustomPageOperationComponent } from '../../../components/custom-page-operation/custom-page-operation.component';

@Component({
  selector: 'app-model-manage',
  templateUrl: './model-manage.component.html',
  styleUrls: ['./model-manage.component.scss']
})
export class ModelManageComponent extends CustomPageOperationComponent implements OnInit {

  @ViewChild('customForms') public customForms: CustomFormsComponent;
  @ViewChild('imageUploader') imageUploader: ZzjFileUploader;

  public status = {
    // 数据集合
    dataList: [],
    // 人员信息
    infoModel: [
      // 部门
      {
        value: null, type: 'select', text: '部门', key: 'organizationId', require: true,
        options: []
      },
      // 人员
      {
        value: null, type: 'select', text: '人员', key: 'userId', require: true,
        options: []
      },
      // 人员类型
      {
        value: null, type: 'select', text: '人员类型', key: 'type', require: true,
        options: [
          { value: 1, text: '技术人员' },
          { value: 2, text: '查阅人员' }
        ]
      }
    ],
    carModelId: null,
    // 当前页面所需要的权限
    pagePermissions: [
      'Ele.Project.DeleteModel'
    ],
    // 当前页面权限
    pageAuthorty: { DeleteModel: null }
  };
  // add 唐华波
  // 模型3.0
  public FILEURL = FileHost;
  public imageQueue: any = [];
  public fileStyle: any = { 'display': 'none' };
  // 分页
  public pageIndex = 1;
  public findJson = {
    skipCount: 0, maxResultCount: 10, filter: ''
  };
  public dataSet: any = [];
  public isVisible: boolean = false;
  public name: string = '';
  public appoint: any;
  public pageTotal: number = 1;
  public tool: string = '关联模型';

  public constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    // 公共对象使用public，在CustomPageOperationComponent中会使用
    public message: NzMessageService,
    public mzModal: NzModalService,
    // 当前的Service 必须是public且名称为loadService，在CustomPageOperationComponent中会使用
    public loadService: MemberManageService,
    public departmentLoadService: DepartmentManageService,
    public personnelManageService: PersonnelManageService,
    private oauthService: OAuthService,
  ) {
    super();
  }

  public ngOnInit() {
    this.init();
    this.fetchFlow();
  }

  /**
   * 初始装载
   */
  private install() {
    this.status.carModelId = this.routeInfo.snapshot.queryParams[Status.carModelId];
    // 初始化权限匹配
    this.status.pageAuthorty = this.grantedPermissions(this.status.pagePermissions);
    this.loadData();
  }

  /**
   * 加载列表数据
   */
  public loadData() {
    this.loadDatas({
      // 当前加载参数
      params: {
        // 每页记录数
        maxResultCount: 10
      },
      // 是否是分页列表，并添加默认分页参数
      isPageList: true,
      // 当前加载数据的Service函数
      loadServiceFn: 'queryProjectModelFilesPagedList'
    }).then((res: any) => {
      if (res.success) {
        // 当前列表集合
        this.status.dataList = res.result.items || [];
      }
    });
  }

  /**
   * 删除-确认
   * @param data <any> 删除的数据
   */
  public deleteItem(data: any) {
    this.deleteOperation().submit(() => {
      let params = {
        Id: data.id
      };
      this.loadService.removeProjectModelFile(params).then((res: any) => {
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

  // add 唐华波

  /**
   * 初始化
   */
  public async init() {
    let result = await this.loadService.getModelFile(this.findJson);
    this.dataSet = result.result.items;
    this.pageTotal = result.result.totalCount;
    const id = this.routeInfo.snapshot.queryParams['carModelId'];
    const resultProject = await this.loadService.queryProjectById({ id: id });
    this.dataSet.forEach(element => {
      if (element.url === resultProject.result.modelPath) {
        element.relation = '已关联';
      } else {
        element.relation = '-';
      }
    });

  }

  public async pageIndexChange(index) {
    this.findJson.skipCount = index - 1;
    this.init();
  }

  public async pageSizeChange(index) {
    this.findJson.maxResultCount = index;
    this.init();
  }

  public toThousands(num) {
    return (num || 0).toString().replace(/(\d)(?=(?:\d{3})+$)/g, '$1,');
  }

  /**
  * 关键字搜索
  */
  public searchEvent() {
    // 搜索时重置分页
    this.operationStatus.pager.pageIndex = 1;
    this.init();
  }

  /**
   * 搜索框回车事件
   * @param e <Event>
   */
  public keyupEvent(e: Event) {
    Utils.enter(e, this.searchEvent.bind(this));
  }

  /**
   * 关联项目
   * @param data 
   */
  public async relationProject(data) {
    this.mzModal.confirm({
      nzTitle: '确定关联该模型吗？<br/>关联后已绑定构件数据将被清空。',
      nzOkText: '确定',
      nzOkType: 'danger',
      nzOnOk: async () => {
        const json = {
          modelPath: data.url,
          id: this.routeInfo.snapshot.queryParams['carModelId']
        };
        await this.loadService.relationModel(json);
        this.init()
      },
      nzCancelText: '取消',
      nzOnCancel: () => { }
    });
  }

  /**
   * 上传
   * @param event 
   */
  public async fileChange(event) {
    this.operationStatus.isLoading = true;
    if (event.target.files.length === 0) return;
    this.imageUploader.add(event.target.files[0]);
  }

  // public async fileChange(event){
  //   if (event.target.files.length === 0) return;
  //   let data = new FormData();
  //   data.append('files',event.target.files[0]);
  //   let result = await this.loadService.upLoadFile(data);
  //   console.log(result)
  // }

  /**
  * 文件上传获取Token权限
  */
  private fetchFlow() {
    this.oauthService.fetchTokenUsingPasswordFlow(FetchtokenAccount.myText, FetchtokenAccount.myCode);
  }

  /**
   * 添加文件
   * @param transfer    
   */
  public async fileSuccess(transfer) {
    console.log(transfer)
    let arr = transfer.name.split('.');
    let param = [
      {
        projectId: this.routeInfo.snapshot.queryParams['carModelId'],
        fileId: transfer.fileInfo.id,
        name: arr[0],
        url: transfer.fileInfo.url,
        size: transfer.fileInfo.size,
        extension: '.' + arr[1]
      }
    ]
    console.log('添加模型文件')
    let result = await this.loadService.addModelFile(param);
    console.log(result)
    this.init();
    this.operationStatus.isLoading = false;
  }

  /**
   * 模型解析
   * @param transfer 
   */
  // public async analysisModel(transfer) {
  //   let anaJson = {
  //     id: transfer.fileInfo.id,
  //     name: '测试',
  //     modelGroupId: transfer.fileInfo.id //自动生成，模型组id
  //   }
  //   await this.loadService.editModelFile(anaJson);
  // }

  /**
   * 编辑模型文件
   */
  public editModelFile(data) {
    this.isVisible = true;
    this.appoint = data;
  }

  public handleCancel() {
    this.isVisible = false;
  }

  public async handleOk() {
    if (this.name === '') return;
    this.appoint.name = this.name;
    await this.loadService.editModelFile(this.appoint);
    this.init();
    this.isVisible = false;
  }

  /**
   * 删除模型文件
   */
  public deleteModelFile(data) {
    this.appoint = data;
    this.mzModal.confirm({
      nzTitle: '确认是否删除?',
      nzOkText: '确定',
      nzOkType: 'danger',
      nzOnOk: () => this.delete(),
      nzCancelText: '取消',
      nzOnCancel: () => { }
    });
  }

  public async delete() {
    await this.loadService.deleteModelFile({ id: this.appoint.id });
    this.init();
  }

}
