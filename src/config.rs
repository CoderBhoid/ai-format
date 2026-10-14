use serde::{Deserialize, Serialize};
use std::path::{Path, PathBuf};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AifConfig {
    pub default_project: String,
    pub default_model: String,
    pub storage_dir: Option<String>,
}

impl Default for AifConfig {
    fn default() -> Self {
        Self {
            default_project: "default_project".to_string(),
            default_model: "gemini-3.5-flash".to_string(),
            storage_dir: None,
        }
    }
}

pub fn get_config_path() -> PathBuf {
    if Path::new(".aif_config.json").exists() {
        return PathBuf::from(".aif_config.json");
    }
    if let Some(home) = dirs::home_dir() {
        let p = home.join(".gemini").join("ai-format").join("config.json");
        if p.exists() {
            return p;
        }
    }
    PathBuf::from(".aif_config.json")
}

pub fn load_config() -> AifConfig {
    let path = get_config_path();
    if path.exists() {
        if let Ok(bytes) = std::fs::read(&path) {
            if let Ok(cfg) = serde_json::from_slice::<AifConfig>(&bytes) {
                return cfg;
            }
        }
    }
    AifConfig::default()
}

pub fn save_config(cfg: &AifConfig) -> std::io::Result<()> {
    let path = get_config_path();
    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    let data = serde_json::to_vec_pretty(cfg)?;
    std::fs::write(path, data)
}

const LIFECYCLE_BLOCK: &str = r#"
<!-- AIF_MEMORY_LIFECYCLE_START -->
## Mandatory Cognitive Memory Loop (AIF V4)
- Boot Recall: Run `aif recall --core-and-bridge` at session start to load core architecture and cross-project links.
- In-Flight Safety: Run `aif scratch "<current step>"` before long tasks so abrupt user interrupts (Ctrl+C) never drop state.
- End-of-Turn Commit: Evaluate turn importance (0.0 to 1.0) and run `aif note --importance <score> --summary "<action>"`.
  - >= 0.70: Architectural decisions, critical schemas (Red Core, linked to Bridge Nexus).
  - 0.30 - 0.69: Working turn notes (Middle Ring, stop words pruned).
  - < 0.30: Fleeting observations (Outer Crust, gist summaries).
- Cross-Project Context: Query other repositories with `aif bridge --query "<topic>"`.
<!-- AIF_MEMORY_LIFECYCLE_END -->
"#;

/// Inspects workspace and home directory for AI harness configuration files and injects AIF memory loop rules
pub fn auto_detect_and_inject_ide_rules() -> Vec<String> {
    let mut modified = Vec::new();

    let mut candidate_paths = Vec::new();

    // 1. Workspace-level candidate paths
    candidate_paths.push(("Antigravity/Agent Workspace", PathBuf::from(".agents").join("AGENTS.md")));
    candidate_paths.push(("Cursor Workspace", PathBuf::from(".cursorrules")));
    candidate_paths.push(("Claude Code Workspace", PathBuf::from("CLAUDE.md")));

    // 2. Global / Home-level candidate paths
    if let Some(home) = dirs::home_dir() {
        candidate_paths.push(("Antigravity Global", home.join(".gemini").join("config").join("AGENTS.md")));
        candidate_paths.push(("Antigravity App Global", home.join(".gemini").join("antigravity").join("GEMINI.md")));
        candidate_paths.push(("Cursor Global", home.join(".cursorrules")));
        candidate_paths.push(("Claude Code Global", home.join(".claude").join("CLAUDE.md")));
        candidate_paths.push(("Windsurf Global", home.join(".codeium").join("windsurf").join("memories").join("global_rules.md")));
    }

    for (name, path) in candidate_paths {
        if path.exists() {
            if let Ok(content) = std::fs::read_to_string(&path) {
                if !content.contains("AIF_MEMORY_LIFECYCLE_START") && !content.contains("aif recall --core-and-bridge") {
                    let mut updated = content;
                    if !updated.ends_with('\n') {
                        updated.push('\n');
                    }
                    updated.push_str(LIFECYCLE_BLOCK);
                    if std::fs::write(&path, updated).is_ok() {
                        modified.push(format!("{} ({})", name, path.display()));
                    }
                }
            }
        }
    }

    modified
}
