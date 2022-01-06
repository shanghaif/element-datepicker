<template>
  <el-input
    class="el-date-editor el-date-editor--month"
    :readonly="!editable || readonly || type === 'quarter'"
    :disabled="pickerDisabled"
    :size="pickerSize"
    :name="name"
    v-bind="firstInputId"
    v-clickoutside="handleClose"
    :placeholder="placeholder"
    @focus="handleFocus"
    @keydown.native="handleKeydown"
    :value="displayValue"
    @input="(value) => (userInput = value)"
    @change="handleChange"
    @mouseenter.native="handleMouseEnter"
    @mouseleave.native="showClose = false"
    :validateEvent="false"
    ref="reference"
  >
    <i slot="prefix" class="el-input__icon" :class="triggerClass" @click="handleFocus"> </i>
    <i
      slot="suffix"
      class="el-input__icon"
      @click="handleClickIcon"
      :class="[showClose ? '' + clearIcon : '']"
      v-if="haveTrigger"
    >
    </i>
  </el-input>
</template>

<script>
import Vue from 'vue';
import Clickoutside from 'element-ui/src/utils/clickoutside';
import { formatDate, isDateObject, parseDate } from 'element-ui/src/utils/date-util';
import Popper from 'element-ui/src/utils/vue-popper';
import Emitter from 'element-ui/src/mixins/emitter';
import ElInput from 'element-ui/packages/input';
import merge from 'element-ui/src/utils/merge';

const NewPopper = {
  props: {
    appendToBody: Popper.props.appendToBody,
    offset: Popper.props.offset,
    boundariesPadding: Popper.props.boundariesPadding,
    arrowOffset: Popper.props.arrowOffset,
  },
  methods: Popper.methods,
  data() {
    return merge({ visibleArrow: true }, Popper.data);
  },
  beforeDestroy: Popper.beforeDestroy,
};
const DEFAULT_FORMATS = {
  quarter: 'yyyyMM',
  halfYear: 'yyyyMM',
  year: 'yyyy',
};
const HAVE_TRIGGER_TYPES = ['year', 'halfYear', 'quarter'];
const DATE_FORMATTER = function (value, format) {
  if (format === 'timestamp') return value.getTime();
  return formatDate(value, format);
};
const DATE_PARSER = function (text, format) {
  if (format === 'timestamp') return new Date(Number(text));
  return parseDate(text, format);
};
const TYPE_VALUE_RESOLVER_MAP = {
  default: {
    formatter(value) {
      if (!value) return '';
      return '' + value;
    },
    parser(text) {
      if (text === undefined || text === '') return null;
      return text;
    },
  },
  date: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER,
  },
  quarter: {
    formatter(value, format) {
      const quarter = value.getMonth() + 1;
      const trueDate = new Date(value);
      let date = formatDate(trueDate, format);
      date = /QQ/.test(date) ? date.replace(/QQ/, quarter < 10 ? '0' + quarter : quarter) : date.replace(/Q/, quarter);
      return date;
    },
    parser(text, format) {
      // parse as if a normal date
      // 时间默认为年月日时分秒这种计时形式，关于时间的配套设施也是基于这种形式。没有基于季度的验证，故借用月份的判断。
      const quarterFormat = format.replaceAll('Q', 'M');
      return TYPE_VALUE_RESOLVER_MAP.date.parser(text, quarterFormat);
    },
  },
  halfYear: {
    formatter(value, format) {
      const halfYear = value.getMonth() + 1;
      const trueDate = new Date(value);
      let date = formatDate(trueDate, format);
      // 根据 format 特殊判断一下。因为显示为上半年、下半年这样的“上”、“下”而非数字。
      if (/\[BB]/.test(format)) {
        // date为“2022上半年”这种形式
        date = date.replace('BB', halfYear === 1 ? '上' : '下');
      } else {
        // date为“202201”这种形式
        date = /BB/.test(date)
          ? date.replace(/BB/, halfYear < 10 ? '0' + halfYear : halfYear)
          : date.replace(/B/, halfYear);
      }
      return date;
    },
    parser(text, format) {
      const numText = text.replace('上半年', '01').replace('下半年', '02');
      // parse as if a normal date
      const halfYearFormat = format.replaceAll('B', 'M');
      return TYPE_VALUE_RESOLVER_MAP.date.parser(numText, halfYearFormat);
    },
  },
  year: {
    formatter: DATE_FORMATTER,
    parser: DATE_PARSER,
  },
};
const PLACEMENT_MAP = {
  left: 'bottom-start',
  center: 'bottom',
  right: 'bottom-end',
};
const parseAsFormatAndType = (value, customFormat, type, rangeSeparator = '-') => {
  if (!value) return null;
  const parser = (TYPE_VALUE_RESOLVER_MAP[type] || TYPE_VALUE_RESOLVER_MAP.default).parser;
  const format = customFormat || DEFAULT_FORMATS[type];
  return parser(value, format, rangeSeparator);
};
const formatAsFormatAndType = (value, customFormat, type) => {
  if (!value) return null;
  const formatter = (TYPE_VALUE_RESOLVER_MAP[type] || TYPE_VALUE_RESOLVER_MAP.default).formatter;
  const format = customFormat || DEFAULT_FORMATS[type];
  return formatter(value, format);
};
/*
 * Considers:
 *   1. Date object
 *   2. date string
 *   3. array of 1 or 2
 */
