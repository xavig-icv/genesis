# How to reproduce the results

*The Catalan original, with the same recipes: [`reproduir.md`](reproduir.md). The checks below were made on the dates
given, in Catalan; this translation is from 22 November 2026.*

Recipes to redo the project's results from outside. They take from seconds to hours. All commands run from the root of
the repository, and can be copied as they are into a `bash` console (on Windows, Git Bash).

## What you need

- **Node.js:** for new use, a maintained version (22 or 24). The historical records were made with Node 16 (the PC)
  and Node 20 (the VM). With any version, the world's history is the same. The higher-order entropy (HOE) differs in the
  third decimal place, because it depends on the zlib version that ships with Node (AUD-55).
- **The systems tested:**
  - Windows 10 with Git Bash;
  - Debian 13;
  - Ubuntu, in GitHub's continuous integration, with Node 16, 20, 22 and 24.

  It has not been tested on macOS.
- **The browser,** for the interface: Chrome, Edge or another Chromium-based browser.

**How long each thing takes**, measured in the records:

| What | Time |
|---|---|
| The quick test (§1) | 10 to 15 seconds |
| `npm test` | a few minutes |
| The law-2 decision (§3) | seconds |
| The B2, zeros and maturation decisions (§6) | 2 to 25 seconds each |
| A phase-1 soup (§2) | a few minutes up to the transition (epoch 200); 15 to 35 minutes up to epoch 750, depending on the machine's load |
| A world of the law-2 series, up to 16,000 epochs or up to 1,000 epochs after establishment | 6 minutes to 3.3 hours, with a median of one hour |
| The whole law-2 series (160 worlds) | about 170 hours of computation: more than a day with six processes at once |

## 1. The quick test

```bash
node sim.mjs --world 64x64 --seed 1 --epochs 300 --census 100
npm test
```

The tests include the determinism fingerprints (`test/determinisme.mjs`): if they pass, the simulator makes exactly the
same histories as when the experiments were run. Checked on 5 November 2026 with Node 16: the quick test, in 8 seconds,
and the 325 tests of `npm test` at the time, all fine.

## 2. The phase-1 soup (notebook entries 1 and 2)

Seed 1, with the v1 generator of the early experiments and 7 threads, as in the browser:

```bash
node sim.mjs --seed 1 --chunks 7 --rng v1 --epochs 750 --after 1000 --save fase1-llavor1 --save-every 250
```

- **The transition:** it comes at epoch 200.
- **Why `--after 1000`:** without it, the simulation stops 300 epochs after the transition.
- **The check:** the snapshots of epochs 250, 500 and 750 must have the SHA-256 of `docs/captures.sha256`
  (`fase1/resultats/llavor1-fils7-epoca*.bin`). Checked on 19 October and 5 November 2026 with Node 16: all three match.
  On 5 November it took 34 minutes, with another simulation running.

```bash
cd fase1-llavor1 && sha256sum llavor1-fils7-epoca250.bin llavor1-fils7-epoca500.bin llavor1-fils7-epoca750.bin; cd ..
grep llavor1-fils7 docs/captures.sha256
```

**In the browser interface,** the history depends on the number of threads and on the generator. To see the one of
entry 1, choose the v1 generator, 7 threads and seed 1 (AUD-80).

## 3. The law-2 decision (entry 8)

**From `main`, the program refuses to decide,** and that is correct: the confirmatory decision is only taken from a
copy identical to the commit of the preregistration tag (`docs/protocol-estadistic.md`). It is done like this:

```bash
git worktree add --detach ../preregistre preregistre-llei2
cd ../preregistre
node fase2/estadistica.mjs --etapa 2 ../genesis/fase2/resultats/serie-llei2/A ../genesis/fase2/resultats/serie-llei2/B > /tmp/etapa2.txt
diff /tmp/etapa2.txt ../genesis/fase2/resultats/serie-llei2/etapa2-sortida.txt && echo identical
cd ../genesis && git worktree remove ../preregistre
```

