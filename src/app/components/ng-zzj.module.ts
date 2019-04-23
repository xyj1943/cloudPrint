import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import {NgxFlowModule, FlowInjectionToken } from '@flowjs/ngx-flow';
import Flow from '@flowjs/flow.js';

// import { FileUploaderComponent } from './file-uploader/file-uploader.component';
// import { CustomFormsComponent } from './custom-forms/custom-forms.component';
// import { CustomPagerComponent } from './custom-pager/custom-pager.component';
// import { ImgTextListComponent } from './imgtext-list/imgtext-list.component';
// import { TreeEditComponent } from './tree-edit/tree-edit.component';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntdModule,
    FormsModule,
    NgxFlowModule
  ],
  declarations: [],
  exports:[],
  providers: [{
    provide: FlowInjectionToken,
    useValue: Flow
  }]
})
export class NgZzjModule { }
