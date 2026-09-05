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
