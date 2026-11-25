/* PRISM — vanilla JS interactions */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };

  /* ---------- Mobile navigation ---------- */
  var burger = $("#burger"), menu = $("#menu");
  function setMenu(open) {
    menu.classList.toggle("open", open);
    burger.setAttribute("aria-expanded", String(open));
    burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  burger.addEventListener("click", function () { setMenu(!menu.classList.contains("open")); });
  $$("a", menu).forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  window.addEventListener("resize", function () { if (window.innerWidth > 800) setMenu(false); });

  /* ---------- Billing switch ---------- */
  var btns = { monthly: $("#monthly"), yearly: $("#yearly") };
  var slider = $("#slider"), prices = $$(".price"), bills = $$(".bill"), units = $$(".amount small");
  var current = "monthly";

  function moveSlider() { // slide indicator under the active button
    var b = btns[current];
    slider.style.width = b.offsetWidth + "px";
    slider.style.transform = "translateX(" + b.offsetLeft + "px)";
  }
  function animateNumber(el, to) { // smooth count between values
    var from = parseInt(el.textContent, 10) || 0;
    if (reduce || from === to) { el.textContent = to; return; }
    var start = null, dur = 550;
    cancelAnimationFrame(el._raf);
    (function step(t) {
      if (!start) start = t;
      var p = Math.min((t - start) / dur, 1), eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(from + (to - from) * eased);
      if (p < 1) el._raf = requestAnimationFrame(step);
    })(performance.now());
  }
  function setPeriod(period) {
    current = period;
    Object.keys(btns).forEach(function (k) {
      btns[k].classList.toggle("active", k === period);
      btns[k].setAttribute("aria-pressed", String(k === period));
    });
    prices.forEach(function (p) { animateNumber(p, parseInt(p.dataset[period], 10)); });
    bills.forEach(function (b) { b.textContent = b.dataset[period]; });
    units.forEach(function (u) { u.textContent = "/month"; });
    moveSlider();
  }
  btns.monthly.addEventListener("click", function () { setPeriod("monthly"); });
  btns.yearly.addEventListener("click", function () { setPeriod("yearly"); });
  window.addEventListener("resize", moveSlider);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(moveSlider);
  setPeriod("monthly");

  /* ---------- CTA feedback: ripple + toast ---------- */
  var toast = $("#toast"), tt;
  function showToast(msg) {
    toast.textContent = msg; toast.classList.add("show");
    clearTimeout(tt); tt = setTimeout(function () { toast.classList.remove("show"); }, 2800);
  }
  $$(".cta").forEach(function (btn) {
    btn.addEventListener("click", function (e) {
      var r = btn.getBoundingClientRect(), s = Math.max(r.width, r.height) / 4, d = document.createElement("span");
      d.className = "ripple"; d.style.width = d.style.height = s + "px";
      d.style.left = (e.clientX - r.left - s / 2) + "px"; d.style.top = (e.clientY - r.top - s / 2) + "px";
      btn.appendChild(d); setTimeout(function () { d.remove(); }, 650);
      $$(".cta.done").forEach(function (x) { x.classList.remove("done"); });
      btn.classList.add("done");
      var plan = btn.dataset.cta, price = $(".price", btn.closest(".card")).textContent;
      showToast(plan + " selected: $" + price + "/month, billed " + current + ".");
    });
  });

  /* ---------- FAQ accordion ---------- */
  $$(".qa button").forEach(function (b) {
    b.addEventListener("click", function () {
      var open = b.getAttribute("aria-expanded") === "true";
      $$(".qa button").forEach(function (o) {
        o.setAttribute("aria-expanded", "false");
        document.getElementById(o.getAttribute("aria-controls")).classList.remove("open");
      });
      if (!open) {
        b.setAttribute("aria-expanded", "true");
        document.getElementById(b.getAttribute("aria-controls")).classList.add("open");
      }
    });
  });

  /* ---------- Final CTA: jump to plans and flag the popular one ---------- */
  $("#findPlan").addEventListener("click", function () {
    var c = $(".creator"); if (!c) return;
    setTimeout(function () { c.animate && !reduce && c.animate([{ transform: "scale(1)" }, { transform: "scale(1.03)" }, { transform: "scale(1)" }], { duration: 700 }); }, 600);
  });
})();
