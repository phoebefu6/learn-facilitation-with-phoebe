<!-- learn-with-phoebe hub banner -->
> ### 📚 Part of [**Learn with Phoebe**](https://phoebefu6.github.io/learn-with-phoebe/)
> The shelf of 148 free, hands-on courses on AI, data, and the craft around them. **[Browse every course ↗](https://phoebefu6.github.io/learn-with-phoebe/)**
<!-- /learn-with-phoebe hub banner -->

# Learn Facilitation with Phoebe

Six 45-minute sessions on running a meeting where the group, not the facilitator, makes the
decision: owning the process and not the answer, agendas written as outcomes, Kaner's Diamond and
decision rules named in advance, an airtime bench built on 40 real meetings, steadying a room that
goes wrong, and closing with owners and a record. The running case is constructed: two teams at an
invented software company agreeing one shared roadmap in a 90-minute workshop.

**Live site:** https://phoebefu6.github.io/learn-facilitation-with-phoebe/

| # | Session | Signature thing |
|---|---|---|
| 1 | Own the process, not the answer | Kaner's four participatory values as four facilitator jobs; the sponsor contract |
| 2 | Agendas as outcomes | Purpose, outcome and process with a clock time for every item |
| 3 | Diverge, converge, decide | The Diamond read at source; consent, unanimity, majority and the person in charge |
| 4 | The airtime bench | Airtime, Gini, turns and overlaps for 40 AMI meetings, computed in the browser |
| 5 | When the room goes wrong | Structure before person: the dominator, the silent room, conflict, side talk |
| 6 | Close with decisions, owners and a record | The five-beat close and a seven-section decision record |

The bench in session 4 (`assets/airtime-live.js`, data in `assets/ami-sample.js`) holds segment
timings only (start, length, speaker) for 40 scenario meetings: ten design teams of four, drawn
with a fixed seed, all four meetings each, 21,166 segments. The project manager held 37.6 percent of
the airtime on average and spoke most in 30 of 40 meetings; the mean Gini of airtime is 0.198. A
round robin with a cap is simulated by a stated rule (30 percent cap: mean Gini 0.095). The
anti-lever, "let the loudest summarise", is modelled by giving the closing 10 percent of each
meeting to its top speaker (mean Gini 0.236, up in all 40). A break button gives every segment a
random speaker, and the project manager's lead vanishes (top in 9 of 40). The Python reference
(`materials/build-ami-airtime.py --json`) and the browser engine (`node materials/airtime-node.js`)
print identical numbers.

Data: AMI Meeting Corpus, manual annotations release 1.7, https://groups.inf.ed.ac.uk/ami/ ,
licensed CC BY 4.0. Carletta, J. et al. (2006) The AMI Meeting Corpus: A Pre-announcement, MLMI 2005,
Springer, doi:10.1007/11677482_3. Modified: segment timings only; no audio, words or participant ids.

By Phoebe Fu.
