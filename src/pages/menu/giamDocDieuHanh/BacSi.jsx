import React, { useState, useEffect } from 'react';
import { Route, Routes, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faUsers, faDna, faUserDoctor } from '@fortawesome/free-solid-svg-icons';

import DanhSach from '../../NhomChucNang/BacSi/DanhSach';
import ThongKe from '../../NhomChucNang/BacSi/ThongKe';
import ChuyenKhoa from '../../NhomChucNang/BacSi/ChuyenKhoa';
import NghiPhep from '../../NhomChucNang/BacSi/NghiPhep';
import NotFound from '../../NotFound';
import ThongTinBacSi from '../../NhomChucNang/BacSi/ThongTinBacSi';
import ThongTinChuyenKhoa from '../../NhomChucNang/BacSi/ThongTinChuyenKhoa';
import LichKhamBenhTheoNgay from '../../NhomChucNang/BacSi/ThongTinBacSi/LichKhamBenhTheoNgay';

// Config cho tab
const tabConfig = [
  { id: 'DanhSach', name: 'Danh sách', icon: faUsers, path: 'danh-sach' },
  { id: 'ChuyenKhoa', name: 'Chuyên khoa', icon: faDna, path: 'chuyen-khoa' },
  { id: 'NghiPhep', name: 'Nghỉ phép', icon: faUserDoctor, path: 'nghi-phep' },
];

// Component hiển thị menu tab
function TabMenu({ selectedTab, setSelectedTab }) {
  const navigate = useNavigate();

  return (
    <div className="bg-slate-100 flex justify-start space-x-4 w-full rounded text-gray-700 shadow">
      {tabConfig.map((tab, index) => (
        <button
          key={index}
          onClick={() => {
            setSelectedTab(tab.id);
            navigate(`/bac-si/${tab.path}`);
          }}
          className={`py-2 px-4 font-bold rounded ${tab.id === selectedTab ? 'text-blue-600 border border-blue-600 hover:bg-slate-100' : 'hover:bg-blue-700 hover:text-white'}`}
        >
          <FontAwesomeIcon icon={tab.icon} /> &nbsp;&nbsp;{tab.name}
        </button>
      ))}
    </div>
  );
}

function BacSi() {
  const [selectedTab, setSelectedTab] = useState('DanhSach');
  const location = useLocation();
  const navigate = useNavigate();

  // Cập nhật selectedTab khi URL thay đổi
  useEffect(() => {
    const currentTab = tabConfig.find(tab => `/bac-si/${tab.path}` === location.pathname);
    if (currentTab) {
      setSelectedTab(currentTab.id);
    }
  }, [location]);

  return (
    <div className="w-full min-h-screen flex flex-col">
      {/* Header */}
      <div className="bg-blue-600 text-white p-2 px-3 py-3 w-full rounded text-left font-bold sticky top-0 z-10">
        <h1>QUẢN LÝ THÔNG TIN BÁC SĨ</h1>
      </div>

      {/* Tab menu */}
      <div className="sticky top-[48px] z-10">
        <TabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
      </div>


      {/* Content */}
      <div className="flex-1 bg-white mt-4 p-4 rounded shadow w-full">
        <Routes>
          <Route index element={<DanhSach />} />
          <Route path='danh-sach' element={<DanhSach />}>
            <Route path=':doctorId' element={<ThongTinBacSi />}>
              <Route index element={<Navigate to="2" replace />} />
              <Route path=':day' element={<LichKhamBenhTheoNgay />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path='chuyen-khoa' element={<ChuyenKhoa />}>
            <Route path=':specialtyId' element={<ThongTinChuyenKhoa />} />
            <Route path="*" element={<NotFound />} />
          </Route>
          <Route path='nghi-phep' element={<NghiPhep />} />
          <Route path="*" element={<NotFound />} />
        </Routes>

        <Outlet />
      </div>
    </div>
  );
}

export default BacSi;
