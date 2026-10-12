import LogoutButton from './Logout'
import Sidebar from './Sidebar'
function Dashboard({onLogout}) {
  return (
    <div>
      <Sidebar/>
      <LogoutButton onLogout={onLogout}/>
    </div>
  )
}

export default Dashboard