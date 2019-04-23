/**
 * 自定义数据(模型数据，并非数据库数据)集合（增、删、改、查）操作
 * @author AndyPan
 * @createdate 2019年1月2日15:09:20
 * @version 1.0.1
 * @remark 主要对数据集合的（增、删、改、查）操作
 */

export class CustomModelComponent {

  // 模型数据
  public modelData: any;
  // 状态数据对象
  public modelStatus = {
    // 保存新增项
    addModelTemp: {},
    // 保存修改的属性
    updateModelTemp: { /* key: [{attr: '', from: '', to: ''}] */ },
    // 保存删除项(因为删除后还原需要原来的下标，所以需要保存key和index)
    deleteModelTemp: { key: {}, index: {} },
    // 排除操作的type(这些类型为辅助类型，不做操作处理)
    excludeType: 'text|link|split-line|remark|remark-text|desc', excludeTypeObj: {}
  };

  /**
   * 遍历数据（也可重置数据）
   * @param data <Array|JSON> 需要遍历的数据
   * @param callBack <Function> 回调函数
   * @returns 重置后的数据
   */
  private forEach(data: Array<any> | any, callBack: Function) {
    let tempData: any = [];
    if (data) {
      let item; let cbResult;
      // data.forEach((item, key) => {
      //   if (callBack) {
      //     cbResult = callBack(item, key);
      //     if (cbResult == 'break') {
      //       tempData = 'break';
      //     }
      //     if (cbResult) {
      //       tempData.push(cbResult);
      //     }
      //   }
      // });
      for (let key in data){
        item = data[key];
        if (callBack) {
          cbResult = callBack(item, key);
          if(cbResult == 'break'){
            tempData = 'break';
            break;
          }
          if (cbResult) {
            tempData.push(cbResult);
          }
        }
      }
    }
    return tempData;
  }

  /**
   * 将是否包含(排除的)类型转换成JSON键值对
   */
  public renderExcludeType() {
    this.forEach(this.modelStatus.excludeType.split('|'), (item) => {
      this.modelStatus.excludeTypeObj[item] = true;
    });
  }

  /**
   * 是否包含(排除的)类型
   * @param type <string> 类型
   * @returns true | false
   */
  public isExcludeType(type: string) {
    return this.modelStatus.excludeTypeObj[type] || false;
  }

  /**
   * 通过条件在obj中获取满足条件的对象集合
   * @param obj 查询对象
   * @param term 条件
   * @returns 获取到的满足条件的对象集合
   */
  private getModelTerm(obj: any, term: any) {
    let tempObj = obj;
    if (term) {
      tempObj = {};
      for(let idxKey in obj){
        let tempItem = obj[idxKey];
        // 渲染条件
        this.renderTermType({
          term: term, modelItem: tempItem,
          termTrue: () => {
            // term条件满足
            tempObj[idxKey] = tempItem;
          }
        });
      }
    }

    return tempObj;
  }

  /**
   * 渲染条件
   * @param options
   *    term: '条件对象', modelItem: '数据项', 
   *    idx: '数据索引或数据key，仅用于返回操作函数，可以不传，因为操作函数中本身可以获取',
   *    termTrue: '满足条件的操作', termFalse: '不满足条件的操作'
   * @returns this，用于函数连写
   */
  private renderTermType(options: any) {
    let term = options.term;
    let modelItem = options.modelItem;
    let idx = options.idx;
    // 不满足条件的操作
    let termFalse = options.termFalse;
    // 满足条件的操作
    let termTrue = options.termTrue;

    if (typeof(term) == 'function'){
      // 通过函数自定义判断，需要删除的return true
      let result = term(modelItem, idx);
      if (result) {
        // 满足条件
        if (termTrue) {
          termTrue(idx, modelItem);
        }
      }
      else {
        // 不满足条件
        if (termFalse) {
          termFalse(idx, modelItem);
        }
      }
    }
    else {
      let termStatus = true;
      for (let key in term) {
        if (modelItem[key] != term[key]) {
          termStatus = false;
        }
      }
      if (!termStatus) {
        // 不满足条件
        if (termFalse) {
          termFalse(idx, modelItem);
        }
      }
      else {
        // 满足条件
        if (termTrue) {
          termTrue(idx, modelItem);
        }
      }
    }

    return this;
  }

