import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { RoleManageComponent } from './role-manage.component';
import { CustomFormsModule } from '../../../components/custom-forms/custom-forms.module'
import { PipeModule } from '../../../pipe/pipe.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    CustomFormsModule,
    PipeModule,
    RouterModule.forChild([{ path: '', component: RoleManageComponent }]),
  ],
  declarations: [RoleManageComponent],
  providers: []
})
export class RoleManageModule { }
