# The lab notebook, entry by entry

*An English summary of each entry of the [lab notebook](index.html), which is written in Catalan and is the reference. Each summary
says what the entry asked, what came out and how sure we are. Where a later audit corrected an entry, the summary gives the
corrected reading. The Catalan terms are in the [glossary](../docs/glossari.md). Summaries written on 5 November 2026.*

**How sure we are:**
- **Exploratory:** we looked at the data. A pattern is a lead, not a result.
- **Pilot:** a small run to calibrate a design. No conclusion.
- **Preregistered:** the measure, the test, the sample and the decision program were tagged in git before the first run (and, for
  the later series, the tag was timestamped on Bitcoin). The decision is taken by the tagged program.
- **Descriptive:** measured, with intervals, but without a hypothesis test.

**What "life" means here:** from entry 8 on, life *becomes established* when at least 1% of a census sample of 2,048 cells are
heritable replicators (programs whose copies can copy themselves again), in two consecutive censuses, 250 epochs apart. It is an
operational definition of the model, nothing more. Entries 1 to 6 used earlier criteria, which they state.

<a id="entry-1"></a>
## Entry 1 · 14 October 2026 · The soup comes alive (exploratory)

A soup of 131,072 random 64-byte programs in the BFF language, with no replicator written in and no reward for copying. With seed 1,
nothing special happens for 190 epochs. Then, within about 30 epochs, the higher-order entropy jumps from 0.28 to 3.07 bits per byte,
and the instructions executed per pair rise from 76 to over 600: the soup fills with copies of a program nobody designed. Its 39-byte
core reads almost the same both ways (35 of 39 bytes match), and the entry explains how its copy loop works. The run is reproducible:
the same seed gives the same history. With other seeds, life came much later or not at all.

<a id="entry-2"></a>
## Entry 2 · 14 October 2026 · The life that poisoned itself (exploratory)

It starts with a correction: what entry 1 took for a flood of one repeated byte (seed 3) was a real replicator. At epoch 8,950, 27.6%
of the programs were replicators; 1,500 epochs later, only 2 in 4,000 could still copy themselves. The same 150 replicators copy
themselves 93.5% of the time with random partners, 75.8% with partners from the soup at epoch 8,950, and 6.2% with partners from the
soup at epoch 10,450. The world had become hostile, mainly because of zero bytes, which stop the copy loop. This led to the open-world
laws of phase 2, and much later to the zeros test (entry 13).

<a id="entry-3"></a>
## Entry 3 · 14 October 2026 · The 2D world, first attempt: silence (exploratory)

The same chemistry on a 2D map, where each program only meets its neighbours. In three worlds and 16,000 epochs, no family of
replicators appeared (replication test on 6,000 random cells at four epochs, and the family tracker on the whole map). The entry warns
that this cannot show that space hinders life: there are only three cases, there are fewer encounters (only 75% of the cells pair each
epoch), and the soup itself is very irregular.

<a id="entry-4"></a>
## Entry 4 · 15 October 2026 · Currents: how much mixing does life need? (exploratory)

Currents that move cells around, from a quiet world (m = 0) to a fully mixed soup (m = 1), with three seeds each. Life (higher-order
entropy above 1 bit, and 34% to 95% of programs replicating at the end) appeared at m = 0.001, m = 0.01 and m = 1, and not at m = 0 or
m = 0.1. With three seeds, no trend can be claimed. Three ways of copying appeared, one of which needs a partner. The sweep also exposed
three blind spots of the family tracker, which were fixed. Entry 6 corrects one statement: the quiet world does produce life sometimes.

<a id="entry-5"></a>
## Entry 5 · 15 October 2026 · Flow: saving the replicator that needs a partner (exploratory)

Branches from the burst of the partner-needing replicator of entry 4, continued under different kinds of flow. Without help it dies
within 200 epochs, and no river saves it. A strong enough renewal of material (0.3% to 1% of the world per epoch) keeps it alive, and it
keeps evolving. One branch with a soft renewal showed boom-and-bust cycles, and in a torrential river a new life appeared. These are
three continuations per condition, from a single starting point.

<a id="entry-6"></a>
## Entry 6 · 15 October 2026 · Fifteen seeds and an audit (exploratory)

The quiet world against a weak current (m = 0.01), with 15 seeds each: life (higher-order entropy above 1 bit) in 3 of 15 quiet
worlds and in 8 of 15 with the current. The first external audit, by another Claude instance, showed why this series cannot prove
an effect. Its two most important findings: the random generator had a single cycle of 2³² numbers, which a 2D world exhausts, so seeds
were not independent (it was replaced by xoshiro128\*\*, and the old one is kept to reproduce earlier results); and one analysis tool
counted false replicators (no published figure was inflated). This is what led to the preregistered series of entry 8.

