Go.set("nav:event", function () {
  return Go.switch({
    case: location.pathname,
    default: () => Go.do("home:route"),
    "/": () => Go.do("home:route"),
  });
});
