import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { NgZorroAntdModule } from 'ng-zorro-antd';

import { TreeEditComponent } from './tree-edit.component';
import { CustomFormsModule } from '../../components/custom-forms/custom-forms.module'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    NgZorroAntdModule,
    CustomFormsModule,
    // RouterModule.forChild([{ path: '', component: TreeEditComponent }]),
  ],
  declarations: [TreeEditComponent],
  exports:[TreeEditComponent],
  providers: []
})
export class TreeEditModule { }
