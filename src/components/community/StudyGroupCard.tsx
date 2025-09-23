import React from 'react';
import { FiUsers, FiHash } from 'react-icons/fi';
import type { StudyGroup } from '~/types/community';
import { Link } from 'react-router-dom';

interface StudyGroupCardProps {
    group: StudyGroup;
}

const StudyGroupCard: React.FC<StudyGroupCardProps> = ({ group }) => {
    return (
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-5 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
                <img src={group.avatar} alt={group.name} className="w-16 h-16 rounded-lg object-cover" />
                <div className="flex-1">
                    <Link to={`/community/groups/${group.id}`}>
                        <h3 className="font-bold text-gray-800 hover:text-teal-600">{group.name}</h3>
                    </Link>
                    <p className="text-sm text-gray-500 mt-1">{group.description}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-3 gap-4">
                        <span className="flex items-center gap-1"><FiUsers /> {group.memberCount} members</span>
                        <span className="flex items-center gap-1"><FiHash /> {group.tags.join(', ')}</span>
                    </div>
                </div>
            </div>
            <div className="mt-4 flex justify-end">
                <button className="bg-teal-50 text-teal-600 font-bold px-4 py-2 rounded-lg text-sm hover:bg-teal-100 transition hover:cursor-pointer">
                    Join Group
                </button>
            </div>
        </div>
    );
};

export default StudyGroupCard;