import React, { useState, useEffect } from 'react';
import { Route, Routes, Outlet, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faCalendarDays, faSliders, faBookMedical, faUserGroup, faSun } from '@fortawesome/free-solid-svg-icons';

import ThongKe from '../../NhomChucNang/LichKhamBenh/Menu/ThongKe';
import LichKham from '../../NhomChucNang/LichKhamBenh/Menu/LichKham';
import ThietLap from '../../NhomChucNang/LichKhamBenh/Menu/ThietLap';
import HoSoDangKy from '../../NhomChucNang/LichKhamBenh/Menu/HoSoDangKy';
import ThayTheBacSi from '../../NhomChucNang/LichKhamBenh/Menu/ThayTheBacSi';
import ThongTinLichKhamBenh from '../../NhomChucNang/LichKhamBenh/ThongTinLichKhamBenh';
import DichVuBacSi from '../../NhomChucNang/LichKhamBenh/ThietLap/DichVuBacSi';
import ThongTinNgayKham from '../../NhomChucNang/LichKhamBenh/ThongTinNgayKham';
import LichKhamBenhTheoNgay from '../../NhomChucNang/LichKhamBenh/ThietLap/DichVuBacSi/LichKhamBenhTheoNgay';
import NotFound from '../../NotFound';
import XacNhanLichKham from '../../NhomChucNang/LichKhamBenh/HoSoDangKy/XacNhanLichKham';
import ChiTietLichKham from '../../NhomChucNang/LichKhamBenh/HoSoDangKy/ChiTietLichKham';

// Config cho tab
const tabConfig = [
    { id: 'HoSoDangKy', name: 'Hồ sơ đăng ký', icon: faBookMedical, path: 'ho-so-dang-ky' },
    { id: 'ThietLap', name: 'Thiết lập', icon: faSliders, path: 'thiet-lap' },
    { id: 'ThayTheBacSi', name: 'Thay thế bác sĩ', icon: faUserGroup, path: 'thay-the-bac-si' },
    { id: 'NgayNghi', name: 'Ngày nghỉ', icon: faSun, path: 'ngay-nghi' },
];
// Component hiển thị menu tab
function TabMenu({ selectedTab, setSelectedTab }) {
    const navigate = useNavigate();
    return (
        <div className="bg-white flex justify-start space-x-4 w-full rounded text-gray-700 shadow">
            {tabConfig.map((tab, index) => (
                <button
                    key={index}
                    onClick={() => {
                        setSelectedTab(tab.id);
                        navigate(`/lich-kham-benh/${tab.path}`);
                    }}
                    className={`py-2 px-4 font-bold rounded ${tab.id === selectedTab ? 'text-blue-600 border border-blue-600 hover:bg-slate-100' : 'hover:bg-blue-700 hover:text-white'}`}
                >
                    <FontAwesomeIcon icon={tab.icon} /> &nbsp;&nbsp;{tab.name}
                </button>
            ))}
        </div>
    );
}
function App() {
    const [selectedTab, setSelectedTab] = useState('HoSoDangKy');
    const location = useLocation();

    // Cập nhật selectedTab khi URL thay đổi
    useEffect(() => {
        const currentTab = tabConfig.find(tab => `/lich-kham-benh/${tab.path}` === location.pathname);
        if (currentTab) {
            setSelectedTab(currentTab.id);
        }
    }, [location]);

    return (
        <div className="w-full min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-2 px-3 py-3 w-full rounded text-left font-bold sticky top-0 z-10">
                <h1>QUẢN LÝ THÔNG TIN LỊCH KHÁM BỆNH</h1>
            </div>

            {/* Tab menu */}
            <div className="sticky top-[48px] z-10">
                <TabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            </div>

            {/* Content */}
            <div className="flex-1 bg-white mt-4 p-4 rounded shadow w-full">
                <Routes>
                    <Route index element={<HoSoDangKy/>} />

                    <Route path="ho-so-dang-ky" element={<HoSoDangKy />}>
                        <Route path="xac-nhan/:appointmentId" element={<XacNhanLichKham />} />
                        <Route path="chi-tiet/:appointmentId" element={<ChiTietLichKham />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>

                    {/* <Route path='lich-kham' element={<LichKham />}>
                        <Route index element={<Navigate to="2" replace />} />

                        <Route path=':day' element={<ThongTinNgayKham />} >

                        </Route>

                        <Route path="*" element={<NotFound />} />
                    </Route> */}

                    <Route path='thiet-lap' element={<ThietLap />} >
                        <Route path=':doctorId' element={<DichVuBacSi />} >
                            <Route index element={<Navigate to="2" replace />} />
                            <Route path=':day' element={<LichKhamBenhTheoNgay />} />
                        </Route>
                        <Route path="*" element={<NotFound />} />
                    </Route>

                    <Route path='thay-the-bac-si' element={<ThayTheBacSi />} />

                    <Route path="*" element={<NotFound />} />
                </Routes>

                <Outlet />
            </div>
        </div>
    );
}
export default App;