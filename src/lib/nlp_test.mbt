test "sentiment_analysis" {
  let lex : Map[String, Int] = Map::new()
  lex.set("good", 1)
  lex.set("happy", 2)
  lex.set("bad", -2)
  
  let score = analyze_sentiment("I feel good and happy", lex)
  inspect!(score, content="3")
  
  let sad_score = analyze_sentiment("That was bad", lex)
  inspect!(sad_score, content="-2")
}
