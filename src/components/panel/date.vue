<template>
  <transition name="el-zoom-in-top">
    <div
      v-show="visible"
      class="el-picker-panel el-date-picker el-popper"
      :class="[
        {
          'has-sidebar': $slots.sidebar,
        },
        popperClass,
      ]"
    >
      <div class="el-picker-panel__body-wrapper">
        <slot name="sidebar" class="el-picker-panel__sidebar"></slot>
        <div class="el-picker-panel__body">
          <div
            class="el-date-picker__header"
            :class="{ 'el-date-picker__header--bordered': currentView === 'year' || currentView === 'month' }"
            v-show="currentView !== 'time'"
          >
            <button
              type="button"
              @click="prevYear"
              :aria-label="t(`el.datepicker.prevYear`)"
              class="el-picker-panel__icon-btn el-date-picker__prev-btn el-icon-d-arrow-left"
            ></button>
            <span @click="showYearPicker" role="button" class="el-date-picker__header-label">{{ yearLabel }}</span>
            <button
              type="button"
              @click="nextYear"
              :aria-label="t(`el.datepicker.nextYear`)"
              class="el-picker-panel__icon-btn el-date-picker__next-btn el-icon-d-arrow-right"
            ></button>
          </div>

          <div class="el-picker-panel__content">
            <year-table
              v-show="currentView === 'year'"
              @pick="handleYearPick"
              :value="value"
              :default-value="defaultValue ? new Date(defaultValue) : null"
              :date="date"
              :disabled-date="disabledDate"
            >
            </year-table>
            <half-year-table
              v-show="currentView === 'halfYear'"
              @pick="handleHalfYearPick"
              :value="value"
              :default-value="defaultValue ? new Date(defaultValue) : null"
              :date="date"
              :disabled-date="disabledDate"
            >
            </half-year-table>
            <quarter-table
              v-show="currentView === 'quarter'"
              @pick="handleQuarterPick"
              :value="value"
              :default-value="defaultValue ? new Date(defaultValue) : null"
              :date="date"
              :disabled-date="disabledDate"
            >
            </quarter-table>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script type="text/babel">
import {
  changeYearMonthAndClampDate,
  clearTime,
  isDate,
  modifyDate,
  nextYear,
  prevYear,
  timeWithinRange,
} from 'element-ui/src/utils/date-util';
import Clickoutside from 'element-ui/src/utils/clickoutside';
import Locale from 'element-ui/src/mixins/locale';
import YearTable from 'element-ui/packages/date-picker/src/basic/year-table';
import QuarterTable from '../basic/quarter-table';
import HalfYearTable from '../basic/half-year-table';

export default {
  name: 'thtf-date',
  mixins: [Locale],
  directives: { Clickoutside },
  watch: {
    value(val) {
      if (isDate(val)) {
        this.date = new Date(val);
      } else {
        this.date = this.getDefaultValue();
      }
    },
    defaultValue(val) {
      if (!isDate(this.value)) {
        this.date = val ? new Date(val) : new Date();
      }
    },
    selectionMode(newVal) {
      switch (newVal) {
        case 'quarter':
          this.currentView = 'quarter';
          break;
        case 'halfYear':
          this.currentView = 'halfYear';
          break;
        case 'year':
          this.currentView = 'year';
          break;
        default:
          this.currentView = 'quarter';
      }
    },
  },
  methods: {
    handleClear() {
      this.date = this.getDefaultValue();
      this.$emit('pick', null);
    },
    emit(value, ...args) {
      if (!value) {
        this.$emit('pick', value, ...args);
      } else {
        this.$emit('pick', clearTime(value), ...args);
      }
    },
    showYearPicker() {
      this.currentView = 'year';
    },
    prevYear() {
      if (this.currentView === 'year') {
        this.date = prevYear(this.date, 10);
      } else {
        this.date = prevYear(this.date);
      }
    },
    nextYear() {
      if (this.currentView === 'year') {
        this.date = nextYear(this.date, 10);
      } else {
        this.date = nextYear(this.date);
      }
    },
    handleQuarterPick(month) {
      if (this.selectionMode === 'quarter') {
        this.date = modifyDate(this.date, this.year, month, 1);
        this.emit(this.date);
      }
    },
    handleHalfYearPick(month) {
      if (this.selectionMode === 'halfYear') {
        this.date = modifyDate(this.date, this.year, month, 1);
        this.emit(this.date);
      }
    },
    handleYearPick(year) {
      if (this.selectionMode === 'year') {
        this.date = modifyDate(this.date, year, 0, 1);
        this.emit(this.date);
      } else {
        this.date = changeYearMonthAndClampDate(this.date, year, this.month);
        // 优先使用自定义类型
        this.currentView = this.type || 'quarter';
      }
    },
    resetView() {
      if (this.selectionMode === 'quarter') {
        this.currentView = 'quarter';
      } else if (this.selectionMode === 'halfYear') {
        this.currentView = 'halfYear';
      } else if (this.selectionMode === 'year') {
        this.currentView = 'year';
      } else {
        this.currentView = 'quarter';
      }
    },
    isValidValue(value) {
      return (
        value &&
        !isNaN(value) &&
        (typeof this.disabledDate === 'function' ? !this.disabledDate(value) : true) &&
        this.checkDateWithinRange(value)
      );
    },
    getDefaultValue() {
      // if default-value is set, return it
      // otherwise, return now (the moment this method gets called)
      return this.defaultValue ? new Date(this.defaultValue) : new Date();
    },
    checkDateWithinRange(date) {
      return this.selectableRange.length > 0
        ? timeWithinRange(date, this.selectableRange, this.format || 'HH:mm:ss')
        : true;
    },
  },
  components: {
    YearTable,
    HalfYearTable,
    QuarterTable,
  },
  data() {
    return {
      popperClass: '',
      date: new Date(),
      value: '',
      defaultValue: null, // use getDefaultValue() for time computation
      selectionMode: 'quarter',
      visible: false,
      currentView: 'date',
      disabledDate: '',
      cellClassName: '',
      selectableRange: [],
      format: '',
    };
  },
  computed: {
    year() {
      return this.date.getFullYear();
    },
    month() {
      return this.date.getMonth();
    },
    yearLabel() {
      const yearTranslation = this.t('el.datepicker.year');
      if (this.currentView === 'year') {
        const startYear = Math.floor(this.year / 10) * 10;
        if (yearTranslation) {
          return startYear + ' ' + yearTranslation + ' - ' + (startYear + 9) + ' ' + yearTranslation;
        }
        return startYear + ' - ' + (startYear + 9);
      }
      return this.year + ' ' + yearTranslation;
    },
  },
};
</script>
