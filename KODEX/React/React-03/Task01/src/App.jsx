import React from 'react'
import Component1 from "./assets/Component/Component1.jsx";
import Component2 from "./assets/Component/Component2.jsx";
import Component3 from "./assets/Component/Component3.jsx";
const App = () => {
  let text="Our Products"
  return (
    <div className='Container'>
      
      <Component1/>
      <Component2/>
      <Component3 />
    </div>
  )
}

export default App
