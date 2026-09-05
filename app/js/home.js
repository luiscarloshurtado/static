Go.set("home:route", function () {
  return Go.create({
    tag: "main",
    class: "mainMenu",
    target: ".app.body",
    childrens: Go.do("apps:list").map((app) => ({
      tag: "a",
      class: "app",
    })),
  });
});
