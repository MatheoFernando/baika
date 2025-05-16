import React from 'react'
import SearchDasboardh from '../searchCommand'
import { NavUser } from './nav-user'
import { Bells } from './bells'
import { Mode } from './mode'

function Header() {
    const data = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  } }
  return (
    <div className='flex items-center justify-between w-full'>
       <div>
         <SearchDasboardh/>
       </div>
        <div className="flex  items-center gap-5">
            <Mode/>
           
<Bells/>
            <NavUser user={data.user}/>
            
        </div>
    </div>
  )
}

export default Header