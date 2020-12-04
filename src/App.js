import React, { useState } from 'react';
import './App.css';
import { cedict } from "./medium.js"; // do one for medium w ... 50k
import '../node_modules/bootstrap/dist/css/bootstrap.min.css'; // This was necessary; ugh
import { Container, Row, Col, Navbar, Button, Nav, Modal, InputGroup, FormControl } from 'react-bootstrap';
import axios from 'axios';
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
// import bcrypt from 'bcryptjs';
// import MD5 from 'crypto-js';


import ReactGA from 'react-ga';
// import auth from './auth.ts'; // Sample authentication provider

// // "measurement id": G-D6QWX1DVPK
// // 
// const trackingId = "UA-1234567890-1"; // Replace with your Google Analytics tracking ID
// ReactGA.initialize(trackingId);
// ReactGA.set({
//   userId: auth.currentUserId(),
//   // any data that is relevant to the user session
//   // that you would like to track with google analytics
// })

// dev-lstkwpc9.us.auth0.com # DOMAIN
// AK5e52F3h6Goesct1Q9ADvHuPchBW25U # CLIENT ID

class Translation extends React.Component {
  constructor(props) {
    super(props);
    const translation = [
    {"word":"在", "pinyin":"[zai4]", "definition": "/(located) at/(to be) in/to exist/in the middle of doing sth/(indicating an action in progress)/"},
    {"word":"此", "pinyin":"[ci3]", "definition": "/this/these/"},
    {"word":"粘贴", "pinyin":"[zhan1 tie1]", "definition":"/to stick/to affix/to adhere/to paste (as in 'copy and paste')/Taiwan pr. [nian2 tie1]/also written 黏貼|黏贴[nian2 tie1]/"},
    {"word":"你", "pinyin":"[ni3]", "definition": "/you (informal, as opposed to courteous 您[nin2])/"},
    {"word":"自己", "pinyin":"[zi4 ji3]", "definition": "/oneself/one's own/"},
    {"word":"的", "pinyin":"[de5]", "definition": "/of/~'s (possessive particle)/(used after an attribute)/(used to form a nominal expression)/(used at the end of a declarative sentence for emphasis)/"},
    {"word":"内容", "pinyin":"[nei4 rong2]", "definition": "/content/substance/details/CL:個|个[ge4],項|项[xiang4]/"},
    {"word":"!", "pinyin":"", "definition": ""}
  ]

    // IS IT BECAUSE THE MEANING OF 'this' IS CHANGING INSIDE OF THE CALL???
    // Well don't know, but putting this outside (as the default)
    // and only conditionally doing the authenticated version worked.
    this.state = {
      translation: translation,
      text: "在此粘贴你自己的内容!",
      known: 0,
      unknown: translation.length,
      vocabulary: [],
    };

    if (this.props.authenticated) {
      // console.log("Set state YES authenticated")
      axios.get("https://ladder-pipenv.herokuapp.com/api/private/" + this.props.user + "/mandarin").then(
        result => {
          // console.log("result.data:", result.data)
          const updated = translation.map((word) => {
            if (result.data.includes(word)) {
              return {...word, show: "hidden"}
            } else {
              return word
            }
          })
          this.state = {
            translation: updated, 
            text: "在此粘贴你自己的内容!",
            vocabulary: result.data,
            known: result.data.length,
            unknown: updated.map(word => word["show"]!=="hidden").reduce((a, b) => a + b)
          };
        }
      )
    }
    // Would prefer the less insane syntax for this
    this.handleInputChange = this.handleInputChange.bind(this)
    // Why again do I need to declare this, and not 'toggle'? B/c event?
  }

