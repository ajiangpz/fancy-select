const MiniCssExtractPlugin = require("mini-css-extract-plugin");
// 压缩css的插件
const optimizeCss = require("optimize-css-assets-webpack-plugin");
module.exports = {
  productionSourceMap: false,
  configureWebpack: {
    output: {
      library: "FancySelect",
    },
    plugins: [
      new MiniCssExtractPlugin({
        filename: "fancy-select2.min.css",
      }),
      new optimizeCss(),
    ],
  },
};
