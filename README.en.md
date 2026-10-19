# claude-origins

**Digital abiogenesis:** a toy universe where we try to let life arise on its own, without anyone writing the
first organism.

*This is the English version of the [Catalan README](README.md), which is the main one. It is shorter, and
was last synchronised on 19 October 2026. The lab notebook and most of the documentation are in Catalan; the
[glossary](docs/glossari.md) gives the English term for each Catalan one.*

![Animation: a colony of replicators appears and grows in a 2D world](docs/imatges/colonia-animada.png)

*A world of 512 × 256 random programs, from epoch 1,500 to 2,900. The number in the corner is the epoch.
Around epoch 2,100, a patch of instruction-rich programs appears. At 2,200, the family tracker recognises
replicators there and colours them pink. Nobody wrote them. This is the world of seed 1006 from the law-2
series. It was chosen because the colony is easy to see, so it is an example, not a sample
([where the images come from](docs/imatges/README.md)).*

**What "life" means here.** It is an operational criterion, not a claim about biological life.
- **A heritable replicator** is a program that copies itself into a partner, and whose copy copies itself in
  turn.
- **Life is established** when at least 1% of a sample of 2,048 cells are heritable replicators, in two
  consecutive censuses taken 250 epochs apart.

## What it is

Tierra (1991) and Avida (1994) studied digital evolution, but they started from a hand-written organism.
- **An old idea:** that life can arise spontaneously in a "chemistry" of programs, as in Coreworld, AlChemy
  and Amoeba.
- **Our starting point:** in 2024, *Computational Life* (Agüera y Arcas et al.) showed it in a soup of very
  simple programs written in the BFF language. Self-replicators took over in about 40% of the soups within
  16,000 epochs.

This project starts there, and asks what is still open ([state of the art](docs/estat-questio.md), in Catalan):
1. **Which properties** of the chemistry and of the environment life needs to appear.
2. **What makes it become established and last.**
3. **Whether sustained Darwinian evolution follows.**
4. **Whether the results are general,** or specific to this language.

The main rule: **we design the laws, never the organisms.**
- **What is not there:** seeded replicators, rewards for copying, or any instruction that copies a whole
  program at once.
- **Where the organisms live:** in a closed universe. They are bytes run by our interpreter, with no access to
  the system, the network or files.

## What we have found

**The soup comes alive.**
- **The setting:** soups of 131,072 random programs.
- **What happens:** in some soups, after hundreds or thousands of epochs, a program appears that copies
  itself into others and takes over. This reproduces the 2024 result.
- **What we followed:**
  - **The first replicators poison themselves.** Each copy leaves zeros behind, and zeros stop copying. The
    2024 paper already describes this "zero-poisoning" and the successor that follows (its figure 2); we
    found it in our soups and measured it. This explanation fits all the data, but no intervention experiment
    has proven it.
  - **A resistant successor.** In one soup, a successor replicator turns the zeros into 255 and keeps copying
    in 83–96% of attempts.
  - **Palindromes.** The first three replicators we found are palindromes that copy themselves backwards,
    with the same copy loop. This suggests convergent evolution, but it is a hypothesis.

**In a world with space** (each program interacts only with its neighbours):
- **Quiet worlds:** the replicator family occupies a single area.
- **Worlds with a weak current** (1% of cells moved each epoch): it spreads out.

