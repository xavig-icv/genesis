# A record of copy events: where the failed appearances' heredity comes from (exploratory)

**The note, written before computing** (27 November 2026). The exploration lane (`docs/disseny.md`, 11-11-2026, with the practice of audits
45 and 46): this note goes into git before anything is computed on the pilot's branches, from a clean commit; the scripts and their outputs
as they come out; everything run before it, and after it outside the planned steps, in `previ/`, with its output, stderr, exit code, times,
whether it looked at anything of the pilot, and the SHA-256 of the code as git keeps it, the modules the note imports from other folders
included (`previ/executa.sh`, `previ/moduls.mjs`); one audit round afterwards. The owner chose this step on 27-11-2026 ("endavant amb el
registre dels esdeveniments", T-99), after audit 46.

## Where it comes from

The pilot's part B (entry 20 and after) ran 60 worlds in three soups each with no planting: the aged soup (continue), the shuffled soup and
the fresh soup (reinit). An inert census every 250 epochs, on 4,096 cells, detects heritable cells, and the lineage note (entry 21) follows
them as lineages. A **failed appearance** is a robust lineage that does not belong to the dominant group of an establishment. The aged soup
has more of them per world-epoch than the fresh soup: 33, 14 and 8, aged/fresh 4.41 [1.45; 14.90] (R0). The question since entry 26: are
they new replicators (births: maturation acting on their appearance), or pieces and copies of lineages already there (fragments)? The time
rule removes the appearances detected within 1,250 epochs before an establishment, as fragments of the dominant group; without them the
excess contains 1 (R1, 4.55 [0.90; 22.91]). Entries 27 to 29 tried to test the time rule with measures made from the bytes' origins (the
exposure bit, pairs of origins, a run in the dominant group's order), and each time the answer was "we cannot tell". At audit 46 both
auditors agreed that **no measure made from the saved origins is a genealogy**. Auditor 2 proposed a record of the effective events, a
genealogy tested first with known answers and then applied, also to the 17 aged appearances the time rule keeps; auditor 1, a short note on
how to tell a copy from a long piece, with their coverage. This note is auditor 2's proposal; auditor 1's coverage goes with it as a
descriptive companion (below).

## The question

For each failed appearance of part B (all of them: 55 in 33 branches, 33 aged, 14 shuffled and 8 fresh; 29 the time rule removes and 26 it
keeps; 137 cells), where did the heredity of its cells come from: from a lineage detected before it, by copies of heritable cells; from a
birth inside the window (heredity assembled in a cell from material that had not been in a heritable cell within two transfers); or from
before the window? And, counting the distinct births: are new origins more frequent, per world-epoch, in the aged soup than in the fresh?
The same observation for every appearance, in the three soups alike, in place of the time rule.

## What is recorded, and how

**The world** (`mon.mjs`): the world's epoch exactly as `sim.mjs` does it in a quiet 2D world, with the same modules and the same order of
random numbers (the small record's interpreter that lists the writes, `../registre-copies/traca.mjs`), and two things the simulator does not
need: its state (the soup, the order of the cells and the generator's four words) is saved as a checkpoint every 50 epochs inside each
window, and any segment of 50 epochs can be run again from its checkpoint, which must end in the next checkpoint byte for byte; and some
cells can be followed. For a followed cell and an epoch: its state before the mutations, the positions mutated, its state before its
interaction, its partner and the partner's state, where each of its bytes came from in the interaction (which byte of the two cells it was
copied from, and whether '+' or '-' changed it afterwards) and its state after. The simulator is not touched.

**Each branch** (`esdeveniments.mjs`) is run again from its start capture and seed to the end of the pilot's record, and must give every
measure (every 100 epochs: H0, the operations, the runs) and the final fingerprint of the pilot's record; every appearance's cells must hold
their programs at its census and be heritable there by the census's test. The records a chain needs are fetched by running their segment
again, following the cell asked for and its neighbours within 4 cells (the partners, within 2, and theirs).

**Heritable** is the inert census's test, exactly as the pilot's census applied it (`fase2/inert.js`: the three conditions of seed
3,000,000,000, heritable in any): the appearances were detected with it.

**The chain** of a cell (`cadena.mjs`), from its census back, while its states stay heritable:
- **An acquisition**, a step (a mutation, or an interaction) whose state before is not heritable and after is: each of the 64 bytes after is
  traced back, through the cell's own history and through at most **K = 2** transfers between cells, to a holder that was heritable while
  it held the byte (H). A byte that was created by a mutation, or was at the window's start in a cell that was not heritable, or goes back
  more than K transfers without reaching a heritable holder, is not from a heritable holder. **Inherited** if H is 32 or more (half the
  program): the chain moves to the holder that gave the most bytes, at the latest point it was heritable holding them. **Else, a birth**,
  at that cell and epoch: the heredity was assembled there from material that had not been in a heritable cell within K transfers.
- **A replacement**: a heritable partner wrote 32 bytes or more over a heritable cell: the chain moves to the partner.
- **An earlier lineage**: when the chain moves to a holder whose state carries a window of a lineage detected before the appearance's census
  (16 bytes in a row with 6 different values or more, of the program or its mirror: the tracking's rule; any lineage of the branch's
  tracking first detected earlier, the dominant group's or another), it ends there.
- **Older**: still heritable at the window's start (1,250 epochs before the census, or the branch's start). **Unresolved**: past 64 hops.

**An earlier lineage, by origin.** A lineage changes as it spreads: even with no mutation, the '+' and '-' its copies run and its mixing with
other bytes make heritable variants that no longer carry any window of the programs the census found (the checks' test world d: a chain
passes through five such variants before a holder still carries one). So a chain could go through an earlier lineage's variants back to that
lineage's own birth, inside the window, and call it a new birth. Hence **the reference lineages**: for each census, the branch's other tracked
lineages first detected inside its window before the census, or at the census if they are the dominant group's (69, `prepara.mjs`); the
chains of at most 4 of their cells (the first in the tracking), from their first census, with the same rules. **A birth that a reference
lineage's chains also reach, or the chains of a failed appearance of an earlier census of the branch, is that lineage's origin: the end
becomes "earlier lineage" (by origin).**

**An appearance's class**: the end of more than half of its cells (after the origin rule); else **mixed**. **Its origins**: the distinct births (cell, epoch, step)
its cells' chains reach. **The evidence**: at each acquisition and birth, the states before and after (and the partner's), and the count of
the bytes' origins (H, the rest by kind); the analysis tests every state again.

**A sensitivity**: the same chains with K = 4. Not read.

## The instrument's checks, before it is used (`prova.mjs`)

1. **The generator and the world**: the same numbers as `fase1/soup.js`; the same soup and operations as the small record's world (itself
   checked against `sim.mjs`), with cells followed or not; a segment run again ends in its checkpoint, and one bit changed in a checkpoint
   makes the replay fail; each record keeps its own check (each byte after an interaction is the value at its provenance).
