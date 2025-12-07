import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "../contexts/useAuth";
import { API_URL } from "../services/api";
import CustomAlert from "../components/CustomAlert";

const BobotNilai = () => {
  const { token, user } = useAuth();
  const [bobotHarian, setBobotHarian] = useState(40);
  const [bobotUAS, setBobotUAS] = useState(60);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  // Fetch bobot nilai saat halaman dimuat
  useEffect(() => {
    const fetchBobotNilai = async () => {
      if (!token || !user?.kelasId) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get(
          `${API_URL}/bobot-nilai/${user.kelasId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data) {
          setBobotHarian(response.data.bobotHarian || 40);
          setBobotUAS(response.data.bobotUas || 60);
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching bobot nilai:", error);
        // Jika belum ada data, gunakan default
        setLoading(false);
      }
    };

    fetchBobotNilai();
  }, [token, user]);

  const handleSave = async () => {
    // Validasi total bobot harus 100%
    if (bobotHarian + bobotUAS !== 100) {
      setAlert({
        isOpen: true,
        type: "warning",
        title: "Peringatan",
        message: "Total bobot harus 100%!",
      });
      return;
    }

    if (!user?.kelasId) {
      setAlert({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Kelas tidak ditemukan!",
      });
      return;
    }

    try {
      setSaving(true);
      await axios.post(
        `${API_URL}/bobot-nilai/${user.kelasId}`,
        {
          bobotHarian: bobotHarian,
          bobotUas: bobotUAS,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setIsEditing(false);
      setAlert({
        isOpen: true,
        type: "success",
        title: "Berhasil!",
        message: "Bobot nilai berhasil disimpan dan akan diterapkan ke semua nilai!",
      });
    } catch (error) {
      console.error("Error saving bobot nilai:", error);
      setAlert({
        isOpen: true,
        type: "error",
        title: "Gagal",
        message: error.response?.data?.error || "Gagal menyimpan bobot nilai!",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setBobotHarian(40);
    setBobotUAS(60);
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data bobot nilai...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-green-50">
      <h2 className="text-2xl font-semibold mb-6">Pengaturan Bobot Nilai</h2>

      <div className="bg-white rounded-lg shadow p-8 max-w-2xl mx-auto">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4">Atur Bobot Penilaian</h3>
          <p className="text-gray-600 mb-6">
            Tentukan persentase bobot untuk setiap komponen penilaian. Total
            harus 100%.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800">
              ℹ️ Perubahan bobot akan diterapkan ke semua nilai yang sudah ada di kelas ini.
            </p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Bobot Nilai Harian */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">📝</span>
              </div>
              <div>
                <h4 className="font-semibold text-lg">Nilai Harian</h4>
                <p className="text-gray-600 text-sm">
                  Tugas, kuis, dan penilaian harian
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <input
                  type="text"
                  inputMode="numeric"
                  value={bobotHarian}
                  onChange={(e) => {
                    const value = e.target.value.replace(/^0+/, "") || "0";
                    const numValue = parseInt(value);
                    if (value === "" || (numValue >= 0 && numValue <= 100)) {
                      setBobotHarian(value === "" ? 0 : numValue);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") setBobotHarian(0);
                  }}
                  className="w-20 px-3 py-2 border-2 border-green-500 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-600"
                  maxLength="3"
                />
              ) : (
                <span className="text-2xl font-bold text-green-600">
                  {bobotHarian}
                </span>
              )}
              <span className="text-lg font-medium">%</span>
            </div>
          </div>

          {/* Bobot UAS */}
          <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">📊</span>
              </div>
              <div>
                <h4 className="font-semibold text-lg">
                  Ujian Akhir Semester (UAS)
                </h4>
                <p className="text-gray-600 text-sm">
                  Penilaian akhir semester
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              {isEditing ? (
                <input
                  type="text"
                  inputMode="numeric"
                  value={bobotUAS}
                  onChange={(e) => {
                    const value = e.target.value.replace(/^0+/, "") || "0";
                    const numValue = parseInt(value);
                    if (value === "" || (numValue >= 0 && numValue <= 100)) {
                      setBobotUAS(value === "" ? 0 : numValue);
                    }
                  }}
                  onBlur={(e) => {
                    if (e.target.value === "") setBobotUAS(0);
                  }}
                  className="w-20 px-3 py-2 border-2 border-green-500 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-green-600"
                  maxLength="3"
                />
              ) : (
                <span className="text-2xl font-bold text-green-600">
                  {bobotUAS}
                </span>
              )}
              <span className="text-lg font-medium">%</span>
            </div>
          </div>

          {/* Total Bobot */}
          <div className="p-4 bg-gray-100 rounded-lg border-2 border-dashed">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-lg">Total Bobot</h4>
              <div className="flex items-center space-x-3">
                <span
                  className={`text-2xl font-bold ${
                    bobotHarian + bobotUAS === 100
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {bobotHarian + bobotUAS}
                </span>
                <span className="text-lg font-medium">%</span>
              </div>
            </div>
            {bobotHarian + bobotUAS !== 100 && (
              <p className="text-red-600 text-sm mt-2">
                ⚠️ Total bobot harus 100%
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 mt-8">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition"
                disabled={saving}
              >
                Batal
              </button>
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
                disabled={saving}
              >
                Reset
              </button>
              <button
                onClick={handleSave}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center space-x-2"
                disabled={saving}
              >
                {saving && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                <span>{saving ? "Menyimpan..." : "Simpan"}</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
            >
              Edit Bobot
            </button>
          )}
        </div>
      </div>

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
      />
    </div>
  );
};

export default BobotNilai;
