Go.set("home:route", function () {
  return Go.create({
    tag: "main",
    class: "mainMenu",
    target: ".app.body",
    childrens: Go.do("apps:list").map((app) => ({
      tag: "a",
      class: "app",
      href: Go.getProp(app, "src", `/app/${Go.getProp(app, "name")}`),
      target: "_blank",
      childrens: [
        {
          tag: "div",
          class: "name",
          html: Go.getProp(app, "name"),
        },
      ],
    })),
  });
});
