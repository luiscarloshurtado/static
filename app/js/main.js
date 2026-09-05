import "./icons.js";
import "./views.js";
import "./apps.js";
import "./home.js";

window.addEventListener("load", () => {
  const lang = Go.if({
    cond: () => ["en", "es"].includes(Go.lang().current()),
    true: () => Go.lang().current(),
    else: () => "en",
  });

  Go.import(`/app/lang/${lang}.js`, (module) => {
    Go.lang(module);
    Go.do("nav:start");
  });
});
