import React, {useState} from 'react';
import AuthorizationPage from './AuthorizationPage'
import Chat from './Chat'
import './style/App.css';

function App() {
  let [currentWebsite, setCurrentWebsite] = useState('auth');

  return (
    <div className='App'>
      {currentWebsite === 'auth' && <AuthorizationPage currentWebsite={currentWebsite} setCurrentWebsite={setCurrentWebsite} /> }
      {currentWebsite === 'chat' && <Chat currentWebsite={currentWebsite} setCurrentWebsite={setCurrentWebsite}/>}
    </div>
  );
}

export default App;