import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TypeStatusPipe, FileSizePipe, DateTransformPipe, NullPlaceholderPipe, CarCategory } from './type-status.pipe';

@NgModule({
  imports: [
    CommonModule,
  ],
  declarations: [TypeStatusPipe, FileSizePipe, DateTransformPipe, NullPlaceholderPipe, CarCategory],
  exports:[TypeStatusPipe, FileSizePipe, DateTransformPipe, NullPlaceholderPipe, CarCategory]
})
export class PipeModule { }
