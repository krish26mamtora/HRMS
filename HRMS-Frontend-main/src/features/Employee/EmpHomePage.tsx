import React from 'react'
import { Outlet } from 'react-router-dom';

type Props = {}

const EmpHomePage = (props: Props) => {
  return (
     <>
    <Outlet/>
     </>
  )
}
export default EmpHomePage;