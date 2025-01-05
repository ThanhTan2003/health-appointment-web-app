import React, { useEffect, useState } from 'react';

import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

import { getToken } from "../../../../services/localStorageService";
import { CONFIG } from '../../../../configurations/configuration';
import BarcodeScanner from '../../../../features/quetMaVach/BarcodeScanner';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass, faCircleRight, faRotate } from '@fortawesome/free-solid-svg-icons'


function DanhSach() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [statuses, setStatuses] = useState([]);

  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);

  const [keyword, setKeyword] = useState("");
  const [key, setKey] = useState("0");

  const [selectedStatus, setSelectedStatus] = useState(""); // Lưu trạng thái đã chọn

  const { appointmentId } = useParams();

  const [showScanner, setShowScanner] = useState(false);

  const handleBarcodeDetected = (barcode) => {
    setKeyword(barcode); // Đặt mã vạch vào ô tìm kiếm
    setShowScanner(false); // Ẩn trình quét sau khi đã quét xong
  };

  const handleCloseScanner = () => {
    setShowScanner(false); // Đóng giao diện quét mã vạch
  };

  const getStatuses = async (accessToken) => {
    try {
      const response = await fetch(
        `${CONFIG.API_GATEWAY}/appointment/get-all-status`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Lấy danh sách trạng thái")

      if (response.status === 401) {
        console.error("Unauthorized: Token invalid or expired");
        navigate("/login");
        return;
      }
      const data = await response.json();
      console.log(data)
      setStatuses(data || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {

    }
  }

  // Hàm lấy thông tin người dùng và danh sách bác sĩ
  const getAppointments = async (accessToken) => {
    try {
      const response = await fetch(
        `${CONFIG.API_GATEWAY}/appointment/get-all?page=${currentPage}&size=${pageSize}&status=${selectedStatus}&id=${keyword}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      console.log("Lấy danh sách lịch hẹn")

      if (response.status === 401) {
        console.error("Unauthorized: Token invalid or expired");
        navigate("/login");
        return;
      }
      const data = await response.json();
      setAppointments(data.data || []);
      setTotalPages(data.totalPages);
      setCurrentPage(data.currentPage);
      setPageSize(data.pageSize);
      setTotalElements(data.totalElements);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {

    }
  };

  useEffect(() => {
    const accessToken = getToken();
    if (!accessToken) {
      navigate("/login");
    } else {
      getStatuses(accessToken);
    }
  }, [selectedStatus]);

  useEffect(() => {
    const accessToken = getToken();
    if (!accessToken) {
      navigate("/login");
    } else {
      // Đảm bảo rằng các giá trị đã có trước khi gọi API
      if (currentPage && pageSize) {
        getAppointments(accessToken);
      }
    }
  }, [navigate, currentPage, pageSize, selectedStatus]);

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
    getAppointments(getToken());
  };

  const syncAppointments = async (accessToken) => {
    try {
      const response = await fetch(
        `${CONFIG.API_GATEWAY}/appointment/health-check-result/sync`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        console.log("Đồng bộ dữ liệu thành công!");
        getAppointments(accessToken); // Gọi lại API để cập nhật danh sách
      } else {
        console.error("Lỗi khi đồng bộ dữ liệu:", await response.text());
      }
    } catch (error) {
      console.error("Lỗi kết nối khi đồng bộ dữ liệu:", error);
    }
  };

  const DongBoClick = () => {
    const accessToken = getToken();
    if (!accessToken) {
      navigate("/login");
    } else {
      syncAppointments(accessToken)
    }
  }


  // Hàm chuyển đổi chuỗi tiếng Việt thành chuỗi không dấu
  const removeVietnameseTones = (str) => {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D');
  };

  return (
    <div>
      {!appointmentId && (
        <>
          <div className="flex justify-between items-center mb-2">
            <div>
              <button
                onClick={DongBoClick}
                className="bg-sky-600 text-white py-2 px-4 rounded font-bold hover:bg-sky-700"
                title='Đồng bộ dữ liệu với hệ thống quản lý lịch hẹn'
              >
                Đồng bộ dữ liệu
                &nbsp;<FontAwesomeIcon icon={faRotate} />
              </button>
              <button
                onClick={() => {
                  const accessToken = getToken();
                  if (accessToken) {
                    getAppointments(accessToken);
                  }
                }}
                className="ml-2 border border-sky-600 text-sky-600 py-2 px-4 rounded font-bold hover:bg-sky-100 transition"
                title='Tải lại danh sách'
              >
                Tải lại danh sách
                &nbsp;<FontAwesomeIcon icon={faRotate} />
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowScanner(true)} // Hiển thị component quét mã vạch
                className="bg-sky-600 text-white py-2 px-4 rounded hover:bg-sky-700 flex items-center"
              >
                <p className='font-semibold'>Quét mã vạch</p> &nbsp;
                <img
                  src='/icons/icon-scan-qr-code.png'
                  title="Quét mã vạch"
                  className="w-6 h-6 ml-2"
                />
              </button>
              <select
                className="border p-2 rounded border-blue-300"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="">Tất cả trạng thái</option>
                {
                  statuses.map((status, index) => (
                    <option key={index} value={status}>{status}</option>
                  ))
                }
              </select>

              <input
                type="text"
                placeholder="Nhập mã lịch hẹn"
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
                  <th className="border border-gray-200 p-3 text-left">Mã lịch hẹn</th>
                  <th className="border border-gray-200 p-3 text-left">Tên dịch vụ</th>
                  <th className="border border-gray-200 p-3 text-left">Bác sĩ</th>
                  <th className="border border-gray-200 p-3 text-left whitespace-nowrap">Ngày khám</th>
                  <th className="border border-gray-200 p-3 text-left">Trạng thái</th>
                  <th className="border border-gray-200 p-3 text-center"></th>
                </tr>
              </thead>
              <tbody key={key}>
                {appointments.length > 0 ? (
                  appointments.map((appointment, index) => (
                    <tr key={appointment.id} className="hover:bg-gray-100 transition duration-200 ease-in-out">
                      <td className="border border-gray-200 p-2 text-center">{index + 1 + (currentPage - 1) * pageSize}</td>
                      <td className="border border-gray-200 p-2 text-zinc-700 whitespace-nowrap"><b>{appointment.id}</b></td>
                      <td className="border border-gray-200 p-2">{appointment.serviceTimeFrame.serviceName}</td>
                      <td className="border border-gray-200 p-2">{appointment.serviceTimeFrame.doctorName}</td>
                      <td className="border border-gray-200 p-2">{appointment.dateName}</td>
                      <td className="border border-gray-200 p-2 whitespace-nowrap">{appointment.status}</td>
                      <td className="border border-gray-200 p-2 text-center whitespace-nowrap">
                        {
                          removeVietnameseTones(appointment.status) === 'Cho phe duyet'
                            ? (
                              <Link to={`/lich-kham-benh/ho-so-dang-ky/xac-nhan/${appointment.id}`}>
                                <button
                                  className="bg-cyan-600 text-white px-3 py-1 rounded-md hover:bg-cyan-700 transition duration-75 w-full"
                                >
                                  Xác nhận
                                </button>
                              </Link>
                            )
                            : (
                              <Link to={`/lich-kham-benh/ho-so-dang-ky/chi-tiet/${appointment.id}`}>
                                <button
                                  className="bg-white text-cyan-600 border border-cyan-600 px-3 py-1 rounded-md hover:bg-cyan-100 transition duration-75 w-full"
                                >
                                  Chi tiết
                                </button>
                              </Link>
                            )
                        }
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
              Tổng số lịch hẹn: <b>{totalElements}</b>
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
