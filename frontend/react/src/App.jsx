import { useState } from 'react'
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import './App.css'
import './main.css'

function CardGenerica({children}){
  
  return (
  <div className='card'>
    {children}
  </div>
  )
}

function Home(){
  return (
    <>
      
    </>
  )
}

function Register(){
  const [correo, setCorreo] = useState('');
  const [contra, setContra] = useState('');

  const registrar = () => {
    console.log("RAAAAa")
    console.log(correo, contra)
  }

  return (
    <>
     <label htmlFor="correo" >Correo</label>
     <input id="correo" value={correo} onChange={ (e) => setCorreo(e.target.value)}></input>
     <label htmlFor="contra">Contra</label>
     <input id="contra" value={contra} onChange={ (e) => setContra(e.target.value)}></input>
     <button onClick={registrar}>Registrar</button>
    </>
  )
}

function Login(){
  return (
    <>
     <input id="con"></input>
     <label htmlFor="contra"></label>
     <input></input>
    </>
  )
}


function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to='/Login'>Login</Link>
        <Link to='/Register'>Registro</Link>
        <Link to='/home'>Home</Link>
      </nav>
      <Routes>
        <Route path='/Login' element={<Login/>}/>
        <Route path='/Register' element={<Register/>}/>
        <Route path='/Home' element={<Home/>}/>
      </Routes>
    </BrowserRouter>
  )  
}

export default App
