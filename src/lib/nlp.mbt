// 定义情感词典映射
type IntMap Map[String, Int]

/// 简单的文本分词：将字符串按空格拆分
fn tokenize(text : String) -> Array[String] {
  // 生产环境下通常使用更复杂的正则或分词器
  // 这里展示基础的字符串切割逻辑
  text.split(" ").to_array()
}

/// 情感分析核心逻辑
pub fn analyze_sentiment(text : String, lexicon : Map[String, Int]) -> Int {
  let tokens = tokenize(text)
  var score = 0
  for i = 0; i < tokens.length(); i = i + 1 {
    let word = tokens[i].to_lower()
    match lexicon.get(word) {
      Some(val) => score = score + val
      None => ()
    }
  }
  score
}

/// JSON 数据模型：展示如何从 JSON 映射到结构体
pub struct SentimentConfig {
  version : String
  author : String
}

pub fn (self : SentimentConfig) to_string() -> String {
  "NLP Model v\{self.version} by \{self.author}"
}
