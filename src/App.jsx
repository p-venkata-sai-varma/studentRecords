import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { studentContractConstants } from './blockchainArtifacts/studentContract'
import ExcelSheetReader from './components/ExcelSheetReader'
import StudentDetails from './components/StudentDetails'
import './App.css'

function App(){
  const [state ,setState] = useState({
    provider: null,
    signer: null,
    contract: null
  })

  const [account, setAccount]= useState('connect wallet')
  const [showExcel, setShowExcel ] = useState(true);

  useEffect(() => {
    const initialize = async()=>{
      const contractAddres=studentContractConstants.address;
      const contractABI=studentContractConstants.abi;
      
      try{
        const {ethereum}=window;
        const account = await ethereum.request({
          method:"eth_requestAccounts"
        })
 
        window.ethereum.on("accountsChanged",()=>{
         window.location.reload()
        })

        setAccount(account);
        
        const provider = new ethers.providers.Web3Provider(ethereum);//read the Blockchain
        const signer =  provider.getSigner(); //write the blockchain
        
        const contract = new ethers.Contract(
          contractAddres,
          contractABI,
          signer
        )
        
        console.log(contract)
        setState({provider,signer,contract});
       
      } catch(error){
        console.log(error)
      }
    }
    initialize()
  }, [])



  return (
    <div className="app">
      <div className="account-details">
          Connected Account: {account}
      </div>
      <button
          className="toggle-button"
          onClick={() => setShowExcel(!showExcel)}
      >
          Toggle Content
      </button>
      <div className="content-container">
          {showExcel ? (
              <ExcelSheetReader state={state} />
          ) : (
              <StudentDetails state={state} />
          )}
      </div>
    </div>
  )
}

export default App
 
