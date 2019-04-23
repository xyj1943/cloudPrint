import { Pipe, PipeTransform } from '@angular/core';
import { Utils, Status } from '../common/helper/util-helper';

/**
 * 
 */
@Pipe({
    name: 'typeStatusPipe'
})
export class TypeStatusPipe implements PipeTransform {
    transform(value: number, args: any): any {
       console.info(value)
       console.info(args)
    }
}

/**
 * 文件大小转换
 */
@Pipe({
  name: 'FileSizePipe'
})
export class FileSizePipe implements PipeTransform {
  transform(value: any, args?: any): any {
    switch (args) {
      case 'bytes':
        value = value / 1024
        break;
      default:
        value = value / 1024
        break;
    }
    //B,KB,MB,GB,TB,PB,EB,ZB,YB,BB
    let unitStrArr = ['K', 'M', 'G'];
    let unitIdx = 0;
    let sizeCalc = value;// / 1024;
    for (; unitIdx < unitStrArr.length && sizeCalc > 1024; ++unitIdx) {
      sizeCalc = sizeCalc / 1024;
    }
    return parseFloat(sizeCalc).toFixed(2) + unitStrArr[unitIdx];
  }
}

/**
 * 时间转换
 */
@Pipe({
  name: 'DateTransformPipe'
})
export class DateTransformPipe implements PipeTransform {
  transform(date: any, args?: any): any {
    
    let result = '-';
    if(date){
      let dateObjs = new Date(date);
      let renderZero = (value) => {
        return (value+'').length == 1 ? '0'+value : value;
      };
      result = (dateObjs.getFullYear()+'-'+
        renderZero(dateObjs.getMonth()+1)+'-'+
        renderZero(dateObjs.getDate())+
        (!args? 
          (
            ' '+renderZero(dateObjs.getHours())+':'+renderZero(dateObjs.getMinutes())+':'+renderZero(dateObjs.getSeconds())
          ) : '')
        );
    }
    return result;
  }
}

/**
 * 为空时的占位符
 */
@Pipe({
  name: 'NullPlaceholderPipe'
})
export class NullPlaceholderPipe implements PipeTransform {
  transform(value: any, args?: any): any {
    return value || '-';
  }
}


/**
 * 车辆（燃油）类型
 */
@Pipe({
  name: 'CarCategory'
})
export class CarCategory implements PipeTransform {
  transform(value: any, args?: any): any {
    let carCategoryData = Status.carCategory;
    let result;
    Utils.forEach(carCategoryData, (item) => {
      if (item.value == value) {
        result = item.text;
        return 'break';
      }
    });
    return result || '-';
  }
}

