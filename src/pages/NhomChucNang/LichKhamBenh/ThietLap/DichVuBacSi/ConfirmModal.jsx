import React from "react";

function ConfirmModal({ isOpen, onClose, onConfirm, message }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-75 z-50">
      <div className="bg-white rounded-lg shadow-lg w-1/3">
        {/* Tiêu đề Modal */}
        <div className="bg-red-600 text-white p-4 flex justify-between items-center rounded-t-lg">
          <h2 className="text-lg font-bold">Xác nhận hành động</h2>
          <button
            onClick={onClose}
            className="text-red-600 bg-white hover:bg-red-500 hover:text-white rounded-full flex items-center justify-center"
            style={{
              width: "30px",
              height: "30px",
            }}
          >
            X
          </button>
        </div>

        {/* Nội dung Modal */}
        <div className="text-center p-6">
          <p className="text-lg text-gray-700">{message}</p>
        </div>

        {/* Nút Hành Động */}
        <div className="flex justify-center gap-4 p-4">
          <button
            onClick={onConfirm}
            className="font-semibold bg-red-500 text-white py-2 px-8 rounded hover:bg-red-600 transition duration-200 w-32"
          >
            Có
          </button>
          <button
            onClick={onClose}
            className="font-semibold bg-gray-400 text-white py-2 px-8 rounded hover:bg-gray-500 transition duration-200 w-32"
          >
            Không
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmModal;
