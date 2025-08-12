module.exports = {
  transpileDependencies: [],
  lintOnSave: false, // ESLint 검증 비활성화
  devServer: {
    port: 8080,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  }
}
