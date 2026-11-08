(function () {
  var WEBHOOK_URL = "YOUR_NEW_WEBHOOK_URL";
  var $ = function (id) { return document.getElementById(id); };
  var nav = $("nav"), modal = $("modal");

  function onScroll() { nav.classList.toggle("on", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  var box = $("particles");
  if (box) {
    var n = window.innerWidth < 600 ? 30 : 60;
    for (var i = 0; i < n; i++) {
      var p = document.createElement("span"), s = 1 + Math.random() * 3;
      p.className = "p";
      p.style.cssText = "left:" + Math.random() * 100 + "%;width:" + s + "px;height:" + s + "px;animation-duration:" + (6 + Math.random() * 10) + "s;animation-delay:-" + Math.random() * 10 + "s";
      box.appendChild(p);
    }
  }

  function openModal() { if (!modal) return; modal.classList.add("active"); document.body.style.overflow = "hidden"; setTimeout(function () { $("u").focus(); }, 300); }
  function closeModal() { if (!modal) return; modal.classList.remove("active"); document.body.style.overflow = ""; }
  document.querySelectorAll("[data-open]").forEach(function (b) { b.addEventListener("click", function () { if (modal) openModal(); else location.href = "index.html#top"; }); });
  if (modal) {
    $("close").addEventListener("click", closeModal);
    modal.addEventListener("click", function (e) { if (e.target === modal) closeModal(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeModal(); });
  }

  document.querySelectorAll(".tile").forEach(function (t) {
    t.addEventListener("click", function (e) {
      var r = t.getBoundingClientRect(), ring = document.createElement("span");
      ring.className = "ring";
      ring.style.setProperty("--x", e.clientX - r.left + "px");
      ring.style.setProperty("--y", e.clientY - r.top + "px");
      t.appendChild(ring);
      setTimeout(function () { ring.remove(); }, 750);
      t.classList.remove("go"); void t.offsetWidth; t.classList.add("go");
      setTimeout(function () { t.classList.remove("go"); }, 900);
      if (t.hasAttribute("data-open-after")) setTimeout(openModal, 800);
    });
  });

  var send = $("send"), last = 0;
  if (send) send.addEventListener("click", async function () {
    var u = $("u").value.trim(), m = $("m").value.trim(), res = $("res");
    if (!u || !m) { res.textContent = "Please fill in your name and message."; return; }
    if (Date.now() - last < 30000) { res.textContent = "Please wait a moment before sending again."; return; }
    send.disabled = true; send.textContent = "Sending…"; res.textContent = "";
    try {
      var r = await fetch(WEBHOOK_URL, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "Website Messages",
          embeds: [{ title: "New message", color: 9109504, timestamp: new Date().toISOString(),
            fields: [{ name: "Name", value: u.slice(0, 100) }, { name: "Message", value: m.slice(0, 1000) }] }]
        })
      });
      if (!r.ok) throw 0;
      last = Date.now(); res.textContent = "Message sent."; $("u").value = ""; $("m").value = "";
      setTimeout(closeModal, 1200);
    } catch (e) { res.textContent = "Message failed to send. Try again later."; }
    send.disabled = false; send.textContent = "Send message";
  });
})();