const valueEquals = function (a, b) {
  // considers Date object and string
  const dateEquals = function (a, b) {
    const aIsDate = a instanceof Date;
    const bIsDate = b instanceof Date;
    if (aIsDate && bIsDate) {
      return a.getTime() === b.getTime();
    }
    if (!aIsDate && !bIsDate) {
      return a === b;
    }
    return false;
  };
  const aIsArray = a instanceof Array;
  const bIsArray = b instanceof Array;
  if (aIsArray && bIsArray) {
    if (a.length !== b.length) {
      return false;
    }
    return a.every((item, index) => dateEquals(item, b[index]));
  }
  if (!aIsArray && !bIsArray) {
    return dateEquals(a, b);
  }
  return false;
};
const isString = function (val) {
  return typeof val === 'string' || val instanceof String;
};
const validator = function (val) {
  // either: String, Array of String, null / undefined
  return (
    val === null ||
    val === undefined ||
    isString(val) ||
    (Array.isArray(val) && val.length === 2 && val.every(isString))
  );
};
export default {
  name: 'thtf-picker',
  mixins: [Emitter, NewPopper],
  inject: {
    elForm: {
      default: '',
    },
    elFormItem: {
      default: '',
    },
  },
  props: {
    size: String,
    format: String,
    valueFormat: String,
    readonly: Boolean,
    placeholder: String,
    prefixIcon: String,
    clearIcon: {
      type: String,
      default: 'el-icon-circle-close',
    },
    name: {
      default: '',
      validator,
    },
    disabled: Boolean,
    clearable: {
      type: Boolean,
      default: true,
    },
    id: {
      default: '',
      validator,
    },
    popperClass: String,
    editable: {
      type: Boolean,
      default: true,
    },
    align: {
      type: String,
      default: 'left',
    },
    value: {},
    defaultValue: {},
    rangeSeparator: {
      default: '-',
    },
    validateEvent: {
      type: Boolean,
      default: true,
    },
  },
  components: { ElInput },
  directives: { Clickoutside },
  data() {
    return {
      pickerVisible: false,
      showClose: false,
      userInput: null,
      valueOnOpen: null, // value when picker opens, used to determine whether to emit change
      // unwatchPickerOptions: null,
    };
  },
  watch: {
    pickerVisible(val) {
      if (this.readonly || this.pickerDisabled) return;
      if (val) {
        this.showPicker();
        this.valueOnOpen = Array.isArray(this.value) ? [...this.value] : this.value;
      } else {
        this.hidePicker();
        this.emitChange(this.value);
        this.userInput = null;
        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.blur');
        }
        this.$emit('blur', this);
        this.blur();
      }
    },
    // ①渲染 --> computed#parsedValue --> watch#parsedValue
    parsedValue: {
      immediate: true,
      handler(val) {
        if (this.picker) {
          this.picker.value = val;
        }
      },
    },
    defaultValue(val) {
      // NOTE: should eventually move to jsx style picker + panel ?
      if (this.picker) {
        this.picker.defaultValue = val;
      }
    },
    value(val, oldVal) {
      if (!valueEquals(val, oldVal) && !this.pickerVisible && this.validateEvent) {
        this.dispatch('ElFormItem', 'el.form.change', val);
      }
    },
  },
  computed: {
    ranged() {
      return this.type.indexOf('range') > -1;
    },
    reference() {
      const reference = this.$refs.reference;
      return reference.$el || reference;
    },
    refInput() {
      if (this.reference) {
        return [].slice.call(this.reference.querySelectorAll('input'));
      }
      return [];
    },
    valueIsEmpty() {
      const val = this.value;
      if (val) {
        return false;
      }
      return true;
    },
    // ②L:21
    triggerClass() {
      return this.prefixIcon || 'el-icon-date';
    },
    selectionMode() {
      if (this.type === 'quarter') {
        return 'quarter';
      } else if (this.type === 'halfYear') {
        return 'halfYear';
      } else if (this.type === 'year') {
        return 'year';
      }
      return 'quarter';
    },
    // ②L:27
    haveTrigger() {
      if (typeof this.showTrigger !== 'undefined') {
        return this.showTrigger;
      }
      return HAVE_TRIGGER_TYPES.indexOf(this.type) !== -1;
    },
    // ②L:13
    displayValue() {
      const formattedValue = formatAsFormatAndType(this.parsedValue, this.format, this.type, this.rangeSeparator);
      if (Array.isArray(this.userInput)) {
        return [
          this.userInput[0] || (formattedValue && formattedValue[0]) || '',
          this.userInput[1] || (formattedValue && formattedValue[1]) || '',
        ];
      } else if (this.userInput !== null) {
        return this.userInput;
      } else if (formattedValue) {
        return formattedValue;
      } else {
        return '';
      }
    },
    // ①渲染时，绑定 value, value 变化调用 parseValue
    // ①然后调用 watch parseValue 相关方法
    parsedValue() {
      if (!this.value) return this.value; // component value is not set
      if (this.type === 'time-select') return this.value; // time-select does not require parsing, this might change in next major version
      const valueIsDateObject =
        isDateObject(this.value) || (Array.isArray(this.value) && this.value.every(isDateObject));
      if (valueIsDateObject) {
        return this.value;
      }
      if (this.valueFormat) {
        return parseAsFormatAndType(this.value, this.valueFormat, this.type, this.rangeSeparator) || this.value;
      }
      // NOTE: deal with common but incorrect usage, should remove in next major version
      // user might provide string / timestamp without value-format, coerce them into date (or array of date)
      return Array.isArray(this.value) ? this.value.map((val) => new Date(val)) : new Date(this.value);
    },
    // ②由 computed#pickerSize 调用
    _elFormItemSize() {
      return (this.elFormItem || {}).elFormItemSize;
    },
    // ②L:6，渲染时调用
    pickerSize() {
      return this.size || this._elFormItemSize || (this.$ELEMENT || {}).size;
    },
    // ②L:5, 渲染时调用
    pickerDisabled() {
      return this.disabled || (this.elForm || {}).disabled;
    },
    // ②L:8，但它执行顺序比 computed#displayValue 晚
    firstInputId() {
      const obj = {};
      const id = this.id;
      if (id) obj.id = id;
      return obj;
    },
  },
  created() {
    // ①渲染 --> computed --> watch --> created
    // vue-popper
    this.popperOptions = {
      boundariesPadding: 0,
      gpuAcceleration: false,
    };
    this.placement = PLACEMENT_MAP[this.align] || PLACEMENT_MAP.left;
    this.$on('fieldReset', this.handleFieldReset);
  },
  methods: {
    focus() {
      this.$refs.reference.focus();
    },
    blur() {
      this.refInput.forEach((input) => input.blur());
    },
    formatToValue(date) {
      const isFormattable = isDateObject(date) || (Array.isArray(date) && date.every(isDateObject));
      if (this.valueFormat && isFormattable) {
        return formatAsFormatAndType(date, this.valueFormat, this.type, this.rangeSeparator);
      } else {
        return date;
      }
    },
    // {parse, formatTo} String deals with user input
    parseString(value) {
      const type = Array.isArray(value) ? this.type : this.type.replace('range', '');
      return parseAsFormatAndType(value, this.format, type);
    },
    handleMouseEnter() {
      if (this.readonly || this.pickerDisabled) return;
      if (!this.valueIsEmpty && this.clearable) {
        this.showClose = true;
      }
    },
    handleChange() {
      if (this.userInput) {
        const value = this.parseString(this.displayValue);
        if (value) {
          this.picker.value = value;
          if (this.isValidValue(value)) {
            this.emitInput(value);
            this.userInput = null;
          }
        }
      }
      if (this.userInput === '') {
        this.emitInput(null);
        this.emitChange(null);
        this.userInput = null;
      }
    },
    handleClickIcon(event) {
      if (this.readonly || this.pickerDisabled) return;
      if (this.showClose) {
        this.valueOnOpen = this.value;
        event.stopPropagation();
        this.emitInput(null);
        this.emitChange(null);
        this.showClose = false;
        if (this.picker && typeof this.picker.handleClear === 'function') {
          this.picker.handleClear();
        }
      } else {
        this.pickerVisible = !this.pickerVisible;
      }
    },
    handleClose() {
      if (!this.pickerVisible) return;
      this.pickerVisible = false;
      if (this.type === 'dates') {
        // restore to former value
        const oldValue =
          parseAsFormatAndType(this.valueOnOpen, this.valueFormat, this.type, this.rangeSeparator) || this.valueOnOpen;
        this.emitInput(oldValue);
      }
    },
    handleFieldReset(initialValue) {
      this.userInput = initialValue === '' ? null : initialValue;
    },
    handleFocus() {
      const type = this.type;
      if (HAVE_TRIGGER_TYPES.indexOf(type) !== -1 && !this.pickerVisible) {
        this.pickerVisible = true;
      }
      this.$emit('focus', this);
    },
    handleKeydown(event) {
      const keyCode = event.keyCode;
      // ESC
      if (keyCode === 27) {
        this.pickerVisible = false;
        event.stopPropagation();
        return;
      }
      // Tab
      if (keyCode === 9) {
        if (!this.ranged) {
          this.handleChange();
          this.pickerVisible = this.picker.visible = false;
          this.blur();
          event.stopPropagation();
        } else {
          // user may change focus between two input
          setTimeout(() => {
            if (this.refInput.indexOf(document.activeElement) === -1) {
              this.pickerVisible = false;
              this.blur();
              event.stopPropagation();
            }
          }, 0);
        }
        return;
      }
      // Enter
      if (keyCode === 13) {
        if (this.userInput === '' || this.isValidValue(this.parseString(this.displayValue))) {
          this.handleChange();
          this.pickerVisible = this.picker.visible = false;
          this.blur();
        }
        event.stopPropagation();
        return;
      }
      // if user is typing, do not let picker handle key input
      if (this.userInput) {
        event.stopPropagation();
        return;
      }
      // delegate other keys to panel
      if (this.picker && this.picker.handleKeydown) {
        this.picker.handleKeydown(event);
      }
    },
    hidePicker() {
      if (this.picker) {
        this.picker.resetView && this.picker.resetView();
        this.pickerVisible = this.picker.visible = false;
        this.destroyPopper();
      }
    },
    showPicker() {
      if (this.$isServer) return;
      if (!this.picker) {
        this.mountPicker();
      }
      this.pickerVisible = this.picker.visible = true;
      this.updatePopper();
      this.picker.value = this.parsedValue;
      this.picker.resetView && this.picker.resetView();
      this.$nextTick(() => {
        this.picker.adjustSpinners && this.picker.adjustSpinners();
      });
    },
    mountPicker() {
      this.picker = new Vue(this.panel).$mount();
      this.picker.defaultValue = this.defaultValue;
      this.picker.popperClass = this.popperClass;
      this.popperElm = this.picker.$el;
      this.picker.type = this.type;
      this.picker.width = this.reference.getBoundingClientRect().width;
      this.picker.selectionMode = this.selectionMode;
      this.$watch('format', (format) => {
        this.picker.format = format;
      });
      const updateOptions = () => {
        // main format must prevail over undocumented pickerOptions.format
        if (this.format) {
          this.picker.format = this.format;
        }
      };
      updateOptions();
      this.$el.appendChild(this.picker.$el);
      this.picker.resetView && this.picker.resetView();
      this.picker.$on('dodestroy', this.doDestroy);
      this.picker.$on('pick', (date = '', visible = false) => {
        this.userInput = null;
        this.pickerVisible = this.picker.visible = visible;
        this.emitInput(date);
        this.picker.resetView && this.picker.resetView();
      });
    },
    unmountPicker() {
      if (this.picker) {
        this.picker.$destroy();
        this.picker.$off();
        // if (typeof this.unwatchPickerOptions === 'function') {
        //   this.unwatchPickerOptions();
        // }
        this.picker.$el.parentNode.removeChild(this.picker.$el);
      }
    },
    emitChange(val) {
      // determine user real change only
      if (!valueEquals(val, this.valueOnOpen)) {
        this.$emit('change', val);
        this.valueOnOpen = val;
        if (this.validateEvent) {
          this.dispatch('ElFormItem', 'el.form.change', val);
        }
      }
    },
    emitInput(val) {
      const formatted = this.formatToValue(val);
      if (!valueEquals(this.value, formatted)) {
        this.$emit('input', formatted);
      }
    },
    isValidValue(value) {
      if (!this.picker) {
        this.mountPicker();
      }
      if (this.picker.isValidValue) {
        return value && this.picker.isValidValue(value);
      } else {
        return true;
      }
    },
  },
};
</script>
