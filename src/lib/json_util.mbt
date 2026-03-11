/// 从 JSON 字符串解析配置
pub fn parse_config(json_str : String) -> SentimentConfig? {
  try {
    let json = @json.parse!(json_str)
    match json {
      Object(obj) => {
        let version = match obj.get("version") {
          Some(String(v)) => v
          _ => "unknown"
        }
        let author = match obj.get("author") {
          Some(String(a)) => a
          _ => "unknown"
        }
        Some({ version, author })
      }
      _ => None
    }
  } catch {
    _ => None
  }
}
