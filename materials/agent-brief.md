# Agent brief - shared by every fan-out page of learn-facilitation-with-phoebe

You are writing ONE static HTML session page. No servers, no npm. **If your target file already
exists on disk, do not write it; report that and stop.** Write the file, return its path and one
line of coverage. No HTML in your reply.

## Read first, in this order

1. The template page. Copy its structure, classes, SVG grammar and quiz markup EXACTLY, including
   how many options each question has (FOUR, labelled "A · ", "B · ", "C · ", "D · "):
   - `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-facilitation-with-phoebe/courses/01-own-the-process.html`
   - For rhythm only (a bench page, do not copy its widget): `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-facilitation-with-phoebe/courses/04-the-airtime-bench.html`
2. The source map: every verified number, its evidence tier, per-session coverage, the seams. Use
   ONLY its numbers; never invent a statistic; if a fact is missing, teach the uncertainty.
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-facilitation-with-phoebe/materials/official-course-map.md`
   (deeper detail per source, if needed: `materials/research-notes.md` in the same repo)
3. The stylesheet `:root` block for the palette tokens (first 30 lines):
   `/Users/phoebe.fu/Documents/Claude_Work/github_repo/learn-facilitation-with-phoebe/assets/style.css`

## Page skeleton (keep every component)

toolbar (crumb EXACTLY "Session N of 6", linked repo name as in the template, #toggle-all,
#zoom-toggle) · masthead (eyebrow "Learn Facilitation with Phoebe · Session N of 6", h1 with one
`<span class="accent">`, .sub, .chip-row with the level chip (🟡 Core for sessions 2 and 3, 🟠 Deeper
for 5 and 6) plus two .chip.audience and the .chip.time "45 min", .agenda a1-a4) · main.wrap ·
section#intro (Part 0: kicker, .lede, .legend pills as in the template, .callout.win "★ What you walk
out with tonight") · 3 Parts, each `section.section#part-N` with section-kicker (klabel "Part N ·
covers ...", h2, `.tag.concept "N min live"`), a `.lede`, ONE figure, `details.card` accordions
(summary: `.mode.live` or `.mode.self`, title, `.mini`, `.caret ▶`), at least one `.callout.example`
with `span.ex-pill` "Real world" on the page · section#demo-1 Build-along (kicker `.tag.demo "★ 22 min ·
everyone builds"`, .lede, ONE figure, `.steps > .step`, each with a `.prompt-box.good` carrying a
`span.label`; the build-along is Jo's work on the constructed Larkfield workshop, written as plain-text
templates the learner fills for their own meeting) · section#exercise Homework (ol, 4 items) ·
section#quiz (3 x `.quiz-q data-answer="0-based"`, `p.qtext`, four `button.qopt` "A · ..." as in the
template, `p.qwhy`; one `p.quiz-score` after the last; vary the correct letter) · section#official, h2
EXACTLY "What this session teaches, and where it came from", `.covered > .covered-row` (pill solid ✓ /
light ◐ + name + note), then the `.mono` line EXACTLY "Every fact on this page, and its verification
tier, is recorded in the course's source map." · section.cheat#cheatsheet (h3 "Session N cheat sheet
<span>· pin this</span>", .grid-2 of six .cheat-item) · `.callout.next` with `.nx-pill` "Next session"
· footer.pagefoot · `<script src="../assets/app.js?v=1"></script>`.

Head: the template's social meta block with this page's own title/description/url;
`<title>Session N · <Title> - learn facilitation with phoebe</title>`;
`<link rel="stylesheet" href="../assets/style.css?v=1">`. Nothing else external.

First `details.card` in the FIRST Part is `open`; no other. Sentence case headings. Warm
practitioner voice, concrete, never dry. Inside prompt-boxes escape `&` `<` `>`. 450 to 650 lines
is guidance about depth, never a target: never collapse whitespace, dissolve a list into a
paragraph, or drop a component to fit.

## Hard rules (a violation is rework)