See the sample of eight worlds chosen at random in the [Catalan README](README.md#en-un-món-amb-espai).

**The first preregistered series: inconclusive.** We tested whether a weak current makes life become
established more often, with a protocol written and tagged before starting.
- **The series:** 160 worlds.
- **The result:** life became established in 30% of quiet worlds (24/80) and in 42.5% of worlds with a
  current (34/80).
- **The test:** log-rank Z = −1.83, p = 0.067. The preregistered bound was |Z| > 2.004, so it was not
  reached.
- **The difference at epoch 16,000:** +12.5 points, with a 95% CI from −2.3 to +27.3.
- **What it means:** the series cannot show that the current has an effect, nor rule it out.

<picture>
  <source media="(prefers-color-scheme: dark)" srcset="docs/imatges/llei2-km-fosc.svg">
  <img alt="Share of worlds where life has become established, epoch by epoch, quiet vs. current" src="docs/imatges/llei2-km.svg">
</picture>

**What we study now:**
- **How long established life lasts.**
  - **The exploration** (notebook entry 9) suggests it lasts: in 2,000 epochs almost none dies, with or
    without a current.
  - **A preregistered series** will measure its lifespan over a longer horizon
    ([draft protocol](docs/protocol-b2.md), in Catalan).
- **World size.**
- **Chemistry ablations.**
- **A changing weather,** with a current that alternates calm and storm.

## How we work

- **Preregistration.** Confirmatory series have a protocol written before starting
  ([law-2 protocol](docs/protocol-estadistic.md), in Catalan). The deciding program only decides from a copy
  identical to the git tag of the preregistration.
- **Two auditors, both AI.**
  - **What they do:** at each iteration, two models review the code, the methods and the results, in
    separate sessions.
  - **Who they are:** one is another instance of Claude, the same model that develops the project; the other
    is a different model.
  - **How it is sealed:** each seals its report before reading the other's.
  - **What we check:** we verify every finding with data. The [audit index](docs/auditories.md), in
    Catalan, lists every finding and how it was resolved.

  **This is not human peer review.**
- **Mistakes are corrected without deleting.** The notebook keeps what we said, and adds a dated correction.
- **Each world's history is exactly reproducible.** With the same commit, seed and parameters, the browser
  and Node produce the same history. Only the higher-order entropy differs slightly between Node versions,
  because of zlib. See [how to reproduce the results](docs/reproduir.md), in Catalan, with commands.
- **Who works on it.** Claude (Anthropic) develops it, with a human project owner who sets the direction and
  reviews every change to the simulator before accepting it.

## Status and limits

- **A personal project in progress,** started on 14 October 2026. The results are preliminary, and have not
  been published or reviewed by human experts.
- **The law-2 preregistration** is the git tag `preregistre-llei2`.
  - **What can be checked:** the commit and the file fingerprints.
  - **What cannot:** the date, because git does not certify it and the repository was private.
- **How to cite it:** [`CITATION.cff`](CITATION.cff). **How to take part:** [`CONTRIBUTING.md`](CONTRIBUTING.md).

## How to run it

You need Node.js, and nothing else. For a new setup, use a maintained version (Node 22 or 24): the tests pass
there. Versions 16 and 20 are those of the historical records, and are only needed to reproduce them byte for
byte.

```bash
node server.mjs
```

Open <http://localhost:8420> to see the soup, the 2D world (with zoom from territories down to code) and the
notebook. It needs module workers and `CompressionStream` with `deflate-raw`. Chromium-based browsers (Chrome,
Edge) are the ones reproducibility was checked with.

A quick run without graphics, of about 10–15 seconds:

```bash
node sim.mjs --world 64x64 --seed 1 --epochs 300 --census 100
```

**A world the size of the series,** up to epoch 16,000, takes about an hour (median), and up to a bit over
three hours. `node sim.mjs --help` lists every option, and `npm test` runs the tests.

## Licence and credits

- **Code:** Apache 2.0 ([`LICENSE`](LICENSE)).
- **Notebook and documentation:** CC BY 4.0 ([`LICENSE-docs.md`](LICENSE-docs.md)).
- **Experimental data:** CC BY 4.0 ([`LICENSE-data.md`](LICENSE-data.md)).
- **Credits** ([`NOTICE`](NOTICE)).
  - The simulator is an independent JavaScript reimplementation of the BFF language of *Computational Life*
    (Agüera y Arcas et al., 2024, arXiv:2406.19108), checked against cubff, its reference implementation
    (Google LLC, Apache 2.0).
  - The test bench includes a reference function adapted from cubff's `bff.inc.h`, with attribution in
    `NOTICE`.
  - The project builds on that work. It does not claim as original that replicators arise on their own in a
    BFF soup.
