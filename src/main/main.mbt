// Write some simple code first

fn main {
  println("--- MoonBit NLP & JSON Showcase ---")

  // 1. 模拟 JSON 配置解析
  let config_json = "{\"version\": \"1.0.0\", \"author\": \"MoonBiter\"}"
  match @lib.parse_config(config_json) {
    Some(cfg) => println("Config Loaded: " + cfg.to_string())
    None => println("Failed to parse config")
  }

  // 2. 初始化情感词典
  let lexicon : Map[String, Int] = Map::new()
  lexicon.set("awesome", 3)
  lexicon.set("great", 2)
  lexicon.set("slow", -1)
  lexicon.set("buggy", -3)

  // 3. 处理自然语言文本
  let sample_text = "This new compiler is awesome but a bit slow"
  let result = @lib.analyze_sentiment(sample_text, lexicon)

  println("Input Text: \"\{sample_text}\"")
  println("Sentiment Score: \{result}")
  
  if result > 0 {
    println("Result: Positive Feedback")
  } else {
    println("Result: Needs Improvement")
  }
}