- NEVER an em dash or en dash, anywhere (prose, code, aria-labels, comments). Hyphen only.
- No meta text: never "this course", "in this course", "the course teaches", "banned here". State
  the professional norm directly with its reason. The two exact estate phrases above are the only
  self-references; "session 5" cross-references are fine.
- Attribution "by Phoebe Fu". Never "built with" a tool.
- Every number comes from the map or is labelled constructed. Larkfield numbers (11 people, 8 items,
  room for about 4, 90 minutes, 15:00-16:30, 16:20 fallback) are constructed and say so.
- Contested or missing evidence: teach the disagreement; never resolve what the literature has not.
- Citations in the exact form of the map's appendix; anything marked reported is "reported".
- NEVER "lottery" or "lotteries"; say the mechanism. No Chinese terms.
- Never a cross mark glyph (✗, ×, ❌) anywhere, including figures: label a wrong way in words
  ("Topic agenda", "Wrong way") and use the universal reds only for that panel.
- Titles, widget ids and class names must not collide with siblings: do not use "Running the room",
  "Meetings to actions", "Decide and communicate", "Decisions first", "Coach the room live"; do not use
  ids or classes starting `ab-`, `airtime`, `mb-`, `f1`, `f4` (those belong to other pages).
- Kaner facts exactly as the map: the decision rules Kaner indexes are unanimous agreement, majority
  vote, flip a coin, person-in-charge decides after discussion, person-in-charge decides without
  discussion. "Delegation" is NOT verified: do not attribute it to Kaner. "Content-neutral" is Doyle's
  phrase (reported). Do not quote Kaner's body text beyond the map; page numbers only as in the map.
- Do not repeat the Franklin quote from the Liberating Structures page; do not cite Rogelberg or any
  meeting statistic not in the map; do not say Google found turn-taking matters.
- Never use Phoebe's own employers, clients or career; the running case is Larkfield, constructed.
- Seams: one line and a link, never teach the neighbour's content (see Cross-links).

## Figure grammar (hand-drawn, every figure)

Palette, ONLY these hexes (no invented greys): #7D5F33 (accent) #4F3B1D (accent-deep) #6A5029 (mid)
#E6D5B3 (soft) #F8F1E3 (accent-50) #2A2117 (ink) #6A5D4D (muted) #DCD0BC (faint) #EDE5D6 (hairline)
#1C6A86 (contrast teal) #124A5E (contrast-ink) #E4F1F5 (contrast-50) #FFFDF8 (paper) · `#FFFFFF` ·
universal reds `#991B1B` `#FEF2F2` `#FCA5A5` only for a wrong-way panel.

- `<figure class="zoomable">` > `<svg viewBox="0 0 880 H" xmlns="http://www.w3.org/2000/svg" role="img"
  aria-label="the data, not the shape">` > `<defs>` + `<style>` + content, then
  `<figcaption>🔍 Click to zoom - takeaway</figcaption>`. Grow H, never W.
- Prefix unique per figure, used for every class and id: `f<session><letter>`, e.g. f2a, f2b, f2c,
  f2d for session 2 (f3a.. for session 3, f5a.., f6a..).
