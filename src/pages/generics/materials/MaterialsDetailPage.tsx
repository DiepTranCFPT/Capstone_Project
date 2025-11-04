import { useParams } from "react-router-dom";
import { materials } from "~/data/materials";
import { Button } from "antd";
import { ShoppingCartOutlined, PlayCircleOutlined } from "@ant-design/icons";
import MaterialDetailTab from "~/components/teachers/materials/MaterialDetailTab";

const MaterialsDetailPage: React.FC = () => {
  const { id } = useParams();
  const material = materials.find((m) => m.id.toString() === id);
  
  if (!material) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Material not found</h2>
          <p className="text-gray-500">The material you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="max-w-6xl mx-auto mb-8">
          <nav className="text-sm text-gray-600 mb-4">
            <span className="hover:text-blue-600 cursor-pointer">Home</span>
            <span className="mx-2">/</span>
            <span className="hover:text-blue-600 cursor-pointer">Materials</span>
            <span className="mx-2">/</span>
            <span className="text-gray-800 font-medium">{material.title}</span>
          </nav>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{material.title}</h1>
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
              {material.category || "Arts • Design"}
            </span>
            <span className="flex items-center gap-1">
              <span className="text-yellow-500">★★★★★</span>
              <span>(4.8)</span>
            </span>
            <span>1,234 students enrolled</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Section - Course Content */}
            <div className="lg:col-span-2 space-y-6">
              Course Preview
              <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                <div className="relative">
                  <img
                    src={material.image}
                    alt={material.title}
                    className="w-full h-80 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <Button 
                      type="primary" 
                      icon={<PlayCircleOutlined />} 
                      size="large"
                      className="bg-white text-blue-600 border-0 hover:bg-gray-100"
                    >
                      Preview Course
                    </Button>
                  </div>
                </div>
              </div>

              {/* Course Details Tabs */}
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <MaterialDetailTab material={material} />
              </div>
            </div>

            {/* Right Sidebar - Purchase Section */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  {/* Price Section */}
                  <div className="text-center mb-6">
                    <div className="mb-4">
                      {material.free ? (
                        <div className="text-4xl font-bold text-green-600 mb-2">Free</div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <span className="text-4xl font-bold text-gray-900">${material.price}</span>
                          <span className="text-lg text-gray-500 line-through">${(material.price! * 1.5).toFixed(0)}</span>
                        </div>
                      )}
                      <p className="text-sm text-gray-500">
                        {material.free ? "Lifetime access" : "One-time payment"}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 mb-6">
                    <button 
                     
                      className="w-full bg-teal-400 hover:bg-teal-500 text-white border-0 rounded-xl h-12 font-semibold"
                    >
                      <ShoppingCartOutlined />
                      Add to Cart
                    </button>
                    <button 
         
                      className="w-full border-2 border-teal-400 text-teal-400 hover:bg-blue-50 rounded-xl h-12 font-semibold"
                    >
                      Buy Now
                    </button>
                  </div>

                  {/* Course Features */}
                  <div className="border-t pt-6">
                    <h3 className="font-semibold text-gray-900 mb-4">This course includes:</h3>
                    <ul className="space-y-3 text-sm text-gray-600">
                      <li className="flex items-center gap-3">
                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                        12 hours of video content
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                        Downloadable resources
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                        Certificate of completion
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                        Lifetime access
                      </li>
                      <li className="flex items-center gap-3">
                        <span className="w-5 h-5 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">✓</span>
                        30-day money-back guarantee
                      </li>
                    </ul>
                  </div>

                  {/* Instructor Info */}
                  <div className="border-t pt-6 mt-6">
                    <h3 className="font-semibold text-gray-900 mb-3">Instructor</h3>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        JD
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">John Doe</p>
                        <p className="text-sm text-gray-500">Art & Design Expert</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaterialsDetailPage;