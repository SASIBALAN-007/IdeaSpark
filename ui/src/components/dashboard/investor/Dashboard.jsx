import LogoutButton from './Logout'
import UserStats from './Userstatus'
function dashboard({ onLogout }) {
  return (
    <div>
      <LogoutButton onLogout={onLogout} />
      <UserStats />
    </div>
  )
}

export default dashboard