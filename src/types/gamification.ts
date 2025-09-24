import type { Question } from './test';

export interface QuizBattle {
    id: string;
    playerOneId: string;
    playerTwoId: string;
    questions: Question[];
    scores: {
        playerOne: number;
        playerTwo: number;
    };
    status: 'waiting' | 'in-progress' | 'finished';
    winnerId?: string;
}
