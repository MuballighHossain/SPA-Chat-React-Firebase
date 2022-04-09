import React, { useRef, useState } from 'react';
import './App.css';
import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { SendOutlined, PictureOutlined } from '@ant-design/icons';


firebase.initializeApp({
  apiKey: "AIzaSyDZaZrLDFF3t11Wwra5mFGNLXN4DJHP0QM",
  authDomain: "chat-5ee73.firebaseapp.com",
  projectId: "chat-5ee73",
  storageBucket: "chat-5ee73.appspot.com",
  messagingSenderId: "497611364808",
  appId: "1:497611364808:web:4cb2085c492e4d6fb1c8fd",
  measurementId: "G-VZ8YNC81L4"
});
const auth = firebase.auth();
const firestore = firebase.firestore();
// const analytics = firebase.analytics();


function App() {

  const [user] = useAuthState(auth);
  

  return ( 
    
    <div className="App">
      <header>
        <h2>Muballigh's Chat Application</h2>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}
function SignIn () {

  const emailRef = useRef(null);
  const passwordRef = useRef(null);

  const signUpWithMail = e => {
    e.preventDefault();
    auth.createUserWithEmailAndPassword(
      emailRef.current.value,
      passwordRef.current.value
    ).then(user => {
      console.log(user)
    }).catch(err => {
      console.log(err)
    })
  }
  const signInWithMail = e => {
    e.preventDefault();
    auth.signInWithEmailAndPassword(
      emailRef.current.value,
      passwordRef.current.value
    ).then(user => {
      console.log(user)
    }).catch(err => {
      console.log(err)
    })
  }

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }
  return(
      
      <div className="signInMail">
        <form>
          {/* <h6> Sign-In Using Email</h6> */}
          <input ref = {emailRef} type = "email" placeholder='email'/>
          <input ref = {passwordRef} type="password" placeholder='password' />
          <button onClick={signInWithMail}>Sign In </button>
          <h6>Not Yet Registered? <span onClick={signUpWithMail} className='signin_Link'>Sign Up</span></h6>
        </form>
        <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      </div>
  )
}


function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const { uid, photoURL } = auth.currentUser;

  const sendMessage = async (e) => {
    e.preventDefault();

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('');
    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }
  const handleUpload = (e) => {
    sendMessage(uid, photoURL, { files: e.target.files, text: '' });
    setFormValue(e.target.value);
  };

  return (<>
    <main>

      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}

      <span ref={dummy}></span>

    </main>

    <form onSubmit={sendMessage}>

      <input value={formValue} onChange={(e) => setFormValue(e.target.value)} placeholder="say something nice" />

      <label htmlFor="upload-button">
        <span className="image-button">
          <PictureOutlined className="picture-icon" />
        </span>
      </label>
      <input
        type="file"
        multiple={false}
        id="upload-button"
        style={{ display: 'none' }}
        onChange={handleUpload.bind(this)} 
        
      />
      <button type="submit" disabled={!formValue}>
      <SendOutlined className="send-icon" />
      </button>
    </form>
  </>)
}


function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img alt='404' src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}

export default App;