2. **The rules, with synthetic records**, each with its known answer: a copy of a heritable partner (inherited); a broken copy repaired by
   the cell's own '+' (a birth); a loss by a mutation and a repair (inherited from the cell's own past, then older); bytes from a partner
   that is not heritable which got them from a heritable cell one transfer before (inherited; with no transfer allowed, not); a replacement,
   and a partial overwrite that is not one; a birth by mutations; an earlier lineage; the origin rule (a birth an earlier lineage also
   reaches becomes its origin; another birth, or another end, stays).
3. **The chains in test worlds** whose genealogy is known by construction (random bytes; the replicator of Phase 1 and its variant, planted
   by the test; 150 heritable cells followed per world, a fixed random sample): one planting (every chain ends at it); the same program
   planted twice, far apart (each chain ends at the one on its side: equal programs, two ancestries); a planting before the window (older);
   the planting as an earlier lineage (every chain ends there, where a holder still carries one of its windows); a loss and a
   re-acquisition (after the loss); a broken program planted and repaired in place (the birth is the repair); the variant replaced by the
   replicator (each carrier ends at the planting of what it carries); the origin rule (a lineage detected at epoch 100 and an appearance at
   200 of the same planting: every chain of the appearance ends at the earlier lineage's origin); with mutations (95 % or more of the chains
   end at the planting).
4. **The validator fails closed** (`valida.mjs`): a synthetic record (an appearance and a reference lineage) is valid, and every impossible
   variant of it is rejected.
