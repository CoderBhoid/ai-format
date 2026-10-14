use aif::bridge::*;
use aif::crypto::*;
use aif::interrupt::*;
use aif::orbital::*;
use std::collections::BTreeMap;
use std::path::PathBuf;
use std::time::Instant;

fn temp_test_dir(name: &str) -> PathBuf {
    let dir = std::env::temp_dir().join(format!("aif_test_{}_{}", name, chrono::Utc::now().timestamp_nanos_opt().unwrap_or(0)));
    let _ = std::fs::create_dir_all(&dir);
    dir
}

#[test]
fn test_single_key_and_crypto_isolation() {
    let proj = "test_crypto_proj";
    let model = "test_model_v4";
    let key = load_or_create_key(proj, model).expect("Failed to create key");
    assert_eq!(key.len(), 32);

    let key_path = get_key_path(proj, model);
    assert!(key_path.exists());

    #[cfg(unix)]
    {
        use std::os::unix::fs::PermissionsExt;
        let perms = std::fs::metadata(&key_path).unwrap().permissions();
        assert_eq!(perms.mode() & 0o777, 0o600, "Key file permissions must be 0600 on Unix");
    }

    let keys = derive_keys(&key);
    let sample_data = b"{\"message\": \"secret cognitive memory\"}";
    let (ciphertext, salt) = encrypt_block_v4(&keys.enc_key, sample_data).expect("Encryption failed");

    // Decrypt normally
    let decrypted = decrypt_block_v4(&keys.enc_key, &salt, &ciphertext).expect("Decryption failed");
    assert_eq!(decrypted, sample_data);

    // Tamper detection with HMAC
    let mut mac_input = Vec::new();
    mac_input.extend_from_slice(&salt);
    mac_input.extend_from_slice(&ciphertext);
    let expected_mac = compute_hmac(&keys.mac_key, &mac_input);

    let mut tampered_input = mac_input.clone();
    tampered_input[20] ^= 0xFF; // Flip bit in ciphertext
    let tampered_mac = compute_hmac(&keys.mac_key, &tampered_input);
    assert!(!constant_time_eq(&expected_mac, &tampered_mac), "Tampered MAC must not match");

    // Clean up
    let _ = std::fs::remove_file(key_path);
}

#[test]
fn test_orbital_rings_and_reweight() {
    let dir = temp_test_dir("orbital");
    let file_path = dir.join("test_orbital.ai");
    let master_key = [77u8; 32];
    let keys = derive_keys(&master_key);

    let header = AifHeader {
        format_version: "AIF_V4".to_string(),
        project_id: "orbital_proj".to_string(),
        model_id: "gemini-3.5-flash".to_string(),
        global_metadata: serde_json::json!({ "env": "test" }),
        block_index_map: BTreeMap::new(),
        graph_links: Vec::new(),
    };

    let mut blocks = BTreeMap::new();

    // 1. Core block (>= 0.7)
    let core_entry = BlockEntry {
        ring: OrbitalRing::Int16Core,
        offset: 0,
        size: 0,
        salt: String::new(),
        mac_tag: String::new(),
        importance: 0.92,
        timestamp: chrono::Utc::now().timestamp(),
        topic_tags: vec!["architecture".to_string()],
        metadata: serde_json::json!({ "summary": "Core architectural decision" }),
    };
    let core_val = serde_json::json!({ "text": "Crucial architecture decision that cannot be decayed." });
    blocks.insert("block_core".to_string(), (core_val, core_entry));

    // 2. Middle ring (0.3 - 0.69)
    let ring_entry = BlockEntry {
        ring: OrbitalRing::Int8Ring,
        offset: 0,
        size: 0,
        salt: String::new(),
        mac_tag: String::new(),
        importance: 0.55,
        timestamp: chrono::Utc::now().timestamp(),
        topic_tags: vec!["working".to_string()],
        metadata: serde_json::json!({ "summary": "Routine implementation note" }),
    };
    let ring_val = serde_json::json!({ "text": prune_helper_words("We are implementing the feature for database query caching.") });
    blocks.insert("block_ring".to_string(), (ring_val, ring_entry));

    // 3. Crust (< 0.3)
    let crust_entry = BlockEntry {
        ring: OrbitalRing::Int2Crust,
        offset: 0,
        size: 0,
        salt: String::new(),
        mac_tag: String::new(),
        importance: 0.15,
        timestamp: chrono::Utc::now().timestamp(),
        topic_tags: vec!["fleeting".to_string()],
        metadata: serde_json::json!({ "summary": "Fleeting debug note" }),
    };
    let crust_val = serde_json::json!({ "text": deep_summary("Temporary warning about missing optional configuration key.") });
    blocks.insert("block_crust".to_string(), (crust_val, crust_entry));

    let bytes_written = write_file_v4(&file_path, header.clone(), &blocks, &keys).expect("Write failed");
    assert!(bytes_written > 0);

    // Partial Envelope Unpacking: read core block directly
    let (read_core_val, read_core_entry) = read_block(&file_path, "block_core", &keys).expect("Read core block failed");
    assert_eq!(read_core_entry.ring, OrbitalRing::Int16Core);
    assert_eq!(read_core_val["text"].as_str().unwrap(), "Crucial architecture decision that cannot be decayed.");

    // Partial Envelope Unpacking: read crust block
    let (read_crust_val, read_crust_entry) = read_block(&file_path, "block_crust", &keys).expect("Read crust failed");
    assert_eq!(read_crust_entry.ring, OrbitalRing::Int2Crust);
    assert!(read_crust_val["text"].as_str().unwrap().starts_with("[INT2 Deep Summary]"));

    // Reweight: promote block_ring from 0.55 to 0.88 -> moves to INT16_CORE
    reweight_block(&file_path, "block_ring", 0.88, &keys).expect("Reweight failed");

    let (_, updated_entry) = read_block(&file_path, "block_ring", &keys).expect("Read reweighted failed");
    assert_eq!(updated_entry.ring, OrbitalRing::Int16Core, "Block should be promoted to INT16_CORE");
    assert_eq!(updated_entry.importance, 0.88);

    let _ = std::fs::remove_dir_all(dir);
}

