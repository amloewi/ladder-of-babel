import React, { useState } from 'react';
import './App.css';
import { cedict } from "./medium.js"; // do one for medium w ... 50k
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'; // This was necessary; ugh
import { Container, Row, Col, Navbar, Button, Nav, Modal } from 'react-bootstrap';


class Translation extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      translation: [{"token":"在", "pinyin":"[zai4]", "definition": "/(located) at/(to be) in/to exist/in the middle of doing sth/(indicating an action in progress)/"},
      {"token":"此", "pinyin":"[ci3]", "definition": "/this/these/"},
      {"token":"粘贴", "pinyin":"[zhan1 tie1]", "definition":"/to stick/to affix/to adhere/to paste (as in 'copy and paste')/Taiwan pr. [nian2 tie1]/also written 黏貼|黏贴[nian2 tie1]/"},
      {"token":"你", "pinyin":"[ni3]", "definition": "/you (informal, as opposed to courteous 您[nin2])/"},
      {"token":"自己", "pinyin":"[zi4 ji3]", "definition": "/oneself/one's own/"},
      {"token":"的", "pinyin":"[de5]", "definition": "/of/~'s (possessive particle)/(used after an attribute)/(used to form a nominal expression)/(used at the end of a declarative sentence for emphasis)/"},
      {"token":"内容", "pinyin":"[nei4 rong2]", "definition": "/content/substance/details/CL:個|个[ge4],項|项[xiang4]/"},
      {"token":"!", "pinyin":"", "definition": ""}
    ],
      text: "在此粘贴你自己的内容!",
      total: 0
    };
    // Would prefer the less insane syntax for this
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(event) {
    this.setState({
      text: event.target.value,
      translation: this.translate(event.target.value),
    })
  }

  toggle(ix) {
    const updated = this.state.translation.map((word, j) => {
      if (ix==j) {
        return {...word, show: word.show == "hidden" ? "" : "hidden"}
      } else {
        return word
      }
    }) 
    const total = updated.map(word => word["show"]=="hidden").reduce((a, b) => a + b)

    this.setState({
      translation: updated,
      total: total
    })
  }

  translate(text) { 
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
                  const pinyin = (line.split(/](.+)/)[0]) + "]" // I only want to split on the FIRST ']'; 
                  const definition = (line.split(/](.+)/)[1]).slice(1) 
                  translation.push({"token": best_candidate, "pinyin": pinyin, "definition": definition})
                } else {
                    const token = remaining_characters[0]
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
        <b>Paste the text you want to read in here: </b>&nbsp;&nbsp;
        <input
            type="text"
            onChange={ this.handleInputChange }
            value={ this.state.text }
        />
        &nbsp;&nbsp;<b>Click on a word if you already know it, to hide the definition</b>
        <p></p>
        {this.state.translation.map((word, ix) =>
          <Row key={ix} style={{textAlign: "left"}} onClick={() => this.toggle(ix)}>
            <Col md={1}>{word["token"]}</Col>
            <Col md={2} className={word["show"]}>{word["pinyin"]}</Col>
            <Col md={9} className={word["show"]}>{word["definition"]}</Col>
          </Row>
        )}
        <div>          
          <b>You knew {this.state.total} of these words!</b>
          <p></p>
        </div>
      </Container>
    ) 
  }
}

function About() {
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        About
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>About Ladder of Babel</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Ladder of Babel is a tool for beginner and intermediate students of Chinese that makes any (simplified) text accessible by solving a 
          serious problem with most current tools.<p></p>
          Tools such as the Google Translate browser plugin, or the similar Mate Translate, are great for translating a single word at a time. They are 
          clearly an enormous improvement over having to search through a paper dictionary. However, they are still designed for people who only need to pick out
          words one by one, whereas
          most Chinese language learners both need to translate <b>most</b> of the words - and, probably don't even know which combinations of characters 
           <b> form</b> a single word.<p></p>
           Ladder of Babel solves both of these problems by pre-identifying which characters go together, and giving definitions for everything, at once - 
           making the reading experience as seamless and fluent as possible even for early stage students, and opening up the entire world of online Chinese
           text for easy access, and also productive study.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

function App() {
  return (
    <div className="App">
      <Navbar bg="light" expand="lg">
        <Navbar.Brand href="#home">Ladder of Babel</Navbar.Brand>
        <Nav className="mr-auto"></Nav> {/* Using this to push the rest to the right */}
        <About />
        <Nav.Link href="http://dovecoteinstitute.org">Dovecote Institute</Nav.Link>
      </Navbar>

      <p></p>
      <Translation />
      <hr></hr>
      <footer className="container">
        <p>&copy; Dovecote Institute 2020</p>
      </footer>
    </div>

  );
}

export default App;

// “我有两张自拍，一张很丑，另一张还是很丑”（“在我的后园，可以看见墙外有两株树，一株是枣树，还有一株也是枣树。”——迅哥原文）
// 100年前的鲁迅万万没有预料到，自己在当下的符号是“中文互联网梗王”、“金句界顶流”。
// 在各种社会热点的留言评论区，在各大平台的鸡汤文学里，鲁迅语录随处可见；无论搭不搭边，“鲁迅曾经说过”就在那里，从不缺席。
// 北京鲁迅博物馆为此专门建了一个检索系统，在这里，所有“鲁迅说过的话”都可以被验证或者打脸，该系统还不止一次因为查询人数过多而崩溃。
// 在互联网的迷幻国度里，人人以为自己熟读鲁迅。
// 人人不知道的是，这个活在100年前的老男孩，早早已将我们读懂、看透。