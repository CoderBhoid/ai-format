use aif::bridge::*;
use aif::config::*;
use aif::crypto::*;
use aif::interrupt::*;
use aif::orbital::*;
use clap::{Parser, Subcommand};
use std::io::Read;
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "aif")]
#[command(about = "AIF V4 Core Engine: Fast Agentic Context and Orbital Memory", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Initialize a project and key store
    Init {
        #[arg(short, long)]
        project: Option<String>,
        #[arg(short, long)]
        model: Option<String>,
    },
    /// Save a cognitive note into an orbital ring
    Note {
        #[arg(short, long)]
        project: Option<String>,
        #[arg(short, long)]
        model: Option<String>,
        #[arg(short, long, default_value_t = 0.8)]
        importance: f64,
        #[arg(short, long)]
        summary: String,
        #[arg(short, long)]
        content: Option<String>,
        #[arg(short, long)]
        tags: Option<String>,
    },
    /// Recall memories and context blocks
    Recall {
        path: Option<String>,
        #[arg(short, long)]
        project: Option<String>,
        #[arg(short, long)]
        model: Option<String>,
        #[arg(long)]
        core_and_bridge: bool,
        #[arg(long)]
        vars: bool,
        #[arg(long)]
        block: Option<String>,
        #[arg(short, long)]
        query: Option<String>,
        #[arg(long)]
        header: bool,
        #[arg(long)]
        all: bool,
    },
    /// Query and manage cross-project bridge nexus
    Bridge {
        #[arg(short, long)]
        query: Option<String>,
        #[arg(short, long)]
        project: Option<String>,
        #[arg(long)]
        reindex: bool,
    },
    /// Write immediate working state to volatile scratch buffer
    Scratch {
        text: String,
    },
    /// Dynamically reweight a block's importance and migrate its ring
    Reweight {
        #[arg(short, long)]
        project: Option<String>,
        #[arg(short, long)]
        model: Option<String>,
        #[arg(short, long)]
        block: String,
        #[arg(short, long)]
        importance: f64,
    },
    /// Apply temporal decay formula and migrate rings across all blocks
    Optimize {
        #[arg(short, long)]
        project: Option<String>,
        #[arg(short, long)]
        model: Option<String>,
        #[arg(short, long)]
        path: Option<String>,
        #[arg(short, long, default_value_t = 0.05)]
        delta: f64,
        #[arg(short, long)]
        keywords: Option<String>,
    },
    /// Run signal trap in foreground watching for sudden termination
    Watch {
        #[arg(short, long)]
        project: Option<String>,
        #[arg(short, long)]
        model: Option<String>,
    },
}

