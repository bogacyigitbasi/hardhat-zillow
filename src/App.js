// we have hooks to manage different components
import { useEffect, useState } from 'react';
// ethers is the main connection to the blockchain level
import { ethers } from 'ethers';

// Components
// we use components to organize, to render and manage
// and with hooks to share the state as a small cacheDB
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';

// ABIs
import RealEstate from './abis/RealEstate.json'
import Escrow from './abis/Escrow.json'

// Config
import config from './config.json';

function App() {

  // create functions to read and set accounts  in different components
  // using useState. It fetchs the component state and gives
  // 2 functions, read the state -account- and write to state -setAccount-
  const [account, setAccount] = useState(null)

  // we need to create a hook to the provider to operate
  // onchain

  const [provider, setProvider] = useState(null)

  // create another state hook for escrow contract
  const [escrow, setEscrow] = useState(null)

  // a hook for homes, so we can use it in other components
  const [homes, setHomes] = useState([])

  const loadBlockchainData = async() => {
    // inject ethereum window provider
    // we have everything we need to communicate.
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    setProvider(provider)
    // console.log("provider", provider)


    // lets get the data from the contracts to list
    const network = await provider.getNetwork()
    //
    // config[network.chainId].escrow.address
    // console.log(config[network.chainId].escrow.address)
    // console.log(config[network.chainId].realEstate.address)

    // we need to contract address and abi and provider
    // we are using metamask RPC node to fetch the data here.

    // RealEstate
    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate.abi, provider)
    const totalSupply = await realEstate.totalSupply()
    console.log("Total homes", totalSupply)
    const homes = []
    for (let i = 1; i <=totalSupply; i++){
      const uri = await realEstate.tokenURI(i)
      console.log(uri)
      const response = await fetch(uri)
      const metadata = await response.json()
      homes.push(metadata)
    }
    setHomes(homes)

    console.log(homes)

    // Escrow
    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow.abi, provider)
    console.log("Escrow address", escrow.address)
    setEscrow(escrow)



    // either connect and get address here
    // or get it on NavBar and use the useState
    // const accounts = await window.ethereum.request({method:'eth_requestAccounts'})
    // console.log("Accounts ", accounts)
    // setAccount(accounts[0])
    // console.log("Account is ", accounts[0])


    // if the account is changed at any time, update the state
    window.ethereum.on('accountsChanged', async () =>{
      const accounts = await window.ethereum.request({method: 'eth_requestAccounts'});
      const account = ethers.utils.getAddress(accounts[0]) // first account will be the selected one
      setAccount(account)
    })
  }
  // call the function to load the page initially
  useEffect(() => {
    loadBlockchainData()
  }, [])

  // when a house clicked we want to proceed with it to purchase
  // hook to read home, and to set home
  const [home, setHome] = useState({})
  // another hook to differentiate if the button is clicked or not
  // toggle or not toggle
  const [toggle, setToggle] = useState(false) // by default its not toggled
   // defining a new useState hook for the home
  const toggleProp = (home) => {
    // console.log("clicked")
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }


  return (
    <div>

      <Navigation account={account} setAccount={setAccount}></Navigation>
      <Search/>

      <div className='cards__section'>

        <h3>Homes For You</h3>

        <hr/>
        <div className='cards'>
          // react allows you to use html and js at the same place
          {
            // iterator on homes in pairs
            homes.map((home, index) => ( //we just want a return value.
              // giving each card an index
              // react requires unique keys
              <div className='card' key={index} onClick={()=> toggleProp(home)}>
              <div className='card__image'>
                <img src={home.image}/>
              </div>
              <div className='card__info'>
                  <p>{home.attributes[0].value}H</p>
                  <p>{home.name}</p>
                  <p>
                    <strong>{home.attributes[2].value}</strong> bds |
                    <strong>{home.attributes[3].value}</strong> ba |
                    <strong>{home.attributes[4].value}</strong> sqft |
                  </p>
              </div>
            </div>
            ))
          }

        </div>
      </div>

      {toggle && (
          <Home home={home} provider={provider} account = {account} escrow={escrow} toggleProp={toggleProp}/>
        )}

    </div>
  );
}

export default App;
