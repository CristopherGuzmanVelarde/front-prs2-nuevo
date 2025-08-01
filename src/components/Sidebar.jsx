/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import React, { useEffect, useState } from 'react'
import { Link } from "react-router-dom";
import { blog, dashboard, doctor, doctorschedule, logout, menuicon04, menuicon06, menuicon08, menuicon09, menuicon10, menuicon11, menuicon12, menuicon14, menuicon15, menuicon16, patients, sidemenu } from './imagepath';
import Scrollbars from "react-custom-scrollbars-2";


const Sidebar = (props) => {
  const [sidebar, setSidebar] = useState("");
  const handleClick = (e, item, item1, item3) => {
    const div = document.querySelector(`#${item}`);
    const ulDiv = document.querySelector(`.${item1}`);
    // Check if the clicked element is the link itself or an element within it
    const isLink = e.target.tagName === 'A' || e.target.closest('a');

    // Only toggle if a link was clicked and it's not one of the submenu links
    if (isLink && !e.target.closest(`.${item1}`)) {
      if (ulDiv.style.display === 'block') {
        ulDiv.style.display = 'none';
        div.classList.remove('subdrop');
      } else {
        // Close all other submenus before opening the current one
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
    if (props?.id && props?.id1) {
      const ele = document.getElementById(`${props?.id}`);
      // Simulate a click to open the default active submenu
      // This might need refinement based on how activeClassName is used elsewhere
      const defaultClickEvent = { target: ele };
      handleClick(defaultClickEvent, props?.id, props?.id1);
    }

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

  }, [props?.id, props?.id1])


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
                <li className="menu-title">Main</li>
                <li className="submenu" >
                  <Link to="#" id="menu-item" onClick={(e) => {
                    handleClick(e, "menu-item", "menu-items")
                  }}>
                    <span className="menu-side">
                      <img src={dashboard} alt="" />
                    </span>{" "}
                    <span> Dashboard </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: sidebar === 'Dashboard' ? 'block' : "none" }} className='menu-items'>
                    <li>
                      <Link className={props?.activeClassName === 'admin-dashboard' ? 'active' : ''} to="/">Admin Dashboard</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'doctor-dashboard' ? 'active' : ''} to="/">Director  Dashboard</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'patient-dashboard' ? 'active' : ''} to="/">Profesor Dashboard</Link>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <Link to="#" id="menu-item2" onClick={(e) => handleClick(e, "menu-item2", "menu-items2")}>
                    <span className="menu-side">
                      <img src={patients} alt="" />
                    </span>{" "}
                    <span>Estudiantes </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items2">
                    <li>
                      <Link className={props?.activeClassName === 'patient-list' ? 'active' : ''} to="/studentlist">Estudiante Lista</Link>
                    </li>
                  </ul>
                </li>
                
                <li className="submenu">
                  <Link to="#" id="menu-item3" onClick={(e) => handleClick(e, "menu-item3", "menu-items3")}>
                    <span className="menu-side">
                      <img src={menuicon08} alt="" />
                    </span>{" "}
                    <span> Matricula </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items3">
                    <li>
                      <Link className={props?.activeClassName === 'staff-list' ? 'active' : ''} to="/enrollmentlist">Matricula Lista</Link>
                    </li>
                  </ul>
                </li>

                <li className="submenu">
                  <Link to="#" id="menu-item4" onClick={(e) => handleClick(e, "menu-item4", "menu-items4")}>
                    <span className="menu-side">
                      <img src={menuicon04} alt="" />
                    </span>{" "}
                    <span> Asistencia </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items4">
                    <li>
                      <Link className={props?.activeClassName === 'appoinment-list' ? 'active' : ''} to="/attendances">Asistencia Lista</Link>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <Link to="#" id="menu-item5" onClick={(e) => handleClick(e, "menu-item5", "menu-items5")}>
                    <span className="menu-side">
                      <img src={doctorschedule} alt="" />
                    </span>{" "}
                    <span> Justificaciones </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items5">
                    <li>
                      <Link className={props?.activeClassName === 'shedule-list' ? 'active' : ''} to="/justifications">Justificaciones Lista</Link>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <Link to="/institution" id="menu-item6">
                    <span className="menu-side">
                      <img src={menuicon06} alt="" />
                    </span>{" "}
                    <span> Instituciones </span> <span className="menu-arrow" />
                  </Link>
                  
                </li>
                <li className="submenu">
                  <Link to="#" id="menu-item7" onClick={(e) => handleClick(e, "menu-item7", "menu-items7")}>
                    <span className="menu-side">
                      <img src={sidemenu} alt="" />
                    </span>{" "}
                    <span> Accounts </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items7">
                    <li>
                      <Link className={props?.activeClassName === 'invoice-list' ? 'active' : ''} to="/invoicelist">Invoices</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'payments' ? 'active' : ''} to="/payments">Payments</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'expenses' ? 'active' : ''} to="/expenses">Expenses</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'taxes' ? 'active' : ''} to="/taxes">Taxes</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'provident-fund' ? 'active' : ''} to="/providentfund">Provident Fund</Link>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <Link to="#" id="menu-item8" onClick={(e) => handleClick(e, "menu-item8", "menu-items8")}>
                    <span className="menu-side">
                      <img src={menuicon09} alt="" />
                    </span>{" "}
                    <span> Calificaciones </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items8">
                    <li>
                      <Link className={props?.activeClassName === 'grade-list' ? 'active' : ''} to="/grade"> Registro de Calificaciones </Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'notifications' ? 'active' : ''} to="/notifications"> Notificaciones </Link>
                    </li>
                  </ul>
                </li>
                <li className="submenu">
                  <Link to="#" id="menu-item9" onClick={(e) => handleClick(e, "menu-item9", "menu-items9")}>
                    <span className="menu-side">
                      <img src={menuicon11} alt="" />
                    </span>{" "}
                    <span> Calls</span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items9">
                    <li>
                      <Link className={props?.activeClassName === 'voice-call' ? 'active' : ''} to="/voice-call">Voice Call</Link>
                    </li>
                    <li >
                      <Link className={props?.activeClassName === 'video-call' ? 'active' : ''} to="/video-call">Video Call</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'incoming-call' ? 'active' : ''} to="/incoming-call">Incoming Call</Link>
                    </li>
                  </ul>
                </li>
 {/* Directors Submenu */}
 <li className="submenu">
                  <Link to="#" id="menu-item-directors" onClick={(e) => handleClick(e, "menu-item-directors", "menu-items-directors")}>
                    <span className="menu-side">
 {/* Add an appropriate icon here */}
 <i className="fa fa-user"></i> {/* Using a generic user icon for now */}
                    </span>{" "}
                    <span> Directors </span> <span className="menu-arrow" />
                  </Link>
                  <ul style={{ display: "none" }} className="menu-items-directors">
                    <li>
                      <Link className={props?.activeClassName === 'directors-page1' ? 'active' : ''} to="/directors/page1">Page 1</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'directors-page2' ? 'active' : ''} to="/directors/page2">Page 2</Link>
                    </li>
                    <li>
                      <Link className={props?.activeClassName === 'directors-page3' ? 'active' : ''} to="/directors/page3">Page 3</Link>
                    </li>
                  </ul>
                </li>
                {/* End Directors Submenu */}
              </ul>
              <div className="logout-btn">
                <Link to="/login">
                  <span className="menu-side">
                    <img src={logout} alt="" />
                  </span>{" "}
                  <span>Logout</span>
                </Link>
              </div>
            </div>
          </div>
        </Scrollbars>
      </div>
    </>
  )
}
export default Sidebar
