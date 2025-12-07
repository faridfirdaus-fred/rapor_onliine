import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/useAuth";
import { API_URL } from "../services/api";
import * as XLSX from "xlsx";
import CustomAlert from "../components/CustomAlert";
import ConfirmDialog from "../components/ConfirmDialog";

const getRataRata = (nilaiHarian, uas, bobotHarian, bobotUas) => {
  const harianValid = nilaiHarian.filter(
    (n) => n !== null && n !== undefined && n !== ""
  );
  if (harianValid.length === 0 && !uas) return "0.00";

  const avgHarian =
    harianValid.length > 0
      ? harianValid.reduce((a, b) => a + Number(b), 0) / harianValid.length
      : 0;

  const nilaiAkhir = (avgHarian * bobotHarian + (uas || 0) * bobotUas) / 100;
  return nilaiAkhir.toFixed(2);
};

const NilaiMapel = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token } = useAuth();

  const mapel = location.state?.mapel || "Matematika";
  const kelasId = location.state?.kelasId;
  const namaKelas = location.state?.namaKelas;

  const [siswaList, setSiswaList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [jumlahKolomHarian, setJumlahKolomHarian] = useState(3);
  const [bobotNilai, setBobotNilai] = useState({
    bobotHarian: 40,
    bobotUas: 60,
  });
  const [showAddSiswaModal, setShowAddSiswaModal] = useState(false);
  const [newSiswa, setNewSiswa] = useState({ nisn: "", nama: "", noAbsen: "" });
  const [showEditSiswaModal, setShowEditSiswaModal] = useState(false);
  const [editingSiswa, setEditingSiswa] = useState(null);
  const [alert, setAlert] = useState({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });
  const [confirm, setConfirm] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Fetch siswa dan nilai
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch siswa
        const siswaResponse = await axios.get(`${API_URL}/siswa`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Fetch bobot nilai
        const bobotResponse = await axios
          .get(`${API_URL}/bobot-nilai/${kelasId}`, {
            headers: { Authorization: `Bearer ${token}` },
          })
          .catch(() => ({ data: { bobotHarian: 40, bobotUas: 60 } }));

        setBobotNilai({
          bobotHarian: bobotResponse.data.bobotHarian || 40,
          bobotUas: bobotResponse.data.bobotUas || 60,
        });

        // Fetch nilai untuk mata pelajaran ini
        const nilaiResponse = await axios.get(
          `${API_URL}/nilai?kelasId=${kelasId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Map siswa dengan nilai mereka
        const siswaWithNilai = siswaResponse.data.map((siswa) => {
          const nilaiSiswa = nilaiResponse.data.find(
            (n) => n.siswaId === siswa.id && n.mataPelajaran === mapel
          );

          let harianArray = [];
          if (nilaiSiswa && nilaiSiswa.nilaiHarian) {
            harianArray = [...nilaiSiswa.nilaiHarian];
            if (harianArray.length > jumlahKolomHarian) {
              setJumlahKolomHarian(harianArray.length);
            }
          }

          // Pad array to match jumlahKolomHarian
          while (harianArray.length < jumlahKolomHarian) {
            harianArray.push(null);
          }

          return {
            id: siswa.id,
            absen: siswa.noAbsen,
            nisn: siswa.nisn,
            nama: siswa.nama,
            harian: harianArray,
            uas: nilaiSiswa?.uas || null,
            nilaiId: nilaiSiswa?.id || null,
          };
        });

        // Sort by absen
        siswaWithNilai.sort((a, b) => a.absen - b.absen);
        setSiswaList(siswaWithNilai);
      } catch (error) {
        console.error("Error fetching data:", error);
        setAlert({
          isOpen: true,
          type: "error",
          title: "Gagal Memuat Data",
          message: "Gagal memuat data siswa dan nilai",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token && kelasId) {
      fetchData();
    }
  }, [token, kelasId, mapel, jumlahKolomHarian]);

  // Fungsi untuk menambah kolom harian
  const tambahKolom = () => {
    const kolomBaru = jumlahKolomHarian + 1;
    setJumlahKolomHarian(kolomBaru);
    setSiswaList((prev) =>
      prev.map((siswa) => ({
        ...siswa,
        harian: [...siswa.harian, null],
      }))
    );
  };

  // Fungsi untuk mengurangi kolom harian
  const kurangiKolom = () => {
    if (jumlahKolomHarian > 1) {
      const kolomBaru = jumlahKolomHarian - 1;
      setJumlahKolomHarian(kolomBaru);
      setSiswaList((prev) =>
        prev.map((siswa) => ({
          ...siswa,
          harian: siswa.harian.slice(0, kolomBaru),
        }))
      );
    }
  };

  // Fungsi untuk update nilai
  const updateNilai = (siswaIndex, type, kolomIndex = null, nilai) => {
    setSiswaList((prev) => {
      const newList = [...prev];
      if (type === "harian") {
        newList[siswaIndex].harian[kolomIndex] = nilai
          ? parseFloat(nilai)
          : null;
      } else if (type === "uas") {
        newList[siswaIndex].uas = nilai ? parseFloat(nilai) : null;
      }
      return newList;
    });
  };

  // Fungsi untuk menyimpan semua nilai
  const simpanNilai = async () => {
    try {
      setSaving(true);

      for (const siswa of siswaList) {
        const harianValid = siswa.harian.filter((n) => n !== null && n !== "");

        const nilaiData = {
          siswaId: siswa.id,
          kelasId: kelasId,
          mataPelajaran: mapel,
          nilaiHarian: harianValid.map((n) => parseFloat(n)),
          uas: siswa.uas ? parseFloat(siswa.uas) : 0,
          bobotHarian: bobotNilai.bobotHarian,
          bobotUas: bobotNilai.bobotUas,
        };

        if (siswa.nilaiId) {
          // Update existing
          await axios.put(`${API_URL}/nilai/${siswa.nilaiId}`, nilaiData, {
            headers: { Authorization: `Bearer ${token}` },
          });
        } else {
          // Create new
          await axios.post(`${API_URL}/nilai`, nilaiData, {
            headers: { Authorization: `Bearer ${token}` },
          });
        }
      }

      setAlert({
        isOpen: true,
        type: "success",
        title: "Berhasil!",
        message: "Data nilai berhasil disimpan!",
      });
      // Reload data setelah 1.5 detik
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error("Error saving nilai:", error);
      setAlert({
        isOpen: true,
        type: "error",
        title: "Gagal Menyimpan",
        message: `Gagal menyimpan nilai: ${
          error.response?.data?.error || error.message
        }`,
      });
    } finally {
      setSaving(false);
    }
  };

  // Fungsi untuk menambah siswa baru
  const handleAddSiswa = async () => {
    try {
      if (!newSiswa.nisn || !newSiswa.nama || !newSiswa.noAbsen) {
        setAlert({
          isOpen: true,
          type: "warning",
          title: "Peringatan",
          message: "Semua field harus diisi!",
        });
        return;
      }

      const response = await axios.post(
        `${API_URL}/siswa`,
        {
          nisn: newSiswa.nisn,
          nama: newSiswa.nama,
          noAbsen: parseInt(newSiswa.noAbsen),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Tambahkan siswa baru ke list dengan array harian kosong
      const siswaWithNilai = {
        id: response.data.id,
        absen: response.data.noAbsen,
        nisn: response.data.nisn,
        nama: response.data.nama,
        harian: Array(jumlahKolomHarian).fill(null),
        uas: null,
        nilaiId: null,
      };

      setSiswaList((prev) =>
        [...prev, siswaWithNilai].sort((a, b) => a.absen - b.absen)
      );
      setShowAddSiswaModal(false);
      setNewSiswa({ nisn: "", nama: "", noAbsen: "" });
      setAlert({
        isOpen: true,
        type: "success",
        title: "Berhasil!",
        message:
          "Siswa berhasil ditambahkan! Siswa akan tersedia di semua mata pelajaran kelas ini.",
      });
    } catch (error) {
      console.error("Error adding siswa:", error);
      setAlert({
        isOpen: true,
        type: "error",
        title: "Gagal Menambahkan",
        message: `Gagal menambahkan siswa: ${
          error.response?.data?.error || error.message
        }`,
      });
    }
  };

  // Handle edit siswa
  const handleEditSiswa = (siswa) => {
    setEditingSiswa({
      id: siswa.id,
      nisn: siswa.nisn,
      nama: siswa.nama,
      noAbsen: siswa.absen,
    });
    setShowEditSiswaModal(true);
  };

  // Handle update siswa
  const handleUpdateSiswa = async () => {
    try {
      if (!editingSiswa.nisn || !editingSiswa.nama || !editingSiswa.noAbsen) {
        setAlert({
          isOpen: true,
          type: "warning",
          title: "Peringatan",
          message: "Semua field harus diisi!",
        });
        return;
      }

      await axios.put(
        `${API_URL}/siswa/${editingSiswa.id}`,
        {
          nisn: editingSiswa.nisn,
          nama: editingSiswa.nama,
          noAbsen: parseInt(editingSiswa.noAbsen),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // Update siswa di list
      setSiswaList((prev) =>
        prev.map((s) =>
          s.id === editingSiswa.id
            ? {
                ...s,
                nisn: editingSiswa.nisn,
                nama: editingSiswa.nama,
                absen: parseInt(editingSiswa.noAbsen),
              }
            : s
        ).sort((a, b) => a.absen - b.absen)
      );

      setShowEditSiswaModal(false);
      setEditingSiswa(null);
      setAlert({
        isOpen: true,
        type: "success",
        title: "Berhasil!",
        message: "Data siswa berhasil diupdate!",
      });
    } catch (error) {
      console.error("Error updating siswa:", error);
      setAlert({
        isOpen: true,
        type: "error",
        title: "Gagal Update",
        message: `Gagal mengupdate siswa: ${
          error.response?.data?.error || error.message
        }`,
      });
    }
  };

  // Handle delete siswa
  const handleDeleteSiswa = (siswa) => {
    setConfirm({
      isOpen: true,
      title: "Hapus Siswa",
      message: `Apakah Anda yakin ingin menghapus siswa "${siswa.nama}"? Semua nilai siswa ini akan terhapus!`,
      onConfirm: async () => {
        try {
          await axios.delete(`${API_URL}/siswa/${siswa.id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          // Hapus siswa dari list
          setSiswaList((prev) => prev.filter((s) => s.id !== siswa.id));

          setAlert({
            isOpen: true,
            type: "success",
            title: "Berhasil!",
            message: "Siswa berhasil dihapus!",
          });
        } catch (error) {
          console.error("Error deleting siswa:", error);
          setAlert({
            isOpen: true,
            type: "error",
            title: "Gagal Hapus",
            message: `Gagal menghapus siswa: ${
              error.response?.data?.error || error.message
            }`,
          });
        }
      },
    });
  };

  // Export to Excel
  const exportToExcel = () => {
    const dataToExport = siswaList.map((siswa) => {
      const rowData = {
        "No Absen": siswa.absen,
        NISN: siswa.nisn,
        Nama: siswa.nama,
      };

      // Add nilai harian columns
      siswa.harian.forEach((nilai, index) => {
        rowData[`Harian ${index + 1}`] = nilai ?? "-";
      });

      rowData["UAS"] = siswa.uas ?? "-";
      rowData["Nilai Akhir"] = getRataRata(
        siswa.harian,
        siswa.uas,
        bobotNilai.bobotHarian,
        bobotNilai.bobotUas
      );

      return rowData;
    });

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, mapel);
    XLSX.writeFile(
      wb,
      `Nilai_${mapel}_${namaKelas}_${
        new Date().toISOString().split("T")[0]
      }.xlsx`
    );
  };

  // Import from Excel
  const importFromExcel = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = new Uint8Array(event.target.result);
        const workbook = XLSX.read(data, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Read with header option to ensure proper column mapping
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { 
          raw: false,  // Convert numbers to strings
          defval: ""   // Default value for empty cells
        });

        if (jsonData.length === 0) {
          setAlert({
            isOpen: true,
            type: "warning",
            title: "Peringatan",
            message: "File Excel kosong!",
          });
          return;
        }

        // Validate and import data
        let importedCount = 0;
        let errorCount = 0;
        const errors = [];

        const updatedSiswaList = [...siswaList];

        // Debug: Log raw data to see column names
        console.log("Raw Excel Data (first row):", jsonData[0]);
        console.log("Available columns:", Object.keys(jsonData[0] || {}));

        // Debug: Log siswa list for comparison
        console.log("Siswa di database:", updatedSiswaList.map(s => ({
          id: s.id,
          nisn: s.nisn,
          nama: s.nama,
          absen: s.absen
        })));
        
        console.log("Total siswa di database:", updatedSiswaList.length);

        console.log("Data dari Excel:", jsonData.map((row, i) => ({
          baris: i + 2,
          nisn: row.NISN,
          nama: row.Nama || row.nama,
          absen: row["No Absen"] || row.Absen
        })));
        
        console.log("Total data di Excel:", jsonData.length);

        // Track newly created siswa
        const newSiswaCreated = [];

        for (const [index, row] of jsonData.entries()) {
          try {
            // Normalize NISN and No Absen for comparison
            // Support both "Absen" and "No Absen" column names
            const rowNISN = String(row.NISN || "").trim();
            const rowNama = String(row.Nama || row.nama || "").trim();
            const rowAbsen = parseInt(row["No Absen"] || row["Absen"] || 0);

            if (!rowNISN || !rowNama) {
              errors.push(
                `Baris ${index + 2}: NISN dan Nama harus diisi`
              );
              errorCount++;
              continue;
            }

            // Find siswa by NISN or No Absen with flexible matching
            let siswaIndex = updatedSiswaList.findIndex((s) => {
              const dbNISN = String(s.nisn || "").trim();
              const dbAbsen = parseInt(s.absen);
              
              // Match by NISN (case-insensitive, trimmed)
              if (rowNISN && dbNISN && rowNISN === dbNISN) {
                return true;
              }
              
              // Match by No Absen
              if (!isNaN(rowAbsen) && rowAbsen > 0 && !isNaN(dbAbsen) && rowAbsen === dbAbsen) {
                return true;
              }
              
              return false;
            });

            // If siswa not found, create new one
            if (siswaIndex === -1) {
              try {
                // Determine noAbsen: use from Excel or auto-generate
                const noAbsen = rowAbsen > 0 
                  ? rowAbsen 
                  : Math.max(0, ...updatedSiswaList.map(s => s.absen)) + 1;

                // Create siswa via API
                const createResponse = await axios.post(
                  `${API_URL}/siswa`,
                  {
                    nisn: rowNISN,
                    nama: rowNama,
                    noAbsen: noAbsen,
                  },
                  { headers: { Authorization: `Bearer ${token}` } }
                );

                // Add to local list
                const newSiswa = {
                  id: createResponse.data.id,
                  absen: createResponse.data.noAbsen,
                  nisn: createResponse.data.nisn,
                  nama: createResponse.data.nama,
                  harian: Array(jumlahKolomHarian).fill(null),
                  uas: null,
                  nilaiId: null,
                };

                updatedSiswaList.push(newSiswa);
                siswaIndex = updatedSiswaList.length - 1;
                newSiswaCreated.push(rowNama);

                console.log(`✅ Siswa baru dibuat: ${rowNama} (NISN: ${rowNISN})`);
              } catch (createError) {
                errors.push(
                  `Baris ${index + 2}: Gagal membuat siswa ${rowNama} - ${createError.response?.data?.error || createError.message}`
                );
                errorCount++;
                continue;
              }
            }

            // Extract nilai harian
            const harianValues = [];
            for (let i = 1; i <= jumlahKolomHarian; i++) {
              const key = `Harian ${i}`;
              if (row[key] !== undefined && row[key] !== "-" && row[key] !== "") {
                const nilai = parseFloat(row[key]);
                if (!isNaN(nilai) && nilai >= 0 && nilai <= 100) {
                  harianValues.push(nilai);
                } else {
                  harianValues.push(null);
                }
              } else {
                harianValues.push(null);
              }
            }

            // Extract UAS
            let uasValue = null;
            if (row.UAS !== undefined && row.UAS !== "-" && row.UAS !== "") {
              const uas = parseFloat(row.UAS);
              if (!isNaN(uas) && uas >= 0 && uas <= 100) {
                uasValue = uas;
              }
            }

            // Update siswa data with nilai
            updatedSiswaList[siswaIndex].harian = harianValues;
            updatedSiswaList[siswaIndex].uas = uasValue;
            importedCount++;
          } catch (err) {
            errors.push(`Baris ${index + 2}: ${err.message}`);
            errorCount++;
          }
        }

        setSiswaList(updatedSiswaList);

        // Show result with info about new siswa
        if (importedCount > 0 || newSiswaCreated.length > 0) {
          let message = "";
          if (newSiswaCreated.length > 0) {
            message += `✨ ${newSiswaCreated.length} siswa baru dibuat: ${newSiswaCreated.join(", ")}. `;
          }
          if (importedCount > 0) {
            message += `📊 Berhasil import ${importedCount} data nilai.`;
          }
          message += ` Jangan lupa klik "Simpan Semua Nilai"!`;

          setAlert({
            isOpen: true,
            type: errorCount > 0 ? "warning" : "success",
            title: errorCount > 0 ? "Import Selesai dengan Peringatan" : "Berhasil!",
            message: message + (errorCount > 0 ? ` ${errorCount} data gagal.` : ""),
          });
        } else {
          setAlert({
            isOpen: true,
            type: "error",
            title: "Gagal Import",
            message: `Tidak ada data yang berhasil di-import. ${errors.slice(0, 3).join(", ")}`,
          });
        }

        // Reset file input
        e.target.value = "";
      } catch (error) {
        console.error("Error importing Excel:", error);
        setAlert({
          isOpen: true,
          type: "error",
          title: "Gagal Import",
          message: `Gagal membaca file Excel: ${error.message}`,
        });
        e.target.value = "";
      }
    };

    reader.readAsArrayBuffer(file);
  };

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 min-h-screen bg-green-50">
      <div className="flex items-center mb-6">
        <button
          onClick={() => navigate("/dashboard/daftar-mapel")}
          className="mr-4 px-3 py-1 bg-gray-500 text-white rounded hover:bg-gray-600 transition"
        >
          ← Kembali
        </button>
        <div>
          <h2 className="text-2xl font-semibold">{mapel}</h2>
          <p className="text-sm text-gray-600">{namaKelas}</p>
        </div>
      </div>

      {/* Kontrol Kolom */}
      <div className="mb-4 bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium text-gray-800">
              Pengaturan Kolom Nilai Harian
            </h3>
            <p className="text-sm text-gray-600">
              Jumlah kolom: {jumlahKolomHarian} | Bobot: Harian{" "}
              {bobotNilai.bobotHarian}% - UAS {bobotNilai.bobotUas}%
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={kurangiKolom}
              disabled={jumlahKolomHarian <= 1}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600 
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              - Kurangi
            </button>
            <button
              onClick={tambahKolom}
              disabled={jumlahKolomHarian >= 8}
              className="px-3 py-1 bg-green-500 text-white rounded text-sm hover:bg-green-600 
                       disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              + Tambah
            </button>
          </div>
        </div>
      </div>

      {/* Tombol Tambah Siswa, Import dan Export */}
      <div className="mb-4 flex justify-end gap-3">
        <label className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors flex items-center gap-2 cursor-pointer">
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          Import Excel
          <input
            type="file"
            accept=".xlsx,.xls"
            onChange={importFromExcel}
            className="hidden"
          />
        </label>
        <button
          onClick={exportToExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Export Excel
        </button>
        <button
          onClick={() => setShowAddSiswaModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          Tambah Siswa
        </button>
      </div>

      {siswaList.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Tidak ada siswa di kelas ini</p>
          <button
            onClick={() => setShowAddSiswaModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Tambah Siswa Pertama
          </button>
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-lg shadow">
              <thead>
                <tr className="bg-green-100">
                  <th className="px-4 py-2 border">No Absen</th>
                  <th className="px-4 py-2 border">NISN</th>
                  <th className="px-4 py-2 border">Nama</th>
                  <th className="px-4 py-2 border" colSpan={jumlahKolomHarian}>
                    Nilai Harian
                  </th>
                  <th className="px-4 py-2 border">UAS</th>
                  <th className="px-4 py-2 border">Nilai Akhir</th>
                  <th className="px-4 py-2 border">Aksi</th>
                </tr>
                <tr className="bg-green-50">
                  <th className="border"></th>
                  <th className="border"></th>
                  <th className="border"></th>
                  {Array.from({ length: jumlahKolomHarian }, (_, i) => (
                    <th key={i} className="px-4 py-2 border text-sm">
                      {i + 1}
                    </th>
                  ))}
                  <th className="border"></th>
                  <th className="border"></th>
                  <th className="border"></th>
                </tr>
              </thead>
              <tbody>
                {siswaList.map((siswa, siswaIndex) => (
                  <tr key={siswa.id} className="border-b hover:bg-gray-50">
                    <td className="px-4 py-2 text-center border">
                      {siswa.absen}
                    </td>
                    <td className="px-4 py-2 text-center border">
                      {siswa.nisn}
                    </td>
                    <td className="px-4 py-2 border">{siswa.nama}</td>
                    {Array.from(
                      { length: jumlahKolomHarian },
                      (_, kolomIndex) => (
                        <td
                          key={kolomIndex}
                          className="px-2 py-2 text-center border"
                        >
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.1"
                            value={siswa.harian[kolomIndex] ?? ""}
                            onChange={(e) =>
                              updateNilai(
                                siswaIndex,
                                "harian",
                                kolomIndex,
                                e.target.value
                              )
                            }
                            className="w-16 px-2 py-1 border rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="-"
                          />
                        </td>
                      )
                    )}
                    <td className="px-2 py-2 text-center border">
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={siswa.uas ?? ""}
                        onChange={(e) =>
                          updateNilai(siswaIndex, "uas", null, e.target.value)
                        }
                        className="w-16 px-2 py-1 border rounded text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        placeholder="-"
                      />
                    </td>
                    <td className="px-4 py-2 text-center border font-medium">
                      {getRataRata(
                        siswa.harian,
                        siswa.uas,
                        bobotNilai.bobotHarian,
                        bobotNilai.bobotUas
                      )}
                    </td>
                    <td className="px-2 py-2 text-center border">
                      <div className="flex gap-1 justify-center">
                        <button
                          onClick={() => handleEditSiswa(siswa)}
                          className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 rounded text-xs font-semibold transition duration-200"
                          title="Edit data siswa"
                        >
                          ✏️
                        </button>
                        <button
                          onClick={() => handleDeleteSiswa(siswa)}
                          className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-xs font-semibold transition duration-200"
                          title="Hapus siswa"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 transition-colors"
            >
              Reset
            </button>
            <button
              onClick={simpanNilai}
              disabled={saving}
              className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {saving ? "Menyimpan..." : "Simpan Data"}
            </button>
          </div>
        </>
      )}

      {/* Informasi */}
      <div className="mt-4 bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-2">Informasi</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Masukkan nilai 0-100 (desimal diperbolehkan)</li>
          <li>• Kolom kosong tidak akan dihitung dalam rata-rata</li>
          <li>• Maksimal 8 kolom nilai harian</li>
          <li>• Nilai akhir dihitung berdasarkan bobot yang ditentukan</li>
          <li>• Klik "Simpan Data" untuk menyimpan semua perubahan</li>
          <li>
            • Siswa yang ditambahkan akan otomatis tersedia di semua mata
            pelajaran kelas ini
          </li>
        </ul>
      </div>

      {/* Modal Tambah Siswa */}
      {showAddSiswaModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Tambah Siswa Baru
              </h3>
              <button
                onClick={() => {
                  setShowAddSiswaModal(false);
                  setNewSiswa({ nisn: "", nama: "", noAbsen: "" });
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
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
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NISN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSiswa.nisn}
                  onChange={(e) =>
                    setNewSiswa({ ...newSiswa, nisn: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan NISN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newSiswa.nama}
                  onChange={(e) =>
                    setNewSiswa({ ...newSiswa, nama: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Absen <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={newSiswa.noAbsen}
                  onChange={(e) =>
                    setNewSiswa({ ...newSiswa, noAbsen: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Masukkan no. absen"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  <strong>Info:</strong> Siswa yang ditambahkan akan otomatis
                  tersedia di semua mata pelajaran untuk {namaKelas}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowAddSiswaModal(false);
                  setNewSiswa({ nisn: "", nama: "", noAbsen: "" });
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleAddSiswa}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Tambah Siswa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Edit Siswa */}
      {showEditSiswaModal && editingSiswa && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Edit Data Siswa
              </h3>
              <button
                onClick={() => {
                  setShowEditSiswaModal(false);
                  setEditingSiswa(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  className="w-6 h-6"
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
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  NISN <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingSiswa.nisn}
                  onChange={(e) =>
                    setEditingSiswa({ ...editingSiswa, nisn: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Masukkan NISN"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Lengkap <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editingSiswa.nama}
                  onChange={(e) =>
                    setEditingSiswa({ ...editingSiswa, nama: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. Absen <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  min="1"
                  value={editingSiswa.noAbsen}
                  onChange={(e) =>
                    setEditingSiswa({ ...editingSiswa, noAbsen: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  placeholder="Masukkan no. absen"
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Perhatian:</strong> Perubahan data siswa akan mempengaruhi semua mata pelajaran di {namaKelas}
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditSiswaModal(false);
                  setEditingSiswa(null);
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Batal
              </button>
              <button
                onClick={handleUpdateSiswa}
                className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                Update Data
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Custom Alert */}
      <CustomAlert
        isOpen={alert.isOpen}
        onClose={() => setAlert({ ...alert, isOpen: false })}
        type={alert.type}
        title={alert.title}
        message={alert.message}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={confirm.isOpen}
        onClose={() => setConfirm({ ...confirm, isOpen: false })}
        onConfirm={confirm.onConfirm}
        title={confirm.title}
        message={confirm.message}
      />
    </div>
  );
};

export default NilaiMapel;