  /**
   * 给model的每一项数据自动生成key（不影响自定义的key）
   * @returns 当前对象，用于函数连写
   */
  public makeModelItemKey(data?: any, index?: any) {
    let callBack;
    if (typeof(data) == 'function') {
      callBack = data;
      data = undefined;
    }
    index = index || 0;

    let modelData = data || this.modelData;
    this.forEach(modelData, (dataItem, idx) => {
      if (!dataItem.key) {
        dataItem['key'] = (dataItem.type || 'modelItem') + (index + idx);
      }
      if (callBack) {
        callBack(dataItem, idx);
      }
    });

    return this;
  }

  /**
   * 添加新数据
   * @param newModel <Array> 新数据集合
   * @param callBack <Function> 新增后的回调
   * @example addModel([{key: value, ...}])
   * @returns this，用于函数连写
   */
  public addModel(newModel: Array<any>, callBack?: Function) {
    if (newModel) {
      // 将新增项添加key，便于清空操作
      this.makeModelItemKey(newModel, this.modelData.length);
      // 添加到modelData中
      this.modelData = this.modelData.concat(newModel);
      // 保存新增项
      this.saveAddModel(newModel);
      // 回调
      if (callBack) {
        callBack();
      }
    }

    return this;
  }

  /**
   * 在原数据前面添加新数据
   * @param newModel <Array> 新数据集合
   * @param callBack <Function> 新增后的回调
   * @example addModel([{key: value, ...}])
   * @returns this，用于函数连写
   */
  public addModelInBefore(newModel: Array<any>, callBack?: Function) {
    if (newModel) {
      // 将新增项添加key，便于清空操作
      this.makeModelItemKey(newModel, this.modelData.length);
      // 添加到modelData中
      this.modelData = newModel.concat(this.modelData);
      // 保存新增项
      this.saveAddModel(newModel);
      // 回调
      if (callBack) {
        callBack();
      }
    }
  }

  /**
   * 保存新增项，用于还原
   * @param newModel <Array> 新数据集合
   * @returns this，用于函数连写
   */
  private saveAddModel(newModel: Array<any>) {
    this.forEach(newModel, (item, idx) => {
      this.modelStatus.addModelTemp[item.key] = item;
    });

    return this;
  }

  /**
   * 还原新增项（删除新增项）
   * @example restoreAddModel({'key': 'key的value', ...}) | restoreAddModel((item, index)=>{})
   * @returns this，用于函数连写
   */
  public restoreAddModel(term?: any) {
    let addModelTemp = this.modelStatus.addModelTemp;
    // 获取到满足条件的项
    let addModelTempObj = this.getModelTerm(addModelTemp, term);

    let temp = [];
    this.forEach(this.modelData, (item, idx) => {
      if (!addModelTempObj[item.key]) {
        temp.push(item);
      }
    });
    this.modelData = temp;
    // 清空
    this.modelStatus.addModelTemp = {};

    return this;
  }

  /**
   * 删除模型数据
   * @param term 删除条件，不填为删除全部，清空
   * @returns this，用于函数连写
   */
  public deleteModel(term?: any) {
    if (!term) {
      // 保存删除项
      this.saveDeleteModel(this.modelData);
      // 清空
      this.modelData = [];
    }
    else {
      let temp = [];
      this.forEach(this.modelData, (modelItem, idx) => {
        // 渲染条件
        this.renderTermType({
          term: term,
          idx: idx, modelItem: modelItem,
          termTrue: () => {
            // 保存删除项
            this.saveDeleteModel(idx, modelItem);
          },
          termFalse: () => {
            // 不满足条件，则不删除保存到temp
            temp.push(modelItem);
          }
        });
      });
      this.modelData = temp;
    }

    return this;
  }

  /**
   * 保存删除项
   * @param delModel <Array<any>> 删除项集合
   * @returns this，用于函数连写
   */
  private saveDeleteModel(index: any, delModel?: any) {
    if (typeof(index) == 'number') {
      this.modelStatus.deleteModelTemp.index[index] = delModel;
      this.modelStatus.deleteModelTemp.key[delModel.key] = delModel;
    }
    else {
      delModel = index;
      this.forEach(delModel, (item, idx) => {
        this.modelStatus.deleteModelTemp.index[idx] = item;
        this.modelStatus.deleteModelTemp.key[item.key] = item;
      });
    }

    return this;
  }

