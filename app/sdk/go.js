/* Go.js SDK by Luis Carlos Hurtado - MIT License - luiscarloshurtado@live.com */

const [GO, GO_EXTENDS] = [{}, {}];

const GO_ACTIONS = {};

const MOD_LUIGIOS_GOACTIONSJS = GO_ACTIONS;

GO_ACTIONS.iterateActions = function (actions = []) {
  return new Promise(async (resolve, reject) => {
    const results = [];
    for (const action of actions) {
      try {
        const _go = await action.action();
        results.push(_go);
      } catch (error) {
        results.push(error);
      }
    }
    resolve(results);
  });
};

GO_ACTIONS.buff = function (time, fn) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => {
      fn.apply(this, args);
    }, time);
  };
};

Object.assign(GO, MOD_LUIGIOS_GOACTIONSJS);

const GO_AI_INSTANCE = null;

const GO_AI = function (options = {}) {
  this.options = options;

  if (Go.is(options, "string")) {
    this.options = {
      message: options,
    };
  }

  this.ai = null;
  this.engine = null;
  this.model = "Llama-3-8B-Instruct-q4f32_1-MLC";
  this.responseText = "";
  this.error = null;

  this.options.context ||= [
    { role: "system", content: "" },
    { role: "user", content: this.options.message },
  ];

  if (Go.is(options, "string")) {
    return this.prompt();
  }
};

const MOD_LUIGIOS_GOAIJS = {
  ai: function () {
    return new GO_AI(...arguments);
  },
  ia: function () {
    return new GO_AI(...arguments);
  },
};

GO_AI.prototype.load = async function () {
  this.ai = await import("https://esm.run/@mlc-ai/web-llm");
  this.engine = new this.ai.MLCEngine();
  this.engine.setInitProgressCallback(console.info);
  await this.engine.reload(this.model);
  GO_AI_INSTANCE = this.ai;
  return this.ai;
};

GO_AI.prototype.prompt = async function (message) {
  this.message = message;
  return new Promise(this.resolve.bind(this));
};

GO_AI.prototype.resolve = async function (resolve, reject) {
  if (!GO_AI_INSTANCE) await this.load();

  if (this.message) {
    this.options.context.push({ role: "user", content: this.message });
  }

  this._options = {
    messages: this.options.context,
  };

  try {
    this.reply = await this.engine.chat.completions.create(this._options);
    this.responseText = this.reply.choices[0].message;
  } catch (error) {
    console.error(error);
    this.error = error;
  }

  if (!this.message) {
    return resolve(this.responseText);
  }

  return resolve({ message: this.responseText, error: this.error });
};

Object.assign(GO, MOD_LUIGIOS_GOAIJS);

const Alert = function (options = {}, extra = {}) {
  this.options = options || {};
  this.extra = extra || {};
  this.alert = null;
  this.id = Go.uuid();
};

const MOD_LUIGIOS_GOALERTJS = {
  alert: function () {
    return new Alert(...arguments).show();
  },
  pop: function () {
    return new Alert(...arguments).show();
  },
};

Alert.prototype.show = function () {
  if (["string"].includes(typeof this.options)) {
    this.options = { message: this.options };
  }

  Object.assign(this.options, this.extra);

  return (this.view = Go.view({
    title: "",
    header: false,
    closeOutside: true,
    class: "alert go-alert",
    id: this.id,
    animation: "midTopIn",
    keepOnTop: true,
    ...this.options,
    html: Go.create({
      tag: "div",
      class: "alertBody",
      childrens: [
        {
          if: () => this.options.icon,
          tag: "div",
          class: 'alertIcon" tcenter f250',
          childrens: [
            { tag: "go-spacer", num: "1" },
            { tag: "go-icon", name: this.options.icon },
            { tag: "go-spacer", num: "1" },
          ],
        },
        {
          tag: "div",
          class: "alertContent",
          html: this.options.message,
        },
      ],
    }),
    footer: {
      class: "padding block",
      child: {
        tag: "a",
        class: "primary-button alert-button",
        html: Go.lang("accept"),
        onclick: () => this.view.close(),
        attrs: { w100: !0 },
      },
    },
  }));
};

Object.assign(GO, MOD_LUIGIOS_GOALERTJS);

const animations = {};

const Animate = function (options = {}, from, to, duration) {
  this.options = options;
  this.animation = options.animate || animations[options.animation] || animations[options.name] || Go.prop(options.animation, window.animations || {});
  this.animationDuration = options.animationDuration || options.animationTime || duration || 250;
  this.el = options.el || options.target || options.element;
  this.onfinish = options.onfinish;
  this.onstart = options.onstart;
  this.autoRun = Go.getProp(this.options, ["auto", "autorun"]);
  this.from = Go.getProp(this.animation, "from", from);
  this.to = Go.getProp(this.animation, "to", to);
  if (this.autoRun) {
    try {
      this[this.autoRun]();
    } catch (error) {
      this.open();
    }
  }
};

const MOD_LUIGIOS_GOANIMATEJS = {
  animate: function () {
    return new Animate(...arguments);
  },
};

Animate.prototype.goAnimate = function (el, from, to, duration) {
  if (["string"].includes(typeof el)) {
    el = document.querySelector(el);
  }

  duration ||= this.animationDuration;
  from ||= Go.getProp(this.animation, "from", this.options.from);
  to ||= Go.getProp(this.animation, "to", this.options.to);

  return new Promise((resolve) => {
    const animation = el.animate([from, to], {
      duration: duration,
      easing: Go.getProp(this.animation, "easing", "ease-in-out"),
      fill: Go.getProp(this.animation, "fill", "forwards"),
    });

    if (["function"].includes(typeof this.onstart)) {
      this.onstart(el);
    }

    animation.onfinish = () => {
      if (["function"].includes(typeof this.onfinish)) {
        this.onfinish(el);
      }
      resolve(el);
    };
  });
};

Animate.prototype.getAnimation = function () {
  return this.animation;
};

Animate.prototype.open = function (cb) {
  if (!this.el) {
    return this.callback(cb);
  }

  return this.goAnimate(this.el, this.from, this.to, this.animationDuration).then(() => {
    this.callback(cb);
  });
};

Animate.prototype.close = function (cb) {
  if (!this.el) {
    return this.callback(cb);
  }

  return this.goAnimate(this.el, this.to, this.from, this.animationDuration).then(() => {
    this.callback(cb);
  });
};

Animate.prototype.go = function (cb) {
  return this.open(cb);
};

Animate.prototype.callback = function (cb) {
  if (["function"].includes(typeof cb)) {
    return cb();
  }
};

Object.assign(animations, {
  fadeIn: {
    from: {
      opacity: 0,
    },
    to: {
      opacity: 1,
    },
  },
  leftIn: {
    from: {
      transform: "translateX(-100%)",
    },
    to: {
      transform: "translateX(0)",
    },
  },
  rightIn: {
    from: {
      transform: "translateX(100%)",
    },
    to: {
      transform: "translateX(0)",
    },
  },
  midRightIn: {
    from: {
      opacity: 0,
      transform: "translate3d(50%, 0, 0)",
    },
    to: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  },
  midLeftIn: {
    from: {
      opacity: 0,
      transform: "translate3d(-50%, 0, 0)",
    },
    to: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  },
  topIn: {
    from: {
      opacity: 0,
      transform: "translate3d(0, -100%, 0)",
    },
    to: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  },
  bottomIn: {
    from: {
      opacity: 0,
      transform: "translate3d(0, 100%, 0)",
    },
    to: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  },
  zoomIn: {
    from: {
      opacity: 0,
      transform: "scale(0.5)",
    },
    to: {
      opacity: 1,
      transform: "scale(1)",
    },
  },
  zoomOut: {
    from: {
      opacity: 1,
      transform: "scale(1.5)",
    },
    to: {
      opacity: 0,
      transform: "scale(1)",
    },
  },
  rotateIn: {
    from: {
      opacity: 0,
      transform: "rotate(-90deg)",
    },
    to: {
      opacity: 1,
      transform: "rotate(0)",
    },
  },
  midTopIn: {
    from: {
      opacity: 0,
      transform: "translate3d(0, -50%, 0)",
    },
    to: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  },
  midBottomIn: {
    from: {
      opacity: 0,
      transform: "translate3d(0, 50%, 0)",
    },
    to: {
      opacity: 1,
      transform: "translate3d(0, 0, 0)",
    },
  },
  slideBottomIn: {
    from: {
      opacity: 0,
      transform: "translateY(100%)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0)",
    },
  },
  slideBottomIn3D: {
    from: {
      opacity: 0,
      transform: "translateZ(-100px) translateY(100%)",
    },
    to: {
      opacity: 1,
      transform: "translateZ(0) translateY(0)",
    },
  },
  bottomZoomIn: {
    from: {
      opacity: 0,
      transform: "translateY(100%) scale(0.5)",
    },
    to: {
      opacity: 1,
      transform: "translateY(0) scale(1)",
    },
  },
  midZoomIn: {
    from: {
      opacity: 0,
      transform: "scale(0.75)",
    },
    to: {
      opacity: 1,
      transform: "scale(1)",
    },
  },
  midZoomOut: {
    from: {
      opacity: 1,
      transform: "scale(1)",
    },
    to: {
      opacity: 0,
      transform: "scale(0.75)",
    },
  },
});

Object.assign(GO, MOD_LUIGIOS_GOANIMATEJS);

const GO_ANIMATION = function (element) {
  this.element = element;
  this.init();
};

const MOD_LUIGIOS_GOANIMATIONJS = {
  animation: function () {
    return new GO_ANIMATION(...arguments);
  },
};

GO_ANIMATION.prototype.init = function () {
  if (Go.is(this.element, "string")) {
    this.element = document.querySelector(this.element);
  }
};

GO_ANIMATION.prototype.collapse = async function (wait = 1000) {
  if (!this.element) return;
  this.element.classList.add("deleted");
  this.element.style.height = this.element.offsetHeight + "px";
  this.element.style.opacity = "0.3";
  this.element.style.transition = "all 1s ease";
  await Go.sleep(100);
  this.element.style.height = "0";
  await Go.sleep(wait);
  return this.element;
};

Object.assign(GO, MOD_LUIGIOS_GOANIMATIONJS);

const GO_API = function (data = {}) {
  this.data = data;
  this.loader = Go.getProp(data, "loader");
  this.src = Go.getProp(data, ["src", "url", "server", "endpoint"]);
  this.src = Go.getProp(data, ["src", "url", "endpoint"]);
  this.delay = Go.getProp(data, ["delay", "await", "sleep"]);
  this.method = Go.getProp(data, "method", "post").toLowerCase();
  this.validate = Go.getProp(data, ["validate", "validator", "requires", "required"]);
  this.data.error ||= Go.getProp(data, ["onerror", "onError"]);
  this.host = this.host();
  this.can = true;
  this.req = {};
};

const MOD_LUIGIOS_GOAPIJS = {
  api: function () {
    return new GO_API(...arguments).run();
  },
};

GO_API.prototype.host = function () {
  return Go.if([
    {
      cond: () => Go.startsWith(this.src, "host://"),
      then: () => Go.url(Go.host("", this.src.replace("host://", ""))).fix(),
    },
    {
      cond: () => Go.startsWith(this.src, "http"),
      then: () => Go.url(this.src).fix(),
    },
    {
      cond: () => Go.startsWith(this.src, "/"),
      then: () => Go.base("", this.src),
      else: () => Go.base("", `/${Go.config("apiEndpoint") || "server"}/${this.src}`),
    },
  ]);
};

GO_API.prototype.run = async function () {
  if (!this.data || !this.src) {
    return;
  }

  this.cacheData = Go.state(this.src) || Go.state(this.data.cacheId);

  if (this.cacheData) {
    return Go.if({
      cond: () => ["function"].includes(typeof this.data.success),
      then: () => {
        this.data.success(this.cacheData);
        return this.cacheData;
      },
      else: () => this.cacheData,
    });
  }

  if (["function"].includes(typeof this.data.body)) {
    this.data.body = await this.data.body();
  }

  if (Go.isElement(this.data.body) && Go.is(this.data.body, "tagName", "form")) {
    this.data.body = new FormData(this.data.body);
  }

  if (this.data.if) {
    this.can = ["function"].includes(typeof this.data.if) ? await this.data.if() : this.data.if;
  }

  if (!this.can && !this.data.else) {
    return void Go.exec(
      () => Go.close(this.loader),
      () => this.data.finish && this.data.finish(this.req)
    );
  }

  if (["function"].includes(typeof this.data.else)) {
    this.data.else = await this.data.else();
  }

  if (!this.can && this.data.else) {
    return Go.api(this.data.else);
  }

  if (!this.can) {
    return void Go.exec(
      () => Go.close(this.loader),
      () => this.data.finish && this.data.finish(this.req)
    );
  }

  if (this.data.append && Go.is(this.data.body, "FormData")) {
    Go.for(this.data.append, (key, value) => this.data.body.append(key, value));
  } else if (this.data.append) {
    Go.for(this.data.append, (key, value) => (this.data.body[key] = value));
  }

  if (this.validate) {
    this.validate = Go.validate(this.data.body, this.validate);
  }

  if (this.validate) {
    this.validate.message = Go.lang(this.validate.message);
    return Go.if({
      cond: () => ["function"].includes(Go.getProp(this.data, "loader.close")),
      then: () => this.data.loader.close(() => this.data.error && this.data.error(this.validate)),
      else: () => this.data.error && this.data.error(this.validate),
    });
  }

  if (["function"].includes(typeof this.data.start)) {
    this.data.start();
  }

  this.loader = await Go.if({
    cond: () => ["function"].includes(typeof this.data.loader),
    then: () => this.data.loader(),
    else: () => this.data.loader,
  });

  Go.if({
    then: () => this.loader.loading(),
    else: () => ["function"].includes(typeof Go.getProp(this.loader, "open")) && this.loader.open(),
    cond: () => ["function"].includes(typeof Go.getProp(this.loader, "loading")),
  });

  try {
    this.req = await Go.if({
      cond: () => ["function"].includes(typeof this.data.request),
      then: () => this.data.request(this.data),
      else: () =>
        Go.http[this.method](this.host, {
          ...this.data,
          src: this.src,
          body: Go.getProp(this.data, ["body", "data"]),
          header: Go.getProp(this.data, ["headers", "body.headers"]),
        }),
    });
  } catch (error) {
    this.req = { error, message: Go.getErrorMessage(error) };
    if (Go.getProp(this.data, ["log", "logs", "debug"])) {
      console.log(error);
    }
  }

  this.isSuccess = Go.getProp(this.req, ["success", "ok", "items.length"], Go.eq(this.req.icon, "success"));

  if (this.data.cache && this.isSuccess) {
    Go.state(this.src, this.req);
  } else if (this.data.cacheId && !this.req.error) {
    Go.state(this.data.cacheId, this.req);
  }

  Go.if({
    then: () => this.loader.loading(false),
    else: () => Go.close(this.loader),
    cond: () => ["function"].includes(typeof Go.getProp(this.loader, "loading")),
  });

  Go.if({
    then: () => this.data.success(this.req),
    else: () => ["function"].includes(typeof this.data.error) && this.data.error(this.req),
    cond: () => this.isSuccess && ["function"].includes(typeof this.data.success),
  });

  if (["function"].includes(typeof this.data.finish)) {
    this.data.finish(this.req);
  }

  return this.req;
};

Object.assign(GO, MOD_LUIGIOS_GOAPIJS);

const GO_APP = function () {
  this.keyName = "";
};

const MOD_LUIGIOS_GOAPPJS = { app: new GO_APP() };

GO_APP.prototype.setApp = function (data) {
  Object.assign(this, data);
  Go.extends(this, Go.Events);
};

GO_APP.prototype.getIcon = function (size) {
  return this.images[`icon-${size}x${size}`] && this.images[`icon-${size}x${size}`]["src"];
};

GO_APP.prototype.load = function (src) {
  let path = `/app/${this.keyName}/res/${src}`;
  return Go.load(path);
};

GO_APP.prototype.res = function () {
  return this.load(...arguments);
};

GO_APP.prototype.resolve = function (src) {
  let path = `/app/${this.keyName}/res/${src}`;
  return path;
};

GO_APP.prototype.noItemsTemplate = function () {
  this.noTemplate = `<div class="errorCard">`;
  this.noTemplate += `<div class="icon"><go-icon name="empty_doc"></go-icon></div>`;
  this.noTemplate += `<div semi-bold>${Go.lang("no_items_found")}</div>`;
  this.noTemplate += `</div>`;
  return this.noTemplate;
};

Object.assign(GO, MOD_LUIGIOS_GOAPPJS);

const Calendar = function (data = {}) {
  if (typeof data === "string") data = { date: data };
  else if (Go.is(data, "Date")) data = { date: data };
  this.data = data;
  this.title = data.title || Go.lang("calendar");
  this.lang = data.lang || Go.currentLang() || "en";
  this.date = Go.Date(data.date || data.value);
  this.year = +this.date.year();
  this.month = +this.date.month() - 1;
  this.day = +this.date.day();
  this.id = data.id || Go.uuid();
  this.current = { year: this.year, month: this.month, day: this.day, date: this.date };
  this.open();
};

const MOD_LUIGIOS_GOCALENDARJS = { calendar: (data) => new Calendar(data) };

Calendar.prototype.daysNames = {
  en: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
  es: ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"],
};

Calendar.prototype.monthsNames = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  es: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Setiembre", "Octubre", "Noviembre", "Diciembre"],
};

Calendar.prototype.open = function () {
  this.view = Go.view({
    title: this.title,
    closeOutside: true,
    animation: "midTopIn",
    ...this.data,
    class: `calendar menu default center gap-m ${this.data.class || ""} calendar-${this.id}`,
    html: Go.create({
      tag: "div",
      class: "calendarDaysContent",
      childrens: [this.renderDays.bind(this)()],
    }),
    header: {
      right: {
        html: Go.create({
          tag: "div",
          class: "monthHandler",
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 calc(var(--gap) * 0.5)",
            borderRadius: "2pc",
            gap: "calc(var(--gap) * 0.5)",
          },
          childrens: [
            {
              tag: "go-icon",
              name: "chevron-left",
              class: "tag",
              onclick: this.prevMonth.bind(this),
            },
            {
              tag: "div",
              html: this.getMonthName(this.month),
              class: "calendarMonthName tag",
              onclick: this.selectMonth.bind(this),
            },
            {
              tag: "a",
              class: "calendarYearName tag",
              html: this.year,
              onclick: this.selectYear.bind(this),
            },
            {
              tag: "go-icon",
              name: "chevron-right",
              class: "tag",
              onclick: this.nextMonth.bind(this),
            },
          ],
        }),
      },
    },
  });
};

Calendar.prototype.renderDays = function (target, cb) {
  this.calendar = this.generate();

  this.isToday = function (day) {
    return day === this.day && this.calendar.month === this.current.month && this.calendar.year === this.current.year;
  }.bind(this);

  this.calendarElement = Go.create({
    tag: "table",
    class: "calendar",
    childrens: [
      {
        tag: "tr",
        childrens: this.calendar.days.map((dia) => Go.create({ tag: "th", html: dia })),
        class: "names",
      },
      {
        tag: "tbody",
        class: "days",
        childrens: this.calendar.calendar.map((semana) =>
          Go.create({
            tag: "tr",
            childrens: semana.map((dia) =>
              Go.create({
                class: `day ${dia ? "num" : "empty"} ${this.isToday(dia) ? "today" : ""}`,
                day: dia,
                tag: "td",
                html: `<span day>${dia || ""}</span>`,
                onclick: this.touch.bind(this),
              }),
            ),
          }),
        ),
      },
    ],
  });

  return Go.create({
    tag: "div",
    class: "calendarWrapper",
    target,
    childrens: [this.calendarElement, this.shortcuts.bind(this)()],
    onrender: () => {
      cb && cb();
    },
  });
};

Calendar.prototype.shortcuts = function () {
  return {
    tag: "div",
    class: "shortcuts",
    style: { padding: "0 0 calc(var(--gap) * 1) 0" },
    childrens: [
      {
        tag: "go-item",
        label: Go.lang("today"),
        right: { tag: "go-icon", name: "chevron-right" },
        style: { padding: "var(--gap) calc(var(--gap) * 2)" },
        class: "item-hover",
        onclick: () => {
          this.startDate = Go.Date(Go.Date().today());
          this.year = +this.startDate.year();
          this.month = +this.startDate.month() - 1;
          this.day = +this.startDate.day();

          this.current.year = this.year;
          this.current.month = this.month;
          this.current.day = this.day;

          Go.html(".calendarMonthName", this.getMonthName(this.month));

          this.renderDays(".calendarDaysContent", () => {
            this.touch({ target: { day: this.day } });
          });
        },
      },
      {
        tag: "go-item",
        label: Go.lang("last_15_days"),
        right: { tag: "go-icon", name: "chevron-right" },
        style: { padding: "var(--gap) calc(var(--gap) * 2)" },
        class: "item-hover",
        onclick: () => {
          this.startDate = Go.Date(Go.Date().getLastNumDaysRange(15));
          this.year = +this.startDate.year();
          this.month = +this.startDate.month() - 1;
          this.day = +this.startDate.day();

          this.current.year = this.year;
          this.current.month = this.month;
          this.current.day = this.day;

          Go.html(".calendarMonthName", this.getMonthName(this.month));

          this.renderDays(".calendarDaysContent", () => {
            this.touch({ target: { day: this.day } });
          });
        },
      },
      {
        tag: "go-item",
        label: Go.lang("this_month"),
        right: { tag: "go-icon", name: "chevron-right" },
        style: { padding: "var(--gap) calc(var(--gap) * 2)" },
        class: "item-hover",
        onclick: () => {
          this.startDate = Go.Date(Go.Date().startOfMonth());
          this.year = +this.startDate.year();
          this.month = +this.startDate.month() - 1;
          this.day = +this.startDate.day();

          this.current.year = this.year;
          this.current.month = this.month;
          this.current.day = this.day;

          Go.html(".calendarMonthName", this.getMonthName(this.month));

          this.renderDays(".calendarDaysContent", () => {
            this.touch({ target: { day: this.day } });
          });
        },
      },
    ],
  };
};

Calendar.prototype.nextMonth = function () {
  this.month = (this.month + 1) % 12;
  this.year += this.month === 0 ? 1 : 0;
  Go.html(".calendarMonthName", this.getMonthName(this.month));
  Go.html(".calendarYearName", this.year);
  this.renderDays(".calendarDaysContent");
};

Calendar.prototype.prevMonth = function () {
  this.month = (this.month - 1 + 12) % 12;
  this.year -= this.month === 11 ? 1 : 0;
  Go.html(".calendarMonthName", this.getMonthName(this.month));
  Go.html(".calendarYearName", this.year);
  this.renderDays(".calendarDaysContent");
};

Calendar.prototype.getMonthName = function (mes) {
  return this.monthsNames[this.lang][mes];
};

Calendar.prototype.touch = function (evt) {
  const day = evt.target.day;

  if (!day) return;

  this.current.day = day;
  this.current.month = this.month;
  this.current.year = this.year;

  this.ondate ||= this.data.ondate || this.data.onDate;

  this.format = {
    day: Go.fixZeros(this.current.day),
    month: Go.fixZeros(this.current.month + 1),
    year: this.current.year,
    ymd: `${this.current.year}-${Go.fixZeros(this.current.month + 1)}-${Go.fixZeros(this.current.day)}`,
    date: new Date(this.current.year, this.current.month, this.current.day).toLocaleDateString(this.lang, {
      day: "numeric",
      month: "numeric",
      year: "numeric",
    }),
  };

  this.view.close(() => {
    typeof this.ondate === "function" && this.ondate(this.format);
  });
};

Calendar.prototype.generate = function () {
  const diasSemana = this.daysNames[this.lang];
  const primerDia = new Date(this.year, this.month, 1).getDay();
  const totalDias = new Date(this.year, this.month + 1, 0).getDate();

  let calendario = [];
  let semana = new Array(7).fill(null);
  let dia = 1;

  // Agregar los días en blanco antes del primer día del mes
  for (let i = primerDia; i < 7; i++) {
    semana[i] = dia++;
  }
  calendario.push(semana);

  // Llenar el resto del mes
  while (dia <= totalDias) {
    semana = new Array(7).fill(null);
    for (let i = 0; i < 7 && dia <= totalDias; i++) {
      semana[i] = dia++;
    }
    calendario.push(semana);
  }

  return { days: diasSemana, calendar: calendario, year: this.year, month: this.month };
};

Calendar.prototype.selectMonth = function () {
  this.monthsSelector = Go.menu({
    title: this.title || Go.lang("select_month"),
    options: this.monthsNames[this.lang].map((mes, index) => ({ label: mes, value: index })),
    class: "menu center default gap-m",
    content: {
      style: {
        maxWidth: "320px",
      },
    },
    onselect: (option) => {
      this.month = option.value;
      Go.html(".calendarMonthName", this.getMonthName(this.month));
      this.renderDays(".calendarDaysContent");
    },
  });
};

Calendar.prototype.selectYear = function () {
  this.yearsSelector = Go.menu({
    title: this.title || Go.lang("select_year"),
    options: Array.from({ length: 10 }, (_, i) => this.year - 5 + i).map((year) => ({ label: year, value: year })),
    class: "menu center default gap-m",
    content: {
      style: {
        maxWidth: "320px",
      },
    },
    onselect: (option) => {
      this.year = option.value;
      Go.html(".calendarMonthName", this.getMonthName(this.month));
      Go.html(".calendarYearName", this.year);
      this.renderDays(".calendarDaysContent");
    },
  });
};

Object.assign(GO, MOD_LUIGIOS_GOCALENDARJS);

const ClipBoard = function (e) {
  this.e = e;
  this.id = Go.uuid();
};

const MOD_LUIGIOS_GOCLIPBOARDJS = {
  clipboard: function () {
    return new ClipBoard(...arguments);
  },
};

ClipBoard.prototype.copy = function () {
  this.value = Go.getProp(this.e, "target.outerText") || this.e;

  return new Promise((resolve, reject) => {
    if (Go.is(this.value, "string") && navigator.clipboard && window.isSecureContext) {
      try {
        return resolve(navigator.clipboard.writeText(this.value));
      } catch (error) {
        // continue
      }
    }

    return (this.textarea = Go.create({
      tag: "textarea",
      target: "body",
      mode: "append",
      replace: true,
      value: this.value,
      class: `clipboard-textarea-${this.id} absolute`,
      style: {
        opacity: 0,
        position: "fixed",
        width: 0,
        height: 0,
        maxWidth: 0,
        maxHeight: 0,
        top: 0,
        left: 0,
      },
      onrender: function () {
        this.focus();
        this.select();
        if (document.queryCommandSupported("copy")) {
          resolve(document.execCommand("copy"));
        } else {
          reject(false);
        }
        Go.sleep(100).then(() => this.remove());
      },
    }));
  });
};

ClipBoard.prototype.paste = function () {
  if (Go.is(this.e, "HTMLElement")) {
    this.e.select();
  }

  document.execCommand("paste");
};

ClipBoard.prototype.cut = function () {
  this.e.select();
  document.execCommand("cut");
};

ClipBoard.prototype.clear = function () {
  document.execCommand("selectAll");
  document.execCommand("delete");
};

ClipBoard.prototype.clean = function () {
  this.e.preventDefault();
  const text = (this.e.clipboardData || window.clipboardData).getData("text/plain");
  document.execCommand("insertHTML", false, text);
};

ClipBoard.prototype.read = async function () {
  const text = await navigator.clipboard.readText();
  return text;
};

Object.assign(GO, MOD_LUIGIOS_GOCLIPBOARDJS);

const Component = function () {};
const component = new Component();
const ElementMethods = {};
const ElementEvents = {};
const ElementProperties = {};
const ElementsStyles = {};

const MOD_LUIGIOS_GOCOMPONENTJS = { component: (id, src) => component.load(id, src) };

class ComponentCycles extends HTMLElement {
  constructor() {
    super();
    this.attrs = Go.parseAllAttributes(this);
    this.slots = this.querySelectorAll("[slot]");
    this.props = this.getProps();
    this.data ||= Go.fromJson(Go.attr(this, "data")) || {};
    this.uid = Go.fuid();
    this.template = ``;
  }

  async disconnectedCallback() {
    await this.cleanResources();
    await this.onunload();
    await this.destroy();
    await this._unstyles();
    await this.$destroy();
    this.remove();
  }

  async connectedCallback() {
    const canInit = await this.$init();
    if (!canInit) return;
    await this.init();
    this.props = this.getProps();
    await this.beforeRender(this);
    await this.render(this);
    await this._styles(this);
    await this.afterRender(this);
    await this.readyEvents();
  }

  async $init() {}
  async init() {}
  async beforeRender() {}

  async render() {
    if (this.template) {
      this.innerHTML = Go.eval(this.template);
    }
  }

  async _styles() {
    component._styles(this, await this.styles());
  }

  async _unstyles() {
    component._unstyles(this);
  }

  async afterRender() {}
  async styles() {}
  async cleanResources() {}
  async onunload() {}
  async destroy() {}
  async readyEvents() {}
  async $destroy() {}
}

Component.prototype._styles = async function (el, styles) {
  if (!styles) return;

  let [global, mobile, tablet, notebook, desktop] = [
    Go.omit(styles, "mobile", "tablet", "desktop"),
    Go.getProp(styles, "mobile"),
    Go.getProp(styles, "tablet"),
    Go.getProp(styles, "notebook"),
    Go.getProp(styles, "desktop"),
  ];

  el.classList.add(`go${el.uid}`);

  el.componentStyles = Go.create({
    tag: "style",
    target: document.head,
    mode: "append",
    class: "go-ui-styles",
    html: `.go${el.uid} {${Go.serializeStyle(global)}}
    @media (min-width: 1px) and (max-width: 589px) { .go${el.uid} {${Go.serializeStyle(mobile)} } }
    @media (min-width: 590px) and (max-width: 1024px) { .go${el.uid} {${Go.serializeStyle(tablet)} } }
    @media (min-width: 1025px) and (max-width: 1280px) { .go${el.uid} {${Go.serializeStyle(notebook)} } }
    @media (min-width: 1281px) { .go${el.uid} {${Go.serializeStyle(desktop)} } }`,
  });
};

Component.prototype._unstyles = function (el) {
  if (el.componentStyles) {
    el.componentStyles.remove();
  }
};

Component.prototype.load = async function (id, src) {
  this.register(id, src);
};

Component.prototype.register = async function (id, component) {
  let [_component, setupId] = [{}, Go.fuid()];

  if (Go.is(component, "function")) {
    component = await component();
    _component = component.default;
  } else if (Go.is(component, "string")) {
    component = Go.route.fixPath(component);
    component = await import(component);
    _component = component.default;
  } else if (Go.is(component, "object")) {
    _component = component;
  } else {
    return;
  }

  class MyComponent extends ComponentCycles {
    component() {
      return {
        name: id,
        setupId: setupId,
      };
    }
  }

  component = Object.assign(MyComponent.prototype, _component, ElementProperties, ElementMethods, ElementEvents, {
    setupId: setupId,
    setupTagName: id,
    setupClass: `go${setupId}`,
  });

  try {
    window.customElements.define(id, MyComponent);
  } catch (error) {
    this.error(error);
  }

  await this._setup(component);

  const setup = _component.setup || _component.onSetup || _component.register || _component.onRegister;

  if (["function"].includes(typeof setup)) {
    await setup();
  }
};

Component.prototype.error = function (error) {
  if (Go.has(String(error), "included", "has already")) {
    return;
  }
  console.log("Component: ", error);
};

Component.prototype._setup = async function (component) {
  if (component.setupStyles) {
    await this._setupStyles(component);
  }
};

Component.prototype._setupStyles = async function (component) {
  if (!component.setupStyles) return;

  let [styles, selector] = [component.setupStyles, component.setupTagName];

  if (["function"].includes(typeof styles)) {
    styles = await styles();
  }

  let [global, mobile, tablet, notebook, desktop] = [
    Go.omit(styles, "mobile", "tablet", "notebook", "desktop"),
    Go.getProp(styles, "mobile"),
    Go.getProp(styles, "tablet"),
    Go.getProp(styles, "notebook"),
    Go.getProp(styles, "desktop"),
  ];

  ElementsStyles[component.setupTagName] = Go.create({
    tag: "style",
    target: document.head,
    mode: "append",
    class: `go-ui-styles-${selector}`,
    replace: true,
    html: `${selector} {${Go.serializeStyle(global)}}
    @media (min-width: 1px) and (max-width: 589px) { ${selector} {${Go.serializeStyle(mobile)} } }
    @media (min-width: 590px) and (max-width: 1024px) { ${selector} {${Go.serializeStyle(tablet)} } }
    @media (min-width: 1025px) and (max-width: 1280px) { ${selector} {${Go.serializeStyle(notebook)} } }
    @media (min-width: 1281px) { ${selector} {${Go.serializeStyle(desktop)} } }`,
  });
};

Object.assign(ElementMethods, {
  $: function (selector) {
    return $(selector, this);
  },
  $init: function () {
    this.if ||= Go.attr(this, "if");

    if (Go.is(this.if, "set") && !eval(this.if)) {
      return this.disconnectedCallback();
    }

    this.setVarsSizes();
    this.listenStyles();
    this.mapStyles();

    return true;
  },
  evaluateProps: function () {
    this.data ||= Go.attr(this, "data") ? Go.json(Go.attr(this, "data")) : null;
    this.data ||= Go.attr(this, "props") ? Go.json(Go.attr(this, "props")) : {};
    this.data.src ||= this.src || Go.attr(this, "src");
    this.childs = this.querySelectorAll("*");
    this.childs.forEach((child) => {
      const [attr, value] = [Go.lower(child.tagName), Go.attr(child, "value")];
      this.data[attr] = value;
      child.remove();
    });
    return this.data;
  },
  setVarsSizes: function () {
    this.sizes = Go.getProp(this, "sizes") || Go.attr(this, "sizes") || {};
    this.sizes = Go.json(this.sizes);
    Object.keys(this.sizes).forEach((key) => {
      if (!Go.onlyNum(this.sizes[key])) return;
      this.style.setProperty(`--size-${key}`, this.sizes[key]);
    });
  },
  reload: function () {
    this.connectedCallback();
    return this;
  },
  html: function (html, opts = {}) {
    if (opts.eval) {
      html = Go.eval(html, opts.context || opts.ctx);
    }

    this.innerHTML = html;

    return this;
  },
  text: function (text, opts = {}) {
    if (opts.eval) {
      text = Go.eval(text, opts.context || opts.ctx);
    }

    this.innerText = text;

    return this;
  },
  append: function (html) {
    if (Go.is(html, "HTMLElement")) {
      return this.appendChild(html);
    }

    this.insertAdjacentHTML("beforeend", html);

    return this;
  },
  prepend: function (html) {
    if (Go.is(html, "HTMLElement")) {
      return this.prependChild(html);
    }

    this.insertAdjacentHTML("afterbegin", html);

    return this;
  },
  prependChild: function (child) {
    this.insertBefore(child, this.firstChild);
  },
  put: function (html) {
    this.clean();

    if (Go.is(html, "HTMLElement")) {
      return this.appendChild(html);
    }

    this.innerHTML = html;

    return this;
  },
  child: function (selector) {
    if (Go.is(selector, "HTMLElement")) {
      return this.appendChild(selector);
    }

    return this.querySelector(selector);
  },
  find: function (selector) {
    return this.querySelectorAll(selector);
  },
  findAll: function (selector) {
    return this.querySelectorAll(selector);
  },
  select: function (selector) {
    return this.querySelector(selector);
  },
  parent: function (selector) {
    return this.closest(selector);
  },
  $slot: function (name) {
    return this.querySelector(`[slot=${name}]`);
  },
  $destroy: function () {
    this.ondestroy ||= Go.getProp(this, "attrs.ondestroy") || Go.attr(this, "ondestroy");

    if (Go.is(this.ondestroy, "Function")) {
      this.ondestroy();
    }

    if (Go.is(this.ondestroy, "stringFunction")) {
      Go.eval(this.ondestroy);
    }

    this.emit("destroy");
  },
  clean: function () {
    this.innerHTML = "";
  },
  loading: function (state = true) {
    this.latestHTML = this.innerHTML;
    this.innerHTML = `<div class="loader"><go-icon name="gspinner"></go-icon></div>`;
  },
  loaded: function () {
    this.innerHTML = this.latestHTML;
  },
  unloading: function () {
    this.innerHTML = this.latestHTML;
  },
  onunload: function () {
    Go.off(`resized:${this.styleId}`);
  },
  listenStyles: function () {
    this.styleId = `style-${Go.uuid()}`;

    this.globalStyle = this.getDynamicStyle("style-glob");
    this.tabletStyle = this.getDynamicStyle("style-tbl");
    this.mobileStyle = this.getDynamicStyle("style-mbl");
    this.desktopStyle = this.getDynamicStyle("style-dsk");
    this.ntbStyle = this.getDynamicStyle("style-ntb");

    this.hasStyle = this.globalStyle || this.tabletStyle || this.mobileStyle || this.desktopStyle || this.ntbStyle;

    if (this.hasStyle) {
      this.mapStyles();
      Go.on(`resized:${this.styleId}`, () => {
        this.mapStyles();
      });
    }
  },
  mapStyles: function () {
    if (this.globalStyle) {
      Go.style(this, this.globalStyle);
    }

    if (Go.is(document, "tabletScreen") && this.tabletStyle) {
      Go.style(this, this.tabletStyle);
    } else if (Go.is(document, "mobileScreen") && this.mobileStyle) {
      Go.style(this, this.mobileStyle);
    } else if (Go.is(document, "desktopScreen") && this.desktopStyle) {
      Go.style(this, this.desktopStyle);
    } else if (Go.is(document, "notebookScreen") && this.ntbStyle) {
      Go.style(this, this.ntbStyle);
    }
  },
  getDynamicStyle: function (style) {
    if (this[style]) {
      return this[style];
    }

    if (Go.getProp(this.attrs, style)) {
      return Go.getProp(this.attrs, style);
    }

    if (Go.attr(this, style)) {
      return Go.attr(this, style);
    }

    if (Go.prop(style, this)) {
      return Go.prop(style, this);
    }

    return null;
  },
  appendChilds: function (...childrens) {
    childrens.forEach((child) => {
      child && this.appendChild(child);
    });
  },
});

Object.assign(ElementEvents, {
  readyEvents: function () {
    this.events = [];
  },
  isGlobalEvents: function () {
    if (!this.events) {
      this.readyEvents();
    }
  },
  on: function (event, callback) {
    if (Array.isArray(event)) {
      event.forEach((e) => {
        this.on(e, callback);
      });
      return;
    }

    this.isGlobalEvents();
    this.events.push({ event, callback });
  },
  emit: function (event, data) {
    this.isGlobalEvents();

    this.events.forEach((e) => {
      if (e.event === event || e.event.startsWith(event + ":")) {
        e.callback(data);
      }
    });
  },
  off: function (event) {
    this.isGlobalEvents();
    Go.removeObjectFromArray(this.events, "event", event);
  },
  once: function (event, callback) {
    this.off(event, callback);
    this.on(event, callback);
  },
});

Object.assign(ElementProperties, {
  prop: function (name, value) {
    if (arguments.length === 1) {
      return this.getProps(name);
    }
    return Go.prop(this, name, value);
  },
  getProps: function (key) {
    const arr = Object.keys(this).map((key) => {
      return { [key]: this[key] };
    });

    const obj = Object.assign({}, ...arr);

    if (Go.is(key, "string")) {
      return Go.prop(key, obj.attrs) || Go.prop(key, obj);
    }

    return obj;
  },
  cleanAttributes: function ({ exclude = [] } = {}) {
    const attrs = this.getAttributeNames();
    for (const name of attrs) {
      if (!exclude.includes(name)) {
        this.removeAttribute(name);
      }
    }
    return this;
  },
  addClass: function(_class) {
    Go.addClass(this, _class);
  },
  removeClass: function(_class) {
    Go.removeClass(this, _class);
  },
  toggleClass: function(_class) {
    Go.toggleClass(this, _class);
  },
}); 

Object.assign(GO, MOD_LUIGIOS_GOCOMPONENTJS);

const [GO_CONFIG, COG_CONFIG] = [
  {},
  function (data, name) {
    this.__name = name;
    Object.assign(this, data);
  },
];

const MOD_LUIGIOS_GOCONFIGJS = {
  config: function () {
    return GO_CONFIG.config(...arguments);
  },
};

GO_CONFIG.config = function (name, value) {
  const reserved = ["setConfig", "getConfig"];

  if (reserved.includes(name)) {
    return;
  }

  if (arguments.length == 1) {
    return GO_CONFIG.getConfig(name);
  }

  return GO_CONFIG.setConfig(name, value);
};

GO_CONFIG.getConfig = function (name) {
  const value = GO_CONFIG[name];

  if (!Array.isArray(value) && ["object"].includes(typeof value)) {
    return new COG_CONFIG(value, name);
  }

  return value;
};

GO_CONFIG.setConfig = function (name, value) {
  if (value == "++") {
    value = Number(GO_CONFIG.getConfig(name)) + 1;
  }

  if (value == "--") {
    value = Number(GO_CONFIG.getConfig(name)) - 1;
  }

  Go.setProperty(GO_CONFIG, name, value);

  if (!Array.isArray(value) && ["object"].includes(typeof value)) {
    return new COG_CONFIG(value, name);
  }

  return value;
};

COG_CONFIG.prototype.add = function () {
  return this.update(...arguments);
};

COG_CONFIG.prototype.set = function () {
  return this.update(...arguments);
};

COG_CONFIG.prototype.get = function (name, defaultValue) {
  return Go.getProperty(this, name, defaultValue);
};

COG_CONFIG.prototype.update = function (data) {
  Object.keys(data).forEach((key) => {
    const value = Go.getProperty(data, key);
    Go.setProperty(this, key, value);
  });
  this.updateSRC();
  return this;
};

COG_CONFIG.prototype.init = function (data = {}) {
  Object.keys(data).forEach((key) => {
    const value = Go.getProperty(this, key);
    if (!value) {
      Go.setProperty(this, key, Go.getProperty(data, key));
    }
  });
  this.updateSRC();
  return this;
};

COG_CONFIG.prototype.updateSRC = function () {
  GO_CONFIG[this.__name] = this;
};

Object.assign(GO, MOD_LUIGIOS_GOCONFIGJS);

const GO_CONFIRM = {};

const Confirm = function (data = {}, conf = {}) {
  this.template = "";
  this.id = Go.uuid();
  this.data = Go.is(data, "string") ? { message: data } : data;
  this.conf = Go.is(conf, "string") ? { title: conf } : conf;
  Object.assign(this, this.data, this.conf);
  this.notOpened = ["prompt"];
  this.isOpen = this.data.opened || this.data.started || this.data.isOpen || this.data.async || false;
  if (this.isOpen && !this.notOpened.includes(this.data.from)) {
    return this.show();
  }
};

const MOD_LUIGIOS_GOCONFIRMJS = {
  confirm: (data, conf) => new Confirm(data, conf),
  acceptConfirm: (id) => {
    if (!GO_CONFIRM[id]) return;

    if (Go.is(GO_CONFIRM[id]["onaccept"], "function")) {
      GO_CONFIRM[id]["onaccept"](GO_CONFIRM[id]["view"]);
    } else if (Go.is(GO_CONFIRM[id]["onconfirm"], "function")) {
      GO_CONFIRM[id]["onconfirm"](GO_CONFIRM[id]["view"]);
    }

    if (Go.is(GO_CONFIRM[id]["resolve"], "function")) {
      GO_CONFIRM[id]["resolve"](true);
    }

    if (!Go.getProp(GO_CONFIRM[id], "data.keepOpen")) {
      Go.close(`.confirm${id}`);
    }
  },
  cancelConfirm: (id) => {
    if (!GO_CONFIRM[id]) return;

    if (Go.is(GO_CONFIRM[id]["oncancel"], "function")) {
      GO_CONFIRM[id]["oncancel"](GO_CONFIRM[id]["view"]);
    }

    if (Go.is(GO_CONFIRM[id]["reject"], "function")) {
      GO_CONFIRM[id]["reject"](false);
    }

    Go.close(`.confirm${id}`);
  },
};

Confirm.prototype.show = function () {
  return new Promise((resolve, reject) => {
    GO_CONFIRM[this.id] = {};
    GO_CONFIRM[this.id]["onaccept"] = this.onaccept || this.onconfirm;
    GO_CONFIRM[this.id]["oncancel"] = this.oncancel;
    GO_CONFIRM[this.id]["resolve"] = resolve;
    GO_CONFIRM[this.id]["reject"] = reject;
    GO_CONFIRM[this.id]["data"] = this.data;

    this.class = (this.data.class || "") + " " + (this.conf.class || "");

    GO_CONFIRM[this.id]["view"] = Go.view({
      title: this.title || Go.lang("confirm"),
      html: this.bodyTemplate(),
      animation: "midTopIn",
      ...this.data,
      ...this.conf,
      class: `${this.class} default confirm confirm${this.id}`,
      footer: {
        child: {
          tag: "go-confirm",
          acceptLabel: Go.getProp(this, "acceptLabel") || Go.lang("accept"),
          cancelLabel: Go.getProp(this, "cancelLabel") || Go.lang("cancel"),
          oncancel: () => {
            Go.cancelConfirm(this.id);
          },
          onaccept: () => {
            Go.acceptConfirm(this.id);
          },
        },
      },
    });
  });
};

Confirm.prototype.open = function () {
  return this.show();
};

Confirm.prototype.bodyTemplate = function () {
  this.childrens = [
    {
      tag: "div",
      html: this.message,
      class: "goConfirmMessage",
      style: { textAlign: "center", padding: "var(--gap, 1rem)" },
    },
  ];

  if (this.data.preHtml) {
    this.childrens.unshift(this.data.preHtml);
  }

  if (this.data.postHtml) {
    this.childrens.push(this.data.postHtml);
  }

  return Go.create({
    tag: "div",
    class: "confirmWin",
    style: { width: "100%" },
    childrens: this.childrens,
  });
};

Object.assign(GO, MOD_LUIGIOS_GOCONFIRMJS);

const GO_COOKIE = {};
const MOD_LUIGIOS_GOCOOKIEJS = GO_COOKIE;

GO_COOKIE.setCookie = function (key, value, expireDays = 365) {
  const d = new Date();
  d.setTime(d.getTime() + expireDays * 24 * 60 * 60 * 1000);
  const expires = "expires=" + d.toUTCString();
  document.cookie = key + "=" + value + ";" + expires + ";path=/";
};

GO_COOKIE.getCookie = function (key) {
  const name = key + "=";
  const ca = document.cookie.split(";");

  for (let i = 0; i < ca.length; i++) {
    let c = ca[i];

    while (c.charAt(0) === " ") {
      c = c.substring(1);
    }

    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length);
    }
  }

  return "";
};

GO_COOKIE.deleteCookie = function (key) {
  document.cookie = key + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;";
};

Object.assign(GO, MOD_LUIGIOS_GOCOOKIEJS);

const GO_COUNTERS = {};

const GO_COUNTER = function (id, init = 0) {
  this.id = id || Go.uuid();
  GO_COUNTERS[this.id] ||= init;
  this.value = GO_COUNTERS[this.id];
};

const MOD_LUIGIOS_GOCOUNTERJS = {
  counter: function () {
    return new GO_COUNTER(...arguments);
  },
};

GO_COUNTER.prototype.increment = function () {
  GO_COUNTERS[this.id] += 1;
  return GO_COUNTERS[this.id];
};

GO_COUNTER.prototype.decrement = function () {
  GO_COUNTERS[this.id] -= 1;
  return GO_COUNTERS[this.id];
};

GO_COUNTER.prototype.reset = function () {
  GO_COUNTERS[this.id] = 0;
  return GO_COUNTERS[this.id];
};

GO_COUNTER.prototype.sum = function (num = 0) {
  GO_COUNTERS[this.id] += num;
  return GO_COUNTERS[this.id];
};

GO_COUNTER.prototype.substract = function (num = 0) {
  GO_COUNTERS[this.id] -= num;
  return GO_COUNTERS[this.id];
};

Object.assign(GO, MOD_LUIGIOS_GOCOUNTERJS);

const GO_CURSOR = function (event) {
  this.event = event;
};

const MOD_LUIGIOS_GOCURSORJS = { cursor: (e) => new GO_CURSOR(e) };

GO_CURSOR.prototype.coordinates = function () {
  return { x: this.event.clientX, y: this.event.clientY };
};

GO_CURSOR.prototype.position = function () {
  return { x: this.event.pageX, y: this.event.pageY };
};

GO_CURSOR.prototype.offset = function () {
  return { x: this.event.offsetX, y: this.event.offsetY };
};

GO_CURSOR.prototype.screen = function () {
  return { x: this.event.screenX, y: this.event.screenY };
};

Object.assign(GO, MOD_LUIGIOS_GOCURSORJS);

const INHERIT_GO_DATE = {};

const MOD_LUIGIOS_GODATEINHERITJS = INHERIT_GO_DATE;

INHERIT_GO_DATE.year = function (date) {
  if (date && Go.is(date, "string")) {
    date = new Date(date);
  } else if (!date) {
    date = new Date();
  }

  const year = date.getFullYear();
  return year;
};

INHERIT_GO_DATE.month = function (date) {
  if (date && Go.is(date, "string")) {
    date = new Date(date);
  } else if (!date) {
    date = new Date();
  }

  const month = date.getMonth();
};

INHERIT_GO_DATE.day = function (date) {
  if (date && Go.is(date, "string")) {
    date = new Date(date);
  } else if (!date) {
    date = new Date();
  }

  const day = date.getDate();
};

INHERIT_GO_DATE.dateFormat = function (date, data = {}) {
  if (Go.is(data, "String")) {
    data = { format: data };
  }

  let { lang = "en", format = "yyyy-mm-dd" } = data;

  if (Go.is(date, "String")) {
    date = new Date(date);
  }

  const options = {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  };

  date = date.toLocaleDateString(lang, options);
  let [mm, dd, yyyy] = date.split("/");

  date = format.replace("yyyy", yyyy);
  date = date.replace("mm", Go.fixZeros(mm));
  date = date.replace("dd", Go.fixZeros(dd));

  return date;
};

INHERIT_GO_DATE.getYearsDiff = function (date1, date2 = new Date()) {
  if (date1 && date2) {
    if (typeof date1 === "string") {
      date1 = new Date(date1);
    }

    if (typeof date1 === "number") {
      date1 = new Date(date1);
    }

    if (typeof date2 === "string") {
      date2 = new Date(date2);
    }

    if (typeof date2 === "number") {
      date2 = new Date(date2);
    }

    if (typeof date1 === "object" && typeof date2 === "object") {
      if (date1 instanceof Date && date2 instanceof Date) {
        return date2.getFullYear() - date1.getFullYear();
      }
    }
  }

  return 0;
};

INHERIT_GO_DATE.getMonthsDiff = function (date1, date2 = new Date()) {
  if (date1 && date2) {
    if (typeof date1 === "string") {
      date1 = new Date(date1);
    }

    if (typeof date1 === "number") {
      date1 = new Date(date1);
    }

    if (typeof date2 === "string") {
      date2 = new Date(date2);
    }

    if (typeof date2 === "number") {
      date2 = new Date(date2);
    }

    if (typeof date1 === "object" && typeof date2 === "object") {
      if (date1 instanceof Date && date2 instanceof Date) {
        return date2.getMonth() - date1.getMonth();
      }
    }
  }

  return 0;
};

INHERIT_GO_DATE.getDaysDiff = function (date1, date2 = new Date()) {
  if (date1 && date2) {
    if (typeof date1 === "string") {
      date1 = new Date(date1);
    }

    if (typeof date1 === "number") {
      date1 = new Date(date1);
    }

    if (typeof date2 === "string") {
      date2 = new Date(date2);
    }

    if (typeof date2 === "number") {
      date2 = new Date(date2);
    }

    if (typeof date1 === "object" && typeof date2 === "object") {
      if (date1 instanceof Date && date2 instanceof Date) {
        return date2.getDate() - date1.getDate();
      }
    }
  }

  return 0;
};

INHERIT_GO_DATE.getHoursDiff = function (date1, date2 = new Date()) {
  if (date1 && date2) {
    if (typeof date1 === "string") {
      date1 = new Date(date1);
    }

    if (typeof date1 === "number") {
      date1 = new Date(date1);
    }

    if (typeof date2 === "string") {
      date2 = new Date(date2);
    }

    if (typeof date2 === "number") {
      date2 = new Date(date2);
    }

    if (typeof date1 === "object" && typeof date2 === "object") {
      if (date1 instanceof Date && date2 instanceof Date) {
        return date2.getHours() - date1.getHours();
      }
    }
  }

  return 0;
};

INHERIT_GO_DATE.getMinutesDiff = function (date1, date2 = new Date()) {
  if (date1 && date2) {
    if (typeof date1 === "string") {
      date1 = new Date(date1);
    }

    if (typeof date1 === "number") {
      date1 = new Date(date1);
    }

    if (typeof date2 === "string") {
      date2 = new Date(date2);
    }

    if (typeof date2 === "number") {
      date2 = new Date(date2);
    }

    if (typeof date1 === "object" && typeof date2 === "object") {
      if (date1 instanceof Date && date2 instanceof Date) {
        return date2.getMinutes() - date1.getMinutes();
      }
    }
  }

  return 0;
};

INHERIT_GO_DATE.getSecondsDiff = function (date1, date2 = new Date()) {
  if (date1 && date2) {
    if (typeof date1 === "string") {
      date1 = new Date(date1);
    }

    if (typeof date1 === "number") {
      date1 = new Date(date1);
    }

    if (typeof date2 === "string") {
      date2 = new Date(date2);
    }

    if (typeof date2 === "number") {
      date2 = new Date(date2);
    }

    if (typeof date1 === "object" && typeof date2 === "object") {
      if (date1 instanceof Date && date2 instanceof Date) {
        return date2.getSeconds() - date1.getSeconds();
      }
    }
  }

  return 0;
};

INHERIT_GO_DATE.getMillisecondsDiff = function (date1, date2 = new Date()) {
  if (date1 && date2) {
    if (typeof date1 === "string") {
      date1 = new Date(date1);
    }

    if (typeof date1 === "number") {
      date1 = new Date(date1);
    }

    if (typeof date2 === "string") {
      date2 = new Date(date2);
    }

    if (typeof date2 === "number") {
      date2 = new Date(date2);
    }

    if (typeof date1 === "object" && typeof date2 === "object") {
      if (date1 instanceof Date && date2 instanceof Date) {
        return date2.getMilliseconds() - date1.getMilliseconds();
      }
    }
  }

  return 0;
};

INHERIT_GO_DATE.timestamp = function (date = new Date()) {
  if (date) {
    if (typeof date === "string") {
      date = new Date(date);
    }

    if (typeof date === "number") {
      date = new Date(date);
    }

    if (typeof date === "object") {
      if (date instanceof Date) {
        return date.getTime();
      }
    }
  }

  return 0;
};

INHERIT_GO_DATE.fixZeros = function (number) {
  return Number(number) < 10 ? "0" + number : number;
};

INHERIT_GO_DATE.date_locale = function (date, lang = "en") {
  if (Go.is(date, "String")) {
    date = new Date(date);
  }

  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  };

  return date.toLocaleDateString(lang, options);
};

INHERIT_GO_DATE.dateLocale = function (date, lang = "en") {
  return INHERIT_GO_DATE.date_locale(date, lang);
};

INHERIT_GO_DATE.time_locale = function (date, lang = "en") {
  if (Go.is(date, "String")) {
    date = new Date(date);
  }

  const options = {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "UTC",
  };

  return date.toLocaleTimeString(lang, options);
};

INHERIT_GO_DATE.datetime_locale = function (date, lang = "en") {
  if (Go.is(date, "String")) {
    date = new Date(date);
  }

  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    timeZone: "UTC",
  };

  return date.toLocaleString(lang, options);
};

INHERIT_GO_DATE.timeLocale = function (date, lang = "en") {
  return INHERIT_GO_DATE.time_locale(date, lang);
};

INHERIT_GO_DATE.getPastMonthDateRange = function (date = new Date(), format = "YYYY-MM-DD") {
  const start = new Date(date.getFullYear(), date.getMonth() - 1, 1);
  const end = new Date(date.getFullYear(), date.getMonth(), 0);

  if (format) {
    return [INHERIT_GO_DATE.date(start, format), INHERIT_GO_DATE.date(end, format)];
  }

  return [start, end];
};

INHERIT_GO_DATE.now = function () {
  return INHERIT_GO_DATE.timestamp();
};

INHERIT_GO_DATE.obtenerFechaEnFormato = function (formato) {
  const fecha = new Date();
  const año = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");

  switch (formato) {
    case "yyyy-mm-dd":
      return `${año}-${mes}-${dia}`;
    case "yyyy":
      return año;
    case "mm-dd":
      return `${mes}-${dia}`;
    default:
      return "Formato no válido";
  }
};

Object.assign(GO, MOD_LUIGIOS_GODATEINHERITJS);

const DataBase = function (data = {}) {
  this.data = typeof data === "string" ? { dbName: data } : data || {};
  this.dbName = this.data.dbName || "GoJsDB";
  this.table = this.data.table || "storage";
};

const MOD_LUIGIOS_GODBJS = {
  db: function () {
    return new DataBase(...arguments);
  },
};

DataBase.prototype.open = async function () {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(this.dbName, 1);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(this.table, { keyPath: "key" });
    };
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

DataBase.prototype.save = async function (key, value) {
  return new Promise(async (resolve, reject) => {
    const db = await this.open();
    const tx = db.transaction([this.table], "readwrite");
    const store = tx.objectStore(this.table);
    const request = store.put({ key, value });
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

DataBase.prototype.get = async function (key) {
  return new Promise(async (resolve, reject) => {
    const db = await this.open();
    const tx = db.transaction([this.table], "readonly");
    const store = tx.objectStore(this.table);
    const request = store.get(key);
    request.onsuccess = (event) => resolve(event.target.result && event.target.result.value);
    request.onerror = (event) => reject(event.target.error);
  });
};

DataBase.prototype.remove = async function (key) {
  return new Promise(async (resolve, reject) => {
    const db = await this.open();
    const tx = db.transaction([this.table], "readwrite");
    const store = tx.objectStore(this.table);
    const request = store.delete(key);
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

DataBase.prototype.clear = async function () {
  return new Promise(async (resolve, reject) => {
    const db = await this.open();
    const tx = db.transaction([this.table], "readwrite");
    const store = tx.objectStore(this.table);
    const request = store.clear();
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

DataBase.prototype.getAll = async function () {
  return new Promise(async (resolve, reject) => {
    const db = await this.open();
    const tx = db.transaction([this.table], "readonly");
    const store = tx.objectStore(this.table);
    const request = store.getAll();
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

DataBase.prototype.filter = async function (filter) {
  return new Promise(async (resolve, reject) => {
    const db = await this.open();
    const tx = db.transaction([this.table], "readonly");
    const store = tx.objectStore(this.table);
    const request = store.getAll();
    request.onsuccess = (event) => resolve(event.target.result.filter(filter));
    request.onerror = (event) => reject(event.target.error);
  });
};

DataBase.prototype.existsDatabase = function () {
  return new Promise((resolve, reject) => {
    // Intenta abrir la base de datos
    const request = indexedDB.open(this.dbName);

    request.onerror = () => {
      reject(new Error("Error al verificar la base de datos"));
    };

    request.onsuccess = () => {
      // Si se abre con éxito, la base de datos existe
      const db = request.result;
      db.close();
      resolve(true);
    };

    request.onupgradeneeded = (event) => {
      // Si se dispara onupgradeneeded, la base de datos no existía
      const db = event.target.result;
      db.close();
      resolve(false);
    };
  });
};

DataBase.prototype.destroy = async function () {
  // Remove all database data
  return new Promise((resolve, reject) => {
    const request = indexedDB.deleteDatabase(this.dbName);
    request.onsuccess = (event) => resolve(event.target.result);
    request.onerror = (event) => reject(event.target.error);
  });
};

DataBase.prototype.findAll = DataBase.prototype.getAll;
DataBase.prototype.set = DataBase.prototype.save;
DataBase.prototype.create = DataBase.prototype.save;
DataBase.prototype.delete = DataBase.prototype.remove;
DataBase.prototype.onsuccess = function () {};
DataBase.prototype.onerror = function () {};

Object.assign(GO, MOD_LUIGIOS_GODBJS);

const GO_DEVICE = function () {
  this.data = {};
  this.model = null;
  this.os = null;
  this.db = null;
};

GO_DEVICE.prototype.init = async function () {
  this.data = (await Go.storage("device").get()) || {};

  if (!this.data.uuid) {
    this.uuid = Go.uuid();
    Go.storage("device").set(this);
  }

  Object.assign(this, this.data);

  return this;
};

const MOD_LUIGIOS_GODEVICEJS = {
  device: new GO_DEVICE(),
};

GO_DEVICE.prototype.vibrate = function (time) {
  if (!"vibrate" in navigator) {
    return;
  }

  if (typeof navigator.vibrate === "function") {
    try {
      return navigator.vibrate(time);
    } catch (error) {
      // ...
    }
  }
};

GO_DEVICE.prototype.get = function (prop) {
  return Go.prop(this, prop);
};

Object.assign(GO, MOD_LUIGIOS_GODEVICEJS);

const GO_DOM = {};

const MOD_LUIGIOS_GODOMJS = GO_DOM;

GO_DOM.removeAllClassOnDOM = function (className) {
  let elements = document.querySelectorAll(`.${className}`);
  elements.forEach((el) => {
    el.classList.remove(className);
  });
};

GO_DOM.removeAllClassOnElement = function (el, className) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  let elements = el.querySelectorAll(`.${className}`);
  elements.forEach((el) => {
    el.classList.remove(className);
  });
};

GO_DOM.blurAll = function () {
  var tmp = document.createElement("input");
  document.body.appendChild(tmp);
  tmp.focus();
  document.body.removeChild(tmp);
};

GO_DOM.put_html = function (html, el) {
  return Go.putHTML(el, html);
};

GO_DOM.putHTMLAfter = function (el, html) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.insertAdjacentHTML("afterend", html);
};

GO_DOM.putHTMLBefore = function (el, html) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.insertAdjacentHTML("beforebegin", html);
};

GO_DOM.putHTMLInside = function (el, html) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.insertAdjacentHTML("beforeend", html);
};

GO_DOM.putHTMLOutside = function (el, html) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.insertAdjacentHTML("afterbegin", html);
};

GO_DOM.removeHTML = function (el) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.innerHTML = "";
};

GO_DOM.appendHTML = function (el, html, conf = {}) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (conf.replace) {
    el.querySelector(conf.replace)?.remove();
  }

  if (Go.hasJQuery()) {
    $(el).append(html);
  } else {
    el.innerHTML += html;
  }
};

GO_DOM.prependHTML = function (el, html) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (Go.hasJQuery()) {
    $(el).prepend(html);
  } else {
    el.innerHTML = html + el.innerHTML;
  }
};

GO_DOM.removeElement = function (el) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.parentNode.removeChild(el);
};

GO_DOM.removeElementById = function (id) {
  let el = document.getElementById(id);
  el.parentNode.removeChild(el);
};

GO_DOM.appendChild = function (el, child) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (!Go.is(child, "HTMLElement")) {
    child = document.querySelector(child);
  }

  el.appendChild(child);
};

GO_DOM.replaceHTML = function (el, html) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.outerHTML = html;
};

GO_DOM.docTitle = function (title) {
  if (!title) {
    title = document.title;
  }

  if (Go.is(title, "function")) {
    title = title();
  }

  document.title = title;
};

GO_DOM.extract = function (html, start, end) {
  html = html.replace(/(\r\n|\n|\r)/gm, "");

  let startIdx = html.indexOf(start);
  let endIdx = html.indexOf(end);
  return html.substring(startIdx, endIdx + end.length);
};

GO_DOM.extractAll = function (html, start, end) {
  html = html.replace(/(\r\n|\n|\r)/gm, "");

  let startIdx = html.indexOf(start);
  let endIdx = html.indexOf(end);
  let result = html.substring(startIdx, endIdx + end.length);
  let newHtml = html.replace(result, "");

  if (newHtml.indexOf(start) > -1) {
    return [result].concat(this.extractAll(newHtml, start, end));
  } else {
    return [result];
  }
};

GO_DOM.render = function (elemnt, content) {
  let [req, el, html, isPath] = [{}, elemnt, content, false];

  if (Go.is(content, "selector")) {
    el = content;
    html = elemnt;
  }

  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (html.endsWith(".html")) {
    isPath = true;
  }

  if (isPath) {
    Go.appendIfNotExists(el, Go.getSpinnerLoading(), "loading");
    req = Go.http.get(html, { responseType: "text" });

    req.then(async (response) => {
      Go.addClass(el, "target leaving");
      el.innerHTML = Go.eval(response);
      Go.removeClass(el, "leaving");
      Go.addClass(el, "loaded");
      await Go.sleep(Go.env("view_transition_time"));
      Go.removeClass(el, "target loaded");
    });

    req.catch(async (error) => {
      Go.addClass(el, "target leaving");
      el.innerHTML = `<go-error>${Go.getErrorMessage(error)}</go-error>`;
      Go.removeClass(el, "leaving");
      Go.addClass(el, "loaded");
      await Go.sleep(Go.env("view_transition_time"));
      Go.removeClass(el, "target loaded");
    });
  } else {
    el.innerHTML = html;
  }
};

GO_DOM.spinnerLoading = `<loading absolute centered><go-icon name="gspinner"></go-icon></loading>`;

GO_DOM.getSpinnerLoading = function (html) {
  return `<loading absolute centered><go-icon name="gspinner"></go-icon></loading>`;
};

GO_DOM.setSpinnerLoading = function (html) {
  GO_DOM.spinnerLoading = html;
};

GO_DOM.domExec = function (html) {
  const id = Go.uuid();
  const sandbox = document.createElement("div");
  sandbox.id = id;
  sandbox.style.display = "none";

  document.body.appendChild(sandbox);

  if (Go.hasJQuery()) {
    $(`#${id}`).html(html);
  } else {
    sandbox.innerHTML = html;
  }

  Go.sleep(300).then(() => {
    document.body.removeChild(sandbox);
  });
};

GO_DOM.countElements = function (selector) {
  if (!selector) return 0;
  return document.querySelectorAll(selector).length;
};

GO_DOM.parent = window.parent;

GO_DOM.enableFastClick = function () {
  document.addEventListener("touchstart", (e) => {});
};

GO_DOM.isRendered = function (el = "", target = document) {
  if (Go.is(target, "string")) {
    target = document.querySelector(target);
  } else {
    target = target || document;
  }

  return target.querySelector(el);
};

Object.assign(GO, MOD_LUIGIOS_GODOMJS);

const GO_DRAG = function (el) {
  this.el = el;
  this.started = false;
  this.startX = 0;
  this.startY = 0;
  this.distanceX = 0;
  this.distanceY = 0;
  this.direction = "none";
  this.lastX = 0;
  this.lastY = 0;
  Go.extends(this, Go.Events);
  this.listen();
};

const MOD_LUIGIOS_GODRAGJS = { drag: (el) => new GO_DRAG(el) };

GO_DRAG.prototype.listen = function () {
  if (!Go.is(this.el, "HTMLElement")) {
    this.el = document.querySelector(this.el);
  }

  this.el.onmousedown = this.moveStart.bind(this);
  this.el.onmousemove = this.moving.bind(this);
  this.el.onmouseleave = this.moveEnd.bind(this);
  this.el.onmouseup = this.moveEnd.bind(this);
  this.el.onblur = this.moveEnd.bind(this);
  this.el.ondragstart = this.moveStart.bind(this);
  this.el.ondrag = this.moving.bind(this);
  this.el.ondragend = this.moveEnd.bind(this);
  this.el.ontouchstart = this.moveStart.bind(this);
  this.el.ontouchmove = this.moving.bind(this);
  this.el.ontouchend = this.moveEnd.bind(this);
  this.el.ontouchcancel = this.moveEnd.bind(this);
};

GO_DRAG.prototype.moveStart = function (e) {
  this.started = true;
  this.startX = e.pageX || e.touches[0].pageX;
  this.startY = e.pageY || e.touches[0].pageY;
  this.distanceX = 0;
  this.distanceY = 0;
  this.lastX = 0;
  this.lastY = 0;
  this.dirs = {};
  this.emit("moveStart", { event: e, x: this.distanceX, y: this.distanceY });
};

GO_DRAG.prototype.moving = function (e) {
  if (!this.started) return;
  this.distanceX = (e.pageX || e.touches[0].pageX) - this.startX;
  this.distanceY = (e.pageY || e.touches[0].pageY) - this.startY;

  this.dirs = {
    up: this.distanceY < this.lastY,
    down: this.distanceY > this.lastY,
    left: this.distanceX < this.lastX,
    right: this.distanceX > this.lastX,
  };

  this.emit("moving", { event: e, axis: this.dirs, x: this.distanceX, y: this.distanceY });
};

GO_DRAG.prototype.moveEnd = function (e) {
  if (!this.started) return;
  this.started = false;
  this.startX = 0;
  this.startY = 0;
  this.lastX = this.distanceX;
  this.lastY = this.distanceY;
  this.emit("moveEnd", { event: e, axis: this.dirs, x: this.distanceX, y: this.distanceY });
};

Object.assign(GO, MOD_LUIGIOS_GODRAGJS);

const GO_ELEMENT = {};
const GO_ELEMENT_CREATE_PROTOTYPE = {};
const GO_FORM_PROTOTYPE = {};
const originalCreateElement = document.createElement;

const MOD_LUIGIOS_GOELEMENTJS = GO_ELEMENT;

document.createElement = function (tagName, options) {
  const element = originalCreateElement.call(document, tagName, options);

  if (["img", "iframe"].includes(tagName)) {
    Object.assign(element, { ...GO_ELEMENT_CREATE_PROTOTYPE, loading: undefined });
  } else if (["form", "FORM"].includes(tagName)) {
    Object.assign(element, { ...GO_ELEMENT_CREATE_PROTOTYPE, ...GO_FORM_PROTOTYPE });
  } else {
    Object.assign(element, GO_ELEMENT_CREATE_PROTOTYPE);
  }

  return element;
};

GO_ELEMENT.addClass = function (el, className) {
  if (["string"].includes(typeof className) && className.includes(" ")) {
    return className.split(" ").forEach((className) => {
      className && GO_ELEMENT.addClass(el, className);
    });
  }

  if (["string"].includes(typeof className) && className.includes(",")) {
    return className.split(",").forEach((className) => {
      className && GO_ELEMENT.addClass(el, className);
    });
  }

  if (["string"].includes(typeof el)) {
    el = document.querySelectorAll(el);
  }

  if (Go.is(el, "Array") || Go.is(el, "NodeList")) {
    return el.forEach((_el) => {
      GO_ELEMENT.addClass(_el, className);
    });
  }

  if (Go.is(className, "Array")) {
    return className.forEach((className) => {
      className && GO_ELEMENT.addClass(el, className);
    });
  }

  if (el && el.classList) {
    el.classList.add(className);
  }

  return el;
};

GO_ELEMENT.removeClass = function (el, className) {
  if (Go.is(el, "Array") || Go.is(el, "NodeList")) {
    return el.forEach((_el) => {
      GO_ELEMENT.removeClass(_el, className);
    });
  }

  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (Go.is(className, "String") && className.includes(" ")) {
    return className.split(" ").forEach((className) => {
      className && GO_ELEMENT.removeClass(el, className);
    });
  }

  if (Go.is(className, "String") && className.includes(",")) {
    return className.split(",").forEach((className) => {
      className && GO_ELEMENT.removeClass(el, className);
    });
  }

  if (el && el.classList) {
    el.classList.remove(className);
  }

  return el;
};

GO_ELEMENT.removeClasses = function (el, classes) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (Go.is(classes, "String") && classes.includes(" ")) {
    classes = classes.split(" ");
  }

  if (el) {
    classes.forEach((className) => {
      el.classList.remove(className);
    });
  }

  return el;
};

GO_ELEMENT.removeAllClass = function (el, className) {
  if (!Go.isElement(el)) {
    el = document.querySelectorAll(el);
  }

  if (el) {
    el.forEach((_el) => {
      _el.classList.remove(className);
    });
  }

  return el;
};

GO_ELEMENT.rmClass = function () {
  GO_ELEMENT.removeClass(...arguments);
};

GO_ELEMENT.rmClasses = function () {
  GO_ELEMENT.removeClasses(...arguments);
};

GO_ELEMENT.hasClass = function (el, className) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (el) {
    return el.classList.contains(className);
  }

  return false;
};

GO_ELEMENT.toggleClass = function (el, className) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (el) {
    el.classList.toggle(className);
  }
};

GO_ELEMENT.toggleClasses = function (el, classes) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (el) {
    classes.forEach((className) => {
      el.classList.toggle(className);
    });
  }
};

GO_ELEMENT.isEmpty = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (el) {
    return el.innerHTML === "";
  }

  return false;
};

GO_ELEMENT.awaitUntilElement = function (el, config = {}) {
  return GO_ELEMENT.awaitForElement(el, config);
};

GO_ELEMENT.awaitForElement = function (el, config = {}) {
  const selector = el;
  const timeout = config.timeout || 5000;
  const scope = Go.isElement(config) ? config : config.scope || document.body;

  return new Promise((resolve, reject) => {
    const element = scope.querySelector(selector);
    if (element) {
      return resolve(element);
    }

    const observer = new MutationObserver((mutations) => {
      const el = scope.querySelector(selector);
      if (el) {
        observer.disconnect();
        resolve(el);
      }
    });

    observer.observe(scope, { childList: true, subtree: true });

    setTimeout(() => {
      observer.disconnect();
      reject(new Error(`Timeout: Element ${selector} not found`));
    }, timeout);
  });
};

GO_ELEMENT.waitForElement = function (el, config = {}) {
  return GO_ELEMENT.awaitUntilElement(el, config);
};

GO_ELEMENT.awaitElement = function (el, config = {}) {
  return GO_ELEMENT.awaitUntilElement(el, config);
};

GO_ELEMENT.waitForSelector = function (el, config = {}) {
  return GO_ELEMENT.awaitForElement(el, config);
};

GO_ELEMENT.awaitForSelector = function (el, config = {}) {
  return GO_ELEMENT.awaitForElement(el, config);
};

GO_ELEMENT.awaitSelector = function (el, config = {}) {
  return GO_ELEMENT.awaitForElement(el, config);
};

GO_ELEMENT.parseAllAttributes = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) {
    return {};
  }

  const attrs = {};
  const attributes = el.attributes;

  for (let i = 0; i < attributes.length; i++) {
    const { name, value } = attributes[i];
    attrs[name] = value;
  }

  return attrs;
};

GO_ELEMENT.uniqueClass = function (className, el, scope) {
  if (!Go.is(scope, "HTMLElement")) {
    scope = document.querySelector(scope);
  }

  if (Go.isElement(className)) {
    [el, className] = [className, el];
  }

  if (!scope) {
    scope = document.body;
  }

  const [oClassName, oEl] = [className, el];

  if (Go.is(className, "someStartsWith", ["#", "."])) {
    el = oClassName;
    className = oEl;
  }

  if (Go.is(el, "string") && el.includes(",")) {
    el = el.split(",");
  }

  const elements = scope.querySelectorAll(`.${className}`);

  elements && elements.forEach((_el) => _el.classList.remove(className));

  if (Go.is(el, "string")) {
    el = document.querySelectorAll(el);
  }

  if (Go.is(el, "Array") || Go.is(el, "NodeList")) {
    el.forEach((_el) => {
      GO_ELEMENT.addClass(_el, className);
    });
    return;
  }

  GO_ELEMENT.addClass(el, className);
};

GO_ELEMENT.uniClass = function () {
  GO_ELEMENT.uniqueClass(...arguments);
};

GO_ELEMENT.scrollIntoView = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (el) {
    el.scrollIntoView({ behavior: "smooth", block: "start" });
  }
};

GO_ELEMENT.select = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return null;

  Go.extends(el, Go.events);

  return el;
};

GO_ELEMENT.isScrollTop = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return false;

  return el.scrollTop === 0;
};

GO_ELEMENT.isScrollBottom = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return false;

  return el.scrollTop + el.clientHeight === el.scrollHeight;
};

GO_ELEMENT.scrollToBottom = function () {
  return GO_ELEMENT.scrollBottom(...arguments);
};

GO_ELEMENT.isScrollLeft = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return false;

  return el.scrollLeft === 0;
};

GO_ELEMENT.isScrollRight = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return false;

  return el.scrollLeft + el.clientWidth === el.scrollWidth;
};

GO_ELEMENT.scrollBottom = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.scrollTop = el.scrollHeight;
};

GO_ELEMENT.scrollTop = function (el, num = 0) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.scrollTop = num;
};

GO_ELEMENT.scrollLeft = function (el, num = 0) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.scrollLeft = num;
};

GO_ELEMENT.scrollRight = function (el, num = 0) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (Go.is(num, "set")) {
    num = el.scrollWidth;
  }

  el.scrollLeft = num;
};

GO_ELEMENT.scroll = function (el, config = {}) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const { top, left, behavior = "smooth" } = config;

  el.scrollTo({ top, left, behavior });
};

GO_ELEMENT.scrollBy = function (el, config = {}) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const { top, left, behavior = "smooth" } = config;

  el.scrollBy({ top, left, behavior });
};

GO_ELEMENT.scrollIntoView = function (el, config = {}) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const { behavior = "smooth", block = "start", inline = "nearest" } = config;

  el.scrollIntoView({ behavior, block, inline });
};

GO_ELEMENT.scrollIntoViewIfNeeded = function (el, config = {}) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const { behavior = "smooth", block = "start", inline = "nearest" } = config;

  el.scrollIntoViewIfNeeded({ behavior, block, inline });
};

GO_ELEMENT.scrollIntoViewCenter = function (el, config = {}) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const { behavior = "smooth", block = "center", inline = "center" } = config;

  el.scrollIntoView({ behavior, block, inline });
};

GO_ELEMENT.rollUp = function (el, num = 0) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const currentScroll = el.scrollTop;

  el.scrollTo({
    top: currentScroll - num,
    behavior: "smooth",
  });

  return el;
};

GO_ELEMENT.rollDown = function (el, num = 0) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const currentScroll = el.scrollTop;

  el.scrollTo({
    top: currentScroll + num,
    behavior: "smooth",
  });

  return el;
};

GO_ELEMENT.rollLeft = function (el, num = 0) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const currentScroll = el.scrollLeft;

  el.scrollTo({
    left: currentScroll - num,
    behavior: "smooth",
  });

  return el;
};

GO_ELEMENT.rollRight = function (el, num = 0) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const currentScroll = el.scrollLeft;

  el.scrollTo({
    left: currentScroll + num,
    behavior: "smooth",
  });

  return el;
};

GO_ELEMENT.toggleAttribute = function (el, attr, value) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (el.hasAttribute(attr)) {
    el.removeAttribute(attr);
  } else {
    el.setAttribute(attr, value);
  }
};

GO_ELEMENT.setAttributes = function () {
  return GO_ELEMENT.setAttrs(...arguments);
};

GO_ELEMENT.toggleClass = function (el, className) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.classList.toggle(className);
};

GO_ELEMENT.toggleStyle = function (el, style, value) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (el.style[style]) {
    el.style[style] = "";
  } else {
    el.style[style] = value;
  }
};

GO_ELEMENT.toggleAttributeValues = function (el, attr, values) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const index = values.indexOf(el.getAttribute(attr));

  if (index === -1) {
    el.setAttribute(attr, values[0]);
  } else {
    el.setAttribute(attr, values[index + 1] || values[0]);
  }
};

GO_ELEMENT.getAllAttributes = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  return Array.from(el.attributes).reduce((acc, attr) => {
    acc[attr.name] = attr.value;
    return acc;
  }, {});
};

GO_ELEMENT.attr = function (el, attr, value) {
  if (typeof el === "string" && !Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (typeof attr === "object") {
    [attr, value] = Object.entries(attr)[0];
  }

  if (value === undefined) {
    return el.getAttribute && el.getAttribute(attr);
  } else {
    el.setAttribute && el.setAttribute(attr, value);
  }
};

GO_ELEMENT.attrs = function (el, attrs) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (!attrs) return GO_ELEMENT.getAllAttributes(el);

  Object.keys(attrs).forEach((attr) => {
    el.setAttribute(attr, attrs[attr]);
  });
};

GO_ELEMENT.prop = function (el, prop, value = undefined) {
  if (!el) return;

  if (typeof el === "string" && typeof prop === "object") {
    [el, prop] = [prop, el];
  }

  if (Go.is(prop, "array")) {
    return Go.find(el, prop);
  }

  if (!Go.isElement(el) && Go.is(prop, "string")) {
    return Go.getProp(el, prop);
  }

  if (!Go.isElement(el) && Go.is(prop, "object")) {
    return Go.getProp(prop /*Obj*/, el /*Path*/);
  }

  if (!Go.isElement(el) && Go.has(el, "someProperty")) {
    return Go.getProp(el /*Obj*/, prop /*Path*/);
  }

  if (!Go.isElement(el) && typeof el === "string") {
    el = document.querySelector(el);
  }

  if (value === undefined) {
    try {
      return (el && el[prop]) || Go.attr(el, prop);
    } catch (error) {
      console.log(el, prop, error);
    }
  } else {
    el[prop] = value;
  }
};

GO_ELEMENT.hasAttr = function (el, attr) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  return el.hasAttribute(attr);
};

GO_ELEMENT.removeAttr = function (el, attr) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.removeAttribute(attr);
};

GO_ELEMENT.removeAttrs = function (el, attrs) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  attrs.forEach((attr) => {
    el.removeAttribute(attr);
  });
};

GO_ELEMENT.setAttr = function (el, attr, value) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.setAttribute(attr, value);
};

GO_ELEMENT.setAttrs = function (el, attrs) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  Object.keys(attrs).forEach((attr) => {
    el.setAttribute(attr, attrs[attr]);
  });
};

GO_ELEMENT.cssVar = function (el, varName, value) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (value === undefined) {
    return getComputedStyle(el).getPropertyValue(varName);
  } else {
    el.style.setProperty(varName, value);
  }
};

GO_ELEMENT.setCssVar = function () {
  return GO_ELEMENT.cssVar(...arguments);
};

GO_ELEMENT.close = async function (el, cb) {
  if (!el) return;

  if (Go.is(el, "string") && el.includes(",")) {
    el = el.split(",");
  }

  if (Go.is(el, "string") && el.includes("&&")) {
    el = el.split("&&");
  }

  if (Go.is(el, "Array")) {
    return (() => {
      el.forEach((el) => GO_ELEMENT.close(el));
      if (["function"].includes(typeof cb)) cb();
    })();
  }

  if (!Go.isElement(el) && ["string"].includes(typeof el)) {
    el = document.querySelector(el);
  }

  if (!el) {
    return (() => {
      if (["function"].includes(typeof cb)) cb();
    })();
  }

  if (["function"].includes(typeof el.close)) {
    return (() => {
      el.close();
      if (["function"].includes(typeof cb)) cb();
    })();
  }

  const closeBtn = el.querySelector(`#header_${el.id} .closeElement`);

  if (closeBtn) {
    closeBtn.click();
  }

  return () => {
    if (["function"].includes(typeof cb)) cb();
  };
};

GO_ELEMENT.closeAll = function (el, cb) {
  if (!Go.is(el, "NodeList") && !Go.is(el, "Array")) {
    el = document.querySelectorAll(el);
  }

  if (!el) {
    if (Go.is(cb, "Function")) cb();
    return;
  }

  el.forEach((el) => GO_ELEMENT.close(el));

  if (Go.is(cb, "Function")) cb();
};

GO_ELEMENT.text = function (el, text) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (text === undefined) {
    return el.textContent;
  } else {
    el.textContent = text;
  }
};

GO_ELEMENT.html = function (el, html) {
  if (!el) return;

  if (arguments.length === 1 && Array.isArray(el)) {
    return el.map((_el) => GO_ELEMENT.html(_el[0], _el[1]));
  }

  if (!Go.isElement(el) && Go.is(el, "object")) {
    return Go.for(el, (key, value) => {
      GO_ELEMENT.html(key, value);
    });
  }

  if (html && !Go.isElement(html) && Go.is(html, "object")) {
    html = GO_ELEMENT.create(html);
  }

  if ([undefined, null].includes(html)) {
    return el.innerHTML;
  }

  return GO_ELEMENT.putHTML(el, html);
};

GO_ELEMENT.hasJQuery = function () {
  return ["function"].includes(typeof window.$);
};

GO_ELEMENT.putHTML = function (el, html) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (Go.hasJQuery()) {
    $(el).html(html);
  } else if (Go.isElement(html)) {
    requestAnimationFrame(() => {
      el.replaceChildren(html);
    });
  } else {
    requestAnimationFrame(() => {
      el.innerHTML = html;
    });
  }

  return el;
};

GO_ELEMENT.append = function (el, html) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (Go.isElement(html)) {
    return el.append(html);
  }

  el.insertAdjacentHTML("beforeend", html);
};

GO_ELEMENT.appendIfNotExists = function (el, html, selector) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (el.querySelector(selector)) return;

  return GO_ELEMENT.append(el, html);
};

GO_ELEMENT.appendIfReplace = function (el, html, selector) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const old = el.querySelector(selector);
  if (old) old.remove();

  return GO_ELEMENT.append(el, html);
};

GO_ELEMENT.prepend = function (el, html) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (Go.isElement(html)) {
    return el.prepend(html);
  }

  el.insertAdjacentHTML("afterbegin", html);
};

GO_ELEMENT.prependIfNotExists = function (el, html, selector) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (el.querySelector(selector)) return;

  return GO_ELEMENT.prepend(el, html);
};

GO_ELEMENT.cloneNode = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  return el.cloneNode(true);
};

GO_ELEMENT.empty = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.innerHTML = "";
};

GO_ELEMENT.clean = function () {
  return GO_ELEMENT.empty(...arguments);
};

GO_ELEMENT.clear = function () {
  return GO_ELEMENT.empty(...arguments);
};

GO_ELEMENT.in = function (el, prop) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (Go.is(el[prop], "function")) {
    return el[prop]();
  }

  return el[prop];
};

GO_ELEMENT.getClosest = function (el, selector) {
  if (!el) return;

  if (!selector) return;

  if (Go.is(el, "string") && !Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  return el.closest(selector);
};

GO_ELEMENT.closest = function (el, selector) {
  return GO_ELEMENT.getClosest(el, selector);
};

GO_ELEMENT.closeParent = async function (evt, cb) {
  if (evt.preventDefault) {
    evt.preventDefault();
  }

  if (evt.stopPropagation) {
    evt.stopPropagation();
  }

  if (evt.stopImmediatePropagation) {
    evt.stopImmediatePropagation();
  }

  let el = Go.getClosest(evt.target, ".View");

  if (!el) {
    el = Go.getClosest(evt.target, ".element");
  }

  if (!el) return;

  await GO_ELEMENT.close(el);

  if (Go.is(cb, "function")) {
    cb();
  }
};

GO_ELEMENT.infoElement = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  const rect = el.getBoundingClientRect();

  const screenLeft = rect.left + window.scrollX;
  const screenTop = rect.top + window.scrollY;
  const screenBottom = rect.bottom + window.scrollY;
  const screenRight = rect.right + window.scrollX;

  const info = {
    tag: el.tagName.toLowerCase(),
    height: el.offsetHeight,
    width: el.offsetWidth,
    left: el.offsetLeft,
    top: el.offsetTop,
    screenLeft,
    screenTop,
    screenBottom,
    screenRight,
  };

  return info;
};

GO_ELEMENT.info = function () {
  return GO_ELEMENT.infoElement(...arguments);
};

GO_ELEMENT.closest = function (el, selector) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }
  return el.closest(selector);
};

GO_ELEMENT.toggleClass = function (el, className) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.classList.toggle(className);
};

GO_ELEMENT.classIterator = async function (el, classes = []) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  for (const _class of classes) {
    _class.add && Go.addClass(el, _class.add);
    _class.remove && Go.removeClass(el, _class.remove);
    _class.toggle && Go.toggleClass(el, _class.toggle);
    await Go.sleep(_class.delay || _class.duration || _class.time || 0);
  }
};

GO_ELEMENT.attributeIterator = async function (el, attributes = []) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  for (const attribute of attributes) {
    attribute.add && el.setAttribute(attribute.add, attribute.value);
    attribute.remove && el.removeAttribute(attribute.remove);
    await Go.sleep(attribute.delay || attribute.duration || attribute.time || 0);
  }
};

GO_ELEMENT.remove = function (el, scope = document) {
  if (arguments.length === 1 && ["object"].includes(typeof el)) {
    [el, scope] = [el.el, el.scope];
  }

  if (typeof scope === "string") {
    scope = document.querySelector(scope);
  }

  if (typeof el === "string" && scope) {
    el = scope.querySelector(el);
  }

  if (!el) return;

  el.remove && el.remove();
};

GO_ELEMENT.removeIf = function (el, condition) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (condition) {
    el.remove();
  }
};

GO_ELEMENT.element = function (el, extend = true) {
  if (typeof el === "string") {
    el = document.querySelector(el);
  }

  if (el && extend) {
    if (["img", "iframe"].includes(Go.lower(el.tagName))) {
      Object.assign(el, Go.omit(GO_ELEMENT_CREATE_PROTOTYPE, "loading"));
    } else if (["form"].includes(Go.lower(el.tagName))) {
      Object.assign(el, Go.omit(GO_ELEMENT_CREATE_PROTOTYPE, "html", "loading", "name", "parent"));
    } else {
      Object.assign(el, GO_ELEMENT_CREATE_PROTOTYPE);
    }
  }

  return el;
};

GO_ELEMENT.el = function () {
  return GO_ELEMENT.element(...arguments);
};

GO_ELEMENT.all = function () {
  return GO_ELEMENT.els(...arguments);
};

GO_ELEMENT.els = function (selector = "*", scope = document.body) {
  if (["string"].includes(typeof scope)) {
    scope = document.querySelector(scope);
  }

  return GO_ELEMENT.element(scope)?.querySelectorAll(selector);
};

GO_ELEMENT.child = function (el, selector) {
  if (typeof el === "string") {
    el = document.querySelector(el);
  }

  if (!selector) return el;

  if (!el) return;

  return el.querySelector(selector);
};

GO_ELEMENT.changeTagName = function (el, tagName) {
  if (typeof el === "string") {
    el = document.querySelector(el);
  }

  if (!el) return;

  const newEl = document.createElement(tagName);
  newEl.innerHTML = el.innerHTML;
  newEl.className = el.className;
  newEl.id = el.id;

  el.parentNode.replaceChild(newEl, el);

  return newEl;
};

GO_ELEMENT.click = function (el) {
  if (Go.is(el, "string") && el.includes(",")) {
    el = el.split(",").map((el) => el.trim());
    el.forEach((el) => GO_ELEMENT.click(el));
    return;
  }

  if (!Go.isElement(el)) {
    try {
      el = Go.hasJQuery() ? $(el)[0] : document.querySelector(el);
    } catch (error) {
      el = document.querySelector(el);
    }
  }

  if (!el) return;

  if (Go.hasJQuery()) {
    $(el).click();
  } else {
    el.click();
  }
};

GO_ELEMENT.clicke = GO_ELEMENT.click;

GO_ELEMENT.value = function (el, value) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (arguments.length === 1) {
    return el.value;
  }

  el.value = value;
};

GO_ELEMENT.text = function (el, text) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (text === undefined) {
    return el.textContent;
  }

  el.textContent = text;
};

GO_ELEMENT.bringToEndOfDom = function (element) {
  if (!Go.is(element, "HTMLElement")) {
    element = document.querySelector(element);
  }

  if (!element) return;

  const parent = element.parentNode;

  element.remove();

  document.body.appendChild(element);

  return element;
};

GO_ELEMENT.focus = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.focus();
};

GO_ELEMENT.blur = function (el) {
  if (!Go.isElement(el)) {
    el = document.querySelector(el);
  }

  if (!el) return;

  el.blur();
};

GO_ELEMENT.getEventListeners = function (node) {
  if (!Go.is(node, "HTMLElement")) {
    node = document.querySelector(node);
  }

  let listeners = {};
  const cloneNode = node.cloneNode();
  node.parentNode.replaceChild(cloneNode, node);

  cloneNode.addEventListener = (type, listener, options) => {
    if (!listeners[type]) {
      listeners[type] = [];
    }
    listeners[type].push({ type, listener, useCapture: options?.capture || false });
  };

  node.parentNode.replaceChild(node, cloneNode);
  return listeners;
};

GO_ELEMENT.replaceNode = function (oldNode, newNode) {
  if (Go.is(oldNode, "string")) {
    oldNode = document.querySelector(oldNode);
  }

  if (Go.is(newNode, "string")) {
    newNode = document.querySelector(newNode);
  }

  oldNode.parentNode?.replaceChild(newNode, oldNode);

  return newNode;
};

GO_ELEMENT.createSelector = function (className) {
  return className ? "." + className.trim().split(/\s+/).join(".") : "";
};

GO_ELEMENT.reload = function (el) {
  if (arguments.length === 0) {
    return location.reload();
  }

  if (["string"].includes(typeof el) && el.includes(",")) {
    el = el.split(",").map((el) => el.trim());
  }

  if (["string"].includes(typeof el)) {
    el = document.querySelector(el);
  } else if (Array.isArray(el)) {
    return el.forEach((el) => GO_ELEMENT.reload(el));
  }

  if (!el) return;

  el.reload && el.reload();

  return el;
};

GO_ELEMENT.reloadAll = function (el, ...rest) {
  if (["string"].includes(typeof el) && el.includes(",")) {
    el = el.split(",").map((el) => el.trim());
  } else if (["string"].includes(typeof el)) {
    el = document.querySelectorAll(el);
  }

  if (Go.isElement(el)) {
    GO_ELEMENT.reload(el);
  } else {
    el.forEach((e) => {
      if (["string"].includes(typeof e)) {
        Go.for(document.querySelectorAll(e), (_e) => {
          GO_ELEMENT.reload(_e);
        });
      } else if (Go.isElement(e)) {
        GO_ELEMENT.reload(e);
      }
    });
  }

  if (rest.length > 0) {
    rest.forEach((el) => GO_ELEMENT.reloadAll(el));
  }

  return el;
};

GO_ELEMENT.isElement = function (el) {
  return el instanceof HTMLElement || el instanceof Element;
};

GO_ELEMENT.create = function (elem, options = {}) {
  if (!elem) return;

  let tag = elem.tag || elem.tagName || elem || "div";

  if (typeof elem === "object") {
    options = elem;
    delete options.tagName;
  }

  if (typeof tag !== "string") {
    tag = "div";
  }

  let [el, can] = [null, true];

  if (Go.isElement(elem)) {
    el = elem;
  } else {
    el = document.createElement(tag);
  }

  typeof options.if === "boolean" && (can = options.if);
  typeof options.if === "function" && (can = options.if());

  if (!can && !options.else && Go.is(options.if, "set")) {
    return;
  }

  if (!can && options.else) {
    const _else = typeof options.else === "function" ? options.else() : options.else;
    return _else && GO_ELEMENT.create(_else);
  }

  const oncreate = options.oncreate || options.onCreate;

  if (typeof oncreate === "function") {
    oncreate.apply(el, [el]);
  } else if (typeof oncreate === "string") {
    Go.eval(oncreate, el);
  }

  options.innerHTML ||= options.html || options.template || "";
  options.animation ||= options.animate;
  options.srcHTML ||= options.rmtHtml || options.externalHtml || "";

  if (["function"].includes(typeof options.childrens)) {
    options.childrens = options.childrens();
  }

  if (options.srcHTML) {
    options.innerHTML = "rmt://" + options.srcHTML;
  }

  if (["object"].includes(typeof options.innerHTML) && !GO_ELEMENT.isElement(options.innerHTML)) {
    options.childrens ? options.childrens.push(options.innerHTML) : (options.childrens = [options.innerHTML]);
    [el.innerHTML, options.innerHTML] = ["", ""];
  } else if (options.innerHTML && Go.startsWith(options.innerHTML, "rmt://")) {
    const file = options.innerHTML.replace("rmt://", "");
    [el.innerHTML, options.innerHTML] = ["", ""];
    delete options.innerHTML;
    el.appendChild(
      Go.create({
        tag: "div",
        class: "rmt-html",
        html: `<go-icon name="gspinner"></go-icon>`,
        fetchError: function (error) {
          const onError = options.onError || options.onerror || options.error;
          if (typeof onError === "function") {
            onError.apply(el, [error]);
          }
          el.innerHTML = Go.getErrorMessage(error) || String(error);
        },
        onrender: async function () {
          try {
            const html = await Go.executor({
              o1: async () => await Go.http.txt(file, { body: options.payload, cache: options.cache }),
              o2: async () => await Go.http.txt(file, { body: options.payload, cache: options.cache }),
            });

            if (Go.is(html, "json") && Go.getProp(Go.toJson(html), "statusCode")) {
              return this.fetchError(Go.toJson(html));
            }

            return this.fetchSuccess(decodeURIComponent(html));
          } catch (error) {
            console.log(error);
            return this.fetchError(error);
          }
        },
        fetchSuccess: function (html) {
          const onSuccess = options.onSuccess || options.onsuccess || options.success || options.onload || options.onLoad;
          if (typeof onSuccess === "function") {
            onSuccess.apply(el, [html]);
          }
          Go.html(el, Go.eval(html));
        },
      })
    );
  } else if (GO_ELEMENT.isElement(options.innerHTML)) {
    options.childrens ? options.childrens.push(options.innerHTML) : (options.childrens = [options.innerHTML]);
    [el.innerHTML, options.innerHTML] = ["", ""];
  } else if (typeof options.innerHTML === "function") {
    options.innerHTML = options.innerHTML();
  } else if (typeof options.innerHTML === "object" && !options.innerHTML.toString) {
    options.childrens ? options.childrens.push(options.innerHTML) : (options.childrens = [options.innerHTML]);
    [el.innerHTML, options.innerHTML] = ["", ""];
  } else if (options.innerHTML) {
    options.innerHTML = String(options.innerHTML);
  }

  if (options.child) {
    options.childrens ? options.childrens.push(options.child) : (options.childrens = [options.child]);
    [options.child] = [""];
  }

  el.className = `ge ${options.class || options.className || "nc"}`;

  if (options.attrs && options.attributes) {
    Object.assign(options.attrs, options.attributes);
  }

  if (options.beforeContent) {
    options.beforeContent.apply(el, [el, options]);
  }

  if (["img", "iframe"].includes(tag)) {
    Object.assign(el, options, { ...GO_ELEMENT_CREATE_PROTOTYPE, loading: options.loading });
  } else {
    Object.assign(el, options, GO_ELEMENT_CREATE_PROTOTYPE);
  }

  if (typeof options.attrs === "function") {
    options.attrs = options.attrs();
  }

  // This Position for inline attributes
  if (Go.is(options.attrs, "object")) {
    Object.keys(options.attrs).forEach((key) => {
      if (key.startsWith("--")) {
        el.style.setProperty(key, options.attrs[key]);
        return;
      }
      el.setAttribute(key, options.attrs[key]);
    });
  }

  if (options.style) {
    el.setStyle(options.style);
  }

  if (el.styles && typeof el.styles === "object") {
    el.setStyles();
  }

  if (el && options.childrens) {
    for (let i = 0; i < options.childrens.length; i++) {
      const child = options.childrens[i];
      if (GO_ELEMENT.isElement(child)) {
        el.appendChild(child);
      } else if (child) {
        let _child = GO_ELEMENT.create(child);
        _child && el.appendChild(_child);
      }
    }
  }

  options.dynamicClass ||= options.dnClass || options.dnclass;

  if ("function" === typeof options.dynamicClass) {
    const dnCLass = options.dynamicClass.apply(el, [el, options]);
    dnCLass && el.addClass(dnCLass);
  }

  el.src && el.resolveSrc(el);

  options.target && el.toTarget(options);

  options.animation && el.animateElement(options.animation);

  let onRender = options.onrender || options.onRender || el.onrender || el.onRender;

  if (typeof onRender === "function") {
    Go.sleep(0).then(() => onRender.apply(el, [el, options]));
  } else if (typeof onRender === "string") {
    Go.sleep(0).then(() => Go.eval(onRender, el));
  }

  if (options.extends) {
    Object.assign(el, options.extends);
  }

  if (options.prototype) {
    Object.assign(el, options.prototype);
  }

  el.registerEvents(options);

  return el;
};

GO_ELEMENT.paint = GO_ELEMENT.create;

GO_ELEMENT_CREATE_PROTOTYPE.resolveSrc = async function (el) {
  if (Go.startsWith(el.src, "db://")) {
    const src = Go.removeLastIf(el.src, "/");
    const table = Go.string(src).getBetween("db://", "/");
    const id = Go.string(src).splitLast("/");
    const item = await Go.db(table).get(id);
    if (item) el.src = item;
  }
};

GO_ELEMENT_CREATE_PROTOTYPE.toTarget = function (options = {}) {
  const toTarget = async (target, el) => {
    let [waitTarget, modes, awaitEl] = [options.waitForTarget || options.waitTarget, {}, options.awaitElement];
    waitTarget ||= options.awaitTarget || options.awaitForTarget;
    awaitEl ||= options.awaitForElement;

    if (waitTarget) {
      typeof waitTarget === "function" && (waitTarget = await waitTarget());
      typeof waitTarget !== "number" && (waitTarget = 5000);
      await GO_ELEMENT.awaitForElement(target, { timeout: waitTarget });
    }

    if (awaitEl) {
      typeof awaitEl === "function" && (awaitEl = await awaitEl());
      await GO_ELEMENT.awaitForElement(awaitEl, { timeout: 5000, scope: options.scope });
    }

    if (options.scope && ["string"].includes(typeof target)) {
      if (!Go.isElement(options.scope) && ["string"].includes(typeof options.scope)) {
        options.scope = document.querySelector(options.scope);
      }
      target = options.scope.querySelector(target);
    }

    options.id && (options.id = `#${options.id}`);

    modes["append"] = () => {
      Go.append(target, el);
    };

    modes["prepend"] = () => {
      Go.prepend(target, el);
    };

    modes["remove"] = () => {
      GO_ELEMENT.remove(options.id || GO_ELEMENT.createSelector(options.class), target);
    };

    modes["replace"] = () => {
      GO_ELEMENT.remove(options.id || GO_ELEMENT.createSelector(options.class));
      Go.append(target, el);
    };

    modes["default"] = () => {
      Go.html(target, el);
    };

    modes["childrens"] = () => {
      Go.clean(target);
      Go.for(options.childrens, (child) => {
        Go.append(target, GO_ELEMENT.create(child));
      });
    };

    modes["ifNotExists"] = () => {
      let isRender = Go.isRendered(Go.or(options.id, GO_ELEMENT.createSelector(options.class)), target);
      if (!isRender) {
        Go.html(target, el);
      }
    };

    modes["clean"] = () => {
      Go.clean(target);
      Go.html(target, el);
    };

    modes["put"] = () => {
      Go.clean(target);
      Go.html(target, el);
    };

    if (options.clanTarget || options.cleanFirst) {
      Go.clean(target);
    }

    if (options.unique || options.replace) {
      GO_ELEMENT.remove(options.id || GO_ELEMENT.createSelector(options.class), target);
    }

    modes[options.mode] ? modes[options.mode]() : modes["default"]();
  };

  if (Array.isArray(options.target)) {
    for (const target of options.target) {
      GO_ELEMENT.create({ ...options, target });
    }
    return this;
  } else if (options.delay) {
    return Go.sleep(options.delay, () => toTarget(options.target, this));
  } else {
    return toTarget(options.target, this);
  }
};

GO_ELEMENT_CREATE_PROTOTYPE.reactive = function () {
  this.setStyles();
};

GO_ELEMENT_CREATE_PROTOTYPE.registerEvents = function (options = {}) {
  const onEnter = options.onenter || options.onEnter || options.onKeyEnter || options.onEnterKey;
  if (["function"].includes(typeof onEnter)) {
    this.onkeydown = (e) => {
      const isEnter = e.keyCode === 13 && !e.shiftKey;
      if (isEnter) {
        onEnter.apply(this, [e]);
      }
    };
  }

  if (options.oncontextmenu) {
    this.onContextMenu(options);
  }
};

GO_ELEMENT_CREATE_PROTOTYPE.onContextMenu = function () {
  const HOLD_TIME = 550;
  const MOVE_TOLERANCE = 12;

  let timer = null;
  let startX = 0;
  let startY = 0;
  let target = null;
  let triggered = false;

  function reset() {
    clearTimeout(timer);
    timer = null;
    target = null;
    triggered = false;
    startX = 0;
    startY = 0;
  }

  this.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "touch") return;

    startX = e.clientX;
    startY = e.clientY;
    target = e.target;
    triggered = false;

    timer = setTimeout(() => {
      triggered = true;
      target.dispatchEvent(new Event("contextmenu", { bubbles: true }));
    }, HOLD_TIME);
  });

  this.addEventListener("pointerup", (e) => {
    if (e.pointerType !== "touch") return;

    reset();
  });

  this.addEventListener("pointercancel", (e) => {
    if (e.pointerType !== "touch") return;

    reset();
  });

  this.addEventListener("pointermove", (e) => {
    if (e.pointerType !== "touch") return;

    if (Math.abs(e.clientX - startX) > MOVE_TOLERANCE || Math.abs(e.clientY - startY) > MOVE_TOLERANCE) {
      reset();
    }
  });
};

GO_ELEMENT_CREATE_PROTOTYPE.parent = function (selector) {
  if (selector) {
    return this.closest(selector);
  }

  return this.parentNode;
};

GO_ELEMENT_CREATE_PROTOTYPE.animateElement = async function (animation = {}) {
  const _this = this;
  const from = animation.from || {};
  const to = animation.to || {};
  const duration = animation.duration || 250;
  const delay = animation.delay || 0;
  const onFinish = animation.onFinish || animation.onfinish;
  const onStart = animation.onStart || animation.onstart;
  const ease = animation.ease || "ease-in-out";
  const _if = animation.if || false;
  this.style.willChange = "transform";
  this.style.transition = `all ${duration}ms ${ease}`;

  if (["function"].includes(typeof _if) && !_if()) {
    return this;
  }

  Object.keys(from).forEach((key) => {
    this.style[key] = from[key];
  });

  if (delay) await Go.sleep(Number(delay));

  if (["function"].includes(typeof onStart)) {
    onStart.apply(this, [this, animation]);
  }

  await Go.sleep(Number(duration));

  Object.keys(to).forEach((key) => {
    _this.style[key] = to[key];
  });

  if (["function"].includes(typeof onFinish)) {
    onFinish.apply(this, [this, animation]);
  }

  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.setStyle = function (style) {
  let isValidStyle = typeof style === "object" || typeof style === "function";

  if (!isValidStyle) return;

  if (typeof style === "function") {
    style = style();
  }

  Object.keys(style).forEach((key, index, x) => {
    if (key.startsWith("--")) {
      this.style.setProperty(key, style[key]);
      return;
    }
    this.style[key] = style[key];
  });

  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.setStyles = function () {
  if (!this.styles) return;

  this.baseStyles = this.styles.base || {};
  this.breakpointsStyles = this.styles.breakpoints || this.styles.media || this.styles.responsive || {};

  Object.keys(this.baseStyles).forEach((key) => {
    let baseStyle = this.baseStyles[key];

    if (typeof baseStyle === "function") {
      baseStyle = baseStyle();
    }

    this.style[key] = baseStyle;
  });

  Object.keys(this.breakpointsStyles).forEach((breakpoint) => {
    const mediaQuery = window.matchMedia(`(${breakpoint})`);
    let responsiveStyles = this.breakpointsStyles[breakpoint];

    if (typeof responsiveStyles === "function") {
      responsiveStyles = responsiveStyles();
    }

    if (mediaQuery.matches) {
      Object.assign(this.style, responsiveStyles);
    } else {
      Object.assign(this.style, this.baseStyles);
    }
  });

  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.appendChilds = function (...childrens) {
  childrens.forEach((child) => {
    child && this.appendChild(child);
  });

  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.clear = function () {
  this.innerHTML = "";
  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.clean = function () {
  this.innerHTML = "";
  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE["HTML_STATE"] = {
  loading: `<go-icon class="in-loading-icon" name="gspinner"></go-icon>`,
  loaded: ``,
};

GO_ELEMENT_CREATE_PROTOTYPE.loading = function (state) {
  GO_ELEMENT_CREATE_PROTOTYPE["HTML_STATE"]["loaded"] ||= this.innerHTML;

  if (state === this.loadingStatus) return;

  if (state) {
    this.innerHTML = GO_ELEMENT_CREATE_PROTOTYPE["HTML_STATE"]["loading"];
    this.style.pointerEvents = "none";
  } else if (GO_ELEMENT_CREATE_PROTOTYPE["HTML_STATE"]["loaded"]) {
    this.innerHTML = GO_ELEMENT_CREATE_PROTOTYPE["HTML_STATE"]["loaded"];
    this.style.pointerEvents = "auto";
  }

  this.loadingStatus = state;

  if (["img", "iframe", "IMG", "IFRAME"].includes(this.tagName)) {
    this.setAttribute("loading", "auto");
  }

  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.loaded = function () {
  if (!GO_ELEMENT_CREATE_PROTOTYPE["HTML_STATE"]["loaded"]) return;
  this.innerHTML = GO_ELEMENT_CREATE_PROTOTYPE["HTML_STATE"]["loaded"];
  this.style.pointerEvents = "auto";
  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.find = function (selector) {
  const element = this.querySelector(selector);

  if (element) {
    Object.assign(element, GO_ELEMENT_CREATE_PROTOTYPE);
  }

  return element;
};

GO_ELEMENT_CREATE_PROTOTYPE.findOne = GO_ELEMENT_CREATE_PROTOTYPE.find;

GO_ELEMENT_CREATE_PROTOTYPE.findAll = function (selector) {
  return this.querySelectorAll(selector);
};

GO_ELEMENT_CREATE_PROTOTYPE.html = function (html) {
  return GO_ELEMENT.html(this, html);
};

GO_ELEMENT_CREATE_PROTOTYPE.setSrc = function (src) {
  this.setAttribute("src", src);
  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.removeClass = function (_class) {
  if (_class) {
    this.classList.remove(_class);
  }
  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.addClass = function (_class) {
  if (_class) {
    this.classList.add(_class);
  }
  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.reveal = function (opts = {}) {
  this.scrollIntoView({ behavior: "smooth", ...opts });
  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.next = function () {
  return this.nextElementSibling;
};

GO_ELEMENT_CREATE_PROTOTYPE.prev = function () {
  return this.previousElementSibling;
};

GO_ELEMENT_CREATE_PROTOTYPE.replace = function (element) {
  this.parentNode.replaceChild(element, this);
  return element;
};

GO_ELEMENT_CREATE_PROTOTYPE.count = function (selector) {
  return this.querySelectorAll(selector).length;
};

GO_ELEMENT_CREATE_PROTOTYPE.getText = function () {
  return this.textContent || this.innerText;
};

GO_ELEMENT_CREATE_PROTOTYPE.cleanAttributes = function ({ exclude = [] } = {}) {
  const attrs = this.getAttributeNames();
  for (const name of attrs) {
    if (!exclude.includes(name)) {
      this.removeAttribute(name);
    }
  }
  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.formFilled = function () {
  return this.checkValidity();
};

GO_ELEMENT_CREATE_PROTOTYPE.getValues = function () {
  if (!["FORM", "form"].includes(this.tagName)) {
    return;
  }
  return Object.fromEntries(new FormData(this).entries());
};

GO_ELEMENT_CREATE_PROTOTYPE.hasDuplicateValues = function () {
  if (!["FORM", "form"].includes(this.tagName)) {
    return;
  }
  const values = this.getValues();
  return Object.values(values).some((value, index) => Object.values(values).indexOf(value) !== index);
};

GO_ELEMENT_CREATE_PROTOTYPE.extend = function (prototype = {}) {
  Object.assign(this, prototype);
  return this;
};

GO_ELEMENT_CREATE_PROTOTYPE.all = function (selector = "*") {
  return this.querySelectorAll(selector);
};

/* FORM */
GO_FORM_PROTOTYPE.toObject = function () {
  return Object.fromEntries(new FormData(this).entries());
};

GO_FORM_PROTOTYPE.getData = function () {
  return Object.fromEntries(new FormData(this).entries());
};

GO_FORM_PROTOTYPE.get = function (inputName) {
  return new FormData(this).get(inputName);
};

GO_FORM_PROTOTYPE.onsubmit = function (e) {
  return Go.prevent(e);
};
/* FORM */

Object.assign(GO, MOD_LUIGIOS_GOELEMENTJS);

const Emojis = {};

const GO_EMOJIS = function () {
  this.data = Emojis;
};

const emojis = new GO_EMOJIS();

const MOD_LUIGIOS_GOEMOJISJS = {
  emojis: (name, type) => (!name ? emojis : emojis.get(name, type)),
  emoji: (name, type) => emojis.get(name, type),
};

GO_EMOJIS.prototype.load = function (src) {
  if (Go.is(src, "array")) {
    src.forEach((item) => this.load(item));
    return;
  }

  if (Go.is(src, "object") && Go.has(src, "someProperty")) {
    Object.assign(this.data, src);
    return;
  }

  let file = `${src}.js`;

  if (src.endsWith(".js")) {
    file = src;
  }

  return new Promise((resolve, reject) => {
    file = Go.route.fixPath(file);

    const module = Go.import(file);

    module.then(({ default: data }) => {
      Object.assign(this.data, data);
      resolve();
    });

    module.catch((error) => {
      console.error(error);
      reject();
    });
  });
};

GO_EMOJIS.prototype.get = function (str, type) {
  if (Go.is(str, "object")) {
    Object.assign(this.data, str);
    return this;
  }

  if (type === "fa") {
    return `<i class="fas fa-${str}" aria-hidden="true"></i>`;
  }

  const allIcons = Object.assign(this.data, window.icons, this.data);

  let icon = allIcons[str] || Go.getProperty(allIcons, str);

  return icon;
};

GO_EMOJIS.prototype.add = function (icons = {}) {
  Object.assign(this.data, icons);
  return this;
};

Object.assign(Emojis, {
  rocket: "🚀",
  ok: "👌",
  no: "👎",
  yes: "👍",
  100: "💯",
  heart: "❤️",
  heart_eyes: "😍",
  heart_broken: "💔",
  exclamation: "❗️",
  camera: "📸",
  code: "💻",
});

Object.assign(GO, MOD_LUIGIOS_GOEMOJISJS);

const Enviroment = function () {
  this.data = {};
  window.process = window.process || {};
  window.process.env = window.process.env || {};
};

const enviroment = new Enviroment();

const MOD_LUIGIOS_GOENVJS = { env: (str) => (!str ? enviroment : enviroment.get(str)) };

Enviroment.prototype.load = function (src) {
  if (Go.is(src, "array")) {
    src.forEach((item) => this.load(item));
    return;
  }

  if (Go.is(src, "object") && Go.has(src, "someProperty")) {
    Object.assign(this.data, src);
    return;
  }

  let file = `${src}/env.js`;

  if (src.endsWith(".js")) {
    file = src;
  }

  file = Go.route.fixPath(file);

  const [self, module] = [this, import(file)];

  module.then(({ default: enviroment }) => {
    self.set(enviroment);
  });

  module.catch((error) => {
    console.error(error);
  });
};

Enviroment.prototype.get = function (str) {
  if (Go.is(str, "Object")) {
    return this.set(str);
  }

  const allEnvs = Object.assign({}, this.data, window.process.env);
  return Go.getProperty(allEnvs, str);
};

Enviroment.prototype.set = function (obj = {}) {
  Object.assign(this.data, obj);
  Object.assign(window.process.env, obj);
  return this;
};

Object.assign(GO, MOD_LUIGIOS_GOENVJS);

const GO_ERROR = {};

const MOD_LUIGIOS_GOERRORSJS = GO_ERROR;

GO_ERROR.isError = function (error, codeNumber) {
  if (!error) return false;

  if (!codeNumber) return false;

  if (error.toString().includes(`with status code ${codeNumber}`)) {
    return true;
  }

  return false;
};

GO_ERROR.getErrorMessage = function (error, customMessage) {
  if (!error) return "";

  if (["string"].includes(typeof error)) return error;

  if (["string"].includes(typeof error.response) && error.response.startsWith("{")) {
    error = Go.object(error.response);
  }

  let message = Go.getProp(error, ["message", "response.message", "response.data.message", "statusText"], customMessage);

  message ||= error.status && Go.lang(`error_status_${error.status}`);
  message ||= error;

  message = String(message);

  if (["[object XMLHttpRequest]"].includes(message)) {
    message = Go.lang("error_request");
  }

  return String(message);
};

GO_ERROR.try = function (fn, ...args) {
  try {
    return fn(...args);
  } catch (error) {
    return;
  }
};

Object.assign(GO, MOD_LUIGIOS_GOERRORSJS);

const Evaluate = function (data, context) {
  this.data = data;
  this.context = context;
};

const evaluate = (data, context) => new Evaluate(data, context).evaluate(data, context);

const MOD_LUIGIOS_GOEVALJS = { eval: evaluate };

Evaluate.prototype.evaluate = function (data, context) {
  if (!data) return data;

  if (Go.is(data, "function")) {
    return data();
  }

  if (Go.is(data, "stringFunction")) {
    return eval(data);
  }

  const regex = /{{(.*?)}}/g;
  const matches = data.match(regex);

  if (matches) {
    matches.forEach((match) => {
      const key = match.replace("{{", "").replace("}}", "").trim();
      const evaluation = this.eval(key, context);
      data = data.replace(`{{${key}}}`, evaluation);
    });
  }

  return this.revaluate(data, context);
};

Evaluate.prototype.revaluate = function (data, context) {
  const regex = /\${(.*?)}/g;
  const matches = data.match(regex);

  if (matches) {
    matches.forEach((match) => {
      const key = match.replace("${", "").replace("}", "").trim();
      const evaluation = this.eval(key, context);
      data = data.replace(`\${${key}}`, evaluation);
    });
  }

  return data;
};

Evaluate.prototype.eval = function (key, context = false) {
  try {
    if (context) {
      return this.evalInContext(key, context);
    }

    return eval(key);
  } catch (error) {
    return key;
  }
};

Evaluate.prototype.evalInContext = function (js, Context) {
  return function () {
    return eval(js);
  }.call(Context);
};

Object.assign(GO, MOD_LUIGIOS_GOEVALJS);

const GO_EVENTS = { events: [], Events: {} };

const MOD_LUIGIOS_GOEVENTSJS = GO_EVENTS;

GO_EVENTS.emit = function (event, data) {
  if (Go.is(event, "string") && event.includes(" ")) {
    event = event.split(" ");
  }

  if (Go.is(event, "Array")) {
    event.forEach((e) => {
      GO_EVENTS.emit(e, data);
    });
    return;
  }

  GO_EVENTS.events.forEach((e) => {
    if (e.event === event || e.event.startsWith(event + ":")) {
      e.callback(data);
    }
  });
};

GO_EVENTS.on = function (event, callback) {
  if (Array.isArray(event)) {
    event.forEach((e) => {
      GO_EVENTS.on(e, callback);
    });
    return;
  }

  GO_EVENTS.events.push({ event, callback });
};

GO_EVENTS.off = function (event) {
  if (Go.is(event, "string") && event.includes(" ")) {
    event = event.split(" ");
  }

  if (Go.is(event, "Array")) {
    event.forEach((e) => {
      GO_EVENTS.off(e);
    });
    return;
  }

  Go.removeObjectFromArray(GO_EVENTS.events, "event", event);
};

GO_EVENTS.once = function (event, callback) {
  if (Go.is(event, "string") && event.includes(" ")) {
    event = event.split(" ");
  }

  if (Go.is(event, "Array")) {
    event.forEach((e) => {
      GO_EVENTS.once(e, callback);
    });
    return;
  }

  GO_EVENTS.off(event, callback);
  GO_EVENTS.on(event, callback);
};

GO_EVENTS.event = function (name, e) {};

GO_EVENTS.prevent = function (e, cb) {
  e.preventDefault();
  e.stopPropagation();
  return cb && cb();
};

GO_EVENTS.parent = typeof parent.Go === "object" ? parent.Go : parent;

Object.assign(GO_EVENTS.Events, {
  readyEvents: function () {
    this.events = [];
  },
  isGlobalEvents: function () {
    if (!this.events) {
      this.readyEvents();
    }
  },
  on: function (event, callback) {
    if (Array.isArray(event)) {
      event.forEach((e) => {
        this.on(e, callback);
      });
      return;
    }

    this.isGlobalEvents();
    this.events.push({ event, callback });
  },
  emit: function (event, data) {
    this.isGlobalEvents();

    this.events.forEach((e) => {
      if (e.event === event || e.event.startsWith(event + ":")) {
        e.callback(data);
      }
    });
  },
  off: function (event) {
    this.isGlobalEvents();
    Go.removeObjectFromArray(this.events, "event", event);
  },
  once: function (event, callback) {
    this.off(event, callback);
    this.on(event, callback);
  },
});

Object.assign(GO, MOD_LUIGIOS_GOEVENTSJS);

const GO_FETCH = function (path) {
  this.path = path;
};

const MOD_LUIGIOS_GOFETCHJS = { fetch: (path) => new GO_FETCH(path) };

Object.assign(GO, MOD_LUIGIOS_GOFETCHJS);

const GO_FILES = {};

const MOD_LUIGIOS_GOFILESJS = GO_FILES;

GO_FILES.readFIle = function (file, type) {
  // Check if file is of type pass as argument with a regular expression
  if (!file.type.match(type)) {
    return Promise.reject(new Error("Invalid file type"));
  }

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function () {
      resolve(reader.result);
    };

    reader.onerror = function (error) {
      reject(error);
    };
  });
};

GO_FILES.waitForFile = async (url, interval = 1000, timeout = 30000, method = "HEAD") => {
  let [startTime, cb] = [Date.now(), null];

  if (Go.is(url, "object")) {
    url = url.url;
    interval = url.interval;
    timeout = url.timeout;
    cb = url.cb || interval;
    method = url.method;
  }

  const checkFile = async () => {
    try {
      const response = await fetch(url, { method });
      if (response.ok) {
        return Promise.resolve(response);
      }
    } catch (error) {
      // Opcional: Manejar el error, por ejemplo, registrar el error en la consola
      // console.error(`Error fetching ${url}:`, error);
    }

    if (Date.now() - startTime >= timeout) {
      return Promise.reject(new Error(`Timeout: ${url} not available after ${timeout}ms`));
    }

    // Esperar el intervalo antes de realizar la próxima solicitud
    await Go.sleep(interval);

    return checkFile();
  };

  return checkFile();
};

GO_FILES.hasInputFile = (input) => {
  if (!Go.is(input, "object")) {
    return false;
  }

  if (Go.is(input, "File") && input.size > 0) {
    return true;
  }

  if (input.files && input.files[0]) {
    return true;
  }

  return false;
};

GO_FILES.removeExtension = (filename, extension) => {
  if (extension) {
    return filename.replace(extension, "");
  }

  return filename.replace(/\.[^/.]+$/, "");
};

GO_FILES.downloadFile = async function (url, onProgress) {
  let [src, conf] = [url, {}];

  if (["object"].includes(typeof url)) {
    src = url.url || url.src;
    conf = Go.omit(url, "url", "src");
  }

  const response = await fetch(src, conf);

  if (!response.body) {
    throw new Error("No response body");
  }

  const contentLength = response.headers.get("Content-Length") || conf.contentLength;

  if (!contentLength && conf.length !== "omit") {
    throw new Error("No content length available");
  }

  const total = parseInt(contentLength, 10);
  let loaded = 0;

  const reader = response.body.getReader();
  const chunks = [];

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      onProgress(100, 100);
      break;
    }
    chunks.push(value);
    loaded += value.length;
    onProgress(loaded, total);
  }

  return new Blob(chunks);
};

GO_FILES.basename = function (url, ext = true) {
  try {
    const parsedUrl = new URL(url, window.location.href);
    const name = parsedUrl.pathname.split("/").pop();

    if (!ext) {
      return name.includes(".") ? name.split(".").slice(0, -1).join(".") : name;
    }

    return name;
  } catch (error) {
    console.error("URL inválida:", error);
    return "";
  }
};

GO_FILES.downloadLink = function (url, name) {
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  a.remove();
};

GO_FILES.isFileObject = function (input) {
  if (!Go.is(input, "object")) {
    return false;
  }

  if (Go.is(input, "File") && input.size > 0) {
    return true;
  }

  if (input.files && input.files[0]) {
    return true;
  }

  return false;
};

GO_FILES.getExtension = function (filename) {
  if (!filename) return "";
  if (filename.indexOf(".") === -1) return "";
  return filename.split(".").pop().toLowerCase();
};

Object.assign(GO, MOD_LUIGIOS_GOFILESJS);

const GO_FORM = {};

const MOD_LUIGIOS_GOFORMJS = GO_FORM;

GO_FORM.form = function (form) {
  if (!form) return false;

  if (Go.is(form, "string")) {
    form = document.querySelector(form);
  }

  return new FormData(form);
};

GO_FORM.transferInputs = function (from, to, options = {}) {
  if (!from || !to) return false;

  if (Go.is(from, "string")) {
    from = document.querySelector(from);
  }

  if (Go.is(to, "string")) {
    to = document.querySelector(to);
  }

  if (!options.keep) {
    Go.empty(to);
  }

  const inputs = from.querySelectorAll("input, select, textarea");

  for (var i = 0; i < inputs.length; i++) {
    const input = inputs[i];
    const name = input.getAttribute("name");

    if (Go.is(name, "undefined")) {
      continue;
    }

    const value = input.value;
    Go.remove(Go.child(to, `[name="${name}"]`));
    const newInput = document.createElement("input");
    newInput.setAttribute("type", "hidden");
    newInput.setAttribute("name", name);
    newInput.setAttribute("value", value);
    to.appendChild(newInput);
  }
};

GO_FORM.execForm = function (formData, cb) {
  if (Go.is(formData, "string")) {
    formData = document.querySelector(formData);
  }

  if (!formData) {
    return Go.alert(Go.lang("form_not_found"));
  }

  const action = formData.getAttribute("action");

  if (!action) {
    return Go.alert(Go.lang("action_not_found"));
  }

  const method = formData.getAttribute("method") || "POST";

  const body = new FormData(formData);

  const send = Go.xhr(action, { method, body });

  const loader = Go.loader();

  send.catch((error) => {
    loader.close();
    Go.alert(Go.getErrorMessage(error, Go.lang("data_error")));
  });

  send.then((req = {}) => {
    loader.close();

    if (req.success && Go.is(cb, "function")) {
      cb(req);
    }

    if (req.message) {
      Go.alert(req.message);
    }

    if (req.next) {
      Go.eval(req.next);
    }
  });
};

GO_FORM.sendForm = function () {
  return GO_FORM.execForm(...arguments);
};

GO_FORM.send = function () {
  return GO_FORM.execForm(...arguments);
};

GO_FORM.createForm = function (data = {}) {
  let [inputs] = [data.inputs || []];

  let [form, template] = [document.createElement("form"), ""];

  if (Go.is(data.class, "set")) {
    Go.addClass(form, data.class);
  }

  if (Go.is(data.id, "set")) {
    form.setAttribute("id", data.id);
  }

  if (Go.is(data.style, "set")) {
    Go.style(form, data.style);
  }

  template += `<div w100 class="formWrap">`;
  template += `<form id="${data.id || ""}" class="${data.class || ""}" style="${Go.serializeStyle(data.style)}">`;
  for (var i = 0; i < inputs.length; i++) {
    template += GO_FORM.createFormInput({ input: inputs[i], form, data }).template;
  }
  template += `</form>`;

  if (Go.is(data.options, "object")) {
    const options = document.createElement("go-confirm");
    Go.setAttrs(options, data.options);
    form.appendChild(options);

    if (data.options.style) {
      Go.style(options, data.options.style);
    }

    template += options.outerHTML;
  }

  template += `</div>`;

  return { form, template };
};

GO_FORM.createFormInput = function ({ input, form, data = {} }) {
  let [template, groupStyle, groupStart] = ["", "", 0];

  if (Go.is(input, "array")) {
    const groupConfig = input[0];

    if (groupConfig.config) {
      groupStart = 1;
      groupStyle = Go.serializeStyle(groupConfig.style);
    }

    template += `<div w100 class="formGroup" style="${groupStyle}">`;
    for (var i = groupStart; i < input.length; i++) {
      template += GO_FORM.createFormInput({ input: input[i], form, data }).template;
    }
    template += `</div>`;

    return { template };
  }

  const [name, value, type, icon, label] = [input.name, input.value, input.type, input.icon, input.label];
  const newInput = document.createElement("go-input");

  Go.setAttributes(newInput, { type, name, value, label });
  form.appendChild(newInput);

  template += `<go-input type="${type}" name="${name || ""}" value="${value || ""}" icon="${icon || ""}" label="${label || ""}"`;
  template += `style="${Go.serializeStyle(data.inputStyle) || ""}${Go.serializeStyle(input.style) || ""}" `;
  template += `placeholder="${input.placeholder || ""}" `;
  template += `${Go.serializeAttributes(input.attrs)}></go-input>`;

  if (Go.is(data.inputStyle, "set")) {
    Go.style(newInput, data.inputStyle);
  }

  if (Go.is(input.style, "set")) {
    Go.style(newInput, input.style);
  }

  if (Go.is(input.attrs, "set")) {
    Go.attrs(newInput, input.attrs);
  }

  return { input: newInput, template };
};

GO_FORM.formToObject = function (form) {
  if (!form) return false;

  if (Go.is(form, "string")) {
    form = document.querySelector(form);
  }

  if (!Go.is(form, "FormData")) {
    form = new FormData(form);
  }

  const obj = {};

  for (const [key, value] of form) {
    obj[key] = value;
  }

  return obj;
};

Object.assign(GO, MOD_LUIGIOS_GOFORMJS);

const GO__GESTURES = {};

const GO_GESTURES = function (element) {
  this.element = element;
  this.load();
};

const MOD_LUIGIOS_GOGESTURESJS = {
  gestures: function () {
    return new GO_GESTURES(...arguments);
  },
};

GO_GESTURES.prototype.load = function (src) {
  src ||= "/sdk/hammerjs/hammerjs.min.js";

  if (GO__GESTURES["loaded"]) {
    return;
  }

  Go.load(src).then(() => {
    GO__GESTURES["loaded"] = true;
  });
};

GO_GESTURES.prototype.on = function (event, cb) {
  if (!GO__GESTURES["loaded"]) {
    return Go.sleep(100).then(() => this.on(event, cb));
  }

  this.hammer = new Hammer(this.element);

  this.hammer.get("swipe").set({ direction: Hammer.DIRECTION_ALL });

  if (typeof event === "string") {
    this.hammer.on(event, cb);
  } else if (typeof event === "object") {
    Go.for(event, (k, v) => this.hammer.on(k, typeof v === "string" ? eval(v) : v));
  }
};

GO_GESTURES.prototype.off = function (event, cb) {
  if (typeof event === "string") {
    this.hammer.off(event, cb);
  } else if (typeof event === "object") {
    Go.for(event, (k, v) => this.hammer.off(k, typeof v === "string" ? eval(v) : v));
  }
};

GO_GESTURES.prototype.isDir = function (evt, cb) {
  switch (this.element.direction) {
    case Hammer.DIRECTION_UP:
      return this.thisDir("up", evt, cb);
    case Hammer.DIRECTION_DOWN:
      return this.thisDir("down", evt, cb);
    case Hammer.DIRECTION_LEFT:
      return this.thisDir("left", evt, cb);
    case Hammer.DIRECTION_RIGHT:
      return this.thisDir("right", evt, cb);
  }
  return false;
};

GO_GESTURES.prototype.thisDir = function (dir, evt, cb) {
  if (dir === evt) {
    return (cb && cb()) || true;
  }
  return false;
};

Object.assign(GO, MOD_LUIGIOS_GOGESTURESJS);

const MOD_LUIGIOS_GOGTAGJS = {
  gtag: function (tag, cb, type = "gtag") {
    let url = `https://www.googletagmanager.com/${type}/js?id=${tag}`;

    if (typeof cb === "string") {
      [type, cb] = [cb, type];
    }

    if (type === "gtm") {
      url = `https://www.googletagmanager.com/${type}.js?id=${tag}`;
    }

    return new Promise((resolve, reject) => {
      Go.create({
        async: true,
        tag: "script",
        type: "text/javascript",
        src: url,
        target: document.head,
        mode: "prepend",
        onerror: (error) => {
          console.warn(url, error);
          reject(error);
        },
        onload: (value) => {
          dataLayer.push("js", new Date());
          dataLayer.push("config", tag);
          resolve(value, cb && cb(value));
        },
      });
    });
  },
};

Object.assign(GO, MOD_LUIGIOS_GOGTAGJS);

const Http = function (opts = {}) {
  this.opts = opts;
};

const HttpResponse = function (data = {}) {
  Object.assign(this, data);
  this.data = data;
};

const MOD_LUIGIOS_GOHTTPJS = {
  http: new Http(),
  res: (data) => new HttpResponse(data).res(),
  response: (data) => new HttpResponse(data).res(),
};

Http.prototype.get = function (url, options = {}) {
  options.method = "get";

  return new Promise((resolve, reject) => {
    Go.xhr(url, options)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Http.prototype.post = function (url, options = {}) {
  if (Go.is(options, "FormData")) {
    options = { body: options };
  }

  options.method = "post";

  return new Promise((resolve, reject) => {
    Go.xhr(url, options)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Http.prototype.put = function (url, options = {}) {
  if (Go.is(options, "FormData")) {
    options = { body: options };
  }

  options.method = "put";

  return new Promise((resolve, reject) => {
    Go.xhr(url, options)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Http.prototype.patch = function (url, options = {}) {
  if (Go.is(options, "FormData")) {
    options = { body: options };
  }

  options.method = "patch";

  return new Promise((resolve, reject) => {
    Go.xhr(url, options)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Http.prototype.defaults = function (url, options = {}) {
  return new Promise((resolve, reject) => {
    Go.xhr(url, options)
      .then((res) => {
        resolve(res);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

Http.prototype.delete = function (url, options = {}) {
  options.method = "delete";
  return this.defaults(url, options);
};

Http.prototype.head = function (url, options = {}) {
  options.method = "head";
  return this.defaults(url, options);
};

Http.prototype.options = function (url, options = {}) {
  options.method = "options";
  return this.defaults(url, options);
};

Http.prototype.trace = function (url, options = {}) {
  options.method = "trace";
  return this.defaults(url, options);
};

Http.prototype.json = function (url, options = {}) {
  if (Go.is(options, "FormData")) {
    options = { body: options };
  }

  options.method ||= "post";
  options.responseType = "json";
  return this.defaults(url, options);
};

Http.prototype.text = function (url, options = {}) {
  if (Go.is(options, "FormData")) {
    options = { body: options };
  }

  options.method ||= "post";
  options.responseType = "text";
  return this.defaults(url, options);
};

Http.prototype.txt = Http.prototype.text;

HttpResponse.prototype.toString = function () {
  return Go.getErrorMessage(this);
};

HttpResponse.prototype.res = function () {
  this.message = Go.getErrorMessage(this);
  return this;
};

Object.assign(GO, MOD_LUIGIOS_GOHTTPJS);

const GO_HYPERLIST = function () {
  return (function () {
    function r(e, n, t) {
      function o(i, f) {
        if (!n[i]) {
          if (!e[i]) {
            var c = "function" == typeof require && require;
            if (!f && c) return c(i, !0);
            if (u) return u(i, !0);
            var a = new Error("Cannot find module '" + i + "'");
            throw ((a.code = "MODULE_NOT_FOUND"), a);
          }
          var p = (n[i] = { exports: {} });
          e[i][0].call(
            p.exports,
            function (r) {
              var n = e[i][1][r];
              return o(n || r);
            },
            p,
            p.exports,
            r,
            e,
            n,
            t
          );
        }
        return n[i].exports;
      }
      for (var u = "function" == typeof require && require, i = 0; i < t.length; i++) o(t[i]);
      return o;
    }
    return r;
  })()(
    {
      1: [
        function (_dereq_, module, exports) {
          "use strict";

          // Default configuration.
          Object.defineProperty(exports, "__esModule", { value: true });

          var _createClass = (function () {
            function defineProperties(target, props) {
              for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
              }
            }
            return function (Constructor, protoProps, staticProps) {
              if (protoProps) defineProperties(Constructor.prototype, protoProps);
              if (staticProps) defineProperties(Constructor, staticProps);
              return Constructor;
            };
          })();

          function _defineProperty(obj, key, value) {
            if (key in obj) {
              Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true });
            } else {
              obj[key] = value;
            }
            return obj;
          }

          function _classCallCheck(instance, Constructor) {
            if (!(instance instanceof Constructor)) {
              throw new TypeError("Cannot call a class as a function");
            }
          }

          var defaultConfig = {
            width: "100%",
            height: "100%",
          };

          // Check for valid number.
          var isNumber = function isNumber(input) {
            return Number(input) === Number(input);
          };

          // Add a class to an element.
          var addClass =
            "classList" in document.documentElement
              ? function (element, className) {
                  element.classList.add(className);
                }
              : function (element, className) {
                  var oldClass = element.getAttribute("class") || "";
                  element.setAttribute("class", oldClass + " " + className);
                };

          /**
           * Creates a HyperList instance that virtually scrolls very large amounts of
           * data effortlessly.
           */

          var HyperList = (function () {
            _createClass(HyperList, null, [
              {
                key: "create",
                value: function create(element, userProvidedConfig) {
                  return new HyperList(element, userProvidedConfig);
                },
              },
              /**
               * Merge given css style on an element
               * @param {DOMElement} element
               * @param {Object} style
               */
              {
                key: "mergeStyle",
                value: function mergeStyle(element, style) {
                  for (var i in style) {
                    if (element.style[i] !== style[i]) {
                      element.style[i] = style[i];
                    }
                  }
                },
              },
              {
                key: "getMaxBrowserHeight",
                value: function getMaxBrowserHeight() {
                  // Create two elements, the wrapper is `1px` tall and is transparent and
                  // positioned at the top of the page. Inside that is an element that gets
                  // set to 1 billion pixels. Then reads the max height the browser can
                  // calculate.
                  var wrapper = document.createElement("div");
                  var fixture = document.createElement("div");

                  HyperList.mergeStyle(wrapper, { position: "absolute", height: "1px", opacity: 0 });
                  HyperList.mergeStyle(fixture, { height: "1e7px" });

                  wrapper.appendChild(fixture);
                  document.body.appendChild(wrapper);

                  var maxElementHeight = fixture.offsetHeight;

                  document.body.removeChild(wrapper);

                  return maxElementHeight;
                },
              },
            ]);

            function HyperList(element, userProvidedConfig) {
              var _this = this;

              _classCallCheck(this, HyperList);

              this._config = {};
              this._lastRepaint = null;
              this._maxElementHeight = HyperList.getMaxBrowserHeight();

              // Anti overlap (async renderChunk)
              this._rendering = false;
              this._pendingScrollTop = null;

              // Cache (optional) and mounted rows (core fix: don't nuke DOM)
              this._rowCache = new Map();
              this._mountedRows = new Map();

              this.refresh(element, userProvidedConfig);

              var config = this._config;

              // Create internal render loop.
              var render = async function render() {
                var scrollTop = _this._getScrollPosition();
                var lastRepaint = _this._lastRepaint;

                _this._renderAnimationFrame = window.requestAnimationFrame(render);

                // Don't treat 0 as falsy "no repaint"
                if (lastRepaint !== null && lastRepaint !== undefined && scrollTop === lastRepaint) {
                  return;
                }

                // If render in-flight, remember latest scrollTop and skip
                if (_this._rendering) {
                  _this._pendingScrollTop = scrollTop;
                  return;
                }

                var diff = lastRepaint === null || lastRepaint === undefined ? 0 : scrollTop - lastRepaint;

                if (lastRepaint === null || lastRepaint === undefined || diff < 0 || diff > _this._averageHeight) {
                  _this._rendering = true;

                  try {
                    var rendered = await _this._renderChunk();

                    _this._lastRepaint = scrollTop;

                    if (rendered !== false && typeof config.afterRender === "function") {
                      config.afterRender();
                    }

                    _this._isScrollBottom();
                  } finally {
                    _this._rendering = false;

                    // If scroll happened during rendering, do one extra pass ASAP
                    if (_this._pendingScrollTop !== null && _this._pendingScrollTop !== _this._lastRepaint) {
                      await _this._renderChunk(true);
                      _this._lastRepaint = _this._pendingScrollTop;
                    }
                    _this._pendingScrollTop = null;
                  }
                }
              };

              render();
            }

            _createClass(HyperList, [
              {
                key: "destroy",
                value: function destroy() {
                  window.cancelAnimationFrame(this._renderAnimationFrame);
                },
              },
              {
                key: "refresh",
                value: function refresh(element, userProvidedConfig) {
                  var _scrollerStyle;

                  Object.assign(this._config, defaultConfig, userProvidedConfig);

                  if (!element || element.nodeType !== 1) {
                    throw new Error("HyperList requires a valid DOM Node container");
                  }

                  this._element = element;

                  var config = this._config;

                  var scroller = this._scroller || config.scroller || document.createElement(config.scrollerTagName || "tr");

                  // Default configuration option `useFragment` to `true`.
                  if (typeof config.useFragment !== "boolean") {
                    this._config.useFragment = true;
                  }

                  // Default: cache rows by index (helps when items are expensive)
                  if (typeof config.cacheRows !== "boolean") {
                    this._config.cacheRows = true;
                  }

                  if (!config.generate) {
                    throw new Error("Missing required `generate` function");
                  }

                  if (!isNumber(config.total)) {
                    throw new Error("Invalid required `total` value, expected number");
                  }

                  if (!Array.isArray(config.itemHeight) && !isNumber(config.itemHeight)) {
                    throw new Error("\n        Invalid required `itemHeight` value, expected number or array\n      ".trim());
                  } else if (isNumber(config.itemHeight)) {
                    this._itemHeights = Array(config.total).fill(config.itemHeight);
                  } else {
                    this._itemHeights = config.itemHeight;
                  }

                  // Width/height coercion
                  Object.keys(defaultConfig)
                    .filter(function (prop) {
                      return prop in config;
                    })
                    .forEach(function (prop) {
                      var value = config[prop];
                      var isValueNumber = isNumber(value);

                      if (value && typeof value !== "string" && typeof value !== "number") {
                        var msg = "Invalid optional `" + prop + "`, expected string or number";
                        throw new Error(msg);
                      } else if (isValueNumber) {
                        config[prop] = value + "px";
                      }
                    });

                  var isHoriz = Boolean(config.horizontal);
                  var value = config[isHoriz ? "width" : "height"];

                  if (value) {
                    var isValueNumber = isNumber(value);
                    var isValuePercent = isValueNumber ? false : value.slice(-1) === "%";
                    var numberValue = isValueNumber ? value : parseInt(value.replace(/px|%/, ""), 10);
                    var innerSize = window[isHoriz ? "innerWidth" : "innerHeight"];

                    if (isValuePercent) {
                      this._containerSize = (innerSize * numberValue) / 100;
                    } else {
                      this._containerSize = isNumber(value) ? value : numberValue;
                    }
                  }

                  var scrollContainer = config.scrollContainer;
                  var scrollerHeight = config.itemHeight * config.total;
                  var maxElementHeight = this._maxElementHeight;

                  if (scrollerHeight > maxElementHeight) {
                    console.warn(["HyperList: The maximum element height", maxElementHeight + "px has", "been exceeded; please reduce your item height."].join(" "));
                  }

                  // Container styles
                  var elementStyle = {
                    width: "" + config.width,
                    height: scrollContainer ? scrollerHeight + "px" : "" + config.height,
                    overflow: scrollContainer ? "none" : "auto",
                    position: "relative",
                  };

                  HyperList.mergeStyle(element, elementStyle);

                  if (scrollContainer) {
                    HyperList.mergeStyle(config.scrollContainer, { overflow: "auto" });
                  }

                  var scrollerStyle =
                    ((_scrollerStyle = {
                      opacity: "0",
                      position: "absolute",
                    }),
                    _defineProperty(_scrollerStyle, isHoriz ? "height" : "width", "1px"),
                    _defineProperty(_scrollerStyle, isHoriz ? "width" : "height", scrollerHeight + "px"),
                    _scrollerStyle);

                  HyperList.mergeStyle(scroller, scrollerStyle);

                  // Only append the scroller element once.
                  if (!this._scroller) {
                    element.appendChild(scroller);
                  } else if (scroller.parentNode !== element) {
                    element.appendChild(scroller);
                  }

                  var padding = this._computeScrollPadding();
                  this._scrollPaddingBottom = padding.bottom;
                  this._scrollPaddingTop = padding.top;

                  // Set the scroller instance.
                  this._scroller = scroller;
                  this._scrollHeight = this._computeScrollHeight();

                  // Reuse the item positions if refreshed, otherwise set to empty array.
                  this._itemPositions = this._itemPositions || Array(config.total).fill(0);

                  // Each index in the array should represent the position in the DOM.
                  this._computePositions(0);

                  // IMPORTANT: no nuking DOM. We keep mounted rows map; on refresh we can clear if desired.
                  // If total changed drastically, safest: clear mounted + cache.
                  if (typeof config.clearOnRefresh === "boolean" ? config.clearOnRefresh : false) {
                    this._mountedRows && this._mountedRows.forEach((node) => node && node.parentNode === element && element.removeChild(node));
                    this._mountedRows = new Map();
                    this._rowCache = new Map();
                  }

                  // Render after refreshing. Force render if calling refresh manually.
                  this._renderChunk(this._lastRepaint !== null);

                  if (typeof config.afterRender === "function") {
                    config.afterRender();
                  }
                },
              },

              // Position helper (core)
              {
                key: "_positionRow",
                value: function _positionRow(item, i) {
                  var config = this._config;

                  addClass(item, config.rowClassName || "vrow");

                  var top = this._itemPositions[i] + this._scrollPaddingTop;

                  HyperList.mergeStyle(
                    item,
                    _defineProperty(
                      {
                        position: "absolute",
                      },
                      config.horizontal ? "left" : "top",
                      top + "px"
                    )
                  );
                },
              },

              // Cache helpers (optional)
              {
                key: "_getCachedRow",
                value: function _getCachedRow(i) {
                  var config = this._config;
                  if (!config.cacheRows) return null;

                  if (this._rowCache && this._rowCache.has(i)) {
                    var el = this._rowCache.get(i);
                    // refresh LRU order
                    this._rowCache.delete(i);
                    this._rowCache.set(i, el);
                    return el;
                  }
                  return null;
                },
              },
              {
                key: "_setCachedRow",
                value: function _setCachedRow(i, el) {
                  var config = this._config;
                  if (!config.cacheRows) return;

                  if (!this._rowCache) this._rowCache = new Map();

                  if (this._rowCache.has(i)) this._rowCache.delete(i);
                  this._rowCache.set(i, el);

                  // LRU limit
                  var limit = Math.max((this._cachedItemsLen || 0) * 2, 200);
                  while (this._rowCache.size > limit) {
                    var oldestKey = this._rowCache.keys().next().value;
                    this._rowCache.delete(oldestKey);
                  }
                },
              },

              {
                key: "_getRow",
                value: async function _getRow(i) {
                  var config = this._config;

                  // Cache first
                  var cached = this._getCachedRow(i);
                  var item = cached ? cached : await config.generate(i);

                  // If generator returns { element, height }, support it
                  var height = item && item.height !== undefined ? item.height : undefined;

                  if (height !== undefined && isNumber(height)) {
                    item = item.element;

                    if (height !== this._itemHeights[i]) {
                      this._itemHeights[i] = height;
                      this._computePositions(i);
                      this._scrollHeight = this._computeScrollHeight(i);
                    }
                  } else {
                    height = this._itemHeights[i];
                  }

                  if (!item || item.nodeType !== 1) {
                    throw new Error("Generator did not return a DOM Node for index: " + i);
                  }

                  this._positionRow(item, i);

                  this._setCachedRow(i, item);

                  return item;
                },
              },

              {
                key: "_getScrollPosition",
                value: function _getScrollPosition() {
                  var config = this._config;

                  if (typeof config.overrideScrollPosition === "function") {
                    return config.overrideScrollPosition();
                  }

                  return this._element[config.horizontal ? "scrollLeft" : "scrollTop"];
                },
              },

              {
                key: "_isScrollBottom",
                value: function _isScrollBottom() {
                  var config = this._config;
                  config.offsetGap = config.offsetGap || 50;

                  const { scrollTop, offsetHeight, scrollHeight, offsetGap = config.offsetGap } = this._element;
                  const scrolledToBottom = scrollTop + offsetHeight + offsetGap >= scrollHeight;

                  if (scrolledToBottom && typeof config.onScrollBottom === "function") {
                    return config.onScrollBottom();
                  }

                  if (scrolledToBottom && typeof config.onBottom === "function") {
                    return config.onBottom();
                  }
                },
              },

              // IMPORTANT: this version DOES NOT clear element DOM.
              // It only removes rows that leave range and adds rows that enter range.
              {
                key: "_renderChunk",
                value: async function _renderChunk(force) {
                  var config = this._config;
                  var element = this._element;
                  var scrollTop = this._getScrollPosition();
                  var total = config.total;

                  var from = config.reverse ? this._getReverseFrom(scrollTop) : this._getFrom(scrollTop) - 1;

                  if (from < 0 || from - this._screenItemsLen < 0) {
                    from = 0;
                  }

                  if (!force && this._lastFrom === from) {
                    return false;
                  }

                  this._lastFrom = from;

                  var to = from + this._cachedItemsLen;

                  if (to > total || to + this._cachedItemsLen > total) {
                    to = total;
                  }

                  // Ensure scroller stays mounted
                  var scroller = this._scroller;
                  if (scroller && scroller.parentNode !== element) {
                    element.appendChild(scroller);
                  }

                  var mounted = this._mountedRows || (this._mountedRows = new Map());

                  // Remove rows that are out of range
                  for (var _iterator = mounted.entries(), _step; !(_step = _iterator.next()).done; ) {
                    var entry = _step.value;
                    var idx = entry[0];
                    var node = entry[1];

                    if (idx < from || idx >= to) {
                      if (node && node.parentNode === element) {
                        element.removeChild(node);
                      }
                      mounted.delete(idx);
                    }
                  }

                  // Add or reposition rows within range
                  for (var i = from; i < to; i++) {
                    if (mounted.has(i)) {
                      this._positionRow(mounted.get(i), i);
                      continue;
                    }

                    var row = await this._getRow(i);

                    if (row.parentNode !== element) {
                      element.appendChild(row);
                    }

                    mounted.set(i, row);
                  }

                  // If user supplies applyPatch, keep compatibility (but note: if applyPatch clears DOM, flicker returns)
                  if (config.applyPatch) {
                    var fragment = document.createDocumentFragment();
                    fragment.appendChild(scroller);
                    for (var j = from; j < to; j++) {
                      var rn = mounted.get(j);
                      if (rn) fragment.appendChild(rn);
                    }
                    return config.applyPatch(element, fragment);
                  }
                },
              },

              {
                key: "_computePositions",
                value: function _computePositions() {
                  var from = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

                  var config = this._config;
                  var total = config.total;
                  var reverse = config.reverse;

                  if (from < 1 && !reverse) {
                    from = 1;
                  }

                  for (var i = from; i < total; i++) {
                    if (reverse) {
                      if (i === 0) {
                        this._itemPositions[0] = this._scrollHeight - this._itemHeights[0];
                      } else {
                        this._itemPositions[i] = this._itemPositions[i - 1] - this._itemHeights[i];
                      }
                    } else {
                      this._itemPositions[i] = this._itemHeights[i - 1] + this._itemPositions[i - 1];
                    }
                  }
                },
              },

              {
                key: "_computeScrollHeight",
                value: function _computeScrollHeight() {
                  var _HyperList$mergeStyle2,
                    _this2 = this;

                  var config = this._config;
                  var isHoriz = Boolean(config.horizontal);
                  var total = config.total;
                  var scrollHeight =
                    this._itemHeights.reduce(function (a, b) {
                      return a + b;
                    }, 0) +
                    this._scrollPaddingBottom +
                    this._scrollPaddingTop;

                  HyperList.mergeStyle(
                    this._scroller,
                    ((_HyperList$mergeStyle2 = {
                      opacity: 0,
                      position: "absolute",
                      top: "0px",
                    }),
                    _defineProperty(_HyperList$mergeStyle2, isHoriz ? "height" : "width", "1px"),
                    _defineProperty(_HyperList$mergeStyle2, isHoriz ? "width" : "height", scrollHeight + "px"),
                    _HyperList$mergeStyle2)
                  );

                  // Calculate the height median
                  var sortedItemHeights = this._itemHeights.slice(0).sort(function (a, b) {
                    return a - b;
                  });
                  var middle = Math.floor(total / 2);
                  var averageHeight = total % 2 === 0 ? (sortedItemHeights[middle] + sortedItemHeights[middle - 1]) / 2 : sortedItemHeights[middle];

                  var clientProp = isHoriz ? "clientWidth" : "clientHeight";
                  var element = config.scrollContainer ? config.scrollContainer : this._element;
                  var containerHeight = element[clientProp] ? element[clientProp] : this._containerSize;
                  this._screenItemsLen = Math.ceil(containerHeight / averageHeight);
                  this._containerSize = containerHeight;

                  // Cache 3 times items in viewport
                  this._cachedItemsLen = Math.max(this._cachedItemsLen || 0, this._screenItemsLen * 3);
                  this._averageHeight = averageHeight;

                  if (config.reverse) {
                    window.requestAnimationFrame(function () {
                      if (isHoriz) {
                        _this2._element.scrollLeft = scrollHeight;
                      } else {
                        _this2._element.scrollTop = scrollHeight;
                      }
                    });
                  }

                  return scrollHeight;
                },
              },

              {
                key: "_computeScrollPadding",
                value: function _computeScrollPadding() {
                  var config = this._config;
                  var isHoriz = Boolean(config.horizontal);
                  var isReverse = config.reverse;
                  var styles = window.getComputedStyle(this._element);

                  var padding = function padding(location) {
                    var cssValue = styles.getPropertyValue("padding-" + location);

                    if (config.padding) {
                      cssValue = config.padding[location] + cssValue;
                    }

                    return parseInt(cssValue, 10) || 0;
                  };

                  if (isHoriz && isReverse) {
                    return { bottom: padding("left"), top: padding("right") };
                  } else if (isHoriz) {
                    return { bottom: padding("right"), top: padding("left") };
                  } else if (isReverse) {
                    return { bottom: padding("top"), top: padding("bottom") };
                  } else {
                    return { bottom: padding("bottom"), top: padding("top") };
                  }
                },
              },

              {
                key: "_getFrom",
                value: function _getFrom(scrollTop) {
                  var i = 0;
                  while (this._itemPositions[i] < scrollTop) {
                    i++;
                  }
                  return i;
                },
              },

              {
                key: "_getReverseFrom",
                value: function _getReverseFrom(scrollTop) {
                  var i = this._config.total - 1;
                  while (i > 0 && this._itemPositions[i] < scrollTop + this._containerSize) {
                    i--;
                  }
                  return i;
                },
              },
            ]);

            return HyperList;
          })();

          if (typeof window !== "undefined") {
            window.HyperList = HyperList;
          }
        },
        {},
      ],
    },
    {},
    [1]
  )(1);
};

const MOD_LUIGIOS_GOHYPERLISTJS = {
  initHyperList: () => GO_HYPERLIST(),
};

Object.assign(GO, MOD_LUIGIOS_GOHYPERLISTJS);

const Icons = {};

const GO_ICONS = function () {
  this.data = Icons;
};

const icons = new GO_ICONS();

const MOD_LUIGIOS_GOICONSJS = {
  icons: (name, type) => (!name ? icons : icons.get(name, type)),
  icon: (name, type) => icons.get(name, type),
};

GO_ICONS.prototype.load = function (src) {
  if (Go.is(src, "array")) {
    src.forEach((item) => this.load(item));
    return;
  }

  if (Go.is(src, "object") && Go.has(src, "someProperty")) {
    Object.assign(this.data, src);
    return;
  }

  let file = `${src}.js`;

  if (src.endsWith(".js")) {
    file = src;
  }

  return new Promise((resolve, reject) => {
    file = Go.route.fixPath(file);

    const module = Go.import(file);

    module.then(({ default: data }) => {
      Object.assign(this.data, data);
      resolve();
    });

    module.catch((error) => {
      console.error(error);
      reject();
    });
  });
};

GO_ICONS.prototype.get = function (str, type) {
  if (Go.is(str, "object")) {
    Object.assign(this.data, str);
    return this;
  }

  if (type === "fa") {
    return `<i class="fas fa-${str}" aria-hidden="true"></i>`;
  }

  const allIcons = Object.assign(this.data, window.icons, this.data);

  let icon = allIcons[str] || Go.getProperty(allIcons, str);

  if (typeof icon === "function") {
    icon = icon(Array.prototype.slice.call(arguments, 1));
  }

  return icon;
};

GO_ICONS.prototype.add = function (icons = {}) {
  Object.assign(this.data, icons);
  return this;
};

Object.assign(Icons, {
  user: `<svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="user" class="svg-inline--fa fa-user fa-w-14" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><path fill="currentColor" d="M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z"></path></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" height="1em" viewBox="0 0 512 512"><!--! Font Awesome Free 6.4.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2023 Fonticons, Inc. --><path d="M416 208c0 45.9-14.9 88.3-40 122.7L502.6 457.4c12.5 12.5 12.5 32.8 0 45.3s-32.8 12.5-45.3 0L330.7 376c-34.4 25.2-76.8 40-122.7 40C93.1 416 0 322.9 0 208S93.1 0 208 0S416 93.1 416 208zM208 352a144 144 0 1 0 0-288 144 144 0 1 0 0 288z"/></svg>`,
  times: `<?xml version="1.0" encoding="UTF-8" ?> <!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd"> <svg width="124pt" height="122pt" viewBox="0 0 124 122" version="1.1" xmlns="http://www.w3.org/2000/svg"> <g id="#ffffffff"> </g> <g id="#183153ff"> <path fill="#183153" opacity="1.00" d=" M 2.65 10.25 C -1.46 5.67 6.02 -1.96 10.57 2.35 C 26.92 18.35 43.12 34.51 59.38 50.61 C 60.04 51.46 61.47 52.76 62.44 51.49 C 78.69 35.37 94.90 19.21 111.15 3.09 C 112.24 1.96 113.74 1.38 115.20 0.88 C 118.36 1.36 120.78 3.91 121.40 7.00 C 120.76 8.44 120.52 10.14 119.18 11.13 C 103.24 27.21 87.35 43.34 71.37 59.37 C 69.87 60.00 69.88 62.00 71.38 62.63 C 86.04 77.31 100.56 92.12 115.20 106.83 C 117.45 109.42 120.71 111.38 121.40 115.00 C 120.74 118.05 118.30 120.89 115.02 121.02 C 113.36 120.58 111.80 119.71 110.65 118.42 C 94.93 102.78 79.18 87.17 63.48 71.50 C 62.73 70.75 61.46 69.18 60.39 70.42 C 43.76 86.81 27.26 103.33 10.58 119.65 C 6.77 123.24 0.62 118.47 1.52 113.87 C 2.61 111.06 5.10 109.27 7.08 107.13 C 22.34 91.74 37.68 76.43 52.89 61.00 C 36.22 44.01 19.22 27.33 2.65 10.25 Z" /> </g> </svg> `,
  close: () => Go.icon("times"),
  plus: `<div plus><div></div><div></div></div>`,
  gspinner: `<svg class="gspinner" aria-hidden="true" focusable="false" preserveAspectRatio="xMidYMid meet" viewBox="0 0 18.6 18.6"><!----><circle stroke="currentColor" cx="50%" cy="50%" r="8" class="ng-star-inserted" style="animation-name: mat-progress-spinner-stroke-rotate-26; stroke-dasharray: 50.2655px; stroke-width: 10%;"></circle><!----></svg>`,
  bars: `<div class="icon-bars go-icon-bars"><div class="line line1"></div> <div class="line line2"></div><div class="line line3"></div></div>`,
  clouding: `<go-cloud-loader></go-cloud-loader>`,
});

Object.assign(GO, MOD_LUIGIOS_GOICONSJS);

const GO_IMAGES = function (data = {}, parent) {
  this.data = data;
  this.parentElm = parent || Go.getProp(data, "parent");
  this.morePictures = [];
  this.initialPicture = Go.isElement(data) ? data : Go.getProp(data, "initial");
  this.itemsPerSlide = Go.getProp(data, "itemsPerSlide") || 1;
  this.show();
};

const MOD_LUIGIOS_GOIMAGESJS = {
  images: function () {
    return new GO_IMAGES(...arguments);
  },
};

GO_IMAGES.prototype.uniques = function (arr) {
  return Array.from(new Set(arr));
};

GO_IMAGES.prototype.show = function () {
  if (!Go.isElement(this.parentElm) && Go.is(this.parentElm, "string")) {
    this.parentElm = document.querySelector(this.parentElm) || document.body;
    this.morePictures = this.parentElm.querySelectorAll("img");
  }

  this.pictures = this.uniques([this.initialPicture, ...this.morePictures]);

  this.view = Go.view({
    title: Go.capital(Go.lang("images")),
    class: "float-center center images noshadow",
    icon: Go.config("appIcon"),
    closeOutside: true,
    header: false,
    animation: "midBottomIn",
    content: {
      style: {
        backgroundColor: "var(--content-background,rgba(0, 0, 0, 0))",
        color: "var(--content-color, #ffffff)",
      },
    },
    html: Go.create({
      tag: "swiper-container",
      class: "itemImagesSlider",
      attrs: {
        pagination: "true",
        "pagination-color": "var(--primary-color, red)",
        "pagination-bullet-inactive-color": "var(--primary-color, red)",
        "slides-per-view": this.itemsPerSlide,
        "space-between": this.itemsPerSlide > 1 ? "16" : "0",
      },
      onrender: function () {
        this.style.setProperty("--swiper-height", `${this.offsetHeight}px`);
      },
      childrens: this.pictures.map((item, index) => ({
        tag: "swiper-slide",
        class: "swiper-slide single",
        html: Go.create({
          tag: "swiper-slide-container",
          class: "slideContainer",
          style: {
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100%",
          },
          html: Go.create({
            tag: "div",
            class: "swiper-item",
            childrens: [
              {
                tag: "img",
                src: Go.one(item, "src", "url"),
                class: "image",
                style: {
                  maxWidth: "100%",
                },
              },
            ],
          }),
        }),
      })),
    }),
    swipe: (evt) => {
      if (Go.is(this.view.find(".ViewContent"), "scrollTop")) {
        Go.gestures(evt).isDir("down", () => Go.closeParent(evt));
      }
    },
    footer: Go.create({
      tag: "a",
      class: "primary-circle top-right absolute",
      child: { tag: "go-icon", name: "times" },
      style: { margin: "var(--gap, 1rem)", zIndex: 2, fontSize: "var(--font-size, 1.2rem)" },
      onclick: () => this.view.close(),
    }),
  });
};

Object.assign(GO, MOD_LUIGIOS_GOIMAGESJS);

const GO_IMPORT_CACHE = new Map();

const Import = function (src) {
  this.src = src;
  this.module = {};
  this.data = {};
};

const Include = function (src) {
  return new Proxy(
    {},
    {
      get(_, name) {
        if (typeof name !== "string") {
          return () => {};
        }
        Go.cssVars(document.body, { "--loader": "flex", "--events": "none" });
        if (GO_IMPORT_CACHE.has(name)) {
          const cached = GO_IMPORT_CACHE.get(name);
          return (...args) => {
            Go.cssVars(document.body, { "--loader": "none", "--events": "auto" });
            return cached(...args);
          };
        }
        const _m = import(src + `/${name}.js`);
        return (...args) => {
          _m.then((m) => {
            Go.cssVars(document.body, { "--loader": "none", "--events": "auto" });
            GO_IMPORT_CACHE.set(name, m.default);
            return m.default(...args);
          });
          _m.catch((error) => {
            Go.cssVars(document.body, { "--loader": "none", "--events": "auto" });
            Go.alert(Go.getErrorMessage(error));
          });
        };
      },
    }
  );
};

const MOD_LUIGIOS_GOIMPORTJS = {
  src: Include,
  import: (src, cb) => new Import(src).load(cb),
};

Import.prototype.load = function (cb) {
  return new Promise((resolve, reject) => {
    if (Go.is(this.src, "function")) {
      this.module = this.src();
    } else if (typeof this.src === "string") {
      this.module = import(this.src);
    } else {
      return resolve(this.src);
    }

    this.module.then((module) => {
      if (module.default) {
        module = module.default;
      }

      resolve(module);

      if (Go.is(cb, "function")) {
        cb(module);
      }
    });

    this.module.catch((error) => {
      reject(error);
    });
  });
};

Object.assign(GO, MOD_LUIGIOS_GOIMPORTJS);

const Instances = function () {
  this.data = {};
  this.delimiters = ["/", "\\", ".", ":", "::", "@", "#", "|"];
};

const [GO_INSTANCE, GO_INSTANCES, GO_INSTANCE_STORE] = [new Instances(), {}, {}];

const MOD_LUIGIOS_GOINSTANCEJS = {
  set: (id, cb) => GO_INSTANCE.new(id, cb),
  def: (id, cb) => GO_INSTANCE.def(id, cb),
  obj: (id, cb) => GO_INSTANCE.new(id, cb),
  instance: (id, cb) => GO_INSTANCE.new(id, cb),
  namespace: (id, cb) => GO_INSTANCE.new(id, cb),
  dispatch: function () {
    return GO_INSTANCE.dispatch(...arguments);
  },
  do: function () {
    return GO_INSTANCE.dispatch(...arguments);
  },
  context: function () {
    return GO_INSTANCE.context(...arguments);
  },
  debounce: function (func, wait) {
    if (typeof func === "number") {
      [wait, func] = [func, wait];
    }

    clearTimeout(GO_INSTANCES[func]);

    GO_INSTANCES[func] = setTimeout(() => {
      delete GO_INSTANCES[func];
      func();
    }, wait);
  },
};

Instances.prototype.getOriginalSource = function () {
  try {
    const stack = new Error().stack || "";
    const re = /[A-Za-z][A-Za-z0-9+.-]*:\/\/[^:\s]+\/(?:.*\/)?([^\/]+\.js):\d+:\d+/g;
    let match,
      lastFile = null;
    while ((match = re.exec(stack)) !== null) {
      lastFile = match[1];
    }
    return lastFile ? lastFile.replace(/\.js$/, "") : null;
  } catch {
    return null;
  }
};

Instances.prototype.def = function (nm, cb) {
  let [stack, namespace, src] = [null, nm, ""];

  for (let delimiter of this.delimiters) {
    if (Go.has(nm, "included", delimiter)) {
      namespace = nm.split(delimiter)[0];
      break;
    }
  }

  try {
    stack = new Error().stack.split("\n");
    stack = Go.arrayLastElement(stack);
    src = Go.basename(stack).split(".")[0];
  } catch (error) {
    // ...
  }

  if (src === namespace) {
    return this.new(nm, cb);
  }

  try {
    src = getOriginalSource();
  } catch (error) {
    // ...
  }

  if (src !== namespace) {
    console.warn(`Go.Error: Invalid namespace origin (${src}) (${nm})`);
  }

  return this.new(nm, cb);
};

Instances.prototype.new = function (nm, cb) {
  let [id, fn] = [nm, null];

  for (let delimiter of this.delimiters) {
    if (Go.has(nm, "included", delimiter)) {
      id = nm.split(delimiter)[0];
      fn = nm.split(delimiter)[1];
      break;
    }
  }

  if (!GO_INSTANCES[id]) {
    GO_INSTANCES[id] = {};
    GO_INSTANCE_STORE[id] = {};
  }

  if (fn) {
    GO_INSTANCES[id][fn] = cb;
    return GO_INSTANCES[id][fn];
  }

  return GO_INSTANCES[id];
};

Instances.prototype.dispatch = function () {
  let [id, fn, args, nm] = [arguments[0], null, [...arguments], arguments[0]];

  if (!nm) return;

  for (let delimiter of this.delimiters) {
    if (Go.has(nm, "included", delimiter)) {
      id = nm.split(delimiter)[0];
      fn = nm.split(delimiter)[1];
      break;
    }
  }

  let method = GO_INSTANCES[id] && GO_INSTANCES[id][fn];

  const [store, methods] = [GO_INSTANCE_STORE[id], GO_INSTANCES[id] || {}];

  const root = Object.freeze({ store, ...methods });

  if (["function"].includes(typeof method)) {
    try {
      args.shift();
      return method.apply({ root }, args);
    } catch (error) {
      console.error(`Go.instance Error: ${error.message}`, error);
      return false;
    }
  } else if (GO_INSTANCES[id] && !fn) {
    method = { ...root, root };
  }

  return method;
};

Instances.prototype.context = function () {
  let [id, fn, nm] = [arguments[0], null, arguments[0]];

  if (!nm) return;

  if (["function"].includes(typeof nm)) {
    return new nm.prototype.constructor();
  }

  for (let delimiter of this.delimiters) {
    if (Go.has(nm, "included", delimiter)) {
      id = nm.split(delimiter)[0];
      fn = nm.split(delimiter)[1];
      break;
    }
  }

  const method = GO_INSTANCES[id] && GO_INSTANCES[id][fn];

  if (!method) return;

  const context = new method.prototype.constructor();

  return context;
};

Object.assign(GO, MOD_LUIGIOS_GOINSTANCEJS);

const [GO_IS, GO_IS_PLUS] = [{}, {}];

const MOD_LUIGIOS_GOISJS = GO_IS;

GO_IS.is = function (element, type, value) {
  if (!element && !type && !value) {
    return false;
  }

  if (!type && !value && GO_IS_PLUS[element]) {
    return GO_IS_PLUS[element]();
  }

  if (type && Go.lower(type) === "object") {
    return GO_IS_PLUS[Go.lower(type)](element);
  }

  if (element === type && !value) {
    return true;
  }

  if (typeof element === "string" && !element) {
    return false;
  }

  if (typeof element === "string" && !value && type) {
    try {
      return GO_IS_PLUS[element]() === type;
    } catch (error) {
      // continue
    }
  }

  if (typeof element === "string" && typeof type === "string") {
    try {
      return GO_IS_PLUS[type](element, value);
    } catch (error) {
      // continue
    }
  }

  if (typeof element === "string" && value) {
    try {
      return GO_IS_PLUS[element](type, value);
    } catch (error) {
      // continue
    }
  }

  try {
    return GO_IS_PLUS[type](element, value);
  } catch (error) {
    // continue
  }

  if (String(type) === "true" || String(type) === "false") {
    return String(element) === String(type);
  }

  if (typeof element === type || typeof element === Go.lower(type)) {
    return true;
  }

  if (typeof type === "string") {
    try {
      type = eval(Go.capitalize(type));
    } catch (error) {
      // continue
    }
  }

  try {
    return element instanceof type;
  } catch (error) {
    // continue
  }

  return false;
};

GO_IS.isFalsy = function (val) {
  if (!val) return true;
  if (val === "false") return true;
  if (val === "null") return true;
  if (val === "undefined") return true;
  if (val === "NaN") return true;
  if (val === "0") return true;
  if (val === 0) return true;
  if (val === false) return true;
  if (val === null) return true;
  if (val === undefined) return true;
  if (val === NaN) return true;
  return false;
};

GO_IS.isTruthy = function (val) {
  return !Go.isFalsy(val);
};

GO_IS.isFalse = function (val) {
  if (val === "false") return true;
  if (val === false) return true;
  return false;
};

GO_IS.has = function () {
  return GO_IS.is(...arguments);
};

GO_IS.isDiff = function (value1, value2) {
  return value1 !== value2;
};

GO_IS.isRegExp = function (value) {
  if (typeof value === "string") {
    const specialRegexChars = /[.*+?^${}()|\[\]\\]/;
    // Verificar si usa caracteres propios de regex
    return specialRegexChars.test(value) || /[+?|{}()[\]\\]/.test(value);
  }
  return value instanceof RegExp;
};

Object.assign(GO_IS_PLUS, {
  object: function (object) {
    if (typeof object === "object") {
      for (let property in object) {
        if (object.hasOwnProperty(property)) {
          return true;
        }
      }
    }
  },
  path: function (string) {
    // Check if string looks like a path
    // 1. If ends with any extension
    if (string.match(/\.[a-z0-9]+$/i)) {
      return true;
    }

    const path = string.trim();
    const pathRegex = /^\/[a-zA-Z0-9_\-\/]+$/;
    if (pathRegex.test(path)) {
      return true;
    }

    // 2. If starts with any protocol
    if (
      string.match(
        /^(http|https|ftp|blob|mailto|tel|geo|sms|smsto|market|intent|itms|itms-apps|comgooglemaps|fb|twitter|instagram|linkedin|youtube|vimeo|skype|whatsapp|tg|t.me|mailto|tel|geo|sms|smsto|market|intent|itms|itms-apps|comgooglemaps|fb|twitter|instagram|linkedin|youtube|vimeo|skype|whatsapp|tg|t.me):/i
      )
    ) {
      return true;
    }

    // 3. If starts with any slash
    if (string.match(/^\/\//)) {
      return true;
    }
  },
  objectHasSomeProperty: function (object) {
    // Check if object has at least one property
    if (typeof object === "object") {
      for (let property in object) {
        if (object.hasOwnProperty(property)) {
          return true;
        }
      }
    }

    return false;
  },
  someProperty: function (object) {
    // Check if object has at least one property
    if (typeof object === "object") {
      for (let property in object) {
        if (object.hasOwnProperty(property)) {
          return true;
        }
      }
    }

    return false;
  },
  property: function (object, property) {
    if (typeof object === "object") {
      if (object.hasOwnProperty(property)) {
        return true;
      }
    }
  },
  json: function (string) {
    if (!string) return false;

    if (Go.is(string, "object") && GO_IS_PLUS.objectHasSomeProperty(string)) {
      return string;
    }

    try {
      string = string.replace(/\s/g, "");
      const jsson = JSON.parse(string);
      return jsson;
    } catch (e) {
      return false;
    }
  },
  longString: function (string, lenght = 50) {
    if (string && string.length > lenght) {
      return true;
    }

    return false;
  },

  emailString: function (string) {
    const expresionRegular = /\S+@\S+\.\S+/;
    return expresionRegular.test(string);
  },

  email: function (string) {
    const expresionRegular = /\S+@\S+\.\S+/;
    return expresionRegular.test(string);
  },

  urlString: function (string) {
    const expresionRegular = /^(http|https):\/\/[a-zA-Z0-9-\.]+\.[a-z]{2,4}/;
    return expresionRegular.test(string);
  },

  stringFunction: function (string) {
    if (!string) return false;

    if (string.endsWith(")") || string.endsWith(");")) {
      return true;
    }

    if (string.endsWith("()") || string.endsWith("();")) {
      return true;
    }

    return false;
  },

  stringfunction: function () {
    return GO_IS_PLUS.stringFunction(...arguments);
  },

  textFunction: function () {
    return GO_IS_PLUS.stringFunction(...arguments);
  },

  AsyncFunction: function (functionToCheck) {
    return functionToCheck && {}.toString.call(functionToCheck) === "[object AsyncFunction]";
  },

  asyncFunction: function () {
    return GO_IS_PLUS.AsyncFunction(...arguments);
  },

  classSelector: function (string) {
    const expresionRegular = /^\.[a-zA-Z0-9-_]+$/;
    return expresionRegular.test(string);
  },

  idSelector: function (string) {
    const expresionRegular = /^#[a-zA-Z0-9-_]+$/;
    return expresionRegular.test(string);
  },

  startSelector: function (string) {
    const expresionRegular = /^(\.|#)/;
    return expresionRegular.test(string);
  },

  selector: function (string) {
    if (!string) return false;

    if (GO_IS_PLUS.startSelector(string)) {
      return true;
    }

    if (GO_IS_PLUS.idSelector(string) || GO_IS_PLUS.classSelector(string)) {
      return true;
    }

    const regExp = /^([a-z]+\d*|\*)(#[a-z][\w-]*)?(\.[a-z][\w-]*)*(\[[a-z]+(="[a-z0-9-_\s]+")?\])*$/i;
    return regExp.test(string);
  },

  someStartsWith: function (string = "", array = []) {
    for (let i = 0; i < array.length; i++) {
      if (string.startsWith(array[i])) {
        return true;
      }
    }
  },

  onePoint: function (string = "") {
    if (typeof string !== "string") return false;
  },

  DomElement: function (el) {
    if (!el) return false;

    if (Go.is(el, "string")) {
      el = document.querySelector(el);
    }

    if (Go.is(el, "HTMLElement")) {
      return true;
    }

    return false;
  },

  HTMLElementRendered: function (el) {
    if (Go.is(el, "string")) {
      el = document.querySelector(el);
    }

    if (document.body.contains(el)) {
      return true;
    }

    return false;
  },

  onDOM: function () {
    return GO_IS_PLUS.HTMLElementRendered(...arguments);
  },

  tagName: function (el, tag) {
    if (Go.is(el, "string")) {
      el = document.querySelector(el);
    }

    const tagName = el.tagName;
    if (Go.lower(tagName) === Go.lower(tag)) {
      return true;
    }

    return false;
  },

  HTMLRenderedElement: function () {
    return GO_IS_PLUS.HTMLElementRendered(...arguments);
  },

  some: function (arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
      return false;
    }

    return arr1.some((item) => arr2.includes(item));
  },

  defined: function (value) {
    return typeof value !== undefined && value !== null;
  },

  included: function (data, value) {
    if (Go.is(data, "array")) {
      return data.includes(value);
    }

    if (Go.is(data, "object")) {
      return Object.keys(data).includes(value);
    }

    if (Go.is(data, "string")) {
      return data.includes(value);
    }

    return false;
  },

  objectKeys: function (object, objKeys) {
    let result = true;
    // Check id all keys and values on objKeys are on object
    if (typeof objKeys === "object" && typeof object === "object") {
      Go.for(objKeys, (key, value) => {
        if (!object[key] || object[key] !== value) {
          result = false;
        }
      });
    } else {
      result = false;
    }
    return result;
  },

  false: function (val) {
    if (val === "false") return true;
    if (val === false) return true;
    return false;
  },

  falsy: function (val) {
    if (!val) return true;
    if (val === "false") return true;
    if (val === "null") return true;
    if (val === "undefined") return true;
    if (val === "NaN") return true;
    if (val === "0") return true;
    if (val === 0) return true;
    if (val === false) return true;
    if (val === null) return true;
    if (val === undefined) return true;
    if (val === NaN) return true;
    return false;
  },

  truthy: function (val) {
    return !Go.isFalsy(val);
  },

  true: function (val) {
    if (val === "true") return true;
    if (val === true) return true;
    return false;
  },

  undefined: function (val) {
    if (val === "undefined") return true;
    if (val === undefined) return true;
    return false;
  },

  null: function (val) {
    if (val === "null") return true;
    if (val === null) return true;
    return false;
  },

  nan: function (val) {
    if (val === "NaN") return true;
    if (val === NaN) return true;
    return false;
  },

  empty: function (val) {
    if (val === "") return true;
    return false;
  },

  set: function (data) {
    return data !== undefined && data !== "undefined" && data !== null && data !== "" && data !== "false" && data !== false && data !== "NaN" && data !== "nan";
  },

  speechSynthesis: function () {
    if ("speechSynthesis" in window) {
      return true;
    } else {
      return false;
    }
  },

  multipleOf: function (number, multiple) {
    return Number(number) % Number(multiple) === 0;
  },

  notMultipleOf: function (number, multiple) {
    return Number(number) % Number(multiple) !== 0;
  },

  prime: function (number) {
    if (number <= 1) {
      return false;
    }

    for (let i = 2; i < number; i++) {
      if (number % i === 0) {
        return false;
      }

      return number > 1;
    }
  },

  desktopScreen: function () {
    const width = window.innerWidth;

    if (width >= 1024) {
      return true;
    }

    return false;
  },

  notebookScreen: function () {
    const width = window.innerWidth;

    if (width >= 1024 && width < 1444) {
      return true;
    }

    return false;
  },

  mobileScreen: function () {
    return window.innerWidth <= 590;
  },

  mobile: function () {
    // Check if the device is a mobile device
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  tabletScreen: function () {
    const width = window.innerWidth;

    if (width > 590 && width < 1024) {
      return true;
    }

    return false;
  },

  tvScreen: function () {
    const width = window.innerWidth;

    if (width >= 1444) {
      return true;
    }

    return false;
  },

  ios: function () {
    return navigator.userAgent.match(/iPhone|iPad|iPod/i);
  },

  async: function () {
    return GO_IS_PLUS.AsyncFunction(...arguments);
  },

  phone: function (string) {
    const regex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im;
    return regex.test(string);
  },

  items: function (value) {
    return value && value.length;
  },

  length: function (value) {
    return value && value.length;
  },

  jwt: function (value) {
    return value && value.split(".").length === 3;
  },

  image: function (value) {
    if (value && value.type) {
      return value.type.startsWith("image/");
    }

    if (Go.is(value, "string")) {
      return value.match(/image\/(png|jpg|jpeg|gif|webp)/i);
    }

    return false;
  },

  ObjectId: function (value) {
    const isValidObjectId = (id) => /^[a-f\d]{24}$/i.test(id);
    return isValidObjectId(value);
  },

  regexp: function (value) {
    return GO_IS.isRegExp(value);
  },

  regex: function (value) {
    return GO_IS.isRegExp(value);
  },

  scrollTop: function (el, num = 0) {
    if (typeof el === "string") {
      el = document.querySelector(el);
    }
    return el.scrollTop <= num;
  },

  scrollBottom: function (el, num = 0) {
    if (typeof el === "string") {
      el = document.querySelector(el);
    }
    const { scrollTop, offsetHeight, scrollHeight, offsetGap = num } = el;
    const scrolledToBottom = scrollTop + offsetHeight + offsetGap >= scrollHeight;
    return scrolledToBottom;
  },

  number: function (value) {
    if (typeof value === "number") return true;
    if (typeof value === "string") return !isNaN(Number(value));
    return false;
  },

  date: function (value) {
    if (typeof value === "string") return !isNaN(Date.parse(value));
    return value instanceof Date;
  },

  iterable: function (value) {
    return value != null && typeof value[Symbol.iterator] === "function";
  },

  uuid: function (uuid) {
    return (
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uuid) ||
      /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-4[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i.test(uuid)
    );
  },
});

Object.assign(GO, MOD_LUIGIOS_GOISJS);

const GO_JWT = function () {
  this.data = {};
};

const MOD_LUIGIOS_GOJWTJS = { jwt: new GO_JWT() };

GO_JWT.prototype.decode = function (token) {
  if (!token) return null;

  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );
  return JSON.parse(jsonPayload);
};

Object.assign(GO, MOD_LUIGIOS_GOJWTJS);

const GO_KEYS = {};

const MOD_LUIGIOS_GOKEYSJS = GO_KEYS;

GO_KEYS.enter = function (e = {}, cb) {
  if (e.code === "Enter") {
    if (Go.is(cb, "function")) cb(e);
  }
};

Object.assign(GO, MOD_LUIGIOS_GOKEYSJS);

const Language = function () {
  this.data = {};
};

const language = new Language();

const MOD_LUIGIOS_GOLANGJS = {
  lang: (str) => (!str ? language : language.get(str)),
  label: (str) => (!str ? language : language.get(str)),
  locale: (str) => (!str ? language : language.get(str)),
  currentLang: () => localStorage.getItem("lang") || Go.config("lang") || "en",
};

Language.prototype.load = function (id, src) {
  if (Go.is(id, "array")) {
    return id.forEach((item) => this.load(item));
  }

  if (Go.is(id, "object") && Go.has(id, "someProperty")) {
    return Object.assign(this.data, id);
  }

  src = `${src}/${id}.js`;

  src = Go.route.fixPath(src);

  const module = Go.import(src);

  module.then(({ default: language }) => {
    Go.extends(this.data, language);
  });

  module.catch((error) => {
    console.error(error);
  });
};

Language.prototype.get = function (str) {
  if (Go.is(str, "object")) {
    Object.assign(this.data, str);
    return this;
  }

  this.result = Go.getProp(this.data, str, str);

  if (["function"].includes(typeof this.result)) {
    this.result = this.result();
  }

  return this.result;
};

Language.prototype.set = function (key, cb) {
  Go.storage("lang").set(key);
  Go.storage("headers").set({ lang: key });
  Go.setCookie("lang", key);
  if (["function"].includes(typeof cb)) {
    cb();
  }
};

Language.prototype.current = function () {
  return localStorage.getItem("lang") || Go.config("lang") || "en";
};

Language.prototype.toString = function () {
  return this.current();
};

Object.assign(GO, MOD_LUIGIOS_GOLANGJS);

class List {
  constructor(args) {
    this.list = null;
    this.config = {};
    this.data = [];
    this.target = typeof args.target === "string" ? document.querySelector(args.target) : args.target;
    this.reverse = args.reverse || false;
    this.itemHeight = args.itemHeight || 50;
    this.horizontal = args.horizontal || false;
    this.height = args.height || window.innerHeight;
    this.onBottom = args.onBottom;
    this.padding = args.padding;
    this.itemHeightGetter = args.itemHeightGetter;
  }

  refresh() {
    this.list.refresh(this.target, this.config);
  }

  removeIndex(index) {
    this.data.splice(index, 1);
    this.list.refresh(this.target, this.config);
  }

  emptyItem({ index }) {
    var el = document.createElement("div");
    el.innerHTML = `<p>ITEM ${index}</p>`;
    return el;
  }

  append(data) {
    this.data.push.apply(this.data, data);
    this.list.refresh(this.target, this.config);
  }

  render(data) {
    var [self, container, list, config] = [this, this.target, null, {}];
    this.data = data;

    if (typeof container === "string") {
      container = document.querySelector(container);
    }

    container.style.setProperty("--item-height", `${this.itemHeight}px`);

    config = {
      width: self.width || "100%",
      height: self.height,
      itemHeight: self.itemHeight,
      horizontal: self.horizontal,
      padding: self.padding,
      itemHeightGetter: self.itemHeightGetter,
      afterRender: self.afterRender,
      overrideScrollPosition: self.overrideScrollPosition,
      scrollerTagName: self.scrollerTagName || "div",
      reverse: self.reverse, // Set to true to put into 'chat mode'.
      rowClassName: self.rowClassName || "vrow",

      onBottom: () => {
        if (typeof self.onBottom === "function") {
          return self.onBottom();
        }
      },

      get total() {
        const total = self.getTotalItems();
        return total;
      },

      generate: async (index) => {
        let item = null;

        if (typeof self.item === "function") {
          item = await self.item(data[index], index);
          if (typeof item === "string") {
            item = document.createElement("div");
            item.innerHTML = item;
          }
        } else if (typeof self.item === "string") {
          item = document.createElement("div");
          item.innerHTML = self.item;
        } else {
          item = self.emptyItem({ index });
        }

        return item;
      },
    };

    list = HyperList.create(container, config);

    this.list = list;
    this.config = config;

    container.onresize = (e) => {
      config.height = window.innerHeight;
      list.refresh(container, config);
    };
  }

  getTotalItems() {
    return (this.data || []).length;
  }
}

const MOD_LUIGIOS_GOLISTJS = { list: (data) => new List(data) };

Object.assign(GO, MOD_LUIGIOS_GOLISTJS);

const Loader = function (options = {}) {
  this.options = options || {};
  this.id = Go.uuid();
  this.show();
};

const MOD_LUIGIOS_GOLOADERJS = { loader: (data) => new Loader(data) };

Loader.prototype.show = function () {
  if (typeof this.options === "string" && Go.is(this.options, "selector")) {
    this.loadElement = document.querySelector(this.options);
    Go.addClass(this.loadElement, "loading");
    return this;
  }

  if (Go.is(this.options, "HTMLElement")) {
    this.loadElement = this.options;
    Go.addClass(this.loadElement, "loading");
    return this;
  }

  this.view = Go.view({
    id: "loader",
    header: false,
    html: Go.config("routerLoaderBody") || `<go-icon name="clouding"></go-icon>`,
    ...this.options,
    class: `GoLoader loader router loader-${this.id} noshadow ${this.options.class || ""}`,
  });

  return this;
};

Loader.prototype.message = function () {
  if (this.view) {
    return this.view.message(...arguments);
  }
};

Loader.prototype.close = async function (cb) {
  if (this.loadElement) {
    Go.removeClass(this.loadElement, "loading");
  }

  if (this.view && Go.is(this.view.close, "function")) {
    this.view.close();
  }

  try {
    const view = await Go.awaitElement(`.loader-${this.id}`, { retry: 10 });
    if (view && Go.is(view.close, "function")) {
      view.close();
    }
  } catch (error) {
    // ...
  }

  if (Go.is(cb, "function")) {
    cb();
  }
};

Loader.prototype.hide = Loader.prototype.close;
Loader.prototype.remove = Loader.prototype.close;
Loader.prototype.destroy = Loader.prototype.close;
Loader.prototype.unload = Loader.prototype.close;

Object.assign(GO, MOD_LUIGIOS_GOLOADERJS);

const GO_LOREM = {};

const MOD_LUIGIOS_GOLOREMJS = { lorem: (num) => GO_LOREM.generate(num) };

GO_LOREM.generate = function (num) {
  // prettier-ignore
  const words = [ "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "curabitur", "vel", "hendrerit", "libero", "eleifend", "blandit", "nunc", "ornare", "odio", "ut", "orci", "gravida", "imperdiet", "nullam", "purus", "lacinia", "a", "pretium", "quis", "congue", "praesent", "sagittis", "laoreet", "auctor", "mauris", "non", "velit", "eros", "dictum", "proin", "accumsan", "sapien", "nec", "massa", "volutpat", "venenatis", "sed", "eu", "molestie", "lacus", "quisque", "porttitor", "ligula", "dui", "mollis", "tempus", "at", "magna", "vestibulum", "turpis", "ac", "diam", "tincidunt", "id", "condimentum", "enim", "sodales", "in", "hac", "habitasse", "platea", "dictumst", "aenean", "neque", "fusce", "augue", "leo", "eget", "semper", "mattis", "tortor", "scelerisque", "nulla", "interdum", "tellus", "malesuada", "rhoncus", "porta", "sem", "aliquet", "et", "nam", "suspendisse", "potenti", "vivamus", "luctus", "fringilla", "erat", "donec", "justo", "vehicula", "ultricies", "varius", "ante", "primis", "faucibus", "ultrices", "posuere", "cubilia", "curae", "etiam", "cursus", "aliquam", "quam", "dapibus", "nisl", "feugiat", "egestas", "class", "aptent", "taciti", "sociosqu", "ad", "litora", "torquent", "per", "conubia", "nostra", "inceptos", "himenaeos", "phasellus", "nibh", "pulvinar", "vitae", "urna", "iaculis", "lobortis", "nisi", "viverra", "arcu", "morbi", "pellentesque", "metus", "commodo", "ut", "facilisis", "felis", "tristique", "ullamcorper", "placerat", "aenean", "convallis", "sollicitudin", "integer", "rutrum", "duis", "est", "etiam", "bibendum", "donec", "pharetra", "vulputate", "maecenas", "mi", "fermentum", "consequat", "suscipit", "aliquam", "habitant", "senectus", "netus", "fames", "quisque", "euismod", "curabitur", "lectus", "elementum", "tempor", "risus", "cras", ];

  let lorem = "";
  for (let i = 0; i < num; i++) {
    lorem += words[Math.floor(Math.random() * words.length)] + " ";
  }
  return lorem;
};

Object.assign(GO, MOD_LUIGIOS_GOLOREMJS);

const GO_MATH_CLIENT = {};

const MOD_LUIGIOS_GOMATHCLIENTJS = GO_MATH_CLIENT;

GO_MATH_CLIENT.onlyNumbers = function (str) {
  if (str) {
    str = str.toString();
    str = str.replace(/[^0-9.]/g, "");
    return str ? Number(str) : undefined;
  }

  return str;
};

GO_MATH_CLIENT.onlyNum = function () {
  return GO_MATH_CLIENT.onlyNumbers(...arguments);
};

GO_MATH_CLIENT.onlyLetters = function (str) {
  if (str) {
    str = str.toString();
    return str.replace(/[^a-zA-Z]/g, "");
  }

  return str;
};

GO_MATH_CLIENT.number_format = function (number, decimals, dec_point, thousands_sep) {
  number = (number + "").replace(/[^0-9+\-Ee.]/g, "");
  var n = !isFinite(+number) ? 0 : +number,
    prec = !isFinite(+decimals) ? 0 : Math.abs(decimals),
    sep = typeof thousands_sep === "undefined" ? "," : thousands_sep,
    dec = typeof dec_point === "undefined" ? "." : dec_point,
    s = "",
    toFixedFix = function (n, prec) {
      var k = Math.pow(10, prec);
      return "" + Math.round(n * k) / k;
    };
  s = (prec ? toFixedFix(n, prec) : "" + Math.round(n)).split(".");
  if (s[0].length > 3) {
    s[0] = s[0].replace(/\B(?=(?:\d{3})+(?!\d))/g, sep);
  }
  if ((s[1] || "").length < prec) {
    s[1] = s[1] || "";
    s[1] += new Array(prec - s[1].length + 1).join("0");
  }
  return s.join(dec);
};

GO_MATH_CLIENT.toPositive = function (number) {
  if (number < 0) {
    return number * -1;
  }

  return number;
};

GO_MATH_CLIENT.toNegative = function (number) {
  if (number > 0) {
    return number * -1;
  }

  return number;
};

GO_MATH_CLIENT.toMoney = function (number) {
  return GO_MATH_CLIENT.number_format(number, 2, ",", ".");
};

GO_MATH_CLIENT._math = function (number, operation, value) {
  if (operation === "+") {
    return number + value;
  } else if (operation === "-") {
    return number - value;
  } else if (operation === "*") {
    return number * value;
  } else if (operation === "/") {
    return number / value;
  } else if (operation === "%") {
    return number % value;
  } else {
    return number;
  }
};

GO_MATH_CLIENT.mathematic = function (number, operation, value) {
  let [strNum, strVal, result] = [GO_MATH_CLIENT.onlyLetters(number), GO_MATH_CLIENT.onlyLetters(value), 0];

  number = GO_MATH_CLIENT.onlyNumbers(number);
  value = GO_MATH_CLIENT.onlyNumbers(value);
  result = GO_MATH_CLIENT._math(Number(number), operation, Number(value));

  if (!strNum && !strVal) {
    return Number(result);
  }

  if (Go.lower(strNum) === Go.lower(strVal)) {
    return result + strNum;
  }

  result = result + strNum + strVal;

  if (result) {
    return result.trim();
  }
};

GO_MATH_CLIENT.getPercent = function (value, total) {
  return (value * 100) / total;
};

GO_MATH_CLIENT.getPercentValue = function (percent, total) {
  return (percent * total) / 100;
};

GO_MATH_CLIENT.unitConvert = function (v1 = 10, v2 = 0.13) {
  var x = v1; // Price usd
  var y = v2; // Price xxx
  var z = x / y; // Price xxx/usd
  return z;
};

GO_MATH_CLIENT.convertSize = (bytes, unit = "auto", decimals = 2) => {
  const units = ["B", "KB", "MB", "GB", "TB", "PB"];
  const factor = 1024;

  if (unit === "auto") {
    let index = 0;
    while (bytes >= factor && index < units.length - 1) {
      bytes /= factor;
      index++;
    }
    return `${bytes.toFixed(decimals)} ${units[index]}`;
  } else {
    const index = units.indexOf(unit.toUpperCase());
    if (index === -1) throw new Error("Unidad no válida: " + unit);
    const value = bytes / Math.pow(factor, index);
    return `${value.toFixed(decimals)} ${units[index]}`;
  }
};

Object.assign(GO, MOD_LUIGIOS_GOMATHCLIENTJS);

const GO_MEDIA = {};

const MOD_LUIGIOS_GOMEDIAJS = GO_MEDIA;

GO_MEDIA.preloadImages = function (images = []) {
  for (let i = 0, len = images.length; i < len; i++) {
    images[i] = new Image();
    images[i].src = images[i];
  }
  return images;
};

GO_MEDIA.getImagePredominantColor = function (image) {
  const id = Go.uuid();

  var defaults = {
    selector: `.adbg-${id}`,
    parent: null,
    exclude: ["rgb(0,0,0)", "rgba(255,255,255)"],
    normalizeTextColor: false,
    normalizedTextColors: {
      light: "#fff",
      dark: "#000",
    },
    lumaClasses: {
      light: "ab-light",
      dark: "ab-dark",
    },
  };

  if (Go.isElement(image)) {
    image.classList.add(`adbg-${id}`);
  }

  $.adaptiveBackground.run(defaults);

  return new Promise((resolve, reject) => {
    $(image).on("ab-color-found", function (ev, payload) {
      resolve(payload);
    });
  });
};

GO_MEDIA.MEDIA_METHODS = {};

GO_MEDIA.media = function (media) {
  const Media = function (media) {
    this.media = media;
    Object.assign(this, GO_MEDIA.MEDIA_METHODS);
  };

  return new Media(media);
};

GO_MEDIA.MEDIA_METHODS.play = function () {
  this.media.play();
};

GO_MEDIA.MEDIA_METHODS.pause = function () {
  this.media.pause();
};

GO_MEDIA.MEDIA_METHODS.stop = function () {
  this.media.stop();
};

GO_MEDIA.MEDIA_METHODS.divToImage = async function () {
  if (!GO_MEDIA.MEDIA_METHODS.html2canvas) {
    await Go.load("https://html2canvas.hertzen.com/dist/html2canvas.min.js");
    await Go.sleep(1000);
  }

  GO_MEDIA.MEDIA_METHODS.html2canvas = true;

  if (Go.is(this.media, "string")) {
    this.media = document.querySelector(this.media);
  }

  return new Promise((resolve, reject) => {
    html2canvas(this.media, { useCORS: true }).then((canvas) => {
      resolve(canvas.toDataURL("image/png"));
    });
  });
};

GO_MEDIA.MEDIA_METHODS.download = function (filename = "media") {
  const a = document.createElement("a");
  a.href = this.media;
  a.download = filename;
  a.click();
};

GO_MEDIA.MEDIA_METHODS.isImage = function () {
  // Check if this.media string is an image

  if (Go.is(this.media, "string")) {
    const exts = ["png", "jpg", "jpeg", "gif", "svg", "webp"];
    const ext = this.media.split(".").pop();
    return exts.includes(ext);
  }

  return false;
};

GO_MEDIA.MEDIA_METHODS.resize = function (width, height) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  const img = new Image();
  img.src = this.media;

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(img, 0, 0, width, height);

  const media = canvas.toDataURL("image/png");

  return media;
};

GO_MEDIA.MEDIA_METHODS.base64ToBlob = function (result = "") {
  // Convert base64 to raw binary data held in a string
  const byteString = atob(this.media.split(",")[1]);

  // separate out the mime component
  const mimeString = this.media.split(",")[0];

  // write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);

  // create a view into the buffer
  const ia = new Uint8Array(ab);

  // set the bytes of the buffer to the correct values from the string
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  // write the ArrayBuffer to a blob, and you're done
  const blob = new Blob([ab], { type: mimeString });

  if (result == "obj" || result == "object") {
    return { type: mimeString, blob: blob };
  }

  return blob;
};

GO_MEDIA.MEDIA_METHODS.imageExists = function () {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = this.media;
  });
};

GO_MEDIA.MEDIA_METHODS.base64ToBlobUrl = function () {
  const base64 = this.media.split(",")[1];

  const byteCharacters = atob(base64);
  const byteNumbers = Array.from(byteCharacters).map((char) => char.charCodeAt(0));
  const byteArray = new Uint8Array(byteNumbers);

  const blob = new Blob([byteArray], { type: "image/png" });

  return URL.createObjectURL(blob);
};

GO_MEDIA.MEDIA_METHODS.imagePreview = function (data = {}) {
  return (this.preview = Go.view({
    icon: Go.config("appIcon"),
    title: Go.lang("image_preview"),
    class: "default preview menu center gap img",
    closeOutside: true,
    centerMode: true,
    animation: "midBottomIn",
    ...data,
    html: Go.create({
      tag: "div",
      class: "img",
      childrens: [{ tag: "img", src: this.media, class: "mnw100 mxw100" }],
      style: { minHeight: "30vh" },
    }),
    gestures: {
      swipe: (evt) => {
        if (Go.is(this.preview.find(".ViewContent"), "scrollTop")) {
          Go.gestures(evt).isDir("down", () => Go.closeParent(evt));
        }
      },
    },
  }));
};

GO_MEDIA.MEDIA_METHODS.getColor = function () {
  return GO_MEDIA.getImagePredominantColor(this.media, ...arguments);
};

Object.assign(GO, MOD_LUIGIOS_GOMEDIAJS);

const Menu = function (data = {}) {
  this.data = data;
  this.options = data.options || [];
  this.open();
};

const MOD_LUIGIOS_GOMENUJS = { menu: (options) => new Menu(options) };

Menu.prototype.open = async function () {
  if (typeof this.options === "function") {
    this.options = await this.options();
  }

  this.onopen = this.data.onopen || this.data.onOpen;
  this.optionsStyle = this.data.optionsStyle || {};

  this.view = Go.view({
    title: `<div bold>${this.data.title || Go.lang("menu")}</div>`,
    class: `default menu ${this.data.class || "bottom"}`,
    animation: "bottomIn",
    ...this.data,
    html: Go.create({
      tag: "div",
      class: "ViewMenuBody",
      style: { width: "100%" },
      childrens: [
        {
          tag: "div",
          class: `options ${this.data.optionsClass || "ncc"}`,
          style: this.optionsStyle,
          onrender: (target) => {
            Go.options(this.options, target, (option) => {
              if (!Go.is(this.data.keepOpen, "true")) {
                this.view.close(() => {
                  this.select(option);
                });
              } else {
                this.select(option);
              }
            });
          },
        },
      ],
    }),
    onopen: (view) => {
      if (Go.is(this.onopen, "function")) {
        this.onopen.call(this, view);
      }
    },
  });
};

Menu.prototype.select = function (option) {
  const onselect = this.data.onselect || this.data.onSelect || option.onselect || option.onSelect;
  const onchoose = this.data.onchoose || this.data.onChoose || option.onchoose || option.onChoose;
  const onoption = this.data.onoption || this.data.onOption;
  const onclick = this.data.onclick || this.data.onClick || option.onclick || option.onClick || this.data.action || option.action;
  const fn = this.data.fn || option.fn;
  let execute = onselect || onchoose || onoption || onclick || fn;

  if (Go.is(fn, "function")) execute = () => fn(option);
  if (Go.is(onclick, "function")) execute = () => onclick(option);
  if (Go.is(onselect, "function")) execute = () => onselect(option);
  if (Go.is(onchoose, "function")) execute = () => onchoose(option);
  if (Go.is(onoption, "function")) execute = () => onoption(option);

  if (Go.is(execute, "function")) {
    execute();
  } else if (execute) {
    eval(execute);
  }
};

Object.assign(GO, MOD_LUIGIOS_GOMENUJS);

const GO_MISC = {};

const MOD_LUIGIOS_GOMISCJS = GO_MISC;

GO_MISC.delay = function (ms) {
  return GO_MISC.sleep(ms);
};

GO_MISC.sleep = function (ms, cb) {
  return new Promise((resolve) => {
    setTimeout(() => GO_MISC.sleepEnd(resolve, cb), ms);
  });
};

GO_MISC.await = function () {
  return GO_MISC.sleep(...arguments);
};

GO_MISC.timeout = function (ms, cb) {
  return GO_MISC.sleep(ms, cb);
};

GO_MISC.sleepEnd = function (resolve, cb) {
  let _cb = cb;
  if (typeof cb === "function") {
    _cb = cb();
  }
  resolve(_cb);
};

GO_MISC.viewTitle = function (title, iconSize = "29", template = "", _class = "") {
  if (Go.is(title, "object")) {
    iconSize = title.iconSize || iconSize;
    title = title.title;
    _class = title.class || _class;
  }

  template += `<div dpadding flex-center flex-gap class="${_class}">`;
  template += `<app-icon size="${iconSize}" src="/img/icons/${iconSize}.png"></app-icon><div class="appTitle">${title}</div>`;
  template += `</div>`;
  return template;
};

GO_MISC.reflectValue = function (evt, target) {
  if (!Go.is(target, "HTMLElement")) {
    target = document.querySelectorAll(target);
  }

  if (Go.is(target, "NodeList") && target.length > 1) {
    target.forEach((el) => GO_MISC.reflectValue(evt, el));
    return;
  }

  if (Go.is(target, "NodeList")) {
    target = target[0];
  }

  if (!target) {
    return;
  }

  let value = evt.target.value;

  target.value = value;

  if (!Go.is(target, "tagName", "input")) {
    target.innerHTML = value;
  }
};

GO_MISC.exec = async function () {
  let functions = [...arguments];
  const len = functions.length;
  for (let i = 0; i < len; i++) {
    if (functions[i] && typeof functions[i] === "function") {
      await functions[i]();
    }
  }
};

GO_MISC.onMutation = function (context, callback) {
  if (!context) return;
  if (!callback) return;

  if (Go.is(context, "String")) {
    context = document.querySelector(context);
  }

  if (!context) return;

  const observer = new MutationObserver(callback);
  observer.observe(context, { attributes: true, childList: true, subtree: true });
};

GO_MISC.viewContext = function (e, data = {}) {
  const info = Go.info(e.target);
  const y = info.screenTop + info.height;
  const x = info.screenLeft;

  const viewData = {
    header: false,
    style: `--x: ${x}px; --y: ${y}px;--parent-width: ${info.width}px;`,
    class: "select go-select context",
    closeOutside: true,
    ...data,
    animate: {
      duration: 200,
      from: {
        opacity: 0,
        transform: "translateY(-1rem)",
      },
      to: {
        opacity: 1,
        transform: "translateY(0)",
      },
    },
  };

  if (Go.is(data, "path")) {
    viewData.template = data;
  } else {
    viewData.html = data;
  }

  Go.addClass(e.target, "open");

  viewData.onClose = function () {
    Go.removeClass(e.target, "open");
  };

  return Go.view(viewData);
};

GO_MISC.menuContext = function () {
  return GO_MISC.viewContext(...arguments);
};

Object.assign(GO, MOD_LUIGIOS_GOMISCJS);

const Module = function (src, cb) {
  this.src = src;
  this.source = src;
  this.cb = cb;
  this.props = { src, cb };
  this.loader = this.props.loader;
  this.method = "";
  return this.init();
};

const MOD_LUIGIOS_GOMODULEJS = {
  module: function () {
    return new Module(...arguments);
  },
};

Module.prototype.init = function () {
  if (typeof this.src === "object") {
    this.source = this.src.src;
    this.loading = this.src.loading;
    this.loaded = this.src.loaded || this.src.onLoad || this.src.onload;
    this.error = this.src.error;
    this.props = this.src.props;
    this.loader = this.src.loader;
    this.method = this.src.method;
  }
  return this.load();
};

Module.prototype.load = async function () {
  if (typeof this.loading === "function") {
    this.loading();
  }

  if (typeof this.loader === "function") {
    this.loader = this.loader();
  }

  if (Go.lower(this.method) === "post") {
    try {
      this.module = await Go.http.txt(this.source, this.src);
      this.module = await Go.string(this.module).parseModule();
    } catch (error) {
      this.modError = error;
    }
  } else {
    try {
      this.module = await Go.import(this.source);
    } catch (error) {
      this.modError = error;
    }
  }

  if (this.modError && Go.is(this.error, "function")) {
    this.error(this.modError);
  } else if (this.modError) {
    Go.alert(`Module Error: ${Go.getErrorMessage(this.modError)}`);
  }

  if (this.props) {
    this.context = this.props.srcElement || this.props.target || this.props.context;
  }

  if (this.context) {
    this.module = Object.assign(this.context, this.module);
  }

  if (Go.is(this.loaded, "function")) {
    this.loaded(this.module);
  }

  if (Go.is(this.cb, "function")) {
    this.cb(this.module);
  }

  if (Go.is(this.module, "function")) {
    this.module = new this.module();
  }

  if (Go.is(this.module, "object")) {
    this.module.props = this.props;
  }

  if (this.module && Go.is(this.module.init, "function")) {
    await this.module.init();
  }

  if (this.loader && Go.is(this.loader.close, "function")) {
    this.loader.close();
  }

  return this.module;
};

Module.prototype.error = function (error) {
  console.log("Go Module: ", error);
};

Object.assign(GO, MOD_LUIGIOS_GOMODULEJS);

const GO_NET = {};

const MOD_LUIGIOS_GONETJS = GO_NET;

GO_NET.host = function (url = "", ...concat) {
  if (url) {
    url = Go.url(url).getHost();
  } else {
    url = window.location.host;
  }

  concat = concat.join("/");

  if (!url && !concat) return window.location.host;

  if (!concat) return url;

  if (!concat.startsWith("/")) concat = "/" + concat;

  return Go.url(url + concat).fix();
};

Object.assign(GO, MOD_LUIGIOS_GONETJS);

const GO_NUMBER = {};

const MOD_LUIGIOS_GONUMBERJS = GO_NUMBER;

GO_NUMBER.phoneFormat = function (phone) {
  if (phone) {
    return phone.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  return "";
};

GO_NUMBER.phone_format = function (phone) {
  return GO_NUMBER.phoneFormat(phone);
};

GO_NUMBER.toPositive = function (number) {
  return Math.abs(number);
};

GO_NUMBER.positive = function (number) {
  return Math.abs(number);
};

GO_NUMBER.toNegative = function (number) {
  return Math.abs(number) * -1;
};

GO_NUMBER.negative = function (number) {
  return Math.abs(number) * -1;
};

GO_NUMBER.rand = function (min = 0, max = 9) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

GO_NUMBER.random = function (min = 0, max = 9) {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

GO_NUMBER.randomNum = function () {
  return GO_NUMBER.random(...arguments);
};

GO_NUMBER.randomNumber = (digits = 10) => {
  return Math.floor(Math.random() * (9 * Math.pow(10, digits - 1))) + Math.pow(10, digits - 1);
};

GO_NUMBER.isNumber = (input) => {
  try {
    return Number(input) === Number(input);
  } catch (error) {
    return false;
  }
};

Object.assign(GO, MOD_LUIGIOS_GONUMBERJS);

const GO_OBJECT = {};

const MOD_LUIGIOS_GOOBJECTJS = GO_OBJECT;

GO_OBJECT.toJson = function (obj) {
  return JSON.stringify(obj);
};

GO_OBJECT.toObject = function (jsonString = '{"":""}') {
  return GO_OBJECT.fromJson(jsonString);
};

GO_OBJECT.fromJson = function (str) {
  let obj = {};

  try {
    obj = JSON.parse(str);
  } catch (error) {
    // continue
  }

  return obj;
};

GO_OBJECT.json = function (obj) {
  if (typeof obj === "string") {
    return GO_OBJECT.fromJson(obj);
  }

  return GO_OBJECT.toJson(obj);
};

GO_OBJECT.object = function (obj) {
  if (typeof obj === "string") {
    return GO_OBJECT.fromJson(obj);
  }

  return GO_OBJECT.toJson(obj);
};

GO_OBJECT.queryStringToObject = (str) => {
  const decodeStr = (_str) => {
    try {
      _str = decodeURIComponent(_str);
    } catch (error) {}

    try {
      _str = decodeURI(_str);
    } catch (error) {}

    return _str;
  };

  str = Go.removeFirstIf(str, "?");

  return str
    .split("&")
    .map((item) => item.split("="))
    .reduce((acc, item) => {
      acc[item[0]] = decodeStr(item[1]);
      return acc;
    }, {});
};

GO_OBJECT.queryToObject = (str) => {
  return GO_OBJECT.queryStringToObject(str);
};

GO_OBJECT.objectToQuery = (obj) => {
  return Object.keys(obj)
    .map((key) => `${key}=${obj[key]}`)
    .join("&");
};

GO_OBJECT.serializeObject = (obj) => {
  return GO_OBJECT.objectToQuery(obj);
};

GO_OBJECT.queryToInputs = (str) => {
  const obj = GO_OBJECT.queryToObject(str);
  let html = "";

  for (const key in obj) {
    html += `<input type="hidden" name="${key}" value="${obj[key]}" />`;
  }

  return html;
};

GO_OBJECT.cloneObject = function (obj) {
  return JSON.parse(JSON.stringify(obj));
};

GO_OBJECT.getProperty = function (obj = {}, path = "", defaultValue) {
  const normalize = (value) => (value == null || value === "" ? defaultValue : value);

  if (obj == null) {
    return defaultValue;
  }

  if (typeof obj === "function") {
    obj = obj();
  }

  if (typeof obj === "string" && typeof path !== "string") {
    [obj, path] = [path, obj];
  }

  if (Array.isArray(path)) {
    for (const currentPath of path) {
      const result = GO_OBJECT.getProperty(obj, currentPath, undefined);

      if (result != null && result !== "") {
        return result;
      }
    }

    return defaultValue;
  }

  if (path == null || path === "") {
    return defaultValue;
  }

  const hasProperty = (target, key) => {
    if (target == null) {
      return false;
    }

    return (typeof target === "object" || typeof target === "function") && key in target;
  };

  if (hasProperty(obj, path)) {
    return normalize(obj[path]);
  }

  if (Array.isArray(obj)) {
    const index = Number(path);

    if (Number.isInteger(index) && index >= 0 && index < obj.length) {
      return normalize(obj[index]);
    }
  }

  if (typeof path !== "string") {
    return defaultValue;
  }

  let current = obj;

  for (const key of path.split(".")) {
    if (!hasProperty(current, key)) {
      return defaultValue;
    }

    current = current[key];
  }

  return normalize(current);
};

GO_OBJECT.getProp = function () {
  return GO_OBJECT.getProperty(...arguments);
};

GO_OBJECT.setProp = function () {
  return GO_OBJECT.setProperty(...arguments);
};

GO_OBJECT.setProperty = function (obj, path, value) {
  if (["string"].includes(typeof obj)) {
    [obj, path] = [path, obj];
  }

  if (["function"].includes(typeof obj)) {
    obj = obj();
  }

  try {
    path.split(".").reduce(function (o, x, i, a) {
      if (i === a.length - 1) {
        o[x] = value;
      }

      return o && o[x];
    }, obj);
  } catch (error) {
    console.log(error);
  }
};

GO_OBJECT.deleteProperty = function (obj, path) {
  if (["string"].includes(typeof obj)) {
    [obj, path] = [path, obj];
  }

  if (["function"].includes(typeof obj)) {
    obj = obj();
  }

  if ((path && obj[path]) || !Go.includes(path, ".")) {
    delete obj[path];
    return obj;
  }

  try {
    path.split(".").reduce(function (o, x, i, a) {
      if (i === a.length - 1) {
        delete o[x];
      }

      return o && o[x];
    }, obj);
  } catch (error) {
    console.log(error);
  }

  return obj;
};

GO_OBJECT.extends = function (Child, Parent) {
  // check if Parent is a constructor
  if (typeof Parent === "function") {
    return Object.assign(Child, new Parent(), Parent.prototype);
  }

  // check if Parent is an object
  if (typeof Parent === "object") {
    return Object.assign(Child, ...arguments);
  }
};

GO_OBJECT.extend = function () {
  return GO_OBJECT.extends(...arguments);
};

GO_OBJECT.assign = function (obj, ...args) {
  return Object.assign(obj, ...args);
};

GO_OBJECT.for = function (obj, callback) {
  if (Go.is(obj, "Array")) {
    return GO_OBJECT.FOR(obj, callback);
  }

  if (Go.is(obj, "number")) {
    return GO_OBJECT.forNumber(obj, callback);
  }

  if (Go.is(obj, "selector")) {
    obj = document.querySelectorAll(obj);
  }

  if (Go.is(obj, "NodeList")) {
    return obj.forEach(callback);
  }

  if (Go.is(obj, "FormData")) {
    return obj.forEach(callback);
  }

  if (Go.is(obj, "Object")) {
    return GO_OBJECT.forObject(obj, callback);
  }
};

GO_OBJECT.iterate = function (time = 0, obj = [], ...args) {
  return new Promise(async (resolve) => {
    let [results, result, timing] = [[], null, null];
    await Go.for(obj, async (action) => {
      result = await action(args);
      timing = await Go.sleep(time);
      results.push(result);
    });
    resolve(results);
  });
};

GO_OBJECT.forNumber = function (obj = 0, callback) {
  return new Promise(async (resolve) => {
    for (let i = 0; i < obj; i++) {
      if (Go.is(callback, "async")) {
        await callback(i);
      } else {
        callback(i);
      }
    }
    resolve();
  });
};

GO_OBJECT.forObject = function (obj = {}, callback) {
  return new Promise(async (resolve) => {
    const keys = Object.keys(obj);
    for (let i = 0; i < keys.length; i++) {
      if (Go.is(callback, "async")) {
        await callback(keys[i], obj[keys[i]]);
      } else {
        callback(keys[i], obj[keys[i]]);
      }
    }
    resolve();
  });
};

GO_OBJECT.FOR = function (obj = [], callback) {
  return new Promise(async (resolve) => {
    const size = obj.length;
    for (let i = 0; i < size; i++) {
      if (Go.is(callback, "async")) {
        await callback(obj[i], i);
      } else {
        callback(obj[i], i);
      }
    }
    resolve();
  });
};

GO_OBJECT.forEach = function (obj, callback) {
  return GO_OBJECT.for(obj, callback);
};

GO_OBJECT.serializeAttributes = function (obj) {
  let str = "";

  if (!Go.is(obj, "object")) return str;

  for (const key in obj) {
    str += `${key}="${obj[key]}" `;
  }

  return str;
};

GO_OBJECT.serializeAttrs = function (obj) {
  return GO_OBJECT.serializeAttributes(obj);
};

GO_OBJECT.recursiveObjectsCombine = function (...objects) {
  const isObject = (obj) => obj && typeof obj === "object" && !Array.isArray(obj) && !(obj instanceof Date);

  const deepClone = (value) => {
    if (Array.isArray(value)) {
      return value.map(deepClone);
    } else if (value instanceof Date) {
      return new Date(value);
    } else if (isObject(value)) {
      const cloned = {};
      for (let key in value) {
        cloned[key] = deepClone(value[key]);
      }
      return cloned;
    } else {
      return value;
    }
  };

  const mergeDeep = (target, source) => {
    const result = deepClone(target);
    for (let key in source) {
      if (isObject(source[key])) {
        if (isObject(result[key])) {
          result[key] = mergeDeep(result[key], source[key]);
        } else {
          result[key] = deepClone(source[key]);
        }
      } else if (Array.isArray(source[key])) {
        result[key] = Array.isArray(result[key]) ? [...result[key], ...deepClone(source[key])] : [...deepClone(source[key])];
      } else {
        result[key] = source[key];
      }
    }
    return result;
  };

  return objects.reduce((acc, obj) => mergeDeep(acc, obj), {});
};

GO_OBJECT.recursiveObjectsMerge = function () {
  return GO_OBJECT.recursiveObjectsCombine(...arguments);
};

GO_OBJECT.recursiveObjectsAssign = function () {
  return GO_OBJECT.recursiveObjectsCombine(...arguments);
};

GO_OBJECT.objectsCombine = function () {
  return GO_OBJECT.recursiveObjectsCombine(...arguments);
};

GO_OBJECT.objectsMerge = function () {
  return GO_OBJECT.recursiveObjectsCombine(...arguments);
};

GO_OBJECT.objectsAssign = function () {
  return GO_OBJECT.recursiveObjectsCombine(...arguments);
};

GO_OBJECT.delProp = function (obj, prop) {
  if (typeof prop === "string") {
    [obj, prop] = [prop, obj];
  }

  if (Array.isArray(prop)) {
    prop.forEach((p) => delete obj[p]);
    return obj;
  }

  delete obj[prop];

  return obj;
};

GO_OBJECT.one = function (obj, ...args) {
  for (let i = 0; i < args.length; i++) {
    let arg = args[i];
    let argValue = Go.getProp(obj, arg);

    if (typeof argValue === "function") {
      argValue = argValue();
    }

    if (argValue) {
      return argValue;
    }
  }

  return;
};

GO_OBJECT.stableStringify = function (value, seen = new WeakSet()) {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }

  if (seen.has(value)) {
    return '"[Circular]"';
  }

  seen.add(value);

  if (Array.isArray(value)) {
    return "[" + value.map((v) => GO_OBJECT.stableStringify(v, seen)).join(",") + "]";
  }

  const keys = Object.keys(value).sort();
  const props = keys.map((key) => JSON.stringify(key) + ":" + GO_OBJECT.stableStringify(value[key], seen));

  return "{" + props.join(",") + "}";
};

GO_OBJECT.hasProperty = function (obj, key) {
  if (Array.isArray(key)) {
    return key.some((k) => GO_OBJECT.hasProperty(obj, k));
  }

  if (["string"].includes(typeof obj)) {
    [obj, key] = [key, obj];
  }

  if (["object"].includes(typeof obj)) {
    return obj.hasOwnProperty(key);
  }

  return false;
};

Object.assign(GO, MOD_LUIGIOS_GOOBJECTJS);

const GO_OBSERVER = function (el, options) {
  Go.extend(this, Go.Events);
  this.el = Go.is(el, "object") ? el.el || el.element || el.target || document : el;
  this.observer1 = null;
  this.observer2 = null;
  this.options = Go.is(el, "object") ? el : options;
  this.observe();
};

const MOD_LUIGIOS_GOOBSERVERJS = { observer: (el, options) => new GO_OBSERVER(el, options) };

GO_OBSERVER.prototype.observe = function () {
  if (Go.is(this.el, "string")) {
    this.el = document.querySelector(this.el);
  }

  if (!this.el) return;

  if (this.options.intersection) {
    this.intersection();
  }

  if (this.options.mutation) {
    this.mutations();
  }
};

GO_OBSERVER.prototype.mutations = function () {
  this.observer1 = new MutationObserver(this.mutationsCallback.bind(this), this.options);
  this.observer1.observe(this.el, this.options);
};

GO_OBSERVER.prototype.mutationsCallback = function (mutations) {
  for (let mutation of mutations) {
    this.emit("mutation", { mutation });
  }
};

GO_OBSERVER.prototype.intersection = function () {
  this.observer2 = new IntersectionObserver(this.intersectionCallback.bind(this), this.options);
  this.observer2.observe(this.el, this.options);
};

GO_OBSERVER.prototype.intersectionCallback = function (entries) {
  for (let entry of entries) {
    this.emit("intersection", { entry });
  }
};

GO_OBSERVER.prototype.disconnect = function () {
  this.observer1 && this.observer1.disconnect();
  this.observer2 && this.observer2.disconnect();
};

Object.assign(GO, MOD_LUIGIOS_GOOBSERVERJS);

const Options = function (options, target, callback) {
  this.options = options;
  this.target = target;
  this.callback = callback;
  this.render();
};

const MOD_LUIGIOS_GOOPTIONSJS = { options: (options, target, callback) => new Options(options, target, callback) };

Options.prototype.render = function () {
  if (Go.is(this.options, "HTMLElement")) {
    [this.options, this.target] = [this.target, this.options];
  }

  if (Go.is(this.target, "Array")) {
    [this.options, this.target] = [this.target, this.options];
  }

  if (!Go.is(this.target, "HTMLElement")) {
    this.target = document.querySelector(this.target);
  }

  if (!this.target) {
    return;
  }

  let optionsElement = this.target.querySelector(`go-options`);

  if (optionsElement) {
    return optionsElement.remove();
  }

  optionsElement = document.createElement("go-options");
  this.target.appendChild(optionsElement);

  const optionsContent = document.createElement("go-options-content");
  optionsElement.appendChild(optionsContent);

  this.options.forEach((option) => {
    let [template, _if, _else] = [``, option.if, option.else];

    if (typeof _if === "function") {
      _if = _if(option);

      if (!_if && _else && typeof _else === "function") {
        _else = _else(option);
      }

      if (!_if && !_else) return;

      if (!_if && _else) {
        option = _else;
      }
    } else if (typeof _if === "boolean" && !_if && _else) {
      option = _else;
    } else if (!_if && Go.is(_if, "set")) {
      return;
    }

    if (!Go.has(option, "someProperty")) {
      return;
    }

    if (Go.is(option, "HTMLElement")) {
      return optionsContent.appendChild(option);
    } else if (Go.is(option.icon, "string")) {
      template += `<go-icon class="icon" name="${option.icon}"></go-icon>`;
    } else if (Go.is(option.icon, "object")) {
      template += `<go-icon class="icon" ${Go.serializeAttrs(option.icon)}></go-icon>`;
    } else if (option.icon) {
      template += `<go-icon class="icon" name="${option.icon}"></go-icon>`;
    }

    template += `<div class="text">`;

    if (option.label || option.name) {
      template += `<div class="label">${option.label || option.name}</div>`;
    }

    if (option.desc) {
      template += `<div class="desc">${option.desc}</div>`;
    }

    template += `</div>`;

    if (option.iconRight && Go.is(option.iconRight, "string")) {
      option.iconRight = { icon: option.iconRight };
    }

    if (option.iconRight) {
      template += `<go-icon class="iconRight ${option.iconRight.class}" name="${option.iconRight.icon}"></go-icon>`;
    }

    optionsContent.appendChild(
      Go.create({
        tag: "go-option",
        option: option,
        onclick: (e) => this.select(option, e),
        attrs: option.attrs || {},
        html: Go.eval(template),
        style: {
          ...(option.vars || {}),
          ...(option.style || {}),
        },
        ...{ ...option, style: undefined, vars: undefined },
        class: `go-option ${Go.keyId(option.name)} ${option.class || ""}`,
      })
    );
  });
};

Options.prototype.select = function (option, event) {
  if (Go.is(this.callback, "function")) {
    return this.callback(option, event);
  }

  if (Go.is(this.onSelect, "function")) {
    return this.onSelect(option, event);
  }

  if (Go.is(this.onOption, "function")) {
    return this.onOption(option, event);
  }
};

Object.assign(GO, MOD_LUIGIOS_GOOPTIONSJS);

const GO_PAGE_DATA = {};

const GO_PAGE = function (page = {}) {
  this.page = page;
  this.target = page.target || "html";
};

const MOD_LUIGIOS_GOPAGEJS = { page: (page) => new GO_PAGE(page) };

GO_PAGE.prototype.load = function () {
  return Object.assign(GO_PAGE_DATA, this.page);
};

GO_PAGE.prototype.add = function () {
  return Object.assign(GO_PAGE_DATA, this.page);
};

Object.assign(GO, MOD_LUIGIOS_GOPAGEJS);

const GO_PAGES_DATA = {};

const GO_PAGES = function (pages = {}) {
  this.pages = pages;
};

const MOD_LUIGIOS_GOPAGESJS = { pages: (pages) => new GO_PAGES(pages) };

GO_PAGES.prototype.load = function () {
  return Object.assign(GO_PAGES_DATA, this.pages);
};

GO_PAGES.prototype.add = function () {
  return Object.assign(GO_PAGES_DATA, this.pages);
};

Object.assign(GO, MOD_LUIGIOS_GOPAGESJS);

const GO_PRINT = function (el, conf = {}) {
  this.el = el;
  this.data = {};
  this.title = document.title;
  this.conf = conf;

  if (typeof el === "object" && !Go.isElement(el)) {
    this.el = el.el || el.element || el.target || document;
    this.data = el || {};
    this.title = el.title || document.title;
  }

  this.print();
};

const MOD_LUIGIOS_GOPRINTJS = { print: (el) => new GO_PRINT(el) };

GO_PRINT.prototype.print = function () {
  if (typeof this.el === "string") {
    this.el = document.querySelector(this.el);
  }

  if (!Go.isElement(this.el)) {
    return Go.alert(Go.lang("print_error"));
  }

  const script = this.printScript();
  const styles = this.printStyles();

  const content = Go.create({
    tag: "div",
    class: "printer",
    child: {
      tag: this.el.tagName,
      class: this.el.className,
      html: this.el.innerHTML,
    },
  });

  const printWindow = window.open("", "PRINT", "height=980,width=768");
  let contentToPrint = content.outerHTML;
  contentToPrint = contentToPrint.replace(/nav-animate/g, "");

  printWindow.document.write("<html>");
  printWindow.document.write("<head>");
  printWindow.document.write(`<base href="${this.data.base || Go.base()}">`);
  printWindow.document.write("<title>" + this.title + "</title>" + styles + script);
  printWindow.document.write("</head>");
  printWindow.document.write(`<body>${contentToPrint}</body>`);
  printWindow.document.write("</html>");
  printWindow.document.close(); // necessary for IE >= 10
  printWindow.focus(); // necessary for IE >= 10*/
};

GO_PRINT.prototype.printScript = function (script = "") {
  script += `<script type="text/javascript">`;
  script += `window.onload = function() {`;
  script += `window.print();`;
  script += `window.close();`;
  script += `};`;
  script += `</script>`;

  Go.for(this.data.scripts, (script) => {
    script += `<script type="text/javascript" src="${typeof script === "string" ? script : script.src}"}" defer></script>`;
  });

  return script;
};

GO_PRINT.prototype.printStyles = function (styles = "") {
  styles += `<style type="text/css">`;
  styles += `.noprint, [noprint] { display: none!important; }`;
  styles += `.printer { width:100%; }`;
  styles += `</style>`;

  this.styles = this.data.style || this.data.styles || this.data.css || this.conf.styles || this.conf.style || this.conf.css || [];

  if (typeof this.styles === "string") {
    this.styles = [this.styles];
  }

  this.styles.push(Go.host("", "/go.css"));

  if (Go.prop(Go.config("print"), "styles")) {
    this.styles = this.styles.concat(Go.prop(Go.config("print"), "styles"));
  }

  Go.for(this.styles, (style) => {
    styles += `<link rel="stylesheet" type="text/css" href="${typeof style === "string" ? style : style.href}">`;
  });

  return styles;
};

Object.assign(GO, MOD_LUIGIOS_GOPRINTJS);

const GO_PROMISE = function (promise) {
  this.promise = promise;
};

const GO_PROMISES = function (...promises) {
  this.promises = promises[0];
  this.sucess = false;
  this.result = {};
  this.progress = 0;
  this.data = "";
  this.finished = false;
};

const MOD_LUIGIOS_GOPROMISEJS = {
  promise: (promise) => new GO_PROMISE(promise),
  promises: (...promises) => new GO_PROMISES(promises),
};

GO_PROMISE.prototype.promise = function () {
  return new Promise((resolve, reject) => {});
};

GO_PROMISES.prototype.run = async function () {
  return new Promise(async (resolve, reject) => {
    for (let i = 0; i < this.promises.length; i++) {
      const promise = this.promises[i];
      this.progress = this.calculateProgress(i + 1);
      this.current = await this.executePromise(promise, i);
      resolve(this.current);
    }
  });
};

GO_PROMISES.prototype.executePromise = function (promise, index) {
  return new Promise(async (resolve, reject) => {
    if (this.timeoutBetween) {
      await Go.sleep(this.timeoutBetween);
    }

    if (Go.is(promise, "function")) {
      this.data += await this.tryPromise(promise, index);
    }

    if (Go.is(this.onProgress, "function")) {
      this.onProgress({ data: this.data, index, percent: this.progress });
    }

    if (index === this.promises.length - 1) {
      this.workFinished();
    }

    resolve();
  });
};

GO_PROMISES.prototype.tryPromise = function (promise, index) {
  return new Promise(async (resolve, reject) => {
    try {
      this.data = await promise();
    } catch (error) {
      this.nowError(error);
    }
    resolve(this.data);
  });
};

GO_PROMISE.prototype.nowError = function (error) {
  if (Go.is(this.onError, "function")) {
    this.onError(error);
  }
};

GO_PROMISES.prototype.calculateProgress = function (index) {
  return Math.round((index / this.promises.length) * 100);
};

GO_PROMISES.prototype.workFinished = function () {
  this.progress = this.calculateProgress(this.promises.length);

  this.finished = { data: this.data, percent: this.progress, result: this.result };

  if (Go.is(this.onFinished, "function")) {
    this.onFinished(this.finished);
  }

  if (Go.is(this.onSuccess, "function")) {
    this.onSuccess(this.finished);
  }

  if (Go.is(this.onFinish, "function")) {
    this.onFinish(this.finished);
  }
};

Object.assign(GO, MOD_LUIGIOS_GOPROMISEJS);

const GO_PROMPT = function (data = {}) {
  this.data = data;
  this.value = null;
  this.id = this.data.id || Go.uuid();
  if (["string"].includes(typeof data)) {
    this.data = { message: data };
  }
};

const MOD_LUIGIOS_GOPROMPTJS = {
  prompt: function () {
    return new GO_PROMPT(...arguments).show();
  },
};

GO_PROMPT.prototype.show = function () {
  const _self = this;

  this.data.prototype ||= {};
  this.configData = Go.config("prompt") || {};
  this.data.placeholder ||= Go.capitalize(Go.string(this.data.message).lastWord());
  this.data = Object.assign({}, this.configData, this.data);
  this.inputAttrs = Go.serializeAttrs(this.data.inputAttrs || {});
  this.inputStyle = Go.serializeStyle(this.data.inputStyle || {});
  this.data.title ||= Go.lang("prompt");
  this.value = this.data.value || Go.getProp(this.data, "input.value", null);
  this.name ||= Go.getProp(this.data, "input.name", "input");
  this.view = null;

  this.promise = new Promise((resolve, reject) => {
    this.view = Go.view({
      title: this.data.title,
      class: `menu default center gap`,
      animation: "midBottomIn",
      ...this.data,
      html: Go.create({
        tag: "form",
        class: `form promptData padding prompt-${_self.id} ${this.data.formCLass || this.data.formClass || ""}`,
        onsubmit: (e) => Go.prevent(e),
        childrens: [
          {
            if: () => this.data.message,
            tag: "div",
            class: "message margin-bottom",
            html: this.data.message,
          },
          {
            tag: "go-input",
            type: Go.getProp(this.data, "type", "text"),
            placeholder: this.data.placeholder,
            value: this.value || "",
            name: this.name,
            label: this.data.label,
            ...(this.data.input || {}),
            onkeyup: function (e) {
              if (e.keyCode !== 13) return;
              _self.resolve(_self, resolve);
            },
          },
          ...(this.data.inputs || []),
        ],
      }),
      footer: Go.create({
        tag: "go-confirm",
        onaccept: function () {
          _self.resolve(_self, resolve);
        },
        oncancel: function () {
          _self.view.close(() => reject(null));
        },
      }),
    });
  });

  Object.assign(this.promise, this.data.prototype, {
    view: this.view,
    find: this.find.bind(this),
  });

  return this.promise;
};

GO_PROMPT.prototype.find = function () {
  return this.view && this.view.find(...arguments);
};

GO_PROMPT.prototype.resolve = function (_self, _resolve) {
  const data = Go.formToObject(Go.el(`.prompt-${_self.id}`));
  const firstValue = Object.values(data)[0];
  const onvalue = _self.data.onvalue || _self.data.onValue || _self.data.onready || _self.data.onReady || _self.data.onConfirm || _self.data.onconfirm;
  const keepOpen = _self.data.keepOpen || _self.data.keep || _self.data.noClose;

  if (_self.data.required && !data.input && !firstValue) return;

  if (_self.data.required && !data[_self.name] && !firstValue) return;

  let [value, result] = [data[_self.name] || data.input || firstValue, data];

  if (["object"].includes(typeof _self.data.inputs)) {
    [value, result] = [result, value];
  }

  if (["function"].includes(typeof onvalue)) {
    onvalue(value, result, _self.view);
  }

  if (keepOpen) {
    return;
  }

  return _self.view.close(() => {
    _resolve(value, result);
  });
};

Object.assign(GO, MOD_LUIGIOS_GOPROMPTJS);

const Resource = function (src, conf = {}) {
  this.src = src;
  this.conf = conf;
  return this.load();
};

const MOD_LUIGIOS_GORESJS = {
  load: (str, conf) => new Resource(str, conf),
  unload: (str) => {
    const keyName = Go.keyString(str);
    const element = document.getElementById(keyName);
    if (element) {
      element.remove();
    }
  },
};

Resource.prototype.load = function () {
  if (!this.src) return;

  this.isJs = this.src.endsWith(".js") || this.conf.js || this.conf.type === "text/javascript" || this.conf.type === "module";

  if (this.isJs) {
    return this.loadJs();
  }

  if (this.src.endsWith(".css")) {
    return this.loadCss();
  }

  if (this.conf.type === "js") {
    return this.loadJs();
  }

  if (this.conf.type === "css") {
    return this.loadCss();
  }
};

Resource.prototype.loadJs = function () {
  return new Promise((resolve, reject) => {
    this.keyName = Go.keyString(this.src);
    this.src = Go.route.fixPath(this.src);
    let src = this.src;
    let hash = "";

    let element = document.getElementById(this.keyName);

    if (this.conf.replace && element) {
      element.remove();
    }

    // Check if resource is already loaded
    if (document.getElementById(this.keyName)) {
      return;
    }

    if (!this.src.startsWith("http")) {
      src = `${location.protocol}//${location.host}${this.src}`;
    }

    // Append to head
    const head = document.getElementsByTagName("head")[0];
    element = document.createElement("script");
    element.type = "text/javascript";

    if (this.conf.async) element.async = true;
    if (this.conf.defer) element.defer = true;
    if (this.conf.type) element.type = this.conf.type;
    if (this.conf.hash) hash = `?v=${Go.uuid()}`;

    element.src = src + hash;
    element.id = this.keyName;
    head.appendChild(element);

    element.onload = () => {
      resolve(this);
    };
  });
};

Resource.prototype.loadCss = function () {
  return new Promise((resolve, reject) => {
    this.keyName = Go.keyString(this.src);
    this.src = Go.route.fixPath(this.src);
    let src = this.src;
    let hash = "";

    let element = document.getElementById(this.keyName);

    if (this.conf.replace && element) {
      element.remove();
    }

    // Check if resource is already loaded
    if (document.getElementById(this.keyName)) {
      return;
    }

    if (!this.src.startsWith("http")) {
      src = `${location.protocol}//${location.host}${this.src}`;
    }

    if (this.conf.hash) hash = `?v=${Go.uuid()}`;

    // Append to head
    const head = document.getElementsByTagName("head")[0];
    element = document.createElement("link");
    element.id = this.keyName;
    element.rel = "stylesheet";
    element.type = "text/css";
    element.href = src + hash;
    head.appendChild(element);

    element.onload = () => {
      resolve(this);
    };
  });
};

Object.assign(GO, MOD_LUIGIOS_GORESJS);

const Resizer = function () {
  this.doit = null;
  this.initialized = false;
};

const MOD_LUIGIOS_GORESIZERJS = { resizer: new Resizer() };

Resizer.prototype.init = function () {
  this.listen();
};

Resizer.prototype.listen = function () {
  if (this.initialized) {
    return;
  }

  this.initialized = true;

  window.removeEventListener("resize", (e) => this.resizing(e));
  window.addEventListener("resize", (e) => this.resizing(e));
  this.setScreen();
};

Resizer.prototype.resizing = function (e) {
  const self = this;
  clearTimeout(this.doit);
  this.doit = setTimeout(function () {
    self.resizeEnd();
  }, 100);
};

Resizer.prototype.resizeEnd = function () {
  this.setScreen();
  Go.emit("resized resizeEnd endResize");
};

Resizer.prototype.setScreen = function () {
  let width = window.innerWidth;
  let height = window.innerHeight;
  Go.cssVar(document.body, "--screen-width", width + "px");
  Go.cssVar(document.body, "--screen-height", height + "px");
};

Object.assign(GO, MOD_LUIGIOS_GORESIZERJS);

const Route = function () {
  this.path = "/";
  this.query = {};
};

const MOD_LUIGIOS_GOROUTEJS = { route: new Route() };

Route.prototype.pathname = function () {
  const _base = document.getElementById("base");
  const [base, proxy] = [_base && _base.getAttribute("href"), _base && _base.getAttribute("proxy")];
  let pathname = window.location.pathname;

  if (base && proxy) {
    pathname = pathname.replace(proxy, base);
  }

  return pathname;
};

Route.prototype.set = function (route) {
  this.path = this.pathname();
  this.host = location.host;
  this.search = location.search;
  this.query = Go.queryStringToObject(Go.removeFirstStringIf(this.search, "?"));
  Object.assign(this, route);
};

Route.prototype.fixPath = function (path) {
  if (!path) return path;

  if (path.startsWith("http")) {
    return path;
  }

  this.path = this.pathname();

  let appName = this.path.split("/app/")[1];

  if (!appName) {
    appName = Go.attr("html", "app");
  }

  if (!appName) {
    return path;
  }

  appName = appName.split("/")[0];

  if (!path.startsWith("/") && appName) {
    path = `/app/${appName}/${path}`;
  }

  return path;
};

Route.prototype.current = function (prop) {
  if (!prop) {
    return Go.config("currentRoute");
  }
  return Go.getProp(Go.config("currentRoute"), prop);
};

Object.assign(GO, MOD_LUIGIOS_GOROUTEJS);

const GO_SASS = {};

const MOD_LUIGIOS_GOSASSJS = GO_SASS;

GO_SASS.compileSCSS = function (input) {
  if (!input) return "";

  if (!Go.is(input, "String")) return "";

  input = Go.minify(input);

  // Expresión regular para buscar bloques anidados en SCSS
  const nestedBlockRegex = /\.([\w-]+)\s*\{([^{}]+)\}/g;

  // Reemplaza los bloques anidados por selectores CSS válidos
  const cssCode = input.replace(nestedBlockRegex, (match, selector, properties) => {
    // Elimina cualquier espacio en blanco adicional
    properties = properties.trim();

    // Reemplaza los puntos (.) en el selector con espacios para obtener el selector CSS válido
    const cssSelector = selector.replace(/\./g, " ");

    // Retorna el selector CSS y las propiedades CSS
    return `${cssSelector} { ${properties} }`;
  });

  return cssCode;
};

Object.assign(GO, MOD_LUIGIOS_GOSASSJS);

const GO_SCREEN = {};

const MOD_LUIGIOS_GOSCREENJS = GO_SCREEN;

GO_SCREEN.screen = function () {
  let screen = { width: window.innerWidth, height: window.innerHeight };
  let [isMobile, isTablet, isDesktop] = [false, false, false];
  let [mobileWidth, tabletWidth, desktopWidth, orientation] = [767, 768, 1024, null];

  if (screen.width <= mobileWidth && screen.width <= tabletWidth) {
    isMobile = true;
  } else if (screen.width >= tabletWidth && screen.width <= desktopWidth) {
    isTablet = true;
  } else if (screen.width >= desktopWidth) {
    isDesktop = true;
  }

  if (window.orientation == 180 || window.orientation == 0) {
    orientation = "portrait";
  } else if (window.orientation == 90 || window.orientation == -90) {
    orientation = "landscape";
  }

  return {
    isMobile,
    isTablet,
    isDesktop,
    ...screen,
    orientation,
    nextBackground: () => {},
    setBackground: (src) => {},
  };
};

GO_SCREEN.fullScreen = () => {
  const el = document.documentElement;
  const rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
  if (!Go.is(rfs, "undefined")) {
    rfs.call(el);
  }
};

GO_SCREEN.exitFullScreen = () => {
  const el = document;
  const cfs = el.cancelFullScreen || el.webkitCancelFullScreen || el.mozCancelFullScreen || el.msExitFullscreen;
  if (!Go.is(cfs, "undefined")) {
    cfs.call(el);
  }
};

Object.assign(GO, MOD_LUIGIOS_GOSCREENJS);

const GO_SCROLL = function (element) {
  this.element = Go.if({
    cond: () => Go.is(element, "string"),
    then: () => document.querySelector(element),
    else: () => element,
  });
};

const MOD_LUIGIOS_GOSCROLLJS = {
  scroll: function () {
    return new GO_SCROLL(...arguments);
  },
};

GO_SCROLL.prototype.enableWheelScroll = function (onScroll) {
  let delta = 0;
  let ticking = false;

  function update() {
    if (this.if && ["function"].includes(typeof this.if) && !this.if()) {
      ticking = false;
      return;
    }

    onScroll(delta);
    delta = 0;
    ticking = false;
  }

  this.element.addEventListener(
    "wheel",
    (e) => {
      delta += e.deltaY;

      if (!ticking) {
        requestAnimationFrame(update.bind(this));
        ticking = true;
      }
    },
    { passive: true }
  );
};

GO_SCROLL.prototype.scrollOnWheel = function () {
  this.enableWheelScroll((dy) => {
    this.element.scrollBy({
      top: dy,
    });
  });

  return this;
};

GO_SCROLL.prototype.onScroll = function (cb = () => {}) {
  let delta = 0;
  let ticking = false;
  let lastY = window.scrollY;

  function update() {
    if (this.if && typeof this.if === "function" && !this.if()) {
      ticking = false;
      return;
    }

    cb(delta);

    delta = 0;
    ticking = false;
  }

  this.element.onscroll = () => {
    const currentY = window.scrollY;

    delta += currentY - lastY;
    lastY = currentY;

    if (!ticking) {
      requestAnimationFrame(update.bind(this));
      ticking = true;
    }
  };
};

Object.assign(GO, MOD_LUIGIOS_GOSCROLLJS);

const GO_SEARCH = function (data = {}) {
  this.data = data;
  this.buffer = null;
  this.buffTime = 1000;
  this.src = this.data.src || this.data.url;
  this.resultClass = Go.getProp(data, "resultClass", "");
};

const MOD_LUIGIOS_GOSEARCHJS = {
  search: function () {
    return new GO_SEARCH(...arguments).view();
  },
};

GO_SEARCH.prototype.view = function () {
  this.view = Go.view({
    icon: "search",
    class: "search custom menu bottom default go-search",
    closeOutside: true,
    title: Go.lang("search"),
    ...this.data,
    beforeBody: Go.create({
      tag: "div",
      class: "search_input",
      childrens: [
        {
          tag: "go-input",
          type: "search",
          placeholder: Go.lang("search"),
          icon: "search",
          onkeyup: this.writing.bind(this),
        },
      ],
    }),
    html: Go.create({
      class: "searchResultWrapper",
      childrens: [
        {
          class: "beforeResult",
          if: () => this.data.beforeResult,
          childrens: [this.data.beforeResult],
        },
        {
          tag: "go-items",
          class: `search_result ${this.resultClass}`,
          src: this.src,
          item: this.item.bind(this),
          ...(Go.omit(this.data, "class") || {}),
          style: this.data.resultStyle,
          body: Go.getProp(this.data, "payload", {}),
        },
      ],
    }),
  });
  return this.view;
};

GO_SEARCH.prototype.item = function (item) {
  if (this.data.item) {
    return this.data.item(item);
  }

  return Go.create({
    tag: "div",
    class: "item item-hover",
    html: item.name || item.label,
    style: { padding: "var(--gap)" },
    onclick: () => {
      Go.close(this.view.view, () => {
        this.itemCallback = this.data.onitem || this.data.onItem || this.data.onclick || this.data.callback;
        typeof this.itemCallback == "function" && this.itemCallback(item);
      });
    },
  });
};

GO_SEARCH.prototype.debounce = function (func) {
  clearTimeout(this.buffer);
  this.buffer = setTimeout(() => {
    func();
  }, this.buffTime);
};

GO_SEARCH.prototype.writing = function (e) {
  this.value = e.target.value;

  if (!this.src) {
    return Go.html(this.view.view.find("go-items"), this.item({ name: Go.lang("no_src_defined") }));
  }

  this.debounce(this.fetch.bind(this));

  Go.addClass(this.view.view, "loading");
};

GO_SEARCH.prototype.fetch = function () {
  this.result = this.view.view.find("go-items");
  this.result.body = { limit: 20, q: this.value, ...(this.data.body || {}) };
  this.result.onfinish = this.fetchEnd.bind(this);
  this.result.cache = false;
  this.result.restart();
};

GO_SEARCH.prototype.fetchEnd = function () {
  Go.removeClass(this.view.view, "loading");
};

Object.assign(GO, MOD_LUIGIOS_GOSEARCHJS);

const GO_SESSION = function () {
  this.data = {};
};

const MOD_LUIGIOS_GOSESSIONJS = { session: new GO_SESSION() };

GO_SESSION.prototype.parseJWT = function (token) {
  return Go.jwt.decode(token);
};

GO_SESSION.prototype.set = function (token, tokenId, cb) {
  if (!token && !tokenId && !cb) {
    return;
  }

  tokenId ||= Go.env("auth_name");

  if (Go.is(tokenId, "function")) {
    cb = tokenId;
    tokenId = Go.env("auth_name");
  }

  if (!token && Go.is(cb, "function")) {
    return cb();
  }

  return this.new(token, tokenId, cb);
};

GO_SESSION.prototype.new = function (token, tokenId, cb) {
  tokenId ||= Go.env("auth_name");

  if (["function"].includes(typeof tokenId)) {
    [cb, tokenId] = [tokenId, Go.env("auth_name")];
  }

  this.data = this.parseJWT(token);

  localStorage.setItem(tokenId, token);
  Go.setCookie(tokenId, token, 365);

  if (["function"].includes(typeof cb)) {
    cb(this.data);
  }
};

GO_SESSION.prototype.user = function (tokenId) {
  const token = localStorage.getItem(tokenId || Go.env("auth_name"));
  if (token) {
    return this.parseJWT(token);
  }
  return null;
};

GO_SESSION.prototype.logout = function (tokenId, cb) {
  tokenId ||= Go.env("auth_name");

  if (["function"].includes(typeof tokenId)) {
    [cb, tokenId] = [tokenId, Go.env("auth_name")];
  }

  localStorage.removeItem(tokenId);
  Go.deleteCookie(tokenId);

  if (["function"].includes(typeof cb)) {
    cb(this.data);
  }
};

GO_SESSION.prototype.on = function (tokenId) {
  tokenId ||= Go.env("auth_name");
  return localStorage.getItem(tokenId);
};

GO_SESSION.prototype.renew = function (token, tokenId) {
  token ||= localStorage.getItem(tokenId || Go.env("auth_name"));
  if (token) {
    this.new(token, tokenId);
  }
};

Object.assign(GO, MOD_LUIGIOS_GOSESSIONJS);

const GO_SET = function (key, value) {
  this.key = key;
  this.value = value;
  this.set();
};

const MOD_LUIGIOS_GOSETJS = {
  Set: function () {
    return new GO_SET(...arguments);
  },
};

GO_SET.prototype.set = function () {
  if (Go.hasOwnProperty(this.key)) {
    console.warn(`La propiedad "${this.key}" No se puede reescribir.`);
    return false;
  }

  GO_EXTENDS[this.key] = this.value;
};

Object.assign(GO, MOD_LUIGIOS_GOSETJS);

const GO_SHARE = function (data = {}) {
  this.url = data.url;
  this.title = data.title;
  this.message = decodeURIComponent(data.message || data.text) || "";
  this.skipNative = data.skipNative;
  this.native = this.canNativeShare();
  this.dataView = data.view || {};
  this.cleanText();
  this.open();
};

const MOD_LUIGIOS_GOSHAREJS = {
  share: function () {
    return new GO_SHARE(...arguments);
  },
};

GO_SHARE.prototype.cleanText = function () {
  this.message = this.message.replace(/&nbsp;/gi, " ");
  this.message = this.message.replace(/(<([^>]+)>)/gi, "");
};

GO_SHARE.prototype.canNativeShare = function () {
  return navigator.share !== undefined && typeof navigator.share === "function";
};

GO_SHARE.prototype.open = function () {
  if (this.native && !this.skipNative) {
    try {
      return (this.view = navigator.share({
        url: this.url,
        title: this.title,
        text: this.message,
      }));
    } catch (error) {
      // Continue
    }
  }

  return (this.view = Go.menu({
    title: `${Go.lang("share")} - ${this.title} - ${Go.lang("on")}`,
    class: `menu bottom default share`,
    animation: `bottomIn`,
    closeOutside: true,
    options: this.options(),
    optionsStyle: { minHeight: "256px" },
    gestures: {
      swipe: (evt) => {
        Go.gestures(evt).isDir("down", () => Go.closeParent(evt));
      },
    },
    ...this.dataView,
  }));
};

GO_SHARE.prototype.options = function () {
  this.shares = [
    {
      tag: "a",
      icon: { name: "whatsapp", original: true },
      label: Go.lang("whatsapp"),
      href: `https://api.whatsapp.com/send?text=${Go.url_encode(this.message)}%20${Go.url_encode(this.url)}`,
      target: "_blank",
    },
    {
      tag: "a",
      icon: { name: "telegram", original: true },
      label: Go.lang("telegram"),
      href: `https://telegram.me/share/url?url=${Go.url_encode(this.url)}&text=${Go.url_encode(this.message)}%20${Go.url_encode(this.url)}`,
      target: "_blank",
    },
    {
      tag: "a",
      icon: { name: "facebook", original: true },
      label: Go.lang("facebook"),
      href: `https://www.facebook.com/sharer/sharer.php?u=${Go.url_encode(this.url)}&quote=${Go.url_encode(this.message)}`,
      target: "_blank",
    },
    {
      tag: "a",
      icon: { name: "instagram", original: true },
      label: Go.lang("instagram"),
      href: `https://www.instagram.com/web/share/?url=${Go.url_encode(this.url)}&text=${Go.url_encode(this.message)}%20${Go.url_encode(this.url)}`,
      target: "_blank",
    },
    {
      tag: "a",
      icon: { name: "twitter", original: true },
      label: Go.lang("twitter"),
      href: `https://twitter.com/intent/tweet?text=${Go.url_encode(this.message)}%20${Go.url_encode(this.url)}`,
      target: "_blank",
    },
    {
      tag: "a",
      icon: { name: "pinterest", original: true },
      label: Go.lang("pinterest"),
      href: `https://pinterest.com/pin/create/button/?url=${Go.url_encode(this.url)}&description=${Go.url_encode(this.message)}`,
      target: "_blank",
    },
    {
      tag: "a",
      icon: { name: "email", original: true },
      label: Go.lang("email"),
      href: `mailto:?subject=${Go.url_encode(this.title)}&body=${Go.url_encode(this.message)}%20${Go.url_encode(this.url)}`,
      target: "_blank",
    },
    {
      tag: "a",
      icon: { name: "copy", original: true },
      label: Go.lang("copy_link"),
      fn: () => {
        Go.clipboard(this.url).copy();
        Go.toast(Go.lang("copied") + "!");
      },
    },
  ];

  return this.shares;
};

Object.assign(GO, MOD_LUIGIOS_GOSHAREJS);

const GO_SPEECH = function (text) {
  this.text = text;
  this.read();
};

const MOD_LUIGIOS_GOSPEECHJS = { speech: (data) => new GO_SPEECH(data) };

GO_SPEECH.prototype.read = function () {
  if (!Go.is(window, "speechSynthesis")) {
    console.log("SpeechSynthesis is not supported");
    return;
  }

  const utterance = new SpeechSynthesisUtterance(this.text);
  utterance.lang = "es-ES";
  utterance.rate = 0.9;
  utterance.pitch = 1;
  utterance.volume = 1;
  window.speechSynthesis.speak(utterance);
};

Object.assign(GO, MOD_LUIGIOS_GOSPEECHJS);

const GO_SSE = function (data = {}) {
  this.data = data;
  this.req();
};

const MOD_LUIGIOS_GOSSEJS = { sse: (data) => new GO_SSE(data) };

GO_SSE.prototype.req = function () {
  this.eventSource = new EventSource(this.data.url || this.data.src);
  this.onerror ||= this.data.onerror || this.data.error;
  this.onmessage ||= this.data.onmessage || this.data.message;
  this.onstart ||= this.data.onstart || this.data.start;

  typeof this.onstart === "function" && this.onstart();

  this.eventSource.onerror = (error) => {
    this.eventSource.close();
    typeof this.onerror === "function" && this.onerror(error);
  };

  this.eventSource.onmessage = (event) => {
    try {
      this.data = JSON.parse(event.data);
    } catch (error) {
      this.data = event.data;
    }
    typeof this.onmessage === "function" && this.onmessage(this.data);
  };
};

Object.assign(GO, MOD_LUIGIOS_GOSSEJS);

const GO_STATE = {};

const MOD_LUIGIOS_GOSTATEJS = {
  state: function () {
    return GO_STATE.config(...arguments);
  },
};

GO_STATE.config = function (name, value) {
  const reserved = ["setConfig", "getConfig"];

  if (reserved.includes(name)) {
    return;
  }

  if (arguments.length == 1) {
    return GO_STATE.getConfig(name);
  }

  return GO_STATE.setConfig(name, value);
};

GO_STATE.getConfig = function (name) {
  return GO_STATE[name];
};

GO_STATE.setConfig = function (name, value) {
  if (value == "++") {
    value = Number(GO_STATE.getConfig(name)) + 1;
  }

  if (value == "--") {
    value = Number(GO_STATE.getConfig(name)) - 1;
  }

  GO_STATE[name] = value;

  return GO_STATE.getConfig(name);
};

Object.assign(GO, MOD_LUIGIOS_GOSTATEJS);

window.storageEventListenerAdded = false;

const Storage = function () {
  this.data = {};
  this.listen();
};

Storage.prototype.listen = function () {
  if (window.storageEventListenerAdded) {
    return;
  }

  window.storageEventListenerAdded = true;

  window.addEventListener("storage", (event) => {
    Go.emit("storage", event);
    Go.emit(`storage-${event.key}`, event);
  });
};

const storage = new Storage();

const MOD_LUIGIOS_GOSTORAGEJS = { storage: (table) => storage.table(table) };

Storage.prototype.table = function (table) {
  if (!table) return this.data;

  if (!this.data[table]) {
    this.data[table] = {};
  }

  return {
    get: (key) => this.get(table, key),
    set: (key, obj) => this.set(table, key, obj),
    remove: (key) => this.remove(table, key),
    delete: (key) => this.remove(table, key),
    clear: () => this.remove(table),
    clean: () => this.remove(table),
    destroy: () => this.remove(table),
    put: (obj) => this.put(table, obj),
    reset: (key, obj) => {
      this.remove(table);
      this.set(table, key, obj);
    },
  };
};

Storage.prototype.get = function (table, key) {
  if (!table) return "";

  let current = localStorage.getItem(table);

  if (!current) return "";

  if (Go.is(current, "json")) {
    current = JSON.parse(current);
  }

  if (!key) return current;

  if (Array.isArray(key)) {
    const objr = {};
    key.map((k) => (objr[k] = this.get(table, k)));
    return objr;
  }

  return Go.getProperty(current, key) || "";
};

Storage.prototype.value = Storage.prototype.get;

Storage.prototype.set = function (table, obj = {}) {
  let current = localStorage.getItem(table);

  if (Go.is(obj, "string")) {
    localStorage.setItem(table, obj);
    return;
  }

  if (!current) {
    localStorage.setItem(table, JSON.stringify(obj));
  }

  current = localStorage.getItem(table);

  try {
    current = JSON.parse(current);
  } catch (error) {
    current = {};
  }

  current = { ...current, ...obj };

  localStorage.setItem(table, JSON.stringify(current));

  Go.emit("storage", { action: "set", table, obj });
};

Storage.prototype.remove = function (table, key) {
  let current = localStorage.getItem(table);

  try {
    current = JSON.parse(current);
  } catch (error) {
    //...
  }

  if (!key) {
    return localStorage.removeItem(table);
  }

  Go.deleteProperty(current, key);

  localStorage.setItem(table, JSON.stringify(current));

  Go.emit("storage", { action: "remove", table, key });
};

Storage.prototype.put = function (table, obj) {
  this.remove(table);
  this.set(table, obj);
};

Object.assign(GO, MOD_LUIGIOS_GOSTORAGEJS);

const Store = function (id) {
  this.id = id;
  this.data = {};
  this.subscribers = {};
};

const ParentStore = new Store("parent");

const StoreMiddleware = function (store) {
  if (ParentStore.get(store)) {
    return ParentStore.get(store);
  }

  return ParentStore.set(store, new Store(store));
};

const MOD_LUIGIOS_GOSTOREJS = {
  store: (id) => StoreMiddleware(id),
  Store: (id) => StoreMiddleware(id),
};

Store.prototype.get = function (key) {
  return Go.getProperty(this.data, key);
};

Store.prototype.set = function (key, value) {
  this.data[key] = value;
  this.notify(key);
  return this.data[key];
};

Store.prototype.subscribe = function (key, cb) {
  if (!this.subscribers[key]) {
    this.subscribers[key] = [];
  }

  this.subscribers[key].push(cb);
};

Store.prototype.notify = function (key) {
  if (this.subscribers[key]) {
    this.subscribers[key].forEach((cb) => cb(this.data[key]));
  }
};

Store.prototype.unsubscribe = function (key, cb) {
  if (this.subscribers[key]) {
    this.subscribers[key] = this.subscribers[key].filter((callback) => callback !== cb);
  }
};

Store.prototype.clear = function () {
  this.data = {};
  this.subscribers = {};
};

Object.assign(GO, MOD_LUIGIOS_GOSTOREJS);

const [GO_STRING, GO_STRING_PROTOTYPE] = [{}, {}];

const MOD_LUIGIOS_GOSTRINGJS = GO_STRING;

GO_STRING.capitalize = function (string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
};

GO_STRING.capital = function (string) {
  if (!string) return string;
  return string.charAt(0).toUpperCase() + string.slice(1);
};

GO_STRING.removeSpaces = function (string) {
  if (!string) return string;
  return string.replace(/\s/g, "");
};

GO_STRING.fastID = function () {
  // Generate a random ID that is very likely to be unique.
  const chr4 = () => Math.random().toString(16).slice(-4);
  return chr4() + chr4() + "-" + chr4() + "-" + chr4() + "-" + chr4() + "-" + chr4() + chr4() + chr4();
};

GO_STRING.uuid = function (pre = "", post = "") {
  let uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    const r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
  return pre + uuid + post;
};

GO_STRING.uid = function (pre = "", post = "") {
  let uid = crypto
    .getRandomValues(new Uint8Array(12)) // 96 bits
    .reduce((s, b) => s + b.toString(36).padStart(2, "0"), "");
  return pre + uid + post;
};

GO_STRING.fuid = function (pre = "", post = "") {
  let _i = 0;

  const fuid = function () {
    return Date.now().toString(36) + (_i++).toString(36);
  };

  return pre + fuid() + post;
};

GO_STRING.lowercase = function (string) {
  if (!string) return string;
  return string.toLowerCase();
};

GO_STRING.uppercase = function (string) {
  if (!string) return string;
  return string.toUpperCase();
};

GO_STRING.lower = function (string) {
  if (!string) return string;
  return GO_STRING.lowercase(string);
};

GO_STRING.upper = function (string) {
  if (!string) return string;
  return GO_STRING.uppercase(string);
};

GO_STRING.lowerFirst = function (string) {
  if (!string) return string;
  return string.charAt(0).toLowerCase() + string.slice(1);
};

GO_STRING.toCamelCase = function (string) {
  if (!string) return string;
  return string.replace(/-([a-z])/g, function (g) {
    return g[1].toUpperCase();
  });
};

GO_STRING.toDashCase = function (string) {
  if (!string) return string;
  return string.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
};

GO_STRING.toSnakeCase = function (string) {
  if (!string) return string;
  return string.replace(/([a-z])([A-Z])/g, "$1_$2").toLowerCase();
};

GO_STRING.replaceVars = function (string, data) {
  // replace all between {{ and }} with data
  const regex = /{{(.*?)}}/g;
  const matches = string.match(regex);
  if (matches) {
    matches.forEach((match) => {
      const key = match.replace("{{", "").replace("}}", "").trim();
      const regex2 = new RegExp(`{{${key}}}`, "g");
      string = string.replace(regex2, Go.getProperty(data, key));
    });
  }
  return string;
};

GO_STRING.cutString = function (string, length) {
  if (string && string.length > length) {
    return string.substring(0, length);
  }
  return string;
};

GO_STRING.getString = function (string, from, length) {
  if (string && string.length > length) {
    return string.substring(from, length);
  }
  return string;
};

GO_STRING.removeLastStringIf = function (string, remove) {
  if (string && string.endsWith(remove)) {
    return string.substring(0, string.length - remove.length);
  }
  return string;
};

GO_STRING.removeLastIf = function (string, remove) {
  return GO_STRING.removeLastStringIf(string, remove);
};

GO_STRING.removeFirstStringIf = function (string, remove) {
  if (string && string.startsWith(remove)) {
    return string.substring(remove.length);
  }
  return string;
};

GO_STRING.removeFirstIf = function (string, remove) {
  return GO_STRING.removeFirstStringIf(string, remove);
};

GO_STRING.removeLastString = function (string, length) {
  if (string && string.length > length) {
    return string.substring(0, string.length - length);
  }
  return string;
};

GO_STRING.hasExtension = function (string, extension) {
  if (arguments.length === 2) {
    if (!string) return false;
    return string.endsWith(extension);
  }

  // Check if string has extension
  if (arguments.length === 1) {
    if (!string) return false;
    return string.indexOf(".") != -1 ? string.split(".").pop() : false;
  }

  return false;
};

GO_STRING.normalizeString = function (string) {
  if (!string) return "";

  if (!Go.is(string, "string")) {
    return string;
  }

  let strToNormalize = string;
  strToNormalize = strToNormalize.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  strToNormalize = strToNormalize.toLocaleLowerCase();
  strToNormalize = strToNormalize.split(" ").join("");
  return strToNormalize;
};

GO_STRING.removeSpecialChars = function (string) {
  if (!Go.is(string, "string")) {
    return string;
  }
  return string.replace(/[^a-zA-Z0-9 ]/g, "");
};

GO_STRING.keyString = function (string) {
  return GO_STRING.removeSpecialChars(GO_STRING.normalizeString(string));
};

GO_STRING.keyId = function (string) {
  return GO_STRING.keyString(string);
};

GO_STRING.getChars = function (string, from, length) {
  return string.substring(from, from + length);
};

GO_STRING.shortEmail = function (email, char = 10) {
  if (!email) return "";
  let [name, domain] = email.split("@");
  if (name.length > char) {
    name = name.substr(0, char) + "...";
  }
  return name + "@" + domain;
};

GO_STRING.short_email = function (email, char = 10) {
  return GO_STRING.shortEmail(email, char);
};

GO_STRING.createTags = function (string, tagName = "span", options = {}) {
  if (!string) return string;
  const tags = string.split(" ");
  let [newString, tagIni, tagEnd] = ["", tagName, tagName];
  tags.forEach((tag) => {
    if (options.addClass) {
      tagIni = `${tagName} class="${options.addClass} ${Go.keyString(tag)}"`;
    }

    newString += `<${tagIni}>${tag}</${tagEnd}> `;
  });
  return newString;
};

GO_STRING.create_tags = function () {
  return GO_STRING.createTags(...arguments);
};

GO_STRING.randomColor = function () {
  return "#" + Math.floor(Math.random() * 16777215).toString(16);
};

GO_STRING.randomString = function (length) {
  var result = "";
  var characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

GO_STRING.splitFirst = function (string, separator) {
  const index = string.indexOf(separator);
  if (index == -1) return [string];
  return [string.substr(0, index), string.substr(index + 1)];
};

GO_STRING.minify = function (string) {
  if (!string) return string;
  return string.replace(/\s+/g, " ").trim();
};

GO_STRING.getBetween = function (from = "", to = "", data = "") {
  // Get all content between from and to <template><div>TEMPLATE TOP BAR</div></template><style>div {color: red;}</style>
  // Extrae todo el contenido entre <template> y </template>

  if (!from) return "";
  if (!to) return "";
  if (!data) return "";

  const indexFrom = data.indexOf(from);
  if (indexFrom == -1) return "";
  const indexTo = data.indexOf(to, indexFrom + from.length);
  if (indexTo == -1) return "";
  return data.substring(indexFrom + from.length, indexTo);
};

GO_STRING.quitDuplicateQuery = function (queryString) {
  // Divide la cadena de consulta en pares clave-valor
  const pares = new URLSearchParams(queryString);

  // Crea un objeto para almacenar el último valor de cada clave
  const ultimoValorPorClave = {};

  // Itera sobre todos los pares clave-valor
  for (const [clave, valor] of pares.entries()) {
    // Almacena el último valor para cada clave
    ultimoValorPorClave[clave] = valor;
  }

  // Crea una nueva cadena de consulta con los últimos valores
  const nuevaQueryString = new URLSearchParams(ultimoValorPorClave).toString();

  return nuevaQueryString;
};

GO_STRING.url_encode = function (string) {
  if (!string) return "";
  return encodeURIComponent(string);
};

GO_STRING.replaceLast = function (string, from, to) {
  if (!string) return "";
  const index = string.lastIndexOf(from);
  if (index == -1) return string;
  return string.substring(0, index) + to + string.substring(index + from.length);
};

GO_STRING.escapeHTML = function (string) {
  if (!string) return "";
  return string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
};

GO_STRING.truncateHTML = (html, limit) => {
  const doc = new DOMParser().parseFromString(html, "text/html");
  let text = "";
  let truncatedHTML = "";

  function traverse(node) {
    if (text.length >= limit) return;

    if (node.nodeType === Node.TEXT_NODE) {
      let remaining = limit - text.length;
      truncatedHTML += node.nodeValue.slice(0, remaining);
      text += node.nodeValue.slice(0, remaining);
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      let tag = `<${node.nodeName.toLowerCase()}`;
      for (let attr of node.attributes) {
        tag += ` ${attr.name}="${attr.value}"`;
      }
      tag += ">";

      let tempHTML = truncatedHTML + tag;
      traverseChildren(node);

      if (text.length < limit) {
        truncatedHTML = tempHTML + truncatedHTML + `</${node.nodeName.toLowerCase()}>`;
      }
    }
  }

  function traverseChildren(node) {
    for (let child of node.childNodes) {
      traverse(child);
    }
  }

  traverse(doc.body);
  return truncatedHTML;
};

GO_STRING.string = function (string) {
  class MY_STRING {
    constructor(string) {
      this.string = string;
    }
  }

  MY_STRING.prototype.replace = function (search, replace) {
    if (!["string"].includes(typeof this.string)) {
      return this.string;
    }

    if (Array.isArray(search) && Array.isArray(replace)) {
      for (let i = 0; i < search.length; i++) {
        this.string = this.string.replaceAll(search[i], replace[i]);
      }
      return this.string;
    }

    return this.string.replaceAll(search, replace);
  };

  MY_STRING.prototype.trim = function () {
    return this.string.trim();
  };

  MY_STRING.prototype.length = function () {
    return this.string.length;
  };

  MY_STRING.prototype.getBetween = function (from = "", to = "") {
    return GO_STRING.getBetween(from, to, this.string);
  };

  Object.assign(MY_STRING.prototype, GO_STRING_PROTOTYPE);

  return new MY_STRING(string);
};

GO_STRING_PROTOTYPE.getInitials = function (num = 2) {
  if (!this.string) return "";
  const words = this.string.split(" ");
  const initials = words
    .map((word) => word[0])
    .join("")
    .toUpperCase();
  return initials.slice(0, num);
};

GO_STRING_PROTOTYPE.ellipsis = function (chars = 10, symbol = "...") {
  if (!this.string) return "";

  if (this.string.length <= chars) {
    return this.string;
  }

  return this.string.slice(0, chars) + symbol;
};

GO_STRING_PROTOTYPE.removeTags = function () {
  const temp = document.createElement("div");
  temp.innerHTML = this.string;
  let string = temp.innerText;

  if (!string) return "";

  string = string.replace(/<[^>]*>/g, "");

  return string;
};

GO_STRING_PROTOTYPE.lastWord = function () {
  if (!this.string) return "";
  const words = this.string.split(" ");
  return words[words.length - 1];
};

GO_STRING_PROTOTYPE.stripHTML = function () {
  return GO_STRING.stripHTML(this.string);
};

GO_STRING_PROTOTYPE.parseModule = function () {
  if (!this.string) return "";
  return new Promise((resolve, reject) => {
    const blob = new Blob([this.string], { type: "text/javascript" });
    const url = URL.createObjectURL(blob);
    import(url).then((module) => {
      URL.revokeObjectURL(url);
      resolve(module.default);
    });
  });
};

GO_STRING_PROTOTYPE.split = function (separator, at) {
  if (!this.string) return [];

  if (Array.isArray(separator)) {
    let str = this.string;
    separator.forEach((sep) => {
      str = str.split(sep).join(separator[0]);
    });
    return str.split(separator[0]);
  }

  if (arguments.length === 1) {
    return this.string.split(separator);
  }

  return this.string.split(separator)[at];
};

GO_STRING_PROTOTYPE.shortMiddle = function (num = 10) {
  if (!this.string) return "";

  if (this.string.length <= num) {
    return this.string;
  }

  const mitad = Math.floor(num / 2);
  const extra = num % 2;

  const inicio = this.string.slice(0, mitad + extra);
  const final = this.string.slice(-mitad);

  return `${inicio}${final}`;
};

GO_STRING_PROTOTYPE.editorFormat = function () {
  if (!this.string) return "";

  this.string = this.string
    .replace(/<div>/g, "\n")
    .replace(/<\/div>/g, "")
    .replace(/<br\s*\/?>/g, "\n");

  this.string = this.string.replace(/<[^>]+>/g, "");

  return this.string;
};

GO_STRING_PROTOTYPE.safeHTML = function () {
  if (!this.string) return "";

  this.string = this.string.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  this.string = this.string.replace(/\r\n|\n/g, "<br>");

  return this.string;
};

GO_STRING_PROTOTYPE.splitLast = function (separator) {
  if (!this.string) return [];
  const array = this.string.split(separator);
  return array[array.length - 1];
};

GO_STRING_PROTOTYPE.removeExtension = function () {
  if (!this.string) return "";
  return this.string.split(".").slice(0, -1).join(".");
};

GO_STRING_PROTOTYPE.shortPreview = function (limit = 100) {
  if (!this.string) return "";
  this.result = GO_STRING.stripHTML(this.string);
  if (this.result.length > limit) {
    this.result = this.result.slice(0, limit) + "...";
  }
  return this.result;
};

GO_STRING_PROTOTYPE.decode = function () {
  if (!this.string) return "";

  try {
    return decodeURIComponent(this.string);
  } catch (error) {
    //...
  }

  try {
    return decodeURI(this.string);
  } catch (error) {
    //...
  }

  return this.string;
};

GO_STRING_PROTOTYPE.encode = function () {
  if (!this.string) return "";

  try {
    return encodeURIComponent(this.string);
  } catch (error) {
    //...
  }

  try {
    return encodeURI(this.string);
  } catch (error) {
    //...
  }

  return this.string;
};

GO_STRING_PROTOTYPE.createTags = function (tagName = "span", options = {}) {
  return GO_STRING.createTags(this.string, tagName, options);
};

GO_STRING.base64Encode = function (string) {
  if (!string) return "";
  return btoa(string);
};

GO_STRING.base64Decode = function (string) {
  if (!string) return "";
  return atob(string);
};

GO_STRING.toBase64 = function (string) {
  if (!string) return "";
  return Buffer.from(string).toString("base64");
};

GO_STRING.fromBase64 = function (string) {
  if (!string) return "";
  return Buffer.from(string, "base64").toString("utf-8");
};

GO_STRING.match = function (string, regex) {
  if (!string) return null;
  const match = string.match(regex);
  if (!match) return null;
  return match;
};

GO_STRING.stripHTML = (html) => {
  return html
    .replace(/&nbsp;/g, " ")
    .replace(/\n/g, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&lt;[^&]*?&gt;/g, "")
    .trim();
};

GO_STRING.startsWith = function (string, startsWith) {
  if (!string || !startsWith) return false;
  if (!Go.is(string, "string")) return false;
  return string.startsWith(startsWith);
};

GO_STRING.urlBase64ToUint8Array = (base64String) => {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/\-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return new Uint8Array([...raw].map((c) => c.charCodeAt(0)));
};

GO_STRING.trim = function (string) {
  if (!string) return string;
  if (!["string"].includes(typeof string)) return string;
  return string.trim();
};

GO_STRING.split = function (string, separator) {
  if (!string) return [];

  const index = string.indexOf(separator);

  if (index !== -1) {
    return [
      string.slice(0, index), // antes del separador
      string.slice(index, index + separator.length), // el separador
      string.slice(index + separator.length), // después del separador
    ].filter(Boolean);
  }

  return [string];
};

GO_STRING.camelToKebab = (str = "") => {
  return str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2") // inserta guión antes de mayúsculas
    .toLowerCase();
};

GO_STRING.replace = (str = "", match = "", repl = "") => {
  return str ? str.replaceAll(match, repl) : "";
};

GO_STRING.hashString = async function (str) {
  const encoder = new TextEncoder();
  const data = encoder.encode(str);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
};

Object.assign(GO, MOD_LUIGIOS_GOSTRINGJS);

const GO_STYLE = {};

const MOD_LUIGIOS_GOSTYLEJS = GO_STYLE;

GO_STYLE.getComputedStyle = function (element, property) {
  if (!element) return "";
  if (!property) return "";

  if (Go.is(element, "String")) {
    element = document.querySelector(element);
  }

  if (!element) return "";

  return window.getComputedStyle(element, null).getPropertyValue(property);
};

GO_STYLE.getComputedStyles = function (element, properties) {
  if (!element) return {};
  if (!properties) return {};

  if (Go.is(element, "String")) {
    element = document.querySelector(element);
  }

  if (!element) return {};

  const styles = {};

  properties.forEach((property) => {
    styles[property] = window.getComputedStyle(element, null).getPropertyValue(property);
  });

  return styles;
};

GO_STYLE.setCssVariable = function (element, property, value) {
  if (!element) return;
  if (!property) return;
  if (!value) return;

  if (Go.is(element, "String")) {
    element = document.querySelector(element);
  }

  if (!element) return;

  element.style.setProperty(property, value);
};

GO_STYLE.setStyle = function (element, property, value) {
  if (!element) return;
  if (!property) return;
  if (!value) return;

  if (Go.is(element, "String")) {
    element = document.querySelector(element);
  }

  if (!element) return;

  element.style[property] = value;
};

GO_STYLE.cssTag = function (id, css) {
  if (typeof id === "object") {
    [id, css] = [id.id, id.css];
  }

  if (!id) return;
  if (!css) return;

  let style = document.getElementById(id);

  if (!style) {
    style = document.createElement("style");
    style.id = id;
    document.head.appendChild(style);
  }

  style.innerHTML = css;
};

GO_STYLE.serializeStyle = function (style = {}) {
  if (!style) return "";

  let css = "";

  Object.keys(style).forEach((key) => {
    css += `${Go.camelToKebab(key)}:${style[key]};`;
  });

  return css;
};

GO_STYLE.style = function (element, style = {}) {
  if (!element) return;

  if (!Go.isElement(element) && Go.is(element, "object")) {
    style = element.style || element.css;
    element = element.target || element.el;
  }

  if (!style) return;

  if (Go.is(element, "string")) {
    element = document.querySelector(element);
  }

  if (!element) return;

  if (Go.is(style, "string")) {
    element.setAttribute("style", style);
    return;
  }

  // Set style each property
  Object.keys(style).forEach((key) => {
    if (key.startsWith("--")) {
      element.style.setProperty(key, style[key]);
    } else {
      element.style[key] = style[key];
    }
  });
};

GO_STYLE.domStyle = function (selector, style = {}) {
  if (!selector) return;

  if (!style) return;

  if (Go.is(style, "object")) {
    style = GO_STYLE.serializeStyle(style);
  }

  let elStyle = document.querySelector(`#style-${Go.keyId(selector)}`);

  if (!elStyle) {
    elStyle = document.createElement("style");
    elStyle.id = `style-${Go.keyId(selector)}`;
    document.head.appendChild(elStyle);
  }

  elStyle.innerHTML = `${selector}{${style}}`;
};

GO_STYLE.cssVars = function (el, vars = {}) {
  if (!Go.is(el, "HTMLElement")) {
    el = document.querySelector(el);
  }

  if (!el) return;

  if (typeof vars.if === "boolean" && !vars.if) {
    return;
  }

  if (typeof vars.if === "function" && !vars.if()) {
    return;
  }

  Object.keys(vars).forEach((varName) => {
    el.style.setProperty(varName, vars[varName]);
  });
};

GO_STYLE.setCssVars = function () {
  return GO_STYLE.cssVars(...arguments);
};

GO_STYLE.getDomStylesProps = function () {
  const style = document.createElement("div").style;
  return Object.getOwnPropertyNames(style)
    .filter((p) => isNaN(p))
    .map((p) => p.replace(/[A-Z]/g, (m) => "-" + m.toLowerCase()))
    .filter((p) => !p.startsWith("webkit-")) // opcional
    .sort();
};

Object.assign(GO, MOD_LUIGIOS_GOSTYLEJS);

const GO_MODULE = function (data = {}, rows) {
  this.data = data;
  this.uuid = Go.uuid();
  this.class ||= this.data.class || "";
  this.rows = Array.isArray(this.data) ? this.data : Array.isArray(rows) ? rows : this.data.rows || [];
  this.attrs = data.attrs || {};
  this.titles = data.titles || [];
};

const MOD_LUIGIOS_GOTABLEJS = {
  table: function () {
    return new GO_MODULE(...arguments);
  },
};

GO_MODULE.prototype.toString = function () {
  return this.template();
};

GO_MODULE.prototype.template = function (template = "") {
  template += `<table class="go-table ${this.class}" ${this.attrs.table || ""}>`;

  if (this.titles.length) {
    template += `<tr ${this.attrs.tr || ``}>`;
    Go.for(this.titles, (title, i) => {
      template += `<th ${this.attrs[`th${i}`] || ``}>${title}</th>`;
    });
    template += `</tr>`;
  }

  Go.for(this.rows, (row, i) => {
    template += `<tr ${this.attrs.tr || ``} ${this.attrs[`tr${i}`] || ``}>`;
    Go.for(row, (col, i) => {
      template += `<td ${this.attrs[`td${i}`] || ``}>${col}</td>`;
    });
    template += `</tr>`;
  });

  template += `</table>`;
  return template;
};

Object.assign(GO, MOD_LUIGIOS_GOTABLEJS);

const GO_TABS = function (data = {}) {
  this.data = data;
  this.id = this.data.id;
  this.uuid = Go.uuid();
  this.class = this.data.class || "";
};

const MOD_LUIGIOS_GOTABSJS = { tabs: (conf) => new GO_TABS(conf) };

GO_TABS.prototype.tab = function () {
  const tab = this.data;
  const bodys = document.querySelectorAll(`[tabs="${tab.id}"] .tabBody`);
  bodys.forEach((body) => {
    if (Number(Go.attr(body, "tab")) === Number(tab.index)) {
      Go.uniqueClass("on", `[tab-button="${tab.index}${tab.id}"]`, `[tabs="${tab.id}"] .buttons`);
      Go.uniqueClass("on", body, `[tabs="${tab.id}"] .bodys`);
    }
  });
};

GO_TABS.prototype.template = function () {
  this.current = Go.findObjectIndex(this.data.tabs, "active", true);

  this.template = `<div current="${this.current || 0}" class="g-tabs tabs-${this.uuid} ${this.class}" role="tablist">`;
  this.template += `<ul class="buttons">`;

  Go.for(this.data.tabs, (tab, index) => {
    this.template += this.handler(tab, index);
  });

  this.template += `</ul>`;

  this.template += `<ul class="bodys">`;
  this.template += `<div class="bodysTopLine"></div>`;

  Go.for(this.data.tabs, (tab, index) => {
    this.template += this.tabBody(tab, index);
  });

  this.template += `</ul>`;

  this.template += `<div class="paintPath"></div>`;
  this.template += `</div>`;

  return this.template;
};

GO_TABS.prototype.handler = function (tab, index) {
  let [_class] = [""];

  tab.id ||= `tab${this.uuid}${index}`;
  tab.active && (_class += " tab-active");

  this.ttab = `<li class="tab-handler ${_class}" handler="${index}">
    <input type="radio" name="tabs${this.uuid}" id="tab${index}${tab.id}" onchange="Go.do('tab/${this.uuid}', ${index}, event)" />
    <label for="tab${index}${tab.id}" role="tab" aria-selected="false" aria-controls="panel${index}${tab.id}" tabindex="${index}">${tab.title}</label>
  </li>`;

  return this.ttab;
};

GO_TABS.prototype.tabBody = function (tab, index) {
  let [_class] = [""];

  tab.id ||= `tab${this.uuid}${index}`;
  tab.active && (_class += " tab-active");

  this.ttab = `<li class="tab-body ${_class} body-${tab.id}" body="${index}">
    <div id="tab-content${index}${tab.id}" class="tab-content" role="tabpanel" aria-labelledby="specification" aria-hidden="true">
      <div>${tab.content || ""}</div>
    </div>
  </li>`;

  Go.set(`tab`, tab)[this.uuid] = function (tab, element) {
    if (element.target.checked) {
      Go.uniqueClass("tab-active", `[handler="${tab}"], [body="${tab}"]`, `.tabs-${this.uuid}`);
      Go.attrs(`.tabs-${this.uuid}`, { current: tab });
    }
  }.bind(this);

  return this.ttab;
};

Object.assign(GO, MOD_LUIGIOS_GOTABSJS);

const GO_TEMPLATES = {};

const GO_TEMPLATE = function (data = {}) {
  this.data = data;
  this.src = typeof data === "string" ? data : data.src;
};

const MOD_LUIGIOS_GOTEMPLATEJS = {
  template: function () {
    return new GO_TEMPLATE(...arguments);
  },
};

Object.assign(GO, MOD_LUIGIOS_GOTEMPLATEJS);

const GO_TOAST = function (data = {}) {
  this.data = data || {};
  this.view = null;
  this.timeout = null;
  this.duration = this.data.duration || Go.config("toastDuration") || 10000;
  this.show();
};

const MOD_LUIGIOS_GOTOASTJS = {
  toast: function () {
    return new GO_TOAST(...arguments);
  },
};

GO_TOAST.prototype.show = function () {
  if (Go.is(this.data, "string")) {
    this.data = { message: this.data };
  }

  this.data.icon ||= Go.config("toastIcon") || Go.config("appIcon");
  this.data.animation ||= Go.config("toastAnimation") || "midTopIn";
  this.data.position = `${this.data.position || "left-bottom"}`;

  this.data.class = `${this.data.class || ""} toast ${this.data.position}`;
  this.data.html = `<div class="toastContent">`;

  if (Go.icon(this.data.icon)) {
    this.data.html += `<div class="toastIcon" style="font-size:44px;"><go-icon name="${this.data.icon}"></go-icon></div>`;
  } else if (this.data.icon) {
    this.data.html += `<div class="toastIcon"><div img style="--size:44px;--img:url('${this.data.icon}');"></div></div>`;
  }

  this.data.html += `<div class="toastMessage">${this.data.message}</div>`;
  this.data.html += `</div>`;
  this.data.header = false;
  this.data.lockBody = false;
  this.data.onview = false;
  this.data.closeOnClick = true;

  this.data.onOpen = async function (view) {
    this.content = await Go.awaitElement(".toastContent", view);

    if (!this.data.keepOpen) {
      this.timeout = setTimeout(this.close.bind(this), this.duration);
    }
  }.bind(this);

  this.view = Go.view(this.data);
};

GO_TOAST.prototype.close = function () {
  if (Go.is(this.view.close, "function")) {
    return this.view.close();
  }
};

Object.assign(GO, MOD_LUIGIOS_GOTOASTJS);

const GO_URL = function (url, ...concat) {
  this.url = url || window.location.href;
  this.parts = [];
  this.concat = concat.join("/");
  this.url = Go.if({
    cond: () => this.concat,
    true: () => Go.fix(`${this.url}/${this.concat}`).url(),
    else: () => this.url,
  });
};

const MOD_LUIGIOS_GOURLJS = {
  url: function () {
    return new GO_URL(...arguments);
  },
  base: function (url = "", ...concat) {
    const [confBase, oUrl] = [Go.config("base"), url];

    if (confBase) return confBase;

    concat = concat.join("/");

    if (url) return Go.fix(Go.url(url).getHost() + "/" + concat).url();

    const base = document.querySelector("base");

    if (base) url = base.href;

    if (concat) url += concat;

    if (oUrl === false) return Go.url(url).removeHost();

    return Go.fix(url).url();
  },
  href: function (url, __blank) {
    if (!url) return;

    if (!__blank) {
      location.href = url;
      return;
    }

    window.open(url, __blank ? "_blank" : "_self");
  },
};

GO_URL.prototype.toString = function () {
  return this.url;
};

GO_URL.prototype.query = function (name, value) {
  if (!this.url) return this.url;

  if (value) {
    const parsedUrl = new URL(this.url);
    parsedUrl.searchParams.set(name, value);
    this.url = parsedUrl.toString();
    return this.url;
  }

  const parsedUrl = new URL(this.url);
  const query = parsedUrl.searchParams.get(name);
  return query;
};

GO_URL.prototype.addQuery = function (name, value) {
  if (!this.url) return this.url;

  if (["object"].includes(typeof name)) {
    Object.entries(name).forEach(([k, v]) => this.addQuery(k, v));
    return this.url;
  }

  try {
    const parsedUrl = new URL(this.url);
    parsedUrl.searchParams.set(name, value);
    this.url = parsedUrl.toString();
    return this.url;
  } catch (error) {
    // ...
  }

  if (this.url.includes("?")) {
    this.url += "&" + name + "=" + value;
  } else {
    this.url += "?" + name + "=" + value;
  }

  return this.url;
};

GO_URL.prototype.removeHost = function () {
  if (!this.url) return this.url;
  const parsedUrl = new URL(this.url);
  const path = parsedUrl.pathname;
  return path;
};

GO_URL.prototype.removeBase = function () {
  if (!this.url) return this.url;
  return this.url.split(Go.base())[1];
};

GO_URL.prototype.param = function (num = 0) {
  if (this.url.startsWith("/")) {
    this.url = this.url.substring(1);
  }

  if (this.url.includes("://")) {
    this.url = this.url.split("://")[1];
  }

  this.parts = this.url.split("/");

  this.result = this.parts[num];

  if (!this.result) {
    for (let i = 0; i < this.parts.length; i++) {
      if (Go.eq(this.parts[i], num)) {
        this.result = this.parts[i + 1];
      }
    }
  }

  this.result = this.result ? decodeURIComponent(this.result) : this.result;

  if (this.result && this.result.includes("?")) {
    this.result = this.result.split("?")[0];
  }

  return this.result;
};

GO_URL.prototype.segment = function () {
  return this.param(...arguments);
};

GO_URL.prototype.params = function () {
  if (this.url.startsWith("/")) {
    this.url = this.url.substring(1);
  }

  if (this.url.includes("://")) {
    this.url = this.url.split("://")[1];
  }

  this.parts = this.url.split("/");

  return this.parts;
};

GO_URL.prototype.file = function () {
  if (this.url.startsWith("/")) {
    this.url = this.url.substring(1);
  }

  this.parts = this.url.split("/");

  return this.parts[this.parts.length - 1];
};

GO_URL.prototype.addPort = function (port) {
  if (!this.url) {
    return this.url;
  }

  let [[protocolo, dominio], rest] = [this.url.split("://"), ""];

  if (!dominio) {
    dominio = this.url;
    protocolo = location.protocol;
  }

  if (dominio.includes(":")) {
    dominio = dominio.split(":")[0];
  }

  dominio.split("/").map((part, index) => {
    if (index) rest += `/${part}`;
  });

  dominio = dominio.split("/")[0];

  if (protocolo.includes(":")) {
    protocolo = protocolo.split(":")[0];
  }

  this.url = `${protocolo}://${dominio}:${port}${rest}`;

  return this.url;
};

GO_URL.prototype.getHost = function () {
  if (!this.url) return this.url;

  try {
    const parsedUrl = new URL(this.url);
    const host = `${parsedUrl.protocol}//${parsedUrl.host}`;
    return host;
  } catch (error) {
    //...
  }

  const url = this.url;
  const regex = /^(https?:\/\/[^\/]+)/;
  const match = url.match(regex);

  if (match) return match[1];
};

GO_URL.prototype.getProtocol = function () {
  if (!this.url) return this.url;
  const parsedUrl = new URL(this.url);
  return parsedUrl.protocol;
};

GO_URL.prototype.fix = function (internal = true) {
  // Capturar el protocolo original
  const originalProtocol = this.url.startsWith("https://") ? "https://" : "http://";

  // Asegurarse de que la URL comience con http:// o https://
  if (internal && !/^https?:\/\//i.test(this.url)) {
    this.url = location.protocol + "//" + this.url;
  }

  // Crear un objeto URL para manipulación más fácil
  let urlObject = new URL(this.url);

  // Limpiar el pathname eliminando múltiples barras diagonales consecutivas
  urlObject.pathname = urlObject.pathname.replace(/\/+/g, "/");

  // Codificar correctamente los caracteres en el pathname
  urlObject.pathname = encodeURI(decodeURI(urlObject.pathname));

  // Reconstruir la URL a partir del objeto URL limpio
  let cleanedURL = urlObject.toString();

  // Asegurarse de que la URL resultante tenga el mismo protocolo que el original
  if (internal && originalProtocol === "https://") {
    cleanedURL = cleanedURL.replace(/^http:\/\//, "https://");
  }

  return cleanedURL;
};

GO_URL.prototype.isAbsolute = function () {
  return this.url.startsWith("http://") || this.url.startsWith("https://") || this.url.startsWith("/");
};

GO_URL.prototype.absolute = function () {
  if (this.isAbsolute()) return this.url;
  return Go.base("", this.url);
};

GO_URL.prototype.fixProtocol = function (protocol = location.protocol) {
  if (!this.url.startsWith("http://") && !this.url.startsWith("https://") && !this.url.startsWith("/")) {
    this.url = Go.url(protocol + "//" + this.url).fix(false);
  }

  this.url = Go.url(this.url).fix(false);

  return this.url;
};

GO_URL.prototype.parseArguments = function () {
  let [myPath, myParts] = [this.url, []];

  if (myPath.includes("//")) {
    myPath = myPath.split("//")[1];
    myPath = myPath.split("/").slice(1).join("/");
  }

  myParts = myPath.split("/").filter(Boolean);

  if (myParts[0] && (myParts[0].includes(".") || myParts[0] === "localhost")) {
    myParts = myParts.slice(1);
  }

  return myParts.reduce((acc, val, i, src) => {
    if (i % 2 === 0) acc[val] = src[i + 1];
    return acc;
  }, {});
};

GO_URL.prototype.removeLastPath = function () {
  if (!this.url) return this.url;
  return this.url.split("/").slice(0, -1).join("/");
};

GO_URL.prototype.href = function (url) {
  if (!url) return this.url;
  this.url = url;
  return this.url;
};

GO_URL.prototype.getHash = function () {
  if (!this.url) return this.url;
  const parsedUrl = new URL(this.url);
  return Go.removeFirstIf(parsedUrl.hash, "#");
};

GO_URL.prototype.path = function () {
  if (!this.url) return this.url;
  const parsedUrl = new URL(this.url);
  return Go.removeFirstIf(parsedUrl.pathname, "/");
};

Object.assign(GO, MOD_LUIGIOS_GOURLJS);

const GO_USER = function (ssid, key, cb) {
  this.ssid = ssid;
  this.key = key;
  this.cb = cb;
};

const MOD_LUIGIOS_GOUSERJS = {
  user: function () {
    if (arguments.length === 1 && ["object"].includes(typeof arguments[0])) {
      return new GO_USER(...arguments).userRequest();
    }

    if (arguments.length <= 1) {
      return new GO_USER(undefined, arguments[0]).get();
    }

    return new GO_USER(...arguments).get();
  },
};

GO_USER.prototype.userRequest = function () {
  this.data = Go.session.user(Go.getProp(this.ssid, "ssid"));

  if (!this.data) return;

  this.userInstance = new GO_USER_PROTOTYPE(this.data);
  this.prop = Go.getProp(this.ssid, ["get", "prop"]);
  this.roles = Go.getProp(this.data, "roles", []);
  this.result = Go.getProp(this.userInstance, this.prop);

  if (["function"].includes(typeof this.result)) {
    return this.result(...Go.getProp(this.ssid, "args", []));
  }

  this.result = Go.getProp(this.data, this.prop);

  return this.result;
};

GO_USER.prototype.get = function () {
  if (this.ssid && this.key && Go.is(this.ssid, "jwt")) {
    return Go.session.set(this.ssid, this.key, this.cb);
  }

  this.data = Go.session.user(this.ssid);

  if (this.key) {
    return Go.getProperty(this.data, this.key) || "";
  }

  if (!this.data) return;

  return new GO_USER_PROTOTYPE(this.data);
};

const GO_USER_PROTOTYPE = function (data = {}) {
  Object.assign(this, data);
};

GO_USER_PROTOTYPE.prototype.hasRole = function (role) {
  return this.roles.includes(role);
};

GO_USER_PROTOTYPE.prototype.hasSomeRole = function (...roles) {
  return roles.some((role) => this.roles.includes(role));
};

GO_USER_PROTOTYPE.prototype.hasAllRoles = function (...roles) {
  return roles.every((role) => this.roles.includes(role));
};

GO_USER_PROTOTYPE.prototype.hasAnyRole = function (...roles) {
  return roles.some((role) => this.roles.includes(role));
};

GO_USER_PROTOTYPE.prototype.hasPermission = function (permission) {
  return this.permissions.includes(permission);
};

GO_USER_PROTOTYPE.prototype.hasSomePermission = function (...permissions) {
  return permissions.some((permission) => this.permissions.includes(permission));
};

GO_USER_PROTOTYPE.prototype.hasAllPermissions = function (...permissions) {
  return permissions.every((permission) => this.permissions.includes(permission));
};

GO_USER_PROTOTYPE.prototype.hasAnyPermission = function (...permissions) {
  return permissions.some((permission) => this.permissions.includes(permission));
};

Object.assign(GO, MOD_LUIGIOS_GOUSERJS);

window.views ||= {};
const GO_VIEW_AUX_PROTOTYPE = {};

function GO_VIEW(options = {}) {
  this.view = null;
  this.bodyOptions = Go.cloneObject(options.body || {});
  Object.assign(this, options);
  this.beforeViewOpen(options);
}

const MOD_LUIGIOS_GOVIEWJS = {
  view: (options) => new GO_VIEW(options),
  modal: (options) => new GO_VIEW(options),
  onview: () => GO_VIEW_AUX_PROTOTYPE.onview(),
  closeAllViews: (cb = {}) => GO_VIEW_AUX_PROTOTYPE.closeAllViews(cb),
  viewIndexSelector: () => GO_VIEW_AUX_PROTOTYPE.viewIndexSelector(),
  closeView: function () {
    Go.close(...arguments);
  },
};

const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    // Elementos agregados
    mutation.addedNodes.forEach((node) => {
      Go.onview(Go.getProp(node, "target"));
    });

    // Elementos eliminados
    mutation.removedNodes.forEach((node) => {
      Go.onview(Go.getProp(node, "target"));
    });
  });
});

observer.observe(document.body, {
  childList: true, // Detecta hijos agregados/eliminados
  subtree: true, // Incluye todo el árbol dentro de body
});

GO_VIEW_AUX_PROTOTYPE.onview = function (target, countSelector = "") {
  target ||= document.body;
  countSelector = `.View.view:not([onview="false"]):not(.lock-false)`;
  countSelector += `:not(.lock-0):not(.keepOnBackground)`;
  const numViewsOnTarget = Go.el(target).count(countSelector);
  Go.attrs(target, {
    "num-views": numViewsOnTarget,
    "block-view": !!numViewsOnTarget,
  });
};

GO_VIEW_AUX_PROTOTYPE.viewIndexSelector = function () {
  let selector = `go-view:not(.keepOnTop)`;
  return selector;
};

GO_VIEW_AUX_PROTOTYPE.closeAllViews = function (cb = {}) {
  const views = document.querySelectorAll("go-view, .element");

  views.forEach((view) => {
    let toClose = true;

    if (cb.exept && view.classList.contains(cb.exept)) {
      toClose = false;
    }

    if (toClose) {
      Go.close(view);
    }
  });

  if (["function"].includes(typeof cb)) {
    cb();
  } else if (["function"].includes(typeof cb.cb)) {
    cb.cb();
  }
};

GO_VIEW.prototype.beforeViewOpen = async function (options = {}) {
  this.canOpen = true;
  this.configData = Go.config("view") || {};
  this.data = Object.assign({ bodyOptions: this.bodyOptions }, this.configData, options);
  this.data.keepOnBackground ||= this.data.keepOnBack;
  this.viewClass = "opening";
  this.class = Go.getProp(this, "data.class", "");
  this.id = Go.getProp(this, "data.id", Go.uuid());

  if (Go.is(this.data.if, "set")) {
    this.canOpen = this.data.if;
  }

  if (["function"].includes(typeof this.canOpen)) {
    this.canOpen = await this.canOpen();
  }

  if (!this.canOpen || Go.eq(Go.trim(this.canOpen), " ")) {
    return this.data.else ? (typeof this.data.else == "function" ? this.data.else() : this.data.else) : null;
  }

  if (options.srcElement) {
    this.data = options.srcElement.dataset;
  }

  if (this.data.keepOnBackground) {
    this.classSelector = Go.createSelector(this.class);
    this.alreadyOpened = Go.el(`#view-${this.id}`) || Go.el(this.classSelector);
    this.viewClass += " keepOnBackground";
  }

  Object.assign(GO_VIEW.prototype, this.data.prototype || {});

  this._onInit();

  if (this.alreadyOpened) {
    return this.alreadyOpened.restoreView(options);
  }

  return this.open();
};

GO_VIEW.prototype.open = async function () {
  if (this.data.vibrate) {
    Go.device.vibrate(Number(this.data.vibrate));
  }

  if (Go.is(this.data.closeOthersViews, "true")) {
    Go.closeAllViews();
  }

  if (this.data.delay) {
    await Go.delay(this.data.delay);
  }

  this.view = Go.or(
    () => document.querySelector(`#view-${this.id}`),
    () => document.querySelector(Go.createSelector(Go.getProp(this.data, "class", "fakeViewClass")))
  );

  if (this.data.replace) {
    await Go.if({
      cond: () => ["function"].includes(typeof Go.getProp(this.view, "close")),
      true: () => Go.trigger(this.view, "close"),
      else: () => Go.trigger(this.view, "remove"),
    });
  }

  if (this.data.unique && this.view) {
    return;
  }

  this.data.animation ||= "fadeIn";
  this.data.animationDuration ||= Go.config("animationDuration") || 200;

  if (this.data.keepOnTop) {
    this.viewClass += " keepOnTop";
    this.data.index = 1000 + this.countViews();
  }

  this.target = this.data.target || document.body;

  this.lastElement = document.querySelector(Go.viewIndexSelector() + ":last-child");

  if (this.lastElement && Go.isElement(this.lastElement)) {
    this.lastViewIndex = Number(Go.attr(this.lastElement, "index"));
  }

  this.index = this.data.index || this.lastViewIndex || this.countViews();

  this.closes = Go.state("closeOnRoute", Go.state("closeOnRoute") || []);

  this.isBlockScreen = Go.if({
    cond: () => !Go.is(Go.getProp(this.data, ["lockBody", "onview", "isBlockScreen"]), "false"),
    true: () => true,
    else: () => false,
  });

  this.view = Go.create({
    if: () => this.canOpen,
    tag: "go-view",
    data: this.data,
    instance: this,
    class: `View ${this.class} view ${this.viewClass} lock-${this.isBlockScreen}`,
    isBlockScreen: this.isBlockScreen,
    replace: this.data.replace,
    style: {
      zIndex: 100 + Number(this.index) + 1,
    },
    attrs: {
      id: `view-${this.id}`,
      index: this.index + 1,
      animation: this.data.animation,
      onview: this.isBlockScreen,
    },
    parent: this.data.parent,
    target: this.target,
    mode: "append",
    oncreate: () => {
      this.provisioningTarget();
    },
    onrender: () => {
      this._onOpen();
      this.data.gestures && Go.gestures(this.view).on(this.data.gestures);
      Go.onview(this.target);
    },
  });

  if (this.data.closeOnRoute) {
    this.closes.push(this.view);
  }
};

GO_VIEW.prototype.close = async function (cb) {
  try {
    const view = this.view || (await Go.awaitElement(`#view-${this.id}`)) || {};

    if (["function"].includes(typeof view.close)) {
      view.close(cb);
    }

    if (!this.data.keepOnBackground) {
      Go.sleep(this.data.animationDuration + 100).then(() => {
        Go.remove(`#view-${this.id}`);
      });
    }
  } catch (error) {
    // ...
  }
};

GO_VIEW.prototype._closing = function () {
  const closing = Go.getProp(this, ["closing", "data.closing", "onclosing", "onClosing", "data.onClosing", "data.onclosing"]);
  Go.switch({
    case: typeof closing,
    string: () => Go.eval(closing, this.view),
    function: () => closing.call(this, this.view),
  });
};

GO_VIEW.prototype.closed = function () {
  Go.onview(this.target);
};

GO_VIEW.prototype.countViews = function () {
  return Go.countElements(Go.viewIndexSelector());
};

GO_VIEW.prototype.getNewIndex = function () {
  return 100 + this.countViews() + 1;
};

GO_VIEW.prototype.provisioningTarget = function () {
  if (Go.is(this.data.targetClean, "selector")) {
    const target = document.querySelector(this.target);
    [].forEach.call(target.querySelectorAll(this.data.targetClean), (el) => {
      el.remove();
    });
  } else if (this.data.targetClean) {
    Go.clean(this.target);
  }
};

GO_VIEW.prototype._onInit = async function () {
  const onInit = this.oninit || this.onInit || this.data.onInit || this.data.oninit;
  if (["function"].includes(typeof onInit)) {
    onInit.call(this, this.view);
  } else if (["string"].includes(typeof onInit)) {
    Go.eval(onInit, this.view);
  }
};

GO_VIEW.prototype._onOpen = async function () {
  const onOpen = this.onopen || this.onOpen || this.data.onOpen || this.data.onopen;

  if (["function"].includes(typeof onOpen)) {
    onOpen.call(this, this.view);
  } else if (["string"].includes(typeof onOpen)) {
    Go.eval(onOpen, this.view);
  }

  if (this.data.autoClose) {
    Go.sleep(this.data.autoClose, this.close.bind(this));
  }

  const numViewsOnTarget = Go.el(this.target).findAll(".View.view")?.length;

  Go.attr(this.target, "num-views", numViewsOnTarget);
};

GO_VIEW.prototype._onClose = function () {
  const onClose = this.onclose || this.onClose || this.data.onClose || this.data.onclose;
  if (["function"].includes(typeof onClose)) {
    onClose.call(this, this.view);
  } else if (["string"].includes(typeof onClose)) {
    Go.eval(onClose, this.view);
  }
};

GO_VIEW.prototype.find = function (selector) {
  return this.view.querySelector(selector);
};

GO_VIEW.prototype.findAll = function (selector) {
  return this.view.querySelectorAll(selector);
};

GO_VIEW.prototype.count = function (selector) {
  return this.view.querySelectorAll(selector).length;
};

GO_VIEW.prototype.html = function (data) {
  Go.html(Go.getProp(this, "view.body"), data);
};

GO_VIEW.prototype.append = function (data) {
  Go.append(Go.getProp(this, "view.body"), data);
};

GO_VIEW.prototype.prepend = function (data) {
  Go.prepend(Go.getProp(this, "view.body"), data);
};

GO_VIEW.prototype.clean = function () {
  Go.clean(Go.getProp(this, "view.body"));
};

GO_VIEW.prototype.remove = function () {
  Go.remove(this.view);
};

GO_VIEW.prototype._beforeOpen = function () {
  Go.addClass(this.view, "opening");
  const beforeOpen = this.beforeopen || this.beforeOpen || this.data.beforeOpen || this.data.beforeopen;
  if (["function"].includes(typeof beforeOpen)) {
    beforeOpen.call(this, this.view);
  } else if (["string"].includes(typeof beforeOpen)) {
    Go.eval(beforeOpen, this.view);
  }
};

GO_VIEW.prototype._beforeClose = function () {
  const beforeClose = this.beforeclose || this.beforeClose || this.data.beforeClose || this.data.beforeclose;
  if (["function"].includes(typeof beforeClose)) {
    beforeClose.call(this, this.view);
  } else if (["string"].includes(typeof beforeClose)) {
    Go.eval(beforeClose, this.view);
  }
};

GO_VIEW.prototype._afterClose = function () {
  const afterClose = this.afterclose || this.afterClose || this.data.afterClose || this.data.afterclose;
  if (["function"].includes(typeof afterClose)) {
    afterClose.call(this, this.view);
  } else if (["string"].includes(typeof afterClose)) {
    Go.eval(afterClose, this.view);
  }
};

GO_VIEW.prototype._afterOpen = function () {
  Go.addClass(this.view, "opened");
  const afterOpen = this.afteropen || this.afterOpen || this.data.afterOpen || this.data.afteropen || this.onopened || this.onOpened || this.data.onOpened || this.data.onopened;
  if (["function"].includes(typeof afterOpen)) {
    afterOpen.call(this, this.view);
  } else if (["string"].includes(typeof afterOpen)) {
    Go.eval(afterOpen, this.view);
  }
  Go.removeClass(this.view, "opening");
};

GO_VIEW.prototype._onMinimize = function () {
  const onMinimize = this.onminimize || this.onMinimize || this.data.onMinimize || this.data.onminimize;
  if (["function"].includes(typeof onMinimize)) {
    onMinimize.call(this, this.view);
  } else if (["string"].includes(typeof onMinimize)) {
    Go.eval(onMinimize, this.view);
  }
};

GO_VIEW.prototype._onMaximize = function () {
  const onMaximize = this.onmaximize || this.onMaximize || this.data.onMaximize || this.data.onmaximize;
  if (["function"].includes(typeof onMaximize)) {
    onMaximize.call(this, this.view);
  } else if (["string"].includes(typeof onMaximize)) {
    Go.eval(onMaximize, this.view);
  }
};

GO_VIEW.prototype.message = function (msg) {
  return Go.create({
    tag: "div",
    class: "viewMessage",
    mode: "append",
    replace: true,
    html: msg,
    target: `#view-${this.id} .ViewBody`,
    awaitTarget: true,
  });
};

GO_VIEW.prototype.log = function () {
  return this.message(...arguments);
};

Object.assign(GO, MOD_LUIGIOS_GOVIEWJS);

const MOD_LUIGIOS_GOVIEWSJS = {
  routes: function (routes = {}) {
    return this.views(routes);
  },
  views: function (views = {}, routes = {}) {
    if (Go.is(views, "String")) {
      return this.addRoutesToView(views, routes);
    }

    if (!window.views) window.views = {};

    Object.assign(window.views, views);

    this.analizeViews(views);

    return views;
  },
  analizeViews: function (views = {}) {
    // Set parent for childrens routes
    let isObjet = false;

    Go.for(views, (path, view) => {
      isObjet = typeof view !== "function" && typeof view === "object";

      if (isObjet) {
        view.key = path;
      }

      if (!Go.includes(path, "*")) return;

      let parent = path.split("*")[0];

      if (isObjet) {
        view.parent = parent || "";
      }

      if (isObjet && Go.is(view.routes, "object")) {
        this.analizeViews(view.routes);
      }
    });
  },
  addRoutesToView: function (view, routes = {}) {
    if (!window.views) {
      return;
    }

    if (!Go.is(window.views[view], "object")) {
      return;
    }

    if (!Go.is(window.views[view]["routes"], "object")) {
      window.views[view]["routes"] = {};
    }

    return Object.assign(window.views[view]["routes"], routes);
  },
};

Object.assign(GO, MOD_LUIGIOS_GOVIEWSJS);

const GoVue = {};

GoVue.methods = {};
GoVue.computed = {};
GoVue.watch = {};
GoVue.components = {};

const MOD_LUIGIOS_GOVUEJS = { vue: GoVue, Vue: {} };

Object.assign(GO, MOD_LUIGIOS_GOVUEJS);

const GO_WORKER = function (data = {}) {
  this.data = typeof data === "string" ? { url: data } : data || {};
};

const MOD_LUIGIOS_GOWORKERJS = {
  worker: function () {
    return new GO_WORKER(...arguments).register();
  },
};

GO_WORKER.prototype.register = function () {
  return new Promise(async (resolve, reject) => {
    if ("serviceWorker" in navigator) {
      try {
        this.worker = await navigator.serviceWorker.register(this.data.url);
      } catch (error) {
        return reject(error);
      }
      return resolve(this.worker);
    }
    return reject(new Error("Service Worker not supported"));
  });
};

Object.assign(GO, MOD_LUIGIOS_GOWORKERJS);

const GO_XHR = {};

function XHR(url, options = {}, callback) {
  Go.extend(this, Go.Events);
  this.host = Go.route.fixPath(url || options.url || options.host);
  this.host = Go.fix(this.host).url();
  this.data = null;
  this.options = options;
  this.url = url;
  this.cacheId = this.getCacheId();
  this.options.cache ||= !!this.options.cacheId;
  this.payload = this.options.body || this.options.data || this.options.payload || {};
  this.callback = callback;
  return this.init();
}

const MOD_LUIGIOS_GOXHRJS = {
  xhr: function () {
    return new XHR(...arguments);
  },
};

XHR.prototype.init = function () {
  if (["settings", "config", "SETTINGS"].includes(this.url)) {
    return this.settings;
  }

  if (this.host && !this.host.startsWith("/") && Go.app && Go.app.keyName) {
    this.host = `/app/${Go.app.keyName}/${this.host}`;
  }

  if (this.options.cache && GO_XHR[this.cacheId]) {
    return Promise.resolve(GO_XHR[this.cacheId]);
  }

  if (this.host) {
    return this.host && this[Go.lower(this.options.method) || "get"]();
  }
};

XHR.prototype.getCacheId = function () {
  this.theCacheId = this.options.cacheId || this.host;
  this.theCacheId += `-${Go.getProp(this.payload, "page", 1)}`;
  this.theCacheId += `-${Go.getProp(this.payload, "query", "")}`;
  this.theCacheId += `-${Go.getProp(this.payload, "q", "")}`;
  return Go.keyString(this.theCacheId);
};

XHR.prototype.get = async function () {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", this.host, true);
    xhr.responseType = this.options.responseType || this.options.type || "json";
    this.setHeaders(xhr);
    this.listeners(xhr, resolve, reject);
    xhr.send();
  });
};

XHR.prototype.post = async function () {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", this.host, true);
    xhr.responseType = this.options.responseType || this.options.type || "json";
    this.setHeaders(xhr);
    this.listeners(xhr, resolve, reject);
    xhr.send(this.body(this.payload, xhr));
  });
};

XHR.prototype.setHeaders = function (xhr) {
  const ssid = localStorage.getItem(Go.env("auth_name"));
  const lang = localStorage.getItem("lang") || "en";
  const headers = this.options.headers || {};
  const xheader = { api: "true", lang, [Go.env("auth_name")]: ssid, app: Go.app.keyName || "" };
  const map = { map: this.map() };
  const storeHeaders = Go.storage("headers").get() || { nostore: "true" };
  const configHeaders = Go.config("headers") || {};
  configHeaders["Time-Zone"] = Go.Date().getTimeZone();

  const allHeaders = Object.assign({}, headers, xheader, map, storeHeaders, configHeaders);

  for (let key in allHeaders) {
    xhr.setRequestHeader(key, allHeaders[key]);
  }
};

XHR.prototype.body = function (body, xhr) {
  if (typeof body === "function") {
    body = body();
  }

  if (Go.is(body, "FormData")) {
    return body;
  }

  if (typeof body === "object") {
    xhr.setRequestHeader("Content-Type", "application/json");

    for (let key in body) {
      if (typeof body[key] === "function") {
        body[key] = body[key]();
      }
    }

    return Go.json(body);
  }

  return body;
};

XHR.prototype.map = function () {
  const map = { files: {}, total_files_size: 0, total_files: 0 };

  if (!Go.is(this.payload, "FormData")) {
    return Go.json(map);
  }

  this.payload.forEach((value, key) => {
    if (Go.is(value, "File") && value.size) {
      map["files"][key] = { type: value.type, name: encodeURIComponent(value.name), size: value.size };
      map["total_files_size"] += Number(value.size);
      map["total_files"] += 1;
    } else if (!Go.is(value, "File")) {
      map[key] = encodeURIComponent(value);
    }
  });

  return Go.json(map);
};

XHR.prototype.listeners = function (xhr, resolve, reject) {
  xhr.addEventListener("loadstart", this.loadstart.bind(this, xhr, resolve, reject));
  xhr.addEventListener("load", this.load.bind(this, xhr, resolve, reject));
  xhr.addEventListener("loadend", this.loadend.bind(this, xhr, resolve, reject));
  xhr.addEventListener("abort", this.abort.bind(this, xhr, resolve, reject));
  xhr.upload.onprogress = (e) => this.uploadProgress(e);
  xhr.onprogress = (e) => this.downloadProgress(e);
  xhr.ontimeout = (e) => this.error(e, resolve, reject);
  xhr.onerror = (e) => this.error(e, resolve, reject);
};

XHR.prototype.loadstart = function (xhr, resolve, reject) {
  this.emit("loadstart", xhr);
};

XHR.prototype.load = function (xhr, resolve, reject) {
  if (xhr.status !== 200) {
    return reject(xhr);
  }

  this.data = xhr.response;

  if (xhr.responseType === "json" && this.data?.success) {
    this.emit("success", this.data);
  }

  if (this.options.cache) {
    GO_XHR[this.cacheId] = this.data;
  }

  if (["function"].includes(typeof this.callback)) {
    this.callback(this.data);
  }

  return resolve(this.data);
};

XHR.prototype.loadend = function (xhr, resolve, reject) {
  this.emit("loadend", xhr);
};

XHR.prototype.uploadProgress = function (xhr) {
  const info = { xhr, percent: (xhr.loaded / xhr.total) * 100 };
  this.emit("uploadProgress", info);
  if (["function"].includes(typeof this.options.uploadProgress)) {
    this.options.uploadProgress(info);
  }
};

XHR.prototype.downloadProgress = function (xhr) {
  const info = { xhr, percent: (xhr.loaded / xhr.total) * 100 };
  this.emit("downloadProgress", info);
  if (["function"].includes(typeof this.options.downloadProgress)) {
    this.options.downloadProgress(info);
  }
};

XHR.prototype.error = function (xhr, resolve, reject) {
  this.emit("error", xhr);
  return reject(xhr);
};

XHR.prototype.abort = function (xhr, resolve, reject) {
  this.emit("abort", xhr);
  return reject(xhr);
};

XHR.prototype.settings = {
  removeCache: (path) => {
    delete GO_XHR[path];
  },
  rmCache: (path) => {
    delete GO_XHR[path];
  },
  getCache: () => GO_XHR,
};

Object.assign(GO, MOD_LUIGIOS_GOXHRJS);

const GO_INCLUDES = {};

const MOD_LUIGIOS_INCLUDESJS = GO_INCLUDES;

GO_INCLUDES.includes = function (data, includes) {
  if (!data) return false;

  if (!includes) return false;

  if (Go.is(data, "Array")) {
    return data.includes(includes);
  }

  if (Go.is(data, "String") && includes.includes(" ")) {
    return GO_INCLUDES.includesMultipleString(data, includes);
  }

  if (Go.is(data, "String")) {
    return data.includes(includes);
  }

  if (data.indexOf && includes) {
    return data.indexOf(includes) !== -1;
  }

  return false;
};

GO_INCLUDES.includesMultipleString = function (data, includes) {
  let matches = [];

  if (includes.includes(" ")) {
    includes = includes.split(" ");
  }

  for (let string of includes) {
    if (Go.includes(data, string)) {
      matches.push(string);
    }
  }

  return matches.length === includes.length;
};

Object.assign(GO, MOD_LUIGIOS_INCLUDESJS);

const GO_UNIVERSAL = {};

const MOD_LUIGIOS_GOUNIVERSALJS = GO_UNIVERSAL;

GO_UNIVERSAL.executor = async function (keysToUse = [], object = {}, ...rest) {
  let [conf, err] = [rest[0] || {}, null];

  if (arguments.length === 1 && Go.is(keysToUse, "object")) {
    object = arguments[0] || {};
    conf = arguments[0] || {};
    keysToUse = Object.keys(object);
  } else if (arguments.length === 2 && Go.is(keysToUse, "object")) {
    object = arguments[0] || {};
    conf = arguments[1] || object || {};
    keysToUse = Object.keys(object);
  }

  for (let key of keysToUse) {
    try {
      if (typeof object[key] !== "function") continue;
      const result = await object[key](...rest);

      if (result instanceof Response && result.type === "cors" && !result.ok) {
        throw new Error(result);
      }

      return result;
    } catch (error) {
      err = error;
      if (!conf.silent) {
        console.log("Error: ", error);
      }
      continue;
    }
  }

  throw err;
};

GO_UNIVERSAL.omit = function (obj, ...keys) {
  keys.flat();
  return Object.keys(obj).reduce((acc, key) => (keys.includes(key) ? acc : { ...acc, [key]: obj[key] }), {});
};

GO_UNIVERSAL.or = function () {
  let [args, result] = [arguments, undefined];

  if (args.length === 1 && Array.isArray(args[0])) {
    args = args[0];
  }

  for (let i = 0; i < args.length; i++) {
    result = args[i];

    if (result && typeof result === "function") {
      result = result();
    }

    if (result && ["boolean", "string", "number"].includes(typeof result)) {
      return result;
    }

    if (result && typeof result === "object" && Object.keys(result).length > 0) {
      return result;
    }
  }

  return result;
};

GO_UNIVERSAL.eq = function (...args) {
  if (args.length <= 1) return false;

  let values = [];

  for (let i = 0; i < args.length; i++) {
    let result = args[i];

    if (["function"].includes(typeof result)) {
      result = result();
    }

    values.push(result);
  }

  return values.every((value) => value === values[0]);
};

GO_UNIVERSAL.dif = function () {
  if (arguments.length < 2) return false;

  const first = arguments[0];
  for (let i = 1; i < arguments.length; i++) {
    if (arguments[i] !== first) return true;
  }
  return false;
};

GO_UNIVERSAL.and = function (...args) {
  if (args.length <= 0) return false;

  for (let i = 0; i < args.length; i++) {
    let result = args[i];

    if (["function"].includes(typeof result)) {
      result = result();
    }

    if (!result) return false;
  }

  return true;
};

GO_UNIVERSAL.if = function (...args) {
  let [config, result, _true, _else, _if, _finish] = [args[0], null, null, null, null, null];

  if (!arguments.length) {
    return result;
  }

  if (arguments.length === 1 && Go.isArray(args[0])) {
    return GO_UNIVERSAL.if(...args[0]);
  }

  if (arguments.length === 1 && ["object"].includes(typeof config) && Go.hasProperty(config, ["if", "cond", "condition"])) {
    _if = Go.getProp(config, ["if", "cond", "condition"]);
    _true = Go.getProp(config, ["true", "then", "success"]);
    _else = Go.getProp(config, ["else", "false", "default"]);
    _finish = Go.getProp(config, ["finish", "onfinish", "end", "fin"]);

    if (["function"].includes(typeof _if)) {
      _if = _if();
    }

    result = _if ? _true : _else;

    if (["function"].includes(typeof result)) {
      result = result();
    }

    if (["function"].includes(typeof _finish)) {
      _finish();
    }

    return result;
  } else if (arguments.length === 1 && ["object"].includes(typeof config)) {
    return config;
  }

  for (let i = 0; i < arguments.length; i++) {
    result = Go.switch({
      case: typeof arguments[i],
      function: () => arguments[i](),
      object: () => (Go.hasProperty(arguments[i], ["if", "cond", "condition"]) ? Go.if(arguments[i]) : arguments[i]),
      default: () => Go.getProp(arguments[i], "else", arguments[i]),
    });

    if (result) {
      return result;
    }
  }

  return result;
};

GO_UNIVERSAL.isArray = function (value) {
  return Array.isArray(value);
};

GO_UNIVERSAL.ifAllConditions = function (conditions) {
  let [success, error] = [0, 0];

  for (let i = 0; i < conditions.length; i++) {
    const _if = conditions[i];

    if (["function"].includes(typeof _if)) {
      conditions[i] = _if();
    }

    if (_if) {
      success += 1;
    } else {
      error += 1;
    }
  }

  return success === conditions.length;
};

GO_UNIVERSAL.action = function () {
  return GO_UNIVERSAL.use(...arguments);
};

GO_UNIVERSAL.run = function () {
  return GO_UNIVERSAL.use(...arguments);
};

GO_UNIVERSAL.call = function () {
  return GO_UNIVERSAL.use(...arguments);
};

GO_UNIVERSAL.isReq = function () {
  return a && b && a.headers && a.method && a.url && typeof b.setHeader === "function" && typeof b.end === "function";
};

GO_UNIVERSAL.use = function (i, ...args) {
  let [oi, oa, err, cb, _err, a] = [i, args[0], null, null, null, args[0]];

  return new Promise(async (resolve) => {
    try {
      a = !a ? ["init", "run", "auto", "go"] : a["action"] || a["use"] || a["go"] || a;

      if (Go.isConstructor(i)) {
        i = new i(...args);
      } else if (["function"].includes(typeof i)) {
        i = i(...args);
      }

      if (Array.isArray(a)) {
        a = Go.getProp(i, a);
      }

      a = Go.switch({
        case: typeof a,
        default: () => a,
        function: async () => await a.apply(i, args),
      });
    } catch (error) {
      _err = error;
      console.error(`[${a}]` + " : ", _err);
    }

    err = oa && (oa["error"] || oa["fail"] || oa["failure"] || oa["error"] || oa["onerror"]);

    cb = oa && (oa["success"] || oa["cb"] || oa["callback"] || oa["done"] || oa["finish"] || oa["end"] || oa);

    if (_err) {
      if (["function"].includes(typeof err)) await err(_err);
    } else {
      if (["function"].includes(typeof cb)) await cb(a);
    }

    resolve(a);
  });
};

GO_UNIVERSAL.map = function (obj, callback) {
  if (Go.is(obj, "selector")) {
    obj = document.querySelectorAll(obj);
  }

  const cb = (value, index, key) => {
    if (Go.is(obj, "Object") && Go.getProp(obj, value)) {
      [value, key] = [obj[value], value];
    }

    if (["function"].includes(typeof value)) {
      value = value();
    }

    return callback(value, key || index, index);
  };

  if (Go.is(obj, "NodeList")) {
    return Array.from(obj).map(cb);
  }

  if (Go.is(obj, "Array")) {
    return obj.map(cb);
  }

  if (Go.is(obj, "Object")) {
    return Object.keys(obj).map(cb);
  }
};

GO_UNIVERSAL.only = function (obj, ...args) {
  const result = {};

  args.flat();

  for (let i = 0; i < args.length; i++) {
    result[args[i]] = obj[args[i]];
  }

  return result;
};

GO_UNIVERSAL.isConstructor = function (fn) {
  if (typeof fn !== "function") return false;
  try {
    Reflect.construct(String, [], fn);
    return true;
  } catch (e) {
    return false;
  }
};

GO_UNIVERSAL.isEven = function (arg) {
  return arg % 2 === 0;
};

GO_UNIVERSAL.isOdd = function (arg) {
  return arg % 2 === 1;
};

GO_UNIVERSAL.lt = function (a, b, c) {
  return a < b ? a : c;
};

GO_UNIVERSAL.gt = function (a, b, c) {
  return a > b ? a : c;
};

GO_UNIVERSAL.throw = function (...args) {
  let r;

  for (let i = 0; i < args.length; i++) {
    r = args[i];

    if (["function"].includes(typeof r)) {
      r = r();
    }

    if (!r) {
      throw new Error(r);
    }
  }

  return r;
};

GO_UNIVERSAL.switch = function (value = null, opts = {}, result = null) {
  if (arguments.length === 1 && ["object"].includes(typeof value)) {
    [opts, value] = [value, Go.getProp(value, "value") || Go.getProp(value, "case", null)];
  }

  if (["function"].includes(typeof value)) {
    value = value();
  }

  result = Go.getProp(opts, value) || Go.getProp(opts, "default", null);

  if (["function"].includes(typeof result)) {
    result = result();
  }

  let finish = Go.getProp(opts, "finish", null);

  if (finish && ["function"].includes(typeof finish)) {
    finish = finish();
  }

  return result;
};

GO_UNIVERSAL.trigger = function (obj, fnId, ...args) {
  let [fn, result] = [Go.getProp(obj, fnId, null), null];

  if (Array.isArray(obj)) {
    return obj.map((o) => {
      return GO_UNIVERSAL.trigger(o, fnId, ...args);
    });
  }

  if (["function"].includes(typeof fn)) {
    result = fn.apply(obj, args);
  }

  return result;
};

GO_UNIVERSAL.length = function () {
  let result = 0;

  if (!arguments.length) {
    return result;
  }

  for (let i = 0; i < arguments.length; i++) {
    result += arguments[i] ? arguments[i].length : 0;
  }

  return result;
};

GO_UNIVERSAL.len = GO_UNIVERSAL.length;

GO_UNIVERSAL.size = GO_UNIVERSAL.length;

GO_UNIVERSAL.nlen = function () {
  return !GO_UNIVERSAL.length(...arguments);
};

GO_UNIVERSAL.nlength = function () {
  return !GO_UNIVERSAL.length(...arguments);
};

GO_UNIVERSAL.nsize = function () {
  return !GO_UNIVERSAL.length(...arguments);
};

GO_UNIVERSAL.linkify = function (text) {
  const urlRegex = /(?<!["'=])(https?:\/\/[^\s<>"']+)/gi;

  return text.replace(urlRegex, (url) => {
    // Evitar puntuación que probablemente pertenece al texto
    let cleanUrl = url.replace(/[.,!?;:)]+$/, "");

    return `<a class="go-link" href="${cleanUrl}" target="_blank" rel="noopener noreferrer">${cleanUrl}</a>` + url.slice(cleanUrl.length);
  });
};

Object.assign(GO, MOD_LUIGIOS_GOUNIVERSALJS);

const GO_DOCUMENT = function (html) {
  this.html = html;
  if (["object"].includes(typeof html)) {
    this.init();
  }
};

const MOD_LUIGIOS_GODOCUMENTJS = {
  document: function () {
    return new GO_DOCUMENT(...arguments);
  },
};

GO_DOCUMENT.prototype.toString = function () {
  return this.html;
};

GO_DOCUMENT.prototype.init = async function () {
  this.reqHTML = await Go.http.txt(Go.getProp(this.html, "from", ""), { method: "GET" });
};

Object.assign(GO, MOD_LUIGIOS_GODOCUMENTJS);

const [GO_ARRAY, GO_ARRAY_INSTANCE] = [
  {},
  function (arr = [], conf = {}) {
    this.array = arr;
    this.conf = conf;
  },
];

const MOD_LUIGIOS_GOARRAYJS = GO_ARRAY;

GO_ARRAY.arrayGroupOf = function (number, _array, model) {
  // create group of number of elements in _array and return array of groups
  // example: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] => [[1, 2, 3, 4], [5, 6, 7, 8], [9, 10]]
  let array = _array.slice();
  let groups = [];
  while (array.length > 0) {
    if (model) {
      model.id = Go.uuid();
      groups.push({ ...model, items: array.splice(0, number) });
    } else {
      groups.push(array.splice(0, number));
    }
  }
  return groups;
};

GO_ARRAY.findIndex = function (array, value) {
  // find index of value in array
  let index = -1;
  for (let i = 0; i < array.length; i++) {
    if (array[i] === value) {
      index = i;
      break;
    }
  }
  return index;
};

GO_ARRAY.findObjectIndex = function (array, key, value) {
  // find index of object in array by key and value
  let index = -1;
  for (let i = 0; i < array.length; i++) {
    if (Go.getProperty(key, array[i]) === value) {
      index = i;
      break;
    }
  }
  return index;
};

GO_ARRAY.shuffle = function (array) {
  // shuffle array
  let currentIndex = array.length,
    temporaryValue,
    randomIndex;
  while (0 !== currentIndex) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }
  return array;
};

GO_ARRAY.removeFromArray = function (array, value) {
  // remove value from array
  if (Go.is(array, "Object") && array.array) {
    array = array.array;
    value = array.value;
  }

  let index = GO_ARRAY.findIndex(array, value);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
};

GO_ARRAY.removeObjectFromArray = function (array, key, value) {
  // remove object from array by key and value
  if (Go.is(array, "Object") && array.array) {
    array = array.array;
    key = array.key;
    value = array.value;
  }

  let index = GO_ARRAY.findObjectIndex(array, key, value);
  if (index > -1) {
    array.splice(index, 1);
  }
  return array;
};

GO_ARRAY.arrayRandomItem = function (array) {
  // return random item from array
  return array[Math.floor(Math.random() * array.length)];
};

GO_ARRAY.find = function (key, array) {
  if (Go.is(key, "number")) {
    return array[key];
  }

  let value = null;

  for (let i = 0; i < array.length; i++) {
    if (Go.getProperty(key, array[i])) {
      value = array[i][key];
      break;
    }
  }

  return value;
};

GO_ARRAY.arrayFill = function (length, value) {
  // fill array with value
  let array = [];
  for (let i = 0; i < length; i++) {
    array.push(value || i);
  }
  return array;
};

GO_ARRAY.arrayCombine = function (...arrays) {
  let array = [];
  arrays.forEach((arr) => {
    array = array.concat(arr);
  });
  return array;
};

GO_ARRAY.pushFirst = function (array, value) {
  array.unshift(value);
  return array;
};

GO_ARRAY.pushLast = function (array, value) {
  array.push(value);
  return array;
};

GO_ARRAY.arraysConcat = function (array1, array2) {
  if (!Go.is(array1, "Array")) {
    array1 = [];
  }

  return array1.concat(array2);
};

GO_ARRAY.arraysDiff = function (array1, array2) {
  return array1.filter((x) => !array2.includes(x));
};

GO_ARRAY.arrayLastElement = function (array) {
  return array[array.length - 1];
};

GO_ARRAY.array = function () {
  return new GO_ARRAY_INSTANCE(...arguments);
};

GO_ARRAY.mapClone = function (array, callback) {
  const arr = structuredClone(array);
  return arr.map(callback);
};

GO_ARRAY.arraySort = function (arr, key, order) {
  if (order === "asc") {
    return arr.sort((a, b) => a[key] - b[key]);
  } else {
    return arr.sort((a, b) => b[key] - a[key]);
  }
};

GO_ARRAY_INSTANCE.prototype.random = function () {
  return this.array[Math.floor(Math.random() * this.array.length)];
};

GO_ARRAY_INSTANCE.prototype.removeObject = function (queryToRemove) {
  let key = queryToRemove.key || Object.keys(queryToRemove)[0];
  let value = queryToRemove.value || queryToRemove[key];
  let index = GO_ARRAY.findObjectIndex(this.array, key, value);
  if (index > -1) {
    this.array.splice(index, 1);
  }
  return this.array;
};

GO_ARRAY_INSTANCE.prototype.removeFirst = function () {
  this.array.splice(0, 1);
  return this.array;
};

GO_ARRAY_INSTANCE.prototype.remove = function (value) {
  if (["object"].includes(typeof value)) {
    return this.removeObject(value);
  }
  return this.removeValue(value);
};

GO_ARRAY_INSTANCE.prototype.removeAt = function (index) {
  this.array.splice(index, 1);
  return this.array;
};

GO_ARRAY_INSTANCE.prototype.removeValue = function (value) {
  let index = GO_ARRAY.findIndex(this.array, value);
  if (index > -1) {
    this.array.splice(index, 1);
  }
  return this.array;
};

GO_ARRAY_INSTANCE.prototype.push = function (value) {
  this.array.push(value);
  return this.array;
};

GO_ARRAY_INSTANCE.prototype.add = function (value) {
  this.array.push(value);
  return this.array;
};

GO_ARRAY_INSTANCE.prototype.addAt = function (index, value) {
  this.array.splice(index, 0, value);
  return this.array;
};

GO_ARRAY_INSTANCE.prototype.clean = function () {
  return this.array.filter(Boolean);
};

GO_ARRAY_INSTANCE.prototype.combine = function (...arrays) {
  return GO_ARRAY.arrayCombine(this.array, ...arrays);
};

GO_ARRAY_INSTANCE.prototype.unique = function () {
  return [...new Set(this.array)];
};

GO_ARRAY_INSTANCE.prototype.unshift = function (item) {
  this.array.unshift(item);
  return this.array;
};

Object.assign(GO, MOD_LUIGIOS_GOARRAYJS);

const GO_VALIDATE = function (data = {}, requires = {}) {
  this.data = Go.is(data, "FormData") ? Go.formToObject(data) : data;
  this.requires = requires;
  this.error = {};
  this.keys = [];
};

const MOD_LUIGIOS_GOVALIDATEJS = {
  validate: function () {
    return new GO_VALIDATE(...arguments).valid();
  },
};

GO_VALIDATE.prototype.valid = function () {
  if (Array.isArray(this.requires)) {
    this.keys = this.requires.map((key) => key.prop || key.name || key);
    this.requires = this.requires.reduce((acc, key) => ({ ...acc, [key.prop || key.name || key]: key }), {});
  } else {
    this.keys = Object.keys(this.requires);
  }

  for (let key of this.keys) {
    this.verifyItem(key, Go.getProp(this.data, key, this.data[key]), Go.getProp(this.requires, key, this.requires[key] || {}));
    if (this.error.message) {
      return this.error;
    }
  }

  return this.error.message ? this.error : false;
};

GO_VALIDATE.prototype.verifyItem = function (keyItem, keyValue, keyConfig) {
  if (["function"].includes(typeof keyConfig)) {
    try {
      keyConfig = keyConfig.apply(this, [keyItem, keyValue, keyConfig]);
    } catch (error) {
      this.error.message = error.message || "Validation Function error";
    }
  }

  this.keyItem = keyItem;
  this.keyConfig = keyConfig;
  this.keyValue = Go.getProp(keyConfig, "value", keyValue);
  this.isOptional = !!Go.getProp(keyConfig, "optional");

  if (!this.isOptional && Go.is(this.keyValue, "File")) {
    return this.verifyFile(this.keyValue);
  }

  if (!this.isOptional && Array.isArray(this.keyConfig.type)) {
    for (let type of this.keyConfig.type) {
      if (Go.is(this.keyValue, type)) {
        return this.error.message ? this.error : false;
      }
    }
    this.error.item = this.keyConfig;
    this.error.message = this.keyConfig.message || `${this.keyItem}_is_not_${this.keyConfig.type}_valid`;
    this.error.name = this.keyItem;
    return this.error;
  }

  if (!this.isOptional && !this.keyValue) {
    this.error.item = this.keyConfig;
    this.error.message = this.keyConfig.message || `${this.keyItem}_is_required`;
    this.error.name = this.keyItem;
    return this.error;
  }

  if (!this.keyConfig.length) this.keyConfig.length = {};

  if (
    (!this.isOptional && this.keyConfig.length.min && this.keyValue.length < this.keyConfig.length.min) ||
    (this.isOptional && this.keyValue && this.keyConfig.length.min && this.keyValue.length < this.keyConfig.length.min)
  ) {
    this.error.item = this.keyConfig;
    this.error.message = this.keyConfig.message || `${this.keyItem}_is_too_short`;
    this.error.name = this.keyItem;
    return this.error;
  }

  if (
    (!this.isOptional && this.keyConfig.length.max && this.keyValue.length > this.keyConfig.length.max) ||
    (this.isOptional && this.keyValue && this.keyConfig.length.max && this.keyValue.length > this.keyConfig.length.max)
  ) {
    this.error.item = this.keyConfig;
    this.error.message = this.keyConfig.message || `${this.keyItem}_is_too_long`;
    this.error.name = this.keyItem;
    return this.error;
  }

  if (
    (!this.isOptional && this.keyConfig.length.exact && this.keyValue.length !== this.keyConfig.length.exact) ||
    (this.isOptional && this.keyValue && this.keyConfig.length.exact && this.keyValue.length !== this.keyConfig.length.exact)
  ) {
    this.error.item = this.keyConfig;
    this.error.message = this.keyConfig.message || `${this.keyItem}_is_length_not_valid`;
    this.error.name = this.keyItem;
    return this.error;
  }

  if (this.validType(this.keyConfig.type)) {
    return this.error;
  }

  if (this.keyConfig.value && this.validValue()) {
    return this.error;
  }

  if (this.keyConfig.enum && this.validEnum()) {
    return this.error;
  }

  return this.error;
};

GO_VALIDATE.prototype.validType = function (type) {
  if (type === "*") return this.error;

  if (this.isOptional) {
    return;
  }

  if (Array.isArray(type)) {
    for (let t of type) {
      if (Go.is(this.keyValue, t)) {
        return this.error;
      }
    }
  }

  if (!Go.is(this.keyValue, type)) {
    this.error.item = this.keyConfig;
    this.error.message = this.keyConfig.message || `${this.keyItem}_is_not_${this.keyConfig.type}_valid`;
    this.error.name = this.keyItem;
    return this.error;
  }
};

GO_VALIDATE.prototype.validValue = function () {
  if (!this.isOptional && Number(this.keyValue) < Number(this.keyConfig.value.min)) {
    this.error.item = this.keyConfig;
    this.error.message = this.keyConfig.message || `${this.keyItem}_is_too_low`;
    this.error.name = this.keyItem;
    return this.error;
  }

  if (!this.isOptional && Number(this.keyValue) > Number(this.keyConfig.value.max)) {
    this.error.item = this.keyConfig;
    this.error.message = this.keyConfig.message || `${this.keyItem}_is_too_high`;
    this.error.name = this.keyItem;
    return this.error;
  }

  if (!this.isOptional && this.keyConfig.value.exact && Number(this.keyValue) !== Number(this.keyConfig.value.exact)) {
    this.error.item = this.keyConfig;
    this.error.message = this.keyConfig.message || `${this.keyItem}_is_not_valid`;
    this.error.name = this.keyItem;
    return this.error;
  }
};

GO_VALIDATE.prototype.validEnum = function () {
  if (this.isOptional && !this.keyValue) return;
  if (!this.keyConfig.enum.includes(this.keyValue)) {
    this.error.item = this.keyConfig;
    this.error.message = this.keyConfig.message || `${this.keyItem}_is_not_valid`;
    this.error.name = this.keyItem;
    return this.error;
  }
};

GO_VALIDATE.prototype.verifyFile = function (file) {
  this.isTooShort = this.keyConfig.length?.min && file.size < this.keyConfig.length?.min;
  this.isTooLong = this.keyConfig.length?.max && file.size > this.keyConfig.length?.max;
  this.isNotExact = this.keyConfig.length?.exact && file.size !== this.keyConfig.length?.exact;

  if (this.isTooShort) {
    this.error = {
      item: file,
      message: this.keyConfig.length.message || `${this.keyItem}_is_too_short`,
      name: this.keyItem,
    };
    return this.error;
  }

  if (this.isTooLong) {
    this.error = {
      item: file,
      message: this.keyConfig.length.message || `${this.keyItem}_is_too_long`,
      name: this.keyItem,
    };
    return this.error;
  }

  if (this.isNotExact) {
    this.error = {
      item: file,
      message: this.keyConfig.length.message || `${this.keyItem}_is_length_not_valid`,
      name: this.keyItem,
    };
    return this.error;
  }

  this.keyConfig.type && this.validateFileType(file, this.keyConfig.type);

  return this.error;
};

GO_VALIDATE.prototype.validateFileType = function (file, type) {
  if (type === "*") return null;

  if (Array.isArray(type)) {
    for (const t of type) {
      if (t === "*") {
        return null;
      }

      if (Go.match(file.mimetype || file.type, t)) {
        return null;
      }
    }
  }

  if (Go.match(file.mimetype || file.type, type)) {
    return null;
  }

  this.error.item = file;
  this.error.message = this.keyConfig.messageType || `${this.keyItem}_is_not_${type}_valid`;
  this.error.name = this.keyItem;
  this.error.type = type;

  return this.error;
};

Object.assign(GO, MOD_LUIGIOS_GOVALIDATEJS);

const GO_DATE = function (date) {
  this._lang = Go.currentLang();
  if (date && typeof date === "string") {
    this.date = this.parseString(date);
  } else if (date) {
    this.date = new Date(date);
  } else {
    this.date = new Date();
  }
};

const MOD_LUIGIOS_GODATEJS = {
  date: function () {
    return new GO_DATE(...arguments);
  },
  Date: function () {
    return new GO_DATE(...arguments);
  },
};

GO_DATE.prototype.parseString = function (date) {
  if (!date) return null;

  if (date.includes("T")) {
    date = date.replace("T", " ");
  }

  if (date.includes(".")) {
    date = date.split(".")[0];
  }

  date = Go.removeLastStringIf(date, "Z");

  let parts = date.split(/[-\/\\: ]/); // Divide en cualquier separador encontrado

  if (parts.length === 2) {
    parts.push("00");
  }

  if (parts.length < 3) return null; // Si hay menos de 3 partes, no es una fecha válida

  let [y, m, d, h = 0, min = 0, s = 0] = parts.map(Number); // Convierte todo a números

  // Manejo de formatos ambiguos (Asegurar YYYY-MM-DD)
  if (y < 1000) {
    [d, m, y] = [y, m, d]; // Corrige formato DD/MM/YYYY o MM/DD/YYYY si es necesario
  }

  return new Date(y, m - 1, d, h, min, s);
};

GO_DATE.prototype.info = function () {
  const year = this.date.getFullYear();
  const month = String(this.date.getMonth() + 1).padStart(2, "0");
  const day = String(this.date.getDate()).padStart(2, "0");
  const hour = String(this.date.getHours()).padStart(2, "0");
  const minute = String(this.date.getMinutes()).padStart(2, "0");
  const second = String(this.date.getSeconds()).padStart(2, "0");
  return { year: year, month: month, day: day, hour: hour, minute: minute, second: second };
};

GO_DATE.prototype.valueOf = function () {
  return this.date;
};

GO_DATE.prototype.toPrimitive = function () {
  return this.date;
};

GO_DATE.prototype.toString = function () {
  return this.ymd();
};

GO_DATE.prototype.string = function () {
  return this.ymd();
};

GO_DATE.prototype.dateTime = function () {
  const info = this.info();
  const [year, month, day, hour, minute, second] = [info.year, info.month, info.day, info.hour, info.minute, info.second];
  const string = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
  return string;
};

GO_DATE.prototype.today = function () {
  this.stringDate = this.dateTime();
  return this.stringDate.split(" ")[0];
};

GO_DATE.prototype.now = function () {
  this.stringDate = this.dateTime();
  return this.stringDate;
};

GO_DATE.prototype.time = function () {
  this.stringDate = this.dateTime();
  return this.stringDate.split(" ")[1];
};

GO_DATE.prototype.date = function () {
  this.stringDate = this.dateTime();
  return this.stringDate.split(" ")[0];
};

GO_DATE.prototype.year = function () {
  this.stringDate = this.dateTime();
  return this.stringDate.split("-")[0];
};

GO_DATE.prototype.month = function () {
  this.stringDate = this.dateTime();
  return this.stringDate.split("-")[1];
};

GO_DATE.prototype.day = function () {
  this.stringDate = this.dateTime();
  this.stringDate = this.stringDate.split("-")[2];
  this.stringDate = this.stringDate.split(" ")[0];
  return this.stringDate;
};

GO_DATE.prototype.hour = function () {
  this.stringDate = this.dateTime();
  return this.stringDate.split(":")[0];
};

GO_DATE.prototype.minute = function () {
  this.stringDate = this.dateTime();
  return this.stringDate.split(":")[1];
};

GO_DATE.prototype.second = function () {
  this.stringDate = this.dateTime();
  return this.stringDate.split(":")[2];
};

GO_DATE.prototype.toStart = function () {
  this.stringDate = this.dateTime();
  return this.stringDate.split(" ")[0] + " 00:00:00";
};

GO_DATE.prototype.toEnd = function () {
  this.stringDate = this.dateTime();
  return this.stringDate.split(" ")[0] + " 23:59:59";
};

GO_DATE.prototype.getTimeZone = function () {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timezone;
};

GO_DATE.prototype.toMyTimeZone = function () {
  let date = new Date(this.date);
  const tzInfo = this.getTimeZoneInfo();
  date.setHours(date.getHours() + tzInfo.offset);
  return date;
};

GO_DATE.prototype.getTimeZoneInfo = function () {
  let date = new Date(this.date);
  const match = date.toString().match(/GMT([+-]\d{4})/);
  const offset = match ? match[1] : null;

  const horas = parseInt(offset.slice(0, 3), 10);
  const minutos = parseInt(offset.slice(3), 10);
  const offsetMinutos = horas * 60 + minutos;

  return {
    offset: offsetMinutos / 60,
    name: this.getTimeZone(),
  };
};

GO_DATE.prototype.getLastNumDaysRange = function (days) {
  const date = new Date(this.date);
  date.setDate(date.getDate() - days);
  return date;
};

GO_DATE.prototype.startOfMonth = function () {
  const date = new Date(this.date);
  date.setDate(1);
  return date;
};

GO_DATE.prototype.endOfMonth = function () {
  const date = new Date(this.date);
  date.setDate(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate());
  return date;
};

GO_DATE.prototype.ymd = function (separator = "-") {
  this.stringDate = this.dateTime();
  return this.stringDate.split(" ")[0].split("-")[0] + separator + this.stringDate.split(" ")[0].split("-")[1] + separator + this.stringDate.split(" ")[0].split("-")[2];
};

GO_DATE.prototype.lang = function (lang) {
  this._lang = lang || this._lang;
  const options = {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: this.getTimeZone() || "UTC",
  };
  return this.date.toLocaleDateString(this._lang, options);
};

GO_DATE.prototype.hasElapsed = function (timeSpec) {
  const multipliers = {
    s: 1000, // segundos
    m: 1000 * 60, // minutos
    h: 1000 * 60 * 60, // horas
    d: 1000 * 60 * 60 * 24, // días
    M: 1000 * 60 * 60 * 24 * 30, // meses aprox (30 días)
    y: 1000 * 60 * 60 * 24 * 365, // años aprox
  };

  const match = /^(\d+)([smhdyM])$/.exec(timeSpec);

  if (!match) {
    throw new Error("Formato inválido, use ej: '6h', '10d', '3M', '1y'");
  }

  const value = parseInt(match[1], 10);
  const unit = match[2];

  const now = new Date();
  const elapsed = now - this.date; // diferencia en ms
  const required = value * multipliers[unit];

  return elapsed >= required;
};

GO_DATE.prototype.isToday = function () {
  const today = new Date();
  return this.date.getDate() === today.getDate() && this.date.getMonth() === today.getMonth() && this.date.getFullYear() === today.getFullYear();
};

GO_DATE.prototype.elapsed = function (format = "s") {
  const now = new Date();
  const elapsed = now - this.date; // diferencia en ms
  const multipliers = {
    s: 1000, // segundos
    m: 1000 * 60, // minutos
    h: 1000 * 60 * 60, // horas
    d: 1000 * 60 * 60 * 24, // días
    M: 1000 * 60 * 60 * 24 * 30, // meses aprox (30 días)
    y: 1000 * 60 * 60 * 24 * 365, // años aprox
  };
  return Math.floor(elapsed / multipliers[format]);
};

GO_DATE.prototype.isPast = function () {
  const now = new Date();
  return this.date < now;
};

GO_DATE.prototype.isFuture = function () {
  const now = new Date();
  return this.date > now;
};

GO_DATE.prototype.toUTCString = function () {
  this.stringDate = this.dateTime();
  this.stringDate = this.stringDate.replace(" ", "T");
  return this.stringDate + ".000Z";
};

GO_DATE.prototype.is = function (date) {
  if ([this.dateTime(), this.ymd()].includes(date)) {
    return true;
  }
  return false;
};

Object.assign(GO, MOD_LUIGIOS_GODATEJS);

const GO_TIME = function (time) {
  this.time = time || Go.date().time();
};

const MOD_LUIGIOS_GOTIMEJS = {
  time: function () {
    return new GO_TIME(...arguments);
  },
  Time: function () {
    return new GO_TIME(...arguments);
  },
};

GO_TIME.prototype.toString = function () {
  return String(this.time);
};

Object.assign(GO, MOD_LUIGIOS_GOTIMEJS);

const GO_MATH = function (data = 0) {
  this.data = data;
};

const MOD_LUIGIOS_GOMATHJS = {
  math: function () {
    return new GO_MATH(...arguments);
  },
};

GO_MATH.prototype.toString = function () {
  return String(this.data);
};

GO_MATH.prototype.toCents = function (decimals) {
  return +this.data * 100;
};

GO_MATH.prototype.toFixed = function (decimals) {
  return +this.data.toFixed(decimals);
};

GO_MATH.prototype.sum = function (num) {
  return +this.data + +num;
};

GO_MATH.prototype.sub = function (num) {
  return +this.data - +num;
};

GO_MATH.prototype.mul = function (num) {
  return +this.data * +num;
};

GO_MATH.prototype.div = function (num) {
  return +this.data / +num;
};

GO_MATH.prototype.round = function (decimals = 0) {
  const factor = Math.pow(10, decimals);
  return Math.round(this.data * factor) / factor;
};

GO_MATH.prototype.random = function (min = 0, max = 1) {
  return Math.random() * (max - min) + min;
};

GO_MATH.prototype.randomInt = function (min = 0, max = 1) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

GO_MATH.prototype.percent = function (percent) {
  return (+this.data / 100) * +percent;
};

GO_MATH.prototype.percentOf = function (total) {
  return (+this.data / +total) * 100;
};

GO_MATH.prototype.abs = function () {
  return Math.abs(this.data);
};

Object.assign(GO, MOD_LUIGIOS_GOMATHJS);

const GO_FIX = function (data = "") {
  this.data = data;
};

const MOD_LUIGIOS_GOFIXJS = {
  fix: function (data = "") {
    return new GO_FIX(data);
  },
};

GO_FIX.prototype.url = function () {
  // Eliminar barras diagonales duplicadas
  this.url = this.data.replace(/([^:]\/)\/+/g, "$1");

  // Corregir otros posibles problemas de formato
  // Por ejemplo, asegurarse de que haya una sola barra al final de la URL
  if (this.url.endsWith("//")) {
    this.url.slice(0, -1);
  }

  return this.url;
};

GO_FIX.prototype.path = GO_FIX.prototype.url;

Object.assign(GO, MOD_LUIGIOS_GOFIXJS);

const GO_INTERVAL = function () {};

const MOD_LUIGIOS_GOINTERVALJS = {
  interval: function () {
    return new GO_INTERVAL(...arguments);
  },
};

Object.assign(GO, MOD_LUIGIOS_GOINTERVALJS);

GO.loadComponents = function () {
const component_goapp = function () {
return { 
 default: {
  beforeRender: function () {},
  render: function () {},
  afterRender: function () {
    document.body.onclick = function () {
      Go.emit("click", this);
    }.bind(this);
  },
}
 
 }
}

Go.component("go-app", component_goapp);

const component_goblock = function () {
return { 
 default: {
  beforeRender: function () {
    this.if ||= this.attrs["if"] || Go.attr(this, "if");
    this.fn ||= this.attrs["fn"] || Go.attr(this, "fn");
    if (this.if && !eval(this.if)) {
      this.remove();
    }
  },
  render: function () {
    this.fn && eval(this.fn);
  },
  afterRender: function () {
    this.cleanAttributes({ exclude: ["class"] });
  },
}
 
 }
}

Go.component("go-block", component_goblock);

const component_gobutton = function () {
return { 
 default: {
  beforeRender: function () {
    this.icon ||= Go.attr(this, "icon");
    this.label ||= Go.attr(this, "label");
    this.color ||= Go.attr(this, "color");
    this.iconright ||= Go.attr(this, "iconright");
    this.ciconAttr ||= Go.attr(this, "ciconattr");
    
    if (this.color) this.style.color = this.color;

    if (Go.is(this.icon, "json")) {
      this.dataIcon = Go.json(this.icon);
      this.icon = this.dataIcon.name;
      this.ciconAttr = this.dataIcon.attr;
    }

    if (Go.is(this.label, "json")) {
      this.dataLabel = Go.json(this.label);
      this.label = this.dataLabel.text || this.dataLabel.title;
      this.labelAttr = this.dataLabel.attr;
      this.desc = this.dataLabel.desc;
    }

    Go.create({
      tag: "go-icon",
      class: "icon",
      name: this.icon,
      if: () => this.icon,
      attrs: this.ciconAttr,
      target: this,
      mode: "append",
    });

    Go.create({
      tag: "go-label",
      class: "go-label",
      target: this,
      if: () => this.label || this.desc,
      mode: "append",
      childrens: [
        { tag: "div", class: "btitle", html: this.label, if: () => this.label },
        { tag: "div", class: "desc", html: this.desc, if: () => this.desc },
      ],
    });

    Go.create({
      tag: "go-icon",
      class: "iconRight",
      name: this.iconright,
      if: () => this.iconright,
      target: this,
      mode: "append",
    });
  },
  render: function () {},
  setIcon: function (name) {
    const icon = this.querySelector("go-icon");
    icon.icon(name);
  },
}
 
 }
}

Go.component("go-button", component_gobutton);

const component_gocamera = function () {
return { 
 default: {
  beforeRender: function () {
    this.onerror ||= this.attrs["onerror"] || Go.attr(this, "onerror") || "";
    this.onerror ||= this.attrs["onError"] || Go.attr(this, "onError") || "";

    Go.style(this, {
      display: "block",
      position: "relative",
      overflow: "hidden",
    });

    this.video = Go.create({
      target: this,
      tag: "video",
      class: "camera",
      attrs: { playsinline: true },
      style: {
        width: "100%",
        height: "auto",
        objectFit: "cover",
      },
    });

    this.loader = Go.create({
      target: this,
      mode: "append",
      tag: "div",
      class: "loader",
      innerHTML: `<go-icon name="gspinner"></go-icon>`,
      style: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        pointerEvents: "none",
        fontSize: "250%",
      },
    });
  },
  render: function () {
    this.setControls();
  },
  afterRender: async function () {
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
      this.video.srcObject = this.stream;
      this.video.play();
      Go.attr(this, "ready", "true");
    } catch (error) {
      Go.attr(this, "error", "true");

      this.error = Go.create({
        target: this,
        tag: "div",
        class: "error",
        innerHTML: Go.getErrorMessage(error),
      });

      if (Go.is(this.onerror, "Function")) {
        this.onerror(error);
      } else if (Go.is(this.onerror, "String")) {
        Go.eval(this.onerror, error);
      }

      console.error(error);
    }

    this.loader.remove();
  },
  setControls: function () {
    this.controls ||= this.attrs["controls"] || Go.attr(this, "controls") || "";
    if (Go.is(this.controls, "false")) return;

    this.btnStyle = {
      width: "calc(var(--gap) * 2.5)",
      height: "calc(var(--gap) * 2.5)",
      borderRadius: "50%",
      backgroundColor: "rgba(232, 240, 254, 0.3)",
      border: "solid 1px var(--border-color)",
    }

    this.controls = Go.create({
      target: this,
      mode: "append",
      tag: "div",
      class: "controls",
      style: {
        position: "absolute",
        bottom: "0",
        display: "flex",
        gap: "var(--gap)",
        width: "100%",
        justifyContent: "center",
        alignItems: "center",
        padding: "var(--gap)",
        opacity: "0",
        pointerEvents: "none",
      },
      childrens: [
        {
          tag: "go-button",
          attrs: { icon: "camera" },
          style: this.btnStyle,
          class: "btn active-btn",
          onclick: () => this.takePhoto(),
        },
      ],
    });

    this.onclick = () => this.toggleControls();
  },
  toggleControls: function () {
    this.showControls = !this.showControls;

    if (this.showControls) {
      this.controls.style.opacity = "1";
      this.controls.style.pointerEvents = "all";
    } else {
      this.controls.style.opacity = "0";
      this.controls.style.pointerEvents = "none";
    }
  },
  takePhoto: function () {
    const self = this;
    const canvas = document.createElement("canvas");
    canvas.width = this.video.videoWidth;
    canvas.height = this.video.videoHeight;
    canvas.getContext("2d").drawImage(this.video, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/jpeg", 0.5);
    this.photo = Go.view({
      class: "default center backdrop",
      closeOutside: true,
      header: false,
      cssVars: {
        "--body-background": "transparent",
      },
      html: Go.create({
        tag: "div",
        style: {
          position: "relative",
          display: "inline-block",
        },
        childrens: [
          {
            tag: "img",
            width: this.video.videoWidth,
            height: this.video.videoHeight,
            src: data,
            class: "image preview",
          },
        ],
        onrender: function () {
          const handler = new Hammer(this);

          handler.on("swipeleft", () => {
            self.photo.close();
          });

          handler.on("swiperight", () => {
            self.photo.close();
          });
        },
      }),
    });
  },
}
 
 }
}

Go.component("go-camera", component_gocamera);

const component_gocarousel = function () {
return { 
 default: {
  beforeRender: async function () {
    this.options = this.attrs["options"] || Go.attr(this, "options") || {}
    this.carouselClass = `carousel-${Go.uuid()}`;
    Go.addClass(this, this.carouselClass);
  },
  render: function () {
    this.slickMount();
  },
  slickMount: async function () {
    const self = this;

    self.options = Go.json(this.options);

    self.prevArrow = `<div class="prev"><a button="active"><go-icon name="chevronLeft"></go-icon></a></div>`;
    self.nextArrow = `<div class="next"><a button="active"><go-icon name="chevronRight"></go-icon></a></div>`;

    Go.cssVars(this, {
      "--slidesToShow": self.options.slidesToShow || 1,
    });

    $(this).slick({
      prevArrow: self.prevArrow,
      nextArrow: self.nextArrow,
      ...self.options,
    });
  },
}
 
 }
}

Go.component("go-carousel", component_gocarousel);

const component_gocarrousel2 = function () {
return { 
 default: {
  beforeRender: function () {
    const self = this;
    this.slots = this.children;
    this.current = 0;
    this.moved = 0;
    this.slidesToScroll = this.attrs["slidesToScroll"] || Go.attr(this, "slidesToScroll") || 1;
    this.slidesToShow = this.attrs["slidesToShow"] || Go.attr(this, "slidesToShow") || 1;
    this.id = Go.uuid();

    if (!this.slots || this.slots.length == 0) return;

    this.template = `<div class="track">`;
    for (let i = 0; i < this.slots.length; i++) {
      this.template += `<div class="item" slide="${i}">${this.slots[i].outerHTML}</div>`;
    }
    this.template += `</div>`;

    this.template += `<div class="arrow prev"><a button="active"><go-icon name="chevronLeft"></go-icon></a></div>`;
    this.template += `<div class="arrow next"><a button="active"><go-icon name="chevronRight"></go-icon></a></div>`;

    Go.cssVars(this, {
      "--slidesToShow": this.slidesToShow,
      "--slidesToScroll": this.slidesToScroll,
      "--slides": this.slots.length,
      "--moved-x": "0px",
    });

    this.observer = Go.observer(this, { intersection: true, attributes: true, childList: true, subtree: true });
    this.observer.on("intersection", ({ entry = {} } = {}) => {
      if (entry.isIntersecting) {
        self.initStyles();
      }
    });
  },
  render: function () {
    this.html(this.template);
    this.initStyles();
  },
  afterRender: async function () {
    const [handler, self] = [Go.drag(this), this];
    let [distance] = [0];
    this.track = this.child(".track");
    this.carouselWidth = this.offsetWidth;
    this.numSlots = this.slots.length;
    this.limitWidth = this.getLimitWidth();

    handler.on("moveStart", (data) => {
      self.track.style.transition = "none";
      self.initStyles();
    });

    handler.on("moving", (data) => {
      distance = self.moved + data.x;
      self.setStyles({ ...data, distance });
    });

    handler.on("moveEnd", (data) => {
      self.track.style.transition = "all 0.3s ease-in-out";
      distance = self.moved + data.x;
      self.moved = distance;

      if (distance > 0) {
        self.moved = 0;
        distance = 0;
      }

      self.setEndStyles({ ...data, distance });
    });

    this.initStyles();

    Go.on(`resizeEnd:${this.id}`, () => {
      this.initStyles();
    });

    this.handlers();
  },
  initStyles: function () {
    Go.cssVars(this, { "--carousel-width": "100%" });

    let { width } = Go.screen();
    let carouselWidth = this.offsetWidth;

    if (carouselWidth > width) {
      carouselWidth = width;
    }

    Go.cssVars(this, { "--carousel-width": carouselWidth + "px" });
  },
  setStyles: function ({ distance, nextIndex }) {
    nextIndex ||= this.current;
    Go.cssVars(this, { "--moved-x": distance + "px", "--current-slide": nextIndex });
  },
  setEndStyles: function ({ distance, x, event, axis }) {
    const itemWidth = this.offsetWidth / this.slidesToShow;
    const movePercent = Go.getPercent(Go.positive(x), this.offsetWidth);
    const itemSlot = event.srcElement.closest("[slide]");
    const index = Go.attr(itemSlot, "slide");
    const direction = x > 0 ? "left" : "right";
    let [nextIndex, nextDistance] = [index, 0];

    this.numSlots = this.querySelectorAll("[slide]").length;
    this.limitWidth = this.getLimitWidth();

    if (direction !== "left" && direction !== "right") return;

    if (movePercent >= 20 && direction === "right") {
      nextIndex = Number(index) + Number(this.slidesToScroll);
      nextDistance = Go.negative(itemWidth * nextIndex);
      distance = nextDistance;
      this.moved = distance;
      let nextSlot = this.querySelector(`[slide="${nextIndex}"]`);

      if (!nextSlot) {
        distance = Go.negative(this.limitWidth);
        this.moved = distance;
        nextIndex = this.numSlots - 1;
      }
    } else if (movePercent >= 20 && direction === "left") {
      nextIndex = Number(index) - Number(this.slidesToScroll);
      nextDistance = Go.negative(itemWidth * nextIndex);
      distance = nextDistance;
      this.moved = distance;

      if (nextIndex < 0) {
        distance = 0;
        this.moved = distance;
        nextIndex = 0;
      }
    } else if (movePercent < 20) {
      nextIndex = Number(index);
      distance = Go.negative(itemWidth * index);
      this.moved = distance;
    }

    if (Go.positive(distance) > Go.positive(this.limitWidth)) {
      distance = Go.negative(this.limitWidth);
      this.moved = distance;
    }

    if (!x) return;

    this.current = nextIndex;

    this.setStyles({ distance, nextIndex, x });
  },
  destroy: function () {
    Go.off(`resizeEnd:${this.id}`);
    this.observer.disconnect();
  },
  handlers: function () {
    this.prevButton = this.child(".arrow.prev");
    this.nextButton = this.child(".arrow.next");

    this.prevButton.onclick = () => this.prev();
    this.nextButton.onclick = () => this.next();
  },
  prev: async function () {
    this.arrowMoved ||= 0;
    this.itemWidth = this.getItemWidth();
    this.prevDistance = this.arrowMoved + this.itemWidth;

    this.moved = this.prevDistance;
    this.arrowMoved = this.prevDistance;
    this.setStyles({ distance: this.prevDistance });

    if (this.prevDistance > 0) {
      this.moved = 0;
      this.prevDistance = 0;
      this.arrowMoved = 0;
      await Go.sleep(Go.env("view_transition_time") / 4);
      this.setStyles({ distance: this.prevDistance });
    }
  },
  next: async function () {
    this.arrowMoved ||= 0;
    this.limitWidth = this.getLimitWidth();
    this.itemWidth = this.getItemWidth();
    this.prevDistance = this.arrowMoved - this.itemWidth;

    this.moved = this.prevDistance;
    this.arrowMoved = this.prevDistance;
    this.setStyles({ distance: this.prevDistance });

    if (Go.positive(this.prevDistance) > Go.positive(this.limitWidth)) {
      this.prevDistance = Go.negative(this.limitWidth);
      this.moved = this.prevDistance;
      this.arrowMoved = this.prevDistance;
      await Go.sleep(Go.env("view_transition_time") / 4);
      this.setStyles({ distance: this.prevDistance });
    }
  },
  getLimitWidth: function () {
    this.itemWidth = this.getItemWidth();
    this.numSlots = this.querySelectorAll("[slide]").length;
    this.limitWidth = this.itemWidth * this.numSlots - this.offsetWidth;
    return this.limitWidth;
  },
  getItemWidth: function () {
    this.itemWidth = this.offsetWidth / this.slidesToShow;
    return this.itemWidth;
  },
}
 
 }
}

Go.component("go-carrousel-2", component_gocarrousel2);

const component_gocircletext = function () {
return { 
 default: {
  beforeRender: function () {
    this.style.display = "inline-flex";
  },
  render: function () {
    this.text = this.textContent.trim();
    this.width = Go.attr(this, "width") || 200;
    this.height = Go.attr(this, "height") || 200;
    this.padding = Go.attr(this, "padding") || 20;
    this.fontFamily = Go.attr(this, "font-family") || "Arial";
    this.color = Go.attr(this, "color") || "black";
    this.fontSize = Go.attr(this, "font-size") || 20;
    this.letterSpacing = Go.attr(this, "letter-spacing") || 0;
    this.radius = Math.min(this.width, this.height) / 2 - this.padding;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
    this.rotate = Go.attr(this, "rotate") || 0;

    this.style.color = this.color;
    this.style.transform = `rotate(${this.rotate})`;

    this.d = `M ${this.centerX},${this.centerY} m -${this.radius},0 a ${this.radius},${this.radius} 0 1,1 ${this.radius * 2},0 a ${this.radius},${this.radius} 0 1,1 -${
      this.radius * 2
    },0`;

    this.innerHTML = `<svg id="svgCanvas" width="${this.width}" height="${this.height}" viewBox="0 0 ${this.width} ${this.height}">
      <defs><path id="circlePath" d="${this.d}" /></defs>
      <text class="circleText" font-size="${this.fontSize}" font-family="${this.fontFamily}" fill="${this.color}" letter-spacing="${this.letterSpacing}">
        <textPath href="#circlePath" startOffset="50%" text-anchor="middle">${this.text}</textPath>
      </text>
    </svg>`;
  },
}
 
 }
}

Go.component("go-circle-text", component_gocircletext);

const component_gocircle = function () {
return { 
 default: {
  beforeRender: function () {
    this.img = this.img || this.attrs["img"] || Go.attr(this, "img") || "";
    if (this.img) {
      this.style.setProperty(`--img`, `url(${this.img})`);
    }
  },
  render: function () {},
}
 
 }
}

Go.component("go-circle", component_gocircle);

const component_gocloudloader = function () {
return { 
 default: {
  setupStyles: {
    "font-size": `var(--size, ${Go.getProp(this, "size", "120px")})`,
  },
  beforeRender: function () {
    this.innerHTML = `<svg
        width="220"
        height="160"
        viewBox="0 0 220 160"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Cloud continuous outline loader"
        role="img"
      >
        <style>
          :root {
            --stroke: var(--primary-color, #000000);
            --w: var(--stroke-width, 12px);
            --dur: var(--duration, 1.5s);
          }

          .cloud.svg-path:not(.currentColor) {
            fill: none;
          }

          .cloud {
            stroke: var(--stroke);
            stroke-width: var(--w);
            stroke-linecap: round;
            stroke-linejoin: round;

            /* escala normalizada */
            stroke-dasharray: 0 100;
            stroke-dashoffset: 0;

            animation: flow var(--dur) linear infinite;
            /* filter: url(#glow); */
            filter: none;
          }

          /*
            FASES (pathLength = 100):
            0–50%  : el trazo crece desde 0 → 100
            50–100%: el inicio del trazo avanza 0 → 100
          */
          @keyframes flow {
            /* empieza vacío */
            0% {
              stroke-dasharray: 0 100;
              stroke-dashoffset: 0;
            }

            /* totalmente dibujado */
            50% {
              stroke-dasharray: 100 0;
              stroke-dashoffset: 0;
            }

            /* se desdibuja desde el inicio hasta desaparecer */
            100% {
              stroke-dasharray: 0 100;
              stroke-dashoffset: -100;
            }
          }
        </style>

        <defs>
          <!-- Glow sutil tipo Liquid Glass -->
          <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="3" result="b"/>
            <feMerge>
              <feMergeNode in="b"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <path
          class="cloud svg-path"
          pathLength="100"
          d="
            M68 118
            C45 118 30 105 30 88
            C30 72 42 60 58 58
            C64 41 80 30 99 30
            C116 30 131 39 139 53
            C141 52 146 51 151 51
            C171 51 188 67 188 88
            C188 106 174 118 155 118
            Z
          "
        />
      </svg>
      `;
  },
}
 
 }
}

Go.component("go-cloud-loader", component_gocloudloader);

const component_gocollapse = function () {
return { 
 default: {
  beforeRender: function () {
    this.title ||= this.label || Go.attr(this, "title") || Go.attr(this, "label");
    this.iconName ||= this.icon || this.attrs["icon"] || Go.attr(this, "icon");
    this.titleIcon ||= Go.attr(this, "titleIcon");
    Go.addClass(this, "go-collapse");

    this.content = Go.create({
      tag: "div",
      class: "go-collapse-slot",
      html: this.slot || this.innerHTML,
    });

    this.summary = Go.create({
      tag: "summary",
      class: "go-collapse-summary",
      childrens: [
        {
          tag: "div",
          class: "go-collapse-title",
          style: { display: "flex", alignItems: "center", gap: "var(--gap)" },
          childrens: [
            {
              tag: "go-icon",
              name: this.titleIcon,
              if: () => this.titleIcon,
            },
            {
              tag: "span",
              html: this.title,
            },
          ],
        },
        {
          tag: "go-icon",
          name: this.iconName || "close",
          class: "go-collapse-icon",
        },
      ],
    });

    this.details = Go.create({
      tag: "details",
      class: "go-collapse-details",
      childrens: [this.summary, this.content],
      target: this,
    });
  },
  afterRender: function () {
    Go.addClass(this, "rendered");
  },
}
 
 }
}

Go.component("go-collapse", component_gocollapse);

const component_gocomponent = function () {
return { 
 default: {
  useMethod: function () {
    this.method ||= this.attrs["method"] || Go.attr(this, "method");
    if (!this.method && !Go.includes(location.origin, "luigios.com")) {
      this.method = "GET";
    } else if (!this.method) {
      this.method = "POST";
    }
    return this.method;
  },
  beforeRender: async function () {
    this.evaluateProps(); // Evaluate slots props
    this.payload ||= this.data || Go.fromJson(Go.attr(this, "payload") || Go.attr(this, "data"));
    this.databox ||= Go.attr(this, "databox");
    this.cache ||= Go.attr(this, "cache");
    this.skeleton ||= Go.attr(this, "skeleton") || Go.prop(this.data, "skeleton") || {}

    this.template = "";
    this.method = this.useMethod();

    if (!this.data.src) return;

    this.src = Go.eval(this.data.src);

    if (Go.is(this.cache, "true")) {
      this.template = Go.config(Go.keyId(this.src));
    }

    if (this.template) return;

    this.template = this.getLoader();

    Go.html(this, this.template);

    try {
      this.template = await Go.executor({
        o1: () => Go.xhr(this.src, { method: this.method, responseType: "text", body: { component: true, ...this.payload, databox: this.databox } }),
        o2: () => Go.xhr(this.src, { method: this.method, responseType: "text", body: { component: true, ...this.payload, databox: this.databox } }),
      });
    } catch (error) {
      this.template = `<div class="error">${Go.getErrorMessage(error)}</div>`;
    }

    if (this.cache && this.template) {
      Go.config(Go.keyId(this.src), this.template);
    }
  },
  render: function () {
    Go.html(this, Go.eval(this.template, this));
  },
  getLoader: function () {
    let template = `<div class="loader" gap f200 dcolor><go-icon name="gspinner"></go-icon></div>`;

    if (this.skeleton && !Go.is(this.skeleton, "false")) {
      template = this.getSkeleton();
    }

    return template;
  },
  getSkeleton: function () {
    let [items, style, itemStyle, iStyle, isObj] = [this.skeleton, "", "", "", false];

    if (Go.is(this.skeleton, "json")) {
      this.skeleton = Go.fromJson(this.skeleton);
    }

    items = this.skeleton.items || 1;
    style = this.skeleton.style || "";
    itemStyle = this.skeleton.itemStyle || "";
    isObj = true;

    let template = `<div class="skeletonLoading" style="${style}">`;

    Go.for(Number(items), (i) => {
      iStyle = `${this.skeleton[`style` + (i + 1)] || ""}`;
      template += `<div class="skeleton item" gap style="${itemStyle}${iStyle}"></div>`;
    });

    template += `</div>`;

    return template;
  },
  afterRender: function () {
    this.removeAttribute("skeleton");
  },
}
 
 }
}

Go.component("go-component", component_gocomponent);

const component_goconfirm = function () {
return { 
 default: {
  loader: function (state = false) {
    if (state) {
      this.html(`<div gap tcenter f200 dcolor><go-icon name="gspinner"></go-icon></div>`);
    } else {
      this.clean();
      this.render();
    }
  },
  beforeRender: function () {
    this.acceptLabel ||= Go.attr(this, "acceptLabel") || Go.lang("accept");
    this.cancelLabel ||= Go.attr(this, "cancelLabel") || Go.lang("cancel");
    this.content = document.createElement("div");
    this.acceptButton = document.createElement("a");
    this.cancelButton = document.createElement("a");
    this.content.appendChild(this.cancelButton);
    this.content.appendChild(this.acceptButton);
    Go.addClass(this.content, "content");
    Go.addClass(this.acceptButton, "button accept primary-button");
    Go.addClass(this.cancelButton, "button cancel secondary-button");
    this.acceptButton.innerText = this.acceptLabel;
    this.cancelButton.innerText = this.cancelLabel;
  },
  render: async function () {
    this.appendChild(this.content);
  },
  afterRender: function () {
    this.acceptButton.onclick = () => this.onAccept();
    this.cancelButton.onclick = () => this.onCancel();
  },
  onAccept: function () {
    let onaccept = this.attrs["onaccept"] || Go.attr(this, "onaccept") || this.onaccept;
    onaccept ||= this.attrs["onconfirm"] || Go.attr(this, "onconfirm") || this.onconfirm;
    const parent = this.attrs["parent"] || Go.attr(this, "parent");
    let view = null;

    if (parent) view = this.closest(parent);

    if (view) view.close();

    if (onaccept) Go.eval(onaccept);
  },
  onCancel: function () {
    const oncancel = this.attrs["oncancel"] || Go.attr(this, "oncancel") || this.oncancel;
    const parent = this.attrs["parent"] || Go.attr(this, "parent");
    let view = null;

    if (parent) view = this.closest(parent);

    if (view) view.close();

    if (oncancel) Go.eval(oncancel);
  },
}
 
 }
}

Go.component("go-confirm", component_goconfirm);

const component_gocountry = function () {
return { 
 default: {
  beforeRender: function () {
    this.name = this.attrs["name"] || Go.attr(this, "name") || "country";
    this.value = this.attrs["value"] || Go.attr(this, "value") || "";
    this.viewBody = ``;
    this.template = `<ul class="list">
      <li class="list-item list-item--chevron list-item--tappable countryItem">
        <div class="list-item__center">${Go.lang("country")}</div>
        <div class="list-item__right list-item--chevron__right">
          <div class="list-item__label labelValue">${this.value}</div>
          <input class="value" type="hidden" name="${this.name}" value="${this.value}" />
        </div>
      </li>
    </ul>`;
    this.viewBody += `<div class="search" sticky-top>`;
    this.viewBody += `<go-input icon="search" placeholder="Buscar" type="text"></go-input>`;
    this.viewBody += `</div>`;
  },
  render: function () {
    this.html(this.template);
  },
  afterRender: function () {
    const self = this;
    this.item = this.child(".countryItem");
    this.item.onclick = function () {
      self.view = Go.view({
        title: `<div padding-x>${Go.lang("country_select")}</div>`,
        class: "default menu bottom fillHeight countrySelect",
        animation: "bottomIn",
        html: self.viewBody,
        onOpen: async function (view) {
          const body = await Go.awaitElement(`#${view.id} go-view-body`);
          const list = document.createElement("go-list");
          list.src = "/api/global/country/list";
          list.item = function ({ item: dataItem, index, itemHeight }) {
            let [item, id, template] = [null, null, ""];
            item = document.createElement("div");
            item.innerHTML = self.itemTemplate(dataItem);
            item.onclick = () => self.clickedItem(dataItem, view);
            return item;
          }
          body.appendChild(list);
        },
      });
    }
  },
  itemTemplate: function (item) {
    return `<div class="list-item list-item--chevron list-item--tappable content">
      <div class="list-item__center">
        <div class="icon flag"><img src="${item.flag}" /></div>
        <div class="name">${item.name}</div>
      </div>
      <div class="list-item__right list-item--chevron__right">
        <div class="list-item__label">${item.callingCodes[0]}</div>
      </div>
    </div>`;
  },
  clickedItem: function (item, view) {
    const input = this.child(".value");
    const label = this.child(".labelValue");
    input.value = item.name;
    label.innerHTML = item.name;
    view.close();

    if (this.onchange) {
      this.onchange(item);
    }
  },
}
 
 }
}

Go.component("go-country", component_gocountry);

const component_goemoji = function () {
return { 
 default: {
  beforeRender: function () {
    this.name ||= Go.attr(this, "name");
    this.emoji = Go.emoji(this.name) || Go.emoji("exclamation");
  },
  render: function () {
    this.innerHTML = this.emoji;
  },
}
 
 }
}

Go.component("go-emoji", component_goemoji);

const component_gofileimage = function () {
return { 
 default: {
  beforeRender: function () {
    this.content = document.createElement("label");
    this.input = document.createElement("input");
    this.previewElement = document.createElement("img");
    this.input.type = "file";
    this.input.accept = "image/*";
    this.content.appendChild(this.input);
    this.width ||= this.attrs["width"] || Go.attr(this, "width") || 200;
    this.height ||= this.attrs["height"] || Go.attr(this, "height") || 200;
    this.previewElement.src = this.preview || this.value || this.attrs["value"] || Go.attr(this, "value") || "";
    this.inputName = this.name || this.attrs["name"] || Go.attr(this, "name") || "";
    Go.cssVar(this, "--width", this.width + "px");
    Go.cssVar(this, "--height", this.height + "px");
    Go.addClass(this.content, "content");
    Go.addClass(this.previewElement, "preview");
    this.content.appendChild(this.previewElement);
    this.info = document.createElement("input");
    this.info.type = "hidden";
    this.info.name = this.inputName + "_info";
    this.content.appendChild(this.info);

    this.inputValue = Go.create({
      tag: "input",
      name: this.inputName,
      type: Go.if({
        cond: () => Go.getProp(this, ["acceptURL", "acceptText", "acceptUrl"]),
        true: "text",
        else: "file",
      }),
      target: this,
      mode: "append",
      [Go.if({
        cond: () => Go.getProp(this, ["acceptURL", "acceptText", "acceptUrl"]),
        true: "value",
      })]: Go.getProp(this, "value", ""),
    });
  },
  render: function () {
    this.child(this.content);
    if (this.label) {
      Go.create({ tag: "div", mode: "prepend", target: this, class: "label", html: this.label });
    }
  },
  afterRender: function () {
    const self = this;

    this.input.onchange = function (files) {
      if (!files.target.files.length) return;
      const file = files.target.files[0];
      Go.addClass(self, "loading");
      Go.readFIle(file, "image").then((data) => {
        self.setInfo(data, file);
        Go.removeClass(self, "loading");
        self.emit("change", data);
      });
    }

    this.ondragover = function (e) {
      Go.prevent(e);
    }

    this.ondrop = function (e) {
      Go.prevent(e);
      const files = e.dataTransfer.files;
      if (!files.length) return;
      const file = files[0];
      Go.readFIle(file, "image").then((data) => {
        self.setInfo(data, file);
        self.emit("change", data);
        const event = new CustomEvent("change", { detail: { files } });
        self.dispatchEvent(event);
        Go.removeClass(self, "loading");
      });
    }

    Go.create({
      if: () => Go.getProp(this, ["acceptURL", "acceptText", "acceptUrl"]),
      tag: "go-button",
      target: this.content,
      mode: "append",
      icon: "pencil",
      class: "primary-circle onactive",
      style: { position: "absolute", top: "var(--gap)", right: "var(--gap)", zIndex: 1 },
      onclick: (e) => {
        Go.prevent(e);
        this.prompt = Go.prompt({
          title: Go.getProp(this, "label"),
          class: "menu center prompt gap default prompt-input view-go-input",
          icon: Go.config("appIcon") || "",
          closeOutside: true,
          value: Go.getProp(this, "inputValue.value", this.value),
          placeholder: Go.getProp(this, "placeholder", this.label),
          type: Go.getProp(this, "inputType", "text"),
          onconfirm: (value) => {
            this.inputValue.type = "text";
            this.inputValue.value = value;
            this.previewElement.src = value;
          },
        });
      },
    });
  },
  setInfo: function (data, file) {
    const [self, img] = [this, new Image()];

    img.onload = function () {
      const info = { width: this.width, height: this.height, size: file.size, type: file.type }
      self.emit("info", info);
      self.previewElement.src = data;
      self.info.value = Go.json(info);
      self.inputValue.type = "file";

      const dt = new DataTransfer();
      dt.items.add(file);
      self.inputValue.files = dt.files;

      Go.addClass(self, "loaded");
    }

    img.src = data;
  },
}
 
 }
}

Go.component("go-fileimage", component_gofileimage);

const component_gohtml = function () {
return { 
 default: {
  beforeRender: async function () {
    this.tempHtml = this.attrs["temp-html"] || Go.attr(this, "temp-html") || this.attrs["tmp"] || Go.attr(this, "tmp") || `<go-icon name="gspinner"></go-icon>`;
    this.method = this.attrs["method"] || Go.attr(this, "method") || "GET";
    this.cache = this.attrs["cache"] || Go.attr(this, "cache") || Go.getProp(this, "cache") || "";
    this.src = this.attrs["src"] || Go.attr(this, "src") || Go.getProp(this, "src");
    this.html(this.tempHtml);

    this.store = Go.store(Go.keyString(this.cache || this.src));

    this.dataTemplate = this.store.get("template");

    if (Go.is(this.cache, "false")) {
      this.dataTemplate = "";
    }

    if (this.dataTemplate) {
      return this.render();
    }

    try {
      this.dataTemplate = await Go.executor({
        o1: () => Go.xhr(this.src, { method: this.method, responseType: "text" }),
        o2: () => Go.xhr(this.src, { method: this.method, responseType: "text" }),
      });
      this.store.set("template", this.dataTemplate);
      this.render();
    } catch (error) {
      this.dataTemplate = `<div class="error">`;
      this.dataTemplate += Go.getErrorMessage(error, Go.lang("error_loading_template"));
      this.dataTemplate += `</div>`;
    }
  },
  render: function () {
    const noeval = this.attrs["noeval"] || Go.attr(this, "noeval");

    if (noeval) {
      return this.html(this.dataTemplate);
    }

    Go.html(this, Go.eval(this.dataTemplate));
  },
}
 
 }
}

Go.component("go-html", component_gohtml);

const component_goicon = function () {
return { 
 default: {
  beforeRender: function () {
    this.retryNum ||= 0;
    this.name ||= Go.getProp(this, "attrs.name") || Go.attr(this, "name");
    this.name ||= Go.getProp(this, "attrs.icon") || Go.attr(this, "icon");
    this.attr ||= Go.getProp(this, "attrs.attr") || Go.attr(this, "attr");
    this.alt ||= Go.getProp(this, "attrs.alt") || Go.attr(this, "alt");
    this.svg = this.getSVG(this.name);

    if (this.attr) {
      Go.setAttr(this, this.attr);
    }
  },
  render: function () {
    if (this.name !== "this") {
      this.innerHTML = this.svg;
    }
  },
  getSVG: function () {
    if (!this.name) return "";

    this.isImage = this.name && (Go.is(this.name, "path") || this.name.startsWith("data:image") || this.name.startsWith("/"));
    this.isSVG = this.name && this.name.startsWith("<svg");

    if (this.isImage) {
      return `<img class="image" src="${this.name}"></img>`;
    } else if (this.isSVG) {
      return this.name;
    }

    Go.addClass(this, `go-icon-${this.name}`);

    this.lowerName = this.name && this.name.replace(/-/g, "_");
    this.lowerName = Go.lower(this.lowerName);

    if (this.alt) {
      this.lowerNameAlt = this.alt && this.alt.replace(/-/g, "_");
      this.lowerNameAlt = Go.lower(this.lowerNameAlt);
      this.altIcon = Go.icons(this.alt) || Go.icons(this.lowerNameAlt);
    }

    this.iconSVG = Go.icons(this.name) || Go.icons(this.lowerName) || this.altIcon;

    if (!this.iconSVG) {
      this.retryIcon();
    }

    return this.iconSVG || "?";
  },
  icon: function (name) {
    this.name = name;
    Go.attr(this, "name", name);
    this.svg = this.getSVG(this.name);
    this.render();
  },
  retryIcon: function () {
    if (this.retryNum >= 5) {
      return "?";
    }

    setTimeout(() => {
      this.retryNum += 1;
      this.svg = this.getSVG(this.name);
      this.render();
    }, 1000);
  },
  change: function () {
    return this.icon(...arguments);
  },
  update: function () {
    return this.icon(...arguments);
  },
}
 
 }
}

Go.component("go-icon", component_goicon);

const component_goinput = function () {
return { 
 default: {
  beforeRender: function () {
    this.type ||= Go.attr(this, "type");
    this.icon ||= Go.attr(this, "icon");
    this.bind ||= Go.attr(this, "bind");
    this.name ||= Go.attr(this, "name");
    this.value ||= Go.attr(this, "value") || "";
    this.label ||= Go.attr(this, "label");
    this.decode ||= Go.attr(this, "decode");
    this.encode ||= Go.attr(this, "encode");
    this.oninput ||= Go.attr(this, "oninput") || this.onInput || Go.attr(this, "onInput");
    this.format ||= Go.attr(this, "format");
    this.onName ||= Go.attr(this, "on-name") || Go.attr(this, "onName");
    this.onValue ||= Go.attr(this, "on-value") || Go.attr(this, "onValue");
    this.offName ||= Go.attr(this, "off-name") || Go.attr(this, "offName");
    this.offValue ||= Go.attr(this, "off-value") || Go.attr(this, "offValue");
    this.readonly ||= Go.attr(this, "readonly") || "";
    this.placeholder ||= Go.attr(this, "placeholder") || "";
    this.autocomplete ||= Go.attr(this, "autocomplete") || "";
    this.hiddens ||= this.inputs;
    this.idClass = `input${Go.uuid()}`;
    this.template = "";
    this.events = "";
    this.isFile = false;
    this.iconAttrs = "";
    this.isCustomInput = false;

    Go.addClass(this, [this.idClass, "go-input"]);

    if (this.icon && typeof this.icon === "object") {
      this.iconAttrs = `${this.icon.original ? "original" : ""} ${this.icon.attrs || ""}`;
      this.icon = this.icon.name;
    }

    if (this.icon && !["custom", "prompt"].includes(this.type)) {
      this.icon = `<go-icon name="${this.icon}" ${this.iconAttrs || ""}></go-icon>`;
      this.hasIcon = true;
    }

    if (this.label) {
      this.template += `<label>${this.label}</label>`;
    }

    this.template += `<div class="contain ${this.icon ? "__icon" : ""}">`;

    if (this.hasIcon) {
      this.template += `${this.icon || ""}`;
    }

    if (this.readonly) {
      this.readonly = `readonly="${this.readonly}"`;
    }

    if (this.autocomplete) {
      this.autocomplete = `autocomplete="${this.autocomplete}"`;
    }

    let type = {
      default: this.type,
      textarea: this.type === "textarea",
      textbox: this.type === "textbox",
      filebox: this.type === "filebox" || this.type === "file",
      toggle: this.type === "toggle",
      switch: this.type === "switch",
      tags: this.type === "tags",
      select: this.type === "select",
      fileimage: () => this.inputFileImage(),
      prompt: () => this.inputPrompt(),
      searchbox: () => this.inputSearch(),
      datalist: () => this.inputDataList(),
    }

    if (["function"].includes(typeof type[this.type])) {
      type[this.type]();
    } else if (type.textarea) {
      type = {}
      this.template += `<textarea class="input textarea" name="${this.name}" style="${Go.serializeStyle(this.inputStyle) || ""}" 
      placeholder="${this.placeholder || this.label || ""}" 
      ${this.readonly} ${this.autocomplete} ${this.getInputAttrs()}>${this.value}</textarea>`;
    } else if (type.textbox) {
      type = {}

      if (Go.is(this.decode, "true") || Go.is(this.encode, "true")) {
        this.value = decodeURIComponent(this.value);
      }

      const initValue = () => (this.value && encodeURIComponent(this.value)) || "";

      if (Go.is(this.format, "false")) {
        this.events += `onpaste='Go.clipboard(event).clean()' `;
      }

      this.template += `<div contenteditable="true" class="input textarea" name="${this.name}" 
      placeholder="${this.placeholder || this.label || ""}" style="${Go.serializeStyle(this.inputStyle) || ""}" 
      ${this.readonly} ${this.autocomplete} ${this.events} ${this.getInputAttrs()}>${this.value || ""}</div>
      <input class="value" role="texboxValue" type="hidden" name="${this.name}" value="${initValue()}" />`;
    } else if (type.filebox) {
      type = {}
      this.isFile = true;
      this.template += `<label class="fileWrap" w100>`;
      this.template += `<input class="input" name="${this.name}" type="file" ${this.readonly} ${this.accept} style="${Go.serializeStyle(this.inputStyle) || ""}" />`;
      this.template += `<div class="finput input" ${this.getInputAttrs()}><span class="innerText">${this.placeholder || Go.lang("not_file_selected") || ""}</span></div>`;
      this.template += `</label>`;
    } else if (type.toggle || type.switch) {
      this.template += `<go-toggle name="${this.name}" value="${this.value}" off-value="${this.offValue || "off"}" 
      on-value="${this.onValue || "on"}" on-name="${this.onName || ""}" 
      off-name="${this.offName || ""}"></go-toggle>`;
      this.addClass("toggle");
    } else if (type.tags) {
      this.inputTags();
    } else if (["datetime"].includes(this.type)) {
      this.inputDateTime();
    } else if (type.select) {
      this.template += `<select class="input" name="${this.name}" style="${Go.serializeStyle(this.inputStyle) || ""}" ${this.getInputAttrs()}>`;
      Go.for(this.options, (option) => {
        option.selected ||= option.value === this.value;
        this.template += `<option value="${option.value}" ${option.selected ? "selected" : ""}>
          ${option.html || option.label || option.name || option.value}
        </option>`;
      });
      this.template += `</select>`;
    } else if (type.default) {
      this.template += `<input class="input" name="${this.name}" type="${this.type}" style="${Go.serializeStyle(this.inputStyle) || ""}" 
      placeholder="${this.placeholder || this.label || ""}" value="${this.value || ""}" 
      ${this.readonly} ${this.autocomplete} ${this.getInputAttrs()} />`;
    }

    if (this.hiddenInput) {
      this.template += `<input type="hidden" name="${this.hiddenInput.name || `hidden_${this.name}`}" value="${this.hiddenInput.value}" />`;
    }

    this.template += `</div>`;
  },
  render: async function () {
    this.innerHTML = Go.eval(this.template);
  },
  fileInput: function () {
    if (!this.isFile) return;

    this.fileNameBox = this.querySelector(".innerText");

    this.inputBox.onchange = function (e) {
      this.hasFile = !!e.target.files[0];
      this.fileNameBox.innerHTML = this.hasFile ? e.target.files[0].name : Go.lang("not_file_selected");
      this.setAttribute("filled", this.hasFile);
    }.bind(this);
  },
  afterRender: async function () {
    this.textbox = this.querySelector("div[contenteditable]");
    this.textboxValue = this.querySelector("input[role=texboxValue]");

    try {
      this.inputBox = this.querySelector(`input[name=${this.name}]`);
    } catch (error) {}

    if (![this.limitChars].includes(undefined)) {
      this.inputBox.oninput = (e) => {
        if (this.limitChars && e.target.value.length > this.limitChars) {
          e.target.value = e.target.value.slice(0, this.limitChars);
        }
      }
    }

    this.fileInput();

    if (this.textbox) {
      this.textbox.addEventListener("input", () => {
        this.textboxValue.value = encodeURIComponent(this.textbox.innerHTML);
      });
    }

    if (this.bind) {
      this.isBindSelector = Go.is(this.bind, "HTMLInputElement");
      this.setBind(this.value);
      this.inputBox.addEventListener("input", (e) => {
        this.setBind(e.target.value);

        if (Go.is(this.oninput, "function")) {
          this.oninput(e, e.target.value);
        }

        if (Go.is(this.oninput, "string")) {
          eval(this.oninput);
        }
      });
    }

    const onEnter = this.onenter || this.onEnter;
    if (onEnter && ["function"].includes(typeof onEnter)) {
      this.inputBox.addEventListener("keydown", (e) => {
        if (["Enter"].includes(e.key)) {
          onEnter(e, e.target.value);
        }
      });
    }

    this.hiddenInputs();
  },
  setBind: function (value) {
    if (this.isBindSelector) {
      const el = document.querySelector(this.bind);
      el.value = value;
    } else {
      eval(this.bind + ' = "' + value + '"');
    }
  },
  inputTags: async function () {
    const self = this;
    this.contain = await Go.awaitForElement(".contain", this);
    this.tags ||= Go.attr(this, "tags");
    this.single ||= Go.attr(this, "single");
    this.input = Go.create({ target: this, mode: "append", tag: "input", type: "hidden", name: this.name, value: this.value });

    this.set = Go.if({
      cond: () => Go.is(this.value, "array"),
      true: () => new Set(this.value),
      else: () => new Set(this.value.split(",")),
    });

    if (typeof this.tags === "string" && this.tags.includes(",")) {
      this.tags = this.tags.split(",");
    }

    Go.style({
      target: this.contain,
      css: { gap: "var(--gap)", flexWrap: "var(--flex-wrap, wrap)", justifyContent: "var(--justify-content, flex-start)" },
    });

    this.clearAll = function () {
      Go.for(self.contain.querySelectorAll(".tag"), (el) => Go.removeClass(el, "active"));
      self.set.clear();
    }

    this.setValue = function (el, value) {
      if (self.set.has(value)) {
        self.set.delete(value);
        Go.removeClass(el, "active");
      } else {
        if (self.single) this.clearAll();
        self.set.add(value);
        Go.addClass(el, "active");
      }
    }

    Go.for(this.tags, (tag) => {
      this.contain.appendChild(
        Go.create({
          tag: "span",
          class: `tag ${Go.is(tag, "string") ? "" : tag.class || ""}`,
          html: Go.is(tag, "string") ? Go.lang(tag) : tag.label || tag.name || tag.html,
          value: Go.is(tag, "string") ? tag : tag.value || tag.name,
          onclick: function () {
            self.setValue(this, this.value);
            self.input.value = Array.from(self.set).join(",");
            self.input.dispatchEvent(new Event("input"));

            const oninput = this.onInput || this.oninput || this.ontag || this.ontag;
            if (["function"].includes(typeof oninput)) {
              oninput.apply(this, [tag, self.set]);
            }

            const onInput = self.onInput || self.oninput || self.ontag || self.ontag;
            if (["function"].includes(typeof onInput)) {
              onInput.apply(this, [tag, self.set]);
            }
          },
          onrender: function () {
            if (self.set.has(this.value)) {
              Go.addClass(this, "active");
            }
          },
          ...(Go.is(tag, "string") ? {} : tag),
        })
      );
    });
  },
  inputDateTime: async function () {
    Go.create({
      tag: "div",
      target: await Go.awaitForElement(".contain", this),
      style: {
        width: "100%",
        display: "flex",
        gap: "var(--gap)",
        justifyContent: "var(--justify-content, space-between)",
      },
      childrens: [
        {
          tag: "input",
          type: "date",
          name: Go.getProp(this.names, "0"),
          style: { width: "100%" },
          value: Go.getProp(this.values, "0"),
          class: "input",
        },
        {
          tag: "input",
          type: "time",
          name: Go.getProp(this.names, 1),
          style: { width: "100%" },
          value: Go.getProp(this.values, 1),
          class: "input",
        },
      ],
    });
  },
  val: function (value) {
    Go.value(this.find(".input"), value);
    Go.html(this.find(".input"), value);
    Go.value(this.find(".value"), value);
  },
  getInputAttrs: function () {
    if (!this.inputAttrs) return "";
    return Go.serializeAttrs(this.inputAttrs);
  },
  hiddenInputs: function () {
    this.hInputs = Go.create({
      tag: "div",
      class: "hidden hiddens hidden-inputs",
      target: this,
      mode: "append",
      if: () => this.hiddens,
      childrens: Go.is(this.hiddens, "array") ? this.hiddens : [this.hiddens],
    });
  },
  inputFileImage: function () {
    this.fileimage = Go.create({
      tag: "go-fileimage",
      target: this,
      name: this.name,
      scope: this,
      awaitElement: ".contain",
    });
    this.fileimage.extend(this);
  },
  inputPrompt: function () {
    this.input = Go.create({
      tag: "input",
      name: this.name,
      scope: this,
      target: ".contain",
      awaitElement: ".contain",
      class: "input",
      attrs: {
        readonly: !0,
        placeholder: Go.getProp(this, "placeholder", this.label),
      },
      value: this.value,
      type: Go.getProp(this, "inputType", "text"),
      onclick: () => {
        this.prompt = Go.prompt({
          title: Go.getProp(this, "label"),
          class: "menu center prompt gap default prompt-input view-go-input",
          icon: Go.config("appIcon") || "",
          closeOutside: true,
          value: Go.getProp(this, "input.value", this.value),
          placeholder: Go.getProp(this, "placeholder", this.label),
          type: Go.getProp(this, "inputType", "text"),
          onconfirm: (value) => {
            this.input.value = value;
            this.input.updatePreviews();
          },
        });
      },
      onrender: () => {
        this.input.updatePreviews();
        this.inputIcon = Go.create({
          tag: "go-icon",
          if: () => this.icon,
          scope: this,
          target: ".contain",
          attrs: { name: this.icon },
          class: "icon",
          awaitElement: ".contain",
          mode: "prepend",
        });
      },
      updatePreviews: () => {
        this.previews = {
          img: () => this.input.imagePreview(),
        }
        if (["function"].includes(typeof this.previews[this.preview])) {
          this.previews[this.preview]();
        }
      },
      imagePreview: () => {
        Go.create({
          tag: "img",
          scope: this,
          target: ".contain",
          src: this.input.value,
          awaitElement: ".contain",
          class: "preview",
          mode: this.input.value ? "prepend" : "remove",
          replace: true,
          onclick: () => {
            Go.media(this.input.value).imagePreview();
          },
        });
      },
    });
  },
  inputSearch: function () {
    this.inputValue = Go.create({
      tag: "input",
      type: "hidden",
      scope: this,
      name: Go.getProp(this, "name", ""),
      value: Go.getProp(this, "value", ""),
      target: ".contain",
      awaitElement: ".contain",
      onrender: () => {
        this.textValue = Go.create({
          tag: "input",
          scope: this,
          target: ".contain",
          awaitElement: ".contain",
          class: "input cursor",
          mode: "append",
          replace: true,
          placeholder: Go.getProp(this, "placeholder", this.label),
          type: "text",
          attrs: { readonly: !0 },
          value: Go.getProp(this, "valueText", ""),
          onclick: () => {
            this.search = Go.search({
              ...Go.getProp(this, "view", {}),
              title: Go.getProp(this, "placeholder", this.label),
              src: Go.getProp(this, "src"),
              value: Go.getProp(this, "valueText", ""),
              body: Go.getProp(this, "body", {}),
              item: (item) => ({
                tag: "a",
                class: "block border radius padding",
                html: Go.getProp(item, Go.getProp(this, "keys.text", "name")),
                onclick: () => {
                  this.textValue.value = Go.getProp(item, Go.getProp(this, "keys.text"), "");
                  this.inputValue.value = Go.getProp(item, Go.getProp(this, "keys.value"), "");

                  if (this.hiddens) {
                    this.hInputs.findAll("input").forEach((hidden) => {
                      hidden.value = Go.getProp(item, Go.getProp(hidden, "key"), "");
                    });
                  }

                  this.search.close();
                },
              }),
            });
          },
        });
      },
    });
  },
  inputDataList: function () {
    this.dataId = "datalist" + Go.uid();
    Go.create({
      tag: "div",
      scope: this,
      target: ".contain",
      awaitElement: ".contain",
      class: "datalist",
      mode: "append",
      style: { width: "100%" },
      childrens: [
        {
          tag: "input",
          attrs: { list: this.dataId, name: Go.getProp(this, "name", "") },
          placeholder: Go.getProp(this, "placeholder", this.label),
          style: { width: "100%" },
          class: "input",
          value: Go.getProp(this, "value", ""),
        },
        {
          tag: "datalist",
          id: this.dataId,
          childrens: Go.getProp(this, "options", Go.getProp(this, "datalist", [])),
        },
      ],
    });
  },
}
 
 }
}

Go.component("go-input", component_goinput);

const component_gointrinsic = function () {
return { 
 default: {
  beforeRender: function () {
    this.width = Go.prop("width", this) || Go.prop("width", this.attrs) || 100;
    this.height = Go.prop("height", this) || Go.prop("height", this.attrs) || 100;

    // Crea un elemento canvas
    const canvas = document.createElement("canvas");
    canvas.width = this.width; // Ancho de la imagen
    canvas.height = this.height; // Alto de la imagen

    // Obtiene el contexto 2D del canvas
    const ctx = canvas.getContext("2d");

    // Llena el canvas con un fondo transparente
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Convierte el canvas en una imagen
    this.imagenTransparente = new Image();
    this.imagenTransparente.src = canvas.toDataURL("image/png");
  },
  render: function () {
    this.clean();
    this.appendChild(this.imagenTransparente);
    // Agrega la imagen al elemento
  },
}
 
 }
}

Go.component("go-intrinsic", component_gointrinsic);

const component_goitem = function () {
return { 
 default: {
  beforeRender: function () {
    Go.create({
      tag: "div",
      class: "left",
      target: this,
      childrens: [
        {
          tag: "div",
          style: { lineHeight: 1 },
          childrens: [
            {
              class: "flex-gap",
              childrens: [
                {
                  tag: "go-icon",
                  name: Go.getProp(this, "icon", Go.attr(this, "icon")),
                  if: () => Go.getProp(this, "icon", Go.attr(this, "icon")),
                },
                {
                  tag: "div",
                  childrens: [
                    {
                      tag: "span",
                      html: Go.getProp(this, "label", Go.attr(this, "label")),
                      class: "label",
                    },
                    {
                      tag: "go-spacer",
                      num: 0.5,
                    },
                    {
                      tag: "div",
                      class: "desc",
                      html: Go.getProp(this, "desc", Go.attr(this, "desc")),
                      style: { fontSize: "85%" },
                      if: () => Go.getProp(this, "desc", Go.attr(this, "desc")),
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

    this.value ||= Go.getProp(this, "value", Go.attr(this, "value"));

    if (this.value) {
      this.right = { tag: "div", html: this.value, class: "rightValue" }
    }

    Go.create({
      tag: "div",
      if: () => Go.getProp(this, "right", Go.attr(this, "right")),
      childrens: [Go.getProp(this, "right", Go.attr(this, "right"))],
      target: this,
      class: "right",
      mode: "append",
    });
  },
}
 
 }
}

Go.component("go-item", component_goitem);

const component_goitems = function () {
return { 
 default: {
  initialize: async function (cb) {
    await this.prepareList();
    await this.fetchItems(cb);
  },
  restart: function (cb) {
    this.page = 1;
    this.initialize(cb);
  },
  beforeRender: async function () {
    this.req ||= {}
    this.body ||= {}
    this.endpoint ||= this.src || this.url || Go.attr(this, "endpoint") || Go.attr(this, "src") || Go.attr(this, "url");
    this.page ||= Go.attr(this, "page") || 1;
    this.limit ||= Go.attr(this, "limit") || 100;
    this.query ||= this.q || Go.attr(this, "query") || "";
    this.notFoundMessage ||= Go.attr(this, "notFoundMessage") || Go.lang("no_result_found");
    this.errorMessage ||= Go.attr(this, "errorMessage");
    this.container = this.container || Go.attr(this, "container") || this;
    this.titles ||= Go.attr(this, "titles") || [];
    this.footer ||= Go.attr(this, "footer") || [];
    this.skeleton ||= Go.attr(this, "skeleton");
    this.skeletonItems ||= Go.getProp(this, "skeletonItems", this.limit);
    this.prependItems ||= this.unshift || this.unshiftItems;
    this.onerror ||= this.error || this.onerror || this.onError;
    this.reqPayload ||= {}

    this.prevItems = Go.if({
      cond: () => !this.skeleton,
      true: null,
      else: Go.arrayFill(this.skeletonItems, {
        name: Go.lang("loading"),
        className: "itemSkeleton",
        ...Go.getProp(this, "skeletonItem", {}),
        isSkeleton: true,
      }),
    });

    if (this.autoStart !== false) {
      this.initialize();
    }
  },
  prepareList: async function () {
    this.isTable ||= this.titles.length;

    if (this.isTable) {
      this.ths = Go.create({ tag: "tr", if: () => this.titles.length });
      this.container = Go.create({ tag: "tbody" });
    }

    Go.create({
      tag: "table",
      target: this,
      style: { width: "100%", ...(this.containerStyle || {}) },
      childrens: [this.ths, this.container, this.createFooter()],
      attrs: { ...(this.containerAttrs || {}) },
      if: () => this.isTable,
    });

    Go.for(this.titles, (title) => {
      typeof title === "string" && (title = { html: title });
      title.target = this.ths;
      title.mode = "append";
      title.tag = "th";
      Go.create(title);
    });

    if (this.prevItems) {
      this.renderItems(this.prevItems, { skeleton: true });
    }

    if (this.skeletonDelay) {
      await Go.sleep(this.skeletonDelay);
    }
  },
  fetchItems: async function (cb, opts = {}) {
    this.removeClass("error");
    this.page = Go.getProp(opts || this.body, "page", this.page);
    this.bodyData = { page: this.page, limit: this.limit, query: this.query, ...(this.body || {}), ...(this.reqPayload || {}) }

    if (!this.endpoint && !this.request) {
      return this.callBack(cb);
    }

    this.addClass("loading");

    try {
      this.req = await Go.executor({
        opt1: async () => await Go.throw(await this.request(this.bodyData)),
        opt2: async () => await Go.http.post(this.endpoint, { body: this.bodyData, cache: this.cache, cacheId: this.cacheId }),
        silent: true,
      });
    } catch (error) {
      this.req = { error, message: Go.getErrorMessage(error) }
    }

    this.reqPayload = Go.getProp(this.req, ["reqPayload", "cbPayload"], this.reqPayload);

    this.removeClass("loading");

    if (Go.getProp(this.req, "error")) {
      return this.requestError(cb);
    }

    if (["function"].includes(typeof this.onload)) {
      this.req = this.onload(this.req) || this.req;
    }

    if (Go.getProp(this.req, "message")) {
      return this.requestError(cb);
    }

    if (!Go.has(Go.getProp(this.req, "items"), "items")) {
      return this.requestNotFound(cb);
    }

    this.page = Go.getProp(this.req, "page", this.page);

    if (this.prependItems && Go.eq(this.page, 1)) {
      this.renderItems([...this.prependItems, ...this.req.items]);
    } else {
      this.renderItems(this.req.items);
    }

    if (["function"].includes(typeof this.onItemsRender)) {
      this.onItemsRender(this.req);
    }

    this.callBack(cb);
  },
  requestError: function (cb) {
    if (["function"].includes(typeof this.onError)) {
      this.onError(this.req);
    }

    this.addClass("error");

    this.message = Go.create({
      target: this.container,
      tag: this.isTable ? "tr" : "div",
      class: "go-list-message internal-error",
      html: Go.create({
        tag: this.isTable ? "td" : "div",
        html: Go.lang(this.errorMessage || Go.getErrorMessage(this.req) || "error"),
        class: "msgIn",
        attrs: { colspan: this.titles.length },
      }),
      style: {
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        gap: "calc(var(--gap) * 1)",
        width: "100%",
        ...(this.messageStyle || {}),
      },
      animation: this.messageAnimation,
      onrender: () => {
        this.paginateBtn?.loading(false);
        this.callBack(cb);
        this.container.classList.add("error");
      },
      replace: true,
      mode: this.page > 1 ? "append" : "put",
      child: Go.create({
        if: () => this.page <= 1,
        tag: "div",
        class: "go-list-error-options",
        child: {
          tag: "go-button",
          class: "primary-button",
          label: Go.lang("retry"),
          onclick: () => this.restart(cb),
        },
      }),
      ...(this.errorComponent || this.errorComp || {}),
    });
  },
  requestNotFound: function (cb) {
    if (["function"].includes(typeof this.onNotFound)) {
      this.onNotFound();
    }

    this.message = Go.create({
      target: this.container,
      tag: this.isTable ? "tr" : "div",
      class: "go-list-message not-found",
      html: Go.create({
        tag: this.isTable ? "td" : "div",
        html: Go.lang(this.notFoundMessage),
        class: "msgIn",
        attrs: { colspan: this.titles.length },
      }),
      style: { ...(this.messageStyle || {}) },
      animation: this.messageAnimation,
      onrender: () => {
        Go.remove(this.paginateBtn, this);
        this.callBack(cb);
        this.container.classList.add("not-found");
      },
      replace: true,
      mode: this.page > 1 ? "append" : "put",
      child: this.notFoundComponent || this.notFoundChild,
      ...(this.notFound || {}),
    });
  },
  renderItems: function (items, opts = {}) {
    this.isFirstLoaded = !opts.skeleton && this.prevItems && this.page === 1;
    this.needClearTarget = this.page <= 1;

    Go.attrs(this, { length: items.length || this.container.count(".go-list-item") });
    Go.remove(".go-list-message", this);

    if (this.isFirstLoaded) {
      this.rendedItems = this.findAll(".go-list-item");

      Go.for(this.rendedItems, (item, index) => {
        Go.if({
          cond: () => items[index],
          true: () => Go.replaceNode(item, this.createItem(items[index], index)),
          else: () => item.remove(),
        });
      });

      if (this.rendedItems.length < items.length) {
        Go.for(items.slice(this.rendedItems.length), (item, index) => {
          item = this.createItem(item, index);
          item && this.container.appendChild(item);
        });
      }
    } else {
      Go.if({
        cond: () => this.needClearTarget,
        true: () => this.container.clean(),
      });

      Go.for(items, (item, index) => {
        item = this.createItem(item, index);
        item && this.container.appendChild(item);
      });
    }

    Go.sleep(10, () => this.pagination());
  },
  addItem: function (item) {
    this.req.items = Go.array(this.req.items).unshift(item);
    this.renderItems(this.req.items);
  },
  appendItem: function (item) {
    this.req.items = Go.array(this.req.items).push(item);
    this.renderItems(this.req.items);
  },
  updateItem: function (item, key = "_id") {
    this.req.items = this.req.items.map((i) => (Go.eq(Go.getProp(i, key), Go.getProp(item, key)) ? item : i));
    this.renderItems(this.req.items);
  },
  createItem: function (item, index) {
    let [_item, tag] = [null, "div"];

    if (this.isTable) tag = "tr";

    if (item.isSkeleton && typeof this.itemSkeleton === "function") {
      _item = this.itemSkeleton(item, index);
    } else if (typeof this.item === "function") {
      _item = this.item(item, index);
    } else {
      _item = Go.create({ tag: tag, html: item.name });
    }

    if (!Go.isElement(_item) && ["object"].includes(typeof _item)) {
      _item = Go.create(_item);
    }

    _item?.classList?.add("go-list-item");
    _item?.classList?.add(Go.getProp(item, "className", "nc"));

    if (index % 2 === 0) {
      _item?.classList?.add("even");
    } else {
      _item?.classList?.add("odd");
    }

    return _item;
  },
  removeItem: function (item, key = "_id") {
    this.req.items = this.req.items.filter((i) => !Go.eq(Go.getProp(i, key), Go.getProp(item, key)));
    this.renderItems(this.req.items);
  },
  callBack: function (cb) {
    const onFinish = this.onfinish || this.finish || this.onFinish;

    if (["function"].includes(typeof cb)) {
      cb.call(this, this.req);
    }

    if (["function"].includes(typeof onFinish)) {
      onFinish.call(this, this.req);
    }
  },
  pagination: function () {
    this.paginateBtn = Go.create({
      if: () => !Go.is(this.paginate, "false"),
      target: this,
      tag: "a",
      mode: Go.getProp(this.req, "hasMore") ? "append" : "remove",
      class: "paginationItem onactive",
      replace: true,
      style: {
        backgroundColor: "var(--primary-color)",
        color: "white",
        padding: "calc(var(--gap))",
        borderRadius: "calc(var(--gap) * 1.5)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "calc(var(--gap) * 0.5)",
        ...((this.paginate && this.paginate.style) || {}),
      },
      childrens: [
        { tag: "go-icon", attrs: { name: "plus" } },
        { tag: "span", class: "name", innerHTML: Go.lang("load_more") },
      ],
      ...(this.paginate || {}),
      onclick: () => {
        this.paginateBtn.loading(true);
        this.fetchItems(null, { page: this.page + 1 });
        Go.remove(this.message, this);
        if (["function"].includes(typeof this.onPaginate)) {
          this.onPaginate();
        }
      },
    });
  },
  createFooter: function () {
    return Go.create({
      tag: "tr",
      if: () => this.footer.length,
      childrens: this.footer,
    });
  },
  deleteItem: function (selector) {
    return Go.remove({
      el: this.container.querySelector(selector),
      scope: this.container,
    });
  },
}
 
 }
}

Go.component("go-items", component_goitems);

const component_golist = function () {
return { 
 default: {
  beforeRender: async function () {
    this.items = [];
    this.page ||= 1;
    this.tagList = this.tagList || this.attrs["tagList"] || Go.attr(this, "tagList") || "";
    this.src = this.src || this.attrs["src"] || Go.attr(this, "src");
    this.itemHeight = this.itemHeight || this.attrs["itemHeight"] || Go.attr(this, "itemHeight") || 70;
    this.item = this.item || this.attrs["item"] || Go.attr(this, "item");
    this.heightGap = this.heightGap || this.attrs["heightGap"] || Go.attr(this, "heightGap") || 100;
    this.query = {}

    Go.html(this, '<loading centered absolute><go-icon name="gspinner"></go-icon></loading>');

    try {
      this.req = await Go.http.get(`${this.src}?page=${this.page}&${Go.objectToQuery(this.query)}`);
      this.items = this.req.items;
    } catch (error) {
      this.html(Go.getErrorMessage(error, Go.lang("error_loading_items")));
    }

    if (this.tagList) {
      Go.changeTagName(this, this.tagList);
    }
  },
  render: function () {
    if (!this.items || !this.items.length) {
      return this.html(Go.app.noItemsTemplate());
    }

    let { height, isTablet, isDesktop, isMobile } = Go.screen();

    if (isMobile) {
      this.itemHeight = this.itemHeight;
      this.heightGap = this.heightGap;
    }

    this.list = Go.list({
      target: this,
      itemHeight: this.itemHeight,
      height: height - this.heightGap,
      padding: { bottom: 20 + "px" },
    });

    if (Go.is(this.item, "string")) {
      this.item = this.evalItem(this.item);
    }

    this.list.item = (item, index) => this.item({ item, index, itemHeight: this.itemHeight });

    if (Number(this.page) <= 1) {
      this.list.render(this.items);
    } else {
      this.list.append(this.items);
    }
  },
  evalItem: function (string) {
    let _function = string;

    if (Go.is(string, "stringFunction")) {
      _function = string.split("(")[0].trim();
    }

    return (data) => eval(_function).bind(this)(data);
  },
  setQuery: function (query) {
    Object.assign(this.query, query);
  },
}
 
 }
}

Go.component("go-list", component_golist);

const component_gomodule = function () {
return { 
 default: {
  beforeRender: async function () {
    this.evaluateProps();
    this.src ||= this.data.src || Go.attr(this, "src");
    this.data.target = this;
    await Go.module({
      src: Go.url(this.src).absolute(),
      props: this.data,
    });
  },
}
 
 }
}

Go.component("go-module", component_gomodule);

const component_gooptions = function () {
return { 
 default: {
  beforeRender: function () {
    this.options ||= Go.attr(this, "options") || [];
    Go.for(this.options, (option) => {
      const myOption = this.option(option);
      if (myOption) {
        this.appendChild(myOption);
      }
    });
  },
  option: function (option) {
    const self = this;
    option.iconRight ||= option.iconright;
    option.class = `go-option ${Go.replace(option.class, 'go-option', '')}`;
    
    const template = (html = "") => {
      html += `${option.icon ? `<go-icon class="icon" name="${option.icon}"></go-icon>` : ""}`;
      html += `<go-label class="label">${option.label || option.name}</go-label>`;
      html += `${option.iconRight ? `<go-icon class="iconRight" name="${option.iconRight}"></go-icon>` : ""}`;
      return html;
    }

    return Go.create({
      tag: option.tag || "go-option",
      html: template(),
      onclick: function (evt) {
        self.callback(option, evt);
      },
      ...option,
    });
  },
  callback: function (option, evt) {
    if (option.fn) {
      return option.fn(option, evt);
    }

    this.onselect ||= this.onSelect || option.onselect || option.onSelect;
    this.onselect ||= this.onchoose || this.onChoose || option.onchoose || option.onChoose;

    if (this.onselect) {
      return this.onselect(option, evt);
    }
  },
}
 
 }
}

Go.component("go-options", component_gooptions);

const component_goprogress = function () {
return { 
 default: {
  beforeRender: function () {
    this.id = `progress-${Go.uuid()}`;
    this.height = `${this.attrs.height || 10}px`;
    this.width = `${this.attrs.width || 100}%`;
    this.color = this.attrs.color || Go.attr(this, `color`) || Go.prop(this, `color`) || "var(--primary-color)";
    this.line = document.createElement(`go-progress-line`);
    this.line.id = `line-${this.id}`;

    Go.style(this, {
      width: this.width,
      height: this.height,
      display: "block",
      position: "relative",
      overflow: "hidden",
      "background-color": "#000",
    });

    Go.style(this.line, {
      width: "0%",
      height: "100%",
      display: "block",
      "background-color": this.color,
    });
  },
  render: function () {
    this.clean();
    this.appendChild(this.line);
  },
  progress: function (value) {
    if (!value) return;
    Go.style(this.line, { width: `${Go.removeSpecialChars(value)}%` });
  },
}
 
 }
}

Go.component("go-progress", component_goprogress);

const component_goscript = function () {
return { 
 default: {
  beforeRender: function () {
    this.script = this.innerText;
    this.src = this.attrs["src"] || Go.attr(this, "src");
    this.style.display = "none";

    if (this.src) {
      Go.load(this.src);
    }
  },
  render: function () {
    if (!this.script) return;
    eval(this.script);
  },
}
 
 }
}

Go.component("go-script", component_goscript);

const component_gosearch = function () {
return { 
 default: {
  beforeRender: function () {
    this.icon = document.createElement("go-icon");
    this.input = document.createElement("input");
    this.label = this.prop("attrs.label") || Go.lang("Search");
    Go.attrs(this.input, { type: "text", name: "q", placeholder: this.label + "...", autocomplete: "off" });
    Go.attrs(this.icon, { name: "search" });
    Go.style(this, {
      position: "relative",
      display: "flex",
      color: "currentColor",
      width: "100%",
      "align-items": "center",
    });
    Go.style(this.icon, {
      position: "absolute",
      left: "calc(var(--gap) * 1.5)",
      color: "currentColor",
      "margin-right": "10px",
      "pointer-events": "none",
    });
    Go.style(this.input, {
      width: "100%",
      border: "none",
      outline: "none",
      padding: "calc(var(--gap) * 0.5) calc(var(--gap) * 1.5) calc(var(--gap) * 0.5) calc(var(--gap) * 4)",
      color: "currentColor",
      "font-size": "100%",
      "background-color": "rgba(0, 0, 0, 0)",
    });
  },
  render: function () {
    this.appendChild(this.icon);
    this.appendChild(this.input);
  },
  afterRender: function () {
    this.input.oninput = () => {
      this.emit("input", this.input.value);
    }

    this.input.onkeyup = (e) => {
      if (e.keyCode === 13) {
        this.emit("enter", this.input.value);
      }
    }

    this.input.onfocus = () => {
      this.emit("focus", this.input.value);
    }

    this.input.onblur = () => {
      this.emit("blur", this.input.value);
    }

    this.input.onchange = () => {
      this.emit("change", this.input.value);
    }
  },
}
 
 }
}

Go.component("go-search", component_gosearch);

const component_goselectcontent = function () {
return { 
 default: {
  getData: async function () {
    return await Go.http.get(`${this.src}?q=${this.q}`, { responseType: "text" });
  },
  beforeRender: async function () {
    this.id = `select-${Go.uuid()}`;
    this.src = this.src || Go.attr(this, "src") || "";
    this.search = this.search || Go.attr(this, "search") || "";
    this.q = this.q || Go.attr(this, "q") || "";
    this.goSearch = null;
    this.template = "";

    if (this.src) {
      this.html(Go.spinnerLoading);
    }

    if (this.search) {
      this.template += `<div class="search">`;
      this.template += `<div><go-input type="text" icon="search" placeholder="${Go.lang("search")}" autocomplete="off" 
      value="${this.q}"></go-input><div>`;
      this.template += `</div>`;
    }

    if (!this.src) return;

    try {
      this.data ||= await this.getData();
      this.template += `<div class="src_content">`;
      this.template += this.data;
      this.template += `</div>`;
    } catch (error) {
      this.template += `<div class="src_error" padding>`;
      this.template += Go.getErrorMessage(error);
      this.template += `</div>`;
    }
  },
  render: function () {
    if (this.src) {
      this.html(this.template);
    }

    if (this.slotDefault) {
      this.append(this.slotDefault);
    }
  },
  afterRender: async function () {
    this.input = await Go.awaitElement(`#${this.id} .search input`);

    if (!this.input) return;

    this.input.onkeyup = function (e) {
      this.q = e.target.value;
      clearTimeout(this.goSearch);
      this.goSearch = setTimeout(async () => {
        this.template = await this.getData();
        Go.html(`#${this.id} .src_content`, this.template);
      }, 400);
    }.bind(this);
  },
}
 
 }
}

Go.component("go-select-content", component_goselectcontent);

const component_goselect = function () {
return { 
 default: {
  beforeRender: async function () {
    this.id = `select-${Go.uuid()}`;
    this.label = this.label || this.attrs["label"] || Go.attr(this, "label") || Go.lang("select");
    this.name = this.name || this.attrs["name"] || Go.attr(this, "name") || "";
    this.value = this.value || this.attrs["value"] || Go.attr(this, "value") || "";
    this.src = this.src || this.attrs["src"] || Go.attr(this, "src") || "";

    this.slotDefault = this.querySelector(`[slot]`);
    this.content = document.createElement("go-select-content");
    this.content.className = "go-select-content";
    this.content.innerHTML = this.innerHTML;
    this.input = document.createElement("input");
    this.input.type = "hidden";
    this.input.name = this.name;
    this.input.value = this.value;
    this.content.slotDefault = this.slotDefault;
    Go.extends(this.content, this.attrs);

    if (this.label) {
      this.put(`<div class="go-select-label list-item--tappable"><span class="text">${this.label}</span></div>`);
    }
  },
  afterRender: function () {
    this.handler = this.child(".go-select-label");
    this.x = 0;
    this.y = 0;

    this.handler.onclick = function (e) {
      e.stopPropagation();
      this.classList.toggle("open");
      this.open(e);
    }.bind(this);

    Go.once("click:select", (e) => {});
  },
  close: function () {
    this.classList.remove("open");
  },
  open: function (e) {
    this.x = e.clientX;
    this.y = e.clientY;

    this.info = Go.info(this.handler);
    this.y = this.info.screenTop + this.info.height;
    this.x = this.info.screenLeft;

    this.view = Go.view({
      header: false,
      style: `--x: ${this.x}px; --y: ${this.y}px;--parent-width: ${this.info.width}px;`,
      class: "select go-select",
      closeOutside: true,
      html: this.content,
      onClose: () => this.close(),
      animate: {
        duration: 200,
        from: {
          opacity: 0,
          transform: "translateY(-1rem)",
        },
        to: {
          opacity: 1,
          transform: "translateY(0)",
        },
      },
    });

    this.content.onclick = function (e) {
      let [value, text] = [Go.attr(e.target, "value"), e.target.innerHTML];

      if (!value) return;

      if (!Go.is(e.target, "tagName", "go-option")) {
        return;
      }

      e.stopPropagation();

      const label = Go.attr(e.target, "label");

      if (label) {
        text = label;
      }

      Go.putHTML(this.child(".go-select-label .text"), text);
      this.input.value = value;
      Go.attr(this, "value", value);
      Go.uniClass("selected", e.target, this.content);
      this.view.close();
      this.trigger("change", { value, text, e });
    }.bind(this);
  },
  trigger: function (event, data) {},
}
 
 }
}

Go.component("go-select", component_goselect);

const component_goshadow = function () {
return { 
 default: {
  beforeRender: async function () {
    this.payload ||= Go.fromJson(Go.attr(this, "payload") || Go.attr(this, "data"));
    this.databox ||= Go.attr(this, "databox");
    this.src ||= Go.attr(this, "src");
    this.dataTemplate = "";
    this.dataStyle = "";
    this.dataScript = "";
    this.shadow = this.attachShadow({ mode: "open" });
    this.req ||= Go.config(Go.keyId(this.src), this.req);

    if (this.req) return;

    try {
      this.req = await Go.http.get(this.src, { responseType: "text", body: { component: true, ...this.payload, databox: this.databox } });
      Go.config(Go.keyId(this.src), this.req);
    } catch (error) {
      this.req = `<template><div class="error">${Go.getErrorMessage(error)}</div></template>`;
    }
  },
  render: function () {
    this.req = Go.eval(this.req, this);
    this.dataTemplate = Go.getBetween("<template>", "</template>", this.req);
    this.dataStyle = Go.getBetween("<style>", "</style>", this.req);
    this.dataScript = Go.getBetween("<script>", "</script>", this.req);

    const sheet = new CSSStyleSheet();
    sheet.replaceSync(this.dataStyle);

    this.shadow.adoptedStyleSheets = [sheet];

    this.template = document.createElement("div");
    this.template.innerHTML = this.dataTemplate;

    this.shadow.appendChild(this.template);

    if (this.dataScript) {
      const script = document.createElement("script");
      script.textContent = this.dataScript;
      this.shadow.appendChild(script);
    }
  },
  select: function (selector) {
    return this.shadow.querySelector(selector);
  },
}
 
 }
}

Go.component("go-shadow", component_goshadow);

const component_goslideshow = function () {
return { 
 default: {
  beforeRender: async function () {
    this.id ||= `slide-${Go.uuid()}`;
    this.images = Go.json(Go.prop("images", this.attrs) || Go.attr(this, "images"));
    this.options = Go.json(Go.prop("options", this.attrs) || Go.attr(this, "options"));
    this.options ||= this.dataset || {}
  },
  render: function () {
    this.slickMount();
  },
  slickMount: async function () {
    this.prevArrow = `<div class="prev"><a button="active"><go-icon name="chevronLeft"></go-icon></a></div>`;
    this.nextArrow = `<div class="next"><a button="active"><go-icon name="chevronRight"></go-icon></a></div>`;

    $(this).slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      prevArrow: this.prevArrow,
      nextArrow: this.nextArrow,
      ...this.options,
    });
  },
}
 
 }
}

Go.component("go-slideshow", component_goslideshow);

const component_gospacer = function () {
return { 
 default: {
  beforeRender: function () {
    this.num ||= this.attrs["num"] || Go.attr(this, "num") || 1;
    this.style.setProperty("--num", this.num);
  },
  render: function () {},
}
 
 }
}

Go.component("go-spacer", component_gospacer);

const component_gostyle = function () {
return { 
 default: {
  beforeRender: function () {
    this.id = this.id || this.attrs["id"] || Go.attr(this, "id") || Go.uuid();
    this.styleText = this.innerText;
    if (this.styleText) {
      Go.cssTag(`go-style-${this.id}`, this.styleText);
    }
  },
}
 
 }
}

Go.component("go-style", component_gostyle);

const component_gotabs = function () {
return { 
 default: {
  beforeRender: function () {
    this.tabs = this.querySelectorAll("[tab]");
    this.handlers = this.querySelectorAll("[handler]");
    this.handlers.forEach((tab) => (tab.onclick = () => this.handClick.bind(this)(tab)));
  },
  render: function () {},
  afterRender: function () {
    this.opened = this.attrs["opened"] || Go.attr(this, "opened");
    if (this.opened) {
      this.activeTab(this.opened);
    }
  },
  handClick: function (tab) {
    const tabName = Go.attr(tab, "handler");
    this.activeTab(tabName);
  },
  activeTab: function (tabName) {
    Go.uniqueClass("active", `[handler="${tabName}"], [tab="${tabName}"]`, this);
  },
}
 
 }
}

Go.component("go-tabs", component_gotabs);

const component_gotag = function () {
return { 
 default: {
  beforeRender: function() {
    this.style.padding = `calc(var(--mpadding)/4) calc(var(--mpadding)/1.5)`;
    this.style.borderRadius = `2pc`;
    this.style.backgroundColor = `var(--tag-background)`;
    this.style.color = `var(--tag-color)`;
    this.style.display = `inline-block`;
  },
  render: function() {
    if (this.attrs["label"]) {
      this.innerHTML = this.attrs["label"];
    }
  },
}
 
 }
}

Go.component("go-tag", component_gotag);

const component_gotemplate = function () {
return { 
 default: {
  content: function () {
    this.content = `<template id="my-component-template">
        <!-- Contenido del componente -->
    </template>
    <style>
        /* Estilos del componente */
    </style>
    `;
    return this.content;
  },
  beforeRender: function () {},
  afterRender: async function () {},
  destroy: async function () {},
}
 
 }
}

Go.component("go-template", component_gotemplate);

const component_gotoggle = function () {
return { 
 default: {
  beforeRender: function () {
    this.tOggle = document.createElement("label");
    this.sWitch = document.createElement("div");
    this.input = document.createElement("input");
    this.input.style.display = "none";
    this.input.name = this.name || this.attrs["name"];
    this.offValue ||= this.attrs["off-value"] || "off";
    this.onValue ||= this.attrs["on-value"] || "on";
    this.onName ||= this.attrs["on-name"] || "";
    this.offName ||= this.attrs["off-name"] || "";
    this.tOggle.classList.add("toggle");
    this.sWitch.classList.add("switch");
    this.tOggle.appendChild(this.sWitch);

    Go.create({
      tag: "span",
      target: this.tOggle,
      mode: "prepend",
      class: "label-text",
      if: () => this.label || Go.attr(this, "label"),
      html: this.label || Go.attr(this, "label"),
    });
  },
  render: function () {
    this.appendChild(this.tOggle);
    this.appendChild(this.input);
  },
  afterRender: function () {
    const self = this;
    const oninput = this.attrs["oninput"] || Go.attr(this, "oninput");
    const onchecked = this.attrs["onchecked"] || Go.attr(this, "onchecked");
    const onunchecked = this.attrs["onunchecked"] || Go.attr(this, "onunchecked");

    this.onclick = function () {
      const checked = Go.is(Go.attr(this, "checked"), "true");
      this.input.value = checked ? self.offValue : self.onValue;
      const active = this.input.value === self.onValue;

      self.result = { value: this.input.value }

      if (this.onName) {
        this.input.name = checked ? this.offName : this.onName;
      }

      if (checked) {
        Go.attr(this, "checked", false);
        Go.attr(this.input, "value", self.offValue);
        self.emit("unchecked", self.result);
        this.goOnUnchecked();
      } else {
        Go.attr(this, "checked", true);
        Go.attr(this.input, "value", self.onValue);
        self.emit("checked", self.result);
        this.goOnChecked();
      }

      self.emit("input oninput", self.result);

      if (Go.is(oninput, "Function")) {
        oninput(self.result);
      }

      if (Go.is(oninput, "stringFunction")) {
        Go.eval(oninput, self.result);
      }

      if (active && Go.is(onchecked, "stringFunction")) {
        Go.eval(onchecked, self.result);
      }

      if (!active && Go.is(onunchecked, "stringFunction")) {
        Go.eval(onunchecked, self.result);
      }

      this.form = self.closest("form");

      if (this.form && Go.is(this.form.onchange, "Function")) {
        this.form.onchange(self.result);
      }

      if (this.form && Go.is(this.form.onchange, "stringFunction")) {
        Go.eval(this.form.onchange, self.result);
      }
    }

    if ((this.value || this.attrs["value"]) === this.onValue) {
      Go.attr(this, "checked", true);
      this.input.value = this.onValue;
      this.input.name = this.onName ? this.onName : this.input.name;
      Go.attr(this.input, "value", this.onValue);
    } else {
      Go.attr(this, "checked", false);
      this.input.value = this.offValue;
      this.input.name = this.onName ? this.offName : this.input.name;
      Go.attr(this.input, "value", this.offValue);
    }
  },
  check: function () {
    Go.attr(this, "checked", true);
    this.input.value = this.onValue;
    this.input.name = this.onName ? this.onName : this.input.name;
    Go.attr(this.input, "value", this.onValue);
  },
  uncheck: function () {
    Go.attr(this, "checked", false);
    this.input.value = this.offValue;
    this.input.name = this.onName ? this.offName : this.input.name;
    Go.attr(this.input, "value", this.offValue);
  },
  goOnChecked: function () {
    if (Go.is(this.onchecked, "function")) {
      this.onchecked(this.result);
    }
  },
  goOnUnchecked: function () {
    if (Go.is(this.onunchecked, "function")) {
      this.onunchecked(this.result);
    }
  },
}
 
 }
}

Go.component("go-toggle", component_gotoggle);

const component_goui = function () {
return { 
 default: {
  beforeRender: async function () {
    this.evaluateProps();

    this.classList.add("loading");

    if (this.prop("native") || this.data.mode == "native" || this.data.native) {
      return await this.native();
    }

    this.shadowDOM = this.attachShadow({ mode: "open" });

    this.cssFile = Go.fix(this.data.src + "/index.css").url();
    this.jsFile = Go.fix(this.data.src + "/index.js").url();
    this.htmlFile = Go.fix(this.data.src + "/index.html").url();

    this.styleData = await Go.http.get(this.cssFile, { responseType: "text", cache: true });
    this.htmlData = await Go.http.get(this.htmlFile, { responseType: "text", cache: true });

    const style = document.createElement("style");
    style.textContent = Go.eval(this.styleData, this.data);
    this.shadowDOM.appendChild(style);

    const html = document.createElement("template");
    html.innerHTML = Go.eval(this.htmlData, this.data);
    this.shadowDOM.appendChild(html.content);

    this.shadowDOM.addEventListener("click", (event) => {
      Go.do("nav/event", event);
    });
  },
  render: function () {
    this.classList.remove("loading");
  },
  native: async function () {
    try {
      this.srcData = Go.fix(this.data.src).url();
      this.dataSrc = await Go.http.get(this.srcData, { responseType: "text", cache: true });
    } catch (error) {
      this.dataSrc = Go.getErrorMessage(error);
    }
    this.innerHTML = Go.eval(this.dataSrc, this.data);
  },
  afterRender: function () {
    this.onrender ||= this.data.onrender || this.data.onRender || this.onRender || Go.attr(this, "onrender");
    if (typeof this.onrender === "function") {
      this.onrender();
    } else if (typeof this.onrender === "string") {
      Go.eval(this.onrender, this);
    }
  },
}
 
 }
}

Go.component("go-ui", component_goui);

const component_goviewbackground = function () {
return { 
 default: {
  beforeRender: function () {
    if (this.data.background) {
      Go.style(this, this.data.background.style || {});
    }
  },
}
 
 }
}

Go.component("go-view-background", component_goviewbackground);

const component_goviewbody = function () {
return { 
 default: {
  beforeRender: async function () {
    this.template ||= this.attrs["template"] || Go.attr(this, "template") || Go.getProp(this, "template");
    this.template ||= this.attrs["src"] || Go.attr(this, "src") || Go.getProp(this, "src");
    this.method = this.attrs["method"] || Go.attr(this, "method") || Go.getProp(this, "method") || "GET";
    this.payload = this.attrs["payload"] || Go.attr(this, "payload") || Go.getProp(this, "payload") || "";
    this.cache = this.attrs["cache"] || Go.attr(this, "cache") || Go.getProp(this, "cache") || "";
    this.iframe = this.attrs["iframe"] || Go.attr(this, "iframe") || Go.getProp(this, "iframe") || "";
    this.dataTemplate = "";
    this.isCache = false;

    if (this.data.body) {
      Go.style(this, Go.prop(this.data, "body.style") || {});
    }

    if (this.data.bodyOptions) {
      Go.style(this, Go.prop(this.data, "bodyOptions.style") || {});
    }

    if (!this.template) return;

    if (this.iframe) {
      this.dataTemplate = this.iframeTemplate();
      return;
    }

    Go.html(this, Go.spinnerLoading);

    if (Go.is(this.cache, "true")) {
      this.isCache = true;
    }

    if (this.isCache) {
      this.store = Go.store(Go.keyString(this.template));
      this.dataTemplate = this.store.get("template");
    }

    if (this.dataTemplate) {
      return;
    }

    try {
      this.dataTemplate = await Go.executor({
        o1: () => Go.xhr(this.template, { method: this.method, responseType: "text", body: this.payload }),
        o2: () => Go.xhr(this.template, { method: this.method, responseType: "text", body: this.payload }),
      });

      if (this.isCache) {
        this.store.set("template", this.dataTemplate);
      }
    } catch (error) {
      this.dataTemplate = "";
      this.html({
        tag: "div",
        html: Go.getErrorMessage(error, Go.lang("error_loading_content")),
        class: "contentError",
      });
    }
  },
  render: function () {
    this.preBody ||= this.beforeBody || this.data?.beforeBody || this.data?.preBody;
    this.afterBody ||= this.posBody || this.data?.afterBody || this.data?.posBody;

    if (this.preBody) {
      this.prepend(this.preBody);
    }

    if (this.dataTemplate) {
      this.html(Go.eval(this.dataTemplate));
    }

    const scripts = this.getElementsByTagName("script") || [];
    for (let script of scripts) {
      eval(script.innerHTML); // Ejecuta el contenido del script
    }

    if (this.afterBody) {
      this.append(this.afterBody);
    }
  },
  iframeTemplate: function () {
    let [src, template, style, attrs] = [this.iframe, "", "", {}];

    if (Go.is(this.iframe, "object")) {
      src = this.iframe["src"];
      attrs = this.iframe["attrs"] || {}
    }

    style += "width: 100%; height: 100%; border: none";

    template += `<iframe class="bodyFrame" src="${src}" style="${style}"></iframe>`;

    return template;
  },
  afterRender: async function () {
    this.module ||= this.data["module"] || this.attrs["module"] || Go.attr(this, "module") || Go.getProp(this, "module");
    this.modProps = {}

    if (typeof this.module === "object") {
      this.modProps = this.module;
      this.module = this.module["src"];
    }

    if (this.module && !this.module.startsWith("/") && !this.module.startsWith("http") && !this.module.startsWith(Go.base())) {
      this.module = Go.base("", this.module);
    }

    if (this.module) {
      await Go.module({ src: this.module, props: this.props, loader: () => Go.loader(), ...this.modProps, srcElement: this });
    }

    if (Go.is(this.data.afterRender, "function")) {
      await this.data.afterRender(this.view, this);
    }

    if (typeof this.rendered === "function") {
      this.rendered.apply(this);
    }
  },
}
 
 }
}

Go.component("go-view-body", component_goviewbody);

const component_goviewcontent = function () {
return { 
 default: {
  beforeRender: function () {
    this.viewId = this.prop("viewId");

    if (this.data.style) {
      Go.style(this, this.data.style);
    }

    if (this.data.content) {
      Go.style(this, this.data.content.style || {});
    }

    Go.attrs(this, {
      center: this.center || this.prop("centerContent") || this.prop("centerMode") || this.prop("center") || false,
    });
  },
  afterRender: async function () {
    Go.on(`resizeEnd:${Go.keyId(this.viewId)}`, this.setInfo.bind(this));
    Go.sleep(Go.env("view_transition_time"), () => this.setInfo());

    if (Go.getProp(this, "data.content.class")) {
      Go.addClass(this, Go.getProp(this, "data.content.class"));
    }
  },
  destroy: async function () {
    Go.off(`resizeEnd:${Go.keyId(this.viewId)}`);
  },
  setInfo: function () {
    this.header = this.querySelector("go-view-header");
    this.headerHeight = this.header ? this.header.offsetHeight : 0;
    Go.setCssVars(this, {
      "--width": this.offsetWidth + "px",
      "--height": this.offsetHeight + "px",
      "--content-header-height": this.headerHeight + "px",
      "--content-height": `calc(${this.offsetHeight}px - ${this.headerHeight}px)`,
      "--content-width": `${this.offsetWidth}px`,
    });
  },
}
 
 }
}

Go.component("go-view-content", component_goviewcontent);

const component_goviewfooter = function () {
return { 
 default: {
  beforeRender: function () {
    if (this.data.footer) {
      Go.style(this, this.data.footer.style || {});
    }
  },
}
 
 }
}

Go.component("go-view-footer", component_goviewfooter);

const component_goviewheader = function () {
return { 
 default: {
  beforeRender: function () {
    Go.style(this, Go.prop(this.data, "header.style") || {});

    if (this.html && Go.is(this.html, "HTMLElement")) {
      return this.appendChild(this.html);
    }

    this.left = Go.create({
      target: this,
      mode: "append",
      tagName: "go-view-header-left",
      style: { display: "flex", gap: "var(--gap)" },
      child: {
        tag: "go-view-title",
        childrens: [
          {
            tag: "go-icon",
            class: "icon",
            if: () => Go.prop(this.data, "icon") || Go.prop(this.data, "header.left.icon"),
            name: Go.prop(this.data, "icon") || Go.prop(this.data, "header.left.icon"),
          },
          {
            tag: "span",
            class: "text",
            html: Go.prop(this.data, "title"),
            if: () => Go.prop(this.data, "title") || Go.prop(this.data, "header.left.title"),
            attrs: { "line-clamp": 2 },
          },
        ],
      },
      ...(Go.prop(this.data, "headerLeft") || {}),
      ...(Go.prop(this.data, "header.left") || {}),
    });

    this.right = Go.create({
      target: this,
      mode: "append",
      tagName: "go-view-header-right",
      child: {
        tagName: "go-button",
        icon: "times",
        role: "close",
        ...(Go.prop(this.data, "header.close") || {}),
        if: () => !Go.is(this.data.closeButton, "false"),
        onclick: () => this.view.close(() => Go.trigger(this, "data.onCloseButton")),
      },
      ...(Go.prop(this.data, "headerRight") || {}),
      ...(Go.prop(this.data, "header.right") || {}),
    });
  },
}
 
 }
}

Go.component("go-view-header", component_goviewheader);

const component_goview = function () {
return { 
 default: {
  beforeRender: async function () {
    this.bodyTemplate = this.data["template"] || "";
    this.bodyHTML = this.data["html"] || this.data["body"] || "";
    this.bodyStyle = this.data["style"] || "";
    this.lockBody = this.data["lockBody"];
    this.onview = this.data["onview"];
    this.htmlIn = this.data["htmlIn"] || this.data["inner"] || "";
    this.viewAttrs = Go.json(Go.prop("viewAttrs", this.data)) || {}
    this.targetClean = Go.prop("targetClean", this.data);
    this.headerHeight = Go.prop("headerHeight", this.data) || Go.config("headerHeight") || Go.config("header-height");
    this.cssVars ||= this.data.cssVars || this.data.cssVariables;
    this.instance._beforeOpen();

    if (typeof this.viewAttrs === "object") {
      this.viewAttrs["onview"] = this.onview;
    }

    this.childsData = {
      view: this,
      data: this.data || {},
      viewId: this.id,
      cache: this.data.cache || this.data.body?.cache || "",
    }

    Go.attrs(this, {
      ...(this.viewAttrs || {}),
      close: this.data.close || this.data.closeButton,
      header: this.data.header,
    });

    if (this.cssVars) {
      Go.cssVars(this, this.cssVars);
    }

    this.backgroundElement = document.createElement("go-view-background");
    this.backgroundElement.classList.add("ViewBackground");

    this.contentElement = document.createElement("go-view-content");
    this.contentElement.setAttribute("view-id", this.id);
    this.contentElement.classList.add("ViewContent");

    this.headerElement = document.createElement("go-view-header");
    this.headerElement.classList.add("ViewHeader");

    this.bodyElement = Go.create({
      tag: "go-view-body",
      class: "ViewBody",
      childrens: this.data.childrens || [],
      ...(this.data.body || {}),
      calculateHeight: function () {
        this.style.setProperty("--scroll-height", `${this.scrollHeight}px`);
        this.observer = Go.observer({ el: this, mutation: true, childList: true, subtree: true, characterData: true });
        this.observer.on("mutation", (evt) => {
          this.style.setProperty("--scroll-height", `${this.scrollHeight}px`);
        });
      },
      beforeContent: function (el, options) {
        options.calculateHeight.apply(el);
      },
      onrender: function (el, options) {
        options.calculateHeight.apply(el);
      },
      rendered: function () {
        Go.sleep(100, () => {
          this.style.setProperty("--scroll-height", `auto`);
        });
      },
    });

    this.body = this.bodyElement;
    this.header = this.headerElement;

    Object.assign(this.backgroundElement, this.childsData);
    Object.assign(this.contentElement, this.childsData);
    Object.assign(this.headerElement, this.childsData);
    Object.assign(this.bodyElement, this.childsData);

    if (this.data.parent) {
      Go.style(this, this.data.parent.style || {});
    }

    if (Go.is(this.data.parent, "object")) {
      const dbParent = { ...this.data.parent, style: undefined }
      Object.assign(this, dbParent);
    }

    if (Go.is(this.data.background, "object")) {
      const dtBackground = { ...this.data.background, style: undefined }
      Object.assign(this.backgroundElement, dtBackground);
    }

    Go.attrs(this.bodyElement, { "view-id": this.id, template: this.bodyTemplate });

    if (Go.is(this.data.content, "object")) {
      const dtContent = { ...this.data.content, style: undefined }
      Object.assign(this.contentElement, dtContent);
    }

    if (Go.is(this.data.header, "object")) {
      const dtHeader = { ...this.data.header, style: undefined }
      Object.assign(this.headerElement, dtHeader);
    }

    if (Go.is(this.data.body, "object")) {
      const dtBody = { ...this.data.body, style: undefined }
      Object.assign(this.bodyElement, dtBody);
    }

    if (!Go.is(this.data["header"], "false")) {
      this.contentElement.appendChild(this.headerElement);
    }

    this.contentElement.appendChild(this.bodyElement);

    if (this.data.footer) {
      this.data.footer.class = `ViewFooter ${Go.replace(this.data.footer.class, "ViewFooter", "")}`;
    }

    if (Go.isElement(this.data.footer)) {
      this.footerElement = this.data.footer;
      this.contentElement.appendChild(this.footerElement);
    } else if (this.data.footer) {
      this.footerElement = Go.create({
        tag: "go-view-footer",
        ...this.childsData,
        ...this.data.footer,
        target: this.contentElement,
        mode: "append",
      });
    }
  },
  useMiddleware: async function () {
    const use = { options: { replace: true } }

    use["css"] = async (src) => {
      Go.cssTag({
        id: `style-${this.id}`,
        css: `#${this.id} {${await Go.http.text(src)}}`,
      });
    }

    use["string"] = async () => {
      if (this.data.use.endsWith(".css")) {
        return await use["css"](this.data.use);
      }
      return await Go.load(this.data.use, use.options);
    }

    use["function"] = async () => {
      return await Go.load(await this.data.use(this), use.options);
    }

    use["array"] = async () => {
      return await Go.for(this.data.use, async (use) => {
        if (use.endsWith(".css")) {
          return await use["css"](use);
        }
        await Go.load(use, use.options);
      });
    }

    await use[Array.isArray(this.data.use) ? "array" : typeof this.data.use]();
  },
  render: async function () {
    Go.appendChild(this, this.backgroundElement);

    if (this.data.use) {
      await this.useMiddleware();
    }

    Go.appendChild(this, this.contentElement);

    this.body = this.bodyElement;

    if (Go.is(this.bodyHTML, "selector")) {
      this.bodyHTML = document.querySelector(this.bodyHTML);
      if (this.bodyHTML && this.htmlIn) {
        this.bodyHTML = this.bodyHTML.innerHTML;
      } else if (this.bodyHTML) {
        this.bodyHTML = this.bodyHTML.outerHTML;
      }
    } else if (Go.is(this.bodyHTML, "path")) {
      this.bodyHTML = { template: this.bodyHTML }
    } else if (Go.is(this.bodyHTML, "function")) {
      this.bodyHTML = await this.bodyHTML(this);
    }

    if (Go.is(this.bodyHTML, "HTMLElement")) {
      this.body.appendChild(this.bodyHTML);
    } else if (Go.is(this.bodyHTML, "string")) {
      this.body.innerHTML = Go.eval(this.bodyHTML);
    } else if (Go.is(this.bodyHTML, "object")) {
      delete this.bodyHTML.style;
      Object.assign(this.bodyElement, this.bodyHTML);
    }

    Go.addClass(document.body, "opening");

    Go.sleep(1).then(() => {
      Go.addClass(this.backgroundElement, "visible");
    });

    this.animateIn(() => {
      Go.removeClass(document.body, "opening");
      this.instance._afterOpen(this);
    });
  },
  afterRender: async function () {
    if (this.data.closeOutside || this.data.closeoutside) {
      this.backgroundWrap = this.querySelector("go-view-background");
      this.backgroundWrap.onclick = () => this.close();
    }

    if (this.data.closeOnClick || this.data.closeonclick) {
      this.onclick = () => this.close();
    }

    await Go.sleep(Go.env("app_transition_time"));
    const header = this.querySelector("go-view-header");

    if (header) {
      const headerHeight = this.headerHeight || `${header.offsetHeight}px`;
      Go.cssVar(this, "--header-height", headerHeight);
    }
  },
  restoreView: async function (cb) {
    this.animation = Go.animate({ ...this.data, el: this.viewContent }).getAnimation();
    Go.animate({
      autorun: true,
      el: this.querySelector("go-view-content"),
      onstart: () => {
        this.instance._beforeOpen(this);
        this.style.display = "flex";
        this.style.zIndex = this.instance.getNewIndex();
        Go.removeClass(this, "minimize");
      },
      from: Go.getProp(this.animation, "from"),
      to: Go.getProp(this.animation, "to"),
      onfinish: () => {
        Go.removeClass(this, "minimized");
        typeof cb === "function" && cb(this);
        this.instance._afterOpen(this);
        this.instance._onMaximize(this);
        Go.onview(this.target);
      },
    });
  },
  minimizeView: async function (cb) {
    this.animation = Go.animate({ ...this.data, el: this.viewContent }).getAnimation();
    Go.animate({
      autorun: true,
      el: this.querySelector("go-view-content"),
      onstart: () => {
        this.instance._beforeClose(this);
        Go.addClass(this, "minimize");
      },
      from: Go.getProp(this.animation, "to"),
      to: Go.getProp(this.animation, "from"),
      onfinish: () => {
        this.style.display = "none";
        Go.addClass(this, "minimized");
        typeof cb === "function" && cb(this);
        this.instance._onMinimize(this);
        this.instance._afterClose(this);
        Go.onview(this.target);
      },
    });
  },
  close: async function (cb) {
    if (this.data.keepOnBackground) {
      return this.minimizeView(cb);
    }

    Go.addClass(document.body, "closing");
    Go.removeClass(this, "opened");
    Go.removeClass(this.backgroundElement, "visible");

    this.instance._beforeClose(this);
    this.instance._closing(this);
    this.instance._onClose(this);

    if (this.bodyElement && this.bodyElement.observer) {
      this.bodyElement.observer.disconnect();
    }

    this.animateOut(() => {
      this.remove();
      this.afterRemove(cb);
      Go.removeClass(document.body, "closing");
      Go.remove(`#style-${this.id}`);
      this.instance.closed(this);
      this.instance._afterClose(this);
      Go.onview(this.target);
    });
  },
  animateIn: function (cb) {
    this.viewContent = this.querySelector("go-view-content");
    Go.animate({ ...this.data, el: this.viewContent }).open(cb);
  },
  animateOut: function (cb) {
    this.viewContent = this.querySelector("go-view-content");

    if (this.data.animationClose) {
      this.data.animation = this.data.animationClose;
    }

    Go.animate({ ...this.data, el: this.viewContent }).close(cb);
  },
  afterRemove: function (cb) {
    if (["function"].includes(typeof cb)) {
      cb(this);
    }
  },
}
 
 }
}

Go.component("go-view", component_goview);

const component_imgo = function () {
return { 
 default: {
  beforeRender: function () {
    Go.style(this, {
      width: this.size || this.width || "44px",
      height: this.size || this.height || "44px",
      overflow: "hidden",
      aspectRatio: "1/1",
      display: "inline-flex",
      borderRadius: "50%",
    });
    Go.create({
      tag: "img",
      target: this,
      src: this.src || Go.attr(this, "src"),
      style: {
        width: this.size || this.width || "100%",
        height: this.size || this.height || "100%",
        objectFit: "cover",
      },
    });
  },
}
 
 }
}

Go.component("img-o", component_imgo);

const component_webcomponent = function () {
return { 
 default: {
  beforeRender: async function () {
    this.evaluateProps(); // Evaluate slots props

    this.classList.add("loading");

    this.shadowDOM = this.attachShadow({ mode: "open" });

    this.cssFile = Go.fix(this.data.src + "/index.css").url();
    this.jsFile = Go.fix(this.data.src + "/index.js").url();
    this.htmlFile = Go.fix(this.data.src + "/index.html").url();

    this.styleData = await Go.http.get(this.cssFile, { responseType: "text", cache: true });
    this.htmlData = await Go.http.get(this.htmlFile, { responseType: "text", cache: true });

    const style = document.createElement("style");
    style.textContent = Go.eval(this.styleData, this.data);
    this.shadowDOM.appendChild(style);

    const html = document.createElement("template");
    html.innerHTML = Go.eval(this.htmlData, this.data);
    this.shadowDOM.appendChild(html.content);
  },
  render: function () {
    this.classList.remove("loading");
    this.shadowDOM.addEventListener("click", (event) => {
      Go.do("nav/event", event);
    });
  },
}
 
 }
}

Go.component("web-component", component_webcomponent);
};

GO.windowInit = function () {
  GO.setReactive();
  GO.initHyperList();
  GO.loadComponents();
  GO.enableFastClick();
};

GO.setReactive = function () {
  window.addEventListener("resize", () => {
    const allElements = document.querySelectorAll(".ge");
    let i;
    for (i = 0; i < allElements.length; i++) {
      allElements[i].reactive();
    }
  });
};

(function (f) {
  if (typeof exports === "object" && typeof module !== "undefined") {
    // Entorno CommonJS/Node.js
    module.exports = f();
  } else if (typeof define === "function" && define.amd) {
    // Entorno AMD
    define([], f);
  } else {
    // Entorno global (navegador, web workers, etc.)
    var g =
      typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : this;

    // Asignar al espacio de nombres global
    g.Go = f();

    // Inicialización opcional en navegadores
    if (typeof g.Go.windowInit === "function") {
      g.Go.windowInit();
    }
  }
})(function () {
  return new Proxy(GO, {
    get(target, prop, receiver) {
      let resource = Reflect.get(target, prop, receiver);

      if (!resource) {
        resource = Reflect.get(GO_EXTENDS, prop, receiver);
      }

      return resource;
    },
    set(target, prop, value, receiver) {
      if (GO.hasOwnProperty(prop)) {
        console.warn(`La propiedad "${prop}" No se puede reescribir.`);
        return false;
      }

      return Reflect.set(target, prop, value, GO_EXTENDS);
    },
  });
});