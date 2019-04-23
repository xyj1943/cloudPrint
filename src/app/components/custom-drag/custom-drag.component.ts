import { Component, OnInit, ViewChild, Input, Output, EventEmitter, ElementRef } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { 
  NzModalService, NzMessageService,
} from 'ng-zorro-antd';

@Component({
  selector: 'components-custom-drag',
  templateUrl: './custom-drag.component.html',
  styleUrls: ['./custom-drag.component.scss']
})

export class CustomDragComponent implements OnInit {
  @ViewChild('jDragSplit') public jDragSplit;
  @ViewChild('jDragMask') public jDragMask;

  // 自定义Class
  @Input('className') public className: string;
  // 是否设置left
  @Input('isSetLeft') public isSetLeft: boolean;

  // 拖拽开始事件(Output不可返回值，如需返回值使用Input)
  @Output() public onDragBegin = new EventEmitter<any>();
  @Input('dragBeginEvent') public dragBeginEvent: Function;
  // 拖拽移动事件(Output不可返回值，如需返回值使用Input)
  @Output() public onDragMove = new EventEmitter<any>();
  @Input('dragMoveEvent') public dragMoveEvent: Function;
  // 拖拽结束事件(Output不可返回值，如需返回值使用Input)
  @Output() public onDragEnd = new EventEmitter<any>();
  @Input('dragEndEvent') public dragEndEvent: Function;

  public status = {
    // 克隆的元素
    // cloneTarget: null,
    // 元素的坐标
    targetOffset: null,
    // 是否开始拖拽
    isDragBegin: false,
    isDragSplit: false,
    // 当前拖拽元素对象
    dragTarget: null,
    // 当前移动元素对象
    moveTarget: null,
    // 拖拽元素的样式
    dragTargetStyle: {}
  };

  public constructor(
    private routeInfo: ActivatedRoute,
    private message: NzMessageService,
    private mzModal: NzModalService,
    private router: Router,
    public elemRef: ElementRef
  ) { }

  public ngOnInit() {
    this.install();
  }

  private install() {
    // let dragContainer = this.elemRef.nativeElement;
    // console.info(dragContainer);
  }

  /**
   * 拖拽事件
   * @param e <event>
   */
  public drag(e) {
    e = e || window.event;
    let eventTarget = e.target || e.srcElement;
    // console.info(e);
    this.status.targetOffset = {x: e.pageX, y: (e.pageY)};
    let beginResult;
    if (this.onDragBegin) {
      this.onDragBegin.emit({event: e, target: eventTarget});
    }
    if (this.dragBeginEvent) {
      beginResult = this.dragBeginEvent({event: e, target: eventTarget});
    }
    if (beginResult) {
      // 重新指定目标元素
      if (beginResult.target) {
        eventTarget = beginResult.target;
      }
      // 阻止其他元素的拖拽效果，让指定元素可拖拽
      if (beginResult.state == false) {
        return;
      }
    }
    // 拖拽结束
    document.body.onmouseup = (upEvent: any) => {
      upEvent = upEvent || window.event;
      let eventTarget = upEvent.target || upEvent.srcElement;
      if (this.onDragEnd) {
        this.onDragEnd.emit({event: upEvent, target: eventTarget, moveTarget: this.status.moveTarget, dragTarget: this.status.dragTarget});
      }
      if (this.dragEndEvent) {
        this.dragEndEvent({event: upEvent, target: eventTarget, moveTarget: this.status.moveTarget, dragTarget: this.status.dragTarget});
      }
      this.removeCloneTarget();
      document.body.onmouseup = null;
    };
    // 设置当前拖拽的元素对象
    this.status.dragTarget = eventTarget;
    // 克隆一个元素，用于拖拽时移动
    this.cloneTarget(eventTarget, this.status.targetOffset);
    // 创建一个遮罩元素，用于覆盖当前拖拽的对象
    // setTimeout(() => {
      // let parentNode = eventTarget.parentNode;
      // parentNode.appendChild(this.jDragMask.nativeElement);
      // parentNode.parentNode.insertBefore(this.jDragSplit.nativeElement, parentNode);
    // }, 0);
  }

  public dragMove(e) {
    if (this.status.isDragBegin) {
      e = e || window.event;
      let eventTarget = e.target || e.srcElement;
      this.status.targetOffset = {x: e.pageX, y: e.pageY};
      let moveResult;
      if(this.onDragMove){
        this.onDragMove.emit({event: e, target: eventTarget});
      }
      if(this.dragMoveEvent){
        moveResult = this.dragMoveEvent({event: e, target: eventTarget});
      }
      if(moveResult){
        // 重新指定目标元素
        if(moveResult.target){
          eventTarget = moveResult.target;
          if(this.status.moveTarget){
            this.status.moveTarget.style = '';
          }
          // if(this.status.dragTarget != eventTarget){
            // this.status.isDragSplit = true;
            this.status.moveTarget = eventTarget;
            this.status.moveTarget.style.backgroundColor = '#419FE5';
            // 当前移动到的元素不是当前拖拽的元素时
            setTimeout(() => {
              let dragSplit = this.jDragSplit;
              if (dragSplit) {
                eventTarget.parentNode.insertBefore(dragSplit.nativeElement, eventTarget);
              }
            }, 0);
          // }
          // let height = eventTarget.offsetHeight;
        }
      }
      this.setCloneTarget(this.status.targetOffset);
    }
  }

  /**
   * 克隆一个大小相同的虚线框元素
   * @param target <any> 被克隆元素
   * @param coordinate <any> 指定克隆元素的左标
   */
  public cloneTarget(target: any, coordinate?: any) {
    let className = target.className;
    if (target && typeof(className) == 'string') {
      if (className.indexOf('custom-node') > -1) {
        target = target.parentNode;
      }
      let width = target.offsetWidth;
      let height = target.offsetHeight;
      this.status.dragTargetStyle = {
        width: width + 'px',
        height: height + 'px'
      };
      if (coordinate) {
        if (coordinate.x != undefined) {
          if (this.isSetLeft != false) {
            this.status.dragTargetStyle['left'] = (coordinate.x - (width / 2)) + 'px';
          }
        }
        if (coordinate.y != undefined) {
          this.status.dragTargetStyle['top'] = (coordinate.y + 10) + 'px';
        }
      }
      this.status.isDragBegin = true;
    }
  }

  /**
   * 还原并清空状态值
   * @param cloneTarget
   */
  public removeCloneTarget(cloneTarget?: any) {
    if (this.status.moveTarget) {
      this.status.moveTarget.style = '';
    }
    // this.status.isDragSplit = false;
    this.status.isDragBegin = false;
    this.status.dragTarget = null;
    this.status.moveTarget = null;
  }

  /**
   * 设置克隆元素坐标
   * @param coordinate
   */
  public setCloneTarget(coordinate: any){
    if (coordinate) {
      if (coordinate.x != undefined) {
        let width = parseInt(this.status.dragTargetStyle['width']);
        if (this.isSetLeft != false) {
          this.status.dragTargetStyle['left'] = (coordinate.x - (width / 2)) + 'px';
        }
      }
      if (coordinate.y != undefined) {
        this.status.dragTargetStyle['top'] = (coordinate.y + 10) + 'px';
      }
    }
  }

}
