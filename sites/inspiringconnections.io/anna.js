/* ANNA — the Inspiring Connections website bot.
   Vanilla JS, no dependencies. Talks to the `site-bot` Supabase edge function
   (Haiku, one call per turn). Self-contained and config-driven so it clones to
   the other three brand sites: copy anna.js + anna.css, change CONFIG below.

   FLOW (CIS-CC-ICWEB-001, 2026-06-04): qualify → match signal → prove → refer
   ────────────────────────────────────────────────────────────────────────────
   Stage 1 — Qualify:  ANNA uncovers what the visitor is looking for (hire /
             partnership / service / intro). Warm, curious. Max 2–3 turns.
   Stage 2 — Match signal: when a need is identified the edge fn returns
             { match_signal: true } in the JSON. ANNA says she thinks the
             network knows someone.
   Stage 3 — Prove: ANNA surfaces a proof line — Connection Cards, the partner
             taxonomy (Connection / Growth / Impact), and how introductions work.
   Stage 4 — Refer: route to the right CTA based on need type:
             - meeting_cta  → Calendly/mailto (CONFIG.meetingUrl placeholder)
             - card_cta     → Connection Card intent (stored via edge fn)
             - nurture_cta  → nurture / follow-up (existing fallback)
   One free intro: appended to card_cta routing. "Your first introduction is on
   us — no subscription needed to see if we're the right fit."

   The opener is rendered client-side, so it costs nothing — the first LLM call
   only happens when the visitor actually replies. */
(function () {
  "use strict";

  // ── CONFIG ──────────────────────────────────────────────────────────────────
  // All values are overridable per-site via window.ANNA_CONFIG.
  // DO NOT change `endpoint` — one shared edge function serves every site;
  // the `site` value distinguishes them.
  var CONFIG = Object.assign({
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
    // Placeholder for the meeting booking URL (Calendly or mailto).
    // Override via window.ANNA_CONFIG = { meetingUrl: "https://calendly.com/..." }
    meetingUrl: "mailto:john@rethinkingwork.life?subject=Meeting%20request%20via%20ANNA"
  }, window.ANNA_CONFIG || {});

  // ── qualify → match → prove → refer: CTA copy ───────────────────────────────
  var CTA_COPY = {
    meeting_cta: "Book a conversation",
    card_cta:    "Request a Connection Card",
    nurture_cta: "Drop John a note"
  };
  var CTA_URLS = {
    meeting_cta: CONFIG.meetingUrl,
    card_cta:    null,   // no URL — intent stored via edge fn; handled by addCta
    nurture_cta: "mailto:john@rethinkingwork.life"
  };
  // Free intro line appended to Connection Card CTA only.
  var FREE_INTRO_LINE =
    "Your first introduction is on us — no subscription needed to see if we're the right fit.";

  var ICON_CHAT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.38 8.38 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.38 8.38 0 0 1 21 11.5z"/></svg>';
  var ICON_ANNA = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4v15"/><path d="M12 6c-2-3.2-5.4-4.4-7.8-2.4S2.5 9.4 5 11c-2.7.7-3.9 3.2-2.7 5.1s5.4 1.2 7.4-1.5c.8-1.2 1.7-3.9 2.3-8.6z"/><path d="M12 6c2-3.2 5.4-4.4 7.8-2.4s1.7 5.8-.8 7.4c2.7.7 3.9 3.2 2.7 5.1s-5.4 1.2-7.4-1.5c-.8-1.2-1.7-3.9-2.3-8.6z"/></svg>';
  var ICON_CLOSE = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>';
  var ICON_SEND = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 2 11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>';

  var root, log, input, sendBtn, conversationId = null, busy = false, started = false;

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

  // ── qualify → match → prove → refer: CTA rendering ──────────────────────────
  function addCta(cta) {
    if (!cta) return;

    // Resolve CTA type from the edge fn response.
    // The edge fn may return either:
    //   { label, url }                  — legacy shape (meeting/nurture)
    //   { type: "card_cta"|... }        — new shape from the qualify→refer flow
    //   { match_signal: true }          — no CTA yet, just a signal (handled in send())
    var ctaType = cta.type || null;
    var label   = cta.label || (ctaType ? CTA_COPY[ctaType] : null) || "Next step";
    var url     = cta.url   || (ctaType ? CTA_URLS[ctaType]  : null);

    var wrap = el("div", "anna-cta");

    if (url) {
      var a = el("a", null, esc(label));
      a.href = url; a.target = "_blank"; a.rel = "noopener";
      wrap.appendChild(a);
    } else {
      // No URL (Connection Card / nurture): a gentle acknowledgement chip.
      var b = el("button", null, esc(label));
      b.addEventListener("click", function () {
        input.focus();
        b.disabled = true; b.textContent = "Lovely — John’s on it";
      });
      wrap.appendChild(b);
    }

    // Append the free intro line beneath Connection Card CTAs only.
    if (ctaType === "card_cta" || (!ctaType && !url)) {
      var note = el("p", "anna-cta-note", esc(FREE_INTRO_LINE));
      wrap.appendChild(note);
    }

    log.appendChild(wrap); scrollDown();
  }

  // ── Match signal: shown when the edge fn signals a potential network match ───
  function addMatchSignal() {
    var chip = el("div", "anna-match-signal",
      "🔍 Checking the network… I think we might know someone.");
    log.appendChild(chip); scrollDown();
    // Auto-remove after 4 seconds; the next bot reply replaces it.
    setTimeout(function () {
      if (chip.parentNode) chip.remove();
    }, 4000);
  }

  function setBusy(on) {
    busy = on; sendBtn.disabled = on;
  }

  function send() {
    var text = input.value.trim();
    if (!text || busy) return;
    input.value = ""; input.style.height = "auto";
    addMsg("me", text);
    setBusy(true);
    var typing = addTyping();

    fetch(CONFIG.endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ site: CONFIG.site, conversationId: conversationId, message: text })
    })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        typing.remove();
        if (data && data.ok) {
          if (data.conversationId) conversationId = data.conversationId;

          // qualify → match → prove → refer: show match signal before reply
          if (data.match_signal) addMatchSignal();

          addMsg("bot", data.reply || "…");

          // Refer stage: render the appropriate CTA
          if (data.cta) addCta(data.cta);
        } else {
          addMsg("bot", "Sorry, I lost my thread there for a second. Mind trying that again? If it keeps sulking, drop John a line at john@rethinkingwork.life.");
        }
      })
      .catch(function () {
        typing.remove();
        addMsg("bot", "Hmm, I can’t reach the office just now. Do try again in a moment, or email john@rethinkingwork.life.");
      })
      .finally(function () { setBusy(false); input.focus(); });
  }

  function build() {
    root = el("div", "anna-root");

    var launch = el("button", "anna-launch",
      '<span class="anna-dot"></span>' + ICON_CHAT + "<span>" + esc(CONFIG.launcherLabel) + "</span>");
    launch.setAttribute("aria-label", "Open the chat with ANNA");

    var panel = el("div", "anna-panel");
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-label", "Chat with ANNA from Inspiring Connections");

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
    input.setAttribute("aria-label", "Your message to ANNA");
    sendBtn = el("button", "anna-send", ICON_SEND);
    sendBtn.setAttribute("aria-label", "Send");
    foot.appendChild(input); foot.appendChild(sendBtn);

    var note = el("div", "anna-note", "ANNA is an assistant. She’ll pass anything useful to John.");

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
