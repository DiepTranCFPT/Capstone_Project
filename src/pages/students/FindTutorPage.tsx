import React, { useState } from 'react';
import { Input, Select, Slider } from 'antd';
import TutorCard from '~/components/tutoring/TutorCard';
import type { Tutor } from '~/types/tutoring';

const { Search } = Input;
const { Option } = Select;

// Mock Data
const mockTutors: Tutor[] = [
    { id: '1', name: 'John Doe', avatar: 'https://i.pravatar.cc/150?img=1', subjects: ['Math', 'Physics'], rating: 4.8, bio: 'Experienced tutor with a passion for science.', hourlyRate: 50 },
    { id: '2', name: 'Jane Smith', avatar: 'https://i.pravatar.cc/150?img=2', subjects: ['English', 'History'], rating: 4.9, bio: 'MA in English Literature, loves to help students find their voice.', hourlyRate: 45 },
    { id: '3', name: 'Sam Wilson', avatar: 'https://i.pravatar.cc/150?img=3', subjects: ['Chemistry', 'Biology'], rating: 4.7, bio: 'PhD in Chemistry, making complex topics easy to understand.', hourlyRate: 55 },
];

const FindTutorPage: React.FC = () => {
    const [tutors] = useState<Tutor[]>(mockTutors);
    const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
    const [searchText, setSearchText] = useState<string>('');
    const [ratingRange, setRatingRange] = useState<[number, number]>([4, 5]);

    const filteredTutors = tutors.filter(tutor => {
        const matchesSearchText = 
            tutor.name.toLowerCase().includes(searchText.toLowerCase()) ||
            tutor.subjects.some(subject => subject.toLowerCase().includes(searchText.toLowerCase()));

        const matchesSubjects = 
            selectedSubjects.length === 0 || 
            selectedSubjects.some(selectedSubject => tutor.subjects.includes(selectedSubject));

        const matchesRating = 
            tutor.rating >= ratingRange[0] && tutor.rating <= ratingRange[1];

        return matchesSearchText && matchesSubjects && matchesRating;
    });



    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-4">Find a Tutor</h1>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                    <Search 
                        placeholder="Search by name or subject" 
                        value={searchText} 
                        onChange={e => setSearchText(e.target.value)} 
                    />
                    <Select 
                        mode="multiple" 
                        placeholder="Filter by subject" 
                        value={selectedSubjects} 
                        onChange={setSelectedSubjects}
                    >
                        <Option value="Math">Math</Option>
                        <Option value="Physics">Physics</Option>
                        <Option value="English">English</Option>
                        <Option value="History">History</Option>
                        <Option value="Chemistry">Chemistry</Option>
                        <Option value="Biology">Biology</Option>
                    </Select>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Rating</label>
                        <Slider 
                            range 
                            defaultValue={[4, 5]} 
                            max={5} 
                            min={1} 
                            step={0.1} 
                            value={ratingRange} 
                            onChange={value => setRatingRange(value as [number, number])} 
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredTutors.map(tutor => (
                    <TutorCard key={tutor.id} tutor={tutor} />
                ))}
            </div>
        </div>
    );
};

export default FindTutorPage;