<a id="entry-7"></a>
## Entry 7 · 16 October 2026 · What it means to be alive (method)

A copy is not a replicator: a hand-made partial copier (24 data bytes and a loop that copies them, but not the loop) passed the old
test in 586 of 586 trials. The test now has a second generation: a program counts only if its copy can copy itself again (a heritable
replicator). Re-measured with it, the poisoned soup of entry 2 had 8.8% of programs copying but only 4.3% heritable. The interpreter
was also checked against Google's original cubff code: identical, byte for byte, on 200,000 tapes. A later note (audit 3) fixes a gap
in the heredity test and records a known blind spot: in context, the partner's code can do the copying (AUD-42).

<a id="entry-8"></a>
## Entry 8 · 18 October 2026 · 160 worlds and an inconclusive result (preregistered, series 1)

Does a weak current make life become established more often? 80 quiet worlds against 80 with a current, with the rules sealed before
starting and a two-stage design. Life became established in 24 of 80 quiet worlds (30.0%) and in 34 of 80 with the current (42.5%). The
log-rank test gave Z = −1.83, and the preregistered bound was |Z| > 2.004: inconclusive. It neither shows an effect nor rules it out.
Part of the extra life with the current does not last: 1,000 epochs after establishment, it held in 23 of 23 quiet worlds and in 26 of
33 with the current.

<a id="entry-9"></a>
## Entry 9 · 19 October 2026 · How long established life lasts: an exploration (exploratory)

29 worlds continued from the moment life became established, without and with a current, for 2,000 more epochs. In none of the 58
branches did the heritable replicators vanish from the sample. The 1% threshold is a poor criterion for death (7 of 13 "deaths" by
one rule were false), and with a rule with a margin, the current does not seem to shorten life. A world's fate is not fixed at
establishment: two continuations of the same history disagree in 4 of 27 worlds. It served to design the series of entry 10.

<a id="entry-10"></a>
## Entry 10 · 25 October 2026 · How long established life lasts: the preregistered series (preregistered, series 2)

29 new worlds, continued from establishment with two seeds per condition for 5,000 more epochs. In its own condition, 93.1% of the
branches show no sustained loss of life. Whether a change of condition shortens life, the series cannot say: losses are rare. With a
current, life occupies more of the world on average during the first 2,000 epochs: confirmed, but expected from theory. Neither is a new
discovery. Audit 14 made the wording precise: the second test measures the share of the world, not the speed of a front.

<a id="entry-11"></a>
## Entry 11 · 25 October 2026 · The fragility of a world: a lead in the zeros (exploratory)

In some worlds, established life is lost again and again, even when the world is re-run from the same point. At establishment, those
fragile worlds have a much higher share of zero bytes, which appear during the 250 epochs in which the replicator spreads. Found by
looking at the data, with 7 cases and a threshold chosen afterwards. The hypothesis is self-poisoning: the spreading replicator leaves
broken copies full of zeros, which stop later copies. Entry 13 tests it.

<a id="entry-12"></a>
## Entry 12 · 27 October 2026 · The maturation of the soup: the pilot (pilot)

22 worlds without life after 8,000 epochs, each split into five branches from the same instant and with the same randomness: continue
as is, three kinds of shuffling, and a fresh soup. Within 8,000 more epochs, life became established in 27% of the branches that
continued as is, in 27% with all bytes shuffled and in 18% with a fresh soup. With 44 branches per arm, the intervals overlap, and
there is no conclusion. It calibrated the series of entry 14.

<a id="entry-13"></a>
## Entry 13 · 29 October 2026 · The zeros test: removing them from the same snapshot (preregistered, series 3)

In 8 worlds where life drops right after becoming established, each world was restarted from the same instant in four ways, with the
same randomness. If the zeros of the non-replicating cells become data bytes, life drops less, or grows more, than with a placebo that
changes as many data bytes, in all 8 worlds: the test confirms it. Against the untouched world it happens in 7 of 8, which the test
cannot confirm. It only applies to these worlds, chosen after seeing the data. It is not a discovery: zero poisoning is described in
the 2024 paper. What the test adds is causal evidence, from an intervention on the same snapshot with a control.

<a id="entry-14"></a>
## Entry 14 · 4 November 2026 · The maturation of the soup: with the aged soup, life becomes established more often (preregistered, series 4)