5. **The analysis** (`analisi.mjs`), on synthetic records of every branch of the list with a known answer (the aged soup's chains births,
   the shuffled soup's older, the fresh soup's earlier lineages, the reference lineages' chains ending at a birth of the aged soup): the
   counts, the origin rule and the reading come out as built; with another commit, it reads nothing.
6. **The coverage** (`cobertura.mjs`), with known answers (a copy, its mirror, a shift, a piece of 20 bytes, one byte in four) and on a
   synthetic record of the continuity note's format: a copy reaches the threshold, a long piece and nothing of the donors do not.

## The run

- **The list** (`prepara.mjs`, run before the note: `previ/prepara-1`, and `previ/prepara-2` with the reference lineages): 55
  appearances, 137 cells, 33 branches, 38 detection censuses, 69 reference lineages (125 cells followed); 209,250 epochs to run again. The start captures are copied from the pilot's computation copy with their SHA-256 (not in git).
- **The budget** (`previ/temps-1`, a test world of the pilot's size, 512 × 256, with the replicator planted at 10): 163 ms per epoch with
  no cell followed; 20 chains from epoch 400 back to the planting, 1,934 s (262 segments run again, about 7.4 s each), all ending at the
  planting; with K = 4, 18 s more (3 segments). For the pilot: the 209,250 epochs, about 9.5 hours of one core; the 262 cells' chains (137
  appearances' and 125 reference lineages'), some 7 hours at that rate, maybe more with windows of 1,250 epochs. Six at a time, at low
  priority: some 4 to 8 hours. The records of the segments, at most 300,000 per branch kept in memory (the segments used least recently
  are forgotten and run again if needed: the same records), forgotten after each census. **The limit**: two days; past it, the run stops
  and the note says what was done.
- **The order**: `prova-sortida.txt` from the note's commit, all its checks passing; a short test (one branch, `7014-continue-natural`, its
  record in `prova/`, checked by `curta.mjs`, which prints no class and no end); the full run (`llanca.sh COMMIT`, 6 at a time at low
  priority, the longest branches first); the records into git before anything is read; the short test against the full run's record of the
  same branch (`compara.mjs`); `analisi.mjs --code COMMIT --check`; `analisi.mjs --code COMMIT`, its output into git as it comes out.

## What would change my mind

- **The recount** (`analisi.mjs`, §4): Ro, the distinct births reached by each branch's appearances classed birth, and Ro+, with each
  appearance not decided (older, unresolved, mixed) as one more; per 1,000 world-epochs of the earlier notes' exposure; aged/fresh, with the
  world as the unit of the bootstrap (10,000, seed 3,500,000,000). **Both intervals above 1:** "more new origins among the failed
  appearances of the aged soup than of the fresh (these branches, this instrument)". **Neither above 1** (or not computable): "not shown".
  **One:** "it depends on the appearances not decided".
- **The time rule** (§5): of the aged soup's 16 time-rule removals, those decided (birth or earlier lineage): two thirds or more earlier
  lineage, "mostly descendants of earlier lineages, as the time rule assumed"; two thirds or more births, "mostly births, against what the
  time rule assumed"; else "mixed".
- **The instrument**: if a check of `prova.mjs` fails, nothing is run on the pilot. If a branch fails (a measure, the fingerprint, a
  checkpoint, an appearance's program or heritability at its census), the analysis reads nothing, and the failure is reported. **If more than
  half of the appearances are not decided (older, unresolved, mixed), the note says that the instrument does not decide on these worlds,
  and the recount is not read.**

## What it is not

Exploratory. **A birth is not "a replicator from nothing"**: it is the first heritable state of material that had not been in a heritable
cell within two transfers, heredity assembled anew in that cell, from material that may have come from anywhere (also from the dominant
group, through more transfers or through cells that were never heritable). **Inherited** is half the program or more from heritable holders
within two transfers; the earlier lineage is recognised by the holder's material (a window of its programs), where the chain stops. The
census's test defines heritable, with its three conditions; detection is on a sample (4,096 cells every 250 epochs), so the appearances are
the detected ones, and a birth that reaches no sampled cell is not counted. Only the failed appearances, not the established groups. Not
where maturation acts in general (AUD-184 = AU2-151): at most, for these failed appearances, whether their heredity is new. Not a full record
of every copy in the world: the cells a chain needs, and their neighbours.

## Auditor 1's coverage, as a companion (`cobertura.mjs`, descriptive)

For the 23 appearances with the dominant group's earlier lineages of the continuity note's records (16 aged, 7 shuffled), auditor 1's
coverage (audit 46, §2), fixed here before it is computed: how many of a cell's 64 bytes one carrier of half A holds at one alignment,
counting the bytes with the same origin; the threshold, the 10th percentile of the first 200 cells of half B's sample; four classes (copy;
long piece, ordered but below; pieces; none), an appearance a copy if half or more of its cells are. Printed against the events' classes. The
shuffled soup's seven had not been measured this way (auditor 1 kept them blind). Read only as agreement or disagreement with the events.

