import React, { useState } from 'react';
import { Button, Card, Progress, Radio, Space } from 'antd';
import { FaUserFriends, FaTrophy } from 'react-icons/fa';
import { mockMCQ } from '~/data/mockTest';
import LeaderBoard from '~/components/community/Leaderboard';

type GameState = 'lobby' | 'playing' | 'finished';

const QuizBattlePage: React.FC = () => {
    const [gameState, setGameState] = useState<GameState>('lobby');
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [scores, setScores] = useState({ playerOne: 0, playerTwo: 0 });

    const questions = mockMCQ.slice(0, 5); // 5 questions for the battle

    const handleAnswer = (isCorrect: boolean) => {
        if (isCorrect) {
            setScores(prev => ({ ...prev, playerOne: prev.playerOne + 10 }));
        }
        // Simulate opponent's answer
        if (Math.random() > 0.5) {
            setScores(prev => ({ ...prev, playerTwo: prev.playerTwo + 10 }));
        }

        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            setGameState('finished');
        }
    };

    const renderLobby = () => (
        <Card className="text-center">
            <FaUserFriends className="text-5xl text-teal-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-4">Quiz Battle</h1>
            <p className="text-gray-600 mb-6">Challenge another student to a real-time quiz!</p>
            <Button type="primary" size="large" onClick={() => setGameState('playing')}>
                Find Opponent
            </Button>
        </Card>
    );

    const renderGame = () => {
        const question = questions[currentQuestion];
        return (
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <div>Player 1: {scores.playerOne}</div>
                    <div>Player 2: {scores.playerTwo}</div>
                </div>
                <Progress percent={((currentQuestion + 1) / questions.length) * 100} showInfo={false} />
                <div className="my-6">
                    <h2 className="text-xl font-semibold mb-4">{question.text}</h2>
                    <Radio.Group className="w-full">
                        <Space direction="vertical" className="w-full">
                            {question.options.map((option: { id: string; text: string; }, index: number) => (
                                <Radio.Button
                                    key={index}
                                    value={option.text}
                                    className="w-full text-left h-auto py-2"
                                    onClick={() => handleAnswer(question.id === 1 && option.id === 'a' || question.id === 2 && option.id === 'b' || question.id === 3 && option.id === 'b')}
                                >
                                    {option.text}
                                </Radio.Button>
                            ))}
                        </Space>
                    </Radio.Group>
                </div>
            </Card>
        );
    };

    const renderFinished = () => {
        const winner = scores.playerOne > scores.playerTwo ? 'You' : 'Opponent';
        return (
            <Card className="text-center">
                <FaTrophy className="text-5xl text-yellow-500 mx-auto mb-4" />
                <h1 className="text-3xl font-bold mb-4">
                    {scores.playerOne === scores.playerTwo ? "It's a Tie!" : `${winner} Won!`}
                </h1>
                <p className="text-gray-600 mb-6">Final Score: {scores.playerOne} - {scores.playerTwo}</p>
                <Button type="primary" size="large" onClick={() => {
                    setGameState('lobby');
                    setCurrentQuestion(0);
                    setScores({ playerOne: 0, playerTwo: 0 });
                }}>
                    Play Again
                </Button>
            </Card>
        );
    };

    return (
        <div className='container mx-auto p-4 md:p-8 space-y-8'>

            <div className="">
                {gameState === 'lobby' && renderLobby()}
                {gameState === 'playing' && renderGame()}
                {gameState === 'finished' && renderFinished()}
            </div>
            <LeaderBoard />
        </div>
    );
};

export default QuizBattlePage;
