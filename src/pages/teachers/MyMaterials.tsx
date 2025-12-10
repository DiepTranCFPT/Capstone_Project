import { Avatar, Card, Empty, Spin, Tooltip } from "antd";
import type React from "react";
import { useEffect } from "react";
import { FiBook, FiUsers } from "react-icons/fi";
import MaterialThumbnail from "~/components/common/MaterialThumbnail";
import useMaterialsWithStudents from "~/hooks/useMaterialsWithStudents";
import type { MaterialWithStudents, RegisteredStudent } from "~/types/learningMaterial";

const PRIMARY_COLOR = '#3CBCB2';

const MyMaterialsPage: React.FC = () => {
    const { materialsWithStudents, loading, error, fetchMaterialsWithStudents, getTotalStudentsCount } = useMaterialsWithStudents();

    useEffect(() => {
        fetchMaterialsWithStudents();
    }, [fetchMaterialsWithStudents]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spin size="large" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-red-500 text-center">
                    <p className="text-lg font-semibold">Error</p>
                    <p className="text-sm">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800">My Materials</h1>
                <p className="text-gray-500 text-sm mt-1">
                    {materialsWithStudents.length} materials • {getTotalStudentsCount()} students enrolled
                </p>
            </div>

            {/* Materials Grid */}
            {materialsWithStudents.length === 0 ? (
                <Card bordered={false} className="rounded-lg shadow-sm">
                    <Empty description="You have no materials yet" />
                </Card>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {materialsWithStudents.map((item: MaterialWithStudents) => (
                        <MaterialCard key={item.material.id} data={item} />
                    ))}
                </div>
            )}
        </div>
    );
};

interface MaterialCardProps {
    data: MaterialWithStudents;
}

const MaterialCard: React.FC<MaterialCardProps> = ({ data }) => {
    const { material, registeredStudents, totalStudent } = data;

    return (
        <Card
            hoverable
            bordered={false}
            className="rounded-lg shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
            styles={{ body: { padding: 0 } }}
        >
            {/* Thumbnail */}
            <div className="relative">
                {material.fileImage ? (
                    <MaterialThumbnail
                        source={material.fileImage}
                        width="100%"
                        height={160}
                        fit="cover"
                        className="w-full"
                    />
                ) : (
                    <div
                        className="h-40 flex items-center justify-center"
                        style={{ background: 'linear-gradient(135deg, #3CBCB2 0%, #2dd4bf 100%)' }}
                    >
                        <FiBook className="text-white text-4xl opacity-80" />
                    </div>
                )}

                {/* Student count overlay */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                    <FiUsers className="text-xs" style={{ color: PRIMARY_COLOR }} />
                    <span className="text-xs font-medium text-gray-700">{totalStudent}</span>
                </div>
            </div>

            {/* Content */}
            <div className="p-4">
                {/* Title */}
                <h3 className="text-sm font-semibold text-gray-800 line-clamp-2 mb-2 leading-tight">
                    {material.title}
                </h3>
                <p className="text-xs text-gray-500 mb-4">{material.description}</p>

                {/* Tags */}
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span
                        className="text-xs px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: '#3CBCB215', color: PRIMARY_COLOR }}
                    >
                        {material.subjectName}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
                        {material.typeName}
                    </span>
                </div>
                {/* Price badge */}
                {material.price ? (
                    <div
                        className="w-max px-2 py-1 rounded-full text-xs font-medium text-white shadow mb-2"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                        {material.price.toLocaleString()} tokens
                    </div>
                ) : (<div>
                    <div
                        className="w-max px-2 py-1 rounded-full text-xs font-medium text-white shadow mb-2"
                        style={{ backgroundColor: PRIMARY_COLOR }}
                    >
                        Free
                    </div>
                </div>)}

                {/* Students Section */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <span className="text-xs text-gray-500">
                        {totalStudent} {totalStudent === 1 ? 'student' : 'students'}
                    </span>

                    {registeredStudents.length > 0 && (
                        <Avatar.Group
                            size={24}
                            maxCount={4}
                            maxStyle={{
                                backgroundColor: PRIMARY_COLOR,
                                fontSize: 10,
                                width: 24,
                                height: 24,
                                lineHeight: '24px'
                            }}
                        >
                            {registeredStudents.slice(0, 4).map((student: RegisteredStudent) => (
                                <Tooltip
                                    key={student.id}
                                    title={`${student.firstName} ${student.lastName}`}
                                >
                                    <Avatar
                                        size={24}
                                        src={student.imgUrl}
                                        style={{ backgroundColor: PRIMARY_COLOR }}
                                    >
                                        {student.firstName?.charAt(0)}
                                    </Avatar>
                                </Tooltip>
                            ))}
                        </Avatar.Group>
                    )}
                </div>
            </div>
        </Card>
    );
};

export default MyMaterialsPage;