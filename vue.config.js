module.exports = {
  transpileDependencies: [],
  lintOnSave: false, // ESLint 검증 비활성화
  configureWebpack: {
    resolve: {
      alias: {
        'vue$': 'vue/dist/vue.esm.js'
      }
    }
  },
  devServer: {
    port: 8080,
    open: true
  }
}