## Everything tried

Before the note, in `previ/` (each run's output, stderr, exit code, times and the SHA-256 of the code, in `previ/registre.txt`); test worlds
only, but for the two preparations and one count, which read the pilot's data in git and copied the start captures, with no branch run:
- **prova-1** (10.39): the first rule classified an acquisition by its own step only (an acquisition with bytes from a heritable partner
  that were needed, inherited; else a birth). Sections 1 and 2 passed; in the test worlds, hundreds of false births: cells that received
  part of a copy from a heritable cell and completed it later, with their own bytes or a non-heritable partner's. The tool's time limit
  stopped it at 10.59, and `previ/executa.sh` with it, before its registry entry: the entry is written by hand, and the code it ran is
  rebuilt from the session (`previ/reconstrueix.mjs`, the run **reconstrueix-1**, `previ/prova-1-codi/`). Since then `previ/executa.sh`
  writes each run's header before the run. **The rule changed:** every byte traced back to a heritable holder.
- **prova-2** (10.55): sections 1, 2 and the first test world passed (1,371 of 1,371 chains end at the planting). I stopped it at 11.07:
  with every heritable cell of every test world as a head, it would have outlasted the time limit. **From prova-3 on, 150 heritable cells
  per test world, a fixed random sample.**
- **prova-3** (11.10): three checks failed. Two were mistakes in the checks themselves (in b, the heads counted by a field that is no
  longer there; in e, the wipe and a new copy in the same epoch); in d, every chain ended as an earlier lineage, but after more than one hop.
  Meanwhile **the rule changed** (before prova-4): a byte that goes back more than K transfers without reaching a heritable holder counts
  as not from a heritable holder, so an acquisition is inherited or a birth (in an active soup, bytes move between cells all the time, and
  with "not decided" almost every acquisition would have been undecided).
- **prepara-1** (11.13): the list, and the start captures copied.
- **prova-4** (11.42): b and e fixed; d printed its chains: they pass through heritable holders that the window rule does not recognise.
- **diag-1** (12.16): those holders are heritable variants of the replicator that no longer carry any of its 16-byte windows, made, with
  no mutation, by the '+' and '-' its copies run and by mixing; a holder further back still carries one. **The origin rule and the
  reference lineages were added** (above), and d's check now asks for an earlier lineage after one hop or more.
- **referencies-1** (12.18): 69 other lineages first detected inside the windows, 389 cells (so at most 4 cells each: 125).
- **prepara-2** (12.22): the list with the reference lineages.
- **prova-5** (12.23): every check passed, the origin rule's test world included (sections 5 and 6 were added after it started).
- **temps-1** (12.36): the budget (above).
- Before prova-6, **the records kept in memory were capped** (300,000; temps-1 reached 1.3 GB with 265 segments) and the reading's rule for
  appearances not decided was written in `analisi.mjs`.
- **prova-6** (13.01): every check of the six sections passed (`previ/prova-6.txt`). After it, one check added to `esdeveniments.mjs` (the programs of a reference lineage first detected at the branch's start; there is none), which prova.mjs does not run.

- **The final block** of `previ/registre.txt` (the SHA-256 of the code as it enters the note's commit, the modules imported included): its
  first version listed every file as changed, because `previ/executa.sh --final` read its own lines back; declared there, fixed, and
  written again. Since prova-6, `esdeveniments.mjs` (the check above) and `previ/executa.sh` (that fix) changed.
- **The machine's paths** in three command lines of the registry (the pilot's computation copy, the session's transcript) were replaced by
  a description before the note went into git, and the registry says so.

(After the note, the planned steps, and anything outside them: to be completed.)
