/* airtime-live.js - the airtime bench for learn-facilitation-with-phoebe
 *
 * Forty real meetings from the AMI Meeting Corpus (CC BY 4.0, groups.inf.ed.ac.uk/ami), ten
 * design teams of four drawn with a seeded generator, all four meetings of each. ami-sample.js
 * carries only each speaker segment's start, length and speaker, in centiseconds. Every share,
 * Gini, turn count and overlap below is computed here, in the browser, from those segments.
 *
 * What is MEASURED: who spoke for how long (the union of each person's segments), how many turns
 *   each took (a turn is a run of segments by one person in start order), how often someone
 *   started speaking while another was mid-segment, and every inequality number built on those.
 * What is SIMULATED, and labelled so on the widget:
 *   cap      round robin with a cap: nobody may hold more than X% of the airtime; the excess is
 *            handed out in equal parts to everyone under the cap, repeated until nobody is over.
 *            The total airtime is unchanged. Real rounds are messier; the rule is stated.
 *   loudest  ANTI-LEVER, a model: every segment that starts in the last 10% of the meeting is
 *            given to the person who already spoke most. That is what "let the loudest summarise"
 *            does to the closing minutes.
 *   shuffle  BREAK BUTTON: every segment gets a speaker drawn at random from the four (seeded),
 *            so any pattern by role should vanish. If it did not, the bench would be measuring
 *            an artifact of the segments, not the people.
 * The Python reference (materials/build-ami-airtime.py) runs the same steps in the same order and
 * prints the same numbers.
 */
