import { Link } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import Logo from '../Logo/Logo'
import CategoryList from '../CategoryList/CategoryList'
import UserLogOut from '../UserLogOut/UserLogOut'

function NavbarComponent({
  categoriesRef,
  activeCat,
  setActiveCat,
  user,
  setUser
}) {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        {/* Logo */}
        <Link className="navbar-brand" to="/">
          <Logo />
        </Link>

        {/* Categories */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <CategoryList
            categories={categoriesRef.current}
            activeCat={activeCat}
            setActiveCat={setActiveCat}
          />

          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <Link to="/orders" className="btn btn-primary">
                PREVIOUS ORDERS
              </Link>
            </li>
            <li className="nav-item">
              <UserLogOut user={user} setUser={setUser} />
            </li>
          </ul>
        </div>
      </div>
    </nav>
  )
}

export default NavbarComponent