  handleInputChange(event) {
    // event.persist()
    const e = event.target.value
    if (this.props.authenticated) {
      axios.get("https://ladder-pipenv.herokuapp.com/api/private/" + this.props.user + "/mandarin").then(
      result => {
        this.setState({
          vocabulary: result.data, // yes! This works!
          text: e, // vent.target.value,
          known: result.data.length,
          translation: this.translate(e).map((word, j) => {
            if (result.data.includes(word.word)) {
              return {...word, show: "hidden"}
            } else {
              return {...word, show: ""}
            }
          })
        })
      })
    } else {
      this.setState({
        // vocabulary: result.data, // yes! This works!
        text: e, // vent.target.value,
        known: 0, // result.data.length,
        translation: this.translate(e)
      })
    }
  }

  toggle(ix) {
    const updated = this.state.translation.map((word, j) => {
      if (ix===j) {
        return {...word, show: word.show === "hidden" ? "" : "hidden"}
      } else {
        return word
      }
    })
    const known = this.state.known + 1 * (updated[ix].show==="hidden") + -1 * (updated[ix].show!=="hidden")

    this.setState({
      translation: updated,
      known: known, 
      unknown: updated.map(word => word["show"]!=="hidden").reduce((a, b) => a + b)
    })

    if (this.props.authenticated) {
      // https://ladder-pipenv.herokuapp.com/
      // http://127.0.0.1:5000/api/private/
      axios.post("https://ladder-pipenv.herokuapp.com/api/private/" + this.props.user + "/mandarin/" + this.state.translation[ix].word //,
      // {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   }
      // }
      )
    }
  }