#[test]
fn test_cross_project_bridge_sub_millisecond() {
    let dir = temp_test_dir("bridge");
    let nexus_path = dir.join("bridge_nexus.ai");

    // Project 1: Auth
    let proj1_id = "test_bridge_p1_auth";
    let proj1_file = dir.join(format!("{}.ai", proj1_id));
    let key1 = [101u8; 32];
    let keys1 = derive_keys(&key1);
    let mut blocks1 = BTreeMap::new();
    let entry1 = BlockEntry {
        ring: OrbitalRing::Int16Core,
        offset: 0,
        size: 0,
        salt: String::new(),
        mac_tag: String::new(),
        importance: 0.95,
        timestamp: chrono::Utc::now().timestamp(),
        topic_tags: vec!["auth".to_string(), "oauth".to_string(), "jwt".to_string()],
        metadata: serde_json::json!({ "summary": "OAuth2 and JWT token authentication" }),
    };
    blocks1.insert("auth_core".to_string(), (serde_json::json!({ "secret": "jwt_signing_key_42" }), entry1));
    let hdr1 = AifHeader {
        format_version: "AIF_V4".to_string(),
        project_id: proj1_id.to_string(),
        model_id: "test_model".to_string(),
        global_metadata: serde_json::json!({}),
        block_index_map: BTreeMap::new(),
        graph_links: Vec::new(),
    };
    write_file_v4(&proj1_file, hdr1, &blocks1, &keys1).unwrap();

    // Save key to keychain dir so bridge can resolve it
    let kpath1 = get_key_path(proj1_id, "test_model");
    let _ = std::fs::create_dir_all(kpath1.parent().unwrap());
    let _ = std::fs::write(&kpath1, &key1);

    // Project 2: Database
    let proj2_id = "test_bridge_p2_db";
    let proj2_file = dir.join(format!("{}.ai", proj2_id));
    let key2 = [102u8; 32];
    let keys2 = derive_keys(&key2);
    let mut blocks2 = BTreeMap::new();
    let entry2 = BlockEntry {
        ring: OrbitalRing::Int16Core,
        offset: 0,
        size: 0,
        salt: String::new(),
        mac_tag: String::new(),
        importance: 0.92,
        timestamp: chrono::Utc::now().timestamp(),
        topic_tags: vec!["database".to_string(), "postgresql".to_string(), "schema".to_string()],
        metadata: serde_json::json!({ "summary": "PostgreSQL relational schemas" }),
    };
    blocks2.insert("db_core".to_string(), (serde_json::json!({ "schema": "users(id, email, password_hash)" }), entry2));
    let hdr2 = AifHeader {
        format_version: "AIF_V4".to_string(),
        project_id: proj2_id.to_string(),
        model_id: "test_model".to_string(),
        global_metadata: serde_json::json!({}),
        block_index_map: BTreeMap::new(),
        graph_links: Vec::new(),
    };
    write_file_v4(&proj2_file, hdr2, &blocks2, &keys2).unwrap();

    let kpath2 = get_key_path(proj2_id, "test_model");
    let _ = std::fs::create_dir_all(kpath2.parent().unwrap());
    let _ = std::fs::write(&kpath2, &key2);

    // Register both projects in bridge nexus
    register_project_in_bridge(&nexus_path, proj1_id, "test_model", &proj1_file, &keys1).unwrap();
    register_project_in_bridge(&nexus_path, proj2_id, "test_model", &proj2_file, &keys2).unwrap();

    // Query bridge for "postgresql" with time measurement
    let start = Instant::now();
    let results = query_bridge_unpack(&nexus_path, Some("postgresql"), None).expect("Bridge query failed");
    let elapsed = start.elapsed();

    println!("[*] Bridge query elapsed time: {:?}", elapsed);
    assert!(!results.is_empty(), "Bridge query should match database project");
    let (matched_proj, ptr, val) = &results[0];
    assert_eq!(matched_proj, proj2_id);
    assert_eq!(ptr.block_id, "db_core");
    assert_eq!(val["schema"].as_str().unwrap(), "users(id, email, password_hash)");

    // Verify sub-millisecond execution (elapsed < 50ms in debug test, usually <1ms)
    assert!(elapsed.as_millis() < 50, "Bridge seek and partial unpack should be sub-millisecond in production");

    // Clean up
    let _ = std::fs::remove_file(kpath1);
    let _ = std::fs::remove_file(kpath2);
    let _ = std::fs::remove_dir_all(dir);
}

