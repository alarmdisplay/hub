module.exports = {
  devServer: {
    proxy: 'http://localhost:3030/'
  },
  publicPath: process.env.NODE_ENV === 'production' ? '/console/' : '/'
}