  // Shit -- this should be calling the database too at ... /language/word, to just get it? 
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
                  translation.push({"word": best_candidate, "pinyin": pinyin, "definition": definition})
                } else {
                    const word = remaining_characters[0]
                    translation.push({"word": word, "pinyin": "", "definition": ""})
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
            <Button variant="dark">Click words you know to hide them!</Button>
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
            <Col md={1}>{word["word"]}</Col>
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
          Ladder of Babel is a tool for beginner and intermediate students of Chinese that makes any text accessible by solving a 
          basic problem with most current tools.<p></p>
          Tools such as the Google Translate browser plugin, or the similar Mate Translate, are great for translating a single word at a time. They are 
           an enormous improvement over having to search through a paper dictionary. However, they are still designed for people who only need to look up
          words one by one, whereas
          most Chinese language learners both need to translate <b>most</b> of the words - and, likely don't even know which combinations of characters 
           <b> form</b> a single word.<p></p>
           Ladder of Babel solves both of these problems by pre-identifying which characters go together, and giving definitions for everything, at once -- 
           further allowing each user to customize and focus their learning, by hiding any information they don't need, and allowing them to watch as their
           vocabulary grows.
           This makes the reading experience as seamless and fluent as possible even for early stage students, and also opens up the entire world of online Chinese
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

// const LoginButton = () => {
//   const { loginWithRedirect } = useAuth0();

//   return <Button onClick={() => loginWithRedirect()}>Log In</Button>;
// };

const LogoutButton = () => {
  const { logout } = useAuth0();

  return (
    <Button onClick={() => logout({ returnTo: window.location.origin })}>
      Log Out
    </Button>
  );
};

function FeedbackButton() {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        Send Feedback
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Feedback</Modal.Title>
        </Modal.Header>
        <Modal.Body>

          Thank you so much for using Ladder of Babel! We want to know your feedback, good and bad, and especially want to know
          if anything went wrong. If you found a bug, please send an email to:
          <br></br><br></br>
          alex@dovecoteinstitute.org
          <br></br><br></br>
          Thanks!

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

const Profile = () => {
  const { isAuthenticated } = useAuth0();
  // const [userMetadata, setUserMetadata] = useState(null);
  const { loginWithRedirect } = useAuth0();

  if (isAuthenticated) {
    return (<div></div>) // <h4 style={{paddingTop:20+'px'}}>Welcome back, {user.name}!</h4>)
  } else {
    // return (<h4 className="welcome" >Welcome! Log in, to keep track of your vocabulary!</h4>)
    return (<Button style={{marginTop:20+'px'}} onClick={() => loginWithRedirect()} >Welcome! Log in, and the site will remember your vocabulary!</Button>)
  }
};

const App = () => {
  
  const { user, isAuthenticated, isLoading } = useAuth0();
  
  // WILL THIS PRODUCE A STABLE MAPPING???
  // const encrypt = (input) => {
  //   // const salt = bcrypt.genSaltSync(10);
  //   return(bcrypt.hashSync(input, '7ohj Y$69t4 jb**x'));
  // }
  // let safer_id = null;
  // if (isAuthenticated) {
  //   const salt = bcrypt.genSaltSync(10);  
  //   safer_id = bcrypt.hashSync(user.email, salt);
  // }


  // const token = (async () => { await getAccessTokenSilently(); })();
  // const [userMetadata, setUserMetadata] = useState(null);

  // useEffect(() => {
  //   const getUserMetadata = async () => {
  //     const domain = "ladderofbabel.com";
  
  //     try {
  //       const accessToken = await getAccessTokenSilently({
  //         audience: `http://${domain}/api/private`,
  //         scope: "read:current_user",
  //       });
  //     } catch (e) {
  //       console.log(e.message);
  //     }
  //   } 
  // })

  return (
    <div className="App">
      <Navbar bg="dark" className="" expand="lg">
        <Nav.Link href="http://dovecoteinstitute.org" style={{color:'white', fontsize:24+'pt'}}>Dovecote Institute</Nav.Link>
        {/* {!isAuthenticated && <LoginButton />} */}
        {isAuthenticated && <LogoutButton />}
        <Nav className="mr-auto"></Nav> {/* Using this to push the rest to the right */}
        &nbsp;
        <FeedbackButton />
        &nbsp;
        &nbsp;
        <About />        
        <Navbar.Brand href="#home" style={{color:'white', paddingLeft:20+'px'}}>The Design Philosophy of Ladder of Babel</Navbar.Brand>        
      </Navbar>

      <Profile />

      <p></p>      
      {/* <Translation authenticated={isAuthenticated} user={user.email} /> */}
      {(!isAuthenticated && !isLoading) && <Translation authenticated={isAuthenticated} />}
      {(isAuthenticated && !isLoading) && 
        <Translation 
          authenticated={isAuthenticated} 
          user={user.email} /> // user={encrypt(user.email)} /> //
          // gettoken={accessToken} />
      }

      <hr></hr>
      <footer style={{textAlign: "left"}} className="container">
        <p>&copy; Dovecote Institute 2020</p>
      </footer>
    </div>
  );
}

function Authenticator() {
  ReactGA.initialize('G-D6QWX1DVPK');
  return (
    <div>
      <Auth0Provider
      domain="dev-lstkwpc9.us.auth0.com"
      clientId="AK5e52F3h6Goesct1Q9ADvHuPchBW25U"
      redirectUri={window.location.origin}
      audience="http://ladderofbabel.com/api"
      scope="read:current_user update:current_user_metadata"
      >         
        <App />
      </Auth0Provider>
    </div>
  )
}

// export default App;
export default Authenticator;


// “我有两张自拍，一张很丑，另一张还是很丑”（“在我的后园，可以看见墙外有两株树，一株是枣树，还有一株也是枣树。”——迅哥原文）
// 100年前的鲁迅万万没有预料到，自己在当下的符号是“中文互联网梗王”、“金句界顶流”。
// 在各种社会热点的留言评论区，在各大平台的鸡汤文学里，鲁迅语录随处可见；无论搭不搭边，“鲁迅曾经说过”就在那里，从不缺席。
// 北京鲁迅博物馆为此专门建了一个检索系统，在这里，所有“鲁迅说过的话”都可以被验证或者打脸，该系统还不止一次因为查询人数过多而崩溃。
// 在互联网的迷幻国度里，人人以为自己熟读鲁迅。
// 人人不知道的是，这个活在100年前的老男孩，早早已将我们读懂、看透。