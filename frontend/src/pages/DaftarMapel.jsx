import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
  const [mapelList, setMapelList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [guru, setGuru] = useState(null);

  // Simulasi data dari database/API
  useEffect(() => {
    const fetchMapelData = async () => {
      try {
        // Simulasi delay API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        // Data dummy berdasarkan guru yang login (nanti diganti dengan API call)
        const guruData = {
          nama: "Budi Santoso",
          kelas: "7A",
          mapel: ["Matematika", "IPA", "Fisika"],
        };

        setGuru(guruData);
        setMapelList(guruData.mapel);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        // Fallback data jika API error
        setMapelList(["Matematika", "IPA"]);
        setLoading(false);
      }
    };

    fetchMapelData();
  }, []);

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-blue-50">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">
          Daftar Mata Pelajaran
        </h2>
        <p className="text-gray-600">
          Mata pelajaran yang diampu oleh {guru?.nama} - Kelas {guru?.kelas}
        </p>
      </div>

      {mapelList.length === 0 ? (
        <div className="text-center py-12">
          <h3 className="text-lg font-medium text-gray-700 mb-2">
            Tidak ada mata pelajaran
          </h3>
          <p className="text-gray-500">
            Belum ada mata pelajaran yang ditetapkan untuk akun ini
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
                    {getInitials(mapel)}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-1">{mapel}</h3>
                  <p className="text-sm text-gray-500">Kelas {guru?.kelas}</p>
                </div>
              </div>
              <button
                className="mt-auto px-4 py-2 bg-blue-600 text-white rounded 
                         hover:bg-blue-700 transition-colors text-sm font-medium"
                onClick={() =>
                  navigate("/dashboard/nilai-mapel", { state: { mapel } })
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
