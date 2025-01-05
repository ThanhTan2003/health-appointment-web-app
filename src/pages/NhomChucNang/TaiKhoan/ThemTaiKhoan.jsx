import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faUserPlus, faPlus, faXmark } from '@fortawesome/free-solid-svg-icons';
import { getToken } from '../../../services/localStorageService';
import { CONFIG } from '../../../configurations/configuration';

import { ToastContainer, toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const ThemTaiKhoan = ({ isOpen, onClose, onCreateSuccess }) => {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // State cho mật khẩu xác nhận
  const [accountName, setAccountName] = useState('');
  const [roleId, setRoleId] = useState('');
  const [doctorId, setDoctorId] = useState('');
  const [roles, setRoles] = useState([]);
  const [doctorName, setDoctorName] = useState('');
  const [error, setError] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(''); // State cho độ mạnh của mật khẩu

  useEffect(() => {
    const fetchRoles = async () => {
      const accessToken = getToken();
      try {
        const response = await fetch(`${CONFIG.API_GATEWAY}/identity/role/get-all-except-nguoi-dung`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const data = await response.json();
        setRoles(data || []);
      } catch (error) {
        console.error("Error fetching roles:", error);
      }
    };
    fetchRoles();
  }, []);

  // Hàm đánh giá độ mạnh của mật khẩu
  const evaluatePasswordStrength = (password) => {
    if (password.length < 6) return 'Yếu';
    if (password.match(/[a-zA-Z]/) && password.match(/[0-9]/) && password.match(/[@$!%*?&#]/)) return 'Mạnh';
    if (password.match(/[a-zA-Z]/) && password.match(/[0-9]/)) return 'Trung bình';
    return 'Yếu';
  };

  // Theo dõi sự thay đổi của mật khẩu và cập nhật độ mạnh
  useEffect(() => {
    setPasswordStrength(evaluatePasswordStrength(password));
  }, [password]);

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

  const showInfo = (info) => {
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

  const handleCreateAccount = async () => {
    if (password !== confirmPassword) {
      showError('Mật khẩu nhập lại không khớp');
      return;
    }

    const accessToken = getToken();
    const accountData = {
      userName,
      password,
      accountName,
      status: "Đang hoạt động",
      doctorId: roleId === 'BacSi' ? doctorId : null,
      roleId,
    };

    try {
      const response = await fetch(`${CONFIG.API_GATEWAY}/identity/user/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(accountData),
      });

      if (response.ok) {
        toast.success('Tạo tài khoản mới thành công!', {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
          transition: Bounce,
        });
        onCreateSuccess();
        onClose();

      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to create account');
        showError(errorData.message);
      }
    } catch (error) {
      console.error("Error creating account:", error);
      setError('An error occurred while creating account.');
      showError(error);
    }
  };

  const handleDoctorSearch = async () => {
    if (doctorId === null || doctorId === '') {
      setError('Vui lòng nhập mã Bác sĩ');
      showError('Vui lòng nhập mã Bác sĩ');
      setDoctorName(null);
      return;
    }
    const accessToken = getToken();
    try {
      const response = await fetch(`${CONFIG.API_GATEWAY}/doctor/id/${doctorId}`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setAccountName(data.fullName); // Điền tên bác sĩ vào accountName
      } else {
        setError(data.message || 'Doctor not found');
      }
    } catch (error) {
      console.error("Error fetching doctor details:", error);
      setError('An error occurred while fetching doctor details.');
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
        <div className="bg-sky-600 text-white p-3 px-6 rounded-t-lg flex justify-between items-center">
          <h2 className="text-lg font-bold"><FontAwesomeIcon icon={faUserPlus} />  &nbsp; Tạo tài khoản mới</h2>
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
            <label className="block text-gray-700 font-bold mb-2">Loại tài khoản:</label>
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="border rounded p-2 w-full border-blue-300"
            >
              <option value="">Chọn loại tài khoản</option>
              {roles.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name}
                </option>
              ))}
            </select>
          </div>

          {roleId === 'BacSi' && (
            <div className="mb-4">
              <label className="block text-gray-700 font-bold mb-2">Mã bác sĩ:</label>
              <div className="grid grid-cols-[70%,28%] gap-2">
                <input
                  type="text"
                  placeholder="Nhập mã bác sĩ"
                  value={doctorId}
                  onChange={(e) => setDoctorId(e.target.value)}
                  className="border rounded p-2 w-full border-blue-300"
                />
                <button
                  onClick={handleDoctorSearch}
                  className="bg-sky-600 text-white py-2 rounded hover:bg-sky-700 font-semibold"
                >
                  Tìm bác sĩ &nbsp; <FontAwesomeIcon icon={faSearch} />
                </button>
              </div>
            </div>
          )}

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Tên người dùng:</label>
            <input
              type="text"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              className="border rounded p-2 w-full border-blue-300"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Tên tài khoản:</label>
            <input
              type="text"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="border rounded p-2 w-full border-blue-300"
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Mật khẩu:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="border rounded p-2 w-full border-blue-300"
            />
            {/* <p className="text-sm mt-1 text-gray-500">Độ mạnh của mật khẩu: {passwordStrength}</p> */}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 font-bold mb-2">Nhập lại mật khẩu:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="border rounded p-2 w-full border-blue-300"
            />
          </div>

          <div className="justify-end grid grid-cols-[40%,25%] gap-x-4">
            <button
              onClick={handleCreateAccount}
              className="bg-sky-600 text-white py-2 p-4 rounded font-bold hover:bg-sky-700"
            >
              Tạo tài khoản &nbsp; <FontAwesomeIcon icon={faPlus} />
            </button>
            <button
              onClick={onClose}
              className="bg-white text-sky-600 px-4 py-2 rounded font-bold border border-sky-600 hover:bg-slate-100"
            >
              Hủy &nbsp; X
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemTaiKhoan;
