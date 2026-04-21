# MoonAP v0.1 Paper Draft

This directory contains an English arXiv-style draft for MoonAP v0.1.

## Archived Version

The MoonAP v0.1 paper is archived on Zenodo:

- **DOI:** [10.5281/zenodo.19682015](https://doi.org/10.5281/zenodo.19682015)
- **Zenodo record:** [https://zenodo.org/records/19682015](https://zenodo.org/records/19682015)

## Files

- `moonap-v0.1.tex`: main LaTeX source.
- `references.bib`: BibTeX references.
- `figures/`: screenshots copied from the project `imgs/` directory.
- `moonap-v0.1.pdf`: compiled PDF draft when generated locally.

## Build

From this directory, run:

```cmd
pdflatex moonap-v0.1.tex
bibtex moonap-v0.1
pdflatex moonap-v0.1.tex
pdflatex moonap-v0.1.tex
```

If `latexmk` is available:

```cmd
latexmk -pdf moonap-v0.1.tex
```

## Screenshot Notes

The current draft uses the main MoonAP UI screenshot, the Local/Cloud SKILL Hub screenshot, and a FastQ report screenshot with summary metrics and base-composition results. Older cropped FastQ report screenshots are not referenced by the paper.
