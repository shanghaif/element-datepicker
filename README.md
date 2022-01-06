# 基于 Element-UI DatePicker 的季度选择器。

### 依赖

Vue 2.6.10+
Element-UI 2.15.6+

### 安装

```
npm install @thtf/element-datepicker
```

### 发布

main 分支提交即可。

### 快速上手

```html
// 使用组件
<template>
  <div id="app">
    <div class="block">
      <span class="demonstration">季度选择</span>
      <date-picker
        v-model="value1"
        clearable
        type="quarter"
        format="yyyy年QQ季度"
        value-format="yyyyQQ"
        placeholder="选择日期"
      />
    </div>
    <div class="block">
      <span class="demonstration">半年选择</span>
      <date-picker
        v-model="value2"
        clearable
        type="halfYear"
        format="yyyy年[BB]半年"
        value-format="yyyyBB"
        placeholder="选择日期"
      />
    </div>
  </div>
</template>
```

```html

<script>
  import DatePicker from '@thtf/element-datepicker';

  export default {
    name: 'app',
    components: {
      DatePicker,
    },
    data() {
      return {
        value1: '',
        value2: '',
      };
    },
  };
</script>
```

###  日期格式

使用`format`指定输入框的格式；使用`value-format`指定绑定值的格式。

默认情况下，组件接受并返回`Date`对象。以下为可用的格式化字串，以 UTC 2017年1月2日 03:04:05 为例：

:::warning
请注意大小写
:::

| 格式 | 含义 | 备注 | 举例 |
|------|------|------|------|
| `yyyy` | 年 | | 2017 |
| `B`  | 半年 | 不补0 | 1 |
| `BB`  | 半年 |  | 01 |
| `Q`  | 季 | 不补0 | 1 |
| `QQ` | 季 | | 01 |
| `[MM]` | 不需要格式化字符 | 使用方括号标识不需要格式化的字符 (如  [A] [MM])  | MM |


### 属性
| 参数      | 说明          | 类型      | 可选值                                                                         | 默认值                  |
|---------- |-------------- |---------- |-----------------------------------------------------------------------------|----------------------|
| value / v-model | 绑定值 | date(DatePicker) | —                                                                           | —                    |
| readonly | 完全只读 | boolean | —                                                                           | false                |
| disabled | 禁用 | boolean | —                                                                           | false                |
| editable | 文本框可输入 | boolean | —                                                                           | true                 |
| clearable | 是否显示清除按钮 | boolean | —                                                                           | true                 |
| size          | 输入框尺寸     | string          | large, small, mini                                                          | —                    |
| placeholder | 非范围选择时的占位内容 | string | —                                                                           | —                    |
| type | 显示类型 | string | quarter/halfYear                                                            | quarter              |
| format | 显示在输入框中的格式 | string | 见[日期格式](#/zh-CN/component/date-picker#ri-qi-ge-shi)                         | yyyy-MM-dd           |
| align | 对齐方式 | string | left, center, right                                                         | left                 |
| popper-class | DatePicker 下拉框的类名 | string | —                                                                           | —                    |
| default-value | 可选，选择器打开时默认显示的时间 | Date | 可被`new Date()`解析                                                            | —                    |
| value-format | 可选，绑定值的格式。不指定则绑定值为 Date 对象 | string | 见[日期格式](#/zh-CN/component/date-picker#ri-qi-ge-shi)                         | —                    |
| name | 原生属性 | string | —                                                                           | —                    |
| prefix-icon | 自定义头部图标的类名 | string | —                                                                           | el-icon-date         |
| clear-icon | 自定义清空图标的类名 | string | —                                                                           | el-icon-circle-close |
| validate-event | 输入时是否触发表单的校验 | boolean | -                                                                           | true                 |

### 事件
| 事件名称      | 说明    | 回调参数      |
|---------|--------|---------|
| change | 用户确认选定的值时触发 | 组件绑定值。格式与绑定值一致，可受 `value-format` 控制 |
| blur | 当 input 失去焦点时触发 | 组件实例 |
| focus | 当 input 获得焦点时触发 | 组件实例 |

### 方法
| 方法名 | 说明 | 参数 |
| ---- | ---- | ---- |
| focus | 使 input 获取焦点 | — |