150 quiet worlds that reach epoch 8,000 without life and without any detected heritable cell. Each was continued for 8,000 more
epochs in three ways, from the same snapshot and with the same randomness: the aged soup as it is, its bytes shuffled, and a fresh
soup. Life became established in 64 of 300 branches with the aged soup, in 40 with a fresh one, and in 82 with the aged soup
shuffled. Both preregistered tests (exact sign-permutation tests, with calibrated Holm thresholds) reject: p = 0.0067 and
p = 3.05·10⁻⁵. These are total effects in this cohort, not a mechanism. The shuffle itself creates replicators at once, so the second
test does not isolate the composition. Knierim et al. (2026) find that random search finds a replicator about 17 times sooner with the
distribution of the bytes a BFF soup writes than with uniform bytes, which makes the shuffled-soup result expected. That says nothing
about the soup kept as it is. Audit 27 corrected the title, which said that life "arises" more often.

<a id="entry-15"></a>
## Entry 15 · 5 November 2026 · The ingredients of the chemistry: what a random program needs to copy itself (descriptive)

The first level of B1: 10⁷ random programs (each byte is an instruction with probability ½), tested with the usual chemistry and with
twelve variants, each with one rule changed. The three controls (no copy instructions, no loops, or no copying from one program to the
other) give no heritable replicator, as expected; a zero does not prove there can be none. The usual chemistry gives 1,625, one in
6,150 programs. With only one of the two copy instructions there are fewer (71% with `,`, 39% with `.`). Without arithmetic there are
twice as many, and if a program cannot rewrite itself, four times as many. With the two heads aligned, 31 times as many, as Knierim et
al.'s CUST64 distribution suggests. With uniform random bytes, the test finds 44 times fewer, and none of them copies itself: with inert
partners none of the 37 copies (the autonomy test of 12 November 2026), and the copying was done by the test's random partner. Whether these chemistries let life become established in a soup is the
question of level 2.

<a id="entry-16"></a>
## Entry 16 · 12 November 2026 · The soup before life: what the data we already had say (exploratory)

