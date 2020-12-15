import React, {useEffect, useState, useRef} from 'react';
import './style/Chat.css';
import Axios from 'axios';
import SimpleBar from 'simplebar-react';
import 'simplebar/dist/simplebar.min.css';

const hostURL = "https://onlypeters.com";
//const hostURL = "http://localhost:3001";

function Chat(props) {
    const [alias, setAlias] = useState('(None)');
    const [tempAlias, setTempAlias] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');
    const [messageLog, setMessageLog] = useState([]);
    const [isNewUser, setIsNewUser] = useState(false);
    const [isLogin, setIsLogin] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [errorMessage, setErrorMessage] = useState('test');
    const [flexClass, setFlexClass] = useState('BlurFlexContainer');
    const [sessionId, setSessionId] = useState(0);
    const [userCount, setUserCount] = useState(0);
    const messagesEndRef = useRef(null);
    const [height, width] = useWindowSize();

    const scrollToBottom = () => {
        messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }

    useEffect(scrollToBottom, [messageLog]);

    useEffect(() => {
        getMessageLog();
        setInterval(getMessageLog, 500);
    }, []);

    useEffect(() => {
        getUserCount();
        setInterval(getUserCount, 500);
    }, []);

    const cleanup = (e) => {
        e.preventDefault();
        console.log(test);
        endSession();
    }

    useEffect(() => {
      
        window.addEventListener('beforeunload', cleanup);
      
        return () => window.removeEventListener('beforeunload', cleanup);
        
      }, [cleanup]);

    const getUserCount = () => {
        Axios.get(hostURL + '/api/getUserCount').then((response) => {
            setUserCount(response.data[0].user_count);
        });
    };

    const startSession = () => {
        Axios.get(hostURL + '/api/startSession',{
            params: {
                alias: tempAlias
            }
        }).then((response) => {
            setSessionId(response.data[1][0].session_id);
        });
    };

    const endSession = () => {
        Axios.delete(hostURL + '/api/endSession',{
            data: {
                sessionId: sessionId
            }
        });
        setSessionId(0);
    };

    const getMessageLog = () => {
        Axios.get(hostURL + "/api/getMessage").then((response) => {
            setMessageLog(response.data);
        });
    };

    const sendMessage = (e) => {
        e.preventDefault();
        Axios.post(hostURL + '/api/insertMessage', {
            alias: alias, 
            message: message
        });
        setMessage('');
    };

    const createUser = (e) => {
        e.preventDefault();
        Axios.get(hostURL + "/api/isAliasUnique", {
            params: {
                alias: tempAlias
            }
        }).then((response) => {
            if(response.data){
                console.log(tempAlias);
                if(tempAlias.length <= 20){ 
                    setAlias(tempAlias);
                    setIsLogin(true);
                    startSession();
                    Axios.post(hostURL + "/api/insertUser", {
                        alias: tempAlias,
                        password: password
                    });
                } else {
                    setErrorMessage('Alias must be less than 20 characters.');
                    setHasError(true);
                } 
            } else {
                setErrorMessage('Alias has already been taken.');
                setHasError(true);
            }
        });
    };

    const userLogin = (e) => {
        e.preventDefault();
        Axios.get(hostURL + "/api/isUserAuth", {
            params: {
                alias: tempAlias,
                password: password
            }
        }).then((response) => {
            if(response.data){
                setAlias(tempAlias);
                setIsLogin(true);
                startSession();
            } else {
                setErrorMessage('Account credentials are incorrect.');
                setHasError(true);
            }
        });
    };

    const openCreateAlias = () => {
        setIsNewUser(true);
        setHasError(false);
    };

    const openLogin = () => {
        setIsNewUser(false);
        setHasError(false);
    };

    const logout = () => {
        setIsLogin(false);
        setAlias("(None)");
        endSession();
    };

    useEffect(() => {
        if(isLogin){
            setFlexClass('FlexContainer');
        } else {
            setFlexClass('BlurFlexContainer');
        }
    },[isLogin]);

    useEffect(() => {
        if(!hasError){
            setErrorMessage('');
        }
    }, [hasError]);

    let popClass;
    if(width > 500){
        popClass = 'PopBox';
    } else {
        popClass = 'MobilePopBox';
    }

    return(
        <div>
            {(!isNewUser && !isLogin) && <div className={popClass}>
                <div className='PopMessage'>Use previously created alias and password to login. (Passwords cannot be recovered). </div>
                <form className='PopForm' onSubmit={userLogin}>
                    <input className='AliasInput' required type='text' placeholder='Alias' onChange={(e) => {
                        setTempAlias(e.target.value);
                    }}/><br/>
                    <input className='PasswordInput' type='password' placeholder='Password' onChange={(e) => {
                        setPassword(e.target.value);
                    }}/><br/>
                    <button>Login</button>
                </form><br/>
                <button className="PopSwitch" required onClick={openCreateAlias}>Create new alias.</button>
                <div className='Error'>{errorMessage}</div>
            </div>}

            {(isNewUser && !isLogin) && <div className={popClass}>
            <div className='PopMessage'>Create new alias. Bad passwords will be shamed. (Passwords cannot be recovered).</div>
                <form className='PopForm' onSubmit={createUser}>
                    <input className='AliasInput' required type='text' placeholder='Unique Alias' onChange={(e) => {
                        setTempAlias(e.target.value);
                    }}/><br/>
                    <input className='PasswordInput' required type='password' placeholder='Create Password' onChange={(e) => {
                        setPassword(e.target.value);
                    }}/><br/>
                    <button>Create Alias</button>
                </form><br/>
                <button className="PopSwitch" onClick={openLogin}>Login with alias.</button>
                <div className='Error'>{errorMessage}</div>
            </div>}
            
            <div className={flexClass}>
                <div className='ChatBox ContainerItem'>
                    <div className='ChatHeader'>
                        <div className='OnlineUsers'>
                            <span className='OnlineBullet'>&#8226;</span> Active Users: {userCount}
                        </div>
                        <div className='CurrentAlias'>Alias: <span className='Alias'>{alias}</span> | </div>
                        <button className='LogoutButton' disabled={!isLogin} onClick={logout}>Logout</button>
                    </div>
                    <div className='MessageBox'>
                        <SimpleBar style={{height: "100%" }}>
                            {messageLog.map((val) => {
                                return <div>&lt;<span className='Alias'>{val.alias}</span>&gt; {val.message}</div>
                            })}
                            <div ref={messagesEndRef} />
                        </SimpleBar>
                    </div>
                    <form className='MessageForm' onSubmit={sendMessage}>
                        <input className='MessageInput' value={message} disabled={!isLogin} required type='text' placeholder='Message' onChange={(e) => {
                            setMessage(e.target.value);
                        }}/>
                        <button className='SendButton' disabled={!isLogin}>Send</button>
                    </form>
                </div>
            </div>
        </div>
    );

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
}

export default Chat;
