import { Component, OnInit, ViewChild, ElementRef } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { NzModalService, NzMessageService } from "ng-zorro-antd";

import {
  Utils,
  Lang,
  Status,
  KeyCodeEvent
} from "../../common/helper/util-helper";
import { CustomFormsComponent } from "../../components/custom-forms/custom-forms.component";
import { CustomPagerComponent } from "../../components/custom-pager/custom-pager.component";
import { ImgTextListComponent } from "../../components/imgtext-list/imgtext-list.component";

import { CarTypeService } from "../../services/car-type/car-type.service";
import { CustomPageOperationComponent } from "../../components/custom-page-operation/custom-page-operation.component";
// import { type } from 'os';

@Component({
  selector: "app-car-type",
  templateUrl: "./car-type.component.html",
  styleUrls: ["./car-type.component.scss"]
})
export class CarTypeComponent extends CustomPageOperationComponent
  implements OnInit {
  @ViewChild("customForms") public customForms: CustomFormsComponent;
  @ViewChild("customFormsByTypeInfo")
  public customFormsByTypeInfo: CustomFormsComponent;
  @ViewChild("customPager") public customPager: CustomPagerComponent;
  @ViewChild("imgtextList") public imgtextList: ImgTextListComponent;

  public status = {
    // 新建、修改车型信息表单数据
    typeInfoModal: [
      {
        value: null,
        text: "车型名称",
        key: "name",
        require: true,
        maxlength: 32
      },
      {
        value: null,
        text: "车型编号",
        key: "code",
        require: true,
        maxlength: 32
      },
      {
        value: null,
        text: "车型级别",
        type: "select-groups",
        key: "level",
        require: true,
        rowType: "column-row-2",
        placeholder: "车型级别",
        groups: Status.carLevel
        // [
        //   {value: 1, text: '轿车'},
        //   {value: 2, text: 'SUV'},
        //   {value: 3, text: 'MVP'}
        // ]
      },
      {
        value: null,
        text: "整车结构",
        type: "select",
        key: "structure",
        require: true,
        rowType: "column-row-2 right",
        placeholder: "整车结构",
        options: [{ value: 1, text: "承载式" }, { value: 2, text: "非承载式" }]
      },
      {
        value: null,
        text: "燃油类型",
        type: "select",
        key: "category",
        require: true,
        rowType: "column-row-2",
        placeholder: "燃油类型",
        options: Status.carCategory
        // [
        //   {value: 0, text: '汽油'},
        //   {value: 1, text: '柴油'},
        //   {value: 2, text: '充电'},
        //   {value: 3, text: '油电混合'}
        // ]
      },
      {
        value: null,
        text: "SOP时间",
        type: "date-month",
        key: "sopTime",
        rowType: "column-row-2 right",
        placeholder: "SOP时间",
        require: true
      },
      { value: null, text: "车型厂家", key: "companyName", maxlength: 32 },
      {
        value: null,
        text: "车型照片",
        type: "upload-image",
        key: "url",
        rowType: "static",
        isCreate: false,
        // require: true,
        // 指定上传文件类型，和上传文件大小限制（单位：兆(M)）
        limitFileType: "image",
        limitFileSize: 10
      }
    ],
    // isCreateForm: false,

    // 是否为模板
    isTemplate: null,

    // 赛选条件模型
    filterModal: [
      {
        value: null,
        text: "车型级别",
        type: "select-groups",
        key: "level",
        groups: Status.carLevel
      },
      {
        value: null,
        text: "燃油类型",
        type: "select",
        key: "category",
        options: Status.carCategory
        // [
        //   {value: 1, text: '汽油'},
        //   {value: 2, text: '柴油'},
        //   {value: 3, text: '充电'},
        //   {value: 4, text: '油电混合'}
        // ]
      },
      {
        value: null,
        text: "车型结构",
        type: "select",
        key: "structure",
        options: [{ value: 1, text: "承载式" }, { value: 2, text: "非承载式" }]
      },
      {
        value: null,
        text: "是否模板",
        key: "isTemplate",
        type: "radiobox-group",
        require: false,
        radioboxGroup: [
          { value: true, label: "是" },
          { value: false, label: "否" }
        ]
      }
      // {
      //   value: null, text: '用途', type: 'select', key: 'purpose', options: [
      //     {value: '001', text: '家用'}
      //   ]
      // },
      // {
      //   value: null, text: '生产厂商', type: 'select', key: 'vendor', options: []
      // },
      // {
      //   value: null, text: '其他参数', type: 'select', key: 'other', options: [
      //     {value: '001', text: '其他'}
      //   ]
      // }
    ],
    // 图文列表
    imgTextList: [
      // { thumb: '缩略图', title: '标题', number: '编号', time: 'time' },
    ],
    // 图文列表操作工具
    tools: [
      { type: "pushpin", text: "模板", isActive: null },
      { type: "form", key: "Edit", text: "编辑" },
      { type: "delete", key: "Delete", text: "删除" }
    ],
    // 当前页面所需要的权限
    pagePermissions: [
      "Ele.Project.Create",
      "Ele.Project.Delete",
      "Ele.Project.Edit"
    ],
    // 当前页面权限
    pageAuthorty: { Create: null, Delete: null, Edit: null }
  };

  public constructor(
    private routeInfo: ActivatedRoute,
    private router: Router,
    // 公共对象使用public，在CustomPageOperationComponent中会使用
    public message: NzMessageService,
    public mzModal: NzModalService,
    // 当前的Service 必须是public且名称为loadService，在CustomPageOperationComponent中会使用
    public loadService: CarTypeService,
    public elemRef: ElementRef
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
    // console.info(this.status.pageAuthorty);
    let tools = this.status.tools;
    let temp = [];
    Utils.forEach(tools, (tool) => {
      if (this.status.pageAuthorty[tool.key] || tool.key == undefined) {
        temp.push(tool);
      }
    });
    this.status.tools = temp;
    this.loadData();
  }

  /**
   * 加载列表数据
   */
  private loadData() {
    let filterModalJson = this.customForms.getModelJsonKey(
      this.status.filterModal,
      false
    );
    let loadParams = {
      maxResultCount: 8
    };
    this.loadDatas({
      // 当前加载参数
      params: this.customForms.merge(loadParams, filterModalJson),
      // 是否是分页列表，并添加默认分页参数
      isPageList: true,
      // 当前加载数据的Service函数
      loadServiceFn: "queryProjectPagedList"
    }).then((res: any) => {
      if (res.success) {
        // 当前列表集合
        this.status.imgTextList = res.result.items || [];
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
   * 筛选
   */
  public filterEvent() {
    this.loadData();
  }

  /**
   * 重置筛选条件
   */
  public resetEvent() {
    this.customForms.clear();
    this.loadData();
  }

  /**
   * 工具点击事件
   * @param res <any> 当前点击项返回数据
   */
  public toolsClickEvent(res: any) {
    let tool = res.tool;
    let data = res.data;
    console.log(tool);
    console.log(data);
    if (tool.type == "form") {
      // 编辑
      this.operationOpenModal({
        operationModalTitle: "修改车型",
        infoModel: this.status.typeInfoModal,
        customForms: this.customFormsByTypeInfo,
        formData: data
      })
        .rendered(() => {
          this.customFormsByTypeInfo.updateModel({ url: { isCreate: true } });
        })
        .close(() => {
          this.customFormsByTypeInfo.restoreUpdateModel();
          this.enableModel();
        })
        .submit(() => {
          this.formSubmit({
            customForms: this.customFormsByTypeInfo,
            params: this.customFormsByTypeInfo.merge(
              {
                weight: 0,
                fuelConsumptionOf100Kilometer: 0,
                zeroTO100AccelerationCapability: 0,
                maximumSpeed: 0,
                maximumGradeability: 0,
                engineDescription: "string",
                gearboxDescription: "string",
                partCount: 0,
                id: data.id
              },
              this.customFormsByTypeInfo.getModelJson()
            ),
            // 修改接口方法名称
            loadServiceFn: "modifyFileDirectorys"
          }).then((res: any) => {
            if (res.success) {
              this.message.success(Lang.modifySuccess);
              // 刷新列表
              this.loadData();
            } else {
              this.message.error(Utils.errorMessageProcessor(res));
            }
          });
        });
    } else if (tool.type == "delete") {
      // 删除
      this.deleteOperation().submit(() => {
        let params = {
          Id: data.id
        };
        this.loadService.removeProject(params).then((res: any) => {
          if (res.success) {
            this.message.success(Lang.deleteSuccess);
            // 刷新列表
            this.loadData();
          } else {
            this.message.error(Utils.errorMessageProcessor(res));
          }
        });
      });
    } else if (tool.type == "pushpin") {
      if (!data.isTemplate) {
        // 标记为模板
        let params = {
          isTemplate: true,
          id: data.id
        };
        this.loadService.markAsTemplate(params).then((res: any) => {
          if (res.success) {
            data.isTemplate = true;
            // tool.text = "取消标记";
            this.message.success(Lang.operateSuccess);
          } else {
            this.message.error(Utils.errorMessageProcessor(res));
          }
        });
      } else {
        // 取消模板
        let params = {
          isTemplate: false,
          id: data.id
        };
        this.loadService.markAsTemplate(params).then((res: any) => {
          if (res.success) {
            data.isTemplate = false;
            // tool.text = "标记为模板";
            this.message.success(Lang.operateSuccess);
          } else {
            this.message.error(Utils.errorMessageProcessor(res));
          }
        });
      }
    }
  }

  /**
   * 新建车型
   */
  public newCarType() {
    this.operationOpenModal({
      operationModalTitle: "新建车型",
      infoModel: this.status.typeInfoModal,
      customForms: this.customFormsByTypeInfo
    })
      .rendered(() => {
        this.customFormsByTypeInfo.updateModel({ url: { isCreate: true } });
      })
      .close(() => {
        this.customFormsByTypeInfo.restoreUpdateModel();
        this.enableModel();
      })
      .submit(() => {
        // {
        //   "name": "string",
        //   "code": "string",
        //   "level": 0,
        //   "structure": 0,
        //   "category": 0,
        //   "url": "string",
        //   "companyId": "string",
        //   "sopTime": "2019-02-11T03:51:11.493Z",
        //   "weight": 0,
        //   "fuelConsumptionOf100Kilometer": 0,
        //   "zeroTO100AccelerationCapability": 0,
        //   "maximumSpeed": 0,
        //   "maximumGradeability": 0,
        //   "engineDescription": "string",
        //   "gearboxDescription": "string",
        //   "partCount": 0,
        //   "categoryId": "string",
        //   "date": "2019-02-11T03:51:11.493Z",
        //   "id": "string"
        // }
        this.formSubmit({
          customForms: this.customFormsByTypeInfo,
          params: this.customFormsByTypeInfo.merge(
            {
              weight: 0,
              fuelConsumptionOf100Kilometer: 0,
              zeroTO100AccelerationCapability: 0,
              maximumSpeed: 0,
              maximumGradeability: 0,
              engineDescription: "string",
              gearboxDescription: "string",
              partCount: 0,
              initTree: true
            },
            this.customFormsByTypeInfo.getModelJson()
          ),
          // 添加接口方法名称
          loadServiceFn: "createFileDirectorys"
        }).then((res: any) => {
          if (res.success) {
            this.message.success(Lang.createSuccess);
            // 刷新列表
            this.loadData();
          } else {
            this.message.error(Utils.errorMessageProcessor(res));
          }
        });
      });
  }

  /**
   * 文件上传开始
   * @param uploadStatus 返回数据
   */
  public uploadFileChange(uploadStatus) {
    // console.info(uploadStatus);
    // 开始上传时，禁用表单模型，防止做其他操作
    this.disabledModel(1);
  }

  /**
   * 文件上传成功
   * @param uploadStatus  返回数据
   */
  public uploadFileSuccess(uploadStatus) {
    // 完成后，重新启用表单模型
    this.enableModel();
    let uploadFile = uploadStatus[0];
    this.customFormsByTypeInfo.updateModel({ url: { value: uploadFile.url } });
  }

  /**
   * 上传失败
   * @param error
   */
  public uploadFileFail(error) {
    this.enableModel();
  }
}
