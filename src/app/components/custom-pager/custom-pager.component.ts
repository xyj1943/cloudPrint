import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import {
  NzModalService, NzMessageService,
} from 'ng-zorro-antd';

import { Utils, Lang, Status } from '../../common/helper/util-helper';

@Component({
  selector: 'components-custom-pager',
  templateUrl: './custom-pager.component.html',
  styleUrls: ['./custom-pager.component.scss']
})

export class CustomPagerComponent implements OnInit {
  // 自定义Class
  @Input('className') className: string;
  // 当前页码
  @Input('pageIndex') pageIndex: any = 1;
  // 总记录数
  @Input('totalCount') totalCount: any = 1;
  // 每页显示记录条数
  @Input('pageSize') pageSize: any = 1;
  // 总页数
  @Input('totalPages') totalPages: any = 1;
  // 显示快速跳转
  @Input('showQuickJumper') showQuickJumper: any;
  // 分页改变事件
  @Output() onPageIndexChange = new EventEmitter<any>();


  status = {};

  constructor(
    private routeInfo: ActivatedRoute,
    private message: NzMessageService,
    private mzModal: NzModalService,
    private router: Router,
  ) { }

  ngOnInit() {
    this.install();
  }

  private install() { }

  /**
   * 分页改变
   * @param index 当前页码
   */
  public pageIndexChangeEvent(index?: any) {
    if (index === 0) {
      index = Math.ceil(this.totalCount/this.pageSize);
    }
    this.onPageIndexChange.emit(index);
  }

  /**
   * 跳转
   * @param e event
   */
  public jumpTo(e) {
    Utils.enter(e, (e, code, target) => {
      let value = target.value;
      if (/^\+?[1-9][0-9]*$/.test(value)) {
        this.pageIndexChangeEvent(value);
        target.value = null;
      }
      else {
        this.message.warning('请输入正确的页码');
      }
    });
  }
}
