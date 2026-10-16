// Oracle extern de l'intèrpret BFF (AU2-12 de l'auditoria externa 2): executa cintes amb el codi
// original de cubff (bff.inc.h, variant bff_noheads), sense cap modificació, per comparar-lo amb
// fase1/bff.js.
//
// Llegeix de l'entrada cintes de 128 bytes seguides i, per a cadascuna, escriu a la sortida la cinta
// final (128 bytes) i el nombre d'operacions que retorna cubff (uint32, little-endian).
//
// Compilació, dins d'un clon de cubff (vegeu eines/cubff/README.md):
//   g++ -std=c++17 -O2 -fopenmp -xc++ oracle.cc -o oracle
#include "bff.inc.h"

#include <cstdio>
#include <vector>

namespace {
const char *Bff::name() { return "oracle_bff_noheads"; }
}  // namespace

int main() {
  constexpr size_t kTape = 2 * kSingleTapeSize;
  uint8_t tape[kTape];
  while (fread(tape, 1, kTape, stdin) == kTape) {
    uint32_t ops = static_cast<uint32_t>(Bff::Evaluate(tape, 8 * 1024, false));
    fwrite(tape, 1, kTape, stdout);
    fwrite(&ops, sizeof(ops), 1, stdout);
  }
  return 0;
}