- `<defs>` holds with prefix P: a wobble filter `id="PSk"` (`feTurbulence type="fractalNoise"
  baseFrequency="0.02" numOctaves="2" seed="<int>"` + `feDisplacementMap scale="2.4"
  xChannelSelector="R" yChannelSelector="G"`, `x="-3%" y="-3%" width="106%" height="106%"`), a
  hachure pattern `id="PHc"` (7x7 userSpaceOnUse, rotate(-38), one #7D5F33 line, opacity .5) if used, an
  open arrowhead `id="PAr"` (path `M1 1 L9 5 L1 9`, fill none, #2A2117 stroke 1.6) if used. ALL shapes
  sit inside ONE `<g filter="url(#PSk)" fill="none" stroke="#2A2117" stroke-width="2"
  stroke-linecap="round" stroke-linejoin="round">`; rects carry a tiny rotation (-4 to 4 degrees for
  hand-placed items, under 1 for panels). Fills: white, #F8F1E3, the hachure for "the pile", and the
  teal contrast ONLY for the one thing the figure is about. One doodle anchor per figure, simple
  strokes, never a mascot. Text classes (copy the template's `<style>` block, renamed): `.PH` 800 12px
  ink heading · `.PL` 600 12px ink label · `.PS` 400 11px muted · `.PB` 800 11px #124A5E · `.PV` 800
  12-20px #4F3B1D value · `.PW` 800 11-12px white on a dark fill · `.PA` 700 11px #7D5F33 caption ·
  `.PN` 400 12px muted note. Hand-stacked items must not overlap as painted rects.
- ALL `<text>` OUTSIDE the filtered group, sans stack, never below 10.5px.
- Fit: max chars ≈ (box width - 20) / 7 at 12px, 6.4px/char at 11px; full-width note under 110 chars;
  40px between neighbouring point labels; bottom note 22px below the last row, H clears it by 8px.
  When in doubt, shorten. NO line, arrow or curve may pass through or touch a text label (the gate
  flags line-through-text): route arrows in the gaps and put edge labels clear of the path.
- Floor: one figure per Part plus one in the build-along (4 figures). Draw the MECHANISM (e.g. an
  agenda item as three stacked fields with a clock time; the Diamond as a shape with zones and where
  a group stalls; a decision-rule tree; an escalation ladder from structure to private word; the
  decision record as a sheet with owner and date columns), never a metaphor literally, never decoration.

## Voice and honesty

Every Part gets a story: Larkfield (always labelled constructed on first use per Part) or a generic
"a familiar pattern" with no invented numbers. The `.callout.example` "Real world" pill may hold a
familiar workplace pattern described without statistics, or a Larkfield moment labelled constructed.
People in Larkfield: Jo (facilitator, third team), Ravi (Platform lead), Mara (Growth lead), Dana
(head of product, sponsor), nine team members, and a data lead invited for item 6. Item 1 (compliance
deadline) is already committed and not one of the four. Rule: consent among the eleven; fallback at
16:20, Dana decides after hearing the two leads summarise remaining objections (set in session 1).

## Cross-links (absolute URLs)

- Training-room version (clock-time plans, difficult learners): https://phoebefu6.github.io/learn-course-design-with-phoebe/courses/b3-running-the-room.html
- Programme meetings to tracked actions: https://phoebefu6.github.io/learn-ai-project-management-with-phoebe/courses/b7-meetings-to-actions.html
- Group decision quality, calibration: https://phoebefu6.github.io/learn-decision-intelligence-with-phoebe/
- Disagreement and bad news one-to-one: https://phoebefu6.github.io/learn-communication-with-phoebe/courses/06-bad-news-and-disagreement.html
- Giving a talk: https://phoebefu6.github.io/learn-public-speaking-with-phoebe/
- Hub: https://phoebefu6.github.io/learn-with-phoebe/

## Footer chain and session titles

Footer left: "Session N of 6 · learn-facilitation-with-phoebe · by Phoebe Fu &nbsp;·&nbsp; 📚 <a href="https://phoebefu6.github.io/learn-with-phoebe/">Learn with Phoebe ↗</a>"
Footer right: "<a href="PREV">← Prev: <title></a> &nbsp;·&nbsp; <a href="NEXT">Next: <title> →</a>" (last page: "← Prev" and "<a href="../index.html">Course home →</a>").

Session titles and files (exact, sentence case, one accent span in h1, accent word in brackets):
1. 01-own-the-process.html · Own the (process), not the answer
2. 02-agendas-as-outcomes.html · Agendas as (outcomes)
3. 03-diverge-converge-decide.html · Diverge, converge, (decide)
4. 04-the-airtime-bench.html · The (airtime) bench
5. 05-when-the-room-goes-wrong.html · When the room goes (wrong)
6. 06-decisions-owners-record.html · Close with decisions, owners and a (record)
