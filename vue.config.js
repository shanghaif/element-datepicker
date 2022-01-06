// 详细配置参数请参考：https://cli.vuejs.org/zh/config/#%E5%85%A8%E5%B1%80-cli-%E9%85%8D%E7%BD%AE

module.exports = {
  publicPath: './',
  productionSourceMap: false,
  css: {
    extract: false,
  },
  // webpack相关
  configureWebpack: (config) => {
    if (process.env.NODE_ENV === 'production') {
      config.output = Object.assign(config.output, {
        libraryExport: 'default',
      });
    } else {
      // 为开发环境修改配置...
    }
  },
};
