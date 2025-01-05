import React, { useState, useEffect } from 'react';
import { Route, Routes, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartSimple, faHospital } from '@fortawesome/free-solid-svg-icons';

import ThongKe from '../../NhomChucNang/PhongKham/ThongKe';
import DanhSach from '../../NhomChucNang/PhongKham/DanhSach';
import ThongTinPhongKham from '../../NhomChucNang/PhongKham/ThongTinPhongKham';
import NotFound from '../../NotFound';

const tabConfig = [
    { id: 'DanhSach', name: 'Danh sách', icon: faHospital, path: 'danh-sach' },
]

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
                        navigate(`/phong-kham/${tab.path}`);
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
    const [selectedTab, setSelectedTab] = useState('DanhSach');
    const location = useLocation();

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
                <h1>QUẢN LÝ THÔNG TIN PHÒNG KHÁM</h1>
            </div>

            {/* Tab menu */}
            <div className="sticky top-[48px] z-10">
                <TabMenu selectedTab={selectedTab} setSelectedTab={setSelectedTab} />
            </div>

            {/* Content */}
            <div className="flex-1 bg-white mt-4 p-4 rounded shadow w-full">
                <Routes>
                    <Route index element={<DanhSach />} />
                    <Route path='thong-ke' element={<ThongKe />} />
                    <Route path='danh-sach' element={<DanhSach />}>
                        <Route path=':roomId' element={<ThongTinPhongKham />} />
                        <Route path="*" element={<NotFound />} />
                    </Route>
                </Routes>

                <Outlet />
            </div>
        </div>
    );
}
export default App;