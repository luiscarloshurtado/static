export default {
  beforeRender: function () {
    Go.create({
      tag: "div",
      class: "contain",
      target: this,
      childrens: [
        {
          tag: "div",
          class: "left",
          childrens: [
            {
              tag: "div",
              class: "appName",
              html: Go.env("company_name"),
            },
          ],
        },
        {
          tag: "div",
          class: "right",
          childrens: [
            {
              tag: "go-button",
              icon: "globe",
              onclick: () => Go.do("language:select"),
            },
            {
              tag: "go-button",
              icon: "bars",
              onclick: () => Go.do("home:menu"),
            },
          ],
        },
      ],
    });
  },
};