The first step of the line the project now focuses on (what happens in the soup before life), done without any new simulation, from the
records and snapshots of already decided series. The lifeless soup matures along the same curve in every world (the byte distribution
drifts away from uniform, faster with a current), and it piles up instructions, mainly `<` (ten times its random frequency), crowded into a
few programs. Yet an aged soup has fewer cells that copy themselves than a fresh one (23 against 118 of 131,072; shuffled, the same bytes
give 706), and the few replicators that appear are lost at once: in one world scanned every 100 epochs, a single real outbreak reached
76 cells and vanished. Isolated "heritable" cells in such scans turned out to be false positives of the replication test (none passed
any of 200 retests; the outbreak's cells passed all), because the random partner sometimes does the copying. Two branches of the same
world become established independently, so establishment is a chance event. *(Corrected on 12-11-2026, consultation X-105: the branches
are compatible with independence, with little power (AUD-183); the false positives are of autonomy (AU2-152); and whether maturation
acts on appearance, on rooting or on both, we do not know yet: a count at one moment is not a rate (AUD-184, AU2-151).)* Two earlier
readings do not hold, as both auditors showed:
the establishment rate rises with age even when the soup no longer matures (so the rise is mostly the start-up delay of any clean soup),
and the dominant family at establishment is not made of what the soup piles up. The general idea of a pre-replicator phase was already
described in the Amoeba system (Greenbaum and Pargellis, 2017). What may be new is a specific mechanism in BFF, tested by intervention.
*(Updated on 12-11-2026 with the 2016 conference version, read in full; the 2017 article is paywalled.)* They measure the bias with the
entropy of single instructions, the same kind of measure as our D, and they make no intervention. In Amoeba, time works against
emergence: after a million generations, replicators rarely appear. In BFF, life becomes established more often in an aged soup
(entry 14). And Adami and LaBar (2017), in Avida, already proposed, without testing it, that activity before replicators changes
the composition and can make them more likely. The source-by-source comparison is in `docs/novetat-maduracio.md`.

*Corrected after the source review (16 November 2026).* A Fable 5.2 model checked the project's Internet sources against their text. The
general idea is not new in BFF either: Agüera y Arcas's book (2025, chapter 1) already describes phases of "pre-life", rising computation
before tapes replicate and, as imperfect replicators proliferate, a rising density of instructions per tape, without figures and without
saying which bytes; what may be new is the measurement. The version of Greenbaum and Pargellis that was read is the 2016 one, and they
attribute the late drop in emergence in Amoeba to the continued biasing of the instruction set (NOPs above 25%): the closest published
case of a soup state that lowers the chance of a replicator appearing, opposite in sign to entry 14 and untested.

<a id="entry-17"></a>
## Entry 17 · 12 November 2026 · Who copies itself: random replicators with partners that have no instructions (exploratory)

B1 v0.7, planned and reviewed before computing. The heritable replicators of entry 15 were retested in 100 conditions with partners
that have no instructions: if a program copies itself there, it does so alone. With the usual chemistry and half of the bytes being
instructions, half of them copy themselves in some condition and 18% in all; with aligned heads (H64), four in five; with the uniform
bytes of a fresh soup, none of the 37. Across programs with 0 to 64 instructions, the number of replicators rises steadily with the
share of instructions, but no heritable program with fewer than 9 instructions copies itself: the test's random partner does it. With
10% instructions, only 3% of what the test finds copies itself; with 50%, 52%. In the 22 pilot soups (11.3% instructions), partners
made from the soup's own byte histogram give 6.25 times more heritable programs than uniform partners, but the self-copiers are the
same (10 and 13 in 2.2·10⁷): the effect belongs to the partner. Composition matters for real self-copiers (none in 10⁷ with uniform
bytes, about 6 in 10⁷ with an aged soup's composition, 8 in 10⁵ with half instructions): Adami and LaBar's "biased typewriter", in BFF,
which Knierim et al. (2026) had already seen with their detector.
The effect of not being able to write to one's own half (S1) comes from both heads (2.36 and 1.48 times, 3.95 together). The census
counts of the soup before life (entry 16) must be redone with inert partners.

*Clarified after audit 31 (13 November 2026).* Both auditors redid the four analyses byte for byte. In the autonomy table, a condition
counts if the program is *heritable* with inert partners (it copies itself and the copy copies itself too), not merely if it copies
itself; in entry 18, "copies itself" means something else (one copy to the partner). "None below 9 instructions" holds for the sample
(9 is an upper bound of the minimum), and failing with inert partners means needing the partner, its code or its bytes; it does not
prove that the partner's code made the copy. The 6.25 of the pilot soups is a paired comparison on synthetic programs, not the effect
of the neighbours in an evolving soup.

<a id="entry-18"></a>
## Entry 18 · 12 November 2026 · The soup before life, part two: who writes the bytes, and who really copies itself (exploratory)

Two steps with the snapshots of already decided series, each with a note written before computing. First, an interpreter that reports
every write (checked against the simulator's) ran 10⁵ real neighbour pairs once in each of 483 soups. None of the note's four criteria
fails: in the aged soup, 85% of new `<` come from copying (in a fresh soup, mostly from `+` and `-`); pairs whose first program starts
with `<` make 55% of them, about 7 times their 7.5% share (a baseline computed after seeing the output, and said so), so the first-byte
rule has a strong effect; one round of interactions crowds instructions into fewer programs; and the aged soup makes ten times fewer
16-byte copies than its own bytes shuffled, in all 150 worlds. Second, every cell that the scan of each of the 450 series soups found
replicating was retested in 100 conditions with partners that have no instructions. Almost all were the work of the test's partner
(99.7% in aged soups), but the order holds in all 150 worlds: 0.07 cells per soup copy themselves in an aged soup, 5.9 in a fresh one and
111 in the same aged bytes shuffled. The arrangement of the aged soup undoes what its composition would do. At the start, no soup has
ready-made heritable replicators (0, 0 and 0.07 per soup, as entry 17's curve predicts for the shuffled soup). Whether maturation acts
on appearance or on taking root, we do not know yet: a count at one moment is not a rate.

*Corrected after audit 31 (13 November 2026).* Both auditors redid the figures, and each found on their own that the reading went beyond
the data. Step 2b only retested the scan's positives, and the scan misses real replicators: in 2 of 16 aged soups, auditor 1 found a
fragile cell heritable with inert partners that the scan had not seen, and 11 shuffled soups have one among the positives (two in all 100
conditions). So the counts are lower bounds of the scan's positives, heritable cells cannot be compared between soups, and "no soup has
ready-made replicators" and "the life that later becomes established was not there" do not hold. The order of the three soups holds, but
not the factors: the scan misses proportionally more in the aged soup. "Copies itself" here means one copy to the partner, not entry 17's
heritable self-copier; the comparable B1 figure is 5 of 1,025 scan heritables (0.033 per shuffled soup, against about 0.06 from B1). Failing
with inert partners means needing the partner, not that the partner's code made the copy. The "16-byte copies" counted windows the partner
already carried: in world 1034 at epoch 5,500, 312 of 313, so the jump is not the outbreak copying; counting only new ones, the aged soup
makes about 140 times fewer than its shuffled bytes, not ten. Only 0.04% of the aged soup's copies are in runs of 8 or more: single
writes, not Amoeba-like propagators. And a shuffled soup is enriched about 6 times too, so the first-byte rule is a rule of BFF; what is
specific to the aged soup is that more of its programs start with `<`.

<a id="entry-19"></a>
## Entry 19 · 13 November 2026 · The soup before life, part three: how long new replicators live (exploratory)

Every cell of 33 snapshots of world 1034 (131,072 each), in three stretches of its life (epochs 100 to 1,100, 5,000 to 6,000 and 8,000
to 9,000), was tested in 10 conditions with partners that have no instructions, and the cells that copy themselves were retested in 100.
Outside the outbreak we already knew, no heritable replicator appears: no cell of the young soup copies itself, and in the old soup four
loose cells do, none of them heritable, and none reaches the next snapshot. The outbreak lived 300 to 500 epochs (snapshots 5,200 to
5,400; 50 to 76 cells, all copying in all 100 conditions) and died out without becoming established. The cells carrying 16-byte pieces of
it were about ten times as many, and there were still 749 at epoch 5,500, when none copied any more. The census scan saw the whole outbreak
(182 of 182 copying cells, 169 of 169 heritable), but outside it only 1 of 4 copying cells, and 81% of its 977 positives do not copy with
inert partners. By the rule of the note written before computing, the heritable appearances in this world are, in practice, the
outbreaks (one in 16,000 epochs), so whether the pilot may plant a replicator to measure taking root goes back to the project owner. A
periodic census with inert partners (a sample of 2,048 cells every 100 epochs) would have caught this outbreak about 9 times in 10; cells
that copy without being heritable do not reach the next snapshot, and counting them needs a log of the copies. One observation that was
not in the note: a fresh soup at epoch 0 has at least 5.9 cells per soup that copy with inert partners (step 2b), and world 1034 has none
from epoch 100 to 1,100. One world and one outbreak: exploratory.

*Corrected after the source review (16 November 2026).* Knierim et al. (2026) already report that their detector lets them see
replicators that appear and die out before taking over the soup. And the 2024 paper already measures taking root by seeding: one
replicator, extracted from one of their runs and cleaned, seeded in 1,000 fresh soups, leads to a transition in 22% of them within 128
epochs. No one has made the same measurement in soups of different ages.

<a id="entry-20"></a>
## Entry 20 · 21 November 2026 · The soup before life, part four: the aged soup does not help planted replicators take root (exploratory)

Maturation makes life become established more often (entry 14), but we did not know whether more replicators appear or more of them
take root. The pilot measured both separately in 60 new worlds (7001 to 7076, aged to epoch 8,000 with no establishment and no heritable
cell in the scan), with three soups from each: the aged one (`continue`), its shuffled histogram (`shuffle-all`) and a fresh one (`reinit`). In part A,
under the only written exception to the rule of planting nothing (T-64), replicators born in the project's worlds were planted in the same
cells of the three soups, 3,060 branches, and each lineage was followed for up to 1,500 epochs; in part B, nothing was planted, and a census
with inert partners counted the heritable families that appear. A feasibility test on 6 worlds (16 November) came first: two genotypes
(G2, G3) take root almost always, two (G1, G4) almost never, and G1 took root only in the fresh soup. In the pilot, the share of plantings
that take root is lower in the aged soup, not higher: 0.35 times the fresh soup [0.28, 0.43] (Mantel-Haenszel over G1, G1 in a 3 × 3
square and G4), and 0.58 [0.48, 0.69] in the shuffled one; the second measure and the three sensitivities agree. G1 loses a lot (0.24 and
0.15); for G4 it is inconclusive (1.11 [0.82, 1.52]); shams never take root, there are no collisions, and the first-byte rule has no large effect.
Yet in part B life becomes established in 15 worlds of 60 in the aged and shuffled soups and 7 in the fresh one, the direction of the
series, and the inert census sees 0.24, 0.16 and 0.05 new heritable families per 1,000 world-epochs before establishment (5.0 [1.8, 16.1]
and 3.3 [1.3, 9.6] times the fresh soup); the census never saw a planted lineage that stayed under 10 cells, and saw almost all of those that passed 100. By the reading rule fixed before
computing, the taking-root ratios are below 1 and precise enough: taking root of these variants goes against the effect, which would have
to come from appearance (a formal reading, conditional on natural appearances taking root like these genotypes); the detected-appearance ratio is inconclusive (too wide). The consistency check fails: of the families the
census sees, 0.17, 0.26 and 0.36 of the natural ones take root within 1,250 epochs, against 0.80, 0.75 and 0.96 of the planted lineages,
also at equal size in the aged and shuffled soups; most natural families there are competitors (another family becomes established). So
part A speaks only about these genotypes. Open questions: why planted replicators die out so fast in the aged soup (median of all
extinctions, 50 epochs), and what the competitor families are. Exploratory: no general causal claim before a confirmation in new worlds.

*Corrected after audit 37 (21 November 2026).* Both auditors accepted the results as exploratory: the records are complete, the analysis
re-runs byte for byte, and part A and the part-B families were recomputed without the team's code. The corrections are to the text. The
detected-family rate does not measure appearance (AUD-204): in the aged soup, 79% of the detected families are within 1,250 epochs before an
establishment, and many are pieces of the family that becomes established, sharing 9 to 15 bytes with its dominant family but no full
16-byte window; with 8-byte windows the ratio drops from 5.0 to 2.3, the same as the establishment ratio. The consistency check fails, but
it does not show that planted replicators do not represent natural ones: the gap also depends on the family definition and on G2 and G3,
which always take root (AUD-205). G4 is inconclusive, not unchanged (AUD-206). The title now says "planted replicators" (AUD-207). Natural
taking root is also observed, in part B, with incomplete detection, and "no family comes from the starting cells" is a window rule, not a
genealogy. With the pilot alone, 15 against 7 establishments is not significant (Fisher p = 0.10). *Corrected after audit 39:* two phrases of
this summary said more than the Catalan entry, about the scan (which misses some heritable cells, AUD-189) and about the census threshold
(AUD-212).

<a id="entry-21"></a>
## Entry 21 · 22 November 2026 · The soup before life, part five: natural families, followed like the planted replicators (exploratory)

In entry 20, the natural families counted by the inert census could not separate appearance from taking root: at the census snapshot they
break into pieces (AUD-204). Following the exploration-lane note agreed by both auditors and the team in audit 37, the 52 part-B branches
where the inert census sees some heritable cell (21 aged, 19 shuffled, 12 fresh) were run again with the pilot's simulator, nothing planted,
saving a capture every 50 epochs; all 52 reproduce the pilot records line by line. Natural lineages were followed with the same lineage
module as the planted ones: a new lineage starts when the census sees a heritable cell that carries no window of any lineage already
followed, and lineages that share a cell are joined. With the rules fixed in the note before computing: (1) the tracking joins 29% of the
pilot's robust families in the aged soup (30 of 103), between the two thresholds, so it neither confirms nor contradicts AUD-204, and the
ratio of all lineage appearances stays where it was (5.03 [1.84, 15.51]); the dominant group of each establishment still gathers several
lineages. (2) Appearances that do not become established (not in the dominant group when the branch stops): 33, 14 and 8; the aged soup has 4.41
times the fresh-soup rate [1.44, 15.49] (shuffled, 1.89 [0.79, 5.71]), but the excess depends on those that may be pieces of the
establishing lineage (below). A count added after seeing the output: of the 33, 15 are in branches that never become established and 18 in branches that do, almost
all just before the establishment, which may be pieces of the establishing lineage; 25 of the 33 were still alive, small, when the branch
stopped. (3) Consistency counted by lineage: natural 0.64, 0.71 and 0.50 (6 of 12) against 0.63, 0.62 and 0.94 for the planted informative
genotypes (G1, G1 × 9 and G4 together), in the aged, shuffled and fresh soups; it meets the note's operational criterion in the aged and
shuffled soups and not in the fresh one, which is the reference, so the plan's reading still cannot be made (counted by group, below). (4) In a
single encounter with the 24 neighbours of the planted cell, G1 is left no longer heritable 38% of the time in the aged soup and 39% in the
fresh one (0.97 [0.96, 0.99]); but the test mixed the two orders of the pair and did not measure neighbour damage (below). The first
analysis run had an error (all planted lineages entered the consistency check, also those the census never detects); it is kept as it came
out, and the corrected one gives the pilot's planted values. Exploratory: it does not say where maturation acts.

*Corrected after audit 38 (22 November 2026).* Both auditors accepted the computation and the analysis as exploratory: the records are
complete and equal to the pilot's (auditor 1 re-ran four branches), the analysis re-runs, and the first analysis error is well declared and
correctly fixed. The corrections are to the reading. The consistency result is the note's operational criterion, counted by lineage, not a
test of equivalence: Fisher's test treats lineages as independent although they cluster by world (one aged-soup establishment contributes 16
lineages that take root), and counting each group of joined lineages once, the criterion fails in the aged soup (0.33 against 0.63); it holds
in the shuffled soup both ways and fails in the fresh soup both ways (AUD-209, AU2-188). The excess of appearances that do not become
established depends on those that may be pieces of the establishing lineage: without those within 1,250 epochs before an establishment the
ratio is 4.55 [0.89, 23.22], and with only branches that never become established, 5.35 [0.77, 25.04] (auditor 1, post hoc); "not
established" means "not in the dominant group when the branch stops" (AUD-208, AU2-190). The neighbour test mixed the two orders of the
pair: "copies" is exactly the order, and "damaged" is G1 damaging itself when it runs second, also with inert partners (AUD-210, AU2-189).
Split by order, it gives a lead: when G1 runs first, its copy is not heritable 12.9% of the time in the aged soup and 0.6% in the fresh one,
because the copy keeps the partner's first byte and 11.3% of aged-soup cells start with `]`; G4 is not affected. It is post hoc, from a single
encounter, and does not explain everything (no association within the aged soup, and the shuffled soup also loses without it).
*Corrected again after audit 39 (24 November 2026):* three phrases of the paragraph above still gave the reading from before audit 38, and
the planted values were labelled with the genotypes instead of the soups (AUD-212).

<a id="entry-22"></a>
## Entry 22 · 22 November 2026 · The soup before life, part six: how the planted replicators die out in the aged soup (exploratory)

The planted replicators take root less in the aged soup than in the fresh one (entry 20). From the pilot's records and starting
snapshots, with no planting and no simulation, we looked at how they die out. This is the step both auditors and the team agreed on at
audit 38, through the exploration lane, with the note written before computing (`fase2/resultats/arrelament/extincions/README.md`, the first
note written in English). Most one-cell plantings lose their heritable cells at the first step in every soup (G1: 206, 197 and 193 of 240
with F = 0 at epoch 8,050; most of them still have cells that carry the lineage's windows, but none is heritable). Of the G1 lineages still
heritable at the first step, by epoch 9,500, in the aged soup 25 of 34 died out (21 of them by 8,250), 6 stopped after an establishment that the
planted lineage dominated, and 3 were still followed; in the fresh soup, 16 of 47 died out (all by 8,250), 17 stopped after an
establishment they dominated and 14 were still followed. By the pilot's criterion of taking root (the one of entry 20), 7 G1 plantings of
240 take root in the aged soup and 29 in the fresh one, all of them among those heritable at the first step. For G1 in a 3 × 3 square, 123
of 157 died out in the aged soup (86 by 8,250), against 27 of 189 in the fresh one (24 take root against 156); for G4, 7 of 58 against 6 of
52 died out, and the rest stopped after an establishment they dominated: no conclusive aged-against-fresh difference. These are counts of
outcomes, not survival probabilities: a branch stops 500 epochs after an establishment, and is not observed afterwards. Counted in deaths,
G1's excess in the aged soup is 13 at the first step and 9 afterwards, mostly within 200 epochs; G1 × 9 fades more gradually. The members of
the planted lineages in the first five steps are heritable less often in the aged soup (G1: 9.8% against 15.3%, 0.64 [0.47, 0.88]; G1 × 9,
0.57 [0.51, 0.63]; G4, 1.02 [0.92, 1.15]), mostly because fewer of them copy at all. That measure also counts the steps of lineages already
dying out; counting only the steps where the lineage is heritable, G1 gives 0.81 [0.68, 0.97] (post hoc, audit 39). By the rule fixed in
the note, the lineage records agree with auditor 1's first-byte lead (G1's copy keeps the partner's first byte, and a copy that starts with
`]` or 0 is not heritable; 11.3% of aged-soup cells start with `]`), but the records have no member's first byte and no order of the
encounters. In the shuffled soup G4 also loses (0.84 [0.76, 0.92]), with hardly any cell starting with `]`: something else is at work there.
Between worlds, the share of aged-soup cells starting with `]` or 0 only ranges from 13.3% to 14.3%; G1's taking root correlates with it at
−0.28 [−0.50, −0.03] (G4, −0.05), which meets the fixed rule but is one of four correlations (with Holm's correction, p = 0.13; auditor 1),
over a spread of one percentage point, and G1's heritable share does not show it. Within the aged soup, the 26 G1 seeds with no neighbour
starting with `]` or 0 did worse, not better; auditor 1 found them in unusual places, where G4 and G1 × 9 also take root less, and auditor 2 reads them
as evidence against the simple local version of the lead; both agree that they do not corroborate it. So the lead
fits at the level of the soup and not at the level of the neighbourhood: a lead, not a mechanism shown. Showing it would need an intervention
on the aged soup's first bytes, against a placebo (the pilot's `byte0` arms removed `<`, not `]`), and planting again needs a new decision of
the owner and the agreement of the three. Counting natural families by group, the consistency criterion is met only in the shuffled soup;
without the probable fragments (10 bytes or more shared with the branch's dominant group), the aged/fresh ratio of failed appearances is
4.28 [1.24, 15.61], while auditor 1's time-based rule gave 4.55 [0.89, 23.22]: depending on the rule, the excess still cannot be separated
from fragmentation. The lineage is of windows, not of descent (AU2-156). Exploratory: it does not say where maturation acts (AUD-184 =
AU2-151).

*Corrected after audit 39 (24 November 2026).* The first version said that 9 of 34 G1 lineages were "alive at 9,500" in the aged soup and
31 of 47 in the fresh one (and 51 of 58 and 46 of 52 for G4): those counts included the branches that had stopped at an establishment and
were not observed afterwards, most of them successes (AU2-192). It also said that G1's lineages "fade over the first thousand epochs", which
holds for G1 × 9 but not for G1 (AUD-214), and it left out the reservations on fragmentation and on the records (AUD-212). The heritable
share of 0.64 also counts lineages already dying out (AUD-213). The first analysis output stays as it came out, next to the corrected one,
and the data check now refuses impossible values (AU2-193).

*Corrected after audit 40 (24 November 2026).* The corrected version said that 6 of 34 G1 lineages "took root and established the world" in
the aged soup and 17 of 47 in the fresh one: those counted the branches stopped after an establishment that the planted lineage dominated,
not the pilot's taking root, which also counts lineages still followed (7 and 29; AUD-215), and it gave only auditor 1's reading of the 26
neighbourhoods. The data check now also refuses two seeds of
the same cell with other counts, a scan header without its commit, and impossible lineage lines (AU2-196, AU2-197, AUD-216). The outputs do
not change.

<a id="entry-23"></a>
## Entry 23 · 24 November 2026 · The soup before life, part seven: a test tube that does not work (exploratory)

The aged soup has more natural establishments, fewer cells that copy on their own, and planted replicators take root less in it. The
hypothesis: the replicators born there fit it, and the planted genotypes are strangers. To test it without planting anything, we put the
natural founders of the pilot's 37 part-B establishments and the four planted genotypes in a "test tube": the census's replication test,
with partners drawn from the pilot's starting soups (and from the aged soup with its `]` and 0 first bytes replaced, against a placebo),
823,440 tests, with the note written before computing (`fase2/resultats/arrelament/proveta/README.md`). Before reading anything else, the
test tube had to order the planted genotypes as the pilot did. It does not: it saturates. G1 is heritable in 97.6% of the conditions with the
aged soups and 100% with the fresh ones, G4 in 100% with all of them, G2 and G3 in 93% to 98%, while their rooting shares in the pilot go
from 3% to 98% (Spearman −0.65). The census's test says whether a program can replicate, trying each role several times, not how often it
does. By the rule fixed before computing, the other numbers are reported with no reading, and the hypothesis stays untested by this
instrument: neither for nor against. Testing it again would need a measure of how often a program copies per encounter, calibrated against
the pilot first, in another note. One result was seen before the full run (the first line of the short test), and nothing was changed after
it. Exploratory.

<a id="entry-24"></a>
## Entry 24 · 24 November 2026 · The soup before life, part eight: two tests without planting anything (exploratory)

At audit 39 the two auditors proposed two ways to go on without planting again, and both notes were written before computing. **Auditor 1's
test** (`fase2/resultats/arrelament/vulnerables/README.md`): if the aged soup's `]` and 0 first bytes filtered the replicators, the natural
ones that become established there should be vulnerable to them less often. Each robust natural lineage's program met, once, 20 real partners
of its world's aged soup starting with `]`, 20 with 0 and 20 with another byte; "vulnerable" means it copies itself heritably into the others
and never into the `]` ones. The calibration passed (G1 vulnerable in all 60 worlds, G4 in none). The founder of the dominant group is
vulnerable in 5 of the 15 establishments of the aged soup, 5 of the 15 of the shuffled soup and 3 of the 7 of the fresh one (aged minus
shuffled, 0.00 [−0.38, 0.38]): **no filter is seen**, and the first-byte lead loses strength as an explanation of taking root in the aged
soup. More than half of the robust natural lineages are vulnerable, and they join the dominant group less often than the others in the aged
soup and also in the shuffled one, where almost no cell starts with `]` or 0. **Auditor 2's sensitivities**
(`fase2/resultats/arrelament/sensibilitats/README.md`): within each world, G1 does better, not worse, at the places with more neighbours
starting with `]` or 0, and G4, planted at the same cells, about the same; their ratio, 1.59 [0.97, 2.90], cannot say by the note's rule but
leaves no room for the lead's direction. For the failed appearances, three kinds of candidate link to the establishing lineage (time,
sequence with a threshold of 8 bytes fixed by a control, and place within 8 cells) agree: 15 of the 16 aged-soup appearances that the time
rule removes are also linked by sequence or place. By the note's rule the time rule's reading is the more defensible, and with it the excess
of failed appearances in the aged soup cannot be separated from fragmentation (4.55 [0.91, 23.09]; counting candidate families, 2.35 [0.72,
10.06]). Place on its own is weak evidence: a random cell would be as close one time in six. One check was added after reading the output
(G1's 4.4% at the 26 places without such neighbours is a single seed). Exploratory: few establishments, a single encounter, and a candidate
link is not descent. Where maturation acts is still not known.
