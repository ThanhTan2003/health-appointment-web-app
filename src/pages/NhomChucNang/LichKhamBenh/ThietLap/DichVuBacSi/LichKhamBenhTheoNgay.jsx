import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useParams } from "react-router-dom";
import { getToken } from '../../../../../services/localStorageService';
import { CONFIG } from '../../../../../configurations/configuration';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faPen, faCalendarXmark } from '@fortawesome/free-solid-svg-icons';
import ThemLichKhamMoi from './ThemLichKhamMoi';
import CapNhatLichKham from './CapNhatLichKham'

import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


import ConfirmModal from "./ConfirmModal"

export default function LichKhamBenhTheoNgay() {
  const navigate = useNavigate();
  const { doctorId, day } = useParams();

  const [timeFrames, setTimeFrames] = useState([]); // TimeFrames từ API
  const [serviceTimeFrames, setServiceTimeFrames] = useState([]); // ServiceTimeFrames từ API
  const [showModalAdd, setShowModalAdd] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [showModalUpdate, setShowModalUpdate] = useState(false);
  const [serviceTimeFrameId, setServiceTimeFrameId] = useState(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedServiceTimeFrame, setSelectedServiceTimeFrame] = useState(null); // Lưu đối tượng cần xóa

  const handleDeleteClick = (serviceTimeFrame) => {
    setSelectedServiceTimeFrame(serviceTimeFrame); // Lưu đối tượng cần xóa
    setIsDeleteModalOpen(true);                   // Mở modal
  };

  const handleConfirmDelete = async () => {
    try {
      const accessToken = getToken();
      if (!accessToken) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${CONFIG.API_GATEWAY}/medical/service-time-frame/delete/${selectedServiceTimeFrame.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        //toast.success(`Xóa lịch khám thành công!`);
        const updatedServiceTimeFrames = serviceTimeFrames.filter(
          (frame) => frame.id !== selectedServiceTimeFrame.id
        );
        setServiceTimeFrames(updatedServiceTimeFrames); // Cập nhật danh sách
      } else {
        //toast.error("Không thể xóa lịch khám!");
      }
    } catch (error) {
      console.error("Lỗi khi gọi API xóa:", error);
      //toast.error("Có lỗi xảy ra, vui lòng thử lại!");
    } finally {
      setIsDeleteModalOpen(false); // Đóng modal
    }
  };

  const showSuccess = async (success) => {
    console.log(success)
    toast.success(success, {
      position: "top-right",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
  };

  const openModalAdd = (timeFrameId) => {
    setSelectedSlot(timeFrameId); // Chỉ lưu ID khung giờ
    setShowModalAdd(true);
  };

  const openModalUpdate = (serviceTimeFrameId) => {
    setServiceTimeFrameId(serviceTimeFrameId); // Chỉ lưu ID của ServiceTimeFrame
    setShowModalUpdate(true);
  };

  const closeModalAdd = () => {
    setShowModalAdd(false);
    setSelectedSlot(null);
  };

  const closeModalUpdate = () => {
    setShowModalUpdate(false);
    setServiceTimeFrameId(null);
  };

  // Lấy TimeFrames từ API
  const getTimeFrames = async (accessToken) => {
    try {
      const response = await fetch(`${CONFIG.API_GATEWAY}/medical/time-frame/public/get-all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 401) {
        console.error("Unauthorized: Token invalid or expired");
        navigate("/login");
        return;
      }

      const data = await response.json();
      setTimeFrames(data || []); // Lưu TimeFrames
    } catch (error) {
      console.error("Error fetching time frames:", error);
    }
  };

  // Lấy ServiceTimeFrames từ API
  const getServiceTimeFrames = async (accessToken) => {
    try {
      const response = await fetch(
        `${CONFIG.API_GATEWAY}/medical/service-time-frame/get-by-doctor-and-day?doctorId=${doctorId}&dayOfWeek=${day}`,
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
      setServiceTimeFrames(data.filter((item) => item.timeFrameResponse)); // Lọc những mục có timeFrameResponse
    } catch (error) {
      console.error("Error fetching service time frames:", error);
    }
  };

  useEffect(() => {
    const accessToken = getToken();
    if (!accessToken) {
      navigate("/login");
    } else {
      getTimeFrames(accessToken);
      getServiceTimeFrames(accessToken);
    }
  }, [navigate, doctorId, day, showModalAdd, showModalUpdate]);

  const getSessions = () => {
    if (!timeFrames || timeFrames.length === 0) return [];
    return [...new Set(timeFrames.map((frame) => frame.session).filter(Boolean))]; // Lấy danh sách session duy nhất
  };



  const renderTimeSlots = (sessionName) => {
    const filteredTimeFrames = timeFrames.filter((frame) => frame.session === sessionName);

    if (filteredTimeFrames.length === 0) return null;

    return filteredTimeFrames.map((timeFrame, index) => {
      const frame = serviceTimeFrames.find(
        (serviceFrame) => serviceFrame.timeFrameResponse.id === timeFrame.id
      );

      return (
        <tr key={timeFrame.id}>
          {index === 0 && (
            <td
              className="border border-gray-300 p-2 text-center font-bold align-middle"
              rowSpan={filteredTimeFrames.length}
            >
              {sessionName}
            </td>
          )}
          <td className="border border-gray-300 p-2 text-left">{timeFrame.name}</td>
          {frame ? (
            <>
              <td className="border border-gray-300 p-2 text-zinc-700 font-semibold whitespace-normal">
                {frame.doctorServiceResponse?.service?.name || "Chưa có thông tin dịch vụ"}
              </td>
              <td className="border border-gray-300 p-2 text-zinc-700">{frame.roomResponse?.id || "Chưa có phòng"}</td>
              <td className="border border-gray-300 p-2 text-zinc-700">{frame.maximumQuantity || 0}</td>
              <td className="border border-gray-300 p-2 text-zinc-700">
                {frame.startNumber || "-"} - {frame.endNumber || "-"}
              </td>
              <td className="border border-gray-300 p-2 text-zinc-700">
                <select className="border border-blue-300 rounded p-1" defaultValue={frame.status}>
                  <option value="Nhận đăng ký">Nhận đăng ký</option>
                  <option value="Ngừng nhận đăng ký">Ngừng đăng ký</option>
                </select>
              </td>
              <td className="border border-gray-300 p-2 text-zinc-700 text-center font-semibold" style={{ width: "150px" }}>
                <div className="flex items-center space-x-2 justify-center">
                  <button
                    onClick={() => openModalUpdate(frame.id)}
                    className="bg-white text-teal-600 px-3 py-1 rounded-md hover:text-white hover:bg-teal-600 transition duration-75 flex items-center justify-center w-20 border border-teal-600"
                  >
                    Sửa &nbsp;<FontAwesomeIcon icon={faPen} className="mr-1" />
                  </button>
                  <button
                    className="bg-white text-red-500 px-3 py-1 rounded-md hover:bg-red-500 hover:text-white transition duration-75 border border-red-500"
                    onClick={() => handleDeleteClick(frame)} // Mở modal
                  >
                    Xóa &nbsp;<FontAwesomeIcon icon={faCalendarXmark} className="mr-1" />
                  </button>

                </div>
              </td>
            </>
          ) : (
            <>
              <td className="border border-gray-300 p-2 text-zinc-700 font-semibold whitespace-normal"></td>
              <td className="border border-gray-300 p-2 text-zinc-700"></td>
              <td className="border border-gray-300 p-2 text-zinc-700"></td>
              <td className="border border-gray-300 p-2 text-zinc-700"></td>
              <td className="border border-gray-300 p-2 text-zinc-700"></td>
              <td className="border border-gray-300 p-2 text-zinc-700 text-center justify-center items-center" style={{ width: "220px" }}>
                <button
                  onClick={() => openModalAdd(timeFrame.id)}
                  className="bg-white text-sky-600 px-3 py-1 rounded-md hover:bg-sky-600 hover:text-white transition duration-75 w-10/12 font-semibold border border-sky-600"
                >
                  Thêm mới &nbsp;<FontAwesomeIcon icon={faPlus} className="mr-1" />
                </button>
              </td>
            </>
          )}
        </tr>
      );
    });
  };

  return (
    <>
      <br />
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-gray-300 shadow-lg rounded-md whitespace-nowrap">
          <thead>
            <tr className="bg-sky-600 text-white">
              <th className="border border-gray-300 p-3 text-center">Buổi</th>
              <th className="border border-gray-300 p-3 text-left">Khung giờ</th>
              <th className="border border-gray-300 p-3 text-left whitespace-normal">Tên dịch vụ</th>
              <th className="border border-gray-300 p-3 text-left">Phòng</th>
              <th className="border border-gray-300 p-3 text-left">SL</th>
              <th className="border border-gray-300 p-3 text-left">Số TT</th>
              <th className="border border-gray-300 p-3 text-left" style={{ width: "150px" }}>Tình trạng</th>
              <th className="border border-gray-300 p-3 text-left" style={{ width: "150px" }}></th>
            </tr>
          </thead>
          <tbody>
            {getSessions().map((sessionName, sessionIndex, sessionArray) => (
              <React.Fragment key={sessionIndex}>
                {renderTimeSlots(sessionName)}
                {sessionIndex < sessionArray.length - 1 && ( // Chỉ thêm hàng trống nếu không phải session cuối
                  <tr className="bg-slate-100">
                    <td colSpan="8" className="text-center p-4"></td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        <br />
        {showModalAdd && selectedSlot && (
          <ThemLichKhamMoi
            isOpen={showModalAdd}
            onClose={closeModalAdd}
            doctorId={doctorId}
            timeFrameId={selectedSlot} // Truyền đúng ID của timeFrame
          />
        )}
        {showModalUpdate && serviceTimeFrameId && (
          <CapNhatLichKham
            isOpen={showModalUpdate}
            onClose={closeModalUpdate}
            serviceTimeFrameId={serviceTimeFrameId} // Truyền đúng ID của ServiceTimeFrame
          />
        )}

        <ConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)} // Đóng modal
          onConfirm={handleConfirmDelete}            // Xác nhận xóa
          message={`Bạn có chắc chắn muốn xóa lịch khám tại khung giờ "${selectedServiceTimeFrame?.timeFrameResponse?.name}"?`}
        />

      </div>
      <Outlet />
    </>
  );
}