  /**
   * 还原删除项
   * @param term 自定义条件({'指定key': '指定value'})或函数
   * @example restoreDeleteModel({'key': 'key的value', ...}) | restoreDeleteModel((item, index)=>{})
   * @returns this，用于函数连写
   */
  public restoreDeleteModel(term?: any) {
    let deleteModelTempIndex = this.modelStatus.deleteModelTemp.index;
    // 获取满足条件的项
    let deleteModelTemp = this.getModelTerm(deleteModelTempIndex, term);

    let temp = [];
    this.forEach(this.modelData, (modelItem, idx) => {
      let deleteModel = deleteModelTemp[idx];
      if (deleteModel) {
        temp.push(deleteModel);
      }
      temp.push(modelItem);
    });

    this.modelData = temp;

    return this;
  }

  /**
   * 删除现有数据（通过key）
   * @param key <string|Array<string>> 需要删除的key字符串(也可使用逗号','隔开的字符串)或集合
   * @example deleteModelByKey('key') | deleteModelByKey('key1,key2,...') | deleteModelByKey(['key1', 'key2', ...])
   * @returns this，用于函数连写
   */
  public deleteModelByKey(key: string | Array<string>) {
    if (key) {
      key = typeof key == 'string' ? key.split(',') : key;
      this.forEach(key, (item) => {
        this.deleteModel({key: item});
      });
    }
    return this;
  }

  /**
   * 删除现有数据（通过索引：index）
   * @param index <number|string|Array<number>|Array<string>> 需要删除的(单个)索引、索引字符串(以逗号','隔开)、索引集合
   * @example deleteModelByIndex(1) | deleteModelByIndex('1,2,...') | deleteModelByIndex([1, 2,...])
   * @returns this，用于函数连写
   */
  public deleteModelByIndex(index: number | string | Array<number> | Array<string>) {
    if (index != undefined && index != null){
      let typeIndex = typeof(index);
      index = typeIndex == 'number' || typeIndex == 'string' ? (index + '').split(',') : index;
      this.deleteModel((dataItem, idx) => {
        let result = null;
        this.forEach(index, (indexItem) => {
          if (idx == indexItem) {
            result = true;
            return 'break';
          }
        });
        return result;
      });
    }
    return this;
  }

  /**
   * 修改现有数据属性
   * @param model <any> 需要修改的属性集合对象({'需要修改项的key||或者索引': {'...属性JSON对象...'}, ...})
   * @param callBack <Function> 每一项的回调
   * @example updateModel({'需要修改项的key||或者索引': {'...属性JSON对象...'}, ...});
   * @returns this，用于函数连写
   */
  public updateModel(model: any, callBack?: Function) {
    if (typeof(model) == 'function') {
      callBack = model;
      model = undefined;
    }
    this.forEach(this.modelData, (dataItem, idx) => {
      if (model) {
        let updateItem = model[dataItem.key] || model[idx];
        if (updateItem) {
          for(let key in updateItem) {
            // 保存修改
            this.saveUpdateModel(dataItem.key, {from: dataItem[key], to: updateItem[key], attr: key, index: idx});

            if(callBack){
              callBack(dataItem, idx, key);
            }
            dataItem[key] = updateItem[key];
          }
        }
      }
      else {
        if (callBack) {
          callBack(dataItem, idx);
        }
      }
    });

    return this;
  }

  /**
   * 保存修改属性，用于还原
   * @param key item的key
   * @param objs { attr: '修改的属性', from: '从...值', to: '改为...值', index: '修改项的索引'}
   * @returns this，用于函数连写
   */
  public saveUpdateModel(key, objs) {
    this.modelStatus.updateModelTemp[key] = this.modelStatus.updateModelTemp[key] || [];
    this.modelStatus.updateModelTemp[key].push(objs);

    return this;
  }

  /**
   * 还原修改
   * @returns this，用于函数连写
   */
  public restoreUpdateModel() {
    let updateModelTemp = this.modelStatus.updateModelTemp;
    this.forEach(this.modelData, (item, idx) => {
      let restoreData = updateModelTemp[item.key];
      if (restoreData) {
        this.forEach(restoreData, (resItem) => {
          item[resItem.attr] = resItem.from;
        });
      }
    });
    // 清空
    this.modelStatus.updateModelTemp = {};

    return this;
  }

