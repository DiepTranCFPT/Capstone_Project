import React from "react";

const MaterialsPageHeader: React.FC = () => {
  return (
    <div className="w-full h-[487px] bg-zinc-300 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Tiêu đề */}
      <h1 className="text-4xl font-bold text-black font-['Inter'] mb-4">
        Materials Page
      </h1>

      {/* Breadcrumb */}
      <div className="text-2xl font-medium font-['Inter']">
        <span className="text-black">Home / </span>
        <span className="text-emerald-700">Materials</span>
      </div>

      {/* Hình ảnh trang trí */}
      <img
        className="w-48 h-40 absolute right-10 top-0 object-contain"
        src="/learning.png"
        alt="Learning decoration top right"
      />
      <img
        className="w-48 h-20 absolute bottom-5 object-contain"
        src="/learning.png"
        alt="Learning decoration bottom center"
      />
    </div>
  );
};

export default MaterialsPageHeader;

