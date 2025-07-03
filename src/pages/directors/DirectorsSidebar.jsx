/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import Scrollbars from "react-custom-scrollbars-2";


const DirectorsSidebar = (props) => {
  const [sidebar, setSidebar] = useState("");
  const handleClick = (e, item, item1) => {
    const div = document.querySelector(`#${item}`);
    const ulDiv = document.querySelector(`.${item1}`);
    const isLink = e.target.tagName === 'A' || e.target.closest('a');

    if (isLink && !e.target.closest(`.${item1}`)) {
      if (ulDiv.style.display === 'block') {
        ulDiv.style.display = 'none';
        div.classList.remove('subdrop');
      } else {
        document.querySelectorAll('.sidebar-menu ul ul').forEach(ul => {
          if (ul !== ulDiv) {
            ul.style.display = 'none';
            ul.closest('li.submenu')?.classList.remove('subdrop');
          }
        });
        ulDiv.style.display = 'block';
        div.classList.add('subdrop');
      }
    }
  }

  useEffect(() => {
    // Find the current path and open the corresponding submenu
    const currentPath = window.location.pathname;
    document.querySelectorAll('.sidebar-menu a').forEach(link => {
      if (link.pathname === currentPath) {
        const submenuUl = link.closest('ul.submenu > ul');
        if (submenuUl) {
          submenuUl.style.display = 'block';
          submenuUl.closest('li.submenu')?.classList.add('subdrop');
        }
      }
    });

  }, [])


  const expandMenu = () => {
    document.body.classList.remove("expand-menu");
  };
  const expandMenuOpen = () => {
    document.body.classList.add("expand-menu");
  };

  return (
    <>
      <div className="sidebar" id="sidebar">
        <Scrollbars
          autoHide
          autoHideTimeout={1000}
          autoHideDuration={200}
          autoHeight
          autoHeightMin={0}
          autoHeightMax="95vh"
          thumbMinSize={30}
          universal={false}
          hideTracksWhenNotNeeded={true}
        >
          <div className="sidebar-inner slimscroll">
            <div id="sidebar-menu" className="sidebar-menu"
              onMouseLeave={expandMenu}
              onMouseOver={expandMenuOpen}
            >
              <ul>
                <li className="menu-title">Directors</li>
                <li className="submenu">
                  <Link to="#" id="menu-item-directors" onClick={(e) => handleClick(e, "menu-item-directors", "menu-items-directors")}>
                    <span className="menu-side">
                       <i className="fa fa-user"></i>
                    </span>{" "}
                    <span> Directors </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items-directors">
                    <li>
                      <Link className={props?.activeClassName === 'directors-users' ? 'active' : ''} to="/directors/users">Users</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'directors-teachers' ? 'active' : ''} to="/directors/teachers">Teachers</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'directors-userSede' ? 'active' : ''} to="/directors/userSede">UserSede</Link>
                    </li>
                  </ul>
                </li>
              </ul>
            </div>
          </div>
        </Scrollbars>
      </div>
    </>
  )
}
export default DirectorsSidebar