#[test]
fn test_interrupt_scratch_flush() {
    let dir = temp_test_dir("interrupt");
    let proj_id = "test_interrupt_proj";
    let model_id = "test_model";
    let file_path = dir.join(format!("{}.ai", proj_id));

    let scratch_msg = "Critical database migration in progress: added table accounts";
    write_scratch(scratch_msg).expect("Failed to write scratch");

    // Flush scratch state to project core
    let flushed_block = flush_scratch_to_core(proj_id, model_id, &file_path).expect("Flush failed");
    assert!(flushed_block.is_some(), "Flushed block ID must be returned");

    // Verify scratch file was removed
    let scratch_read = read_scratch().expect("Read scratch error");
    assert!(scratch_read.is_none(), "Scratch file must be deleted after flush");

    // Verify block in INT16_CORE with [PAUSED_MID_TASK]
    let key = load_or_create_key(proj_id, model_id).unwrap();
    let keys = derive_keys(&key);
    let (val, entry) = read_block(&file_path, &flushed_block.unwrap(), &keys).expect("Read flushed block failed");

    assert_eq!(entry.ring, OrbitalRing::Int16Core);
    assert_eq!(entry.importance, 0.95);
    assert!(entry.topic_tags.contains(&"[PAUSED_MID_TASK]".to_string()));
    assert!(val["text"].as_str().unwrap().contains(scratch_msg));

    let kpath = get_key_path(proj_id, model_id);
    let _ = std::fs::remove_file(kpath);
    let _ = std::fs::remove_dir_all(dir);
}

#[test]
fn test_legacy_v3_upgrade_to_v4() {
    let dir = temp_test_dir("v3_upgrade");
    let file_path = dir.join("legacy_v3_file.ai");
    let master_key = [88u8; 32];
    let keys = derive_keys(&master_key);

    // Create a mock V3 file using V3StreamCipher and MAGIC_V3
    let mut header = AifHeader {
        format_version: "AIF_V3".to_string(),
        project_id: "legacy_proj".to_string(),
        model_id: "legacy_model".to_string(),
        global_metadata: serde_json::json!({}),
        block_index_map: BTreeMap::new(),
        graph_links: Vec::new(),
    };

    let sample_val = serde_json::json!({ "text": "Legacy V3 memory block that needs upgrade." });
    let val_bytes = serde_json::to_vec(&sample_val).unwrap();
    let (ciphertext, salt) = encrypt_block_v3(&keys.enc_key, &val_bytes).unwrap();

    let mut mac_input = Vec::new();
    mac_input.extend_from_slice(&salt);
    mac_input.extend_from_slice(&ciphertext);
    let block_mac = compute_hmac(&keys.mac_key, &mac_input);

    let entry = BlockEntry {
        ring: OrbitalRing::Int16Core,
        offset: 0,
        size: ciphertext.len() as u64,
        salt: hex::encode(salt),
        mac_tag: hex::encode(block_mac),
        importance: 0.8,
        timestamp: chrono::Utc::now().timestamp(),
        topic_tags: vec!["legacy".to_string()],
        metadata: serde_json::json!({}),
    };
    header.block_index_map.insert("v3_block_0".to_string(), entry);

    let header_json = serde_json::to_vec(&header).unwrap();
    let header_len = header_json.len() as u32;
    let header_mac = compute_hmac(&keys.mac_key, &header_json);

    let mut v3_file_bytes = Vec::new();
    v3_file_bytes.extend_from_slice(MAGIC_V3);
    v3_file_bytes.extend_from_slice(&header_len.to_be_bytes());
    v3_file_bytes.extend_from_slice(&header_mac);
    v3_file_bytes.extend_from_slice(&header_json);
    v3_file_bytes.extend_from_slice(&ciphertext);

    std::fs::write(&file_path, &v3_file_bytes).unwrap();

    // Verify read_block reads V3 format cleanly
    let (read_val, read_entry) = read_block(&file_path, "v3_block_0", &keys).expect("Failed to read V3 block");
    assert_eq!(read_val["text"].as_str().unwrap(), "Legacy V3 memory block that needs upgrade.");
    assert_eq!(read_entry.ring, OrbitalRing::Int16Core);

    // Optimize file to upgrade it to V4
    optimize_file(&file_path, &keys, 0.05, &[]).expect("Optimization / upgrade failed");

    // Verify upgraded file has MAGIC_V4
    let mut check_file = std::fs::File::open(&file_path).unwrap();
    use std::io::Read;
    let mut magic_buf = [0u8; 4];
    check_file.read_exact(&mut magic_buf).unwrap();
    assert_eq!(&magic_buf, MAGIC_V4, "File magic must be upgraded to AIF\\x04");

    let _ = std::fs::remove_dir_all(dir);
}
