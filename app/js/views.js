Go.views({
  "/app/games/*": {
    name: "home",
    html: "/app/html/home.html",
    target: ".app.body",
    title: `${Go.lang("app_name")} - ${Go.lang("app_description")}`,
    routes: {
      "/*": {
        name: "home",
        fn: () => Go.do("home:route"),
      },
    },
  },
});
