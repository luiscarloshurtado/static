import "./views.js";
import "./apps.js";
import "./home.js";

const lang = Go.if({
  cond: () => ["en", "es"].includes(Go.lang().current()),
  true: () => Go.lang().current(),
  else: "en",
});

window.addEventListener("load", () => {
  Go.import(`/app/lang/${lang}.js`, (module) => {
    Go.lang(module);
    Go.do("nav:start");
  });
});
