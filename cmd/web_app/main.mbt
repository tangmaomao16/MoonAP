///|
#cfg(target="js")
extern "js" fn browser_append_message(role : String, text : String) -> Unit =
  #| (role, text) => {
  #|   const messages = document.querySelector("#messages");
  #|   const item = document.createElement("article");
  #|   item.className = `message ${role}`;
  #|   item.textContent = String(text);
  #|   messages?.append(item);
  #| }

///|
#cfg(target="js")
extern "js" fn browser_set_state(text : String) -> Unit =
  #| (text) => {
  #|   const state = document.querySelector("#state");
  #|   if (state) state.textContent = String(text);
  #| }

///|
#cfg(target="js")
extern "js" fn browser_append_runtime_log(
  kind : String,
  label : String,
  text : String,
) -> Unit =
  #| (kind, label, text) => {
  #|   const payload = JSON.stringify({
  #|     ts: new Date().toISOString(),
  #|     kind: String(kind || "event"),
  #|     label: String(label || ""),
  #|     text: String(text || "")
  #|   }) + "\n";
  #|   fetch("/api/logs/moonap-runtime.log", {
  #|     method: "POST",
  #|     headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|     body: payload,
  #|     keepalive: true
  #|   }).catch(() => {});
  #| }

///|
#cfg(target="js")
extern "js" fn browser_extract_moonbit_source(raw : String) -> String =
  #| (raw) => {
  #|   if (!globalThis.__moonapExtractMoonBitSource) {
  #|     globalThis.__moonapExtractMoonBitSource = (value) => {
  #|       const text = String(value || "").trim();
  #|       if (!text) return "";
  #|       const extract = (source, startMarker, endMarker) => {
  #|         const start = source.indexOf(startMarker);
  #|         if (start < 0) return "";
  #|         const after = source.slice(start + startMarker.length).trim();
  #|         if (!after) return "";
  #|         const end = after.indexOf(endMarker);
  #|         if (end < 0) return "";
  #|         return after.slice(0, end).trim();
  #|       };
  #|       const patterns = [
  #|         ["FILE: cmd/main/main.mbt", "END_FILE"],
  #|         ['<moonbit-file path="cmd/main/main.mbt">', "</moonbit-file>"],
  #|         ["```moonbit", "```"],
  #|         ["```mbt", "```"],
  #|         ["```", "```"]
  #|       ];
  #|       for (const [startMarker, endMarker] of patterns) {
  #|         const extracted = extract(text, startMarker, endMarker);
  #|         if (extracted) return extracted;
  #|       }
  #|       return text;
  #|     };
  #|   }
  #|   return globalThis.__moonapExtractMoonBitSource(raw);
  #| }

///|
#cfg(target="js")
extern "js" fn browser_render_artifact_card(
  title : String,
  summary : String,
  meta_json : String,
  allow_compile : Bool,
  allow_repair : Bool,
  allow_save : Bool,
) -> Unit =
  #| (title, summary, metaJson, allowCompile, allowRepair, allowSave) => {
  #|   const root = document.querySelector("#artifactActions");
  #|   if (!root) return;
  #|   globalThis.__moonapLastArtifactCardArgs = {
  #|     title: String(title || ""),
  #|     summary: String(summary || ""),
  #|     meta_json: String(metaJson || "[]"),
  #|     allow_compile: Boolean(allowCompile),
  #|     allow_repair: Boolean(allowRepair),
  #|     allow_save: Boolean(allowSave)
  #|   };
  #|   const runtimeRequest = globalThis.__moonapLastRuntimeRequest || {};
  #|   const runtimeResult = globalThis.__moonapLastRuntimeResult || {};
  #|   const profileRuntime = globalThis.__moonapRuntimeProfileRuntime && typeof globalThis.__moonapRuntimeProfileRuntime === "object"
  #|     ? globalThis.__moonapRuntimeProfileRuntime
  #|     : null;
  #|   const showTransient = globalThis.__moonapAllowTransientArtifactCard === true;
  #|   if (globalThis.__moonapMinimalShell !== false && !showTransient) {
  #|     root.innerHTML = "";
  #|     root.style.display = "none";
  #|     return;
  #|   }
  #|   let meta = [];
  #|   try {
  #|     const parsed = JSON.parse(String(metaJson || "[]"));
  #|     meta = Array.isArray(parsed) ? parsed : [];
  #|   } catch {
  #|     meta = [];
  #|   }
  #|   root.innerHTML = "";
  #|   root.style.display = "";
  #|   const card = document.createElement("section");
  #|   card.className = "action-card is-open";
  #|   const metaHtml = meta.map((item) => `<span>${String(item)}</span>`).join("");
  #|   const escapeHtml = (value) => String(value ?? "")
  #|     .replace(/&/g, "&amp;")
  #|     .replace(/</g, "&lt;")
  #|     .replace(/>/g, "&gt;")
  #|     .replace(/"/g, "&quot;")
  #|     .replace(/'/g, "&#39;");
  #|   const wasmUrl = String(runtimeRequest?.wasm_url || "");
  #|   const sourceUrl = String(runtimeRequest?.source_url || "");
  #|   const compileReportUrl = String(runtimeRequest?.compile_report_url || "");
  #|   const resultUrl = String(runtimeResult?.download_url || "");
  #|   const requestId = String(runtimeRequest?.request_id || "");
  #|   const runtimeReady = String(runtimeRequest?.status || "") === "ready-for-runtime";
  #|   const resultRequestId = String(runtimeResult?.request_id || "");
  #|   const runtimeDone = String(runtimeResult?.status || "").includes("succeeded") &&
  #|     (requestId === "" || resultRequestId === "" || resultRequestId === requestId || resultRequestId.startsWith("skill-runtime-"));
  #|   const runtimeCard = runtimeReady || runtimeDone;
  #|   if (runtimeCard) {
  #|     card.className += runtimeDone ? " action-card-runtime is-complete" : " action-card-runtime is-awaiting";
  #|     const runtimeSpec = runtimeRequest?.runtime_spec && typeof runtimeRequest.runtime_spec === "object"
  #|       ? runtimeRequest.runtime_spec
  #|       : (runtimeRequest?.runtime_ui && typeof runtimeRequest.runtime_ui === "object" ? runtimeRequest.runtime_ui : {});
  #|     const runtimeFields = Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : [];
  #|     const taskKind = String(runtimeRequest?.task_kind || "");
  #|     const runtimeMode = String(runtimeSpec?.mode || runtimeRequest?.runtime_mode || "");
  #|     const resultMode = String(runtimeSpec?.result_mode || runtimeRequest?.result_mode || runtimeResult?.result_mode || "");
  #|     const currentProfileId = profileRuntime && typeof profileRuntime.profileIdForRequest === "function"
  #|       ? String(profileRuntime.profileIdForRequest(runtimeRequest) || "")
  #|       : String(runtimeRequest?.runtime_profile_override_id || runtimeRequest?.runtime_profile_id || taskKind || "");
  #|     const currentProfile = profileRuntime && typeof profileRuntime.lookup === "function"
  #|       ? profileRuntime.lookup(currentProfileId)
  #|       : null;
  #|     const inferredTaskKind = String(runtimeRequest?.inferred_task_kind || taskKind || "");
  #|     const isFastqRuntime = taskKind === "fastq-generator";
  #|     const eyebrow = runtimeDone ? "Runtime result" : "Runtime ready";
  #|     const statusHtml = runtimeDone
  #|       ? '<span>result recorded</span><span>ready to rerun</span><span>ready to save</span>'
  #|       : '<span>wasm prepared</span><span>awaiting local execution</span>';
  #|     const runtimeProfileHtml = profileRuntime && typeof profileRuntime.list === "function"
  #|       ? (() => {
  #|           const options = profileRuntime.list();
  #|           const optionHtml = options.map((profile) => {
  #|             const id = String(profile?.id || "");
  #|             const label = String(profile?.label || id);
  #|             const selected = id === currentProfileId ? ' selected' : '';
  #|             return `<option value="${id}"${selected}>${label}</option>`;
  #|           }).join("");
  #|           const currentLabel = String(currentProfile?.label || currentProfileId || "Unspecified");
  #|           const currentDescription = String(currentProfile?.description || "Choose the runtime profile whose parameter schema best matches your APP.");
  #|           const inferenceNote = inferredTaskKind && inferredTaskKind !== taskKind
  #|             ? `MoonAP originally inferred ${inferredTaskKind}, then this run was switched to ${taskKind}.`
  #|             : `MoonAP currently inferred ${taskKind || "generic-task"}.`;
  #|           return `
  #|             <div class="action-card-runtime-profile">
  #|               <div class="action-card-runtime-profile-head">
  #|                 <strong>Runtime profile</strong>
  #|                 <small>${currentLabel}</small>
  #|               </div>
  #|               <small>${currentDescription}</small>
  #|               <small>${inferenceNote}</small>
  #|               <div class="action-card-runtime-profile-controls">
  #|                 <label><span>Switch runtime profile</span><select id="runtimeProfileSelect">${optionHtml}</select></label>
  #|                 <button id="applyRuntimeProfile" class="secondary" type="button">Apply profile</button>
  #|               </div>
  #|             </div>`;
  #|         })()
  #|       : "";
  #|     const paramsHtml = runtimeFields.length
  #|       ? `<div class="action-card-params">${runtimeFields.map((field) => {
  #|           const name = String(field?.name || "");
  #|           const label = String(field?.label || name || "Parameter");
  #|           const help = String(field?.help || field?.description || "");
  #|           const type = String(field?.type || "text").toLowerCase();
  #|           const isBool = type === "bool" || type === "boolean" || type === "checkbox";
  #|           const inputType = isBool ? "checkbox" : (type === "int" || type === "float" ? "number" : "text");
  #|           const defaultValue = field?.default ?? "";
  #|           const checked = isBool && !["false", "0", "no", "off", ""].includes(String(defaultValue).trim().toLowerCase()) ? "checked" : "";
  #|           const attrs = [
  #|             `id="runtime-field-${name}"`,
  #|             `data-runtime-field="${name}"`,
  #|             `type="${inputType}"`,
  #|             field?.min !== undefined ? `min="${String(field.min)}"` : "",
  #|             field?.max !== undefined ? `max="${String(field.max)}"` : "",
  #|             field?.step !== undefined ? `step="${String(field.step)}"` : "",
  #|             isBool ? `value="true"` : `value="${String(defaultValue)}"`,
  #|             checked
  #|           ].filter(Boolean).join(" ");
  #|           const helpHtml = help ? `<small class="param-help">${help}</small>` : "";
  #|           return isBool
  #|             ? `<label class="checkbox-param"><input ${attrs} /><span>${label}</span>${helpHtml}</label>`
  #|             : `<label><span>${label}</span><input ${attrs} />${helpHtml}</label>`;
  #|         }).join("")}</div>`
  #|       : "";
  #|     const isFastqAnalysisRuntime = taskKind === "large-fastq-analysis" || String(runtimeSpec?.domain_profile || "").toLowerCase() === "fastq";
  #|     const filePickerHtml = isFastqAnalysisRuntime || runtimeMode === "file"
  #|       ? `<div class="action-card-file-target">
  #|           <label class="dialog-button secondary" for="fileInput">${isFastqAnalysisRuntime ? "Choose input FastQ file" : "Choose input file"}</label>
  #|           <span id="runtimeInputFileStatus">${document.querySelector("#fileInput")?.files?.[0]?.name ? `Selected: ${document.querySelector("#fileInput")?.files?.[0]?.name}` : "No input file selected yet."}</span>
  #|           <small>${isFastqAnalysisRuntime ? "File contents stay in this browser. MoonAP reads it in chunks and sends only summary metrics to the server." : "File contents stay in this browser."}</small>
  #|         </div>`
  #|       : "";
  #|     const isStreamedOutputRuntime = String(runtimeSpec?.io_contract?.host_capability || "") === "streamed-local-generation" || taskKind === "large-file-generation";
  #|     const outputSelection = globalThis.__moonapRuntimeOutputFile && String(globalThis.__moonapRuntimeOutputFile.request_id || "") === requestId
  #|       ? globalThis.__moonapRuntimeOutputFile
  #|       : null;
  #|     const outputPickerHtml = isStreamedOutputRuntime
  #|       ? `<div class="action-card-file-target">
  #|           <button id="chooseRuntimeOutputFile" class="secondary strong" type="button">Choose output file</button>
  #|           <span id="runtimeOutputFileStatus">${outputSelection?.name ? `Selected: ${String(outputSelection.name)}` : "No output file selected yet."}</span>
  #|           <small>Choose where MoonAP should stream the generated file before running. No OS path string is stored.</small>
  #|         </div>`
  #|       : "";
  #|     const runLabel = runtimeDone
  #|       ? String(runtimeSpec?.rerun_action_label || runtimeSpec?.action_label || runtimeSpec?.primary_action_label || (runtimeMode === "interactive" ? "Run again" : "Run generator again"))
  #|       : String(runtimeSpec?.action_label || runtimeSpec?.primary_action_label || (runtimeMode === "interactive" ? "Run game" : "Run runtime step"));
  #|     const lastSaveDecision = globalThis.__moonapLastSkillSaveDecision && typeof globalThis.__moonapLastSkillSaveDecision === "object"
  #|       ? globalThis.__moonapLastSkillSaveDecision
  #|       : {};
  #|     const saveCompleted = runtimeDone && String(lastSaveDecision?.decision || "") === "accepted-save-skill";
  #|     const saveLabel = "Save APP into SKILL";
  #|     const primaryAction = [
  #|       `<button id="recordDemoRuntimeResult" class="primary" type="button">${runLabel}</button>`,
  #|       runtimeDone && allowSave ? `<button id="savePersonalSkill" class="secondary strong" type="button">${saveLabel}</button>` : ''
  #|     ].filter(Boolean).join("");
  #|     const resultPreviewText = runtimeDone
  #|       ? String(runtimeResult?.display_text || runtimeResult?.download_content || runtimeResult?.summary || "")
  #|         .replace(/\\r\\n/g, "\n")
  #|         .replace(/\\n/g, "\n")
  #|         .replace(/\\t/g, "\t")
  #|       : "";
  #|     const resultPreviewHtml = resultPreviewText.trim()
  #|       ? `<div class="action-card-result-preview"><strong>Result</strong><pre>${escapeHtml(resultPreviewText)}</pre></div>`
  #|       : "";
  #|     const secondaryActions = [
  #|       '<button id="startNewApp" class="secondary strong" type="button">Start new APP</button>',
  #|       wasmUrl ? '<button id="downloadRuntimeWasm" class="secondary" type="button">Download wasm</button>' : '',
  #|       sourceUrl ? '<button id="downloadRuntimeSource" class="secondary" type="button">Download source</button>' : '',
  #|       runtimeDone && resultMode === "report" ? '<button id="openRuntimeReport" class="secondary strong" type="button">Open report</button>' : '',
  #|       runtimeDone && resultMode === "report" ? '<button id="saveRuntimeReport" class="secondary" type="button">Save report</button>' : '',
  #|       resultUrl ? `<button id="downloadRuntimeResult" class="secondary" type="button">${resultMode === "report" ? "Download raw JSON" : "Download result"}</button>` : ''
  #|     ].filter(Boolean).join("");
  #|     card.innerHTML = `
  #|       <div class="action-card-eyebrow">${eyebrow}</div>
  #|       <strong>${String(title)}</strong>
  #|       <small>${String(summary)}</small>
  #|       <div class="action-card-status">${statusHtml}</div>
  #|       ${runtimeProfileHtml}
  #|       ${filePickerHtml}
  #|       ${outputPickerHtml}
  #|       ${paramsHtml}
  #|       ${resultPreviewHtml}
  #|       <div class="action-card-primary">${primaryAction}</div>
  #|       ${secondaryActions ? `<div class="action-card-secondary">${secondaryActions}</div>` : ''}`;
  #|   } else {
  #|     card.innerHTML = `
  #|       <strong>${String(title)}</strong>
  #|       <small>${String(summary)}</small>
  #|       ${metaHtml ? `<div class="action-card-meta">${metaHtml}</div>` : ''}
  #|       <div class="action-card-actions">
  #|         ${allowCompile ? '<button id="compileArtifact" type="button">Run Compile Probe</button>' : ''}
  #|         ${allowRepair ? '<button id="repairArtifact" type="button">Repair with Error Summary</button>' : ''}
  #|         ${allowSave ? '<button id="savePersonalSkill" type="button">Save APP into SKILL</button>' : ''}
  #|         ${runtimeReady && !runtimeDone ? '<button id="recordDemoRuntimeResult" type="button">Record Demo Result</button>' : ''}
  #|         ${wasmUrl ? '<button id="downloadRuntimeWasm" class="secondary" type="button">Download wasm</button>' : ''}
  #|         ${sourceUrl ? '<button id="downloadRuntimeSource" class="secondary" type="button">Download source</button>' : ''}
  #|         ${compileReportUrl ? '<button id="downloadCompileReport" class="secondary" type="button">Download compile report</button>' : ''}
  #|         ${resultUrl ? '<button id="downloadRuntimeResult" class="secondary" type="button">Download raw JSON</button>' : ''}
  #|         <button id="exportSkillBundle" class="secondary" type="button">Export Source Bundle</button>
  #|       </div>`;
  #|   }
  #|   root.append(card);
  #|   const runtimeFileInput = document.querySelector("#fileInput");
  #|   const runtimeFileStatus = document.querySelector("#runtimeInputFileStatus");
  #|   if (runtimeFileInput && runtimeFileStatus) {
  #|     const syncRuntimeFileStatus = () => {
  #|       const file = runtimeFileInput.files?.[0];
  #|       runtimeFileStatus.textContent = file ? `Selected: ${file.name}` : "No input file selected yet.";
  #|     };
  #|     runtimeFileInput.onchange = syncRuntimeFileStatus;
  #|     syncRuntimeFileStatus();
  #|   }
  #|   const runtimeOutputButton = document.querySelector("#chooseRuntimeOutputFile");
  #|   const runtimeOutputStatus = document.querySelector("#runtimeOutputFileStatus");
  #|   if (runtimeOutputButton && runtimeOutputStatus) {
  #|     runtimeOutputButton.onclick = async () => {
  #|       try {
  #|         if (typeof window.showSaveFilePicker !== "function") {
  #|           throw new Error("This browser does not support selecting a streamed output file yet.");
  #|         }
  #|         const fileNameRuntime = globalThis.__moonapFileNameRuntime;
  #|         const outputInput = document.querySelector("#runtime-field-output_name");
  #|         const outputNameRaw = String(outputInput?.value || "moonap-output.fastq").trim() || "moonap-output.fastq";
  #|         const outputName = fileNameRuntime?.sanitize(outputNameRaw, "moonap-output.fastq") || "moonap-output.fastq";
  #|         const handle = await window.showSaveFilePicker({
  #|           suggestedName: outputName,
  #|           types: [{ description: "FastQ files", accept: { "text/plain": [".fastq", ".fq", ".txt"] } }]
  #|         });
  #|         globalThis.__moonapRuntimeOutputFile = {
  #|           request_id: requestId,
  #|           handle,
  #|           name: String(handle?.name || outputName)
  #|         };
  #|         if (outputInput) outputInput.value = String(handle?.name || outputName);
  #|         runtimeOutputStatus.textContent = `Selected: ${String(handle?.name || outputName)}`;
  #|       } catch (error) {
  #|         runtimeOutputStatus.textContent = `Output file not selected: ${error instanceof Error ? error.message : String(error)}`;
  #|       }
  #|     };
  #|   }
  #|   if (runtimeCard) {
  #|     try { root.scrollIntoView({ behavior: "smooth", block: "end" }); } catch {}
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_on_runtime_profile_apply(
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| (onDone, onError) => {
  #|   if (document.__moonapRuntimeProfileApplyBound) return;
  #|   document.__moonapRuntimeProfileApplyBound = true;
  #|   document.addEventListener("click", (event) => {
  #|     const target = event.target;
  #|     if (!target || target.id !== "applyRuntimeProfile") return;
  #|     event.preventDefault();
  #|     try {
  #|       const runtimeRequest = globalThis.__moonapLastRuntimeRequest;
  #|       if (!runtimeRequest || typeof runtimeRequest !== "object") {
  #|         throw new Error("No runtime request is available yet.");
  #|       }
  #|       const runtime = globalThis.__moonapRuntimeProfileRuntime;
  #|       if (!runtime || typeof runtime.applyProfile !== "function") {
  #|         throw new Error("MoonAP runtime profile runtime is not ready yet.");
  #|       }
  #|       const selectedId = String(document.querySelector("#runtimeProfileSelect")?.value || "").trim();
  #|       if (!selectedId) throw new Error("Choose a runtime profile first.");
  #|       const nextRequest = runtime.applyProfile(runtimeRequest, selectedId);
  #|       globalThis.__moonapLastRuntimeRequest = nextRequest;
  #|       const selectedProfile = typeof runtime.lookup === "function" ? runtime.lookup(selectedId) : null;
  #|       onDone(JSON.stringify({
  #|         ok: true,
  #|         profile_id: selectedId,
  #|         label: String(selectedProfile?.label || selectedId),
  #|         task_kind: String(nextRequest.task_kind || ""),
  #|         runtime_mode: String(nextRequest.runtime_mode || ""),
  #|         result_mode: String(nextRequest.result_mode || "")
  #|       }, null, 2));
  #|     } catch (error) {
  #|       onError(error instanceof Error ? error.message : String(error));
  #|     }
  #|   });
  #| }

///|
#cfg(target="js")
extern "js" fn browser_show_toast(message : String) -> Unit =
  #| (message) => {
  #|   const text = String(message || "").trim();
  #|   if (!text) return;
  #|   let toast = document.querySelector("#moonapToast");
  #|   if (!toast) {
  #|     toast = document.createElement("div");
  #|     toast.id = "moonapToast";
  #|     toast.className = "moonap-toast";
  #|     document.body.append(toast);
  #|   }
  #|   toast.textContent = text;
  #|   toast.classList.add("is-open");
  #|   if (toast.__moonapTimer) clearTimeout(toast.__moonapTimer);
  #|   toast.__moonapTimer = setTimeout(() => {
  #|     toast.classList.remove("is-open");
  #|   }, 5200);
  #| }

///|
#cfg(target="js")
extern "js" fn browser_ensure_large_file_progress_runtime() -> Unit =
  #| () => {
  #|   if (globalThis.__moonapLargeFileProgressRuntime) return;
  #|   if (!document.querySelector("#moonapLargeFileProgressStyle")) {
  #|     const style = document.createElement("style");
  #|     style.id = "moonapLargeFileProgressStyle";
  #|     style.textContent = `
  #|       .large-file-progress { position: fixed; right: 28px; bottom: 28px; width: min(420px, calc(100vw - 56px)); display: grid; gap: 10px; padding: 14px 16px; border: 1px solid #cde4da; border-radius: 16px; background: rgba(247,251,249,0.98); color: #173f31; box-shadow: 0 22px 60px rgba(24,48,37,0.20); opacity: 0; transform: translateY(12px); pointer-events: none; transition: opacity 140ms ease, transform 140ms ease; z-index: 1300; }
  #|       .large-file-progress.is-open { opacity: 1; transform: translateY(0); }
  #|       .large-file-progress.is-error { border-color: #f0c7c7; background: rgba(255,247,247,0.98); color: #7a1f1f; }
  #|       .large-file-progress-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
  #|       .large-file-progress-head strong { font-size: 15px; }
  #|       .large-file-progress-head span { font-variant-numeric: tabular-nums; font-weight: 700; }
  #|       .large-file-progress-track { height: 8px; border-radius: 999px; overflow: hidden; background: #e6eee9; }
  #|       .large-file-progress-track div { width: 0%; height: 100%; border-radius: inherit; background: #1f7a5b; transition: width 120ms ease; }
  #|       .large-file-progress.is-error .large-file-progress-track div { background: #b94a48; }
  #|       .large-file-progress-detail { font-size: 13px; line-height: 1.45; overflow-wrap: anywhere; }
  #|     `;
  #|     document.head.append(style);
  #|   }
  #|   const formatBytes = (value) => {
  #|     const n = Number(value || 0);
  #|     if (n >= 1073741824) return `${(n / 1073741824).toFixed(2)} GB`;
  #|     if (n >= 1048576) return `${(n / 1048576).toFixed(2)} MB`;
  #|     if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  #|     return `${Math.max(0, Math.floor(n))} B`;
  #|   };
  #|   const ensure = () => {
  #|     let card = document.querySelector("#moonapLargeFileProgress");
  #|     if (card) return card;
  #|     card = document.createElement("section");
  #|     card.id = "moonapLargeFileProgress";
  #|     card.className = "large-file-progress";
  #|     card.setAttribute("aria-live", "polite");
  #|     card.innerHTML = `
  #|       <div class="large-file-progress-head">
  #|         <strong id="largeFileProgressTitle">Large file operation</strong>
  #|         <span id="largeFileProgressPct">0%</span>
  #|       </div>
  #|       <div class="large-file-progress-track"><div id="largeFileProgressFill"></div></div>
  #|       <div id="largeFileProgressDetail" class="large-file-progress-detail">Preparing...</div>
  #|     `;
  #|     document.body.append(card);
  #|     return card;
  #|   };
  #|   const update = (data) => {
  #|     const payload = data && typeof data === "object" ? data : {};
  #|     const card = ensure();
  #|     const progress = Math.max(0, Math.min(100, Number(payload.progress_percent ?? 0)));
  #|     const isGeneration = String(payload.result_kind || "") === "streamed-file" || String(payload.status || "").includes("write");
  #|     const title = payload.title || (isGeneration ? "Writing large file locally" : "Reading large file locally");
  #|     const processed = Number(payload.bytes_processed ?? payload.bytes_written ?? payload.file_size_bytes ?? 0);
  #|     const target = Number(payload.target_bytes ?? payload.file_size_bytes ?? 0);
  #|     const chunks = Number(payload.chunk_count || 0);
  #|     const reads = Number(payload.reads_seen ?? payload.line_count ?? 0);
  #|     const details = [
  #|       payload.file_name ? `File: ${String(payload.file_name)}` : "",
  #|       target > 0 ? `${formatBytes(processed)} / ${formatBytes(target)}` : formatBytes(processed),
  #|       chunks > 0 ? `${chunks} chunk(s)` : "",
  #|       reads > 0 ? `${reads} record/line(s)` : "",
  #|       payload.llm_receives_file_contents === false ? "File contents stay in this browser." : ""
  #|     ].filter(Boolean).join(" | ");
  #|     card.querySelector("#largeFileProgressTitle").textContent = String(title);
  #|     card.querySelector("#largeFileProgressPct").textContent = `${Math.floor(progress)}%`;
  #|     card.querySelector("#largeFileProgressFill").style.width = `${progress}%`;
  #|     card.querySelector("#largeFileProgressDetail").textContent = details || String(payload.status || "Working...");
  #|     card.classList.add("is-open");
  #|     card.classList.toggle("is-complete", progress >= 100 || String(payload.status || "") === "runtime-succeeded");
  #|     if (card.__moonapTimer) clearTimeout(card.__moonapTimer);
  #|     if (progress >= 100 || String(payload.status || "") === "runtime-succeeded") {
  #|       card.__moonapTimer = setTimeout(() => card.classList.remove("is-open", "is-complete"), 7000);
  #|     }
  #|   };
  #|   const error = (message) => {
  #|     const card = ensure();
  #|     card.querySelector("#largeFileProgressTitle").textContent = "Large file operation failed";
  #|     card.querySelector("#largeFileProgressPct").textContent = "failed";
  #|     card.querySelector("#largeFileProgressFill").style.width = "100%";
  #|     card.querySelector("#largeFileProgressDetail").textContent = String(message || "Unknown error");
  #|     card.classList.add("is-open", "is-error");
  #|   };
  #|   globalThis.__moonapLargeFileProgressRuntime = { update, error };
  #| }

///|
#cfg(target="js")
extern "js" fn browser_ensure_runtime_profile_runtime() -> Unit =
  #| () => {
  #|   if (globalThis.__moonapRuntimeProfileRuntime) return;
  #|   const clone = (value) => {
  #|     try { return JSON.parse(JSON.stringify(value ?? null)); } catch { return value ?? null; }
  #|   };
  #|   const registry = {
  #|     "large-file-generation": {
  #|       id: "large-file-generation",
  #|       label: "Large-file generation",
  #|       description: "Browser-local streamed FastQ output with save picker, target size, read length, header prefix, seed, N rate, and quality controls.",
  #|       task_kind: "large-file-generation",
  #|       runtime_mode: "form",
  #|       result_mode: "download",
  #|       runtime_spec: {
  #|         mode: "form",
  #|         title: "Generate large browser-local file",
  #|         primary_action_label: "Generate with streaming writer",
  #|         rerun_action_label: "Generate with streaming writer again",
  #|         io_contract: {
  #|           protocol: "moonap.large-file.v1",
  #|           browser_local_only: true,
  #|           llm_receives_file_contents: false,
  #|           host_capability: "streamed-local-generation",
  #|           input_mode: "none",
  #|           output_mode: "browser-local-save-stream",
  #|           chunk_size_bytes: 4194304,
  #|           save_picker_required: true
  #|         },
  #|         fields: [
  #|           { name: "output_name", label: "Output FastQ file name", type: "text", default: "moonap-output.fastq" },
  #|           { name: "target_size_mb", label: "Target size in MB", type: "int", default: 128, min: 1, max: 1024, step: 1 },
  #|           { name: "read_length", label: "Read length", type: "int", default: 150, min: 20, max: 20000, step: 1 },
  #|           { name: "read_header_prefix", label: "Read header prefix", type: "text", default: "moonap_read" },
  #|           { name: "random_seed", label: "Random seed", type: "int", default: 42, min: 0, max: 2147483647, step: 1 },
  #|           { name: "n_rate", label: "N base rate", type: "float", default: 0.01, min: 0, max: 1, step: 0.001 },
  #|           { name: "quality_char", label: "Quality character", type: "text", default: "I" }
  #|         ]
  #|       }
  #|     },
  #|     "large-fastq-analysis": {
  #|       id: "large-fastq-analysis",
  #|       label: "Large FastQ analysis",
  #|       description: "Browser-local chunked FastQ analysis with read, base, structure, and preview metrics.",
  #|       task_kind: "large-fastq-analysis",
  #|       runtime_mode: "file",
  #|       result_mode: "report",
  #|       runtime_spec: {
  #|         mode: "file",
  #|         title: "Analyze large FastQ file",
  #|         action_label: "Run FastQ analysis",
  #|         rerun_action_label: "Run FastQ analysis again",
  #|         domain_profile: "fastq",
  #|         io_contract: {
  #|           protocol: "moonap.large-file.v1",
  #|           browser_local_only: true,
  #|           llm_receives_file_contents: false,
  #|           host_capability: "chunked-local-analysis",
  #|           input_mode: "streaming-text",
  #|           output_mode: "report",
  #|           chunk_size_bytes: 4194304,
  #|           carry_strategy: "fastq-record-boundary",
  #|           supported_extensions: ["fastq", "fq", "txt"]
  #|         },
  #|         fields: [
  #|           { name: "max_preview_reads", label: "Preview reads", type: "int", default: 3, min: 0, max: 20, step: 1, help: "Only controls how many reads appear in the report preview. It does not limit full-file analysis." },
  #|           { name: "validate_fastq_structure", label: "Validate FastQ structure", type: "bool", default: true, help: "Check @ header, + separator, and sequence/quality length for each four-line FastQ record." },
  #|           { name: "count_bases", label: "Count A/C/G/T/N bases", type: "bool", default: true, help: "Count base composition while streaming. Turn off only if you want a lighter structural scan." }
  #|         ]
  #|       }
  #|     },
  #|     "large-file-analysis": {
  #|       id: "large-file-analysis",
  #|       label: "Large-file analysis",
  #|       description: "Browser-local chunked input analysis with search text and preview controls.",
  #|       task_kind: "large-file-analysis",
  #|       runtime_mode: "file",
  #|       result_mode: "report",
  #|       runtime_spec: {
  #|         mode: "file",
  #|         title: "Analyze large browser-local file",
  #|         action_label: "Run streaming analysis",
  #|         rerun_action_label: "Run streaming analysis again",
  #|         io_contract: {
  #|           protocol: "moonap.large-file.v1",
  #|           browser_local_only: true,
  #|           llm_receives_file_contents: false,
  #|           host_capability: "chunked-local-analysis",
  #|           input_mode: "streaming-text",
  #|           output_mode: "report",
  #|           chunk_size_bytes: 4194304,
  #|           carry_strategy: "line-boundary",
  #|           supported_extensions: ["fastq", "fq", "csv", "tsv", "txt", "log", "jsonl"]
  #|         },
  #|         fields: [
  #|           { name: "search_text", label: "Search text (optional)", type: "text", default: "" },
  #|           { name: "max_preview_lines", label: "Preview lines", type: "int", default: 3, min: 0, max: 20, step: 1 }
  #|         ]
  #|       }
  #|     },
  #|     "fastq-generator": {
  #|       id: "fastq-generator",
  #|       label: "FastQ generator",
  #|       description: "Parameter-driven FastQ generation with read count, read length, N rate, and seed.",
  #|       task_kind: "fastq-generator",
  #|       runtime_mode: "form",
  #|       result_mode: "download",
  #|       runtime_spec: {
  #|         mode: "form",
  #|         title: "Generate FastQ file",
  #|         primary_action_label: "Run generator",
  #|         rerun_action_label: "Run generator again",
  #|         fields: [
  #|           { name: "read_count", label: "Read count", type: "int", default: 10000, min: 1, max: 2000000, step: 1 },
  #|           { name: "read_length", label: "Read length", type: "int", default: 150, min: 20, max: 20000, step: 1 },
  #|           { name: "n_rate", label: "N rate", type: "float", default: 0.01, min: 0, max: 1, step: 0.001 },
  #|           { name: "random_seed", label: "Random seed", type: "int", default: 42, min: 0, max: 2147483647, step: 1 }
  #|         ]
  #|       }
  #|     },
  #|     "fastq-analysis": {
  #|       id: "fastq-analysis",
  #|       label: "FastQ analysis",
  #|       description: "File-input FastQ analysis profile.",
  #|       task_kind: "fastq-analysis",
  #|       runtime_mode: "file",
  #|       result_mode: "report",
  #|       runtime_spec: {
  #|         mode: "file",
  #|         title: "Analyze FastQ file",
  #|         action_label: "Run analysis",
  #|         rerun_action_label: "Run analysis again",
  #|         fields: []
  #|       }
  #|     },
  #|     "generic-form": {
  #|       id: "generic-form",
  #|       label: "Generic form app",
  #|       description: "Fallback profile for browser-local apps that mainly need a simple parameter form.",
  #|       task_kind: "generic-task",
  #|       runtime_mode: "form",
  #|       result_mode: "text",
  #|       runtime_spec: {
  #|         mode: "form",
  #|         title: "Run browser-local app",
  #|         primary_action_label: "Run app",
  #|         rerun_action_label: "Run app again",
  #|         fields: []
  #|       }
  #|     },
  #|     "generic-file": {
  #|       id: "generic-file",
  #|       label: "Generic file analysis",
  #|       description: "Fallback profile for apps that should start from a browser file picker.",
  #|       task_kind: "generic-task",
  #|       runtime_mode: "file",
  #|       result_mode: "report",
  #|       runtime_spec: {
  #|         mode: "file",
  #|         title: "Analyze local file",
  #|         action_label: "Run file analysis",
  #|         rerun_action_label: "Run file analysis again",
  #|         fields: []
  #|       }
  #|     }
  #|   };
  #|   const orderedIds = ["large-file-generation", "large-fastq-analysis", "large-file-analysis", "fastq-generator", "fastq-analysis", "generic-form", "generic-file"];
  #|   const normalizeProfileId = (value) => registry[String(value || "").trim()] ? String(value || "").trim() : "";
  #|   const runtimeSpecOf = (request) => request?.runtime_spec && typeof request.runtime_spec === "object"
  #|     ? request.runtime_spec
  #|     : (request?.runtime_ui && typeof request.runtime_ui === "object" ? request.runtime_ui : {});
  #|   const profileIdForRequest = (request) => {
  #|     const explicit = normalizeProfileId(request?.runtime_profile_override_id || request?.runtime_profile_id || request?.task_kind);
  #|     if (explicit) return explicit;
  #|     const runtimeSpec = runtimeSpecOf(request);
  #|     if (String(runtimeSpec?.domain_profile || "").toLowerCase() === "fastq") return "large-fastq-analysis";
  #|     const hostCapability = String(runtimeSpec?.io_contract?.host_capability || "");
  #|     if (hostCapability === "streamed-local-generation") return "large-file-generation";
  #|     if (hostCapability === "chunked-local-analysis") return "large-file-analysis";
  #|     const mode = String(request?.runtime_mode || runtimeSpec?.mode || "");
  #|     return mode === "file" ? "generic-file" : "generic-form";
  #|   };
  #|   const applyProfile = (request, selectedId) => {
  #|     const id = normalizeProfileId(selectedId);
  #|     const profile = registry[id];
  #|     if (!profile) throw new Error(`Unknown runtime profile: ${String(selectedId || "")}`);
  #|     const base = request && typeof request === "object" ? request : {};
  #|     const inferredTaskKind = String(base.inferred_task_kind || base.task_kind || "");
  #|     const runtimeSpec = clone(profile.runtime_spec) || {};
  #|     runtimeSpec.profile_id = id;
  #|     runtimeSpec.profile_label = String(profile.label || id);
  #|     runtimeSpec.selection_source = "user-selected";
  #|     if (inferredTaskKind) runtimeSpec.inferred_task_kind = inferredTaskKind;
  #|     return Object.assign({}, base, {
  #|       inferred_task_kind: inferredTaskKind,
  #|       task_kind: String(profile.task_kind || base.task_kind || "generic-task"),
  #|       runtime_mode: String(profile.runtime_mode || runtimeSpec.mode || base.runtime_mode || "form"),
  #|       result_mode: String(profile.result_mode || base.result_mode || "text"),
  #|       runtime_profile_id: id,
  #|       runtime_profile_override_id: id,
  #|       runtime_profile_label: String(profile.label || id),
  #|       runtime_spec: runtimeSpec,
  #|       runtime_ui: clone(runtimeSpec) || runtimeSpec
  #|     });
  #|   };
  #|   globalThis.__moonapRuntimeProfileRuntime = {
  #|     list: () => orderedIds.map((id) => clone(registry[id])),
  #|     lookup: (id) => clone(registry[normalizeProfileId(id)] || null),
  #|     profileIdForRequest,
  #|     applyProfile
  #|   };
  #| }

///|
#cfg(target="js")
extern "js" fn browser_clear_artifact_card() -> Unit =
  #| () => {
  #|   const root = document.querySelector("#artifactActions");
  #|   if (root) {
  #|     root.innerHTML = "";
  #|     if (globalThis.__moonapMinimalShell !== false) root.style.display = "none";
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_start_new_app() -> Unit =
  #| () => {
  #|   const runtimeRequest = globalThis.__moonapLastRuntimeRequest || {};
  #|   const runtimeResult = globalThis.__moonapLastRuntimeResult || {};
  #|   const requestId = String(runtimeResult.request_id || runtimeRequest.request_id || "");
  #|   if (requestId) {
  #|     localStorage.setItem("moonap.ignoreRuntimeRequestId", requestId);
  #|   }
  #|   globalThis.__moonapLastArtifact = null;
  #|   globalThis.__moonapLastCompileReport = null;
  #|   globalThis.__moonapLastRuntimeRequest = {};
  #|   globalThis.__moonapLastRuntimeResult = {};
  #|   globalThis.__moonapLastRuntimeReportPayload = null;
  #|   globalThis.__moonapRuntimeOutputFile = null;
  #|   globalThis.__moonapLastRuntimeRequestText = "";
  #|   globalThis.__moonapLastRuntimeResultText = "";
  #|   globalThis.__moonapLastArtifactCardArgs = null;
  #|   globalThis.__moonapBenchmarkAssessment = "";
  #|   globalThis.__moonapLastSkillSaveDecision = {};
  #|   globalThis.__moonapLastSkillSaveDecisionText = "";
  #|   globalThis.__moonapAllowTransientArtifactCard = false;
  #|   const actions = document.querySelector("#artifactActions");
  #|   if (actions) {
  #|     actions.innerHTML = "";
  #|     if (globalThis.__moonapMinimalShell !== false) actions.style.display = "none";
  #|   }
  #|   const messages = document.querySelector("#messages");
  #|   if (messages) messages.innerHTML = "";
  #|   const progress = document.querySelector("#largeFileProgressCard");
  #|   if (progress) progress.classList.remove("is-open", "is-error");
  #|   const state = document.querySelector("#state");
  #|   if (state) state.textContent = "{\n  \"status\": \"new-app\"\n}";
  #|   const processStage = document.querySelector("#processStage");
  #|   const processResult = document.querySelector("#processResult");
  #|   const processLog = document.querySelector("#processLog");
  #|   if (processStage) processStage.textContent = "new-app";
  #|   if (processResult) processResult.textContent = "ready";
  #|   if (processLog) processLog.textContent = "Start from a new user prompt.";
  #|   const textarea = document.querySelector("#message");
  #|   if (textarea) {
  #|     textarea.value = "";
  #|     textarea.classList.remove("suggested");
  #|     textarea.focus();
  #|   }
  #|   try { window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); } catch {}
  #| }

///|
#cfg(target="js")
extern "js" fn browser_on_start_new_app(handler : () -> Unit) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "startNewApp") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   try {
  #|     handler();
  #|   } catch (error) {
  #|     alert(`MoonAP start-new failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_set_transient_artifact_card(open : Bool) -> Unit =
  #| (open) => {
  #|   globalThis.__moonapAllowTransientArtifactCard = Boolean(open);
  #|   const root = document.querySelector("#artifactActions");
  #|   if (!root) return;
  #|   if (!open && globalThis.__moonapMinimalShell !== false) {
  #|     root.style.display = "none";
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_remember_runtime_request(raw : String) -> Unit =
  #| (raw) => {
  #|   const text = String(raw || "");
  #|   globalThis.__moonapLastRuntimeRequestText = text;
  #|   try {
  #|     globalThis.__moonapLastRuntimeRequest = JSON.parse(text);
  #|   } catch {
  #|     globalThis.__moonapLastRuntimeRequest = {};
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_remember_runtime_result(raw : String) -> Unit =
  #| (raw) => {
  #|   const text = String(raw || "");
  #|   globalThis.__moonapLastRuntimeResultText = text;
  #|   try {
  #|     globalThis.__moonapLastRuntimeResult = JSON.parse(text);
  #|   } catch {
  #|     globalThis.__moonapLastRuntimeResult = {};
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_download_runtime_artifact(kind : String) -> Unit =
  #| (kind) => {
  #|   const runtimeRequest = globalThis.__moonapLastRuntimeRequest || {};
  #|   const runtimeResult = globalThis.__moonapLastRuntimeResult || {};
  #|   const url = kind === "wasm"
  #|     ? String(runtimeRequest?.wasm_url || "")
  #|     : kind === "source"
  #|       ? String(runtimeRequest?.source_url || "")
  #|       : kind === "compile-report"
  #|         ? String(runtimeRequest?.compile_report_url || "")
  #|         : String(runtimeResult?.download_url || "");
  #|   if (!url) {
  #|     throw new Error(`No runtime artifact URL is available for ${String(kind)}.`);
  #|   }
  #|   const link = document.createElement("a");
  #|   link.href = url;
  #|   link.download = "";
  #|   document.body.append(link);
  #|   link.click();
  #|   link.remove();
  #| }

///|
#cfg(target="js")
extern "js" fn browser_open_runtime_report() -> Unit =
  #| () => {
  #|   const report = globalThis.__moonapReportRuntime?.buildHtml?.();
  #|   if (!report) throw new Error("No browser report is available yet.");
  #|   const blob = new Blob([report], { type: "text/html;charset=utf-8" });
  #|   const url = URL.createObjectURL(blob);
  #|   window.open(url, "_blank", "noopener,noreferrer");
  #|   setTimeout(() => URL.revokeObjectURL(url), 60000);
  #| }

///|
#cfg(target="js")
extern "js" fn browser_save_runtime_report() -> Unit =
  #| async () => {
  #|   const runtime = globalThis.__moonapReportRuntime;
  #|   const report = runtime?.buildHtml?.();
  #|   if (!report) throw new Error("No browser report is available yet.");
  #|   const name = runtime?.reportFileName?.() || "moonap-report.html";
  #|   if (typeof window.showSaveFilePicker === "function") {
  #|     const handle = await window.showSaveFilePicker({
  #|       suggestedName: name,
  #|       types: [{ description: "HTML report", accept: { "text/html": [".html"] } }]
  #|     });
  #|     const writable = await handle.createWritable();
  #|     await writable.write(new Blob([report], { type: "text/html;charset=utf-8" }));
  #|     await writable.close();
  #|     return;
  #|   }
  #|   const blob = new Blob([report], { type: "text/html;charset=utf-8" });
  #|   const url = URL.createObjectURL(blob);
  #|   const link = document.createElement("a");
  #|   link.href = url;
  #|   link.download = name;
  #|   document.body.append(link);
  #|   link.click();
  #|   link.remove();
  #|   URL.revokeObjectURL(url);
  #| }

///|
#cfg(target="js")
extern "js" fn browser_ensure_report_runtime() -> Unit =
  #| () => {
  #|   if (globalThis.__moonapReportRuntime) return;
  #|   const escapeHtml = (value) => String(value ?? "")
  #|     .replaceAll("&", "&amp;")
  #|     .replaceAll("<", "&lt;")
  #|     .replaceAll(">", "&gt;")
  #|     .replaceAll('"', "&quot;");
  #|   const decodeText = (value) => String(value ?? "")
  #|     .replaceAll("\\r\\n", "\n")
  #|     .replaceAll("\\n", "\n")
  #|     .replaceAll("\\t", "\t");
  #|   const asNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
  #|   const formatBytes = (value) => {
  #|     const n = Number(value || 0);
  #|     if (!Number.isFinite(n) || n <= 0) return "0 B";
  #|     const units = ["B", "KB", "MB", "GB", "TB"];
  #|     let size = n;
  #|     let unit = 0;
  #|     while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit += 1; }
  #|     return `${size.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
  #|   };
  #|   const currentReportData = () => {
  #|     const raw = globalThis.__moonapLastRuntimeReportPayload;
  #|     const result = globalThis.__moonapLastRuntimeResult || {};
  #|     if (raw && typeof raw === "object" && String(raw.request_id || "") === String(result.request_id || raw.request_id || "")) {
  #|       return { ...result, ...raw };
  #|     }
  #|     return result;
  #|   };
  #|   const rows = (items) => items
  #|     .filter(([, value]) => value !== undefined && value !== null && String(value) !== "")
  #|     .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
  #|     .join("");
  #|   const buildHtml = () => {
  #|     const data = currentReportData();
  #|     if (!data || typeof data !== "object" || !String(data.request_id || data.summary || data.display_text || "").trim()) return "";
  #|     const title = String(data.result_kind || "").includes("fastq") ? "MoonAP Large FastQ Analysis Report" : "MoonAP Runtime Report";
  #|     const displayText = decodeText(data.display_text || data.download_content || data.summary || "");
  #|     const previewReads = Array.isArray(data.preview_reads) ? data.preview_reads : [];
  #|     const baseCounts = [
  #|       ["A", data.A_count],
  #|       ["C", data.C_count],
  #|       ["G", data.G_count],
  #|       ["T", data.T_count],
  #|       ["N", data.N_count],
  #|       ["Other", data.other_base_count]
  #|     ];
  #|     const baseTotal = baseCounts.reduce((sum, [, value]) => sum + (asNumber(value) || 0), 0);
  #|     const baseRows = baseCounts
  #|       .filter(([, value]) => value !== undefined && value !== null)
  #|       .map(([base, value]) => {
  #|         const n = asNumber(value) || 0;
  #|         const pct = baseTotal > 0 ? `${((n / baseTotal) * 100).toFixed(2)}%` : "-";
  #|         return `<tr><th>${escapeHtml(base)}</th><td>${escapeHtml(n)}</td><td>${escapeHtml(pct)}</td></tr>`;
  #|       }).join("");
  #|     const previewHtml = previewReads.length > 0
  #|       ? previewReads.map((read, index) => `<article class="preview-read"><h3>Preview read ${index + 1}</h3><pre>${escapeHtml(decodeText(read))}</pre></article>`).join("")
  #|       : (displayText ? `<pre>${escapeHtml(displayText)}</pre>` : "<p>No preview reads were captured.</p>");
  #|     return `<!doctype html>
  #| <html lang="en">
  #| <head>
  #| <meta charset="utf-8" />
  #| <meta name="viewport" content="width=device-width, initial-scale=1" />
  #| <title>${escapeHtml(title)}</title>
  #| <style>
  #| :root { color-scheme: light; font-family: "Segoe UI", "Aptos", "Helvetica Neue", sans-serif; color: #17261f; background: #f2f5ef; font-variant-numeric: tabular-nums; }
  #| body { margin: 0; padding: 32px; font-size: 16px; line-height: 1.55; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
  #| main { max-width: 1040px; margin: 0 auto; display: grid; gap: 22px; }
  #| header { padding: 28px; border-radius: 24px; background: linear-gradient(135deg, #ffffff, #e7f2eb); border: 1px solid #cfe1d6; }
  #| h1 { margin: 0 0 10px; font-size: clamp(30px, 4vw, 52px); line-height: 1.05; letter-spacing: -0.04em; font-weight: 750; }
  #| section { padding: 22px; border-radius: 20px; background: rgba(255,255,255,0.86); border: 1px solid #d8e5dc; box-shadow: 0 16px 40px rgba(43,74,55,0.08); }
  #| h2 { margin: 0 0 14px; font-size: 22px; line-height: 1.2; letter-spacing: -0.02em; font-weight: 720; }
  #| table { width: 100%; border-collapse: collapse; }
  #| th, td { text-align: left; border-bottom: 1px solid #e4ece7; padding: 11px 8px; vertical-align: middle; line-height: 1.45; }
  #| th { width: 34%; color: #315241; font-weight: 680; }
  #| td { color: #14251d; }
  #| p { line-height: 1.6; }
  #| pre { font-family: "Cascadia Mono", "JetBrains Mono", "SFMono-Regular", Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; padding: 14px; border-radius: 14px; background: #102018; color: #e9fff3; line-height: 1.55; font-size: 14px; }
  #| .actions { display: flex; gap: 10px; flex-wrap: wrap; }
  #| button { border: 1px solid #1f7a5b; background: #1f7a5b; color: white; border-radius: 999px; padding: 10px 16px; font: inherit; font-weight: 650; cursor: pointer; }
  #| button.secondary { background: white; color: #1f7a5b; }
  #| .note { color: #567064; }
  #| </style>
  #| </head>
  #| <body>
  #| <main>
  #| <header>
  #| <h1>${escapeHtml(title)}</h1>
  #| <p>${escapeHtml(data.summary || "Browser-local report generated by MoonAP.")}</p>
  #| <p class="note">File contents stayed in this browser. The report contains summary metrics and small previews only.</p>
  #| <div class="actions"><button onclick="window.print()">Print / Save as PDF</button><button class="secondary" onclick="navigator.clipboard?.writeText(document.body.innerText)">Copy text</button></div>
  #| </header>
  #| <section><h2>File</h2><table>${rows([
  #|   ["File name", data.file_name],
  #|   ["File size", data.file_size_bytes !== undefined ? `${formatBytes(data.file_size_bytes)} (${data.file_size_bytes} bytes)` : ""],
  #|   ["Chunk count", data.chunk_count],
  #|   ["Chunk size", data.chunk_size_bytes !== undefined ? `${formatBytes(data.chunk_size_bytes)} (${data.chunk_size_bytes} bytes)` : ""],
  #|   ["Request ID", data.request_id]
  #| ])}</table></section>
  #| <section><h2>FastQ Summary</h2><table>${rows([
  #|   ["Estimated read count", data.estimated_read_count || data.reads_seen],
  #|   ["Total lines", data.total_lines || data.line_count],
  #|   ["Total bases", data.total_bases],
  #|   ["Malformed records", data.malformed_record_count],
  #|   ["Min read length", data.min_read_length],
  #|   ["Max read length", data.max_read_length],
  #|   ["Average read length", data.average_read_length],
  #|   ["Elapsed ms", data.elapsed_ms]
  #| ])}</table></section>
  #| ${baseRows ? `<section><h2>Base Composition</h2><table><tr><th>Base</th><th>Count</th><th>Percent</th></tr>${baseRows}</table></section>` : ""}
  #| <section><h2>Preview / Raw Report</h2>${previewHtml}</section>
  #| </main>
  #| </body>
  #| </html>`;
  #|   };
  #|   const reportFileName = () => {
  #|     const data = currentReportData();
  #|     const base = String(data?.file_name || data?.result_kind || "moonap-report").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "moonap-report";
  #|     return `${base}.report.html`;
  #|   };
  #|   globalThis.__moonapReportRuntime = { buildHtml, reportFileName };
  #| }

///|
#cfg(target="js")
extern "js" fn browser_record_demo_runtime_result(
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (onDone, onError) => {
  #|   try {
  #|     let runtimeRequest = globalThis.__moonapLastRuntimeRequest;
  #|     if (!runtimeRequest || typeof runtimeRequest !== "object") {
  #|       runtimeRequest = globalThis.__moonapLastSkillRuntimeRequest;
  #|     }
  #|     if (!runtimeRequest || typeof runtimeRequest !== "object") {
  #|       throw new Error("No runtime request is available yet.");
  #|     }
  #|     let requestId = String(runtimeRequest.request_id || "");
  #|     if (!requestId && globalThis.__moonapLastSkillRuntimeRequest && typeof globalThis.__moonapLastSkillRuntimeRequest === "object") {
  #|       runtimeRequest = globalThis.__moonapLastSkillRuntimeRequest;
  #|       requestId = String(runtimeRequest.request_id || "");
  #|     }
  #|     if (!requestId) {
  #|       requestId = `browser-rerun-${Date.now()}`;
  #|       runtimeRequest = Object.assign({}, runtimeRequest, { request_id: requestId });
  #|       globalThis.__moonapLastRuntimeRequest = runtimeRequest;
  #|     }
  #|     const sourceUrl = String(runtimeRequest.source_url || "");
  #|     const wasmUrl = String(runtimeRequest.wasm_url || "");
  #|     const taskKind = String(runtimeRequest.task_kind || "");
  #|     const runtimeSpec = runtimeRequest?.runtime_spec && typeof runtimeRequest.runtime_spec === "object"
  #|       ? runtimeRequest.runtime_spec
  #|       : (runtimeRequest?.runtime_ui && typeof runtimeRequest.runtime_ui === "object" ? runtimeRequest.runtime_ui : {});
  #|     const runtimeMode = String(runtimeSpec?.mode || runtimeRequest.runtime_mode || "");
  #|     const resultMode = String(runtimeSpec?.result_mode || runtimeRequest.result_mode || "text");
  #|     const ioContract = runtimeSpec?.io_contract && typeof runtimeSpec.io_contract === "object"
  #|       ? runtimeSpec.io_contract
  #|       : {};
  #|     const runtimeFields = Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : [];
  #|     const runtimeInputs = {};
  #|     for (const field of runtimeFields) {
  #|       const name = String(field?.name || "");
  #|       if (!name) continue;
  #|       const type = String(field?.type || "text").toLowerCase();
  #|       const fallback = field?.default;
  #|       const node = document.querySelector(`#runtime-field-${name}`);
  #|       const raw = type === "bool" || type === "boolean" || type === "checkbox" ? (node?.checked ? "true" : "false") : node?.value;
  #|       const text = String(raw ?? fallback ?? "");
  #|       runtimeInputs[name] = type === "int"
  #|         ? Number.parseInt(text, 10)
  #|         : type === "float"
  #|           ? Number.parseFloat(text)
  #|           : (type === "bool" || type === "boolean" || type === "checkbox")
  #|             ? text === "true"
  #|             : text;
  #|     }
  #|     const chunkSize = Math.max(256 * 1024, Number(ioContract.chunk_size_bytes) || (4 * 1024 * 1024));
  #|     const emitProgress = (data) => {
  #|       try {
  #|         const payload = Object.assign({
  #|           uploaded_bytes: 0,
  #|           llm_receives_file_contents: false
  #|         }, data || {});
  #|         const text = JSON.stringify(payload, null, 2);
  #|         const stateNode = document.querySelector("#state");
  #|         if (stateNode) stateNode.textContent = text;
  #|         const panel = document.querySelector("#resultPanel");
  #|         panel?.classList.add("is-open");
  #|         const setText = (selector, value) => {
  #|           const node = document.querySelector(selector);
  #|           if (node) node.textContent = String(value);
  #|         };
  #|         const formatBytes = (value) => {
  #|           const n = Number(value || 0);
  #|           if (n >= 1073741824) return `${(n / 1073741824).toFixed(2)} GB`;
  #|           if (n >= 1048576) return `${(n / 1048576).toFixed(2)} MB`;
  #|           if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  #|           return `${n} B`;
  #|         };
  #|         const fill = document.querySelector("#progressFill");
  #|         const progress = Math.max(0, Math.min(100, Number(payload.progress_percent ?? 0)));
  #|         if (fill) fill.style.width = `${progress}%`;
  #|         globalThis.__moonapLargeFileProgressRuntime?.update?.(payload);
  #|         setText("#resultStatus", payload.status || "running");
  #|         setText("#resultTitle",
  #|           String(payload.result_kind || "") === "streamed-file"
  #|             ? "Browser-local large-file generation"
  #|             : "Browser-local large-file analysis"
  #|         );
  #|         setText("#metricFile", payload.file_name || payload.download_name || "-");
  #|         setText("#metricProcessed", formatBytes(payload.bytes_processed ?? payload.file_size_bytes ?? 0));
  #|         setText("#metricReads", payload.reads_seen ?? payload.line_count ?? payload.chunk_count ?? 0);
  #|         setText("#metricTarget", payload.matching_line_count ?? payload.bytes_written ?? 0);
  #|         setText("#metricBases", payload.total_bases ?? payload.total_characters ?? payload.summary ?? "0");
  #|         setText("#metricUploaded", formatBytes(payload.uploaded_bytes ?? 0));
  #|       } catch {}
  #|     };
  #|     const runLargeFileAnalysisPayload = async () => {
  #|       const file = document.querySelector("#fileInput")?.files?.[0];
  #|       if (!file) {
  #|         throw new Error("Choose a local file first. MoonAP large-file analysis runs browser-locally in chunks.");
  #|       }
  #|       const analysisType = String(runtimeSpec?.analysis_type || runtimeSpec?.tool_kind || "").toLowerCase();
  #|       if (analysisType === "csv-summary") {
  #|         const delimiter = String(runtimeSpec?.delimiter || "").toLowerCase() === "tab" || file.name.toLowerCase().endsWith(".tsv") ? "\t" : ",";
  #|         const text = await file.text();
  #|         const rows = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.trim() !== "");
  #|         const parseRow = (line) => {
  #|           const cells = [];
  #|           let current = "";
  #|           let quoted = false;
  #|           for (let i = 0; i < line.length; i += 1) {
  #|             const ch = line[i];
  #|             if (ch === '"' && quoted && line[i + 1] === '"') { current += '"'; i += 1; }
  #|             else if (ch === '"') quoted = !quoted;
  #|             else if (ch === delimiter && !quoted) { cells.push(current); current = ""; }
  #|             else current += ch;
  #|           }
  #|           cells.push(current);
  #|           return cells.map((cell) => String(cell || "").trim());
  #|         };
  #|         const header = rows.length > 0 ? parseRow(rows[0]) : [];
  #|         const dataRows = rows.slice(1).map(parseRow);
  #|         const columnCount = header.length || Math.max(0, ...dataRows.map((row) => row.length));
  #|         const columnNames = Array.from({ length: columnCount }, (_unused, index) => header[index] || `column_${index + 1}`);
  #|         const missingCounts = Array.from({ length: columnCount }, () => 0);
  #|         const numeric = Array.from({ length: columnCount }, () => ({ count: 0, sum: 0, min: Infinity, max: -Infinity }));
  #|         for (const row of dataRows) {
  #|           for (let i = 0; i < columnCount; i += 1) {
  #|             const value = String(row[i] ?? "").trim();
  #|             if (value === "") missingCounts[i] += 1;
  #|             const numberValue = Number(value);
  #|             if (value !== "" && Number.isFinite(numberValue)) {
  #|               numeric[i].count += 1;
  #|               numeric[i].sum += numberValue;
  #|               numeric[i].min = Math.min(numeric[i].min, numberValue);
  #|               numeric[i].max = Math.max(numeric[i].max, numberValue);
  #|             }
  #|           }
  #|         }
  #|         const numericLines = numeric.map((stat, index) => {
  #|           if (stat.count === 0) return "";
  #|           return `${columnNames[index]}: count=${stat.count}, min=${stat.min}, max=${stat.max}, mean=${(stat.sum / stat.count).toFixed(4)}`;
  #|         }).filter(Boolean);
  #|         const reportText = [
  #|           "MoonAP CSV Summary",
  #|           `request_id: ${requestId}`,
  #|           `file_name: ${file.name}`,
  #|           `file_size_bytes: ${file.size}`,
  #|           `row_count: ${dataRows.length}`,
  #|           `column_count: ${columnCount}`,
  #|           `columns: ${columnNames.join(", ")}`,
  #|           `missing_values: ${missingCounts.map((count, index) => `${columnNames[index]}=${count}`).join(", ")}`,
  #|           "",
  #|           "Numeric columns:",
  #|           ...(numericLines.length === 0 ? ["(none detected)"] : numericLines)
  #|         ].join("\n");
  #|         return {
  #|           run_id: String(runtimeRequest.run_id || ""),
  #|           request_id: requestId,
  #|           status: "runtime-succeeded",
  #|           result_kind: "csv-summary-report",
  #|           runtime_inputs: runtimeInputs,
  #|           summary: `Analyzed ${dataRows.length} CSV row(s) across ${columnCount} column(s).`,
  #|           display_text: reportText,
  #|           stdout_text: `Browser-local CSV summary completed for ${requestId}.`,
  #|           download_name: "moonap-csv-summary.txt",
  #|           download_content: reportText,
  #|           file_name: file.name,
  #|           file_size_bytes: file.size,
  #|           llm_receives_file_contents: false,
  #|           accepted_for_skill: false
  #|         };
  #|       }
  #|       const searchText = String(runtimeInputs.search_text || "");
  #|       const maxPreviewLines = Math.max(0, Math.min(20, Number(runtimeInputs.max_preview_lines) || 3));
  #|       let offset = 0;
  #|       let carry = "";
  #|       let lineCount = 0;
  #|       let matchingLineCount = 0;
  #|       let totalCharacters = 0;
  #|       let chunkCount = 0;
  #|       const previewLines = [];
  #|       const started = performance.now();
  #|       while (offset < file.size) {
  #|         const end = Math.min(offset + chunkSize, file.size);
  #|         const text = await file.slice(offset, end).text();
  #|         const merged = carry + text;
  #|         const hasFinalNewline = merged.endsWith("\n") || merged.endsWith("\r");
  #|         const lines = merged.split(/\r?\n/);
  #|         carry = hasFinalNewline ? "" : String(lines.pop() || "");
  #|         for (const line of lines) {
  #|           lineCount += 1;
  #|           totalCharacters += line.length;
  #|           if (searchText !== "" && line.includes(searchText)) matchingLineCount += 1;
  #|           if (previewLines.length < maxPreviewLines) previewLines.push(line.slice(0, 240));
  #|         }
  #|         offset = end;
  #|         chunkCount += 1;
  #|         emitProgress({
  #|           status: "streaming-read",
  #|           result_kind: "large-file-report",
  #|           file_name: file.name,
  #|           file_size_bytes: file.size,
  #|           chunk_size_bytes: chunkSize,
  #|           chunk_count: chunkCount,
  #|           bytes_processed: offset,
  #|           progress_percent: file.size === 0 ? 100 : Math.floor((offset / file.size) * 100),
  #|           line_count: lineCount,
  #|           matching_line_count: matchingLineCount,
  #|           total_characters: totalCharacters
  #|         });
  #|         await new Promise((resolve) => setTimeout(resolve, 0));
  #|       }
  #|       if (carry !== "") {
  #|         lineCount += 1;
  #|         totalCharacters += carry.length;
  #|         if (searchText !== "" && carry.includes(searchText)) matchingLineCount += 1;
  #|         if (previewLines.length < maxPreviewLines) previewLines.push(carry.slice(0, 240));
  #|       }
  #|       const elapsedMs = Math.round(performance.now() - started);
  #|       const summary = searchText === ""
  #|         ? `Streamed ${file.name} locally in ${chunkCount} chunk(s).`
  #|         : `Streamed ${file.name} locally and counted lines containing "${searchText}".`;
  #|       const reportText = [
  #|         "MoonAP Large File Analysis",
  #|         `request_id: ${requestId}`,
  #|         `file_name: ${file.name}`,
  #|         `file_size_bytes: ${file.size}`,
  #|         `chunk_size_bytes: ${chunkSize}`,
  #|         `chunk_count: ${chunkCount}`,
  #|         `line_count: ${lineCount}`,
  #|         `matching_line_count: ${matchingLineCount}`,
  #|         `total_characters: ${totalCharacters}`,
  #|         `elapsed_ms: ${elapsedMs}`,
  #|         `search_text: ${searchText === "" ? "(none)" : searchText}`,
  #|         "",
  #|         "Preview lines:",
  #|         ...(previewLines.length === 0 ? ["(none captured)"] : previewLines)
  #|       ].join("\n");
  #|       return {
  #|         run_id: String(runtimeRequest.run_id || ""),
  #|         request_id: requestId,
  #|         status: "runtime-succeeded",
  #|         result_kind: "large-file-report",
  #|         runtime_inputs: runtimeInputs,
  #|         summary,
  #|         display_text: reportText,
  #|         stdout_text: `Browser-local chunked analysis completed for ${requestId}.`,
  #|         download_name: "moonap-large-file-analysis.txt",
  #|         download_content: reportText,
  #|         file_name: file.name,
  #|         file_size_bytes: file.size,
  #|         bytes_processed: file.size,
  #|         chunk_size_bytes: chunkSize,
  #|         chunk_count: chunkCount,
  #|         line_count: lineCount,
  #|         matching_line_count: matchingLineCount,
  #|         total_characters: totalCharacters,
  #|         progress_percent: 100,
  #|         llm_receives_file_contents: false,
  #|         accepted_for_skill: false
  #|       };
  #|     };
  #|     const runLargeFastqAnalysisPayload = async () => {
  #|       const file = document.querySelector("#fileInput")?.files?.[0];
  #|       if (!file) {
  #|         throw new Error("Choose a local FastQ file first. MoonAP large FastQ analysis runs browser-locally in chunks.");
  #|       }
  #|       const parsedPreviewReads = Number(runtimeInputs.max_preview_reads);
  #|       const maxPreviewReads = Math.max(0, Math.min(20, Number.isFinite(parsedPreviewReads) ? parsedPreviewReads : 3));
  #|       const validateStructure = !["false", "0", "no", "off"].includes(String(runtimeInputs.validate_fastq_structure || "true").trim().toLowerCase());
  #|       const countBases = !["false", "0", "no", "off"].includes(String(runtimeInputs.count_bases || "true").trim().toLowerCase());
  #|       let offset = 0;
  #|       let carry = "";
  #|       let chunkCount = 0;
  #|       let lineCount = 0;
  #|       let readCount = 0;
  #|       let totalBases = 0;
  #|       let aCount = 0;
  #|       let cCount = 0;
  #|       let gCount = 0;
  #|       let tCount = 0;
  #|       let nCount = 0;
  #|       let otherBaseCount = 0;
  #|       let minReadLength = null;
  #|       let maxReadLength = 0;
  #|       let malformedRecordCount = 0;
  #|       const previewReads = [];
  #|       const recordLines = [];
  #|       const countSequence = (sequence) => {
  #|         const length = sequence.length;
  #|         totalBases += length;
  #|         minReadLength = minReadLength == null ? length : Math.min(minReadLength, length);
  #|         maxReadLength = Math.max(maxReadLength, length);
  #|         if (!countBases) return;
  #|         for (let i = 0; i < sequence.length; i += 1) {
  #|           const ch = sequence[i].toUpperCase();
  #|           if (ch === "A") aCount += 1;
  #|           else if (ch === "C") cCount += 1;
  #|           else if (ch === "G") gCount += 1;
  #|           else if (ch === "T") tCount += 1;
  #|           else if (ch === "N") nCount += 1;
  #|           else otherBaseCount += 1;
  #|         }
  #|       };
  #|       const consumeRecord = (header, sequence, plus, quality) => {
  #|         const malformed = validateStructure && (!String(header || "").startsWith("@") || String(plus || "") !== "+" || String(sequence || "").length !== String(quality || "").length);
  #|         if (malformed) malformedRecordCount += 1;
  #|         readCount += 1;
  #|         countSequence(String(sequence || ""));
  #|         if (previewReads.length < maxPreviewReads) {
  #|           previewReads.push(`${header}\n${String(sequence || "").slice(0, 240)}\n${plus}\n${String(quality || "").slice(0, 240)}`);
  #|         }
  #|       };
  #|       const consumeLine = (line) => {
  #|         lineCount += 1;
  #|         recordLines.push(String(line || ""));
  #|         if (recordLines.length === 4) {
  #|           consumeRecord(recordLines[0], recordLines[1], recordLines[2], recordLines[3]);
  #|           recordLines.length = 0;
  #|         }
  #|       };
  #|       const started = performance.now();
  #|       while (offset < file.size) {
  #|         const end = Math.min(offset + chunkSize, file.size);
  #|         const text = await file.slice(offset, end).text();
  #|         const merged = carry + text;
  #|         const hasFinalNewline = merged.endsWith("\n") || merged.endsWith("\r");
  #|         const lines = merged.split(/\r?\n/);
  #|         carry = hasFinalNewline ? "" : String(lines.pop() || "");
  #|         if (hasFinalNewline && lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  #|         for (const line of lines) {
  #|           consumeLine(line);
  #|         }
  #|         offset = end;
  #|         chunkCount += 1;
  #|         emitProgress({
  #|           status: "streaming-fastq-analysis",
  #|           result_kind: "large-fastq-report",
  #|           file_name: file.name,
  #|           file_size_bytes: file.size,
  #|           chunk_size_bytes: chunkSize,
  #|           chunk_count: chunkCount,
  #|           bytes_processed: offset,
  #|           progress_percent: file.size === 0 ? 100 : Math.floor((offset / file.size) * 100),
  #|           line_count: lineCount,
  #|           reads_seen: readCount,
  #|           total_bases: totalBases,
  #|           total_characters: totalBases,
  #|           matching_line_count: nCount,
  #|           llm_receives_file_contents: false
  #|         });
  #|         await new Promise((resolve) => setTimeout(resolve, 0));
  #|       }
  #|       if (carry !== "") consumeLine(carry);
  #|       if (recordLines.length > 0) malformedRecordCount += 1;
  #|       const elapsedMs = Math.round(performance.now() - started);
  #|       const avgReadLength = readCount === 0 ? 0 : totalBases / readCount;
  #|       const reportText = [
  #|         "MoonAP Large FastQ Analysis",
  #|         `request_id: ${requestId}`,
  #|         `file_name: ${file.name}`,
  #|         `file_size_bytes: ${file.size}`,
  #|         `chunk_size_bytes: ${chunkSize}`,
  #|         `chunk_count: ${chunkCount}`,
  #|         `total_lines: ${lineCount}`,
  #|         `estimated_read_count: ${readCount}`,
  #|         `total_bases: ${totalBases}`,
  #|         `A_count: ${aCount}`,
  #|         `C_count: ${cCount}`,
  #|         `G_count: ${gCount}`,
  #|         `T_count: ${tCount}`,
  #|         `N_count: ${nCount}`,
  #|         `other_base_count: ${otherBaseCount}`,
  #|         `min_read_length: ${minReadLength == null ? 0 : minReadLength}`,
  #|         `max_read_length: ${maxReadLength}`,
  #|         `average_read_length: ${avgReadLength.toFixed(2)}`,
  #|         `malformed_record_count: ${malformedRecordCount}`,
  #|         `elapsed_ms: ${elapsedMs}`,
  #|         "",
  #|         "Preview reads:",
  #|         ...(previewReads.length === 0 ? ["(none captured)"] : previewReads)
  #|       ].join("\n");
  #|       return {
  #|         run_id: String(runtimeRequest.run_id || ""),
  #|         request_id: requestId,
  #|         status: "runtime-succeeded",
  #|         result_kind: "large-fastq-report",
  #|         runtime_inputs: runtimeInputs,
  #|         summary: `Analyzed ${file.name} locally: ${readCount} FastQ reads, ${totalBases} bases.`,
  #|         display_text: reportText,
  #|         stdout_text: `Browser-local FastQ analysis completed for ${requestId}.`,
  #|         download_name: "moonap-large-fastq-analysis.txt",
  #|         download_content: reportText,
  #|         file_name: file.name,
  #|         file_size_bytes: file.size,
  #|         bytes_processed: file.size,
  #|         chunk_size_bytes: chunkSize,
  #|         chunk_count: chunkCount,
  #|         line_count: lineCount,
  #|         reads_seen: readCount,
  #|         estimated_read_count: readCount,
  #|         total_bases: totalBases,
  #|         A_count: aCount,
  #|         C_count: cCount,
  #|         G_count: gCount,
  #|         T_count: tCount,
  #|         N_count: nCount,
  #|         other_base_count: otherBaseCount,
  #|         min_read_length: minReadLength == null ? 0 : minReadLength,
  #|         max_read_length: maxReadLength,
  #|         average_read_length: Number(avgReadLength.toFixed(2)),
  #|         total_characters: totalBases,
  #|         matching_line_count: nCount,
  #|         malformed_record_count: malformedRecordCount,
  #|         preview_reads: previewReads,
  #|         progress_percent: 100,
  #|         llm_receives_file_contents: false,
  #|         accepted_for_skill: false
  #|       };
  #|     };
  #|     const runLargeFileGenerationPayload = async () => {
  #|       if (typeof window.showSaveFilePicker !== "function") {
  #|         throw new Error("This browser does not support streamed save-file output yet.");
  #|       }
  #|       const encoder = new TextEncoder();
  #|       const outputNameRaw = String(runtimeInputs.output_name || "moonap-output.fastq").trim() || "moonap-output.fastq";
  #|       const fileNameRuntime = globalThis.__moonapFileNameRuntime;
  #|       let outputName = fileNameRuntime?.sanitize(outputNameRaw, "moonap-output.fastq") || "moonap-output.fastq";
  #|       const targetSizeMb = Math.max(1, Math.min(1024, Number(runtimeInputs.target_size_mb) || 128));
  #|       const targetBytes = targetSizeMb * 1024 * 1024;
  #|       const readLength = Math.max(20, Math.min(20000, Number(runtimeInputs.read_length ?? runtimeInputs.line_length) || 150));
  #|       const headerPrefixRaw = runtimeInputs.read_header_prefix || runtimeInputs.header_prefix || "moonap_read";
  #|       const headerPrefix = fileNameRuntime?.sanitizeToken(headerPrefixRaw, "moonap_read") || "moonap_read";
  #|       const nRate = Math.max(0, Math.min(1, Number(runtimeInputs.n_rate) || 0.01));
  #|       const qualityChar = String(runtimeInputs.quality_char || "I").slice(0, 1) || "I";
  #|       let seed = Math.max(0, Math.floor(Number(runtimeInputs.random_seed) || 42)) >>> 0;
  #|       const bases = ["A", "C", "G", "T"];
  #|       const rand = () => {
  #|         seed = (seed * 1664525 + 1013904223) >>> 0;
  #|         return seed / 4294967296;
  #|       };
  #|       const selectedOutput = globalThis.__moonapRuntimeOutputFile;
  #|       if (!selectedOutput || String(selectedOutput.request_id || "") !== requestId || !selectedOutput.handle) {
  #|         throw new Error("Choose an output file before running. MoonAP streams generated files to that browser file handle.");
  #|       }
  #|       const fileHandle = selectedOutput.handle;
  #|       outputName = String(fileHandle?.name || selectedOutput.name || outputName);
  #|       const writable = await fileHandle.createWritable();
  #|       let bytesWritten = 0;
  #|       let readIndex = 0;
  #|       let chunkCount = 0;
  #|       const started = performance.now();
  #|       const materializeRecord = (index) => {
  #|         let seq = "";
  #|         for (let i = 0; i < readLength; i += 1) {
  #|           seq += rand() < nRate ? "N" : bases[Math.floor(rand() * bases.length)];
  #|         }
  #|         return `@${headerPrefix}_${index}\n${seq}\n+\n${qualityChar.repeat(readLength)}\n`;
  #|       };
  #|       while (bytesWritten < targetBytes) {
  #|         const records = [];
  #|         let chunkBytes = 0;
  #|         while (chunkBytes < chunkSize && bytesWritten + chunkBytes < targetBytes) {
  #|           const record = materializeRecord(readIndex);
  #|           const bytes = encoder.encode(record);
  #|           const remaining = targetBytes - bytesWritten - chunkBytes;
  #|           if (bytes.length > remaining) {
  #|             break;
  #|           }
  #|           records.push(record);
  #|           chunkBytes += bytes.length;
  #|           readIndex += 1;
  #|         }
  #|         if (records.length === 0) break;
  #|         const chunkText = records.join("");
  #|         await writable.write(chunkText);
  #|         bytesWritten += encoder.encode(chunkText).length;
  #|         chunkCount += 1;
  #|         emitProgress({
  #|           status: "streaming-write",
  #|           result_kind: "streamed-file",
  #|           file_name: outputName,
  #|           chunk_size_bytes: chunkSize,
  #|           chunk_count: chunkCount,
  #|           bytes_written: bytesWritten,
  #|           bytes_processed: bytesWritten,
  #|           target_bytes: targetBytes,
  #|           progress_percent: targetBytes === 0 ? 100 : Math.floor((bytesWritten / targetBytes) * 100),
  #|           total_characters: bytesWritten,
  #|           reads_seen: readIndex
  #|         });
  #|         await new Promise((resolve) => setTimeout(resolve, 0));
  #|       }
  #|       await writable.close();
  #|       const elapsedMs = Math.round(performance.now() - started);
  #|       const displayText = [
  #|         "MoonAP Large File Generation",
  #|         `request_id: ${requestId}`,
  #|         `output_name: ${outputName}`,
  #|         `target_size_mb: ${targetSizeMb}`,
  #|         `bytes_written: ${bytesWritten}`,
  #|         `chunk_size_bytes: ${chunkSize}`,
  #|         `chunk_count: ${chunkCount}`,
  #|         `elapsed_ms: ${elapsedMs}`,
  #|         `fastq_reads_written: ${readIndex}`,
  #|         `read_length: ${readLength}`,
  #|         `read_header_prefix: ${headerPrefix}`,
  #|         `n_rate: ${nRate}`,
  #|         `quality_char: ${qualityChar}`
  #|       ].join("\n");
  #|       return {
  #|         run_id: String(runtimeRequest.run_id || ""),
  #|         request_id: requestId,
  #|         status: "runtime-succeeded",
  #|         result_kind: "streamed-file",
  #|         runtime_inputs: runtimeInputs,
  #|         summary: `Generated ${outputName} locally with browser streaming output (${readIndex} FastQ reads).`,
  #|         display_text: displayText,
  #|         stdout_text: `Browser-local streamed generation completed for ${requestId}.`,
  #|         download_name: "",
  #|         download_content: "",
  #|         file_name: outputName,
  #|         bytes_written: bytesWritten,
  #|         bytes_processed: bytesWritten,
  #|         reads_seen: readIndex,
  #|         chunk_size_bytes: chunkSize,
  #|         chunk_count: chunkCount,
  #|         progress_percent: 100,
  #|         llm_receives_file_contents: false,
  #|         accepted_for_skill: false
  #|       };
  #|     };
  #|     const buildFastqPayload = () => {
  #|       const readCount = Math.max(1, Math.min(1000000, Number(runtimeInputs.read_count) || 10000));
  #|       const readLength = Math.max(1, Math.min(10000, Number(runtimeInputs.read_length) || 150));
  #|       const nRate = Math.max(0, Math.min(1, Number(runtimeInputs.n_rate) || 0.01));
  #|       const originalSeed = Number(runtimeInputs.random_seed) || 42;
  #|       let seed = originalSeed;
  #|       const bases = ["A", "C", "G", "T"];
  #|       const rand = () => {
  #|         seed = (seed * 1664525 + 1013904223) >>> 0;
  #|         return seed / 4294967296;
  #|       };
  #|       const chunks = [];
  #|       let nCount = 0;
  #|       let totalBases = 0;
  #|       for (let read = 0; read < readCount; read += 1) {
  #|         let seq = "";
  #|         for (let i = 0; i < readLength; i += 1) {
  #|           totalBases += 1;
  #|           if (rand() < nRate) {
  #|             seq += "N";
  #|             nCount += 1;
  #|           } else {
  #|             seq += bases[Math.floor(rand() * bases.length)];
  #|           }
  #|         }
  #|         chunks.push(`@moonap_${read}\n${seq}\n+\n${"I".repeat(readLength)}\n`);
  #|       }
  #|       const blob = new Blob(chunks, { type: "text/plain;charset=utf-8" });
  #|       const url = URL.createObjectURL(blob);
  #|       const link = document.createElement("a");
  #|       link.href = url;
  #|       link.download = "moonap-demo.fastq";
  #|       document.body.append(link);
  #|       link.click();
  #|       link.remove();
  #|       setTimeout(() => URL.revokeObjectURL(url), 1000);
  #|       return {
  #|         run_id: String(runtimeRequest.run_id || ""),
  #|         request_id: requestId,
  #|         status: "runtime-succeeded",
  #|         result_kind: "fastq-file",
  #|         runtime_inputs: runtimeInputs,
  #|         summary: `Generated moonap-demo.fastq with ${readCount} reads of length ${readLength}.`,
  #|         display_text: `FastQ file generated and downloaded in the browser.\nread_count=${readCount}\nread_length=${readLength}\nn_rate=${nRate}\nrandom_seed=${originalSeed}\nexpected_n_count=${nCount}\ntotal_bases=${totalBases}`,
  #|         stdout_text: `Browser-local FastQ generation completed for ${requestId}.`,
  #|         download_name: "",
  #|         download_content: "",
  #|         accepted_for_skill: false
  #|       };
  #|     };
  #|     const buildGenericPayload = (summary, displayText, resultKind = "text") => {
  #|       return {
  #|         run_id: String(runtimeRequest.run_id || ""),
  #|         request_id: requestId,
  #|         status: "runtime-succeeded",
  #|         result_kind: resultKind,
  #|         runtime_inputs: runtimeInputs,
  #|         summary,
  #|         display_text: displayText,
  #|         stdout_text: `Browser-local runtime step completed for ${requestId}.`,
  #|         download_name: "runtime-preview.txt",
  #|         download_content: `MoonAP runtime result\nrequest_id: ${requestId}\ntask_kind: ${taskKind}\nsource_url: ${sourceUrl}\nwasm_url: ${wasmUrl}\n`,
  #|         accepted_for_skill: false
  #|       };
  #|     };
  #|     const buildGenericFormPayload = () => {
  #|       const inputLines = Object.entries(runtimeInputs).map(([key, value]) => `${key}: ${String(value)}`);
  #|       const toolKind = String(runtimeSpec?.tool_kind || runtimeSpec?.analysis_type || "").toLowerCase();
  #|       const renderTemplate = (template, values) => String(template || "").replace(/\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g, (_match, name) => {
  #|         const value = values[name];
  #|         return value === undefined || value === null ? "" : String(value);
  #|       });
  #|       const evaluateExpression = (expression, values) => {
  #|         const expr = String(expression || "").trim();
  #|         if (!expr) throw new Error("Computed output is missing an expression.");
  #|         if (!/^[A-Za-z0-9_+\-*/().,\s]+$/.test(expr)) {
  #|           throw new Error(`Unsupported characters in expression: ${expr}`);
  #|         }
  #|         const numericExpr = expr.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (name) => {
  #|           if (name === "pow") return "Math.pow";
  #|           if (name === "sqrt") return "Math.sqrt";
  #|           if (name === "abs") return "Math.abs";
  #|           if (name === "min") return "Math.min";
  #|           if (name === "max") return "Math.max";
  #|           if (!Object.prototype.hasOwnProperty.call(values, name)) {
  #|             throw new Error(`Unknown input in expression: ${name}`);
  #|           }
  #|           const n = Number(values[name]);
  #|           if (!Number.isFinite(n)) throw new Error(`Input ${name} is not numeric.`);
  #|           return `(${String(n)})`;
  #|         });
  #|         if (!/^[0-9eE+\-*/().,\sMathpowsqrtabsminax]+$/.test(numericExpr)) {
  #|           throw new Error(`Expression did not reduce to arithmetic: ${expr}`);
  #|         }
  #|         const result = Function(`"use strict"; return (${numericExpr});`)();
  #|         if (!Number.isFinite(Number(result))) {
  #|           throw new Error(`Expression produced a non-finite result: ${expr}`);
  #|         }
  #|         return Number(result);
  #|       };
  #|       if (toolKind === "text-analysis") {
  #|         const text = String(runtimeInputs.input_text || runtimeInputs.text || "");
  #|         const characters = text.length;
  #|         const charactersNoSpaces = text.replace(/\s/g, "").length;
  #|         const words = (text.trim().match(/\S+/g) || []).length;
  #|         const lines = text === "" ? 0 : text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").length;
  #|         const readingMinutes = words / 200;
  #|         const displayText = [
  #|           `Characters: ${characters}`,
  #|           `Characters without spaces: ${charactersNoSpaces}`,
  #|           `Words: ${words}`,
  #|           `Lines: ${lines}`,
  #|           `Estimated reading time: ${readingMinutes.toFixed(2)} minutes`
  #|         ].join("\n");
  #|         return buildGenericPayload(`Analyzed ${words} word(s), ${characters} character(s), and ${lines} line(s).`, displayText);
  #|       }
  #|       if (toolKind === "json-formatter") {
  #|         const raw = String(runtimeInputs.json_text || runtimeInputs.input_text || "");
  #|         try {
  #|           const parsed = JSON.parse(raw);
  #|           const formatted = JSON.stringify(parsed, null, 2);
  #|           return buildGenericPayload("JSON is valid and formatted.", `Valid JSON: true\n\n${formatted}`, "text");
  #|         } catch (error) {
  #|           return buildGenericPayload("JSON is invalid.", `Valid JSON: false\nError: ${error instanceof Error ? error.message : String(error)}`, "text");
  #|         }
  #|       }
  #|       const computedOutputs = Array.isArray(runtimeSpec.computed_outputs)
  #|         ? runtimeSpec.computed_outputs
  #|         : (Array.isArray(runtimeSpec.outputs) ? runtimeSpec.outputs : []);
  #|       if (computedOutputs.length > 0) {
  #|         const values = { ...runtimeInputs };
  #|         for (const output of computedOutputs) {
  #|           const name = String(output?.name || "").trim();
  #|           if (!name) continue;
  #|           const rawValue = evaluateExpression(output?.expression, values);
  #|           const decimals = Number.isFinite(Number(output?.decimals)) ? Math.max(0, Math.min(12, Number(output.decimals))) : null;
  #|           const value = decimals === null ? rawValue : Number(rawValue.toFixed(decimals));
  #|           values[name] = value;
  #|         }
  #|         const outputLines = computedOutputs.map((output) => {
  #|           const name = String(output?.name || "").trim();
  #|           if (!name) return "";
  #|           const label = String(output?.label || name);
  #|           return `${label}: ${String(values[name])}`;
  #|         }).filter(Boolean);
  #|         const displayText = runtimeSpec.result_template
  #|           ? renderTemplate(runtimeSpec.result_template, values)
  #|           : [...inputLines, ...outputLines].join("\n");
  #|         const summaryText = runtimeSpec.summary_template
  #|           ? renderTemplate(runtimeSpec.summary_template, values)
  #|           : (outputLines[0] || "MoonAP calculated the form result.");
  #|         return buildGenericPayload(summaryText, displayText);
  #|       }
  #|       if (Object.prototype.hasOwnProperty.call(runtimeInputs, "celsius")) {
  #|         const celsius = Number(runtimeInputs.celsius);
  #|         const fahrenheit = celsius * 9 / 5 + 32;
  #|         return buildGenericPayload(
  #|           `Converted ${celsius} Celsius to ${fahrenheit.toFixed(2)} Fahrenheit.`,
  #|           `Celsius: ${celsius}\nFahrenheit: ${fahrenheit.toFixed(2)}`
  #|         );
  #|       }
  #|       if (Object.prototype.hasOwnProperty.call(runtimeInputs, "number_a") && Object.prototype.hasOwnProperty.call(runtimeInputs, "number_b")) {
  #|         const a = Number(runtimeInputs.number_a);
  #|         const b = Number(runtimeInputs.number_b);
  #|         const sum = a + b;
  #|         return buildGenericPayload(
  #|           `Calculated ${a} + ${b} = ${sum}.`,
  #|           `First number: ${a}\nSecond number: ${b}\nSum: ${sum}`
  #|         );
  #|       }
  #|       return buildGenericPayload(
  #|         "MoonAP recorded browser-local form input for the compiled wasm artifact.",
  #|         inputLines.length === 0
  #|           ? `Demo runtime result recorded for ${requestId}. Source URL: ${sourceUrl || "n/a"}. wasm URL: ${wasmUrl || "n/a"}.`
  #|           : `Runtime inputs:\n${inputLines.join("\n")}\n\nSource URL: ${sourceUrl || "n/a"}\nwasm URL: ${wasmUrl || "n/a"}`
  #|       );
  #|     };
  #|     let payload;
  #|     if (taskKind === "large-fastq-analysis" || String(runtimeSpec.domain_profile || "").toLowerCase() === "fastq") {
  #|       payload = await runLargeFastqAnalysisPayload();
  #|     } else if (String(ioContract.host_capability || "") === "csv-summary" || String(runtimeSpec?.analysis_type || "").toLowerCase() === "csv-summary") {
  #|       payload = await runLargeFileAnalysisPayload();
  #|     } else if (String(ioContract.host_capability || "") === "chunked-local-analysis" || taskKind === "large-file-analysis") {
  #|       payload = await runLargeFileAnalysisPayload();
  #|     } else if (String(ioContract.host_capability || "") === "streamed-local-generation" || taskKind === "large-file-generation") {
  #|       payload = await runLargeFileGenerationPayload();
  #|     } else if (taskKind === "fastq-generator") {
  #|       payload = buildFastqPayload();
  #|     } else if (taskKind === "excel-generator") {
  #|       payload = buildGenericPayload(
  #|         "MoonAP prepared an Excel-like generator runtime step. Download-oriented browser generation is the next task-specific executor to implement.",
  #|         `Task kind: ${taskKind}\nruntime_mode: ${runtimeMode}\nThe runtime form has been rendered from runtime_spec. A dedicated Excel generator executor is still pending.`
  #|       );
  #|     } else if (taskKind === "fastq-analysis" || taskKind === "finance-report-analysis") {
  #|       payload = buildGenericPayload(
  #|         "MoonAP prepared an analysis runtime step. File-input analysis executor is still pending.",
  #|         `Task kind: ${taskKind}\nruntime_mode: ${runtimeMode}\nThe browser can now distinguish file-analysis tasks, but the task-specific analysis executor is still pending.`,
  #|         "report"
  #|       );
  #|     } else if (taskKind === "browser-game") {
  #|       payload = buildGenericPayload(
  #|         "MoonAP prepared an interactive game runtime step. Interactive host execution is still pending.",
  #|         `Task kind: ${taskKind}\nruntime_mode: ${runtimeMode}\nThe browser can now distinguish interactive tasks, but the task-specific game host is still pending.`,
  #|         "interactive-view"
  #|       );
  #|     } else {
  #|       payload = buildGenericFormPayload();
  #|     }
  #|     if (String(payload?.result_kind || "").includes("report") || resultMode === "report") {
  #|       globalThis.__moonapLastRuntimeReportPayload = payload;
  #|     }
  #|     const response = await fetch("/api/task/execute", {
  #|       method: "POST",
  #|       headers: { "Content-Type": "application/json; charset=utf-8" },
  #|       body: JSON.stringify(payload)
  #|     });
  #|     const text = await response.text();
  #|     if (!response.ok) throw new Error(text || `Runtime execute failed (${response.status})`);
  #|     if (payload && (taskKind === "large-file-analysis" || taskKind === "large-fastq-analysis" || taskKind === "large-file-generation")) {
  #|       globalThis.__moonapLargeFileProgressRuntime?.update?.({ ...payload, progress_percent: 100, status: "runtime-succeeded" });
  #|     }
  #|     onDone(String(text));
  #|   } catch (error) {
  #|     try {
  #|       const runtimeRequest = globalThis.__moonapLastRuntimeRequest || {};
  #|       const runtimeSpec = runtimeRequest?.runtime_spec && typeof runtimeRequest.runtime_spec === "object"
  #|         ? runtimeRequest.runtime_spec
  #|         : (runtimeRequest?.runtime_ui && typeof runtimeRequest.runtime_ui === "object" ? runtimeRequest.runtime_ui : {});
  #|       const ioContract = runtimeSpec?.io_contract && typeof runtimeSpec.io_contract === "object" ? runtimeSpec.io_contract : {};
  #|       const taskKind = String(runtimeRequest?.task_kind || "");
  #|       const hostCapability = String(ioContract.host_capability || "");
  #|       const isLargeRuntime = taskKind === "large-file-generation" || taskKind === "large-file-analysis" || taskKind === "large-fastq-analysis" || hostCapability === "streamed-local-generation" || hostCapability === "chunked-local-analysis";
  #|       if (isLargeRuntime) globalThis.__moonapLargeFileProgressRuntime?.error?.(error instanceof Error ? error.message : String(error));
  #|     } catch {}
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_register_runtime_ready(
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (onDone, onError) => {
  #|   try {
  #|     const artifact = globalThis.__moonapLastArtifact;
  #|     const compileReport = globalThis.__moonapLastCompileReport;
  #|     const source = String(artifact?.moonbit_source || "");
  #|     if (!source.trim()) throw new Error("No captured MoonBit source is available for runtime registration.");
  #|     if (!compileReport || typeof compileReport !== "object" || compileReport.ok !== true) {
  #|       throw new Error("MoonAP runtime registration requires a successful compile report.");
  #|     }
  #|     const requestStage = artifact?.moonap_adaptation_used
  #|       ? "moonap-adaptation"
  #|       : artifact?.quality_assessment_used
  #|         ? "quality-repair"
  #|         : artifact?.compile_summary_used
  #|           ? "compile-repair"
  #|           : "browser-direct";
  #|     const envelope = [
  #|       `TASK_TITLE\t${String(artifact?.name || "MoonBit task")}`,
  #|       `ORIGINAL_PROMPT\t${String(artifact?.prompt || "")}`,
  #|       `LLM_PROVIDER\t${String(artifact?.llm_provider || "")}`,
  #|       `LLM_MODEL\t${String(artifact?.llm_model || "")}`,
  #|       `REQUEST_STAGE\t${String(requestStage)}`,
  #|       `COMPILE_OK\t${String(Boolean(compileReport.ok))}`,
  #|       `WASM_PATH\t${String(compileReport.wasm_path || "")}`,
  #|       "SOURCE_BEGIN",
  #|       source,
  #|       "SOURCE_END",
  #|       "COMPILE_REPORT_BEGIN",
  #|       JSON.stringify(compileReport, null, 2),
  #|       "COMPILE_REPORT_END",
  #|       "RAW_RESPONSE_BEGIN",
  #|       String(artifact?.llm_response_preview || ""),
  #|       "RAW_RESPONSE_END"
  #|     ].join("\n");
  #|     fetch("/api/logs/moonap-runtime.log", {
  #|       method: "POST",
  #|       headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|       body: JSON.stringify({
  #|         ts: new Date().toISOString(),
  #|         kind: "runtime-exec",
  #|         label: "runtime-request-register-attempt",
  #|         text: String(artifact?.prompt || "")
  #|       }) + "\n",
  #|       keepalive: true
  #|     }).catch(() => {});
  #|     const response = await fetch("/api/runtime-exec/register-ready", {
  #|       method: "POST",
  #|       headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|       body: envelope
  #|     });
  #|     const text = await response.text();
  #|     if (!response.ok) throw new Error(text || `Runtime registration failed (${response.status})`);
  #|     fetch("/api/logs/moonap-runtime.log", {
  #|       method: "POST",
  #|       headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|       body: JSON.stringify({
  #|         ts: new Date().toISOString(),
  #|         kind: "runtime-exec",
  #|         label: "runtime-request-register-succeeded",
  #|         text: String(text || "")
  #|       }) + "\n",
  #|       keepalive: true
  #|     }).catch(() => {});
  #|     onDone(String(text));
  #|   } catch (error) {
  #|     fetch("/api/logs/moonap-runtime.log", {
  #|       method: "POST",
  #|       headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|       body: JSON.stringify({
  #|         ts: new Date().toISOString(),
  #|         kind: "runtime-exec",
  #|         label: "runtime-request-register-failed",
  #|         text: String(error instanceof Error ? error.message : String(error))
  #|       }) + "\n",
  #|       keepalive: true
  #|     }).catch(() => {});
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_store_compile_report(raw : String) -> Unit =
  #| (raw) => {
  #|   try {
  #|     globalThis.__moonapLastCompileReport = JSON.parse(String(raw));
  #|   } catch {
  #|     globalThis.__moonapLastCompileReport = String(raw);
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_reset_compile_report() -> Unit =
  #| () => {
  #|   globalThis.__moonapLastCompileReport = null;
  #| }

///|
#cfg(target="js")
extern "js" fn browser_assess_last_benchmark() -> String =
  #| () => {
  #|   const artifact = globalThis.__moonapLastArtifact;
  #|   const source = String(artifact?.moonbit_source || "");
  #|   const name = String(artifact?.name || "");
  #|   const prompt = String(artifact?.prompt || "");
  #|   const combined = `${name}\n${prompt}`;
  #|   const lowerCombined = combined.toLowerCase();
  #|   const levelMatch = combined.match(/Benchmark Level\s+([1-5])/i);
  #|   const level = levelMatch ? Number(levelMatch[1]) : 0;
  #|   const fnNames = Array.from(source.matchAll(/\bfn\s+([A-Za-z_][A-Za-z0-9_]*)/g)).map((item) => String(item[1] || ""));
  #|   const helperNames = fnNames.filter((item) => item !== "main");
  #|   const lower = source.toLowerCase();
  #|   const hasImport = /\bimport\b/.test(lower);
  #|   const hasHelloMoonbit = /hello moonbit/.test(lower);
  #|   const hasABC = /abc/.test(source);
  #|   const hasControlFlow = /\bif\b|\bmatch\b|\bfor\b|\bwhile\b/.test(source);
  #|   const hasRandomness = /\brandom\b|\bseed\b|\blcg\b|\brand_/.test(lower);
  #|   const hasMain = /\bfn\s+main\b/.test(source);
  #|   const isFastqMoonbitTask = lowerCombined.includes("fastq") && lowerCombined.includes("moonbit") && (lowerCombined.includes("generator") || lowerCombined.includes("synthetic read"));
  #|   const hasFastqHeader = source.includes("@SEQ") || source.includes("@moonap") || source.includes("\"@\"");
  #|   const hasFastqPlus = source.includes("\\n+\\n") || source.includes("\"+\"") || source.includes("+\\n");
  #|   const hasQuality = source.includes("IIII") || source.includes("qual");
  #|   const hasSequenceLogic = /A|C|G|T|N/.test(source) && (hasControlFlow || helperNames.length > 0);
  #|   const missingSignals = [];
  #|   const preserveConstraints = ["keep the original task goal", "keep the source import-free when possible", "return only cmd/main/main.mbt", "preserve wasm-gc compatibility"];
  #|   const result = {
  #|     applicable: level > 0 || isFastqMoonbitTask,
  #|     assessment_kind: "system-assessment",
  #|     task_kind: level > 0 ? `benchmark-l${level}` : (isFastqMoonbitTask ? "fastq-generator" : "general-moonbit"),
  #|     level: level,
  #|     pass: false,
  #|     title: "Compile probe succeeded",
  #|     summary: "MoonAP used the native MoonBit toolchain on this machine and produced a real wasm-gc artifact. Browser-local runtime execution is the next implementation step.",
  #|     meta_json: JSON.stringify(["compile probe ok", "real wasm built", "runtime pending"]),
  #|     missing_signals_json: "[]",
  #|     preserve_constraints_json: JSON.stringify(preserveConstraints),
  #|     repair_hint: "Keep the task intent intact while improving the machine-checkable task structure."
  #|   };
  #|   if (level === 1) {
  #|     if (!hasMain) missingSignals.push("define exactly one fn main");
  #|     if (hasImport) missingSignals.push("remove import usage");
  #|     if (!hasHelloMoonbit) missingSignals.push("return text containing hello moonbit");
  #|     if (helperNames.length !== 0) missingSignals.push("avoid helper functions for Benchmark L1");
  #|     const pass = hasMain && !hasImport && hasHelloMoonbit && helperNames.length === 0;
  #|     result.pass = pass;
  #|     result.title = pass ? "Benchmark L1 passed" : "Compile succeeded, but Benchmark L1 failed";
  #|     result.summary = pass
  #|       ? "Compile succeeded and the generated MoonBit source matches the Level 1 checks: one main function, no imports, no helper functions, and hello moonbit is returned."
  #|       : "Compile succeeded, but the generated source does not fully match Level 1. MoonAP expected one main function, no imports, no helpers, and a return value containing hello moonbit.";
  #|     result.meta_json = JSON.stringify(pass
  #|       ? ["benchmark l1", "compile ok", "quality pass"]
  #|       : ["benchmark l1", "compile ok", "quality failed"]);
  #|     result.repair_hint = "Benchmark L1 should be a single-file MoonBit program with one main function, no imports, no helpers, and a return value that visibly contains hello moonbit.";
  #|   } else if (level === 2) {
  #|     const helper = helperNames.length === 1 ? helperNames[0] : "";
  #|     const mainCallsHelper = helper !== "" && source.includes(`${helper}(`);
  #|     if (!hasMain) missingSignals.push("define fn main");
  #|     if (hasImport) missingSignals.push("remove import usage");
  #|     if (!hasHelloMoonbit) missingSignals.push("return text containing hello moonbit");
  #|     if (helperNames.length !== 1) missingSignals.push("define exactly one helper function");
  #|     if (!mainCallsHelper) missingSignals.push("have main call the helper function");
  #|     const pass = hasMain && !hasImport && hasHelloMoonbit && helperNames.length === 1 && mainCallsHelper;
  #|     result.pass = pass;
  #|     result.title = pass ? "Benchmark L2 passed" : "Compile succeeded, but Benchmark L2 failed";
  #|     result.summary = pass
  #|       ? "Compile succeeded and the generated MoonBit source matches the Level 2 checks: exactly one helper function returns hello moonbit and main calls that helper."
  #|       : "Compile succeeded, but the generated source does not fully match Level 2. MoonAP expected exactly one helper function, no imports, hello moonbit, and main calling the helper.";
  #|     result.meta_json = JSON.stringify(pass
  #|       ? ["benchmark l2", "compile ok", "quality pass"]
  #|       : ["benchmark l2", "compile ok", "quality failed"]);
  #|     result.repair_hint = "Benchmark L2 should keep one helper function that produces hello moonbit, with main delegating to that helper and no imports.";
  #|   } else if (level === 3) {
  #|     if (!hasMain) missingSignals.push("define fn main");
  #|     if (hasImport) missingSignals.push("remove import usage");
  #|     if (!hasABC) missingSignals.push("return text containing ABC");
  #|     if (!hasControlFlow) missingSignals.push("include simple control flow");
  #|     if (hasRandomness) missingSignals.push("remove randomness");
  #|     const pass = hasMain && !hasImport && hasABC && hasControlFlow && !hasRandomness;
  #|     result.pass = pass;
  #|     result.title = pass ? "Benchmark L3 passed" : "Compile succeeded, but Benchmark L3 failed";
  #|     result.summary = pass
  #|       ? "Compile succeeded and the generated MoonBit source matches the Level 3 checks: main returns ABC, uses simple control flow, and avoids imports or randomness."
  #|       : "Compile succeeded, but the generated source does not fully match Level 3. MoonAP expected main to return ABC using simple control flow, with no imports or randomness.";
  #|     result.meta_json = JSON.stringify(pass
  #|       ? ["benchmark l3", "compile ok", "quality pass"]
  #|       : ["benchmark l3", "compile ok", "quality failed"]);
  #|     result.repair_hint = "Benchmark L3 should visibly implement ABC with deterministic control flow and no imports or randomness.";
  #|   } else if (isFastqMoonbitTask) {
  #|     if (!hasMain) missingSignals.push("define fn main");
  #|     if (hasImport) missingSignals.push("remove import usage");
  #|     if (!hasFastqHeader) missingSignals.push("emit a visible FastQ header such as @SEQ or @moonap");
  #|     if (!hasFastqPlus) missingSignals.push("emit a plus line between sequence and quality");
  #|     if (!hasQuality) missingSignals.push("generate an explicit quality string such as IIII or qual");
  #|     if (!hasSequenceLogic) missingSignals.push("include visible sequence-generation logic over A/C/G/T/N");
  #|     const pass = hasMain && !hasImport && hasFastqHeader && hasFastqPlus && hasQuality && hasSequenceLogic;
  #|     result.pass = pass;
  #|     result.title = pass ? "FastQ Generator task passed" : "Compile succeeded, but FastQ Generator task failed";
  #|     result.summary = pass
  #|       ? "Compile succeeded and the generated MoonBit source shows the expected FastQ structure: a header, sequence logic, plus line, and quality generation without imports."
  #|       : "Compile succeeded, but the generated MoonBit source does not yet look like a usable FastQ generator. MoonAP expected visible FastQ structure, sequence-generation logic, and a quality line without imports.";
  #|     result.meta_json = JSON.stringify(pass
  #|       ? ["fastq generator", "compile ok", "quality pass"]
  #|       : ["fastq generator", "compile ok", "quality failed"]);
  #|     result.repair_hint = "Keep the program compiling, but make the MoonBit source visibly look like a FastQ generator with header, sequence, plus line, and quality generation.";
  #|   }
  #|   result.missing_signals_json = JSON.stringify(missingSignals);
  #|   return JSON.stringify(result);
  #| }

///|
#cfg(target="js")
extern "js" fn browser_set_benchmark_assessment(raw : String) -> Unit =
  #| (raw) => {
  #|   globalThis.__moonapBenchmarkAssessment = String(raw || "");
  #| }

///|
#cfg(target="js")
extern "js" fn browser_repair_last_artifact_with_system_assessment(
  knowledge_pack : String,
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (knowledgePack, onDone, onError) => {
  #|   try {
  #|     const artifact = globalThis.__moonapLastArtifact;
  #|     const source = String(artifact?.moonbit_source || "");
  #|     if (!source.trim()) throw new Error("No captured MoonBit source is available for quality repair.");
  #|     let assessment = {};
  #|     try {
  #|       assessment = JSON.parse(String(globalThis.__moonapBenchmarkAssessment || "{}"));
  #|     } catch {
  #|       assessment = {};
  #|     }
  #|     if (!assessment || typeof assessment !== "object") throw new Error("No system assessment is available yet.");
  #|     const readRouter = () => {
  #|       try {
  #|         const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
  #|         return parsed && typeof parsed === "object" ? parsed : {};
  #|       } catch {
  #|         return {};
  #|       }
  #|     };
  #|     const saved = readRouter();
  #|     const providers = Array.isArray(saved.providers) ? saved.providers.filter((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed") : [];
  #|     if (providers.length === 0) throw new Error("No enabled LLM provider is available in the router.");
  #|     const cursor = Number.isFinite(saved.cursor) ? saved.cursor : 0;
  #|     const start = ((cursor % providers.length) + providers.length) % providers.length;
  #|     const ordered = providers.slice(start).concat(providers.slice(0, start));
  #|     const proxyPost = async (url, headers, body) => {
  #|       const envelope = [
  #|         `URL\t${String(url)}`,
  #|         ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
  #|         "BODY",
  #|         String(body)
  #|       ].join("\n");
  #|       const response = await fetch("/api/llm/proxy", {
  #|         method: "POST",
  #|         headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|         body: envelope
  #|       });
  #|       const text = await response.text();
  #|       let json = {};
  #|       try {
  #|         json = JSON.parse(text);
  #|       } catch {
  #|         const plain = String(text || "")
  #|           .replace(/<script[\s\S]*?<\/script>/gi, " ")
  #|           .replace(/<style[\s\S]*?<\/style>/gi, " ")
  #|           .replace(/<[^>]+>/g, " ")
  #|           .replace(/\s+/g, " ")
  #|           .trim();
  #|         const summarized = plain || `MoonAP proxy returned non-JSON (${response.status})`;
  #|         throw new Error(`Provider returned non-JSON (${response.status}): ${summarized.slice(0, 240)}`);
  #|       }
  #|       if (!response.ok) {
  #|         const detail = json?.error?.detail ? ` ${String(json.error.detail)}` : "";
  #|         throw new Error((json?.error?.message || `LLM request failed (${response.status})`) + detail);
  #|       }
  #|       return json;
  #|     };
  #|     const updatePrompts = (modeText, systemPromptText, userPromptText) => {
  #|       const setText = (selector, value) => {
  #|         const node = document.querySelector(selector);
  #|         if (node) node.textContent = String(value);
  #|       };
  #|       setText("#promptMode", modeText || "No LLM prompt captured yet.");
  #|       setText("#promptSystem", systemPromptText || "No LLM prompt captured yet.");
  #|       setText("#promptUser", userPromptText || "No LLM prompt captured yet.");
  #|     };
  #|     let missingSignals = [];
  #|     let preserveConstraints = [];
  #|     try { missingSignals = JSON.parse(String(assessment?.missing_signals_json || "[]")); } catch {}
  #|     try { preserveConstraints = JSON.parse(String(assessment?.preserve_constraints_json || "[]")); } catch {}
  #|     const originalTask = String(artifact?.prompt || "Generate MoonBit code for the requested task.");
  #|     const buildQualityRepairPrompts = (llm) => {
  #|       const systemPrompt = [
  #|         "You are an AI coder.",
  #|         "You only write MoonBit code.",
  #|         "Your job is to improve MoonBit code for the user's task after compile already succeeded.",
  #|         "Return only the full contents of cmd/main/main.mbt."
  #|       ].join("\\n");
  #|       const userPrompt = [
  #|         `Original task: ${originalTask}`,
  #|         "",
  #|         "System assessment:",
  #|         `- task_kind: ${String(assessment?.task_kind || "general-moonbit")}`,
  #|         `- title: ${String(assessment?.title || "System assessment failed")}`,
  #|         `- summary: ${String(assessment?.summary || "")}`,
  #|         `- repair_hint: ${String(assessment?.repair_hint || "")}`,
  #|         "",
  #|         "Missing signals:",
  #|         ...(Array.isArray(missingSignals) && missingSignals.length > 0 ? missingSignals.map((item) => `- ${String(item)}`) : ["- none listed; improve conservatively"]),
  #|         "",
  #|         "Constraints to preserve:",
  #|         ...(Array.isArray(preserveConstraints) && preserveConstraints.length > 0 ? preserveConstraints.map((item) => `- ${String(item)}`) : ["- preserve the original task goal", "- keep wasm-gc compatibility"]),
  #|         "",
  #|         "Current source:",
  #|         source,
  #|         "",
  #|         "Revise the source so it still compiles and better satisfies the system assessment.",
  #|         "Return the full corrected cmd/main/main.mbt file and nothing else."
  #|       ].join("\\n");
  #|       return {
  #|         modeText: "quality-repair / frontier-direct",
  #|         systemPrompt,
  #|         userPrompt
  #|       };
  #|     };
  #|     const requestJson = async (llm) => {
  #|       const promptPack = buildQualityRepairPrompts(llm);
  #|       const systemPrompt = promptPack.systemPrompt;
  #|       const userPrompt = promptPack.userPrompt;
  #|       updatePrompts(promptPack.modeText, systemPrompt, userPrompt);
  #|       if (llm.provider === "gemini") {
  #|         const url = `${llm.baseUrl}/v1beta/models/${encodeURIComponent(llm.model)}:generateContent`;
  #|         const json = await proxyPost(url, {
  #|           "Content-Type": "application/json",
  #|           "x-goog-api-key": String(llm.apiKey || "")
  #|         }, JSON.stringify({
  #|           system_instruction: { parts: [{ text: systemPrompt }] },
  #|           contents: [{ role: "user", parts: [{ text: userPrompt }] }],
  #|           generationConfig: { temperature: 0.1 }
  #|         }));
  #|         const text = (json?.candidates?.[0]?.content?.parts || []).map((part) => String(part?.text || "")).join("\\n").trim();
  #|         if (!text) throw new Error("Gemini returned no revised MoonBit source.");
  #|         return { source: text, raw: json };
  #|       }
  #|       const rawBaseUrl = String(llm.baseUrl || "").trim();
  #|       const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  #|       let url = `${baseUrl}/chat/completions`;
  #|       if (llm.provider === "zai") {
  #|         if (baseUrl.endsWith("/chat/completions")) {
  #|           url = baseUrl;
  #|         } else if (baseUrl === "https://open.bigmodel.cn" || baseUrl === "https://open.bigmodel.cn/") {
  #|           url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
  #|         } else if (!baseUrl.includes("/api/paas/v4")) {
  #|           url = `${baseUrl}/api/paas/v4/chat/completions`;
  #|         }
  #|       }
  #|       const headers = {
  #|         "Content-Type": "application/json",
  #|         "Authorization": `Bearer ${String(llm.apiKey || "")}`
  #|       };
  #|       if (llm.provider === "openrouter") {
  #|         headers["HTTP-Referer"] = "http://127.0.0.1:3000";
  #|         headers["X-Title"] = "MoonAP";
  #|       }
  #|       const json = await proxyPost(url, headers, JSON.stringify({
  #|         model: llm.model,
  #|         messages: [
  #|           { role: "system", content: systemPrompt },
  #|           { role: "user", content: userPrompt }
  #|         ],
  #|         temperature: 0.1
  #|       }));
  #|       const text = String(json?.choices?.[0]?.message?.content || "").trim();
  #|       if (!text) throw new Error(`${llm.provider} returned no revised MoonBit source.`);
  #|       return { source: text, raw: json };
  #|     };
  #|     let repaired = null;
  #|     let selected = null;
  #|     const failures = [];
  #|     for (let index = 0; index < ordered.length; index += 1) {
  #|       const item = ordered[index];
  #|       const llm = {
  #|         provider: item.key,
  #|         model: item.model,
  #|         baseUrl: item.baseUrl,
  #|         apiKey: item.apiKey,
  #|         rotated: providers.length > 1
  #|       };
  #|       try {
  #|         repaired = await requestJson(llm);
  #|         selected = llm;
  #|         const nextCursor = (start + index + 1) % providers.length;
  #|         localStorage.setItem("moonap.llm.router.v1", JSON.stringify({
  #|           providers: Array.isArray(saved.providers) ? saved.providers : providers,
  #|           cursor: nextCursor,
  #|           savedAt: saved.savedAt || new Date().toISOString()
  #|         }));
  #|         break;
  #|       } catch (error) {
  #|         failures.push(`${String(item.key || "provider")}/${String(item.model || "model")}: ${error instanceof Error ? error.message : String(error)}`);
  #|       }
  #|     }
  #|     if (!repaired || !selected) {
  #|       throw new Error(`All enabled providers failed during quality repair. ${failures.join(" | ")}`);
  #|     }
  #|     const cleaned = browser_extract_moonbit_source(String(repaired.source || ""));
  #|     const nextArtifact = {
  #|       ...(artifact || {}),
  #|       moonbit_source: cleaned,
  #|       llm_provider: selected.provider || "unknown",
  #|       llm_model: selected.model || "unknown",
  #|       llm_rotated: Boolean(selected.rotated),
  #|       repair_round: Number(artifact?.repair_round || 0) + 1,
  #|       quality_assessment_used: {
  #|         task_kind: String(assessment?.task_kind || ""),
  #|         title: String(assessment?.title || ""),
  #|         repair_hint: String(assessment?.repair_hint || ""),
  #|         missing_signals_json: String(assessment?.missing_signals_json || "[]")
  #|       },
  #|       llm_response_preview: JSON.stringify(repaired.raw).slice(0, 1200),
  #|       created_at: new Date().toISOString()
  #|     };
  #|     globalThis.__moonapLastArtifact = nextArtifact;
  #|     onDone(JSON.stringify(nextArtifact, null, 2));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_next_benchmark_level() -> Int =
  #| () => {
  #|   try {
  #|     const parsed = JSON.parse(globalThis.__moonapBenchmarkAssessment || "{}");
  #|     const level = Number(parsed?.level || 0);
  #|     const pass = Boolean(parsed?.pass);
  #|     if (pass && level >= 1 && level < 3) return level + 1;
  #|   } catch {}
  #|   return 1;
  #| }

///|
#cfg(target="js")
extern "js" fn browser_last_artifact_repair_round() -> Int =
  #| () => Number(globalThis.__moonapLastArtifact?.repair_round || 0)

///|
#cfg(target="js")
extern "js" fn browser_compile_last_artifact(
  formal_verification : Bool,
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (formalVerification, onDone, onError) => {
  #|   try {
  #|     const artifact = globalThis.__moonapLastArtifact;
  #|     const source = String(artifact?.moonbit_source || "");
  #|     if (!source.trim()) {
  #|       throw new Error("No captured MoonBit source is available for compile probe.");
  #|     }
  #|     const url = formalVerification ? "/api/artifact/compile?formal=1" : "/api/artifact/compile";
  #|     const response = await fetch(url, {
  #|       method: "POST",
  #|       headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|       body: source
  #|     });
  #|     const text = await response.text();
  #|     if (!response.ok) throw new Error(text || `Compile probe failed (${response.status})`);
  #|     onDone(String(text));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_should_adapt_last_artifact_for_large_file_runtime() -> Bool =
  #| () => {
  #|   const artifact = globalThis.__moonapLastArtifact;
  #|   if (!artifact || typeof artifact !== "object") return false;
  #|   if (artifact.moonap_adaptation_used) return false;
  #|   const source = String(artifact?.moonbit_source || "");
  #|   if (!source.trim()) return false;
  #|   const text = `${String(artifact?.prompt || "")}\n${source}`.toLowerCase();
  #|   const wantsLarge = text.includes("large file") || text.includes("large-file") || text.includes("1gb") || text.includes("streamed") || text.includes("streaming") || text.includes("chunk");
  #|   const wantsGeneration = text.includes("generate") || text.includes("generator") || text.includes("output") || text.includes("write") || text.includes("writing") || text.includes("save");
  #|   const wantsAnalysis = text.includes("analy") || text.includes("count") || text.includes("scan") || text.includes("parse") || text.includes("report");
  #|   return wantsLarge && (wantsGeneration || wantsAnalysis);
  #| }

///|
#cfg(target="js")
extern "js" fn browser_adapt_last_artifact_for_large_file_runtime(
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (onDone, onError) => {
  #|   try {
  #|     const artifact = globalThis.__moonapLastArtifact;
  #|     const source = String(artifact?.moonbit_source || "");
  #|     if (!source.trim()) throw new Error("No compiled MoonBit source is available for MoonAP runtime adaptation.");
  #|     if (artifact?.moonap_adaptation_used) throw new Error("MoonAP runtime adaptation has already been applied.");
  #|     const prompt = String(artifact?.prompt || "");
  #|     const lower = `${prompt}\n${source}`.toLowerCase();
  #|     const wantsGeneration = lower.includes("generate") || lower.includes("generator") || lower.includes("output") || lower.includes("write") || lower.includes("writing") || lower.includes("save");
  #|     const adapterKind = wantsGeneration ? "large-file-generation" : "large-file-analysis";
  #|     const saved = (() => {
  #|       try {
  #|         const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
  #|         return parsed && typeof parsed === "object" ? parsed : {};
  #|       } catch {
  #|         return {};
  #|       }
  #|     })();
  #|     const providers = Array.isArray(saved.providers)
  #|       ? saved.providers.filter((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed")
  #|       : [];
  #|     if (providers.length === 0) throw new Error("No enabled LLM provider is available for MoonAP runtime adaptation.");
  #|     const cursor = Number.isFinite(saved.cursor) ? saved.cursor : 0;
  #|     const start = ((cursor % providers.length) + providers.length) % providers.length;
  #|     const ordered = providers.slice(start).concat(providers.slice(0, start));
  #|     const setText = (selector, value) => {
  #|       const node = document.querySelector(selector);
  #|       if (node) node.textContent = String(value || "");
  #|     };
  #|     const extractSource = typeof globalThis.__moonapExtractMoonBitSource === "function"
  #|       ? globalThis.__moonapExtractMoonBitSource
  #|       : (value) => String(value || "");
  #|     const systemPrompt = [
  #|       "You are an AI coder.",
  #|       "You only write MoonBit code.",
  #|       "Adapt already-compiling MoonBit business code to the MoonAP large-file runtime contract.",
  #|       "Return only the full contents of cmd/main/main.mbt."
  #|     ].join("\n");
  #|     const generationContract = [
  #|       "Required adapter functions:",
  #|       "- fn moonap_runtime_spec() -> String",
  #|       "- fn moonap_preview(params_json : String) -> String",
  #|       "- fn moonap_generate_chunk(params_json : String, start_index : Int, max_bytes : Int) -> String",
  #|       "",
  #|       "moonap_runtime_spec() returns JSON text with profile_id=large-file-generation.",
  #|       "Use platform fields output_name, target_size_mb, chunk_size_bytes.",
  #|       "Add app fields useful for the business logic, such as read_length, header_prefix, line_template, random_seed, n_rate, or quality_char.",
  #|       "moonap_generate_chunk should return a chunk of generated text using start_index as the record or line index."
  #|     ].join("\n");
  #|     const analysisContract = [
  #|       "Required adapter functions:",
  #|       "- fn moonap_runtime_spec() -> String",
  #|       "- fn moonap_init(params_json : String) -> String",
  #|       "- fn moonap_analyze_chunk(state_json : String, chunk_text : String) -> String",
  #|       "- fn moonap_finish(state_json : String) -> String",
  #|       "",
  #|       "moonap_runtime_spec() returns JSON text with profile_id=large-file-analysis.",
  #|       "Use platform fields input_file, chunk_size_bytes, max_preview_lines.",
  #|       "Add app fields useful for the business logic, such as search_text, min_quality, target_base, or count options."
  #|     ].join("\n");
  #|     const userPrompt = [
  #|       "Original user task:",
  #|       prompt,
  #|       "",
  #|       "MoonAP adaptation target:",
  #|       adapterKind,
  #|       "",
  #|       "Keep existing business functions. Do not rewrite from scratch. Do not use imports. Keep the adapted file compilable.",
  #|       adapterKind === "large-file-generation" ? generationContract : analysisContract,
  #|       "",
  #|       "Already compiling MoonBit source:",
  #|       "```moonbit",
  #|       source,
  #|       "```"
  #|     ].join("\n");
  #|     setText("#promptMode", "moonap-adaptation / frontier-direct");
  #|     setText("#promptSystem", systemPrompt);
  #|     setText("#promptUser", userPrompt);
  #|     const proxyPost = async (url, headers, body) => {
  #|       const envelope = [
  #|         `URL\t${String(url)}`,
  #|         ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
  #|         "BODY",
  #|         String(body)
  #|       ].join("\n");
  #|       const response = await fetch("/api/llm/proxy", {
  #|         method: "POST",
  #|         headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|         body: envelope
  #|       });
  #|       const text = await response.text();
  #|       let json = {};
  #|       try {
  #|         json = JSON.parse(text);
  #|       } catch {
  #|         throw new Error(`Provider returned non-JSON (${response.status}): ${String(text || "").slice(0, 240)}`);
  #|       }
  #|       if (!response.ok) throw new Error(`Provider/proxy error (${response.status}): ${JSON.stringify(json).slice(0, 500)}`);
  #|       return json;
  #|     };
  #|     const requestJson = async (item) => {
  #|       if (String(item.key || "") === "gemini") throw new Error("Gemini adaptation path is not enabled in the minimal implementation yet.");
  #|       const rawBaseUrl = String(item.baseUrl || "").trim();
  #|       const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  #|       let url = `${baseUrl}/chat/completions`;
  #|       if (String(item.key || "") === "zai") {
  #|         if (baseUrl.endsWith("/chat/completions")) {
  #|           url = baseUrl;
  #|         } else if (baseUrl === "https://open.bigmodel.cn" || baseUrl === "https://open.bigmodel.cn/") {
  #|           url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
  #|         } else if (!baseUrl.includes("/api/paas/v4")) {
  #|           url = `${baseUrl}/api/paas/v4/chat/completions`;
  #|         }
  #|       }
  #|       const headers = {
  #|         "Content-Type": "application/json",
  #|         "Authorization": `Bearer ${String(item.apiKey || "")}`
  #|       };
  #|       if (String(item.key || "") === "openrouter") {
  #|         headers["HTTP-Referer"] = "http://127.0.0.1:3000";
  #|         headers["X-Title"] = "MoonAP";
  #|       }
  #|       return await proxyPost(url, headers, JSON.stringify({
  #|         model: item.model,
  #|         messages: [
  #|           { role: "system", content: systemPrompt },
  #|           { role: "user", content: userPrompt }
  #|         ],
  #|         temperature: 0.1
  #|       }));
  #|     };
  #|     let adapted = null;
  #|     let selected = null;
  #|     const failures = [];
  #|     for (let index = 0; index < ordered.length; index += 1) {
  #|       const item = ordered[index];
  #|       try {
  #|         const json = await requestJson(item);
  #|         const text = String(json?.choices?.[0]?.message?.content || "").trim();
  #|         if (!text) throw new Error(`${String(item.key || "provider")} returned no adapted MoonBit source.`);
  #|         adapted = { source: text, raw: json };
  #|         selected = item;
  #|         const nextCursor = (start + index + 1) % providers.length;
  #|         localStorage.setItem("moonap.llm.router.v1", JSON.stringify({
  #|           providers: Array.isArray(saved.providers) ? saved.providers : providers,
  #|           cursor: nextCursor,
  #|           savedAt: saved.savedAt || new Date().toISOString()
  #|         }));
  #|         break;
  #|       } catch (error) {
  #|         failures.push(`${String(item.key || "provider")}/${String(item.model || "model")}: ${error instanceof Error ? error.message : String(error)}`);
  #|       }
  #|     }
  #|     if (!adapted || !selected) throw new Error(`All enabled providers failed during MoonAP runtime adaptation. ${failures.join(" | ")}`);
  #|     const cleaned = extractSource(String(adapted.source || ""));
  #|     const nextArtifact = {
  #|       ...(artifact || {}),
  #|       moonbit_source: cleaned,
  #|       llm_provider: String(selected.key || "unknown"),
  #|       llm_model: String(selected.model || "unknown"),
  #|       moonap_adaptation_used: {
  #|         adapter_kind: adapterKind,
  #|         provider: String(selected.key || "unknown"),
  #|         model: String(selected.model || "unknown")
  #|       },
  #|       llm_response_preview: JSON.stringify(adapted.raw).slice(0, 1200),
  #|       created_at: new Date().toISOString()
  #|     };
  #|     globalThis.__moonapLastArtifact = nextArtifact;
  #|     onDone(JSON.stringify(nextArtifact, null, 2));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_repair_last_artifact_with_compile_summary(
  formal_verification : Bool,
  knowledge_pack : String,
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (formalVerification, knowledgePack, onDone, onError) => {
  #|   try {
  #|     const artifact = globalThis.__moonapLastArtifact;
  #|     const report = globalThis.__moonapLastCompileReport;
  #|     const source = String(artifact?.moonbit_source || "");
  #|     if (!source.trim()) throw new Error("No captured MoonBit source is available for repair.");
  #|     if (!report || typeof report !== "object") throw new Error("No compile summary is available yet.");
  #|     const readRouter = () => {
  #|       try {
  #|         const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
  #|         return parsed && typeof parsed === "object" ? parsed : {};
  #|       } catch {
  #|         return {};
  #|       }
  #|     };
  #|     const saved = readRouter();
  #|     const providers = Array.isArray(saved.providers) ? saved.providers.filter((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed") : [];
  #|     const repairMode = localStorage.getItem("moonap.repairFeedbackMode") === "summary" ? "summary" : "raw";
  #|     if (providers.length === 0) throw new Error("No enabled LLM provider is available in the router.");
  #|     const cursor = Number.isFinite(saved.cursor) ? saved.cursor : 0;
  #|     const start = ((cursor % providers.length) + providers.length) % providers.length;
  #|     const ordered = providers.slice(start).concat(providers.slice(0, start));
  #|     const proxyPost = async (url, headers, body) => {
  #|       const envelope = [
  #|         `URL\t${String(url)}`,
  #|         ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
  #|         "BODY",
  #|         String(body)
  #|       ].join("\n");
  #|       const response = await fetch("/api/llm/proxy", {
  #|         method: "POST",
  #|         headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|         body: envelope
  #|       });
  #|       const text = await response.text();
  #|       let json = {};
  #|       try {
  #|         json = JSON.parse(text);
  #|       } catch {
  #|         const plain = String(text || "")
  #|           .replace(/<script[\s\S]*?<\/script>/gi, " ")
  #|           .replace(/<style[\s\S]*?<\/style>/gi, " ")
  #|           .replace(/<[^>]+>/g, " ")
  #|           .replace(/\s+/g, " ")
  #|           .trim();
  #|         const summarized = plain || `MoonAP proxy returned non-JSON (${response.status})`;
  #|         throw new Error(`Provider returned non-JSON (${response.status}): ${summarized.slice(0, 240)}`);
  #|       }
  #|       if (!response.ok) {
  #|         const detail = json?.error?.detail ? ` ${String(json.error.detail)}` : "";
  #|         throw new Error((json?.error?.message || `LLM request failed (${response.status})`) + detail);
  #|       }
  #|       return json;
  #|     };
  #|     const updatePrompts = (modeText, systemPromptText, userPromptText) => {
  #|       const setText = (selector, value) => {
  #|         const node = document.querySelector(selector);
  #|         if (node) node.textContent = String(value);
  #|       };
  #|       setText("#promptMode", modeText || "No LLM prompt captured yet.");
  #|       setText("#promptSystem", systemPromptText || "No LLM prompt captured yet.");
  #|       setText("#promptUser", userPromptText || "No LLM prompt captured yet.");
  #|     };
  #|     const originalTask = String(artifact?.prompt || "Generate a Personal FastQ Generator in MoonBit.");
  #|     const compilerExcerpt = String(repairMode === "raw" ? (report.output || report.trimmed_output || "") : (report.trimmed_output || report.output || "")).trim();
  #|     const priorConversation = Array.isArray(artifact?.conversation_history)
  #|       ? artifact.conversation_history
  #|           .filter((item) => item && (item.role === "user" || item.role === "assistant") && String(item.content || "").trim() !== "")
  #|           .map((item) => ({ role: String(item.role), content: String(item.content) }))
  #|       : [{ role: "user", content: originalTask }, { role: "assistant", content: source }];
  #|     const buildRepairPrompts = (llm) => {
  #|       const systemPrompt = [
  #|         "You are an AI coder.",
  #|         "You only write MoonBit code.",
  #|         "Your job is to repair MoonBit code for the user's task.",
  #|         "Return only the full contents of cmd/main/main.mbt."
  #|       ].join("\\n");
  #|       const repairUserPrompt = [
  #|         "The previous MoonBit file failed to compile under wasm-gc.",
  #|         "",
  #|         "Compiler error:",
  #|         compilerExcerpt,
  #|         "",
  #|         "Fix the file and return the full corrected cmd/main/main.mbt only."
  #|       ].join("\\n");
  #|       return {
  #|         modeText: "repair / frontier-conversation",
  #|         systemPrompt,
  #|         userPrompt: `${priorConversation.map((item) => `${String(item.role).toUpperCase()}:\n${String(item.content)}`).join("\\n\\n---\\n\\n")}\\n\\n---\\n\\nUSER:\\n${repairUserPrompt}`,
  #|         openaiMessages: [
  #|           { role: "system", content: systemPrompt },
  #|           ...priorConversation,
  #|           { role: "user", content: repairUserPrompt }
  #|         ],
  #|         geminiUserPrompt: `${priorConversation.map((item) => `${String(item.role).toUpperCase()}:\n${String(item.content)}`).join("\\n\\n---\\n\\n")}\\n\\n---\\n\\nUSER:\\n${repairUserPrompt}`
  #|       };
  #|     };
  #|     const requestJson = async (llm) => {
  #|       const promptPack = buildRepairPrompts(llm);
  #|       updatePrompts(promptPack.modeText, promptPack.systemPrompt, promptPack.userPrompt);
  #|       if (llm.provider === "gemini") {
  #|         const url = `${llm.baseUrl}/v1beta/models/${encodeURIComponent(llm.model)}:generateContent`;
  #|         const json = await proxyPost(url, {
  #|           "Content-Type": "application/json",
  #|           "x-goog-api-key": String(llm.apiKey || "")
  #|         }, JSON.stringify({
  #|           system_instruction: { parts: [{ text: promptPack.systemPrompt }] },
  #|           contents: [{ role: "user", parts: [{ text: promptPack.geminiUserPrompt }] }],
  #|           generationConfig: { temperature: 0.1 }
  #|         }));
  #|         const text = (json?.candidates?.[0]?.content?.parts || []).map((part) => String(part?.text || "")).join("\\n").trim();
  #|         if (!text) throw new Error("Gemini returned no repaired MoonBit source.");
  #|         return { source: text, raw: json };
  #|       }
  #|       const rawBaseUrl = String(llm.baseUrl || "").trim();
  #|       const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  #|       let url = `${baseUrl}/chat/completions`;
  #|       if (llm.provider === "zai") {
  #|         if (baseUrl.endsWith("/chat/completions")) {
  #|           url = baseUrl;
  #|         } else if (baseUrl === "https://open.bigmodel.cn" || baseUrl === "https://open.bigmodel.cn/") {
  #|           url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
  #|         } else if (!baseUrl.includes("/api/paas/v4")) {
  #|           url = `${baseUrl}/api/paas/v4/chat/completions`;
  #|         }
  #|       }
  #|       const headers = {
  #|         "Content-Type": "application/json",
  #|         "Authorization": `Bearer ${String(llm.apiKey || "")}`
  #|       };
  #|       if (llm.provider === "openrouter") {
  #|         headers["HTTP-Referer"] = "http://127.0.0.1:3000";
  #|         headers["X-Title"] = "MoonAP";
  #|       }
  #|       const json = await proxyPost(url, headers, JSON.stringify({
  #|         model: llm.model,
  #|         messages: promptPack.openaiMessages,
  #|         temperature: 0.1
  #|       }));
  #|       const text = String(json?.choices?.[0]?.message?.content || "").trim();
  #|       if (!text) throw new Error(`${llm.provider} returned no repaired MoonBit source.`);
  #|       return { source: text, raw: json };
  #|     };
  #|     let repaired = null;
  #|     let selected = null;
  #|     const failures = [];
  #|     for (let index = 0; index < ordered.length; index += 1) {
  #|       const item = ordered[index];
  #|       const llm = {
  #|         provider: item.key,
  #|         model: item.model,
  #|         baseUrl: item.baseUrl,
  #|         apiKey: item.apiKey,
  #|         rotated: providers.length > 1
  #|       };
  #|       try {
  #|         repaired = await requestJson(llm);
  #|         selected = llm;
  #|         const nextCursor = (start + index + 1) % providers.length;
  #|         localStorage.setItem("moonap.llm.router.v1", JSON.stringify({
  #|           providers: Array.isArray(saved.providers) ? saved.providers : providers,
  #|           cursor: nextCursor,
  #|           savedAt: saved.savedAt || new Date().toISOString()
  #|         }));
  #|         break;
  #|       } catch (error) {
  #|         failures.push(`${String(item.key || "provider")}/${String(item.model || "model")}: ${error instanceof Error ? error.message : String(error)}`);
  #|       }
  #|     }
  #|     if (!repaired || !selected) {
  #|       throw new Error(`All enabled providers failed during repair. ${failures.join(" | ")}`);
  #|     }
  #|     const ensureExtractMoonBitSource = () => {
  #|       if (typeof globalThis.__moonapExtractMoonBitSource === "function") return globalThis.__moonapExtractMoonBitSource;
  #|       globalThis.__moonapExtractMoonBitSource = (value) => {
  #|         const text = String(value || "").trim();
  #|         if (!text) return "";
  #|         const extract = (source, startMarker, endMarker) => {
  #|           const start = source.indexOf(startMarker);
  #|           if (start < 0) return "";
  #|           const after = source.slice(start + startMarker.length).trim();
  #|           if (!after) return "";
  #|           const end = after.indexOf(endMarker);
  #|           if (end < 0) return "";
  #|           return after.slice(0, end).trim();
  #|         };
  #|         const patterns = [
  #|           ["FILE: cmd/main/main.mbt", "END_FILE"],
  #|           ['<moonbit-file path="cmd/main/main.mbt">', "</moonbit-file>"],
  #|           ["```moonbit", "```"],
  #|           ["```mbt", "```"],
  #|           ["```", "```"]
  #|         ];
  #|         for (const [startMarker, endMarker] of patterns) {
  #|           const extracted = extract(text, startMarker, endMarker);
  #|           if (extracted) return extracted;
  #|         }
  #|         return text;
  #|       };
  #|       return globalThis.__moonapExtractMoonBitSource;
  #|     };
  #|     const cleaned = ensureExtractMoonBitSource()(String(repaired.source || ""));
  #|     const nextArtifact = {
  #|       ...(artifact || {}),
  #|       moonbit_source: cleaned,
  #|       conversation_history: [
  #|         ...priorConversation,
  #|         { role: "user", content: `Compiler error:\n${compilerExcerpt}` },
  #|         { role: "assistant", content: cleaned }
  #|       ],
  #|       llm_provider: selected.provider || "unknown",
  #|       llm_model: selected.model || "unknown",
  #|       llm_rotated: Boolean(selected.rotated),
  #|       repair_round: Number(artifact?.repair_round || 0) + 1,
  #|       compile_summary_used: {
  #|         summary_kind: String(report.summary_kind || ""),
  #|         primary_file: String(report.primary_file || ""),
  #|         primary_line: Number(report.primary_line || 0),
  #|         repair_hint: String(report.repair_hint || "")
  #|       },
  #|       llm_response_preview: JSON.stringify(repaired.raw).slice(0, 1200),
  #|       created_at: new Date().toISOString()
  #|     };
  #|     globalThis.__moonapLastArtifact = nextArtifact;
  #|     globalThis.__moonapLastCompileReport = null;
  #|     onDone(JSON.stringify(nextArtifact, null, 2));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_update_process(
  provider : String,
  stage : String,
  result : String,
  log_text : String,
  source_text : String,
) -> Unit =
  #| (provider, stage, result, logText, sourceText) => {
  #|   const setText = (selector, value) => {
  #|     const node = document.querySelector(selector);
  #|     if (node) node.textContent = String(value);
  #|   };
  #|   setText("#processProvider", provider || "-");
  #|   setText("#processStage", stage || "-");
  #|   setText("#processResult", result || "waiting");
  #|   setText("#processStatus", result || "waiting");
  #|   setText("#processLog", logText || "");
  #|   if (sourceText !== "") setText("#processSource", sourceText || "No generated source yet.");
  #|   const payload = JSON.stringify({
  #|     ts: new Date().toISOString(),
  #|     provider: String(provider || "-"),
  #|     stage: String(stage || "-"),
  #|     result: String(result || "waiting"),
  #|     log_text: String(logText || ""),
  #|     source_text: String(sourceText || "").slice(0, 2000)
  #|   }) + "\n";
  #|   fetch("/api/logs/moonap-runtime.log", {
  #|     method: "POST",
  #|     headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|     body: payload,
  #|     keepalive: true
  #|   }).catch(() => {});
  #| }

///|
#cfg(target="js")
extern "js" fn browser_update_result_panel(raw : String) -> Unit =
  #| (raw) => {
  #|   let data = {};
  #|   try { data = JSON.parse(String(raw)); } catch { data = { status: "error" }; }
  #|   const panel = document.querySelector("#resultPanel");
  #|   if (globalThis.__moonapMinimalShell !== false) {
  #|     if (panel) panel.style.display = "none";
  #|     globalThis.__moonapLastVisibleResult = data;
  #|     return;
  #|   }
  #|   panel?.classList.add("is-open");
  #|   const setText = (selector, value) => {
  #|     const node = document.querySelector(selector);
  #|     if (node) node.textContent = String(value);
  #|   };
  #|   const bytes = (value) => {
  #|     const n = Number(value || 0);
  #|     if (n >= 1073741824) return `${(n / 1073741824).toFixed(2)} GB`;
  #|     if (n >= 1048576) return `${(n / 1048576).toFixed(2)} MB`;
  #|     if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
  #|     return `${n} B`;
  #|   };
  #|   const pct = Math.max(0, Math.min(100, Number(data.progress_percent ?? (data.status === "done" ? 100 : 0))));
  #|   const fill = document.querySelector("#progressFill");
  #|   if (fill) fill.style.width = `${pct}%`;
  #|   setText("#resultStatus", data.status || "ready");
  #|   const isRuntime = String(data.status || "").startsWith("runtime") || String(data.status || "").includes("ready-for-runtime");
  #|   const resultKind = String(data.result_kind || "");
  #|   setText("#resultTitle", isRuntime
  #|     ? (data.status === "ready-for-runtime" ? "MoonAP runtime request is ready" : "MoonAP runtime result")
  #|     : resultKind === "streamed-file"
  #|       ? "Browser-local large-file generation"
  #|       : resultKind === "large-file-report"
  #|         ? "Browser-local large-file analysis"
  #|         : (data.status === "generated" ? "Synthetic FastQ generated locally" : "Browser-local FastQ analysis"));
  #|   setText("#metricFile", data.file_name || data.download_name || "-");
  #|   setText("#metricProcessed", bytes(data.bytes_processed ?? data.file_size_bytes ?? 0));
  #|   setText("#metricReads", data.reads_seen ?? data.read_count ?? "0");
  #|   setText("#metricTarget", data.target_base_count ?? data.expected_n_count ?? "0");
  #|   setText("#metricBases", data.total_bases ?? data.summary ?? "0");
  #|   setText("#metricUploaded", bytes(data.uploaded_bytes ?? 0));
  #| }

///|
#cfg(target="js")
extern "js" fn browser_watch_runtime_protocol(
  on_request : (String) -> Unit,
  on_result : (String) -> Unit,
  on_save_decision : (String) -> Unit,
) -> Unit =
  #| (onRequest, onResult, onSaveDecision) => {
  #|   const poll = async () => {
  #|     try {
  #|       const requestText = await fetch("/api/runtime-exec/latest-request").then((response) => response.text());
  #|       if (requestText && requestText !== globalThis.__moonapLastRuntimeRequestText) {
  #|         let requestJson = {};
  #|         try { requestJson = JSON.parse(requestText); } catch {}
  #|         const ignoredId = String(localStorage.getItem("moonap.ignoreRuntimeRequestId") || "");
  #|         const requestId = String(requestJson?.request_id || "");
  #|         if (ignoredId && requestId === ignoredId) return;
  #|         if (ignoredId && requestId && requestId !== ignoredId) localStorage.removeItem("moonap.ignoreRuntimeRequestId");
  #|         globalThis.__moonapLastRuntimeRequestText = requestText;
  #|         globalThis.__moonapLastRuntimeRequest = requestJson;
  #|         onRequest(String(requestText));
  #|       }
  #|     } catch {}
  #|     try {
  #|       const resultText = await fetch("/api/runtime-exec/latest-result").then((response) => response.text());
  #|       if (resultText && resultText !== globalThis.__moonapLastRuntimeResultText) {
  #|         let resultJson = {};
  #|         try { resultJson = JSON.parse(resultText); } catch {}
  #|         const ignoredId = String(localStorage.getItem("moonap.ignoreRuntimeRequestId") || "");
  #|         const requestId = String(resultJson?.request_id || "");
  #|         if (ignoredId && requestId === ignoredId) return;
  #|         if (ignoredId && requestId && requestId !== ignoredId) localStorage.removeItem("moonap.ignoreRuntimeRequestId");
  #|         globalThis.__moonapLastRuntimeResultText = resultText;
  #|         globalThis.__moonapLastRuntimeResult = resultJson;
  #|         onResult(String(resultText));
  #|       }
  #|     } catch {}
  #|     try {
  #|       const decisionText = await fetch("/api/skill-export/save-decision").then((response) => response.text());
  #|       if (decisionText && decisionText !== globalThis.__moonapLastSkillSaveDecisionText) {
  #|         globalThis.__moonapLastSkillSaveDecisionText = decisionText;
  #|         try { globalThis.__moonapLastSkillSaveDecision = JSON.parse(decisionText); } catch {}
  #|         onSaveDecision(String(decisionText));
  #|       }
  #|     } catch {}
  #|   };
  #|   if (!globalThis.__moonapRuntimeWatcherStarted) {
  #|     globalThis.__moonapRuntimeWatcherStarted = true;
  #|     poll();
  #|     setInterval(poll, 2000);
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_ensure_virtual_path_runtime() -> Unit =
  #| () => {
  #|   if (globalThis.__moonapVirtualPathRuntime) return;
  #|   // This normalizes MoonAP virtual archive paths, not host OS paths.
  #|   const normalize = (value) => String(value == null ? "" : value)
  #|     .trim()
  #|     .replace(/\\/g, "/")
  #|     .replace(/^\/+/, "")
  #|     .replace(/\/+/g, "/")
  #|     .replace(/\/$/, "");
  #|   const split = (value) => normalize(value).split("/").filter(Boolean);
  #|   const lastSegment = (value) => {
  #|     const parts = split(value);
  #|     return parts.length === 0 ? "" : String(parts[parts.length - 1] || "");
  #|   };
  #|   globalThis.__moonapVirtualPathRuntime = { normalize, split, lastSegment };
  #| }

///|
#cfg(target="js")
extern "js" fn browser_ensure_file_name_runtime() -> Unit =
  #| () => {
  #|   if (globalThis.__moonapFileNameRuntime) return;
  #|   const coerceFallback = (fallback) => String(fallback || "moonap-output.fastq");
  #|   const sanitize = (value, fallback = "moonap-output.fastq") => {
  #|     const base = String(value == null ? "" : value).trim() || coerceFallback(fallback);
  #|     const cleaned = base
  #|       .replace(/[\u0000-\u001f]/g, "_")
  #|       .replace(/[\\/:*?"<>|]+/g, "_")
  #|       .replace(/\s+/g, " ")
  #|       .trim()
  #|       .replace(/[. ]+$/g, "");
  #|     return cleaned || coerceFallback(fallback);
  #|   };
  #|   const sanitizeToken = (value, fallback = "moonap_read") => {
  #|     const cleaned = String(value == null ? "" : value)
  #|       .trim()
  #|       .replace(/[^A-Za-z0-9_.:-]+/g, "_")
  #|       .replace(/^_+|_+$/g, "");
  #|     return cleaned || String(fallback || "moonap_read");
  #|   };
  #|   globalThis.__moonapFileNameRuntime = { sanitize, sanitizeToken };
  #| }

///|
#cfg(target="js")
extern "js" fn browser_ensure_skill_zip_runtime() -> Unit =
  #| () => {
  #|   if (globalThis.__moonapSkillZipRuntime) return;
  #|   const pathRuntime = globalThis.__moonapVirtualPathRuntime;
  #|   if (!pathRuntime || typeof pathRuntime.normalize !== "function") {
  #|     throw new Error("MoonAP virtual path runtime is not ready yet.");
  #|   }
  #|   const encoder = new TextEncoder();
  #|   const decoder = new TextDecoder();
  #|   const crcTable = new Uint32Array(256);
  #|   for (let n = 0; n < 256; n += 1) {
  #|     let c = n;
  #|     for (let k = 0; k < 8; k += 1) {
  #|       c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  #|     }
  #|     crcTable[n] = c >>> 0;
  #|   }
  #|   const crc32 = (bytes) => {
  #|     let crc = 0xFFFFFFFF;
  #|     for (let i = 0; i < bytes.length; i += 1) {
  #|       crc = crcTable[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
  #|     }
  #|     return (crc ^ 0xFFFFFFFF) >>> 0;
  #|   };
  #|   const toUint8 = (value) => {
  #|     if (value instanceof Uint8Array) return value;
  #|     if (value instanceof ArrayBuffer) return new Uint8Array(value);
  #|     if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
  #|     return encoder.encode(String(value == null ? "" : value));
  #|   };
  #|   const concatUint8 = (chunks) => {
  #|     const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
  #|     const merged = new Uint8Array(total);
  #|     let offset = 0;
  #|     for (const chunk of chunks) {
  #|       merged.set(chunk, offset);
  #|       offset += chunk.length;
  #|     }
  #|     return merged;
  #|   };
  #|   const zipName = (path, isDir) => {
  #|     const clean = pathRuntime.normalize(path || "");
  #|     return isDir ? (clean.endsWith("/") ? clean : `${clean}/`) : clean.replace(/\/+$/, "");
  #|   };
  #|   const getDosDateTime = (value) => {
  #|     const date = value instanceof Date ? value : new Date();
  #|     const year = Math.min(127, Math.max(0, date.getFullYear() - 1980));
  #|     const month = date.getMonth() + 1;
  #|     const day = date.getDate();
  #|     const hour = date.getHours();
  #|     const minute = date.getMinutes();
  #|     const second = Math.floor(date.getSeconds() / 2);
  #|     return {
  #|       time: ((hour & 0x1F) << 11) | ((minute & 0x3F) << 5) | (second & 0x1F),
  #|       date: ((year & 0x7F) << 9) | ((month & 0x0F) << 5) | (day & 0x1F)
  #|     };
  #|   };
  #|   const makeZip = async (entries) => {
  #|     const normalized = Array.isArray(entries) ? entries : [];
  #|     const localChunks = [];
  #|     const centralChunks = [];
  #|     let offset = 0;
  #|     let count = 0;
  #|     for (const entry of normalized) {
  #|       const isDir = Boolean(entry?.directory);
  #|       const name = zipName(entry?.path || "", isDir);
  #|       if (!name) continue;
  #|       const nameBytes = encoder.encode(name);
  #|       const bytes = isDir ? new Uint8Array(0) : toUint8(entry?.bytes ?? entry?.text ?? "");
  #|       const crc = isDir ? 0 : crc32(bytes);
  #|       const { time, date } = getDosDateTime(entry?.date);
  #|       const local = new Uint8Array(30 + nameBytes.length);
  #|       const localView = new DataView(local.buffer);
  #|       localView.setUint32(0, 0x04034b50, true);
  #|       localView.setUint16(4, 20, true);
  #|       localView.setUint16(6, 0x0800, true);
  #|       localView.setUint16(8, 0, true);
  #|       localView.setUint16(10, time, true);
  #|       localView.setUint16(12, date, true);
  #|       localView.setUint32(14, crc, true);
  #|       localView.setUint32(18, bytes.length, true);
  #|       localView.setUint32(22, bytes.length, true);
  #|       localView.setUint16(26, nameBytes.length, true);
  #|       localView.setUint16(28, 0, true);
  #|       local.set(nameBytes, 30);
  #|       localChunks.push(local);
  #|       if (bytes.length > 0) localChunks.push(bytes);
  #|       const central = new Uint8Array(46 + nameBytes.length);
  #|       const centralView = new DataView(central.buffer);
  #|       centralView.setUint32(0, 0x02014b50, true);
  #|       centralView.setUint16(4, 20, true);
  #|       centralView.setUint16(6, 20, true);
  #|       centralView.setUint16(8, 0x0800, true);
  #|       centralView.setUint16(10, 0, true);
  #|       centralView.setUint16(12, time, true);
  #|       centralView.setUint16(14, date, true);
  #|       centralView.setUint32(16, crc, true);
  #|       centralView.setUint32(20, bytes.length, true);
  #|       centralView.setUint32(24, bytes.length, true);
  #|       centralView.setUint16(28, nameBytes.length, true);
  #|       centralView.setUint16(30, 0, true);
  #|       centralView.setUint16(32, 0, true);
  #|       centralView.setUint16(34, 0, true);
  #|       centralView.setUint16(36, 0, true);
  #|       centralView.setUint32(38, isDir ? 0x10 : 0, true);
  #|       centralView.setUint32(42, offset, true);
  #|       central.set(nameBytes, 46);
  #|       centralChunks.push(central);
  #|       offset += local.length + bytes.length;
  #|       count += 1;
  #|     }
  #|     const centralSize = centralChunks.reduce((sum, chunk) => sum + chunk.length, 0);
  #|     const end = new Uint8Array(22);
  #|     const endView = new DataView(end.buffer);
  #|     endView.setUint32(0, 0x06054b50, true);
  #|     endView.setUint16(8, count, true);
  #|     endView.setUint16(10, count, true);
  #|     endView.setUint32(12, centralSize, true);
  #|     endView.setUint32(16, offset, true);
  #|     return concatUint8([...localChunks, ...centralChunks, end]);
  #|   };
  #|   const findEndRecord = (bytes) => {
  #|     for (let i = bytes.length - 22; i >= 0; i -= 1) {
  #|       if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) {
  #|         return i;
  #|       }
  #|     }
  #|     return -1;
  #|   };
  #|   const inflateRaw = async (bytes) => {
  #|     if (typeof DecompressionStream !== "function") {
  #|       throw new Error("This browser cannot extract compressed ZIP files yet.");
  #|     }
  #|     const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
  #|     return new Uint8Array(await new Response(stream).arrayBuffer());
  #|   };
  #|   const unzip = async (bytesLike) => {
  #|     const bytes = toUint8(bytesLike);
  #|     const endOffset = findEndRecord(bytes);
  #|     if (endOffset < 0) throw new Error("ZIP end-of-directory record not found.");
  #|     const endView = new DataView(bytes.buffer, bytes.byteOffset + endOffset, 22);
  #|     const totalEntries = endView.getUint16(10, true);
  #|     const centralOffset = endView.getUint32(16, true);
  #|     const results = [];
  #|     let cursor = centralOffset;
  #|     for (let index = 0; index < totalEntries; index += 1) {
  #|       const centralView = new DataView(bytes.buffer, bytes.byteOffset + cursor, 46);
  #|       if (centralView.getUint32(0, true) !== 0x02014b50) {
  #|         throw new Error("ZIP central directory entry is invalid.");
  #|       }
  #|       const method = centralView.getUint16(10, true);
  #|       const compressedSize = centralView.getUint32(20, true);
  #|       const nameLength = centralView.getUint16(28, true);
  #|       const extraLength = centralView.getUint16(30, true);
  #|       const commentLength = centralView.getUint16(32, true);
  #|       const localOffset = centralView.getUint32(42, true);
  #|       const nameBytes = bytes.subarray(cursor + 46, cursor + 46 + nameLength);
  #|       const rawPath = decoder.decode(nameBytes);
  #|       const directory = /[\\/]$/.test(rawPath);
  #|       const path = pathRuntime.normalize(rawPath);
  #|       const localView = new DataView(bytes.buffer, bytes.byteOffset + localOffset, 30);
  #|       if (localView.getUint32(0, true) !== 0x04034b50) {
  #|         throw new Error(`ZIP local file header is invalid for ${path}.`);
  #|       }
  #|       const localNameLength = localView.getUint16(26, true);
  #|       const localExtraLength = localView.getUint16(28, true);
  #|       const dataStart = localOffset + 30 + localNameLength + localExtraLength;
  #|       const compressedBytes = bytes.subarray(dataStart, dataStart + compressedSize);
  #|       let data = new Uint8Array(0);
  #|       if (!directory) {
  #|         if (method === 0) {
  #|           data = new Uint8Array(compressedBytes);
  #|         } else if (method === 8) {
  #|           data = await inflateRaw(compressedBytes);
  #|         } else {
  #|           throw new Error(`ZIP compression method ${method} is not supported for ${path}.`);
  #|         }
  #|       }
  #|       if (!path) {
  #|         cursor += 46 + nameLength + extraLength + commentLength;
  #|         continue;
  #|       }
  #|       results.push({ path, directory, bytes: data });
  #|       cursor += 46 + nameLength + extraLength + commentLength;
  #|     }
  #|     return results;
  #|   };
  #|   globalThis.__moonapSkillZipRuntime = { makeZip, unzip };
  #| }

///|
#cfg(target="js")
extern "js" fn browser_request_skill_save(
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (onDone, onError) => {
  #|   try {
  #|     const runtimeResult = globalThis.__moonapLastRuntimeResult;
  #|     const runtimeRequest = globalThis.__moonapLastRuntimeRequest;
  #|     const artifact = globalThis.__moonapLastArtifact;
  #|     if (!runtimeResult || typeof runtimeResult !== "object") {
  #|       throw new Error("No runtime result is available yet.");
  #|     }
  #|     if (!runtimeRequest || typeof runtimeRequest !== "object") {
  #|       throw new Error("No runtime request is available yet.");
  #|     }
  #|     if (!artifact || typeof artifact !== "object") {
  #|       throw new Error("No generated MoonBit artifact is available yet.");
  #|     }
  #|     const requestId = String(runtimeResult.request_id || "");
  #|     const status = String(runtimeResult.status || "");
  #|     if (!requestId || !status.includes("succeeded")) {
  #|       throw new Error("MoonAP requires a successful runtime result before saving as a SKILL.");
  #|     }
  #|     const rootHandle = globalThis.__moonapSkillExportRootHandle;
  #|     if (!rootHandle || typeof rootHandle.getDirectoryHandle !== "function") {
  #|       throw new Error("Choose a save location before exporting this SKILL.");
  #|     }
  #|     const taskKind = String(runtimeRequest.task_kind || "generic");
  #|     const inferredTaskKind = String(runtimeRequest.inferred_task_kind || "");
  #|     const runtimeProfileId = String(runtimeRequest.runtime_profile_override_id || runtimeRequest.runtime_profile_id || "");
  #|     const runtimeProfileLabel = String(runtimeRequest.runtime_profile_label || runtimeProfileId || "");
  #|     const runtimeMode = String(runtimeRequest.runtime_mode || "form");
  #|     const resultMode = String(runtimeRequest.result_mode || "text");
  #|     const runtimeSpec = runtimeRequest?.runtime_spec && typeof runtimeRequest.runtime_spec === "object"
  #|       ? runtimeRequest.runtime_spec
  #|       : (runtimeRequest?.runtime_ui && typeof runtimeRequest.runtime_ui === "object" ? runtimeRequest.runtime_ui : {});
  #|     const fields = Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : [];
  #|     const descriptionMap = {
  #|       "fastq-generator": "Generate a synthetic FastQ file for testing, demos, or pipeline validation.",
  #|       "fastq-analysis": "Analyze a FastQ file and report summary metrics.",
  #|       "large-fastq-analysis": "Analyze a large FastQ file with chunked browser-local streaming and report read/base metrics.",
  #|       "large-file-analysis": "Analyze a large browser-local file with chunked local streaming and report summary metrics.",
  #|       "large-file-generation": "Generate a large browser-local file with chunked streaming output instead of buffering the whole artifact in memory.",
  #|       "excel-generator": "Generate a synthetic financial spreadsheet file.",
  #|       "finance-report-analysis": "Analyze a financial report file and produce a browser-local report.",
  #|       "browser-game": "Run a browser-local interactive game skill."
  #|     };
  #|     const enteredName = String(globalThis.__moonapSkillExportName || "").trim();
  #|     if (!enteredName) {
  #|       throw new Error("Enter a SKILL name before exporting.");
  #|     }
  #|     if (/[\\/:*?"<>|]/.test(enteredName)) {
  #|       throw new Error("SKILL name contains characters that cannot be used in a folder name on this computer.");
  #|     }
  #|     if (enteredName.endsWith(".") || enteredName.endsWith(" ")) {
  #|       throw new Error("SKILL name cannot end with a dot or space.");
  #|     }
  #|     const folderName = enteredName;
  #|     const defaultDescription = String(descriptionMap[taskKind] || `Run a reusable APP for ${taskKind}.`);
  #|     const description = String(globalThis.__moonapSkillExportDescription || "").trim() || defaultDescription;
  #|     const sourceText = String(artifact?.moonbit_source || "");
  #|     const wasmUrl = String(runtimeRequest?.wasm_url || "");
  #|     if (!wasmUrl) {
  #|       throw new Error("MoonAP runtime request does not include a wasm_url.");
  #|     }
  #|     const fetchBinary = async (path) => {
  #|       const response = await fetch(path);
  #|       if (!response.ok) throw new Error(`Failed to fetch ${path} (${response.status})`);
  #|       return new Uint8Array(await response.arrayBuffer());
  #|     };
  #|     const zipRuntime = globalThis.__moonapSkillZipRuntime;
  #|     if (!zipRuntime || typeof zipRuntime.makeZip !== "function") {
  #|       throw new Error("MoonAP ZIP runtime is not ready yet.");
  #|     }
  #|     const wasmBytes = await fetchBinary(wasmUrl);
  #|     const writeText = async (dirHandle, fileName, text) => {
  #|       const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  #|       const writable = await fileHandle.createWritable();
  #|       await writable.write(String(text || ""));
  #|       await writable.close();
  #|     };
  #|     const writeBinary = async (dirHandle, fileName, bytes) => {
  #|       const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  #|       const writable = await fileHandle.createWritable();
  #|       await writable.write(bytes);
  #|       await writable.close();
  #|     };
  #|     const ensurePersonalSkillRuntime = () => {
  #|       if (globalThis.__moonapPersonalSkillRuntime) return globalThis.__moonapPersonalSkillRuntime;
  #|       const DB_NAME = "moonap.personal.skill.handles.v1";
  #|       const STORE_NAME = "handles";
  #|       const openDb = () => new Promise((resolve, reject) => {
  #|         const request = indexedDB.open(DB_NAME, 1);
  #|         request.onupgradeneeded = () => {
  #|           const db = request.result;
  #|           if (!db.objectStoreNames.contains(STORE_NAME)) {
  #|             db.createObjectStore(STORE_NAME);
  #|           }
  #|         };
  #|         request.onsuccess = () => resolve(request.result);
  #|         request.onerror = () => reject(request.error || new Error("Failed to open Personal SKILL database."));
  #|       });
  #|       const withStore = async (mode, work) => {
  #|         const db = await openDb();
  #|         return await new Promise((resolve, reject) => {
  #|           const transaction = db.transaction(STORE_NAME, mode);
  #|           const store = transaction.objectStore(STORE_NAME);
  #|           let settled = false;
  #|           const finishResolve = (value) => {
  #|             if (settled) return;
  #|             settled = true;
  #|             resolve(value);
  #|           };
  #|           const finishReject = (error) => {
  #|             if (settled) return;
  #|             settled = true;
  #|             reject(error);
  #|           };
  #|           transaction.oncomplete = () => finishResolve(undefined);
  #|           transaction.onerror = () => finishReject(transaction.error || new Error("Personal SKILL database transaction failed."));
  #|           transaction.onabort = () => finishReject(transaction.error || new Error("Personal SKILL database transaction was aborted."));
  #|           Promise.resolve(work(store, finishResolve, finishReject)).catch(finishReject);
  #|         }).finally(() => db.close());
  #|       };
  #|       const runtime = {
  #|         cache: {},
  #|         putHandle: async (id, handle) => {
  #|           await withStore("readwrite", (store, resolve, reject) => {
  #|             const request = store.put(handle, String(id || ""));
  #|             request.onsuccess = () => resolve(true);
  #|             request.onerror = () => reject(request.error || new Error("Failed to save Personal SKILL handle."));
  #|           });
  #|         }
  #|       };
  #|       globalThis.__moonapPersonalSkillRuntime = runtime;
  #|       return runtime;
  #|     };
  #|     const skillDir = await rootHandle.getDirectoryHandle(folderName, { create: true });
  #|     const programDir = await skillDir.getDirectoryHandle("program", { create: true });
  #|     const inputLines = fields.length === 0
  #|       ? ["- none"]
  #|       : fields.map((field) => {
  #|           const name = String(field?.name || "input");
  #|           const label = String(field?.label || name);
  #|           const kind = String(field?.type || field?.kind || "text");
  #|           const defaultValue = field?.default;
  #|           const suffix = defaultValue === undefined ? "" : ` (default: ${String(defaultValue)})`;
  #|           return `- ${name}: ${label} [${kind}]${suffix}`;
  #|         });
  #|     const outputText = resultMode === "download"
  #|       ? `A downloadable artifact. Latest result summary: ${String(runtimeResult.summary || "")}`
  #|       : resultMode === "report"
  #|         ? `A browser-visible report. Latest result summary: ${String(runtimeResult.summary || "")}`
  #|         : resultMode === "interactive"
  #|           ? `An interactive browser-local result. Latest result summary: ${String(runtimeResult.summary || "")}`
  #|           : String(runtimeResult.summary || "A browser-visible runtime result.");
  #|     const keyAttributes = [
  #|       `- task kind: ${taskKind}`,
  #|       runtimeProfileId ? `- runtime profile: ${runtimeProfileId}` : "",
  #|       runtimeProfileLabel && runtimeProfileLabel !== runtimeProfileId ? `- runtime profile label: ${runtimeProfileLabel}` : "",
  #|       inferredTaskKind && inferredTaskKind !== taskKind ? `- inferred task kind: ${inferredTaskKind}` : "",
  #|       `- runtime mode: ${runtimeMode}`,
  #|       `- result mode: ${resultMode}`,
  #|       "- wasm path: program/main.wasm"
  #|     ].filter(Boolean);
  #|     if (sourceText.trim()) keyAttributes.push("- moonbit source path: program/main.mbt");
  #|     const skillMd = [
  #|       "---",
  #|       `name: ${folderName}`,
  #|       `description: ${description}`,
  #|       "---",
  #|       "",
  #|       "# Key Attributes",
  #|       ...keyAttributes,
  #|       "",
  #|       "# Inputs",
  #|       ...inputLines,
  #|       "",
  #|       "# Output",
  #|       outputText,
  #|       "",
  #|       "# Runtime Spec",
  #|       "```json",
  #|       JSON.stringify(runtimeSpec, null, 2),
  #|       "```"
  #|     ].join("\n");
  #|     await writeText(skillDir, "SKILL.md", skillMd);
  #|     await writeBinary(programDir, "main.wasm", wasmBytes);
  #|     if (sourceText.trim()) {
  #|       await writeText(programDir, "main.mbt", sourceText);
  #|     }
  #|     const exportZip = globalThis.__moonapSkillExportZipEnabled !== false;
  #|     let exportedZipName = "";
  #|     if (exportZip) {
  #|       const zipEntries = [
  #|         { path: folderName, directory: true },
  #|         { path: `${folderName}/program`, directory: true },
  #|         { path: `${folderName}/SKILL.md`, text: skillMd },
  #|         { path: `${folderName}/program/main.wasm`, bytes: wasmBytes }
  #|       ];
  #|       if (sourceText.trim()) {
  #|         zipEntries.push({ path: `${folderName}/program/main.mbt`, text: sourceText });
  #|       }
  #|       const zipBytes = await zipRuntime.makeZip(zipEntries);
  #|       exportedZipName = `${folderName}.zip`;
  #|       await writeBinary(rootHandle, exportedZipName, zipBytes);
  #|     }
  #|     let skills = [];
  #|     try {
  #|       const parsed = JSON.parse(localStorage.getItem("moonap.personal.skills") || "[]");
  #|       skills = Array.isArray(parsed) ? parsed : [];
  #|     } catch {}
  #|     const skillRecord = {
  #|       id: `personal.${folderName}`,
  #|       name: enteredName,
  #|       description,
  #|       task_kind: taskKind,
  #|       inferred_task_kind: inferredTaskKind,
  #|       runtime_profile_id: runtimeProfileId,
  #|       runtime_mode: runtimeMode,
  #|       result_mode: resultMode,
  #|       folder_name: folderName,
  #|       runtime_ready: true,
  #|       export_root_name: String(rootHandle.name || ""),
  #|       saved_at: new Date().toISOString()
  #|     };
  #|     skills = skills.filter((item) => String(item?.id || "") !== skillRecord.id);
  #|     skills.unshift(skillRecord);
  #|     try { localStorage.setItem("moonap.personal.skills", JSON.stringify(skills)); } catch {}
  #|     await ensurePersonalSkillRuntime().putHandle(skillRecord.id, skillDir);
  #|     const response = await fetch("/api/skill-export/save-decision", {
  #|       method: "POST",
  #|       headers: { "Content-Type": "application/json; charset=utf-8" },
  #|       body: JSON.stringify({
  #|         request_id: requestId,
  #|         decision: "accepted-save-skill",
  #|         reason: `User accepted the runtime result and exported this workflow as a SKILL folder named ${folderName}.`
  #|       })
  #|     });
  #|     const text = await response.text();
  #|     if (!response.ok) throw new Error(text || `Skill save decision failed (${response.status})`);
  #|     const parsed = (() => { try { return JSON.parse(String(text || "{}")); } catch { return {}; } })();
  #|     parsed.exported_folder_name = folderName;
  #|     parsed.exported_root_name = String(rootHandle.name || "");
  #|     parsed.exported_zip_name = exportedZipName;
  #|     onDone(JSON.stringify(parsed, null, 2));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_open_skill_export_dialog() -> Unit =
  #| () => {
  #|   let dialog = document.querySelector("#skillExportDialog");
  #|   if (!dialog) {
  #|     dialog = document.createElement("dialog");
  #|     dialog.id = "skillExportDialog";
  #|     dialog.className = "skill-dialog skill-export-dialog";
  #|     dialog.innerHTML = `
  #|       <form method="dialog" class="skill-dialog-body">
  #|         <div class="dialog-head"><span>PERSONAL SKILL</span><strong>Save APP as SKILL</strong></div>
  #|         <p class="dialog-summary">Choose a SKILL name, review the prefilled description and edit it if needed, then choose where to save the SKILL folder. Nothing will be written until you click Save SKILL. When you choose a save location, the browser may ask for permission to create files in that local directory.</p>
  #|         <div class="dialog-fields">
  #|           <label><span>SKILL name</span><input id="skillExportName" type="text" /></label>
  #|           <label><span>Description (prefilled, editable)</span><textarea id="skillExportDescription" rows="3"></textarea></label>
  #|           <label class="skill-export-zip-toggle">
  #|             <input id="skillExportZipEnabled" type="checkbox" checked />
  #|             <span>Also generate a .zip package for publishing or sharing</span>
  #|           </label>
  #|           <div class="skill-export-path">
  #|             <div class="skill-export-path-meta">
  #|               <span>Save location</span>
  #|               <small id="skillExportPathLabel">No folder selected yet.</small>
  #|             </div>
  #|             <button id="skillExportChoosePath" class="dialog-button secondary" type="button">Choose or change save folder</button>
  #|           </div>
  #|         </div>
  #|         <div class="dialog-actions">
  #|           <button id="skillExportCancel" class="dialog-button" type="button">Cancel</button>
  #|           <button id="skillExportConfirm" class="dialog-button primary" type="button">Save SKILL</button>
  #|         </div>
  #|       </form>`;
  #|     document.body.append(dialog);
  #|   }
  #|   const runtimeRequest = globalThis.__moonapLastRuntimeRequest || {};
  #|   const artifact = globalThis.__moonapLastArtifact || {};
  #|   const taskKind = String(runtimeRequest.task_kind || "generic");
  #|   const defaultDescriptionMap = {
  #|     "fastq-generator": "Generate a synthetic FastQ file for testing, demos, or pipeline validation.",
  #|     "fastq-analysis": "Analyze a FastQ file and report summary metrics.",
  #|     "large-fastq-analysis": "Analyze a large FastQ file with chunked browser-local streaming and report read/base metrics.",
  #|     "large-file-analysis": "Analyze a large browser-local file with chunked local streaming and report summary metrics.",
  #|     "large-file-generation": "Generate a large browser-local file with chunked streaming output instead of buffering the whole artifact in memory.",
  #|     "excel-generator": "Generate a synthetic financial spreadsheet file.",
  #|     "finance-report-analysis": "Analyze a financial report file and produce a browser-local report.",
  #|     "browser-game": "Run a browser-local interactive game skill."
  #|   };
  #|   const defaultName = String(globalThis.__moonapSkillExportName || artifact?.name || artifact?.skill?.folder_name || taskKind || "moonap-skill").trim() || "moonap-skill";
  #|   const defaultDescription = String(globalThis.__moonapSkillExportDescription || defaultDescriptionMap[taskKind] || `Run a reusable APP for ${taskKind}.`);
  #|   const nameInput = document.querySelector("#skillExportName");
  #|   const descriptionInput = document.querySelector("#skillExportDescription");
  #|   const zipInput = document.querySelector("#skillExportZipEnabled");
  #|   const pathLabel = document.querySelector("#skillExportPathLabel");
  #|   if (nameInput) nameInput.value = defaultName;
  #|   if (descriptionInput) descriptionInput.value = defaultDescription;
  #|   if (zipInput) zipInput.checked = globalThis.__moonapSkillExportZipEnabled !== false;
  #|   const rootHandle = globalThis.__moonapSkillExportRootHandle;
  #|   if (pathLabel) {
  #|     pathLabel.textContent = rootHandle && rootHandle.name
  #|       ? `Selected folder: ${String(rootHandle.name)}`
  #|       : "No folder selected yet.";
  #|   }
  #|   dialog.showModal();
  #| }

///|
#cfg(target="js")
extern "js" fn browser_close_skill_export_dialog() -> Unit =
  #| () => document.querySelector("#skillExportDialog")?.close()

///|
#cfg(target="js")
extern "js" fn browser_choose_skill_export_path(
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (onDone, onError) => {
  #|   try {
  #|     if (typeof window.showDirectoryPicker !== "function") {
  #|       throw new Error("This browser does not support directory selection for SKILL export.");
  #|     }
  #|     const handle = await window.showDirectoryPicker({ mode: "readwrite" });
  #|     globalThis.__moonapSkillExportRootHandle = handle;
  #|     const ensurePersonalSkillRuntime = () => {
  #|       if (globalThis.__moonapPersonalSkillRuntime && typeof globalThis.__moonapPersonalSkillRuntime.putRootHandle === "function") {
  #|         return globalThis.__moonapPersonalSkillRuntime;
  #|       }
  #|       const DB_NAME = "moonap.personal.skill.handles.v1";
  #|       const STORE_NAME = "handles";
  #|       const ROOT_KEY = "__root__";
  #|       const openDb = () => new Promise((resolve, reject) => {
  #|         const request = indexedDB.open(DB_NAME, 1);
  #|         request.onupgradeneeded = () => {
  #|           const db = request.result;
  #|           if (!db.objectStoreNames.contains(STORE_NAME)) {
  #|             db.createObjectStore(STORE_NAME);
  #|           }
  #|         };
  #|         request.onsuccess = () => resolve(request.result);
  #|         request.onerror = () => reject(request.error || new Error("Failed to open Personal SKILL database."));
  #|       });
  #|       const withStore = async (mode, work) => {
  #|         const db = await openDb();
  #|         return await new Promise((resolve, reject) => {
  #|           const transaction = db.transaction(STORE_NAME, mode);
  #|           const store = transaction.objectStore(STORE_NAME);
  #|           let settled = false;
  #|           const finishResolve = (value) => {
  #|             if (settled) return;
  #|             settled = true;
  #|             resolve(value);
  #|           };
  #|           const finishReject = (error) => {
  #|             if (settled) return;
  #|             settled = true;
  #|             reject(error);
  #|           };
  #|           transaction.oncomplete = () => finishResolve(undefined);
  #|           transaction.onerror = () => finishReject(transaction.error || new Error("Personal SKILL database transaction failed."));
  #|           transaction.onabort = () => finishReject(transaction.error || new Error("Personal SKILL database transaction was aborted."));
  #|           Promise.resolve(work(store, finishResolve, finishReject)).catch(finishReject);
  #|         }).finally(() => db.close());
  #|       };
  #|       const runtime = {
  #|         putRootHandle: async (rootHandle) => {
  #|           await withStore("readwrite", (store, resolve, reject) => {
  #|             const request = store.put(rootHandle, ROOT_KEY);
  #|             request.onsuccess = () => resolve(true);
  #|             request.onerror = () => reject(request.error || new Error("Failed to save Personal SKILL root handle."));
  #|           });
  #|         }
  #|       };
  #|       globalThis.__moonapPersonalSkillRuntime = {
  #|         ...(globalThis.__moonapPersonalSkillRuntime || {}),
  #|         ...runtime
  #|       };
  #|       return globalThis.__moonapPersonalSkillRuntime;
  #|     };
  #|     await ensurePersonalSkillRuntime().putRootHandle(handle);
  #|     const exportLabel = document.querySelector("#skillExportPathLabel");
  #|     if (exportLabel) exportLabel.textContent = `Selected folder: ${String(handle?.name || "")}`;
  #|     const panelLabel = document.querySelector("#personalSkillRootLabel");
  #|     if (panelLabel) panelLabel.textContent = handle && handle.name
  #|       ? `Selected folder: ${String(handle.name)}`
  #|       : "No local Personal SKILL folder selected yet.";
  #|     onDone(String(handle?.name || ""));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_on_skill_export_choose_path(
  handler : () -> Unit,
) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "skillExportChoosePath") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   try {
  #|     handler();
  #|   } catch (error) {
  #|     alert(`MoonAP skill export path selection failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_on_personal_skill_choose_path(
  handler : () -> Unit,
) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "personalSkillChoosePath") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   try {
  #|     handler();
  #|   } catch (error) {
  #|     alert(`MoonAP local Personal SKILL folder selection failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_on_skill_export_confirm(handler : () -> Unit) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "skillExportConfirm") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   try {
  #|     globalThis.__moonapSkillExportName = String(document.querySelector("#skillExportName")?.value || "").trim();
  #|     globalThis.__moonapSkillExportDescription = String(document.querySelector("#skillExportDescription")?.value || "").trim();
  #|     globalThis.__moonapSkillExportZipEnabled = Boolean(document.querySelector("#skillExportZipEnabled")?.checked ?? true);
  #|     handler();
  #|   } catch (error) {
  #|     alert(`MoonAP skill export failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_on_skill_export_cancel(handler : () -> Unit) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "skillExportCancel") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   try {
  #|     handler();
  #|   } catch (error) {
  #|     console.error("MoonAP skill export cancel failed:", error);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_message_value() -> String =
  #| () => String(document.querySelector("#message")?.value || "").trim()

///|
#cfg(target="js")
extern "js" fn browser_prepare_message_input(default_text : String) -> Unit =
  #| (defaultText) => {
  #|   const textarea = document.querySelector("#message");
  #|   if (!textarea) return;
  #|   const applyTone = () => {
  #|     textarea.classList.toggle("suggested", String(textarea.value || "") === String(defaultText));
  #|   };
  #|   if (String(textarea.value || "").trim() === "") {
  #|     textarea.value = String(defaultText);
  #|   }
  #|   applyTone();
  #|   if (!textarea.dataset.moonapPrepared) {
  #|     textarea.addEventListener("input", applyTone);
  #|     textarea.dataset.moonapPrepared = "true";
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_enable_minimal_shell() -> Unit =
  #| () => {
  #|   globalThis.__moonapMinimalShell = true;
  #|   const hide = (selector) => {
  #|     const node = document.querySelector(selector);
  #|     if (node) node.style.display = "none";
  #|   };
  #|   hide("#onboardingCard");
  #|   hide("#resultPanel");
  #|   hide("#artifactActions");
  #|   hide("#modePanel");
  #|   hide("#privacyStrip");
  #|   const shell = document.querySelector(".app-shell");
  #|   shell?.classList.remove("details-open");
  #|   const drawer = document.querySelector("#detailsDrawer");
  #|   if (drawer) drawer.style.display = "";
  #|   const detailsButton = document.querySelector("#detailsToggle");
  #|   if (detailsButton) detailsButton.style.display = "";
  #| }

///|
#cfg(target="js")
extern "js" fn browser_restore_formal_verification() -> Unit =
  #| () => {
  #|   const enabled = localStorage.getItem("moonap.formalVerification") === "true";
  #|   const mainToggle = document.querySelector("#formalVerification");
  #|   const dialogToggle = document.querySelector("#routerFormalVerification");
  #|   if (mainToggle) mainToggle.checked = enabled;
  #|   if (dialogToggle) dialogToggle.checked = enabled;
  #| }

///|
#cfg(target="js")
extern "js" fn browser_toggle_details() -> Unit =
  #| () => {
  #|   const root = document.querySelector(".app-shell");
  #|   const button = document.querySelector("#detailsToggle");
  #|   if (!root || !button) return;
  #|   const open = !root.classList.contains("details-open");
  #|   root.classList.toggle("details-open", open);
  #|   button.setAttribute("aria-expanded", open ? "true" : "false");
  #| }

///|
#cfg(target="js")
extern "js" fn browser_file_name() -> String =
  #| () => {
  #|   const file = document.querySelector("#fileInput")?.files?.[0];
  #|   return String(file?.name || "");
  #| }

///|
#cfg(target="js")
extern "js" fn browser_has_file() -> Bool =
  #| () => Boolean(document.querySelector("#fileInput")?.files?.[0])

///|
#cfg(target="js")
extern "js" fn browser_formal_verification_enabled() -> Bool =
  #| () => Boolean(document.querySelector("#formalVerification")?.checked)

///|
#cfg(target="js")
extern "js" fn browser_run_fastq_counter(
  target_base : String,
  on_progress : (String) -> Unit,
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (targetBase, onProgress, onDone, onError) => {
  #|   try {
  #|     const file = document.querySelector("#fileInput")?.files?.[0];
  #|     if (!file) {
  #|       onError("Choose a FastQ file first.");
  #|       return;
  #|     }
  #|     const chunkSize = 4 * 1024 * 1024;
  #|     const target = String(targetBase || "N").toUpperCase();
  #|     let offset = 0;
  #|     let carry = "";
  #|     let lineMod = 0;
  #|     let readCount = 0;
  #|     let sequenceLines = 0;
  #|     let totalBases = 0;
  #|     let targetCount = 0;
  #|     const started = performance.now();
  #|     const countLine = (line) => {
  #|       sequenceLines += 1;
  #|       totalBases += line.length;
  #|       for (let i = 0; i < line.length; i += 1) {
  #|         if (line[i].toUpperCase() === target) targetCount += 1;
  #|       }
  #|     };
  #|     while (offset < file.size) {
  #|       const end = Math.min(offset + chunkSize, file.size);
  #|       const text = await file.slice(offset, end).text();
  #|       const merged = carry + text;
  #|       const hasFinalNewline = merged.endsWith("\n") || merged.endsWith("\r");
  #|       const lines = merged.split(/\r?\n/);
  #|       carry = hasFinalNewline ? "" : String(lines.pop() || "");
  #|       for (const line of lines) {
  #|         if (lineMod === 1) countLine(line);
  #|         if (lineMod === 3) readCount += 1;
  #|         lineMod = (lineMod + 1) % 4;
  #|       }
  #|       offset = end;
  #|       const pct = file.size === 0 ? 100 : Math.floor((offset / file.size) * 100);
  #|       onProgress(JSON.stringify({
  #|         status: "counting",
  #|         file_name: file.name,
  #|         file_size_bytes: file.size,
  #|         chunk_size_bytes: chunkSize,
  #|         bytes_processed: offset,
  #|         progress_percent: pct,
  #|         uploaded_bytes: 0,
  #|         llm_receives_file_contents: false,
  #|         target_base: target
  #|       }, null, 2));
  #|       await new Promise((resolve) => setTimeout(resolve, 0));
  #|     }
  #|     if (carry.length > 0) {
  #|       if (lineMod === 1) countLine(carry);
  #|       if (lineMod === 3) readCount += 1;
  #|     }
  #|     const elapsedMs = Math.round(performance.now() - started);
  #|     onDone(JSON.stringify({
  #|       status: "done",
  #|       file_name: file.name,
  #|       file_size_bytes: file.size,
  #|       reads_seen: readCount,
  #|       sequence_lines: sequenceLines,
  #|       total_bases: totalBases,
  #|       target_base: target,
  #|       target_base_count: targetCount,
  #|       target_base_fraction: totalBases === 0 ? 0 : targetCount / totalBases,
  #|       elapsed_ms: elapsedMs,
  #|       uploaded_bytes: 0,
  #|       llm_receives_file_contents: false,
  #|       privacy: "File contents stayed in this browser."
  #|     }, null, 2));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_generate_fastq_sample(
  read_count : Int,
  read_length : Int,
  n_rate_text : String,
  seed_value : Int,
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| (readCountRaw, readLengthRaw, nRateText, seedRaw, onDone, onError) => {
  #|   try {
  #|     if (globalThis.__moonapAllowDownload !== "dialog-run") {
  #|       throw new Error("Download blocked: open the SKILL settings dialog and click Run.");
  #|     }
  #|     globalThis.__moonapAllowDownload = "";
  #|     const readCount = Math.max(1, Math.min(1000000, Number(readCountRaw) || 10000));
  #|     const readLength = Math.max(1, Math.min(10000, Number(readLengthRaw) || 150));
  #|     const nRate = Math.max(0, Math.min(1, Number(nRateText) || 0.01));
  #|     const originalSeed = Number(seedRaw) || 42;
  #|     let seed = originalSeed;
  #|     const bases = ["A", "C", "G", "T"];
  #|     const rand = () => {
  #|       seed = (seed * 1664525 + 1013904223) >>> 0;
  #|       return seed / 4294967296;
  #|     };
  #|     const chunks = [];
  #|     let nCount = 0;
  #|     let totalBases = 0;
  #|     for (let read = 0; read < readCount; read += 1) {
  #|       let seq = "";
  #|       for (let i = 0; i < readLength; i += 1) {
  #|         totalBases += 1;
  #|         if (rand() < nRate) {
  #|           seq += "N";
  #|           nCount += 1;
  #|         } else {
  #|           seq += bases[Math.floor(rand() * bases.length)];
  #|         }
  #|       }
  #|       chunks.push(`@moonap_${read}\n${seq}\n+\n${"I".repeat(readLength)}\n`);
  #|     }
  #|     const blob = new Blob(chunks, { type: "text/plain;charset=utf-8" });
  #|     const url = URL.createObjectURL(blob);
  #|     const link = document.createElement("a");
  #|     link.href = url;
  #|     link.download = "moonap-demo.fastq";
  #|     document.body.append(link);
  #|     link.click();
  #|     link.remove();
  #|     setTimeout(() => URL.revokeObjectURL(url), 1000);
  #|     onDone(JSON.stringify({
  #|       status: "generated",
  #|       file_name: "moonap-demo.fastq",
  #|       read_count: readCount,
  #|       read_length: readLength,
  #|       total_bases: totalBases,
  #|       expected_n_count: nCount,
  #|       n_rate: nRate,
  #|       random_seed: originalSeed,
  #|       llm_output_tokens_for_file_contents: 0,
  #|       note: "LLM would output only this compact recipe; MoonAP generated the file locally."
  #|     }, null, 2));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_on_submit(handler : () -> Unit) -> Unit =
  #| (handler) => {
  #|   const form = document.querySelector("#chatForm");
  #|   form?.addEventListener("submit", (event) => {
  #|     event.preventDefault();
  #|     try {
  #|       handler();
  #|     } catch (error) {
  #|       console.error("MoonAP submit handler failed:", error);
  #|       alert(`MoonAP submit failed: ${error instanceof Error ? error.message : String(error)}`);
  #|     }
  #|   });
  #| }

///|
#cfg(target="js")
extern "js" fn browser_on_click(
  selector : String,
  handler : () -> Unit,
) -> Unit =
  #| (selector, handler) => {
  #|   document.querySelector(String(selector))?.addEventListener("click", (event) => {
  #|     event.preventDefault();
  #|     try {
  #|       handler();
  #|     } catch (error) {
  #|       console.error(`MoonAP click handler failed for ${String(selector)}:`, error);
  #|       alert(`MoonAP click failed: ${error instanceof Error ? error.message : String(error)}`);
  #|     }
  #|   });
  #| }

///|
#cfg(target="js")
extern "js" fn browser_on_skill_card_click(handler : (String) -> Unit) -> Unit =
  #| (handler) => {
  #|   document.addEventListener("click", (event) => {
  #|     const card = event.target?.closest?.(".skill-card[data-skill-id]");
  #|     if (!card) return;
  #|     event.preventDefault();
  #|     event.stopPropagation();
  #|     document.querySelectorAll(".skill-card").forEach((card) => card.classList.remove("is-selected"));
  #|     card.classList.add("is-selected");
  #|     try {
  #|       handler(String(card.dataset?.skillId || ""));
  #|     } catch (error) {
  #|       console.error("MoonAP skill click failed:", error);
  #|       alert(`MoonAP skill failed: ${error instanceof Error ? error.message : String(error)}`);
  #|     }
  #|   });
  #| }

///|
#cfg(target="js")
extern "js" fn browser_on_onboarding_action(
  on_run_benchmark : () -> Unit,
  on_open_skill : () -> Unit,
  on_edit_llm : () -> Unit,
  on_open_log : () -> Unit,
  on_download_log : () -> Unit,
) -> Unit =
  #| (onRunBenchmark, onOpenSkill, onEditLlm, onOpenLog, onDownloadLog) => {
  #|   document.addEventListener("click", (event) => {
  #|     const target = event.target?.closest?.("#onboardingRunBenchmark, #onboardingOpenSkill, #onboardingEditLLM, #onboardingOpenLog, #onboardingDownloadLog");
  #|     if (!target) return;
  #|     event.preventDefault();
  #|     event.stopPropagation();
  #|     try {
  #|       if (target.id === "onboardingRunBenchmark") {
  #|         onRunBenchmark();
  #|       } else if (target.id === "onboardingOpenSkill") {
  #|         onOpenSkill();
  #|       } else if (target.id === "onboardingEditLLM") {
  #|         onEditLlm();
  #|       } else if (target.id === "onboardingOpenLog") {
  #|         onOpenLog();
  #|       } else if (target.id === "onboardingDownloadLog") {
  #|         onDownloadLog();
  #|       }
  #|     } catch (error) {
  #|       console.error("MoonAP onboarding action failed:", error);
  #|       alert(`MoonAP onboarding failed: ${error instanceof Error ? error.message : String(error)}`);
  #|     }
  #|   });
  #| }

///|
#cfg(target="js")
extern "js" fn browser_open_skill_dialog(skill_id : String) -> Unit =
  #| (skillId) => {
  #|   const pathRuntime = globalThis.__moonapVirtualPathRuntime;
  #|   let dialog = document.querySelector("#skillDialog");
  #|   if (!dialog) {
  #|     dialog = document.createElement("dialog");
  #|     dialog.id = "skillDialog";
  #|     dialog.className = "skill-dialog";
  #|     dialog.innerHTML = `
  #|       <form method="dialog" class="skill-dialog-body">
  #|         <div class="dialog-head"><span id="dialogScope">SKILL</span><strong id="dialogTitle">Configure SKILL</strong></div>
  #|         <p id="dialogSummary" class="dialog-summary"></p>
  #|         <div id="dialogFields" class="dialog-fields"></div>
  #|         <div id="dialogInputTarget" class="dialog-output-target" style="display:none;">
  #|           <button id="dialogChooseInput" class="dialog-button secondary" type="button">Choose input FastQ file</button>
  #|           <span id="dialogInputStatus">No input file selected yet.</span>
  #|         </div>
  #|         <div id="dialogOutputTarget" class="dialog-output-target" style="display:none;">
  #|           <button id="dialogChooseOutput" class="dialog-button secondary" type="button">Choose output file/location</button>
  #|           <span id="dialogOutputStatus">No output file selected yet.</span>
  #|         </div>
  #|         <div class="dialog-actions"><button id="dialogCancel" class="dialog-button" type="button">Cancel</button><button id="dialogOpenSource" class="dialog-button secondary" type="button" style="display:none;">View on GitHub</button><button id="dialogRun" class="dialog-button primary" type="button">Run</button></div>
  #|       </form>`;
  #|     document.body.append(dialog);
  #|   }
  #|   const scope = document.querySelector("#dialogScope");
  #|   const title = document.querySelector("#dialogTitle");
  #|   const summary = document.querySelector("#dialogSummary");
  #|   const fields = document.querySelector("#dialogFields");
  #|   const runButton = document.querySelector("#dialogRun");
  #|   const outputTarget = document.querySelector("#dialogOutputTarget");
  #|   const outputStatus = document.querySelector("#dialogOutputStatus");
  #|   const chooseOutput = document.querySelector("#dialogChooseOutput");
  #|   const inputTarget = document.querySelector("#dialogInputTarget");
  #|   const inputStatus = document.querySelector("#dialogInputStatus");
  #|   const chooseInput = document.querySelector("#dialogChooseInput");
  #|   const openSourceButton = document.querySelector("#dialogOpenSource");
  #|   const set = (node, value) => { if (node) node.textContent = String(value); };
  #|   if (!dialog || !fields) return;
  #|   fields.innerHTML = "";
  #|   dialog.__moonapOutputFileHandle = null;
  #|   dialog.__moonapInputFileHandle = null;
  #|   dialog.dataset.skillId = String(skillId);
  #|   dialog.dataset.taskKind = "";
  #|   dialog.dataset.skillSource = "";
  #|   dialog.dataset.externalUrl = "";
  #|   dialog.dataset.downloadUrl = "";
  #|   dialog.dataset.folderPath = "";
  #|   dialog.dataset.inputKind = "";
  #|   if (runButton) runButton.textContent = "Run";
  #|   if (openSourceButton) openSourceButton.style.display = "none";
  #|   if (inputTarget) inputTarget.style.display = "none";
  #|   if (chooseInput) chooseInput.textContent = "Choose input file";
  #|   set(inputStatus, "No input file selected yet.");
  #|   if (outputTarget) outputTarget.style.display = "none";
  #|   set(outputStatus, "No output file selected yet.");
  #|   const addField = (id, label, value, mode = "numeric", fieldName = "", help = "", fieldType = "") => {
  #|     const item = document.createElement("label");
  #|     const isBool = ["bool", "boolean", "checkbox"].includes(String(fieldType || "").toLowerCase());
  #|     if (isBool) item.className = "checkbox-param";
  #|     const input = document.createElement("input");
  #|     input.id = `param-${id}`;
  #|     input.type = isBool ? "checkbox" : "text";
  #|     if (isBool) {
  #|       input.checked = !["false", "0", "no", "off", ""].includes(String(value ?? "").trim().toLowerCase());
  #|       input.value = "true";
  #|     } else {
  #|       input.value = value;
  #|       input.inputMode = mode;
  #|     }
  #|     if (fieldName) input.dataset.paramName = String(fieldName);
  #|     const labelSpan = document.createElement("span");
  #|     labelSpan.textContent = label;
  #|     if (isBool) {
  #|       item.append(input, labelSpan);
  #|     } else {
  #|       item.append(labelSpan, input);
  #|     }
  #|     if (help) {
  #|       const helpNode = document.createElement("small");
  #|       helpNode.className = "param-help";
  #|       helpNode.textContent = String(help);
  #|       item.append(helpNode);
  #|     }
  #|     fields.append(item);
  #|   };
  #|   const loadedPersonal = globalThis.__moonapPersonalSkillCache && typeof globalThis.__moonapPersonalSkillCache === "object"
  #|     ? globalThis.__moonapPersonalSkillCache[String(skillId)]
  #|     : null;
  #|   const loadedHubSkill = globalThis.__moonapHubSkillCache && typeof globalThis.__moonapHubSkillCache === "object"
  #|     ? globalThis.__moonapHubSkillCache[String(skillId)]
  #|     : null;
  #|   if (loadedPersonal && typeof loadedPersonal === "object") {
  #|     const runtimeSpec = loadedPersonal.runtime_spec && typeof loadedPersonal.runtime_spec === "object"
  #|       ? loadedPersonal.runtime_spec
  #|       : {};
  #|     const runtimeFields = Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : [];
  #|     const mapFieldId = (name) => {
  #|       const normalized = String(name || "").trim().toLowerCase();
  #|       if (normalized === "read_count") return "readCount";
  #|       if (normalized === "read_length") return "readLength";
  #|       if (normalized === "random_seed") return "seed";
  #|       if (normalized === "n_rate") return "nRate";
  #|       if (normalized === "n_rate_per_mille") return "nRatePerMille";
  #|       if (normalized === "target_base") return "targetBase";
  #|       return normalized.replace(/[^a-z0-9]+([a-z0-9])/g, (_, char) => String(char || "").toUpperCase()) || "input";
  #|     };
  #|     set(scope, "1.1 Personal-SKILL-Set");
  #|     set(title, String(loadedPersonal.name || "Personal SKILL"));
  #|     set(summary, String(loadedPersonal.description || runtimeSpec.title || "Run this saved Personal SKILL locally without asking the LLM again."));
  #|     dialog.dataset.taskKind = String(loadedPersonal.task_kind || "");
  #|     for (const field of runtimeFields) {
  #|       const name = String(field?.name || "input");
  #|       const labelText = String(field?.label || name);
  #|       const defaultValue = field?.default == null ? "" : String(field.default);
  #|       const kind = String(field?.kind || field?.type || "text").toLowerCase();
  #|       const inputMode = kind === "float" || kind === "decimal"
  #|         ? "decimal"
  #|         : kind === "text"
  #|           ? "text"
  #|           : "numeric";
  #|       addField(mapFieldId(name), labelText, defaultValue, inputMode, name, String(field?.help || field?.description || ""), kind);
  #|     }
  #|     dialog.dataset.skillSource = "personal";
  #|     if (String(loadedPersonal.task_kind || "") === "large-file-generation" && outputTarget) {
  #|       outputTarget.style.display = "";
  #|     }
  #|     if (String(loadedPersonal.task_kind || "") === "large-fastq-analysis" && inputTarget) {
  #|       inputTarget.style.display = "";
  #|       dialog.dataset.inputKind = "fastq";
  #|       if (chooseInput) chooseInput.textContent = "Choose input FastQ file";
  #|     } else if (String(runtimeSpec.mode || loadedPersonal.runtime_mode || "").toLowerCase() === "file" && inputTarget) {
  #|       inputTarget.style.display = "";
  #|       dialog.dataset.inputKind = String(runtimeSpec.analysis_type || runtimeSpec.tool_kind || "file").toLowerCase();
  #|       if (chooseInput) chooseInput.textContent = "Choose input file";
  #|     }
  #|   } else if (loadedHubSkill && typeof loadedHubSkill === "object") {
  #|     const runtimeSpec = loadedHubSkill.runtime_spec && typeof loadedHubSkill.runtime_spec === "object"
  #|       ? loadedHubSkill.runtime_spec
  #|       : {};
  #|     const runtimeFields = Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : [];
  #|     const sourceKind = String(loadedHubSkill.source || "hub");
  #|     const scopeLabel = sourceKind === "local"
  #|       ? "1.2 Local-SKILL-Hub"
  #|       : "1.3 Cloud-SKILL-Hub";
  #|     const versionText = String(loadedHubSkill.version || "");
  #|     const pathText = pathRuntime && typeof pathRuntime.normalize === "function"
  #|       ? pathRuntime.normalize(loadedHubSkill.relative_path || loadedHubSkill.folder_path || "")
  #|       : String(loadedHubSkill.relative_path || loadedHubSkill.folder_path || "");
  #|     const metaLine = [versionText ? `version ${versionText}` : "", pathText ? `path ${pathText}` : ""].filter(Boolean).join(" | ");
  #|     set(scope, scopeLabel);
  #|     set(title, String(loadedHubSkill.name || "SKILL"));
  #|     const baseSummary = String(loadedHubSkill.description || "MoonAP SKILL entry.");
  #|     const installSummary = sourceKind === "cloud"
  #|       ? `${baseSummary}\n\nCloud SKILLs must be installed to Local-SKILL-Hub before they can be run. Click Install to Local SKILL Hub first, then open the installed Local SKILL to configure parameters and run it.`
  #|       : baseSummary;
  #|     set(summary, metaLine ? `${installSummary}\n${metaLine}` : installSummary);
  #|     dialog.dataset.taskKind = String(loadedHubSkill.task_kind || "");
  #|     dialog.dataset.skillSource = sourceKind;
  #|     const externalUrl = String(loadedHubSkill.external_url || loadedHubSkill.folder_url || loadedHubSkill.repository_url || "");
  #|     dialog.dataset.externalUrl = externalUrl;
  #|     if (openSourceButton && externalUrl) openSourceButton.style.display = "";
  #|     dialog.dataset.downloadUrl = String(loadedHubSkill.download_url || "");
  #|     dialog.dataset.folderPath = pathText;
  #|     if (sourceKind !== "cloud") {
  #|       for (const field of runtimeFields) {
  #|         const name = String(field?.name || "input");
  #|         const labelText = String(field?.label || name);
  #|         const defaultValue = field?.default == null ? "" : String(field.default);
  #|         const kind = String(field?.kind || field?.type || "text").toLowerCase();
  #|         const inputMode = kind === "float" || kind === "decimal"
  #|           ? "decimal"
  #|           : kind === "text"
  #|             ? "text"
  #|             : "numeric";
  #|         addField(name, labelText, defaultValue, inputMode, name, String(field?.help || field?.description || ""), kind);
  #|       }
  #|     }
  #|     if (sourceKind !== "cloud" && String(loadedHubSkill.task_kind || "") === "large-file-generation" && outputTarget) {
  #|       outputTarget.style.display = "";
  #|     }
  #|     if (sourceKind !== "cloud" && String(loadedHubSkill.task_kind || "") === "large-fastq-analysis" && inputTarget) {
  #|       inputTarget.style.display = "";
  #|       dialog.dataset.inputKind = "fastq";
  #|       if (chooseInput) chooseInput.textContent = "Choose input FastQ file";
  #|     } else if (sourceKind !== "cloud" && String(runtimeSpec.mode || loadedHubSkill.runtime_mode || "").toLowerCase() === "file" && inputTarget) {
  #|       inputTarget.style.display = "";
  #|       dialog.dataset.inputKind = String(runtimeSpec.analysis_type || runtimeSpec.tool_kind || "file").toLowerCase();
  #|       if (chooseInput) chooseInput.textContent = "Choose input file";
  #|     }
  #|     if (runButton) {
  #|       runButton.textContent = sourceKind === "cloud" ? "Install to Local SKILL Hub" : "Run";
  #|     }
  #|   } else if (skillId.includes("moonbit.fastq-generator")) {
  #|     set(scope, "SKILL-Hub / MoonBit");
  #|     set(title, "MoonBit FastQ Generator");
  #|     set(summary, "Ask the active LLM router to generate a MoonBit FastQ generator program, then run a real compile probe automatically.");
  #|     addField("readCount", "Read count", "10000");
  #|     addField("readLength", "Read length", "150");
  #|     addField("nRatePerMille", "N rate per mille", "10");
  #|     addField("seed", "Random seed", "42");
  #|   } else if (skillId.includes("fastq-generator")) {
  #|     const personal = skillId.includes("personal.fastq-generator");
  #|     set(scope, personal ? "1.1 Personal-SKILL-Set" : "SKILL-Hub / Research / Synthetic");
  #|     set(title, personal ? "Personal FastQ Generator" : "FastQ Generator");
  #|     set(summary, "Generate deterministic FastQ locally. Confirm parameters before MoonAP downloads the file.");
  #|     addField("readCount", "Read count", "10000");
  #|     addField("readLength", "Read length", "150");
  #|     addField("nRate", "N rate", "0.01", "decimal");
  #|     addField("seed", "Random seed", "42");
  #|   } else if (skillId.includes("moonbit-benchmark")) {
  #|     set(scope, "SKILL-Hub / MoonBit");
  #|     set(title, "MoonBit Benchmark Ladder");
  #|     set(summary, "Start from a tiny MoonBit task and step upward. Use this to check whether the active LLM router can stay in real MoonBit syntax before we try harder jobs.");
  #|     addField("benchmarkLevel", "Benchmark level (1-5)", "1");
  #|   } else if (skillId.includes("free-llm-eval")) {
  #|     set(scope, "SKILL-Hub / Experiments");
  #|     set(title, "Free LLM FastQ Eval");
  #|     set(summary, "Run the single task 'Generate a FastQ file generator.' against every enabled provider/model using the minimal prompt plus direct compile-repair strategy, then persist raw JSON plus a readable markdown summary.");
  #|     addField("evalRepairRounds", "Max repair rounds (1-3)", "2");
  #|   } else if (skillId.includes("fastq-base-counter")) {
  #|     set(scope, "SKILL-Hub / Research / FastQ");
  #|     set(title, "FastQ Base Counter");
  #|     set(summary, "Count a selected base in a browser-local FastQ file. Select a file with the + button before running.");
  #|     addField("targetBase", "Target base", "N", "text");
  #|   } else if (skillId === "personal") {
  #|     set(scope, "1.1 Personal-SKILL-Set");
  #|     set(title, "Personal-MoonAP-SKILL-Set");
  #|     set(summary, "Local reusable SKILL folders on this computer. Folder selection and save-to-local workflow are planned next.");
  #|   } else {
  #|     set(scope, "1.2 SKILL-Hub");
  #|     set(title, skillId.includes("gomoku") ? "Gomoku" : "Excel Max Amount Row");
  #|     set(summary, "This SKILL is registered in MoonAP-SKILL-Hub. Full execution UI will follow the FastQ MVP.");
  #|   }
  #|   if (chooseOutput) {
  #|     chooseOutput.onclick = async (event) => {
  #|       event.preventDefault();
  #|       event.stopPropagation();
  #|       try {
  #|         if (typeof window.showSaveFilePicker !== "function") {
  #|           throw new Error("This browser does not support selecting a streamed output file yet.");
  #|         }
  #|         const fileNameRuntime = globalThis.__moonapFileNameRuntime;
  #|         const outputInput = dialog.querySelector(`[data-param-name="output_name"]`);
  #|         const outputNameRaw = String(outputInput?.value || "moonap-output.fastq").trim() || "moonap-output.fastq";
  #|         const outputName = fileNameRuntime?.sanitize(outputNameRaw, "moonap-output.fastq") || "moonap-output.fastq";
  #|         const handle = await window.showSaveFilePicker({
  #|           suggestedName: outputName,
  #|           types: [{ description: "FastQ files", accept: { "text/plain": [".fastq", ".fq", ".txt"] } }]
  #|         });
  #|         dialog.__moonapOutputFileHandle = handle;
  #|         if (outputInput) outputInput.value = String(handle?.name || outputName);
  #|         set(outputStatus, `Selected: ${String(handle?.name || outputName)}`);
  #|       } catch (error) {
  #|         set(outputStatus, `Output file not selected: ${error instanceof Error ? error.message : String(error)}`);
  #|       }
  #|     };
  #|   }
  #|   if (chooseInput) {
  #|     chooseInput.onclick = async (event) => {
  #|       event.preventDefault();
  #|       event.stopPropagation();
  #|       try {
  #|         if (typeof window.showOpenFilePicker !== "function") {
  #|           throw new Error("This browser does not support selecting a local input file yet.");
  #|         }
  #|         const inputKind = String(dialog.dataset.inputKind || "").toLowerCase();
  #|         const pickerTypes = inputKind === "csv-summary"
  #|           ? [{ description: "CSV/TSV files", accept: { "text/plain": [".csv", ".tsv", ".txt"] } }]
  #|           : [{ description: "FastQ files", accept: { "text/plain": [".fastq", ".fq", ".txt", ".csv", ".tsv"] } }];
  #|         const handles = await window.showOpenFilePicker({
  #|           multiple: false,
  #|           types: pickerTypes
  #|         });
  #|         const handle = Array.isArray(handles) ? handles[0] : null;
  #|         if (!handle) throw new Error("No input file selected.");
  #|         dialog.__moonapInputFileHandle = handle;
  #|         set(inputStatus, `Selected: ${String(handle.name || "local input file")}`);
  #|       } catch (error) {
  #|         set(inputStatus, `Input file not selected: ${error instanceof Error ? error.message : String(error)}`);
  #|       }
  #|     };
  #|   }
  #|   dialog.showModal();
  #| }

///|
#cfg(target="js")
extern "js" fn browser_close_skill_dialog() -> Unit =
  #| () => document.querySelector("#skillDialog")?.close()

///|
#cfg(target="js")
extern "js" fn browser_dialog_skill_id() -> String =
  #| () => String(document.querySelector("#skillDialog")?.dataset?.skillId || "")

///|
#cfg(target="js")
extern "js" fn browser_dialog_param(name : String) -> String =
  #| (name) => {
  #|   const direct = document.querySelector(`#param-${String(name)}`);
  #|   if (direct) return String(direct.value || "");
  #|   const byDataName = document.querySelector(`[data-param-name="${String(name)}"]`);
  #|   return String(byDataName?.value || "");
  #| }

///|
#cfg(target="js")
extern "js" fn browser_dialog_param_int(name : String, fallback : Int) -> Int =
  #| (name, fallback) => {
  #|   const direct = document.querySelector(`#param-${String(name)}`);
  #|   const raw = direct
  #|     ? direct.value
  #|     : document.querySelector(`[data-param-name="${String(name)}"]`)?.value;
  #|   const value = Number.parseInt(String(raw || ""), 10);
  #|   return Number.isFinite(value) && value > 0 ? value : fallback;
  #| }

///|
#cfg(target="js")
extern "js" fn browser_dialog_skill_task_kind() -> String =
  #| () => String(document.querySelector("#skillDialog")?.dataset?.taskKind || "")

///|
#cfg(target="js")
extern "js" fn browser_dialog_skill_source() -> String =
  #| () => String(document.querySelector("#skillDialog")?.dataset?.skillSource || "")

///|
#cfg(target="js")
extern "js" fn browser_run_dialog_generic_skill(
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (onDone, onError) => {
  #|   try {
  #|     const dialog = document.querySelector("#skillDialog");
  #|     if (!dialog) throw new Error("No SKILL dialog is open.");
  #|     const skillId = String(dialog.dataset.skillId || "");
  #|     const sourceKind = String(dialog.dataset.skillSource || "");
  #|     const loadedPersonal = globalThis.__moonapPersonalSkillCache && typeof globalThis.__moonapPersonalSkillCache === "object"
  #|       ? globalThis.__moonapPersonalSkillCache[skillId]
  #|       : null;
  #|     const loadedHubSkill = globalThis.__moonapHubSkillCache && typeof globalThis.__moonapHubSkillCache === "object"
  #|       ? globalThis.__moonapHubSkillCache[skillId]
  #|       : null;
  #|     const skill = loadedPersonal && typeof loadedPersonal === "object" ? loadedPersonal : loadedHubSkill;
  #|     if (!skill || typeof skill !== "object") throw new Error("SKILL metadata is not loaded.");
  #|     const runtimeSpec = skill.runtime_spec && typeof skill.runtime_spec === "object" ? skill.runtime_spec : {};
  #|     const taskKind = String(skill.task_kind || dialog.dataset.taskKind || "generic");
  #|     const resultMode = String(runtimeSpec.result_mode || skill.result_mode || "text");
  #|     const runtimeMode = String(runtimeSpec.mode || skill.runtime_mode || "form");
  #|     const requestId = `skill-runtime-${Date.now()}`;
  #|     const runtimeRequestRecord = {
  #|       request_id: requestId,
  #|       run_id: "",
  #|       status: "ready-for-runtime",
  #|       task_kind: taskKind,
  #|       runtime_mode: runtimeMode,
  #|       result_mode: resultMode,
  #|       runtime_spec: runtimeSpec,
  #|       runtime_ui: runtimeSpec,
  #|       source_url: String(skill.source_url || skill.moonbit_source_url || ""),
  #|       wasm_url: String(skill.wasm_url || ""),
  #|       skill_id: skillId,
  #|       skill_source: sourceKind
  #|     };
  #|     globalThis.__moonapLastRuntimeRequest = runtimeRequestRecord;
  #|     globalThis.__moonapLastSkillRuntimeRequest = runtimeRequestRecord;
  #|     globalThis.__moonapLastRuntimeRequestText = JSON.stringify(runtimeRequestRecord, null, 2);
  #|     const runtimeInputs = {};
  #|     for (const node of Array.from(dialog.querySelectorAll("[data-param-name]"))) {
  #|       const name = String(node.dataset.paramName || "");
  #|       if (!name) continue;
  #|       const type = String(node.type || "").toLowerCase();
  #|       const raw = type === "checkbox" ? (node.checked ? "true" : "false") : String(node.value ?? "");
  #|       const field = (Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : []).find((item) => String(item?.name || "") === name) || {};
  #|       const fieldType = String(field.type || field.kind || type || "text").toLowerCase();
  #|       runtimeInputs[name] = fieldType === "int"
  #|         ? Number.parseInt(raw, 10)
  #|         : fieldType === "float" || fieldType === "decimal" || fieldType === "number"
  #|           ? Number.parseFloat(raw)
  #|           : fieldType === "bool" || fieldType === "boolean" || fieldType === "checkbox"
  #|             ? raw === "true"
  #|             : raw;
  #|     }
  #|     const buildPayload = (summary, displayText, resultKind = "text") => ({
  #|       run_id: "",
  #|       request_id: requestId,
  #|       status: "runtime-succeeded",
  #|       result_kind: resultKind,
  #|       runtime_inputs: runtimeInputs,
  #|       summary,
  #|       display_text: displayText,
  #|       stdout_text: `Browser-local SKILL runtime completed for ${requestId}.`,
  #|       download_name: resultKind.includes("report") ? "moonap-skill-report.txt" : "moonap-skill-result.txt",
  #|       download_content: displayText,
  #|       skill_id: skillId,
  #|       skill_source: sourceKind,
  #|       task_kind: taskKind,
  #|       accepted_for_skill: false
  #|     });
  #|     const postPayload = async (payload) => {
  #|       const response = await fetch("/api/task/execute", {
  #|         method: "POST",
  #|         headers: { "Content-Type": "application/json; charset=utf-8" },
  #|         body: JSON.stringify(payload)
  #|       });
  #|       const text = await response.text();
  #|       if (!response.ok) throw new Error(text || `Runtime execute failed (${response.status})`);
  #|       try {
  #|         globalThis.__moonapLastRuntimeResult = JSON.parse(text);
  #|       } catch {
  #|         globalThis.__moonapLastRuntimeResult = payload;
  #|       }
  #|       globalThis.__moonapLastSkillRuntimeRequest = runtimeRequestRecord;
  #|       globalThis.__moonapLastSkillRuntimeResult = globalThis.__moonapLastRuntimeResult;
  #|       globalThis.__moonapLastRuntimeResultText = text || JSON.stringify(payload, null, 2);
  #|       if (String(payload?.result_kind || "").includes("report") || resultMode === "report") {
  #|         globalThis.__moonapLastRuntimeReportPayload = payload;
  #|       }
  #|       return text;
  #|     };
  #|     const toolKind = String(runtimeSpec.tool_kind || runtimeSpec.analysis_type || "").toLowerCase();
  #|     const mode = String(runtimeSpec.mode || skill.runtime_mode || "").toLowerCase();
  #|     if (mode === "file" || toolKind === "csv-summary") {
  #|       const handle = dialog.__moonapInputFileHandle || null;
  #|       if (!handle || typeof handle.getFile !== "function") {
  #|         throw new Error("Choose an input file before running this SKILL.");
  #|       }
  #|       const file = await handle.getFile();
  #|       const analysisType = String(runtimeSpec.analysis_type || toolKind).toLowerCase();
  #|       if (analysisType !== "csv-summary") {
  #|         throw new Error(`Generic file SKILL analysis '${analysisType || "file"}' is not supported yet.`);
  #|       }
  #|       const delimiter = String(runtimeSpec.delimiter || "").toLowerCase() === "tab" || file.name.toLowerCase().endsWith(".tsv") ? "\t" : ",";
  #|       const text = await file.text();
  #|       const rows = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.trim() !== "");
  #|       const parseRow = (line) => {
  #|         const result = [];
  #|         let current = "";
  #|         let inQuotes = false;
  #|         for (let i = 0; i < line.length; i += 1) {
  #|           const ch = line[i];
  #|           const next = line[i + 1];
  #|           if (ch === "\"" && inQuotes && next === "\"") {
  #|             current += "\"";
  #|             i += 1;
  #|           } else if (ch === "\"") {
  #|             inQuotes = !inQuotes;
  #|           } else if (ch === delimiter && !inQuotes) {
  #|             result.push(current);
  #|             current = "";
  #|           } else {
  #|             current += ch;
  #|           }
  #|         }
  #|         result.push(current);
  #|         return result;
  #|       };
  #|       const header = rows.length > 0 ? parseRow(rows[0]).map((cell, index) => String(cell || `column_${index + 1}`).trim() || `column_${index + 1}`) : [];
  #|       const dataRows = rows.slice(1).map(parseRow);
  #|       const columnCount = header.length;
  #|       const missing = header.map((_name, index) => dataRows.filter((row) => String(row[index] ?? "").trim() === "").length);
  #|       const numericLines = [];
  #|       for (let col = 0; col < columnCount; col += 1) {
  #|         const nums = dataRows.map((row) => Number(String(row[col] ?? "").trim())).filter((value) => Number.isFinite(value));
  #|         if (nums.length === 0) continue;
  #|         const min = Math.min(...nums);
  #|         const max = Math.max(...nums);
  #|         const mean = nums.reduce((sum, value) => sum + value, 0) / nums.length;
  #|         numericLines.push(`${header[col]}: count=${nums.length}, min=${min}, max=${max}, mean=${mean.toFixed(4)}`);
  #|       }
  #|       const reportText = [
  #|         "MoonAP CSV Summary",
  #|         `request_id: ${requestId}`,
  #|         `file_name: ${file.name}`,
  #|         `file_size_bytes: ${file.size}`,
  #|         `row_count: ${dataRows.length}`,
  #|         `column_count: ${columnCount}`,
  #|         `columns: ${header.join(", ")}`,
  #|         `missing_values: ${header.map((name, index) => `${name}=${missing[index]}`).join(", ")}`,
  #|         "",
  #|         "Numeric columns:",
  #|         ...(numericLines.length ? numericLines : ["none"])
  #|       ].join("\n");
  #|       const payload = buildPayload(`Analyzed ${dataRows.length} CSV row(s) across ${columnCount} column(s).`, reportText, "csv-summary-report");
  #|       payload.file_name = file.name;
  #|       payload.file_size_bytes = file.size;
  #|       payload.llm_receives_file_contents = false;
  #|       onDone(await postPayload(payload));
  #|       return;
  #|     }
  #|     const renderTemplate = (template, values) => String(template || "").replace(/\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g, (_match, name) => {
  #|       const value = values[name];
  #|       return value === undefined || value === null ? "" : String(value);
  #|     });
  #|     const evaluateExpression = (expression, values) => {
  #|       const expr = String(expression || "").trim();
  #|       if (!expr) throw new Error("Computed output is missing an expression.");
  #|       if (!/^[A-Za-z0-9_+\-*/().,\s]+$/.test(expr)) throw new Error(`Unsupported characters in expression: ${expr}`);
  #|       const numericExpr = expr.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (name) => {
  #|         if (name === "pow") return "Math.pow";
  #|         if (name === "sqrt") return "Math.sqrt";
  #|         if (name === "abs") return "Math.abs";
  #|         if (name === "min") return "Math.min";
  #|         if (name === "max") return "Math.max";
  #|         if (!Object.prototype.hasOwnProperty.call(values, name)) throw new Error(`Unknown input in expression: ${name}`);
  #|         const n = Number(values[name]);
  #|         if (!Number.isFinite(n)) throw new Error(`Input ${name} is not numeric.`);
  #|         return `(${String(n)})`;
  #|       });
  #|       const result = Function(`"use strict"; return (${numericExpr});`)();
  #|       if (!Number.isFinite(Number(result))) throw new Error(`Expression produced a non-finite result: ${expr}`);
  #|       return Number(result);
  #|     };
  #|     let payload;
  #|     if (toolKind === "text-analysis") {
  #|       const sourceText = String(runtimeInputs.input_text || runtimeInputs.text || "");
  #|       const characters = sourceText.length;
  #|       const charactersNoSpaces = sourceText.replace(/\s/g, "").length;
  #|       const words = (sourceText.trim().match(/\S+/g) || []).length;
  #|       const lines = sourceText === "" ? 0 : sourceText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").length;
  #|       const readingMinutes = words / 200;
  #|       payload = buildPayload(`Analyzed ${words} word(s), ${characters} character(s), and ${lines} line(s).`, [
  #|         `Characters: ${characters}`,
  #|         `Characters without spaces: ${charactersNoSpaces}`,
  #|         `Words: ${words}`,
  #|         `Lines: ${lines}`,
  #|         `Estimated reading time: ${readingMinutes.toFixed(2)} minutes`
  #|       ].join("\n"));
  #|     } else if (toolKind === "json-formatter") {
  #|       const raw = String(runtimeInputs.json_text || runtimeInputs.input_text || "");
  #|       try {
  #|         payload = buildPayload("JSON is valid and formatted.", `Valid JSON: true\n\n${JSON.stringify(JSON.parse(raw), null, 2)}`);
  #|       } catch (error) {
  #|         payload = buildPayload("JSON is invalid.", `Valid JSON: false\nError: ${error instanceof Error ? error.message : String(error)}`);
  #|       }
  #|     } else {
  #|       const computedOutputs = Array.isArray(runtimeSpec.computed_outputs)
  #|         ? runtimeSpec.computed_outputs
  #|         : (Array.isArray(runtimeSpec.outputs) ? runtimeSpec.outputs : []);
  #|       const inputLines = Object.entries(runtimeInputs).map(([key, value]) => `${key}: ${String(value)}`);
  #|       if (computedOutputs.length > 0) {
  #|         const values = { ...runtimeInputs };
  #|         for (const output of computedOutputs) {
  #|           const name = String(output?.name || "").trim();
  #|           if (!name) continue;
  #|           const rawValue = evaluateExpression(output?.expression, values);
  #|           const decimals = Number.isFinite(Number(output?.decimals)) ? Math.max(0, Math.min(12, Number(output.decimals))) : null;
  #|           values[name] = decimals === null ? rawValue : Number(rawValue.toFixed(decimals));
  #|         }
  #|         const outputLines = computedOutputs.map((output) => {
  #|           const name = String(output?.name || "").trim();
  #|           if (!name) return "";
  #|           return `${String(output?.label || name)}: ${String(values[name])}`;
  #|         }).filter(Boolean);
  #|         payload = buildPayload(
  #|           runtimeSpec.summary_template ? renderTemplate(runtimeSpec.summary_template, values) : (outputLines[0] || "MoonAP calculated the form result."),
  #|           runtimeSpec.result_template ? renderTemplate(runtimeSpec.result_template, values) : [...inputLines, ...outputLines].join("\n")
  #|         );
  #|       } else if (Object.prototype.hasOwnProperty.call(runtimeInputs, "celsius")) {
  #|         const celsius = Number(runtimeInputs.celsius);
  #|         const fahrenheit = celsius * 9 / 5 + 32;
  #|         payload = buildPayload(`Converted ${celsius} Celsius to ${fahrenheit.toFixed(2)} Fahrenheit.`, `Celsius: ${celsius}\nFahrenheit: ${fahrenheit.toFixed(2)}`);
  #|       } else if (Object.prototype.hasOwnProperty.call(runtimeInputs, "number_a") && Object.prototype.hasOwnProperty.call(runtimeInputs, "number_b")) {
  #|         const a = Number(runtimeInputs.number_a);
  #|         const b = Number(runtimeInputs.number_b);
  #|         payload = buildPayload(`Calculated ${a} + ${b} = ${a + b}.`, `First number: ${a}\nSecond number: ${b}\nSum: ${a + b}`);
  #|       } else {
  #|         payload = buildPayload("MoonAP recorded browser-local SKILL input.", inputLines.join("\n") || "No inputs were provided.");
  #|       }
  #|     }
  #|     onDone(await postPayload(payload));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_run_dialog_large_file_generation(
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (onDone, onError) => {
  #|   try {
  #|     const dialog = document.querySelector("#skillDialog");
  #|     if (!dialog) throw new Error("No SKILL dialog is open.");
  #|     const readParam = (name, fallback = "") => {
  #|       const node = dialog.querySelector(`[data-param-name="${String(name)}"]`);
  #|       if (!node) return String(fallback);
  #|       if (String(node.type || "").toLowerCase() === "checkbox") return node.checked ? "true" : "false";
  #|       return String(node.value ?? fallback);
  #|     };
  #|     const fileNameRuntime = globalThis.__moonapFileNameRuntime;
  #|     const outputNameRaw = readParam("output_name", "moonap-output.fastq").trim() || "moonap-output.fastq";
  #|     let outputName = fileNameRuntime?.sanitize(outputNameRaw, "moonap-output.fastq") || "moonap-output.fastq";
  #|     const targetSizeMb = Math.max(1, Math.min(1024, Number.parseInt(readParam("target_size_mb", "128"), 10) || 128));
  #|     const readLength = Math.max(20, Math.min(20000, Number.parseInt(readParam("read_length", "150"), 10) || 150));
  #|     const headerPrefix = fileNameRuntime?.sanitizeToken(readParam("read_header_prefix", "moonap_read"), "moonap_read") || "moonap_read";
  #|     const nRate = Math.max(0, Math.min(1, Number.parseFloat(readParam("n_rate", "0.01")) || 0.01));
  #|     const qualityChar = readParam("quality_char", "I").slice(0, 1) || "I";
  #|     let seed = Math.max(0, Number.parseInt(readParam("random_seed", "42"), 10) || 42) >>> 0;
  #|     if (typeof window.showSaveFilePicker !== "function") {
  #|       throw new Error("This browser does not support streamed save-file output yet.");
  #|     }
  #|     const selectedFileHandle = dialog.__moonapOutputFileHandle || null;
  #|     if (!selectedFileHandle) {
  #|       throw new Error("Choose output file/location before running this large-file generator.");
  #|     }
  #|     dialog.close();
  #|     const fileHandle = selectedFileHandle;
  #|     outputName = String(fileHandle?.name || outputName);
  #|     const writable = await fileHandle.createWritable();
  #|     const encoder = new TextEncoder();
  #|     const chunkSize = 4 * 1024 * 1024;
  #|     const targetBytes = targetSizeMb * 1024 * 1024;
  #|     const bases = ["A", "C", "G", "T"];
  #|     const rand = () => {
  #|       seed = (seed * 1664525 + 1013904223) >>> 0;
  #|       return seed / 4294967296;
  #|     };
  #|     const materializeRecord = (index) => {
  #|       let seq = "";
  #|       for (let i = 0; i < readLength; i += 1) {
  #|         seq += rand() < nRate ? "N" : bases[Math.floor(rand() * bases.length)];
  #|       }
  #|       return `@${headerPrefix}_${index}\n${seq}\n+\n${qualityChar.repeat(readLength)}\n`;
  #|     };
  #|     const started = performance.now();
  #|     let bytesWritten = 0;
  #|     let readIndex = 0;
  #|     let chunkCount = 0;
  #|     const setText = (selector, value) => {
  #|       const node = document.querySelector(selector);
  #|       if (node) node.textContent = String(value ?? "");
  #|     };
  #|     const emitState = (status) => {
  #|       const progress = targetBytes === 0 ? 100 : Math.min(100, Math.floor((bytesWritten / targetBytes) * 100));
  #|       const payload = {
  #|         status,
  #|         result_kind: "streamed-file",
  #|         file_name: outputName,
  #|         target_size_mb: targetSizeMb,
  #|         bytes_written: bytesWritten,
  #|         bytes_processed: bytesWritten,
  #|         target_bytes: targetBytes,
  #|         reads_seen: readIndex,
  #|         chunk_count: chunkCount,
  #|         progress_percent: progress,
  #|         llm_receives_file_contents: false
  #|       };
  #|       setText("#state", JSON.stringify(payload, null, 2));
  #|       setText("#processProvider", "Personal SKILL");
  #|       setText("#processStage", "skill-runtime");
  #|       setText("#processResult", status === "runtime-succeeded" ? "succeeded" : "running");
  #|       setText("#processLog", status === "runtime-succeeded"
  #|         ? `Generated ${outputName} with ${readIndex} FastQ reads.`
  #|         : `Writing ${outputName}: ${progress}%`);
  #|       const panel = document.querySelector("#resultPanel");
  #|       panel?.classList.add("is-open");
  #|       setText("#resultStatus", status);
  #|       setText("#resultTitle", "Browser-local large-file generation");
  #|       setText("#metricFile", outputName);
  #|       setText("#metricReads", String(readIndex));
  #|       const fill = document.querySelector("#progressFill");
  #|       if (fill) fill.style.width = `${progress}%`;
  #|       globalThis.__moonapLargeFileProgressRuntime?.update?.(payload);
  #|     };
  #|     emitState("streaming-write");
  #|     while (bytesWritten < targetBytes) {
  #|       const records = [];
  #|       let chunkBytes = 0;
  #|       while (chunkBytes < chunkSize && bytesWritten + chunkBytes < targetBytes) {
  #|         const record = materializeRecord(readIndex);
  #|         const bytes = encoder.encode(record);
  #|         if (bytes.length > targetBytes - bytesWritten - chunkBytes) break;
  #|         records.push(record);
  #|         chunkBytes += bytes.length;
  #|         readIndex += 1;
  #|       }
  #|       if (records.length === 0) break;
  #|       const chunkText = records.join("");
  #|       await writable.write(chunkText);
  #|       bytesWritten += encoder.encode(chunkText).length;
  #|       chunkCount += 1;
  #|       emitState("streaming-write");
  #|       await new Promise((resolve) => setTimeout(resolve, 0));
  #|     }
  #|     await writable.close();
  #|     const elapsedMs = Math.round(performance.now() - started);
  #|     const result = {
  #|       status: "runtime-succeeded",
  #|       result_kind: "streamed-file",
  #|       file_name: outputName,
  #|       bytes_written: bytesWritten,
  #|       reads_seen: readIndex,
  #|       chunk_count: chunkCount,
  #|       elapsed_ms: elapsedMs,
  #|       llm_receives_file_contents: false,
  #|       summary: `Generated ${outputName} locally with browser streaming output (${readIndex} FastQ reads).`
  #|     };
  #|     emitState("runtime-succeeded");
  #|     onDone(JSON.stringify(result, null, 2));
  #|   } catch (error) {
  #|     globalThis.__moonapLargeFileProgressRuntime?.error?.(error instanceof Error ? error.message : String(error));
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_run_dialog_large_fastq_analysis(
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (onDone, onError) => {
  #|   try {
  #|     const dialog = document.querySelector("#skillDialog");
  #|     if (!dialog) throw new Error("No SKILL dialog is open.");
  #|     const readParam = (name, fallback = "") => {
  #|       const node = dialog.querySelector(`[data-param-name="${String(name)}"]`);
  #|       if (!node) return String(fallback);
  #|       if (String(node.type || "").toLowerCase() === "checkbox") return node.checked ? "true" : "false";
  #|       return String(node.value ?? fallback);
  #|     };
  #|     let fileHandle = dialog.__moonapInputFileHandle || null;
  #|     if (!fileHandle) {
  #|       if (typeof window.showOpenFilePicker !== "function") {
  #|         throw new Error("This browser does not support selecting a local input file yet.");
  #|       }
  #|       const handles = await window.showOpenFilePicker({
  #|         multiple: false,
  #|         types: [{ description: "FastQ files", accept: { "text/plain": [".fastq", ".fq", ".txt"] } }]
  #|       });
  #|       fileHandle = Array.isArray(handles) ? handles[0] : null;
  #|     }
  #|     if (!fileHandle || typeof fileHandle.getFile !== "function") throw new Error("Choose an input FastQ file first.");
  #|     dialog.close();
  #|     const file = await fileHandle.getFile();
  #|     const chunkSize = 4 * 1024 * 1024;
  #|     const parsedPreviewReads = Number.parseInt(readParam("max_preview_reads", "3"), 10);
  #|     const maxPreviewReads = Math.max(0, Math.min(20, Number.isFinite(parsedPreviewReads) ? parsedPreviewReads : 3));
  #|     const validateStructure = !["false", "0", "no", "off"].includes(readParam("validate_fastq_structure", "true").trim().toLowerCase());
  #|     const countBases = !["false", "0", "no", "off"].includes(readParam("count_bases", "true").trim().toLowerCase());
  #|     let offset = 0;
  #|     let carry = "";
  #|     let chunkCount = 0;
  #|     let lineCount = 0;
  #|     let readCount = 0;
  #|     let totalBases = 0;
  #|     let aCount = 0, cCount = 0, gCount = 0, tCount = 0, nCount = 0, otherBaseCount = 0;
  #|     let minReadLength = null;
  #|     let maxReadLength = 0;
  #|     let malformedRecordCount = 0;
  #|     const previewReads = [];
  #|     const recordLines = [];
  #|     const setText = (selector, value) => {
  #|       const node = document.querySelector(selector);
  #|       if (node) node.textContent = String(value ?? "");
  #|     };
  #|     const countSequence = (sequence) => {
  #|       const length = sequence.length;
  #|       totalBases += length;
  #|       minReadLength = minReadLength == null ? length : Math.min(minReadLength, length);
  #|       maxReadLength = Math.max(maxReadLength, length);
  #|       if (!countBases) return;
  #|       for (let i = 0; i < sequence.length; i += 1) {
  #|         const ch = sequence[i].toUpperCase();
  #|         if (ch === "A") aCount += 1;
  #|         else if (ch === "C") cCount += 1;
  #|         else if (ch === "G") gCount += 1;
  #|         else if (ch === "T") tCount += 1;
  #|         else if (ch === "N") nCount += 1;
  #|         else otherBaseCount += 1;
  #|       }
  #|     };
  #|     const consumeRecord = (header, sequence, plus, quality) => {
  #|       const malformed = validateStructure && (!String(header || "").startsWith("@") || String(plus || "") !== "+" || String(sequence || "").length !== String(quality || "").length);
  #|       if (malformed) malformedRecordCount += 1;
  #|       readCount += 1;
  #|       countSequence(String(sequence || ""));
  #|       if (previewReads.length < maxPreviewReads) previewReads.push(`${header}\n${String(sequence || "").slice(0, 240)}\n${plus}\n${String(quality || "").slice(0, 240)}`);
  #|     };
  #|     const consumeLine = (line) => {
  #|       lineCount += 1;
  #|       recordLines.push(String(line || ""));
  #|       if (recordLines.length === 4) {
  #|         consumeRecord(recordLines[0], recordLines[1], recordLines[2], recordLines[3]);
  #|         recordLines.length = 0;
  #|       }
  #|     };
  #|     const emitState = (status) => {
  #|       const progress = file.size === 0 ? 100 : Math.min(100, Math.floor((offset / file.size) * 100));
  #|       const payload = {
  #|         status,
  #|         result_kind: "large-fastq-report",
  #|         file_name: file.name,
  #|         file_size_bytes: file.size,
  #|         bytes_processed: offset,
  #|         chunk_count: chunkCount,
  #|         line_count: lineCount,
  #|         reads_seen: readCount,
  #|         total_bases: totalBases,
  #|         matching_line_count: nCount,
  #|         progress_percent: progress,
  #|         llm_receives_file_contents: false
  #|       };
  #|       setText("#state", JSON.stringify(payload, null, 2));
  #|       setText("#processProvider", String(dialog.dataset.skillSource || "") === "personal" ? "Personal SKILL" : "Local SKILL");
  #|       setText("#processStage", "skill-runtime");
  #|       setText("#processResult", status === "runtime-succeeded" ? "succeeded" : "running");
  #|       setText("#processLog", status === "runtime-succeeded" ? `Analyzed ${file.name}: ${readCount} FastQ reads.` : `Analyzing ${file.name}: ${progress}%`);
  #|       document.querySelector("#resultPanel")?.classList.add("is-open");
  #|       setText("#resultStatus", status);
  #|       setText("#resultTitle", "Browser-local large FastQ analysis");
  #|       setText("#metricFile", file.name);
  #|       setText("#metricProcessed", `${Math.floor(offset / 1048576)} MB`);
  #|       setText("#metricReads", String(readCount));
  #|       setText("#metricTarget", String(nCount));
  #|       setText("#metricBases", String(totalBases));
  #|       const fill = document.querySelector("#progressFill");
  #|       if (fill) fill.style.width = `${progress}%`;
  #|       globalThis.__moonapLargeFileProgressRuntime?.update?.(payload);
  #|     };
  #|     emitState("streaming-fastq-analysis");
  #|     const started = performance.now();
  #|     while (offset < file.size) {
  #|       const end = Math.min(offset + chunkSize, file.size);
  #|       const text = await file.slice(offset, end).text();
  #|       const merged = carry + text;
  #|       const hasFinalNewline = merged.endsWith("\n") || merged.endsWith("\r");
  #|       const lines = merged.split(/\r?\n/);
  #|       carry = hasFinalNewline ? "" : String(lines.pop() || "");
  #|       if (hasFinalNewline && lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
  #|       for (const line of lines) consumeLine(line);
  #|       offset = end;
  #|       chunkCount += 1;
  #|       emitState("streaming-fastq-analysis");
  #|       await new Promise((resolve) => setTimeout(resolve, 0));
  #|     }
  #|     if (carry !== "") consumeLine(carry);
  #|     if (recordLines.length > 0) malformedRecordCount += 1;
  #|     const elapsedMs = Math.round(performance.now() - started);
  #|     const avgReadLength = readCount === 0 ? 0 : totalBases / readCount;
  #|     const result = {
  #|       status: "runtime-succeeded",
  #|       result_kind: "large-fastq-report",
  #|       file_name: file.name,
  #|       file_size_bytes: file.size,
  #|       chunk_count: chunkCount,
  #|       total_lines: lineCount,
  #|       estimated_read_count: readCount,
  #|       total_bases: totalBases,
  #|       A_count: aCount,
  #|       C_count: cCount,
  #|       G_count: gCount,
  #|       T_count: tCount,
  #|       N_count: nCount,
  #|       other_base_count: otherBaseCount,
  #|       min_read_length: minReadLength == null ? 0 : minReadLength,
  #|       max_read_length: maxReadLength,
  #|       average_read_length: Number(avgReadLength.toFixed(2)),
  #|       malformed_record_count: malformedRecordCount,
  #|       elapsed_ms: elapsedMs,
  #|       preview_reads: previewReads,
  #|       llm_receives_file_contents: false,
  #|       request_id: `skill-runtime-${Date.now()}`,
  #|       runtime_mode: "file",
  #|       result_mode: "report",
  #|       download_name: `${String(file.name || "fastq-analysis").replace(/[^a-zA-Z0-9._-]+/g, "-")}.analysis.json`,
  #|       download_content: JSON.stringify({
  #|         file_name: file.name,
  #|         file_size_bytes: file.size,
  #|         chunk_count: chunkCount,
  #|         total_lines: lineCount,
  #|         estimated_read_count: readCount,
  #|         total_bases: totalBases,
  #|         A_count: aCount,
  #|         C_count: cCount,
  #|         G_count: gCount,
  #|         T_count: tCount,
  #|         N_count: nCount,
  #|         other_base_count: otherBaseCount,
  #|         min_read_length: minReadLength == null ? 0 : minReadLength,
  #|         max_read_length: maxReadLength,
  #|         average_read_length: Number(avgReadLength.toFixed(2)),
  #|         malformed_record_count: malformedRecordCount,
  #|         preview_reads: previewReads
  #|       }, null, 2),
  #|       summary: `Analyzed ${file.name} locally: ${readCount} FastQ reads, ${totalBases} bases.`
  #|     };
  #|     globalThis.__moonapLastRuntimeResult = result;
  #|     globalThis.__moonapLastRuntimeReportPayload = result;
  #|     emitState("runtime-succeeded");
  #|     onDone(JSON.stringify(result, null, 2));
  #|   } catch (error) {
  #|     globalThis.__moonapLargeFileProgressRuntime?.error?.(error instanceof Error ? error.message : String(error));
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_dialog_external_url() -> String =
  #| () => String(document.querySelector("#skillDialog")?.dataset?.externalUrl || "")

///|
#cfg(target="js")
extern "js" fn browser_dialog_download_url() -> String =
  #| () => String(document.querySelector("#skillDialog")?.dataset?.downloadUrl || "")

///|
#cfg(target="js")
extern "js" fn browser_dialog_folder_path() -> String =
  #| () => String(document.querySelector("#skillDialog")?.dataset?.folderPath || "")

///|
#cfg(target="js")
extern "js" fn browser_open_external_url(url : String) -> Unit =
  #| (url) => {
  #|   const text = String(url || "").trim();
  #|   if (!text) return;
  #|   window.open(text, "_blank", "noopener,noreferrer");
  #| }

///|
#cfg(target="js")
extern "js" fn browser_on_dialog_run(handler : () -> Unit) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id === "dialogRun") {
  #|     event.preventDefault();
  #|     event.stopPropagation();
  #|     globalThis.__moonapAllowDownload = "dialog-run";
  #|     handler();
  #|     setTimeout(() => {
  #|       if (globalThis.__moonapAllowDownload === "dialog-run") globalThis.__moonapAllowDownload = "";
  #|     }, 0);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_on_dialog_open_source(handler : () -> Unit) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id === "dialogOpenSource") {
  #|     event.preventDefault();
  #|     event.stopPropagation();
  #|     try {
  #|       handler();
  #|     } catch (error) {
  #|       console.error("MoonAP source open failed:", error);
  #|       alert(`MoonAP source open failed: ${error instanceof Error ? error.message : String(error)}`);
  #|     }
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_on_dialog_cancel(handler : () -> Unit) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id === "dialogCancel") {
  #|     event.preventDefault();
  #|     handler();
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_open_llm_dialog() -> Unit =
  #| () => {
  #|   const parseModelList = (raw) => {
  #|     const seen = new Set();
  #|     const values = String(raw || "")
  #|       .split(/\r?\n|,/)
  #|       .map((item) => String(item || "").trim())
  #|       .filter((item) => item.length > 0);
  #|     return values.filter((item) => {
  #|       const key = item.toLowerCase();
  #|       if (seen.has(key)) return false;
  #|       seen.add(key);
  #|       return true;
  #|     });
  #|   };
  #|   const normalizeProviderEntry = (item) => {
  #|     const key = String(item?.key || "").toLowerCase();
  #|     const model = String(item?.model || "").trim();
  #|     const apiKey = String(item?.apiKey || "").trim();
  #|     const enabled = Boolean(item?.enabled);
  #|     const custom = Boolean(item?.custom);
  #|     const providerName = String(item?.providerName || "").trim();
  #|     const test_status = String(item?.test_status || "").trim();
  #|     const test_message = String(item?.test_message || "").trim();
  #|     const tested_at = String(item?.tested_at || "").trim();
  #|     let baseUrl = String(item?.baseUrl || "").trim();
  #|     if (custom) {
  #|       baseUrl = String(item?.baseUrl || "").trim();
  #|     } else if (key === "gemini") {
  #|       baseUrl = "https://generativelanguage.googleapis.com";
  #|     } else if (key === "openrouter") {
  #|       baseUrl = "https://openrouter.ai/api/v1";
  #|     } else if (key === "zai") {
  #|       baseUrl = "https://open.bigmodel.cn/api/paas/v4";
  #|     } else if (key === "siliconflow") {
  #|       baseUrl = "https://api.siliconflow.cn/v1";
  #|     } else if (key === "openai") {
  #|       baseUrl = "moonap://llm-sim";
  #|     } else if (key === "nvidia") {
  #|       baseUrl = "https://integrate.api.nvidia.com/v1";
  #|     }
  #|     return { key, providerName, custom, enabled, model, baseUrl, apiKey, test_status, test_message, tested_at };
  #|   };
  #|   const providerPriority = (provider, model) => {
  #|     const key = String(provider || "").toLowerCase();
  #|     const name = String(model || "").toLowerCase();
  #|     let score = 0;
  #|     if (name.includes("gpt-5.4")) score += 1200;
  #|     else
  #|     if (name.includes("llama-4-maverick-17b-128e-instruct")) score += 1000;
  #|     else if (name.includes("glm-5.1")) score += 900;
  #|     else if (name.includes("gemini-3-flash-preview")) score += 840;
  #|     else if (name.includes("gemini-3.1-flash-lite")) score += 820;
  #|     else if (name.includes("gemini-2.5-flash")) score += 800;
  #|     else if (name.includes("gemini-2.5-flash-lite")) score += 780;
  #|     else if (name.includes("gemini-2-flash-lite")) score += 765;
  #|     else if (name.includes("gemini-2-flash")) score += 760;
  #|     else if (name.includes("glm-5-turbo")) score += 780;
  #|     else if (name === "glm-5" || name.includes("glm-5 ")) score += 770;
  #|     else if (name.includes("glm-4.7")) score += 740;
  #|     else if (name.includes("glm-4-flashx-250414")) score += 735;
  #|     else if (name.includes("glm-4-long")) score += 730;
  #|     else if (name.includes("glm-4.6")) score += 720;
  #|     else if (name.includes("glm-4.5-airx")) score += 700;
  #|     else if (name.includes("glm-4.5-air")) score += 690;
  #|     else if (name.includes("glm-4.7-flashx")) score += 680;
  #|     else if (name.includes("glm-4.7-flash")) score += 670;
  #|     else if (name.includes("qwen2.5-coder-32b-instruct")) score += 620;
  #|     else if (name.includes("llama-4-maverick-17b-128e-instruct")) score += 610;
  #|     else if (name.includes("llama-4-scout-17b-16e-instruct")) score += 600;
  #|     else if (name.includes("llama-3.3-70b-instruct")) score += 590;
  #|     else if (name.includes("qwen2-7b-instruct")) score += 520;
  #|     else if (name.includes("glm-4-9b-chat")) score += 510;
  #|     else if (name.includes("internlm2_5-7b-chat")) score += 500;
  #|     else if (name.includes("mistral-7b-instruct")) score += 490;
  #|     else if (name.includes("chatglm3-6b")) score += 470;
  #|     else if (name.includes("qwen3-coder:free")) score += 300;
  #|     else if (name.includes("nemotron-3-super-120b-a12b:free")) score += 280;
  #|     else if (name.includes("openrouter/free")) score += 200;
  #|     else if (name.includes("openrouter/auto")) score += 180;
  #|     if (key !== "openai" && key !== "nvidia" && key !== "zai" && key !== "gemini" && key !== "siliconflow" && key !== "openrouter") score += 130;
  #|     else if (key === "openai") score += 120;
  #|     else if (key === "nvidia") score += 90;
  #|     else if (key === "zai") score += 70;
  #|     else if (key === "gemini") score += 40;
  #|     else if (key === "siliconflow") score += 30;
  #|     else if (key === "openrouter") score -= 1000;
  #|     return score;
  #|   };
  #|   const sortMoonBitProviders = (providers) => [...providers].sort((a, b) => providerPriority(b?.key, b?.model) - providerPriority(a?.key, a?.model));
  #|   const expandProviderSpec = (spec) => {
  #|     const models = parseModelList(spec?.modelsText || spec?.model || "");
  #|     if (models.length === 0) {
  #|       return [{ key: spec?.key, providerName: spec?.providerName, custom: Boolean(spec?.custom), enabled: Boolean(spec?.enabled), model: "", baseUrl: spec?.baseUrl, apiKey: spec?.apiKey }];
  #|     }
  #|     return models.map((model) => ({ key: spec?.key, providerName: spec?.providerName, custom: Boolean(spec?.custom), enabled: Boolean(spec?.enabled), model, baseUrl: spec?.baseUrl, apiKey: spec?.apiKey }));
  #|   };
  #|   const readRouter = () => {
  #|     try {
  #|       const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
  #|       return parsed && typeof parsed === "object" ? parsed : {};
  #|     } catch (error) {
  #|       console.warn("MoonAP reset invalid LLM router storage:", error);
  #|       try { localStorage.removeItem("moonap.llm.router.v1"); } catch {}
  #|       return {};
  #|     }
  #|   };
  #|   const routerProfileVersion = 6;
  #|   const providerConfigs = [
  #|     {
  #|       key: "openai",
  #|       enabled: false,
  #|       baseUrl: "moonap://llm-sim",
  #|       models: [
  #|         { id: "gpt-5.4", enabled: false }
  #|       ]
  #|     },
  #|     {
  #|       key: "nvidia",
  #|       enabled: false,
  #|       baseUrl: "https://integrate.api.nvidia.com/v1",
  #|       models: [
  #|         { id: "meta/llama-4-maverick-17b-128e-instruct", enabled: true }
  #|       ]
  #|     },
  #|     {
  #|       key: "zai",
  #|       enabled: false,
  #|       baseUrl: "https://open.bigmodel.cn/api/paas/v4",
  #|       models: [
  #|         { id: "glm-5.1", enabled: true }
  #|       ]
  #|     },
  #|     {
  #|       key: "gemini",
  #|       enabled: false,
  #|       baseUrl: "https://generativelanguage.googleapis.com",
  #|       models: [
  #|         { id: "gemini-3-flash-preview", enabled: false },
  #|         { id: "gemini-3.1-flash-lite-preview", enabled: false },
  #|         { id: "gemini-2.5-flash", enabled: false }
  #|       ]
  #|     },
  #|     {
  #|       key: "siliconflow",
  #|       enabled: false,
  #|       baseUrl: "https://api.siliconflow.cn/v1",
  #|       models: [
  #|         { id: "Qwen/Qwen2.5-Coder-32B-Instruct", enabled: false }
  #|       ]
  #|     },
  #|     {
  #|       key: "openrouter",
  #|       enabled: false,
  #|       baseUrl: "https://openrouter.ai/api/v1",
  #|       models: [
  #|         { id: "openrouter/auto", enabled: false }
  #|       ]
  #|     }
  #|   ];
  #|   const defaults = providerConfigs.flatMap((spec) =>
  #|     spec.models.map((model) => ({
  #|       key: spec.key,
  #|       enabled: Boolean(spec.enabled && model.enabled),
  #|       model: model.id,
  #|       baseUrl: spec.baseUrl,
  #|       apiKey: spec.key === "openai" ? "llm-sim-mode" : ""
  #|     }))
  #|   );
  #|   const saved = readRouter();
  #|   const mergeWithDefaults = (savedProviders, defaultProviders) => {
  #|     const savedNormalized = Array.isArray(savedProviders) ? savedProviders.map(normalizeProviderEntry) : [];
  #|     const defaultNormalized = defaultProviders.map(normalizeProviderEntry);
  #|     const keys = providerConfigs.map((item) => item.key);
  #|     const merged = [];
  #|     for (const key of keys) {
  #|       const defaultsForKey = defaultNormalized.filter((item) => item.key === key && String(item.model || "").trim() !== "");
  #|       const savedForKey = savedNormalized.filter((item) => item.key === key && String(item.model || "").trim() !== "");
  #|       const shared = savedForKey[0] || defaultsForKey[0] || { key, enabled: false, baseUrl: "", apiKey: "" };
  #|       const useSavedToggles = Number(saved?.profile_version || 0) >= routerProfileVersion;
  #|       const seen = new Map();
  #|       for (const item of defaultsForKey) {
  #|         const savedMatch = savedForKey.find((entry) => String(entry.model || "").toLowerCase() === String(item.model || "").toLowerCase());
  #|         seen.set(String(item.model || "").toLowerCase(), {
  #|           ...item,
  #|           enabled: useSavedToggles ? Boolean(savedMatch?.enabled) : Boolean(item.enabled),
  #|           baseUrl: String(shared.baseUrl || item.baseUrl || ""),
  #|           apiKey: String(shared.apiKey || ""),
  #|           test_status: String(savedMatch?.test_status || ""),
  #|           test_message: String(savedMatch?.test_message || ""),
  #|           tested_at: String(savedMatch?.tested_at || "")
  #|         });
  #|       }
  #|       merged.push(...Array.from(seen.values()));
  #|     }
  #|     return sortMoonBitProviders(merged);
  #|   };
  #|   const savedNormalized = Array.isArray(saved.providers) ? saved.providers.map(normalizeProviderEntry) : [];
  #|   const knownKeys = new Set(providerConfigs.map((item) => item.key));
  #|   const savedCustom = savedNormalized.find((item) => item.custom) || savedNormalized.find((item) => item.key && !knownKeys.has(item.key));
  #|   const providers = sortMoonBitProviders(mergeWithDefaults(saved.providers, defaults).concat(savedCustom ? [savedCustom] : []));
  #|   try {
  #|     localStorage.setItem("moonap.llm.router.v1", JSON.stringify({ providers, cursor: Number.isFinite(saved.cursor) ? saved.cursor : 0, savedAt: saved.savedAt || new Date().toISOString(), profile_version: routerProfileVersion }));
  #|   } catch {}
  #|   const grouped = {};
  #|   for (const item of providers) {
  #|     const key = String(item.key || "");
  #|     if (!grouped[key]) grouped[key] = [];
  #|     grouped[key].push(item);
  #|   }
  #|   const escapeHtml = (value) => String(value || "")
  #|     .replaceAll("&", "&amp;")
  #|     .replaceAll("<", "&lt;")
  #|     .replaceAll(">", "&gt;")
  #|     .replaceAll("\"", "&quot;");
  #|   const bind = (name, ids) => {
  #|     const items = grouped[name] || defaults.filter((entry) => entry.key === name) || [];
  #|     const item = items[0] || {};
  #|     const enable = document.querySelector(`#${ids.enable}`);
  #|     const model = document.querySelector(`#${ids.model}`);
  #|     const base = document.querySelector(`#${ids.base}`);
  #|     const key = document.querySelector(`#${ids.key}`);
  #|     if (enable) enable.checked = items.some((entry) => Boolean(entry.enabled));
  #|     if (model) {
  #|       model.innerHTML = items.map((entry, index) => {
  #|         const modelId = String(entry.model || "");
  #|         const checkboxId = `routerModelCheck-${name}-${index}`;
  #|         return `<label class="router-model-option" for="${checkboxId}"><input id="${checkboxId}" type="checkbox" data-provider="${name}" value="${escapeHtml(modelId)}" ${entry.enabled ? "checked" : ""} /><span>${escapeHtml(modelId)}</span></label>`;
  #|       }).join("");
  #|     }
  #|     if (base) base.value = String(item.baseUrl || "");
  #|     if (key) key.value = String(item.apiKey || "");
  #|     const syncDisabled = () => {
  #|       const disabled = !Boolean(enable?.checked);
  #|       model?.querySelectorAll("input[type=checkbox]")?.forEach((node) => { node.disabled = disabled; });
  #|       if (model) model.style.opacity = disabled ? "0.55" : "1";
  #|     };
  #|     enable?.addEventListener("change", syncDisabled);
  #|     syncDisabled();
  #|   };
  #|   bind("openai", { enable: "routerEnableOpenAI", model: "routerModelsOpenAI", base: "routerBaseOpenAI", key: "routerKeyOpenAI" });
  #|   bind("nvidia", { enable: "routerEnableNVIDIA", model: "routerModelsNVIDIA", base: "routerBaseNVIDIA", key: "routerKeyNVIDIA" });
  #|   bind("zai", { enable: "routerEnableZAI", model: "routerModelsZAI", base: "routerBaseZAI", key: "routerKeyZAI" });
  #|   bind("gemini", { enable: "routerEnableGemini", model: "routerModelsGemini", base: "routerBaseGemini", key: "routerKeyGemini" });
  #|   bind("siliconflow", { enable: "routerEnableSiliconFlow", model: "routerModelsSiliconFlow", base: "routerBaseSiliconFlow", key: "routerKeySiliconFlow" });
  #|   bind("openrouter", { enable: "routerEnableOpenRouter", model: "routerModelsOpenRouter", base: "routerBaseOpenRouter", key: "routerKeyOpenRouter" });
  #|   const customEnable = document.querySelector("#routerEnableCustom");
  #|   const customProvider = document.querySelector("#routerProviderCustom");
  #|   const customModel = document.querySelector("#routerModelCustom");
  #|   const customBase = document.querySelector("#routerBaseCustom");
  #|   const customKey = document.querySelector("#routerKeyCustom");
  #|   if (customEnable) customEnable.checked = Boolean(savedCustom?.enabled);
  #|   if (customProvider) customProvider.value = String(savedCustom?.providerName || savedCustom?.key || "");
  #|   if (customModel) customModel.value = String(savedCustom?.model || "");
  #|   if (customBase) customBase.value = String(savedCustom?.baseUrl || "");
  #|   if (customKey) customKey.value = String(savedCustom?.apiKey || "");
  #|   const syncCustomDisabled = () => {
  #|     const disabled = !Boolean(customEnable?.checked);
  #|     [customProvider, customModel, customBase, customKey].forEach((node) => {
  #|       if (node) node.disabled = disabled;
  #|     });
  #|   };
  #|   customEnable?.addEventListener("change", syncCustomDisabled);
  #|   syncCustomDisabled();
  #|   const setRouterTab = (name) => {
  #|     const tabName = name === "simulated" ? "simulated" : "real";
  #|     document.querySelectorAll("[data-router-tab]").forEach((node) => {
  #|       const active = node.getAttribute("data-router-tab") === tabName;
  #|       node.classList.toggle("is-active", active);
  #|       node.setAttribute("aria-selected", active ? "true" : "false");
  #|     });
  #|     document.querySelectorAll("[data-router-panel]").forEach((node) => {
  #|       node.classList.toggle("is-active", node.getAttribute("data-router-panel") === tabName);
  #|     });
  #|     try { localStorage.setItem("moonap.llm.router.activeTab", tabName); } catch {}
  #|   };
  #|   document.querySelectorAll("[data-router-tab]").forEach((node) => {
  #|     node.addEventListener("click", () => setRouterTab(node.getAttribute("data-router-tab")));
  #|   });
  #|   setRouterTab(localStorage.getItem("moonap.llm.router.activeTab") === "simulated" ? "simulated" : "real");
  #|   document.querySelectorAll(".router-row").forEach((node) => {
  #|     node.style.display = "";
  #|   });
  #|   const verification = localStorage.getItem("moonap.formalVerification") === "true";
  #|   const toggle = document.querySelector("#routerFormalVerification");
  #|   if (toggle) toggle.checked = verification;
  #|   const repairFeedbackRaw = localStorage.getItem("moonap.repairFeedbackMode") !== "summary";
  #|   const repairFeedbackToggle = document.querySelector("#routerRepairUseRawCompilerOutput");
  #|   if (repairFeedbackToggle) repairFeedbackToggle.checked = repairFeedbackRaw;
  #|   document.querySelector("#llmDialog")?.showModal();
  #| }

///|
#cfg(target="js")
extern "js" fn browser_llm_is_configured() -> Bool =
  #| () => {
  #|   let saved = {};
  #|   try {
  #|     const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
  #|     saved = parsed && typeof parsed === "object" ? parsed : {};
  #|   } catch (error) {
  #|     console.warn("MoonAP reset invalid LLM router storage:", error);
  #|     try { localStorage.removeItem("moonap.llm.router.v1"); } catch {}
  #|   }
  #|   const providers = Array.isArray(saved.providers) ? saved.providers : [];
  #|   return providers.some((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed");
  #| }

///|
#cfg(target="js")
extern "js" fn browser_llm_summary() -> String =
  #| () => {
  #|   let saved = {};
  #|   try {
  #|     const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
  #|     saved = parsed && typeof parsed === "object" ? parsed : {};
  #|   } catch (error) {
  #|     console.warn("MoonAP reset invalid LLM router storage:", error);
  #|     try { localStorage.removeItem("moonap.llm.router.v1"); } catch {}
  #|   }
  #|   const providers = Array.isArray(saved.providers) ? saved.providers.filter((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed") : [];
  #|   if (providers.length === 0) return "not configured";
  #|   const labels = providers.map((item) => `${item.providerName || item.key}/${item.model}`);
  #|   return `${providers.length} provider(s): ${labels.join(", ")}`;
  #| }

///|
#cfg(target="js")
extern "js" fn browser_render_onboarding() -> Unit =
  #| () => {
  #|   const root = document.querySelector("#onboardingCard");
  #|   if (!root) return;
  #|   if (globalThis.__moonapMinimalShell !== false) {
  #|     root.innerHTML = "";
  #|     root.classList.remove("is-open");
  #|     root.style.display = "none";
  #|     return;
  #|   }
  #|   const benchmarkPrompt = "Write the smallest valid cmd/main/main.mbt that compiles under wasm-gc and returns the string hello moonbit. Return only the file contents.";
  #|   const textarea = document.querySelector("#message");
  #|   const currentValue = String(textarea?.value || "").trim();
  #|   if (textarea && (currentValue === "" || textarea.classList.contains("suggested"))) {
  #|     textarea.value = benchmarkPrompt;
  #|     textarea.classList.add("suggested");
  #|   }
  #|   const readRouter = () => {
  #|     try {
  #|       const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
  #|       return parsed && typeof parsed === "object" ? parsed : {};
  #|     } catch {
  #|       return {};
  #|     }
  #|   };
  #|   const saved = readRouter();
  #|   const providers = Array.isArray(saved.providers) ? saved.providers : [];
  #|   const usable = providers.filter((item) => Boolean(item?.enabled) && String(item?.apiKey || "").trim() !== "" && String(item?.test_status || "") !== "failed");
  #|   const primary = usable[0];
  #|   const primaryLabel = primary ? `${String(primary.providerName || primary.key || "")}/${String(primary.model || "")}` : "Real API provider";
  #|   let benchmark = {};
  #|   try { benchmark = JSON.parse(globalThis.__moonapBenchmarkAssessment || "{}"); } catch { benchmark = {}; }
  #|   const passedLevel = Number(benchmark?.pass ? benchmark.level || 0 : 0);
  #|   const nextBenchmarkLevel = passedLevel >= 1 && passedLevel < 3 ? passedLevel + 1 : 1;
  #|   const nextBenchmarkLabel = passedLevel >= 1 && passedLevel < 3 ? `Run Benchmark L${nextBenchmarkLevel}` : "Run Benchmark L1";
  #|   const benchmarkSummary = passedLevel >= 1
  #|     ? `MoonAP already verified Benchmark L${passedLevel}. Recommended next step: run L${nextBenchmarkLevel} to keep climbing the quality ladder.`
  #|     : "MoonAP can now route requests through checked providers. Recommended next step: run MoonBit Benchmark Ladder at Level 1 to verify the full generate -> compile flow.";
  #|   const isReady = usable.length > 0;
  #|   root.classList.add("is-open");
  #|   root.innerHTML = isReady
  #|     ? `
  #|       <strong>LLM Router is ready</strong>
  #|       <small>${benchmarkSummary} Current primary route: ${primaryLabel}</small>
  #|       <div class="onboarding-actions">
  #|         <button id="onboardingRunBenchmark" type="button">${nextBenchmarkLabel}</button>
  #|         <button id="onboardingOpenSkill" class="secondary" type="button">Open SKILL</button>
  #|         <button id="onboardingEditLLM" class="secondary" type="button">Edit LLM Router</button>
  #|         <button id="onboardingOpenLog" class="secondary" type="button">Open Runtime Log</button>
  #|         <button id="onboardingDownloadLog" class="secondary" type="button">Download Log</button>
  #|       </div>`
  #|     : `
  #|       <strong>Connect an LLM to begin</strong>
  #|       <small>Configure a Real API provider to begin. Simulated API is still available inside LLM Router for local development and demos. After Save, MoonAP will test the checked models and show the usable order in Details.</small>
  #|       <div class="onboarding-actions">
  #|         <button id="onboardingEditLLM" type="button">Open LLM Router</button>
  #|         <button id="onboardingOpenSkill" class="secondary" type="button">Browse SKILL</button>
  #|         <button id="onboardingOpenLog" class="secondary" type="button">Open Runtime Log</button>
  #|       </div>`;
  #| }

///|
#cfg(target="js")
extern "js" fn browser_open_runtime_log() -> Unit =
  #| () => {
  #|   window.open("/api/logs/moonap-runtime.log", "_blank", "noopener,noreferrer");
  #| }

///|
#cfg(target="js")
extern "js" fn browser_download_runtime_log() -> Unit =
  #| async () => {
  #|   try {
  #|     const response = await fetch("/api/logs/moonap-runtime.log");
  #|     const text = await response.text();
  #|     const blob = new Blob([String(text || "")], { type: "text/plain;charset=utf-8" });
  #|     const url = URL.createObjectURL(blob);
  #|     const link = document.createElement("a");
  #|     link.href = url;
  #|     link.download = "moonap-runtime.log";
  #|     document.body.append(link);
  #|     link.click();
  #|     link.remove();
  #|     setTimeout(() => URL.revokeObjectURL(url), 1000);
  #|   } catch (error) {
  #|     throw new Error(`Runtime log download failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_export_last_artifact_bundle(
  handler : (String) -> Unit,
) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "exportSkillBundle") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   const artifact = globalThis.__moonapLastArtifact;
  #|   if (!artifact) {
  #|     alert("No generated artifact is ready to export.");
  #|     return;
  #|   }
  #|   const folder = String(artifact?.skill?.folder_name || "personal-fastq-generator");
  #|   const source = String(artifact?.moonbit_source || "");
  #|   const compileReport = globalThis.__moonapLastCompileReport || null;
  #|   const compileOk = compileReport && typeof compileReport === "object" && compileReport.ok === true;
  #|   const compileStatus = compileReport && typeof compileReport === "object"
  #|     ? (compileReport.ok ? "done" : "failed")
  #|     : "pending";
  #|   const skillMd = [
  #|     "# Personal FastQ Generator",
  #|     "",
  #|     "MoonBit source captured by MoonAP from a real LLM response.",
  #|     "",
  #|     "## Current state",
  #|     "- LLM code generation: done",
  #|     `- MoonBit to Wasm compile: ${compileStatus}`,
  #|     "- Browser-local runtime execution: pending",
  #|     "",
  #|     "## Default parameters",
  #|     "- `read_count = 10000`",
  #|     "- `read_length = 150`",
  #|     "- `n_rate = 0.01`",
  #|     "- `random_seed = 42`",
  #|     "",
  #|     "This source bundle was exported from MoonAP for the next implementation step."
  #|   ].join("\\n");
  #|   const manifest = {
  #|     bundle_version: "moonap.source-bundle.v1",
  #|     folder_name: folder,
  #|     exported_at: new Date().toISOString(),
  #|     runtime_ready: false,
  #|     compile_ready: Boolean(compileOk),
  #|     compile_report: compileReport,
  #|     files: [
  #|       { path: "SKILL.md", content: skillMd },
  #|       { path: "moonap.skill.json", content: JSON.stringify(artifact, null, 2) },
  #|       { path: "program/main.mbt", content: source }
  #|     ]
  #|   };
  #|   const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json;charset=utf-8" });
  #|   const url = URL.createObjectURL(blob);
  #|   const link = document.createElement("a");
  #|   link.href = url;
  #|   link.download = `${folder}.moonap-source-bundle.json`;
  #|   document.body.append(link);
  #|   link.click();
  #|   link.remove();
  #|   setTimeout(() => URL.revokeObjectURL(url), 0);
  #|   try { handler(String(folder)); } catch (error) { console.error("MoonAP export handler failed:", error); }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_on_compile_artifact(handler : () -> Unit) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "compileArtifact") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   try {
  #|     handler();
  #|   } catch (error) {
  #|     console.error("MoonAP compile probe handler failed:", error);
  #|     alert(`MoonAP compile probe failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_on_llm_save(handler : () -> Unit) -> Unit =
  #| (handler) => document.addEventListener("click", async (event) => {
  #|   if (event.target?.id !== "llmSave") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   const routerProfileVersion = 6;
  #|   const parseModelList = (raw) => {
  #|     const seen = new Set();
  #|     const values = String(raw || "")
  #|       .split(/\r?\n|,/)
  #|       .map((item) => String(item || "").trim())
  #|       .filter((item) => item.length > 0);
  #|     return values.filter((item) => {
  #|       const key = item.toLowerCase();
  #|       if (seen.has(key)) return false;
  #|       seen.add(key);
  #|       return true;
  #|     });
  #|   };
  #|   const normalizeProviderEntry = (item) => {
  #|     const key = String(item?.key || "").toLowerCase();
  #|     const model = String(item?.model || "").trim();
  #|     const apiKey = String(item?.apiKey || "").trim();
  #|     const enabled = Boolean(item?.enabled);
  #|     const custom = Boolean(item?.custom);
  #|     const providerName = String(item?.providerName || "").trim();
  #|     const test_status = String(item?.test_status || "").trim();
  #|     const test_message = String(item?.test_message || "").trim();
  #|     const tested_at = String(item?.tested_at || "").trim();
  #|     let baseUrl = String(item?.baseUrl || "").trim();
  #|     if (custom) {
  #|       baseUrl = String(item?.baseUrl || "").trim();
  #|     } else if (key === "gemini") {
  #|       baseUrl = "https://generativelanguage.googleapis.com";
  #|     } else if (key === "openrouter") {
  #|       baseUrl = "https://openrouter.ai/api/v1";
  #|     } else if (key === "zai") {
  #|       baseUrl = "https://open.bigmodel.cn/api/paas/v4";
  #|     } else if (key === "siliconflow") {
  #|       baseUrl = "https://api.siliconflow.cn/v1";
  #|     } else if (key === "openai") {
  #|       baseUrl = "moonap://llm-sim";
  #|     } else if (key === "nvidia") {
  #|       baseUrl = "https://integrate.api.nvidia.com/v1";
  #|     }
  #|     return { key, providerName, custom, enabled, model, baseUrl, apiKey, test_status, test_message, tested_at };
  #|   };
  #|   const providerPriority = (provider, model) => {
  #|     const key = String(provider || "").toLowerCase();
  #|     const name = String(model || "").toLowerCase();
  #|     let score = 0;
  #|     if (name.includes("gpt-5.4")) score += 1200;
  #|     else
  #|     if (name.includes("llama-4-maverick-17b-128e-instruct")) score += 1000;
  #|     else if (name.includes("glm-5.1")) score += 900;
  #|     else if (name.includes("gemini-3-flash-preview")) score += 840;
  #|     else if (name.includes("gemini-3.1-flash-lite")) score += 820;
  #|     else if (name.includes("gemini-2.5-flash")) score += 800;
  #|     else if (name.includes("gemini-2.5-flash-lite")) score += 780;
  #|     else if (name.includes("gemini-2-flash-lite")) score += 765;
  #|     else if (name.includes("gemini-2-flash")) score += 760;
  #|     else if (name.includes("glm-5-turbo")) score += 780;
  #|     else if (name === "glm-5" || name.includes("glm-5 ")) score += 770;
  #|     else if (name.includes("glm-4.7")) score += 740;
  #|     else if (name.includes("glm-4-flashx-250414")) score += 735;
  #|     else if (name.includes("glm-4-long")) score += 730;
  #|     else if (name.includes("glm-4.6")) score += 720;
  #|     else if (name.includes("glm-4.5-airx")) score += 700;
  #|     else if (name.includes("glm-4.5-air")) score += 690;
  #|     else if (name.includes("glm-4.7-flashx")) score += 680;
  #|     else if (name.includes("glm-4.7-flash")) score += 670;
  #|     else if (name.includes("qwen2.5-coder-32b-instruct")) score += 620;
  #|     else if (name.includes("llama-4-maverick-17b-128e-instruct")) score += 610;
  #|     else if (name.includes("llama-4-scout-17b-16e-instruct")) score += 600;
  #|     else if (name.includes("llama-3.3-70b-instruct")) score += 590;
  #|     else if (name.includes("qwen2-7b-instruct")) score += 520;
  #|     else if (name.includes("glm-4-9b-chat")) score += 510;
  #|     else if (name.includes("internlm2_5-7b-chat")) score += 500;
  #|     else if (name.includes("mistral-7b-instruct")) score += 490;
  #|     else if (name.includes("chatglm3-6b")) score += 470;
  #|     else if (name.includes("qwen3-coder:free")) score += 300;
  #|     else if (name.includes("nemotron-3-super-120b-a12b:free")) score += 280;
  #|     else if (name.includes("openrouter/free")) score += 200;
  #|     else if (name.includes("openrouter/auto")) score += 180;
  #|     if (key !== "openai" && key !== "nvidia" && key !== "zai" && key !== "gemini" && key !== "siliconflow" && key !== "openrouter") score += 130;
  #|     else if (key === "openai") score += 120;
  #|     else if (key === "nvidia") score += 90;
  #|     else if (key === "zai") score += 70;
  #|     else if (key === "gemini") score += 40;
  #|     else if (key === "siliconflow") score += 30;
  #|     else if (key === "openrouter") score -= 1000;
  #|     return score;
  #|   };
  #|   const sortMoonBitProviders = (providers) => [...providers].sort((a, b) => providerPriority(b?.key, b?.model) - providerPriority(a?.key, a?.model));
  #|   const collectCheckedModels = (selector) => Array.from(document.querySelectorAll(`${selector} input[type=checkbox]:checked`)).map((node) => String(node.value || "").trim()).filter((value) => value.length > 0);
  #|   const normalizeCustomKey = (value) => {
  #|     const raw = String(value || "").trim() || "custom";
  #|     const key = raw.toLowerCase().replace(/[^a-z0-9._:-]+/g, "-").replace(/^-+|-+$/g, "") || "custom";
  #|     return ["openai", "nvidia", "zai", "gemini", "siliconflow", "openrouter"].includes(key) ? `custom-${key}` : key;
  #|   };
  #|   const customProviderName = String(document.querySelector("#routerProviderCustom")?.value || "").trim() || "custom";
  #|   const customModelName = String(document.querySelector("#routerModelCustom")?.value || "").trim();
  #|   const providerSpecs = [
  #|     { key: "openai", enabled: Boolean(document.querySelector("#routerEnableOpenAI")?.checked), models: collectCheckedModels("#routerModelsOpenAI"), baseUrl: String(document.querySelector("#routerBaseOpenAI")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyOpenAI")?.value || "").trim() },
  #|     { key: "nvidia", enabled: Boolean(document.querySelector("#routerEnableNVIDIA")?.checked), models: collectCheckedModels("#routerModelsNVIDIA"), baseUrl: String(document.querySelector("#routerBaseNVIDIA")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyNVIDIA")?.value || "").trim() },
  #|     { key: "zai", enabled: Boolean(document.querySelector("#routerEnableZAI")?.checked), models: collectCheckedModels("#routerModelsZAI"), baseUrl: String(document.querySelector("#routerBaseZAI")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyZAI")?.value || "").trim() },
  #|     { key: "gemini", enabled: Boolean(document.querySelector("#routerEnableGemini")?.checked), models: collectCheckedModels("#routerModelsGemini"), baseUrl: String(document.querySelector("#routerBaseGemini")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyGemini")?.value || "").trim() },
  #|     { key: "siliconflow", enabled: Boolean(document.querySelector("#routerEnableSiliconFlow")?.checked), models: collectCheckedModels("#routerModelsSiliconFlow"), baseUrl: String(document.querySelector("#routerBaseSiliconFlow")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeySiliconFlow")?.value || "").trim() },
  #|     { key: "openrouter", enabled: Boolean(document.querySelector("#routerEnableOpenRouter")?.checked), models: collectCheckedModels("#routerModelsOpenRouter"), baseUrl: String(document.querySelector("#routerBaseOpenRouter")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyOpenRouter")?.value || "").trim() },
  #|     { key: normalizeCustomKey(customProviderName), providerName: customProviderName, custom: true, enabled: Boolean(document.querySelector("#routerEnableCustom")?.checked), models: customModelName ? [customModelName] : [], baseUrl: String(document.querySelector("#routerBaseCustom")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyCustom")?.value || "").trim() }
  #|   ];
  #|   const providers = providerSpecs.flatMap((item) => item.models.map((model) => ({
  #|     key: item.key,
  #|     providerName: item.providerName || "",
  #|     custom: Boolean(item.custom),
  #|     enabled: Boolean(item.enabled),
  #|     model,
  #|     baseUrl: item.baseUrl,
  #|     apiKey: item.apiKey
  #|   })));
  #|   const sortedProviders = sortMoonBitProviders(providers.map(normalizeProviderEntry));
  #|   const active = sortedProviders.filter((item) => item.enabled && item.apiKey && item.model && item.baseUrl);
  #|   if (active.length === 0) {
  #|     alert("Please enable at least one provider, choose or enter a model, and fill endpoint URL plus API key.");
  #|     return;
  #|   }
  #|   const statusNode = document.querySelector("#routerTestStatus");
  #|   const saveButton = document.querySelector("#llmSave");
  #|   const dialog = document.querySelector("#llmDialog");
  #|   const setStatus = (text) => {
  #|     if (statusNode) statusNode.textContent = String(text || "");
  #|   };
  #|   const openDetails = () => {
  #|     const root = document.querySelector(".app-shell");
  #|     const button = document.querySelector("#detailsToggle");
  #|     if (!root || !button) return;
  #|     root.classList.add("details-open");
  #|     button.setAttribute("aria-expanded", "true");
  #|   };
  #|   const updateProcess = (provider, stage, result, logText) => {
  #|     const setText = (selector, value) => {
  #|       const node = document.querySelector(selector);
  #|       if (node) node.textContent = String(value);
  #|     };
  #|     setText("#processProvider", provider || "-");
  #|     setText("#processStage", stage || "-");
  #|     setText("#processResult", result || "waiting");
  #|     setText("#processLog", logText || "");
  #|   };
  #|   const proxyPost = async (url, headers, body) => {
  #|     const envelope = [
  #|       `URL\t${String(url)}`,
  #|       ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
  #|       "BODY",
  #|       String(body)
  #|     ].join("\n");
  #|     const controller = new AbortController();
  #|     const timeout = setTimeout(() => controller.abort(), 30000);
  #|     try {
  #|       const response = await fetch("/api/llm/proxy", {
  #|         method: "POST",
  #|         headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|         body: envelope,
  #|         signal: controller.signal
  #|       });
  #|       const text = await response.text();
  #|       let json = {};
  #|       try {
  #|         json = JSON.parse(text);
  #|       } catch {
  #|         const plain = String(text || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  #|         throw new Error(`Provider returned non-JSON (${response.status}): ${(plain || text || "").slice(0, 180)}`);
  #|       }
  #|       if (!response.ok) {
  #|         const detail = json?.error?.detail ? ` ${String(json.error.detail)}` : "";
  #|         throw new Error((json?.error?.message || `LLM request failed (${response.status})`) + detail);
  #|       }
  #|       return json;
  #|     } catch (error) {
  #|       if (error && error.name === "AbortError") {
  #|         throw new Error("Timed out after 30s");
  #|       }
  #|       throw error;
  #|     } finally {
  #|       clearTimeout(timeout);
  #|     }
  #|   };
  #|   const testProvider = async (llm) => {
  #|     if (llm.key === "gemini") {
  #|       const url = `${llm.baseUrl}/v1beta/models/${encodeURIComponent(llm.model)}:generateContent`;
  #|       const json = await proxyPost(url, {
  #|         "Content-Type": "application/json",
  #|         "x-goog-api-key": String(llm.apiKey || "")
  #|       }, JSON.stringify({
  #|         contents: [{ role: "user", parts: [{ text: "Reply with OK." }] }],
  #|         generationConfig: { temperature: 0, maxOutputTokens: 8 }
  #|       }));
  #|       const text = (json?.candidates?.[0]?.content?.parts || []).map((part) => String(part?.text || "")).join(" ").trim();
  #|       return text || "OK";
  #|     }
  #|     let urlBase = String(llm.baseUrl || "").trim();
  #|     urlBase = urlBase.endsWith("/") ? urlBase.slice(0, -1) : urlBase;
  #|     let url = `${urlBase}/chat/completions`;
  #|     if (llm.key === "zai") {
  #|       if (urlBase.endsWith("/chat/completions")) {
  #|         url = urlBase;
  #|       } else if (!urlBase.includes("/api/paas/v4")) {
  #|         url = `${urlBase}/api/paas/v4/chat/completions`;
  #|       }
  #|     }
  #|     const headers = {
  #|       "Content-Type": "application/json",
  #|       "Authorization": `Bearer ${String(llm.apiKey || "")}`
  #|     };
  #|     if (llm.key === "openrouter") {
  #|       headers["HTTP-Referer"] = "http://127.0.0.1:3000";
  #|       headers["X-Title"] = "MoonAP";
  #|     }
  #|     const json = await proxyPost(url, headers, JSON.stringify({
  #|       model: llm.model,
  #|       messages: [{ role: "user", content: "Reply with OK." }],
  #|       temperature: 0,
  #|       max_tokens: 8
  #|     }));
  #|     const text = String(json?.choices?.[0]?.message?.content || "").trim();
  #|     return text || "OK";
  #|   };
  #|   localStorage.setItem("moonap.formalVerification", String(Boolean(document.querySelector("#routerFormalVerification")?.checked)));
  #|   localStorage.setItem("moonap.repairFeedbackMode", Boolean(document.querySelector("#routerRepairUseRawCompilerOutput")?.checked) ? "raw" : "summary");
  #|   const enabled = localStorage.getItem("moonap.formalVerification") === "true";
  #|   const mainToggle = document.querySelector("#formalVerification");
  #|   if (mainToggle) mainToggle.checked = enabled;
  #|   if (saveButton) {
  #|     saveButton.disabled = true;
  #|     saveButton.textContent = "Saving...";
  #|   }
  #|   setStatus("Saving router config and testing enabled LLM APIs...");
  #|   openDetails();
  #|   dialog?.close();
  #|   updateProcess(
  #|     "LLM Router",
  #|     "llm-api-test",
  #|     "running",
  #|     "Saving router config and testing enabled LLM APIs..."
  #|   );
  #|   try {
  #|     const lines = [];
  #|     const results = [];
  #|     for (const item of active) {
  #|       const label = `${item.providerName || item.key}/${item.model}`;
  #|       lines.push(`[running] ${label}`);
  #|       setStatus(lines.join("\n"));
  #|       updateProcess("LLM Router", "llm-api-test", "running", lines.join("\n"));
  #|       try {
  #|         const result = await testProvider(item);
  #|         lines[lines.length - 1] = `[ok] ${label} -> ${String(result).slice(0, 80)}`;
  #|         results.push({ key: item.key, model: item.model, ok: true, message: String(result || "OK") });
  #|       } catch (error) {
  #|         const message = error instanceof Error ? error.message : String(error);
  #|         lines[lines.length - 1] = `[failed] ${label} -> ${message}`;
  #|         results.push({ key: item.key, model: item.model, ok: false, message });
  #|       }
  #|       setStatus(lines.join("\n"));
  #|       updateProcess("LLM Router", "llm-api-test", "running", lines.join("\n"));
  #|     }
  #|     const testedAt = new Date().toISOString();
  #|     const providersWithHealth = sortedProviders.map((item) => {
  #|       const match = results.find((result) => result.key === item.key && result.model === item.model);
  #|       if (!item.enabled || !item.apiKey || !item.model) {
  #|         return { ...item, test_status: "skipped", test_message: "Disabled or incomplete.", tested_at: testedAt };
  #|       }
  #|       if (!match) {
  #|         return { ...item, test_status: "failed", test_message: "No test result captured.", tested_at: testedAt };
  #|       }
  #|       return { ...item, test_status: match.ok ? "ok" : "failed", test_message: match.message, tested_at: testedAt };
  #|     });
  #|     const usable = providersWithHealth.filter((item) => item.enabled && item.apiKey && item.test_status === "ok");
  #|     const orderLines = usable.length === 0
  #|       ? ["No enabled provider passed the API test."]
  #|       : usable.map((item, index) => `${index + 1}. ${item.providerName || item.key}/${item.model}`);
  #|     const summary = lines.join("\n") + "\n\nFinal usable provider order:\n" + orderLines.join("\n");
  #|     localStorage.setItem("moonap.llm.router.v1", JSON.stringify({
  #|       providers: providersWithHealth,
  #|       cursor: 0,
  #|       savedAt: testedAt,
  #|       last_test_summary: summary,
  #|       profile_version: routerProfileVersion
  #|     }));
  #|     setStatus(summary);
  #|     updateProcess(
  #|       usable.length === 0 ? "LLM Router" : usable.map((item) => `${item.providerName || item.key}/${item.model}`).join(", "),
  #|       "llm-api-test",
  #|       usable.length === 0 ? "failed" : "succeeded",
  #|       summary
  #|     );
  #|     handler();
  #|   } catch (error) {
  #|     console.error("MoonAP llm save handler failed:", error);
  #|     const message = error instanceof Error ? error.message : String(error);
  #|     setStatus(message);
  #|     updateProcess("LLM Router", "llm-api-test", "failed", message);
  #|     alert(`MoonAP LLM save failed: ${message}`);
  #|   } finally {
  #|     if (saveButton) {
  #|       saveButton.disabled = false;
  #|       saveButton.textContent = "Save";
  #|     }
  #|   }
  #| })

///|
extern "js" fn browser_on_llm_cancel(handler : () -> Unit) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "llmCancel") return;
  #|   event.preventDefault();
  #|   document.querySelector("#llmDialog")?.close();
  #|   try {
  #|     handler();
  #|   } catch (error) {
  #|     console.error("MoonAP llm cancel handler failed:", error);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_generate_moonbit_artifact(
  task_title : String,
  prompt : String,
  simple_mode : Bool,
  formal_verification : Bool,
  knowledge_pack : String,
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (taskTitle, prompt, simpleMode, formalVerification, knowledgePack, onDone, onError) => {
  #|   try {
  #|     const readRouter = () => {
  #|       try {
  #|         const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
  #|         return parsed && typeof parsed === "object" ? parsed : {};
  #|       } catch (error) {
  #|         console.warn("MoonAP reset invalid LLM router storage:", error);
  #|         try { localStorage.removeItem("moonap.llm.router.v1"); } catch {}
  #|         return {};
  #|       }
  #|     };
  #|     const saved = readRouter();
  #|     const providers = Array.isArray(saved.providers) ? saved.providers.filter((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed") : [];
  #|     if (providers.length === 0) {
  #|       throw new Error("No enabled LLM provider is available in the router.");
  #|     }
  #|     const cursor = Number.isFinite(saved.cursor) ? saved.cursor : 0;
  #|     const start = ((cursor % providers.length) + providers.length) % providers.length;
  #|     const ordered = providers.slice(start).concat(providers.slice(0, start));
  #|     const lowerTaskTitle = String(taskTitle || "").toLowerCase();
  #|     const lowerPrompt = String(prompt || "").toLowerCase();
  #|     const inferTaskKind = () => {
  #|       if (lowerPrompt.includes("fastq") || lowerTaskTitle.includes("fastq")) return "fastq-generator";
  #|       if (lowerPrompt.includes("excel") || lowerPrompt.includes("xlsx") || lowerPrompt.includes("spreadsheet")) return "excel-analysis";
  #|       if ((lowerPrompt.includes("browser") && lowerPrompt.includes("game")) || lowerTaskTitle.includes("game")) return "browser-game";
  #|       return "generic-moonbit";
  #|     };
  #|     const taskAdapterLines = (taskKind) => {
  #|       if (taskKind === "fastq-generator") {
  #|         return [
  #|           "- generate one or more valid FastQ records",
  #|           "- each record should include header, sequence, plus line, and quality line"
  #|         ];
  #|       }
  #|       if (taskKind === "excel-analysis") {
  #|         return [
  #|           "- assume the task logic should work on spreadsheet-like tabular input",
  #|           "- keep the result representation simple and easy for MoonAP to inspect or display"
  #|         ];
  #|       }
  #|       if (taskKind === "browser-game") {
  #|         return [
  #|           "- keep the gameplay loop simple and direct",
  #|           "- keep the program structure easy to compile and run inside MoonAP"
  #|         ];
  #|       }
  #|       return [];
  #|     };
  #|     const updatePrompts = (modeText, systemPromptText, userPromptText) => {
  #|       const setText = (selector, value) => {
  #|         const node = document.querySelector(selector);
  #|         if (node) node.textContent = String(value);
  #|       };
  #|       setText("#promptMode", modeText || "No LLM prompt captured yet.");
  #|       setText("#promptSystem", systemPromptText || "No LLM prompt captured yet.");
  #|       setText("#promptUser", userPromptText || "No LLM prompt captured yet.");
  #|     };
  #|     const buildCodegenPrompts = (llm) => {
  #|       const taskKind = inferTaskKind();
  #|       const systemPrompt = [
  #|         "You are an AI coder.",
  #|         "You only write MoonBit code.",
  #|         "Your job is to write MoonBit code for the user's task.",
  #|         "For ordinary form-style apps, include a MoonAP declarative runtime contract in line comments before main:",
  #|         "/// MOONAP_RUNTIME_SPEC_BEGIN",
  #|         "/// {",
  #|         "///   \"mode\": \"form\",",
  #|         "///   \"title\": \"Short app title\",",
  #|         "///   \"action_label\": \"Run app\",",
  #|         "///   \"fields\": [{\"name\":\"input_name\",\"label\":\"Input label\",\"type\":\"float\",\"default\":1,\"step\":0.01}],",
  #|         "///   \"computed_outputs\": [{\"name\":\"output_name\",\"label\":\"Output label\",\"expression\":\"input_name * 2\",\"decimals\":2}],",
  #|         "///   \"result_template\": \"Input: {{input_name}}\\nOutput: {{output_name}}\",",
  #|         "///   \"summary_template\": \"Calculated output {{output_name}}.\"",
  #|         "/// }",
  #|         "/// MOONAP_RUNTIME_SPEC_END",
  #|         "Use computed_outputs expressions only for simple arithmetic over numeric fields using +, -, *, /, pow(...), sqrt(...), abs(...), min(...), max(...), and parentheses.",
  #|         "For text analyzers, use mode=form with tool_kind=text-analysis and one text field named input_text.",
  #|         "For JSON formatter/validator apps, use mode=form with tool_kind=json-formatter and one text field named json_text.",
  #|         "For CSV/TSV analyzers, use mode=file with analysis_type=csv-summary and io_contract.browser_local_only=true.",
  #|         "Choose semantic field names and labels from the user's task instead of generic input_text.",
  #|         "Return only the full contents of cmd/main/main.mbt."
  #|       ].join("\\n");
  #|       const userPrompt = String(prompt || "");
  #|       return {
  #|         modeText: "codegen / frontier-direct",
  #|         systemPrompt,
  #|         userPrompt
  #|       };
  #|     };
  #|     const proxyPost = async (url, headers, body) => {
  #|       const envelope = [
  #|         `URL\t${String(url)}`,
  #|         ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
  #|         "BODY",
  #|         String(body)
  #|       ].join("\n");
  #|       const response = await fetch("/api/llm/proxy", {
  #|         method: "POST",
  #|         headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|         body: envelope
  #|       });
  #|       const text = await response.text();
  #|       let json = {};
  #|       try {
  #|         json = JSON.parse(text);
  #|       } catch {
  #|         const plain = String(text || "")
  #|           .replace(/<script[\s\S]*?<\/script>/gi, " ")
  #|           .replace(/<style[\s\S]*?<\/style>/gi, " ")
  #|           .replace(/<[^>]+>/g, " ")
  #|           .replace(/\s+/g, " ")
  #|           .trim();
  #|         const summarized = plain || `MoonAP proxy returned non-JSON (${response.status})`;
  #|         throw new Error(`Provider returned non-JSON (${response.status}): ${summarized.slice(0, 240)}`);
  #|       }
  #|       if (!response.ok) {
  #|         const detail = json?.error?.detail ? ` ${String(json.error.detail)}` : "";
  #|         throw new Error((json?.error?.message || `LLM request failed (${response.status})`) + detail);
  #|       }
  #|       return json;
  #|     };
  #|     const requestJson = async (llm) => {
  #|       const promptPack = buildCodegenPrompts(llm);
  #|       updatePrompts(promptPack.modeText, promptPack.systemPrompt, promptPack.userPrompt);
  #|       const codegenConversationHistory = [
  #|         { role: "user", content: String(prompt || "") }
  #|       ];
  #|       if (llm.provider === "gemini") {
  #|         const url = `${llm.baseUrl}/v1beta/models/${encodeURIComponent(llm.model)}:generateContent`;
  #|         const json = await proxyPost(
  #|           url,
  #|           { "Content-Type": "application/json", "x-goog-api-key": String(llm.apiKey || "") },
  #|           JSON.stringify({
  #|             system_instruction: { parts: [{ text: promptPack.systemPrompt }] },
  #|             contents: [{ role: "user", parts: [{ text: promptPack.userPrompt }] }],
  #|             generationConfig: { temperature: 0.2 }
  #|           })
  #|         );
  #|         const text = (json?.candidates?.[0]?.content?.parts || []).map((part) => String(part?.text || "")).join("\\n").trim();
  #|         if (!text) throw new Error("Gemini returned no MoonBit source.");
  #|         return { source: text, raw: json, conversation_history: codegenConversationHistory };
  #|       }
  #|       const rawBaseUrl = String(llm.baseUrl || "").trim();
  #|       const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  #|       let url = `${baseUrl}/chat/completions`;
  #|       if (llm.provider === "zai") {
  #|         if (baseUrl.endsWith("/chat/completions")) {
  #|           url = baseUrl;
  #|         } else if (baseUrl === "https://open.bigmodel.cn" || baseUrl === "https://open.bigmodel.cn/") {
  #|           url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
  #|         } else if (!baseUrl.includes("/api/paas/v4")) {
  #|           url = `${baseUrl}/api/paas/v4/chat/completions`;
  #|         }
  #|       }
  #|       const headers = {
  #|         "Content-Type": "application/json",
  #|         "Authorization": `Bearer ${String(llm.apiKey || "")}`
  #|       };
  #|       if (llm.provider === "openrouter") {
  #|         headers["HTTP-Referer"] = "http://127.0.0.1:3000";
  #|         headers["X-Title"] = "MoonAP";
  #|       }
  #|       const json = await proxyPost(
  #|         url,
  #|         headers,
  #|         JSON.stringify({
  #|           model: llm.model,
  #|           messages: [
  #|             { role: "system", content: promptPack.systemPrompt },
  #|             { role: "user", content: promptPack.userPrompt }
  #|           ],
  #|           temperature: 0.2
  #|         })
  #|       );
  #|       const text = String(json?.choices?.[0]?.message?.content || "").trim();
  #|       if (!text) throw new Error(`${llm.provider} returned no MoonBit source.`);
  #|       return { source: text, raw: json, conversation_history: codegenConversationHistory };
  #|     };
  #|     let generated = null;
  #|     let llm = null;
  #|     const failures = [];
  #|     for (let index = 0; index < ordered.length; index += 1) {
  #|       const item = ordered[index];
  #|       const candidate = {
  #|         provider: item.key,
  #|         model: item.model,
  #|         baseUrl: item.baseUrl,
  #|         apiKey: item.apiKey,
  #|         rotated: providers.length > 1
  #|       };
  #|       try {
  #|         generated = await requestJson(candidate);
  #|         llm = candidate;
  #|         const nextCursor = (start + index + 1) % providers.length;
  #|         localStorage.setItem("moonap.llm.router.v1", JSON.stringify({
  #|           providers: Array.isArray(saved.providers) ? saved.providers : providers,
  #|           cursor: nextCursor,
  #|           savedAt: saved.savedAt || new Date().toISOString()
  #|         }));
  #|         break;
  #|       } catch (error) {
  #|         failures.push(`${String(item.key || "provider")}/${String(item.model || "model")}: ${error instanceof Error ? error.message : String(error)}`);
  #|       }
  #|     }
  #|     if (!generated || !llm) {
  #|       throw new Error(`All enabled providers failed during code generation. ${failures.join(" | ")}`);
  #|     }
  #|     const ensureExtractMoonBitSource = () => {
  #|       if (typeof globalThis.__moonapExtractMoonBitSource === "function") return globalThis.__moonapExtractMoonBitSource;
  #|       globalThis.__moonapExtractMoonBitSource = (value) => {
  #|         const text = String(value || "").trim();
  #|         if (!text) return "";
  #|         const extract = (source, startMarker, endMarker) => {
  #|           const start = source.indexOf(startMarker);
  #|           if (start < 0) return "";
  #|           const after = source.slice(start + startMarker.length).trim();
  #|           if (!after) return "";
  #|           const end = after.indexOf(endMarker);
  #|           if (end < 0) return "";
  #|           return after.slice(0, end).trim();
  #|         };
  #|         const patterns = [
  #|           ["FILE: cmd/main/main.mbt", "END_FILE"],
  #|           ['<moonbit-file path="cmd/main/main.mbt">', "</moonbit-file>"],
  #|           ["```moonbit", "```"],
  #|           ["```mbt", "```"],
  #|           ["```", "```"]
  #|         ];
  #|         for (const [startMarker, endMarker] of patterns) {
  #|           const extracted = extract(text, startMarker, endMarker);
  #|           if (extracted) return extracted;
  #|         }
  #|         return text;
  #|       };
  #|       return globalThis.__moonapExtractMoonBitSource;
  #|     };
  #|     const source = ensureExtractMoonBitSource()(String(generated.source || ""));
  #|     const slug = String(taskTitle || "moonbit-task")
  #|       .toLowerCase()
  #|       .replace(/[^a-z0-9]+/g, "-")
  #|       .replace(/^-+|-+$/g, "") || "moonbit-task";
  #|     const artifact = {
  #|       schema_version: "moonap.artifact.v1",
  #|       id: slug,
  #|       name: String(taskTitle || "MoonBit Task"),
  #|       prompt: String(prompt),
  #|       llm_provider: llm.provider || "unknown",
  #|       llm_model: llm.model || "unknown",
  #|       llm_rotated: Boolean(llm.rotated),
  #|       stages: [
  #|         { name: "llm-codegen", status: "ok", output: `MoonBit source generated by ${llm.provider}/${llm.model}` },
  #|         { name: "formal-verification", status: formalVerification ? "reserved" : "skipped", output: formalVerification ? "moon prove hook reserved" : "disabled by user/default" },
  #|         { name: "moonbit-wasm-compile", status: "pending", output: "Real MoonBit-to-Wasm compile is the next implementation step." },
  #|         { name: "browser-local-run", status: "pending", output: "Browser-local execution will start after compile is wired." }
  #|       ],
  #|       skill: {
  #|         folder_name: slug,
  #|         description_file: "SKILL.md",
  #|         program_dir: "program",
  #|         parameters: {}
  #|       },
  #|       moonbit_source: source,
  #|       conversation_history: [
  #|         ...(Array.isArray(generated?.conversation_history) ? generated.conversation_history : [{ role: "user", content: String(prompt || "") }]),
  #|         { role: "assistant", content: source }
  #|       ],
  #|       knowledge_pack_version: "moonbit-primer-v1",
  #|       llm_response_preview: JSON.stringify(generated.raw).slice(0, 1200),
  #|       wasm_runtime: {
  #|         target: "wasm-gc",
  #|         browser_local: true,
  #|         uploaded_bytes: 0,
  #|         note: "Pending real compile and runtime execution."
  #|       },
  #|       created_at: new Date().toISOString()
  #|     };
  #|     globalThis.__moonapLastArtifact = artifact;
  #|     onDone(JSON.stringify(artifact, null, 2));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_run_free_llm_moonbit_eval(
  max_level : Int,
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (maxLevel, onDone, onError) => {
  #|   try {
  #|     if (globalThis.__moonapEvalRunning) {
  #|       throw new Error("A MoonBit experiment run is already in progress.");
  #|     }
  #|     globalThis.__moonapEvalRunning = true;
  #|     const clampLevel = (value) => Math.max(1, Math.min(3, Number(value || 3)));
  #|     const nowIso = () => new Date().toISOString();
  #|     const ensureExtractMoonBitSource = () => {
  #|       if (typeof globalThis.__moonapExtractMoonBitSource === "function") return globalThis.__moonapExtractMoonBitSource;
  #|       globalThis.__moonapExtractMoonBitSource = (value) => {
  #|         const sourceText = String(value || "").trim();
  #|         if (!sourceText) return "";
  #|         const extract = (source, startMarker, endMarker) => {
  #|           const start = source.indexOf(startMarker);
  #|           if (start < 0) return "";
  #|           const after = source.slice(start + startMarker.length).trim();
  #|           if (!after) return "";
  #|           const end = after.indexOf(endMarker);
  #|           if (end < 0) return "";
  #|           return after.slice(0, end).trim();
  #|         };
  #|         const patterns = [
  #|           ["FILE: cmd/main/main.mbt", "END_FILE"],
  #|           ['<moonbit-file path="cmd/main/main.mbt">', "</moonbit-file>"],
  #|           ["```moonbit", "```"],
  #|           ["```mbt", "```"],
  #|           ["```", "```"]
  #|         ];
  #|         for (const [startMarker, endMarker] of patterns) {
  #|           const extracted = extract(sourceText, startMarker, endMarker);
  #|           if (extracted) return extracted;
  #|         }
  #|         return sourceText;
  #|       };
  #|       return globalThis.__moonapExtractMoonBitSource;
  #|     };
  #|     const cleanSource = (text) => ensureExtractMoonBitSource()(String(text || ""));
  #|     const parseModelList = (raw) => {
  #|       const seen = new Set();
  #|       return String(raw || "")
  #|         .split(/\r?\n|,/)
  #|         .map((item) => String(item || "").trim())
  #|         .filter((item) => item.length > 0)
  #|         .filter((item) => {
  #|           const key = item.toLowerCase();
  #|           if (seen.has(key)) return false;
  #|           seen.add(key);
  #|           return true;
  #|         });
  #|     };
  #|     const normalizeProviderEntry = (item) => {
  #|       const key = String(item?.key || "").toLowerCase();
  #|       let baseUrl = String(item?.baseUrl || "").trim();
  #|       if (key === "gemini") baseUrl = "https://generativelanguage.googleapis.com";
  #|       else if (key === "openrouter") baseUrl = "https://openrouter.ai/api/v1";
  #|       else if (key === "zai") baseUrl = "https://open.bigmodel.cn/api/paas/v4";
  #|       else if (key === "siliconflow") baseUrl = "https://api.siliconflow.cn/v1";
  #|       else if (key === "openai") baseUrl = "moonap://llm-sim";
  #|       else if (key === "nvidia") baseUrl = "https://integrate.api.nvidia.com/v1";
  #|       return {
  #|         key,
  #|         provider: key,
  #|         enabled: Boolean(item?.enabled),
  #|         model: String(item?.model || "").trim(),
  #|         baseUrl,
  #|         apiKey: String(item?.apiKey || "").trim()
  #|       };
  #|     };
  #|     const readRouter = () => {
  #|       try {
  #|         const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
  #|         return parsed && typeof parsed === "object" ? parsed : {};
  #|       } catch {
  #|         return {};
  #|       }
  #|     };
  #|     const updatePrompts = (modeText, systemPromptText, userPromptText) => {
  #|       const setText = (selector, value) => {
  #|         const node = document.querySelector(selector);
  #|         if (node) node.textContent = String(value || "");
  #|       };
  #|       setText("#promptMode", modeText || "No LLM prompt captured yet.");
  #|       setText("#promptSystem", systemPromptText || "No LLM prompt captured yet.");
  #|       setText("#promptUser", userPromptText || "No LLM prompt captured yet.");
  #|     };
  #|     const updateProcess = (provider, stage, result, logText, sourceText = "") => {
  #|       const setText = (selector, value) => {
  #|         const node = document.querySelector(selector);
  #|         if (node) node.textContent = String(value || "");
  #|       };
  #|       setText("#processProvider", provider || "-");
  #|       setText("#processStage", stage || "-");
  #|       setText("#processResult", result || "waiting");
  #|       setText("#processLog", logText || "");
  #|       if (sourceText !== "") setText("#processSource", sourceText || "No generated source yet.");
  #|     };
  #|     const proxyPost = async (url, headers, body, timeoutMs) => {
  #|       const envelope = [
  #|         `URL\t${String(url)}`,
  #|         ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
  #|         "BODY",
  #|         String(body)
  #|       ].join("\n");
  #|       const controller = new AbortController();
  #|       const timeout = setTimeout(() => controller.abort(), timeoutMs);
  #|       const started = performance.now();
  #|       try {
  #|         const response = await fetch("/api/llm/proxy", {
  #|           method: "POST",
  #|           headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|           body: envelope,
  #|           signal: controller.signal
  #|         });
  #|         const text = await response.text();
  #|         let json = {};
  #|         try {
  #|           json = JSON.parse(text);
  #|         } catch {
  #|           const plain = String(text || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  #|           const err = new Error(`Provider returned non-JSON (${response.status}): ${(plain || text || "").slice(0, 240)}`);
  #|           err.nonJson = true;
  #|           err.httpStatus = response.status;
  #|           throw err;
  #|         }
  #|         if (!response.ok) {
  #|           const detail = json?.error?.detail ? ` ${String(json.error.detail)}` : "";
  #|           const err = new Error((json?.error?.message || `LLM request failed (${response.status})`) + detail);
  #|           err.httpStatus = response.status;
  #|           throw err;
  #|         }
  #|         return { json, latencyMs: Math.round(performance.now() - started) };
  #|       } catch (error) {
  #|         if (error && error.name === "AbortError") {
  #|           const timeoutError = new Error(`Timed out after ${Math.round(timeoutMs / 1000)}s`);
  #|           timeoutError.timeout = true;
  #|           throw timeoutError;
  #|         }
  #|         throw error;
  #|       } finally {
  #|         clearTimeout(timeout);
  #|       }
  #|     };
  #|     const compileSource = async (sourceText) => {
  #|       const response = await fetch("/api/artifact/compile", {
  #|         method: "POST",
  #|         headers: { "Content-Type": "text/plain; charset=utf-8" },
  #|         body: String(sourceText || "")
  #|       });
  #|       const text = await response.text();
  #|       return JSON.parse(text);
  #|     };
  #|     const assessFastqSource = (sourceText) => {
  #|       const source = String(sourceText || "");
  #|       const lower = source.toLowerCase();
  #|       const hasImport = /\bimport\b/.test(lower);
  #|       const hasMain = /\bfn\s+main\b/.test(source);
  #|       const fnNames = Array.from(source.matchAll(/\bfn\s+([A-Za-z_][A-Za-z0-9_]*)/g)).map((item) => String(item[1] || ""));
  #|       const helperNames = fnNames.filter((item) => item !== "main");
  #|       const hasFastqHeader = source.includes("@SEQ") || source.includes("@moonap") || source.includes("\"@\"") || source.includes("@read");
  #|       const hasFastqPlus = source.includes("\\n+\\n") || source.includes("\"+\"") || source.includes("+\\n");
  #|       const hasQuality = source.includes("IIII") || lower.includes("qual");
  #|       const hasSequenceLogic = /A|C|G|T|N/.test(source) && (/\bif\b|\bmatch\b|\bfor\b|\bwhile\b/.test(source) || helperNames.length > 0);
  #|       const missingSignals = [];
  #|       if (!hasMain) missingSignals.push("define fn main");
  #|       if (hasImport) missingSignals.push("remove import usage");
  #|       if (!hasFastqHeader) missingSignals.push("emit a visible FastQ header such as @SEQ or @moonap");
  #|       if (!hasFastqPlus) missingSignals.push("emit a plus line between sequence and quality");
  #|       if (!hasQuality) missingSignals.push("generate an explicit quality string such as IIII or qual");
  #|       if (!hasSequenceLogic) missingSignals.push("include visible sequence-generation logic over A/C/G/T/N");
  #|       const pass = hasMain && !hasImport && hasFastqHeader && hasFastqPlus && hasQuality && hasSequenceLogic;
  #|       return {
  #|         pass,
  #|         title: pass ? "FastQ Generator task passed" : "Compile succeeded, but FastQ Generator task failed",
  #|         summary: pass
  #|           ? "Compile succeeded and the generated MoonBit source shows the expected FastQ structure: a header, sequence logic, plus line, and quality generation without imports."
  #|           : "Compile succeeded, but the generated MoonBit source does not yet look like a usable FastQ generator. MoonAP expected visible FastQ structure, sequence-generation logic, and a quality line without imports.",
  #|         repairHint: "Keep the program compiling, but make the MoonBit source visibly look like a FastQ generator with header, sequence, plus line, and quality generation.",
  #|         missingSignals
  #|       };
  #|     };
  #|     const buildMarkdown = (results) => {
  #|       const models = Array.isArray(results?.models) ? results.models : [];
  #|       const formatCell = (benchmark) => {
  #|         if (!benchmark?.attempted) return "not-run";
  #|         if (benchmark?.raw_codegen_pass) return benchmark?.raw_quality_pass ? "raw-pass+quality" : "raw-compile-only";
  #|         if (benchmark?.assisted_pass) return benchmark?.final_quality_pass ? `assist-pass+quality (${Number(benchmark?.repair_attempts_used || 0)} repairs)` : `assist-compile-only (${Number(benchmark?.repair_attempts_used || 0)} repairs)`;
  #|         return "fail";
  #|       };
  #|       return [
  #|         "# Free LLM FastQ generator ability of generating MoonBit code",
  #|         "",
  #|         `Last updated: ${nowIso()}`,
  #|         "",
  #|         "## Current summary",
  #|         "",
  #|         "| Provider | Model | API | API ms | FQ1 | Notes |",
  #|         "| --- | --- | --- | ---: | --- | --- |",
  #|         ...models.map((item) => {
  #|           const note = item?.notes?.final_recommendation_note || item?.api_test?.message || "";
  #|           return `| ${String(item?.provider || "")} | ${String(item?.model || "")} | ${String(item?.api_test?.status || "")} | ${String(item?.api_test?.latency_ms ?? "")} | ${formatCell(item?.benchmarks?.FQ1)} | ${String(note).replace(/\|/g, "/")} |`;
  #|         }),
  #|         "",
  #|         "## Raw JSON",
  #|         "",
  #|         "See `artifacts/moonbit-eval-results.json` for the full structured record."
  #|       ].join("\n");
  #|     };
  #|     const persistResults = async (results) => {
  #|       const warnings = Array.isArray(results?.persistence_warnings) ? results.persistence_warnings : [];
  #|       const pushWarning = (message) => {
  #|         const text = String(message || "").trim();
  #|         if (!text) return;
  #|         if (!warnings.includes(text)) warnings.push(text);
  #|         results.persistence_warnings = warnings;
  #|         console.warn("MoonAP experiment persistence warning:", text);
  #|       };
  #|       try {
  #|         const jsonResponse = await fetch("/api/experiments/free-llm-moonbit/results.json", {
  #|           method: "POST",
  #|           headers: { "Content-Type": "application/json; charset=utf-8" },
  #|           body: JSON.stringify(results, null, 2)
  #|         });
  #|         if (!jsonResponse.ok) {
  #|           pushWarning(`results.json persist failed (${jsonResponse.status})`);
  #|         }
  #|       } catch (error) {
  #|         pushWarning(`results.json persist failed: ${error instanceof Error ? error.message : String(error)}`);
  #|       }
  #|       try {
  #|         const markdownResponse = await fetch("/api/experiments/free-llm-moonbit/results.md", {
  #|           method: "POST",
  #|           headers: { "Content-Type": "text/markdown; charset=utf-8" },
  #|           body: buildMarkdown(results)
  #|         });
  #|         if (!markdownResponse.ok) {
  #|           pushWarning(`results.md persist failed (${markdownResponse.status})`);
  #|         }
  #|       } catch (error) {
  #|         pushWarning(`results.md persist failed: ${error instanceof Error ? error.message : String(error)}`);
  #|       }
  #|     };
  #|     const requestMoonBit = async (llm, systemPrompt, userPrompt, timeoutMs, maxTokens = 512, mode = "eval / raw-codegen") => {
  #|       updatePrompts(mode, systemPrompt, userPrompt);
  #|       if (llm.provider === "gemini") {
  #|         const url = `${llm.baseUrl}/v1beta/models/${encodeURIComponent(llm.model)}:generateContent`;
  #|         const { json, latencyMs } = await proxyPost(url, {
  #|           "Content-Type": "application/json",
  #|           "x-goog-api-key": String(llm.apiKey || "")
  #|         }, JSON.stringify({
  #|           system_instruction: { parts: [{ text: systemPrompt }] },
  #|           contents: [{ role: "user", parts: [{ text: userPrompt }] }],
  #|           generationConfig: { temperature: 0, maxOutputTokens: maxTokens }
  #|         }), timeoutMs);
  #|         const text = (json?.candidates?.[0]?.content?.parts || []).map((part) => String(part?.text || "")).join("\n").trim();
  #|         return { source: cleanSource(text), latencyMs };
  #|       }
  #|       const rawBaseUrl = String(llm.baseUrl || "").trim();
  #|       const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
  #|       let url = `${baseUrl}/chat/completions`;
  #|       if (llm.provider === "zai" && !baseUrl.endsWith("/chat/completions") && !baseUrl.includes("/api/paas/v4")) {
  #|         url = `${baseUrl}/api/paas/v4/chat/completions`;
  #|       }
  #|       const headers = {
  #|         "Content-Type": "application/json",
  #|         "Authorization": `Bearer ${String(llm.apiKey || "")}`
  #|       };
  #|       if (llm.provider === "openrouter") {
  #|         headers["HTTP-Referer"] = "http://127.0.0.1:3000";
  #|         headers["X-Title"] = "MoonAP";
  #|       }
  #|       const { json, latencyMs } = await proxyPost(url, headers, JSON.stringify({
  #|         model: llm.model,
  #|         messages: [
  #|           { role: "system", content: systemPrompt },
  #|           { role: "user", content: userPrompt }
  #|         ],
  #|         temperature: 0,
  #|         max_tokens: maxTokens
  #|       }), timeoutMs);
  #|       return { source: cleanSource(String(json?.choices?.[0]?.message?.content || "")), latencyMs };
  #|     };
  #|     const repairRounds = Math.max(1, Math.min(3, Number(maxLevel || 2)));
  #|     const benchmarks = [
  #|       {
  #|         id: "FQ1",
  #|         title: "FastQ generator",
  #|         userPrompt: "Generate a FastQ file generator."
  #|       }
  #|     ];
  #|     const codegenSystemPrompt = [
  #|       "You write MoonBit code.",
  #|       "Return only cmd/main/main.mbt.",
  #|       "No markdown fences.",
  #|       "No explanations."
  #|     ].join("\n");
  #|     const repairSystemPrompt = [
  #|       "You repair MoonBit code.",
  #|       "Return only cmd/main/main.mbt.",
  #|       "No markdown fences.",
  #|       "No explanations."
  #|     ].join("\n");
  #|     const saved = readRouter();
  #|     const providers = (Array.isArray(saved.providers) ? saved.providers : [])
  #|       .map(normalizeProviderEntry)
  #|       .filter((item) => item.enabled && item.apiKey && item.model);
  #|     if (providers.length === 0) {
  #|       throw new Error("No enabled provider/model with API key is available for the experiment run.");
  #|     }
  #|     const blankBenchmark = () => ({
  #|       attempted: false,
  #|       raw_codegen_pass: false,
  #|       raw_quality_pass: false,
  #|       raw_codegen_compile_exit_code: null,
  #|       raw_codegen_compile_summary_kind: "",
  #|       repair_attempts_used: 0,
  #|       assisted_pass: false,
  #|       final_quality_pass: false,
  #|       final_compile_exit_code: null,
  #|       final_compile_summary_kind: "",
  #|       final_quality_title: "",
  #|       final_quality_summary: "",
  #|       final_quality_missing_signals_json: "[]",
  #|       final_source_bytes: null,
  #|       first_codegen_response_latency_ms: null,
  #|       total_time_to_first_compile_success_ms: null
  #|     });
  #|     const results = {
  #|       experiment_name: "Free LLM FastQ generator ability of generating MoonBit code",
  #|       status: "running",
  #|       generated_at: nowIso(),
  #|       prompt_protocol: {
  #|         system_prompt: codegenSystemPrompt,
  #|         user_prompt_mode: "task-only",
  #|         repair_mode: "frontier-conversation",
  #|         repair_rounds: repairRounds
  #|       },
  #|       benchmarks: benchmarks.map((item) => ({ id: item.id, title: item.title, goal: item.userPrompt })),
  #|       models: []
  #|     };
  #|     const routerSummary = `${providers.length} provider(s): ${providers.map((item) => `${item.key}/${item.model}`).join(", ")}`;
  #|     updateProcess(routerSummary, "moonbit-eval", "running", `Starting Free LLM FastQ Eval across ${providers.length} enabled provider/model entries.`);
  #|     for (const provider of providers) {
  #|       const providerLabel = `${provider.key}/${provider.model}`;
  #|       const modelRecord = {
  #|         provider: provider.key,
  #|         model: provider.model,
  #|         base_url: provider.baseUrl,
  #|         api_test: {
  #|           status: "pending",
  #|           message: "",
  #|           latency_ms: null,
  #|           http_status: null,
  #|           timeout: false,
  #|           non_json_response: false
  #|         },
  #|         benchmarks: { FQ1: blankBenchmark() },
  #|         notes: {
  #|           stalled_or_long_no_response: false,
  #|           parser_drift_notes: "",
  #|           language_drift_notes: "",
  #|           final_recommendation_note: ""
  #|         }
  #|       };
  #|       results.models.push(modelRecord);
  #|       await persistResults(results);
  #|       updateProcess(providerLabel, "llm-api-test", "running", `Testing API reachability for ${providerLabel}.`);
  #|       try {
  #|         const ping = await requestMoonBit(provider, "Reply with OK.", "Reply with OK.", 15000, 8, "eval / api-test");
  #|         modelRecord.api_test.status = "ok";
  #|         modelRecord.api_test.message = ping.source || "OK";
  #|         modelRecord.api_test.latency_ms = ping.latencyMs;
  #|       } catch (error) {
  #|         modelRecord.api_test.status = "failed";
  #|         modelRecord.api_test.message = error instanceof Error ? error.message : String(error);
  #|         modelRecord.api_test.timeout = Boolean(error?.timeout);
  #|         modelRecord.api_test.non_json_response = Boolean(error?.nonJson);
  #|         modelRecord.api_test.http_status = Number.isFinite(error?.httpStatus) ? Number(error.httpStatus) : null;
  #|         modelRecord.notes.stalled_or_long_no_response = modelRecord.api_test.timeout;
  #|         await persistResults(results);
  #|         updateProcess(providerLabel, "llm-api-test", "failed", modelRecord.api_test.message);
  #|         continue;
  #|       }
  #|       await persistResults(results);
  #|       for (const benchmark of benchmarks) {
  #|         const bench = modelRecord.benchmarks[benchmark.id];
  #|         const benchStart = performance.now();
  #|         bench.attempted = true;
  #|         updateProcess(providerLabel, `moonbit-eval-${benchmark.id.toLowerCase()}`, "running", `Running ${benchmark.id} for ${providerLabel}.`);
  #|         try {
  #|           const generated = await requestMoonBit(provider, codegenSystemPrompt, benchmark.userPrompt, 60000, 1024, "eval / raw-codegen");
  #|           bench.first_codegen_response_latency_ms = generated.latencyMs;
  #|           updateProcess(providerLabel, `moonbit-eval-${benchmark.id.toLowerCase()}`, "running", `Compiling raw output for ${benchmark.id}.`, generated.source);
  #|           let compile = await compileSource(generated.source);
  #|           bench.raw_codegen_compile_exit_code = Number.isFinite(compile?.exit_code) ? Number(compile.exit_code) : null;
  #|           bench.raw_codegen_compile_summary_kind = String(compile?.summary_kind || "");
  #|           bench.final_compile_exit_code = Number.isFinite(compile?.exit_code) ? Number(compile.exit_code) : null;
  #|           bench.final_compile_summary_kind = String(compile?.summary_kind || "");
  #|           bench.final_source_bytes = Number.isFinite(compile?.source_bytes) ? Number(compile.source_bytes) : generated.source.length;
  #|           let quality = null;
  #|           if (compile?.ok === true) {
  #|             bench.raw_codegen_pass = true;
  #|             quality = assessFastqSource(generated.source);
  #|             bench.raw_quality_pass = Boolean(quality?.pass);
  #|             bench.final_quality_pass = Boolean(quality?.pass);
  #|             bench.final_quality_title = String(quality?.title || "");
  #|             bench.final_quality_summary = String(quality?.summary || "");
  #|             bench.final_quality_missing_signals_json = JSON.stringify(Array.isArray(quality?.missingSignals) ? quality.missingSignals : []);
  #|             if (quality?.pass) {
  #|               bench.assisted_pass = true;
  #|               bench.total_time_to_first_compile_success_ms = Math.round(performance.now() - benchStart);
  #|               await persistResults(results);
  #|               continue;
  #|             }
  #|           }
  #|           let repairedSource = generated.source;
  #|           for (let repairRound = 1; repairRound <= repairRounds; repairRound += 1) {
  #|             bench.repair_attempts_used = repairRound;
  #|             const repairUserPrompt = quality && compile?.ok === true
  #|               ? [
  #|                   "USER:",
  #|                   benchmark.userPrompt,
  #|                   "",
  #|                   "---",
  #|                   "",
  #|                   "ASSISTANT:",
  #|                   repairedSource,
  #|                   "",
  #|                   "---",
  #|                   "",
  #|                   "USER:",
  #|                   "The previous MoonBit file compiled under wasm-gc, but it does not yet look like a usable FastQ generator.",
  #|                   "",
  #|                   "System assessment:",
  #|                   String(quality?.summary || ""),
  #|                   "",
  #|                   "Missing signals:",
  #|                   ...(Array.isArray(quality?.missingSignals) && quality.missingSignals.length > 0 ? quality.missingSignals.map((item) => `- ${String(item)}`) : ["- none listed"]),
  #|                   "",
  #|                   "Fix the file and return the full corrected cmd/main/main.mbt only."
  #|                 ].join("\n")
  #|               : [
  #|                   "USER:",
  #|                   benchmark.userPrompt,
  #|                   "",
  #|                   "---",
  #|                   "",
  #|                   "ASSISTANT:",
  #|                   repairedSource,
  #|                   "",
  #|                   "---",
  #|                   "",
  #|                   "USER:",
  #|                   "The previous MoonBit file failed to compile under wasm-gc.",
  #|                   "",
  #|                   "Compiler error:",
  #|                   String(compile?.output || compile?.trimmed_output || ""),
  #|                   "",
  #|                   "Fix the file and return the full corrected cmd/main/main.mbt only."
  #|                 ].join("\n");
  #|             const repaired = await requestMoonBit(provider, repairSystemPrompt, repairUserPrompt, 90000, 1024, "eval / repair");
  #|             repairedSource = repaired.source;
  #|             updateProcess(providerLabel, `moonbit-eval-${benchmark.id.toLowerCase()}`, "running", `Compile-checking repair round ${repairRound} for ${benchmark.id}.`, repairedSource);
  #|             compile = await compileSource(repairedSource);
  #|             bench.final_compile_exit_code = Number.isFinite(compile?.exit_code) ? Number(compile.exit_code) : null;
  #|             bench.final_compile_summary_kind = String(compile?.summary_kind || "");
  #|             bench.final_source_bytes = Number.isFinite(compile?.source_bytes) ? Number(compile.source_bytes) : repairedSource.length;
  #|             if (compile?.ok === true) {
  #|               quality = assessFastqSource(repairedSource);
  #|               bench.final_quality_pass = Boolean(quality?.pass);
  #|               bench.final_quality_title = String(quality?.title || "");
  #|               bench.final_quality_summary = String(quality?.summary || "");
  #|               bench.final_quality_missing_signals_json = JSON.stringify(Array.isArray(quality?.missingSignals) ? quality.missingSignals : []);
  #|               if (quality?.pass) {
  #|                 bench.assisted_pass = true;
  #|                 bench.total_time_to_first_compile_success_ms = Math.round(performance.now() - benchStart);
  #|                 break;
  #|               }
  #|             }
  #|           }
  #|           if (!bench.assisted_pass && String(bench.final_compile_summary_kind || "").includes("parse")) {
  #|             modelRecord.notes.parser_drift_notes = `Parser drift reached ${benchmark.id}.`;
  #|           }
  #|         } catch (error) {
  #|           const message = error instanceof Error ? error.message : String(error);
  #|           bench.final_compile_summary_kind = "request-error";
  #|           modelRecord.notes.language_drift_notes = message;
  #|           if (message.toLowerCase().includes("timed out")) {
  #|             modelRecord.notes.stalled_or_long_no_response = true;
  #|           }
  #|         }
  #|         await persistResults(results);
  #|         updateProcess(providerLabel, `moonbit-eval-${benchmark.id.toLowerCase()}`, bench.assisted_pass ? "succeeded" : "failed", `${benchmark.id} result for ${providerLabel}: raw=${bench.raw_codegen_pass ? "compile-pass" : "compile-fail"}, raw-quality=${bench.raw_quality_pass ? "pass" : "fail"}, assisted=${bench.assisted_pass ? "quality-pass" : "fail"}, repairs=${Number(bench.repair_attempts_used || 0)}.`);
  #|       }
  #|       const fq1 = modelRecord.benchmarks.FQ1;
  #|       if (fq1?.raw_codegen_pass && fq1?.raw_quality_pass) {
  #|         modelRecord.notes.final_recommendation_note = "Strong first-pass FastQ MoonBit candidate.";
  #|       } else if (fq1?.assisted_pass && fq1?.final_quality_pass) {
  #|         modelRecord.notes.final_recommendation_note = "Usable for FastQ generator after compiler/quality-guided repair.";
  #|       } else if (fq1?.raw_codegen_pass || fq1?.final_compile_exit_code === 0) {
  #|         modelRecord.notes.final_recommendation_note = "Can compile, but still does not reliably satisfy the FastQ generator structure checks.";
  #|       } else {
  #|         modelRecord.notes.final_recommendation_note = "Not yet reliable for the FastQ generator task.";
  #|       }
  #|       await persistResults(results);
  #|     }
  #|     results.status = "completed";
  #|     await persistResults(results);
  #|     updateProcess(routerSummary, "moonbit-eval", "succeeded", "Free LLM FastQ Eval completed. Results were written to artifacts/moonbit-eval-results.json and docs/experiments/free-llm-moonbit/results.md.");
  #|     onDone(JSON.stringify(results, null, 2));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   } finally {
  #|     globalThis.__moonapEvalRunning = false;
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_on_save_personal_skill(handler : () -> Unit) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "savePersonalSkill") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   try {
  #|     handler();
  #|   } catch (error) {
  #|     console.error("MoonAP save personal skill handler failed:", error);
  #|     alert(`MoonAP save failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_on_download_runtime_artifact(
  kind : String,
  handler : () -> Unit,
) -> Unit =
  #| (kind, handler) => document.addEventListener("click", (event) => {
  #|   const targetId = kind === "wasm"
  #|     ? "downloadRuntimeWasm"
  #|     : kind === "source"
  #|       ? "downloadRuntimeSource"
  #|       : kind === "compile-report"
  #|         ? "downloadCompileReport"
  #|         : "downloadRuntimeResult";
  #|   if (event.target?.id !== targetId) return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   try {
  #|     handler();
  #|   } catch (error) {
  #|     alert(`MoonAP runtime download failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_on_runtime_report_action(
  action : String,
  handler : () -> Unit,
) -> Unit =
  #| (action, handler) => document.addEventListener("click", (event) => {
  #|   const targetId = String(action || "") === "save" ? "saveRuntimeReport" : "openRuntimeReport";
  #|   if (event.target?.id !== targetId) return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   try {
  #|     const result = handler();
  #|     if (result && typeof result.catch === "function") {
  #|       result.catch((error) => alert(`MoonAP report action failed: ${error instanceof Error ? error.message : String(error)}`));
  #|     }
  #|   } catch (error) {
  #|     alert(`MoonAP report action failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_on_record_demo_runtime_result(
  handler : () -> Unit,
) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "recordDemoRuntimeResult") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   if (globalThis.__moonapRuntimeRerunBusy) return;
  #|   globalThis.__moonapRuntimeRerunBusy = true;
  #|   const button = event.target;
  #|   const previousDisabled = button.disabled;
  #|   button.disabled = true;
  #|   try {
  #|     const result = handler();
  #|     if (result && typeof result.finally === "function") {
  #|       result.finally(() => {
  #|         globalThis.__moonapRuntimeRerunBusy = false;
  #|         button.disabled = previousDisabled;
  #|       });
  #|     } else {
  #|       setTimeout(() => {
  #|         globalThis.__moonapRuntimeRerunBusy = false;
  #|         button.disabled = previousDisabled;
  #|       }, 600);
  #|     }
  #|   } catch (error) {
  #|     globalThis.__moonapRuntimeRerunBusy = false;
  #|     button.disabled = previousDisabled;
  #|     alert(`MoonAP demo runtime execution failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_on_repair_artifact(handler : () -> Unit) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "repairArtifact") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   try {
  #|     handler();
  #|   } catch (error) {
  #|     alert(`MoonAP repair failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_ensure_skill_folder_runtime() -> Unit =
  #| () => {
  #|   if (globalThis.__moonapSkillFolderRuntime) return;
  #|   const pathRuntime = globalThis.__moonapVirtualPathRuntime;
  #|   if (!pathRuntime || typeof pathRuntime.normalize !== "function") {
  #|     throw new Error("MoonAP virtual path runtime is not ready yet.");
  #|   }
  #|   const parseFrontmatter = (text) => {
  #|     const source = String(text || "");
  #|     if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) return {};
  #|     const lines = source.replace(/\r/g, "").split("\n");
  #|     const fields = {};
  #|     for (let index = 1; index < lines.length; index += 1) {
  #|       const line = String(lines[index] || "");
  #|       if (line.trim() === "---") break;
  #|       const colon = line.indexOf(":");
  #|       if (colon < 0) continue;
  #|       const key = line.slice(0, colon).trim();
  #|       const value = line.slice(colon + 1).trim();
  #|       if (key) fields[key] = value;
  #|     }
  #|     return fields;
  #|   };
  #|   const parseKeyAttributes = (text) => {
  #|     const source = String(text || "").replace(/\r/g, "");
  #|     const match = source.match(/# Key Attributes\s+([\s\S]*?)(?:\n# |\n```|$)/);
  #|     const result = {};
  #|     const block = match?.[1] || "";
  #|     for (const line of block.split("\n")) {
  #|       const trimmed = String(line || "").trim();
  #|       if (!trimmed.startsWith("- ")) continue;
  #|       const content = trimmed.slice(2);
  #|       const colon = content.indexOf(":");
  #|       if (colon < 0) continue;
  #|       const key = content.slice(0, colon).trim().toLowerCase().replace(/\s+/g, "_");
  #|       const value = content.slice(colon + 1).trim();
  #|       if (key) result[key] = value;
  #|     }
  #|     return result;
  #|   };
  #|   const parseRuntimeSpec = (text) => {
  #|     const source = String(text || "").replace(/\r/g, "");
  #|     const match = source.match(/# Runtime Spec\s+```json\s*([\s\S]*?)\s*```/);
  #|     if (!match) return {};
  #|     try { return JSON.parse(match[1]); } catch { return {}; }
  #|   };
  #|   const readTextFile = async (dirHandle, fileName) => {
  #|     const handle = await dirHandle.getFileHandle(String(fileName || ""));
  #|     const file = await handle.getFile();
  #|     return await file.text();
  #|   };
  #|   const ensurePermission = async (handle, mode = "read", request = false) => {
  #|     if (!handle) return false;
  #|     if (typeof handle.queryPermission !== "function") return true;
  #|     try {
  #|       let state = await handle.queryPermission({ mode });
  #|       if (state === "granted") return true;
  #|       if (request && typeof handle.requestPermission === "function") {
  #|         state = await handle.requestPermission({ mode });
  #|         if (state === "granted") return true;
  #|       }
  #|     } catch {}
  #|     return false;
  #|   };
  #|   const readSkillFolder = async (dirHandle, options = {}) => {
  #|     const fallback = options?.fallback && typeof options.fallback === "object" ? options.fallback : {};
  #|     const skillMd = await readTextFile(dirHandle, "SKILL.md");
  #|     const frontmatter = parseFrontmatter(skillMd);
  #|     const keyAttributes = parseKeyAttributes(skillMd);
  #|     const runtimeSpec = parseRuntimeSpec(skillMd);
  #|     const relativePath = pathRuntime.normalize(options?.relativePath || fallback?.relative_path || dirHandle?.name || "");
  #|     return {
  #|       ...(fallback || {}),
  #|       id: String(options?.id || fallback?.id || ""),
  #|       name: String(frontmatter.name || fallback?.name || options?.defaultName || "SKILL"),
  #|       description: String(frontmatter.description || fallback?.description || ""),
  #|       task_kind: String(keyAttributes.task_kind || fallback?.task_kind || "generic"),
  #|       runtime_mode: String(keyAttributes.runtime_mode || fallback?.runtime_mode || "form"),
  #|       result_mode: String(keyAttributes.result_mode || fallback?.result_mode || "text"),
  #|       wasm_path: String(keyAttributes.wasm_path || fallback?.wasm_path || "program/main.wasm"),
  #|       source_path: String(keyAttributes.moonbit_source_path || fallback?.source_path || ""),
  #|       runtime_spec: runtimeSpec && typeof runtimeSpec === "object" ? runtimeSpec : {},
  #|       skill_md: skillMd,
  #|       handle_name: String(dirHandle?.name || fallback?.folder_name || ""),
  #|       relative_path: relativePath,
  #|       available: true
  #|     };
  #|   };
  #|   globalThis.__moonapSkillFolderRuntime = {
  #|     parseFrontmatter,
  #|     parseKeyAttributes,
  #|     parseRuntimeSpec,
  #|     readTextFile,
  #|     ensurePermission,
  #|     readSkillFolder
  #|   };
  #| }

///|
#cfg(target="js")
extern "js" fn browser_render_personal_skills() -> Int =
  #| () => {
  #|   const ensurePersonalSkillRuntime = () => {
  #|     if (globalThis.__moonapPersonalSkillRuntime) return globalThis.__moonapPersonalSkillRuntime;
  #|     const DB_NAME = "moonap.personal.skill.handles.v1";
  #|     const STORE_NAME = "handles";
  #|     const ROOT_KEY = "__root__";
  #|     const openDb = () => new Promise((resolve, reject) => {
  #|       const request = indexedDB.open(DB_NAME, 1);
  #|       request.onupgradeneeded = () => {
  #|         const db = request.result;
  #|         if (!db.objectStoreNames.contains(STORE_NAME)) {
  #|           db.createObjectStore(STORE_NAME);
  #|         }
  #|       };
  #|       request.onsuccess = () => resolve(request.result);
  #|       request.onerror = () => reject(request.error || new Error("Failed to open Personal SKILL database."));
  #|     });
  #|     const withStore = async (mode, work) => {
  #|       const db = await openDb();
  #|       return await new Promise((resolve, reject) => {
  #|         const transaction = db.transaction(STORE_NAME, mode);
  #|         const store = transaction.objectStore(STORE_NAME);
  #|         let settled = false;
  #|         const finishResolve = (value) => {
  #|           if (settled) return;
  #|           settled = true;
  #|           resolve(value);
  #|         };
  #|         const finishReject = (error) => {
  #|           if (settled) return;
  #|           settled = true;
  #|           reject(error);
  #|         };
  #|         transaction.oncomplete = () => finishResolve(undefined);
  #|         transaction.onerror = () => finishReject(transaction.error || new Error("Personal SKILL database transaction failed."));
  #|         transaction.onabort = () => finishReject(transaction.error || new Error("Personal SKILL database transaction was aborted."));
  #|         Promise.resolve(work(store, finishResolve, finishReject)).catch(finishReject);
  #|       }).finally(() => db.close());
  #|     };
  #|     const folderRuntime = globalThis.__moonapSkillFolderRuntime;
  #|     if (!folderRuntime || typeof folderRuntime.readSkillFolder !== "function" || typeof folderRuntime.ensurePermission !== "function") {
  #|       throw new Error("MoonAP skill folder runtime is not ready yet.");
  #|     }
  #|     const loadFromHandle = async (id, dirHandle, fallback) => {
  #|       const data = await folderRuntime.readSkillFolder(dirHandle, {
  #|         id: String(id || fallback?.id || ""),
  #|         fallback,
  #|         defaultName: "Personal SKILL",
  #|         relativePath: String(fallback?.folder_name || dirHandle?.name || "")
  #|       });
  #|       globalThis.__moonapPersonalSkillCache = globalThis.__moonapPersonalSkillCache || {};
  #|       globalThis.__moonapPersonalSkillCache[data.id] = data;
  #|       return data;
  #|     };
  #|     const runtime = {
  #|       cache: globalThis.__moonapPersonalSkillCache || {},
  #|       putHandle: async (id, handle) => {
  #|         await withStore("readwrite", (store, resolve, reject) => {
  #|           const request = store.put(handle, String(id || ""));
  #|           request.onsuccess = () => resolve(true);
  #|           request.onerror = () => reject(request.error || new Error("Failed to save Personal SKILL handle."));
  #|         });
  #|       },
  #|       putRootHandle: async (handle) => {
  #|         await withStore("readwrite", (store, resolve, reject) => {
  #|           const request = store.put(handle, ROOT_KEY);
  #|           request.onsuccess = () => resolve(true);
  #|           request.onerror = () => reject(request.error || new Error("Failed to save Personal SKILL root handle."));
  #|         });
  #|       },
  #|       getRootHandle: async () => {
  #|         return await withStore("readonly", (store, resolve, reject) => {
  #|           const request = store.get(ROOT_KEY);
  #|           request.onsuccess = () => resolve(request.result || null);
  #|           request.onerror = () => reject(request.error || new Error("Failed to read Personal SKILL root handle."));
  #|         });
  #|       },
  #|       getHandle: async (id) => {
  #|         return await withStore("readonly", (store, resolve, reject) => {
  #|           const request = store.get(String(id || ""));
  #|           request.onsuccess = () => resolve(request.result || null);
  #|           request.onerror = () => reject(request.error || new Error("Failed to read Personal SKILL handle."));
  #|         });
  #|       },
  #|       deleteHandle: async (id) => {
  #|         await withStore("readwrite", (store, resolve, reject) => {
  #|           const request = store.delete(String(id || ""));
  #|           request.onsuccess = () => resolve(true);
  #|           request.onerror = () => reject(request.error || new Error("Failed to delete Personal SKILL handle."));
  #|         });
  #|       },
  #|       loadFromHandle,
  #|       listFromIndex: async () => {
  #|         let skills = [];
  #|         try {
  #|           const parsed = JSON.parse(localStorage.getItem("moonap.personal.skills") || "[]");
  #|           skills = Array.isArray(parsed) ? parsed : [];
  #|         } catch (error) {
  #|           console.warn("MoonAP reset invalid personal skill storage:", error);
  #|           try { localStorage.removeItem("moonap.personal.skills"); } catch {}
  #|         }
  #|         const results = [];
  #|         for (const fallback of skills.filter((skill) => Boolean(skill?.runtime_ready))) {
  #|           try {
  #|             const handle = await runtime.getHandle(fallback.id);
  #|             if (!handle) {
  #|               results.push({ ...(fallback || {}), available: false });
  #|               continue;
  #|             }
  #|             results.push(await loadFromHandle(fallback.id, handle, fallback));
  #|           } catch (error) {
  #|             results.push({
  #|               ...(fallback || {}),
  #|               available: false,
  #|               load_error: error instanceof Error ? error.message : String(error)
  #|             });
  #|           }
  #|         }
  #|         return results;
  #|       },
  #|       findSkillDir: async (rootHandle, skillId) => {
  #|         if (!rootHandle || typeof rootHandle.entries !== "function") return null;
  #|         const wantedId = String(skillId || "");
  #|         for await (const [entryName, entryHandle] of rootHandle.entries()) {
  #|           if (!entryHandle || entryHandle.kind !== "directory") continue;
  #|           const candidateId = `personal.${String(entryName || "")}`;
  #|           if (candidateId !== wantedId) continue;
  #|           try {
  #|             await entryHandle.getFileHandle("SKILL.md");
  #|             return entryHandle;
  #|           } catch {}
  #|         }
  #|         return null;
  #|       },
  #|       listFromRoot: async (rootHandle) => {
  #|         if (!rootHandle || typeof rootHandle.entries !== "function") return [];
  #|         if (!await folderRuntime.ensurePermission(rootHandle, "read", false)) {
  #|           const error = new Error("MoonAP needs this browser to regain access to the selected Personal SKILL directory.");
  #|           error.code = "permission-denied";
  #|           throw error;
  #|         }
  #|         let fallbackMap = new Map();
  #|         try {
  #|           const parsed = JSON.parse(localStorage.getItem("moonap.personal.skills") || "[]");
  #|           if (Array.isArray(parsed)) {
  #|             fallbackMap = new Map(parsed.map((item) => [String(item?.id || ""), item]));
  #|           }
  #|         } catch {}
  #|         const results = [];
  #|         for await (const [entryName, entryHandle] of rootHandle.entries()) {
  #|           if (!entryHandle || entryHandle.kind !== "directory") continue;
  #|           const skillId = `personal.${String(entryName || "")}`;
  #|           try {
  #|             await entryHandle.getFileHandle("SKILL.md");
  #|             const fallback = fallbackMap.get(skillId) || { id: skillId, folder_name: String(entryName || "") };
  #|             const loaded = await loadFromHandle(skillId, entryHandle, fallback);
  #|             loaded.export_root_name = String(rootHandle?.name || loaded.export_root_name || "");
  #|             results.push(loaded);
  #|             if (typeof runtime.putHandle === "function") {
  #|               try { await runtime.putHandle(skillId, entryHandle); } catch {}
  #|             }
  #|           } catch {}
  #|         }
  #|         results.sort((left, right) => String(left?.name || left?.id || "").localeCompare(String(right?.name || right?.id || "")));
  #|         return results;
  #|       },
  #|       syncIndexFromSkills: async (skills) => {
  #|         const next = Array.isArray(skills)
  #|           ? skills.map((skill) => ({
  #|               id: String(skill?.id || ""),
  #|               name: String(skill?.name || "Personal SKILL"),
  #|               description: String(skill?.description || ""),
  #|               task_kind: String(skill?.task_kind || "generic"),
  #|               runtime_mode: String(skill?.runtime_mode || "form"),
  #|               result_mode: String(skill?.result_mode || "text"),
  #|               folder_name: String(skill?.handle_name || skill?.folder_name || ""),
  #|               runtime_ready: true,
  #|               export_root_name: String(skill?.export_root_name || ""),
  #|               saved_at: String(skill?.saved_at || "")
  #|             }))
  #|           : [];
  #|         try { localStorage.setItem("moonap.personal.skills", JSON.stringify(next)); } catch {}
  #|       }
  #|     };
  #|     globalThis.__moonapPersonalSkillCache = runtime.cache;
  #|     globalThis.__moonapPersonalSkillRuntime = runtime;
  #|     return runtime;
  #|   };
  #|   const root = document.querySelector("#personalSkillCards");
  #|   if (!root) return 0;
  #|   root.innerHTML = "";
  #|   const loading = document.createElement("div");
  #|   loading.className = "personal-skill-empty";
  #|   loading.textContent = "Loading Personal SKILLs...";
  #|   root.append(loading);
  #|   (async () => {
  #|     const runtime = ensurePersonalSkillRuntime();
  #|     let rootHandle = globalThis.__moonapSkillExportRootHandle;
  #|     if (!rootHandle || typeof rootHandle.entries !== "function") {
  #|       rootHandle = await runtime.getRootHandle();
  #|       if (rootHandle && typeof rootHandle.entries === "function") {
  #|         globalThis.__moonapSkillExportRootHandle = rootHandle;
  #|       }
  #|     }
  #|     const panelLabel = document.querySelector("#personalSkillRootLabel");
  #|     if (panelLabel) {
  #|       panelLabel.textContent = rootHandle && rootHandle.name
  #|         ? `Selected folder: ${String(rootHandle.name)}`
  #|         : "No local Personal SKILL folder selected yet.";
  #|     }
  #|     if (!rootHandle || typeof rootHandle.entries !== "function") {
  #|       root.innerHTML = "";
  #|       const empty = document.createElement("div");
  #|       empty.className = "personal-skill-empty";
  #|       empty.textContent = "Choose a local Personal SKILL folder to load your current SKILL set.";
  #|       root.append(empty);
  #|       return;
  #|     }
  #|     const skills = await runtime.listFromRoot(rootHandle);
  #|     await runtime.syncIndexFromSkills(skills);
  #|     root.innerHTML = "";
  #|     if (skills.length === 0) {
  #|       const empty = document.createElement("div");
  #|       empty.className = "personal-skill-empty";
  #|       empty.textContent = "No Personal SKILL was found in the selected local directory.";
  #|       root.append(empty);
  #|       return;
  #|     }
  #|     for (const skill of skills) {
  #|       const card = document.createElement("button");
  #|       card.className = "skill-card personal";
  #|       card.type = "button";
  #|       card.dataset.skillId = skill.id || "personal.skill";
  #|       if (skill.available === false) card.dataset.skillUnavailable = "true";
  #|       const rootName = String(skill.export_root_name || "");
  #|       const subtitle = skill.available === false
  #|         ? (skill.load_error
  #|           ? `Saved locally, but MoonAP could not reopen it yet: ${String(skill.load_error)}`
  #|           : "Saved locally, but MoonAP needs this browser to regain access before reopening it.")
  #|         : (rootName
  #|           ? `Saved in ${rootName}. Reusable without LLM.`
  #|           : "Saved locally. Reusable without LLM.");
  #|       card.innerHTML = `<span>Local / Exported</span><strong>${skill.name || "Personal SKILL"}</strong><small>${subtitle}</small>`;
  #|       root.append(card);
  #|     }
  #|   })().catch((error) => {
  #|     root.innerHTML = "";
  #|     const empty = document.createElement("div");
  #|     empty.className = "personal-skill-empty";
  #|     const message = error instanceof Error ? error.message : String(error);
  #|     empty.textContent = error && error.code === "permission-denied"
  #|       ? message
  #|       : `Failed to load Personal SKILLs: ${message}`;
  #|     root.append(empty);
  #|   });
  #|   return 0;
  #| }

///|
#cfg(target="js")
extern "js" fn browser_render_local_skill_hub() -> Int =
  #| () => {
  #|   const pathRuntime = globalThis.__moonapVirtualPathRuntime;
  #|   if (!pathRuntime || typeof pathRuntime.normalize !== "function") {
  #|     throw new Error("MoonAP virtual path runtime is not ready yet.");
  #|   }
  #|   const ensureLocalSkillHubRuntime = () => {
  #|     if (globalThis.__moonapLocalSkillHubRuntime) return globalThis.__moonapLocalSkillHubRuntime;
  #|     const DB_NAME = "moonap.local.skill.hub.handles.v1";
  #|     const STORE_NAME = "handles";
  #|     const ROOT_KEY = "__root__";
  #|     const openDb = () => new Promise((resolve, reject) => {
  #|       const request = indexedDB.open(DB_NAME, 1);
  #|       request.onupgradeneeded = () => {
  #|         const db = request.result;
  #|         if (!db.objectStoreNames.contains(STORE_NAME)) {
  #|           db.createObjectStore(STORE_NAME);
  #|         }
  #|       };
  #|       request.onsuccess = () => resolve(request.result);
  #|       request.onerror = () => reject(request.error || new Error("Failed to open Local SKILL Hub database."));
  #|     });
  #|     const withStore = async (mode, work) => {
  #|       const db = await openDb();
  #|       return await new Promise((resolve, reject) => {
  #|         const transaction = db.transaction(STORE_NAME, mode);
  #|         const store = transaction.objectStore(STORE_NAME);
  #|         let settled = false;
  #|         const finishResolve = (value) => {
  #|           if (settled) return;
  #|           settled = true;
  #|           resolve(value);
  #|         };
  #|         const finishReject = (error) => {
  #|           if (settled) return;
  #|           settled = true;
  #|           reject(error);
  #|         };
  #|         transaction.oncomplete = () => finishResolve(undefined);
  #|         transaction.onerror = () => finishReject(transaction.error || new Error("Local SKILL Hub database transaction failed."));
  #|         transaction.onabort = () => finishReject(transaction.error || new Error("Local SKILL Hub database transaction was aborted."));
  #|         Promise.resolve(work(store, finishResolve, finishReject)).catch(finishReject);
  #|       }).finally(() => db.close());
  #|     };
  #|     const folderRuntime = globalThis.__moonapSkillFolderRuntime;
  #|     if (!folderRuntime || typeof folderRuntime.readSkillFolder !== "function" || typeof folderRuntime.ensurePermission !== "function") {
  #|       throw new Error("MoonAP skill folder runtime is not ready yet.");
  #|     }
  #|     const loadSkillFolder = async (dirHandle, relativePath) => {
  #|       const normalizedPath = pathRuntime.normalize(relativePath || dirHandle?.name || "");
  #|       return await folderRuntime.readSkillFolder(dirHandle, {
  #|         id: `local.${normalizedPath.replace(/\//g, ".")}`,
  #|         defaultName: "Local SKILL",
  #|         relativePath: normalizedPath
  #|       });
  #|     };
  #|     const walkSkills = async (dirHandle, prefix = "") => {
  #|       let results = [];
  #|       try {
  #|         await dirHandle.getFileHandle("SKILL.md");
  #|         results.push(await loadSkillFolder(dirHandle, prefix || String(dirHandle?.name || "")));
  #|         return results;
  #|       } catch {}
  #|       for await (const [entryName, entryHandle] of dirHandle.entries()) {
  #|         if (!entryHandle || entryHandle.kind !== "directory") continue;
  #|         const nextPrefix = prefix ? `${prefix}/${String(entryName || "")}` : String(entryName || "");
  #|         const nested = await walkSkills(entryHandle, nextPrefix);
  #|         if (nested.length > 0) results = results.concat(nested);
  #|       }
  #|       return results;
  #|     };
  #|     const runtime = {
  #|       putRootHandle: async (handle) => {
  #|         await withStore("readwrite", (store, resolve, reject) => {
  #|           const request = store.put(handle, ROOT_KEY);
  #|           request.onsuccess = () => resolve(true);
  #|           request.onerror = () => reject(request.error || new Error("Failed to save Local SKILL Hub root handle."));
  #|         });
  #|       },
  #|       getRootHandle: async () => {
  #|         return await withStore("readonly", (store, resolve, reject) => {
  #|           const request = store.get(ROOT_KEY);
  #|           request.onsuccess = () => resolve(request.result || null);
  #|           request.onerror = () => reject(request.error || new Error("Failed to read Local SKILL Hub root handle."));
  #|         });
  #|       },
  #|       hasPermission: async (handle, request = false) => {
  #|         return await folderRuntime.ensurePermission(handle, "readwrite", request);
  #|       },
  #|       listFromRoot: async (rootHandle) => {
  #|         if (!rootHandle || typeof rootHandle.entries !== "function") return [];
  #|         if (!await folderRuntime.ensurePermission(rootHandle, "read", false)) {
  #|           const error = new Error("MoonAP needs this browser to regain access to the selected Local SKILL Hub directory.");
  #|           error.code = "permission-denied";
  #|           throw error;
  #|         }
  #|         const skills = await walkSkills(rootHandle, "");
  #|         skills.sort((left, right) => String(left?.relative_path || left?.name || "").localeCompare(String(right?.relative_path || right?.name || "")));
  #|         return skills;
  #|       }
  #|     };
  #|     globalThis.__moonapLocalSkillHubRuntime = runtime;
  #|     return runtime;
  #|   };
  #|   const root = document.querySelector("#localSkillHubCards");
  #|   if (!root) return 0;
  #|   root.innerHTML = "";
  #|   const loading = document.createElement("div");
  #|   loading.className = "personal-skill-empty";
  #|   loading.textContent = "Loading Local SKILL Hub...";
  #|   root.append(loading);
  #|   (async () => {
  #|     const runtime = ensureLocalSkillHubRuntime();
  #|     let rootHandle = globalThis.__moonapLocalSkillHubRootHandle;
  #|     if (!rootHandle || typeof rootHandle.entries !== "function") {
  #|       rootHandle = await runtime.getRootHandle();
  #|       if (rootHandle && typeof rootHandle.entries === "function") {
  #|         globalThis.__moonapLocalSkillHubRootHandle = rootHandle;
  #|       }
  #|     }
  #|     const label = document.querySelector("#localSkillHubRootLabel");
  #|     if (label) {
  #|       label.textContent = rootHandle && rootHandle.name
  #|         ? `Selected folder: ${String(rootHandle.name)}`
  #|         : "No local SKILL Hub folder selected yet.";
  #|     }
  #|     root.innerHTML = "";
  #|     if (!rootHandle || typeof rootHandle.entries !== "function") {
  #|       const empty = document.createElement("div");
  #|       empty.className = "personal-skill-empty";
  #|       empty.textContent = "Choose a local SKILL Hub directory to browse installed public SKILLs.";
  #|       root.append(empty);
  #|       return;
  #|     }
  #|     const skills = await runtime.listFromRoot(rootHandle);
  #|     if (skills.length === 0) {
  #|       const empty = document.createElement("div");
  #|       empty.className = "personal-skill-empty";
  #|       empty.textContent = "No public SKILL folder was found in the selected Local SKILL Hub directory.";
  #|       root.append(empty);
  #|       return;
  #|     }
  #|     globalThis.__moonapHubSkillCache = globalThis.__moonapHubSkillCache || {};
  #|     for (const skill of skills) {
  #|       globalThis.__moonapHubSkillCache[String(skill.id || "")] = { ...skill, source: "local" };
  #|       const card = document.createElement("button");
  #|       card.className = "skill-card personal";
  #|       card.type = "button";
  #|       card.dataset.skillId = String(skill.id || "");
  #|       card.innerHTML = `<span>Local Hub / ${pathRuntime.normalize(skill.relative_path || "")}</span><strong>${skill.name || "Local SKILL"}</strong><small>${skill.description || `Task kind: ${String(skill.task_kind || "generic")}`}</small>`;
  #|       root.append(card);
  #|     }
  #|   })().catch((error) => {
  #|     root.innerHTML = "";
  #|     const empty = document.createElement("div");
  #|     empty.className = "personal-skill-empty";
  #|     const message = error instanceof Error ? error.message : String(error);
  #|     empty.textContent = error && error.code === "permission-denied"
  #|       ? message
  #|       : `Failed to load Local SKILL Hub: ${message}`;
  #|     root.append(empty);
  #|   });
  #|   return 0;
  #| }

///|
#cfg(target="js")
extern "js" fn browser_render_cloud_skill_hub(force_refresh : Bool) -> Int =
  #| (forceRefresh) => {
  #|   const pathRuntime = globalThis.__moonapVirtualPathRuntime;
  #|   if (!pathRuntime || typeof pathRuntime.normalize !== "function") {
  #|     throw new Error("MoonAP virtual path runtime is not ready yet.");
  #|   }
  #|   const root = document.querySelector("#cloudSkillHubCards");
  #|   if (!root) return 0;
  #|   root.innerHTML = "";
  #|   const loading = document.createElement("div");
  #|   loading.className = "personal-skill-empty";
  #|   loading.textContent = "Loading Cloud SKILL catalog...";
  #|   root.append(loading);
  #|   const repositoryUrl = "https://github.com/tangmaomao16/MoonAP-SKILL-Hub";
  #|   const indexUrl = "https://raw.githubusercontent.com/tangmaomao16/MoonAP-SKILL-Hub/main/index.json";
  #|   const sourceLabel = document.querySelector("#cloudSkillHubSourceLabel");
  #|   if (sourceLabel) {
  #|     sourceLabel.innerHTML = `<a href="${repositoryUrl}" target="_blank" rel="noreferrer" title="${repositoryUrl}" aria-label="Official MoonAP SKILL Hub repository">Official MoonAP SKILL Hub</a>`;
  #|   }
  #|   const normalizeSkill = (entry, hub) => {
  #|     const folderPath = pathRuntime.normalize(entry?.folder_path || "");
  #|     const canonicalName = folderPath ? pathRuntime.lastSegment(folderPath) : String(entry?.name || "Cloud SKILL");
  #|     const repository = String(entry?.repository_url || hub?.repository_url || repositoryUrl);
  #|     const rawBase = repository
  #|       .replace("https://github.com/", "https://raw.githubusercontent.com/")
  #|       .replace(/\/$/, "") + "/main";
  #|     const version = String(entry?.version || "");
  #|     const zipPath = pathRuntime.normalize(entry?.zip_path || (folderPath ? `${folderPath}.zip` : ""));
  #|     const zipUrl = String(entry?.zip_url || (zipPath ? `${rawBase}/${zipPath}` : ""));
  #|     return {
  #|       id: `cloud.${String(entry?.id || folderPath || entry?.name || "skill")}`,
  #|       name: canonicalName,
  #|       catalog_name: String(entry?.name || canonicalName),
  #|       description: String(entry?.description || ""),
  #|       task_kind: String(entry?.task_kind || "generic"),
  #|       runtime_mode: String(entry?.runtime_mode || "form"),
  #|       result_mode: String(entry?.result_mode || "text"),
  #|       runtime_spec: entry?.runtime_spec && typeof entry.runtime_spec === "object" ? entry.runtime_spec : {},
  #|       version,
  #|       domain: String(entry?.domain || ""),
  #|       subdomain: String(entry?.subdomain || ""),
  #|       tags: Array.isArray(entry?.tags) ? entry.tags : [],
  #|       folder_path: folderPath,
  #|       zip_path: zipPath,
  #|       repository_url: repository,
  #|       folder_url: folderPath ? `${repository}/tree/main/${folderPath}` : repository,
  #|       external_url: String(entry?.homepage_url || entry?.folder_url || (folderPath ? `${repository}/tree/main/${folderPath}` : repository)),
  #|       download_url: zipUrl,
  #|       source: "cloud"
  #|     };
  #|   };
  #|   (async () => {
  #|     let catalog = null;
  #|     if (!forceRefresh && globalThis.__moonapCloudSkillCatalog && Array.isArray(globalThis.__moonapCloudSkillCatalog.skills)) {
  #|       catalog = globalThis.__moonapCloudSkillCatalog;
  #|     } else {
  #|       const response = await fetch(indexUrl, { cache: "no-store" });
  #|       if (!response.ok) {
  #|         throw new Error(`Cloud index.json not available yet (${response.status}).`);
  #|       }
  #|       const parsed = await response.json();
  #|       catalog = Array.isArray(parsed)
  #|         ? {
  #|             hub_version: "1",
  #|             hub_name: "MoonAP-SKILL-Hub",
  #|             repository_url: repositoryUrl,
  #|             skills: parsed
  #|           }
  #|         : (parsed && typeof parsed === "object" ? parsed : {});
  #|       if (!Array.isArray(catalog?.skills) && Array.isArray(parsed?.entries)) {
  #|         catalog.skills = parsed.entries;
  #|       }
  #|       globalThis.__moonapCloudSkillCatalog = catalog;
  #|     }
  #|     const entries = Array.isArray(catalog?.skills) ? catalog.skills : [];
  #|     root.innerHTML = "";
  #|     if (entries.length === 0) {
  #|       const empty = document.createElement("div");
  #|       empty.className = "personal-skill-empty";
  #|       empty.textContent = "Cloud catalog is currently empty. Add public SKILL entries to index.json in the official MoonAP-SKILL-Hub repository.";
  #|       root.append(empty);
  #|       return;
  #|     }
  #|     globalThis.__moonapHubSkillCache = globalThis.__moonapHubSkillCache || {};
  #|     for (const entry of entries) {
  #|       const skill = normalizeSkill(entry, catalog);
  #|       globalThis.__moonapHubSkillCache[String(skill.id || "")] = skill;
  #|       const card = document.createElement("button");
  #|       card.className = "skill-card";
  #|       card.type = "button";
  #|       card.dataset.skillId = String(skill.id || "");
  #|       const top = [skill.domain || "", skill.subdomain || ""].filter(Boolean).join(" / ") || "Cloud SKILL";
  #|       const bottom = skill.description || (skill.version ? `version ${skill.version}` : "Public MoonAP SKILL");
  #|       card.innerHTML = `<span>${top}</span><strong>${skill.name || "Cloud SKILL"}</strong><small>${bottom}</small>`;
  #|       root.append(card);
  #|     }
  #|   })().catch((error) => {
  #|     root.innerHTML = "";
  #|     const empty = document.createElement("div");
  #|     empty.className = "personal-skill-empty";
  #|     empty.textContent = `Failed to load Cloud SKILL catalog: ${error instanceof Error ? error.message : String(error)}`;
  #|     root.append(empty);
  #|   });
  #|   return 0;
  #| }

///|
#cfg(target="js")
extern "js" fn browser_install_cloud_skill(
  skill_id : String,
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (skillId, onDone, onError) => {
  #|   try {
  #|     const pathRuntime = globalThis.__moonapVirtualPathRuntime;
  #|     if (!pathRuntime || typeof pathRuntime.normalize !== "function" || typeof pathRuntime.split !== "function" || typeof pathRuntime.lastSegment !== "function") {
  #|       throw new Error("MoonAP virtual path runtime is not ready yet.");
  #|     }
  #|     const skill = globalThis.__moonapHubSkillCache && typeof globalThis.__moonapHubSkillCache === "object"
  #|       ? globalThis.__moonapHubSkillCache[String(skillId || "")]
  #|       : null;
  #|     if (!skill || String(skill.source || "") !== "cloud") {
  #|       throw new Error("MoonAP could not find this Cloud SKILL entry.");
  #|     }
  #|     let rootHandle = globalThis.__moonapLocalSkillHubRootHandle;
  #|     const ensurePermission = async (handle, request = false) => {
  #|       if (!handle) return false;
  #|       if (typeof handle.queryPermission !== "function") return true;
  #|       try {
  #|         let state = await handle.queryPermission({ mode: "readwrite" });
  #|         if (state === "granted") return true;
  #|         if (request && typeof handle.requestPermission === "function") {
  #|           state = await handle.requestPermission({ mode: "readwrite" });
  #|           if (state === "granted") return true;
  #|         }
  #|       } catch {}
  #|       return false;
  #|     };
  #|     if (!rootHandle || typeof rootHandle.getDirectoryHandle !== "function") {
  #|       if (typeof window.showDirectoryPicker !== "function") {
  #|         throw new Error("This browser does not support local SKILL Hub directory selection.");
  #|       }
  #|       rootHandle = await window.showDirectoryPicker({ mode: "readwrite" });
  #|       globalThis.__moonapLocalSkillHubRootHandle = rootHandle;
  #|       const runtime = globalThis.__moonapLocalSkillHubRuntime;
  #|       if (runtime && typeof runtime.putRootHandle === "function") {
  #|         await runtime.putRootHandle(rootHandle);
  #|       }
  #|     } else if (!await ensurePermission(rootHandle, true)) {
  #|       if (typeof window.showDirectoryPicker !== "function") {
  #|         throw new Error("MoonAP needs a writable Local SKILL Hub directory, but this browser cannot reopen one.");
  #|       }
  #|       rootHandle = await window.showDirectoryPicker({ mode: "readwrite" });
  #|       globalThis.__moonapLocalSkillHubRootHandle = rootHandle;
  #|       const runtime = globalThis.__moonapLocalSkillHubRuntime;
  #|       if (runtime && typeof runtime.putRootHandle === "function") {
  #|         await runtime.putRootHandle(rootHandle);
  #|       }
  #|     }
  #|     const folderPath = pathRuntime.normalize(String(skill.folder_path || "").trim());
  #|     const downloadUrl = String(skill.download_url || "").trim();
  #|     if (!folderPath) throw new Error("Cloud SKILL entry does not include folder_path.");
  #|     if (!downloadUrl) throw new Error("Cloud SKILL entry does not include a ZIP download path yet.");
  #|     const zipRuntime = globalThis.__moonapSkillZipRuntime;
  #|     if (!zipRuntime || typeof zipRuntime.unzip !== "function") {
  #|       throw new Error("MoonAP ZIP runtime is not ready yet.");
  #|     }
  #|     const fetchBinary = async (url) => {
  #|       const response = await fetch(url, { cache: "no-store" });
  #|       if (!response.ok) {
  #|         throw new Error(`Failed to fetch ${url} (${response.status})`);
  #|       }
  #|       return new Uint8Array(await response.arrayBuffer());
  #|     };
  #|     const writeText = async (dirHandle, fileName, text) => {
  #|       const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  #|       const writable = await fileHandle.createWritable();
  #|       await writable.write(String(text || ""));
  #|       await writable.close();
  #|     };
  #|     const writeBinary = async (dirHandle, fileName, bytes) => {
  #|       const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
  #|       const writable = await fileHandle.createWritable();
  #|       await writable.write(bytes);
  #|       await writable.close();
  #|     };
  #|     const ensurePath = async (dirHandle, relativePath) => {
  #|       let current = dirHandle;
  #|       const parts = pathRuntime.split(relativePath);
  #|       for (const part of parts) {
  #|         current = await current.getDirectoryHandle(part, { create: true });
  #|       }
  #|       return current;
  #|     };
  #|     const zipBytes = await fetchBinary(downloadUrl);
  #|     const zipEntries = await zipRuntime.unzip(zipBytes);
  #|     const folderName = pathRuntime.lastSegment(folderPath);
  #|     const fileEntries = zipEntries.filter((entry) => entry && typeof entry.path === "string" && !entry.directory);
  #|     const stripRoot = folderName !== "" && fileEntries.length > 0 && fileEntries.every((entry) => {
  #|       const normalized = pathRuntime.normalize(entry.path || "");
  #|       return normalized === folderName || normalized.startsWith(`${folderName}/`);
  #|     });
  #|     const targetDir = await ensurePath(rootHandle, folderPath);
  #|     for (const entry of zipEntries) {
  #|       const originalPath = pathRuntime.normalize(entry?.path || "");
  #|       if (!originalPath || originalPath.startsWith("__MACOSX/")) continue;
  #|       const relativePath = stripRoot
  #|         ? (originalPath === folderName ? "" : originalPath.slice(folderName.length + 1))
  #|         : originalPath;
  #|       if (!relativePath) continue;
  #|       if (entry?.directory) {
  #|         await ensurePath(targetDir, relativePath);
  #|         continue;
  #|       }
  #|       const parts = pathRuntime.split(relativePath);
  #|       const fileName = parts.pop();
  #|       const parentDir = parts.length == 0 ? targetDir : await ensurePath(targetDir, parts.join("/"));
  #|       await writeBinary(parentDir, fileName, entry.bytes || new Uint8Array(0));
  #|     }
  #|     onDone(JSON.stringify({
  #|       installed: true,
  #|       name: String(skill.name || ""),
  #|       folder_path: folderPath,
  #|       root_name: String(rootHandle?.name || ""),
  #|       zip_url: downloadUrl
  #|     }, null, 2));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_choose_local_skill_hub_path(
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (onDone, onError) => {
  #|   try {
  #|     if (typeof window.showDirectoryPicker !== "function") {
  #|       throw new Error("This browser does not support local SKILL Hub directory selection.");
  #|     }
  #|     const handle = await window.showDirectoryPicker({ mode: "readwrite" });
  #|     globalThis.__moonapLocalSkillHubRootHandle = handle;
  #|     const ensureLocalSkillHubRuntime = () => {
  #|       if (globalThis.__moonapLocalSkillHubRuntime && typeof globalThis.__moonapLocalSkillHubRuntime.putRootHandle === "function") {
  #|         return globalThis.__moonapLocalSkillHubRuntime;
  #|       }
  #|       return null;
  #|     };
  #|     const runtime = ensureLocalSkillHubRuntime();
  #|     if (runtime) {
  #|       await runtime.putRootHandle(handle);
  #|     }
  #|     const label = document.querySelector("#localSkillHubRootLabel");
  #|     if (label) {
  #|       label.textContent = handle && handle.name
  #|         ? `Selected folder: ${String(handle.name)}`
  #|         : "No local SKILL Hub folder selected yet.";
  #|     }
  #|     onDone(String(handle?.name || ""));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_refresh_local_skill_hub_root_label() -> Unit =
  #| () => {
  #|   const label = document.querySelector("#localSkillHubRootLabel");
  #|   if (!label) return;
  #|   const rootHandle = globalThis.__moonapLocalSkillHubRootHandle;
  #|   label.textContent = rootHandle && rootHandle.name
  #|     ? `Selected folder: ${String(rootHandle.name)}`
  #|     : "No local SKILL Hub folder selected yet.";
  #| }

///|
#cfg(target="js")
extern "js" fn browser_on_local_skill_hub_choose_path(
  handler : () -> Unit,
) -> Unit =
  #| (handler) => document.addEventListener("click", (event) => {
  #|   if (event.target?.id !== "localSkillHubChoosePath") return;
  #|   event.preventDefault();
  #|   event.stopPropagation();
  #|   try {
  #|     handler();
  #|   } catch (error) {
  #|     alert(`MoonAP local SKILL Hub directory selection failed: ${error instanceof Error ? error.message : String(error)}`);
  #|   }
  #| })

///|
#cfg(target="js")
extern "js" fn browser_load_personal_skill(
  skill_id : String,
  on_done : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| async (skillId, onDone, onError) => {
  #|   try {
  #|     const runtime = globalThis.__moonapPersonalSkillRuntime;
  #|     const folderRuntime = globalThis.__moonapSkillFolderRuntime;
  #|     if (!runtime || typeof runtime.getHandle !== "function") {
  #|       throw new Error("Personal SKILL runtime is not ready yet. Open the SKILL tab again and retry.");
  #|     }
  #|     if (!folderRuntime || typeof folderRuntime.ensurePermission !== "function") {
  #|       throw new Error("MoonAP skill folder runtime is not ready yet. Open the SKILL tab again and retry.");
  #|     }
  #|     let fallback = null;
  #|     try {
  #|       const parsed = JSON.parse(localStorage.getItem("moonap.personal.skills") || "[]");
  #|       if (Array.isArray(parsed)) {
  #|         fallback = parsed.find((item) => String(item?.id || "") === String(skillId || "")) || null;
  #|       }
  #|     } catch {}
  #|     let rootHandle = globalThis.__moonapSkillExportRootHandle;
  #|     if ((!rootHandle || typeof rootHandle.entries !== "function") && typeof runtime.getRootHandle === "function") {
  #|       rootHandle = await runtime.getRootHandle();
  #|       if (rootHandle && typeof rootHandle.entries === "function") {
  #|         globalThis.__moonapSkillExportRootHandle = rootHandle;
  #|       }
  #|     }
  #|     if (rootHandle && typeof rootHandle.entries === "function") {
  #|       const rootReady = await folderRuntime.ensurePermission(rootHandle, "read", true);
  #|       if (!rootReady) {
  #|         const error = new Error("MoonAP needs this browser to regain access to the selected Personal SKILL directory before it can open this skill.");
  #|         error.code = "permission-denied";
  #|         throw error;
  #|       }
  #|     }
  #|     let handle = null;
  #|     if (rootHandle && typeof runtime.findSkillDir === "function") {
  #|       handle = await runtime.findSkillDir(rootHandle, skillId);
  #|     }
  #|     if (!handle) {
  #|       handle = await runtime.getHandle(skillId);
  #|     }
  #|     if (!handle) {
  #|       throw new Error("MoonAP could not find a saved local folder handle for this Personal SKILL.");
  #|     }
  #|     const handleReady = await folderRuntime.ensurePermission(handle, "read", true);
  #|     if (!handleReady) {
  #|       const error = new Error("MoonAP needs permission to reopen this saved Personal SKILL folder.");
  #|       error.code = "permission-denied";
  #|       throw error;
  #|     }
  #|     const loaded = await runtime.loadFromHandle(skillId, handle, fallback || {});
  #|     onDone(JSON.stringify(loaded, null, 2));
  #|   } catch (error) {
  #|     onError(error instanceof Error ? error.message : String(error));
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_set_mode_panel(text : String) -> Unit =
  #| (text) => {
  #|   const panel = document.querySelector("#modePanel");
  #|   if (panel) panel.setAttribute("aria-label", String(text));
  #| }

///|
#cfg(target="js")
extern "js" fn browser_set_skill_panel_open(open : Bool) -> Unit =
  #| (open) => {
  #|   const panel = document.querySelector("#modePanel");
  #|   const privacy = document.querySelector("#privacyStrip");
  #|   if (panel) panel.style.display = "";
  #|   if (privacy) privacy.style.display = "";
  #|   panel?.classList.toggle("is-open", Boolean(open));
  #|   privacy?.classList.toggle("is-open", Boolean(open));
  #| }

///|
#cfg(target="js")
extern "js" fn browser_refresh_personal_skill_root_label() -> Unit =
  #| () => {
  #|   const panelLabel = document.querySelector("#personalSkillRootLabel");
  #|   if (!panelLabel) return;
  #|   const rootHandle = globalThis.__moonapSkillExportRootHandle;
  #|   panelLabel.textContent = rootHandle && rootHandle.name
  #|     ? `Selected folder: ${String(rootHandle.name)}`
  #|     : "No local Personal SKILL folder selected yet.";
  #| }

///|
#cfg(target="js")
extern "js" fn browser_fetch_text(
  path : String,
  on_ok : (String) -> Unit,
  on_error : (String) -> Unit,
) -> Unit =
  #| (path, onOk, onError) => {
  #|   fetch(String(path))
  #|     .then((response) => response.text())
  #|     .then((text) => onOk(String(text)))
  #|     .catch((error) => onError(error instanceof Error ? error.message : String(error)));
  #| }

///|
#cfg(target="js")
extern "js" fn browser_pretty_json(raw : String) -> String =
  #| (raw) => {
  #|   try { return JSON.stringify(JSON.parse(String(raw)), null, 2); }
  #|   catch { return String(raw); }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_artifact_field(raw : String, field : String) -> String =
  #| (raw, field) => {
  #|   try {
  #|     const value = JSON.parse(String(raw))?.[String(field)];
  #|     return value == null ? "" : String(value);
  #|   } catch {
  #|     return "";
  #|   }
  #| }

///|
#cfg(target="js")
extern "js" fn browser_has_last_artifact_source() -> Bool =
  #| () => String(globalThis.__moonapLastArtifact?.moonbit_source || "").trim() !== ""

///|
#cfg(target="js")
fn show_error(label : String, error : String) -> Unit {
  browser_set_state(label + ": " + error)
  browser_update_process("-", label, "failed", error, "")
  browser_render_artifact_card(
    "MoonAP error", error, "[\"failed\"]", false, false, false,
  )
}

///|
#cfg(target="js")
fn refresh_policies() -> Unit {
  browser_fetch_text(
    "/api/app-state",
    fn(raw) {
      browser_set_state(browser_pretty_json(raw))
      browser_render_onboarding()
    },
    fn(error) { show_error("app-state fetch failed", error) },
  )
}

///|
#cfg(target="js")
fn show_llm_entry() -> Unit {
  browser_set_mode_panel("LLM settings")
  browser_set_skill_panel_open(false)
  browser_open_llm_dialog()
  browser_fetch_text(
    "/api/formal-verification",
    fn(raw) { browser_set_state(browser_pretty_json(raw)) },
    fn(error) { show_error("LLM state fetch failed", error) },
  )
}

///|
#cfg(target="js")
fn show_skill_entry() -> Unit {
  browser_set_mode_panel("MoonAP SKILL Hub")
  browser_set_skill_panel_open(true)
  browser_refresh_personal_skill_root_label()
  ignore(browser_render_personal_skills())
  browser_refresh_local_skill_hub_root_label()
  ignore(browser_render_local_skill_hub())
  ignore(browser_render_cloud_skill_hub(false))
  browser_fetch_text(
    "/api/skills",
    fn(raw) { browser_set_state(browser_pretty_json(raw)) },
    fn(error) { show_error("SKILL hub fetch failed", error) },
  )
}

///|
#cfg(target="js")
fn show_experiment_entry() -> Unit {
  browser_set_mode_panel("MoonAP Experiments")
  browser_set_skill_panel_open(false)
  show_skill_run_plan("free-llm-eval")
}

///|
#cfg(target="js")
fn show_skill_run_plan(skill_id : String) -> Unit {
  if skill_id.contains("personal.") {
    browser_load_personal_skill(
      skill_id,
      fn(raw) {
        browser_set_state(browser_pretty_json(raw))
        browser_open_skill_dialog(skill_id)
      },
      fn(error) { show_error("Personal SKILL load failed", error) },
    )
  } else if skill_id.contains("local.") || skill_id.contains("cloud.") {
    browser_open_skill_dialog(skill_id)
  } else {
    browser_open_skill_dialog(skill_id)
  }
}

///|
#cfg(target="js")
fn execute_dialog_skill() -> Unit {
  let skill_id = browser_dialog_skill_id()
  let personal_task_kind = browser_dialog_skill_task_kind()
  let skill_source = browser_dialog_skill_source()
  let external_url = browser_dialog_external_url()
  let download_url = browser_dialog_download_url()
  let folder_path = browser_dialog_folder_path()
  browser_close_skill_dialog()
  if skill_id.contains("personal.") {
    if personal_task_kind == "large-fastq-analysis" {
      browser_run_dialog_large_fastq_analysis(
        fn(result) {
          browser_set_state(browser_pretty_json(result))
          browser_set_transient_artifact_card(true)
          browser_render_artifact_card(
            "Personal SKILL result is ready", "Review the browser-local analysis report. You can open or save the report, then rerun this SKILL whenever needed.",
            "[\"personal skill\",\"runtime succeeded\",\"report ready\"]", false,
            false, false,
          )
          browser_show_toast(
            "Personal SKILL analyzed the FastQ file with browser-local streaming.",
          )
        },
        fn(error) {
          show_error("Personal SKILL large FastQ analysis failed", error)
        },
      )
      return
    }
    if personal_task_kind == "large-file-generation" {
      browser_run_dialog_large_file_generation(
        fn(result) {
          browser_set_state(browser_pretty_json(result))
          browser_show_toast(
            "Personal SKILL generated the FastQ file with browser-local streaming.",
          )
        },
        fn(error) {
          show_error("Personal SKILL large-file generation failed", error)
        },
      )
      return
    }
    if personal_task_kind == "fastq-generator" {
      run_fastq_generator()
      return
    }
    if personal_task_kind == "fastq-analysis" {
      run_fastq_counter()
      return
    }
    browser_run_dialog_generic_skill(
      fn(result) {
        browser_set_state(browser_pretty_json(result))
        browser_set_transient_artifact_card(true)
        browser_render_artifact_card(
          "Personal SKILL result is ready", "Review the browser-local result. This SKILL used its saved runtime spec and did not ask the LLM again.",
          "[\"personal skill\",\"generic runtime\",\"runtime succeeded\"]", false,
          false, false,
        )
        browser_show_toast("Personal SKILL ran with the generic runtime.")
      },
      fn(error) { show_error("Personal SKILL generic runtime failed", error) },
    )
    return
  }
  if skill_source == "local" {
    if personal_task_kind == "large-fastq-analysis" {
      browser_run_dialog_large_fastq_analysis(
        fn(result) {
          browser_set_state(browser_pretty_json(result))
          browser_set_transient_artifact_card(true)
          browser_render_artifact_card(
            "Local SKILL result is ready", "Review the browser-local analysis report. You can open or save the report, then rerun this SKILL whenever needed.",
            "[\"local skill\",\"runtime succeeded\",\"report ready\"]", false, false,
            false,
          )
          browser_show_toast(
            "Local SKILL analyzed the FastQ file with browser-local streaming.",
          )
        },
        fn(error) {
          show_error("Local SKILL large FastQ analysis failed", error)
        },
      )
      return
    }
    if personal_task_kind == "large-file-generation" {
      browser_run_dialog_large_file_generation(
        fn(result) {
          browser_set_state(browser_pretty_json(result))
          browser_show_toast(
            "Local SKILL generated the FastQ file with browser-local streaming.",
          )
        },
        fn(error) {
          show_error("Local SKILL large-file generation failed", error)
        },
      )
      return
    }
    if personal_task_kind == "fastq-generator" {
      run_fastq_generator()
      return
    }
    if personal_task_kind == "fastq-analysis" {
      run_fastq_counter()
      return
    }
    if skill_id.contains("gomoku") || personal_task_kind == "browser-game" {
      browser_show_toast(
        "Local public SKILL metadata is loaded. Task-specific execution wiring for this installed skill is the next step.",
      )
      return
    }
    browser_run_dialog_generic_skill(
      fn(result) {
        browser_set_state(browser_pretty_json(result))
        browser_set_transient_artifact_card(true)
        browser_render_artifact_card(
          "Local SKILL result is ready", "Review the browser-local result. This installed SKILL used its saved runtime spec and did not ask the LLM again.",
          "[\"local skill\",\"generic runtime\",\"runtime succeeded\"]", false, false,
          false,
        )
        browser_show_toast("Local SKILL ran with the generic runtime.")
      },
      fn(error) { show_error("Local SKILL generic runtime failed", error) },
    )
    return
  }
  if skill_source == "cloud" {
    browser_show_toast("Installing Cloud SKILL into Local SKILL Hub...")
    browser_install_cloud_skill(
      skill_id,
      fn(result) {
        browser_refresh_local_skill_hub_root_label()
        ignore(browser_render_local_skill_hub())
        browser_set_state(browser_pretty_json(result))
        browser_show_toast(
          if folder_path == "" {
            "Cloud SKILL installed into Local SKILL Hub."
          } else {
            "Cloud SKILL installed: " + folder_path
          },
        )
      },
      fn(error) {
        show_error(
          "Cloud SKILL install failed",
          if download_url != "" || external_url != "" {
            error +
            " You can still open the source repository manually if needed."
          } else {
            error
          },
        )
      },
    )
    return
  }
  if skill_id.contains("moonbit-benchmark") {
    run_moonbit_benchmark(browser_dialog_param_int("benchmarkLevel", 1))
    return
  }
  if skill_id.contains("free-llm-eval") {
    run_free_llm_moonbit_eval(browser_dialog_param_int("evalRepairRounds", 2))
    return
  }
  if skill_id.contains("moonbit.fastq-generator") {
    run_moonbit_fastq_generator()
    return
  }
  if skill_id.contains("fastq-base-counter") {
    run_fastq_counter()
    return
  }
  if skill_id.contains("fastq-generator") {
    run_fastq_generator()
    return
  }
  let path = if skill_id.contains("finance") {
    "/api/skills/run-plan?finance"
  } else if skill_id.contains("generator") {
    "/api/skills/run-plan?generator"
  } else if skill_id.contains("gomoku") || skill_id.contains("game") {
    "/api/skills/run-plan?gomoku"
  } else if skill_id == "personal" {
    "/api/personal-skill-set"
  } else {
    "/api/skills/run-plan?fastq"
  }
  browser_fetch_text(
    path,
    fn(raw) { browser_set_state(browser_pretty_json(raw)) },
    fn(error) { show_error("SKILL plan fetch failed", error) },
  )
}

///|
#cfg(target="js")
fn run_llm_moonbit_codegen(
  task_title : String,
  prompt : String,
  source_summary : String,
  simple_mode : Bool,
) -> Unit {
  browser_clear_artifact_card()
  browser_reset_compile_report()
  browser_set_benchmark_assessment("")
  browser_update_process(
    browser_llm_summary(),
    "llm-codegen",
    "running",
    "Submitting the minimal MoonBit codegen prompt to the next enabled provider in the router.",
    "",
  )
  browser_generate_moonbit_artifact(
    task_title,
    prompt,
    simple_mode,
    browser_formal_verification_enabled(),
    moonbit_llm_primer_v1(),
    fn(result) {
      browser_set_state(browser_pretty_json(result))
      browser_append_runtime_log(
        "artifact",
        "llm-codegen-result",
        browser_pretty_json(result),
      )
      let provider = browser_artifact_field(result, "llm_provider")
      let model = browser_artifact_field(result, "llm_model")
      let source = browser_artifact_field(result, "moonbit_source")
      browser_update_process(
        if provider == "" {
          browser_llm_summary()
        } else if model == "" {
          provider
        } else {
          provider + "/" + model
        },
        "llm-codegen",
        "succeeded",
        "Real LLM response received. MoonBit source captured from the minimal prompt flow. Compile/run remains pending until the next implementation step.",
        if source == "" {
          "No generated source returned."
        } else {
          source
        },
      )
      browser_render_artifact_card(
        task_title + " source is ready",
        source_summary,
        "[\"real LLM response\",\"source captured\",\"compile starting\"]",
        true,
        false,
        false,
      )
      run_compile_probe()
    },
    fn(error) { show_error("LLM MoonBit artifact generation failed", error) },
  )
}

///|
#cfg(target="js")
fn moonbit_llm_primer_v1() -> String {
  [
    "MoonBit 0.9 Primer for general LLMs:", "Treat MoonBit as its own language. Do not borrow syntax from Rust, C, C++, Go, Java, Python, TypeScript, or OCaml.",
    "", "MoonAP task constraints:", "1. Generate ONLY cmd/main/main.mbt. The build system already creates moon.mod.json and moon.pkg.",
    "2. Return source code only. No explanations, no markdown fences, no shell commands, no extra files.",
    "3. The target is `moon build cmd/main --target wasm-gc`, so keep the file self-contained.",
    "", "Core MoonBit 0.9 habits:", "4. Use MoonBit block style. The entry point should be `fn main { ... }`.",
    "5. Prefer the smallest valid solution that satisfies the task.", "6. Add helper functions only when they are clearly needed.",
    "7. If you are unsure about a library API, avoid that API and solve the task with basic language constructs.",
    "", "Tiny valid examples to imitate:", "fn main {", "  \"hello moonbit\"", "}",
    "", "fn greet(name : String) -> String {", "  \"hello \" + name", "}", "", "fn main {",
    "  greet(\"moonbit\")", "}", "", "Important syntax expectations:", "8. Use MoonBit type names like `Int`, `String`, `Bool`. Do not use `i32`, `u32`, `f32`, `usize`, or `char`.",
    "9. Do not write Rust-style imports like `import std::fmt;` or `use std::...`. In MoonAP tasks, do not write imports unless the task explicitly requires them.",
    "10. Do not write Rust mutation or collection syntax like `mut`, `let mut`, `String::new()`, `Vec`, `format!`, `println!`, `push_str`, or `as Type` casts.",
    "11. Do not write numeric suffixes like `42u32`, `1usize`, or `3.14f32`.", "12. Do not invent package declarations, trait syntax, impl blocks, or extra module files unless the task explicitly asks for them.",
    "", "Generation strategy:", "13. First write the smallest compilable MoonBit program that satisfies the task.",
    "14. Then add only the minimum helper functions or bindings needed by the requested behavior.",
    "15. When in doubt, choose simpler code over more abstract code.",
  ]
  .iter()
  .join("\n")
}

///|
#cfg(target="js")
fn clamp_moonbit_benchmark_level(level : Int) -> Int {
  if level < 1 {
    1
  } else if level > 5 {
    5
  } else {
    level
  }
}

///|
#cfg(target="js")
fn moonbit_benchmark_title(level : Int) -> String {
  "MoonBit Benchmark L" + clamp_moonbit_benchmark_level(level).to_string()
}

///|
#cfg(target="js")
fn moonbit_benchmark_prompt(level : Int) -> String {
  let current = clamp_moonbit_benchmark_level(level)
  if current == 1 {
    [
      "MoonBit Benchmark Level 1.", "Write the smallest valid `cmd/main/main.mbt` that compiles under wasm-gc.",
      "Required behavior:", "- `main` returns the string `hello moonbit`", "- no helper functions",
      "- no imports", "- keep the file tiny", "Return only the file contents.",
    ]
    .iter()
    .join("\n")
  } else if current == 2 {
    [
      "MoonBit Benchmark Level 2.", "Write `cmd/main/main.mbt` with exactly one helper function plus `main`.",
      "Required behavior:", "- helper function returns the string `hello moonbit`",
      "- `main` calls the helper and returns the result", "- no imports", "- keep the file tiny and valid for wasm-gc compile",
      "Return only the file contents.",
    ]
    .iter()
    .join("\n")
  } else if current == 3 {
    [
      "MoonBit Benchmark Level 3.", "Write `cmd/main/main.mbt` that builds a fixed string using simple control flow.",
      "Required behavior:", "- return exactly `ABC` from `main`", "- no imports",
      "- no randomness", "- keep the implementation compact and valid for wasm-gc compile",
      "Return only the file contents.",
    ]
    .iter()
    .join("\n")
  } else if current == 4 {
    [
      "MoonBit Benchmark Level 4.", "Write `cmd/main/main.mbt` with two helper functions that thread a small deterministic integer state value.",
      "Required behavior:", "- one helper updates an integer state", "- one helper turns the state into a single base from `A`, `C`, `G`, `T`",
      "- `main` returns a fixed 12-character DNA string generated from seed 42",
      "- no imports", "- no floating point types", "- keep the code compact and valid for wasm-gc compile",
      "Return only the file contents.",
    ]
    .iter()
    .join("\n")
  } else {
    [
      "MoonBit Benchmark Level 5.", "Write `cmd/main/main.mbt` for a tiny deterministic synthetic read generator.",
      "Required behavior:", "- return one 4-line FastQ record as a String", "- header must be `@moonap_benchmark_0`",
      "- sequence length must be 12", "- quality line must be twelve `I` characters",
      "- deterministic output from seed 42", "- no imports", "- keep the code compact and valid for wasm-gc compile",
      "Return only the file contents.",
    ]
    .iter()
    .join("\n")
  }
}

///|
#cfg(target="js")
fn run_moonbit_benchmark(level : Int) -> Unit {
  let current = clamp_moonbit_benchmark_level(level)
  browser_append_message(
    "assistant",
    "Running " +
    moonbit_benchmark_title(current) +
    ". We will use this to check whether the current LLM router can stay in valid MoonBit before we try harder tasks.",
  )
  run_llm_moonbit_codegen(
    moonbit_benchmark_title(current),
    moonbit_benchmark_prompt(current),
    "MoonAP received benchmark source from the active router provider and is now starting a real native compile probe automatically.",
    true,
  )
}

///|
#cfg(target="js")
fn run_free_llm_moonbit_eval(max_level : Int) -> Unit {
  let current = if max_level < 1 {
    1
  } else if max_level > 3 {
    3
  } else {
    max_level
  }
  browser_append_message(
    "assistant",
    "Starting Free LLM FastQ Eval. We will run the enabled provider/model entries against the single task 'Generate a FastQ file generator.' with the minimal prompt and up to " +
    current.to_string() +
    " repair rounds, then persist raw JSON plus a markdown summary.",
  )
  browser_update_process(
    browser_llm_summary(),
    "moonbit-eval",
    "running",
    "Preparing the experiment harness. Results will be persisted to artifacts/moonbit-eval-results.json and docs/experiments/free-llm-moonbit/results.md.",
    "",
  )
  browser_run_free_llm_moonbit_eval(
    current,
    fn(result) {
      browser_set_state(browser_pretty_json(result))
      browser_render_artifact_card(
        "Free LLM FastQ Eval finished", "MoonAP completed the current FastQ experiment pass and wrote both raw JSON and a markdown summary file.",
        "[\"experiment complete\",\"json persisted\",\"markdown persisted\"]", false,
        false, false,
      )
    },
    fn(error) { show_error("Free LLM FastQ Eval failed", error) },
  )
}

///|
#cfg(target="js")
fn run_fastq_generator() -> Unit {
  browser_clear_artifact_card()
  let read_count = browser_dialog_param_int("readCount", 10000)
  let read_length = browser_dialog_param_int("readLength", 150)
  let seed_value = browser_dialog_param_int("seed", 42)
  let n_rate_text = browser_dialog_param("nRate")
  browser_generate_fastq_sample(
    read_count,
    read_length,
    n_rate_text,
    seed_value,
    fn(result) {
      browser_set_state(browser_pretty_json(result))
      browser_update_result_panel(result)
    },
    fn(error) { show_error("FastQ generator failed", error) },
  )
}

///|
#cfg(target="js")
fn run_moonbit_fastq_generator() -> Unit {
  let read_count = browser_dialog_param_int("readCount", 10000)
  let read_length = browser_dialog_param_int("readLength", 150)
  let seed_value = browser_dialog_param_int("seed", 42)
  let n_rate_per_mille = browser_dialog_param_int("nRatePerMille", 10)
  browser_append_message(
    "assistant", "Running MoonBit FastQ Generator. We will ask the active LLM router to generate a MoonBit program, then run a real compile probe and a basic FastQ structure check.",
  )
  run_llm_moonbit_codegen(
    "MoonBit FastQ Generator",
    [
      "Generate a Personal FastQ Generator in MoonBit.",
      "Write ONLY cmd/main/main.mbt so that `moon build cmd/main --target wasm-gc` succeeds.",
      "The program should return a String containing deterministic FastQ records.",
      "Keep these defaults in the source:",
      "- read_count = " + read_count.to_string(),
      "- read_length = " + read_length.to_string(),
      "- n_rate_per_mille = " + n_rate_per_mille.to_string(),
      "- seed = " + seed_value.to_string(),
      "Requirements:",
      "- generate valid 4-line FastQ records: header, sequence, plus line, quality",
      "- sequence uses only A, C, G, T, N",
      "- quality line uses I characters",
      "- deterministic from the seed",
      "- no imports",
      "- keep the code as simple and compact as possible",
      "Return only the file contents.",
    ]
    .iter()
    .join("\n"),
    "MoonAP received a MoonBit FastQ generator candidate from the active router provider and is now starting a real native compile probe automatically.",
    true,
  )
}

///|
#cfg(target="js")
fn max_auto_repair_rounds() -> Int {
  2
}

///|
#cfg(target="js")
fn maybe_auto_repair_after_compile_failure(
  summary_kind : String,
  repair_hint : String,
  summary_excerpt : String,
) -> Bool {
  let repair_round = browser_last_artifact_repair_round()
  let max_rounds = max_auto_repair_rounds()
  if repair_hint == "" || repair_round >= max_rounds {
    false
  } else {
    let next_round = repair_round + 1
    let log_text = if summary_excerpt == "" {
      repair_hint
    } else {
      summary_excerpt + "\nRepair hint: " + repair_hint
    }
    let detected_kind = if summary_kind == "" {
      "compiler-error"
    } else {
      summary_kind
    }
    browser_update_process(
      browser_llm_summary(),
      "compile-repair",
      "running",
      "Compile probe failed. MoonAP is auto-repairing round " +
      next_round.to_string() +
      "/" +
      max_rounds.to_string() +
      " using Compile-Error Summarizer v1.\n" +
      log_text,
      "",
    )
    browser_render_artifact_card(
      "Compile probe failed, auto-repairing",
      "MoonAP detected " +
      detected_kind +
      " and automatically started repair round " +
      next_round.to_string() +
      "/" +
      max_rounds.to_string() +
      ".",
      "[\"auto repair\",\"round " +
      next_round.to_string() +
      "\",\"" +
      detected_kind +
      "\"]",
      false,
      false,
      false,
    )
    run_repair_from_compile_summary()
    true
  }
}

///|
#cfg(target="js")
fn maybe_auto_repair_after_quality_failure(
  assessment_title : String,
  assessment_summary : String,
  assessment_hint : String,
  missing_signals_json : String,
) -> Bool {
  let repair_round = browser_last_artifact_repair_round()
  let max_rounds = max_auto_repair_rounds()
  if repair_round >= max_rounds {
    false
  } else {
    let next_round = repair_round + 1
    let detected_title = if assessment_title == "" {
      "System assessment failed"
    } else {
      assessment_title
    }
    let missing_excerpt = if missing_signals_json == "" ||
      missing_signals_json == "[]" {
      ""
    } else {
      "\nMissing signals: " + missing_signals_json
    }
    let hint_excerpt = if assessment_hint == "" {
      missing_excerpt
    } else {
      "\nRepair hint: " + assessment_hint + missing_excerpt
    }
    let log_text = "Compile probe succeeded, but system assessment failed. MoonAP is auto-repairing round " +
      next_round.to_string() +
      "/" +
      max_rounds.to_string() +
      " using the captured benchmark feedback.\n" +
      assessment_summary +
      hint_excerpt
    browser_update_process(
      browser_llm_summary(),
      "quality-repair",
      "running",
      log_text,
      "",
    )
    browser_render_artifact_card(
      "Compile succeeded, auto-repairing quality",
      "MoonAP kept the compiled artifact, but the system assessment still failed. Starting quality repair round " +
      next_round.to_string() +
      "/" +
      max_rounds.to_string() +
      ".",
      "[\"quality repair\",\"round " +
      next_round.to_string() +
      "\",\"" +
      detected_title.replace_all(old="\"", new="'") +
      "\"]",
      false,
      false,
      false,
    )
    run_repair_from_system_assessment()
    true
  }
}

///|
#cfg(target="js")
fn run_compile_probe() -> Unit {
  browser_clear_artifact_card()
  browser_update_process(
    browser_llm_summary(),
    "moonbit-wasm-compile",
    "running",
    "Submitting captured MoonBit source to the native MoonAP compile probe.",
    "",
  )
  browser_compile_last_artifact(
    browser_formal_verification_enabled(),
    fn(result) {
      browser_store_compile_report(result)
      browser_set_state(browser_pretty_json(result))
      browser_append_runtime_log(
        "compile",
        "compile-report",
        browser_pretty_json(result),
      )
      let ok = browser_artifact_field(result, "ok")
      let stage = browser_artifact_field(result, "stage")
      let output = browser_artifact_field(result, "output")
      let wasm_path = browser_artifact_field(result, "wasm_path")
      let summary_kind = browser_artifact_field(result, "summary_kind")
      let repair_hint = browser_artifact_field(result, "repair_hint")
      let summary_excerpt = browser_artifact_field(result, "summary_excerpt")
      browser_update_process(
        browser_llm_summary(),
        if stage == "" {
          "moonbit-wasm-compile"
        } else {
          stage
        },
        if ok == "true" {
          "succeeded"
        } else {
          "failed"
        },
        if ok == "true" || summary_excerpt == "" {
          output
        } else if repair_hint == "" {
          summary_excerpt
        } else {
          summary_excerpt + "\nRepair hint: " + repair_hint
        },
        if wasm_path == "" {
          "No wasm artifact was produced."
        } else {
          "Wasm artifact: " + wasm_path
        },
      )
      if ok == "true" {
        if browser_should_adapt_last_artifact_for_large_file_runtime() {
          run_moonap_runtime_adaptation()
        } else {
          browser_register_runtime_ready(
            fn(raw) { on_runtime_request_ready(raw) },
            fn(error) {
              browser_append_runtime_log(
                "runtime-exec", "runtime-request-register-failed", error,
              )
            },
          )
          let benchmark_assessment = browser_assess_last_benchmark()
          browser_append_runtime_log(
            "benchmark", "benchmark-assessment", benchmark_assessment,
          )
          let benchmark_applicable = browser_artifact_field(
            benchmark_assessment, "applicable",
          )
          browser_set_benchmark_assessment(benchmark_assessment)
          if benchmark_applicable == "true" {
            let benchmark_title = browser_artifact_field(
              benchmark_assessment, "title",
            )
            let benchmark_summary = browser_artifact_field(
              benchmark_assessment, "summary",
            )
            let benchmark_meta_json = browser_artifact_field(
              benchmark_assessment, "meta_json",
            )
            let benchmark_pass = browser_artifact_field(
              benchmark_assessment, "pass",
            )
            browser_update_process(
              browser_llm_summary(),
              "moonbit-benchmark-check",
              if benchmark_pass == "true" {
                "succeeded"
              } else {
                "failed"
              },
              benchmark_summary,
              "",
            )
            let benchmark_hint = browser_artifact_field(
              benchmark_assessment, "repair_hint",
            )
            let benchmark_missing_signals_json = browser_artifact_field(
              benchmark_assessment, "missing_signals_json",
            )
            if benchmark_pass != "true" &&
              maybe_auto_repair_after_quality_failure(
                benchmark_title, benchmark_summary, benchmark_hint, benchmark_missing_signals_json,
              ) {
              ()
            } else {
              browser_render_artifact_card(
                benchmark_title, benchmark_summary, benchmark_meta_json, true, false,
                false,
              )
              browser_render_onboarding()
            }
          } else {
            browser_render_artifact_card(
              "Compile probe succeeded", "MoonAP used the native MoonBit toolchain on this machine and produced a real wasm-gc artifact. Browser-local runtime execution is the next implementation step.",
              "[\"compile probe ok\",\"real wasm built\",\"runtime pending\"]", true,
              false, false,
            )
            browser_render_onboarding()
          }
        }
      } else if maybe_auto_repair_after_compile_failure(
          summary_kind, repair_hint, summary_excerpt,
        ) {
        ()
      } else {
        browser_render_artifact_card(
          "Compile probe failed",
          if repair_hint == "" {
            "MoonAP attempted a real native compile and returned the true compiler output. Review Details and iterate on the generated source."
          } else {
            "MoonAP summarized the compiler failure, exhausted the current auto-repair budget, and kept the true compiler output for inspection."
          },
          "[\"compile failed\",\"true compiler output\",\"" +
          summary_kind +
          "\",\"" +
          summary_excerpt.replace_all(old="\"", new="'") +
          "\"]",
          true,
          false,
          false,
        )
      }
    },
    fn(error) { show_error("compile probe failed", error) },
  )
}

///|
#cfg(target="js")
fn run_repair_from_compile_summary() -> Unit {
  browser_clear_artifact_card()
  browser_update_process(
    browser_llm_summary(),
    "compile-repair",
    "running",
    "Submitting the captured compiler failure back to the next enabled provider with direct appended repair context.",
    "",
  )
  browser_repair_last_artifact_with_compile_summary(
    browser_formal_verification_enabled(),
    moonbit_llm_primer_v1(),
    fn(result) {
      browser_set_state(browser_pretty_json(result))
      browser_append_runtime_log(
        "artifact",
        "repair-result",
        browser_pretty_json(result),
      )
      let provider = browser_artifact_field(result, "llm_provider")
      let model = browser_artifact_field(result, "llm_model")
      let source = browser_artifact_field(result, "moonbit_source")
      let repair_round = browser_artifact_field(result, "repair_round")
      browser_update_process(
        if provider == "" {
          browser_llm_summary()
        } else if model == "" {
          provider
        } else {
          provider + "/" + model
        },
        "compile-repair",
        "succeeded",
        "Compile-Error Summarizer v1 injected the first compiler failure into a repair prompt. MoonAP captured a repaired MoonBit source and will run the compile probe again automatically.",
        if source == "" {
          "No repaired source returned."
        } else {
          source
        },
      )
      browser_render_artifact_card(
        "Repaired source is ready",
        "MoonAP generated repair round " +
        repair_round +
        " from the summarized compiler failure and is now re-running the native compile probe.",
        "[\"repair round " +
        repair_round +
        "\",\"compile summary v1\",\"compile starting\"]",
        true,
        false,
        false,
      )
      run_compile_probe()
    },
    fn(error) { show_error("MoonBit compile repair failed", error) },
  )
}

///|
#cfg(target="js")
fn run_repair_from_system_assessment() -> Unit {
  browser_clear_artifact_card()
  browser_update_process(
    browser_llm_summary(),
    "quality-repair",
    "running",
    "Submitting the captured system assessment back to the next enabled provider.",
    "",
  )
  browser_repair_last_artifact_with_system_assessment(
    moonbit_llm_primer_v1(),
    fn(result) {
      browser_set_state(browser_pretty_json(result))
      browser_append_runtime_log(
        "artifact",
        "quality-repair-result",
        browser_pretty_json(result),
      )
      let provider = browser_artifact_field(result, "llm_provider")
      let model = browser_artifact_field(result, "llm_model")
      let source = browser_artifact_field(result, "moonbit_source")
      let repair_round = browser_artifact_field(result, "repair_round")
      browser_update_process(
        if provider == "" {
          browser_llm_summary()
        } else if model == "" {
          provider
        } else {
          provider + "/" + model
        },
        "quality-repair",
        "succeeded",
        "MoonAP injected the current system assessment into a quality-repair prompt. The revised MoonBit source will now be compiled again automatically.",
        if source == "" {
          "No revised source returned."
        } else {
          source
        },
      )
      browser_render_artifact_card(
        "Quality-repaired source is ready",
        "MoonAP generated repair round " +
        repair_round +
        " from the system assessment and is now re-running the native compile probe.",
        "[\"quality repair round " +
        repair_round +
        "\",\"system assessment\",\"compile starting\"]",
        true,
        false,
        false,
      )
      run_compile_probe()
    },
    fn(error) { show_error("MoonBit quality repair failed", error) },
  )
}

///|
#cfg(target="js")
fn run_moonap_runtime_adaptation() -> Unit {
  browser_clear_artifact_card()
  browser_update_process(
    browser_llm_summary(),
    "moonap-adaptation",
    "running",
    "Stage 1 compiled. MoonAP is now asking the active LLM route to adapt the compiled business code to the large-file runtime contract.",
    "",
  )
  browser_render_artifact_card(
    "Adapting source for MoonAP runtime", "The first-stage MoonBit source compiled. MoonAP is now running a second LLM pass to add large-file generation/analysis adapter functions, then it will compile again.",
    "[\"stage 2\",\"moonap adaptation\",\"compile starting next\"]", false, false,
    false,
  )
  browser_adapt_last_artifact_for_large_file_runtime(
    fn(result) {
      browser_set_state(browser_pretty_json(result))
      browser_append_runtime_log(
        "artifact",
        "moonap-adaptation-result",
        browser_pretty_json(result),
      )
      let provider = browser_artifact_field(result, "llm_provider")
      let model = browser_artifact_field(result, "llm_model")
      let source = browser_artifact_field(result, "moonbit_source")
      browser_update_process(
        if provider == "" {
          browser_llm_summary()
        } else if model == "" {
          provider
        } else {
          provider + "/" + model
        },
        "moonap-adaptation",
        "succeeded",
        "MoonAP received adapted source with large-file runtime adapter functions. Re-running compile probe now.",
        if source == "" {
          "No adapted source returned."
        } else {
          source
        },
      )
      browser_render_artifact_card(
        "MoonAP-adapted source is ready", "The second-stage source has been adapted for the MoonAP large-file runtime contract. MoonAP is compiling the adapted source now.",
        "[\"stage 2 complete\",\"adapter source\",\"compile starting\"]", true, false,
        false,
      )
      run_compile_probe()
    },
    fn(error) { show_error("MoonAP runtime adaptation failed", error) },
  )
}

///|
#cfg(target="js")
fn run_fastq_counter() -> Unit {
  browser_clear_artifact_card()
  if !browser_has_file() {
    browser_append_message(
      "assistant", "Choose a FastQ file with the + button first, then run FastQ Base Counter. File contents will stay in this browser.",
    )
    return
  }
  browser_run_fastq_counter(
    browser_dialog_param("targetBase"),
    fn(progress) {
      browser_set_state(browser_pretty_json(progress))
      browser_update_result_panel(progress)
    },
    fn(result) {
      browser_set_state(browser_pretty_json(result))
      browser_update_result_panel(result)
    },
    fn(error) { show_error("FastQ analysis failed", error) },
  )
}

///|
#cfg(target="js")
fn on_runtime_request_ready(raw : String) -> Unit {
  let request_id = browser_artifact_field(raw, "request_id")
  let status = browser_artifact_field(raw, "status")
  let wasm_path = browser_artifact_field(raw, "wasm_path")
  if request_id == "" || status == "" || status == "empty" {
    return
  }
  browser_set_transient_artifact_card(true)
  browser_remember_runtime_request(raw)
  browser_set_state(browser_pretty_json(raw))
  browser_update_result_panel(raw)
  browser_update_process(
    browser_llm_summary(),
    "runtime-exec",
    if status == "" {
      "ready"
    } else {
      status
    },
    "MoonAP compiled a wasm artifact and prepared the next runtime-execution request. Browser display or downloadable output is the next step.",
    if wasm_path == "" {
      "No wasm path recorded yet."
    } else {
      "Wasm artifact: " + wasm_path
    },
  )
  browser_render_artifact_card(
    "Runtime execution is ready", "MoonAP has a compiled wasm artifact and is now waiting for browser-local execution or a simulated runtime result.",
    "[\"runtime ready\",\"browser display pending\",\"download allowed\"]", false,
    false, false,
  )
}

///|
#cfg(target="js")
fn on_runtime_result_ready(raw : String) -> Unit {
  let request_id = browser_artifact_field(raw, "request_id")
  let status = browser_artifact_field(raw, "status")
  let summary = browser_artifact_field(raw, "summary")
  let display_text = browser_artifact_field(raw, "display_text")
  let download_name = browser_artifact_field(raw, "download_name")
  if request_id == "" || status == "" || status == "empty" {
    return
  }
  browser_set_transient_artifact_card(true)
  browser_remember_runtime_result(raw)
  browser_set_state(browser_pretty_json(raw))
  browser_update_result_panel(raw)
  browser_update_process(
    browser_llm_summary(),
    "runtime-exec",
    if status == "" {
      "runtime-succeeded"
    } else {
      status
    },
    if summary == "" {
      "MoonAP received a runtime result."
    } else {
      summary
    },
    if display_text == "" {
      if download_name == "" {
        "No browser-visible runtime preview was recorded."
      } else {
        "Downloadable result: " + download_name
      }
    } else {
      display_text
    },
  )
  browser_render_artifact_card(
    "Runtime result is ready", "Review the runtime output. If it looks good, you can now save this workflow as a reusable Personal SKILL.",
    "[\"runtime succeeded\",\"result visible\",\"user review pending\"]", false,
    false, true,
  )
}

///|
#cfg(target="js")
fn on_skill_save_decision(raw : String) -> Unit {
  let request_id = browser_artifact_field(raw, "request_id")
  let decision = browser_artifact_field(raw, "decision")
  let reason = browser_artifact_field(raw, "reason")
  let exported_folder = browser_artifact_field(raw, "exported_folder_name")
  let exported_root = browser_artifact_field(raw, "exported_root_name")
  let exported_zip = browser_artifact_field(raw, "exported_zip_name")
  if !browser_has_last_artifact_source() {
    return
  }
  if request_id == "" ||
    decision == "" ||
    decision == "pending" ||
    decision == "unset" {
    ()
  } else {
    browser_set_transient_artifact_card(true)
    browser_set_state(browser_pretty_json(raw))
    browser_update_process(
      browser_llm_summary(),
      "skill-export",
      decision,
      if reason == "" {
        "MoonAP recorded the user's save decision."
      } else {
        reason
      },
      "",
    )
    browser_render_artifact_card(
      "SKILL export completed",
      if reason == "" {
        "MoonAP exported the current workflow as a Personal SKILL. You can still rerun the program from this page or save another copy with a different name or location."
      } else if exported_folder == "" {
        reason +
        " You can still rerun the program from this page or save another copy with a different name or location."
      } else if exported_root == "" {
        reason +
        " Exported folder: " +
        exported_folder +
        ". You can still rerun the program from this page or save another copy with a different name or location."
      } else {
        reason +
        " Exported to " +
        exported_root +
        "/" +
        exported_folder +
        (if exported_zip == "" {
          ""
        } else {
          " with ZIP package " + exported_zip + "."
        }) +
        ". You can still rerun the program from this page or save another copy with a different name or location."
      },
      "[\"skill decision\",\"recorded\"]",
      false,
      false,
      true,
    )
    browser_show_toast(
      if exported_folder == "" {
        "SKILL saved. You can rerun the program or save another copy with a different name."
      } else if exported_root == "" {
        "SKILL saved as " +
        exported_folder +
        ". You can rerun the program or save another copy."
      } else {
        "SKILL saved to " +
        exported_root +
        "/" +
        exported_folder +
        (if exported_zip == "" {
          ""
        } else {
          " with ZIP package " + exported_zip + "."
        }) +
        ". You can rerun the program or save another copy."
      },
    )
  }
}

///|
#cfg(target="js")
fn submit_message() -> Unit {
  let message = browser_message_value()
  let file_name = browser_file_name()
  let lower_message = message.to_lower()
  let lower_file_name = file_name.to_lower()
  if message == "" {
    browser_append_message("assistant", "Please enter a task first.")
    return
  }
  browser_append_message("user", message)
  if !browser_llm_is_configured() {
    browser_append_message(
      "assistant", "LLM API is not configured yet. Please save provider, model, and API key first. You can still use SKILL without LLM.",
    )
    browser_open_llm_dialog()
    return
  }
  if browser_formal_verification_enabled() {
    browser_append_message(
      "assistant", "Formal verification is reserved for a future MoonBit 0.9 moon prove step and is not executed yet.",
    )
  }
  let fastq_mentioned = lower_message.contains("fastq") ||
    lower_file_name.contains(".fq") ||
    lower_file_name.contains(".fastq")
  let wants_fastq_generation = (
      lower_message.contains("generat") || lower_message.contains("create")
    ) &&
    !lower_message.contains("analy") &&
    !lower_message.contains("count")
  let wants_fastq_file_analysis = fastq_mentioned &&
    !wants_fastq_generation &&
    (
      lower_message.contains("analy") ||
      lower_message.contains("count") ||
      lower_message.contains("read") ||
      lower_message.contains("base")
    )
  if browser_has_file() && wants_fastq_file_analysis {
    run_fastq_counter()
    return
  }
  if lower_message.contains("moonbit benchmark") {
    run_moonbit_benchmark(1)
    return
  }
  run_llm_moonbit_codegen(
    "MoonBit Task", message, "MoonAP received MoonBit source from the active router provider and is now starting a real native compile probe automatically.",
    false,
  )
}

///|
#cfg(target="js")
fn main {
  ignore(browser_extract_moonbit_source(""))
  browser_enable_minimal_shell()
  browser_prepare_message_input("Generate a FastQ file generator.")
  browser_on_submit(fn() { submit_message() })
  browser_ensure_runtime_profile_runtime()
  browser_ensure_report_runtime()
  browser_on_click("#experimentButton", fn() { show_experiment_entry() })
  browser_on_click("#detailsToggle", fn() { browser_toggle_details() })
  browser_on_click("#llmButton", fn() { show_llm_entry() })
  browser_on_click("#skillButton", fn() { show_skill_entry() })
  browser_on_onboarding_action(
    fn() { run_moonbit_benchmark(browser_next_benchmark_level()) },
    fn() { show_skill_entry() },
    fn() { show_llm_entry() },
    fn() { browser_open_runtime_log() },
    fn() { browser_download_runtime_log() },
  )
  browser_on_skill_card_click(fn(skill_id) { show_skill_run_plan(skill_id) })
  browser_on_dialog_run(fn() { execute_dialog_skill() })
  browser_on_dialog_open_source(fn() {
    let external_url = browser_dialog_external_url()
    if external_url == "" {
      show_error(
        "Open source unavailable", "This SKILL entry does not expose a GitHub source URL yet.",
      )
    } else {
      browser_open_external_url(external_url)
    }
  })
  browser_on_dialog_cancel(fn() { browser_close_skill_dialog() })
  browser_on_llm_save(fn() { browser_render_onboarding() })
  browser_on_llm_cancel(fn() {  })
  browser_on_compile_artifact(fn() { run_compile_probe() })
  browser_on_repair_artifact(fn() { run_repair_from_compile_summary() })
  browser_on_download_runtime_artifact("wasm", fn() {
    browser_download_runtime_artifact("wasm")
  })
  browser_on_download_runtime_artifact("source", fn() {
    browser_download_runtime_artifact("source")
  })
  browser_on_download_runtime_artifact("compile-report", fn() {
    browser_download_runtime_artifact("compile-report")
  })
  browser_on_download_runtime_artifact("result", fn() {
    browser_download_runtime_artifact("result")
  })
  browser_on_start_new_app(fn() {
    browser_start_new_app()
    browser_show_toast(
      "Started a new APP. Enter the next prompt in the message box.",
    )
  })
  browser_on_runtime_report_action("open", fn() {
    browser_open_runtime_report()
  })
  browser_on_runtime_report_action("save", fn() {
    browser_save_runtime_report()
  })
  browser_on_record_demo_runtime_result(fn() {
    browser_record_demo_runtime_result(
      fn(result) { on_runtime_result_ready(result) },
      fn(error) { show_error("demo-runtime failed", error) },
    )
  })
  browser_export_last_artifact_bundle(fn(folder) {
    browser_render_artifact_card(
      "Source bundle exported",
      "MoonAP exported a browser-downloadable source bundle for " +
      folder +
      ". This bundle is for the next implementation step; it is not yet a runnable Personal SKILL.",
      "[\"exported\",\"source bundle\"]",
      true,
      false,
      false,
    )
  })
  browser_on_save_personal_skill(fn() { browser_open_skill_export_dialog() })
  browser_on_skill_export_choose_path(fn() {
    browser_choose_skill_export_path(fn(_folder_name) { () }, fn(error) {
      show_error("skill-export path selection failed", error)
    })
  })
  browser_on_personal_skill_choose_path(fn() {
    browser_choose_skill_export_path(
      fn(_folder_name) {
        browser_refresh_personal_skill_root_label()
        ignore(browser_render_personal_skills())
      },
      fn(error) {
        show_error("personal skill directory selection failed", error)
      },
    )
  })
  browser_on_local_skill_hub_choose_path(fn() {
    browser_choose_local_skill_hub_path(
      fn(_folder_name) {
        browser_refresh_local_skill_hub_root_label()
        ignore(browser_render_local_skill_hub())
        browser_show_toast("Local SKILL Hub directory connected.")
      },
      fn(error) {
        show_error("local SKILL Hub directory selection failed", error)
      },
    )
  })
  browser_on_click("#cloudSkillHubRefresh", fn() {
    ignore(browser_render_cloud_skill_hub(true))
    browser_show_toast(
      "Refreshing Cloud SKILL catalog from the official MoonAP-SKILL-Hub repository.",
    )
  })
  browser_ensure_virtual_path_runtime()
  browser_ensure_file_name_runtime()
  browser_ensure_large_file_progress_runtime()
  browser_ensure_skill_folder_runtime()
  browser_ensure_skill_zip_runtime()
  browser_ensure_runtime_profile_runtime()
  browser_on_skill_export_confirm(fn() {
    browser_request_skill_save(
      fn(result) {
        browser_close_skill_export_dialog()
        ignore(browser_render_personal_skills())
        browser_set_skill_panel_open(true)
        browser_show_toast(
          "SKILL saved. You can rerun this program, or save another copy with a different name or location.",
        )
        on_skill_save_decision(result)
      },
      fn(error) { show_error("save-to-skill failed", error) },
    )
  })
  browser_on_runtime_profile_apply(
    fn(raw) {
      browser_update_process(
        "Runtime profile", "runtime-profile-override", "applied", "MoonAP switched the current runtime profile and re-rendered the runtime form.",
        raw,
      )
      browser_show_toast(
        "Runtime profile switched for this run. If you save this APP as a SKILL, MoonAP will reuse this profile.",
      )
      browser_render_artifact_card(
        "Runtime execution is ready", "MoonAP has a compiled wasm artifact and is now waiting for browser-local execution or a simulated runtime result.",
        "[\"runtime ready\",\"browser display pending\",\"download allowed\"]", false,
        false, false,
      )
    },
    fn(error) { browser_show_toast("Runtime profile switch failed: " + error) },
  )
  browser_on_skill_export_cancel(fn() { browser_close_skill_export_dialog() })
  browser_watch_runtime_protocol(
    fn(raw) { on_runtime_request_ready(raw) },
    fn(raw) { on_runtime_result_ready(raw) },
    fn(raw) { on_skill_save_decision(raw) },
  )
  ignore(browser_render_personal_skills())
  ignore(browser_render_local_skill_hub())
  ignore(browser_render_cloud_skill_hub(false))
  browser_restore_formal_verification()
  refresh_policies()
}

///|
#cfg(not(target="js"))
fn main {
  println("MoonAP web app is a MoonBit JS-target frontend.")
  println("Build it with: moon build cmd/web_app --target js")
  println("Then copy the generated JS artifact to web/app.js.")
}
