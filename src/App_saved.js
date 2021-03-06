import React, { useState } from 'react';
import './App.css';
import { cedict } from "./medium.js"; // do one for medium w ... 50k
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'; // This was necessary; ugh
import { Container, Row, Col, Navbar, Button, Nav, Modal, InputGroup, FormControl } from 'react-bootstrap';


class Translation extends React.Component {
  constructor(props) {
    super(props);
    const translation = [{"token":"在", "pinyin":"[zai4]", "definition": "/(located) at/(to be) in/to exist/in the middle of doing sth/(indicating an action in progress)/"},
    {"token":"此", "pinyin":"[ci3]", "definition": "/this/these/"},
    {"token":"粘贴", "pinyin":"[zhan1 tie1]", "definition":"/to stick/to affix/to adhere/to paste (as in 'copy and paste')/Taiwan pr. [nian2 tie1]/also written 黏貼|黏贴[nian2 tie1]/"},
    {"token":"你", "pinyin":"[ni3]", "definition": "/you (informal, as opposed to courteous 您[nin2])/"},
    {"token":"自己", "pinyin":"[zi4 ji3]", "definition": "/oneself/one's own/"},
    {"token":"的", "pinyin":"[de5]", "definition": "/of/~'s (possessive particle)/(used after an attribute)/(used to form a nominal expression)/(used at the end of a declarative sentence for emphasis)/"},
    {"token":"内容", "pinyin":"[nei4 rong2]", "definition": "/content/substance/details/CL:個|个[ge4],項|项[xiang4]/"},
    {"token":"!", "pinyin":"", "definition": ""}
  ]
    this.state = {
      translation: translation,
      text: "在此粘贴你自己的内容!",
      known: 0,
      unknown: translation.length
    };
    // Would prefer the less insane syntax for this
    this.handleInputChange = this.handleInputChange.bind(this)
  }

  handleInputChange(event) {
    // axios.get("http://127.0.0.1:5000/{user_id}/{language}).then(
    //  result => {
    //    const vocabulary = result.data // what?  
    // }
    // )
    // const translation = this.translate(event.target.value)
    // translation = translation.map((word, j) => {
    //   if (word.word in vocabulary) {
    //     return {...word, show: "hidden"}
    //   } else {
    //     return {...word, show: ""}
    //   }
    // })

    this.setState({
      text: event.target.value,
      translation: this.translate(event.target.value), // translation
    })
  }


  // import axios from 'axios';

  // export default class MyComponent extends Component {
  //   state = {
  //     error: null,
  //     isLoaded: false,
  //     items: []
  //   };

  //   componentDidMount() {
  //     axios.get("https://jsonplaceholder.typicode.com/users").then(
  //       result => {
  //         this.setState({
  //           isLoaded: true,
  //           items: result.data // this will be ... 
  //         });
  //       },
  //       // Note: it's important to handle errors here
  //       // instead of a catch() block so that we don't swallow
  //       // exceptions from actual bugs in components.
  //       error => {
  //         this.setState({
  //           isLoaded: true,
  //           error
  //         });
  //       }
  //       );
  //   }

  //   render() {
  //     const { error, isLoaded, items } = this.state;
  //     if (error) {
  //       return <div>Error: {error.message}</div>;
  //     } else if (!isLoaded) {
  //       return <div>Loading...</div>;
  //     } else {
  //       return (
  //         <ul>
  //           {items.map(item => (
  //             <li key={item.username}>
  //               {item.username}: {item.name}
  //             </li>
  //           ))}
  //         </ul>
  //       );
  //     }
  //   }
  // }

  toggle(ix) {
    const updated = this.state.translation.map((word, j) => {
      if (ix===j) {
        return {...word, show: word.show === "hidden" ? "" : "hidden"}
      } else {
        return word
      }
    })
    
    // and also post to the api to toggle in the database
    // Fuck though -- how does it KNOW the user_id and language? Fuck.
    // THAT MAY BE THE ONLY REMAINING PROBLEM THOUGH. 
    // axios.post("http://127.0.0.1:5000/{user_id}/{language}/{word}); // ANYTHING ELSE?

    const known = updated.map(word => word["show"]==="hidden").reduce((a, b) => a + b)

    this.setState({
      translation: updated,
      known: known,
      unknown: updated.length - known
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
          
        <Row>
          <Col md={{span:3, offset:9}} className="fixed-top">
            <Button variant="dark">Click to hide familiar words</Button>
            <br></br>
            <h5 style={{paddingTop:10+"px"}}>You knew {this.state.known} words,</h5>
            <h5>and saw {this.state.unknown} new ones!</h5>
          </Col>
        </Row>

        <Row>
          <Col md={10} className="textinput">
            <InputGroup>
              <InputGroup.Prepend>
                <InputGroup.Text>
                  Paste Chinese Here            
                </InputGroup.Text>
              </InputGroup.Prepend>
              <FormControl onChange={ this.handleInputChange } value={ this.state.text }/>
            </InputGroup>
            &nbsp;&nbsp;
          </Col>
        </Row>

        {this.state.translation.map((word, ix) =>
          <Row key={ix} style={{textAlign: "left"}} onClick={() => this.toggle(ix)}>
            <Col md={1}>{word["token"]}</Col>
            <Col md={2} className={word["show"]}>{word["pinyin"]}</Col>
            <Col md={8} className={word["show"]}>{word["definition"]}</Col>
          </Row>
        )}
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
          basic problem with most current tools.<p></p>
          Tools such as the Google Translate browser plugin, or the similar Mate Translate, are great for translating a single word at a time. They are 
           an enormous improvement over having to search through a paper dictionary. However, they are still designed for people who only need to look up
          words one by one, whereas
          most Chinese language learners both need to translate <b>most</b> of the words - and, likely don't even know which combinations of characters 
           <b> form</b> a single word.<p></p>
           Ladder of Babel solves both of these problems by pre-identifying which characters go together, and giving definitions for everything, at once -- 
           further allowing each user to customize and focus their learning, by hiding any information they don't need. 
           This makes the reading experience as seamless and fluent as possible even for early stage students, and opens up the entire world of online Chinese
           text for easy access, and productive study.
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
      <Navbar bg="dark" className="" expand="lg">
      <Nav.Link href="http://dovecoteinstitute.org" style={{color:'white', fontsize:24+'pt'}}>Dovecote Institute</Nav.Link>      
        <Nav className="mr-auto"></Nav> {/* Using this to push the rest to the right */}
        <About />        
        <Navbar.Brand href="#home" style={{color:'white', paddingLeft:20+'px'}}>The Design Philosophy of Ladder of Babel</Navbar.Brand>        
      </Navbar>

      <p></p>
      <Translation />
      <hr></hr>
      <footer style={{textAlign: "left"}} className="container">
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