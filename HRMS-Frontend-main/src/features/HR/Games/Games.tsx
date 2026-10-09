import React from 'react'
import { useNavigate } from 'react-router-dom';

type Props = {}

const Games = (props: Props) => {

  const navigate = useNavigate();

  const openConfiguration = () => {
    navigate('/hr/games/config');
  }
  return (
    <>
      <div>
        <button className="mt-2 mr-2 bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors" onClick={() => { openConfiguration() }}>Configure</button>
    
      </div>
    </>
  )
}

export default Games;