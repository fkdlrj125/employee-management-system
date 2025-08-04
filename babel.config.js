module.exports = {
  presets: [
    ['@vue/cli-plugin-babel/preset', {
      polyfills: [
        'es.promise',
        'es.array.iterator'
      ],
      targets: {
        ie: '11'
      }
    }]
  ]
}