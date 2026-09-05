Go.views({
  "/*": {
    name: "home",
    html: "/app/html/home.html",
    target: ".app.body",
    title: () => `${Go.lang("app_name")} - ${Go.lang("app_description")}`,
    routes: {
      "/*": {
        name: "home",
        fn: () => Go.do("home:route"),
      },
    },
  },
  404: {
    title: Go.lang("404"),
    target: ".body",
    html: "/app/html/404.html",
    name: "404",
  },
});
