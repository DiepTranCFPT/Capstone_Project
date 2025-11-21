import { Link } from "react-router-dom";
import MaterialThumbnail from "~/components/common/MaterialThumbnail";
import type { Material } from "~/types/material";

const MaterialCard: React.FC<{ material: Material }> = ({ material }) => {
  return (
    <div className="border rounded-lg shadow-sm p-3 bg-white">
      <MaterialThumbnail
        source={material.thumbnail || material.fileImage || material.image}
        width="100%"
        height={160}
        roundedClass="rounded"
        className="w-full mb-2"
      />
      {material.free && (
        <span className="inline-block mt-2 bg-green-100 text-green-600 px-2 py-1 text-xs rounded-full">
          Free
        </span>
      )}
      <h3 className="font-bold mt-2">{material.title}</h3>
      <p className="text-xs text-gray-500">
        Lesson {material.lessons} • Student {material.students} • View {material.views}
      </p>
      <div className="flex justify-between items-center mt-2">
        <span className="text-sm font-semibold">
          {material.free ? "Free" : `$${material.price}`}
        </span>
        <Link
          to={`/materials/${material.id}`}
          className="text-xs border px-2 py-1 rounded hover:bg-gray-100"
        >
          View Details
        </Link>
      </div>
    </div>
  );
};

export default MaterialCard;
