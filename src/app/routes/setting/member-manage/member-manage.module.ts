import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';

import { MemberManageComponent } from './member-manage.component';
import { CustomFormsModule } from '../../../components/custom-forms/custom-forms.module';
import { PipeModule } from '../../../pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    CustomFormsModule,
    PipeModule,
    RouterModule.forChild([{ path: '', component: MemberManageComponent }]),
  ],
  declarations: [MemberManageComponent],
  providers: []
})
export class MemberManageModule { }
