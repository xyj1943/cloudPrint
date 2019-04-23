import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NzModalService, NzMessageService
} from 'ng-zorro-antd';

import { Utils, Lang, Status } from '../../common/helper/util-helper';

@Component({
  selector: 'components-imgtext-list',
  templateUrl: './imgtext-list.component.html',
  styleUrls: ['./imgtext-list.component.scss']
})

export class ImgTextListComponent implements OnInit {
  // 自定义Class
  @Input('className') public className: string;
  // 空文本提示
  @Input('emptyText') public emptyText: string = '暂无数据';
  // 列表项标识
  @Input('itemType') public itemType: string;
  // 是否显示工具栏
  @Input('tools') public tools = [];
  // 图文列表数据
  /**
   * [
   *  { thumb: '缩略图', title: '标题', number: '编号', time: 'time' }
   * ]
   */
  @Input('dataList') public modelData: any = [];
  // 工具点击事件
  @Output() public onToolsClick = new EventEmitter();

  public status = { };

  public constructor(
    private routeInfo: ActivatedRoute,
    private message: NzMessageService,
    private mzModal: NzModalService,
    private router: Router
  ) { }

  public ngOnInit() {
    this.install();
  }

  private install() { }

  /**
   * 工具点击事件
   * @param tool
   * @param data
   */
  public toolClickEvent(tool: any, data: any) {
    let params = {
      tool, data
    };

    // tool的fn
    let toolFn = tool.fn;
    if (toolFn) {
      toolFn(params);
    }
    // tools点击事件
    this.onToolsClick.emit(params);
  }

  public jumpTo(e, data) {
    let target = e.target || e.srcElement;
    let nodeName = target.nodeName;
    if (nodeName != 'svg' && nodeName != 'path') {
      Utils.setLocalStorage(Status.carModelName, data.name);
      Utils.openPath('/car-model?' + Status.carModelId + '=' + data.id);
      // let params = {};
      // params[Status.carModelId] = data.id;
      // this.router.navigate(['/car-model'], {
      //   queryParams: params
      // });
      // // console.info(params);
      // setTimeout(() => {
      //   // Utils.openPath('/car-model?' + Status.carModelId + '=' + data.id);
      //   window.location.href = window.location.href;
      // }, 100);
    }
  }
}
