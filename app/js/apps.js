Go.set("apps:list", function () {
  return [
    {
      name: Go.lang("operative_system"),
      icon: "/app/img/icons/512x512.png",
      src: "https://www.luigios.com/app/luigios/",
      description: Go.lang("operative_system_description"),
    },
    {
      name: Go.lang("games"),
      icon: "/app/img/all/games.png",
      src: "https://www.luigios.com/app/games/",
      description: Go.lang("games_description"),
    },
    {
      name: Go.lang("apps"),
      icon: "/app/img/all/apps.png",
      src: "https://www.luigios.com/app/desktop/",
      description: Go.lang("apps_description"),
    },
  ];
});

Go.set("apps:app", function (app, index) {
  return {
    tag: "a",
    class: "appIcon",
    href: Go.getProp(app, "src", `/app/${Go.getProp(app, "name")}`),
    target: "_blank",
    childrens: [
      { tag: "picture", class: "icon", style: { "--icon": `url(${Go.getProp(app, "icon")})` } },
      { tag: "div", class: "name", html: Go.getProp(app, "name") },
      { tag: "div", class: "description", html: Go.getProp(app, "description") },
    ],
    animation: {
      delay: 50 * index,
      from: { opacity: 0, transform: "translateX(50px) scale(1.5)" },
      to: { opacity: 1, transform: "translateX(0) scale(1)" },
    },
  };
});
