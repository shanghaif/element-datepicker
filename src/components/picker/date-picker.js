import Picker from '../picker';
import DatePanel from '../panel/date';

const getPanel = function () {
  return DatePanel;
};

export default {
  mixins: [Picker],

  name: 'ThtfDatePicker',

  props: {
    type: {
      type: String,
      default: 'quarter',
    },
  },

  watch: {
    type(type) {
      if (this.picker) {
        this.unmountPicker();
        this.panel = getPanel(type);
        this.mountPicker();
      } else {
        this.panel = getPanel(type);
      }
    },
  },

  created() {
    // ①
    this.panel = getPanel(this.type);
  },
};
