import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { TreeManageComponent } from './tree-manage.component';
import { TreeEditModule } from '../../../components/tree-edit/tree-edit.module';
import { CustomFormsModule } from '../../../components/custom-forms/custom-forms.module';
import { CustomDragModule } from '../../../components/custom-drag/custom-drag.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    TreeEditModule,
    CustomFormsModule,
    CustomDragModule,
    RouterModule.forChild([{ path: '', component: TreeManageComponent }]),
  ],
  declarations: [TreeManageComponent],
  providers: []
})
export class TreeManageModule { }
