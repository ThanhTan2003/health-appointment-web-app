import React, { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faStethoscope, faXmark, faNotesMedical } from '@fortawesome/free-solid-svg-icons';
import { getToken } from '../../../../../../services/localStorageService';
import { CONFIG } from '../../../../../../configurations/configuration';

import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ThemDichVuThuocChuyenKhoa = ({ isOpen, onClose, onSuccess }) => {

    const navigate = useNavigate();

    const { doctorId } = useParams();
    const [keyword, setKeyword] = useState('')

    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [totalElements, setTotalElements] = useState(0);

    const [specialtyId, setSpecialtyId] = useState('')
    const [selectSpecialty, setSelectSpecialty] = useState('')
    const [specialties, setSpecialties] = useState([]);

    const [serviceId, setServiceId] = useState('')
    const [selectService, setSelectService] = useState('')
    const [services, setServices] = useState([]);

    const showError = async (error) => {
        toast.error(error, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
        });
      };

      const showInfo= (info) =>{
        toast.info(info, {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
          });
    }

    const getSpecialties = async (accessToken) => {
        try {
            const response = await fetch(
                `${CONFIG.API_GATEWAY}/doctor/id/${doctorId}`,
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
            setSpecialties(data.specialties || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    }

    const getServices = async (accessToken) => {
        //console.log("page: " + currentPage)
        //console.log("size: " + pageSize)
        //console.log(`${CONFIG.API_GATEWAY}/medical/service/specialty/not-null?doctor-id=${doctorId}&specialty-id=${specialtyId}&keyword=${keyword}&page=${currentPage}&size=${pageSize}`)
        try {
            const response = await fetch(
                `${CONFIG.API_GATEWAY}/medical/service/specialty/not-null?doctor-id=${doctorId}&specialty-id=${specialtyId}&keyword=${keyword}&page=${currentPage}&size=${pageSize}`,
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
        }
    }

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
        console.log(doctorId)

        return pageNumbers;
    };

    useEffect(() => {
        const accessToken = getToken();
        if (!accessToken) {
            navigate("/login");
        } else {
            getSpecialties(accessToken);
            window.scrollTo(0, 0);
        }
    }, [selectSpecialty]);

    useEffect(() => {
        const accessToken = getToken();
        if (!accessToken) {
            navigate("/login");
        } else {
            getServices(accessToken);
            window.scrollTo(0, 0);
        }
    }, [specialtyId, currentPage]);

    const handleSearch = () => {
        const accessToken = getToken();
        if (!accessToken) {
            navigate("/login");
        } else {
            getServices(accessToken);
        }
    };

    const handleAddService = async (serviceId) => {
        const accessToken = getToken();
        const DoctorServiceRequest = {
          doctorId,
          serviceId,
          is_active: true,
        };
    
        try {
          const response = await fetch(`${CONFIG.API_GATEWAY}/medical/doctor-service/create`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify(DoctorServiceRequest),
          });
    
          if (response.ok) {
            onClose();   // Đóng modal
          } else {
            const errorData = await response.json();
            console.log(errorData.message)
            showError(errorData.message);
          }
        } catch (error) {
          showError(error);
        }
      };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50 backdrop-blur-none transition-opacity duration-300 ease-in-out opacity-100">
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
            />
            <div className="bg-white rounded-lg shadow-lg w-1/2 max-h-[95vh] overflow-y-auto">
                <div className="bg-sky-600 text-white p-2 px-6 rounded-t-lg flex justify-between items-center sticky top-0 z-10">
                    <h2 className="text-lg font-bold"><FontAwesomeIcon icon={faStethoscope} /> &nbsp; Thêm dịch vụ thuộc chuyên khoa</h2>
                    <button
                        onClick={onClose}
                        className="text-sky-600 bg-white hover:bg-red-500 hover:text-white rounded-full p-2 transition duration-200 ease-in-out"
                        title='Đóng'
                        style={{ width: '25px', height: '25px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                        <FontAwesomeIcon icon={faXmark} />
                    </button>
                </div>


                <div className="mb-4 p-6">
                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Chọn chuyên khoa:</label>
                        <select
                            className="border rounded p-2 w-full border-blue-300"
                            value={selectSpecialty}
                            onChange={(e) => {
                                setSelectSpecialty(e.target.value)
                                setSpecialtyId(e.target.value)
                            }}
                        >
                            {
                                specialties.length === 0 ? (
                                    // Nếu không có chuyên khoa nào
                                    <option key={0} value="">Không có chuyên khoa</option>
                                ) : specialties.length === 1 ? (
                                    // Nếu chỉ có 1 chuyên khoa
                                    <option key={specialties[0].specialtyId} value={specialties[0].specialtyId}>{specialties[0].specialtyName}</option>
                                ) : (
                                    // Nếu có nhiều chuyên khoa
                                    <>
                                        <option value="" key="">Tất cả chuyên khoa</option>
                                        {specialties.map((specialty, index) => (
                                            <option key={specialty.specialtyId} value={specialty.specialtyId}>{specialty.specialtyName}</option>
                                        ))}
                                    </>
                                )
                            }
                        </select>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Tìm kiếm:</label>
                        <div className="grid grid-cols-[70%,28%] gap-2">
                            <input
                                type="text"
                                placeholder="Nhập mã dịch vụ hoặc tên dịch vụ"
                                value={keyword}
                                onChange={(e) => setKeyword(e.target.value)}
                                className="border rounded p-2 w-full border-blue-300"
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        handleSearch(); // Thực hiện tìm kiếm khi nhấn Enter
                                    }
                                }}
                            />
                            <button
                                onClick={handleSearch}
                                className="bg-sky-600 text-white py-2 rounded hover:bg-sky-700 font-semibold"
                            >
                                Tìm dịch vụ &nbsp; <FontAwesomeIcon icon={faSearch} />
                            </button>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-gray-700 font-bold mb-2">Chọn dịch vụ:</label>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-200 shadow-lg rounded-md">
                                <thead>
                                    <tr className="bg-sky-600 text-white">
                                        <th className="border border-gray-200 p-3 text-center">STT</th>
                                        <th className="border border-gray-200 p-3 text-left">Tên dịch vụ</th>
                                        <th className="border border-gray-200 p-3 text-center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.length > 0 ? (
                                        services.map((service, index) => (
                                            <tr key={service.id} className="hover:bg-gray-100 transition duration-200 ease-in-out">
                                                <td className="border border-gray-200 p-2 text-center">{index + 1 + (currentPage - 1) * pageSize}</td>
                                                <td className="border border-gray-200 p-2 text-zinc-700">{service.name}</td>
                                                <td className="border border-gray-200 p-2 text-center">
                                                    <button
                                                        onClick={() => {
                                                            setSelectService(service);
                                                            handleAddService(service.id);
                                                        }}
                                                        className="bg-cyan-600 text-white px-3 py-1 rounded-md hover:bg-cyan-700 transition duration-75"
                                                    // className="text-cyan-600 px-3 py-1 rounded-md border border-cyan-600 hover:bg-cyan-600 hover:text-white transition duration-75"
                                                    >
                                                        Thêm
                                                        &nbsp; <FontAwesomeIcon icon={faNotesMedical} />
                                                    </button>
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
                    </div>

                    <div className="justify-end text-right gap-x-4">
                        <button
                            onClick={onClose}
                            className="bg-white text-sky-600 px-4 py-2 rounded font-bold border border-sky-600 hover:bg-slate-100"
                        >
                            Hủy &nbsp; X
                        </button>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ThemDichVuThuocChuyenKhoa;
