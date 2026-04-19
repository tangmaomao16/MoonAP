# MoonAP Large-File Runtime

MoonAP treats large files as browser-local data. The LLM should not read GB-scale FastQ files, and it should not emit large synthetic datasets token by token.

## FastQ Analyzer MVP

The current browser MVP can analyze a selected FastQ file with 4 MB chunks:

1. Select a `.fastq` or `.fq` file with the `+` button.
2. Click `FastQ Base Counter`, or send the default FastQ chat request.
3. MoonAP reads the file through the browser File API.
4. MoonAP counts `N` bases in sequence lines only.
5. The Details panel shows progress and final stats.

The file contents are not uploaded to the MoonAP server. The UI reports:

```text
uploaded_bytes: 0
llm_receives_file_contents: false
```

## FastQ Generator MVP

The current browser MVP can also generate a deterministic sample FastQ file. Click `FastQ Generator` to download `moonap-demo.fastq`.

Default recipe:

```text
read_count = 10000
read_length = 150
n_rate ~= 0.01
random_seed = 42
```

This demonstrates the MoonAP principle:

```text
LLM outputs the compact recipe. MoonAP writes the bytes locally.
```

## Competition Demo Script

1. Open MoonAP.
2. Click `FastQ Generator` and download the demo file.
3. Attach the downloaded file with `+`.
4. Click `FastQ Base Counter`.
5. Show that the result includes processed bytes, read count, total bases, `N` count, elapsed time, `uploaded_bytes = 0`, and `llm_receives_file_contents = false`.

## Planned Wasm Kernel Protocol

The current chunk loop is implemented as browser host logic called by the MoonBit JS frontend. The intended production kernel protocol is:

```text
init(params_json)
ingest_chunk(bytes, offset, is_final)
finalize()
result_json()
```

The FastQ parser state should remain small:

```text
partial_line
line_index_mod_4
read_count
sequence_lines
total_bases
target_base_count
```

This keeps memory usage near:

```text
chunk_size + parser_state
```

not:

```text
whole_file_size
```
