import React from "react";
// eslint-disable-next-line no-unused-vars

import { BrowserRouter, Routes, Route } from "react-router-dom";
//Students
import StudentList from "./pages/students/StudentList";
import AddStudent from "./pages/students/AddStudent";
import EditStudent from "./pages/students/EditStudent";
import StudentProfile from "./pages/students/StudentProfile";
//Enrollments
import EnrollmentList from "./pages/enrollments/EnrollmentList";
import AddEnrollment from "./pages/enrollments/AddEnrollment";
import EditEnrollment from "./pages/enrollments/EditEnrollment";
//For Settings...
// import Settings from "./components/settings/Settings";

import AppRoutes from "./components/approutes";
import Auth from "./pages/auth/auth";
import Admin from "./pages/admin/admin";
import Principal from "./pages/principal/principal";
import Teacher from "./pages/teacher/teacher";
import Directors from "./pages/directors/directors";
import InstitutionsAll from "./pages/admin/institutions/institutions";
import AddInstitution from "./pages/admin/institutions/addInstitution";
import EditInstitution from "./pages/admin/institutions/editInstitution";
import ViewInstitution from "./pages/admin/institutions/viewInstitution";
import DirectorsAll from "./pages/admin/institutions/directorsAll";
import AddDirector from "./pages/admin/institutions/addDirector";
import HeadquartersAll from "./pages/admin/institutions/headquartersAll";
import AddHeadquarters from "./pages/admin/institutions/addHeadquarters";
import EditHeadquarters from "./pages/admin/institutions/editHeadquarters";
import Attendence from "./pages/teacher/attendance/Attendence";
import Justifications from "./pages/teacher/attendance/Justifications";
//Accounts
const Approuter = () => {
  // eslint-disable-next-line no-unused-vars
  // const config = "/react/template"
  return (
    <>
      <BrowserRouter basename="/">
        <Routes>
          <Route path="/" element={<Auth />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/principal" element={<Principal />} />
          <Route path="/teacher" element={<Teacher />} />
          <Route path="/directors/*" element={<Directors />} />


          <Route key="attendances" path="/attendances" element={<Attendence />} />,
          <Route key="Justifications" path="/justifications" element={<Justifications />} />,

          <Route path="/institution" element={<InstitutionsAll />} />
          <Route path="/add-institution" element={<AddInstitution />} />
          <Route path="/edit-institution/:id" element={<EditInstitution />} />
          <Route path="/institution/:id" element={<ViewInstitution />} />
          <Route path="/institution-directors/:id" element={<DirectorsAll />} />
          <Route path="/add-director/:id" element={<AddDirector />} />
          <Route path="/institution-headquarters/:id" element={<HeadquartersAll />} />
          <Route path="/add-headquarter/:id" element={<AddHeadquarters />} />
          <Route path="/edit-headquarter/:id" element={<EditHeadquarters />} />

          <Route path="/studentlist" element={<StudentList />} />,
          <Route path="/add-student" element={<AddStudent />} />,
          <Route path="/editstudent/:id" element={<EditStudent />} />,
          <Route path="/studentprofile/:id" element={<StudentProfile />} />,
          <Route path="/enrollmentlist" element={<EnrollmentList />} />,
          <Route path="/add-enrollment" element={<AddEnrollment />} />,
          <Route path="/editenrollment/:id" element={<EditEnrollment />} />
          {AppRoutes.map((route) => route)}
        </Routes>
      </BrowserRouter>
      <div className="sidebar-overlay"></div>
    </>
  );
};

export default Approuter;
