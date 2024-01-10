import { useState } from 'react'
import './App.css'
import axios from 'axios'

function App() {
  const [filesData, setFilesData] = useState("")
  const [pdfData, setpdfData] = useState(null)
  const [mergeStatus, setMergeStatus] = useState(null)

  
  

  const handleSubmit = async(e) => {
    e.preventDefault()
    const formData = new FormData()
    for(let i=0; i<filesData.length; i++){
      formData.append('files', filesData[i])
    }
    // console.log(formData.getAll('files'))

    try {
      const response= await axios.post('https://pdf-merger-backend.vercel.app/', formData)
      setpdfData(response.data)
      setMergeStatus(response.data.message)
      

    } catch (error) {
      console.log(error)
    }
  }
  
// const handleDownload = async(e) => {
//   e.preventDefault()
//   try {
//     const response = await axios.get('http://localhost:5000/download')
//     console.log(response)
//   } catch (error) {
//     console.log(error)
//   }
// }
console.log(pdfData)
  return (
    <>
      <div>
      <h1>Upload Files</h1>
        <form className='mainForm' action="submit" onSubmit={handleSubmit}>

        <div className="container">

        <input type='file' onChange={(e)=>setFilesData(e.target.files) } multiple />
        {/* <input type='file' onChange={(e)=>setFilesData1(e.target.files[0]) } /> */}
        <button type='submit'>Submit</button>
        </div>
        <span>{mergeStatus&&mergeStatus}</span>

        <a href="https://pdf-merger-backend.vercel.app/downloads">Download File</a>
        </form>
        </div>
    </>
  )
}

export default App
