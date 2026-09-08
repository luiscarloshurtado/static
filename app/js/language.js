export default { init: () => Go.do("language:select") };

Go.cssTag(
  "language",
  `.menu.language {
    --view-background: rgb(0 0 0 / 25%);  
  }
  .menu.language go-icon {
    font-size: 150%;
  }
  .menu.language go-icon img {
    border-radius: 50%;
    background-color: var(--body-background);
  }`
);

Go.set("language").select = function (data = {}) {
  this.class = `center default`;

  if (data.class) this.class = data.class;

  return Go.menu({
    icon: Go.config("appIcon"),
    title: Go.lang("select_language"),
    class: `menu language ${this.class || ""}`,
    animation: "midBottomIn",
    closeOutside: true,
    closeButton: false,
    content: {
      "style-glob": {
        "border-radius": "calc(var(--gap) * 1)",
        "max-height": "75%",
        "max-width": "256px",
        "min-height": "160px",
      },
    },
    parent: {
      "style-glob": {
        "--view-background": "rgb(0 0 0 / 25%)",
        "z-index": "99999",
      },
    },
    options: [
      { label: Go.capitalize(Go.lang("spanish")), key: "es", icon: "/app/img/lang/es.svg" },
      { label: Go.capitalize(Go.lang("english")), key: "en", icon: "/app/img/lang/en.svg" },
    ],
    onSelect: (option) => {
      Go.do("language/set", option);
      data.cb && data.cb(option);
    },
    gestures: {
      swipe: (evt) => {
        Go.gestures(evt).isDir("down") && Go.closeParent(evt);
      },
    },
  });
};

Go.set("language").set = async function ({ key } = {}) {
  Go.storage("lang").set(key);
  Go.storage("headers").set({ lang: key });
  Go.setCookie("lang", key);
  await Go.loader();
  await Go.sleep(200);
  window.location.reload();
};

Go.set("language").button = function () {
  let current = Go.lang().current();
  let flag = `/app/img/lang/${current}.svg`;
  let template = `<go-button class="langButton" icon="${flag}" onclick="Go.do('language/select')"></go-button>`;
  return template;
};

Go.set("language").buttons = function () {
  const current = Go.lang().current();

  const classes = {
    en: current === "en",
    es: current === "es",
  };

  let template = `<a class="${classes["en"]} btn" onclick="Go.do('language/lang', 'en')">${Go.lang("english")}</a>`;
  template += `<a class="${classes["es"]} btn" onclick="Go.do('language/lang', 'es')">${Go.lang("spanish")}</a>`;

  return template;
};

Go.set("language").lang = async function (key) {
  Go.lang().set(key);
  await Go.loader();
  await Go.sleep(500);
  window.location.reload();
};
