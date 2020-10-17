// import React, { useState, useEffect } from 'react';
import React from 'react';
import './App.css';
import { cedict } from "./small.js";
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'; // This was necessary; ugh
import { Container, Row, Col } from 'react-bootstrap';


class Translation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      translation: []
    };
    // Would prefer the less insane syntax for this
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(event) {
    this.setState({
        translation: this.translate(event.target.value)
    })
  }

  translate(text) { 
    // This is super sloppy for all sorts of reasons; do need the chinese punctuation though
    const punctuation = ["，", "。", "「", "」", "、", "‧", ".", ";", " ", "\t"]

    const translation = []
    let remaining_characters = text
    while (remaining_characters.length > 0) {
        let word_boundary = 1
        let best_candidate = null
        while (remaining_characters.length > 0) {
            const candidate = remaining_characters.slice(0, word_boundary)
            if ((candidate in cedict) && (word_boundary <= remaining_characters.length)) {
                best_candidate = candidate
                word_boundary += 1
            } else {  // candidate is NOT in the dictionary
                if (best_candidate != null) {  // at least the first character was recognized
                  const line = String(cedict[best_candidate])
                  const pinyin = (line.split(/](.+)/)[0]) + "]"
                  const definition = (line.split(/](.+)/)[1]).slice(1) // I only want to split on the FIRST; 
                  translation.push({"token": best_candidate, "pinyin": pinyin, "definition": definition})
                } else {
                    const token = remaining_characters[0]
                    // const definition = token in punctuation ? "" : "??"
                    translation.push({"token": token, "pinyin": "", "definition": ""})
                }
                if (word_boundary > 1) {
                    remaining_characters = remaining_characters.slice(word_boundary-1)
                } else {
                    remaining_characters = remaining_characters.slice(word_boundary)
                }
                break
            }
        }
    }
    return(translation)
  }

  render() {
    return(
      <Container>
        <input
            type="text"
            onChange={ this.handleInputChange }
        />
        <br></br>
        {this.state.translation.map((word, ix) =>
          <Row key={ix} style={{textAlign: "left"}}>
            <Col md={2}>{word["token"]}</Col> 
            <Col md={2}>{word["pinyin"]}</Col>
            <Col md={8}>{word["definition"]}</Col>
          </Row>
        )}
      </Container>
    ) 
  }
}

function App() {
  return (
    <div className="App">
      <h2>Ladder of Babel</h2>
      Paste simplified Chinese here for a full word-by-word translation
      <p></p>
      <Translation />
      <hr></hr>
      <footer class="container">
        <p>&copy; Dovecote Institute 2020</p>
      </footer>
    </div>

  );
}

export default App;

//         text="“我有两张自拍，一张很丑，另一张还是很丑”（“在我的后园，可以看见墙外有两株树，一株是枣树，还有一株也是枣树。”——迅哥原文）
// 100年前的鲁迅万万没有预料到，自己在当下的符号是“中文互联网梗王”、“金句界顶流”。
// 在各种社会热点的留言评论区，在各大平台的鸡汤文学里，鲁迅语录随处可见；无论搭不搭边，“鲁迅曾经说过”就在那里，从不缺席。
// 北京鲁迅博物馆为此专门建了一个检索系统，在这里，所有“鲁迅说过的话”都可以被验证或者打脸，该系统还不止一次因为查询人数过多而崩溃。
// 在互联网的迷幻国度里，人人以为自己熟读鲁迅。
// 人人不知道的是，这个活在100年前的老男孩，早早已将我们读懂、看透。"