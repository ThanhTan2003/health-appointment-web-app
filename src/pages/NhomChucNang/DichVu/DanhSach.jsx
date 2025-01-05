import React, { useEffect, useState } from 'react';

import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import { getToken } from "../../../services/localStorageService";
import { CONFIG } from '../../../configurations/configuration';
import BarcodeScanner from '../../../features/quetMaVach/BarcodeScanner';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faRotate, faInfo } from '@fortawesome/free-solid-svg-icons'


function DanhSach() {
    const navigate = useNavigate();
    
    const [services, setServices] = useState([]);

    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalElements, setTotalElements] = useState(0);

    const [keyword, setKeyword] = useState("");
    const [key, setKey] = useState(0); 

    const [specialties, setSpecialties] = useState([]);
    const [typeOfServices, setTypeOfServices] = useState([]);

    const [selectedSpecialty, setSelectedSpecialty] = useState("");
    const [selectedTypeOfServices, setSelectedTypeOfServices] = useState("");

    const { serviceId } = useParams();

    const [showScanner, setShowScanner] = useState(false);

    const handleBarcodeDetected = (barcode) => {
        setKeyword(barcode); // Đặt mã vạch vào ô tìm kiếm
        
        setShowScanner(false); // Ẩn trình quét sau khi đã quét xong
      };

      const handleCloseScanner = () => {
        setShowScanner(false); // Đóng giao diện quét mã vạch
      };

    // Hàm lấy thông tin người dùng và danh sách bác sĩ
    const getListServices = async (accessToken) => {
        try {
            const response = await fetch(
              `${CONFIG.API_GATEWAY}/medical/service/search?keyword=${keyword}&page=${currentPage}&size=${pageSize}`,
              {
                method: "GET",
                headers: {
                  Authorization: `Bearer ${accessToken}`,
                },
              }
            );

            if (response.status === 401) {
                console.error("Unauthorized: Token invalid or expired");
                navigate("/login");
                return;
            }
            const data = await response.json();
            setServices(data.data || []);
            setTotalPages(data.totalPages);
            setCurrentPage(data.currentPage);
            setPageSize(data.pageSize);
            setTotalElements(data.totalElements);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {

        }
    };

    // Lấy danh sách chuyên khoa từ API
    const getSpecialties = async (accessToken) => {
        try {
            const response = await fetch(`${CONFIG.API_GATEWAY}/doctor/specialty/get-all?page=1&size=100`, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            const data = await response.json();
            setSpecialties(data.data || []);
        } catch (error) {
            console.error("Error fetching specialties:", error);
        }
    };

    // Lấy danh sáchloại dịch vụ từ API
    const getTypeOfServices = async (accessToken) => {
      try {
          const response = await fetch(`${CONFIG.API_GATEWAY}/medical/service-type/get-all?page=1&size=100`, {
              method: "GET",
              headers: {
                  Authorization: `Bearer ${accessToken}`,
              },
          });
          const data = await response.json();
          setTypeOfServices(data.data || []);
      } catch (error) {
          console.error("Error fetching specialties:", error);
      }
  };

    useEffect(() => {
        const accessToken = getToken();
        if (!accessToken) {
            navigate("/login");
        } else {
          getListServices(accessToken);
          getSpecialties(accessToken);
          getTypeOfServices(accessToken);
          window.scrollTo(0, 0);
        }
    }, [navigate, currentPage, pageSize, selectedSpecialty, selectedTypeOfServices]);

    // Hàm để tạo số trang hiển thị
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxDisplayPages = 4;

        if (currentPage > 5) {
            pageNumbers.push(1);
            if (currentPage > 6) {
                pageNumbers.push('...');
            }
        }

        for (let i = currentPage - maxDisplayPages; i <= currentPage + maxDisplayPages; i++) {
            if (i > 0 && i <= totalPages) {
                pageNumbers.push(i);
            }
        }

        if (currentPage < totalPages - maxDisplayPages - 1) {
            pageNumbers.push('...');
        }

        if (currentPage < totalPages - maxDisplayPages) {
            pageNumbers.push(totalPages);
        }

        return pageNumbers;
    };

    // Khi nhấn nút tìm kiếm
    const handleSearch = () => {
        setCurrentPage(1);
        setKey(prevKey => prevKey + 1); 
        getListServices(getToken());
    };

    // Hàm chuyển đổi chuỗi tiếng Việt thành chuỗi không dấu
  const removeVietnameseTones = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

    return (
        <div>
            {!serviceId &&(
                <>
                <div className="flex justify-between items-center mb-2">
                    <button 
                        className="bg-sky-600 text-white py-2 px-4 rounded font-bold hover:bg-sky-700"
                        title='Đồng bộ dữ liệu với hệ thống HIS'
                    >
                        Đồng bộ dữ liệu
                        &nbsp;<FontAwesomeIcon icon={faRotate} />
                    </button>

                    <div className="flex items-center space-x-2">
                        <select 
                            className="border p-2 rounded border-blue-300" 
                            value={selectedSpecialty}
                            onChange={(e) => setSelectedSpecialty(e.target.value)}
                        >
                            <option value="">Tất cả chuyên khoa</option>
                            {specialties.map(specialty => (
                                <option key={specialty.specialtyId} value={specialty.specialtyId}>
                                    {specialty.specialtyName}
                                </option>
                            ))}
                        </select>

                        {/* Thay đổi từ combobox "Học hàm/Học vị" thành "Trạng thái" */}
                        <select 
                            className="border p-2 rounded border-blue-300" 
                            value={selectedTypeOfServices}
                            onChange={(e) => setSelectedTypeOfServices(e.target.value)}
                        >
                            <option value="">Tất cả tình trạng</option>
                            {typeOfServices.map(serviceType => (
                                <option key={serviceType.id} value={serviceType.id}>
                                    {serviceType.name}
                                </option>
                            ))}
                        </select>

                        <button 
                            type="button"
                            onClick={() => setShowScanner(true)} // Hiển thị component quét mã vạch
                            className="bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700"
                        >
                            <img 
                            src='/icons/icon-scan-qr-code.png' 
                            title="Quét mã vạch" 
                            className="w-6 h-6"
                            />
                        </button>

                        <input
                            type="text"
                            placeholder="Nhập từ khóa tìm kiếm"
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleSearch(); // Thực hiện tìm kiếm khi nhấn Enter
                                }
                            }}
                            className="border p-2 rounded w-64 border-blue-300"
                        />


                        <button 
                            type="button"
                            onClick={handleSearch}
                            className="bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700"
                        >
                            <FontAwesomeIcon icon={faMagnifyingGlass} />
                        </button>
                    </div>
                </div>

                {showScanner && <BarcodeScanner onDetected={handleBarcodeDetected} onClose={handleCloseScanner} />}

                <br />

                {/* Bảng danh sách */}
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse border border-gray-200 shadow-lg rounded-md">
                        <thead>
                            <tr className="bg-sky-600 text-white">
                                <th className="border border-gray-200 p-3 text-center">STT</th>
                                <th className="border border-gray-200 p-3 text-left">Tên dịch vụ</th>
                                <th className="border border-gray-200 p-3 text-left">Chuyên khoa</th>
                                <th className="border border-gray-200 p-3 text-left">Phân loại</th>
                                <th className="border border-gray-200 p-3 text-left">Tình trạng</th>
                                <th className="border border-gray-200 p-3 text-center"></th>
                            </tr>
                        </thead>
                        <tbody key={key}>
                            {services.length > 0 ? (
                                services.map((service, index) => (
                                    <tr key={service.id} className="hover:bg-gray-100 transition duration-200 ease-in-out">
                                        <td className="border border-gray-200 p-2 text-center">{index + 1 + (currentPage - 1) * pageSize}</td>
                                        <td className="border border-gray-200 p-2 text-zinc-700"><b>{service.name}</b></td>
                                        <td className="border border-gray-200 p-2">{service.specialtyResponse && service.specialtyResponse.specialtyName ? service.specialtyResponse.specialtyName : '...'}</td>

                                        <td className="border border-gray-200 p-2">{service.serviceType.name ? service.serviceType.name : '...'}</td>

                                        <td className={`border border-gray-200 p-2 font-bold 
                                            ${removeVietnameseTones(service.status) === 'Dang hoat dong' ? 'text-green-800' :
                                                removeVietnameseTones(service.status) === 'Ngung cong tac' ? 'text-red-800' :
                                                removeVietnameseTones(service.status) === 'Chuyen cong tac' ? 'text-orange-800' : ''}`}>
                                            {service.status}
                                        </td>

                                        <td className="border border-gray-200 p-2 text-center">
                                        <Link to={`/dich-vu/danh-sach/${service.id}`}>
                                            <button 
                                                className="bg-cyan-600 text-white px-3 py-1 rounded-md hover:bg-cyan-700 transition duration-75"
                                                // onClick={() => navigate(`/bac-si/danh-sach/${doctor.id}`)} // Điều hướng đến trang chi tiết bác sĩ
                                            >
                                                Chi tiết
                                            </button>
                                        </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="7" className="text-center p-4">Không có dữ liệu</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                <div className="flex justify-between items-center mt-4">
                    {/* Bên trái: Tổng số bác sĩ */}
                    <div className="text-gray-600">
                        Tổng số dịch vụ: <b>{totalElements}</b>
                    </div>

                    {/* Bên phải: Trang hiện tại / Tổng số trang */}
                    <div className="text-gray-600">
                        Trang {currentPage} / {totalPages}
                    </div>
                </div>

                {/* Pagination */}
                <div className="flex justify-center mt-4 space-x-2">
                    {getPageNumbers().map((pageNumber, index) =>
                        typeof pageNumber === 'number' ? (
                            <button
                                key={index}
                                onClick={() => setCurrentPage(pageNumber)}
                                style={currentPage === pageNumber ? { color: '#fff', backgroundColor: '#333' } : {}}
                                className="p-2 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 transition duration-200"
                            >
                                {pageNumber}
                            </button>
                        ) : (
                            <span key={index} style={{ margin: '0 5px' }}>...</span>
                        )
                    )}
                </div>
            </>
            )
            }
            <Outlet />
        </div>
        
    );
}

export default DanhSach;