- **The path:** `../genesis` is the repository folder, as in a clone from GitHub. If yours has another name, change it.
- **The output** must be identical to the saved one.
- **A possible exception:** the HOE sensitivity line may change if your Node version ships another zlib. The decision
  does not depend on it.
- **Checked on 19 October and 5 November 2026** with Node 16: the output is identical byte for byte. Both auditors redid
  it in audit 9.
- **Who decides:** the decision is taken by the tag's program (`8cd4449`), not by the one in `main` (AUD-87).
  - **The newer preregistration checks** (PR #6) protect future series.
  - **The law-2 series** was protected by the manual checks in the launch record.

**Without `--etapa`**, from `main`, `node fase2/estadistica.mjs folder-A folder-B` gives the descriptive report.

## 4. A world of the law-2 series

Each JSONL of the series starts with the exact command that made it. For example:

```bash
head -1 fase2/resultats/serie-llei2/A/1006.jsonl
```

**To repeat it:**
- **The paths:** change those of `--json` and `--save` to a folder of yours.
- **The check:** compare the censuses of the two JSONL files (the `"type":"census"` lines). They must be identical.
- **The code:** use the commit given by the record (`codi=8cd4449`, in the JSONL's start line), with `git worktree add`,
  as in §3 (AU2-63).
  - **Later commits** have kept the histories of the regression cases (`test/determinisme.mjs`), and in audit 9 two
    seeds of the series redone with the code of `f821f4d` gave the same history.
  - **But the guarantee is the record's commit,** not a later one.
- **Checked on 5 November 2026:** world 1006 of group A, redone with the record's code (`8cd4449`) and Node 16, without
  `--save`. The 13 censuses are identical byte for byte to those of the record, which was made with Node 20, and the
  final fingerprint (`7f8d1963`) and the epoch of establishment (2,250) also match. It took 17.5 minutes.

## 5. The images

`docs/imatges/README.md` has the command for each image and the snapshot it uses.
- **The law-2 curve:** it only needs the JSONL files, which are in git, and takes seconds.
- **The others:** they need snapshots. The series only saves those of the three censuses before establishment, and they
  are regenerated with the JSONL's command (§4). The animation and the zoom need a new run, and
  `docs/imatges/README.md` gives the command.
- **Checked on 5 November 2026** with Node 16: the two law-2 curves come out identical, byte for byte.

## 6. The B2, zeros and maturation decisions (entries 10, 13 and 14)

As for law 2 (§3): each decision is taken from a copy of the commit of its tag, and the program refuses to decide from
`main`. The series' records are in `main`, not in the tag, which was made before launching them: they are copied into
the series folder of the copy. From the root of the repository:

```bash
# B2, established life (entry 10)
git worktree add --detach ../decisio preregistre-b2
mkdir -p ../decisio/fase2/resultats/b2/confirmacio
cp fase2/resultats/b2/confirmacio/*.jsonl ../decisio/fase2/resultats/b2/confirmacio/
(cd ../decisio && node fase2/b2-confirmacio.mjs --decideix fase2/resultats/b2/confirmacio) > /tmp/b2.txt
diff /tmp/b2.txt fase2/resultats/b2/confirmacio/decisio-sortida.txt && echo identical
git worktree remove --force ../decisio
```

```bash
# the zeros (entry 13)
git worktree add --detach ../decisio preregistre-zeros
mkdir -p ../decisio/fase2/resultats/zeros/serie/branques
cp fase2/resultats/zeros/serie/branques/*.jsonl ../decisio/fase2/resultats/zeros/serie/branques/
(cd ../decisio && node fase2/zeros-confirmacio.mjs --decideix fase2/resultats/zeros/serie/branques) > /tmp/zeros.txt
diff /tmp/zeros.txt fase2/resultats/zeros/serie/decisio-sortida.txt && echo identical
git worktree remove --force ../decisio
```

```bash
# the maturation (entry 14)
git worktree add --detach ../decisio preregistre-maduracio
mkdir -p ../decisio/fase2/resultats/maduracio/serie/branques
cp fase2/resultats/maduracio/serie/branques/*.jsonl ../decisio/fase2/resultats/maduracio/serie/branques/
(cd ../decisio && node fase2/maduracio-confirmacio.mjs --decideix fase2/resultats/maduracio/serie/branques) > /tmp/maduracio.txt
diff /tmp/maduracio.txt fase2/resultats/maduracio/serie/decisio-sortida.txt && echo identical
git worktree remove --force ../decisio
```

- **The output** must be identical to the saved one. `--force`, when removing the copy, because the copied records are
  left in it.
- **Checked on 5 November 2026** with Node 16: all three identical byte for byte (B2 in 2 seconds, the zeros in 6 and the
  maturation in 23). Both auditors also redid them, each in their own audit.
- **Why no snapshot is needed:** the decisions only read the records. The branches' snapshots are regenerated with the
  command in the start line of each record, as in §4.

## 7. B1, level 1 (entry 15)

The full records are not in git: two of them exceed 50 MB. The extract of the heritable replicators is, with the lines as
they are in the records, and the SHA-256 of its content (`fase2/resultats/b1/nivell1/README.md`):

```bash
node -e "const z=require('zlib'),c=require('crypto'),fs=require('fs');const b=z.gunzipSync(fs.readFileSync('fase2/resultats/b1/nivell1/hereditaris.jsonl.gz'));console.log(c.createHash('sha256').update(b).digest('hex'))"
```

It must give `6029d8783b13b1c8faa4077b0e28b2c569903e2420b8f660efa081092fb049a1`. The full records can be downloaded from
the repository's `b1-nivell1-registres-v1` release (<https://github.com/xavig-icv/genesis/releases/tag/b1-nivell1-registres-v1>,
105 MB), or redone with the commands of `fase2/resultats/b1/nivell1/llista.txt` (about 9 hours with 8 threads).
Decompressed, they must have the SHA-256 of `execucio-llista.txt`.

**The analysis, from a copy of the computation's commit** (`a677726`). The analysis compares the SHA-256 of the modules of
each record with those of its copy (AUD-139), and since version 0.5 of the B1 plan, `fase1/bff.js` and
`fase2/replication.js` have changed: there are two more chemistries and two new options of the test, off by default. From
`main`, then, it refuses, and that is correct, like the decisions from their tags (§3 and §6):

```bash
git worktree add --detach ../b1-nivell1 a677726
mkdir -p ../b1-nivell1/fase2/resultats/b1/nivell1/registres
# here, the 15 records of the release, decompressed: they must have the SHA-256 of execucio-llista.txt
(cd ../b1-nivell1 && node eines/densitat-analisi.mjs fase2/resultats/b1/nivell1/registres) > /tmp/analisi.txt
diff /tmp/analisi.txt fase2/resultats/b1/nivell1/analisi.txt && echo identical
git worktree remove --force ../b1-nivell1
```

**Checked on 5 November 2026** with Node 16, from the computation's copy: the output is identical to `analisi.txt`, byte
for byte. From the v0.5 branch, the analysis refuses, and only because of these two modules.

## The snapshots

- **Why they are not in git:** the `.bin` files are 8 MB each.
- **The registered ones:** there are 183, with their SHA-256, in `docs/captures.sha256`, and `docs/captures.md` says
  where each one comes from.
- **How they are made again:** with the same commit, the same seed and the same parameters.
- **How they are checked:** `sha256sum -c docs/captures.sha256`, from the root. On a system in another language, with
  `LC_ALL=C` in front, so that the output says `OK`.

## A difference from cubff

The project's mutation rate is 0.024% per byte and epoch, the one the paper gives, and cubff uses 1/4,096 (0.0244%). It
is the same in all of the project's series, but it must be kept in mind when comparing with the paper
(`eines/cubff/README.md`).

## The tools speak Catalan

The programs write their outputs in Catalan, as they did when the records were made, and the outputs are kept as they
came out. The [glossary](glossari.md) gives the English term for each Catalan one.
