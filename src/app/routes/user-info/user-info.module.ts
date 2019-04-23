import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { UserInfoComponent } from './user-info.component';
import { CustomFormsModule } from '../../components/custom-forms/custom-forms.module';

@NgModule({
  imports: [
    CommonModule,
    NgZorroAntdModule,
    CustomFormsModule,
    RouterModule.forChild([{ path: '', component: UserInfoComponent }]),
  ],
  declarations: [UserInfoComponent],
  providers: []
})
export class UserInfoModule { }
