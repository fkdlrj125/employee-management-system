const webpack = require('webpack');

module.exports = {
  transpileDependencies: [],
  lintOnSave: false, // ESLint 검증 비활성화
  devServer: {
    host: '0.0.0.0',
    port: 8081,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        __VUE_PROD_HYDRATION_MISMATCH_DETAILS__: JSON.stringify(false),
      }),
    ],
  },
}
