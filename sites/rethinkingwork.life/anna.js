/* ANNA — the Rethinking Work family website bot widget.
   Vanilla JS, no dependencies. Talks to the orchestration-owned `site-bot`
   Supabase edge function (Haiku, one LLM call per turn). The transcript and any
   qualified engagement are written back server-side.

   ONE identical copy of this file ships to every brand site. Per-site
   differences (opener, subtitle, slug, brand tint) live in a small
   `window.ANNA_CONFIG = {...}` block in each page, set BEFORE this script.
   See sites/shared/anna/README.md for the clone recipe.

   The opener is rendered client-side, so it costs nothing — the first LLM call
   only happens when the visitor actually replies. */
(function () {
  "use strict";

  var DEFAULTS = {
    endpoint: "https://kntrbfrhajtvbuupyntu.supabase.co/functions/v1/site-bot",
    site: "inspiringconnections",
    launcherLabel: "Chat to ANNA",
    title: "ANNA",
    subtitle: "the human half of Inspiring Connections",
    opener:
      "Hello — I'm ANNA, the human half of Inspiring Connections. ERIC does the " +
      "clever number-crunching; I keep it human. Most connections happen by " +
      "accident — the good ones happen on purpose. No pitch, I'm just curious: " +
      "what's brought you our way today?",
    brand: null,        // optional { primary, primaryHi, accent, accentD } to tint per site
    maxTurns: 40,       // client-side rate-limit: visitor messages per session
    minInterval: 800    // ms between sends (anti-spam, on top of the busy lock)
  };
  var CONFIG = Object.assign({}, DEFAULTS, window.ANNA_CONFIG || {});

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>';
  var ICON_ANNA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 6c-2-3.2-5.4-4.4-7.8-2.4S2.5 9.4 5 11c-2.7.7-3.9 3.2-2.7 5.1s5.4 1.2 7.4-1.5c.8-1.2 1.7-3.9 2.3-8.6z"/><path d="M12 6c2-3.2 5.4-4.4 7.8-2.4s1.7 5.8-.8 7.4c2.7.7 3.9 3.2 2.7 5.1s-5.4 1.2-7.4-1.5c-.8-1.2-1.7-3.9-2.3-8.6z"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';

  var root, log, input, sendBtn, conversationId = null, busy = false, started = false;
  var turnCount = 0, lastSendAt = 0;

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); }

  function scrollDown() { log.scrollTop = log.scrollHeight; }

  function addMsg(role, text) {
    var m = el("div", "anna-msg " + (role === "me" ? "me" : "bot"), esc(text));
    log.appendChild(m); scrollDown(); return m;
  }
  function addTyping() {
    var t = el("div", "anna-typing", "<span></span><span></span><span></span>");
    log.appendChild(t); scrollDown(); return t;
  }
  function addCta(cta) {
    if (!cta) return;
    var wrap = el("div", "anna-cta");
    if (cta.url) {
      var a = el("a", null, esc(cta.label));
      a.href = cta.url; a.target = "_blank"; a.rel = "noopener";
      wrap.appendChild(a);
    } else {
      var b = el("button", null, esc(cta.label));
      b.addEventListener("click", function () {
        input.focus(); b.disabled = true; b.textContent = "Lovely — John's on it";
      });
      wrap.appendChild(b);
    }
    log.appendChild(wrap); scrollDown();
  }

  function setBusy(on) { busy = on; sendBtn.disabled = on; }

  function send() {
    var text = input.value.trim();
    if (!text || busy) return;
    var now = Date.now();
    if (now - lastSendAt < CONFIG.minInterval) return;   // light rate-limit
    if (turnCount >= CONFIG.maxTurns) {
      addMsg("bot", "We've had a proper natter — best I hand you to a human now. Drop John a line at john@rethinkingwork.life and he'll pick it straight up.");
      return;
    }
    lastSendAt = now; turnCount++;
    input.value = ""; input.style.height = "auto";
    addMsg("me", text);
    setBusy(true);
    var typing = addTyping();

    // self-learning capture: lightweight, non-PII context for the backend to
    // log against the conversation (server decides what it keeps).
    var meta = {
      path: location.pathname,
      referrer: document.referrer || null,
      ts: new Date().toISOString(),
      turn: turnCount
    };

    fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site: CONFIG.site, conversationId: conversationId, message: text, meta: meta })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        typing.remove();
        if (data && data.ok) {
          if (data.conversationId) conversationId = data.conversationId;
          addMsg("bot", data.reply || "…");
          if (data.cta) addCta(data.cta);
        } else {
          addMsg("bot", "Sorry, I lost my thread there for a second. Mind trying that again? If it keeps sulking, drop John a line at john@rethinkingwork.life.");
        }
      })
      .catch(function () {
        typing.remove();
        addMsg("bot", "Hmm, I can't reach the office just now. Do try again in a moment, or email john@rethinkingwork.life.");
      })
      .finally(function () { setBusy(false); input.focus(); });
  }

  function applyBrand() {
    if (!CONFIG.brand) return;
    var b = CONFIG.brand, s = root.style;
    if (b.primary)   s.setProperty("--anna-teal", b.primary);
    if (b.primaryHi) s.setProperty("--anna-teal-hi", b.primaryHi);
    if (b.accent)    s.setProperty("--anna-accent", b.accent);
    if (b.accentD)   s.setProperty("--anna-accent-d", b.accentD);
  }

  function build() {
    root = el("div", "anna-root");
    applyBrand();

    var launch = el("button", "anna-launch",
      '<span class="anna-dot"></span>' + ICON_CHAT + "<span>" + esc(CONFIG.launcherLabel) + "</span>");
    launch.setAttribute("aria-label", "Open the chat with " + CONFIG.title);

    var panel = el("div", "anna-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat with " + CONFIG.title);

    var head = el("div", "anna-head",
      '<span class="anna-mark">' + ICON_ANNA + "</span>" +
      "<div><h3>" + esc(CONFIG.title) + "</h3><p>" + esc(CONFIG.subtitle) + "</p></div>");
    var close = el("button", "anna-close", ICON_CLOSE);
    close.setAttribute("aria-label", "Close the chat");
    head.appendChild(close);

    log = el("div", "anna-log");

    var foot = el("div", "anna-foot");
    input = el("textarea");
    input.rows = 1; input.placeholder = "Type your reply…";
    input.setAttribute("aria-label", "Your message to " + CONFIG.title);
    sendBtn = el("button", "anna-send", ICON_SEND);
    sendBtn.setAttribute("aria-label", "Send");
    foot.appendChild(input); foot.appendChild(sendBtn);

    var note = el("div", "anna-note", "ANNA is an assistant. She'll pass anything useful to John.");

    panel.appendChild(head); panel.appendChild(log); panel.appendChild(foot); panel.appendChild(note);
    root.appendChild(panel); root.appendChild(launch);
    document.body.appendChild(root);

    launch.addEventListener("click", open);
    close.addEventListener("click", function () { root.classList.remove("open"); });
    sendBtn.addEventListener("click", send);
    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
    });
    input.addEventListener("input", function () {
      input.style.height = "auto"; input.style.height = Math.min(input.scrollHeight, 90) + "px";
    });
  }

  function open() {
    root.classList.add("open");
    if (!started) { started = true; addMsg("bot", CONFIG.opener); }
    setTimeout(function () { input.focus(); }, 60);
  }

  // Public hook so page buttons can open the chat: onclick="ANNA.open()".
  window.ANNA = { open: function () { if (root) open(); } };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", build);
  } else { build(); }
})();