  /**
   * 获取模型数据
   * @param term 自定义条件({'指定key': '指定value'})或函数
   * @example getModel({{'指定key': '指定value', ...}}) | getModel((modelItem, idx) => {if('自己判断的条件'){return modelItem;}...});
   * @returns 获取的数据
   */
  public getModel(term?: any, model?) {
    let modelData = model || this.modelData;
    let result = modelData;
    if(term){
      result = [];
      this.forEach(modelData, (modelItem, idx) => {
        // 渲染条件
        this.renderTermType({
          term: term,
          idx: idx, modelItem: modelItem,
          termTrue: () => {
            // 满足条件，保存获取的项
            result.push(modelItem);
          }
        });
      });
    }

    return result;
  }

  /**
   * 通过key获取Item
   * @param key <string|Array<string>> 需要获取的key字符串(也可使用逗号','隔开的字符串)或集合
   * @example getModelByKey('key') | getModelByKey('key1,key2,...') | getModelByKey(['key1', 'key2', ...])
   * @returns 获取的对象
   */
  public getModelByKey(key: string | Array<string>, model?) {
    let result;
    if (key) {
      key = typeof key == 'string' ? key.split(',') : key;
      this.forEach(key, (item) => {
        let modelResult = this.getModel({key: item}, model);
        if (modelResult && modelResult.length) {
          result = (result || []).concat(modelResult);
        }
      });
    }

    return result;
  }

  /**
   * 获取现有数据（通过索引：index）
   * @param index <number|string|Array<number>|Array<string>> 需要删除的(单个)索引、索引字符串(以逗号','隔开)、索引集合
   * @example getModelByIndex(1) | getModelByIndex('1,2,...') | getModelByIndex([1, 2,...])
   * @returns 获取的对象
   */
  public getModelByIndex(index: number | string | Array<number> | Array<string>){
    let result;
    if (index) {
      let typeIndex = typeof(index);
      index = typeIndex == 'number' || typeIndex == 'string' ? (index + '').split(',') : index;
      result = this.getModel((dataItem, idx) => {
        let flag = null;
        this.forEach(index, (indexItem) => {
          if (idx == indexItem) {
            flag = true;
            return 'break';
          }
        });
        return flag;
      });
    }
    return result;
  }

  /**
   * 以model中的数据组装需要的json对象
   * @param jsonKeyValue {key: 'model项中需要作为返回json中的键', value: 'model项中需要作为返回json中的值'}
   * @param callBack 回调函数，可以通过回调函数判断哪些需要组装，以及通过返回值形式自定义组装后的值
   * @example getModelJson():默认以model项的key作为键，value作为值，组装成json返回；getModelJson({key: '自定义json的key，比如以数据项中的：id、name...等的值作为key', value: '自定义json的value，比如以数据项中的：id、value...等的值作为value'})
   *          // getModelJson({key: 'key', value: 'value'}, (item, idx) => {if(item.key == 'test') {return false} else {return item.key+'-'item.value}}) | getModelJson((item, idx) => {if(item.key == 'test') {return false} else {return item.key+'-'item.value}})
   * @returns 返回组装后的json对象
   */
  public getModelJson(jsonKeyValue?: any, models?: any, callBack?: Function) {
    if (typeof(jsonKeyValue) == 'function') {
      callBack = jsonKeyValue;
      jsonKeyValue = undefined;
    }
    if (typeof(models) == 'function') {
      callBack = models;
      models = undefined;
    }

    jsonKeyValue = jsonKeyValue || {key: 'key', value: 'value'};
    let result = {};
    this.forEach(models || this.modelData, (modelItem, idx) => {
      let cbResult;
      if (callBack) {
        cbResult = callBack(modelItem, idx, result);
      }
      if (cbResult != false) {
        // cbResult可以返回具体组装后的值
        result[modelItem[jsonKeyValue.key]] = cbResult || modelItem[jsonKeyValue.value];
      }
    });

    return result;
  }

  /**
   * 以model中的数据组装需要的json对象(以key为建，value为值)
   * @param model
   */
  public getModelJsonKey(model?, isGetNull?) {
    model = model || this.modelData;
    let result = {};
    this.forEach(model, (modelItem, idx) => {
      let key = modelItem.key;
      if (isGetNull == false) {
        if (modelItem.value != null) {
          result[key] = modelItem.value;
        }
      }
      else {
        result[key] = modelItem.value;
      }
    });

    return result;
  }

