import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import DirectorsSidebar from "./DirectorsSidebar";
import Users from "./users";
import Teachers from "./teachers";
import UserSede from "./userSede";
import UserProfileView from './UserProfileView';
import TeacherForm from './TeacherForm'; // Import TeacherForm
import TeacherProfileView from './TeacherProfileView'; // Import TeacherProfileView
import UserSedeForm from './UserSedeForm'; // Import UserSedeForm
import UserSedeView from './UserSedeView'; // Import UserSedeView

const Directors = () => {
  return (
    <>
      <Header />
      <DirectorsSidebar
        // You might need to adjust sidebar props based on your application structure
        // id="menu-item"
        // id1="menu-items"
        // activeClassName="directors"
      />
      <div className="page-wrapper">
        <div className="content">
          {/* Define nested routes for the main sections */} {/* Changed comment */}
          <Routes>
            {/* Default route for /directors - redirects to /directors/users */}
            <Route index element={<Navigate to="users" replace />} />

            {/* Users routes */}
            <Route path="users" element={<Users />} />
            <Route path="users/view/:id" element={<UserProfileView />} />

            {/* Teachers routes */}
            <Route path="teachers" element={<Teachers />} />
            <Route path="teachers/add" element={<TeacherForm />} />
            <Route path="teachers/edit/:id" element={<TeacherForm />} />
            <Route path="teachers/view/:id" element={<TeacherProfileView />} />

            {/* User Sede routes */} {/* Added User Sede routes */}
            <Route path="userSede" element={<UserSede />} />
            <Route path="userSede/add" element={<UserSedeForm />} />
            <Route path="userSede/edit/:id" element={<UserSedeForm />} />
            <Route path="userSede/view/:id" element={<UserSedeView />} />

            {/* Add any other routes specific to the directors section here */}

          </Routes>
        </div>
      </div>
    </>
  );
};

export default Directors;