Go.set("home:route", function () {
  return Go.create({
    tag: "main",
    class: "mainBody",
    target: ".app.body",
    childrens: [
      {
        tag: "app-header",
      },
      {
        tag: "div",
        class: "mainMenu",
        childrens: Go.do("apps:list").map((app, index) => Go.do("apps:app", app, index)),
      },
    ],
  });
});

Go.set("home:menu", function () {
  return (this.menu = Go.menu({
    icon: Go.config("appIcon"),
    title: Go.env("company_name"),
    options: [
      {
        label: Go.lang("language"),
        fn: () => Go.src("/app/js/").language(),
      },
    ],
  }));
});
