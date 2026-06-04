/* Lead capture — shared inline form for the Rethinking Work family sites.
   Vanilla JS, no dependencies. Renders into <div class="lead-capture"> using a
   window.LEAD_CONFIG block set before this script. Posts to the capture endpoint;
   if that isn't reachable yet (backend owned by orchestration), it falls back to a
   prefilled mailto so no lead is ever lost. See sites/shared/capture/README.md. */
(function () {
  "use strict";

  var DEFAULTS = {
    // Capture endpoint (orchestration-owned, see REQUESTS-TO-ORCHESTRATION REQ-005).
    // Until it's live, submissions fall back to mailto automatically.
    endpoint: "https://kntrbfrhajtvbuupyntu.supabase.co/functions/v1/site-lead",
    fallbackEmail: "john@rethinkingwork.life",
    site: "inspiringconnections",
    leadType: "connection",
    title: "Tell us who you're trying to reach",
    sub: "No pitch. Just a real reply from John.",
    messageLabel: "What would a brilliant connection look like?",
    messagePlaceholder: "A line or two is plenty.",
    submitLabel: "Send it to John",
    brand: null,                 // optional { teal, tealHi, accent, accentD }
    annaPrompt: "Prefer to chat?"  // links to the ANNA widget if present
  };
  var C = Object.assign({}, DEFAULTS, window.LEAD_CONFIG || {});

  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  var ICON_TICK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>';

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function applyBrand(root) {
    if (!C.brand) return;
    var b = C.brand, s = root.style;
    if (b.teal)    s.setProperty("--lc-teal", b.teal);
    if (b.tealHi)  s.setProperty("--lc-teal-hi", b.tealHi);
    if (b.accent)  s.setProperty("--lc-accent", b.accent);
    if (b.accentD) s.setProperty("--lc-accent-d", b.accentD);
  }

  function field(id, label, type, placeholder, required) {
    var wrap = el("div", "lc-field");
    var lab = el("label", null, label + (required ? "" : " <span style='font-weight:400;color:var(--lc-mute)'>(optional)</span>"));
    lab.setAttribute("for", "lc_" + id);
    var ctrl = type === "textarea" ? el("textarea") : el("input");
    ctrl.id = "lc_" + id; ctrl.name = id;
    if (type !== "textarea") ctrl.type = type;
    if (placeholder) ctrl.placeholder = placeholder;
    if (required) ctrl.required = true;
    var err = el("div", "lc-err", "Just need this one, please.");
    wrap.appendChild(lab); wrap.appendChild(ctrl); wrap.appendChild(err);
    return { wrap: wrap, ctrl: ctrl };
  }

  function mailtoFallback(payload) {
    var subject = "[" + C.site + "] Lead: " + (payload.name || "website visitor");
    var body =
      "Name: " + (payload.name || "") + "\n" +
      "Email: " + (payload.email || "") + "\n" +
      "Interest: " + C.leadType + "\n\n" +
      (payload.message || "") + "\n\n" +
      "— sent from " + payload.path + " on " + payload.ts;
    window.location.href = "mailto:" + C.fallbackEmail +
      "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
  }

  function mount(root) {
    applyBrand(root);
    var card = el("div", "lc-card");
    card.appendChild(el("h3", null, C.title));
    card.appendChild(el("p", "lc-sub", C.sub));

    var form = el("form"); form.setAttribute("novalidate", "");
    var name = field("name", "Your name", "text", "First name's fine", true);
    var email = field("email", "Email", "email", "you@example.com", true);
    var msg = field("message", C.messageLabel, "textarea", C.messagePlaceholder, false);

    // honeypot (bots fill it; humans never see it)
    var hp = el("div", "lc-hp");
    var hpInput = el("input"); hpInput.type = "text"; hpInput.name = "company_url";
    hpInput.setAttribute("tabindex", "-1"); hpInput.setAttribute("autocomplete", "off");
    hp.appendChild(hpInput);

    var consentWrap = el("div", "lc-consent");
    var consent = el("input"); consent.type = "checkbox"; consent.id = "lc_consent";
    var consentLab = el("label", null,
      "I'm happy for John to use these details to reply. No lists, no spam — read straight, deleted on request.");
    consentLab.setAttribute("for", "lc_consent");
    consentWrap.appendChild(consent); consentWrap.appendChild(consentLab);

    var submit = el("button", "lc-submit", C.submitLabel); submit.type = "submit";

    form.appendChild(name.wrap); form.appendChild(email.wrap); form.appendChild(msg.wrap);
    form.appendChild(hp); form.appendChild(consentWrap); form.appendChild(submit);

    if (window.ANNA) {
      var alt = el("div", "lc-alt", C.annaPrompt + ' <a id="lc_anna">have a natter with ANNA</a>');
      form.appendChild(alt);
    }
    card.appendChild(form);
    root.appendChild(card);

    if (window.ANNA) {
      var annaLink = root.querySelector("#lc_anna");
      if (annaLink) annaLink.addEventListener("click", function () { window.ANNA.open(); });
    }

    function setBad(f, on) { f.wrap.classList.toggle("lc-bad", on); }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (hpInput.value) return;  // honeypot tripped — silently drop

      var okName = name.ctrl.value.trim().length > 0;
      var okEmail = EMAIL_RE.test(email.ctrl.value.trim());
      setBad(name, !okName); setBad(email, !okEmail);
      consentWrap.style.color = consent.checked ? "" : "#C0392B";
      if (!okName || !okEmail || !consent.checked) return;

      var payload = {
        site: C.site, lead_type: C.leadType,
        name: name.ctrl.value.trim(), email: email.ctrl.value.trim(),
        message: msg.ctrl.value.trim(), consent: true,
        path: location.pathname, referrer: document.referrer || null,
        ts: new Date().toISOString()
      };

      submit.disabled = true; submit.textContent = "Sending…";

      var done = function () {
        card.innerHTML =
          '<div class="lc-done"><div class="lc-tick">' + ICON_TICK + "</div>" +
          "<h3>Got it — thank you.</h3>" +
          "<p>That's with John. He reads everything himself and will be in touch personally.</p></div>";
      };

      var tryFetch = C.endpoint
        ? fetch(C.endpoint, {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).then(function (r) { if (!r.ok) throw new Error("bad status"); return true; })
        : Promise.reject(new Error("no endpoint"));

      tryFetch.then(done).catch(function () { mailtoFallback(payload); done(); });
    });
  }

  function init() {
    var nodes = document.querySelectorAll(".lead-capture");
    for (var i = 0; i < nodes.length; i++) {
      if (!nodes[i].getAttribute("data-lc-mounted")) {
        nodes[i].setAttribute("data-lc-mounted", "1");
        mount(nodes[i]);
      }
    }
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else { init(); }
})();
