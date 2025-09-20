import React from "react";
import { Tabs } from "antd";
import type { Material } from "~/types/material";

interface MaterialDetailTabProps {
  material: Material;
}

const MaterialDetailTab: React.FC<MaterialDetailTabProps> = ({ material }) => {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* Hình ảnh + tiêu đề */}
      <img
        src={material.image}
        alt={material.title}
        className="w-full h-60 object-cover rounded-lg mb-4"
      />
      <h2 className="text-xl font-semibold mb-2">{material.title}</h2>
      <p className="text-gray-500 mb-4">
        {material.topic} • {material.subject}
      </p>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 mb-4">{material.description}</p>

                <h3 className="text-lg font-semibold mb-2">What Will You Learn?</h3>
                <p className="text-gray-600 mb-4">
                  Quickly synergize cutting-edge scenarios and professional
                  results. Assertively deliver cross-media results before
                  client-centric results. Uniquely initiate intuitive communities
                  through process-centric internal or "organic" sources.
                </p>
<button className="w-40 bg-teal-400 hover:bg-teal-500 text-white border-0 rounded-xl h-12 font-semibold">
  Ready For Test
</button>
              </div>
            ),
          },
          {
            key: "curriculum",
            label: "Curriculum",
            children: <p>Curriculum content will go here...</p>,
          },
          {
            key: "instructor",
            label: "Instructor",
            children: <p>Instructor details will go here...</p>,
          },
          {
            key: "reviews",
            label: "Reviews",
            children: <p>Reviews will go here...</p>,
          },
        ]}
      />
    </div>
  );
};

export default MaterialDetailTab;
