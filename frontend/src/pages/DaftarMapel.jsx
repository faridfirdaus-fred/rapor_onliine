import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/useAuth";

// Fungsi untuk mendapatkan inisial mata pelajaran
const getInitials = (mapel) => {
  return mapel
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();
};

// Warna background untuk inisial
const backgroundColors = [
  "bg-blue-600",
  "bg-green-600",
  "bg-purple-600",
  "bg-orange-600",
  "bg-indigo-600",
  "bg-teal-600",
];

const DaftarNilaiMapel = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();
  const [mapelList, setMapelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [kelas, setKelas] = useState(null);
  const [error, setError] = useState(null);

  // Fetch mata pelajaran dari API
  useEffect(() => {
    const fetchMapelData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get("http://localhost:5000/api/mata-pelajaran", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setKelas(response.data.kelas);
        setMapelList(response.data.mataPelajaran);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Gagal memuat data mata pelajaran");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchMapelData();
    }
  }, [token]);

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-gray-600">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-green-50">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Daftar Mata Pelajaran
        </h2>
        <p className="text-gray-600">
          Kelas {kelas?.nama} - {user?.name}
        </p>
      </div>

      {mapelList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Tidak ada mata pelajaran
          </h3>
          <p className="text-gray-500">
            Belum ada mata pelajaran yang ditetapkan untuk kelas ini
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {mapelList.map((mapel, idx) => (
            <div
              key={idx}
              className="bg-white rounded-lg shadow border p-6 flex flex-col 
                       hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex items-center mb-4">
                <div
                  className={`${
                    backgroundColors[idx % backgroundColors.length]
                  } 
                               w-12 h-12 rounded-lg flex items-center justify-center mr-4`}
                >
                  <span className="text-white font-semibold text-lg">
                    {getInitials(mapel.nama)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 mb-1">{mapel.nama}</h3>
                  <p className="text-sm text-gray-500">{kelas?.nama}</p>
                  {mapel.jumlahNilai > 0 && (
                    <p className="text-xs text-green-600 mt-1">
                      {mapel.jumlahNilai} nilai tersimpan
                    </p>
                  )}
                </div>
              </div>
              <button
                className="mt-auto px-4 py-2 bg-green-600 text-white rounded 
                         hover:bg-green-700 transition-colors text-sm font-medium"
                onClick={() =>
                  navigate("/dashboard/nilai-mapel", { 
                    state: { 
                      mapel: mapel.nama,
                      kelasId: kelas.id,
                      namaKelas: kelas.nama
                    } 
                  })
                }
              >
                Kelola Nilai
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Info tambahan */}
      <div className="mt-6 bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-2">Informasi</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Klik "Kelola Nilai" untuk memasukkan nilai siswa</li>
          <li>• Atur bobot nilai di menu "Pengaturan Bobot Nilai"</li>
        </ul>
      </div>
    </div>
  );
};

export default DaftarNilaiMapel;