(function (root) {
  "use strict";

  var ROLES = ["PM", "ME", "UI", "ID"];
  var ROLE_NAMES = ["Project manager", "Marketing expert", "User interface designer", "Industrial designer"];
  var CLOSING_FRAC = 0.10;
  var PHASES = ["1 kick-off", "2 functional", "3 conceptual", "4 detailed"];

  /* ---------- engine (mirrors the Python reference, step for step) ---------- */
  function decode(m) {
    var segs = [], t = 0;
    for (var i = 0; i < m.sp.length; i++) {
      t += m.ds[i];
      segs.push([t, t + m.du[i], m.sp[i]]);
    }
    return segs;
  }
  function cmpSeg(a, b) { return a[0] - b[0] || a[1] - b[1] || a[2] - b[2]; }

  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function seedFor(id) {
    var h = 2166136261;
    for (var i = 0; i < id.length; i++) {
      h = (h ^ id.charCodeAt(i)) >>> 0;
      h = Math.imul(h, 16777619) >>> 0;
    }
    return h;
  }

  function gini(xs) {
    var n = xs.length, tot = 0, s = 0, i, j;
    for (i = 0; i < n; i++) tot += xs[i];
    if (tot === 0) return 0;
    for (i = 0; i < n; i++) for (j = 0; j < n; j++) s += Math.abs(xs[i] - xs[j]);
    return s / (2 * n * tot);
  }

  function measure(segs) {
    var time = [0, 0, 0, 0], k, i, s, e, sp;
    for (k = 0; k < 4; k++) {
      var cs = -1, ce = -1;
      for (i = 0; i < segs.length; i++) {
        s = segs[i][0]; e = segs[i][1]; sp = segs[i][2];
        if (sp !== k) continue;
        if (s > ce) {
          if (ce > cs) time[k] += ce - cs;
          cs = s; ce = e;
        } else if (e > ce) ce = e;
      }
      if (ce > cs) time[k] += ce - cs;
    }
    var turns = [0, 0, 0, 0], last = -1;
    for (i = 0; i < segs.length; i++) {
      sp = segs[i][2];
      if (sp !== last) { turns[sp] += 1; last = sp; }
    }
    var ov = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    var fl = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    var active = [];
    for (i = 0; i < segs.length; i++) {
      s = segs[i][0]; e = segs[i][1]; sp = segs[i][2];
      var keep = [];
      for (var a = 0; a < active.length; a++) if (active[a][1] > s) keep.push(active[a]);
      active = keep;
      for (a = 0; a < active.length; a++) {
        if (active[a][2] !== sp && active[a][0] < s) {
          ov[sp][active[a][2]] += 1;
          if (active[a][1] < e) fl[sp][active[a][2]] += 1;
        }
      }
      active.push(segs[i]);
    }
    var maxE = -Infinity;
    for (i = 0; i < segs.length; i++) if (segs[i][1] > maxE) maxE = segs[i][1];
    var span = maxE - segs[0][0];
    var tot = time[0] + time[1] + time[2] + time[3];
    var share = time.map(function (t) { return t / tot; });
    var top = Math.max.apply(null, share);
    var nturns = turns[0] + turns[1] + turns[2] + turns[3];
    return { time: time, share: share, gini: gini(share), top: top, topIdx: share.indexOf(top),
             turns: turns, turnsPerMin: nturns / (span / 6000), ov: ov, fl: fl, span: span };
  }

  function capShares(share, cap) {
    var s = share.slice(), it, i;
    for (it = 0; it < 12; it++) {
      var excess = 0;
      for (i = 0; i < 4; i++) if (s[i] > cap) { excess += s[i] - cap; s[i] = cap; }
      if (excess <= 1e-12) break;
      var under = [];
      for (i = 0; i < 4; i++) if (s[i] < cap) under.push(i);
      if (!under.length) break;
      var add = excess / under.length;
      for (i = 0; i < under.length; i++) s[under[i]] += add;
    }
    return s;
  }

  function loudestSummarises(segs, top, frac) {
    if (frac === undefined) frac = CLOSING_FRAC;
    var t0 = segs[0][0], t1 = -Infinity, i;
    for (i = 0; i < segs.length; i++) if (segs[i][1] > t1) t1 = segs[i][1];
    var cut = t1 - frac * (t1 - t0);
    var out = segs.map(function (g) { return [g[0], g[1], g[0] >= cut ? top : g[2]]; });
    out.sort(cmpSeg);
    return out;
  }

  function shuffleLabels(segs, seed) {
    var r = mulberry32(seed);
    var out = segs.map(function (g) { return [g[0], g[1], Math.floor(r() * 4)]; });
    out.sort(cmpSeg);
    return out;
  }

  function prepare(sample) {
    return sample.meetings.map(function (m) {
      return { id: m.id, role: m.role, pm: m.role.indexOf(0), segs: decode(m) };
    });
  }

  function mean(a) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i]; return s / a.length; }

  /* one row per meeting under a move: baseline | cap | loudest | shuffle */
  function evaluate(m, move, cap) {
    var b = m.base || (m.base = measure(m.segs));
    if (move === "cap") {
      var c = capShares(b.share, cap);
      var top = Math.max.apply(null, c);
      var nTop = c.filter(function (v) { return top - v < 1e-9; }).length;
      return { share: c, gini: gini(c), top: top, topIdx: nTop > 1 ? -1 : c.indexOf(top), turns: null, turnsPerMin: null, ov: null, kind: "simulated" };
    }
    if (move === "loudest") {
      var l = m.ls || (m.ls = measure(loudestSummarises(m.segs, b.topIdx)));
      l.kind = "modelled"; return l;
    }
    if (move === "shuffle") {
      var h = m.sh || (m.sh = measure(shuffleLabels(m.segs, seedFor(m.id))));
      h.kind = "broken on purpose"; return h;
    }
    b.kind = "measured"; return b;
  }

  function summarise(ms, move, cap) {
    var rows = ms.map(function (m) { return evaluate(m, move, cap); });
    var res = {
      n: ms.length,
      meanGini: mean(rows.map(function (r) { return r.gini; })),
      meanTop: mean(rows.map(function (r) { return r.top; })),
      pmTop: rows.filter(function (r, i) { return r.topIdx === ms[i].pm; }).length,
      roleShare: [0, 1, 2, 3].map(function (k) {
        return mean(rows.map(function (r, i) { return r.share[ms[i].role.indexOf(k)]; }));
      }),
      ginis: rows.map(function (r) { return r.gini; })
    };
    return res;
  }

  /* the full canon, in the same shape the Python reference prints */
  function canon(sample) {
    var ms = prepare(sample);
    var base = ms.map(function (m) { return evaluate(m, "base"); });
    var res = { meetings: ms.length, segments: ms.reduce(function (a, m) { return a + m.segs.length; }, 0) };
    var b = summarise(ms, "base");
    res.meanGini = b.meanGini; res.meanTop = b.meanTop;
    res.minGini = Math.min.apply(null, b.ginis); res.maxGini = Math.max.apply(null, b.ginis);
    res.pmTopCount = b.pmTop; res.roleShare = b.roleShare;
    res.roleTurns = [0, 1, 2, 3].map(function (k) {
      return mean(base.map(function (r, i) {
        return r.turns[ms[i].role.indexOf(k)] / (r.turns[0] + r.turns[1] + r.turns[2] + r.turns[3]);
      }));
    });
    res.meanTurnsPerMin = mean(base.map(function (r) { return r.turnsPerMin; }));
    res.meanGini40 = summarise(ms, "cap", 0.40).meanGini;
    var c30 = summarise(ms, "cap", 0.30);
    res.meanGini30 = c30.meanGini; res.pmTopCount30 = c30.pmTop; res.roleShare30 = c30.roleShare;
    var ls = summarise(ms, "loudest");
    res.meanGiniLS = ls.meanGini; res.meanTopLS = ls.meanTop;
    res.lsRaised = ms.filter(function (m, i) { return evaluate(m, "loudest").gini > base[i].gini; }).length;
    var sh = summarise(ms, "shuffle");
    res.meanGiniSH = sh.meanGini; res.pmTopCountSH = sh.pmTop; res.roleShareSH = sh.roleShare;
    var ovr = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    var flr = [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]];
    base.forEach(function (r, i) {
      var role = ms[i].role;
      for (var y = 0; y < 4; y++) for (var x = 0; x < 4; x++) {
        ovr[role[y]][role[x]] += r.ov[y][x];
        flr[role[y]][role[x]] += r.fl[y][x];
      }
    });
    res.ovByRole = ovr; res.flByRole = flr;
    res.byPhase = "abcd".split("").map(function (ph) {
      var sub = ms.filter(function (m) { return m.id.charAt(m.id.length - 1) === ph; });
      var s = summarise(sub, "base");
      return { phase: ph, n: s.n, meanGini: s.meanGini, pmShare: s.roleShare[0], pmTop: s.pmTop };
    });
    res.perMeeting = ms.map(function (m, i) {
      var r = base[i];
      var c40 = capShares(r.share, 0.40), c30 = capShares(r.share, 0.30);
      return { id: m.id, gini: r.gini, top: r.top, topRole: ROLES[m.role[r.topIdx]], share: r.share,
               turnsPerMin: r.turnsPerMin, g40: gini(c40), g30: gini(c30),
               gLS: evaluate(m, "loudest").gini, gSH: evaluate(m, "shuffle").gini };
    });
    return res;
  }

  /* ---------- widget ---------- */
  function esc(s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"); }
  function pct1(x) { return (x * 100).toFixed(1) + "%"; }
  function g3(x) { return x.toFixed(3); }

  var MOVES = [
    { id: "base", label: "Baseline: what happened", note: "Measured from the real segments. No facilitation move applied.", tag: "measured" },
    { id: "cap", label: "Round robin with a cap", note: "Simulated: nobody above the cap; the excess goes in equal parts to everyone under it. Set the cap below.", tag: "simulated" },
    { id: "loudest", label: "Let the loudest summarise", note: "Modelled: the closing 10% of the meeting goes to whoever already spoke most.", tag: "modelled", anti: true },
    { id: "shuffle", label: "Break it: shuffle the speaker labels", note: "Every segment gets a random speaker. Any pattern by role should vanish.", tag: "broken on purpose", brk: true }
  ];

  var ms, rootEl, state = { move: "base", cap: 0.30, idx: 0 }, els = {};

  function bars(share, baseShare, role, kind) {
    var W = 320, H = 196, x0 = 34, bw = 230, rowH = 38, y0 = 26;
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Airtime share per participant">';
    svg += '<text class="ab-cap" x="' + x0 + '" y="16">share of the meeting\'s speaking time</text>';
    var eq = x0 + bw * 0.25;
    for (var i = 0; i < 4; i++) {
      var y = y0 + i * rowH;
      var r = role[i];
      svg += '<text class="ab-lab" x="' + (x0 - 10) + '" y="' + (y + 19) + '" text-anchor="end">' + ROLES[r] + '</text>';
      if (baseShare && kind !== "measured") {
        svg += '<rect class="ab-ghost" x="' + x0 + '" y="' + (y + 4) + '" width="' + (bw * baseShare[i]).toFixed(1) + '" height="24" rx="4"/>';
      }
      svg += '<rect class="ab-bar' + (r === 0 ? ' is-pm' : '') + '" x="' + x0 + '" y="' + (y + 8) + '" width="' + (bw * share[i]).toFixed(1) + '" height="16" rx="3"/>';
      svg += '<text class="ab-val" x="' + (W - 10) + '" y="' + (y + 21) + '" text-anchor="end">' + pct1(share[i]) + '</text>';
    }
    svg += '<line class="ab-eq" x1="' + eq + '" y1="' + (y0 - 2) + '" x2="' + eq + '" y2="' + (y0 + 4 * rowH) + '"/>';
    svg += '<text class="ab-cap" x="' + (eq + 4) + '" y="' + (y0 + 4 * rowH + 14) + '">25% = equal share</text>';
    svg += '</svg>';
    return svg;
  }

  function strip(ginis, baseGinis, sel) {
    var W = 320, H = 134, x0 = 14, w = 290, max = 0.5;
    var svg = '<svg viewBox="0 0 ' + W + ' ' + H + '" role="img" aria-label="Gini of airtime in each of the 40 meetings">';
    svg += '<line class="ab-axis" x1="' + x0 + '" y1="70" x2="' + (x0 + w) + '" y2="70"/>';
    [0, 0.1, 0.2, 0.3, 0.4, 0.5].forEach(function (t) {
      var x = x0 + w * t / max;
      svg += '<line class="ab-axis" x1="' + x + '" y1="66" x2="' + x + '" y2="74"/>';
      svg += '<text class="ab-tick" x="' + x + '" y="90" text-anchor="middle">' + t.toFixed(1) + '</text>';
    });
    svg += '<text class="ab-cap" x="' + x0 + '" y="110">Gini of airtime, one dot per meeting</text>';
    svg += '<text class="ab-cap" x="' + x0 + '" y="126">0 = everyone equal; 0.75 = one person speaks</text>';
    ginis.forEach(function (g, i) {
      var x = x0 + w * Math.min(g, max) / max;
      var y = 56 - (i % 4) * 9;
      svg += '<circle class="ab-dot' + (i === sel ? ' is-sel' : '') + '" cx="' + x.toFixed(1) + '" cy="' + y + '" r="' + (i === sel ? 6 : 4) + '"/>';
    });
    svg += '</svg>';
    return svg;
  }

  function matrix(r, role) {
    if (!r.ov) return '<p class="mb-hint">Who overlaps whom is not simulated for the cap: the rule moves totals, not individual segments.</p>';
    var order = [0, 1, 2, 3].map(function (k) { return role.indexOf(k); });
    var h = '<table class="dt-table ab-matrix"><thead><tr><th>over &rarr;</th>';
    order.forEach(function (a) { h += "<th>" + ROLES[role[a]] + "</th>"; });
    h += "<th>turns</th></tr></thead><tbody>";
    order.forEach(function (y) {
      h += "<tr><th>" + ROLES[role[y]] + "</th>";
      order.forEach(function (x) { h += "<td>" + (x === y ? "-" : r.ov[y][x]) + "</td>"; });
      h += "<td>" + r.turns[y] + "</td></tr>";
    });
    return h + "</tbody></table>";
  }

  function render() {
    var m = ms[state.idx];
    var mv = state.move;
    var b = evaluate(m, "base");
    var r = evaluate(m, mv, state.cap);
    var sumB = summarise(ms, "base");
    var sum = summarise(ms, mv, state.cap);
    Object.keys(els.btns).forEach(function (k) {
      els.btns[k].classList.toggle("is-on", k === mv);
      els.btns[k].querySelector("input").checked = (k === mv);
    });
    els.capRow.style.display = mv === "cap" ? "" : "none";
    els.capOut.textContent = Math.round(state.cap * 100) + "%";

    var kindCls = r.kind === "measured" ? "is-measured" : "is-heuristic";
    var verdict, vcls;
    var d = r.gini - b.gini;
    if (mv === "base") { verdict = "Measured. " + m.id + ": the top speaker (" + ROLES[m.role[b.topIdx]] + ") held " + pct1(b.top) + " of the airtime; Gini " + g3(b.gini) + "."; vcls = "is-ok"; }
    else if (mv === "cap") { verdict = "Simulated. Cap " + Math.round(state.cap * 100) + "%: Gini " + g3(b.gini) + " → " + g3(r.gini) + (d < -1e-9 ? "." : ", unchanged: nobody was over the cap."); vcls = d < -1e-9 ? "is-good" : "is-ok"; }
    else if (mv === "loudest") { verdict = "Modelled. Handing the closing 10% to the top speaker: Gini " + g3(b.gini) + " → " + g3(r.gini) + ". Inequality went up."; vcls = "is-bad"; }
    else { verdict = "Broken on purpose. With random labels the project manager is top in " + sum.pmTop + " of " + sum.n + " meetings (measured: " + sumB.pmTop + ")."; vcls = "is-bad"; }

    els.verdict.className = "mb-verdict " + vcls;
    els.verdict.textContent = verdict;

    function metric(label, val, unit, kind) {
      return '<div class="mb-metric"><span class="mb-mkind ' + (kind === "measured" ? "is-measured" : "is-heuristic") + '">' + esc(kind) + '</span>' +
        '<span class="mb-mlabel">' + esc(label) + '</span><span class="mb-mvalue">' + esc(val) + '</span><span class="mb-munit">' + esc(unit) + '</span></div>';
    }
    els.metrics.innerHTML =
      metric("Gini of airtime, this meeting", g3(r.gini), "baseline " + g3(b.gini), r.kind) +
      metric("Top speaker's share", pct1(r.top), (r.topIdx < 0 ? "tied at the cap" : ROLES[m.role[r.topIdx]]) + "; baseline " + pct1(b.top), r.kind) +
      metric("Turns per minute", r.turnsPerMin === null ? "n/a" : r.turnsPerMin.toFixed(1), r.turnsPerMin === null ? "the cap moves time, not turns" : "baseline " + b.turnsPerMin.toFixed(1), r.kind) +
      metric("Mean Gini, all " + sum.n + " meetings", g3(sum.meanGini), "baseline " + g3(sumB.meanGini), r.kind) +
      metric("Project manager is sole top speaker", sum.pmTop + " of " + sum.n, "baseline " + sumB.pmTop + " of " + sumB.n, r.kind) +
      metric("Project manager's mean share", pct1(sum.roleShare[0]), "baseline " + pct1(sumB.roleShare[0]) + "; equal is 25.0%", r.kind);

    els.bars.innerHTML = bars(r.share, b.share, m.role, r.kind);
    els.strip.innerHTML = strip(sum.ginis, sumB.ginis, state.idx);
    els.matrix.innerHTML = matrix(r, m.role);
    var ph = '<table class="dt-table ab-phase"><thead><tr><th>Meeting</th><th>Gini</th><th>PM share</th><th>PM top</th></tr></thead><tbody>';
    ["a", "b", "c", "d"].forEach(function (p, k) {
      var sub = ms.filter(function (x) { return x.id.charAt(x.id.length - 1) === p; });
      var q = summarise(sub, mv, state.cap);
      ph += "<tr><td>" + PHASES[k] + "</td><td>" + g3(q.meanGini) + "</td><td>" + pct1(q.roleShare[0]) + "</td><td>" + q.pmTop + "/" + q.n + "</td></tr>";
    });
    els.phase.innerHTML = ph + "</tbody></table>";
    els.kind.className = "mb-mkind " + kindCls;
    els.kind.textContent = r.kind;
  }

  function buildUI() {
    rootEl.innerHTML = "";
    var top = document.createElement("div"); top.className = "ab-top";
    var lab = document.createElement("label"); lab.className = "ab-pick";
    lab.innerHTML = '<span>Meeting</span>';
    var sel = document.createElement("select"); sel.id = "ab-meeting";
    ms.forEach(function (m, i) {
      var b = evaluate(m, "base");
      var o = document.createElement("option");
      o.value = i; o.textContent = m.id + " · top " + ROLES[m.role[b.topIdx]] + " " + pct1(b.top) + " · Gini " + g3(b.gini);
      sel.appendChild(o);
    });
    sel.addEventListener("change", function () { state.idx = +sel.value; render(); });
    lab.appendChild(sel); top.appendChild(lab);
    rootEl.appendChild(top);

    var panel = document.createElement("div"); panel.className = "mb-presets";
    els.btns = {};
    MOVES.forEach(function (p) {
      var l = document.createElement("label");
      l.className = "mb-preset" + (p.anti || p.brk ? " is-anti" : "");
      l.innerHTML = '<input type="radio" name="ab-move" value="' + p.id + '">' +
        '<span class="mb-pname">' + esc(p.label) + (p.anti ? ' <em class="mb-anti">anti-lever</em>' : "") + (p.brk ? ' <em class="mb-anti">break</em>' : "") + "</span>" +
        '<span class="mb-pnote">' + esc(p.note) + "</span>";
      l.querySelector("input").addEventListener("change", function () { state.move = p.id; render(); });
      panel.appendChild(l); els.btns[p.id] = l;
    });
    rootEl.appendChild(panel);

    var capRow = document.createElement("div"); capRow.className = "ab-caprow";
    capRow.innerHTML = '<label for="ab-cap">Cap per person</label><input type="range" id="ab-cap" min="25" max="60" step="1" value="30"><output id="ab-capout">30%</output>';
    rootEl.appendChild(capRow);
    els.capRow = capRow; els.capOut = capRow.querySelector("output");
    capRow.querySelector("input").addEventListener("input", function (e) { state.cap = (+e.target.value) / 100; render(); });

    els.verdict = document.createElement("p"); rootEl.appendChild(els.verdict);
    els.metrics = document.createElement("div"); els.metrics.className = "mb-metrics"; rootEl.appendChild(els.metrics);

    var grid = document.createElement("div"); grid.className = "ab-grid";
    var c1 = document.createElement("div"); c1.className = "ab-card";
    c1.innerHTML = '<h4>This meeting, by role <span class="mb-mkind"></span></h4>';
    els.kind = c1.querySelector(".mb-mkind");
    els.bars = document.createElement("div"); els.bars.className = "ab-stage"; c1.appendChild(els.bars);
    var c2 = document.createElement("div"); c2.className = "ab-card";
    c2.innerHTML = "<h4>All 40 meetings</h4>";
    els.strip = document.createElement("div"); els.strip.className = "ab-stage"; c2.appendChild(els.strip);
    els.phase = document.createElement("div"); els.phase.className = "dt-tablewrap"; c2.appendChild(els.phase);
    grid.appendChild(c1); grid.appendChild(c2);
    rootEl.appendChild(grid);

    var c3 = document.createElement("div"); c3.className = "ab-card";
    c3.innerHTML = "<h4>Who started speaking over whom (row started while column was mid-segment), and turns</h4>";
    els.matrix = document.createElement("div"); els.matrix.className = "dt-tablewrap"; c3.appendChild(els.matrix);
    rootEl.appendChild(c3);

    var hint = document.createElement("p"); hint.className = "mb-hint";
    hint.textContent = "Real rows: " + ms.length + " AMI scenario meetings (10 design teams of four, all four meetings each), " +
      ms.reduce(function (a, m) { return a + m.segs.length; }, 0).toLocaleString("en-US") +
      " speaker segments, segment-level timings from the manual annotations. AMI Meeting Corpus, CC BY 4.0; derived and modified (timings only). " +
      "Roles: PM project manager, ME marketing expert, UI user interface designer, ID industrial designer, assigned by the AMI scenario. " +
      "Simulated and modelled moves are rules applied to the real baseline, and the tag on each number says which kind it is.";
    rootEl.appendChild(hint);

    sel.value = String(state.idx);
    render();
  }

  function init() {
    rootEl = document.getElementById("airtime-bench");
    if (!rootEl || !root.AMI_SAMPLE) return;
    ms = prepare(root.AMI_SAMPLE);
    var def = rootEl.getAttribute("data-meeting");
    if (def !== null) ms.forEach(function (m, i) { if (m.id === def) state.idx = i; });
    buildUI();
    root.AIRTIME_LIVE = {
      set: function (move, cap, id) {
        if (move) state.move = move;
        if (cap !== undefined && cap !== null) { state.cap = cap; var c = document.getElementById("ab-cap"); if (c) c.value = Math.round(cap * 100); }
        if (id) ms.forEach(function (m, i) { if (m.id === id) { state.idx = i; document.getElementById("ab-meeting").value = String(i); } });
        render();
      },
      state: state,
      summarise: function (move, cap) { return summarise(ms, move, cap); }
    };
  }

  var api = { ROLES: ROLES, prepare: prepare, measure: measure, gini: gini, capShares: capShares,
              loudestSummarises: loudestSummarises, shuffleLabels: shuffleLabels, seedFor: seedFor,
              mulberry32: mulberry32, evaluate: evaluate, summarise: summarise, canon: canon };
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
    else init();
  }
})(typeof window !== "undefined" ? window : this);
