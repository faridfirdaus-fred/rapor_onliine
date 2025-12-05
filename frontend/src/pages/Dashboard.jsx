import React from "react";
import Navbar from "../components/Navbar";
import { Routes, Route, useNavigate } from "react-router-dom";
import DaftarMapel from "./DaftarMapel";
import Perankingan from "./perankingan";
import NilaiMapel from "./NilaiMapel";
import BobotNilai from "./BobotNilai";
import ProfilePage from "./ProfilePage";

const Sidebar = () => {
  const navigate = useNavigate();
  return (
    <aside className="bg-white shadow-md min-h-screen w-56 py-8 px-4">
      <ul className="space-y-4">
        <li>
          <button
            className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition`}
            onClick={() => navigate("/dashboard/profil")}
          >
            Profil Guru
          </button>
        </li>
        <li>
          <button
            className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition`}
            onClick={() => navigate("/dashboard/perankingan")}
          >
            Perankingan
          </button>
        </li>
        <li>
          <button
            className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition`}
            onClick={() => navigate("/dashboard/daftar-mapel")}
          >
            Daftar Mata Pelajaran
          </button>
        </li>
        <li>
          <button
            className={`block w-full text-left px-3 py-2 rounded-lg font-medium transition`}
            onClick={() => navigate("/dashboard/bobot-nilai")}
          >
            Pengaturan Bobot Nilai
          </button>
        </li>
      </ul>
    </aside>
  );
};

const Dashboard = () => {
  return (
    <div className="min-h-screen bg-green-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="profil" element={<ProfilePage />} />
            <Route path="perankingan" element={<Perankingan />} />
            <Route path="daftar-mapel" element={<DaftarMapel />} />
            <Route path="nilai-mapel" element={<NilaiMapel />} />
            <Route path="bobot-nilai" element={<BobotNilai />} />
            <Route path="*" element={<ProfilePage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
