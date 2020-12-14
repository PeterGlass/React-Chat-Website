import React, {useEffect, useState} from 'react';
import './style/AuthorizationPage.css';

function AuthorizationPage(props, {history}) {
    const accessCodeInput = React.createRef();
    const [height, width] = useWindowSize();
    const [accessClass, setAccessClass] = useState('NoAccessDenied');
    const [accessCode, setAccessCode] = useState(0);

    // sets access code on mount
    useEffect(() => {
      setAccessCode(Math.floor(Math.random()*10000000000));
    }, []);

    // determines if inputted access code is correct
    function handleSubmit (event) {
      event.preventDefault();
      if(parseInt(accessCodeInput.current.value) === accessCode){
        props.setCurrentWebsite('chat');
      }
      else {
        setAccessClass('AccessDenied');
      }
    }
    
    let welcomeClass;
    let versionClass;
    if(height > 400 && width > 515){
      welcomeClass = 'Welcome';
      versionClass = 'Version';
    }
    else if(height < 310){
      welcomeClass = 'WelcomeMobile'
      versionClass = 'NoVersion'
    }
    else {
      welcomeClass = 'WelcomeMobile'
      versionClass = 'Version'
    }
  
    return (
      <div className='AuthorizationPage'>
        <div className='CenterContainer'>
          <div className={welcomeClass}>This <em>Website</em> is Restricted.</div>
          <div className='Hint'>(Not really though... the access code is hidden somewhere on this website)</div>       
          <form className={'AccessCode'} onSubmit={handleSubmit}>
            <input type='text' placeholder='Access Code' ref={accessCodeInput}/>
            <button>Enter</button>
          </form>
          <div className={accessClass}>Access Denied!</div>
        </div>
        <div className='HiddenCode'>{accessCode}</div>
        <div className={versionClass}>Version:1.1.4 - Updated:6/11/20</div>
      </div>
    )
  
  }

  function useWindowSize() {
    const [size, setSize] = useState([window.innerHeight, window.innerWidth]);
    useEffect(() => {
      const handleResize = () => {
        setSize([window.innerHeight, window.innerWidth]);
      };
      window.addEventListener("resize", handleResize);
      return () => {
        window.removeEventListener("resize", handleResize);
      };
    }, []);
    return size;
  }

  export default AuthorizationPage;