  /**
   * 合并json对象
   * @param objs
   * @param mergeObjs
   */
  public merge(objs: any, mergeObjs: any) {
    if (objs && mergeObjs) {
      for(let key in objs){
        mergeObjs[key] = objs[key];
      }
      return mergeObjs;
    }
  }

  /**
   * 通过data中的数据渲染到对应model中的value中，就是将data中的属性与model中的key匹配，匹配成功，在将data的当前属性的值，赋值个model对应key的参数jsonKeyValue
   * @param data <any> 需要渲染的数据或者集合，如果为json对象，则表示数据，如果为数组，则数组第一个元素表示数据，第二个元素表示需要被设置的model对象，model对象默认为当前model对象，如果要对其他model对象设置，可以使用数组方式 
   * @param jsonKeyValue <string> model中被渲染的属性，默认为{key: 'key', value: 'value'}
   * @param callBack <Function> 回调函数，可以自定义条件
   * @returns this，用于函数连写
   */
  public renderToModel(data: any, jsonKeyValue?: any, models?: any, callBack?: Function) {
    let defaultKeyValue = {key: 'key', value: 'value'};
    if (typeof(jsonKeyValue) == 'function') {
      callBack = jsonKeyValue;
      jsonKeyValue = defaultKeyValue;
    }
    if (typeof(models) == 'function') {
      callBack = models;
      models = undefined;
    }

    jsonKeyValue = jsonKeyValue || defaultKeyValue;

    if (data) {
      this.forEach(models || this.modelData, (modelItem, idx) => {
        // 是否存在
        let isExist = data[modelItem[jsonKeyValue.key]];
        if (isExist != undefined) {
          let cbResult;
          if (callBack) {
            cbResult = callBack(modelItem, idx, isExist);
          }
          if (cbResult != false) {
            modelItem[jsonKeyValue.value] = cbResult == 'null' ? null : (cbResult || isExist);
          }
        }
      });
    }

    return this;
  }

  /**
   * 清空(属性，所有属性清空，除排除类型[modelStatus.excludeType]外)，默认清空value，使value属性为null
   * @param key <any> 需要清空的属性，默认为value
   * @param value <any> 被设置为空的值(null或者undefined或者'')，默认为null
   * @param callBack <Function> 回调函数
   * @example clear()等同于clear('value', null).将所有项的value值设置为null | clear('test', 'test').将每一项的test属性设置值为test
   * @returns this，用于函数连写
   */
  public clear(key?: any, value?: any, callBack?: Function) {
    key = key || 'value';
    value = value || null;

    if (typeof(value) == 'function') {
      callBack = value;
      value = null;
    }
    if (typeof(key) == 'function') {
      callBack = key;
      key = 'value';
      value = null;
    }

    this.updateModel((item) => {
      // 排除不需要清空的类型
      if (!this.isExcludeType(item.type)) {
        item[key] = value;
      }
      if (item.type == 'group') {
        this.forEach(item.group, (groupItem) => {
          // 排除不需要清空的类型
          if (!this.isExcludeType(groupItem.type)) {
            groupItem[key] = value;
          }
        });
      }
    });

    if (callBack) {
      callBack();
    }

    return this;
  }

  /**
   * 通过key清空模型项的value
   * @param key <string | Array<string>> 需要清空value的模型key集合
   * @returns this，用于函数连写
   */
  public clearValueByKey(key?: string | Array<string>) {
    let keyArys = (typeof(key) == 'string' ? [key] : key) || [];
    this.forEach(this.modelData, (item, idx) => {
      // 排除不需要清空的类型
      if (!this.isExcludeType(item.type)) {
        if (keyArys.length) {
          this.forEach(keyArys, (keyItem) => {
            if (keyItem == item.key) {
              if (item.type == 'group') {
                let itemGroups = item.group;
                if (itemGroups) {
                  this.forEach(itemGroups, (groupItem) => {
                    groupItem['value'] = null;
                  });
                }
              }
              else {
                item['value'] = null;
              }
            }
          });
        }
        else {
          item['value'] = null;
        }
      }
    });

    return this;
  }

}
