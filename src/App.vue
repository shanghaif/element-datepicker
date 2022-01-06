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

<script>
import DatePicker from './components/index';

export default {
  name: 'app',
  components: {
    DatePicker,
  },
  data() {
    return {
      value1: '202203',
      value2: '202202',
    };
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