fn resolve_project_file(project: &str) -> PathBuf {
    PathBuf::from(format!("{}.ai", sanitize_identifier(project)))
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let cli = Cli::parse();
    let config = load_config();

    match cli.command {
        Commands::Init { project, model } => {
            let proj = project.unwrap_or(config.default_project);
            let mdl = model.unwrap_or(config.default_model);
            let key = load_or_create_key(&proj, &mdl)?;
            let file_path = resolve_project_file(&proj);
            let keys = derive_keys(&key);

            if !file_path.exists() {
                let header = AifHeader {
                    format_version: "AIF_V4".to_string(),
                    project_id: proj.clone(),
                    model_id: mdl.clone(),
                    global_metadata: serde_json::json!({ "created_at": chrono::Utc::now().to_rfc3339() }),
                    block_index_map: std::collections::BTreeMap::new(),
                    graph_links: Vec::new(),
                };
                write_file_v4(&file_path, header, &std::collections::BTreeMap::new(), &keys)?;
                println!("[+] Initialized project '{}' with file '{}'", proj, file_path.display());
            } else {
                println!("[*] Project file '{}' already exists.", file_path.display());
            }

            let bridge_path = get_bridge_path();
            let _ = register_project_in_bridge(&bridge_path, &proj, &mdl, &file_path, &keys);

            let new_cfg = AifConfig {
                default_project: proj,
                default_model: mdl,
                storage_dir: None,
            };
            let _ = save_config(&new_cfg);
            println!("[+] Initialized configuration and bridge nexus.");

            let git_hook_path = std::path::PathBuf::from(".git").join("hooks").join("post-commit");
            if std::path::Path::new(".git").exists() && !git_hook_path.exists() {
                let hook_content = format!(
                    "#!/bin/sh\n# AIF Auto-Commit Hook\nMSG=$(git log -1 --pretty=%s 2>/dev/null)\nif [ -n \"$MSG\" ]; then\n  aif note --project {} --importance 0.85 --summary \"Git commit: $MSG\" --tags \"git,commit\" >/dev/null 2>&1 || true\nfi\n",
                    new_cfg.default_project
                );
                if let Some(parent) = git_hook_path.parent() {
                    let _ = std::fs::create_dir_all(parent);
                }
                if std::fs::write(&git_hook_path, hook_content).is_ok() {
                    #[cfg(unix)]
                    {
                        use std::os::unix::fs::PermissionsExt;
                        let _ = std::fs::set_permissions(&git_hook_path, std::fs::Permissions::from_mode(0o755));
                    }
                    println!("[+] Installed automatic git post-commit memory hook in .git/hooks/post-commit");
                }
            }

            if let Some(home) = dirs::home_dir() {
                for rc_name in [".bashrc", ".zshrc"] {
                    let rc_path = home.join(rc_name);
                    if rc_path.exists() {
                        if let Ok(content) = std::fs::read_to_string(&rc_path) {
                            if !content.contains("aif note --importance 0.90 --summary \"Workspace session closed\"") {
                                let trap_line = "\n# AIF V4 Auto-Save Exit Trap\ntrap 'if [ -f .aif_config.json ] && command -v aif >/dev/null 2>&1; then aif note --importance 0.90 --summary \"Workspace session closed\" --tags \"lifecycle,auto-save\" >/dev/null 2>&1; fi' EXIT SIGHUP SIGTERM\n";
                                use std::io::Write;
                                if let Ok(mut f) = std::fs::OpenOptions::new().append(true).open(&rc_path) {
                                    let _ = f.write_all(trap_line.as_bytes());
                                    println!("[+] Injected deterministic auto-save exit trap into {}", rc_path.display());
                                }
                            }
                        }
                    }
                }
            }

            let injected = auto_detect_and_inject_ide_rules();
            if !injected.is_empty() {
                println!("[+] Automatically injected memory lifecycle rules into:");
                for target in injected {
                    println!("    - {}", target);
                }
            } else {
                println!("[*] No existing agent configuration files found to auto-inject. See README.md for manual prompt.");
            }
        }
        Commands::Note { project, model, importance, summary, content, tags } => {
            let proj = project.unwrap_or(config.default_project);
            let mdl = model.unwrap_or(config.default_model);
            let key = load_or_create_key(&proj, &mdl)?;
            let keys = derive_keys(&key);
            let file_path = resolve_project_file(&proj);

            let (header, mut blocks) = if file_path.exists() {
                read_all_blocks(&file_path, &keys)?
            } else {
                (
                    AifHeader {
                        format_version: "AIF_V4".to_string(),
                        project_id: proj.clone(),
                        model_id: mdl.clone(),
                        global_metadata: serde_json::json!({}),
                        block_index_map: std::collections::BTreeMap::new(),
                        graph_links: Vec::new(),
                    },
                    std::collections::BTreeMap::new(),
                )
            };

            let ring = OrbitalRing::from_importance(importance);
            let text_content = content.unwrap_or_else(|| summary.clone());
            let processed_text = match ring {
                OrbitalRing::Int16Core => text_content,
                OrbitalRing::Int8Ring => prune_helper_words(&text_content),
                OrbitalRing::Int2Crust => deep_summary(&text_content),
            };

            let topic_tags: Vec<String> = tags
                .map(|t| t.split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect())
                .unwrap_or_default();

            let block_id = format!("note_{}_{}", chrono::Utc::now().timestamp_millis(), blocks.len());
            let block_entry = BlockEntry {
                ring,
                offset: 0,
                size: 0,
                salt: String::new(),
                mac_tag: String::new(),
                importance,
                timestamp: chrono::Utc::now().timestamp(),
                topic_tags: topic_tags.clone(),
                metadata: serde_json::json!({ "summary": summary }),
            };

            let block_val = serde_json::json!({
                "summary": summary,
                "text": processed_text,
                "tags": topic_tags,
            });

            blocks.insert(block_id.clone(), (block_val, block_entry));
            write_file_v4(&file_path, header, &blocks, &keys)?;
            println!("[+] Note added to block '{}' in ring '{}' (importance: {:.2})", block_id, ring.as_str(), importance);

            if ring == OrbitalRing::Int16Core {
                let bridge_path = get_bridge_path();
                let _ = register_project_in_bridge(&bridge_path, &proj, &mdl, &file_path, &keys);
            }
        }
        Commands::Recall { path, project, model, core_and_bridge, vars, block, query, header, all: _ } => {
            let proj = project.unwrap_or(config.default_project);
            let mdl = model.unwrap_or(config.default_model);
            let file_path = path.map(PathBuf::from).unwrap_or_else(|| resolve_project_file(&proj));

            if core_and_bridge {
                println!("=== [AIF V4 Boot Recall: Red Core & Cross-Project Bridge] ===");
                if file_path.exists() {
                    let key = load_or_create_key(&proj, &mdl)?;
                    let keys = derive_keys(&key);
                    let (_hdr, blocks) = read_all_blocks(&file_path, &keys)?;
                    println!("[*] Active Project: {} (Total Blocks: {})", proj, blocks.len());
                    for (b_id, (val, entry)) in blocks {
                        if entry.ring == OrbitalRing::Int16Core {
                            println!("\n[RED CORE INT16] Block: {} (Score: {:.2})", b_id, entry.importance);
                            println!("{}", serde_json::to_string_pretty(&val)?);
                        }
                    }
                }
                println!("\n[*] Querying Cross-Project Bridge Nexus...");
                let bridge_path = get_bridge_path();
                let results = query_bridge_unpack(&bridge_path, query.as_deref(), None)?;
                for (p_id, ptr, val) in results {
                    println!("\n[BRIDGE NEXUS] Project: {} | Block: {} | Tags: {:?}", p_id, ptr.block_id, ptr.topic_tags);
                    println!("{}", serde_json::to_string_pretty(&val)?);
                }
                return Ok(());
            }

            if !file_path.exists() {
                eprintln!("[-] Error: Target file '{}' does not exist.", file_path.display());
                std::process::exit(1);
            }

            let key = load_or_create_key(&proj, &mdl)?;
            let keys = derive_keys(&key);

            if header {
                let mut f = std::fs::File::open(&file_path)?;
                let mut magic = [0u8; 4];
                f.read_exact(&mut magic)?;
                let mut len_b = [0u8; 4];
                f.read_exact(&mut len_b)?;
                let len = u32::from_be_bytes(len_b) as usize;
                let mut mac = [0u8; 32];
                f.read_exact(&mut mac)?;
                let mut json_b = vec![0u8; len];
                f.read_exact(&mut json_b)?;
                let computed = compute_hmac(&keys.mac_key, &json_b);
                if !constant_time_eq(&computed, &mac) {
                    eprintln!("[-] Integrity check failure: Header HMAC mismatch!");
                    std::process::exit(1);
                }
                let hdr: AifHeader = serde_json::from_slice(&json_b)?;
                println!("{}", serde_json::to_string_pretty(&hdr)?);
                return Ok(());
            }

            if let Some(target_block) = block {
                let (val, entry) = read_block(&file_path, &target_block, &keys)?;
                println!("[+] Block '{}' [{}] (Score: {:.2}):", target_block, entry.ring.as_str(), entry.importance);
                println!("{}", serde_json::to_string_pretty(&val)?);
                return Ok(());
            }

            let (_hdr, blocks) = read_all_blocks(&file_path, &keys)?;
            for (b_id, (val, entry)) in blocks {
                if vars && b_id != "vars" {
                    continue;
                }
                if let Some(ref q) = query {
                    let q_lower = q.to_lowercase();
                    let matches_tag = entry.topic_tags.iter().any(|t| t.to_lowercase().contains(&q_lower));
                    let matches_text = val.to_string().to_lowercase().contains(&q_lower);
                    if !matches_tag && !matches_text {
                        continue;
                    }
                }
                println!("[{}] Block '{}' (Score: {:.2}):", entry.ring.as_str(), b_id, entry.importance);
                println!("{}", serde_json::to_string_pretty(&val)?);
                println!("{}", "-".repeat(60));
            }
        }
        Commands::Bridge { query, project, reindex } => {
            let bridge_path = get_bridge_path();
            if reindex {
                let proj = project.unwrap_or(config.default_project);
                let mdl = config.default_model;
                let file_path = resolve_project_file(&proj);
                let key = load_or_create_key(&proj, &mdl)?;
                let keys = derive_keys(&key);
                register_project_in_bridge(&bridge_path, &proj, &mdl, &file_path, &keys)?;
                println!("[+] Reindexed project '{}' into bridge nexus.", proj);
                return Ok(());
            }

            let results = query_bridge_unpack(&bridge_path, query.as_deref(), project.as_deref())?;
            println!("[*] Bridge Nexus matched {} core blocks:", results.len());
            for (p_id, ptr, val) in results {
                println!("\nProject: {} | Block: {} (Offset: {}, Size: {})", p_id, ptr.block_id, ptr.offset, ptr.size);
                println!("Tags: {:?}", ptr.topic_tags);
                println!("Data: {}", serde_json::to_string_pretty(&val)?);
            }
        }
        Commands::Scratch { text } => {
            let p = write_scratch(&text)?;
            println!("[+] Scratch buffer written to '{}': \"{}\"", p.display(), text);
        }
        Commands::Reweight { project, model, block, importance } => {
            let proj = project.unwrap_or(config.default_project);
            let mdl = model.unwrap_or(config.default_model);
            let file_path = resolve_project_file(&proj);
            let key = load_or_create_key(&proj, &mdl)?;
            let keys = derive_keys(&key);
            reweight_block(&file_path, &block, importance, &keys)?;
            println!("[+] Reweighted block '{}' to importance {:.2} in '{}'", block, importance, file_path.display());
        }
        Commands::Optimize { project, model, path, delta, keywords } => {
            let proj = project.unwrap_or(config.default_project);
            let mdl = model.unwrap_or(config.default_model);
            let file_path = path.map(PathBuf::from).unwrap_or_else(|| resolve_project_file(&proj));
            if !file_path.exists() {
                eprintln!("[-] Error: Target file '{}' does not exist.", file_path.display());
                std::process::exit(1);
            }

            let key = load_or_create_key(&proj, &mdl)?;
            let keys = derive_keys(&key);
            let kw_vec: Vec<String> = keywords
                .map(|k| k.split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect())
                .unwrap_or_default();

            let changed = optimize_file(&file_path, &keys, delta, &kw_vec)?;
            println!("[+] Optimization finished for '{}'. State modified: {}", file_path.display(), changed);
        }
        Commands::Watch { project, model } => {
            let proj = project.unwrap_or(config.default_project);
            let mdl = model.unwrap_or(config.default_model);
            let file_path = resolve_project_file(&proj);
            println!("[*] Arming signal trap daemon for project '{}' ({})", proj, file_path.display());
            install_signal_handler(proj, mdl, file_path);
            println!("[*] Waiting for interrupt signals (Ctrl+C to trigger pause flush)...");
            loop {
                std::thread::sleep(std::time::Duration::from_secs(1));
            }
        }
    }

    Ok(())
}
