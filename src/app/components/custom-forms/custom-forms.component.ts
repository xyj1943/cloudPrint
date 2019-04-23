/**
 * 自定义数据模型操作
 * @author AndyPan
 * @createdate 2019年1月2日16:19:14
 * @version 1.0.2
 * @remark 所有对组件数据的操作，均继承至CustomModelComponent
 */

import { Component, OnInit, ViewChild, Input, ElementRef, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { NzModalService, NzMessageService } from 'ng-zorro-antd';
import { OAuthService } from 'angular-oauth2-oidc';

import { FetchtokenAccount, FileHost } from '../../config';
import { Utils, Lang, Status } from '../../common/helper/util-helper';
import { CustomModelComponent } from '../custom-model/custom-model.component';

import { ZzjFileUploader } from '@zzj/nag-file-uploader';

declare var CryptoJS: any;
@Component({
  selector: 'components-custom-forms',
  templateUrl: './custom-forms.component.html',
  styleUrls: ['./custom-forms.component.scss']
})
export class CustomFormsComponent extends CustomModelComponent implements OnInit {
  @ViewChild('fileUploader') private fileUploader: ZzjFileUploader;

  // 自定义表单数据
  /**
   * 格式模型：Array[JSON{}]
   * [
   *    {
   *      value: '默认值', text: '文字', key: 'key值，唯一标识，非必填，会自动生成', require: '是否必填，true|false', placeholder: '自定义placeholder文本',
   *      defaultTip: '在验证错误时是否使用默认的提示，true|false', verifyType: '验证类型字符串，多个时以","隔开，也可以使用verifyTypeAry属性传入数组',
   *      verifyTypeAry: '验证类型集合，单个时也可使用verifyType，两者只有一个有效，两者同时传入时，verifyTypeAry优先级高于verifyType',
   *      type: '表单元素类型，默认问input(即文本框)，主要包括(input、password、select、textarea、checkbox-group、radiobox-group、select-group...)'
   *      options: '当type为select时，需要传入下拉选项集合，即：[{value: '值', text: '文本'}, ...]',
   *      customVerify: '自定义验证，可以是正则表达式，也可以是函数，
   *                    如果是函数，会将当前只作为参数提供给函数使用，返回格式为(如果不使用默认提示，至少需要返回状态status)：{status: '验证结果(true/false)'， message: '错误提示消息'})
   *                    如果是正则，可以提供errorMsg自定义错误提示消息，也可不提供，默认为[***(该项的text属性)格式不正确]'
   *      requireIconType: 'static, 让必填红点跟随文本框后面，去除定位'
   *      rowType: 'static, 让行高自动增长，比如textarea的行比input行要高，所以需要设置自动增长'
   *      checkboxGroup: 多选框集合：[{value: '值', label: '文本', key: '键', checked: '是否选中，boolean'}],
   *      radioboxGroup: 单选框集合：[{value: '值', label: '文本', key: '键'}]
   *      groupOptions: '当type为select-group时，需要传入下拉选项集合，即：[[{同上面options一样}],[{同上面options一样}]]'
   *    }
   * ]
   */
  @Input('formData') public modelData: any = [];
  // 自定义Class
  @Input('className') public className: string;
  // 表单验证默认提示
  @Input('defaultTip') public defaultTip: any = true;
  // 禁用表单元素(在提交表单时触发元素禁用效果，提交完成后解除禁用)
  @Input('disabledForm') public disabledForm: boolean;
  // 验证类型(verifyType)分隔符
  @Input('verifySeparator') public verifySeparator: any = ',';
  // 是否显示label
  @Input('isShowLabel') public isShowLabel: boolean;
  // label自动宽度
  @Input("isLabelAuto") public isLabelAuto: boolean;
  // 每一行的上下间距(默认为15px，min：为5px)
  @Input('rowSpace') public rowSpace: string;
  // 文字颜色主题(默认为黑色文字，如果容器背景为黑色，则可设置主题为白色：white)，也可通过自定义Class自行设置字体颜色或其他样式
  @Input('fontColorTheme') public fontColorTheme: string;
  // 是否渲染form元素，默认是渲染的，当custom-form组件的form样式无法满足你的需求时，可以自己布局表单样式，然后将数据与组件共同使用但在组件中不渲染表单，只做数据验证，可以设置该属性为false
  // 注意：这样使用后，操作数据不能更新原视图，需要通过组件获取组件的数据模型去替换原数据模型
  @Input("isRenderForm") public isRenderForm: boolean;
  // 文件上传host
  @Input('fileHost') public fileHost: string = FileHost;
  // onEntryCallBack
  @Output() public onEntryCallBack = new EventEmitter<any>();
  // 下拉改变事件
  @Output() public onSelectChange = new EventEmitter<any>();
  // 上传文件选择事件
  @Output() public onUploadFileChange = new EventEmitter<any>();
  // 上传开始事件
  @Output() public onUploadFileStart = new EventEmitter<any>();
  // 上传成功事件
  @Output() public onUploadFileSuccess = new EventEmitter<any>();
  // 上传中的文件删除事件
  @Output() public onUploadFileRemove = new EventEmitter<any>();
  // 上传失败事件
  @Output() public onUploadFileFail = new EventEmitter<any>();

  public status = {
    // 是否做文件上传服务认证（当有文件上传功能的Form元素时，会自动做服务认证）
    isFetchFlow: false,
    // 内置验证类型
    verifyType: {
      // key(类型名称): {reg: '正则或函数对象', error: '错误提示'}
      email: {
        reg: (value) => {
          return value && value.indexOf('@') > -1 ? true : false;
        },
        error: '邮箱格式不正确'
      },
      // 普通模式的手机号验证，只要是数字，并且11位（避免测试输入麻烦，或应对多变的任意手机号码）
      phone: {
        reg: (value) => {
          return (/^(-)?\d+(\.\d+)?$/.exec(value) == null || value == "" || value.length != 11) ? false : true;
        },
        error: '手机格式不正确'
      },
      // 特殊字符
      specialCharacter: {
        reg: (value) => {
          let pattern = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]");
          return pattern.test(value) ? false : true;
        },
        error: '格式不符合要求，不能包含特殊字符'
      },
      // 严格模式的邮箱验证 key(类型名称): {reg: '正则或函数对象', error: '错误提示'}
      emailStrict: {reg: /^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$/, error: '邮箱格式不正确'},
      // 严格模式的手机号验证
      phoneStrict: {reg: /^(0|86|17951)?(13[0-9]|15[012356789]|17[0-9]|18[0-9]|14[57])[0-9]{8}$/, error: '手机格式不正确'}
      // testFn: {reg: (value) => { return value == 'testFn' ? true : false; }, error: 'fn verify error'}
    },
    // upload image
    uploadImageData: null,
    // 上传的文件流保存对象
    flowFiles: [],
    // 保存新增属性，用于还原属性
    addNewAttribute: {},
    // 保存修改type为text的数据，用于还原
    textAttribute: {},
    // 保存新增项，用于还原数据
    newItem: {},
    // 保存删除项，用于还原
    deleteItem: {},
    // 保存临时FormData对象
    tempFormData: {},
    // 保存下拉输入框的下拉框显示
    selectvalue: {},
    // 文件类型
    limitFileType: {
      image: {
        'image/png': true, 'image/jpeg': true, 'image/jpg': true, 'image/gif': true, 'image/bmp': true
      },
      doc: {
        'application/vnd.ms-works': true, 'application/msword': true
      },
      docx: {
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true
      },
      xls: {
        'application/vnd.ms-excel': true
      },
      xlsx: {
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true
      },
      pdf: {
        'application/pdf': true
      }
    }
  };

  public constructor(
    private routeInfo: ActivatedRoute,
    private message: NzMessageService,
    private oauthService: OAuthService,
    private mzModal: NzModalService,
    private router: Router,
    public elemRef: ElementRef
  ) {
    super();
  }

  /**
   * 第一次初始化
   */
  public ngOnInit() {
    this.install();
  }

  /**
   * 当数据绑定输入属性的值发生变化时调用
   */
  private ngOnChanges () {
    this.install();
  }

  /**
   * 初始装载
   */
  private install() {
    // 确保每一项FormItem都有key，会被自动执行，以便在一些操作中需要key时有值
    this.makeModelItemKey((item) => {
      if ((item.type == 'upload-image' || item.type == 'upload-file' || item.type == 'upload-file-progress') && !this.status.isFetchFlow) {
        this.status.isFetchFlow = true;
      }
    });
    this.fetchFlow();
    // 先将是否包含(排除的)类型转换成JSON键值对
    this.renderExcludeType();
  }

  /**
   * 文件上传选择事件
   * @param event 事件对象
   * @param data 返回的数据
   */
  public uploadFileChange(event: any, data?: any) {
    let thisData = data || {};
    let e = event || window.event;
    let target = e.target || e.srcElement;
    let file = target.files[0];

    // 检查文件类型和大小
    let checkState = this.checkFilesTypeAndSize(file, thisData);
    if (checkState == false) {
      return;
    }

    target.result = null;
    this.status.uploadImageData = thisData;
    thisData.value = file.name;
    thisData.file = file;

    // 添加文件到上传组件
    this.fileUploader.add(file);

    if (this.onUploadFileChange) {
      this.onUploadFileChange.emit([file, thisData]);
    }
  }

  /**
   * 检查文件类型和大小
   * @param file <any> 文件对象
   */
  public checkFilesTypeAndSize(file: any, data: any) {
    if (data) {
      let resultState;
      // 限制的文件类型
      let fileLimit = data.limitFileType || '';
      // 限制的文件大小，单位为兆'M'
      let fileSize = data.limitFileSize;

      fileLimit = fileLimit.split('|');
      let limitFileType = this.status.limitFileType;
      let num = 1024;
      let size = parseFloat(((file.size / num) / num) + '').toFixed(2);
      let type = file.type;
      let i = 0;
      let len = fileLimit.length;
      let limitItem;
      let limitType;
      // 检测文件类型
      console.log(type)
      for (; i < len; i++) {
        limitItem = fileLimit[i];
        limitType = limitFileType[limitItem];
        if (limitType) {
          console.log(limitType)
          if (!limitType[type]) {
            console.log(limitType[type])
            // this.message.warning('上传文件类型与指定允许上传文件类型不相符');
            // this.message.warning('请上传文件正确类型的' + limitItem + '文件');
            resultState = false;
          }else{
            resultState = true;
            return ;
          }
        }
      }
      if(!resultState){
        this.message.warning('上传文件类型与指定允许上传文件类型不相符');
      }
      console.log(resultState)
      if (resultState != false) {
        // 检测文件大小
        if (fileSize) {
          if (size > fileSize) {
            // this.message.warning('上传文件大小超过指定允许上传文件大小最大值('+fileSize+' M)');
            this.message.warning('上传文件大小限制为：' + fileSize + ' M');
            resultState = false;
          }
        }
      }

      return resultState;
    }
  }
  /**
   * 文件开始上传
   * @param transfer
   */
  public fileUploadStart(transfer: any, data: any) {
    // 上传进度
    data.progress = transfer.percent || 0;
    // 上传开始事件
    if (this.onUploadFileStart) {
      this.onUploadFileStart.emit([transfer, data]);
    }
  }

  /**
   * 文件上传成功
   * @param transfer 文件流模型对象
   */
  public fileUploadSuccess(transfer: any, data: any) {
    this.status.uploadImageData['value'] = transfer.name;
    // 上传进度
    data.progress = transfer.percent || 100;
    // 文件路径
    data.path = transfer.url.replace(/#/ig, '%23');
    // 文件对象
    data.file = transfer.fileInfo;
    // 上传成功事件
    if (this.onUploadFileSuccess) {
      this.onUploadFileSuccess.emit([transfer, data]);
    }
  }

  /**
   * 文件上传失败
   * @param error
   */
  private fileUploadFail(error) {
    if (this.onUploadFileFail) {
      this.onUploadFileFail.emit(error);
    }
  }

  /**
   * 在上传中删除正在上传的文件
   * @param data 当前数据模型
   */
  private removeFile(data) {
    data.value = null;
    data.progress = 0;
    data.path = null;
    if (this.onUploadFileRemove) {
      this.onUploadFileRemove.emit(data);
    }
    this.fileUploader.remove(data.file);
  }

  /**
   * 文件上传获取Token权限
   */
  private fetchFlow() {
    if (this.status.isFetchFlow) {
      // let myCodeTrans = CryptoJS.MD5('117c1aa7-c9bc-4c47-ad3f-653608fdcA15').toString().toUpperCase();
      // console.info(myCodeTrans);
      this.oauthService.fetchTokenUsingPasswordFlow(FetchtokenAccount.myText, FetchtokenAccount.myCode);
    }
  }

  /**
   * 获取第一个可设置focus的项
   * @returns 当前focus的数据Item
   */
  private getFirstFocusTarget() {
    let modelData = this.modelData;
    let i = 0;
    let len = modelData.length;
    let item: any = null;
    let result = null;
    for (; i < len; i++) {
      item = modelData[i];
      if (!this.isExcludeType(item.type)) {
        result = item;
        break;
      }
    }
    return result;
  }

  /**
   * 通过元素ID让元素获取焦点
   * @param id <string> 元素ID
   * @returns 当前对象，用于函数连写
   */
  private focusTarget(id?: string) {
    if (id) {
      let nativeElement = this.elemRef.nativeElement;
      if (nativeElement) {
        let target = nativeElement.querySelector ? nativeElement.querySelector('#' + id) : document.getElementById(id);
        if (target) {
          setTimeout(() => {
            target.focus();
          }, 10);
        }
      }
    }
    return this;
  }

  /**
   * 通过验证状态未通过，让元素重新获取焦点
   * @param result 验证结果，其中必须包含被验证项的key
   * @returns 当前对象，用于函数连写
   */
  private focusElem(result) {
    if (!result.status) {
      let key = result.key;
      if (key) {
        this.focusTarget(key);
      }
    }
    return this;
  }

  /**
   * entry事件响应函数
   * @param e 事件对象
   */
  private limitKeyUp(e) {
    // maxlength限制（暂时屏蔽）
    // let res = Utils.limitKeyUp(e);
    // if(!res.status){
    //   this.message.warning(res.message);
    //   return;
    // }
    Utils.enter(e, () => {
      if (this.onEntryCallBack && this.onEntryCallBack.observers.length) {
        this.onEntryCallBack.emit(e);
      }
      else {
        let res = this.verify();
      }
    });
    return this;
  }

  /**
   * checkbox change事件
   * @param data 当前数据项
   * @returns 当前对象，用于函数连写
   */
  private checkboxChangeEvent(data) {
    let checkboxGroup = data.checkboxGroup;
    let checkedData = [];
    Utils.forEach(checkboxGroup, (groupItem) => {
      if (groupItem.checked) {
        checkedData.push(groupItem.value);
      }
    });

    data.value = checkedData.length ? checkedData : null;
  }

  /**
   * select group 改变事件
   * @param value value值
   * @param data data对象
   * @param idx 在group中的索引
   */
  private modelChangeEvent(value, data, idx?) {
    if (data && idx) {
      data.value = data.value || [];
      data.value[idx] = value;
      // 获取当前第几组的options
      let options = data.groupOptions[idx];
      let i = 0;
      let len = options.length;
      let option;
      let tempValueText = (data.valueText || '').split(',');
      for (; i < len; i++) {
        option = options[i];
        if (option.value == value) {
          // 保存当前选中项的文本到data中
          tempValueText.push(option.text);
          break;
        }
      }
      data.valueText = tempValueText.join(',');
    }
    else {
      let options = data.options || [];
      let i = 0;
      let len = options.length;
      let option;
      for (; i < len; i++) {
        option = options[i];
        if (option.value == value) {
          // 保存当前选中项的文本到data中
          data.valueText = option.text;
          break;
        }
      }
    }
    if (this.onSelectChange) {
      // this.onSelectChange.emit({ data: data, value: value });
      this.onSelectChange.emit({ data, value });
      // object-literal-shorthand
    }
    // console.info(data.value)
  }

  /**
   * 设置第一个可focus项获取焦点
   * @param key <string> 通过指定key设置获取焦点
   * @returns 当前对象，用于函数连写
   */
  public setFirstFocus(key?: string) {
    setTimeout(() => {
      // 获取可以获取焦点的第一个元素
      let firstItem = this.getFirstFocusTarget();
      // 将指定key或者第一个元素获取焦点
      this.focusTarget(key || (firstItem ? firstItem.key : ''));
    }, 10);

    return this;
  }

  /**
   * 表单验证，具体规则参考FormData的参数和自定义验证规则
   * @returns 当前对象，用于函数连写
   */
  public verify() {
    let status = this.status;
    let modelData = this.modelData;
    let result = {status: true, message: 'success'};
    let statusVerifyType = status.verifyType;

    // 这是一个数组遍历，允许return 'break'终止遍历
    Utils.forEach(modelData, (dataItem) => {
      let itemType = dataItem.type;
      // 不需要验证的类型
      if (this.isExcludeType(itemType)) {
        return result;
      }
      // 必填（选）验证
      if (dataItem.require) {
        if (dataItem.type == 'select-group') {
          let groupOptions = dataItem.groupOptions;
          let groupResult = Utils.forEach(groupOptions, (groupItem) => {
            if (!groupItem.value) {
              result.status = false;
              result.message = '请选择' + groupItem.text;
              // 指定单个默认提示（前提是没有设置所有默认提示，只允许提示一次，如果设置了，则使用所有的提示）
              if (dataItem.defaultTip && !this.defaultTip) {
                this.message.warning(result.message);
              }
              // 验证结束
              return 'break';
            }
          });
          if (groupResult == 'break') {
            return 'break';
          }
        }
        else if (dataItem.type == 'group') {
          let group = dataItem.group;
          let groupResult = Utils.forEach(group, (groupItem) => {
            if (!groupItem.value) {
              result.status = false;
              if (groupItem.type != 'select') {
                result['key'] = groupItem.key;
              }
              result.message = (
                groupItem.type == 'select' ||
                groupItem.type == 'select-group' ||
                groupItem.type == 'checkbox-group' ||
                groupItem.type == 'radiobox-group' ? '请选择' : '请输入'
              ) + groupItem.text;
              // 指定单个默认提示（前提是没有设置所有默认提示，只允许提示一次，如果设置了，则使用所有的提示）
              if (dataItem.defaultTip && !this.defaultTip) {
                this.message.warning(result.message);
              }
              // 验证结束
              return 'break';
            }
          });
          if (groupResult == 'break') {
            return 'break';
          }
        }
        else {
          if (!dataItem.value) {
            result.status = false;
            result['key'] = dataItem.key;
            result.message = (
              dataItem.type == 'upload-image' ||
              dataItem.type == 'upload-file' ||
              dataItem.type == 'upload-file-progress' ||
              dataItem.type == 'select' ||
              dataItem.type == 'select-group' ||
              dataItem.type == 'checkbox-group' ||
              dataItem.type == 'radiobox-group' ? '请选择' : '请输入'
            ) + dataItem.text;
            // 指定单个默认提示（前提是没有设置所有默认提示，只允许提示一次，如果设置了，则使用所有的提示）
            if (dataItem.defaultTip && !this.defaultTip) {
              this.message.warning(result.message);
            }
            // 验证结束
            return 'break';
          }
        }
      }
      // 类型验证
      let typeVerifyFn = (dataItem) => {
        let verifyType = dataItem.verifyType || '';
        let verifyTypeAry = dataItem.verifyTypeAry || verifyType.split(this.verifySeparator);
        return Utils.forEach(verifyTypeAry, (typeItem) => {
          let verifyObj = statusVerifyType[typeItem];
          if (verifyObj) {
            let reg = verifyObj.reg;
            let error = verifyObj.error;
            let regStatus = typeof(reg) == 'function' ? reg(dataItem.value) : reg.test(dataItem.value);
            if (!regStatus) {
              result.status = false;
              result['key'] = dataItem.key;
              result.message = error;
              // 指定单个默认提示（前提是没有设置所有默认提示，只允许提示一次，如果设置了，则使用所有的提示）
              if (dataItem.defaultTip && !this.defaultTip) {
                this.message.warning(result.message);
              }
              return 'break';
            }
          }
        });
      };
      if (dataItem.type == 'group') {
        return Utils.forEach(dataItem.group, (groupItem) => {
          return typeVerifyFn(groupItem);
        });
      }
      else {
        let typeResult = typeVerifyFn(dataItem);
        if (typeResult == 'break') {
          // 类型验证失败，则整个验证结束
          return 'break';
        }
      }
      // 关联验证
      if (dataItem.relation) {
        return Utils.forEach(modelData, (rItem) => {
          if (rItem[dataItem.relation]) {
            if (rItem.value != dataItem.value) {
              result.status = false;
              result['key'] = dataItem.key;
              result.message = dataItem.relationErrorMsg || '两次数据不一致';
              return 'break';
            }
          }
        });
      }
      // 长度验证
      if (dataItem.minlength) {
        if (dataItem.value.length < dataItem.minlength) {
          result.status = false;
          result['key'] = dataItem.key;
          result.message = dataItem.errorMsg || (dataItem.text + '的长度至少' + dataItem.minlength + '位');
          // 指定单个默认提示（前提是没有设置所有默认提示，只允许提示一次，如果设置了，则使用所有的提示）
          if (dataItem.defaultTip && !this.defaultTip) {
            this.message.warning(result.message);
          }
          // 验证结束
          return 'break';
        }
      }
      // 自定义验证(可以是函数，也可以是一个正则，
      // 如果是函数，会将当前只作为参数提供给函数使用，返回格式为(如果不使用默认提示，至少需要返回状态status)：{status: '验证结果(true/false)'， message: '错误提示消息'})
      // 如果是正则，可以提供errorMsg自定义错误提示消息，也可不提供，默认为[***(该项的text属性)格式不正确]
      let customVerifyFn = (dataItem) => {
        let customVerify = dataItem.customVerify;
        if (customVerify) {
          let regStatus = typeof(customVerify) == 'function' ?
            customVerify(dataItem.value) :
            { status: customVerify.test(dataItem.value), message: dataItem.errorMsg || dataItem.text + '格式不正确' };

          if (!regStatus.status) {
            result.status = false;
            result['key'] = dataItem.key;
            result.message = regStatus.message;
            // 指定单个默认提示（前提是没有设置所有默认提示，只允许提示一次，如果设置了，则使用所有的提示）
            if (dataItem.defaultTip && !this.defaultTip) {
              this.message.warning(result.message);
            }
            return 'break';
          }
        }
      };
      if (dataItem.type == 'group') {
        return Utils.forEach(dataItem.group, (groupItem) => {
          return customVerifyFn(groupItem);
        });
      }
      else {
        return customVerifyFn(dataItem);
      }
    });
    // 设置了所有默认提示
    if (this.defaultTip && !result.status) {
      this.message.warning(result.message);
    }

    this.focusElem(result);

    return result;
  }

  /**
   * 将数据类型改为text
   */
  public setModelToText() {
    this.updateModel((dataItem, idx) => {
      // 原来的type
      let type = dataItem.type;
      if (!this.isExcludeType(type)) {
        let to = 'text'; let attr = 'type';
        // 保存修改{from: '从原来的值', to: '修改为现在的值', attr: '修改的属性', index: '当前被修改的项所在下标'}
        // this.saveUpdateModel(dataItem.key, {from: type, to: to, attr: attr, index: idx});
        this.saveUpdateModel(dataItem.key, {from: type, to, attr, index: idx});
        // 修改属性
        dataItem[attr] = to;
      }
    });

    return this;
  }

    /**
   * select-unit 改变事件
   * @param value value值
   * @param data data对象
   * @param idx 在group中的索引
   */
  public selectChangeEvent(value, data, idx?) {
    // console.info(data.options)
    data.value = this.status.selectvalue;
    this.status.selectvalue = {};
    if (data && idx) {
      data.value = data.value || [];
      data.value[idx] = value;
      // 获取当前第几组的options
      let options = data.groupOptions[idx];
      let i = 0;
      let len = options.length;
      let option;
      let tempValueText = (data.valueText || '').split(',');
      for (; i < len; i++) {
        option = options[i];
        if (option.value == value) {
          // 保存当前选中项的文本到data中
          tempValueText.push(option.text);
          break;
        }
      }
      data.valueText = tempValueText.join(',');
    }
    else {
      let options = data.options || [];
      let i = 0;
      let len = options.length;
      let option;
      for (; i < len; i++) {
        option = options[i];
        if (option.value == value) {
          // 保存当前选中项的文本到data中
          data.valueText = option.text;
          break;
        }
      }
    }
    if (this.onSelectChange) {
      // this.onSelectChange.emit({ data: data, value: value });
      this.onSelectChange.emit({ data, value });
      // object-literal-shorthand
    }
    // console.info(data.value)
    // console.info( this.status.selectvalue )

  }

}
