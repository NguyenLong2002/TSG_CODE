import './login.css'
import {useState, useRef ,useEffect} from 'react'

const initInput = {
    username :'',
    password :''
}
const initTimeLeft = 15;
function Login() {
    const inputRef = useRef()
    const users = { username:'long123',password:'1234'}

    const [input, setInput] = useState(initInput)
    const [errorMessage,setErrorMessage] = useState()
    const [loggedIn, setLoggedIn] = useState(false)
    const [timeLeft, setTimeLeft] = useState(initTimeLeft)

    const handleInput = (e) => {
        setInput(
            {
                ...input,
                [e.target.id] : e.target.value
            }
        )
    }
    const handleLogin = () => {
        if(input.username === users.username && input.password === users.password){
            setErrorMessage('Chào ban: '+input.username)
            setLoggedIn(true)
        }else if(input.username === '' && input.password === ''){
            setErrorMessage('Điền đầy đủ thông tin!')
        }else{
            setErrorMessage('Sai tài khoản hoặc mật khẩu!')

        }

        setInput(initInput)
        inputRef.current.focus()
    }

    useEffect(() => {
        let timer
        if(loggedIn){
            timer = setInterval(() => {
                setTimeLeft((prevTime) => {
                    if(prevTime > 0){
                        return prevTime - 1;
                    }else{
                        setLoggedIn(false)
                        setInput(initInput)
                        setErrorMessage('Bạn đã đăng xuất!')
                        return initTimeLeft;
                    }
                })
            },1000)
        }
        return () => clearInterval(timer)
    },[loggedIn])

    return(
        <div id="formLogin">
            <h1>choà mọi người</h1>
            <h2>Đăng nhập</h2>
            <div className="box">
                <input
                    ref = {inputRef}
                    className="input"
                    id = "username"
                    value = {input.username}
                    onChange = {handleInput}
                    placeholder="Enter username ..."
                    disabled = {loggedIn}
                />
                <input
                    className="input"
                    id = "password"
                    value = {input.password}
                    onChange = {handleInput}
                    placeholder="Enter password ..."
                    disabled = {loggedIn}
                />
            </div>
                {errorMessage && <p className="errorMessage">{errorMessage}</p>}
                {!loggedIn ? (
                <button className="loginBtn" onClick={handleLogin}>Login</button>
                    ) : (
                        <p>Bạn đang đăng nhập. Đăng xuất sau {timeLeft} giây...</p>
                    )}
        </div>
    )

}
export default Login;