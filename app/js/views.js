Go.set("nav:start", function () {
  return Go.do("nav:push");
});

Go.set("nav:push", function () {
  return Go.switch({
    case: location.pathname,
    default: () => Go.do("home:route"),
    "/": () => Go.do("home:route"),
  });
});
