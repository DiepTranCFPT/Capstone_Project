import { Avatar, Card, Empty, Spin, Tag, Tooltip } from "antd";
import type React from "react";
import { useEffect } from "react";
import { FiBook, FiUsers } from "react-icons/fi";
import MaterialThumbnail from "~/components/common/MaterialThumbnail";
import useMaterialsWithStudents from "~/hooks/useMaterialsWithStudents";
import type { MaterialWithStudents, RegisteredStudent } from "~/types/learningMaterial";

const MyClassesPage: React.FC = () => {
    const { materialsWithStudents, loading, error, fetchMaterialsWithStudents, getTotalStudentsCount } = useMaterialsWithStudents();

    useEffect(() => {
        fetchMaterialsWithStudents();
    }, [fetchMaterialsWithStudents]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-500 text-center">
                    <p className="text-lg font-semibold">Error</p>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">My Materials</h1>
                    <p className="text-gray-500 mt-1">
                        Total {materialsWithStudents.length} materials • {getTotalStudentsCount()} students registered
                    </p>
                </div>
            </div>

            {/* Materials Grid */}
            {materialsWithStudents.length === 0 ? (
                <Empty description="You have no materials" />
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {materialsWithStudents.map((item: MaterialWithStudents) => (
                        <MaterialCard key={item.material.id} data={item} />
                    ))}
                </div>
            )}
        </div>
    );
};

// Component hiển thị mỗi material card
interface MaterialCardProps {
    data: MaterialWithStudents;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ data }) => {
    const { material, registeredStudents, totalStudent } = data;

    return (
        <Card
            hoverable
            className="shadow-md rounded-xl overflow-hidden"
            cover={
                material.fileImage ? (
                    <MaterialThumbnail
                        source={material.fileImage}
                        width="100%"
                        height={250}
                        fit="cover"
                        roundedClass="rounded-t-xl"
                        className="w-full"
                    />
                ) : (
                    <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <FiBook className="text-white text-5xl" />
                    </div>
                )
            }
        >
            {/* Material Info */}
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">
                    {material.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2 mb-3">
                    {material.description || "Không có mô tả"}
                </p>
                <div className="flex flex-wrap gap-2">
                    <Tag color="blue">{material.subjectName}</Tag>
                    <Tag color="green">{material.typeName}</Tag>
                    {material.price && material.price > 0 && (
                        <Tag color="gold">{material.price.toLocaleString()}đ</Tag>
                    )}
                </div>
            </div>

            {/* Registered Students */}
            <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-gray-600 font-medium flex items-center gap-2">
                        <FiUsers className="text-blue-500" />
                        Registered Students
                    </span>
                    <Tag color="purple">{totalStudent} students</Tag>
                </div>

                {registeredStudents.length > 0 ? (
                    <div className="flex items-center">
                        <Avatar.Group maxCount={5} maxStyle={{ backgroundColor: '#1890ff' }}>
                            {registeredStudents.map((student: RegisteredStudent) => (
                                <Tooltip
                                    key={student.id}
                                    title={`${student.firstName} ${student.lastName}`}
                                >
                                    <Avatar
                                        src={student.imgUrl}
                                        style={{ backgroundColor: '#87d068' }}
                                    >
                                        {student.firstName?.charAt(0)}
                                    </Avatar>
                                </Tooltip>
                            ))}
                        </Avatar.Group>
                        {registeredStudents.length > 5 && (
                            <span className="ml-2 text-gray-500 text-sm">
                                +{registeredStudents.length - 5} others
                            </span>
                        )}
                    </div>
                ) : (
                    <p className="text-gray-400 text-sm italic">No students registered</p>
                )}
            </div>
        </Card>
    );
};

export default MyClassesPage;