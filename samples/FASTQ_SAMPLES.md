# FastQ Samples For MoonAP

These files are ready for local-first FastQ testing in MoonAP.

## Files

- [demo.fastq](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/samples/demo.fastq:1)
  Small original demo file already used by the project.
- [fastq-small.fastq](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/samples/fastq-small.fastq:1)
  Balanced tiny sample for smoke tests.
- [fastq-n-heavy.fastq](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/samples/fastq-n-heavy.fastq:1)
  High-`N` sample for checking N-ratio behavior.
- [fastq-gc-mixed.fastq](/C:/my_work/MoonBit_Competition/GitHub/MoonAP/samples/fastq-gc-mixed.fastq:1)
  GC-rich mixed sample for checking GC ratio and average read length.

## Suggested Manual Test Prompt

Use `FastQ Analyst` mode and try:

```text
Please analyze this FastQ file, count N bases, compute the ratio, and generate a MoonBit demo program.
```

## Expected Focus

- total read count
- total bases
- N ratio
- GC ratio
- average read length
- benchmark-ready chunk recommendation
- MoonBit artifact with a FastQ task kernel protocol
