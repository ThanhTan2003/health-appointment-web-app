import React, { useState, useEffect } from 'react';
import { Route, Routes, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faUsersGear, faUserGroup } from '@fortawesome/free-solid-svg-icons';

import ThongKe from '../../NhomChucNang/TaiKhoan/ThongKe';
import DanhSachTaiKhoanHeThong from '../../NhomChucNang/TaiKhoan/DanhSachTaiKhoanHeThong';
import ThongTinTaiKhoanHeThong from '../../NhomChucNang/TaiKhoan/ThongTinTaiKhoanHeThong';
import NotFound from '../../NotFound';
import DanhSachTaiKhoanDatLich from '../../NhomChucNang/TaiKhoan/DanhSachTaiKhoanDatLich';
import ThongTinTaiKhoanDatLich from '../../NhomChucNang/TaiKhoan/ThongTinTaiKhoanDatLich';

// Config cho tab
const tabConfig = [
    { id: 'DanhSachTaiKhoanHeThong', name: 'Tài khoản hệ thống', icon: faUsersGear, path: 'tai-khoan-he-thong' },
    { id: 'DanhSachTaiKhoanDatLich', name: 'Tài khoản đặt lịch', icon: faUserGroup, path: 'tai-khoan-dat-lich' },
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
                        navigate(`/tai-khoan/${tab.path}`);
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
    const [selectedTab, setSelectedTab] = useState('DanhSachTaiKhoanHeThong');
    const location = useLocation();

    // Cập nhật selectedTab khi URL thay đổi
    useEffect(() => {
        const currentTab = tabConfig.find(tab => `/tai-khoan/${tab.path}` === location.pathname);
        if (currentTab) {
            setSelectedTab(currentTab.id);
        }
    }, [location]);

    return (
        <div className="w-full min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-blue-600 text-white p-2 px-3 py-3 w-full rounded text-left font-bold sticky top-0 z-10">
                <h1>QUẢN LÝ THÔNG TIN TÀI KHOẢN</h1>
            </div>

            {/* Tab menu */}
            <div className="sticky top-[48px] z-10">
                <TabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            </div>

            {/* Content */}
            <div className="flex-1 bg-white mt-4 p-4 rounded shadow w-full">
                <Routes>
                    <Route index element={<DanhSachTaiKhoanHeThong />} />
                    <Route path='tai-khoan-he-thong' element={<DanhSachTaiKhoanHeThong />}>
                        <Route path=':accountId' element={<ThongTinTaiKhoanHeThong />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                    <Route path='tai-khoan-dat-lich' element={<DanhSachTaiKhoanDatLich />}>
                        <Route path=':accountId' element={<ThongTinTaiKhoanDatLich />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                </Routes>

                <Outlet />
            </div>
        </div>
    );
}
export default App;