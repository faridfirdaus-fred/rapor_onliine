import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Routes, Route, useNavigate } from "react-router-dom";
import DaftarMapel from "./DaftarMapel";
import Perankingan from "./perankingan";
import NilaiMapel from "./NilaiMapel";
import BobotNilai from "./BobotNilai";

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

const ProfilGuru = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    subject: user?.subject || "",
  });
  const [photoFile, setPhotoFile] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhotoFile(file);
    }
  };

  const handleSave = () => {
    // Simulasi save data (nanti akan terhubung dengan backend)
    console.log("Saving profile data:", editData);
    if (photoFile) {
      console.log("Uploading photo:", photoFile);
    }
    setIsEditing(false);
    alert("Profil berhasil diperbarui!");
  };

  const handleCancel = () => {
    setEditData({
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      subject: user?.subject || "",
    });
    setPhotoFile(null);
    setIsEditing(false);
  };

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Profil Guru</h2>
          <p className="text-gray-600">Kelola informasi profil pribadi Anda</p>
        </div>

        <div className="w-full">
          {/* Profile Card */}
          <div className="w-full">
            <div className="bg-white rounded-xl shadow-sm border p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-800">
                  Informasi Pribadi
                </h3>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg
                      className="w-4 h-4 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Profil
                  </button>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Simpan
                    </button>
                    <button
                      onClick={handleCancel}
                      className="flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                    >
                      <svg
                        className="w-4 h-4 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                      Batal
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col md:flex-row gap-6">
                {/* Photo Section */}
                <div className="shrink-0">
                  <div className="relative">
                    <img
                      src={
                        photoFile
                          ? URL.createObjectURL(photoFile)
                          : user?.photo ||
                            "https://ui-avatars.com/api/?name=" +
                              encodeURIComponent(editData.name) +
                              "&background=2563eb&color=fff&size=200"
                      }
                      alt="Foto Profil"
                      className="w-32 h-32 rounded-full object-cover border-4 border-blue-200 shadow-lg"
                    />
                    {isEditing && (
                      <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoChange}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={editData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Masukkan nama lengkap"
                      />
                    ) : (
                      <p className="text-gray-900 font-medium">
                        {editData.name || "-"}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="email@example.com"
                      />
                    ) : (
                      <p className="text-gray-900">{editData.email || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      No. Telepon
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={editData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="08xxxxxxxxxx"
                      />
                    ) : (
                      <p className="text-gray-900">{editData.phone || "-"}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Mata Pelajaran
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="subject"
                        value={editData.subject}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Matematika, Fisika"
                      />
                    ) : (
                      <p className="text-gray-900">{editData.subject || "-"}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const DummyContent = ({ title }) => (
  <section>
    <h2 className="text-2xl font-semibold mb-4">{title}</h2>
    <div className="bg-white rounded-lg shadow p-6 max-w-md">
      <p>Konten {title} akan ditampilkan di sini.</p>
    </div>
  </section>
);

const Dashboard = () => {
  // Data dummy untuk preview
  const user = {
    name: "Dr. Ahmad Wijaya, S.Pd, M.Pd",
    email: "ahmad.wijaya@smp-negeri1.sch.id",
    phone: "081234567890",
    subject: "Matematika, Fisika",
    kelas: "Kelas 7A, 7B, 8A",
    photo: null,
  };

  return (
    <div className="min-h-screen bg-blue-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-8">
          <Routes>
            <Route path="profil" element={<ProfilGuru user={user} />} />
            <Route path="perankingan" element={<Perankingan />} />
            <Route path="daftar-mapel" element={<DaftarMapel />} />
            <Route path="nilai-mapel" element={<NilaiMapel />} />
            <Route path="bobot-nilai" element={<BobotNilai />} />
            <Route path="*" element={<ProfilGuru user={user} />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
