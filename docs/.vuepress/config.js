module.exports = {
  base:'/fancy-select/',
  title: "fancy-select",
  themeConfig: {
    port: 8080, //端口,
    displayAllHeaders: true,
    search: false,
    nav: [
      {
        text: "链接", // 这里是下拉列表展现形式。
        items: [
          {
            text: "github",
            link: "https://github.com/ajiangpz/fancy-select",
          },
          {
            text: "npm",
            link: "https://www.npmjs.com/package/fancy-select2",
          },
        ],
      },
    ],
    // 为以下路由添加侧边栏
    sidebar: [
      ["/page-a", "使用文档"],
    ],
  },
};
