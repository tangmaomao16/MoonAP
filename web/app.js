class $PanicError extends Error {}
function $panic() {
  throw new $PanicError();
}
function _M0TPB13StringBuilder(param0) {
  this.val = param0;
}
function $compare_int(a, b) {
  return (a >= b) - (a <= b);
}
function _M0TPC16string10StringView(param0, param1, param2) {
  this.str = param0;
  this.start = param1;
  this.end = param2;
}
const _M0FPB19int__to__string__js = (x, radix) => {
  return x.toString(radix);
};
function $bound_check(arr, index) {
  if (index < 0 || index >= arr.length) throw new Error("Index out of bounds");
}
function _M0TPB8MutLocalGiE(param0) {
  this.val = param0;
}
function $make_array_len_and_init(a, b) {
  const arr = new Array(a);
  arr.fill(b);
  return arr;
}
function _M0TPB9ArrayViewGsE(param0, param1, param2) {
  this.buf = param0;
  this.start = param1;
  this.end = param2;
}
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__append__message = (role, text) => {
   const messages = document.querySelector("#messages");
   const item = document.createElement("article");
   item.className = `message ${role}`;
   item.textContent = String(text);
   messages?.append(item);
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state = (text) => {
   const state = document.querySelector("#state");
   if (state) state.textContent = String(text);
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__append__runtime__log = (kind, label, text) => {
   const payload = JSON.stringify({
     ts: new Date().toISOString(),
     kind: String(kind || "event"),
     label: String(label || ""),
     text: String(text || "")
   }) + "\n";
   fetch("/api/logs/moonap-runtime.log", {
     method: "POST",
     headers: { "Content-Type": "text/plain; charset=utf-8" },
     body: payload,
     keepalive: true
   }).catch(() => {});
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__extract__moonbit__source = (raw) => {
   if (!globalThis.__moonapExtractMoonBitSource) {
     globalThis.__moonapExtractMoonBitSource = (value) => {
       const text = String(value || "").trim();
       if (!text) return "";
       const extract = (source, startMarker, endMarker) => {
         const start = source.indexOf(startMarker);
         if (start < 0) return "";
         const after = source.slice(start + startMarker.length).trim();
         if (!after) return "";
         const end = after.indexOf(endMarker);
         if (end < 0) return "";
         return after.slice(0, end).trim();
       };
       const patterns = [
         ["FILE: cmd/main/main.mbt", "END_FILE"],
         ['<moonbit-file path="cmd/main/main.mbt">', "</moonbit-file>"],
         ["```moonbit", "```"],
         ["```mbt", "```"],
         ["```", "```"]
       ];
       for (const [startMarker, endMarker] of patterns) {
         const extracted = extract(text, startMarker, endMarker);
         if (extracted) return extracted;
       }
       return text;
     };
   }
   return globalThis.__moonapExtractMoonBitSource(raw);
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card = (title, summary, metaJson, allowCompile, allowRepair, allowSave) => {
   const root = document.querySelector("#artifactActions");
   if (!root) return;
   globalThis.__moonapLastArtifactCardArgs = {
     title: String(title || ""),
     summary: String(summary || ""),
     meta_json: String(metaJson || "[]"),
     allow_compile: Boolean(allowCompile),
     allow_repair: Boolean(allowRepair),
     allow_save: Boolean(allowSave)
   };
   const runtimeRequest = globalThis.__moonapLastRuntimeRequest || {};
   const runtimeResult = globalThis.__moonapLastRuntimeResult || {};
   const profileRuntime = globalThis.__moonapRuntimeProfileRuntime && typeof globalThis.__moonapRuntimeProfileRuntime === "object"
     ? globalThis.__moonapRuntimeProfileRuntime
     : null;
   const showTransient = globalThis.__moonapAllowTransientArtifactCard === true;
   if (globalThis.__moonapMinimalShell !== false && !showTransient) {
     root.innerHTML = "";
     root.style.display = "none";
     return;
   }
   let meta = [];
   try {
     const parsed = JSON.parse(String(metaJson || "[]"));
     meta = Array.isArray(parsed) ? parsed : [];
   } catch {
     meta = [];
   }
   root.innerHTML = "";
   root.style.display = "";
   const card = document.createElement("section");
   card.className = "action-card is-open";
   const metaHtml = meta.map((item) => `<span>${String(item)}</span>`).join("");
   let runtimeResultMode = "";
   const escapeHtml = (value) => String(value ?? "")
     .replace(/&/g, "&amp;")
     .replace(/</g, "&lt;")
     .replace(/>/g, "&gt;")
     .replace(/"/g, "&quot;")
     .replace(/'/g, "&#39;");
   const wasmUrl = String(runtimeRequest?.wasm_url || "");
   const sourceUrl = String(runtimeRequest?.source_url || "");
   const compileReportUrl = String(runtimeRequest?.compile_report_url || "");
   const resultUrl = String(runtimeResult?.download_url || "");
   const requestId = String(runtimeRequest?.request_id || "");
   const runtimeReady = String(runtimeRequest?.status || "") === "ready-for-runtime";
   const resultRequestId = String(runtimeResult?.request_id || "");
   const runtimeDone = String(runtimeResult?.status || "").includes("succeeded") &&
     (requestId === "" || resultRequestId === "" || resultRequestId === requestId || resultRequestId.startsWith("skill-runtime-"));
   const runtimeCard = runtimeReady || runtimeDone;
   if (runtimeCard) {
     card.className += runtimeDone ? " action-card-runtime is-complete" : " action-card-runtime is-awaiting";
     const runtimeSpec = runtimeRequest?.runtime_spec && typeof runtimeRequest.runtime_spec === "object"
       ? runtimeRequest.runtime_spec
       : (runtimeRequest?.runtime_ui && typeof runtimeRequest.runtime_ui === "object" ? runtimeRequest.runtime_ui : {});
     const runtimeFields = Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : [];
     const taskKind = String(runtimeRequest?.task_kind || "");
     const runtimeMode = String(runtimeSpec?.mode || runtimeRequest?.runtime_mode || "");
     const resultMode = String(runtimeSpec?.result_mode || runtimeRequest?.result_mode || runtimeResult?.result_mode || "");
     runtimeResultMode = resultMode;
     const currentProfileId = profileRuntime && typeof profileRuntime.profileIdForRequest === "function"
       ? String(profileRuntime.profileIdForRequest(runtimeRequest) || "")
       : String(runtimeRequest?.runtime_profile_override_id || runtimeRequest?.runtime_profile_id || taskKind || "");
     const currentProfile = profileRuntime && typeof profileRuntime.lookup === "function"
       ? profileRuntime.lookup(currentProfileId)
       : null;
     const inferredTaskKind = String(runtimeRequest?.inferred_task_kind || taskKind || "");
     const isFastqRuntime = taskKind === "fastq-generator";
     const eyebrow = runtimeDone ? "Runtime result" : "Runtime ready";
     const statusHtml = runtimeDone
       ? '<span>result recorded</span><span>ready to rerun</span><span>ready to save</span>'
       : '<span>wasm prepared</span><span>awaiting local execution</span>';
     const runtimeProfileHtml = profileRuntime && typeof profileRuntime.list === "function"
       ? (() => {
           const options = profileRuntime.list();
           const optionHtml = options.map((profile) => {
             const id = String(profile?.id || "");
             const label = String(profile?.label || id);
             const selected = id === currentProfileId ? ' selected' : '';
             return `<option value="${id}"${selected}>${label}</option>`;
           }).join("");
           const currentLabel = String(currentProfile?.label || currentProfileId || "Unspecified");
           const currentDescription = String(currentProfile?.description || "Choose the runtime profile whose parameter schema best matches your APP.");
           const inferenceNote = inferredTaskKind && inferredTaskKind !== taskKind
             ? `MoonAP originally inferred ${inferredTaskKind}, then this run was switched to ${taskKind}.`
             : `MoonAP currently inferred ${taskKind || "generic-task"}.`;
           return `
             <div class="action-card-runtime-profile">
               <div class="action-card-runtime-profile-head">
                 <strong>Runtime profile</strong>
                 <small>${currentLabel}</small>
               </div>
               <small>${currentDescription}</small>
               <small>${inferenceNote}</small>
               <div class="action-card-runtime-profile-controls">
                 <label><span>Switch runtime profile</span><select id="runtimeProfileSelect">${optionHtml}</select></label>
                 <button id="applyRuntimeProfile" class="secondary" type="button">Apply profile</button>
               </div>
             </div>`;
         })()
       : "";
     const paramsHtml = runtimeFields.length
       ? `<div class="action-card-params">${runtimeFields.map((field) => {
           const name = String(field?.name || "");
           const label = String(field?.label || name || "Parameter");
           const help = String(field?.help || field?.description || "");
           const type = String(field?.type || "text").toLowerCase();
           const isBool = type === "bool" || type === "boolean" || type === "checkbox";
           const inputType = isBool ? "checkbox" : (type === "int" || type === "float" ? "number" : "text");
           const defaultValue = field?.default ?? "";
           const checked = isBool && !["false", "0", "no", "off", ""].includes(String(defaultValue).trim().toLowerCase()) ? "checked" : "";
           const attrs = [
             `id="runtime-field-${name}"`,
             `data-runtime-field="${name}"`,
             `type="${inputType}"`,
             field?.min !== undefined ? `min="${String(field.min)}"` : "",
             field?.max !== undefined ? `max="${String(field.max)}"` : "",
             field?.step !== undefined ? `step="${String(field.step)}"` : "",
             isBool ? `value="true"` : `value="${String(defaultValue)}"`,
             checked
           ].filter(Boolean).join(" ");
           const helpHtml = help ? `<small class="param-help">${help}</small>` : "";
           return isBool
             ? `<label class="checkbox-param"><input ${attrs} /><span>${label}</span>${helpHtml}</label>`
             : `<label><span>${label}</span><input ${attrs} />${helpHtml}</label>`;
         }).join("")}</div>`
       : "";
     const isFastqAnalysisRuntime = taskKind === "large-fastq-analysis" || String(runtimeSpec?.domain_profile || "").toLowerCase() === "fastq";
     const filePickerHtml = isFastqAnalysisRuntime || runtimeMode === "file"
       ? `<div class="action-card-file-target">
           <label class="dialog-button secondary" for="fileInput">${isFastqAnalysisRuntime ? "Choose input FastQ file" : "Choose input file"}</label>
           <span id="runtimeInputFileStatus">${document.querySelector("#fileInput")?.files?.[0]?.name ? `Selected: ${document.querySelector("#fileInput")?.files?.[0]?.name}` : "No input file selected yet."}</span>
           <small>${isFastqAnalysisRuntime ? "File contents stay in this browser. MoonAP reads it in chunks and sends only summary metrics to the server." : "File contents stay in this browser."}</small>
         </div>`
       : "";
     const isStreamedOutputRuntime = String(runtimeSpec?.io_contract?.host_capability || "") === "streamed-local-generation" || taskKind === "large-file-generation";
     const outputSelection = globalThis.__moonapRuntimeOutputFile && String(globalThis.__moonapRuntimeOutputFile.request_id || "") === requestId
       ? globalThis.__moonapRuntimeOutputFile
       : null;
     const outputPickerHtml = isStreamedOutputRuntime
       ? `<div class="action-card-file-target">
           <button id="chooseRuntimeOutputFile" class="secondary strong" type="button">Choose output file</button>
           <span id="runtimeOutputFileStatus">${outputSelection?.name ? `Selected: ${String(outputSelection.name)}` : "No output file selected yet."}</span>
           <small>Choose where MoonAP should stream the generated file before running. No OS path string is stored.</small>
         </div>`
       : "";
     const runLabel = runtimeDone
       ? String(runtimeSpec?.rerun_action_label || runtimeSpec?.action_label || runtimeSpec?.primary_action_label || (runtimeMode === "interactive" ? "Run again" : "Run generator again"))
       : String(runtimeSpec?.action_label || runtimeSpec?.primary_action_label || (runtimeMode === "interactive" ? "Run game" : "Run runtime step"));
     const lastSaveDecision = globalThis.__moonapLastSkillSaveDecision && typeof globalThis.__moonapLastSkillSaveDecision === "object"
       ? globalThis.__moonapLastSkillSaveDecision
       : {};
     const saveCompleted = runtimeDone && String(lastSaveDecision?.decision || "") === "accepted-save-skill";
     const saveLabel = "Save APP into SKILL";
     const primaryAction = [
       `<button id="recordDemoRuntimeResult" class="primary" type="button">${runLabel}</button>`,
       runtimeDone && allowSave ? `<button id="savePersonalSkill" class="secondary strong" type="button">${saveLabel}</button>` : ''
     ].filter(Boolean).join("");
     const resultPreviewText = runtimeDone
       ? String(runtimeResult?.display_text || runtimeResult?.download_content || runtimeResult?.summary || "")
         .replace(/\\r\\n/g, "\n")
         .replace(/\\n/g, "\n")
         .replace(/\\t/g, "\t")
       : "";
     const resultPreviewHtml = resultPreviewText.trim()
       ? `<div class="action-card-result-preview"><strong>Result</strong><pre>${escapeHtml(resultPreviewText)}</pre></div>`
       : "";
     const secondaryActions = [
       '<button id="startNewApp" class="secondary strong" type="button">Start new APP</button>',
       wasmUrl ? '<button id="downloadRuntimeWasm" class="secondary" type="button">Download wasm</button>' : '',
       sourceUrl ? '<button id="downloadRuntimeSource" class="secondary" type="button">Download source</button>' : '',
       runtimeDone && resultMode === "report" ? '<button id="openRuntimeReport" class="secondary strong" type="button">Open report</button>' : '',
       runtimeDone && resultMode === "report" ? '<button id="saveRuntimeReport" class="secondary" type="button">Save report</button>' : '',
       resultUrl ? `<button id="downloadRuntimeResult" class="secondary" type="button">${resultMode === "report" ? "Download raw JSON" : "Download result"}</button>` : ''
     ].filter(Boolean).join("");
     card.innerHTML = `
       <div class="action-card-eyebrow">${eyebrow}</div>
       <strong>${String(title)}</strong>
       <small>${String(summary)}</small>
       <div class="action-card-status">${statusHtml}</div>
       ${runtimeProfileHtml}
       ${filePickerHtml}
       ${outputPickerHtml}
       ${paramsHtml}
       ${resultPreviewHtml}
       <div class="action-card-primary">${primaryAction}</div>
       ${secondaryActions ? `<div class="action-card-secondary">${secondaryActions}</div>` : ''}`;
   } else {
     card.innerHTML = `
       <strong>${String(title)}</strong>
       <small>${String(summary)}</small>
       ${metaHtml ? `<div class="action-card-meta">${metaHtml}</div>` : ''}
       <div class="action-card-actions">
         ${allowCompile ? '<button id="compileArtifact" type="button">Run Compile Probe</button>' : ''}
         ${allowRepair ? '<button id="repairArtifact" type="button">Repair with Error Summary</button>' : ''}
         ${allowSave ? '<button id="savePersonalSkill" type="button">Save APP into SKILL</button>' : ''}
         ${runtimeReady && !runtimeDone ? '<button id="recordDemoRuntimeResult" type="button">Record Demo Result</button>' : ''}
         ${wasmUrl ? '<button id="downloadRuntimeWasm" class="secondary" type="button">Download wasm</button>' : ''}
         ${sourceUrl ? '<button id="downloadRuntimeSource" class="secondary" type="button">Download source</button>' : ''}
         ${compileReportUrl ? '<button id="downloadCompileReport" class="secondary" type="button">Download compile report</button>' : ''}
         ${resultUrl ? '<button id="downloadRuntimeResult" class="secondary" type="button">Download raw JSON</button>' : ''}
         <button id="exportSkillBundle" class="secondary" type="button">Export Source Bundle</button>
       </div>`;
   }
   root.append(card);
   if (runtimeDone && runtimeResultMode === "report") {
     try {
       card.scrollIntoView({ behavior: "smooth", block: "start" });
     } catch {}
   }
   const runtimeFileInput = document.querySelector("#fileInput");
   const runtimeFileStatus = document.querySelector("#runtimeInputFileStatus");
   if (runtimeFileInput && runtimeFileStatus) {
     const syncRuntimeFileStatus = () => {
       const file = runtimeFileInput.files?.[0];
       runtimeFileStatus.textContent = file ? `Selected: ${file.name}` : "No input file selected yet.";
     };
     runtimeFileInput.onchange = syncRuntimeFileStatus;
     syncRuntimeFileStatus();
   }
   const runtimeOutputButton = document.querySelector("#chooseRuntimeOutputFile");
   const runtimeOutputStatus = document.querySelector("#runtimeOutputFileStatus");
   if (runtimeOutputButton && runtimeOutputStatus) {
     runtimeOutputButton.onclick = async () => {
       try {
         if (typeof window.showSaveFilePicker !== "function") {
           throw new Error("This browser does not support selecting a streamed output file yet.");
         }
         const fileNameRuntime = globalThis.__moonapFileNameRuntime;
         const outputInput = document.querySelector("#runtime-field-output_name");
         const outputNameRaw = String(outputInput?.value || "moonap-output.fastq").trim() || "moonap-output.fastq";
         const outputName = fileNameRuntime?.sanitize(outputNameRaw, "moonap-output.fastq") || "moonap-output.fastq";
         const handle = await window.showSaveFilePicker({
           suggestedName: outputName,
           types: [{ description: "FastQ files", accept: { "text/plain": [".fastq", ".fq", ".txt"] } }]
         });
         globalThis.__moonapRuntimeOutputFile = {
           request_id: requestId,
           handle,
           name: String(handle?.name || outputName)
         };
         if (outputInput) outputInput.value = String(handle?.name || outputName);
         runtimeOutputStatus.textContent = `Selected: ${String(handle?.name || outputName)}`;
       } catch (error) {
         runtimeOutputStatus.textContent = `Output file not selected: ${error instanceof Error ? error.message : String(error)}`;
       }
     };
   }
   if (runtimeCard) {
     try { root.scrollIntoView({ behavior: "smooth", block: "end" }); } catch {}
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__on__runtime__profile__apply = (onDone, onError) => {
   if (document.__moonapRuntimeProfileApplyBound) return;
   document.__moonapRuntimeProfileApplyBound = true;
   document.addEventListener("click", (event) => {
     const target = event.target;
     if (!target || target.id !== "applyRuntimeProfile") return;
     event.preventDefault();
     try {
       const runtimeRequest = globalThis.__moonapLastRuntimeRequest;
       if (!runtimeRequest || typeof runtimeRequest !== "object") {
         throw new Error("No runtime request is available yet.");
       }
       const runtime = globalThis.__moonapRuntimeProfileRuntime;
       if (!runtime || typeof runtime.applyProfile !== "function") {
         throw new Error("MoonAP runtime profile runtime is not ready yet.");
       }
       const selectedId = String(document.querySelector("#runtimeProfileSelect")?.value || "").trim();
       if (!selectedId) throw new Error("Choose a runtime profile first.");
       const nextRequest = runtime.applyProfile(runtimeRequest, selectedId);
       globalThis.__moonapLastRuntimeRequest = nextRequest;
       const selectedProfile = typeof runtime.lookup === "function" ? runtime.lookup(selectedId) : null;
       onDone(JSON.stringify({
         ok: true,
         profile_id: selectedId,
         label: String(selectedProfile?.label || selectedId),
         task_kind: String(nextRequest.task_kind || ""),
         runtime_mode: String(nextRequest.runtime_mode || ""),
         result_mode: String(nextRequest.result_mode || "")
       }, null, 2));
     } catch (error) {
       onError(error instanceof Error ? error.message : String(error));
     }
   });
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast = (message) => {
   const text = String(message || "").trim();
   if (!text) return;
   let toast = document.querySelector("#moonapToast");
   if (!toast) {
     toast = document.createElement("div");
     toast.id = "moonapToast";
     toast.className = "moonap-toast";
     document.body.append(toast);
   }
   toast.textContent = text;
   toast.classList.add("is-open");
   if (toast.__moonapTimer) clearTimeout(toast.__moonapTimer);
   toast.__moonapTimer = setTimeout(() => {
     toast.classList.remove("is-open");
   }, 5200);
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app47browser__ensure__large__file__progress__runtime = () => {
   if (globalThis.__moonapLargeFileProgressRuntime) return;
   if (!document.querySelector("#moonapLargeFileProgressStyle")) {
     const style = document.createElement("style");
     style.id = "moonapLargeFileProgressStyle";
     style.textContent = `
       .large-file-progress { position: fixed; right: 28px; bottom: 28px; width: min(420px, calc(100vw - 56px)); display: grid; gap: 10px; padding: 14px 16px; border: 1px solid #cde4da; border-radius: 16px; background: rgba(247,251,249,0.98); color: #173f31; box-shadow: 0 22px 60px rgba(24,48,37,0.20); opacity: 0; transform: translateY(12px); pointer-events: none; transition: opacity 140ms ease, transform 140ms ease; z-index: 1300; }
       .large-file-progress.is-open { opacity: 1; transform: translateY(0); }
       .large-file-progress.is-error { border-color: #f0c7c7; background: rgba(255,247,247,0.98); color: #7a1f1f; }
       .large-file-progress-head { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; }
       .large-file-progress-head strong { font-size: 15px; }
       .large-file-progress-head span { font-variant-numeric: tabular-nums; font-weight: 700; }
       .large-file-progress-track { height: 8px; border-radius: 999px; overflow: hidden; background: #e6eee9; }
       .large-file-progress-track div { width: 0%; height: 100%; border-radius: inherit; background: #1f7a5b; transition: width 120ms ease; }
       .large-file-progress.is-error .large-file-progress-track div { background: #b94a48; }
       .large-file-progress-detail { font-size: 13px; line-height: 1.45; overflow-wrap: anywhere; }
     `;
     document.head.append(style);
   }
   const formatBytes = (value) => {
     const n = Number(value || 0);
     if (n >= 1073741824) return `${(n / 1073741824).toFixed(2)} GB`;
     if (n >= 1048576) return `${(n / 1048576).toFixed(2)} MB`;
     if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
     return `${Math.max(0, Math.floor(n))} B`;
   };
   const ensure = () => {
     let card = document.querySelector("#moonapLargeFileProgress");
     if (card) return card;
     card = document.createElement("section");
     card.id = "moonapLargeFileProgress";
     card.className = "large-file-progress";
     card.setAttribute("aria-live", "polite");
     card.innerHTML = `
       <div class="large-file-progress-head">
         <strong id="largeFileProgressTitle">Large file operation</strong>
         <span id="largeFileProgressPct">0%</span>
       </div>
       <div class="large-file-progress-track"><div id="largeFileProgressFill"></div></div>
       <div id="largeFileProgressDetail" class="large-file-progress-detail">Preparing...</div>
     `;
     document.body.append(card);
     return card;
   };
   const update = (data) => {
     const payload = data && typeof data === "object" ? data : {};
     const card = ensure();
     const progress = Math.max(0, Math.min(100, Number(payload.progress_percent ?? 0)));
     const isGeneration = String(payload.result_kind || "") === "streamed-file" || String(payload.status || "").includes("write");
     const title = payload.title || (isGeneration ? "Writing large file locally" : "Reading large file locally");
     const processed = Number(payload.bytes_processed ?? payload.bytes_written ?? payload.file_size_bytes ?? 0);
     const target = Number(payload.target_bytes ?? payload.file_size_bytes ?? 0);
     const chunks = Number(payload.chunk_count || 0);
     const reads = Number(payload.reads_seen ?? payload.line_count ?? 0);
     const details = [
       payload.file_name ? `File: ${String(payload.file_name)}` : "",
       target > 0 ? `${formatBytes(processed)} / ${formatBytes(target)}` : formatBytes(processed),
       chunks > 0 ? `${chunks} chunk(s)` : "",
       reads > 0 ? `${reads} record/line(s)` : "",
       payload.llm_receives_file_contents === false ? "File contents stay in this browser." : ""
     ].filter(Boolean).join(" | ");
     card.querySelector("#largeFileProgressTitle").textContent = String(title);
     card.querySelector("#largeFileProgressPct").textContent = `${Math.floor(progress)}%`;
     card.querySelector("#largeFileProgressFill").style.width = `${progress}%`;
     card.querySelector("#largeFileProgressDetail").textContent = details || String(payload.status || "Working...");
     card.classList.add("is-open");
     card.classList.toggle("is-complete", progress >= 100 || String(payload.status || "") === "runtime-succeeded");
     if (card.__moonapTimer) clearTimeout(card.__moonapTimer);
     if (progress >= 100 || String(payload.status || "") === "runtime-succeeded") {
       card.__moonapTimer = setTimeout(() => card.classList.remove("is-open", "is-complete"), 7000);
     }
   };
   const error = (message) => {
     const card = ensure();
     card.querySelector("#largeFileProgressTitle").textContent = "Large file operation failed";
     card.querySelector("#largeFileProgressPct").textContent = "failed";
     card.querySelector("#largeFileProgressFill").style.width = "100%";
     card.querySelector("#largeFileProgressDetail").textContent = String(message || "Unknown error");
     card.classList.add("is-open", "is-error");
   };
   globalThis.__moonapLargeFileProgressRuntime = { update, error };
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app42browser__ensure__runtime__profile__runtime = () => {
   if (globalThis.__moonapRuntimeProfileRuntime) return;
   const clone = (value) => {
     try { return JSON.parse(JSON.stringify(value ?? null)); } catch { return value ?? null; }
   };
   const registry = {
     "large-file-generation": {
       id: "large-file-generation",
       label: "Large-file generation",
       description: "Browser-local streamed FastQ output with save picker, target size, read length, header prefix, seed, N rate, and quality controls.",
       task_kind: "large-file-generation",
       runtime_mode: "form",
       result_mode: "download",
       runtime_spec: {
         mode: "form",
         title: "Generate large browser-local file",
         primary_action_label: "Generate with streaming writer",
         rerun_action_label: "Generate with streaming writer again",
         io_contract: {
           protocol: "moonap.large-file.v1",
           browser_local_only: true,
           llm_receives_file_contents: false,
           host_capability: "streamed-local-generation",
           input_mode: "none",
           output_mode: "browser-local-save-stream",
           chunk_size_bytes: 4194304,
           save_picker_required: true
         },
         fields: [
           { name: "output_name", label: "Output FastQ file name", type: "text", default: "moonap-output.fastq" },
           { name: "target_size_mb", label: "Target size in MB", type: "int", default: 128, min: 1, max: 1024, step: 1 },
           { name: "read_length", label: "Read length", type: "int", default: 150, min: 20, max: 20000, step: 1 },
           { name: "read_header_prefix", label: "Read header prefix", type: "text", default: "moonap_read" },
           { name: "random_seed", label: "Random seed", type: "int", default: 42, min: 0, max: 2147483647, step: 1 },
           { name: "n_rate", label: "N base rate", type: "float", default: 0.01, min: 0, max: 1, step: 0.001 },
           { name: "quality_char", label: "Quality character", type: "text", default: "I" }
         ]
       }
     },
     "large-fastq-analysis": {
       id: "large-fastq-analysis",
       label: "Large FastQ analysis",
       description: "Browser-local chunked FastQ analysis with read, base, structure, and preview metrics.",
       task_kind: "large-fastq-analysis",
       runtime_mode: "file",
       result_mode: "report",
       runtime_spec: {
         mode: "file",
         title: "Analyze large FastQ file",
         action_label: "Run FastQ analysis",
         rerun_action_label: "Run FastQ analysis again",
         domain_profile: "fastq",
         io_contract: {
           protocol: "moonap.large-file.v1",
           browser_local_only: true,
           llm_receives_file_contents: false,
           host_capability: "chunked-local-analysis",
           input_mode: "streaming-text",
           output_mode: "report",
           chunk_size_bytes: 4194304,
           carry_strategy: "fastq-record-boundary",
           supported_extensions: ["fastq", "fq", "txt"]
         },
         fields: [
           { name: "max_preview_reads", label: "Preview reads", type: "int", default: 3, min: 0, max: 20, step: 1, help: "Only controls how many reads appear in the report preview. It does not limit full-file analysis." },
           { name: "validate_fastq_structure", label: "Validate FastQ structure", type: "bool", default: true, help: "Check @ header, + separator, and sequence/quality length for each four-line FastQ record." },
           { name: "count_bases", label: "Count A/C/G/T/N bases", type: "bool", default: true, help: "Count base composition while streaming. Turn off only if you want a lighter structural scan." }
         ]
       }
     },
     "large-file-analysis": {
       id: "large-file-analysis",
       label: "Large-file analysis",
       description: "Browser-local chunked input analysis with search text and preview controls.",
       task_kind: "large-file-analysis",
       runtime_mode: "file",
       result_mode: "report",
       runtime_spec: {
         mode: "file",
         title: "Analyze large browser-local file",
         action_label: "Run streaming analysis",
         rerun_action_label: "Run streaming analysis again",
         io_contract: {
           protocol: "moonap.large-file.v1",
           browser_local_only: true,
           llm_receives_file_contents: false,
           host_capability: "chunked-local-analysis",
           input_mode: "streaming-text",
           output_mode: "report",
           chunk_size_bytes: 4194304,
           carry_strategy: "line-boundary",
           supported_extensions: ["fastq", "fq", "csv", "tsv", "txt", "log", "jsonl"]
         },
         fields: [
           { name: "search_text", label: "Search text (optional)", type: "text", default: "" },
           { name: "max_preview_lines", label: "Preview lines", type: "int", default: 3, min: 0, max: 20, step: 1 }
         ]
       }
     },
     "fastq-generator": {
       id: "fastq-generator",
       label: "FastQ generator",
       description: "Parameter-driven FastQ generation with read count, read length, N rate, and seed.",
       task_kind: "fastq-generator",
       runtime_mode: "form",
       result_mode: "download",
       runtime_spec: {
         mode: "form",
         title: "Generate FastQ file",
         primary_action_label: "Run generator",
         rerun_action_label: "Run generator again",
         fields: [
           { name: "read_count", label: "Read count", type: "int", default: 10000, min: 1, max: 2000000, step: 1 },
           { name: "read_length", label: "Read length", type: "int", default: 150, min: 20, max: 20000, step: 1 },
           { name: "n_rate", label: "N rate", type: "float", default: 0.01, min: 0, max: 1, step: 0.001 },
           { name: "random_seed", label: "Random seed", type: "int", default: 42, min: 0, max: 2147483647, step: 1 }
         ]
       }
     },
     "fastq-analysis": {
       id: "fastq-analysis",
       label: "FastQ analysis",
       description: "File-input FastQ analysis profile.",
       task_kind: "fastq-analysis",
       runtime_mode: "file",
       result_mode: "report",
       runtime_spec: {
         mode: "file",
         title: "Analyze FastQ file",
         action_label: "Run analysis",
         rerun_action_label: "Run analysis again",
         fields: []
       }
     },
     "generic-form": {
       id: "generic-form",
       label: "Generic form app",
       description: "Fallback profile for browser-local apps that mainly need a simple parameter form.",
       task_kind: "generic-task",
       runtime_mode: "form",
       result_mode: "text",
       runtime_spec: {
         mode: "form",
         title: "Run browser-local app",
         primary_action_label: "Run app",
         rerun_action_label: "Run app again",
         fields: []
       }
     },
     "generic-file": {
       id: "generic-file",
       label: "Generic file analysis",
       description: "Fallback profile for apps that should start from a browser file picker.",
       task_kind: "generic-task",
       runtime_mode: "file",
       result_mode: "report",
       runtime_spec: {
         mode: "file",
         title: "Analyze local file",
         action_label: "Run file analysis",
         rerun_action_label: "Run file analysis again",
         fields: []
       }
     }
   };
   const orderedIds = ["large-file-generation", "large-fastq-analysis", "large-file-analysis", "fastq-generator", "fastq-analysis", "generic-form", "generic-file"];
   const normalizeProfileId = (value) => registry[String(value || "").trim()] ? String(value || "").trim() : "";
   const runtimeSpecOf = (request) => request?.runtime_spec && typeof request.runtime_spec === "object"
     ? request.runtime_spec
     : (request?.runtime_ui && typeof request.runtime_ui === "object" ? request.runtime_ui : {});
   const profileIdForRequest = (request) => {
     const explicit = normalizeProfileId(request?.runtime_profile_override_id || request?.runtime_profile_id || request?.task_kind);
     if (explicit) return explicit;
     const runtimeSpec = runtimeSpecOf(request);
     if (String(runtimeSpec?.domain_profile || "").toLowerCase() === "fastq") return "large-fastq-analysis";
     const hostCapability = String(runtimeSpec?.io_contract?.host_capability || "");
     if (hostCapability === "streamed-local-generation") return "large-file-generation";
     if (hostCapability === "chunked-local-analysis") return "large-file-analysis";
     const mode = String(request?.runtime_mode || runtimeSpec?.mode || "");
     return mode === "file" ? "generic-file" : "generic-form";
   };
   const applyProfile = (request, selectedId) => {
     const id = normalizeProfileId(selectedId);
     const profile = registry[id];
     if (!profile) throw new Error(`Unknown runtime profile: ${String(selectedId || "")}`);
     const base = request && typeof request === "object" ? request : {};
     const inferredTaskKind = String(base.inferred_task_kind || base.task_kind || "");
     const runtimeSpec = clone(profile.runtime_spec) || {};
     runtimeSpec.profile_id = id;
     runtimeSpec.profile_label = String(profile.label || id);
     runtimeSpec.selection_source = "user-selected";
     if (inferredTaskKind) runtimeSpec.inferred_task_kind = inferredTaskKind;
     return Object.assign({}, base, {
       inferred_task_kind: inferredTaskKind,
       task_kind: String(profile.task_kind || base.task_kind || "generic-task"),
       runtime_mode: String(profile.runtime_mode || runtimeSpec.mode || base.runtime_mode || "form"),
       result_mode: String(profile.result_mode || base.result_mode || "text"),
       runtime_profile_id: id,
       runtime_profile_override_id: id,
       runtime_profile_label: String(profile.label || id),
       runtime_spec: runtimeSpec,
       runtime_ui: clone(runtimeSpec) || runtimeSpec
     });
   };
   globalThis.__moonapRuntimeProfileRuntime = {
     list: () => orderedIds.map((id) => clone(registry[id])),
     lookup: (id) => clone(registry[normalizeProfileId(id)] || null),
     profileIdForRequest,
     applyProfile
   };
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__clear__artifact__card = () => {
   const root = document.querySelector("#artifactActions");
   if (root) {
     root.innerHTML = "";
     if (globalThis.__moonapMinimalShell !== false) root.style.display = "none";
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__start__new__app = () => {
   const runtimeRequest = globalThis.__moonapLastRuntimeRequest || {};
   const runtimeResult = globalThis.__moonapLastRuntimeResult || {};
   const requestId = String(runtimeResult.request_id || runtimeRequest.request_id || "");
   if (requestId) {
     localStorage.setItem("moonap.ignoreRuntimeRequestId", requestId);
   }
   globalThis.__moonapLastArtifact = null;
   globalThis.__moonapLastCompileReport = null;
   globalThis.__moonapLastRuntimeRequest = {};
   globalThis.__moonapLastRuntimeResult = {};
   globalThis.__moonapLastRuntimeReportPayload = null;
   globalThis.__moonapRuntimeOutputFile = null;
   globalThis.__moonapLastRuntimeRequestText = "";
   globalThis.__moonapLastRuntimeResultText = "";
   globalThis.__moonapLastArtifactCardArgs = null;
   globalThis.__moonapBenchmarkAssessment = "";
   globalThis.__moonapLastSkillSaveDecision = {};
   globalThis.__moonapLastSkillSaveDecisionText = "";
   globalThis.__moonapAllowTransientArtifactCard = false;
   const actions = document.querySelector("#artifactActions");
   if (actions) {
     actions.innerHTML = "";
     if (globalThis.__moonapMinimalShell !== false) actions.style.display = "none";
   }
   const messages = document.querySelector("#messages");
   if (messages) messages.innerHTML = "";
   const progress = document.querySelector("#largeFileProgressCard");
   if (progress) progress.classList.remove("is-open", "is-error");
   const state = document.querySelector("#state");
   if (state) state.textContent = "{\n  \"status\": \"new-app\"\n}";
   const processStage = document.querySelector("#processStage");
   const processResult = document.querySelector("#processResult");
   const processLog = document.querySelector("#processLog");
   if (processStage) processStage.textContent = "new-app";
   if (processResult) processResult.textContent = "ready";
   if (processLog) processLog.textContent = "Start from a new user prompt.";
   const textarea = document.querySelector("#message");
   if (textarea) {
     textarea.value = "";
     textarea.classList.remove("suggested");
     textarea.focus();
   }
   try { window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }); } catch {}
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app28browser__on__start__new__app = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "startNewApp") return;
   event.preventDefault();
   event.stopPropagation();
   try {
     handler();
   } catch (error) {
     alert(`MoonAP start-new failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__set__transient__artifact__card = (open) => {
   globalThis.__moonapAllowTransientArtifactCard = Boolean(open);
   const root = document.querySelector("#artifactActions");
   if (!root) return;
   if (!open && globalThis.__moonapMinimalShell !== false) {
     root.style.display = "none";
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app35browser__remember__runtime__request = (raw) => {
   const text = String(raw || "");
   globalThis.__moonapLastRuntimeRequestText = text;
   try {
     globalThis.__moonapLastRuntimeRequest = JSON.parse(text);
   } catch {
     globalThis.__moonapLastRuntimeRequest = {};
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__remember__runtime__result = (raw) => {
   const text = String(raw || "");
   globalThis.__moonapLastRuntimeResultText = text;
   try {
     globalThis.__moonapLastRuntimeResult = JSON.parse(text);
   } catch {
     globalThis.__moonapLastRuntimeResult = {};
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__download__runtime__artifact = (kind) => {
   const runtimeRequest = globalThis.__moonapLastRuntimeRequest || {};
   const runtimeResult = globalThis.__moonapLastRuntimeResult || {};
   const url = kind === "wasm"
     ? String(runtimeRequest?.wasm_url || "")
     : kind === "source"
       ? String(runtimeRequest?.source_url || "")
       : kind === "compile-report"
         ? String(runtimeRequest?.compile_report_url || "")
         : String(runtimeResult?.download_url || "");
   if (!url) {
     throw new Error(`No runtime artifact URL is available for ${String(kind)}.`);
   }
   const link = document.createElement("a");
   link.href = url;
   link.download = "";
   document.body.append(link);
   link.click();
   link.remove();
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__open__runtime__report = () => {
   const report = globalThis.__moonapReportRuntime?.buildHtml?.();
   if (!report) throw new Error("No browser report is available yet.");
   const blob = new Blob([report], { type: "text/html;charset=utf-8" });
   const url = URL.createObjectURL(blob);
   window.open(url, "_blank", "noopener,noreferrer");
   setTimeout(() => URL.revokeObjectURL(url), 60000);
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__save__runtime__report = async () => {
   const runtime = globalThis.__moonapReportRuntime;
   const report = runtime?.buildHtml?.();
   if (!report) throw new Error("No browser report is available yet.");
   const name = runtime?.reportFileName?.() || "moonap-report.html";
   if (typeof window.showSaveFilePicker === "function") {
     const handle = await window.showSaveFilePicker({
       suggestedName: name,
       types: [{ description: "HTML report", accept: { "text/html": [".html"] } }]
     });
     const writable = await handle.createWritable();
     await writable.write(new Blob([report], { type: "text/html;charset=utf-8" }));
     await writable.close();
     return;
   }
   const blob = new Blob([report], { type: "text/html;charset=utf-8" });
   const url = URL.createObjectURL(blob);
   const link = document.createElement("a");
   link.href = url;
   link.download = name;
   document.body.append(link);
   link.click();
   link.remove();
   URL.revokeObjectURL(url);
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__ensure__report__runtime = () => {
   if (globalThis.__moonapReportRuntime) return;
   const escapeHtml = (value) => String(value ?? "")
     .replaceAll("&", "&amp;")
     .replaceAll("<", "&lt;")
     .replaceAll(">", "&gt;")
     .replaceAll('"', "&quot;");
   const decodeText = (value) => String(value ?? "")
     .replaceAll("\\r\\n", "\n")
     .replaceAll("\\n", "\n")
     .replaceAll("\\t", "\t");
   const asNumber = (value) => Number.isFinite(Number(value)) ? Number(value) : null;
   const formatBytes = (value) => {
     const n = Number(value || 0);
     if (!Number.isFinite(n) || n <= 0) return "0 B";
     const units = ["B", "KB", "MB", "GB", "TB"];
     let size = n;
     let unit = 0;
     while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit += 1; }
     return `${size.toFixed(unit === 0 ? 0 : 2)} ${units[unit]}`;
   };
   const currentReportData = () => {
     const raw = globalThis.__moonapLastRuntimeReportPayload;
     const result = globalThis.__moonapLastRuntimeResult || {};
     if (raw && typeof raw === "object" && String(raw.request_id || "") === String(result.request_id || raw.request_id || "")) {
       return { ...result, ...raw };
     }
     return result;
   };
   const rows = (items) => items
     .filter(([, value]) => value !== undefined && value !== null && String(value) !== "")
     .map(([label, value]) => `<tr><th>${escapeHtml(label)}</th><td>${escapeHtml(value)}</td></tr>`)
     .join("");
   const buildHtml = () => {
     const data = currentReportData();
     if (!data || typeof data !== "object" || !String(data.request_id || data.summary || data.display_text || "").trim()) return "";
     const title = String(data.result_kind || "").includes("fastq") ? "MoonAP Large FastQ Analysis Report" : "MoonAP Runtime Report";
     const displayText = decodeText(data.display_text || data.download_content || data.summary || "");
     const previewReads = Array.isArray(data.preview_reads) ? data.preview_reads : [];
     const baseCounts = [
       ["A", data.A_count],
       ["C", data.C_count],
       ["G", data.G_count],
       ["T", data.T_count],
       ["N", data.N_count],
       ["Other", data.other_base_count]
     ];
     const baseTotal = baseCounts.reduce((sum, [, value]) => sum + (asNumber(value) || 0), 0);
     const baseRows = baseCounts
       .filter(([, value]) => value !== undefined && value !== null)
       .map(([base, value]) => {
         const n = asNumber(value) || 0;
         const pct = baseTotal > 0 ? `${((n / baseTotal) * 100).toFixed(2)}%` : "-";
         return `<tr><th>${escapeHtml(base)}</th><td>${escapeHtml(n)}</td><td>${escapeHtml(pct)}</td></tr>`;
       }).join("");
     const previewHtml = previewReads.length > 0
       ? previewReads.map((read, index) => `<article class="preview-read"><h3>Preview read ${index + 1}</h3><pre>${escapeHtml(decodeText(read))}</pre></article>`).join("")
       : (displayText ? `<pre>${escapeHtml(displayText)}</pre>` : "<p>No preview reads were captured.</p>");
     return `<!doctype html>
 <html lang="en">
 <head>
 <meta charset="utf-8" />
 <meta name="viewport" content="width=device-width, initial-scale=1" />
 <title>${escapeHtml(title)}</title>
 <style>
 :root { color-scheme: light; font-family: "Segoe UI", "Aptos", "Helvetica Neue", sans-serif; color: #17261f; background: #f2f5ef; font-variant-numeric: tabular-nums; }
 body { margin: 0; padding: 32px; font-size: 16px; line-height: 1.55; -webkit-font-smoothing: antialiased; text-rendering: optimizeLegibility; }
 main { max-width: 1040px; margin: 0 auto; display: grid; gap: 22px; }
 header { padding: 28px; border-radius: 24px; background: linear-gradient(135deg, #ffffff, #e7f2eb); border: 1px solid #cfe1d6; }
 h1 { margin: 0 0 10px; font-size: clamp(30px, 4vw, 52px); line-height: 1.05; letter-spacing: -0.04em; font-weight: 750; }
 section { padding: 22px; border-radius: 20px; background: rgba(255,255,255,0.86); border: 1px solid #d8e5dc; box-shadow: 0 16px 40px rgba(43,74,55,0.08); }
 h2 { margin: 0 0 14px; font-size: 22px; line-height: 1.2; letter-spacing: -0.02em; font-weight: 720; }
 table { width: 100%; border-collapse: collapse; }
 th, td { text-align: left; border-bottom: 1px solid #e4ece7; padding: 11px 8px; vertical-align: middle; line-height: 1.45; }
 th { width: 34%; color: #315241; font-weight: 680; }
 td { color: #14251d; }
 p { line-height: 1.6; }
 pre { font-family: "Cascadia Mono", "JetBrains Mono", "SFMono-Regular", Consolas, monospace; white-space: pre-wrap; overflow-wrap: anywhere; padding: 14px; border-radius: 14px; background: #102018; color: #e9fff3; line-height: 1.55; font-size: 14px; }
 .actions { display: flex; gap: 10px; flex-wrap: wrap; }
 button { border: 1px solid #1f7a5b; background: #1f7a5b; color: white; border-radius: 999px; padding: 10px 16px; font: inherit; font-weight: 650; cursor: pointer; }
 button.secondary { background: white; color: #1f7a5b; }
 .note { color: #567064; }
 </style>
 </head>
 <body>
 <main>
 <header>
 <h1>${escapeHtml(title)}</h1>
 <p>${escapeHtml(data.summary || "Browser-local report generated by MoonAP.")}</p>
 <p class="note">File contents stayed in this browser. The report contains summary metrics and small previews only.</p>
 <div class="actions"><button onclick="window.print()">Print / Save as PDF</button><button class="secondary" onclick="navigator.clipboard?.writeText(document.body.innerText)">Copy text</button></div>
 </header>
 <section><h2>File</h2><table>${rows([
   ["File name", data.file_name],
   ["File size", data.file_size_bytes !== undefined ? `${formatBytes(data.file_size_bytes)} (${data.file_size_bytes} bytes)` : ""],
   ["Chunk count", data.chunk_count],
   ["Chunk size", data.chunk_size_bytes !== undefined ? `${formatBytes(data.chunk_size_bytes)} (${data.chunk_size_bytes} bytes)` : ""],
   ["Request ID", data.request_id]
 ])}</table></section>
 <section><h2>FastQ Summary</h2><table>${rows([
   ["Estimated read count", data.estimated_read_count || data.reads_seen],
   ["Total lines", data.total_lines || data.line_count],
   ["Total bases", data.total_bases],
   ["Malformed records", data.malformed_record_count],
   ["Min read length", data.min_read_length],
   ["Max read length", data.max_read_length],
   ["Average read length", data.average_read_length],
   ["Elapsed ms", data.elapsed_ms]
 ])}</table></section>
 ${baseRows ? `<section><h2>Base Composition</h2><table><tr><th>Base</th><th>Count</th><th>Percent</th></tr>${baseRows}</table></section>` : ""}
 <section><h2>Preview / Raw Report</h2>${previewHtml}</section>
 </main>
 </body>
 </html>`;
   };
   const reportFileName = () => {
     const data = currentReportData();
     const base = String(data?.file_name || data?.result_kind || "moonap-report").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "") || "moonap-report";
     return `${base}.report.html`;
   };
   globalThis.__moonapReportRuntime = { buildHtml, reportFileName };
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__record__demo__runtime__result = async (onDone, onError) => {
   try {
     let runtimeRequest = globalThis.__moonapLastRuntimeRequest;
     if (!runtimeRequest || typeof runtimeRequest !== "object") {
       runtimeRequest = globalThis.__moonapLastSkillRuntimeRequest;
     }
     if (!runtimeRequest || typeof runtimeRequest !== "object") {
       throw new Error("No runtime request is available yet.");
     }
     let requestId = String(runtimeRequest.request_id || "");
     if (!requestId && globalThis.__moonapLastSkillRuntimeRequest && typeof globalThis.__moonapLastSkillRuntimeRequest === "object") {
       runtimeRequest = globalThis.__moonapLastSkillRuntimeRequest;
       requestId = String(runtimeRequest.request_id || "");
     }
     if (!requestId) {
       requestId = `browser-rerun-${Date.now()}`;
       runtimeRequest = Object.assign({}, runtimeRequest, { request_id: requestId });
       globalThis.__moonapLastRuntimeRequest = runtimeRequest;
     }
     const sourceUrl = String(runtimeRequest.source_url || "");
     const wasmUrl = String(runtimeRequest.wasm_url || "");
     const taskKind = String(runtimeRequest.task_kind || "");
     const runtimeSpec = runtimeRequest?.runtime_spec && typeof runtimeRequest.runtime_spec === "object"
       ? runtimeRequest.runtime_spec
       : (runtimeRequest?.runtime_ui && typeof runtimeRequest.runtime_ui === "object" ? runtimeRequest.runtime_ui : {});
     const runtimeMode = String(runtimeSpec?.mode || runtimeRequest.runtime_mode || "");
     const resultMode = String(runtimeSpec?.result_mode || runtimeRequest.result_mode || "text");
     const ioContract = runtimeSpec?.io_contract && typeof runtimeSpec.io_contract === "object"
       ? runtimeSpec.io_contract
       : {};
     const runtimeFields = Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : [];
     const runtimeInputs = {};
     for (const field of runtimeFields) {
       const name = String(field?.name || "");
       if (!name) continue;
       const type = String(field?.type || "text").toLowerCase();
       const fallback = field?.default;
       const node = document.querySelector(`#runtime-field-${name}`);
       const raw = type === "bool" || type === "boolean" || type === "checkbox" ? (node?.checked ? "true" : "false") : node?.value;
       const text = String(raw ?? fallback ?? "");
       runtimeInputs[name] = type === "int"
         ? Number.parseInt(text, 10)
         : type === "float"
           ? Number.parseFloat(text)
           : (type === "bool" || type === "boolean" || type === "checkbox")
             ? text === "true"
             : text;
     }
     const chunkSize = Math.max(256 * 1024, Number(ioContract.chunk_size_bytes) || (4 * 1024 * 1024));
     const emitProgress = (data) => {
       try {
         const payload = Object.assign({
           uploaded_bytes: 0,
           llm_receives_file_contents: false
         }, data || {});
         const text = JSON.stringify(payload, null, 2);
         const stateNode = document.querySelector("#state");
         if (stateNode) stateNode.textContent = text;
         const panel = document.querySelector("#resultPanel");
         panel?.classList.add("is-open");
         const setText = (selector, value) => {
           const node = document.querySelector(selector);
           if (node) node.textContent = String(value);
         };
         const formatBytes = (value) => {
           const n = Number(value || 0);
           if (n >= 1073741824) return `${(n / 1073741824).toFixed(2)} GB`;
           if (n >= 1048576) return `${(n / 1048576).toFixed(2)} MB`;
           if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
           return `${n} B`;
         };
         const fill = document.querySelector("#progressFill");
         const progress = Math.max(0, Math.min(100, Number(payload.progress_percent ?? 0)));
         if (fill) fill.style.width = `${progress}%`;
         globalThis.__moonapLargeFileProgressRuntime?.update?.(payload);
         setText("#resultStatus", payload.status || "running");
         setText("#resultTitle",
           String(payload.result_kind || "") === "streamed-file"
             ? "Browser-local large-file generation"
             : "Browser-local large-file analysis"
         );
         setText("#metricFile", payload.file_name || payload.download_name || "-");
         setText("#metricProcessed", formatBytes(payload.bytes_processed ?? payload.file_size_bytes ?? 0));
         setText("#metricReads", payload.reads_seen ?? payload.line_count ?? payload.chunk_count ?? 0);
         setText("#metricTarget", payload.matching_line_count ?? payload.bytes_written ?? 0);
         setText("#metricBases", payload.total_bases ?? payload.total_characters ?? payload.summary ?? "0");
         setText("#metricUploaded", formatBytes(payload.uploaded_bytes ?? 0));
       } catch {}
     };
     const runLargeFileAnalysisPayload = async () => {
       const file = document.querySelector("#fileInput")?.files?.[0];
       if (!file) {
         throw new Error("Choose a local file first. MoonAP large-file analysis runs browser-locally in chunks.");
       }
       const analysisType = String(runtimeSpec?.analysis_type || runtimeSpec?.tool_kind || "").toLowerCase();
       if (analysisType === "csv-summary") {
         const delimiter = String(runtimeSpec?.delimiter || "").toLowerCase() === "tab" || file.name.toLowerCase().endsWith(".tsv") ? "\t" : ",";
         const text = await file.text();
         const rows = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.trim() !== "");
         const parseRow = (line) => {
           const cells = [];
           let current = "";
           let quoted = false;
           for (let i = 0; i < line.length; i += 1) {
             const ch = line[i];
             if (ch === '"' && quoted && line[i + 1] === '"') { current += '"'; i += 1; }
             else if (ch === '"') quoted = !quoted;
             else if (ch === delimiter && !quoted) { cells.push(current); current = ""; }
             else current += ch;
           }
           cells.push(current);
           return cells.map((cell) => String(cell || "").trim());
         };
         const header = rows.length > 0 ? parseRow(rows[0]) : [];
         const dataRows = rows.slice(1).map(parseRow);
         const columnCount = header.length || Math.max(0, ...dataRows.map((row) => row.length));
         const columnNames = Array.from({ length: columnCount }, (_unused, index) => header[index] || `column_${index + 1}`);
         const missingCounts = Array.from({ length: columnCount }, () => 0);
         const numeric = Array.from({ length: columnCount }, () => ({ count: 0, sum: 0, min: Infinity, max: -Infinity }));
         for (const row of dataRows) {
           for (let i = 0; i < columnCount; i += 1) {
             const value = String(row[i] ?? "").trim();
             if (value === "") missingCounts[i] += 1;
             const numberValue = Number(value);
             if (value !== "" && Number.isFinite(numberValue)) {
               numeric[i].count += 1;
               numeric[i].sum += numberValue;
               numeric[i].min = Math.min(numeric[i].min, numberValue);
               numeric[i].max = Math.max(numeric[i].max, numberValue);
             }
           }
         }
         const numericLines = numeric.map((stat, index) => {
           if (stat.count === 0) return "";
           return `${columnNames[index]}: count=${stat.count}, min=${stat.min}, max=${stat.max}, mean=${(stat.sum / stat.count).toFixed(4)}`;
         }).filter(Boolean);
         const reportText = [
           "MoonAP CSV Summary",
           `request_id: ${requestId}`,
           `file_name: ${file.name}`,
           `file_size_bytes: ${file.size}`,
           `row_count: ${dataRows.length}`,
           `column_count: ${columnCount}`,
           `columns: ${columnNames.join(", ")}`,
           `missing_values: ${missingCounts.map((count, index) => `${columnNames[index]}=${count}`).join(", ")}`,
           "",
           "Numeric columns:",
           ...(numericLines.length === 0 ? ["(none detected)"] : numericLines)
         ].join("\n");
         return {
           run_id: String(runtimeRequest.run_id || ""),
           request_id: requestId,
           status: "runtime-succeeded",
           result_kind: "csv-summary-report",
           runtime_inputs: runtimeInputs,
           summary: `Analyzed ${dataRows.length} CSV row(s) across ${columnCount} column(s).`,
           display_text: reportText,
           stdout_text: `Browser-local CSV summary completed for ${requestId}.`,
           download_name: "moonap-csv-summary.txt",
           download_content: reportText,
           file_name: file.name,
           file_size_bytes: file.size,
           llm_receives_file_contents: false,
           accepted_for_skill: false
         };
       }
       const searchText = String(runtimeInputs.search_text || "");
       const maxPreviewLines = Math.max(0, Math.min(20, Number(runtimeInputs.max_preview_lines) || 3));
       let offset = 0;
       let carry = "";
       let lineCount = 0;
       let matchingLineCount = 0;
       let totalCharacters = 0;
       let chunkCount = 0;
       const previewLines = [];
       const started = performance.now();
       while (offset < file.size) {
         const end = Math.min(offset + chunkSize, file.size);
         const text = await file.slice(offset, end).text();
         const merged = carry + text;
         const hasFinalNewline = merged.endsWith("\n") || merged.endsWith("\r");
         const lines = merged.split(/\r?\n/);
         carry = hasFinalNewline ? "" : String(lines.pop() || "");
         for (const line of lines) {
           lineCount += 1;
           totalCharacters += line.length;
           if (searchText !== "" && line.includes(searchText)) matchingLineCount += 1;
           if (previewLines.length < maxPreviewLines) previewLines.push(line.slice(0, 240));
         }
         offset = end;
         chunkCount += 1;
         emitProgress({
           status: "streaming-read",
           result_kind: "large-file-report",
           file_name: file.name,
           file_size_bytes: file.size,
           chunk_size_bytes: chunkSize,
           chunk_count: chunkCount,
           bytes_processed: offset,
           progress_percent: file.size === 0 ? 100 : Math.floor((offset / file.size) * 100),
           line_count: lineCount,
           matching_line_count: matchingLineCount,
           total_characters: totalCharacters
         });
         await new Promise((resolve) => setTimeout(resolve, 0));
       }
       if (carry !== "") {
         lineCount += 1;
         totalCharacters += carry.length;
         if (searchText !== "" && carry.includes(searchText)) matchingLineCount += 1;
         if (previewLines.length < maxPreviewLines) previewLines.push(carry.slice(0, 240));
       }
       const elapsedMs = Math.round(performance.now() - started);
       const summary = searchText === ""
         ? `Streamed ${file.name} locally in ${chunkCount} chunk(s).`
         : `Streamed ${file.name} locally and counted lines containing "${searchText}".`;
       const reportText = [
         "MoonAP Large File Analysis",
         `request_id: ${requestId}`,
         `file_name: ${file.name}`,
         `file_size_bytes: ${file.size}`,
         `chunk_size_bytes: ${chunkSize}`,
         `chunk_count: ${chunkCount}`,
         `line_count: ${lineCount}`,
         `matching_line_count: ${matchingLineCount}`,
         `total_characters: ${totalCharacters}`,
         `elapsed_ms: ${elapsedMs}`,
         `search_text: ${searchText === "" ? "(none)" : searchText}`,
         "",
         "Preview lines:",
         ...(previewLines.length === 0 ? ["(none captured)"] : previewLines)
       ].join("\n");
       return {
         run_id: String(runtimeRequest.run_id || ""),
         request_id: requestId,
         status: "runtime-succeeded",
         result_kind: "large-file-report",
         runtime_inputs: runtimeInputs,
         summary,
         display_text: reportText,
         stdout_text: `Browser-local chunked analysis completed for ${requestId}.`,
         download_name: "moonap-large-file-analysis.txt",
         download_content: reportText,
         file_name: file.name,
         file_size_bytes: file.size,
         bytes_processed: file.size,
         chunk_size_bytes: chunkSize,
         chunk_count: chunkCount,
         line_count: lineCount,
         matching_line_count: matchingLineCount,
         total_characters: totalCharacters,
         progress_percent: 100,
         llm_receives_file_contents: false,
         accepted_for_skill: false
       };
     };
     const runLargeFastqAnalysisPayload = async () => {
       const file = document.querySelector("#fileInput")?.files?.[0];
       if (!file) {
         throw new Error("Choose a local FastQ file first. MoonAP large FastQ analysis runs browser-locally in chunks.");
       }
       const parsedPreviewReads = Number(runtimeInputs.max_preview_reads);
       const maxPreviewReads = Math.max(0, Math.min(20, Number.isFinite(parsedPreviewReads) ? parsedPreviewReads : 3));
       const validateStructure = !["false", "0", "no", "off"].includes(String(runtimeInputs.validate_fastq_structure || "true").trim().toLowerCase());
       const countBases = !["false", "0", "no", "off"].includes(String(runtimeInputs.count_bases || "true").trim().toLowerCase());
       let offset = 0;
       let carry = "";
       let chunkCount = 0;
       let lineCount = 0;
       let readCount = 0;
       let totalBases = 0;
       let aCount = 0;
       let cCount = 0;
       let gCount = 0;
       let tCount = 0;
       let nCount = 0;
       let otherBaseCount = 0;
       let minReadLength = null;
       let maxReadLength = 0;
       let malformedRecordCount = 0;
       const previewReads = [];
       const recordLines = [];
       const countSequence = (sequence) => {
         const length = sequence.length;
         totalBases += length;
         minReadLength = minReadLength == null ? length : Math.min(minReadLength, length);
         maxReadLength = Math.max(maxReadLength, length);
         if (!countBases) return;
         for (let i = 0; i < sequence.length; i += 1) {
           const ch = sequence[i].toUpperCase();
           if (ch === "A") aCount += 1;
           else if (ch === "C") cCount += 1;
           else if (ch === "G") gCount += 1;
           else if (ch === "T") tCount += 1;
           else if (ch === "N") nCount += 1;
           else otherBaseCount += 1;
         }
       };
       const consumeRecord = (header, sequence, plus, quality) => {
         const malformed = validateStructure && (!String(header || "").startsWith("@") || String(plus || "") !== "+" || String(sequence || "").length !== String(quality || "").length);
         if (malformed) malformedRecordCount += 1;
         readCount += 1;
         countSequence(String(sequence || ""));
         if (previewReads.length < maxPreviewReads) {
           previewReads.push(`${header}\n${String(sequence || "").slice(0, 240)}\n${plus}\n${String(quality || "").slice(0, 240)}`);
         }
       };
       const consumeLine = (line) => {
         lineCount += 1;
         recordLines.push(String(line || ""));
         if (recordLines.length === 4) {
           consumeRecord(recordLines[0], recordLines[1], recordLines[2], recordLines[3]);
           recordLines.length = 0;
         }
       };
       const started = performance.now();
       while (offset < file.size) {
         const end = Math.min(offset + chunkSize, file.size);
         const text = await file.slice(offset, end).text();
         const merged = carry + text;
         const hasFinalNewline = merged.endsWith("\n") || merged.endsWith("\r");
         const lines = merged.split(/\r?\n/);
         carry = hasFinalNewline ? "" : String(lines.pop() || "");
         if (hasFinalNewline && lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
         for (const line of lines) {
           consumeLine(line);
         }
         offset = end;
         chunkCount += 1;
         emitProgress({
           status: "streaming-fastq-analysis",
           result_kind: "large-fastq-report",
           file_name: file.name,
           file_size_bytes: file.size,
           chunk_size_bytes: chunkSize,
           chunk_count: chunkCount,
           bytes_processed: offset,
           progress_percent: file.size === 0 ? 100 : Math.floor((offset / file.size) * 100),
           line_count: lineCount,
           reads_seen: readCount,
           total_bases: totalBases,
           total_characters: totalBases,
           matching_line_count: nCount,
           llm_receives_file_contents: false
         });
         await new Promise((resolve) => setTimeout(resolve, 0));
       }
       if (carry !== "") consumeLine(carry);
       if (recordLines.length > 0) malformedRecordCount += 1;
       const elapsedMs = Math.round(performance.now() - started);
       const avgReadLength = readCount === 0 ? 0 : totalBases / readCount;
       const reportText = [
         "MoonAP Large FastQ Analysis",
         `request_id: ${requestId}`,
         `file_name: ${file.name}`,
         `file_size_bytes: ${file.size}`,
         `chunk_size_bytes: ${chunkSize}`,
         `chunk_count: ${chunkCount}`,
         `total_lines: ${lineCount}`,
         `estimated_read_count: ${readCount}`,
         `total_bases: ${totalBases}`,
         `A_count: ${aCount}`,
         `C_count: ${cCount}`,
         `G_count: ${gCount}`,
         `T_count: ${tCount}`,
         `N_count: ${nCount}`,
         `other_base_count: ${otherBaseCount}`,
         `min_read_length: ${minReadLength == null ? 0 : minReadLength}`,
         `max_read_length: ${maxReadLength}`,
         `average_read_length: ${avgReadLength.toFixed(2)}`,
         `malformed_record_count: ${malformedRecordCount}`,
         `elapsed_ms: ${elapsedMs}`,
         "",
         "Preview reads:",
         ...(previewReads.length === 0 ? ["(none captured)"] : previewReads)
       ].join("\n");
       return {
         run_id: String(runtimeRequest.run_id || ""),
         request_id: requestId,
         status: "runtime-succeeded",
         result_kind: "large-fastq-report",
         result_mode: "report",
         runtime_inputs: runtimeInputs,
         summary: `Analyzed ${file.name} locally: ${readCount} FastQ reads, ${totalBases} bases.`,
         display_text: reportText,
         stdout_text: `Browser-local FastQ analysis completed for ${requestId}.`,
         download_name: "moonap-large-fastq-analysis.txt",
         download_content: reportText,
         file_name: file.name,
         file_size_bytes: file.size,
         bytes_processed: file.size,
         chunk_size_bytes: chunkSize,
         chunk_count: chunkCount,
         line_count: lineCount,
         reads_seen: readCount,
         estimated_read_count: readCount,
         total_bases: totalBases,
         A_count: aCount,
         C_count: cCount,
         G_count: gCount,
         T_count: tCount,
         N_count: nCount,
         other_base_count: otherBaseCount,
         min_read_length: minReadLength == null ? 0 : minReadLength,
         max_read_length: maxReadLength,
         average_read_length: Number(avgReadLength.toFixed(2)),
         total_characters: totalBases,
         matching_line_count: nCount,
         malformed_record_count: malformedRecordCount,
         preview_reads: previewReads,
         progress_percent: 100,
         llm_receives_file_contents: false,
         accepted_for_skill: false
       };
     };
     const runLargeFileGenerationPayload = async () => {
       if (typeof window.showSaveFilePicker !== "function") {
         throw new Error("This browser does not support streamed save-file output yet.");
       }
       const encoder = new TextEncoder();
       const outputNameRaw = String(runtimeInputs.output_name || "moonap-output.fastq").trim() || "moonap-output.fastq";
       const fileNameRuntime = globalThis.__moonapFileNameRuntime;
       let outputName = fileNameRuntime?.sanitize(outputNameRaw, "moonap-output.fastq") || "moonap-output.fastq";
       const targetSizeMb = Math.max(1, Math.min(1024, Number(runtimeInputs.target_size_mb) || 128));
       const targetBytes = targetSizeMb * 1024 * 1024;
       const readLength = Math.max(20, Math.min(20000, Number(runtimeInputs.read_length ?? runtimeInputs.line_length) || 150));
       const headerPrefixRaw = runtimeInputs.read_header_prefix || runtimeInputs.header_prefix || "moonap_read";
       const headerPrefix = fileNameRuntime?.sanitizeToken(headerPrefixRaw, "moonap_read") || "moonap_read";
       const nRate = Math.max(0, Math.min(1, Number(runtimeInputs.n_rate) || 0.01));
       const qualityChar = String(runtimeInputs.quality_char || "I").slice(0, 1) || "I";
       let seed = Math.max(0, Math.floor(Number(runtimeInputs.random_seed) || 42)) >>> 0;
       const bases = ["A", "C", "G", "T"];
       const rand = () => {
         seed = (seed * 1664525 + 1013904223) >>> 0;
         return seed / 4294967296;
       };
       const selectedOutput = globalThis.__moonapRuntimeOutputFile;
       if (!selectedOutput || String(selectedOutput.request_id || "") !== requestId || !selectedOutput.handle) {
         throw new Error("Choose an output file before running. MoonAP streams generated files to that browser file handle.");
       }
       const fileHandle = selectedOutput.handle;
       outputName = String(fileHandle?.name || selectedOutput.name || outputName);
       const writable = await fileHandle.createWritable();
       let bytesWritten = 0;
       let readIndex = 0;
       let chunkCount = 0;
       const started = performance.now();
       const materializeRecord = (index) => {
         let seq = "";
         for (let i = 0; i < readLength; i += 1) {
           seq += rand() < nRate ? "N" : bases[Math.floor(rand() * bases.length)];
         }
         return `@${headerPrefix}_${index}\n${seq}\n+\n${qualityChar.repeat(readLength)}\n`;
       };
       while (bytesWritten < targetBytes) {
         const records = [];
         let chunkBytes = 0;
         while (chunkBytes < chunkSize && bytesWritten + chunkBytes < targetBytes) {
           const record = materializeRecord(readIndex);
           const bytes = encoder.encode(record);
           const remaining = targetBytes - bytesWritten - chunkBytes;
           if (bytes.length > remaining) {
             break;
           }
           records.push(record);
           chunkBytes += bytes.length;
           readIndex += 1;
         }
         if (records.length === 0) break;
         const chunkText = records.join("");
         await writable.write(chunkText);
         bytesWritten += encoder.encode(chunkText).length;
         chunkCount += 1;
         emitProgress({
           status: "streaming-write",
           result_kind: "streamed-file",
           file_name: outputName,
           chunk_size_bytes: chunkSize,
           chunk_count: chunkCount,
           bytes_written: bytesWritten,
           bytes_processed: bytesWritten,
           target_bytes: targetBytes,
           progress_percent: targetBytes === 0 ? 100 : Math.floor((bytesWritten / targetBytes) * 100),
           total_characters: bytesWritten,
           reads_seen: readIndex
         });
         await new Promise((resolve) => setTimeout(resolve, 0));
       }
       await writable.close();
       const elapsedMs = Math.round(performance.now() - started);
       const displayText = [
         "MoonAP Large File Generation",
         `request_id: ${requestId}`,
         `output_name: ${outputName}`,
         `target_size_mb: ${targetSizeMb}`,
         `bytes_written: ${bytesWritten}`,
         `chunk_size_bytes: ${chunkSize}`,
         `chunk_count: ${chunkCount}`,
         `elapsed_ms: ${elapsedMs}`,
         `fastq_reads_written: ${readIndex}`,
         `read_length: ${readLength}`,
         `read_header_prefix: ${headerPrefix}`,
         `n_rate: ${nRate}`,
         `quality_char: ${qualityChar}`
       ].join("\n");
       return {
         run_id: String(runtimeRequest.run_id || ""),
         request_id: requestId,
         status: "runtime-succeeded",
         result_kind: "streamed-file",
         result_mode: "download",
         runtime_inputs: runtimeInputs,
         summary: `Generated ${outputName} locally with browser streaming output (${readIndex} FastQ reads).`,
         display_text: displayText,
         stdout_text: `Browser-local streamed generation completed for ${requestId}.`,
         download_name: "",
         download_content: "",
         file_name: outputName,
         bytes_written: bytesWritten,
         bytes_processed: bytesWritten,
         reads_seen: readIndex,
         chunk_size_bytes: chunkSize,
         chunk_count: chunkCount,
         progress_percent: 100,
         llm_receives_file_contents: false,
         accepted_for_skill: false
       };
     };
     const buildFastqPayload = () => {
       const readCount = Math.max(1, Math.min(1000000, Number(runtimeInputs.read_count) || 10000));
       const readLength = Math.max(1, Math.min(10000, Number(runtimeInputs.read_length) || 150));
       const nRate = Math.max(0, Math.min(1, Number(runtimeInputs.n_rate) || 0.01));
       const originalSeed = Number(runtimeInputs.random_seed) || 42;
       let seed = originalSeed;
       const bases = ["A", "C", "G", "T"];
       const rand = () => {
         seed = (seed * 1664525 + 1013904223) >>> 0;
         return seed / 4294967296;
       };
       const chunks = [];
       let nCount = 0;
       let totalBases = 0;
       for (let read = 0; read < readCount; read += 1) {
         let seq = "";
         for (let i = 0; i < readLength; i += 1) {
           totalBases += 1;
           if (rand() < nRate) {
             seq += "N";
             nCount += 1;
           } else {
             seq += bases[Math.floor(rand() * bases.length)];
           }
         }
         chunks.push(`@moonap_${read}\n${seq}\n+\n${"I".repeat(readLength)}\n`);
       }
       const blob = new Blob(chunks, { type: "text/plain;charset=utf-8" });
       const url = URL.createObjectURL(blob);
       const link = document.createElement("a");
       link.href = url;
       link.download = "moonap-demo.fastq";
       document.body.append(link);
       link.click();
       link.remove();
       setTimeout(() => URL.revokeObjectURL(url), 1000);
       return {
         run_id: String(runtimeRequest.run_id || ""),
         request_id: requestId,
         status: "runtime-succeeded",
         result_kind: "fastq-file",
         result_mode: "download",
         runtime_inputs: runtimeInputs,
         summary: `Generated moonap-demo.fastq with ${readCount} reads of length ${readLength}.`,
         display_text: `FastQ file generated and downloaded in the browser.\nread_count=${readCount}\nread_length=${readLength}\nn_rate=${nRate}\nrandom_seed=${originalSeed}\nexpected_n_count=${nCount}\ntotal_bases=${totalBases}`,
         stdout_text: `Browser-local FastQ generation completed for ${requestId}.`,
         download_name: "",
         download_content: "",
         accepted_for_skill: false
       };
     };
     const buildGenericPayload = (summary, displayText, resultKind = "text") => {
       return {
         run_id: String(runtimeRequest.run_id || ""),
         request_id: requestId,
         status: "runtime-succeeded",
         result_kind: resultKind,
         result_mode: resultMode,
         runtime_inputs: runtimeInputs,
         summary,
         display_text: displayText,
         stdout_text: `Browser-local runtime step completed for ${requestId}.`,
         download_name: "runtime-preview.txt",
         download_content: `MoonAP runtime result\nrequest_id: ${requestId}\ntask_kind: ${taskKind}\nsource_url: ${sourceUrl}\nwasm_url: ${wasmUrl}\n`,
         accepted_for_skill: false
       };
     };
     const buildGenericFormPayload = () => {
       const inputLines = Object.entries(runtimeInputs).map(([key, value]) => `${key}: ${String(value)}`);
       const toolKind = String(runtimeSpec?.tool_kind || runtimeSpec?.analysis_type || "").toLowerCase();
       const renderTemplate = (template, values) => String(template || "").replace(/\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g, (_match, name) => {
         const value = values[name];
         return value === undefined || value === null ? "" : String(value);
       });
       const evaluateExpression = (expression, values) => {
         const expr = String(expression || "").trim();
         if (!expr) throw new Error("Computed output is missing an expression.");
         if (!/^[A-Za-z0-9_+\-*/().,\s]+$/.test(expr)) {
           throw new Error(`Unsupported characters in expression: ${expr}`);
         }
         const numericExpr = expr.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (name) => {
           if (name === "pow") return "Math.pow";
           if (name === "sqrt") return "Math.sqrt";
           if (name === "abs") return "Math.abs";
           if (name === "min") return "Math.min";
           if (name === "max") return "Math.max";
           if (!Object.prototype.hasOwnProperty.call(values, name)) {
             throw new Error(`Unknown input in expression: ${name}`);
           }
           const n = Number(values[name]);
           if (!Number.isFinite(n)) throw new Error(`Input ${name} is not numeric.`);
           return `(${String(n)})`;
         });
         if (!/^[0-9eE+\-*/().,\sMathpowsqrtabsminax]+$/.test(numericExpr)) {
           throw new Error(`Expression did not reduce to arithmetic: ${expr}`);
         }
         const result = Function(`"use strict"; return (${numericExpr});`)();
         if (!Number.isFinite(Number(result))) {
           throw new Error(`Expression produced a non-finite result: ${expr}`);
         }
         return Number(result);
       };
       if (toolKind === "text-analysis") {
         const text = String(runtimeInputs.input_text || runtimeInputs.text || "");
         const characters = text.length;
         const charactersNoSpaces = text.replace(/\s/g, "").length;
         const words = (text.trim().match(/\S+/g) || []).length;
         const lines = text === "" ? 0 : text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").length;
         const readingMinutes = words / 200;
         const displayText = [
           `Characters: ${characters}`,
           `Characters without spaces: ${charactersNoSpaces}`,
           `Words: ${words}`,
           `Lines: ${lines}`,
           `Estimated reading time: ${readingMinutes.toFixed(2)} minutes`
         ].join("\n");
         return buildGenericPayload(`Analyzed ${words} word(s), ${characters} character(s), and ${lines} line(s).`, displayText);
       }
       if (toolKind === "json-formatter") {
         const raw = String(runtimeInputs.json_text || runtimeInputs.input_text || "");
         try {
           const parsed = JSON.parse(raw);
           const formatted = JSON.stringify(parsed, null, 2);
           return buildGenericPayload("JSON is valid and formatted.", `Valid JSON: true\n\n${formatted}`, "text");
         } catch (error) {
           return buildGenericPayload("JSON is invalid.", `Valid JSON: false\nError: ${error instanceof Error ? error.message : String(error)}`, "text");
         }
       }
       const computedOutputs = Array.isArray(runtimeSpec.computed_outputs)
         ? runtimeSpec.computed_outputs
         : (Array.isArray(runtimeSpec.outputs) ? runtimeSpec.outputs : []);
       if (computedOutputs.length > 0) {
         const values = { ...runtimeInputs };
         for (const output of computedOutputs) {
           const name = String(output?.name || "").trim();
           if (!name) continue;
           const rawValue = evaluateExpression(output?.expression, values);
           const decimals = Number.isFinite(Number(output?.decimals)) ? Math.max(0, Math.min(12, Number(output.decimals))) : null;
           const value = decimals === null ? rawValue : Number(rawValue.toFixed(decimals));
           values[name] = value;
         }
         const outputLines = computedOutputs.map((output) => {
           const name = String(output?.name || "").trim();
           if (!name) return "";
           const label = String(output?.label || name);
           return `${label}: ${String(values[name])}`;
         }).filter(Boolean);
         const displayText = runtimeSpec.result_template
           ? renderTemplate(runtimeSpec.result_template, values)
           : [...inputLines, ...outputLines].join("\n");
         const summaryText = runtimeSpec.summary_template
           ? renderTemplate(runtimeSpec.summary_template, values)
           : (outputLines[0] || "MoonAP calculated the form result.");
         return buildGenericPayload(summaryText, displayText);
       }
       if (Object.prototype.hasOwnProperty.call(runtimeInputs, "celsius")) {
         const celsius = Number(runtimeInputs.celsius);
         const fahrenheit = celsius * 9 / 5 + 32;
         return buildGenericPayload(
           `Converted ${celsius} Celsius to ${fahrenheit.toFixed(2)} Fahrenheit.`,
           `Celsius: ${celsius}\nFahrenheit: ${fahrenheit.toFixed(2)}`
         );
       }
       if (Object.prototype.hasOwnProperty.call(runtimeInputs, "number_a") && Object.prototype.hasOwnProperty.call(runtimeInputs, "number_b")) {
         const a = Number(runtimeInputs.number_a);
         const b = Number(runtimeInputs.number_b);
         const sum = a + b;
         return buildGenericPayload(
           `Calculated ${a} + ${b} = ${sum}.`,
           `First number: ${a}\nSecond number: ${b}\nSum: ${sum}`
         );
       }
       return buildGenericPayload(
         "MoonAP recorded browser-local form input for the compiled wasm artifact.",
         inputLines.length === 0
           ? `Demo runtime result recorded for ${requestId}. Source URL: ${sourceUrl || "n/a"}. wasm URL: ${wasmUrl || "n/a"}.`
           : `Runtime inputs:\n${inputLines.join("\n")}\n\nSource URL: ${sourceUrl || "n/a"}\nwasm URL: ${wasmUrl || "n/a"}`
       );
     };
     let payload;
     if (taskKind === "large-fastq-analysis" || String(runtimeSpec.domain_profile || "").toLowerCase() === "fastq") {
       payload = await runLargeFastqAnalysisPayload();
     } else if (String(ioContract.host_capability || "") === "csv-summary" || String(runtimeSpec?.analysis_type || "").toLowerCase() === "csv-summary") {
       payload = await runLargeFileAnalysisPayload();
     } else if (String(ioContract.host_capability || "") === "chunked-local-analysis" || taskKind === "large-file-analysis") {
       payload = await runLargeFileAnalysisPayload();
     } else if (String(ioContract.host_capability || "") === "streamed-local-generation" || taskKind === "large-file-generation") {
       payload = await runLargeFileGenerationPayload();
     } else if (taskKind === "fastq-generator") {
       payload = buildFastqPayload();
     } else if (taskKind === "excel-generator") {
       payload = buildGenericPayload(
         "MoonAP prepared an Excel-like generator runtime step. Download-oriented browser generation is the next task-specific executor to implement.",
         `Task kind: ${taskKind}\nruntime_mode: ${runtimeMode}\nThe runtime form has been rendered from runtime_spec. A dedicated Excel generator executor is still pending.`
       );
     } else if (taskKind === "fastq-analysis" || taskKind === "finance-report-analysis") {
       payload = buildGenericPayload(
         "MoonAP prepared an analysis runtime step. File-input analysis executor is still pending.",
         `Task kind: ${taskKind}\nruntime_mode: ${runtimeMode}\nThe browser can now distinguish file-analysis tasks, but the task-specific analysis executor is still pending.`,
         "report"
       );
     } else if (taskKind === "browser-game") {
       payload = buildGenericPayload(
         "MoonAP prepared an interactive game runtime step. Interactive host execution is still pending.",
         `Task kind: ${taskKind}\nruntime_mode: ${runtimeMode}\nThe browser can now distinguish interactive tasks, but the task-specific game host is still pending.`,
         "interactive-view"
       );
     } else {
       payload = buildGenericFormPayload();
     }
     if (String(payload?.result_kind || "").includes("report") || resultMode === "report") {
       globalThis.__moonapLastRuntimeReportPayload = payload;
     }
     const response = await fetch("/api/task/execute", {
       method: "POST",
       headers: { "Content-Type": "application/json; charset=utf-8" },
       body: JSON.stringify(payload)
     });
     const text = await response.text();
     if (!response.ok) throw new Error(text || `Runtime execute failed (${response.status})`);
     if (payload && (taskKind === "large-file-analysis" || taskKind === "large-fastq-analysis" || taskKind === "large-file-generation")) {
       globalThis.__moonapLargeFileProgressRuntime?.update?.({ ...payload, progress_percent: 100, status: "runtime-succeeded" });
     }
     onDone(String(text));
   } catch (error) {
     try {
       const runtimeRequest = globalThis.__moonapLastRuntimeRequest || {};
       const runtimeSpec = runtimeRequest?.runtime_spec && typeof runtimeRequest.runtime_spec === "object"
         ? runtimeRequest.runtime_spec
         : (runtimeRequest?.runtime_ui && typeof runtimeRequest.runtime_ui === "object" ? runtimeRequest.runtime_ui : {});
       const ioContract = runtimeSpec?.io_contract && typeof runtimeSpec.io_contract === "object" ? runtimeSpec.io_contract : {};
       const taskKind = String(runtimeRequest?.task_kind || "");
       const hostCapability = String(ioContract.host_capability || "");
       const isLargeRuntime = taskKind === "large-file-generation" || taskKind === "large-file-analysis" || taskKind === "large-fastq-analysis" || hostCapability === "streamed-local-generation" || hostCapability === "chunked-local-analysis";
       if (isLargeRuntime) globalThis.__moonapLargeFileProgressRuntime?.error?.(error instanceof Error ? error.message : String(error));
     } catch {}
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__register__runtime__ready = async (onDone, onError) => {
   try {
     const artifact = globalThis.__moonapLastArtifact;
     const compileReport = globalThis.__moonapLastCompileReport;
     const source = String(artifact?.moonbit_source || "");
     if (!source.trim()) throw new Error("No captured MoonBit source is available for runtime registration.");
     if (!compileReport || typeof compileReport !== "object" || compileReport.ok !== true) {
       throw new Error("MoonAP runtime registration requires a successful compile report.");
     }
     const requestStage = artifact?.moonap_adaptation_used
       ? "moonap-adaptation"
       : artifact?.quality_assessment_used
         ? "quality-repair"
         : artifact?.compile_summary_used
           ? "compile-repair"
           : "browser-direct";
     const envelope = [
       `TASK_TITLE\t${String(artifact?.name || "MoonBit task")}`,
       `ORIGINAL_PROMPT\t${String(artifact?.prompt || "")}`,
       `LLM_PROVIDER\t${String(artifact?.llm_provider || "")}`,
       `LLM_MODEL\t${String(artifact?.llm_model || "")}`,
       `REQUEST_STAGE\t${String(requestStage)}`,
       `COMPILE_OK\t${String(Boolean(compileReport.ok))}`,
       `WASM_PATH\t${String(compileReport.wasm_path || "")}`,
       "SOURCE_BEGIN",
       source,
       "SOURCE_END",
       "COMPILE_REPORT_BEGIN",
       JSON.stringify(compileReport, null, 2),
       "COMPILE_REPORT_END",
       "RAW_RESPONSE_BEGIN",
       String(artifact?.llm_response_preview || ""),
       "RAW_RESPONSE_END"
     ].join("\n");
     fetch("/api/logs/moonap-runtime.log", {
       method: "POST",
       headers: { "Content-Type": "text/plain; charset=utf-8" },
       body: JSON.stringify({
         ts: new Date().toISOString(),
         kind: "runtime-exec",
         label: "runtime-request-register-attempt",
         text: String(artifact?.prompt || "")
       }) + "\n",
       keepalive: true
     }).catch(() => {});
     const response = await fetch("/api/runtime-exec/register-ready", {
       method: "POST",
       headers: { "Content-Type": "text/plain; charset=utf-8" },
       body: envelope
     });
     const text = await response.text();
     if (!response.ok) throw new Error(text || `Runtime registration failed (${response.status})`);
     fetch("/api/logs/moonap-runtime.log", {
       method: "POST",
       headers: { "Content-Type": "text/plain; charset=utf-8" },
       body: JSON.stringify({
         ts: new Date().toISOString(),
         kind: "runtime-exec",
         label: "runtime-request-register-succeeded",
         text: String(text || "")
       }) + "\n",
       keepalive: true
     }).catch(() => {});
     onDone(String(text));
   } catch (error) {
     fetch("/api/logs/moonap-runtime.log", {
       method: "POST",
       headers: { "Content-Type": "text/plain; charset=utf-8" },
       body: JSON.stringify({
         ts: new Date().toISOString(),
         kind: "runtime-exec",
         label: "runtime-request-register-failed",
         text: String(error instanceof Error ? error.message : String(error))
       }) + "\n",
       keepalive: true
     }).catch(() => {});
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__store__compile__report = (raw) => {
   try {
     globalThis.__moonapLastCompileReport = JSON.parse(String(raw));
   } catch {
     globalThis.__moonapLastCompileReport = String(raw);
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__reset__compile__report = () => {
   globalThis.__moonapLastCompileReport = null;
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__assess__last__benchmark = () => {
   const artifact = globalThis.__moonapLastArtifact;
   const source = String(artifact?.moonbit_source || "");
   const name = String(artifact?.name || "");
   const prompt = String(artifact?.prompt || "");
   const combined = `${name}\n${prompt}`;
   const lowerCombined = combined.toLowerCase();
   const levelMatch = combined.match(/Benchmark Level\s+([1-5])/i);
   const level = levelMatch ? Number(levelMatch[1]) : 0;
   const fnNames = Array.from(source.matchAll(/\bfn\s+([A-Za-z_][A-Za-z0-9_]*)/g)).map((item) => String(item[1] || ""));
   const helperNames = fnNames.filter((item) => item !== "main");
   const lower = source.toLowerCase();
   const hasImport = /\bimport\b/.test(lower);
   const hasHelloMoonbit = /hello moonbit/.test(lower);
   const hasABC = /abc/.test(source);
   const hasControlFlow = /\bif\b|\bmatch\b|\bfor\b|\bwhile\b/.test(source);
   const hasRandomness = /\brandom\b|\bseed\b|\blcg\b|\brand_/.test(lower);
   const hasMain = /\bfn\s+main\b/.test(source);
   const isFastqMoonbitTask = lowerCombined.includes("fastq") && lowerCombined.includes("moonbit") && (lowerCombined.includes("generator") || lowerCombined.includes("synthetic read"));
   const hasFastqHeader = source.includes("@SEQ") || source.includes("@moonap") || source.includes("\"@\"");
   const hasFastqPlus = source.includes("\\n+\\n") || source.includes("\"+\"") || source.includes("+\\n");
   const hasQuality = source.includes("IIII") || source.includes("qual");
   const hasSequenceLogic = /A|C|G|T|N/.test(source) && (hasControlFlow || helperNames.length > 0);
   const missingSignals = [];
   const preserveConstraints = ["keep the original task goal", "keep the source import-free when possible", "return only cmd/main/main.mbt", "preserve wasm-gc compatibility"];
   const result = {
     applicable: level > 0 || isFastqMoonbitTask,
     assessment_kind: "system-assessment",
     task_kind: level > 0 ? `benchmark-l${level}` : (isFastqMoonbitTask ? "fastq-generator" : "general-moonbit"),
     level: level,
     pass: false,
     title: "Compile probe succeeded",
     summary: "MoonAP used the native MoonBit toolchain on this machine and produced a real wasm-gc artifact. Browser-local runtime execution is the next implementation step.",
     meta_json: JSON.stringify(["compile probe ok", "real wasm built", "runtime pending"]),
     missing_signals_json: "[]",
     preserve_constraints_json: JSON.stringify(preserveConstraints),
     repair_hint: "Keep the task intent intact while improving the machine-checkable task structure."
   };
   if (level === 1) {
     if (!hasMain) missingSignals.push("define exactly one fn main");
     if (hasImport) missingSignals.push("remove import usage");
     if (!hasHelloMoonbit) missingSignals.push("return text containing hello moonbit");
     if (helperNames.length !== 0) missingSignals.push("avoid helper functions for Benchmark L1");
     const pass = hasMain && !hasImport && hasHelloMoonbit && helperNames.length === 0;
     result.pass = pass;
     result.title = pass ? "Benchmark L1 passed" : "Compile succeeded, but Benchmark L1 failed";
     result.summary = pass
       ? "Compile succeeded and the generated MoonBit source matches the Level 1 checks: one main function, no imports, no helper functions, and hello moonbit is returned."
       : "Compile succeeded, but the generated source does not fully match Level 1. MoonAP expected one main function, no imports, no helpers, and a return value containing hello moonbit.";
     result.meta_json = JSON.stringify(pass
       ? ["benchmark l1", "compile ok", "quality pass"]
       : ["benchmark l1", "compile ok", "quality failed"]);
     result.repair_hint = "Benchmark L1 should be a single-file MoonBit program with one main function, no imports, no helpers, and a return value that visibly contains hello moonbit.";
   } else if (level === 2) {
     const helper = helperNames.length === 1 ? helperNames[0] : "";
     const mainCallsHelper = helper !== "" && source.includes(`${helper}(`);
     if (!hasMain) missingSignals.push("define fn main");
     if (hasImport) missingSignals.push("remove import usage");
     if (!hasHelloMoonbit) missingSignals.push("return text containing hello moonbit");
     if (helperNames.length !== 1) missingSignals.push("define exactly one helper function");
     if (!mainCallsHelper) missingSignals.push("have main call the helper function");
     const pass = hasMain && !hasImport && hasHelloMoonbit && helperNames.length === 1 && mainCallsHelper;
     result.pass = pass;
     result.title = pass ? "Benchmark L2 passed" : "Compile succeeded, but Benchmark L2 failed";
     result.summary = pass
       ? "Compile succeeded and the generated MoonBit source matches the Level 2 checks: exactly one helper function returns hello moonbit and main calls that helper."
       : "Compile succeeded, but the generated source does not fully match Level 2. MoonAP expected exactly one helper function, no imports, hello moonbit, and main calling the helper.";
     result.meta_json = JSON.stringify(pass
       ? ["benchmark l2", "compile ok", "quality pass"]
       : ["benchmark l2", "compile ok", "quality failed"]);
     result.repair_hint = "Benchmark L2 should keep one helper function that produces hello moonbit, with main delegating to that helper and no imports.";
   } else if (level === 3) {
     if (!hasMain) missingSignals.push("define fn main");
     if (hasImport) missingSignals.push("remove import usage");
     if (!hasABC) missingSignals.push("return text containing ABC");
     if (!hasControlFlow) missingSignals.push("include simple control flow");
     if (hasRandomness) missingSignals.push("remove randomness");
     const pass = hasMain && !hasImport && hasABC && hasControlFlow && !hasRandomness;
     result.pass = pass;
     result.title = pass ? "Benchmark L3 passed" : "Compile succeeded, but Benchmark L3 failed";
     result.summary = pass
       ? "Compile succeeded and the generated MoonBit source matches the Level 3 checks: main returns ABC, uses simple control flow, and avoids imports or randomness."
       : "Compile succeeded, but the generated source does not fully match Level 3. MoonAP expected main to return ABC using simple control flow, with no imports or randomness.";
     result.meta_json = JSON.stringify(pass
       ? ["benchmark l3", "compile ok", "quality pass"]
       : ["benchmark l3", "compile ok", "quality failed"]);
     result.repair_hint = "Benchmark L3 should visibly implement ABC with deterministic control flow and no imports or randomness.";
   } else if (isFastqMoonbitTask) {
     if (!hasMain) missingSignals.push("define fn main");
     if (hasImport) missingSignals.push("remove import usage");
     if (!hasFastqHeader) missingSignals.push("emit a visible FastQ header such as @SEQ or @moonap");
     if (!hasFastqPlus) missingSignals.push("emit a plus line between sequence and quality");
     if (!hasQuality) missingSignals.push("generate an explicit quality string such as IIII or qual");
     if (!hasSequenceLogic) missingSignals.push("include visible sequence-generation logic over A/C/G/T/N");
     const pass = hasMain && !hasImport && hasFastqHeader && hasFastqPlus && hasQuality && hasSequenceLogic;
     result.pass = pass;
     result.title = pass ? "FastQ Generator task passed" : "Compile succeeded, but FastQ Generator task failed";
     result.summary = pass
       ? "Compile succeeded and the generated MoonBit source shows the expected FastQ structure: a header, sequence logic, plus line, and quality generation without imports."
       : "Compile succeeded, but the generated MoonBit source does not yet look like a usable FastQ generator. MoonAP expected visible FastQ structure, sequence-generation logic, and a quality line without imports.";
     result.meta_json = JSON.stringify(pass
       ? ["fastq generator", "compile ok", "quality pass"]
       : ["fastq generator", "compile ok", "quality failed"]);
     result.repair_hint = "Keep the program compiling, but make the MoonBit source visibly look like a FastQ generator with header, sequence, plus line, and quality generation.";
   }
   result.missing_signals_json = JSON.stringify(missingSignals);
   return JSON.stringify(result);
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app35browser__set__benchmark__assessment = (raw) => {
   globalThis.__moonapBenchmarkAssessment = String(raw || "");
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app57browser__repair__last__artifact__with__system__assessment = async (knowledgePack, onDone, onError) => {
   try {
     const artifact = globalThis.__moonapLastArtifact;
     const source = String(artifact?.moonbit_source || "");
     if (!source.trim()) throw new Error("No captured MoonBit source is available for quality repair.");
     let assessment = {};
     try {
       assessment = JSON.parse(String(globalThis.__moonapBenchmarkAssessment || "{}"));
     } catch {
       assessment = {};
     }
     if (!assessment || typeof assessment !== "object") throw new Error("No system assessment is available yet.");
     const readRouter = () => {
       try {
         const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
         return parsed && typeof parsed === "object" ? parsed : {};
       } catch {
         return {};
       }
     };
     const saved = readRouter();
     const providers = Array.isArray(saved.providers) ? saved.providers.filter((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed") : [];
     if (providers.length === 0) throw new Error("No enabled LLM provider is available in the router.");
     const cursor = Number.isFinite(saved.cursor) ? saved.cursor : 0;
     const start = ((cursor % providers.length) + providers.length) % providers.length;
     const ordered = providers.slice(start).concat(providers.slice(0, start));
     const proxyPost = async (url, headers, body) => {
       const envelope = [
         `URL\t${String(url)}`,
         ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
         "BODY",
         String(body)
       ].join("\n");
       const response = await fetch("/api/llm/proxy", {
         method: "POST",
         headers: { "Content-Type": "text/plain; charset=utf-8" },
         body: envelope
       });
       const text = await response.text();
       let json = {};
       try {
         json = JSON.parse(text);
       } catch {
         const plain = String(text || "")
           .replace(/<script[\s\S]*?<\/script>/gi, " ")
           .replace(/<style[\s\S]*?<\/style>/gi, " ")
           .replace(/<[^>]+>/g, " ")
           .replace(/\s+/g, " ")
           .trim();
         const summarized = plain || `MoonAP proxy returned non-JSON (${response.status})`;
         throw new Error(`Provider returned non-JSON (${response.status}): ${summarized.slice(0, 240)}`);
       }
       if (!response.ok) {
         const detail = json?.error?.detail ? ` ${String(json.error.detail)}` : "";
         throw new Error((json?.error?.message || `LLM request failed (${response.status})`) + detail);
       }
       return json;
     };
     const updatePrompts = (modeText, systemPromptText, userPromptText) => {
       const setText = (selector, value) => {
         const node = document.querySelector(selector);
         if (node) node.textContent = String(value);
       };
       setText("#promptMode", modeText || "No LLM prompt captured yet.");
       setText("#promptSystem", systemPromptText || "No LLM prompt captured yet.");
       setText("#promptUser", userPromptText || "No LLM prompt captured yet.");
     };
     let missingSignals = [];
     let preserveConstraints = [];
     try { missingSignals = JSON.parse(String(assessment?.missing_signals_json || "[]")); } catch {}
     try { preserveConstraints = JSON.parse(String(assessment?.preserve_constraints_json || "[]")); } catch {}
     const originalTask = String(artifact?.prompt || "Generate MoonBit code for the requested task.");
     const buildQualityRepairPrompts = (llm) => {
       const systemPrompt = [
         "You are an AI coder.",
         "You only write MoonBit code.",
         "Your job is to improve MoonBit code for the user's task after compile already succeeded.",
         "Return only the full contents of cmd/main/main.mbt."
       ].join("\\n");
       const userPrompt = [
         `Original task: ${originalTask}`,
         "",
         "System assessment:",
         `- task_kind: ${String(assessment?.task_kind || "general-moonbit")}`,
         `- title: ${String(assessment?.title || "System assessment failed")}`,
         `- summary: ${String(assessment?.summary || "")}`,
         `- repair_hint: ${String(assessment?.repair_hint || "")}`,
         "",
         "Missing signals:",
         ...(Array.isArray(missingSignals) && missingSignals.length > 0 ? missingSignals.map((item) => `- ${String(item)}`) : ["- none listed; improve conservatively"]),
         "",
         "Constraints to preserve:",
         ...(Array.isArray(preserveConstraints) && preserveConstraints.length > 0 ? preserveConstraints.map((item) => `- ${String(item)}`) : ["- preserve the original task goal", "- keep wasm-gc compatibility"]),
         "",
         "Current source:",
         source,
         "",
         "Revise the source so it still compiles and better satisfies the system assessment.",
         "Return the full corrected cmd/main/main.mbt file and nothing else."
       ].join("\\n");
       return {
         modeText: "quality-repair / frontier-direct",
         systemPrompt,
         userPrompt
       };
     };
     const requestJson = async (llm) => {
       const promptPack = buildQualityRepairPrompts(llm);
       const systemPrompt = promptPack.systemPrompt;
       const userPrompt = promptPack.userPrompt;
       updatePrompts(promptPack.modeText, systemPrompt, userPrompt);
       if (llm.provider === "gemini") {
         const url = `${llm.baseUrl}/v1beta/models/${encodeURIComponent(llm.model)}:generateContent`;
         const json = await proxyPost(url, {
           "Content-Type": "application/json",
           "x-goog-api-key": String(llm.apiKey || "")
         }, JSON.stringify({
           system_instruction: { parts: [{ text: systemPrompt }] },
           contents: [{ role: "user", parts: [{ text: userPrompt }] }],
           generationConfig: { temperature: 0.1 }
         }));
         const text = (json?.candidates?.[0]?.content?.parts || []).map((part) => String(part?.text || "")).join("\\n").trim();
         if (!text) throw new Error("Gemini returned no revised MoonBit source.");
         return { source: text, raw: json };
       }
       const rawBaseUrl = String(llm.baseUrl || "").trim();
       const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
       let url = `${baseUrl}/chat/completions`;
       if (llm.provider === "zai") {
         if (baseUrl.endsWith("/chat/completions")) {
           url = baseUrl;
         } else if (baseUrl === "https://open.bigmodel.cn" || baseUrl === "https://open.bigmodel.cn/") {
           url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
         } else if (!baseUrl.includes("/api/paas/v4")) {
           url = `${baseUrl}/api/paas/v4/chat/completions`;
         }
       }
       const headers = {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${String(llm.apiKey || "")}`
       };
       if (llm.provider === "openrouter") {
         headers["HTTP-Referer"] = "http://127.0.0.1:3000";
         headers["X-Title"] = "MoonAP";
       }
       const json = await proxyPost(url, headers, JSON.stringify({
         model: llm.model,
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: userPrompt }
         ],
         temperature: 0.1
       }));
       const text = String(json?.choices?.[0]?.message?.content || "").trim();
       if (!text) throw new Error(`${llm.provider} returned no revised MoonBit source.`);
       return { source: text, raw: json };
     };
     let repaired = null;
     let selected = null;
     const failures = [];
     for (let index = 0; index < ordered.length; index += 1) {
       const item = ordered[index];
       const llm = {
         provider: item.key,
         model: item.model,
         baseUrl: item.baseUrl,
         apiKey: item.apiKey,
         rotated: providers.length > 1
       };
       try {
         repaired = await requestJson(llm);
         selected = llm;
         const nextCursor = (start + index + 1) % providers.length;
         localStorage.setItem("moonap.llm.router.v1", JSON.stringify({
           providers: Array.isArray(saved.providers) ? saved.providers : providers,
           cursor: nextCursor,
           savedAt: saved.savedAt || new Date().toISOString()
         }));
         break;
       } catch (error) {
         failures.push(`${String(item.key || "provider")}/${String(item.model || "model")}: ${error instanceof Error ? error.message : String(error)}`);
       }
     }
     if (!repaired || !selected) {
       throw new Error(`All enabled providers failed during quality repair. ${failures.join(" | ")}`);
     }
     const cleaned = browser_extract_moonbit_source(String(repaired.source || ""));
     const nextArtifact = {
       ...(artifact || {}),
       moonbit_source: cleaned,
       llm_provider: selected.provider || "unknown",
       llm_model: selected.model || "unknown",
       llm_rotated: Boolean(selected.rotated),
       repair_round: Number(artifact?.repair_round || 0) + 1,
       quality_assessment_used: {
         task_kind: String(assessment?.task_kind || ""),
         title: String(assessment?.title || ""),
         repair_hint: String(assessment?.repair_hint || ""),
         missing_signals_json: String(assessment?.missing_signals_json || "[]")
       },
       llm_response_preview: JSON.stringify(repaired.raw).slice(0, 1200),
       created_at: new Date().toISOString()
     };
     globalThis.__moonapLastArtifact = nextArtifact;
     onDone(JSON.stringify(nextArtifact, null, 2));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__next__benchmark__level = () => {
   try {
     const parsed = JSON.parse(globalThis.__moonapBenchmarkAssessment || "{}");
     const level = Number(parsed?.level || 0);
     const pass = Boolean(parsed?.pass);
     if (pass && level >= 1 && level < 3) return level + 1;
   } catch {}
   return 1;
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__last__artifact__repair__round = () => Number(globalThis.__moonapLastArtifact?.repair_round || 0);
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__compile__last__artifact = async (formalVerification, onDone, onError) => {
   try {
     const artifact = globalThis.__moonapLastArtifact;
     const source = String(artifact?.moonbit_source || "");
     if (!source.trim()) {
       throw new Error("No captured MoonBit source is available for compile probe.");
     }
     const url = formalVerification ? "/api/artifact/compile?formal=1" : "/api/artifact/compile";
     const response = await fetch(url, {
       method: "POST",
       headers: { "Content-Type": "text/plain; charset=utf-8" },
       body: source
     });
     const text = await response.text();
     if (!response.ok) throw new Error(text || `Compile probe failed (${response.status})`);
     onDone(String(text));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app65browser__should__adapt__last__artifact__for__large__file__runtime = () => {
   const artifact = globalThis.__moonapLastArtifact;
   if (!artifact || typeof artifact !== "object") return false;
   if (artifact.moonap_adaptation_used) return false;
   const source = String(artifact?.moonbit_source || "");
   if (!source.trim()) return false;
   const text = `${String(artifact?.prompt || "")}\n${source}`.toLowerCase();
   const wantsLarge = text.includes("large file") || text.includes("large-file") || text.includes("1gb") || text.includes("streamed") || text.includes("streaming") || text.includes("chunk");
   const wantsGeneration = text.includes("generate") || text.includes("generator") || text.includes("output") || text.includes("write") || text.includes("writing") || text.includes("save");
   const wantsAnalysis = text.includes("analy") || text.includes("count") || text.includes("scan") || text.includes("parse") || text.includes("report");
   return wantsLarge && (wantsGeneration || wantsAnalysis);
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app57browser__adapt__last__artifact__for__large__file__runtime = async (onDone, onError) => {
   try {
     const artifact = globalThis.__moonapLastArtifact;
     const source = String(artifact?.moonbit_source || "");
     if (!source.trim()) throw new Error("No compiled MoonBit source is available for MoonAP runtime adaptation.");
     if (artifact?.moonap_adaptation_used) throw new Error("MoonAP runtime adaptation has already been applied.");
     const prompt = String(artifact?.prompt || "");
     const lower = `${prompt}\n${source}`.toLowerCase();
     const wantsGeneration = lower.includes("generate") || lower.includes("generator") || lower.includes("output") || lower.includes("write") || lower.includes("writing") || lower.includes("save");
     const adapterKind = wantsGeneration ? "large-file-generation" : "large-file-analysis";
     const saved = (() => {
       try {
         const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
         return parsed && typeof parsed === "object" ? parsed : {};
       } catch {
         return {};
       }
     })();
     const providers = Array.isArray(saved.providers)
       ? saved.providers.filter((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed")
       : [];
     if (providers.length === 0) throw new Error("No enabled LLM provider is available for MoonAP runtime adaptation.");
     const cursor = Number.isFinite(saved.cursor) ? saved.cursor : 0;
     const start = ((cursor % providers.length) + providers.length) % providers.length;
     const ordered = providers.slice(start).concat(providers.slice(0, start));
     const setText = (selector, value) => {
       const node = document.querySelector(selector);
       if (node) node.textContent = String(value || "");
     };
     const extractSource = typeof globalThis.__moonapExtractMoonBitSource === "function"
       ? globalThis.__moonapExtractMoonBitSource
       : (value) => String(value || "");
     const systemPrompt = [
       "You are an AI coder.",
       "You only write MoonBit code.",
       "Adapt already-compiling MoonBit business code to the MoonAP large-file runtime contract.",
       "Return only the full contents of cmd/main/main.mbt."
     ].join("\n");
     const generationContract = [
       "Required adapter functions:",
       "- fn moonap_runtime_spec() -> String",
       "- fn moonap_preview(params_json : String) -> String",
       "- fn moonap_generate_chunk(params_json : String, start_index : Int, max_bytes : Int) -> String",
       "",
       "moonap_runtime_spec() returns JSON text with profile_id=large-file-generation.",
       "Use platform fields output_name, target_size_mb, chunk_size_bytes.",
       "Add app fields useful for the business logic, such as read_length, header_prefix, line_template, random_seed, n_rate, or quality_char.",
       "moonap_generate_chunk should return a chunk of generated text using start_index as the record or line index."
     ].join("\n");
     const analysisContract = [
       "Required adapter functions:",
       "- fn moonap_runtime_spec() -> String",
       "- fn moonap_init(params_json : String) -> String",
       "- fn moonap_analyze_chunk(state_json : String, chunk_text : String) -> String",
       "- fn moonap_finish(state_json : String) -> String",
       "",
       "moonap_runtime_spec() returns JSON text with profile_id=large-file-analysis.",
       "Use platform fields input_file, chunk_size_bytes, max_preview_lines.",
       "Add app fields useful for the business logic, such as search_text, min_quality, target_base, or count options."
     ].join("\n");
     const userPrompt = [
       "Original user task:",
       prompt,
       "",
       "MoonAP adaptation target:",
       adapterKind,
       "",
       "Keep existing business functions. Do not rewrite from scratch. Do not use imports. Keep the adapted file compilable.",
       adapterKind === "large-file-generation" ? generationContract : analysisContract,
       "",
       "Already compiling MoonBit source:",
       "```moonbit",
       source,
       "```"
     ].join("\n");
     setText("#promptMode", "moonap-adaptation / frontier-direct");
     setText("#promptSystem", systemPrompt);
     setText("#promptUser", userPrompt);
     const proxyPost = async (url, headers, body) => {
       const envelope = [
         `URL\t${String(url)}`,
         ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
         "BODY",
         String(body)
       ].join("\n");
       const response = await fetch("/api/llm/proxy", {
         method: "POST",
         headers: { "Content-Type": "text/plain; charset=utf-8" },
         body: envelope
       });
       const text = await response.text();
       let json = {};
       try {
         json = JSON.parse(text);
       } catch {
         throw new Error(`Provider returned non-JSON (${response.status}): ${String(text || "").slice(0, 240)}`);
       }
       if (!response.ok) throw new Error(`Provider/proxy error (${response.status}): ${JSON.stringify(json).slice(0, 500)}`);
       return json;
     };
     const requestJson = async (item) => {
       if (String(item.key || "") === "gemini") throw new Error("Gemini adaptation path is not enabled in the minimal implementation yet.");
       const rawBaseUrl = String(item.baseUrl || "").trim();
       const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
       let url = `${baseUrl}/chat/completions`;
       if (String(item.key || "") === "zai") {
         if (baseUrl.endsWith("/chat/completions")) {
           url = baseUrl;
         } else if (baseUrl === "https://open.bigmodel.cn" || baseUrl === "https://open.bigmodel.cn/") {
           url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
         } else if (!baseUrl.includes("/api/paas/v4")) {
           url = `${baseUrl}/api/paas/v4/chat/completions`;
         }
       }
       const headers = {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${String(item.apiKey || "")}`
       };
       if (String(item.key || "") === "openrouter") {
         headers["HTTP-Referer"] = "http://127.0.0.1:3000";
         headers["X-Title"] = "MoonAP";
       }
       return await proxyPost(url, headers, JSON.stringify({
         model: item.model,
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: userPrompt }
         ],
         temperature: 0.1
       }));
     };
     let adapted = null;
     let selected = null;
     const failures = [];
     for (let index = 0; index < ordered.length; index += 1) {
       const item = ordered[index];
       try {
         const json = await requestJson(item);
         const text = String(json?.choices?.[0]?.message?.content || "").trim();
         if (!text) throw new Error(`${String(item.key || "provider")} returned no adapted MoonBit source.`);
         adapted = { source: text, raw: json };
         selected = item;
         const nextCursor = (start + index + 1) % providers.length;
         localStorage.setItem("moonap.llm.router.v1", JSON.stringify({
           providers: Array.isArray(saved.providers) ? saved.providers : providers,
           cursor: nextCursor,
           savedAt: saved.savedAt || new Date().toISOString()
         }));
         break;
       } catch (error) {
         failures.push(`${String(item.key || "provider")}/${String(item.model || "model")}: ${error instanceof Error ? error.message : String(error)}`);
       }
     }
     if (!adapted || !selected) throw new Error(`All enabled providers failed during MoonAP runtime adaptation. ${failures.join(" | ")}`);
     const cleaned = extractSource(String(adapted.source || ""));
     const nextArtifact = {
       ...(artifact || {}),
       moonbit_source: cleaned,
       llm_provider: String(selected.key || "unknown"),
       llm_model: String(selected.model || "unknown"),
       moonap_adaptation_used: {
         adapter_kind: adapterKind,
         provider: String(selected.key || "unknown"),
         model: String(selected.model || "unknown")
       },
       llm_response_preview: JSON.stringify(adapted.raw).slice(0, 1200),
       created_at: new Date().toISOString()
     };
     globalThis.__moonapLastArtifact = nextArtifact;
     onDone(JSON.stringify(nextArtifact, null, 2));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app55browser__repair__last__artifact__with__compile__summary = async (formalVerification, knowledgePack, onDone, onError) => {
   try {
     const artifact = globalThis.__moonapLastArtifact;
     const report = globalThis.__moonapLastCompileReport;
     const source = String(artifact?.moonbit_source || "");
     if (!source.trim()) throw new Error("No captured MoonBit source is available for repair.");
     if (!report || typeof report !== "object") throw new Error("No compile summary is available yet.");
     const readRouter = () => {
       try {
         const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
         return parsed && typeof parsed === "object" ? parsed : {};
       } catch {
         return {};
       }
     };
     const saved = readRouter();
     const providers = Array.isArray(saved.providers) ? saved.providers.filter((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed") : [];
     const repairMode = localStorage.getItem("moonap.repairFeedbackMode") === "summary" ? "summary" : "raw";
     if (providers.length === 0) throw new Error("No enabled LLM provider is available in the router.");
     const cursor = Number.isFinite(saved.cursor) ? saved.cursor : 0;
     const start = ((cursor % providers.length) + providers.length) % providers.length;
     const ordered = providers.slice(start).concat(providers.slice(0, start));
     const proxyPost = async (url, headers, body) => {
       const envelope = [
         `URL\t${String(url)}`,
         ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
         "BODY",
         String(body)
       ].join("\n");
       const response = await fetch("/api/llm/proxy", {
         method: "POST",
         headers: { "Content-Type": "text/plain; charset=utf-8" },
         body: envelope
       });
       const text = await response.text();
       let json = {};
       try {
         json = JSON.parse(text);
       } catch {
         const plain = String(text || "")
           .replace(/<script[\s\S]*?<\/script>/gi, " ")
           .replace(/<style[\s\S]*?<\/style>/gi, " ")
           .replace(/<[^>]+>/g, " ")
           .replace(/\s+/g, " ")
           .trim();
         const summarized = plain || `MoonAP proxy returned non-JSON (${response.status})`;
         throw new Error(`Provider returned non-JSON (${response.status}): ${summarized.slice(0, 240)}`);
       }
       if (!response.ok) {
         const detail = json?.error?.detail ? ` ${String(json.error.detail)}` : "";
         throw new Error((json?.error?.message || `LLM request failed (${response.status})`) + detail);
       }
       return json;
     };
     const updatePrompts = (modeText, systemPromptText, userPromptText) => {
       const setText = (selector, value) => {
         const node = document.querySelector(selector);
         if (node) node.textContent = String(value);
       };
       setText("#promptMode", modeText || "No LLM prompt captured yet.");
       setText("#promptSystem", systemPromptText || "No LLM prompt captured yet.");
       setText("#promptUser", userPromptText || "No LLM prompt captured yet.");
     };
     const originalTask = String(artifact?.prompt || "Generate a Personal FastQ Generator in MoonBit.");
     const compilerExcerpt = String(repairMode === "raw" ? (report.output || report.trimmed_output || "") : (report.trimmed_output || report.output || "")).trim();
     const priorConversation = Array.isArray(artifact?.conversation_history)
       ? artifact.conversation_history
           .filter((item) => item && (item.role === "user" || item.role === "assistant") && String(item.content || "").trim() !== "")
           .map((item) => ({ role: String(item.role), content: String(item.content) }))
       : [{ role: "user", content: originalTask }, { role: "assistant", content: source }];
     const buildRepairPrompts = (llm) => {
       const systemPrompt = [
         "You are an AI coder.",
         "You only write MoonBit code.",
         "Your job is to repair MoonBit code for the user's task.",
         "Return only the full contents of cmd/main/main.mbt."
       ].join("\\n");
       const repairUserPrompt = [
         "The previous MoonBit file failed to compile under wasm-gc.",
         "",
         "Compiler error:",
         compilerExcerpt,
         "",
         "Fix the file and return the full corrected cmd/main/main.mbt only."
       ].join("\\n");
       return {
         modeText: "repair / frontier-conversation",
         systemPrompt,
         userPrompt: `${priorConversation.map((item) => `${String(item.role).toUpperCase()}:\n${String(item.content)}`).join("\\n\\n---\\n\\n")}\\n\\n---\\n\\nUSER:\\n${repairUserPrompt}`,
         openaiMessages: [
           { role: "system", content: systemPrompt },
           ...priorConversation,
           { role: "user", content: repairUserPrompt }
         ],
         geminiUserPrompt: `${priorConversation.map((item) => `${String(item.role).toUpperCase()}:\n${String(item.content)}`).join("\\n\\n---\\n\\n")}\\n\\n---\\n\\nUSER:\\n${repairUserPrompt}`
       };
     };
     const requestJson = async (llm) => {
       const promptPack = buildRepairPrompts(llm);
       updatePrompts(promptPack.modeText, promptPack.systemPrompt, promptPack.userPrompt);
       if (llm.provider === "gemini") {
         const url = `${llm.baseUrl}/v1beta/models/${encodeURIComponent(llm.model)}:generateContent`;
         const json = await proxyPost(url, {
           "Content-Type": "application/json",
           "x-goog-api-key": String(llm.apiKey || "")
         }, JSON.stringify({
           system_instruction: { parts: [{ text: promptPack.systemPrompt }] },
           contents: [{ role: "user", parts: [{ text: promptPack.geminiUserPrompt }] }],
           generationConfig: { temperature: 0.1 }
         }));
         const text = (json?.candidates?.[0]?.content?.parts || []).map((part) => String(part?.text || "")).join("\\n").trim();
         if (!text) throw new Error("Gemini returned no repaired MoonBit source.");
         return { source: text, raw: json };
       }
       const rawBaseUrl = String(llm.baseUrl || "").trim();
       const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
       let url = `${baseUrl}/chat/completions`;
       if (llm.provider === "zai") {
         if (baseUrl.endsWith("/chat/completions")) {
           url = baseUrl;
         } else if (baseUrl === "https://open.bigmodel.cn" || baseUrl === "https://open.bigmodel.cn/") {
           url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
         } else if (!baseUrl.includes("/api/paas/v4")) {
           url = `${baseUrl}/api/paas/v4/chat/completions`;
         }
       }
       const headers = {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${String(llm.apiKey || "")}`
       };
       if (llm.provider === "openrouter") {
         headers["HTTP-Referer"] = "http://127.0.0.1:3000";
         headers["X-Title"] = "MoonAP";
       }
       const json = await proxyPost(url, headers, JSON.stringify({
         model: llm.model,
         messages: promptPack.openaiMessages,
         temperature: 0.1
       }));
       const text = String(json?.choices?.[0]?.message?.content || "").trim();
       if (!text) throw new Error(`${llm.provider} returned no repaired MoonBit source.`);
       return { source: text, raw: json };
     };
     let repaired = null;
     let selected = null;
     const failures = [];
     for (let index = 0; index < ordered.length; index += 1) {
       const item = ordered[index];
       const llm = {
         provider: item.key,
         model: item.model,
         baseUrl: item.baseUrl,
         apiKey: item.apiKey,
         rotated: providers.length > 1
       };
       try {
         repaired = await requestJson(llm);
         selected = llm;
         const nextCursor = (start + index + 1) % providers.length;
         localStorage.setItem("moonap.llm.router.v1", JSON.stringify({
           providers: Array.isArray(saved.providers) ? saved.providers : providers,
           cursor: nextCursor,
           savedAt: saved.savedAt || new Date().toISOString()
         }));
         break;
       } catch (error) {
         failures.push(`${String(item.key || "provider")}/${String(item.model || "model")}: ${error instanceof Error ? error.message : String(error)}`);
       }
     }
     if (!repaired || !selected) {
       throw new Error(`All enabled providers failed during repair. ${failures.join(" | ")}`);
     }
     const ensureExtractMoonBitSource = () => {
       if (typeof globalThis.__moonapExtractMoonBitSource === "function") return globalThis.__moonapExtractMoonBitSource;
       globalThis.__moonapExtractMoonBitSource = (value) => {
         const text = String(value || "").trim();
         if (!text) return "";
         const extract = (source, startMarker, endMarker) => {
           const start = source.indexOf(startMarker);
           if (start < 0) return "";
           const after = source.slice(start + startMarker.length).trim();
           if (!after) return "";
           const end = after.indexOf(endMarker);
           if (end < 0) return "";
           return after.slice(0, end).trim();
         };
         const patterns = [
           ["FILE: cmd/main/main.mbt", "END_FILE"],
           ['<moonbit-file path="cmd/main/main.mbt">', "</moonbit-file>"],
           ["```moonbit", "```"],
           ["```mbt", "```"],
           ["```", "```"]
         ];
         for (const [startMarker, endMarker] of patterns) {
           const extracted = extract(text, startMarker, endMarker);
           if (extracted) return extracted;
         }
         return text;
       };
       return globalThis.__moonapExtractMoonBitSource;
     };
     const cleaned = ensureExtractMoonBitSource()(String(repaired.source || ""));
     const nextArtifact = {
       ...(artifact || {}),
       moonbit_source: cleaned,
       conversation_history: [
         ...priorConversation,
         { role: "user", content: `Compiler error:\n${compilerExcerpt}` },
         { role: "assistant", content: cleaned }
       ],
       llm_provider: selected.provider || "unknown",
       llm_model: selected.model || "unknown",
       llm_rotated: Boolean(selected.rotated),
       repair_round: Number(artifact?.repair_round || 0) + 1,
       compile_summary_used: {
         summary_kind: String(report.summary_kind || ""),
         primary_file: String(report.primary_file || ""),
         primary_line: Number(report.primary_line || 0),
         repair_hint: String(report.repair_hint || "")
       },
       llm_response_preview: JSON.stringify(repaired.raw).slice(0, 1200),
       created_at: new Date().toISOString()
     };
     globalThis.__moonapLastArtifact = nextArtifact;
     globalThis.__moonapLastCompileReport = null;
     onDone(JSON.stringify(nextArtifact, null, 2));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process = (provider, stage, result, logText, sourceText) => {
   const setText = (selector, value) => {
     const node = document.querySelector(selector);
     if (node) node.textContent = String(value);
   };
   setText("#processProvider", provider || "-");
   setText("#processStage", stage || "-");
   setText("#processResult", result || "waiting");
   setText("#processStatus", result || "waiting");
   setText("#processLog", logText || "");
   if (sourceText !== "") setText("#processSource", sourceText || "No generated source yet.");
   const payload = JSON.stringify({
     ts: new Date().toISOString(),
     provider: String(provider || "-"),
     stage: String(stage || "-"),
     result: String(result || "waiting"),
     log_text: String(logText || ""),
     source_text: String(sourceText || "").slice(0, 2000)
   }) + "\n";
   fetch("/api/logs/moonap-runtime.log", {
     method: "POST",
     headers: { "Content-Type": "text/plain; charset=utf-8" },
     body: payload,
     keepalive: true
   }).catch(() => {});
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__update__result__panel = (raw) => {
   let data = {};
   try { data = JSON.parse(String(raw)); } catch { data = { status: "error" }; }
   const panel = document.querySelector("#resultPanel");
   if (globalThis.__moonapMinimalShell !== false) {
     if (panel) panel.style.display = "none";
     globalThis.__moonapLastVisibleResult = data;
     return;
   }
   panel?.classList.add("is-open");
   const setText = (selector, value) => {
     const node = document.querySelector(selector);
     if (node) node.textContent = String(value);
   };
   const bytes = (value) => {
     const n = Number(value || 0);
     if (n >= 1073741824) return `${(n / 1073741824).toFixed(2)} GB`;
     if (n >= 1048576) return `${(n / 1048576).toFixed(2)} MB`;
     if (n >= 1024) return `${(n / 1024).toFixed(1)} KB`;
     return `${n} B`;
   };
   const pct = Math.max(0, Math.min(100, Number(data.progress_percent ?? (data.status === "done" ? 100 : 0))));
   const fill = document.querySelector("#progressFill");
   if (fill) fill.style.width = `${pct}%`;
   setText("#resultStatus", data.status || "ready");
   const isRuntime = String(data.status || "").startsWith("runtime") || String(data.status || "").includes("ready-for-runtime");
   const resultKind = String(data.result_kind || "");
   setText("#resultTitle", isRuntime
     ? (data.status === "ready-for-runtime" ? "MoonAP runtime request is ready" : "MoonAP runtime result")
     : resultKind === "streamed-file"
       ? "Browser-local large-file generation"
       : resultKind === "large-file-report"
         ? "Browser-local large-file analysis"
         : (data.status === "generated" ? "Synthetic FastQ generated locally" : "Browser-local FastQ analysis"));
   setText("#metricFile", data.file_name || data.download_name || "-");
   setText("#metricProcessed", bytes(data.bytes_processed ?? data.file_size_bytes ?? 0));
   setText("#metricReads", data.reads_seen ?? data.read_count ?? "0");
   setText("#metricTarget", data.target_base_count ?? data.expected_n_count ?? "0");
   setText("#metricBases", data.total_bases ?? data.summary ?? "0");
   setText("#metricUploaded", bytes(data.uploaded_bytes ?? 0));
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__watch__runtime__protocol = (onRequest, onResult, onSaveDecision) => {
   const poll = async () => {
     try {
       const requestText = await fetch("/api/runtime-exec/latest-request").then((response) => response.text());
       if (requestText && requestText !== globalThis.__moonapLastRuntimeRequestText) {
         let requestJson = {};
         try { requestJson = JSON.parse(requestText); } catch {}
         const ignoredId = String(localStorage.getItem("moonap.ignoreRuntimeRequestId") || "");
         const requestId = String(requestJson?.request_id || "");
         if (ignoredId && requestId === ignoredId) return;
         if (ignoredId && requestId && requestId !== ignoredId) localStorage.removeItem("moonap.ignoreRuntimeRequestId");
         globalThis.__moonapLastRuntimeRequestText = requestText;
         globalThis.__moonapLastRuntimeRequest = requestJson;
         onRequest(String(requestText));
       }
     } catch {}
     try {
       const resultText = await fetch("/api/runtime-exec/latest-result").then((response) => response.text());
       if (resultText && resultText !== globalThis.__moonapLastRuntimeResultText) {
         let resultJson = {};
         try { resultJson = JSON.parse(resultText); } catch {}
         const ignoredId = String(localStorage.getItem("moonap.ignoreRuntimeRequestId") || "");
         const requestId = String(resultJson?.request_id || "");
         if (ignoredId && requestId === ignoredId) return;
         if (ignoredId && requestId && requestId !== ignoredId) localStorage.removeItem("moonap.ignoreRuntimeRequestId");
         globalThis.__moonapLastRuntimeResultText = resultText;
         globalThis.__moonapLastRuntimeResult = resultJson;
         onResult(String(resultText));
       }
     } catch {}
     try {
       const decisionText = await fetch("/api/skill-export/save-decision").then((response) => response.text());
       if (decisionText && decisionText !== globalThis.__moonapLastSkillSaveDecisionText) {
         globalThis.__moonapLastSkillSaveDecisionText = decisionText;
         try { globalThis.__moonapLastSkillSaveDecision = JSON.parse(decisionText); } catch {}
         onSaveDecision(String(decisionText));
       }
     } catch {}
   };
   if (!globalThis.__moonapRuntimeWatcherStarted) {
     globalThis.__moonapRuntimeWatcherStarted = true;
     poll();
     setInterval(poll, 2000);
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__ensure__virtual__path__runtime = () => {
   if (globalThis.__moonapVirtualPathRuntime) return;
   // This normalizes MoonAP virtual archive paths, not host OS paths.
   const normalize = (value) => String(value == null ? "" : value)
     .trim()
     .replace(/\\/g, "/")
     .replace(/^\/+/, "")
     .replace(/\/+/g, "/")
     .replace(/\/$/, "");
   const split = (value) => normalize(value).split("/").filter(Boolean);
   const lastSegment = (value) => {
     const parts = split(value);
     return parts.length === 0 ? "" : String(parts[parts.length - 1] || "");
   };
   globalThis.__moonapVirtualPathRuntime = { normalize, split, lastSegment };
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__ensure__file__name__runtime = () => {
   if (globalThis.__moonapFileNameRuntime) return;
   const coerceFallback = (fallback) => String(fallback || "moonap-output.fastq");
   const sanitize = (value, fallback = "moonap-output.fastq") => {
     const base = String(value == null ? "" : value).trim() || coerceFallback(fallback);
     const cleaned = base
       .replace(/[\u0000-\u001f]/g, "_")
       .replace(/[\\/:*?"<>|]+/g, "_")
       .replace(/\s+/g, " ")
       .trim()
       .replace(/[. ]+$/g, "");
     return cleaned || coerceFallback(fallback);
   };
   const sanitizeToken = (value, fallback = "moonap_read") => {
     const cleaned = String(value == null ? "" : value)
       .trim()
       .replace(/[^A-Za-z0-9_.:-]+/g, "_")
       .replace(/^_+|_+$/g, "");
     return cleaned || String(fallback || "moonap_read");
   };
   globalThis.__moonapFileNameRuntime = { sanitize, sanitizeToken };
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__ensure__skill__zip__runtime = () => {
   if (globalThis.__moonapSkillZipRuntime) return;
   const pathRuntime = globalThis.__moonapVirtualPathRuntime;
   if (!pathRuntime || typeof pathRuntime.normalize !== "function") {
     throw new Error("MoonAP virtual path runtime is not ready yet.");
   }
   const encoder = new TextEncoder();
   const decoder = new TextDecoder();
   const crcTable = new Uint32Array(256);
   for (let n = 0; n < 256; n += 1) {
     let c = n;
     for (let k = 0; k < 8; k += 1) {
       c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
     }
     crcTable[n] = c >>> 0;
   }
   const crc32 = (bytes) => {
     let crc = 0xFFFFFFFF;
     for (let i = 0; i < bytes.length; i += 1) {
       crc = crcTable[(crc ^ bytes[i]) & 0xFF] ^ (crc >>> 8);
     }
     return (crc ^ 0xFFFFFFFF) >>> 0;
   };
   const toUint8 = (value) => {
     if (value instanceof Uint8Array) return value;
     if (value instanceof ArrayBuffer) return new Uint8Array(value);
     if (ArrayBuffer.isView(value)) return new Uint8Array(value.buffer.slice(value.byteOffset, value.byteOffset + value.byteLength));
     return encoder.encode(String(value == null ? "" : value));
   };
   const concatUint8 = (chunks) => {
     const total = chunks.reduce((sum, chunk) => sum + chunk.length, 0);
     const merged = new Uint8Array(total);
     let offset = 0;
     for (const chunk of chunks) {
       merged.set(chunk, offset);
       offset += chunk.length;
     }
     return merged;
   };
   const zipName = (path, isDir) => {
     const clean = pathRuntime.normalize(path || "");
     return isDir ? (clean.endsWith("/") ? clean : `${clean}/`) : clean.replace(/\/+$/, "");
   };
   const getDosDateTime = (value) => {
     const date = value instanceof Date ? value : new Date();
     const year = Math.min(127, Math.max(0, date.getFullYear() - 1980));
     const month = date.getMonth() + 1;
     const day = date.getDate();
     const hour = date.getHours();
     const minute = date.getMinutes();
     const second = Math.floor(date.getSeconds() / 2);
     return {
       time: ((hour & 0x1F) << 11) | ((minute & 0x3F) << 5) | (second & 0x1F),
       date: ((year & 0x7F) << 9) | ((month & 0x0F) << 5) | (day & 0x1F)
     };
   };
   const makeZip = async (entries) => {
     const normalized = Array.isArray(entries) ? entries : [];
     const localChunks = [];
     const centralChunks = [];
     let offset = 0;
     let count = 0;
     for (const entry of normalized) {
       const isDir = Boolean(entry?.directory);
       const name = zipName(entry?.path || "", isDir);
       if (!name) continue;
       const nameBytes = encoder.encode(name);
       const bytes = isDir ? new Uint8Array(0) : toUint8(entry?.bytes ?? entry?.text ?? "");
       const crc = isDir ? 0 : crc32(bytes);
       const { time, date } = getDosDateTime(entry?.date);
       const local = new Uint8Array(30 + nameBytes.length);
       const localView = new DataView(local.buffer);
       localView.setUint32(0, 0x04034b50, true);
       localView.setUint16(4, 20, true);
       localView.setUint16(6, 0x0800, true);
       localView.setUint16(8, 0, true);
       localView.setUint16(10, time, true);
       localView.setUint16(12, date, true);
       localView.setUint32(14, crc, true);
       localView.setUint32(18, bytes.length, true);
       localView.setUint32(22, bytes.length, true);
       localView.setUint16(26, nameBytes.length, true);
       localView.setUint16(28, 0, true);
       local.set(nameBytes, 30);
       localChunks.push(local);
       if (bytes.length > 0) localChunks.push(bytes);
       const central = new Uint8Array(46 + nameBytes.length);
       const centralView = new DataView(central.buffer);
       centralView.setUint32(0, 0x02014b50, true);
       centralView.setUint16(4, 20, true);
       centralView.setUint16(6, 20, true);
       centralView.setUint16(8, 0x0800, true);
       centralView.setUint16(10, 0, true);
       centralView.setUint16(12, time, true);
       centralView.setUint16(14, date, true);
       centralView.setUint32(16, crc, true);
       centralView.setUint32(20, bytes.length, true);
       centralView.setUint32(24, bytes.length, true);
       centralView.setUint16(28, nameBytes.length, true);
       centralView.setUint16(30, 0, true);
       centralView.setUint16(32, 0, true);
       centralView.setUint16(34, 0, true);
       centralView.setUint16(36, 0, true);
       centralView.setUint32(38, isDir ? 0x10 : 0, true);
       centralView.setUint32(42, offset, true);
       central.set(nameBytes, 46);
       centralChunks.push(central);
       offset += local.length + bytes.length;
       count += 1;
     }
     const centralSize = centralChunks.reduce((sum, chunk) => sum + chunk.length, 0);
     const end = new Uint8Array(22);
     const endView = new DataView(end.buffer);
     endView.setUint32(0, 0x06054b50, true);
     endView.setUint16(8, count, true);
     endView.setUint16(10, count, true);
     endView.setUint32(12, centralSize, true);
     endView.setUint32(16, offset, true);
     return concatUint8([...localChunks, ...centralChunks, end]);
   };
   const findEndRecord = (bytes) => {
     for (let i = bytes.length - 22; i >= 0; i -= 1) {
       if (bytes[i] === 0x50 && bytes[i + 1] === 0x4b && bytes[i + 2] === 0x05 && bytes[i + 3] === 0x06) {
         return i;
       }
     }
     return -1;
   };
   const inflateRaw = async (bytes) => {
     if (typeof DecompressionStream !== "function") {
       throw new Error("This browser cannot extract compressed ZIP files yet.");
     }
     const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("deflate-raw"));
     return new Uint8Array(await new Response(stream).arrayBuffer());
   };
   const unzip = async (bytesLike) => {
     const bytes = toUint8(bytesLike);
     const endOffset = findEndRecord(bytes);
     if (endOffset < 0) throw new Error("ZIP end-of-directory record not found.");
     const endView = new DataView(bytes.buffer, bytes.byteOffset + endOffset, 22);
     const totalEntries = endView.getUint16(10, true);
     const centralOffset = endView.getUint32(16, true);
     const results = [];
     let cursor = centralOffset;
     for (let index = 0; index < totalEntries; index += 1) {
       const centralView = new DataView(bytes.buffer, bytes.byteOffset + cursor, 46);
       if (centralView.getUint32(0, true) !== 0x02014b50) {
         throw new Error("ZIP central directory entry is invalid.");
       }
       const method = centralView.getUint16(10, true);
       const compressedSize = centralView.getUint32(20, true);
       const nameLength = centralView.getUint16(28, true);
       const extraLength = centralView.getUint16(30, true);
       const commentLength = centralView.getUint16(32, true);
       const localOffset = centralView.getUint32(42, true);
       const nameBytes = bytes.subarray(cursor + 46, cursor + 46 + nameLength);
       const rawPath = decoder.decode(nameBytes);
       const directory = /[\\/]$/.test(rawPath);
       const path = pathRuntime.normalize(rawPath);
       const localView = new DataView(bytes.buffer, bytes.byteOffset + localOffset, 30);
       if (localView.getUint32(0, true) !== 0x04034b50) {
         throw new Error(`ZIP local file header is invalid for ${path}.`);
       }
       const localNameLength = localView.getUint16(26, true);
       const localExtraLength = localView.getUint16(28, true);
       const dataStart = localOffset + 30 + localNameLength + localExtraLength;
       const compressedBytes = bytes.subarray(dataStart, dataStart + compressedSize);
       let data = new Uint8Array(0);
       if (!directory) {
         if (method === 0) {
           data = new Uint8Array(compressedBytes);
         } else if (method === 8) {
           data = await inflateRaw(compressedBytes);
         } else {
           throw new Error(`ZIP compression method ${method} is not supported for ${path}.`);
         }
       }
       if (!path) {
         cursor += 46 + nameLength + extraLength + commentLength;
         continue;
       }
       results.push({ path, directory, bytes: data });
       cursor += 46 + nameLength + extraLength + commentLength;
     }
     return results;
   };
   globalThis.__moonapSkillZipRuntime = { makeZip, unzip };
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__request__skill__save = async (onDone, onError) => {
   try {
     const runtimeResult = globalThis.__moonapLastRuntimeResult;
     const runtimeRequest = globalThis.__moonapLastRuntimeRequest;
     const artifact = globalThis.__moonapLastArtifact;
     if (!runtimeResult || typeof runtimeResult !== "object") {
       throw new Error("No runtime result is available yet.");
     }
     if (!runtimeRequest || typeof runtimeRequest !== "object") {
       throw new Error("No runtime request is available yet.");
     }
     if (!artifact || typeof artifact !== "object") {
       throw new Error("No generated MoonBit artifact is available yet.");
     }
     const requestId = String(runtimeResult.request_id || "");
     const status = String(runtimeResult.status || "");
     if (!requestId || !status.includes("succeeded")) {
       throw new Error("MoonAP requires a successful runtime result before saving as a SKILL.");
     }
     const rootHandle = globalThis.__moonapSkillExportRootHandle;
     if (!rootHandle || typeof rootHandle.getDirectoryHandle !== "function") {
       throw new Error("Choose a save location before exporting this SKILL.");
     }
     const taskKind = String(runtimeRequest.task_kind || "generic");
     const inferredTaskKind = String(runtimeRequest.inferred_task_kind || "");
     const runtimeProfileId = String(runtimeRequest.runtime_profile_override_id || runtimeRequest.runtime_profile_id || "");
     const runtimeProfileLabel = String(runtimeRequest.runtime_profile_label || runtimeProfileId || "");
     const runtimeMode = String(runtimeRequest.runtime_mode || "form");
     const resultMode = String(runtimeRequest.result_mode || "text");
     const runtimeSpec = runtimeRequest?.runtime_spec && typeof runtimeRequest.runtime_spec === "object"
       ? runtimeRequest.runtime_spec
       : (runtimeRequest?.runtime_ui && typeof runtimeRequest.runtime_ui === "object" ? runtimeRequest.runtime_ui : {});
     const fields = Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : [];
     const descriptionMap = {
       "fastq-generator": "Generate a synthetic FastQ file for testing, demos, or pipeline validation.",
       "fastq-analysis": "Analyze a FastQ file and report summary metrics.",
       "large-fastq-analysis": "Analyze a large FastQ file with chunked browser-local streaming and report read/base metrics.",
       "large-file-analysis": "Analyze a large browser-local file with chunked local streaming and report summary metrics.",
       "large-file-generation": "Generate a large browser-local file with chunked streaming output instead of buffering the whole artifact in memory.",
       "excel-generator": "Generate a synthetic financial spreadsheet file.",
       "finance-report-analysis": "Analyze a financial report file and produce a browser-local report.",
       "browser-game": "Run a browser-local interactive game skill."
     };
     const enteredName = String(globalThis.__moonapSkillExportName || "").trim();
     if (!enteredName) {
       throw new Error("Enter a SKILL name before exporting.");
     }
     if (/[\\/:*?"<>|]/.test(enteredName)) {
       throw new Error("SKILL name contains characters that cannot be used in a folder name on this computer.");
     }
     if (enteredName.endsWith(".") || enteredName.endsWith(" ")) {
       throw new Error("SKILL name cannot end with a dot or space.");
     }
     const folderName = enteredName;
     const defaultDescription = String(descriptionMap[taskKind] || `Run a reusable APP for ${taskKind}.`);
     const description = String(globalThis.__moonapSkillExportDescription || "").trim() || defaultDescription;
     const sourceText = String(artifact?.moonbit_source || "");
     const wasmUrl = String(runtimeRequest?.wasm_url || "");
     if (!wasmUrl) {
       throw new Error("MoonAP runtime request does not include a wasm_url.");
     }
     const fetchBinary = async (path) => {
       const response = await fetch(path);
       if (!response.ok) throw new Error(`Failed to fetch ${path} (${response.status})`);
       return new Uint8Array(await response.arrayBuffer());
     };
     const zipRuntime = globalThis.__moonapSkillZipRuntime;
     if (!zipRuntime || typeof zipRuntime.makeZip !== "function") {
       throw new Error("MoonAP ZIP runtime is not ready yet.");
     }
     const wasmBytes = await fetchBinary(wasmUrl);
     const writeText = async (dirHandle, fileName, text) => {
       const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
       const writable = await fileHandle.createWritable();
       await writable.write(String(text || ""));
       await writable.close();
     };
     const writeBinary = async (dirHandle, fileName, bytes) => {
       const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
       const writable = await fileHandle.createWritable();
       await writable.write(bytes);
       await writable.close();
     };
     const ensurePersonalSkillRuntime = () => {
       if (globalThis.__moonapPersonalSkillRuntime) return globalThis.__moonapPersonalSkillRuntime;
       const DB_NAME = "moonap.personal.skill.handles.v1";
       const STORE_NAME = "handles";
       const openDb = () => new Promise((resolve, reject) => {
         const request = indexedDB.open(DB_NAME, 1);
         request.onupgradeneeded = () => {
           const db = request.result;
           if (!db.objectStoreNames.contains(STORE_NAME)) {
             db.createObjectStore(STORE_NAME);
           }
         };
         request.onsuccess = () => resolve(request.result);
         request.onerror = () => reject(request.error || new Error("Failed to open Personal SKILL database."));
       });
       const withStore = async (mode, work) => {
         const db = await openDb();
         return await new Promise((resolve, reject) => {
           const transaction = db.transaction(STORE_NAME, mode);
           const store = transaction.objectStore(STORE_NAME);
           let settled = false;
           const finishResolve = (value) => {
             if (settled) return;
             settled = true;
             resolve(value);
           };
           const finishReject = (error) => {
             if (settled) return;
             settled = true;
             reject(error);
           };
           transaction.oncomplete = () => finishResolve(undefined);
           transaction.onerror = () => finishReject(transaction.error || new Error("Personal SKILL database transaction failed."));
           transaction.onabort = () => finishReject(transaction.error || new Error("Personal SKILL database transaction was aborted."));
           Promise.resolve(work(store, finishResolve, finishReject)).catch(finishReject);
         }).finally(() => db.close());
       };
       const runtime = {
         cache: {},
         putHandle: async (id, handle) => {
           await withStore("readwrite", (store, resolve, reject) => {
             const request = store.put(handle, String(id || ""));
             request.onsuccess = () => resolve(true);
             request.onerror = () => reject(request.error || new Error("Failed to save Personal SKILL handle."));
           });
         }
       };
       globalThis.__moonapPersonalSkillRuntime = runtime;
       return runtime;
     };
     const skillDir = await rootHandle.getDirectoryHandle(folderName, { create: true });
     const programDir = await skillDir.getDirectoryHandle("program", { create: true });
     const inputLines = fields.length === 0
       ? ["- none"]
       : fields.map((field) => {
           const name = String(field?.name || "input");
           const label = String(field?.label || name);
           const kind = String(field?.type || field?.kind || "text");
           const defaultValue = field?.default;
           const suffix = defaultValue === undefined ? "" : ` (default: ${String(defaultValue)})`;
           return `- ${name}: ${label} [${kind}]${suffix}`;
         });
     const outputText = resultMode === "download"
       ? `A downloadable artifact. Latest result summary: ${String(runtimeResult.summary || "")}`
       : resultMode === "report"
         ? `A browser-visible report. Latest result summary: ${String(runtimeResult.summary || "")}`
         : resultMode === "interactive"
           ? `An interactive browser-local result. Latest result summary: ${String(runtimeResult.summary || "")}`
           : String(runtimeResult.summary || "A browser-visible runtime result.");
     const keyAttributes = [
       `- task kind: ${taskKind}`,
       runtimeProfileId ? `- runtime profile: ${runtimeProfileId}` : "",
       runtimeProfileLabel && runtimeProfileLabel !== runtimeProfileId ? `- runtime profile label: ${runtimeProfileLabel}` : "",
       inferredTaskKind && inferredTaskKind !== taskKind ? `- inferred task kind: ${inferredTaskKind}` : "",
       `- runtime mode: ${runtimeMode}`,
       `- result mode: ${resultMode}`,
       "- wasm path: program/main.wasm"
     ].filter(Boolean);
     if (sourceText.trim()) keyAttributes.push("- moonbit source path: program/main.mbt");
     const skillMd = [
       "---",
       `name: ${folderName}`,
       `description: ${description}`,
       "---",
       "",
       "# Key Attributes",
       ...keyAttributes,
       "",
       "# Inputs",
       ...inputLines,
       "",
       "# Output",
       outputText,
       "",
       "# Runtime Spec",
       "```json",
       JSON.stringify(runtimeSpec, null, 2),
       "```"
     ].join("\n");
     await writeText(skillDir, "SKILL.md", skillMd);
     await writeBinary(programDir, "main.wasm", wasmBytes);
     if (sourceText.trim()) {
       await writeText(programDir, "main.mbt", sourceText);
     }
     const exportZip = globalThis.__moonapSkillExportZipEnabled !== false;
     let exportedZipName = "";
     if (exportZip) {
       const zipEntries = [
         { path: folderName, directory: true },
         { path: `${folderName}/program`, directory: true },
         { path: `${folderName}/SKILL.md`, text: skillMd },
         { path: `${folderName}/program/main.wasm`, bytes: wasmBytes }
       ];
       if (sourceText.trim()) {
         zipEntries.push({ path: `${folderName}/program/main.mbt`, text: sourceText });
       }
       const zipBytes = await zipRuntime.makeZip(zipEntries);
       exportedZipName = `${folderName}.zip`;
       await writeBinary(rootHandle, exportedZipName, zipBytes);
     }
     let skills = [];
     try {
       const parsed = JSON.parse(localStorage.getItem("moonap.personal.skills") || "[]");
       skills = Array.isArray(parsed) ? parsed : [];
     } catch {}
     const skillRecord = {
       id: `personal.${folderName}`,
       name: enteredName,
       description,
       task_kind: taskKind,
       inferred_task_kind: inferredTaskKind,
       runtime_profile_id: runtimeProfileId,
       runtime_mode: runtimeMode,
       result_mode: resultMode,
       folder_name: folderName,
       runtime_ready: true,
       export_root_name: String(rootHandle.name || ""),
       saved_at: new Date().toISOString()
     };
     skills = skills.filter((item) => String(item?.id || "") !== skillRecord.id);
     skills.unshift(skillRecord);
     try { localStorage.setItem("moonap.personal.skills", JSON.stringify(skills)); } catch {}
     await ensurePersonalSkillRuntime().putHandle(skillRecord.id, skillDir);
     const response = await fetch("/api/skill-export/save-decision", {
       method: "POST",
       headers: { "Content-Type": "application/json; charset=utf-8" },
       body: JSON.stringify({
         request_id: requestId,
         decision: "accepted-save-skill",
         reason: `User accepted the runtime result and exported this workflow as a SKILL folder named ${folderName}.`
       })
     });
     const text = await response.text();
     if (!response.ok) throw new Error(text || `Skill save decision failed (${response.status})`);
     const parsed = (() => { try { return JSON.parse(String(text || "{}")); } catch { return {}; } })();
     parsed.exported_folder_name = folderName;
     parsed.exported_root_name = String(rootHandle.name || "");
     parsed.exported_zip_name = exportedZipName;
     onDone(JSON.stringify(parsed, null, 2));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__open__skill__export__dialog = () => {
   let dialog = document.querySelector("#skillExportDialog");
   if (!dialog) {
     dialog = document.createElement("dialog");
     dialog.id = "skillExportDialog";
     dialog.className = "skill-dialog skill-export-dialog";
     dialog.innerHTML = `
       <form method="dialog" class="skill-dialog-body">
         <div class="dialog-head"><span>PERSONAL SKILL</span><strong>Save APP as SKILL</strong></div>
         <p class="dialog-summary">Choose a SKILL name, review the prefilled description and edit it if needed, then choose where to save the SKILL folder. Nothing will be written until you click Save SKILL. When you choose a save location, the browser may ask for permission to create files in that local directory.</p>
         <div class="dialog-fields">
           <label><span>SKILL name</span><input id="skillExportName" type="text" /></label>
           <label><span>Description (prefilled, editable)</span><textarea id="skillExportDescription" rows="3"></textarea></label>
           <label class="skill-export-zip-toggle">
             <input id="skillExportZipEnabled" type="checkbox" checked />
             <span>Also generate a .zip package for publishing or sharing</span>
           </label>
           <div class="skill-export-path">
             <div class="skill-export-path-meta">
               <span>Save location</span>
               <small id="skillExportPathLabel">No folder selected yet.</small>
             </div>
             <button id="skillExportChoosePath" class="dialog-button secondary" type="button">Choose or change save folder</button>
           </div>
         </div>
         <div class="dialog-actions">
           <button id="skillExportCancel" class="dialog-button" type="button">Cancel</button>
           <button id="skillExportConfirm" class="dialog-button primary" type="button">Save SKILL</button>
         </div>
       </form>`;
     document.body.append(dialog);
   }
   const runtimeRequest = globalThis.__moonapLastRuntimeRequest || {};
   const artifact = globalThis.__moonapLastArtifact || {};
   const taskKind = String(runtimeRequest.task_kind || "generic");
   const defaultDescriptionMap = {
     "fastq-generator": "Generate a synthetic FastQ file for testing, demos, or pipeline validation.",
     "fastq-analysis": "Analyze a FastQ file and report summary metrics.",
     "large-fastq-analysis": "Analyze a large FastQ file with chunked browser-local streaming and report read/base metrics.",
     "large-file-analysis": "Analyze a large browser-local file with chunked local streaming and report summary metrics.",
     "large-file-generation": "Generate a large browser-local file with chunked streaming output instead of buffering the whole artifact in memory.",
     "excel-generator": "Generate a synthetic financial spreadsheet file.",
     "finance-report-analysis": "Analyze a financial report file and produce a browser-local report.",
     "browser-game": "Run a browser-local interactive game skill."
   };
   const defaultName = String(globalThis.__moonapSkillExportName || artifact?.name || artifact?.skill?.folder_name || taskKind || "moonap-skill").trim() || "moonap-skill";
   const defaultDescription = String(globalThis.__moonapSkillExportDescription || defaultDescriptionMap[taskKind] || `Run a reusable APP for ${taskKind}.`);
   const nameInput = document.querySelector("#skillExportName");
   const descriptionInput = document.querySelector("#skillExportDescription");
   const zipInput = document.querySelector("#skillExportZipEnabled");
   const pathLabel = document.querySelector("#skillExportPathLabel");
   if (nameInput) nameInput.value = defaultName;
   if (descriptionInput) descriptionInput.value = defaultDescription;
   if (zipInput) zipInput.checked = globalThis.__moonapSkillExportZipEnabled !== false;
   const rootHandle = globalThis.__moonapSkillExportRootHandle;
   if (pathLabel) {
     pathLabel.textContent = rootHandle && rootHandle.name
       ? `Selected folder: ${String(rootHandle.name)}`
       : "No folder selected yet.";
   }
   dialog.showModal();
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app37browser__close__skill__export__dialog = () => document.querySelector("#skillExportDialog")?.close();
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__choose__skill__export__path = async (onDone, onError) => {
   try {
     if (typeof window.showDirectoryPicker !== "function") {
       throw new Error("This browser does not support directory selection for SKILL export.");
     }
     const handle = await window.showDirectoryPicker({ mode: "readwrite" });
     globalThis.__moonapSkillExportRootHandle = handle;
     const ensurePersonalSkillRuntime = () => {
       if (globalThis.__moonapPersonalSkillRuntime && typeof globalThis.__moonapPersonalSkillRuntime.putRootHandle === "function") {
         return globalThis.__moonapPersonalSkillRuntime;
       }
       const DB_NAME = "moonap.personal.skill.handles.v1";
       const STORE_NAME = "handles";
       const ROOT_KEY = "__root__";
       const openDb = () => new Promise((resolve, reject) => {
         const request = indexedDB.open(DB_NAME, 1);
         request.onupgradeneeded = () => {
           const db = request.result;
           if (!db.objectStoreNames.contains(STORE_NAME)) {
             db.createObjectStore(STORE_NAME);
           }
         };
         request.onsuccess = () => resolve(request.result);
         request.onerror = () => reject(request.error || new Error("Failed to open Personal SKILL database."));
       });
       const withStore = async (mode, work) => {
         const db = await openDb();
         return await new Promise((resolve, reject) => {
           const transaction = db.transaction(STORE_NAME, mode);
           const store = transaction.objectStore(STORE_NAME);
           let settled = false;
           const finishResolve = (value) => {
             if (settled) return;
             settled = true;
             resolve(value);
           };
           const finishReject = (error) => {
             if (settled) return;
             settled = true;
             reject(error);
           };
           transaction.oncomplete = () => finishResolve(undefined);
           transaction.onerror = () => finishReject(transaction.error || new Error("Personal SKILL database transaction failed."));
           transaction.onabort = () => finishReject(transaction.error || new Error("Personal SKILL database transaction was aborted."));
           Promise.resolve(work(store, finishResolve, finishReject)).catch(finishReject);
         }).finally(() => db.close());
       };
       const runtime = {
         putRootHandle: async (rootHandle) => {
           await withStore("readwrite", (store, resolve, reject) => {
             const request = store.put(rootHandle, ROOT_KEY);
             request.onsuccess = () => resolve(true);
             request.onerror = () => reject(request.error || new Error("Failed to save Personal SKILL root handle."));
           });
         }
       };
       globalThis.__moonapPersonalSkillRuntime = {
         ...(globalThis.__moonapPersonalSkillRuntime || {}),
         ...runtime
       };
       return globalThis.__moonapPersonalSkillRuntime;
     };
     await ensurePersonalSkillRuntime().putRootHandle(handle);
     const exportLabel = document.querySelector("#skillExportPathLabel");
     if (exportLabel) exportLabel.textContent = `Selected folder: ${String(handle?.name || "")}`;
     const panelLabel = document.querySelector("#personalSkillRootLabel");
     if (panelLabel) panelLabel.textContent = handle && handle.name
       ? `Selected folder: ${String(handle.name)}`
       : "No local Personal SKILL folder selected yet.";
     onDone(String(handle?.name || ""));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app40browser__on__skill__export__choose__path = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "skillExportChoosePath") return;
   event.preventDefault();
   event.stopPropagation();
   try {
     handler();
   } catch (error) {
     alert(`MoonAP skill export path selection failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app42browser__on__personal__skill__choose__path = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "personalSkillChoosePath") return;
   event.preventDefault();
   event.stopPropagation();
   try {
     handler();
   } catch (error) {
     alert(`MoonAP local Personal SKILL folder selection failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app35browser__on__skill__export__confirm = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "skillExportConfirm") return;
   event.preventDefault();
   event.stopPropagation();
   try {
     globalThis.__moonapSkillExportName = String(document.querySelector("#skillExportName")?.value || "").trim();
     globalThis.__moonapSkillExportDescription = String(document.querySelector("#skillExportDescription")?.value || "").trim();
     globalThis.__moonapSkillExportZipEnabled = Boolean(document.querySelector("#skillExportZipEnabled")?.checked ?? true);
     handler();
   } catch (error) {
     alert(`MoonAP skill export failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__on__skill__export__cancel = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "skillExportCancel") return;
   event.preventDefault();
   event.stopPropagation();
   try {
     handler();
   } catch (error) {
     console.error("MoonAP skill export cancel failed:", error);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app23browser__message__value = () => String(document.querySelector("#message")?.value || "").trim();
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__prepare__message__input = (defaultText) => {
   const textarea = document.querySelector("#message");
   if (!textarea) return;
   const applyTone = () => {
     textarea.classList.toggle("suggested", String(textarea.value || "") === String(defaultText));
   };
   if (String(textarea.value || "").trim() === "") {
     textarea.value = String(defaultText);
   }
   applyTone();
   if (!textarea.dataset.moonapPrepared) {
     textarea.addEventListener("input", applyTone);
     textarea.dataset.moonapPrepared = "true";
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__enable__minimal__shell = () => {
   globalThis.__moonapMinimalShell = true;
   const hide = (selector) => {
     const node = document.querySelector(selector);
     if (node) node.style.display = "none";
   };
   hide("#onboardingCard");
   hide("#resultPanel");
   hide("#artifactActions");
   hide("#modePanel");
   hide("#privacyStrip");
   const shell = document.querySelector(".app-shell");
   shell?.classList.remove("details-open");
   const drawer = document.querySelector("#detailsDrawer");
   if (drawer) drawer.style.display = "";
   const detailsButton = document.querySelector("#detailsToggle");
   if (detailsButton) detailsButton.style.display = "";
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__restore__formal__verification = () => {
   const enabled = localStorage.getItem("moonap.formalVerification") === "true";
   const mainToggle = document.querySelector("#formalVerification");
   const dialogToggle = document.querySelector("#routerFormalVerification");
   if (mainToggle) mainToggle.checked = enabled;
   if (dialogToggle) dialogToggle.checked = enabled;
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__toggle__details = () => {
   const root = document.querySelector(".app-shell");
   const button = document.querySelector("#detailsToggle");
   if (!root || !button) return;
   const open = !root.classList.contains("details-open");
   root.classList.toggle("details-open", open);
   button.setAttribute("aria-expanded", open ? "true" : "false");
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__file__name = () => {
   const file = document.querySelector("#fileInput")?.files?.[0];
   return String(file?.name || "");
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18browser__has__file = () => Boolean(document.querySelector("#fileInput")?.files?.[0]);
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__formal__verification__enabled = () => Boolean(document.querySelector("#formalVerification")?.checked);
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app28browser__run__fastq__counter = async (targetBase, onProgress, onDone, onError) => {
   try {
     const file = document.querySelector("#fileInput")?.files?.[0];
     if (!file) {
       onError("Choose a FastQ file first.");
       return;
     }
     const chunkSize = 4 * 1024 * 1024;
     const target = String(targetBase || "N").toUpperCase();
     let offset = 0;
     let carry = "";
     let lineMod = 0;
     let readCount = 0;
     let sequenceLines = 0;
     let totalBases = 0;
     let targetCount = 0;
     const started = performance.now();
     const countLine = (line) => {
       sequenceLines += 1;
       totalBases += line.length;
       for (let i = 0; i < line.length; i += 1) {
         if (line[i].toUpperCase() === target) targetCount += 1;
       }
     };
     while (offset < file.size) {
       const end = Math.min(offset + chunkSize, file.size);
       const text = await file.slice(offset, end).text();
       const merged = carry + text;
       const hasFinalNewline = merged.endsWith("\n") || merged.endsWith("\r");
       const lines = merged.split(/\r?\n/);
       carry = hasFinalNewline ? "" : String(lines.pop() || "");
       for (const line of lines) {
         if (lineMod === 1) countLine(line);
         if (lineMod === 3) readCount += 1;
         lineMod = (lineMod + 1) % 4;
       }
       offset = end;
       const pct = file.size === 0 ? 100 : Math.floor((offset / file.size) * 100);
       onProgress(JSON.stringify({
         status: "counting",
         file_name: file.name,
         file_size_bytes: file.size,
         chunk_size_bytes: chunkSize,
         bytes_processed: offset,
         progress_percent: pct,
         uploaded_bytes: 0,
         llm_receives_file_contents: false,
         target_base: target
       }, null, 2));
       await new Promise((resolve) => setTimeout(resolve, 0));
     }
     if (carry.length > 0) {
       if (lineMod === 1) countLine(carry);
       if (lineMod === 3) readCount += 1;
     }
     const elapsedMs = Math.round(performance.now() - started);
     onDone(JSON.stringify({
       status: "done",
       file_name: file.name,
       file_size_bytes: file.size,
       reads_seen: readCount,
       sequence_lines: sequenceLines,
       total_bases: totalBases,
       target_base: target,
       target_base_count: targetCount,
       target_base_fraction: totalBases === 0 ? 0 : targetCount / totalBases,
       elapsed_ms: elapsedMs,
       uploaded_bytes: 0,
       llm_receives_file_contents: false,
       privacy: "File contents stayed in this browser."
     }, null, 2));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__generate__fastq__sample = (readCountRaw, readLengthRaw, nRateText, seedRaw, onDone, onError) => {
   try {
     if (globalThis.__moonapAllowDownload !== "dialog-run") {
       throw new Error("Download blocked: open the SKILL settings dialog and click Run.");
     }
     globalThis.__moonapAllowDownload = "";
     const readCount = Math.max(1, Math.min(1000000, Number(readCountRaw) || 10000));
     const readLength = Math.max(1, Math.min(10000, Number(readLengthRaw) || 150));
     const nRate = Math.max(0, Math.min(1, Number(nRateText) || 0.01));
     const originalSeed = Number(seedRaw) || 42;
     let seed = originalSeed;
     const bases = ["A", "C", "G", "T"];
     const rand = () => {
       seed = (seed * 1664525 + 1013904223) >>> 0;
       return seed / 4294967296;
     };
     const chunks = [];
     let nCount = 0;
     let totalBases = 0;
     for (let read = 0; read < readCount; read += 1) {
       let seq = "";
       for (let i = 0; i < readLength; i += 1) {
         totalBases += 1;
         if (rand() < nRate) {
           seq += "N";
           nCount += 1;
         } else {
           seq += bases[Math.floor(rand() * bases.length)];
         }
       }
       chunks.push(`@moonap_${read}\n${seq}\n+\n${"I".repeat(readLength)}\n`);
     }
     const blob = new Blob(chunks, { type: "text/plain;charset=utf-8" });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.href = url;
     link.download = "moonap-demo.fastq";
     document.body.append(link);
     link.click();
     link.remove();
     setTimeout(() => URL.revokeObjectURL(url), 1000);
     onDone(JSON.stringify({
       status: "generated",
       file_name: "moonap-demo.fastq",
       read_count: readCount,
       read_length: readLength,
       total_bases: totalBases,
       expected_n_count: nCount,
       n_rate: nRate,
       random_seed: originalSeed,
       llm_output_tokens_for_file_contents: 0,
       note: "LLM would output only this compact recipe; MoonAP generated the file locally."
     }, null, 2));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__on__submit = (handler) => {
   const form = document.querySelector("#chatForm");
   form?.addEventListener("submit", (event) => {
     event.preventDefault();
     try {
       handler();
     } catch (error) {
       console.error("MoonAP submit handler failed:", error);
       alert(`MoonAP submit failed: ${error instanceof Error ? error.message : String(error)}`);
     }
   });
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18browser__on__click = (selector, handler) => {
   document.querySelector(String(selector))?.addEventListener("click", (event) => {
     event.preventDefault();
     try {
       handler();
     } catch (error) {
       console.error(`MoonAP click handler failed for ${String(selector)}:`, error);
       alert(`MoonAP click failed: ${error instanceof Error ? error.message : String(error)}`);
     }
   });
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__on__skill__card__click = (handler) => {
   document.addEventListener("click", (event) => {
     const card = event.target?.closest?.(".skill-card[data-skill-id]");
     if (!card) return;
     event.preventDefault();
     event.stopPropagation();
     document.querySelectorAll(".skill-card").forEach((card) => card.classList.remove("is-selected"));
     card.classList.add("is-selected");
     try {
       handler(String(card.dataset?.skillId || ""));
     } catch (error) {
       console.error("MoonAP skill click failed:", error);
       alert(`MoonAP skill failed: ${error instanceof Error ? error.message : String(error)}`);
     }
   });
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__on__onboarding__action = (onRunBenchmark, onOpenSkill, onEditLlm, onOpenLog, onDownloadLog) => {
   document.addEventListener("click", (event) => {
     const target = event.target?.closest?.("#onboardingRunBenchmark, #onboardingOpenSkill, #onboardingEditLLM, #onboardingOpenLog, #onboardingDownloadLog");
     if (!target) return;
     event.preventDefault();
     event.stopPropagation();
     try {
       if (target.id === "onboardingRunBenchmark") {
         onRunBenchmark();
       } else if (target.id === "onboardingOpenSkill") {
         onOpenSkill();
       } else if (target.id === "onboardingEditLLM") {
         onEditLlm();
       } else if (target.id === "onboardingOpenLog") {
         onOpenLog();
       } else if (target.id === "onboardingDownloadLog") {
         onDownloadLog();
       }
     } catch (error) {
       console.error("MoonAP onboarding action failed:", error);
       alert(`MoonAP onboarding failed: ${error instanceof Error ? error.message : String(error)}`);
     }
   });
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app28browser__open__skill__dialog = (skillId) => {
   const pathRuntime = globalThis.__moonapVirtualPathRuntime;
   let dialog = document.querySelector("#skillDialog");
   if (!dialog) {
     dialog = document.createElement("dialog");
     dialog.id = "skillDialog";
     dialog.className = "skill-dialog";
     dialog.innerHTML = `
       <form method="dialog" class="skill-dialog-body">
         <div class="dialog-head"><span id="dialogScope">SKILL</span><strong id="dialogTitle">Configure SKILL</strong></div>
         <p id="dialogSummary" class="dialog-summary"></p>
         <div id="dialogFields" class="dialog-fields"></div>
         <div id="dialogInputTarget" class="dialog-output-target" style="display:none;">
           <button id="dialogChooseInput" class="dialog-button secondary" type="button">Choose input FastQ file</button>
           <span id="dialogInputStatus">No input file selected yet.</span>
         </div>
         <div id="dialogOutputTarget" class="dialog-output-target" style="display:none;">
           <button id="dialogChooseOutput" class="dialog-button secondary" type="button">Choose output file/location</button>
           <span id="dialogOutputStatus">No output file selected yet.</span>
         </div>
         <div class="dialog-actions"><button id="dialogCancel" class="dialog-button" type="button">Cancel</button><button id="dialogOpenSource" class="dialog-button secondary" type="button" style="display:none;">View on GitHub</button><button id="dialogRun" class="dialog-button primary" type="button">Run</button></div>
       </form>`;
     document.body.append(dialog);
   }
   const scope = document.querySelector("#dialogScope");
   const title = document.querySelector("#dialogTitle");
   const summary = document.querySelector("#dialogSummary");
   const fields = document.querySelector("#dialogFields");
   const runButton = document.querySelector("#dialogRun");
   const outputTarget = document.querySelector("#dialogOutputTarget");
   const outputStatus = document.querySelector("#dialogOutputStatus");
   const chooseOutput = document.querySelector("#dialogChooseOutput");
   const inputTarget = document.querySelector("#dialogInputTarget");
   const inputStatus = document.querySelector("#dialogInputStatus");
   const chooseInput = document.querySelector("#dialogChooseInput");
   const openSourceButton = document.querySelector("#dialogOpenSource");
   const set = (node, value) => { if (node) node.textContent = String(value); };
   if (!dialog || !fields) return;
   fields.innerHTML = "";
   dialog.__moonapOutputFileHandle = null;
   dialog.__moonapInputFileHandle = null;
   dialog.dataset.skillId = String(skillId);
   dialog.dataset.taskKind = "";
   dialog.dataset.skillSource = "";
   dialog.dataset.externalUrl = "";
   dialog.dataset.downloadUrl = "";
   dialog.dataset.folderPath = "";
   dialog.dataset.inputKind = "";
   if (runButton) runButton.textContent = "Run";
   if (openSourceButton) openSourceButton.style.display = "none";
   if (inputTarget) inputTarget.style.display = "none";
   if (chooseInput) chooseInput.textContent = "Choose input file";
   set(inputStatus, "No input file selected yet.");
   if (outputTarget) outputTarget.style.display = "none";
   set(outputStatus, "No output file selected yet.");
   const addField = (id, label, value, mode = "numeric", fieldName = "", help = "", fieldType = "") => {
     const item = document.createElement("label");
     const isBool = ["bool", "boolean", "checkbox"].includes(String(fieldType || "").toLowerCase());
     if (isBool) item.className = "checkbox-param";
     const input = document.createElement("input");
     input.id = `param-${id}`;
     input.type = isBool ? "checkbox" : "text";
     if (isBool) {
       input.checked = !["false", "0", "no", "off", ""].includes(String(value ?? "").trim().toLowerCase());
       input.value = "true";
     } else {
       input.value = value;
       input.inputMode = mode;
     }
     if (fieldName) input.dataset.paramName = String(fieldName);
     const labelSpan = document.createElement("span");
     labelSpan.textContent = label;
     if (isBool) {
       item.append(input, labelSpan);
     } else {
       item.append(labelSpan, input);
     }
     if (help) {
       const helpNode = document.createElement("small");
       helpNode.className = "param-help";
       helpNode.textContent = String(help);
       item.append(helpNode);
     }
     fields.append(item);
   };
   const loadedPersonal = globalThis.__moonapPersonalSkillCache && typeof globalThis.__moonapPersonalSkillCache === "object"
     ? globalThis.__moonapPersonalSkillCache[String(skillId)]
     : null;
   const loadedHubSkill = globalThis.__moonapHubSkillCache && typeof globalThis.__moonapHubSkillCache === "object"
     ? globalThis.__moonapHubSkillCache[String(skillId)]
     : null;
   if (loadedPersonal && typeof loadedPersonal === "object") {
     const runtimeSpec = loadedPersonal.runtime_spec && typeof loadedPersonal.runtime_spec === "object"
       ? loadedPersonal.runtime_spec
       : {};
     const runtimeFields = Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : [];
     const mapFieldId = (name) => {
       const normalized = String(name || "").trim().toLowerCase();
       if (normalized === "read_count") return "readCount";
       if (normalized === "read_length") return "readLength";
       if (normalized === "random_seed") return "seed";
       if (normalized === "n_rate") return "nRate";
       if (normalized === "n_rate_per_mille") return "nRatePerMille";
       if (normalized === "target_base") return "targetBase";
       return normalized.replace(/[^a-z0-9]+([a-z0-9])/g, (_, char) => String(char || "").toUpperCase()) || "input";
     };
     set(scope, "1.1 Personal-SKILL-Set");
     set(title, String(loadedPersonal.name || "Personal SKILL"));
     set(summary, String(loadedPersonal.description || runtimeSpec.title || "Run this saved Personal SKILL locally without asking the LLM again."));
     dialog.dataset.taskKind = String(loadedPersonal.task_kind || "");
     for (const field of runtimeFields) {
       const name = String(field?.name || "input");
       const labelText = String(field?.label || name);
       const defaultValue = field?.default == null ? "" : String(field.default);
       const kind = String(field?.kind || field?.type || "text").toLowerCase();
       const inputMode = kind === "float" || kind === "decimal"
         ? "decimal"
         : kind === "text"
           ? "text"
           : "numeric";
       addField(mapFieldId(name), labelText, defaultValue, inputMode, name, String(field?.help || field?.description || ""), kind);
     }
     dialog.dataset.skillSource = "personal";
     if (String(loadedPersonal.task_kind || "") === "large-file-generation" && outputTarget) {
       outputTarget.style.display = "";
     }
     if (String(loadedPersonal.task_kind || "") === "large-fastq-analysis" && inputTarget) {
       inputTarget.style.display = "";
       dialog.dataset.inputKind = "fastq";
       if (chooseInput) chooseInput.textContent = "Choose input FastQ file";
     } else if (String(runtimeSpec.mode || loadedPersonal.runtime_mode || "").toLowerCase() === "file" && inputTarget) {
       inputTarget.style.display = "";
       dialog.dataset.inputKind = String(runtimeSpec.analysis_type || runtimeSpec.tool_kind || "file").toLowerCase();
       if (chooseInput) chooseInput.textContent = "Choose input file";
     }
   } else if (loadedHubSkill && typeof loadedHubSkill === "object") {
     const runtimeSpec = loadedHubSkill.runtime_spec && typeof loadedHubSkill.runtime_spec === "object"
       ? loadedHubSkill.runtime_spec
       : {};
     const runtimeFields = Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : [];
     const sourceKind = String(loadedHubSkill.source || "hub");
     const scopeLabel = sourceKind === "local"
       ? "1.2 Local-SKILL-Hub"
       : "1.3 Cloud-SKILL-Hub";
     const versionText = String(loadedHubSkill.version || "");
     const pathText = pathRuntime && typeof pathRuntime.normalize === "function"
       ? pathRuntime.normalize(loadedHubSkill.relative_path || loadedHubSkill.folder_path || "")
       : String(loadedHubSkill.relative_path || loadedHubSkill.folder_path || "");
     const metaLine = [versionText ? `version ${versionText}` : "", pathText ? `path ${pathText}` : ""].filter(Boolean).join(" | ");
     set(scope, scopeLabel);
     set(title, String(loadedHubSkill.name || "SKILL"));
     const baseSummary = String(loadedHubSkill.description || "MoonAP SKILL entry.");
     const installSummary = sourceKind === "cloud"
       ? `${baseSummary}\n\nCloud SKILLs must be installed to Local-SKILL-Hub before they can be run. Click Install to Local SKILL Hub first, then open the installed Local SKILL to configure parameters and run it.`
       : baseSummary;
     set(summary, metaLine ? `${installSummary}\n${metaLine}` : installSummary);
     dialog.dataset.taskKind = String(loadedHubSkill.task_kind || "");
     dialog.dataset.skillSource = sourceKind;
     const externalUrl = String(loadedHubSkill.external_url || loadedHubSkill.folder_url || loadedHubSkill.repository_url || "");
     dialog.dataset.externalUrl = externalUrl;
     if (openSourceButton && externalUrl) openSourceButton.style.display = "";
     dialog.dataset.downloadUrl = String(loadedHubSkill.download_url || "");
     dialog.dataset.folderPath = pathText;
     if (sourceKind !== "cloud") {
       for (const field of runtimeFields) {
         const name = String(field?.name || "input");
         const labelText = String(field?.label || name);
         const defaultValue = field?.default == null ? "" : String(field.default);
         const kind = String(field?.kind || field?.type || "text").toLowerCase();
         const inputMode = kind === "float" || kind === "decimal"
           ? "decimal"
           : kind === "text"
             ? "text"
             : "numeric";
         addField(name, labelText, defaultValue, inputMode, name, String(field?.help || field?.description || ""), kind);
       }
     }
     if (sourceKind !== "cloud" && String(loadedHubSkill.task_kind || "") === "large-file-generation" && outputTarget) {
       outputTarget.style.display = "";
     }
     if (sourceKind !== "cloud" && String(loadedHubSkill.task_kind || "") === "large-fastq-analysis" && inputTarget) {
       inputTarget.style.display = "";
       dialog.dataset.inputKind = "fastq";
       if (chooseInput) chooseInput.textContent = "Choose input FastQ file";
     } else if (sourceKind !== "cloud" && String(runtimeSpec.mode || loadedHubSkill.runtime_mode || "").toLowerCase() === "file" && inputTarget) {
       inputTarget.style.display = "";
       dialog.dataset.inputKind = String(runtimeSpec.analysis_type || runtimeSpec.tool_kind || "file").toLowerCase();
       if (chooseInput) chooseInput.textContent = "Choose input file";
     }
     if (runButton) {
       runButton.textContent = sourceKind === "cloud" ? "Install to Local SKILL Hub" : "Run";
     }
   } else if (skillId.includes("moonbit.fastq-generator")) {
     set(scope, "SKILL-Hub / MoonBit");
     set(title, "MoonBit FastQ Generator");
     set(summary, "Ask the active LLM router to generate a MoonBit FastQ generator program, then run a real compile probe automatically.");
     addField("readCount", "Read count", "10000");
     addField("readLength", "Read length", "150");
     addField("nRatePerMille", "N rate per mille", "10");
     addField("seed", "Random seed", "42");
   } else if (skillId.includes("fastq-generator")) {
     const personal = skillId.includes("personal.fastq-generator");
     set(scope, personal ? "1.1 Personal-SKILL-Set" : "SKILL-Hub / Research / Synthetic");
     set(title, personal ? "Personal FastQ Generator" : "FastQ Generator");
     set(summary, "Generate deterministic FastQ locally. Confirm parameters before MoonAP downloads the file.");
     addField("readCount", "Read count", "10000");
     addField("readLength", "Read length", "150");
     addField("nRate", "N rate", "0.01", "decimal");
     addField("seed", "Random seed", "42");
   } else if (skillId.includes("moonbit-benchmark")) {
     set(scope, "SKILL-Hub / MoonBit");
     set(title, "MoonBit Benchmark Ladder");
     set(summary, "Start from a tiny MoonBit task and step upward. Use this to check whether the active LLM router can stay in real MoonBit syntax before we try harder jobs.");
     addField("benchmarkLevel", "Benchmark level (1-5)", "1");
   } else if (skillId.includes("free-llm-eval")) {
     set(scope, "SKILL-Hub / Experiments");
     set(title, "Free LLM FastQ Eval");
     set(summary, "Run the single task 'Generate a FastQ file generator.' against every enabled provider/model using the minimal prompt plus direct compile-repair strategy, then persist raw JSON plus a readable markdown summary.");
     addField("evalRepairRounds", "Max repair rounds (1-3)", "2");
   } else if (skillId.includes("fastq-base-counter")) {
     set(scope, "SKILL-Hub / Research / FastQ");
     set(title, "FastQ Base Counter");
     set(summary, "Count a selected base in a browser-local FastQ file. Select a file with the + button before running.");
     addField("targetBase", "Target base", "N", "text");
   } else if (skillId === "personal") {
     set(scope, "1.1 Personal-SKILL-Set");
     set(title, "Personal-MoonAP-SKILL-Set");
     set(summary, "Local reusable SKILL folders on this computer. Folder selection and save-to-local workflow are planned next.");
   } else {
     set(scope, "1.2 SKILL-Hub");
     set(title, skillId.includes("gomoku") ? "Gomoku" : "Excel Max Amount Row");
     set(summary, "This SKILL is registered in MoonAP-SKILL-Hub. Full execution UI will follow the FastQ MVP.");
   }
   if (chooseOutput) {
     chooseOutput.onclick = async (event) => {
       event.preventDefault();
       event.stopPropagation();
       try {
         if (typeof window.showSaveFilePicker !== "function") {
           throw new Error("This browser does not support selecting a streamed output file yet.");
         }
         const fileNameRuntime = globalThis.__moonapFileNameRuntime;
         const outputInput = dialog.querySelector(`[data-param-name="output_name"]`);
         const outputNameRaw = String(outputInput?.value || "moonap-output.fastq").trim() || "moonap-output.fastq";
         const outputName = fileNameRuntime?.sanitize(outputNameRaw, "moonap-output.fastq") || "moonap-output.fastq";
         const handle = await window.showSaveFilePicker({
           suggestedName: outputName,
           types: [{ description: "FastQ files", accept: { "text/plain": [".fastq", ".fq", ".txt"] } }]
         });
         dialog.__moonapOutputFileHandle = handle;
         if (outputInput) outputInput.value = String(handle?.name || outputName);
         set(outputStatus, `Selected: ${String(handle?.name || outputName)}`);
       } catch (error) {
         set(outputStatus, `Output file not selected: ${error instanceof Error ? error.message : String(error)}`);
       }
     };
   }
   if (chooseInput) {
     chooseInput.onclick = async (event) => {
       event.preventDefault();
       event.stopPropagation();
       try {
         if (typeof window.showOpenFilePicker !== "function") {
           throw new Error("This browser does not support selecting a local input file yet.");
         }
         const inputKind = String(dialog.dataset.inputKind || "").toLowerCase();
         const pickerTypes = inputKind === "csv-summary"
           ? [{ description: "CSV/TSV files", accept: { "text/plain": [".csv", ".tsv", ".txt"] } }]
           : [{ description: "FastQ files", accept: { "text/plain": [".fastq", ".fq", ".txt", ".csv", ".tsv"] } }];
         const handles = await window.showOpenFilePicker({
           multiple: false,
           types: pickerTypes
         });
         const handle = Array.isArray(handles) ? handles[0] : null;
         if (!handle) throw new Error("No input file selected.");
         dialog.__moonapInputFileHandle = handle;
         set(inputStatus, `Selected: ${String(handle.name || "local input file")}`);
       } catch (error) {
         set(inputStatus, `Input file not selected: ${error instanceof Error ? error.message : String(error)}`);
       }
     };
   }
   dialog.showModal();
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__close__skill__dialog = () => document.querySelector("#skillDialog")?.close();
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26browser__dialog__skill__id = () => String(document.querySelector("#skillDialog")?.dataset?.skillId || "");
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app22browser__dialog__param = (name) => {
   const direct = document.querySelector(`#param-${String(name)}`);
   if (direct) return String(direct.value || "");
   const byDataName = document.querySelector(`[data-param-name="${String(name)}"]`);
   return String(byDataName?.value || "");
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__dialog__param__int = (name, fallback) => {
   const direct = document.querySelector(`#param-${String(name)}`);
   const raw = direct
     ? direct.value
     : document.querySelector(`[data-param-name="${String(name)}"]`)?.value;
   const value = Number.parseInt(String(raw || ""), 10);
   return Number.isFinite(value) && value > 0 ? value : fallback;
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__dialog__skill__task__kind = () => String(document.querySelector("#skillDialog")?.dataset?.taskKind || "");
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__dialog__skill__source = () => String(document.querySelector("#skillDialog")?.dataset?.skillSource || "");
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__run__dialog__generic__skill = async (onDone, onError) => {
   try {
     const dialog = document.querySelector("#skillDialog");
     if (!dialog) throw new Error("No SKILL dialog is open.");
     const skillId = String(dialog.dataset.skillId || "");
     const sourceKind = String(dialog.dataset.skillSource || "");
     const loadedPersonal = globalThis.__moonapPersonalSkillCache && typeof globalThis.__moonapPersonalSkillCache === "object"
       ? globalThis.__moonapPersonalSkillCache[skillId]
       : null;
     const loadedHubSkill = globalThis.__moonapHubSkillCache && typeof globalThis.__moonapHubSkillCache === "object"
       ? globalThis.__moonapHubSkillCache[skillId]
       : null;
     const skill = loadedPersonal && typeof loadedPersonal === "object" ? loadedPersonal : loadedHubSkill;
     if (!skill || typeof skill !== "object") throw new Error("SKILL metadata is not loaded.");
     const runtimeSpec = skill.runtime_spec && typeof skill.runtime_spec === "object" ? skill.runtime_spec : {};
     const taskKind = String(skill.task_kind || dialog.dataset.taskKind || "generic");
     const resultMode = String(runtimeSpec.result_mode || skill.result_mode || "text");
     const runtimeMode = String(runtimeSpec.mode || skill.runtime_mode || "form");
     const requestId = `skill-runtime-${Date.now()}`;
     const runtimeRequestRecord = {
       request_id: requestId,
       run_id: "",
       status: "ready-for-runtime",
       task_kind: taskKind,
       runtime_mode: runtimeMode,
       result_mode: resultMode,
       runtime_spec: runtimeSpec,
       runtime_ui: runtimeSpec,
       source_url: String(skill.source_url || skill.moonbit_source_url || ""),
       wasm_url: String(skill.wasm_url || ""),
       skill_id: skillId,
       skill_source: sourceKind
     };
     globalThis.__moonapLastRuntimeRequest = runtimeRequestRecord;
     globalThis.__moonapLastSkillRuntimeRequest = runtimeRequestRecord;
     globalThis.__moonapLastRuntimeRequestText = JSON.stringify(runtimeRequestRecord, null, 2);
     const runtimeInputs = {};
     for (const node of Array.from(dialog.querySelectorAll("[data-param-name]"))) {
       const name = String(node.dataset.paramName || "");
       if (!name) continue;
       const type = String(node.type || "").toLowerCase();
       const raw = type === "checkbox" ? (node.checked ? "true" : "false") : String(node.value ?? "");
       const field = (Array.isArray(runtimeSpec.fields) ? runtimeSpec.fields : []).find((item) => String(item?.name || "") === name) || {};
       const fieldType = String(field.type || field.kind || type || "text").toLowerCase();
       runtimeInputs[name] = fieldType === "int"
         ? Number.parseInt(raw, 10)
         : fieldType === "float" || fieldType === "decimal" || fieldType === "number"
           ? Number.parseFloat(raw)
           : fieldType === "bool" || fieldType === "boolean" || fieldType === "checkbox"
             ? raw === "true"
             : raw;
     }
     const buildPayload = (summary, displayText, resultKind = "text") => ({
       run_id: "",
       request_id: requestId,
       status: "runtime-succeeded",
       result_kind: resultKind,
       result_mode: resultMode,
       runtime_inputs: runtimeInputs,
       summary,
       display_text: displayText,
       stdout_text: `Browser-local SKILL runtime completed for ${requestId}.`,
       download_name: resultKind.includes("report") ? "moonap-skill-report.txt" : "moonap-skill-result.txt",
       download_content: displayText,
       skill_id: skillId,
       skill_source: sourceKind,
       task_kind: taskKind,
       accepted_for_skill: false
     });
     const postPayload = async (payload) => {
       const response = await fetch("/api/task/execute", {
         method: "POST",
         headers: { "Content-Type": "application/json; charset=utf-8" },
         body: JSON.stringify(payload)
       });
       const text = await response.text();
       if (!response.ok) throw new Error(text || `Runtime execute failed (${response.status})`);
       try {
         globalThis.__moonapLastRuntimeResult = JSON.parse(text);
       } catch {
         globalThis.__moonapLastRuntimeResult = payload;
       }
       globalThis.__moonapLastSkillRuntimeRequest = runtimeRequestRecord;
       globalThis.__moonapLastSkillRuntimeResult = globalThis.__moonapLastRuntimeResult;
       globalThis.__moonapLastRuntimeResultText = text || JSON.stringify(payload, null, 2);
       if (String(payload?.result_kind || "").includes("report") || resultMode === "report") {
         globalThis.__moonapLastRuntimeReportPayload = payload;
       }
       return text;
     };
     const toolKind = String(runtimeSpec.tool_kind || runtimeSpec.analysis_type || "").toLowerCase();
     const mode = String(runtimeSpec.mode || skill.runtime_mode || "").toLowerCase();
     if (mode === "file" || toolKind === "csv-summary") {
       const handle = dialog.__moonapInputFileHandle || null;
       if (!handle || typeof handle.getFile !== "function") {
         throw new Error("Choose an input file before running this SKILL.");
       }
       const file = await handle.getFile();
       const analysisType = String(runtimeSpec.analysis_type || toolKind).toLowerCase();
       if (analysisType !== "csv-summary") {
         throw new Error(`Generic file SKILL analysis '${analysisType || "file"}' is not supported yet.`);
       }
       const delimiter = String(runtimeSpec.delimiter || "").toLowerCase() === "tab" || file.name.toLowerCase().endsWith(".tsv") ? "\t" : ",";
       const text = await file.text();
       const rows = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").filter((line) => line.trim() !== "");
       const parseRow = (line) => {
         const result = [];
         let current = "";
         let inQuotes = false;
         for (let i = 0; i < line.length; i += 1) {
           const ch = line[i];
           const next = line[i + 1];
           if (ch === "\"" && inQuotes && next === "\"") {
             current += "\"";
             i += 1;
           } else if (ch === "\"") {
             inQuotes = !inQuotes;
           } else if (ch === delimiter && !inQuotes) {
             result.push(current);
             current = "";
           } else {
             current += ch;
           }
         }
         result.push(current);
         return result;
       };
       const header = rows.length > 0 ? parseRow(rows[0]).map((cell, index) => String(cell || `column_${index + 1}`).trim() || `column_${index + 1}`) : [];
       const dataRows = rows.slice(1).map(parseRow);
       const columnCount = header.length;
       const missing = header.map((_name, index) => dataRows.filter((row) => String(row[index] ?? "").trim() === "").length);
       const numericLines = [];
       for (let col = 0; col < columnCount; col += 1) {
         const nums = dataRows.map((row) => Number(String(row[col] ?? "").trim())).filter((value) => Number.isFinite(value));
         if (nums.length === 0) continue;
         const min = Math.min(...nums);
         const max = Math.max(...nums);
         const mean = nums.reduce((sum, value) => sum + value, 0) / nums.length;
         numericLines.push(`${header[col]}: count=${nums.length}, min=${min}, max=${max}, mean=${mean.toFixed(4)}`);
       }
       const reportText = [
         "MoonAP CSV Summary",
         `request_id: ${requestId}`,
         `file_name: ${file.name}`,
         `file_size_bytes: ${file.size}`,
         `row_count: ${dataRows.length}`,
         `column_count: ${columnCount}`,
         `columns: ${header.join(", ")}`,
         `missing_values: ${header.map((name, index) => `${name}=${missing[index]}`).join(", ")}`,
         "",
         "Numeric columns:",
         ...(numericLines.length ? numericLines : ["none"])
       ].join("\n");
       const payload = buildPayload(`Analyzed ${dataRows.length} CSV row(s) across ${columnCount} column(s).`, reportText, "csv-summary-report");
       payload.file_name = file.name;
       payload.file_size_bytes = file.size;
       payload.llm_receives_file_contents = false;
       onDone(await postPayload(payload));
       return;
     }
     const renderTemplate = (template, values) => String(template || "").replace(/\{\{\s*([A-Za-z_][A-Za-z0-9_]*)\s*\}\}/g, (_match, name) => {
       const value = values[name];
       return value === undefined || value === null ? "" : String(value);
     });
     const evaluateExpression = (expression, values) => {
       const expr = String(expression || "").trim();
       if (!expr) throw new Error("Computed output is missing an expression.");
       if (!/^[A-Za-z0-9_+\-*/().,\s]+$/.test(expr)) throw new Error(`Unsupported characters in expression: ${expr}`);
       const numericExpr = expr.replace(/\b[A-Za-z_][A-Za-z0-9_]*\b/g, (name) => {
         if (name === "pow") return "Math.pow";
         if (name === "sqrt") return "Math.sqrt";
         if (name === "abs") return "Math.abs";
         if (name === "min") return "Math.min";
         if (name === "max") return "Math.max";
         if (!Object.prototype.hasOwnProperty.call(values, name)) throw new Error(`Unknown input in expression: ${name}`);
         const n = Number(values[name]);
         if (!Number.isFinite(n)) throw new Error(`Input ${name} is not numeric.`);
         return `(${String(n)})`;
       });
       const result = Function(`"use strict"; return (${numericExpr});`)();
       if (!Number.isFinite(Number(result))) throw new Error(`Expression produced a non-finite result: ${expr}`);
       return Number(result);
     };
     let payload;
     if (toolKind === "text-analysis") {
       const sourceText = String(runtimeInputs.input_text || runtimeInputs.text || "");
       const characters = sourceText.length;
       const charactersNoSpaces = sourceText.replace(/\s/g, "").length;
       const words = (sourceText.trim().match(/\S+/g) || []).length;
       const lines = sourceText === "" ? 0 : sourceText.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n").length;
       const readingMinutes = words / 200;
       payload = buildPayload(`Analyzed ${words} word(s), ${characters} character(s), and ${lines} line(s).`, [
         `Characters: ${characters}`,
         `Characters without spaces: ${charactersNoSpaces}`,
         `Words: ${words}`,
         `Lines: ${lines}`,
         `Estimated reading time: ${readingMinutes.toFixed(2)} minutes`
       ].join("\n"));
     } else if (toolKind === "json-formatter") {
       const raw = String(runtimeInputs.json_text || runtimeInputs.input_text || "");
       try {
         payload = buildPayload("JSON is valid and formatted.", `Valid JSON: true\n\n${JSON.stringify(JSON.parse(raw), null, 2)}`);
       } catch (error) {
         payload = buildPayload("JSON is invalid.", `Valid JSON: false\nError: ${error instanceof Error ? error.message : String(error)}`);
       }
     } else {
       const computedOutputs = Array.isArray(runtimeSpec.computed_outputs)
         ? runtimeSpec.computed_outputs
         : (Array.isArray(runtimeSpec.outputs) ? runtimeSpec.outputs : []);
       const inputLines = Object.entries(runtimeInputs).map(([key, value]) => `${key}: ${String(value)}`);
       if (computedOutputs.length > 0) {
         const values = { ...runtimeInputs };
         for (const output of computedOutputs) {
           const name = String(output?.name || "").trim();
           if (!name) continue;
           const rawValue = evaluateExpression(output?.expression, values);
           const decimals = Number.isFinite(Number(output?.decimals)) ? Math.max(0, Math.min(12, Number(output.decimals))) : null;
           values[name] = decimals === null ? rawValue : Number(rawValue.toFixed(decimals));
         }
         const outputLines = computedOutputs.map((output) => {
           const name = String(output?.name || "").trim();
           if (!name) return "";
           return `${String(output?.label || name)}: ${String(values[name])}`;
         }).filter(Boolean);
         payload = buildPayload(
           runtimeSpec.summary_template ? renderTemplate(runtimeSpec.summary_template, values) : (outputLines[0] || "MoonAP calculated the form result."),
           runtimeSpec.result_template ? renderTemplate(runtimeSpec.result_template, values) : [...inputLines, ...outputLines].join("\n")
         );
       } else if (Object.prototype.hasOwnProperty.call(runtimeInputs, "celsius")) {
         const celsius = Number(runtimeInputs.celsius);
         const fahrenheit = celsius * 9 / 5 + 32;
         payload = buildPayload(`Converted ${celsius} Celsius to ${fahrenheit.toFixed(2)} Fahrenheit.`, `Celsius: ${celsius}\nFahrenheit: ${fahrenheit.toFixed(2)}`);
       } else if (Object.prototype.hasOwnProperty.call(runtimeInputs, "number_a") && Object.prototype.hasOwnProperty.call(runtimeInputs, "number_b")) {
         const a = Number(runtimeInputs.number_a);
         const b = Number(runtimeInputs.number_b);
         payload = buildPayload(`Calculated ${a} + ${b} = ${a + b}.`, `First number: ${a}\nSecond number: ${b}\nSum: ${a + b}`);
       } else {
         payload = buildPayload("MoonAP recorded browser-local SKILL input.", inputLines.join("\n") || "No inputs were provided.");
       }
     }
     onDone(await postPayload(payload));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app45browser__run__dialog__large__file__generation = async (onDone, onError) => {
   try {
     const dialog = document.querySelector("#skillDialog");
     if (!dialog) throw new Error("No SKILL dialog is open.");
     const readParam = (name, fallback = "") => {
       const node = dialog.querySelector(`[data-param-name="${String(name)}"]`);
       if (!node) return String(fallback);
       if (String(node.type || "").toLowerCase() === "checkbox") return node.checked ? "true" : "false";
       return String(node.value ?? fallback);
     };
     const fileNameRuntime = globalThis.__moonapFileNameRuntime;
     const outputNameRaw = readParam("output_name", "moonap-output.fastq").trim() || "moonap-output.fastq";
     let outputName = fileNameRuntime?.sanitize(outputNameRaw, "moonap-output.fastq") || "moonap-output.fastq";
     const targetSizeMb = Math.max(1, Math.min(1024, Number.parseInt(readParam("target_size_mb", "128"), 10) || 128));
     const readLength = Math.max(20, Math.min(20000, Number.parseInt(readParam("read_length", "150"), 10) || 150));
     const headerPrefix = fileNameRuntime?.sanitizeToken(readParam("read_header_prefix", "moonap_read"), "moonap_read") || "moonap_read";
     const nRate = Math.max(0, Math.min(1, Number.parseFloat(readParam("n_rate", "0.01")) || 0.01));
     const qualityChar = readParam("quality_char", "I").slice(0, 1) || "I";
     let seed = Math.max(0, Number.parseInt(readParam("random_seed", "42"), 10) || 42) >>> 0;
     if (typeof window.showSaveFilePicker !== "function") {
       throw new Error("This browser does not support streamed save-file output yet.");
     }
     const selectedFileHandle = dialog.__moonapOutputFileHandle || null;
     if (!selectedFileHandle) {
       throw new Error("Choose output file/location before running this large-file generator.");
     }
     dialog.close();
     const fileHandle = selectedFileHandle;
     outputName = String(fileHandle?.name || outputName);
     const writable = await fileHandle.createWritable();
     const encoder = new TextEncoder();
     const chunkSize = 4 * 1024 * 1024;
     const targetBytes = targetSizeMb * 1024 * 1024;
     const bases = ["A", "C", "G", "T"];
     const rand = () => {
       seed = (seed * 1664525 + 1013904223) >>> 0;
       return seed / 4294967296;
     };
     const materializeRecord = (index) => {
       let seq = "";
       for (let i = 0; i < readLength; i += 1) {
         seq += rand() < nRate ? "N" : bases[Math.floor(rand() * bases.length)];
       }
       return `@${headerPrefix}_${index}\n${seq}\n+\n${qualityChar.repeat(readLength)}\n`;
     };
     const started = performance.now();
     let bytesWritten = 0;
     let readIndex = 0;
     let chunkCount = 0;
     const setText = (selector, value) => {
       const node = document.querySelector(selector);
       if (node) node.textContent = String(value ?? "");
     };
     const emitState = (status) => {
       const progress = targetBytes === 0 ? 100 : Math.min(100, Math.floor((bytesWritten / targetBytes) * 100));
       const payload = {
         status,
         result_kind: "streamed-file",
         file_name: outputName,
         target_size_mb: targetSizeMb,
         bytes_written: bytesWritten,
         bytes_processed: bytesWritten,
         target_bytes: targetBytes,
         reads_seen: readIndex,
         chunk_count: chunkCount,
         progress_percent: progress,
         llm_receives_file_contents: false
       };
       setText("#state", JSON.stringify(payload, null, 2));
       setText("#processProvider", "Personal SKILL");
       setText("#processStage", "skill-runtime");
       setText("#processResult", status === "runtime-succeeded" ? "succeeded" : "running");
       setText("#processLog", status === "runtime-succeeded"
         ? `Generated ${outputName} with ${readIndex} FastQ reads.`
         : `Writing ${outputName}: ${progress}%`);
       const panel = document.querySelector("#resultPanel");
       panel?.classList.add("is-open");
       setText("#resultStatus", status);
       setText("#resultTitle", "Browser-local large-file generation");
       setText("#metricFile", outputName);
       setText("#metricReads", String(readIndex));
       const fill = document.querySelector("#progressFill");
       if (fill) fill.style.width = `${progress}%`;
       globalThis.__moonapLargeFileProgressRuntime?.update?.(payload);
     };
     emitState("streaming-write");
     while (bytesWritten < targetBytes) {
       const records = [];
       let chunkBytes = 0;
       while (chunkBytes < chunkSize && bytesWritten + chunkBytes < targetBytes) {
         const record = materializeRecord(readIndex);
         const bytes = encoder.encode(record);
         if (bytes.length > targetBytes - bytesWritten - chunkBytes) break;
         records.push(record);
         chunkBytes += bytes.length;
         readIndex += 1;
       }
       if (records.length === 0) break;
       const chunkText = records.join("");
       await writable.write(chunkText);
       bytesWritten += encoder.encode(chunkText).length;
       chunkCount += 1;
       emitState("streaming-write");
       await new Promise((resolve) => setTimeout(resolve, 0));
     }
     await writable.close();
     const elapsedMs = Math.round(performance.now() - started);
     const result = {
       status: "runtime-succeeded",
       result_kind: "streamed-file",
       file_name: outputName,
       bytes_written: bytesWritten,
       reads_seen: readIndex,
       chunk_count: chunkCount,
       elapsed_ms: elapsedMs,
       llm_receives_file_contents: false,
       summary: `Generated ${outputName} locally with browser streaming output (${readIndex} FastQ reads).`
     };
     emitState("runtime-succeeded");
     onDone(JSON.stringify(result, null, 2));
   } catch (error) {
     globalThis.__moonapLargeFileProgressRuntime?.error?.(error instanceof Error ? error.message : String(error));
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app44browser__run__dialog__large__fastq__analysis = async (onDone, onError) => {
   try {
     const dialog = document.querySelector("#skillDialog");
     if (!dialog) throw new Error("No SKILL dialog is open.");
     const readParam = (name, fallback = "") => {
       const node = dialog.querySelector(`[data-param-name="${String(name)}"]`);
       if (!node) return String(fallback);
       if (String(node.type || "").toLowerCase() === "checkbox") return node.checked ? "true" : "false";
       return String(node.value ?? fallback);
     };
     let fileHandle = dialog.__moonapInputFileHandle || null;
     if (!fileHandle) {
       if (typeof window.showOpenFilePicker !== "function") {
         throw new Error("This browser does not support selecting a local input file yet.");
       }
       const handles = await window.showOpenFilePicker({
         multiple: false,
         types: [{ description: "FastQ files", accept: { "text/plain": [".fastq", ".fq", ".txt"] } }]
       });
       fileHandle = Array.isArray(handles) ? handles[0] : null;
     }
     if (!fileHandle || typeof fileHandle.getFile !== "function") throw new Error("Choose an input FastQ file first.");
     dialog.close();
     const file = await fileHandle.getFile();
     const chunkSize = 4 * 1024 * 1024;
     const parsedPreviewReads = Number.parseInt(readParam("max_preview_reads", "3"), 10);
     const maxPreviewReads = Math.max(0, Math.min(20, Number.isFinite(parsedPreviewReads) ? parsedPreviewReads : 3));
     const validateStructure = !["false", "0", "no", "off"].includes(readParam("validate_fastq_structure", "true").trim().toLowerCase());
     const countBases = !["false", "0", "no", "off"].includes(readParam("count_bases", "true").trim().toLowerCase());
     let offset = 0;
     let carry = "";
     let chunkCount = 0;
     let lineCount = 0;
     let readCount = 0;
     let totalBases = 0;
     let aCount = 0, cCount = 0, gCount = 0, tCount = 0, nCount = 0, otherBaseCount = 0;
     let minReadLength = null;
     let maxReadLength = 0;
     let malformedRecordCount = 0;
     const previewReads = [];
     const recordLines = [];
     const setText = (selector, value) => {
       const node = document.querySelector(selector);
       if (node) node.textContent = String(value ?? "");
     };
     const countSequence = (sequence) => {
       const length = sequence.length;
       totalBases += length;
       minReadLength = minReadLength == null ? length : Math.min(minReadLength, length);
       maxReadLength = Math.max(maxReadLength, length);
       if (!countBases) return;
       for (let i = 0; i < sequence.length; i += 1) {
         const ch = sequence[i].toUpperCase();
         if (ch === "A") aCount += 1;
         else if (ch === "C") cCount += 1;
         else if (ch === "G") gCount += 1;
         else if (ch === "T") tCount += 1;
         else if (ch === "N") nCount += 1;
         else otherBaseCount += 1;
       }
     };
     const consumeRecord = (header, sequence, plus, quality) => {
       const malformed = validateStructure && (!String(header || "").startsWith("@") || String(plus || "") !== "+" || String(sequence || "").length !== String(quality || "").length);
       if (malformed) malformedRecordCount += 1;
       readCount += 1;
       countSequence(String(sequence || ""));
       if (previewReads.length < maxPreviewReads) previewReads.push(`${header}\n${String(sequence || "").slice(0, 240)}\n${plus}\n${String(quality || "").slice(0, 240)}`);
     };
     const consumeLine = (line) => {
       lineCount += 1;
       recordLines.push(String(line || ""));
       if (recordLines.length === 4) {
         consumeRecord(recordLines[0], recordLines[1], recordLines[2], recordLines[3]);
         recordLines.length = 0;
       }
     };
     const emitState = (status) => {
       const progress = file.size === 0 ? 100 : Math.min(100, Math.floor((offset / file.size) * 100));
       const payload = {
         status,
         result_kind: "large-fastq-report",
         file_name: file.name,
         file_size_bytes: file.size,
         bytes_processed: offset,
         chunk_count: chunkCount,
         line_count: lineCount,
         reads_seen: readCount,
         total_bases: totalBases,
         matching_line_count: nCount,
         progress_percent: progress,
         llm_receives_file_contents: false
       };
       setText("#state", JSON.stringify(payload, null, 2));
       setText("#processProvider", String(dialog.dataset.skillSource || "") === "personal" ? "Personal SKILL" : "Local SKILL");
       setText("#processStage", "skill-runtime");
       setText("#processResult", status === "runtime-succeeded" ? "succeeded" : "running");
       setText("#processLog", status === "runtime-succeeded" ? `Analyzed ${file.name}: ${readCount} FastQ reads.` : `Analyzing ${file.name}: ${progress}%`);
       document.querySelector("#resultPanel")?.classList.add("is-open");
       setText("#resultStatus", status);
       setText("#resultTitle", "Browser-local large FastQ analysis");
       setText("#metricFile", file.name);
       setText("#metricProcessed", `${Math.floor(offset / 1048576)} MB`);
       setText("#metricReads", String(readCount));
       setText("#metricTarget", String(nCount));
       setText("#metricBases", String(totalBases));
       const fill = document.querySelector("#progressFill");
       if (fill) fill.style.width = `${progress}%`;
       globalThis.__moonapLargeFileProgressRuntime?.update?.(payload);
     };
     emitState("streaming-fastq-analysis");
     const started = performance.now();
     while (offset < file.size) {
       const end = Math.min(offset + chunkSize, file.size);
       const text = await file.slice(offset, end).text();
       const merged = carry + text;
       const hasFinalNewline = merged.endsWith("\n") || merged.endsWith("\r");
       const lines = merged.split(/\r?\n/);
       carry = hasFinalNewline ? "" : String(lines.pop() || "");
       if (hasFinalNewline && lines.length > 0 && lines[lines.length - 1] === "") lines.pop();
       for (const line of lines) consumeLine(line);
       offset = end;
       chunkCount += 1;
       emitState("streaming-fastq-analysis");
       await new Promise((resolve) => setTimeout(resolve, 0));
     }
     if (carry !== "") consumeLine(carry);
     if (recordLines.length > 0) malformedRecordCount += 1;
     const elapsedMs = Math.round(performance.now() - started);
     const avgReadLength = readCount === 0 ? 0 : totalBases / readCount;
     const reportText = [
       "MoonAP Large FastQ Analysis Report",
       `file_name: ${file.name}`,
       `file_size_bytes: ${file.size}`,
       `chunk_count: ${chunkCount}`,
       `total_lines: ${lineCount}`,
       `estimated_read_count: ${readCount}`,
       `total_bases: ${totalBases}`,
       `A_count: ${aCount}`,
       `C_count: ${cCount}`,
       `G_count: ${gCount}`,
       `T_count: ${tCount}`,
       `N_count: ${nCount}`,
       `other_base_count: ${otherBaseCount}`,
       `min_read_length: ${minReadLength == null ? 0 : minReadLength}`,
       `max_read_length: ${maxReadLength}`,
       `average_read_length: ${Number(avgReadLength.toFixed(2))}`,
       `malformed_record_count: ${malformedRecordCount}`,
       `elapsed_ms: ${elapsedMs}`,
       "",
       "Preview reads:",
       previewReads.length > 0 ? previewReads.join("\n\n") : "(none)"
     ].join("\n");
     const result = {
       status: "runtime-succeeded",
       result_kind: "large-fastq-report",
       file_name: file.name,
       file_size_bytes: file.size,
       chunk_count: chunkCount,
       total_lines: lineCount,
       estimated_read_count: readCount,
       total_bases: totalBases,
       A_count: aCount,
       C_count: cCount,
       G_count: gCount,
       T_count: tCount,
       N_count: nCount,
       other_base_count: otherBaseCount,
       min_read_length: minReadLength == null ? 0 : minReadLength,
       max_read_length: maxReadLength,
       average_read_length: Number(avgReadLength.toFixed(2)),
       malformed_record_count: malformedRecordCount,
       elapsed_ms: elapsedMs,
       preview_reads: previewReads,
       llm_receives_file_contents: false,
       request_id: `skill-runtime-${Date.now()}`,
       runtime_mode: "file",
       result_mode: "report",
       download_name: `${String(file.name || "fastq-analysis").replace(/[^a-zA-Z0-9._-]+/g, "-")}.analysis.json`,
       display_text: reportText,
       download_content: JSON.stringify({
         file_name: file.name,
         file_size_bytes: file.size,
         chunk_count: chunkCount,
         total_lines: lineCount,
         estimated_read_count: readCount,
         total_bases: totalBases,
         A_count: aCount,
         C_count: cCount,
         G_count: gCount,
         T_count: tCount,
         N_count: nCount,
         other_base_count: otherBaseCount,
         min_read_length: minReadLength == null ? 0 : minReadLength,
         max_read_length: maxReadLength,
         average_read_length: Number(avgReadLength.toFixed(2)),
         malformed_record_count: malformedRecordCount,
         preview_reads: previewReads
       }, null, 2),
       summary: `Analyzed ${file.name} locally: ${readCount} FastQ reads, ${totalBases} bases.`
     };
     const runtimeRequest = {
       request_id: result.request_id,
       status: "ready-for-runtime",
       task_kind: "large-fastq-analysis",
       runtime_mode: "file",
       result_mode: "report",
       runtime_spec: {
         mode: "file",
         title: "Analyze large FastQ file",
         action_label: "Run FastQ analysis",
         rerun_action_label: "Run FastQ analysis again",
         result_mode: "report",
         domain_profile: "fastq",
         io_contract: {
           protocol: "moonap.large-file.v1",
           browser_local_only: true,
           llm_receives_file_contents: false,
           host_capability: "chunked-local-analysis",
           input_mode: "streaming-text",
           output_mode: "report",
           chunk_size_bytes: chunkSize,
           carry_strategy: "fastq-record-boundary"
         },
         fields: [
           { name: "max_preview_reads", label: "Preview reads", type: "int", default: maxPreviewReads },
           { name: "validate_fastq_structure", label: "Validate FastQ structure", type: "bool", default: validateStructure },
           { name: "count_bases", label: "Count A/C/G/T/N bases", type: "bool", default: countBases }
         ]
       }
     };
     runtimeRequest.runtime_ui = runtimeRequest.runtime_spec;
     globalThis.__moonapLastRuntimeRequest = runtimeRequest;
     globalThis.__moonapLastRuntimeRequestText = JSON.stringify(runtimeRequest, null, 2);
     globalThis.__moonapLastRuntimeResult = result;
     globalThis.__moonapLastRuntimeResultText = JSON.stringify(result, null, 2);
     globalThis.__moonapLastRuntimeReportPayload = result;
     emitState("runtime-succeeded");
     onDone(JSON.stringify(result, null, 2));
   } catch (error) {
     globalThis.__moonapLargeFileProgressRuntime?.error?.(error instanceof Error ? error.message : String(error));
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__dialog__external__url = () => String(document.querySelector("#skillDialog")?.dataset?.externalUrl || "");
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__dialog__download__url = () => String(document.querySelector("#skillDialog")?.dataset?.downloadUrl || "");
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__dialog__folder__path = () => String(document.querySelector("#skillDialog")?.dataset?.folderPath || "");
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app28browser__open__external__url = (url) => {
   const text = String(url || "").trim();
   if (!text) return;
   window.open(text, "_blank", "noopener,noreferrer");
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__on__dialog__run = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id === "dialogRun") {
     event.preventDefault();
     event.stopPropagation();
     globalThis.__moonapAllowDownload = "dialog-run";
     handler();
     setTimeout(() => {
       if (globalThis.__moonapAllowDownload === "dialog-run") globalThis.__moonapAllowDownload = "";
     }, 0);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__on__dialog__open__source = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id === "dialogOpenSource") {
     event.preventDefault();
     event.stopPropagation();
     try {
       handler();
     } catch (error) {
       console.error("MoonAP source open failed:", error);
       alert(`MoonAP source open failed: ${error instanceof Error ? error.message : String(error)}`);
     }
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__on__dialog__cancel = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id === "dialogCancel") {
     event.preventDefault();
     handler();
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26browser__open__llm__dialog = () => {
   const parseModelList = (raw) => {
     const seen = new Set();
     const values = String(raw || "")
       .split(/\r?\n|,/)
       .map((item) => String(item || "").trim())
       .filter((item) => item.length > 0);
     return values.filter((item) => {
       const key = item.toLowerCase();
       if (seen.has(key)) return false;
       seen.add(key);
       return true;
     });
   };
   const normalizeProviderEntry = (item) => {
     const key = String(item?.key || "").toLowerCase();
     const model = String(item?.model || "").trim();
     const apiKey = String(item?.apiKey || "").trim();
     const enabled = Boolean(item?.enabled);
     const custom = Boolean(item?.custom);
     const providerName = String(item?.providerName || "").trim();
     const test_status = String(item?.test_status || "").trim();
     const test_message = String(item?.test_message || "").trim();
     const tested_at = String(item?.tested_at || "").trim();
     let baseUrl = String(item?.baseUrl || "").trim();
     if (custom) {
       baseUrl = String(item?.baseUrl || "").trim();
     } else if (key === "gemini") {
       baseUrl = "https://generativelanguage.googleapis.com";
     } else if (key === "openrouter") {
       baseUrl = "https://openrouter.ai/api/v1";
     } else if (key === "zai") {
       baseUrl = "https://open.bigmodel.cn/api/paas/v4";
     } else if (key === "siliconflow") {
       baseUrl = "https://api.siliconflow.cn/v1";
     } else if (key === "openai") {
       baseUrl = "moonap://llm-sim";
     } else if (key === "nvidia") {
       baseUrl = "https://integrate.api.nvidia.com/v1";
     }
     return { key, providerName, custom, enabled, model, baseUrl, apiKey, test_status, test_message, tested_at };
   };
   const providerPriority = (provider, model) => {
     const key = String(provider || "").toLowerCase();
     const name = String(model || "").toLowerCase();
     let score = 0;
     if (name.includes("gpt-5.4")) score += 1200;
     else
     if (name.includes("llama-4-maverick-17b-128e-instruct")) score += 1000;
     else if (name.includes("glm-5.1")) score += 900;
     else if (name.includes("gemini-3-flash-preview")) score += 840;
     else if (name.includes("gemini-3.1-flash-lite")) score += 820;
     else if (name.includes("gemini-2.5-flash")) score += 800;
     else if (name.includes("gemini-2.5-flash-lite")) score += 780;
     else if (name.includes("gemini-2-flash-lite")) score += 765;
     else if (name.includes("gemini-2-flash")) score += 760;
     else if (name.includes("glm-5-turbo")) score += 780;
     else if (name === "glm-5" || name.includes("glm-5 ")) score += 770;
     else if (name.includes("glm-4.7")) score += 740;
     else if (name.includes("glm-4-flashx-250414")) score += 735;
     else if (name.includes("glm-4-long")) score += 730;
     else if (name.includes("glm-4.6")) score += 720;
     else if (name.includes("glm-4.5-airx")) score += 700;
     else if (name.includes("glm-4.5-air")) score += 690;
     else if (name.includes("glm-4.7-flashx")) score += 680;
     else if (name.includes("glm-4.7-flash")) score += 670;
     else if (name.includes("qwen2.5-coder-32b-instruct")) score += 620;
     else if (name.includes("llama-4-maverick-17b-128e-instruct")) score += 610;
     else if (name.includes("llama-4-scout-17b-16e-instruct")) score += 600;
     else if (name.includes("llama-3.3-70b-instruct")) score += 590;
     else if (name.includes("qwen2-7b-instruct")) score += 520;
     else if (name.includes("glm-4-9b-chat")) score += 510;
     else if (name.includes("internlm2_5-7b-chat")) score += 500;
     else if (name.includes("mistral-7b-instruct")) score += 490;
     else if (name.includes("chatglm3-6b")) score += 470;
     else if (name.includes("qwen3-coder:free")) score += 300;
     else if (name.includes("nemotron-3-super-120b-a12b:free")) score += 280;
     else if (name.includes("openrouter/free")) score += 200;
     else if (name.includes("openrouter/auto")) score += 180;
     if (key !== "openai" && key !== "nvidia" && key !== "zai" && key !== "gemini" && key !== "siliconflow" && key !== "openrouter") score += 130;
     else if (key === "openai") score += 120;
     else if (key === "nvidia") score += 90;
     else if (key === "zai") score += 70;
     else if (key === "gemini") score += 40;
     else if (key === "siliconflow") score += 30;
     else if (key === "openrouter") score -= 1000;
     return score;
   };
   const sortMoonBitProviders = (providers) => [...providers].sort((a, b) => providerPriority(b?.key, b?.model) - providerPriority(a?.key, a?.model));
   const expandProviderSpec = (spec) => {
     const models = parseModelList(spec?.modelsText || spec?.model || "");
     if (models.length === 0) {
       return [{ key: spec?.key, providerName: spec?.providerName, custom: Boolean(spec?.custom), enabled: Boolean(spec?.enabled), model: "", baseUrl: spec?.baseUrl, apiKey: spec?.apiKey }];
     }
     return models.map((model) => ({ key: spec?.key, providerName: spec?.providerName, custom: Boolean(spec?.custom), enabled: Boolean(spec?.enabled), model, baseUrl: spec?.baseUrl, apiKey: spec?.apiKey }));
   };
   const readRouter = () => {
     try {
       const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
       return parsed && typeof parsed === "object" ? parsed : {};
     } catch (error) {
       console.warn("MoonAP reset invalid LLM router storage:", error);
       try { localStorage.removeItem("moonap.llm.router.v1"); } catch {}
       return {};
     }
   };
   const routerProfileVersion = 6;
   const providerConfigs = [
     {
       key: "openai",
       enabled: false,
       baseUrl: "moonap://llm-sim",
       models: [
         { id: "gpt-5.4", enabled: false }
       ]
     },
     {
       key: "nvidia",
       enabled: false,
       baseUrl: "https://integrate.api.nvidia.com/v1",
       models: [
         { id: "meta/llama-4-maverick-17b-128e-instruct", enabled: true }
       ]
     },
     {
       key: "zai",
       enabled: false,
       baseUrl: "https://open.bigmodel.cn/api/paas/v4",
       models: [
         { id: "glm-5.1", enabled: true }
       ]
     },
     {
       key: "gemini",
       enabled: false,
       baseUrl: "https://generativelanguage.googleapis.com",
       models: [
         { id: "gemini-3-flash-preview", enabled: false },
         { id: "gemini-3.1-flash-lite-preview", enabled: false },
         { id: "gemini-2.5-flash", enabled: false }
       ]
     },
     {
       key: "siliconflow",
       enabled: false,
       baseUrl: "https://api.siliconflow.cn/v1",
       models: [
         { id: "Qwen/Qwen2.5-Coder-32B-Instruct", enabled: false }
       ]
     },
     {
       key: "openrouter",
       enabled: false,
       baseUrl: "https://openrouter.ai/api/v1",
       models: [
         { id: "openrouter/auto", enabled: false }
       ]
     }
   ];
   const defaults = providerConfigs.flatMap((spec) =>
     spec.models.map((model) => ({
       key: spec.key,
       enabled: Boolean(spec.enabled && model.enabled),
       model: model.id,
       baseUrl: spec.baseUrl,
       apiKey: spec.key === "openai" ? "llm-sim-mode" : ""
     }))
   );
   const saved = readRouter();
   const mergeWithDefaults = (savedProviders, defaultProviders) => {
     const savedNormalized = Array.isArray(savedProviders) ? savedProviders.map(normalizeProviderEntry) : [];
     const defaultNormalized = defaultProviders.map(normalizeProviderEntry);
     const keys = providerConfigs.map((item) => item.key);
     const merged = [];
     for (const key of keys) {
       const defaultsForKey = defaultNormalized.filter((item) => item.key === key && String(item.model || "").trim() !== "");
       const savedForKey = savedNormalized.filter((item) => item.key === key && String(item.model || "").trim() !== "");
       const shared = savedForKey[0] || defaultsForKey[0] || { key, enabled: false, baseUrl: "", apiKey: "" };
       const useSavedToggles = Number(saved?.profile_version || 0) >= routerProfileVersion;
       const seen = new Map();
       for (const item of defaultsForKey) {
         const savedMatch = savedForKey.find((entry) => String(entry.model || "").toLowerCase() === String(item.model || "").toLowerCase());
         seen.set(String(item.model || "").toLowerCase(), {
           ...item,
           enabled: useSavedToggles ? Boolean(savedMatch?.enabled) : Boolean(item.enabled),
           baseUrl: String(shared.baseUrl || item.baseUrl || ""),
           apiKey: String(shared.apiKey || ""),
           test_status: String(savedMatch?.test_status || ""),
           test_message: String(savedMatch?.test_message || ""),
           tested_at: String(savedMatch?.tested_at || "")
         });
       }
       merged.push(...Array.from(seen.values()));
     }
     return sortMoonBitProviders(merged);
   };
   const savedNormalized = Array.isArray(saved.providers) ? saved.providers.map(normalizeProviderEntry) : [];
   const knownKeys = new Set(providerConfigs.map((item) => item.key));
   const savedCustom = savedNormalized.find((item) => item.custom) || savedNormalized.find((item) => item.key && !knownKeys.has(item.key));
   const providers = sortMoonBitProviders(mergeWithDefaults(saved.providers, defaults).concat(savedCustom ? [savedCustom] : []));
   try {
     localStorage.setItem("moonap.llm.router.v1", JSON.stringify({ providers, cursor: Number.isFinite(saved.cursor) ? saved.cursor : 0, savedAt: saved.savedAt || new Date().toISOString(), profile_version: routerProfileVersion }));
   } catch {}
   const grouped = {};
   for (const item of providers) {
     const key = String(item.key || "");
     if (!grouped[key]) grouped[key] = [];
     grouped[key].push(item);
   }
   const escapeHtml = (value) => String(value || "")
     .replaceAll("&", "&amp;")
     .replaceAll("<", "&lt;")
     .replaceAll(">", "&gt;")
     .replaceAll("\"", "&quot;");
   const bind = (name, ids) => {
     const items = grouped[name] || defaults.filter((entry) => entry.key === name) || [];
     const item = items[0] || {};
     const enable = document.querySelector(`#${ids.enable}`);
     const model = document.querySelector(`#${ids.model}`);
     const base = document.querySelector(`#${ids.base}`);
     const key = document.querySelector(`#${ids.key}`);
     if (enable) enable.checked = items.some((entry) => Boolean(entry.enabled));
     if (model) {
       model.innerHTML = items.map((entry, index) => {
         const modelId = String(entry.model || "");
         const checkboxId = `routerModelCheck-${name}-${index}`;
         return `<label class="router-model-option" for="${checkboxId}"><input id="${checkboxId}" type="checkbox" data-provider="${name}" value="${escapeHtml(modelId)}" ${entry.enabled ? "checked" : ""} /><span>${escapeHtml(modelId)}</span></label>`;
       }).join("");
     }
     if (base) base.value = String(item.baseUrl || "");
     if (key) key.value = String(item.apiKey || "");
     const syncDisabled = () => {
       const disabled = !Boolean(enable?.checked);
       model?.querySelectorAll("input[type=checkbox]")?.forEach((node) => { node.disabled = disabled; });
       if (model) model.style.opacity = disabled ? "0.55" : "1";
     };
     enable?.addEventListener("change", syncDisabled);
     syncDisabled();
   };
   bind("openai", { enable: "routerEnableOpenAI", model: "routerModelsOpenAI", base: "routerBaseOpenAI", key: "routerKeyOpenAI" });
   bind("nvidia", { enable: "routerEnableNVIDIA", model: "routerModelsNVIDIA", base: "routerBaseNVIDIA", key: "routerKeyNVIDIA" });
   bind("zai", { enable: "routerEnableZAI", model: "routerModelsZAI", base: "routerBaseZAI", key: "routerKeyZAI" });
   bind("gemini", { enable: "routerEnableGemini", model: "routerModelsGemini", base: "routerBaseGemini", key: "routerKeyGemini" });
   bind("siliconflow", { enable: "routerEnableSiliconFlow", model: "routerModelsSiliconFlow", base: "routerBaseSiliconFlow", key: "routerKeySiliconFlow" });
   bind("openrouter", { enable: "routerEnableOpenRouter", model: "routerModelsOpenRouter", base: "routerBaseOpenRouter", key: "routerKeyOpenRouter" });
   const customEnable = document.querySelector("#routerEnableCustom");
   const customProvider = document.querySelector("#routerProviderCustom");
   const customModel = document.querySelector("#routerModelCustom");
   const customBase = document.querySelector("#routerBaseCustom");
   const customKey = document.querySelector("#routerKeyCustom");
   if (customEnable) customEnable.checked = Boolean(savedCustom?.enabled);
   if (customProvider) customProvider.value = String(savedCustom?.providerName || savedCustom?.key || "");
   if (customModel) customModel.value = String(savedCustom?.model || "");
   if (customBase) customBase.value = String(savedCustom?.baseUrl || "");
   if (customKey) customKey.value = String(savedCustom?.apiKey || "");
   const syncCustomDisabled = () => {
     const disabled = !Boolean(customEnable?.checked);
     [customProvider, customModel, customBase, customKey].forEach((node) => {
       if (node) node.disabled = disabled;
     });
   };
   customEnable?.addEventListener("change", syncCustomDisabled);
   syncCustomDisabled();
   const setRouterTab = (name) => {
     const tabName = name === "simulated" ? "simulated" : "real";
     document.querySelectorAll("[data-router-tab]").forEach((node) => {
       const active = node.getAttribute("data-router-tab") === tabName;
       node.classList.toggle("is-active", active);
       node.setAttribute("aria-selected", active ? "true" : "false");
     });
     document.querySelectorAll("[data-router-panel]").forEach((node) => {
       node.classList.toggle("is-active", node.getAttribute("data-router-panel") === tabName);
     });
     try { localStorage.setItem("moonap.llm.router.activeTab", tabName); } catch {}
   };
   document.querySelectorAll("[data-router-tab]").forEach((node) => {
     node.addEventListener("click", () => setRouterTab(node.getAttribute("data-router-tab")));
   });
   setRouterTab(localStorage.getItem("moonap.llm.router.activeTab") === "simulated" ? "simulated" : "real");
   document.querySelectorAll(".router-row").forEach((node) => {
     node.style.display = "";
   });
   const verification = localStorage.getItem("moonap.formalVerification") === "true";
   const toggle = document.querySelector("#routerFormalVerification");
   if (toggle) toggle.checked = verification;
   const repairFeedbackRaw = localStorage.getItem("moonap.repairFeedbackMode") !== "summary";
   const repairFeedbackToggle = document.querySelector("#routerRepairUseRawCompilerOutput");
   if (repairFeedbackToggle) repairFeedbackToggle.checked = repairFeedbackRaw;
   document.querySelector("#llmDialog")?.showModal();
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app28browser__llm__is__configured = () => {
   let saved = {};
   try {
     const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
     saved = parsed && typeof parsed === "object" ? parsed : {};
   } catch (error) {
     console.warn("MoonAP reset invalid LLM router storage:", error);
     try { localStorage.removeItem("moonap.llm.router.v1"); } catch {}
   }
   const providers = Array.isArray(saved.providers) ? saved.providers : [];
   return providers.some((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed");
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary = () => {
   let saved = {};
   try {
     const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
     saved = parsed && typeof parsed === "object" ? parsed : {};
   } catch (error) {
     console.warn("MoonAP reset invalid LLM router storage:", error);
     try { localStorage.removeItem("moonap.llm.router.v1"); } catch {}
   }
   const providers = Array.isArray(saved.providers) ? saved.providers.filter((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed") : [];
   if (providers.length === 0) return "not configured";
   const labels = providers.map((item) => `${item.providerName || item.key}/${item.model}`);
   return `${providers.length} provider(s): ${labels.join(", ")}`;
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__render__onboarding = () => {
   const root = document.querySelector("#onboardingCard");
   if (!root) return;
   if (globalThis.__moonapMinimalShell !== false) {
     root.innerHTML = "";
     root.classList.remove("is-open");
     root.style.display = "none";
     return;
   }
   const benchmarkPrompt = "Write the smallest valid cmd/main/main.mbt that compiles under wasm-gc and returns the string hello moonbit. Return only the file contents.";
   const textarea = document.querySelector("#message");
   const currentValue = String(textarea?.value || "").trim();
   if (textarea && (currentValue === "" || textarea.classList.contains("suggested"))) {
     textarea.value = benchmarkPrompt;
     textarea.classList.add("suggested");
   }
   const readRouter = () => {
     try {
       const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
       return parsed && typeof parsed === "object" ? parsed : {};
     } catch {
       return {};
     }
   };
   const saved = readRouter();
   const providers = Array.isArray(saved.providers) ? saved.providers : [];
   const usable = providers.filter((item) => Boolean(item?.enabled) && String(item?.apiKey || "").trim() !== "" && String(item?.test_status || "") !== "failed");
   const primary = usable[0];
   const primaryLabel = primary ? `${String(primary.providerName || primary.key || "")}/${String(primary.model || "")}` : "Real API provider";
   let benchmark = {};
   try { benchmark = JSON.parse(globalThis.__moonapBenchmarkAssessment || "{}"); } catch { benchmark = {}; }
   const passedLevel = Number(benchmark?.pass ? benchmark.level || 0 : 0);
   const nextBenchmarkLevel = passedLevel >= 1 && passedLevel < 3 ? passedLevel + 1 : 1;
   const nextBenchmarkLabel = passedLevel >= 1 && passedLevel < 3 ? `Run Benchmark L${nextBenchmarkLevel}` : "Run Benchmark L1";
   const benchmarkSummary = passedLevel >= 1
     ? `MoonAP already verified Benchmark L${passedLevel}. Recommended next step: run L${nextBenchmarkLevel} to keep climbing the quality ladder.`
     : "MoonAP can now route requests through checked providers. Recommended next step: run MoonBit Benchmark Ladder at Level 1 to verify the full generate -> compile flow.";
   const isReady = usable.length > 0;
   root.classList.add("is-open");
   root.innerHTML = isReady
     ? `
       <strong>LLM Router is ready</strong>
       <small>${benchmarkSummary} Current primary route: ${primaryLabel}</small>
       <div class="onboarding-actions">
         <button id="onboardingRunBenchmark" type="button">${nextBenchmarkLabel}</button>
         <button id="onboardingOpenSkill" class="secondary" type="button">Open SKILL</button>
         <button id="onboardingEditLLM" class="secondary" type="button">Edit LLM Router</button>
         <button id="onboardingOpenLog" class="secondary" type="button">Open Runtime Log</button>
         <button id="onboardingDownloadLog" class="secondary" type="button">Download Log</button>
       </div>`
     : `
       <strong>Connect an LLM to begin</strong>
       <small>Configure a Real API provider to begin. Simulated API is still available inside LLM Router for local development and demos. After Save, MoonAP will test the checked models and show the usable order in Details.</small>
       <div class="onboarding-actions">
         <button id="onboardingEditLLM" type="button">Open LLM Router</button>
         <button id="onboardingOpenSkill" class="secondary" type="button">Browse SKILL</button>
         <button id="onboardingOpenLog" class="secondary" type="button">Open Runtime Log</button>
       </div>`;
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__open__runtime__log = () => {
   window.open("/api/logs/moonap-runtime.log", "_blank", "noopener,noreferrer");
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__download__runtime__log = async () => {
   try {
     const response = await fetch("/api/logs/moonap-runtime.log");
     const text = await response.text();
     const blob = new Blob([String(text || "")], { type: "text/plain;charset=utf-8" });
     const url = URL.createObjectURL(blob);
     const link = document.createElement("a");
     link.href = url;
     link.download = "moonap-runtime.log";
     document.body.append(link);
     link.click();
     link.remove();
     setTimeout(() => URL.revokeObjectURL(url), 1000);
   } catch (error) {
     throw new Error(`Runtime log download failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__export__last__artifact__bundle = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "exportSkillBundle") return;
   event.preventDefault();
   event.stopPropagation();
   const artifact = globalThis.__moonapLastArtifact;
   if (!artifact) {
     alert("No generated artifact is ready to export.");
     return;
   }
   const folder = String(artifact?.skill?.folder_name || "personal-fastq-generator");
   const source = String(artifact?.moonbit_source || "");
   const compileReport = globalThis.__moonapLastCompileReport || null;
   const compileOk = compileReport && typeof compileReport === "object" && compileReport.ok === true;
   const compileStatus = compileReport && typeof compileReport === "object"
     ? (compileReport.ok ? "done" : "failed")
     : "pending";
   const skillMd = [
     "# Personal FastQ Generator",
     "",
     "MoonBit source captured by MoonAP from a real LLM response.",
     "",
     "## Current state",
     "- LLM code generation: done",
     `- MoonBit to Wasm compile: ${compileStatus}`,
     "- Browser-local runtime execution: pending",
     "",
     "## Default parameters",
     "- `read_count = 10000`",
     "- `read_length = 150`",
     "- `n_rate = 0.01`",
     "- `random_seed = 42`",
     "",
     "This source bundle was exported from MoonAP for the next implementation step."
   ].join("\\n");
   const manifest = {
     bundle_version: "moonap.source-bundle.v1",
     folder_name: folder,
     exported_at: new Date().toISOString(),
     runtime_ready: false,
     compile_ready: Boolean(compileOk),
     compile_report: compileReport,
     files: [
       { path: "SKILL.md", content: skillMd },
       { path: "moonap.skill.json", content: JSON.stringify(artifact, null, 2) },
       { path: "program/main.mbt", content: source }
     ]
   };
   const blob = new Blob([JSON.stringify(manifest, null, 2)], { type: "application/json;charset=utf-8" });
   const url = URL.createObjectURL(blob);
   const link = document.createElement("a");
   link.href = url;
   link.download = `${folder}.moonap-source-bundle.json`;
   document.body.append(link);
   link.click();
   link.remove();
   setTimeout(() => URL.revokeObjectURL(url), 0);
   try { handler(String(folder)); } catch (error) { console.error("MoonAP export handler failed:", error); }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__on__compile__artifact = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "compileArtifact") return;
   event.preventDefault();
   event.stopPropagation();
   try {
     handler();
   } catch (error) {
     console.error("MoonAP compile probe handler failed:", error);
     alert(`MoonAP compile probe failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app22browser__on__llm__save = (handler) => document.addEventListener("click", async (event) => {
   if (event.target?.id !== "llmSave") return;
   event.preventDefault();
   event.stopPropagation();
   const routerProfileVersion = 6;
   const parseModelList = (raw) => {
     const seen = new Set();
     const values = String(raw || "")
       .split(/\r?\n|,/)
       .map((item) => String(item || "").trim())
       .filter((item) => item.length > 0);
     return values.filter((item) => {
       const key = item.toLowerCase();
       if (seen.has(key)) return false;
       seen.add(key);
       return true;
     });
   };
   const normalizeProviderEntry = (item) => {
     const key = String(item?.key || "").toLowerCase();
     const model = String(item?.model || "").trim();
     const apiKey = String(item?.apiKey || "").trim();
     const enabled = Boolean(item?.enabled);
     const custom = Boolean(item?.custom);
     const providerName = String(item?.providerName || "").trim();
     const test_status = String(item?.test_status || "").trim();
     const test_message = String(item?.test_message || "").trim();
     const tested_at = String(item?.tested_at || "").trim();
     let baseUrl = String(item?.baseUrl || "").trim();
     if (custom) {
       baseUrl = String(item?.baseUrl || "").trim();
     } else if (key === "gemini") {
       baseUrl = "https://generativelanguage.googleapis.com";
     } else if (key === "openrouter") {
       baseUrl = "https://openrouter.ai/api/v1";
     } else if (key === "zai") {
       baseUrl = "https://open.bigmodel.cn/api/paas/v4";
     } else if (key === "siliconflow") {
       baseUrl = "https://api.siliconflow.cn/v1";
     } else if (key === "openai") {
       baseUrl = "moonap://llm-sim";
     } else if (key === "nvidia") {
       baseUrl = "https://integrate.api.nvidia.com/v1";
     }
     return { key, providerName, custom, enabled, model, baseUrl, apiKey, test_status, test_message, tested_at };
   };
   const providerPriority = (provider, model) => {
     const key = String(provider || "").toLowerCase();
     const name = String(model || "").toLowerCase();
     let score = 0;
     if (name.includes("gpt-5.4")) score += 1200;
     else
     if (name.includes("llama-4-maverick-17b-128e-instruct")) score += 1000;
     else if (name.includes("glm-5.1")) score += 900;
     else if (name.includes("gemini-3-flash-preview")) score += 840;
     else if (name.includes("gemini-3.1-flash-lite")) score += 820;
     else if (name.includes("gemini-2.5-flash")) score += 800;
     else if (name.includes("gemini-2.5-flash-lite")) score += 780;
     else if (name.includes("gemini-2-flash-lite")) score += 765;
     else if (name.includes("gemini-2-flash")) score += 760;
     else if (name.includes("glm-5-turbo")) score += 780;
     else if (name === "glm-5" || name.includes("glm-5 ")) score += 770;
     else if (name.includes("glm-4.7")) score += 740;
     else if (name.includes("glm-4-flashx-250414")) score += 735;
     else if (name.includes("glm-4-long")) score += 730;
     else if (name.includes("glm-4.6")) score += 720;
     else if (name.includes("glm-4.5-airx")) score += 700;
     else if (name.includes("glm-4.5-air")) score += 690;
     else if (name.includes("glm-4.7-flashx")) score += 680;
     else if (name.includes("glm-4.7-flash")) score += 670;
     else if (name.includes("qwen2.5-coder-32b-instruct")) score += 620;
     else if (name.includes("llama-4-maverick-17b-128e-instruct")) score += 610;
     else if (name.includes("llama-4-scout-17b-16e-instruct")) score += 600;
     else if (name.includes("llama-3.3-70b-instruct")) score += 590;
     else if (name.includes("qwen2-7b-instruct")) score += 520;
     else if (name.includes("glm-4-9b-chat")) score += 510;
     else if (name.includes("internlm2_5-7b-chat")) score += 500;
     else if (name.includes("mistral-7b-instruct")) score += 490;
     else if (name.includes("chatglm3-6b")) score += 470;
     else if (name.includes("qwen3-coder:free")) score += 300;
     else if (name.includes("nemotron-3-super-120b-a12b:free")) score += 280;
     else if (name.includes("openrouter/free")) score += 200;
     else if (name.includes("openrouter/auto")) score += 180;
     if (key !== "openai" && key !== "nvidia" && key !== "zai" && key !== "gemini" && key !== "siliconflow" && key !== "openrouter") score += 130;
     else if (key === "openai") score += 120;
     else if (key === "nvidia") score += 90;
     else if (key === "zai") score += 70;
     else if (key === "gemini") score += 40;
     else if (key === "siliconflow") score += 30;
     else if (key === "openrouter") score -= 1000;
     return score;
   };
   const sortMoonBitProviders = (providers) => [...providers].sort((a, b) => providerPriority(b?.key, b?.model) - providerPriority(a?.key, a?.model));
   const collectCheckedModels = (selector) => Array.from(document.querySelectorAll(`${selector} input[type=checkbox]:checked`)).map((node) => String(node.value || "").trim()).filter((value) => value.length > 0);
   const normalizeCustomKey = (value) => {
     const raw = String(value || "").trim() || "custom";
     const key = raw.toLowerCase().replace(/[^a-z0-9._:-]+/g, "-").replace(/^-+|-+$/g, "") || "custom";
     return ["openai", "nvidia", "zai", "gemini", "siliconflow", "openrouter"].includes(key) ? `custom-${key}` : key;
   };
   const customProviderName = String(document.querySelector("#routerProviderCustom")?.value || "").trim() || "custom";
   const customModelName = String(document.querySelector("#routerModelCustom")?.value || "").trim();
   const providerSpecs = [
     { key: "openai", enabled: Boolean(document.querySelector("#routerEnableOpenAI")?.checked), models: collectCheckedModels("#routerModelsOpenAI"), baseUrl: String(document.querySelector("#routerBaseOpenAI")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyOpenAI")?.value || "").trim() },
     { key: "nvidia", enabled: Boolean(document.querySelector("#routerEnableNVIDIA")?.checked), models: collectCheckedModels("#routerModelsNVIDIA"), baseUrl: String(document.querySelector("#routerBaseNVIDIA")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyNVIDIA")?.value || "").trim() },
     { key: "zai", enabled: Boolean(document.querySelector("#routerEnableZAI")?.checked), models: collectCheckedModels("#routerModelsZAI"), baseUrl: String(document.querySelector("#routerBaseZAI")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyZAI")?.value || "").trim() },
     { key: "gemini", enabled: Boolean(document.querySelector("#routerEnableGemini")?.checked), models: collectCheckedModels("#routerModelsGemini"), baseUrl: String(document.querySelector("#routerBaseGemini")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyGemini")?.value || "").trim() },
     { key: "siliconflow", enabled: Boolean(document.querySelector("#routerEnableSiliconFlow")?.checked), models: collectCheckedModels("#routerModelsSiliconFlow"), baseUrl: String(document.querySelector("#routerBaseSiliconFlow")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeySiliconFlow")?.value || "").trim() },
     { key: "openrouter", enabled: Boolean(document.querySelector("#routerEnableOpenRouter")?.checked), models: collectCheckedModels("#routerModelsOpenRouter"), baseUrl: String(document.querySelector("#routerBaseOpenRouter")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyOpenRouter")?.value || "").trim() },
     { key: normalizeCustomKey(customProviderName), providerName: customProviderName, custom: true, enabled: Boolean(document.querySelector("#routerEnableCustom")?.checked), models: customModelName ? [customModelName] : [], baseUrl: String(document.querySelector("#routerBaseCustom")?.value || "").trim(), apiKey: String(document.querySelector("#routerKeyCustom")?.value || "").trim() }
   ];
   const providers = providerSpecs.flatMap((item) => item.models.map((model) => ({
     key: item.key,
     providerName: item.providerName || "",
     custom: Boolean(item.custom),
     enabled: Boolean(item.enabled),
     model,
     baseUrl: item.baseUrl,
     apiKey: item.apiKey
   })));
   const sortedProviders = sortMoonBitProviders(providers.map(normalizeProviderEntry));
   const active = sortedProviders.filter((item) => item.enabled && item.apiKey && item.model && item.baseUrl);
   if (active.length === 0) {
     alert("Please enable at least one provider, choose or enter a model, and fill endpoint URL plus API key.");
     return;
   }
   const statusNode = document.querySelector("#routerTestStatus");
   const saveButton = document.querySelector("#llmSave");
   const dialog = document.querySelector("#llmDialog");
   const setStatus = (text) => {
     if (statusNode) statusNode.textContent = String(text || "");
   };
   const openDetails = () => {
     const root = document.querySelector(".app-shell");
     const button = document.querySelector("#detailsToggle");
     if (!root || !button) return;
     root.classList.add("details-open");
     button.setAttribute("aria-expanded", "true");
   };
   const updateProcess = (provider, stage, result, logText) => {
     const setText = (selector, value) => {
       const node = document.querySelector(selector);
       if (node) node.textContent = String(value);
     };
     setText("#processProvider", provider || "-");
     setText("#processStage", stage || "-");
     setText("#processResult", result || "waiting");
     setText("#processLog", logText || "");
   };
   const proxyPost = async (url, headers, body) => {
     const envelope = [
       `URL\t${String(url)}`,
       ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
       "BODY",
       String(body)
     ].join("\n");
     const controller = new AbortController();
     const timeout = setTimeout(() => controller.abort(), 30000);
     try {
       const response = await fetch("/api/llm/proxy", {
         method: "POST",
         headers: { "Content-Type": "text/plain; charset=utf-8" },
         body: envelope,
         signal: controller.signal
       });
       const text = await response.text();
       let json = {};
       try {
         json = JSON.parse(text);
       } catch {
         const plain = String(text || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
         throw new Error(`Provider returned non-JSON (${response.status}): ${(plain || text || "").slice(0, 180)}`);
       }
       if (!response.ok) {
         const detail = json?.error?.detail ? ` ${String(json.error.detail)}` : "";
         throw new Error((json?.error?.message || `LLM request failed (${response.status})`) + detail);
       }
       return json;
     } catch (error) {
       if (error && error.name === "AbortError") {
         throw new Error("Timed out after 30s");
       }
       throw error;
     } finally {
       clearTimeout(timeout);
     }
   };
   const testProvider = async (llm) => {
     if (llm.key === "gemini") {
       const url = `${llm.baseUrl}/v1beta/models/${encodeURIComponent(llm.model)}:generateContent`;
       const json = await proxyPost(url, {
         "Content-Type": "application/json",
         "x-goog-api-key": String(llm.apiKey || "")
       }, JSON.stringify({
         contents: [{ role: "user", parts: [{ text: "Reply with OK." }] }],
         generationConfig: { temperature: 0, maxOutputTokens: 8 }
       }));
       const text = (json?.candidates?.[0]?.content?.parts || []).map((part) => String(part?.text || "")).join(" ").trim();
       return text || "OK";
     }
     let urlBase = String(llm.baseUrl || "").trim();
     urlBase = urlBase.endsWith("/") ? urlBase.slice(0, -1) : urlBase;
     let url = `${urlBase}/chat/completions`;
     if (llm.key === "zai") {
       if (urlBase.endsWith("/chat/completions")) {
         url = urlBase;
       } else if (!urlBase.includes("/api/paas/v4")) {
         url = `${urlBase}/api/paas/v4/chat/completions`;
       }
     }
     const headers = {
       "Content-Type": "application/json",
       "Authorization": `Bearer ${String(llm.apiKey || "")}`
     };
     if (llm.key === "openrouter") {
       headers["HTTP-Referer"] = "http://127.0.0.1:3000";
       headers["X-Title"] = "MoonAP";
     }
     const json = await proxyPost(url, headers, JSON.stringify({
       model: llm.model,
       messages: [{ role: "user", content: "Reply with OK." }],
       temperature: 0,
       max_tokens: 8
     }));
     const text = String(json?.choices?.[0]?.message?.content || "").trim();
     return text || "OK";
   };
   localStorage.setItem("moonap.formalVerification", String(Boolean(document.querySelector("#routerFormalVerification")?.checked)));
   localStorage.setItem("moonap.repairFeedbackMode", Boolean(document.querySelector("#routerRepairUseRawCompilerOutput")?.checked) ? "raw" : "summary");
   const enabled = localStorage.getItem("moonap.formalVerification") === "true";
   const mainToggle = document.querySelector("#formalVerification");
   if (mainToggle) mainToggle.checked = enabled;
   if (saveButton) {
     saveButton.disabled = true;
     saveButton.textContent = "Saving...";
   }
   setStatus("Saving router config and testing enabled LLM APIs...");
   openDetails();
   dialog?.close();
   updateProcess(
     "LLM Router",
     "llm-api-test",
     "running",
     "Saving router config and testing enabled LLM APIs..."
   );
   try {
     const lines = [];
     const results = [];
     for (const item of active) {
       const label = `${item.providerName || item.key}/${item.model}`;
       lines.push(`[running] ${label}`);
       setStatus(lines.join("\n"));
       updateProcess("LLM Router", "llm-api-test", "running", lines.join("\n"));
       try {
         const result = await testProvider(item);
         lines[lines.length - 1] = `[ok] ${label} -> ${String(result).slice(0, 80)}`;
         results.push({ key: item.key, model: item.model, ok: true, message: String(result || "OK") });
       } catch (error) {
         const message = error instanceof Error ? error.message : String(error);
         lines[lines.length - 1] = `[failed] ${label} -> ${message}`;
         results.push({ key: item.key, model: item.model, ok: false, message });
       }
       setStatus(lines.join("\n"));
       updateProcess("LLM Router", "llm-api-test", "running", lines.join("\n"));
     }
     const testedAt = new Date().toISOString();
     const providersWithHealth = sortedProviders.map((item) => {
       const match = results.find((result) => result.key === item.key && result.model === item.model);
       if (!item.enabled || !item.apiKey || !item.model) {
         return { ...item, test_status: "skipped", test_message: "Disabled or incomplete.", tested_at: testedAt };
       }
       if (!match) {
         return { ...item, test_status: "failed", test_message: "No test result captured.", tested_at: testedAt };
       }
       return { ...item, test_status: match.ok ? "ok" : "failed", test_message: match.message, tested_at: testedAt };
     });
     const usable = providersWithHealth.filter((item) => item.enabled && item.apiKey && item.test_status === "ok");
     const orderLines = usable.length === 0
       ? ["No enabled provider passed the API test."]
       : usable.map((item, index) => `${index + 1}. ${item.providerName || item.key}/${item.model}`);
     const summary = lines.join("\n") + "\n\nFinal usable provider order:\n" + orderLines.join("\n");
     localStorage.setItem("moonap.llm.router.v1", JSON.stringify({
       providers: providersWithHealth,
       cursor: 0,
       savedAt: testedAt,
       last_test_summary: summary,
       profile_version: routerProfileVersion
     }));
     setStatus(summary);
     updateProcess(
       usable.length === 0 ? "LLM Router" : usable.map((item) => `${item.providerName || item.key}/${item.model}`).join(", "),
       "llm-api-test",
       usable.length === 0 ? "failed" : "succeeded",
       summary
     );
     handler();
   } catch (error) {
     console.error("MoonAP llm save handler failed:", error);
     const message = error instanceof Error ? error.message : String(error);
     setStatus(message);
     updateProcess("LLM Router", "llm-api-test", "failed", message);
     alert(`MoonAP LLM save failed: ${message}`);
   } finally {
     if (saveButton) {
       saveButton.disabled = false;
       saveButton.textContent = "Save";
     }
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__on__llm__cancel = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "llmCancel") return;
   event.preventDefault();
   document.querySelector("#llmDialog")?.close();
   try {
     handler();
   } catch (error) {
     console.error("MoonAP llm cancel handler failed:", error);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__generate__moonbit__artifact = async (taskTitle, prompt, simpleMode, formalVerification, knowledgePack, onDone, onError) => {
   try {
     const readRouter = () => {
       try {
         const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
         return parsed && typeof parsed === "object" ? parsed : {};
       } catch (error) {
         console.warn("MoonAP reset invalid LLM router storage:", error);
         try { localStorage.removeItem("moonap.llm.router.v1"); } catch {}
         return {};
       }
     };
     const saved = readRouter();
     const providers = Array.isArray(saved.providers) ? saved.providers.filter((item) => item.enabled && String(item.apiKey || "").trim() !== "" && String(item.test_status || "") !== "failed") : [];
     if (providers.length === 0) {
       throw new Error("No enabled LLM provider is available in the router.");
     }
     const cursor = Number.isFinite(saved.cursor) ? saved.cursor : 0;
     const start = ((cursor % providers.length) + providers.length) % providers.length;
     const ordered = providers.slice(start).concat(providers.slice(0, start));
     const lowerTaskTitle = String(taskTitle || "").toLowerCase();
     const lowerPrompt = String(prompt || "").toLowerCase();
     const inferTaskKind = () => {
       if (lowerPrompt.includes("fastq") || lowerTaskTitle.includes("fastq")) return "fastq-generator";
       if (lowerPrompt.includes("excel") || lowerPrompt.includes("xlsx") || lowerPrompt.includes("spreadsheet")) return "excel-analysis";
       if ((lowerPrompt.includes("browser") && lowerPrompt.includes("game")) || lowerTaskTitle.includes("game")) return "browser-game";
       return "generic-moonbit";
     };
     const taskAdapterLines = (taskKind) => {
       if (taskKind === "fastq-generator") {
         return [
           "- generate one or more valid FastQ records",
           "- each record should include header, sequence, plus line, and quality line"
         ];
       }
       if (taskKind === "excel-analysis") {
         return [
           "- assume the task logic should work on spreadsheet-like tabular input",
           "- keep the result representation simple and easy for MoonAP to inspect or display"
         ];
       }
       if (taskKind === "browser-game") {
         return [
           "- keep the gameplay loop simple and direct",
           "- keep the program structure easy to compile and run inside MoonAP"
         ];
       }
       return [];
     };
     const updatePrompts = (modeText, systemPromptText, userPromptText) => {
       const setText = (selector, value) => {
         const node = document.querySelector(selector);
         if (node) node.textContent = String(value);
       };
       setText("#promptMode", modeText || "No LLM prompt captured yet.");
       setText("#promptSystem", systemPromptText || "No LLM prompt captured yet.");
       setText("#promptUser", userPromptText || "No LLM prompt captured yet.");
     };
     const buildCodegenPrompts = (llm) => {
       const taskKind = inferTaskKind();
       const systemPrompt = [
         "You are an AI coder.",
         "You only write MoonBit code.",
         "Your job is to write MoonBit code for the user's task.",
         "For ordinary form-style apps, include a MoonAP declarative runtime contract in line comments before main:",
         "/// MOONAP_RUNTIME_SPEC_BEGIN",
         "/// {",
         "///   \"mode\": \"form\",",
         "///   \"title\": \"Short app title\",",
         "///   \"action_label\": \"Run app\",",
         "///   \"fields\": [{\"name\":\"input_name\",\"label\":\"Input label\",\"type\":\"float\",\"default\":1,\"step\":0.01}],",
         "///   \"computed_outputs\": [{\"name\":\"output_name\",\"label\":\"Output label\",\"expression\":\"input_name * 2\",\"decimals\":2}],",
         "///   \"result_template\": \"Input: {{input_name}}\\nOutput: {{output_name}}\",",
         "///   \"summary_template\": \"Calculated output {{output_name}}.\"",
         "/// }",
         "/// MOONAP_RUNTIME_SPEC_END",
         "Use computed_outputs expressions only for simple arithmetic over numeric fields using +, -, *, /, pow(...), sqrt(...), abs(...), min(...), max(...), and parentheses.",
         "For text analyzers, use mode=form with tool_kind=text-analysis and one text field named input_text.",
         "For JSON formatter/validator apps, use mode=form with tool_kind=json-formatter and one text field named json_text.",
         "For CSV/TSV analyzers, use mode=file with analysis_type=csv-summary and io_contract.browser_local_only=true.",
         "Choose semantic field names and labels from the user's task instead of generic input_text.",
         "Return only the full contents of cmd/main/main.mbt."
       ].join("\\n");
       const userPrompt = String(prompt || "");
       return {
         modeText: "codegen / frontier-direct",
         systemPrompt,
         userPrompt
       };
     };
     const proxyPost = async (url, headers, body) => {
       const envelope = [
         `URL\t${String(url)}`,
         ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
         "BODY",
         String(body)
       ].join("\n");
       const response = await fetch("/api/llm/proxy", {
         method: "POST",
         headers: { "Content-Type": "text/plain; charset=utf-8" },
         body: envelope
       });
       const text = await response.text();
       let json = {};
       try {
         json = JSON.parse(text);
       } catch {
         const plain = String(text || "")
           .replace(/<script[\s\S]*?<\/script>/gi, " ")
           .replace(/<style[\s\S]*?<\/style>/gi, " ")
           .replace(/<[^>]+>/g, " ")
           .replace(/\s+/g, " ")
           .trim();
         const summarized = plain || `MoonAP proxy returned non-JSON (${response.status})`;
         throw new Error(`Provider returned non-JSON (${response.status}): ${summarized.slice(0, 240)}`);
       }
       if (!response.ok) {
         const detail = json?.error?.detail ? ` ${String(json.error.detail)}` : "";
         throw new Error((json?.error?.message || `LLM request failed (${response.status})`) + detail);
       }
       return json;
     };
     const requestJson = async (llm) => {
       const promptPack = buildCodegenPrompts(llm);
       updatePrompts(promptPack.modeText, promptPack.systemPrompt, promptPack.userPrompt);
       const codegenConversationHistory = [
         { role: "user", content: String(prompt || "") }
       ];
       if (llm.provider === "gemini") {
         const url = `${llm.baseUrl}/v1beta/models/${encodeURIComponent(llm.model)}:generateContent`;
         const json = await proxyPost(
           url,
           { "Content-Type": "application/json", "x-goog-api-key": String(llm.apiKey || "") },
           JSON.stringify({
             system_instruction: { parts: [{ text: promptPack.systemPrompt }] },
             contents: [{ role: "user", parts: [{ text: promptPack.userPrompt }] }],
             generationConfig: { temperature: 0.2 }
           })
         );
         const text = (json?.candidates?.[0]?.content?.parts || []).map((part) => String(part?.text || "")).join("\\n").trim();
         if (!text) throw new Error("Gemini returned no MoonBit source.");
         return { source: text, raw: json, conversation_history: codegenConversationHistory };
       }
       const rawBaseUrl = String(llm.baseUrl || "").trim();
       const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
       let url = `${baseUrl}/chat/completions`;
       if (llm.provider === "zai") {
         if (baseUrl.endsWith("/chat/completions")) {
           url = baseUrl;
         } else if (baseUrl === "https://open.bigmodel.cn" || baseUrl === "https://open.bigmodel.cn/") {
           url = "https://open.bigmodel.cn/api/paas/v4/chat/completions";
         } else if (!baseUrl.includes("/api/paas/v4")) {
           url = `${baseUrl}/api/paas/v4/chat/completions`;
         }
       }
       const headers = {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${String(llm.apiKey || "")}`
       };
       if (llm.provider === "openrouter") {
         headers["HTTP-Referer"] = "http://127.0.0.1:3000";
         headers["X-Title"] = "MoonAP";
       }
       const json = await proxyPost(
         url,
         headers,
         JSON.stringify({
           model: llm.model,
           messages: [
             { role: "system", content: promptPack.systemPrompt },
             { role: "user", content: promptPack.userPrompt }
           ],
           temperature: 0.2
         })
       );
       const text = String(json?.choices?.[0]?.message?.content || "").trim();
       if (!text) throw new Error(`${llm.provider} returned no MoonBit source.`);
       return { source: text, raw: json, conversation_history: codegenConversationHistory };
     };
     let generated = null;
     let llm = null;
     const failures = [];
     for (let index = 0; index < ordered.length; index += 1) {
       const item = ordered[index];
       const candidate = {
         provider: item.key,
         model: item.model,
         baseUrl: item.baseUrl,
         apiKey: item.apiKey,
         rotated: providers.length > 1
       };
       try {
         generated = await requestJson(candidate);
         llm = candidate;
         const nextCursor = (start + index + 1) % providers.length;
         localStorage.setItem("moonap.llm.router.v1", JSON.stringify({
           providers: Array.isArray(saved.providers) ? saved.providers : providers,
           cursor: nextCursor,
           savedAt: saved.savedAt || new Date().toISOString()
         }));
         break;
       } catch (error) {
         failures.push(`${String(item.key || "provider")}/${String(item.model || "model")}: ${error instanceof Error ? error.message : String(error)}`);
       }
     }
     if (!generated || !llm) {
       throw new Error(`All enabled providers failed during code generation. ${failures.join(" | ")}`);
     }
     const ensureExtractMoonBitSource = () => {
       if (typeof globalThis.__moonapExtractMoonBitSource === "function") return globalThis.__moonapExtractMoonBitSource;
       globalThis.__moonapExtractMoonBitSource = (value) => {
         const text = String(value || "").trim();
         if (!text) return "";
         const extract = (source, startMarker, endMarker) => {
           const start = source.indexOf(startMarker);
           if (start < 0) return "";
           const after = source.slice(start + startMarker.length).trim();
           if (!after) return "";
           const end = after.indexOf(endMarker);
           if (end < 0) return "";
           return after.slice(0, end).trim();
         };
         const patterns = [
           ["FILE: cmd/main/main.mbt", "END_FILE"],
           ['<moonbit-file path="cmd/main/main.mbt">', "</moonbit-file>"],
           ["```moonbit", "```"],
           ["```mbt", "```"],
           ["```", "```"]
         ];
         for (const [startMarker, endMarker] of patterns) {
           const extracted = extract(text, startMarker, endMarker);
           if (extracted) return extracted;
         }
         return text;
       };
       return globalThis.__moonapExtractMoonBitSource;
     };
     const source = ensureExtractMoonBitSource()(String(generated.source || ""));
     const slug = String(taskTitle || "moonbit-task")
       .toLowerCase()
       .replace(/[^a-z0-9]+/g, "-")
       .replace(/^-+|-+$/g, "") || "moonbit-task";
     const artifact = {
       schema_version: "moonap.artifact.v1",
       id: slug,
       name: String(taskTitle || "MoonBit Task"),
       prompt: String(prompt),
       llm_provider: llm.provider || "unknown",
       llm_model: llm.model || "unknown",
       llm_rotated: Boolean(llm.rotated),
       stages: [
         { name: "llm-codegen", status: "ok", output: `MoonBit source generated by ${llm.provider}/${llm.model}` },
         { name: "formal-verification", status: formalVerification ? "reserved" : "skipped", output: formalVerification ? "moon prove hook reserved" : "disabled by user/default" },
         { name: "moonbit-wasm-compile", status: "pending", output: "Real MoonBit-to-Wasm compile is the next implementation step." },
         { name: "browser-local-run", status: "pending", output: "Browser-local execution will start after compile is wired." }
       ],
       skill: {
         folder_name: slug,
         description_file: "SKILL.md",
         program_dir: "program",
         parameters: {}
       },
       moonbit_source: source,
       conversation_history: [
         ...(Array.isArray(generated?.conversation_history) ? generated.conversation_history : [{ role: "user", content: String(prompt || "") }]),
         { role: "assistant", content: source }
       ],
       knowledge_pack_version: "moonbit-primer-v1",
       llm_response_preview: JSON.stringify(generated.raw).slice(0, 1200),
       wasm_runtime: {
         target: "wasm-gc",
         browser_local: true,
         uploaded_bytes: 0,
         note: "Pending real compile and runtime execution."
       },
       created_at: new Date().toISOString()
     };
     globalThis.__moonapLastArtifact = artifact;
     onDone(JSON.stringify(artifact, null, 2));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__run__free__llm__moonbit__eval = async (maxLevel, onDone, onError) => {
   try {
     if (globalThis.__moonapEvalRunning) {
       throw new Error("A MoonBit experiment run is already in progress.");
     }
     globalThis.__moonapEvalRunning = true;
     const clampLevel = (value) => Math.max(1, Math.min(3, Number(value || 3)));
     const nowIso = () => new Date().toISOString();
     const ensureExtractMoonBitSource = () => {
       if (typeof globalThis.__moonapExtractMoonBitSource === "function") return globalThis.__moonapExtractMoonBitSource;
       globalThis.__moonapExtractMoonBitSource = (value) => {
         const sourceText = String(value || "").trim();
         if (!sourceText) return "";
         const extract = (source, startMarker, endMarker) => {
           const start = source.indexOf(startMarker);
           if (start < 0) return "";
           const after = source.slice(start + startMarker.length).trim();
           if (!after) return "";
           const end = after.indexOf(endMarker);
           if (end < 0) return "";
           return after.slice(0, end).trim();
         };
         const patterns = [
           ["FILE: cmd/main/main.mbt", "END_FILE"],
           ['<moonbit-file path="cmd/main/main.mbt">', "</moonbit-file>"],
           ["```moonbit", "```"],
           ["```mbt", "```"],
           ["```", "```"]
         ];
         for (const [startMarker, endMarker] of patterns) {
           const extracted = extract(sourceText, startMarker, endMarker);
           if (extracted) return extracted;
         }
         return sourceText;
       };
       return globalThis.__moonapExtractMoonBitSource;
     };
     const cleanSource = (text) => ensureExtractMoonBitSource()(String(text || ""));
     const parseModelList = (raw) => {
       const seen = new Set();
       return String(raw || "")
         .split(/\r?\n|,/)
         .map((item) => String(item || "").trim())
         .filter((item) => item.length > 0)
         .filter((item) => {
           const key = item.toLowerCase();
           if (seen.has(key)) return false;
           seen.add(key);
           return true;
         });
     };
     const normalizeProviderEntry = (item) => {
       const key = String(item?.key || "").toLowerCase();
       let baseUrl = String(item?.baseUrl || "").trim();
       if (key === "gemini") baseUrl = "https://generativelanguage.googleapis.com";
       else if (key === "openrouter") baseUrl = "https://openrouter.ai/api/v1";
       else if (key === "zai") baseUrl = "https://open.bigmodel.cn/api/paas/v4";
       else if (key === "siliconflow") baseUrl = "https://api.siliconflow.cn/v1";
       else if (key === "openai") baseUrl = "moonap://llm-sim";
       else if (key === "nvidia") baseUrl = "https://integrate.api.nvidia.com/v1";
       return {
         key,
         provider: key,
         enabled: Boolean(item?.enabled),
         model: String(item?.model || "").trim(),
         baseUrl,
         apiKey: String(item?.apiKey || "").trim()
       };
     };
     const readRouter = () => {
       try {
         const parsed = JSON.parse(localStorage.getItem("moonap.llm.router.v1") || "{}");
         return parsed && typeof parsed === "object" ? parsed : {};
       } catch {
         return {};
       }
     };
     const updatePrompts = (modeText, systemPromptText, userPromptText) => {
       const setText = (selector, value) => {
         const node = document.querySelector(selector);
         if (node) node.textContent = String(value || "");
       };
       setText("#promptMode", modeText || "No LLM prompt captured yet.");
       setText("#promptSystem", systemPromptText || "No LLM prompt captured yet.");
       setText("#promptUser", userPromptText || "No LLM prompt captured yet.");
     };
     const updateProcess = (provider, stage, result, logText, sourceText = "") => {
       const setText = (selector, value) => {
         const node = document.querySelector(selector);
         if (node) node.textContent = String(value || "");
       };
       setText("#processProvider", provider || "-");
       setText("#processStage", stage || "-");
       setText("#processResult", result || "waiting");
       setText("#processLog", logText || "");
       if (sourceText !== "") setText("#processSource", sourceText || "No generated source yet.");
     };
     const proxyPost = async (url, headers, body, timeoutMs) => {
       const envelope = [
         `URL\t${String(url)}`,
         ...Object.entries(headers || {}).map(([key, value]) => `HEADER\t${String(key)}\t${String(value).replace(/\r?\n/g, " ")}`),
         "BODY",
         String(body)
       ].join("\n");
       const controller = new AbortController();
       const timeout = setTimeout(() => controller.abort(), timeoutMs);
       const started = performance.now();
       try {
         const response = await fetch("/api/llm/proxy", {
           method: "POST",
           headers: { "Content-Type": "text/plain; charset=utf-8" },
           body: envelope,
           signal: controller.signal
         });
         const text = await response.text();
         let json = {};
         try {
           json = JSON.parse(text);
         } catch {
           const plain = String(text || "").replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
           const err = new Error(`Provider returned non-JSON (${response.status}): ${(plain || text || "").slice(0, 240)}`);
           err.nonJson = true;
           err.httpStatus = response.status;
           throw err;
         }
         if (!response.ok) {
           const detail = json?.error?.detail ? ` ${String(json.error.detail)}` : "";
           const err = new Error((json?.error?.message || `LLM request failed (${response.status})`) + detail);
           err.httpStatus = response.status;
           throw err;
         }
         return { json, latencyMs: Math.round(performance.now() - started) };
       } catch (error) {
         if (error && error.name === "AbortError") {
           const timeoutError = new Error(`Timed out after ${Math.round(timeoutMs / 1000)}s`);
           timeoutError.timeout = true;
           throw timeoutError;
         }
         throw error;
       } finally {
         clearTimeout(timeout);
       }
     };
     const compileSource = async (sourceText) => {
       const response = await fetch("/api/artifact/compile", {
         method: "POST",
         headers: { "Content-Type": "text/plain; charset=utf-8" },
         body: String(sourceText || "")
       });
       const text = await response.text();
       return JSON.parse(text);
     };
     const assessFastqSource = (sourceText) => {
       const source = String(sourceText || "");
       const lower = source.toLowerCase();
       const hasImport = /\bimport\b/.test(lower);
       const hasMain = /\bfn\s+main\b/.test(source);
       const fnNames = Array.from(source.matchAll(/\bfn\s+([A-Za-z_][A-Za-z0-9_]*)/g)).map((item) => String(item[1] || ""));
       const helperNames = fnNames.filter((item) => item !== "main");
       const hasFastqHeader = source.includes("@SEQ") || source.includes("@moonap") || source.includes("\"@\"") || source.includes("@read");
       const hasFastqPlus = source.includes("\\n+\\n") || source.includes("\"+\"") || source.includes("+\\n");
       const hasQuality = source.includes("IIII") || lower.includes("qual");
       const hasSequenceLogic = /A|C|G|T|N/.test(source) && (/\bif\b|\bmatch\b|\bfor\b|\bwhile\b/.test(source) || helperNames.length > 0);
       const missingSignals = [];
       if (!hasMain) missingSignals.push("define fn main");
       if (hasImport) missingSignals.push("remove import usage");
       if (!hasFastqHeader) missingSignals.push("emit a visible FastQ header such as @SEQ or @moonap");
       if (!hasFastqPlus) missingSignals.push("emit a plus line between sequence and quality");
       if (!hasQuality) missingSignals.push("generate an explicit quality string such as IIII or qual");
       if (!hasSequenceLogic) missingSignals.push("include visible sequence-generation logic over A/C/G/T/N");
       const pass = hasMain && !hasImport && hasFastqHeader && hasFastqPlus && hasQuality && hasSequenceLogic;
       return {
         pass,
         title: pass ? "FastQ Generator task passed" : "Compile succeeded, but FastQ Generator task failed",
         summary: pass
           ? "Compile succeeded and the generated MoonBit source shows the expected FastQ structure: a header, sequence logic, plus line, and quality generation without imports."
           : "Compile succeeded, but the generated MoonBit source does not yet look like a usable FastQ generator. MoonAP expected visible FastQ structure, sequence-generation logic, and a quality line without imports.",
         repairHint: "Keep the program compiling, but make the MoonBit source visibly look like a FastQ generator with header, sequence, plus line, and quality generation.",
         missingSignals
       };
     };
     const buildMarkdown = (results) => {
       const models = Array.isArray(results?.models) ? results.models : [];
       const formatCell = (benchmark) => {
         if (!benchmark?.attempted) return "not-run";
         if (benchmark?.raw_codegen_pass) return benchmark?.raw_quality_pass ? "raw-pass+quality" : "raw-compile-only";
         if (benchmark?.assisted_pass) return benchmark?.final_quality_pass ? `assist-pass+quality (${Number(benchmark?.repair_attempts_used || 0)} repairs)` : `assist-compile-only (${Number(benchmark?.repair_attempts_used || 0)} repairs)`;
         return "fail";
       };
       return [
         "# Free LLM FastQ generator ability of generating MoonBit code",
         "",
         `Last updated: ${nowIso()}`,
         "",
         "## Current summary",
         "",
         "| Provider | Model | API | API ms | FQ1 | Notes |",
         "| --- | --- | --- | ---: | --- | --- |",
         ...models.map((item) => {
           const note = item?.notes?.final_recommendation_note || item?.api_test?.message || "";
           return `| ${String(item?.provider || "")} | ${String(item?.model || "")} | ${String(item?.api_test?.status || "")} | ${String(item?.api_test?.latency_ms ?? "")} | ${formatCell(item?.benchmarks?.FQ1)} | ${String(note).replace(/\|/g, "/")} |`;
         }),
         "",
         "## Raw JSON",
         "",
         "See `artifacts/moonbit-eval-results.json` for the full structured record."
       ].join("\n");
     };
     const persistResults = async (results) => {
       const warnings = Array.isArray(results?.persistence_warnings) ? results.persistence_warnings : [];
       const pushWarning = (message) => {
         const text = String(message || "").trim();
         if (!text) return;
         if (!warnings.includes(text)) warnings.push(text);
         results.persistence_warnings = warnings;
         console.warn("MoonAP experiment persistence warning:", text);
       };
       try {
         const jsonResponse = await fetch("/api/experiments/free-llm-moonbit/results.json", {
           method: "POST",
           headers: { "Content-Type": "application/json; charset=utf-8" },
           body: JSON.stringify(results, null, 2)
         });
         if (!jsonResponse.ok) {
           pushWarning(`results.json persist failed (${jsonResponse.status})`);
         }
       } catch (error) {
         pushWarning(`results.json persist failed: ${error instanceof Error ? error.message : String(error)}`);
       }
       try {
         const markdownResponse = await fetch("/api/experiments/free-llm-moonbit/results.md", {
           method: "POST",
           headers: { "Content-Type": "text/markdown; charset=utf-8" },
           body: buildMarkdown(results)
         });
         if (!markdownResponse.ok) {
           pushWarning(`results.md persist failed (${markdownResponse.status})`);
         }
       } catch (error) {
         pushWarning(`results.md persist failed: ${error instanceof Error ? error.message : String(error)}`);
       }
     };
     const requestMoonBit = async (llm, systemPrompt, userPrompt, timeoutMs, maxTokens = 512, mode = "eval / raw-codegen") => {
       updatePrompts(mode, systemPrompt, userPrompt);
       if (llm.provider === "gemini") {
         const url = `${llm.baseUrl}/v1beta/models/${encodeURIComponent(llm.model)}:generateContent`;
         const { json, latencyMs } = await proxyPost(url, {
           "Content-Type": "application/json",
           "x-goog-api-key": String(llm.apiKey || "")
         }, JSON.stringify({
           system_instruction: { parts: [{ text: systemPrompt }] },
           contents: [{ role: "user", parts: [{ text: userPrompt }] }],
           generationConfig: { temperature: 0, maxOutputTokens: maxTokens }
         }), timeoutMs);
         const text = (json?.candidates?.[0]?.content?.parts || []).map((part) => String(part?.text || "")).join("\n").trim();
         return { source: cleanSource(text), latencyMs };
       }
       const rawBaseUrl = String(llm.baseUrl || "").trim();
       const baseUrl = rawBaseUrl.endsWith("/") ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
       let url = `${baseUrl}/chat/completions`;
       if (llm.provider === "zai" && !baseUrl.endsWith("/chat/completions") && !baseUrl.includes("/api/paas/v4")) {
         url = `${baseUrl}/api/paas/v4/chat/completions`;
       }
       const headers = {
         "Content-Type": "application/json",
         "Authorization": `Bearer ${String(llm.apiKey || "")}`
       };
       if (llm.provider === "openrouter") {
         headers["HTTP-Referer"] = "http://127.0.0.1:3000";
         headers["X-Title"] = "MoonAP";
       }
       const { json, latencyMs } = await proxyPost(url, headers, JSON.stringify({
         model: llm.model,
         messages: [
           { role: "system", content: systemPrompt },
           { role: "user", content: userPrompt }
         ],
         temperature: 0,
         max_tokens: maxTokens
       }), timeoutMs);
       return { source: cleanSource(String(json?.choices?.[0]?.message?.content || "")), latencyMs };
     };
     const repairRounds = Math.max(1, Math.min(3, Number(maxLevel || 2)));
     const benchmarks = [
       {
         id: "FQ1",
         title: "FastQ generator",
         userPrompt: "Generate a FastQ file generator."
       }
     ];
     const codegenSystemPrompt = [
       "You write MoonBit code.",
       "Return only cmd/main/main.mbt.",
       "No markdown fences.",
       "No explanations."
     ].join("\n");
     const repairSystemPrompt = [
       "You repair MoonBit code.",
       "Return only cmd/main/main.mbt.",
       "No markdown fences.",
       "No explanations."
     ].join("\n");
     const saved = readRouter();
     const providers = (Array.isArray(saved.providers) ? saved.providers : [])
       .map(normalizeProviderEntry)
       .filter((item) => item.enabled && item.apiKey && item.model);
     if (providers.length === 0) {
       throw new Error("No enabled provider/model with API key is available for the experiment run.");
     }
     const blankBenchmark = () => ({
       attempted: false,
       raw_codegen_pass: false,
       raw_quality_pass: false,
       raw_codegen_compile_exit_code: null,
       raw_codegen_compile_summary_kind: "",
       repair_attempts_used: 0,
       assisted_pass: false,
       final_quality_pass: false,
       final_compile_exit_code: null,
       final_compile_summary_kind: "",
       final_quality_title: "",
       final_quality_summary: "",
       final_quality_missing_signals_json: "[]",
       final_source_bytes: null,
       first_codegen_response_latency_ms: null,
       total_time_to_first_compile_success_ms: null
     });
     const results = {
       experiment_name: "Free LLM FastQ generator ability of generating MoonBit code",
       status: "running",
       generated_at: nowIso(),
       prompt_protocol: {
         system_prompt: codegenSystemPrompt,
         user_prompt_mode: "task-only",
         repair_mode: "frontier-conversation",
         repair_rounds: repairRounds
       },
       benchmarks: benchmarks.map((item) => ({ id: item.id, title: item.title, goal: item.userPrompt })),
       models: []
     };
     const routerSummary = `${providers.length} provider(s): ${providers.map((item) => `${item.key}/${item.model}`).join(", ")}`;
     updateProcess(routerSummary, "moonbit-eval", "running", `Starting Free LLM FastQ Eval across ${providers.length} enabled provider/model entries.`);
     for (const provider of providers) {
       const providerLabel = `${provider.key}/${provider.model}`;
       const modelRecord = {
         provider: provider.key,
         model: provider.model,
         base_url: provider.baseUrl,
         api_test: {
           status: "pending",
           message: "",
           latency_ms: null,
           http_status: null,
           timeout: false,
           non_json_response: false
         },
         benchmarks: { FQ1: blankBenchmark() },
         notes: {
           stalled_or_long_no_response: false,
           parser_drift_notes: "",
           language_drift_notes: "",
           final_recommendation_note: ""
         }
       };
       results.models.push(modelRecord);
       await persistResults(results);
       updateProcess(providerLabel, "llm-api-test", "running", `Testing API reachability for ${providerLabel}.`);
       try {
         const ping = await requestMoonBit(provider, "Reply with OK.", "Reply with OK.", 15000, 8, "eval / api-test");
         modelRecord.api_test.status = "ok";
         modelRecord.api_test.message = ping.source || "OK";
         modelRecord.api_test.latency_ms = ping.latencyMs;
       } catch (error) {
         modelRecord.api_test.status = "failed";
         modelRecord.api_test.message = error instanceof Error ? error.message : String(error);
         modelRecord.api_test.timeout = Boolean(error?.timeout);
         modelRecord.api_test.non_json_response = Boolean(error?.nonJson);
         modelRecord.api_test.http_status = Number.isFinite(error?.httpStatus) ? Number(error.httpStatus) : null;
         modelRecord.notes.stalled_or_long_no_response = modelRecord.api_test.timeout;
         await persistResults(results);
         updateProcess(providerLabel, "llm-api-test", "failed", modelRecord.api_test.message);
         continue;
       }
       await persistResults(results);
       for (const benchmark of benchmarks) {
         const bench = modelRecord.benchmarks[benchmark.id];
         const benchStart = performance.now();
         bench.attempted = true;
         updateProcess(providerLabel, `moonbit-eval-${benchmark.id.toLowerCase()}`, "running", `Running ${benchmark.id} for ${providerLabel}.`);
         try {
           const generated = await requestMoonBit(provider, codegenSystemPrompt, benchmark.userPrompt, 60000, 1024, "eval / raw-codegen");
           bench.first_codegen_response_latency_ms = generated.latencyMs;
           updateProcess(providerLabel, `moonbit-eval-${benchmark.id.toLowerCase()}`, "running", `Compiling raw output for ${benchmark.id}.`, generated.source);
           let compile = await compileSource(generated.source);
           bench.raw_codegen_compile_exit_code = Number.isFinite(compile?.exit_code) ? Number(compile.exit_code) : null;
           bench.raw_codegen_compile_summary_kind = String(compile?.summary_kind || "");
           bench.final_compile_exit_code = Number.isFinite(compile?.exit_code) ? Number(compile.exit_code) : null;
           bench.final_compile_summary_kind = String(compile?.summary_kind || "");
           bench.final_source_bytes = Number.isFinite(compile?.source_bytes) ? Number(compile.source_bytes) : generated.source.length;
           let quality = null;
           if (compile?.ok === true) {
             bench.raw_codegen_pass = true;
             quality = assessFastqSource(generated.source);
             bench.raw_quality_pass = Boolean(quality?.pass);
             bench.final_quality_pass = Boolean(quality?.pass);
             bench.final_quality_title = String(quality?.title || "");
             bench.final_quality_summary = String(quality?.summary || "");
             bench.final_quality_missing_signals_json = JSON.stringify(Array.isArray(quality?.missingSignals) ? quality.missingSignals : []);
             if (quality?.pass) {
               bench.assisted_pass = true;
               bench.total_time_to_first_compile_success_ms = Math.round(performance.now() - benchStart);
               await persistResults(results);
               continue;
             }
           }
           let repairedSource = generated.source;
           for (let repairRound = 1; repairRound <= repairRounds; repairRound += 1) {
             bench.repair_attempts_used = repairRound;
             const repairUserPrompt = quality && compile?.ok === true
               ? [
                   "USER:",
                   benchmark.userPrompt,
                   "",
                   "---",
                   "",
                   "ASSISTANT:",
                   repairedSource,
                   "",
                   "---",
                   "",
                   "USER:",
                   "The previous MoonBit file compiled under wasm-gc, but it does not yet look like a usable FastQ generator.",
                   "",
                   "System assessment:",
                   String(quality?.summary || ""),
                   "",
                   "Missing signals:",
                   ...(Array.isArray(quality?.missingSignals) && quality.missingSignals.length > 0 ? quality.missingSignals.map((item) => `- ${String(item)}`) : ["- none listed"]),
                   "",
                   "Fix the file and return the full corrected cmd/main/main.mbt only."
                 ].join("\n")
               : [
                   "USER:",
                   benchmark.userPrompt,
                   "",
                   "---",
                   "",
                   "ASSISTANT:",
                   repairedSource,
                   "",
                   "---",
                   "",
                   "USER:",
                   "The previous MoonBit file failed to compile under wasm-gc.",
                   "",
                   "Compiler error:",
                   String(compile?.output || compile?.trimmed_output || ""),
                   "",
                   "Fix the file and return the full corrected cmd/main/main.mbt only."
                 ].join("\n");
             const repaired = await requestMoonBit(provider, repairSystemPrompt, repairUserPrompt, 90000, 1024, "eval / repair");
             repairedSource = repaired.source;
             updateProcess(providerLabel, `moonbit-eval-${benchmark.id.toLowerCase()}`, "running", `Compile-checking repair round ${repairRound} for ${benchmark.id}.`, repairedSource);
             compile = await compileSource(repairedSource);
             bench.final_compile_exit_code = Number.isFinite(compile?.exit_code) ? Number(compile.exit_code) : null;
             bench.final_compile_summary_kind = String(compile?.summary_kind || "");
             bench.final_source_bytes = Number.isFinite(compile?.source_bytes) ? Number(compile.source_bytes) : repairedSource.length;
             if (compile?.ok === true) {
               quality = assessFastqSource(repairedSource);
               bench.final_quality_pass = Boolean(quality?.pass);
               bench.final_quality_title = String(quality?.title || "");
               bench.final_quality_summary = String(quality?.summary || "");
               bench.final_quality_missing_signals_json = JSON.stringify(Array.isArray(quality?.missingSignals) ? quality.missingSignals : []);
               if (quality?.pass) {
                 bench.assisted_pass = true;
                 bench.total_time_to_first_compile_success_ms = Math.round(performance.now() - benchStart);
                 break;
               }
             }
           }
           if (!bench.assisted_pass && String(bench.final_compile_summary_kind || "").includes("parse")) {
             modelRecord.notes.parser_drift_notes = `Parser drift reached ${benchmark.id}.`;
           }
         } catch (error) {
           const message = error instanceof Error ? error.message : String(error);
           bench.final_compile_summary_kind = "request-error";
           modelRecord.notes.language_drift_notes = message;
           if (message.toLowerCase().includes("timed out")) {
             modelRecord.notes.stalled_or_long_no_response = true;
           }
         }
         await persistResults(results);
         updateProcess(providerLabel, `moonbit-eval-${benchmark.id.toLowerCase()}`, bench.assisted_pass ? "succeeded" : "failed", `${benchmark.id} result for ${providerLabel}: raw=${bench.raw_codegen_pass ? "compile-pass" : "compile-fail"}, raw-quality=${bench.raw_quality_pass ? "pass" : "fail"}, assisted=${bench.assisted_pass ? "quality-pass" : "fail"}, repairs=${Number(bench.repair_attempts_used || 0)}.`);
       }
       const fq1 = modelRecord.benchmarks.FQ1;
       if (fq1?.raw_codegen_pass && fq1?.raw_quality_pass) {
         modelRecord.notes.final_recommendation_note = "Strong first-pass FastQ MoonBit candidate.";
       } else if (fq1?.assisted_pass && fq1?.final_quality_pass) {
         modelRecord.notes.final_recommendation_note = "Usable for FastQ generator after compiler/quality-guided repair.";
       } else if (fq1?.raw_codegen_pass || fq1?.final_compile_exit_code === 0) {
         modelRecord.notes.final_recommendation_note = "Can compile, but still does not reliably satisfy the FastQ generator structure checks.";
       } else {
         modelRecord.notes.final_recommendation_note = "Not yet reliable for the FastQ generator task.";
       }
       await persistResults(results);
     }
     results.status = "completed";
     await persistResults(results);
     updateProcess(routerSummary, "moonbit-eval", "succeeded", "Free LLM FastQ Eval completed. Results were written to artifacts/moonbit-eval-results.json and docs/experiments/free-llm-moonbit/results.md.");
     onDone(JSON.stringify(results, null, 2));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   } finally {
     globalThis.__moonapEvalRunning = false;
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__on__save__personal__skill = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "savePersonalSkill") return;
   event.preventDefault();
   event.stopPropagation();
   try {
     handler();
   } catch (error) {
     console.error("MoonAP save personal skill handler failed:", error);
     alert(`MoonAP save failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app40browser__on__download__runtime__artifact = (kind, handler) => document.addEventListener("click", (event) => {
   const targetId = kind === "wasm"
     ? "downloadRuntimeWasm"
     : kind === "source"
       ? "downloadRuntimeSource"
       : kind === "compile-report"
         ? "downloadCompileReport"
         : "downloadRuntimeResult";
   if (event.target?.id !== targetId) return;
   event.preventDefault();
   event.stopPropagation();
   try {
     handler();
   } catch (error) {
     alert(`MoonAP runtime download failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__on__runtime__report__action = (action, handler) => document.addEventListener("click", (event) => {
   const targetId = String(action || "") === "save" ? "saveRuntimeReport" : "openRuntimeReport";
   if (event.target?.id !== targetId) return;
   event.preventDefault();
   event.stopPropagation();
   try {
     const result = handler();
     if (result && typeof result.catch === "function") {
       result.catch((error) => alert(`MoonAP report action failed: ${error instanceof Error ? error.message : String(error)}`));
     }
   } catch (error) {
     alert(`MoonAP report action failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app42browser__on__record__demo__runtime__result = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "recordDemoRuntimeResult") return;
   event.preventDefault();
   event.stopPropagation();
   if (globalThis.__moonapRuntimeRerunBusy) return;
   globalThis.__moonapRuntimeRerunBusy = true;
   const button = event.target;
   const previousDisabled = button.disabled;
   button.disabled = true;
   try {
     const result = handler();
     if (result && typeof result.finally === "function") {
       result.finally(() => {
         globalThis.__moonapRuntimeRerunBusy = false;
         button.disabled = previousDisabled;
       });
     } else {
       setTimeout(() => {
         globalThis.__moonapRuntimeRerunBusy = false;
         button.disabled = previousDisabled;
       }, 600);
     }
   } catch (error) {
     globalThis.__moonapRuntimeRerunBusy = false;
     button.disabled = previousDisabled;
     alert(`MoonAP demo runtime execution failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__on__repair__artifact = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "repairArtifact") return;
   event.preventDefault();
   event.stopPropagation();
   try {
     handler();
   } catch (error) {
     alert(`MoonAP repair failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__ensure__skill__folder__runtime = () => {
   if (globalThis.__moonapSkillFolderRuntime) return;
   const pathRuntime = globalThis.__moonapVirtualPathRuntime;
   if (!pathRuntime || typeof pathRuntime.normalize !== "function") {
     throw new Error("MoonAP virtual path runtime is not ready yet.");
   }
   const parseFrontmatter = (text) => {
     const source = String(text || "");
     if (!source.startsWith("---\n") && !source.startsWith("---\r\n")) return {};
     const lines = source.replace(/\r/g, "").split("\n");
     const fields = {};
     for (let index = 1; index < lines.length; index += 1) {
       const line = String(lines[index] || "");
       if (line.trim() === "---") break;
       const colon = line.indexOf(":");
       if (colon < 0) continue;
       const key = line.slice(0, colon).trim();
       const value = line.slice(colon + 1).trim();
       if (key) fields[key] = value;
     }
     return fields;
   };
   const parseKeyAttributes = (text) => {
     const source = String(text || "").replace(/\r/g, "");
     const match = source.match(/# Key Attributes\s+([\s\S]*?)(?:\n# |\n```|$)/);
     const result = {};
     const block = match?.[1] || "";
     for (const line of block.split("\n")) {
       const trimmed = String(line || "").trim();
       if (!trimmed.startsWith("- ")) continue;
       const content = trimmed.slice(2);
       const colon = content.indexOf(":");
       if (colon < 0) continue;
       const key = content.slice(0, colon).trim().toLowerCase().replace(/\s+/g, "_");
       const value = content.slice(colon + 1).trim();
       if (key) result[key] = value;
     }
     return result;
   };
   const parseRuntimeSpec = (text) => {
     const source = String(text || "").replace(/\r/g, "");
     const match = source.match(/# Runtime Spec\s+```json\s*([\s\S]*?)\s*```/);
     if (!match) return {};
     try { return JSON.parse(match[1]); } catch { return {}; }
   };
   const readTextFile = async (dirHandle, fileName) => {
     const handle = await dirHandle.getFileHandle(String(fileName || ""));
     const file = await handle.getFile();
     return await file.text();
   };
   const ensurePermission = async (handle, mode = "read", request = false) => {
     if (!handle) return false;
     if (typeof handle.queryPermission !== "function") return true;
     try {
       let state = await handle.queryPermission({ mode });
       if (state === "granted") return true;
       if (request && typeof handle.requestPermission === "function") {
         state = await handle.requestPermission({ mode });
         if (state === "granted") return true;
       }
     } catch {}
     return false;
   };
   const readSkillFolder = async (dirHandle, options = {}) => {
     const fallback = options?.fallback && typeof options.fallback === "object" ? options.fallback : {};
     const skillMd = await readTextFile(dirHandle, "SKILL.md");
     const frontmatter = parseFrontmatter(skillMd);
     const keyAttributes = parseKeyAttributes(skillMd);
     const runtimeSpec = parseRuntimeSpec(skillMd);
     const relativePath = pathRuntime.normalize(options?.relativePath || fallback?.relative_path || dirHandle?.name || "");
     return {
       ...(fallback || {}),
       id: String(options?.id || fallback?.id || ""),
       name: String(frontmatter.name || fallback?.name || options?.defaultName || "SKILL"),
       description: String(frontmatter.description || fallback?.description || ""),
       task_kind: String(keyAttributes.task_kind || fallback?.task_kind || "generic"),
       runtime_mode: String(keyAttributes.runtime_mode || fallback?.runtime_mode || "form"),
       result_mode: String(keyAttributes.result_mode || fallback?.result_mode || "text"),
       wasm_path: String(keyAttributes.wasm_path || fallback?.wasm_path || "program/main.wasm"),
       source_path: String(keyAttributes.moonbit_source_path || fallback?.source_path || ""),
       runtime_spec: runtimeSpec && typeof runtimeSpec === "object" ? runtimeSpec : {},
       skill_md: skillMd,
       handle_name: String(dirHandle?.name || fallback?.folder_name || ""),
       relative_path: relativePath,
       available: true
     };
   };
   globalThis.__moonapSkillFolderRuntime = {
     parseFrontmatter,
     parseKeyAttributes,
     parseRuntimeSpec,
     readTextFile,
     ensurePermission,
     readSkillFolder
   };
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__render__personal__skills = () => {
   const ensurePersonalSkillRuntime = () => {
     if (globalThis.__moonapPersonalSkillRuntime) return globalThis.__moonapPersonalSkillRuntime;
     const DB_NAME = "moonap.personal.skill.handles.v1";
     const STORE_NAME = "handles";
     const ROOT_KEY = "__root__";
     const openDb = () => new Promise((resolve, reject) => {
       const request = indexedDB.open(DB_NAME, 1);
       request.onupgradeneeded = () => {
         const db = request.result;
         if (!db.objectStoreNames.contains(STORE_NAME)) {
           db.createObjectStore(STORE_NAME);
         }
       };
       request.onsuccess = () => resolve(request.result);
       request.onerror = () => reject(request.error || new Error("Failed to open Personal SKILL database."));
     });
     const withStore = async (mode, work) => {
       const db = await openDb();
       return await new Promise((resolve, reject) => {
         const transaction = db.transaction(STORE_NAME, mode);
         const store = transaction.objectStore(STORE_NAME);
         let settled = false;
         const finishResolve = (value) => {
           if (settled) return;
           settled = true;
           resolve(value);
         };
         const finishReject = (error) => {
           if (settled) return;
           settled = true;
           reject(error);
         };
         transaction.oncomplete = () => finishResolve(undefined);
         transaction.onerror = () => finishReject(transaction.error || new Error("Personal SKILL database transaction failed."));
         transaction.onabort = () => finishReject(transaction.error || new Error("Personal SKILL database transaction was aborted."));
         Promise.resolve(work(store, finishResolve, finishReject)).catch(finishReject);
       }).finally(() => db.close());
     };
     const folderRuntime = globalThis.__moonapSkillFolderRuntime;
     if (!folderRuntime || typeof folderRuntime.readSkillFolder !== "function" || typeof folderRuntime.ensurePermission !== "function") {
       throw new Error("MoonAP skill folder runtime is not ready yet.");
     }
     const loadFromHandle = async (id, dirHandle, fallback) => {
       const data = await folderRuntime.readSkillFolder(dirHandle, {
         id: String(id || fallback?.id || ""),
         fallback,
         defaultName: "Personal SKILL",
         relativePath: String(fallback?.folder_name || dirHandle?.name || "")
       });
       globalThis.__moonapPersonalSkillCache = globalThis.__moonapPersonalSkillCache || {};
       globalThis.__moonapPersonalSkillCache[data.id] = data;
       return data;
     };
     const runtime = {
       cache: globalThis.__moonapPersonalSkillCache || {},
       putHandle: async (id, handle) => {
         await withStore("readwrite", (store, resolve, reject) => {
           const request = store.put(handle, String(id || ""));
           request.onsuccess = () => resolve(true);
           request.onerror = () => reject(request.error || new Error("Failed to save Personal SKILL handle."));
         });
       },
       putRootHandle: async (handle) => {
         await withStore("readwrite", (store, resolve, reject) => {
           const request = store.put(handle, ROOT_KEY);
           request.onsuccess = () => resolve(true);
           request.onerror = () => reject(request.error || new Error("Failed to save Personal SKILL root handle."));
         });
       },
       getRootHandle: async () => {
         return await withStore("readonly", (store, resolve, reject) => {
           const request = store.get(ROOT_KEY);
           request.onsuccess = () => resolve(request.result || null);
           request.onerror = () => reject(request.error || new Error("Failed to read Personal SKILL root handle."));
         });
       },
       getHandle: async (id) => {
         return await withStore("readonly", (store, resolve, reject) => {
           const request = store.get(String(id || ""));
           request.onsuccess = () => resolve(request.result || null);
           request.onerror = () => reject(request.error || new Error("Failed to read Personal SKILL handle."));
         });
       },
       deleteHandle: async (id) => {
         await withStore("readwrite", (store, resolve, reject) => {
           const request = store.delete(String(id || ""));
           request.onsuccess = () => resolve(true);
           request.onerror = () => reject(request.error || new Error("Failed to delete Personal SKILL handle."));
         });
       },
       loadFromHandle,
       listFromIndex: async () => {
         let skills = [];
         try {
           const parsed = JSON.parse(localStorage.getItem("moonap.personal.skills") || "[]");
           skills = Array.isArray(parsed) ? parsed : [];
         } catch (error) {
           console.warn("MoonAP reset invalid personal skill storage:", error);
           try { localStorage.removeItem("moonap.personal.skills"); } catch {}
         }
         const results = [];
         for (const fallback of skills.filter((skill) => Boolean(skill?.runtime_ready))) {
           try {
             const handle = await runtime.getHandle(fallback.id);
             if (!handle) {
               results.push({ ...(fallback || {}), available: false });
               continue;
             }
             results.push(await loadFromHandle(fallback.id, handle, fallback));
           } catch (error) {
             results.push({
               ...(fallback || {}),
               available: false,
               load_error: error instanceof Error ? error.message : String(error)
             });
           }
         }
         return results;
       },
       findSkillDir: async (rootHandle, skillId) => {
         if (!rootHandle || typeof rootHandle.entries !== "function") return null;
         const wantedId = String(skillId || "");
         for await (const [entryName, entryHandle] of rootHandle.entries()) {
           if (!entryHandle || entryHandle.kind !== "directory") continue;
           const candidateId = `personal.${String(entryName || "")}`;
           if (candidateId !== wantedId) continue;
           try {
             await entryHandle.getFileHandle("SKILL.md");
             return entryHandle;
           } catch {}
         }
         return null;
       },
       listFromRoot: async (rootHandle) => {
         if (!rootHandle || typeof rootHandle.entries !== "function") return [];
         if (!await folderRuntime.ensurePermission(rootHandle, "read", false)) {
           const error = new Error("MoonAP needs this browser to regain access to the selected Personal SKILL directory.");
           error.code = "permission-denied";
           throw error;
         }
         let fallbackMap = new Map();
         try {
           const parsed = JSON.parse(localStorage.getItem("moonap.personal.skills") || "[]");
           if (Array.isArray(parsed)) {
             fallbackMap = new Map(parsed.map((item) => [String(item?.id || ""), item]));
           }
         } catch {}
         const results = [];
         for await (const [entryName, entryHandle] of rootHandle.entries()) {
           if (!entryHandle || entryHandle.kind !== "directory") continue;
           const skillId = `personal.${String(entryName || "")}`;
           try {
             await entryHandle.getFileHandle("SKILL.md");
             const fallback = fallbackMap.get(skillId) || { id: skillId, folder_name: String(entryName || "") };
             const loaded = await loadFromHandle(skillId, entryHandle, fallback);
             loaded.export_root_name = String(rootHandle?.name || loaded.export_root_name || "");
             results.push(loaded);
             if (typeof runtime.putHandle === "function") {
               try { await runtime.putHandle(skillId, entryHandle); } catch {}
             }
           } catch {}
         }
         results.sort((left, right) => String(left?.name || left?.id || "").localeCompare(String(right?.name || right?.id || "")));
         return results;
       },
       syncIndexFromSkills: async (skills) => {
         const next = Array.isArray(skills)
           ? skills.map((skill) => ({
               id: String(skill?.id || ""),
               name: String(skill?.name || "Personal SKILL"),
               description: String(skill?.description || ""),
               task_kind: String(skill?.task_kind || "generic"),
               runtime_mode: String(skill?.runtime_mode || "form"),
               result_mode: String(skill?.result_mode || "text"),
               folder_name: String(skill?.handle_name || skill?.folder_name || ""),
               runtime_ready: true,
               export_root_name: String(skill?.export_root_name || ""),
               saved_at: String(skill?.saved_at || "")
             }))
           : [];
         try { localStorage.setItem("moonap.personal.skills", JSON.stringify(next)); } catch {}
       }
     };
     globalThis.__moonapPersonalSkillCache = runtime.cache;
     globalThis.__moonapPersonalSkillRuntime = runtime;
     return runtime;
   };
   const root = document.querySelector("#personalSkillCards");
   if (!root) return 0;
   root.innerHTML = "";
   const loading = document.createElement("div");
   loading.className = "personal-skill-empty";
   loading.textContent = "Loading Personal SKILLs...";
   root.append(loading);
   (async () => {
     const runtime = ensurePersonalSkillRuntime();
     let rootHandle = globalThis.__moonapSkillExportRootHandle;
     if (!rootHandle || typeof rootHandle.entries !== "function") {
       rootHandle = await runtime.getRootHandle();
       if (rootHandle && typeof rootHandle.entries === "function") {
         globalThis.__moonapSkillExportRootHandle = rootHandle;
       }
     }
     const panelLabel = document.querySelector("#personalSkillRootLabel");
     if (panelLabel) {
       panelLabel.textContent = rootHandle && rootHandle.name
         ? `Selected folder: ${String(rootHandle.name)}`
         : "No local Personal SKILL folder selected yet.";
     }
     if (!rootHandle || typeof rootHandle.entries !== "function") {
       root.innerHTML = "";
       const empty = document.createElement("div");
       empty.className = "personal-skill-empty";
       empty.textContent = "Choose a local Personal SKILL folder to load your current SKILL set.";
       root.append(empty);
       return;
     }
     const skills = await runtime.listFromRoot(rootHandle);
     await runtime.syncIndexFromSkills(skills);
     root.innerHTML = "";
     if (skills.length === 0) {
       const empty = document.createElement("div");
       empty.className = "personal-skill-empty";
       empty.textContent = "No Personal SKILL was found in the selected local directory.";
       root.append(empty);
       return;
     }
     for (const skill of skills) {
       const card = document.createElement("button");
       card.className = "skill-card personal";
       card.type = "button";
       card.dataset.skillId = skill.id || "personal.skill";
       if (skill.available === false) card.dataset.skillUnavailable = "true";
       const rootName = String(skill.export_root_name || "");
       const subtitle = skill.available === false
         ? (skill.load_error
           ? `Saved locally, but MoonAP could not reopen it yet: ${String(skill.load_error)}`
           : "Saved locally, but MoonAP needs this browser to regain access before reopening it.")
         : (rootName
           ? `Saved in ${rootName}. Reusable without LLM.`
           : "Saved locally. Reusable without LLM.");
       card.innerHTML = `<span>Local / Exported</span><strong>${skill.name || "Personal SKILL"}</strong><small>${subtitle}</small>`;
       root.append(card);
     }
   })().catch((error) => {
     root.innerHTML = "";
     const empty = document.createElement("div");
     empty.className = "personal-skill-empty";
     const message = error instanceof Error ? error.message : String(error);
     empty.textContent = error && error.code === "permission-denied"
       ? message
       : `Failed to load Personal SKILLs: ${message}`;
     root.append(empty);
   });
   return 0;
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__render__local__skill__hub = () => {
   const pathRuntime = globalThis.__moonapVirtualPathRuntime;
   if (!pathRuntime || typeof pathRuntime.normalize !== "function") {
     throw new Error("MoonAP virtual path runtime is not ready yet.");
   }
   const ensureLocalSkillHubRuntime = () => {
     if (globalThis.__moonapLocalSkillHubRuntime) return globalThis.__moonapLocalSkillHubRuntime;
     const DB_NAME = "moonap.local.skill.hub.handles.v1";
     const STORE_NAME = "handles";
     const ROOT_KEY = "__root__";
     const openDb = () => new Promise((resolve, reject) => {
       const request = indexedDB.open(DB_NAME, 1);
       request.onupgradeneeded = () => {
         const db = request.result;
         if (!db.objectStoreNames.contains(STORE_NAME)) {
           db.createObjectStore(STORE_NAME);
         }
       };
       request.onsuccess = () => resolve(request.result);
       request.onerror = () => reject(request.error || new Error("Failed to open Local SKILL Hub database."));
     });
     const withStore = async (mode, work) => {
       const db = await openDb();
       return await new Promise((resolve, reject) => {
         const transaction = db.transaction(STORE_NAME, mode);
         const store = transaction.objectStore(STORE_NAME);
         let settled = false;
         const finishResolve = (value) => {
           if (settled) return;
           settled = true;
           resolve(value);
         };
         const finishReject = (error) => {
           if (settled) return;
           settled = true;
           reject(error);
         };
         transaction.oncomplete = () => finishResolve(undefined);
         transaction.onerror = () => finishReject(transaction.error || new Error("Local SKILL Hub database transaction failed."));
         transaction.onabort = () => finishReject(transaction.error || new Error("Local SKILL Hub database transaction was aborted."));
         Promise.resolve(work(store, finishResolve, finishReject)).catch(finishReject);
       }).finally(() => db.close());
     };
     const folderRuntime = globalThis.__moonapSkillFolderRuntime;
     if (!folderRuntime || typeof folderRuntime.readSkillFolder !== "function" || typeof folderRuntime.ensurePermission !== "function") {
       throw new Error("MoonAP skill folder runtime is not ready yet.");
     }
     const loadSkillFolder = async (dirHandle, relativePath) => {
       const normalizedPath = pathRuntime.normalize(relativePath || dirHandle?.name || "");
       return await folderRuntime.readSkillFolder(dirHandle, {
         id: `local.${normalizedPath.replace(/\//g, ".")}`,
         defaultName: "Local SKILL",
         relativePath: normalizedPath
       });
     };
     const walkSkills = async (dirHandle, prefix = "") => {
       let results = [];
       try {
         await dirHandle.getFileHandle("SKILL.md");
         results.push(await loadSkillFolder(dirHandle, prefix || String(dirHandle?.name || "")));
         return results;
       } catch {}
       for await (const [entryName, entryHandle] of dirHandle.entries()) {
         if (!entryHandle || entryHandle.kind !== "directory") continue;
         const nextPrefix = prefix ? `${prefix}/${String(entryName || "")}` : String(entryName || "");
         const nested = await walkSkills(entryHandle, nextPrefix);
         if (nested.length > 0) results = results.concat(nested);
       }
       return results;
     };
     const runtime = {
       putRootHandle: async (handle) => {
         await withStore("readwrite", (store, resolve, reject) => {
           const request = store.put(handle, ROOT_KEY);
           request.onsuccess = () => resolve(true);
           request.onerror = () => reject(request.error || new Error("Failed to save Local SKILL Hub root handle."));
         });
       },
       getRootHandle: async () => {
         return await withStore("readonly", (store, resolve, reject) => {
           const request = store.get(ROOT_KEY);
           request.onsuccess = () => resolve(request.result || null);
           request.onerror = () => reject(request.error || new Error("Failed to read Local SKILL Hub root handle."));
         });
       },
       hasPermission: async (handle, request = false) => {
         return await folderRuntime.ensurePermission(handle, "readwrite", request);
       },
       listFromRoot: async (rootHandle) => {
         if (!rootHandle || typeof rootHandle.entries !== "function") return [];
         if (!await folderRuntime.ensurePermission(rootHandle, "read", false)) {
           const error = new Error("MoonAP needs this browser to regain access to the selected Local SKILL Hub directory.");
           error.code = "permission-denied";
           throw error;
         }
         const skills = await walkSkills(rootHandle, "");
         skills.sort((left, right) => String(left?.relative_path || left?.name || "").localeCompare(String(right?.relative_path || right?.name || "")));
         return skills;
       }
     };
     globalThis.__moonapLocalSkillHubRuntime = runtime;
     return runtime;
   };
   const root = document.querySelector("#localSkillHubCards");
   if (!root) return 0;
   root.innerHTML = "";
   const loading = document.createElement("div");
   loading.className = "personal-skill-empty";
   loading.textContent = "Loading Local SKILL Hub...";
   root.append(loading);
   (async () => {
     const runtime = ensureLocalSkillHubRuntime();
     let rootHandle = globalThis.__moonapLocalSkillHubRootHandle;
     if (!rootHandle || typeof rootHandle.entries !== "function") {
       rootHandle = await runtime.getRootHandle();
       if (rootHandle && typeof rootHandle.entries === "function") {
         globalThis.__moonapLocalSkillHubRootHandle = rootHandle;
       }
     }
     const label = document.querySelector("#localSkillHubRootLabel");
     if (label) {
       label.textContent = rootHandle && rootHandle.name
         ? `Selected folder: ${String(rootHandle.name)}`
         : "No local SKILL Hub folder selected yet.";
     }
     root.innerHTML = "";
     if (!rootHandle || typeof rootHandle.entries !== "function") {
       const empty = document.createElement("div");
       empty.className = "personal-skill-empty";
       empty.textContent = "Choose a local SKILL Hub directory to browse installed public SKILLs.";
       root.append(empty);
       return;
     }
     const skills = await runtime.listFromRoot(rootHandle);
     if (skills.length === 0) {
       const empty = document.createElement("div");
       empty.className = "personal-skill-empty";
       empty.textContent = "No public SKILL folder was found in the selected Local SKILL Hub directory.";
       root.append(empty);
       return;
     }
     globalThis.__moonapHubSkillCache = globalThis.__moonapHubSkillCache || {};
     for (const skill of skills) {
       globalThis.__moonapHubSkillCache[String(skill.id || "")] = { ...skill, source: "local" };
       const card = document.createElement("button");
       card.className = "skill-card personal";
       card.type = "button";
       card.dataset.skillId = String(skill.id || "");
       card.innerHTML = `<span>Local Hub / ${pathRuntime.normalize(skill.relative_path || "")}</span><strong>${skill.name || "Local SKILL"}</strong><small>${skill.description || `Task kind: ${String(skill.task_kind || "generic")}`}</small>`;
       root.append(card);
     }
   })().catch((error) => {
     root.innerHTML = "";
     const empty = document.createElement("div");
     empty.className = "personal-skill-empty";
     const message = error instanceof Error ? error.message : String(error);
     empty.textContent = error && error.code === "permission-denied"
       ? message
       : `Failed to load Local SKILL Hub: ${message}`;
     root.append(empty);
   });
   return 0;
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__render__cloud__skill__hub = (forceRefresh) => {
   const pathRuntime = globalThis.__moonapVirtualPathRuntime;
   if (!pathRuntime || typeof pathRuntime.normalize !== "function") {
     throw new Error("MoonAP virtual path runtime is not ready yet.");
   }
   const root = document.querySelector("#cloudSkillHubCards");
   if (!root) return 0;
   root.innerHTML = "";
   const loading = document.createElement("div");
   loading.className = "personal-skill-empty";
   loading.textContent = "Loading Cloud SKILL catalog...";
   root.append(loading);
   const repositoryUrl = "https://github.com/tangmaomao16/MoonAP-SKILL-Hub";
   const indexUrl = "https://raw.githubusercontent.com/tangmaomao16/MoonAP-SKILL-Hub/main/index.json";
   const sourceLabel = document.querySelector("#cloudSkillHubSourceLabel");
   if (sourceLabel) {
     sourceLabel.innerHTML = `<a href="${repositoryUrl}" target="_blank" rel="noreferrer" title="${repositoryUrl}" aria-label="Official MoonAP SKILL Hub repository">Official MoonAP SKILL Hub</a>`;
   }
   const normalizeSkill = (entry, hub) => {
     const folderPath = pathRuntime.normalize(entry?.folder_path || "");
     const canonicalName = folderPath ? pathRuntime.lastSegment(folderPath) : String(entry?.name || "Cloud SKILL");
     const repository = String(entry?.repository_url || hub?.repository_url || repositoryUrl);
     const rawBase = repository
       .replace("https://github.com/", "https://raw.githubusercontent.com/")
       .replace(/\/$/, "") + "/main";
     const version = String(entry?.version || "");
     const zipPath = pathRuntime.normalize(entry?.zip_path || (folderPath ? `${folderPath}.zip` : ""));
     const zipUrl = String(entry?.zip_url || (zipPath ? `${rawBase}/${zipPath}` : ""));
     return {
       id: `cloud.${String(entry?.id || folderPath || entry?.name || "skill")}`,
       name: canonicalName,
       catalog_name: String(entry?.name || canonicalName),
       description: String(entry?.description || ""),
       task_kind: String(entry?.task_kind || "generic"),
       runtime_mode: String(entry?.runtime_mode || "form"),
       result_mode: String(entry?.result_mode || "text"),
       runtime_spec: entry?.runtime_spec && typeof entry.runtime_spec === "object" ? entry.runtime_spec : {},
       version,
       domain: String(entry?.domain || ""),
       subdomain: String(entry?.subdomain || ""),
       tags: Array.isArray(entry?.tags) ? entry.tags : [],
       folder_path: folderPath,
       zip_path: zipPath,
       repository_url: repository,
       folder_url: folderPath ? `${repository}/tree/main/${folderPath}` : repository,
       external_url: String(entry?.homepage_url || entry?.folder_url || (folderPath ? `${repository}/tree/main/${folderPath}` : repository)),
       download_url: zipUrl,
       source: "cloud"
     };
   };
   (async () => {
     let catalog = null;
     if (!forceRefresh && globalThis.__moonapCloudSkillCatalog && Array.isArray(globalThis.__moonapCloudSkillCatalog.skills)) {
       catalog = globalThis.__moonapCloudSkillCatalog;
     } else {
       const response = await fetch(indexUrl, { cache: "no-store" });
       if (!response.ok) {
         throw new Error(`Cloud index.json not available yet (${response.status}).`);
       }
       const parsed = await response.json();
       catalog = Array.isArray(parsed)
         ? {
             hub_version: "1",
             hub_name: "MoonAP-SKILL-Hub",
             repository_url: repositoryUrl,
             skills: parsed
           }
         : (parsed && typeof parsed === "object" ? parsed : {});
       if (!Array.isArray(catalog?.skills) && Array.isArray(parsed?.entries)) {
         catalog.skills = parsed.entries;
       }
       globalThis.__moonapCloudSkillCatalog = catalog;
     }
     const entries = Array.isArray(catalog?.skills) ? catalog.skills : [];
     root.innerHTML = "";
     if (entries.length === 0) {
       const empty = document.createElement("div");
       empty.className = "personal-skill-empty";
       empty.textContent = "Cloud catalog is currently empty. Add public SKILL entries to index.json in the official MoonAP-SKILL-Hub repository.";
       root.append(empty);
       return;
     }
     globalThis.__moonapHubSkillCache = globalThis.__moonapHubSkillCache || {};
     for (const entry of entries) {
       const skill = normalizeSkill(entry, catalog);
       globalThis.__moonapHubSkillCache[String(skill.id || "")] = skill;
       const card = document.createElement("button");
       card.className = "skill-card";
       card.type = "button";
       card.dataset.skillId = String(skill.id || "");
       const top = [skill.domain || "", skill.subdomain || ""].filter(Boolean).join(" / ") || "Cloud SKILL";
       const bottom = skill.description || (skill.version ? `version ${skill.version}` : "Public MoonAP SKILL");
       card.innerHTML = `<span>${top}</span><strong>${skill.name || "Cloud SKILL"}</strong><small>${bottom}</small>`;
       root.append(card);
     }
   })().catch((error) => {
     root.innerHTML = "";
     const empty = document.createElement("div");
     empty.className = "personal-skill-empty";
     empty.textContent = `Failed to load Cloud SKILL catalog: ${error instanceof Error ? error.message : String(error)}`;
     root.append(empty);
   });
   return 0;
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__install__cloud__skill = async (skillId, onDone, onError) => {
   try {
     const pathRuntime = globalThis.__moonapVirtualPathRuntime;
     if (!pathRuntime || typeof pathRuntime.normalize !== "function" || typeof pathRuntime.split !== "function" || typeof pathRuntime.lastSegment !== "function") {
       throw new Error("MoonAP virtual path runtime is not ready yet.");
     }
     const skill = globalThis.__moonapHubSkillCache && typeof globalThis.__moonapHubSkillCache === "object"
       ? globalThis.__moonapHubSkillCache[String(skillId || "")]
       : null;
     if (!skill || String(skill.source || "") !== "cloud") {
       throw new Error("MoonAP could not find this Cloud SKILL entry.");
     }
     let rootHandle = globalThis.__moonapLocalSkillHubRootHandle;
     const ensurePermission = async (handle, request = false) => {
       if (!handle) return false;
       if (typeof handle.queryPermission !== "function") return true;
       try {
         let state = await handle.queryPermission({ mode: "readwrite" });
         if (state === "granted") return true;
         if (request && typeof handle.requestPermission === "function") {
           state = await handle.requestPermission({ mode: "readwrite" });
           if (state === "granted") return true;
         }
       } catch {}
       return false;
     };
     if (!rootHandle || typeof rootHandle.getDirectoryHandle !== "function") {
       if (typeof window.showDirectoryPicker !== "function") {
         throw new Error("This browser does not support local SKILL Hub directory selection.");
       }
       rootHandle = await window.showDirectoryPicker({ mode: "readwrite" });
       globalThis.__moonapLocalSkillHubRootHandle = rootHandle;
       const runtime = globalThis.__moonapLocalSkillHubRuntime;
       if (runtime && typeof runtime.putRootHandle === "function") {
         await runtime.putRootHandle(rootHandle);
       }
     } else if (!await ensurePermission(rootHandle, true)) {
       if (typeof window.showDirectoryPicker !== "function") {
         throw new Error("MoonAP needs a writable Local SKILL Hub directory, but this browser cannot reopen one.");
       }
       rootHandle = await window.showDirectoryPicker({ mode: "readwrite" });
       globalThis.__moonapLocalSkillHubRootHandle = rootHandle;
       const runtime = globalThis.__moonapLocalSkillHubRuntime;
       if (runtime && typeof runtime.putRootHandle === "function") {
         await runtime.putRootHandle(rootHandle);
       }
     }
     const folderPath = pathRuntime.normalize(String(skill.folder_path || "").trim());
     const downloadUrl = String(skill.download_url || "").trim();
     if (!folderPath) throw new Error("Cloud SKILL entry does not include folder_path.");
     if (!downloadUrl) throw new Error("Cloud SKILL entry does not include a ZIP download path yet.");
     const zipRuntime = globalThis.__moonapSkillZipRuntime;
     if (!zipRuntime || typeof zipRuntime.unzip !== "function") {
       throw new Error("MoonAP ZIP runtime is not ready yet.");
     }
     const fetchBinary = async (url) => {
       const response = await fetch(url, { cache: "no-store" });
       if (!response.ok) {
         throw new Error(`Failed to fetch ${url} (${response.status})`);
       }
       return new Uint8Array(await response.arrayBuffer());
     };
     const writeText = async (dirHandle, fileName, text) => {
       const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
       const writable = await fileHandle.createWritable();
       await writable.write(String(text || ""));
       await writable.close();
     };
     const writeBinary = async (dirHandle, fileName, bytes) => {
       const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
       const writable = await fileHandle.createWritable();
       await writable.write(bytes);
       await writable.close();
     };
     const ensurePath = async (dirHandle, relativePath) => {
       let current = dirHandle;
       const parts = pathRuntime.split(relativePath);
       for (const part of parts) {
         current = await current.getDirectoryHandle(part, { create: true });
       }
       return current;
     };
     const zipBytes = await fetchBinary(downloadUrl);
     const zipEntries = await zipRuntime.unzip(zipBytes);
     const folderName = pathRuntime.lastSegment(folderPath);
     const fileEntries = zipEntries.filter((entry) => entry && typeof entry.path === "string" && !entry.directory);
     const stripRoot = folderName !== "" && fileEntries.length > 0 && fileEntries.every((entry) => {
       const normalized = pathRuntime.normalize(entry.path || "");
       return normalized === folderName || normalized.startsWith(`${folderName}/`);
     });
     const targetDir = await ensurePath(rootHandle, folderPath);
     for (const entry of zipEntries) {
       const originalPath = pathRuntime.normalize(entry?.path || "");
       if (!originalPath || originalPath.startsWith("__MACOSX/")) continue;
       const relativePath = stripRoot
         ? (originalPath === folderName ? "" : originalPath.slice(folderName.length + 1))
         : originalPath;
       if (!relativePath) continue;
       if (entry?.directory) {
         await ensurePath(targetDir, relativePath);
         continue;
       }
       const parts = pathRuntime.split(relativePath);
       const fileName = parts.pop();
       const parentDir = parts.length == 0 ? targetDir : await ensurePath(targetDir, parts.join("/"));
       await writeBinary(parentDir, fileName, entry.bytes || new Uint8Array(0));
     }
     onDone(JSON.stringify({
       installed: true,
       name: String(skill.name || ""),
       folder_path: folderPath,
       root_name: String(rootHandle?.name || ""),
       zip_url: downloadUrl
     }, null, 2));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app40browser__choose__local__skill__hub__path = async (onDone, onError) => {
   try {
     if (typeof window.showDirectoryPicker !== "function") {
       throw new Error("This browser does not support local SKILL Hub directory selection.");
     }
     const handle = await window.showDirectoryPicker({ mode: "readwrite" });
     globalThis.__moonapLocalSkillHubRootHandle = handle;
     const ensureLocalSkillHubRuntime = () => {
       if (globalThis.__moonapLocalSkillHubRuntime && typeof globalThis.__moonapLocalSkillHubRuntime.putRootHandle === "function") {
         return globalThis.__moonapLocalSkillHubRuntime;
       }
       return null;
     };
     const runtime = ensureLocalSkillHubRuntime();
     if (runtime) {
       await runtime.putRootHandle(handle);
     }
     const label = document.querySelector("#localSkillHubRootLabel");
     if (label) {
       label.textContent = handle && handle.name
         ? `Selected folder: ${String(handle.name)}`
         : "No local SKILL Hub folder selected yet.";
     }
     onDone(String(handle?.name || ""));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app48browser__refresh__local__skill__hub__root__label = () => {
   const label = document.querySelector("#localSkillHubRootLabel");
   if (!label) return;
   const rootHandle = globalThis.__moonapLocalSkillHubRootHandle;
   label.textContent = rootHandle && rootHandle.name
     ? `Selected folder: ${String(rootHandle.name)}`
     : "No local SKILL Hub folder selected yet.";
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app44browser__on__local__skill__hub__choose__path = (handler) => document.addEventListener("click", (event) => {
   if (event.target?.id !== "localSkillHubChoosePath") return;
   event.preventDefault();
   event.stopPropagation();
   try {
     handler();
   } catch (error) {
     alert(`MoonAP local SKILL Hub directory selection failed: ${error instanceof Error ? error.message : String(error)}`);
   }
 });
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__load__personal__skill = async (skillId, onDone, onError) => {
   try {
     const runtime = globalThis.__moonapPersonalSkillRuntime;
     const folderRuntime = globalThis.__moonapSkillFolderRuntime;
     if (!runtime || typeof runtime.getHandle !== "function") {
       throw new Error("Personal SKILL runtime is not ready yet. Open the SKILL tab again and retry.");
     }
     if (!folderRuntime || typeof folderRuntime.ensurePermission !== "function") {
       throw new Error("MoonAP skill folder runtime is not ready yet. Open the SKILL tab again and retry.");
     }
     let fallback = null;
     try {
       const parsed = JSON.parse(localStorage.getItem("moonap.personal.skills") || "[]");
       if (Array.isArray(parsed)) {
         fallback = parsed.find((item) => String(item?.id || "") === String(skillId || "")) || null;
       }
     } catch {}
     let rootHandle = globalThis.__moonapSkillExportRootHandle;
     if ((!rootHandle || typeof rootHandle.entries !== "function") && typeof runtime.getRootHandle === "function") {
       rootHandle = await runtime.getRootHandle();
       if (rootHandle && typeof rootHandle.entries === "function") {
         globalThis.__moonapSkillExportRootHandle = rootHandle;
       }
     }
     if (rootHandle && typeof rootHandle.entries === "function") {
       const rootReady = await folderRuntime.ensurePermission(rootHandle, "read", true);
       if (!rootReady) {
         const error = new Error("MoonAP needs this browser to regain access to the selected Personal SKILL directory before it can open this skill.");
         error.code = "permission-denied";
         throw error;
       }
     }
     let handle = null;
     if (rootHandle && typeof runtime.findSkillDir === "function") {
       handle = await runtime.findSkillDir(rootHandle, skillId);
     }
     if (!handle) {
       handle = await runtime.getHandle(skillId);
     }
     if (!handle) {
       throw new Error("MoonAP could not find a saved local folder handle for this Personal SKILL.");
     }
     const handleReady = await folderRuntime.ensurePermission(handle, "read", true);
     if (!handleReady) {
       const error = new Error("MoonAP needs permission to reopen this saved Personal SKILL folder.");
       error.code = "permission-denied";
       throw error;
     }
     const loaded = await runtime.loadFromHandle(skillId, handle, fallback || {});
     onDone(JSON.stringify(loaded, null, 2));
   } catch (error) {
     onError(error instanceof Error ? error.message : String(error));
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25browser__set__mode__panel = (text) => {
   const panel = document.querySelector("#modePanel");
   if (panel) panel.setAttribute("aria-label", String(text));
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__set__skill__panel__open = (open) => {
   const panel = document.querySelector("#modePanel");
   const privacy = document.querySelector("#privacyStrip");
   if (panel) panel.style.display = "";
   if (privacy) privacy.style.display = "";
   panel?.classList.toggle("is-open", Boolean(open));
   privacy?.classList.toggle("is-open", Boolean(open));
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app46browser__refresh__personal__skill__root__label = () => {
   const panelLabel = document.querySelector("#personalSkillRootLabel");
   if (!panelLabel) return;
   const rootHandle = globalThis.__moonapSkillExportRootHandle;
   panelLabel.textContent = rootHandle && rootHandle.name
     ? `Selected folder: ${String(rootHandle.name)}`
     : "No local Personal SKILL folder selected yet.";
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__fetch__text = (path, onOk, onError) => {
   fetch(String(path))
     .then((response) => response.text())
     .then((text) => onOk(String(text)))
     .catch((error) => onError(error instanceof Error ? error.message : String(error)));
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json = (raw) => {
   try { return JSON.stringify(JSON.parse(String(raw)), null, 2); }
   catch { return String(raw); }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field = (raw, field) => {
   try {
     const value = JSON.parse(String(raw))?.[String(field)];
     return value == null ? "" : String(value);
   } catch {
     return "";
   }
 };
const _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__has__last__artifact__source = () => String(globalThis.__moonapLastArtifact?.moonbit_source || "").trim() !== "";
const _M0FPB18brute__force__findN6constrS8126 = 0;
const _M0FPB28boyer__moore__horspool__findN6constrS8125 = 0;
function _M0FPC15abort5abortGRPC16string10StringViewE(msg) {
  return $panic();
}
function _M0MPB13StringBuilder11new_2einner(size_hint) {
  return new _M0TPB13StringBuilder("");
}
function _M0MPB13StringBuilder10to__string(self) {
  return self.val;
}
function _M0IPB13StringBuilderPB6Logger11write__char(self, ch) {
  self.val = `${self.val}${String.fromCodePoint(ch)}`;
}
function _M0MPC16uint166UInt1622is__leading__surrogate(self) {
  return _M0IP016_24default__implPB7Compare6op__geGkE(self, 55296) && _M0IP016_24default__implPB7Compare6op__leGkE(self, 56319);
}
function _M0MPC16uint166UInt1623is__trailing__surrogate(self) {
  return _M0IP016_24default__implPB7Compare6op__geGkE(self, 56320) && _M0IP016_24default__implPB7Compare6op__leGkE(self, 57343);
}
function _M0FPB32code__point__of__surrogate__pair(leading, trailing) {
  return (((Math.imul(leading - 55296 | 0, 1024) | 0) + trailing | 0) - 56320 | 0) + 65536 | 0;
}
function _M0MPC16uint166UInt1616unsafe__to__char(self) {
  return self;
}
function _M0MPC16string10StringView6length(self) {
  return self.end - self.start | 0;
}
function _M0MPC16string10StringView11unsafe__get(self, index) {
  return self.str.charCodeAt(self.start + index | 0);
}
function _M0IPB13StringBuilderPB6Logger13write__string(self, str) {
  self.val = `${self.val}${str}`;
}
function _M0IPC16uint166UInt16PB2Eq10not__equal(self, that) {
  return self !== that;
}
function _M0IPC16uint166UInt16PB7Compare7compare(self, that) {
  return $compare_int(self, that);
}
function _M0IP016_24default__implPB2Eq10not__equalGsE(x, y) {
  return !(x === y);
}
function _M0IP016_24default__implPB7Compare6op__leGkE(x, y) {
  return _M0IPC16uint166UInt16PB7Compare7compare(x, y) <= 0;
}
function _M0IP016_24default__implPB7Compare6op__geGkE(x, y) {
  return _M0IPC16uint166UInt16PB7Compare7compare(x, y) >= 0;
}
function _M0MPC16string6String11sub_2einner(self, start, end) {
  const len = self.length;
  let end$2;
  if (end === undefined) {
    end$2 = len;
  } else {
    const _Some = end;
    const _end = _Some;
    end$2 = _end < 0 ? len + _end | 0 : _end;
  }
  const start$2 = start < 0 ? len + start | 0 : start;
  if (start$2 >= 0 && (start$2 <= end$2 && end$2 <= len)) {
    if (start$2 < len) {
      if (!_M0MPC16uint166UInt1623is__trailing__surrogate(self.charCodeAt(start$2))) {
      } else {
        $panic();
      }
    }
    if (end$2 < len) {
      if (!_M0MPC16uint166UInt1623is__trailing__surrogate(self.charCodeAt(end$2))) {
      } else {
        $panic();
      }
    }
    return new _M0TPC16string10StringView(self, start$2, end$2);
  } else {
    return $panic();
  }
}
function _M0IP016_24default__implPB6Logger16write__substringGRPB13StringBuilderE(self, value, start, len) {
  _M0IPB13StringBuilderPB6Logger11write__view(self, _M0MPC16string6String11sub_2einner(value, start, start + len | 0));
}
function _M0MPC16string10StringView4data(self) {
  return self.str;
}
function _M0MPC16string10StringView13start__offset(self) {
  return self.start;
}
function _M0MPB4Iter4nextGcE(self) {
  const _func = self;
  return _func();
}
function _M0MPB4Iter4nextGsE(self) {
  const _func = self;
  return _func();
}
function _M0MPC13int3Int18to__string_2einner(self, radix) {
  return _M0FPB19int__to__string__js(self, radix);
}
function _M0MPB4Iter3newGcE(f) {
  return f;
}
function _M0MPB4Iter3newGsE(f) {
  return f;
}
function _M0MPC16string10StringView12view_2einner(self, start_offset, end_offset) {
  let end_offset$2;
  if (end_offset === undefined) {
    end_offset$2 = _M0MPC16string10StringView6length(self);
  } else {
    const _Some = end_offset;
    end_offset$2 = _Some;
  }
  return start_offset >= 0 && (start_offset <= end_offset$2 && end_offset$2 <= _M0MPC16string10StringView6length(self)) ? new _M0TPC16string10StringView(self.str, self.start + start_offset | 0, self.start + end_offset$2 | 0) : _M0FPC15abort5abortGRPC16string10StringViewE("Invalid index for View");
}
function _M0IPC16string10StringViewPB4Show10to__string(self) {
  return self.str.substring(self.start, self.end);
}
function _M0MPC16string10StringView4iter(self) {
  const start = self.start;
  const end = self.end;
  const index = new _M0TPB8MutLocalGiE(start);
  return _M0MPB4Iter3newGcE(() => {
    if (index.val < end) {
      const c1 = self.str.charCodeAt(index.val);
      if (_M0MPC16uint166UInt1622is__leading__surrogate(c1) && (index.val + 1 | 0) < self.end) {
        const c2 = self.str.charCodeAt(index.val + 1 | 0);
        if (_M0MPC16uint166UInt1623is__trailing__surrogate(c2)) {
          index.val = index.val + 2 | 0;
          return _M0FPB32code__point__of__surrogate__pair(c1, c2);
        }
      }
      index.val = index.val + 1 | 0;
      return _M0MPC16uint166UInt1616unsafe__to__char(c1);
    } else {
      return -1;
    }
  });
}
function _M0MPB5Iter23newGicE(f) {
  return _M0MPB4Iter3newGsE(f);
}
function _M0MPC16string10StringView5iter2(self) {
  const start = self.start;
  const end = self.end;
  const index = new _M0TPB8MutLocalGiE(start);
  const char_index = new _M0TPB8MutLocalGiE(0);
  return _M0MPB5Iter23newGicE(() => {
    if (index.val < end) {
      const c1 = self.str.charCodeAt(index.val);
      if (_M0MPC16uint166UInt1622is__leading__surrogate(c1) && (index.val + 1 | 0) < self.end) {
        const c2 = self.str.charCodeAt(index.val + 1 | 0);
        if (_M0MPC16uint166UInt1623is__trailing__surrogate(c2)) {
          const result = { _0: char_index.val, _1: _M0FPB32code__point__of__surrogate__pair(c1, c2) };
          index.val = index.val + 2 | 0;
          char_index.val = char_index.val + 1 | 0;
          return result;
        }
      }
      const result = { _0: char_index.val, _1: _M0MPC16uint166UInt1616unsafe__to__char(c1) };
      index.val = index.val + 1 | 0;
      char_index.val = char_index.val + 1 | 0;
      return result;
    } else {
      return undefined;
    }
  });
}
function _M0MPC16string6String12view_2einner(self, start_offset, end_offset) {
  let end_offset$2;
  if (end_offset === undefined) {
    end_offset$2 = self.length;
  } else {
    const _Some = end_offset;
    end_offset$2 = _Some;
  }
  return start_offset >= 0 && (start_offset <= end_offset$2 && end_offset$2 <= self.length) ? new _M0TPC16string10StringView(self, start_offset, end_offset$2) : _M0FPC15abort5abortGRPC16string10StringViewE("Invalid index for View");
}
function _M0MPC15array9ArrayView6lengthGsE(self) {
  return self.end - self.start | 0;
}
function _M0IPB13StringBuilderPB6Logger11write__view(self, str) {
  self.val = `${self.val}${_M0IPC16string10StringViewPB4Show10to__string(str)}`;
}
function _M0FPB28boyer__moore__horspool__find(haystack, needle) {
  const haystack_len = _M0MPC16string10StringView6length(haystack);
  const needle_len = _M0MPC16string10StringView6length(needle);
  if (needle_len > 0) {
    if (haystack_len >= needle_len) {
      const skip_table = $make_array_len_and_init(256, needle_len);
      const _bind = needle_len - 1 | 0;
      let _tmp = 0;
      while (true) {
        const i = _tmp;
        if (i < _bind) {
          const _tmp$2 = _M0MPC16string10StringView11unsafe__get(needle, i) & 255;
          $bound_check(skip_table, _tmp$2);
          skip_table[_tmp$2] = (needle_len - 1 | 0) - i | 0;
          _tmp = i + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      let _tmp$2 = 0;
      while (true) {
        const i = _tmp$2;
        if (i <= (haystack_len - needle_len | 0)) {
          const _bind$2 = needle_len - 1 | 0;
          let _tmp$3 = 0;
          while (true) {
            const j = _tmp$3;
            if (j <= _bind$2) {
              if (_M0IPC16uint166UInt16PB2Eq10not__equal(_M0MPC16string10StringView11unsafe__get(haystack, i + j | 0), _M0MPC16string10StringView11unsafe__get(needle, j))) {
                break;
              }
              _tmp$3 = j + 1 | 0;
              continue;
            } else {
              return i;
            }
          }
          const _tmp$4 = _M0MPC16string10StringView11unsafe__get(haystack, (i + needle_len | 0) - 1 | 0) & 255;
          $bound_check(skip_table, _tmp$4);
          _tmp$2 = i + skip_table[_tmp$4] | 0;
          continue;
        } else {
          break;
        }
      }
      return undefined;
    } else {
      return undefined;
    }
  } else {
    return _M0FPB28boyer__moore__horspool__findN6constrS8125;
  }
}
function _M0FPB18brute__force__find(haystack, needle) {
  const haystack_len = _M0MPC16string10StringView6length(haystack);
  const needle_len = _M0MPC16string10StringView6length(needle);
  if (needle_len > 0) {
    if (haystack_len >= needle_len) {
      const needle_first = _M0MPC16string10StringView11unsafe__get(needle, 0);
      const forward_len = haystack_len - needle_len | 0;
      let _tmp = 0;
      while (true) {
        const i = _tmp;
        if (i <= forward_len) {
          if (_M0IPC16uint166UInt16PB2Eq10not__equal(_M0MPC16string10StringView11unsafe__get(haystack, i), needle_first)) {
            _tmp = i + 1 | 0;
            continue;
          }
          let _tmp$2 = 1;
          while (true) {
            const j = _tmp$2;
            if (j < needle_len) {
              if (_M0IPC16uint166UInt16PB2Eq10not__equal(_M0MPC16string10StringView11unsafe__get(haystack, i + j | 0), _M0MPC16string10StringView11unsafe__get(needle, j))) {
                break;
              }
              _tmp$2 = j + 1 | 0;
              continue;
            } else {
              return i;
            }
          }
          _tmp = i + 1 | 0;
          continue;
        } else {
          break;
        }
      }
      return undefined;
    } else {
      return undefined;
    }
  } else {
    return _M0FPB18brute__force__findN6constrS8126;
  }
}
function _M0MPC16string10StringView4find(self, str) {
  return _M0MPC16string10StringView6length(str) <= 4 ? _M0FPB18brute__force__find(self, str) : _M0FPB28boyer__moore__horspool__find(self, str);
}
function _M0MPC16string6String4find(self, str) {
  return _M0MPC16string10StringView4find(new _M0TPC16string10StringView(self, 0, self.length), str);
}
function _M0MPC16string10StringView8find__by(self, pred) {
  const _it = _M0MPC16string10StringView5iter2(self);
  while (true) {
    const _bind = _M0MPB5Iter24nextGicE(_it);
    if (_bind === undefined) {
      break;
    } else {
      const _Some = _bind;
      const _x = _Some;
      const _i = _x._0;
      const _c = _x._1;
      if (pred(_c)) {
        return _i;
      }
      continue;
    }
  }
  return undefined;
}
function _M0MPC16string6String8find__by(self, pred) {
  return _M0MPC16string10StringView8find__by(new _M0TPC16string10StringView(self, 0, self.length), pred);
}
function _M0MPC16string10StringView8contains(self, str) {
  const _bind = _M0MPC16string10StringView4find(self, str);
  return !(_bind === undefined);
}
function _M0MPC16string6String8contains(self, str) {
  return _M0MPC16string10StringView8contains(new _M0TPC16string10StringView(self, 0, self.length), str);
}
function _M0MPC16string6String4iter(self) {
  const len = self.length;
  const index = new _M0TPB8MutLocalGiE(0);
  return _M0MPB4Iter3newGcE(() => {
    if (index.val < len) {
      const c1 = self.charCodeAt(index.val);
      if (_M0MPC16uint166UInt1622is__leading__surrogate(c1) && (index.val + 1 | 0) < len) {
        const c2 = self.charCodeAt(index.val + 1 | 0);
        if (_M0MPC16uint166UInt1623is__trailing__surrogate(c2)) {
          const c = _M0FPB32code__point__of__surrogate__pair(c1, c2);
          index.val = index.val + 2 | 0;
          return c;
        }
      }
      index.val = index.val + 1 | 0;
      return _M0MPC16uint166UInt1616unsafe__to__char(c1);
    } else {
      return -1;
    }
  });
}
function _M0MPC16string6String12replace__all(self, old, new_) {
  const len = self.length;
  const buf = _M0MPB13StringBuilder11new_2einner(len);
  const old_len = _M0MPC16string10StringView6length(old);
  const new$2 = _M0IPC16string10StringViewPB4Show10to__string(new_);
  if (old_len === 0) {
    _M0IPB13StringBuilderPB6Logger13write__string(buf, new$2);
    const _it = _M0MPC16string6String4iter(self);
    while (true) {
      const _bind = _M0MPB4Iter4nextGcE(_it);
      if (_bind === -1) {
        break;
      } else {
        const _Some = _bind;
        const _c = _Some;
        _M0IPB13StringBuilderPB6Logger11write__char(buf, _c);
        _M0IPB13StringBuilderPB6Logger13write__string(buf, new$2);
        continue;
      }
    }
    return _M0MPB13StringBuilder10to__string(buf);
  } else {
    const first_end = _M0MPC16string6String4find(self, old);
    if (first_end === undefined) {
      return self;
    } else {
      const _Some = first_end;
      const _end = _Some;
      let _tmp = new _M0TPC16string10StringView(self, 0, self.length);
      let _tmp$2 = _end;
      while (true) {
        const view = _tmp;
        const end = _tmp$2;
        const seg = _M0MPC16string10StringView12view_2einner(view, 0, end);
        _M0IP016_24default__implPB6Logger16write__substringGRPB13StringBuilderE(buf, _M0MPC16string10StringView4data(seg), _M0MPC16string10StringView13start__offset(seg), _M0MPC16string10StringView6length(seg));
        _M0IPB13StringBuilderPB6Logger13write__string(buf, new$2);
        if ((end + old_len | 0) <= len) {
          const next_view = _M0MPC16string10StringView12view_2einner(view, end + old_len | 0, undefined);
          const _bind = _M0MPC16string10StringView4find(next_view, old);
          if (_bind === undefined) {
            _M0IP016_24default__implPB6Logger16write__substringGRPB13StringBuilderE(buf, _M0MPC16string10StringView4data(next_view), _M0MPC16string10StringView13start__offset(next_view), _M0MPC16string10StringView6length(next_view));
            break;
          } else {
            const _Some$2 = _bind;
            const _next_end = _Some$2;
            _tmp = next_view;
            _tmp$2 = _next_end;
            continue;
          }
        } else {
          break;
        }
      }
      return _M0MPB13StringBuilder10to__string(buf);
    }
  }
}
function _M0MPC14char4Char20is__ascii__uppercase(self) {
  return self >= 65 && self <= 90;
}
function _M0MPC16string6String9to__lower(self) {
  const _bind = _M0MPC16string6String8find__by(self, (x) => _M0MPC14char4Char20is__ascii__uppercase(x));
  if (_bind === undefined) {
    return self;
  } else {
    const _Some = _bind;
    const _idx = _Some;
    const buf = _M0MPB13StringBuilder11new_2einner(self.length);
    const head = _M0MPC16string6String12view_2einner(self, 0, _idx);
    _M0IP016_24default__implPB6Logger16write__substringGRPB13StringBuilderE(buf, _M0MPC16string10StringView4data(head), _M0MPC16string10StringView13start__offset(head), _M0MPC16string10StringView6length(head));
    const _it = _M0MPC16string10StringView4iter(_M0MPC16string6String12view_2einner(self, _idx, undefined));
    while (true) {
      const _bind$2 = _M0MPB4Iter4nextGcE(_it);
      if (_bind$2 === -1) {
        break;
      } else {
        const _Some$2 = _bind$2;
        const _c = _Some$2;
        if (_M0MPC14char4Char20is__ascii__uppercase(_c)) {
          _M0IPB13StringBuilderPB6Logger11write__char(buf, _c + 32 | 0);
        } else {
          _M0IPB13StringBuilderPB6Logger11write__char(buf, _c);
        }
        continue;
      }
    }
    return _M0MPB13StringBuilder10to__string(buf);
  }
}
function _M0MPC15array9ArrayView4iterGsE(self) {
  const i = new _M0TPB8MutLocalGiE(0);
  return _M0MPB4Iter3newGsE(() => {
    if (i.val < _M0MPC15array9ArrayView6lengthGsE(self)) {
      const elem = self.buf[self.start + i.val | 0];
      i.val = i.val + 1 | 0;
      return elem;
    } else {
      return undefined;
    }
  });
}
function _M0MPC15array5Array4iterGsE(self) {
  return _M0MPC15array9ArrayView4iterGsE(new _M0TPB9ArrayViewGsE(self, 0, self.length));
}
function _M0MPB4Iter4join(self, sep) {
  const result = _M0MPB13StringBuilder11new_2einner(0);
  const _bind = _M0MPB4Iter4nextGsE(self);
  if (_bind === undefined) {
  } else {
    const _Some = _bind;
    const _x = _Some;
    _M0IPB13StringBuilderPB6Logger13write__string(result, _x);
    while (true) {
      const _bind$2 = _M0MPB4Iter4nextGsE(self);
      if (_bind$2 === undefined) {
        break;
      } else {
        const _Some$2 = _bind$2;
        const _x$2 = _Some$2;
        _M0IPB13StringBuilderPB6Logger13write__string(result, sep);
        _M0IPB13StringBuilderPB6Logger13write__string(result, _x$2);
        continue;
      }
    }
  }
  return _M0MPB13StringBuilder10to__string(result);
}
function _M0MPB5Iter24nextGicE(self) {
  return _M0MPB4Iter4nextGsE(self);
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error(label, error) {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(`${label}: ${error}`);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process("-", label, "failed", error, "");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("MoonAP error", error, "[\"failed\"]", false, false, false);
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app17refresh__policies() {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__fetch__text("/api/app-state", (raw) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(raw));
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__render__onboarding();
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("app-state fetch failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app16show__llm__entry() {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25browser__set__mode__panel("LLM settings");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__set__skill__panel__open(false);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26browser__open__llm__dialog();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__fetch__text("/api/formal-verification", (raw) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(raw));
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("LLM state fetch failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18show__skill__entry() {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25browser__set__mode__panel("MoonAP SKILL Hub");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__set__skill__panel__open(true);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app46browser__refresh__personal__skill__root__label();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__render__personal__skills();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app48browser__refresh__local__skill__hub__root__label();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__render__local__skill__hub();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__render__cloud__skill__hub(false);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__fetch__text("/api/skills", (raw) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(raw));
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("SKILL hub fetch failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app22show__skill__run__plan(skill_id) {
  const _bind = "personal.";
  if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind, 0, _bind.length))) {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__load__personal__skill(skill_id, (raw) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(raw));
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app28browser__open__skill__dialog(skill_id);
    }, (error) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("Personal SKILL load failed", error);
    });
    return;
  } else {
    const _bind$2 = "local.";
    if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$2, 0, _bind$2.length))) {
    } else {
      const _bind$3 = "cloud.";
      _M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$3, 0, _bind$3.length));
    }
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app28browser__open__skill__dialog(skill_id);
    return;
  }
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app23show__experiment__entry() {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25browser__set__mode__panel("MoonAP Experiments");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__set__skill__panel__open(false);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app22show__skill__run__plan("free-llm-eval");
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19run__fastq__counter() {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__clear__artifact__card();
  if (!_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18browser__has__file()) {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__append__message("assistant", "Choose a FastQ file with the + button first, then run FastQ Base Counter. File contents will stay in this browser.");
    return undefined;
  }
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app28browser__run__fastq__counter(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app22browser__dialog__param("targetBase"), (progress) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(progress));
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__update__result__panel(progress);
  }, (result) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__update__result__panel(result);
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("FastQ analysis failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21run__fastq__generator() {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__clear__artifact__card();
  const read_count = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__dialog__param__int("readCount", 10000);
  const read_length = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__dialog__param__int("readLength", 150);
  const seed_value = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__dialog__param__int("seed", 42);
  const n_rate_text = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app22browser__dialog__param("nRate");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__generate__fastq__sample(read_count, read_length, n_rate_text, seed_value, (result) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__update__result__panel(result);
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("FastQ generator failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29run__free__llm__moonbit__eval(max_level) {
  const current = max_level < 1 ? 1 : max_level > 3 ? 3 : max_level;
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__append__message("assistant", `Starting Free LLM FastQ Eval. We will run the enabled provider/model entries against the single task 'Generate a FastQ file generator.' with the minimal prompt and up to ${_M0MPC13int3Int18to__string_2einner(current, 10)} repair rounds, then persist raw JSON plus a markdown summary.`);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "moonbit-eval", "running", "Preparing the experiment harness. Results will be persisted to artifacts/moonbit-eval-results.json and docs/experiments/free-llm-moonbit/results.md.", "");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__run__free__llm__moonbit__eval(current, (result) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Free LLM FastQ Eval finished", "MoonAP completed the current FastQ experiment pass and wrote both raw JSON and a markdown summary file.", "[\"experiment complete\",\"json persisted\",\"markdown persisted\"]", false, false, false);
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("Free LLM FastQ Eval failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32clamp__moonbit__benchmark__level(level) {
  return level < 1 ? 1 : level > 5 ? 5 : level;
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26moonbit__benchmark__prompt(level) {
  const current = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32clamp__moonbit__benchmark__level(level);
  return current === 1 ? _M0MPB4Iter4join(_M0MPC15array5Array4iterGsE(["MoonBit Benchmark Level 1.", "Write the smallest valid `cmd/main/main.mbt` that compiles under wasm-gc.", "Required behavior:", "- `main` returns the string `hello moonbit`", "- no helper functions", "- no imports", "- keep the file tiny", "Return only the file contents."]), "\n") : current === 2 ? _M0MPB4Iter4join(_M0MPC15array5Array4iterGsE(["MoonBit Benchmark Level 2.", "Write `cmd/main/main.mbt` with exactly one helper function plus `main`.", "Required behavior:", "- helper function returns the string `hello moonbit`", "- `main` calls the helper and returns the result", "- no imports", "- keep the file tiny and valid for wasm-gc compile", "Return only the file contents."]), "\n") : current === 3 ? _M0MPB4Iter4join(_M0MPC15array5Array4iterGsE(["MoonBit Benchmark Level 3.", "Write `cmd/main/main.mbt` that builds a fixed string using simple control flow.", "Required behavior:", "- return exactly `ABC` from `main`", "- no imports", "- no randomness", "- keep the implementation compact and valid for wasm-gc compile", "Return only the file contents."]), "\n") : current === 4 ? _M0MPB4Iter4join(_M0MPC15array5Array4iterGsE(["MoonBit Benchmark Level 4.", "Write `cmd/main/main.mbt` with two helper functions that thread a small deterministic integer state value.", "Required behavior:", "- one helper updates an integer state", "- one helper turns the state into a single base from `A`, `C`, `G`, `T`", "- `main` returns a fixed 12-character DNA string generated from seed 42", "- no imports", "- no floating point types", "- keep the code compact and valid for wasm-gc compile", "Return only the file contents."]), "\n") : _M0MPB4Iter4join(_M0MPC15array5Array4iterGsE(["MoonBit Benchmark Level 5.", "Write `cmd/main/main.mbt` for a tiny deterministic synthetic read generator.", "Required behavior:", "- return one 4-line FastQ record as a String", "- header must be `@moonap_benchmark_0`", "- sequence length must be 12", "- quality line must be twelve `I` characters", "- deterministic output from seed 42", "- no imports", "- keep the code compact and valid for wasm-gc compile", "Return only the file contents."]), "\n");
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25moonbit__benchmark__title(level) {
  return `MoonBit Benchmark L${_M0MPC13int3Int18to__string_2einner(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32clamp__moonbit__benchmark__level(level), 10)}`;
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24moonbit__llm__primer__v1() {
  return _M0MPB4Iter4join(_M0MPC15array5Array4iterGsE(["MoonBit 0.9 Primer for general LLMs:", "Treat MoonBit as its own language. Do not borrow syntax from Rust, C, C++, Go, Java, Python, TypeScript, or OCaml.", "", "MoonAP task constraints:", "1. Generate ONLY cmd/main/main.mbt. The build system already creates moon.mod.json and moon.pkg.", "2. Return source code only. No explanations, no markdown fences, no shell commands, no extra files.", "3. The target is `moon build cmd/main --target wasm-gc`, so keep the file self-contained.", "", "Core MoonBit 0.9 habits:", "4. Use MoonBit block style. The entry point should be `fn main { ... }`.", "5. Prefer the smallest valid solution that satisfies the task.", "6. Add helper functions only when they are clearly needed.", "7. If you are unsure about a library API, avoid that API and solve the task with basic language constructs.", "", "Tiny valid examples to imitate:", "fn main {", "  \"hello moonbit\"", "}", "", "fn greet(name : String) -> String {", "  \"hello \" + name", "}", "", "fn main {", "  greet(\"moonbit\")", "}", "", "Important syntax expectations:", "8. Use MoonBit type names like `Int`, `String`, `Bool`. Do not use `i32`, `u32`, `f32`, `usize`, or `char`.", "9. Do not write Rust-style imports like `import std::fmt;` or `use std::...`. In MoonAP tasks, do not write imports unless the task explicitly requires them.", "10. Do not write Rust mutation or collection syntax like `mut`, `let mut`, `String::new()`, `Vec`, `format!`, `println!`, `push_str`, or `as Type` casts.", "11. Do not write numeric suffixes like `42u32`, `1usize`, or `3.14f32`.", "12. Do not invent package declarations, trait syntax, impl blocks, or extra module files unless the task explicitly asks for them.", "", "Generation strategy:", "13. First write the smallest compilable MoonBit program that satisfies the task.", "14. Then add only the minimum helper functions or bindings needed by the requested behavior.", "15. When in doubt, choose simpler code over more abstract code."]), "\n");
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25max__auto__repair__rounds() {
  return 2;
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27on__runtime__request__ready(raw) {
  const request_id = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "request_id");
  const status = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "status");
  const wasm_path = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "wasm_path");
  if (request_id === "" || (status === "" || status === "empty")) {
    return undefined;
  }
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__set__transient__artifact__card(true);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app35browser__remember__runtime__request(raw);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(raw));
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__update__result__panel(raw);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "runtime-exec", status === "" ? "ready" : status, "MoonAP compiled a wasm artifact and prepared the next runtime-execution request. Browser display or downloadable output is the next step.", wasm_path === "" ? "No wasm path recorded yet." : `Wasm artifact: ${wasm_path}`);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Runtime execution is ready", "MoonAP has a compiled wasm artifact and is now waiting for browser-local execution or a simulated runtime result.", "[\"runtime ready\",\"browser display pending\",\"download allowed\"]", false, false, false);
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19run__compile__probe() {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__clear__artifact__card();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "moonbit-wasm-compile", "running", "Submitting captured MoonBit source to the native MoonAP compile probe.", "");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__compile__last__artifact(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__formal__verification__enabled(), (result) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__store__compile__report(result);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__append__runtime__log("compile", "compile-report", _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    const ok = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "ok");
    const stage = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "stage");
    const output = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "output");
    const wasm_path = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "wasm_path");
    const summary_kind = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "summary_kind");
    const repair_hint = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "repair_hint");
    const summary_excerpt = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "summary_excerpt");
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), stage === "" ? "moonbit-wasm-compile" : stage, ok === "true" ? "succeeded" : "failed", ok === "true" || summary_excerpt === "" ? output : repair_hint === "" ? summary_excerpt : `${summary_excerpt}\nRepair hint: ${repair_hint}`, wasm_path === "" ? "No wasm artifact was produced." : `Wasm artifact: ${wasm_path}`);
    if (ok === "true") {
      if (_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app65browser__should__adapt__last__artifact__for__large__file__runtime()) {
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32run__moonap__runtime__adaptation();
        return;
      } else {
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__register__runtime__ready((raw) => {
          _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27on__runtime__request__ready(raw);
        }, (error) => {
          _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__append__runtime__log("runtime-exec", "runtime-request-register-failed", error);
        });
        const benchmark_assessment = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__assess__last__benchmark();
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__append__runtime__log("benchmark", "benchmark-assessment", benchmark_assessment);
        const benchmark_applicable = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(benchmark_assessment, "applicable");
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app35browser__set__benchmark__assessment(benchmark_assessment);
        if (benchmark_applicable === "true") {
          const benchmark_title = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(benchmark_assessment, "title");
          const benchmark_summary = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(benchmark_assessment, "summary");
          const benchmark_meta_json = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(benchmark_assessment, "meta_json");
          const benchmark_pass = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(benchmark_assessment, "pass");
          _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "moonbit-benchmark-check", benchmark_pass === "true" ? "succeeded" : "failed", benchmark_summary, "");
          const benchmark_hint = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(benchmark_assessment, "repair_hint");
          const benchmark_missing_signals_json = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(benchmark_assessment, "missing_signals_json");
          if (_M0IP016_24default__implPB2Eq10not__equalGsE(benchmark_pass, "true") && _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app44maybe__auto__repair__after__quality__failure(benchmark_title, benchmark_summary, benchmark_hint, benchmark_missing_signals_json)) {
            return;
          } else {
            _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card(benchmark_title, benchmark_summary, benchmark_meta_json, true, false, false);
            _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__render__onboarding();
            return;
          }
        } else {
          _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Compile probe succeeded", "MoonAP used the native MoonBit toolchain on this machine and produced a real wasm-gc artifact. Browser-local runtime execution is the next implementation step.", "[\"compile probe ok\",\"real wasm built\",\"runtime pending\"]", true, false, false);
          _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__render__onboarding();
          return;
        }
      }
    } else {
      if (_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app44maybe__auto__repair__after__compile__failure(summary_kind, repair_hint, summary_excerpt)) {
        return;
      } else {
        const _tmp = repair_hint === "" ? "MoonAP attempted a real native compile and returned the true compiler output. Review Details and iterate on the generated source." : "MoonAP summarized the compiler failure, exhausted the current auto-repair budget, and kept the true compiler output for inspection.";
        const _bind = "\"";
        const _tmp$2 = new _M0TPC16string10StringView(_bind, 0, _bind.length);
        const _bind$2 = "'";
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Compile probe failed", _tmp, `[\"compile failed\",\"true compiler output\",\"${summary_kind}\",\"${_M0MPC16string6String12replace__all(summary_excerpt, _tmp$2, new _M0TPC16string10StringView(_bind$2, 0, _bind$2.length))}\"]`, true, false, false);
        return;
      }
    }
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("compile probe failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app44maybe__auto__repair__after__compile__failure(summary_kind, repair_hint, summary_excerpt) {
  const repair_round = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__last__artifact__repair__round();
  const max_rounds = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25max__auto__repair__rounds();
  if (repair_hint === "" || repair_round >= max_rounds) {
    return false;
  } else {
    const next_round = repair_round + 1 | 0;
    const log_text = summary_excerpt === "" ? repair_hint : `${summary_excerpt}\nRepair hint: ${repair_hint}`;
    const detected_kind = summary_kind === "" ? "compiler-error" : summary_kind;
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "compile-repair", "running", `Compile probe failed. MoonAP is auto-repairing round ${_M0MPC13int3Int18to__string_2einner(next_round, 10)}/${_M0MPC13int3Int18to__string_2einner(max_rounds, 10)} using Compile-Error Summarizer v1.\n${log_text}`, "");
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Compile probe failed, auto-repairing", `MoonAP detected ${detected_kind} and automatically started repair round ${_M0MPC13int3Int18to__string_2einner(next_round, 10)}/${_M0MPC13int3Int18to__string_2einner(max_rounds, 10)}.`, `[\"auto repair\",\"round ${_M0MPC13int3Int18to__string_2einner(next_round, 10)}\",\"${detected_kind}\"]`, false, false, false);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app35run__repair__from__compile__summary();
    return true;
  }
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app35run__repair__from__compile__summary() {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__clear__artifact__card();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "compile-repair", "running", "Submitting the captured compiler failure back to the next enabled provider with direct appended repair context.", "");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app55browser__repair__last__artifact__with__compile__summary(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__formal__verification__enabled(), _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24moonbit__llm__primer__v1(), (result) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__append__runtime__log("artifact", "repair-result", _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    const provider = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "llm_provider");
    const model = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "llm_model");
    const source = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "moonbit_source");
    const repair_round = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "repair_round");
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(provider === "" ? _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary() : model === "" ? provider : `${provider}/${model}`, "compile-repair", "succeeded", "Compile-Error Summarizer v1 injected the first compiler failure into a repair prompt. MoonAP captured a repaired MoonBit source and will run the compile probe again automatically.", source === "" ? "No repaired source returned." : source);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Repaired source is ready", `MoonAP generated repair round ${repair_round} from the summarized compiler failure and is now re-running the native compile probe.`, `[\"repair round ${repair_round}\",\"compile summary v1\",\"compile starting\"]`, true, false, false);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19run__compile__probe();
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("MoonBit compile repair failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app44maybe__auto__repair__after__quality__failure(assessment_title, assessment_summary, assessment_hint, missing_signals_json) {
  const repair_round = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__last__artifact__repair__round();
  const max_rounds = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25max__auto__repair__rounds();
  if (repair_round >= max_rounds) {
    return false;
  } else {
    const next_round = repair_round + 1 | 0;
    const detected_title = assessment_title === "" ? "System assessment failed" : assessment_title;
    const missing_excerpt = missing_signals_json === "" || missing_signals_json === "[]" ? "" : `\nMissing signals: ${missing_signals_json}`;
    const hint_excerpt = assessment_hint === "" ? missing_excerpt : `\nRepair hint: ${assessment_hint}${missing_excerpt}`;
    const log_text = `Compile probe succeeded, but system assessment failed. MoonAP is auto-repairing round ${_M0MPC13int3Int18to__string_2einner(next_round, 10)}/${_M0MPC13int3Int18to__string_2einner(max_rounds, 10)} using the captured benchmark feedback.\n${assessment_summary}${hint_excerpt}`;
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "quality-repair", "running", log_text, "");
    const _tmp = `MoonAP kept the compiled artifact, but the system assessment still failed. Starting quality repair round ${_M0MPC13int3Int18to__string_2einner(next_round, 10)}/${_M0MPC13int3Int18to__string_2einner(max_rounds, 10)}.`;
    const _tmp$2 = _M0MPC13int3Int18to__string_2einner(next_round, 10);
    const _bind = "\"";
    const _tmp$3 = new _M0TPC16string10StringView(_bind, 0, _bind.length);
    const _bind$2 = "'";
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Compile succeeded, auto-repairing quality", _tmp, `[\"quality repair\",\"round ${_tmp$2}\",\"${_M0MPC16string6String12replace__all(detected_title, _tmp$3, new _M0TPC16string10StringView(_bind$2, 0, _bind$2.length))}\"]`, false, false, false);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app37run__repair__from__system__assessment();
    return true;
  }
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app37run__repair__from__system__assessment() {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__clear__artifact__card();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "quality-repair", "running", "Submitting the captured system assessment back to the next enabled provider.", "");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app57browser__repair__last__artifact__with__system__assessment(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24moonbit__llm__primer__v1(), (result) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__append__runtime__log("artifact", "quality-repair-result", _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    const provider = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "llm_provider");
    const model = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "llm_model");
    const source = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "moonbit_source");
    const repair_round = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "repair_round");
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(provider === "" ? _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary() : model === "" ? provider : `${provider}/${model}`, "quality-repair", "succeeded", "MoonAP injected the current system assessment into a quality-repair prompt. The revised MoonBit source will now be compiled again automatically.", source === "" ? "No revised source returned." : source);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Quality-repaired source is ready", `MoonAP generated repair round ${repair_round} from the system assessment and is now re-running the native compile probe.`, `[\"quality repair round ${repair_round}\",\"system assessment\",\"compile starting\"]`, true, false, false);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19run__compile__probe();
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("MoonBit quality repair failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32run__moonap__runtime__adaptation() {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__clear__artifact__card();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "moonap-adaptation", "running", "Stage 1 compiled. MoonAP is now asking the active LLM route to adapt the compiled business code to the large-file runtime contract.", "");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Adapting source for MoonAP runtime", "The first-stage MoonBit source compiled. MoonAP is now running a second LLM pass to add large-file generation/analysis adapter functions, then it will compile again.", "[\"stage 2\",\"moonap adaptation\",\"compile starting next\"]", false, false, false);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app57browser__adapt__last__artifact__for__large__file__runtime((result) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__append__runtime__log("artifact", "moonap-adaptation-result", _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    const provider = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "llm_provider");
    const model = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "llm_model");
    const source = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "moonbit_source");
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(provider === "" ? _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary() : model === "" ? provider : `${provider}/${model}`, "moonap-adaptation", "succeeded", "MoonAP received adapted source with large-file runtime adapter functions. Re-running compile probe now.", source === "" ? "No adapted source returned." : source);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("MoonAP-adapted source is ready", "The second-stage source has been adapted for the MoonAP large-file runtime contract. MoonAP is compiling the adapted source now.", "[\"stage 2 complete\",\"adapter source\",\"compile starting\"]", true, false, false);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19run__compile__probe();
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("MoonAP runtime adaptation failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26run__llm__moonbit__codegen(task_title, prompt, source_summary, simple_mode) {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__clear__artifact__card();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__reset__compile__report();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app35browser__set__benchmark__assessment("");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "llm-codegen", "running", "Submitting the minimal MoonBit codegen prompt to the next enabled provider in the router.", "");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__generate__moonbit__artifact(task_title, prompt, simple_mode, _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__formal__verification__enabled(), _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24moonbit__llm__primer__v1(), (result) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__append__runtime__log("artifact", "llm-codegen-result", _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
    const provider = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "llm_provider");
    const model = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "llm_model");
    const source = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(result, "moonbit_source");
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(provider === "" ? _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary() : model === "" ? provider : `${provider}/${model}`, "llm-codegen", "succeeded", "Real LLM response received. MoonBit source captured from the minimal prompt flow. Compile/run remains pending until the next implementation step.", source === "" ? "No generated source returned." : source);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card(`${task_title} source is ready`, source_summary, "[\"real LLM response\",\"source captured\",\"compile starting\"]", true, false, false);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19run__compile__probe();
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("LLM MoonBit artifact generation failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app23run__moonbit__benchmark(level) {
  const current = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32clamp__moonbit__benchmark__level(level);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__append__message("assistant", `Running ${_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25moonbit__benchmark__title(current)}. We will use this to check whether the current LLM router can stay in valid MoonBit before we try harder tasks.`);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26run__llm__moonbit__codegen(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25moonbit__benchmark__title(current), _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26moonbit__benchmark__prompt(current), "MoonAP received benchmark source from the active router provider and is now starting a real native compile probe automatically.", true);
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30run__moonbit__fastq__generator() {
  const read_count = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__dialog__param__int("readCount", 10000);
  const read_length = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__dialog__param__int("readLength", 150);
  const seed_value = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__dialog__param__int("seed", 42);
  const n_rate_per_mille = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__dialog__param__int("nRatePerMille", 10);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__append__message("assistant", "Running MoonBit FastQ Generator. We will ask the active LLM router to generate a MoonBit program, then run a real compile probe and a basic FastQ structure check.");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26run__llm__moonbit__codegen("MoonBit FastQ Generator", _M0MPB4Iter4join(_M0MPC15array5Array4iterGsE(["Generate a Personal FastQ Generator in MoonBit.", "Write ONLY cmd/main/main.mbt so that `moon build cmd/main --target wasm-gc` succeeds.", "The program should return a String containing deterministic FastQ records.", "Keep these defaults in the source:", `- read_count = ${_M0MPC13int3Int18to__string_2einner(read_count, 10)}`, `- read_length = ${_M0MPC13int3Int18to__string_2einner(read_length, 10)}`, `- n_rate_per_mille = ${_M0MPC13int3Int18to__string_2einner(n_rate_per_mille, 10)}`, `- seed = ${_M0MPC13int3Int18to__string_2einner(seed_value, 10)}`, "Requirements:", "- generate valid 4-line FastQ records: header, sequence, plus line, quality", "- sequence uses only A, C, G, T, N", "- quality line uses I characters", "- deterministic from the seed", "- no imports", "- keep the code as simple and compact as possible", "Return only the file contents."]), "\n"), "MoonAP received a MoonBit FastQ generator candidate from the active router provider and is now starting a real native compile probe automatically.", true);
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app22execute__dialog__skill() {
  const skill_id = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26browser__dialog__skill__id();
  const personal_task_kind = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__dialog__skill__task__kind();
  const skill_source = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__dialog__skill__source();
  const external_url = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__dialog__external__url();
  const download_url = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__dialog__download__url();
  const folder_path = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__dialog__folder__path();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__close__skill__dialog();
  const _bind = "personal.";
  if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind, 0, _bind.length))) {
    if (personal_task_kind === "large-fastq-analysis") {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app44browser__run__dialog__large__fastq__analysis((result) => {
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__set__transient__artifact__card(true);
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Personal SKILL result is ready", "Review the browser-local analysis report. You can open or save the report, then rerun this SKILL whenever needed.", "[\"personal skill\",\"runtime succeeded\",\"report ready\"]", false, false, false);
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Personal SKILL analyzed the FastQ file with browser-local streaming.");
      }, (error) => {
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("Personal SKILL large FastQ analysis failed", error);
      });
      return undefined;
    }
    if (personal_task_kind === "large-file-generation") {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app45browser__run__dialog__large__file__generation((result) => {
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Personal SKILL generated the FastQ file with browser-local streaming.");
      }, (error) => {
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("Personal SKILL large-file generation failed", error);
      });
      return undefined;
    }
    if (personal_task_kind === "fastq-generator") {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21run__fastq__generator();
      return undefined;
    }
    if (personal_task_kind === "fastq-analysis") {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19run__fastq__counter();
      return undefined;
    }
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__run__dialog__generic__skill((result) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__set__transient__artifact__card(true);
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Personal SKILL result is ready", "Review the browser-local result. This SKILL used its saved runtime spec and did not ask the LLM again.", "[\"personal skill\",\"generic runtime\",\"runtime succeeded\"]", false, false, false);
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Personal SKILL ran with the generic runtime.");
    }, (error) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("Personal SKILL generic runtime failed", error);
    });
    return undefined;
  }
  if (skill_source === "local") {
    if (personal_task_kind === "large-fastq-analysis") {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app44browser__run__dialog__large__fastq__analysis((result) => {
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__set__transient__artifact__card(true);
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Local SKILL result is ready", "Review the browser-local analysis report. You can open or save the report, then rerun this SKILL whenever needed.", "[\"local skill\",\"runtime succeeded\",\"report ready\"]", false, false, false);
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Local SKILL analyzed the FastQ file with browser-local streaming.");
      }, (error) => {
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("Local SKILL large FastQ analysis failed", error);
      });
      return undefined;
    }
    if (personal_task_kind === "large-file-generation") {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app45browser__run__dialog__large__file__generation((result) => {
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Local SKILL generated the FastQ file with browser-local streaming.");
      }, (error) => {
        _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("Local SKILL large-file generation failed", error);
      });
      return undefined;
    }
    if (personal_task_kind === "fastq-generator") {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21run__fastq__generator();
      return undefined;
    }
    if (personal_task_kind === "fastq-analysis") {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19run__fastq__counter();
      return undefined;
    }
    let _tmp;
    const _bind$2 = "gomoku";
    if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$2, 0, _bind$2.length))) {
      _tmp = true;
    } else {
      _tmp = personal_task_kind === "browser-game";
    }
    if (_tmp) {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Local public SKILL metadata is loaded. Task-specific execution wiring for this installed skill is the next step.");
      return undefined;
    }
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__run__dialog__generic__skill((result) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__set__transient__artifact__card(true);
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Local SKILL result is ready", "Review the browser-local result. This installed SKILL used its saved runtime spec and did not ask the LLM again.", "[\"local skill\",\"generic runtime\",\"runtime succeeded\"]", false, false, false);
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Local SKILL ran with the generic runtime.");
    }, (error) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("Local SKILL generic runtime failed", error);
    });
    return undefined;
  }
  if (skill_source === "cloud") {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Installing Cloud SKILL into Local SKILL Hub...");
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__install__cloud__skill(skill_id, (result) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app48browser__refresh__local__skill__hub__root__label();
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__render__local__skill__hub();
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(result));
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast(folder_path === "" ? "Cloud SKILL installed into Local SKILL Hub." : `Cloud SKILL installed: ${folder_path}`);
    }, (error) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("Cloud SKILL install failed", _M0IP016_24default__implPB2Eq10not__equalGsE(download_url, "") || _M0IP016_24default__implPB2Eq10not__equalGsE(external_url, "") ? `${error} You can still open the source repository manually if needed.` : error);
    });
    return undefined;
  }
  const _bind$2 = "moonbit-benchmark";
  if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$2, 0, _bind$2.length))) {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app23run__moonbit__benchmark(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__dialog__param__int("benchmarkLevel", 1));
    return undefined;
  }
  const _bind$3 = "free-llm-eval";
  if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$3, 0, _bind$3.length))) {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29run__free__llm__moonbit__eval(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__dialog__param__int("evalRepairRounds", 2));
    return undefined;
  }
  const _bind$4 = "moonbit.fastq-generator";
  if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$4, 0, _bind$4.length))) {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30run__moonbit__fastq__generator();
    return undefined;
  }
  const _bind$5 = "fastq-base-counter";
  if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$5, 0, _bind$5.length))) {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19run__fastq__counter();
    return undefined;
  }
  const _bind$6 = "fastq-generator";
  if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$6, 0, _bind$6.length))) {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21run__fastq__generator();
    return undefined;
  }
  let path;
  const _bind$7 = "finance";
  if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$7, 0, _bind$7.length))) {
    path = "/api/skills/run-plan?finance";
  } else {
    const _bind$8 = "generator";
    if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$8, 0, _bind$8.length))) {
      path = "/api/skills/run-plan?generator";
    } else {
      let _tmp;
      const _bind$9 = "gomoku";
      if (_M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$9, 0, _bind$9.length))) {
        _tmp = true;
      } else {
        const _bind$10 = "game";
        _tmp = _M0MPC16string6String8contains(skill_id, new _M0TPC16string10StringView(_bind$10, 0, _bind$10.length));
      }
      if (_tmp) {
        path = "/api/skills/run-plan?gomoku";
      } else {
        path = skill_id === "personal" ? "/api/personal-skill-set" : "/api/skills/run-plan?fastq";
      }
    }
  }
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__fetch__text(path, (raw) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(raw));
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("SKILL plan fetch failed", error);
  });
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26on__runtime__result__ready(raw) {
  const request_id = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "request_id");
  const status = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "status");
  const summary = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "summary");
  const display_text = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "display_text");
  const download_name = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "download_name");
  if (request_id === "" || (status === "" || status === "empty")) {
    return undefined;
  }
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__set__transient__artifact__card(true);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__remember__runtime__result(raw);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(raw));
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__update__result__panel(raw);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "runtime-exec", status === "" ? "runtime-succeeded" : status, summary === "" ? "MoonAP received a runtime result." : summary, display_text === "" ? (download_name === "" ? "No browser-visible runtime preview was recorded." : `Downloadable result: ${download_name}`) : display_text);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Runtime result is ready", "Review the runtime output. If it looks good, you can now save this workflow as a reusable Personal SKILL.", "[\"runtime succeeded\",\"result visible\",\"user review pending\"]", false, false, true);
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25on__skill__save__decision(raw) {
  const request_id = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "request_id");
  const decision = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "decision");
  const reason = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "reason");
  const exported_folder = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "exported_folder_name");
  const exported_root = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "exported_root_name");
  const exported_zip = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__artifact__field(raw, "exported_zip_name");
  if (!_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__has__last__artifact__source()) {
    return undefined;
  }
  if (request_id === "" || (decision === "" || (decision === "pending" || decision === "unset"))) {
    return;
  } else {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__set__transient__artifact__card(true);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__set__state(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__pretty__json(raw));
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app21browser__llm__summary(), "skill-export", decision, reason === "" ? "MoonAP recorded the user's save decision." : reason, "");
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("SKILL export completed", reason === "" ? "MoonAP exported the current workflow as a Personal SKILL. You can still rerun the program from this page or save another copy with a different name or location." : exported_folder === "" ? `${reason} You can still rerun the program from this page or save another copy with a different name or location.` : exported_root === "" ? `${reason} Exported folder: ${exported_folder}. You can still rerun the program from this page or save another copy with a different name or location.` : `${reason} Exported to ${exported_root}/${exported_folder}${exported_zip === "" ? "" : ` with ZIP package ${exported_zip}.`}. You can still rerun the program from this page or save another copy with a different name or location.`, "[\"skill decision\",\"recorded\"]", false, false, true);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast(exported_folder === "" ? "SKILL saved. You can rerun the program or save another copy with a different name." : exported_root === "" ? `SKILL saved as ${exported_folder}. You can rerun the program or save another copy.` : `SKILL saved to ${exported_root}/${exported_folder}${exported_zip === "" ? "" : ` with ZIP package ${exported_zip}.`}. You can rerun the program or save another copy.`);
    return;
  }
}
function _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app15submit__message() {
  const message = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app23browser__message__value();
  const file_name = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__file__name();
  const lower_message = _M0MPC16string6String9to__lower(message);
  const lower_file_name = _M0MPC16string6String9to__lower(file_name);
  if (message === "") {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__append__message("assistant", "Please enter a task first.");
    return undefined;
  }
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__append__message("user", message);
  if (!_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app28browser__llm__is__configured()) {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__append__message("assistant", "LLM API is not configured yet. Please save provider, model, and API key first. You can still use SKILL without LLM.");
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26browser__open__llm__dialog();
    return undefined;
  }
  if (_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__formal__verification__enabled()) {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__append__message("assistant", "Formal verification is reserved for a future MoonBit 0.9 moon prove step and is not executed yet.");
  }
  let fastq_mentioned;
  const _bind = "fastq";
  if (_M0MPC16string6String8contains(lower_message, new _M0TPC16string10StringView(_bind, 0, _bind.length))) {
    fastq_mentioned = true;
  } else {
    let _tmp;
    const _bind$2 = ".fq";
    if (_M0MPC16string6String8contains(lower_file_name, new _M0TPC16string10StringView(_bind$2, 0, _bind$2.length))) {
      _tmp = true;
    } else {
      const _bind$3 = ".fastq";
      _tmp = _M0MPC16string6String8contains(lower_file_name, new _M0TPC16string10StringView(_bind$3, 0, _bind$3.length));
    }
    fastq_mentioned = _tmp;
  }
  let wants_fastq_generation;
  let _tmp;
  const _bind$2 = "generat";
  if (_M0MPC16string6String8contains(lower_message, new _M0TPC16string10StringView(_bind$2, 0, _bind$2.length))) {
    _tmp = true;
  } else {
    const _bind$3 = "create";
    _tmp = _M0MPC16string6String8contains(lower_message, new _M0TPC16string10StringView(_bind$3, 0, _bind$3.length));
  }
  if (_tmp) {
    let _tmp$2;
    const _bind$3 = "analy";
    if (!_M0MPC16string6String8contains(lower_message, new _M0TPC16string10StringView(_bind$3, 0, _bind$3.length))) {
      const _bind$4 = "count";
      _tmp$2 = !_M0MPC16string6String8contains(lower_message, new _M0TPC16string10StringView(_bind$4, 0, _bind$4.length));
    } else {
      _tmp$2 = false;
    }
    wants_fastq_generation = _tmp$2;
  } else {
    wants_fastq_generation = false;
  }
  let wants_fastq_file_analysis;
  if (fastq_mentioned) {
    let _tmp$2;
    if (!wants_fastq_generation) {
      let _tmp$3;
      const _bind$3 = "analy";
      if (_M0MPC16string6String8contains(lower_message, new _M0TPC16string10StringView(_bind$3, 0, _bind$3.length))) {
        _tmp$3 = true;
      } else {
        let _tmp$4;
        const _bind$4 = "count";
        if (_M0MPC16string6String8contains(lower_message, new _M0TPC16string10StringView(_bind$4, 0, _bind$4.length))) {
          _tmp$4 = true;
        } else {
          let _tmp$5;
          const _bind$5 = "read";
          if (_M0MPC16string6String8contains(lower_message, new _M0TPC16string10StringView(_bind$5, 0, _bind$5.length))) {
            _tmp$5 = true;
          } else {
            const _bind$6 = "base";
            _tmp$5 = _M0MPC16string6String8contains(lower_message, new _M0TPC16string10StringView(_bind$6, 0, _bind$6.length));
          }
          _tmp$4 = _tmp$5;
        }
        _tmp$3 = _tmp$4;
      }
      _tmp$2 = _tmp$3;
    } else {
      _tmp$2 = false;
    }
    wants_fastq_file_analysis = _tmp$2;
  } else {
    wants_fastq_file_analysis = false;
  }
  if (_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18browser__has__file() && wants_fastq_file_analysis) {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19run__fastq__counter();
    return undefined;
  }
  const _bind$3 = "moonbit benchmark";
  if (_M0MPC16string6String8contains(lower_message, new _M0TPC16string10StringView(_bind$3, 0, _bind$3.length))) {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app23run__moonbit__benchmark(1);
    return undefined;
  }
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26run__llm__moonbit__codegen("MoonBit Task", message, "MoonAP received MoonBit source from the active router provider and is now starting a real native compile probe automatically.", false);
}
(() => {
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__extract__moonbit__source("");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__enable__minimal__shell();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__prepare__message__input("Generate a FastQ file generator.");
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19browser__on__submit(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app15submit__message();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app42browser__ensure__runtime__profile__runtime();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__ensure__report__runtime();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18browser__on__click("#experimentButton", () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app23show__experiment__entry();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18browser__on__click("#detailsToggle", () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__toggle__details();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18browser__on__click("#llmButton", () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app16show__llm__entry();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18browser__on__click("#skillButton", () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18show__skill__entry();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__on__onboarding__action(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app23run__moonbit__benchmark(_M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__next__benchmark__level());
  }, () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18show__skill__entry();
  }, () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app16show__llm__entry();
  }, () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__open__runtime__log();
  }, () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__download__runtime__log();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__on__skill__card__click((skill_id) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app22show__skill__run__plan(skill_id);
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__on__dialog__run(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app22execute__dialog__skill();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__on__dialog__open__source(() => {
    const external_url = _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__dialog__external__url();
    if (external_url === "") {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("Open source unavailable", "This SKILL entry does not expose a GitHub source URL yet.");
      return;
    } else {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app28browser__open__external__url(external_url);
      return;
    }
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__on__dialog__cancel(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__close__skill__dialog();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app22browser__on__llm__save(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27browser__render__onboarding();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__on__llm__cancel(() => {
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__on__compile__artifact(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app19run__compile__probe();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__on__repair__artifact(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app35run__repair__from__compile__summary();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app40browser__on__download__runtime__artifact("wasm", () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__download__runtime__artifact("wasm");
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app40browser__on__download__runtime__artifact("source", () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__download__runtime__artifact("source");
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app40browser__on__download__runtime__artifact("compile-report", () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__download__runtime__artifact("compile-report");
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app40browser__on__download__runtime__artifact("result", () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__download__runtime__artifact("result");
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app28browser__on__start__new__app(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__start__new__app();
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Started a new APP. Enter the next prompt in the message box.");
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__on__runtime__report__action("open", () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__open__runtime__report();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__on__runtime__report__action("save", () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app30browser__save__runtime__report();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app42browser__on__record__demo__runtime__result(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__record__demo__runtime__result((result) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26on__runtime__result__ready(result);
    }, (error) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("demo-runtime failed", error);
    });
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__export__last__artifact__bundle((folder) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Source bundle exported", `MoonAP exported a browser-downloadable source bundle for ${folder}. This bundle is for the next implementation step; it is not yet a runnable Personal SKILL.`, "[\"exported\",\"source bundle\"]", true, false, false);
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__on__save__personal__skill(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__open__skill__export__dialog();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app40browser__on__skill__export__choose__path(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__choose__skill__export__path((_folder_name) => {
    }, (error) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("skill-export path selection failed", error);
    });
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app42browser__on__personal__skill__choose__path(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__choose__skill__export__path((_folder_name) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app46browser__refresh__personal__skill__root__label();
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__render__personal__skills();
    }, (error) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("personal skill directory selection failed", error);
    });
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app44browser__on__local__skill__hub__choose__path(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app40browser__choose__local__skill__hub__path((_folder_name) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app48browser__refresh__local__skill__hub__root__label();
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__render__local__skill__hub();
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Local SKILL Hub directory connected.");
    }, (error) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("local SKILL Hub directory selection failed", error);
    });
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app18browser__on__click("#cloudSkillHubRefresh", () => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__render__cloud__skill__hub(true);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Refreshing Cloud SKILL catalog from the official MoonAP-SKILL-Hub repository.");
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__ensure__virtual__path__runtime();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__ensure__file__name__runtime();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app47browser__ensure__large__file__progress__runtime();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app39browser__ensure__skill__folder__runtime();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__ensure__skill__zip__runtime();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app42browser__ensure__runtime__profile__runtime();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app35browser__on__skill__export__confirm(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app29browser__request__skill__save((result) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app37browser__close__skill__export__dialog();
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__render__personal__skills();
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app32browser__set__skill__panel__open(true);
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("SKILL saved. You can rerun this program, or save another copy with a different name or location.");
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25on__skill__save__decision(result);
    }, (error) => {
      _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app11show__error("save-to-skill failed", error);
    });
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app36browser__on__runtime__profile__apply((raw) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app24browser__update__process("Runtime profile", "runtime-profile-override", "applied", "MoonAP switched the current runtime profile and re-rendered the runtime form.", raw);
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast("Runtime profile switched for this run. If you save this APP as a SKILL, MoonAP will reuse this profile.");
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app31browser__render__artifact__card("Runtime execution is ready", "MoonAP has a compiled wasm artifact and is now waiting for browser-local execution or a simulated runtime result.", "[\"runtime ready\",\"browser display pending\",\"download allowed\"]", false, false, false);
  }, (error) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app20browser__show__toast(`Runtime profile switch failed: ${error}`);
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__on__skill__export__cancel(() => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app37browser__close__skill__export__dialog();
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__watch__runtime__protocol((raw) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app27on__runtime__request__ready(raw);
  }, (raw) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app26on__runtime__result__ready(raw);
  }, (raw) => {
    _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app25on__skill__save__decision(raw);
  });
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app33browser__render__personal__skills();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__render__local__skill__hub();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app34browser__render__cloud__skill__hub(false);
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app38browser__restore__formal__verification();
  _M0FP412tangmaomao1618moonap__mb__server3cmd8web__app17refresh__policies();
})();
