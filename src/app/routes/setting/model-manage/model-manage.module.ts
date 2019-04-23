import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { ZzjFileUploaderModule } from '@zzj/nag-file-uploader';
import { NgxFlowModule, FlowInjectionToken } from '@flowjs/ngx-flow';
import Flow from '@flowjs/flow.js';

import { ModelManageComponent } from './model-manage.component';
import { CustomFormsModule } from '../../../components/custom-forms/custom-forms.module';
import { PipeModule } from '../../../pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    CustomFormsModule,
    PipeModule,
    NgxFlowModule,
    ZzjFileUploaderModule,
    RouterModule.forChild([{ path: '', component: ModelManageComponent }]),
  ],
  declarations: [ModelManageComponent],
  providers: [
    {
      provide: FlowInjectionToken,
      useValue: Flow
    }
  ]
})
export class ModelManageModule { }
