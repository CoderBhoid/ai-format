import time
import json
import gzip
import os

class TemporalMemoryOptimizer:
    """
    Simulates a temporal AI context engine that compresses memory blocks
    based on both age (Ebbinghaus forgetting curve) and attention usage score.
    
    Attention weighting overrides temporal decay:
    - High attention/usage keeps the block at maximum resolution (FP16_RAW).
    - Low attention/usage triggers instant deep compression (INT2_DEEP_SUMMARY).
    """
    def __init__(self, fresh_window_sec=60, medium_window_sec=3600, high_usage_threshold=0.7, low_usage_threshold=0.3):
        self.fresh_window = fresh_window_sec
        self.medium_window = medium_window_sec
        self.high_usage_threshold = high_usage_threshold
        self.low_usage_threshold = low_usage_threshold

    def calculate_attention_scores(self, history_turns, active_keywords=None):
        """
        Dynamically calculates/updates attention scores for each turn based on active_keywords.
        
        Args:
            history_turns: list of turns, each containing 'text' and optional 'attention_score'
            active_keywords: list of active variables/modules/files (e.g., ["ProductionAIContextFile", "master_key"])
        """
        if active_keywords is None:
            active_keywords = []
            
        # Convert keywords to lower case for case-insensitive matching
        keywords_lower = [k.lower() for k in active_keywords]
        
        for turn in history_turns:
            text = turn.get("text", "")
            current_score = turn.get("attention_score", 0.5) # Default baseline
            
            # Simple keyword frequency matching
            match_count = 0
            if keywords_lower:
                text_lower = text.lower()
                for kw in keywords_lower:
                    if kw in text_lower:
                        match_count += 1
                        
            # Adjust attention score based on keyword references
            if match_count > 0:
                # Boost attention score if referenced
                new_score = min(1.0, current_score + (0.25 * match_count))
            else:
                # Decay attention score slightly if not referenced
                new_score = max(0.0, current_score - 0.05)
                
            turn["attention_score"] = new_score
            
        return history_turns

    def process_temporal_context(self, history_turns, active_keywords=None):
        """
        Processes conversation history, applying compression/quantization rules
        based on both the turn age and its attention utility score.
        """
        current_time = time.time()
        
        # 1. Update attention scores first
        self.calculate_attention_scores(history_turns, active_keywords)
        
        optimized_turns = []
        
        for turn in history_turns:
            age = current_time - turn["timestamp"]
            text = turn["text"]
            score = turn["attention_score"]
            role = turn["role"]
            
            # Tier Decision Logic:
            # 1. High Usage override -> Keep RAW
            if score >= self.high_usage_threshold:
                fidelity = "FP16_RAW"
                processed_text = text
                
            # 2. Low Usage override -> Instant deep compression (except for brand-new turns < 10s old)
            elif score < self.low_usage_threshold and age > 10:
                fidelity = "INT2_DEEP_SUMMARY"
                processed_text = f"[Compressed Turn Summary]: {text[:45]}..."
                
            # 3. Intermediate Usage -> Fallback to Standard Temporal Decay
            else:
                if age < self.fresh_window:
                    fidelity = "FP16_RAW"
                    processed_text = text
                elif age < self.medium_window:
                    fidelity = "INT8_PRUNED"
                    # Prune common helper words (simulating quantized token loss)
                    stop_words = {"the", "a", "an", "and", "or", "but", "is", "are", "was", "were", "to", "of", "in", "on", "at", "for"}
                    words = text.split()
                    pruned_words = [w for w in words if w.lower() not in stop_words or w.isdigit()]
                    processed_text = " ".join(pruned_words)
                else:
                    fidelity = "INT2_DEEP_SUMMARY"
                    processed_text = f"[Summary of turn]: {text[:45]}..."
            
            optimized_turns.append({
                "timestamp": turn["timestamp"],
                "role": role,
                "attention_score": round(score, 3),
                "fidelity": fidelity,
                "text": processed_text
            })
            
        return optimized_turns

# ==========================================
# DEMONSTRATION RUN
# ==========================================
if __name__ == "__main__":
    current_time = time.time()
    
    # 1. Setup simulated timeline of conversation turns
    conversation_timeline = [
        {
            # Turn 1: 2 hours ago, contains keyword "ProductionAIContextFile" (Ancient but important)
            "timestamp": current_time - 7200, 
            "role": "user",
            "text": "Let us start a research project on the new ProductionAIContextFile which handles AES encryption.",
            "attention_score": 0.5
        },
        {
            # Turn 2: 10 minutes ago, contains no active keywords (Medium-term, low-importance)
            "timestamp": current_time - 600, 
            "role": "assistant",
            "text": "I can write some generic helper scripts to compress text using gzip and save it to disk.",
            "attention_score": 0.2
        },
        {
            # Turn 3: 5 seconds ago (Fresh Memory)
            "timestamp": current_time - 5, 
            "role": "user",
            "text": "Make sure we implement lazy loading index maps.",
            "attention_score": 0.5
        }
    ]
    
    print("--- Original Conversation Timeline ---")
    for idx, t in enumerate(conversation_timeline):
        print(f"Turn #{idx+1} (Age: {int(current_time - t['timestamp'])}s | Score: {t['attention_score']}): {t['text']}")
        
    # Active reference keywords (engine monitors usage of these)
    active_vars = ["ProductionAIContextFile", "lazy"]
    print(f"\n[*] Active Engine Monitor Keywords: {active_vars}")
    
    # Run through the Temporal Memory Optimizer
    optimizer = TemporalMemoryOptimizer()
    optimized = optimizer.process_temporal_context(conversation_timeline, active_keywords=active_vars)
    
    print("\n--- Optimized/Decayed Context (Attention-Weighted) ---")
    for idx, t in enumerate(optimized):
        print(f"Turn #{idx+1} [Fidelity: {t['fidelity']} | Score: {t['attention_score']}]: {t['text']}")
