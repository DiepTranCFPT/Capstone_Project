import { useParams, Link } from "react-router-dom";
import MaterialDetailTab from "./MaterialDetailTab";
import { useMaterialDetail } from "~/hooks/useMaterialDetail";

const MaterialsDetailPage: React.FC = () => {
  const { id } = useParams();
  const { material, loading, error } = useMaterialDetail(id);
  const updatedAt = material
    ? new Date(material.updatedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
    : "";
  const highlights = [
    "Build powerful, fast, user-friendly and reactive web apps.",
    "Master fundamental concepts behind structuring React projects.",
    "Create reusable components that you can use in all your projects.",
    "Learn to build complex applications with state management and routing.",
  ];
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Đang tải thông tin tài liệu...</p>
        </div>
      </div>
    );
  }

  if (error || !material) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Material not found</h2>
          <p className="text-gray-500">
            {error || "The material you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 pb-16">
      <div className="text-white" style={{ backgroundColor: '#3CBCB2' }}>
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="text-sm mb-6">
            <Link to="/materials" className="text-white/80 hover:text-white transition-colors font-medium">
              &lt; All Courses
            </Link>
          </div>
          <div className="flex flex-col gap-6">
            <div>
              <p className="uppercase tracking-wider text-xs text-white/90 mb-4 font-semibold">
                {material.typeName?.toUpperCase() || material.subjectName?.toUpperCase() || "COURSE"}
              </p>
              <h1 className="text-4xl md:text-5xl font-bold leading-tight text-white">
                {material.title}
              </h1>
              <p className="mt-4 text-lg text-white/95 max-w-3xl leading-relaxed">
                {material.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-white/85">
              <span>Created by {material.authorName || "Admin"}</span>
              <span className="opacity-60">•</span>
              <span>Last updated {updatedAt}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 -mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr,1fr] gap-8 items-start">
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <MaterialDetailTab material={{
              id: material.id,
              title: material.title,
              description: material.description,
              contentUrl: material.contentUrl,
              typeId: material.typeId,
              typeName: material.typeName,
              subjectId: material.subjectId,
              subjectName: material.subjectName,
              authorId: material.authorId,
              authorName: material.authorName,
              isPublic: material.isPublic,
              createdAt: material.createdAt,
              updatedAt: material.updatedAt,
              topic: material.typeName,
              subject: material.subjectName,
              free: true,
              image: material.thumbnail,
            }} />
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              What you'll learn
            </h2>
            <div className="space-y-3">
              {highlights.map((item) => (
                <div key={item} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-green-100 text-green-600 flex items-center justify-center text-xs mt-0.5 flex-shrink-0">
                    ✓
                  </span>
                  <p className="text-gray-700 text-sm leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialsDetailPage;